"use client";

import { ChartCard } from "@/components/shared";
import { PackageX } from "lucide-react";

interface InventoryItem {
  name: string;
  currentStock: number;
  reorderLevel: number;
  unit: string;
}

const mockData: InventoryItem[] = [
  { name: "Floor Cleaner", currentStock: 5, reorderLevel: 20, unit: "L" },
  { name: "Hand Sanitizer", currentStock: 8, reorderLevel: 15, unit: "L" },
  { name: "Garbage Bags", currentStock: 30, reorderLevel: 100, unit: "pcs" },
  { name: "Tissue Rolls", currentStock: 12, reorderLevel: 50, unit: "pcs" },
  { name: "Air Freshener", currentStock: 3, reorderLevel: 10, unit: "pcs" },
];

interface InventoryAlertsProps {
  data?: any;
}

export function InventoryAlerts({ data }: InventoryAlertsProps) {
  const items: InventoryItem[] = data?.inventory?.belowReorder ?? mockData;

  return (
    <ChartCard
      title="Inventory Alerts"
      subtitle={`${items.length} items below reorder level`}
    >
      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-6 text-slate-400">
          <PackageX className="h-6 w-6 mb-1.5" />
          <p className="text-[11px]">All items are stocked</p>
        </div>
      ) : (
        <div className="rounded-md border border-slate-200 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50/80">
                <th className="text-left text-[10px] font-semibold text-slate-400 uppercase tracking-wider py-1.5 px-2.5">
                  Item
                </th>
                <th className="text-center text-[10px] font-semibold text-slate-400 uppercase tracking-wider py-1.5 px-2.5">
                  Stock
                </th>
                <th className="text-center text-[10px] font-semibold text-slate-400 uppercase tracking-wider py-1.5 px-2.5">
                  Reorder At
                </th>
                <th className="text-center text-[10px] font-semibold text-slate-400 uppercase tracking-wider py-1.5 px-2.5">
                  Deficit
                </th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => {
                const deficit = item.reorderLevel - item.currentStock;
                const severity = item.currentStock <= item.reorderLevel * 0.25 ? "text-red-600" : "text-yellow-600";
                return (
                  <tr key={item.name} className="border-t border-slate-100">
                    <td className="py-1.5 px-2.5 text-[11px] text-slate-700">
                      {item.name}
                    </td>
                    <td className={`py-1.5 px-2.5 text-center text-[11px] font-medium ${severity}`}>
                      {item.currentStock} {item.unit}
                    </td>
                    <td className="py-1.5 px-2.5 text-center text-[11px] text-slate-500">
                      {item.reorderLevel} {item.unit}
                    </td>
                    <td className={`py-1.5 px-2.5 text-center text-[11px] font-semibold ${severity}`}>
                      -{deficit}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </ChartCard>
  );
}
