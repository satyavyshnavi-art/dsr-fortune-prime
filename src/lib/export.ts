import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

type ExportRow = Record<string, string | number | boolean>;

/**
 * Export data as CSV file
 */
export function exportCSV(data: ExportRow[], filename: string) {
  if (data.length === 0) return;
  const headers = Object.keys(data[0]);
  const csvRows = [
    headers.join(","),
    ...data.map((row) =>
      headers
        .map((h) => {
          const val = String(row[h] ?? "");
          // Escape commas and quotes
          return val.includes(",") || val.includes('"')
            ? `"${val.replace(/"/g, '""')}"`
            : val;
        })
        .join(",")
    ),
  ];
  const blob = new Blob([csvRows.join("\n")], { type: "text/csv;charset=utf-8" });
  saveAs(blob, `${filename}.csv`);
}

/**
 * Export data as Excel (.xlsx) file
 */
export function exportExcel(data: ExportRow[], filename: string, sheetName = "Sheet1") {
  if (data.length === 0) return;
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  const buffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  saveAs(blob, `${filename}.xlsx`);
}

/**
 * Export data as PDF (simple HTML-to-print approach)
 */
export function exportPDF(data: ExportRow[], filename: string, title?: string) {
  if (data.length === 0) return;
  const headers = Object.keys(data[0]);

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${title || filename}</title>
      <style>
        body { font-family: Arial, sans-serif; font-size: 11px; margin: 20px; }
        h1 { font-size: 16px; margin-bottom: 10px; color: #1a1a1a; }
        p.meta { font-size: 10px; color: #666; margin-bottom: 15px; }
        table { width: 100%; border-collapse: collapse; }
        th { background: #f1f5f9; padding: 6px 8px; text-align: left; font-size: 10px; text-transform: uppercase; color: #64748b; border-bottom: 2px solid #e2e8f0; }
        td { padding: 5px 8px; border-bottom: 1px solid #f1f5f9; font-size: 11px; color: #334155; }
        tr:hover td { background: #f8fafc; }
        @media print { body { margin: 10mm; } }
      </style>
    </head>
    <body>
      <h1>${title || filename}</h1>
      <p class="meta">Generated on ${new Date().toLocaleString("en-IN")} • ${data.length} records</p>
      <table>
        <thead><tr>${headers.map((h) => `<th>${h}</th>`).join("")}</tr></thead>
        <tbody>${data.map((row) => `<tr>${headers.map((h) => `<td>${row[h] ?? ""}</td>`).join("")}</tr>`).join("")}</tbody>
      </table>
    </body>
    </html>
  `;

  const printWindow = window.open("", "_blank");
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
    // Auto-trigger print dialog
    setTimeout(() => {
      printWindow.print();
    }, 500);
  }
}
