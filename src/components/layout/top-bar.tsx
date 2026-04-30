"use client";

import { MapPin } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { FACILITY_LOCATION } from "@/lib/constants";

interface TopBarProps {
  title: string;
  subtitle?: string;
}

export function TopBar({ title, subtitle }: TopBarProps) {
  return (
    <header className="flex items-center justify-between px-5 py-2.5 border-b border-slate-200 bg-white">
      <div className="flex items-center gap-2">
        <h1 className="text-[15px] font-semibold text-slate-800">{title}</h1>
        {subtitle && (
          <span className="text-[11px] text-slate-400 ml-1">{subtitle}</span>
        )}
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1 text-[11px] text-slate-400">
          <MapPin className="h-3 w-3" />
          <span className="font-medium text-[#10b981]">{FACILITY_LOCATION.name}</span>
          <span className="text-slate-400">
            {FACILITY_LOCATION.area}, {FACILITY_LOCATION.city}, {FACILITY_LOCATION.state} {FACILITY_LOCATION.pin}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <Avatar className="h-6 w-6">
            <AvatarFallback className="bg-[#ecfdf5] text-[#10b981] text-[10px] font-medium">
              DU
            </AvatarFallback>
          </Avatar>
          <span className="text-[12px] font-medium text-slate-600">Demo User</span>
        </div>
      </div>
    </header>
  );
}
