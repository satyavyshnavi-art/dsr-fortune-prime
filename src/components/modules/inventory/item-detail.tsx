"use client";

import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/status-badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Package, X } from "lucide-react";
import type { InventoryItem, InventoryTransaction } from "./mock-data";
import { MOCK_TRANSACTIONS } from "./mock-data";

interface ItemDetailProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: InventoryItem | null;
}

export function ItemDetail({ open, onOpenChange, item }: ItemDetailProps) {
  const transactions = useMemo(() => {
    if (!item) return [];
    return MOCK_TRANSACTIONS.filter((t) => t.itemId === item.id);
  }, [item]);

  if (!item) return null;

  const statusLabel =
    item.status === "in_stock"
      ? "In Stock"
      : item.status === "low_stock"
      ? "Low Stock"
      : "Out of Stock";
  const statusVariant =
    item.status === "in_stock"
      ? "success"
      : item.status === "low_stock"
      ? "warning"
      : "danger";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px] p-5 max-h-[80vh] overflow-y-auto" showCloseButton>
        <DialogHeader className="pb-1">
          <DialogTitle className="text-[14px] font-semibold text-slate-800 flex items-center gap-2">
            <Package className="h-4 w-4 text-blue-600" />
            {item.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Item Info */}
          <div className="bg-slate-50 rounded-lg p-3 space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="text-[10px] text-slate-400 uppercase">Category</p>
                <p className="text-[12px] text-slate-700">{item.category}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase">Unit</p>
                <p className="text-[12px] text-slate-700">{item.unit}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase">Current Qty</p>
                <p className="text-[12px] font-semibold text-slate-800">{item.currentQty}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase">Reorder Level</p>
                <p className="text-[12px] text-slate-700">{item.reorderLevel}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase">Unit Cost</p>
                <p className="text-[12px] text-slate-700">₹{item.unitCost.toLocaleString("en-IN")}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase">Status</p>
                <StatusBadge status={statusLabel} variant={statusVariant as "success" | "warning" | "danger"} />
              </div>
            </div>
          </div>

          {/* Transaction History */}
          <div>
            <h4 className="text-[12px] font-semibold text-slate-700 mb-2">
              Transaction History
            </h4>
            {transactions.length === 0 ? (
              <p className="text-[11px] text-slate-400 py-4 text-center">
                No transactions recorded
              </p>
            ) : (
              <div className="rounded-md border border-slate-200 bg-white overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-50/80">
                      <th className="text-left text-[10px] font-semibold text-slate-500 uppercase tracking-wider px-3 py-1.5">
                        Type
                      </th>
                      <th className="text-left text-[10px] font-semibold text-slate-500 uppercase tracking-wider px-2 py-1.5">
                        Qty
                      </th>
                      <th className="text-left text-[10px] font-semibold text-slate-500 uppercase tracking-wider px-2 py-1.5">
                        Date
                      </th>
                      <th className="text-left text-[10px] font-semibold text-slate-500 uppercase tracking-wider px-2 py-1.5">
                        By
                      </th>
                      <th className="text-left text-[10px] font-semibold text-slate-500 uppercase tracking-wider px-2 py-1.5">
                        Notes
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((txn) => (
                      <tr key={txn.id} className="border-t border-slate-100 hover:bg-slate-50/50">
                        <td className="px-3 py-1.5">
                          <StatusBadge
                            status={txn.type}
                            variant={
                              txn.type === "IN"
                                ? "success"
                                : txn.type === "OUT"
                                ? "danger"
                                : "info"
                            }
                          />
                        </td>
                        <td className="px-2 py-1.5 text-[12px] font-mono text-slate-700">
                          {txn.type === "OUT" ? `-${txn.quantity}` : `+${txn.quantity}`}
                        </td>
                        <td className="px-2 py-1.5 text-[11px] text-slate-500">{txn.date}</td>
                        <td className="px-2 py-1.5 text-[11px] text-slate-500">{txn.performedBy}</td>
                        <td className="px-2 py-1.5 text-[11px] text-slate-400 truncate max-w-[120px]">
                          {txn.notes}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
