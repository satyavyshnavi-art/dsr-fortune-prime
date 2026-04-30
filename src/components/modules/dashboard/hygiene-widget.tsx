"use client";

import { ChartCard } from "@/components/shared";
import { StatusBadge } from "@/components/shared";

const hygieneCategories = [
  { name: "Housekeeping Checklist", completion: "0%", status: "Pending" },
  { name: "Club House Checklist", completion: "0%", status: "Pending" },
  { name: "Block Checklist", completion: "0%", status: "Pending" },
  { name: "Basement Checklist", completion: "0%", status: "Pending" },
  { name: "Weekend Checklist", completion: "0%", status: "Pending" },
  { name: "Monthly Template", completion: "0%", status: "Pending" },
  { name: "Weekly Template", completion: "0%", status: "Pending" },
];

const tabs = ["Housekeeping", "Gardening", "Pest Control"];

export function HygieneWidget() {
  // Hygiene data is not in the dashboard summary API yet (no table aggregation).
  // Show static checklist with a note. The widget will update automatically
  // once a hygiene summary is added to the API.

  return (
    <ChartCard title="Hygiene Management">
      <div className="space-y-2">
        {/* Tabs */}
        <div className="flex gap-1">
          {tabs.map((tab, i) => (
            <button
              key={tab}
              className={`text-[10px] px-2 py-0.5 rounded transition-colors ${
                i === 0
                  ? "bg-blue-600 text-white"
                  : "bg-slate-100 text-slate-500 hover:bg-slate-200"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Checklist Items */}
        <div className="space-y-1">
          {hygieneCategories.map((item) => (
            <div
              key={item.name}
              className="flex items-center justify-between py-0.5"
            >
              <span className="text-[11px] text-slate-600">{item.name}</span>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-400">
                  {item.completion}
                </span>
                <StatusBadge status={item.status} variant="warning" />
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Stats */}
        <div className="grid grid-cols-3 gap-2 pt-1.5 border-t border-slate-100">
          <div className="text-center">
            <p className="text-[15px] font-bold text-slate-800">7</p>
            <p className="text-[9px] text-slate-400">Checklists</p>
          </div>
          <div className="text-center">
            <p className="text-[15px] font-bold text-red-500">0</p>
            <p className="text-[9px] text-slate-400">Completed</p>
          </div>
          <div className="text-center">
            <p className="text-[15px] font-bold text-yellow-500">7</p>
            <p className="text-[9px] text-slate-400">Pending</p>
          </div>
        </div>

        <p className="text-[9px] text-slate-400 text-center italic">
          Hygiene data not yet connected to database
        </p>
      </div>
    </ChartCard>
  );
}
