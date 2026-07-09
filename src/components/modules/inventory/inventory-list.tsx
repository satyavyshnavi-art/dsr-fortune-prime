"use client";

import { useState, useMemo } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/shared";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Eye, Plus } from "lucide-react";
import { useApi } from "@/hooks/use-api";
import {
  InventoryItem,
  MOCK_ITEMS,
  CATEGORIES,
} from "./mock-data";

interface InventoryListProps {
  onAddTransaction: (item: InventoryItem) => void;
  onViewDetail: (item: InventoryItem) => void;
}

export function InventoryList({ onAddTransaction, onViewDetail }: InventoryListProps) {
  const {
    data: apiItems,
    loading,
    error: apiError,
  } = useApi<any[]>({
    url: "/api/v1/inventory",
    initialData: [],
  });

  const items: InventoryItem[] = useMemo(() => {
    const rows = Array.isArray(apiItems)
      ? apiItems
      : Array.isArray((apiItems as any)?.data)
        ? (apiItems as any).data
        : null;

    if (apiError || !rows || rows.length === 0) {
      return MOCK_ITEMS;
    }
    return rows.map((r: any) => ({
      id: r.id,
      name: r.name ?? "",
      category: r.category ?? "",
      unit: r.unit ?? "",
      currentQty: r.currentQty ?? 0,
      reorderLevel: r.reorderLevel ?? 0,
      unitCost: r.unitCost ?? 0,
      status:
        r.currentQty === 0
          ? "out_of_stock"
          : r.currentQty <= r.reorderLevel
          ? "low_stock"
          : "in_stock",
    }));
  }, [apiItems, apiError]);

  const [categoryFilter, setCategoryFilter] = useState("all");

  const filteredItems = items.filter(
    (item) => categoryFilter === "all" || item.category === categoryFilter
  );

  const columns: ColumnDef<InventoryItem>[] = [
    {
      accessorKey: "name",
      header: "Item Name",
      cell: ({ row }) => (
        <span className="font-medium text-[12px] text-slate-900">
          {row.original.name}
        </span>
      ),
    },
    {
      accessorKey: "category",
      header: "Category",
      cell: ({ row }) => (
        <span className="text-[12px] text-slate-600">{row.original.category}</span>
      ),
    },
    {
      accessorKey: "unit",
      header: "Unit",
      cell: ({ row }) => (
        <span className="text-[12px] text-slate-500">{row.original.unit}</span>
      ),
    },
    {
      accessorKey: "currentQty",
      header: "Current Qty",
      cell: ({ row }) => (
        <span className="text-[12px] font-mono text-slate-700">
          {row.original.currentQty}
        </span>
      ),
    },
    {
      accessorKey: "reorderLevel",
      header: "Reorder Level",
      cell: ({ row }) => (
        <span className="text-[12px] font-mono text-slate-500">
          {row.original.reorderLevel}
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const s = row.original.status;
        const variant =
          s === "in_stock" ? "success" : s === "low_stock" ? "warning" : "danger";
        const label =
          s === "in_stock"
            ? "In Stock"
            : s === "low_stock"
            ? "Low Stock"
            : "Out of Stock";
        return <StatusBadge status={label} variant={variant} />;
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex items-center gap-0.5">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => onViewDetail(row.original)}
          >
            <Eye className="h-3 w-3 text-blue-500" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => onAddTransaction(row.original)}
          >
            <Plus className="h-3 w-3 text-emerald-500" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-3">
      {/* Filter */}
      <div className="flex items-center gap-2">
        <Select value={categoryFilter} onValueChange={(v) => setCategoryFilter(v ?? "all")}>
          <SelectTrigger className="w-[180px] h-8 text-[12px]">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="text-[12px]">All Categories</SelectItem>
            {CATEGORIES.map((c) => (
              <SelectItem key={c} value={c} className="text-[12px]">{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="text-[11px] text-slate-400">
          {filteredItems.length} items
        </span>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-2">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-emerald-700" />
            <span className="text-[11px] text-slate-400">Loading inventory...</span>
          </div>
        </div>
      ) : (
        <DataTable columns={columns} data={filteredItems} searchKey="name" searchPlaceholder="Search items..." pageSize={10} />
      )}

      {apiError && (
        <p className="text-[11px] text-amber-600 bg-amber-50 border border-amber-200 rounded px-3 py-1.5">
          API unavailable — showing mock data. {apiError}
        </p>
      )}
    </div>
  );
}
