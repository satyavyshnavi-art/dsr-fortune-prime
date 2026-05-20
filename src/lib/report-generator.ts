import PDFDocument from "pdfkit";
import ExcelJS from "exceljs";
import { db } from "@/lib/db";
import {
  tasks,
  attendanceRecords,
  complaints,
  assets,
  inventoryItems,
  workLogs,
  employees,
  vendorTickets,
  leaveRequests,
  breakdownRecords,
} from "@/db/schema";
import { sql } from "drizzle-orm";

// Map module names to their Drizzle table references
const MODULE_TABLE_MAP: Record<string, any> = {
  tasks,
  attendance: attendanceRecords,
  complaints,
  assets,
  inventory: inventoryItems,
  work_logs: workLogs,
  employees,
  vendor_tickets: vendorTickets,
  leave_requests: leaveRequests,
  breakdowns: breakdownRecords,
};

interface ReportFilter {
  column: string;
  operator: "eq" | "gt" | "lt" | "gte" | "lte" | "like";
  value: string;
}

interface GenerateReportOptions {
  module: string;
  fields: string[];
  filters?: ReportFilter[];
  format: "pdf" | "xlsx" | "csv";
}

function buildWhereClause(
  table: any,
  filters: ReportFilter[]
): any[] {
  const conditions: any[] = [];
  for (const filter of filters) {
    const col = table[filter.column];
    if (!col) continue;

    switch (filter.operator) {
      case "eq":
        conditions.push(sql`${col} = ${filter.value}`);
        break;
      case "gt":
        conditions.push(sql`${col} > ${filter.value}`);
        break;
      case "lt":
        conditions.push(sql`${col} < ${filter.value}`);
        break;
      case "gte":
        conditions.push(sql`${col} >= ${filter.value}`);
        break;
      case "lte":
        conditions.push(sql`${col} <= ${filter.value}`);
        break;
      case "like":
        conditions.push(sql`${col} ILIKE ${"%" + filter.value + "%"}`);
        break;
    }
  }
  return conditions;
}

function formatFieldName(field: string): string {
  return field
    .replace(/([A-Z])/g, " $1")
    .replace(/[_-]/g, " ")
    .replace(/^\w/, (c) => c.toUpperCase())
    .trim();
}

async function queryData(
  module: string,
  fields: string[],
  filters?: ReportFilter[]
): Promise<Record<string, any>[]> {
  const table = MODULE_TABLE_MAP[module];
  if (!table) throw new Error(`Unknown module: ${module}`);

  // Build select columns
  const selectCols: Record<string, any> = {};
  for (const field of fields) {
    if (table[field]) {
      selectCols[field] = table[field];
    }
  }

  if (Object.keys(selectCols).length === 0) {
    throw new Error(`No valid fields found for module: ${module}`);
  }

  let query = db.select(selectCols).from(table);

  if (filters && filters.length > 0) {
    const conditions = buildWhereClause(table, filters);
    if (conditions.length > 0) {
      query = query.where(sql.join(conditions, sql` AND `)) as any;
    }
  }

  return await query;
}

async function generatePdf(
  data: Record<string, any>[],
  fields: string[],
  module: string
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 40, size: "A4", layout: "landscape" });
    const chunks: Buffer[] = [];

    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    // Title
    doc
      .fontSize(18)
      .font("Helvetica-Bold")
      .text(`${formatFieldName(module)} Report`, { align: "center" });
    doc.moveDown(0.5);
    doc
      .fontSize(10)
      .font("Helvetica")
      .text(`Generated: ${new Date().toLocaleString()}`, { align: "center" });
    doc.moveDown(1);

    if (data.length === 0) {
      doc.fontSize(12).text("No data found matching the specified criteria.");
      doc.end();
      return;
    }

    // Table layout
    const pageWidth = doc.page.width - 80;
    const colWidth = Math.min(pageWidth / fields.length, 200);
    const startX = 40;
    let y = doc.y;

    // Header row
    doc.fontSize(9).font("Helvetica-Bold");
    fields.forEach((field, i) => {
      doc.text(formatFieldName(field), startX + i * colWidth, y, {
        width: colWidth - 5,
        ellipsis: true,
      });
    });
    y += 18;
    doc
      .moveTo(startX, y)
      .lineTo(startX + fields.length * colWidth, y)
      .stroke();
    y += 5;

    // Data rows
    doc.font("Helvetica").fontSize(8);
    for (const row of data) {
      if (y > doc.page.height - 60) {
        doc.addPage();
        y = 40;
      }

      fields.forEach((field, i) => {
        const val = row[field] ?? "";
        const displayVal =
          typeof val === "object" ? JSON.stringify(val) : String(val);
        doc.text(displayVal, startX + i * colWidth, y, {
          width: colWidth - 5,
          ellipsis: true,
        });
      });
      y += 16;
    }

    doc.end();
  });
}

async function generateXlsx(
  data: Record<string, any>[],
  fields: string[],
  module: string
): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Spotworks";
  workbook.created = new Date();

  const sheet = workbook.addWorksheet(formatFieldName(module));

  // Styled header row
  sheet.columns = fields.map((field) => ({
    header: formatFieldName(field),
    key: field,
    width: 20,
  }));

  const headerRow = sheet.getRow(1);
  headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
  headerRow.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF2563EB" },
  };
  headerRow.alignment = { horizontal: "center" };

  // Data rows
  for (const row of data) {
    const values: Record<string, any> = {};
    for (const field of fields) {
      const val = row[field];
      values[field] =
        typeof val === "object" && val !== null ? JSON.stringify(val) : val;
    }
    sheet.addRow(values);
  }

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}

function generateCsv(
  data: Record<string, any>[],
  fields: string[]
): Buffer {
  const escape = (val: string): string => {
    if (val.includes(",") || val.includes('"') || val.includes("\n")) {
      return `"${val.replace(/"/g, '""')}"`;
    }
    return val;
  };

  const header = fields.map((f) => escape(formatFieldName(f))).join(",");
  const rows = data.map((row) =>
    fields
      .map((f) => {
        const val = row[f];
        if (val === null || val === undefined) return "";
        const str = typeof val === "object" ? JSON.stringify(val) : String(val);
        return escape(str);
      })
      .join(",")
  );

  return Buffer.from([header, ...rows].join("\n"), "utf-8");
}

export async function generateReport(
  module: string,
  fields: string[],
  filters: ReportFilter[] | undefined,
  format: "pdf" | "xlsx" | "csv"
): Promise<{ buffer: Buffer; filename: string; contentType: string }> {
  const data = await queryData(module, fields, filters);

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const baseFilename = `${module}-report-${timestamp}`;

  switch (format) {
    case "pdf": {
      const buffer = await generatePdf(data, fields, module);
      return {
        buffer,
        filename: `${baseFilename}.pdf`,
        contentType: "application/pdf",
      };
    }
    case "xlsx": {
      const buffer = await generateXlsx(data, fields, module);
      return {
        buffer,
        filename: `${baseFilename}.xlsx`,
        contentType:
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      };
    }
    case "csv": {
      const buffer = generateCsv(data, fields);
      return {
        buffer,
        filename: `${baseFilename}.csv`,
        contentType: "text/csv",
      };
    }
    default:
      throw new Error(`Unsupported format: ${format}`);
  }
}
