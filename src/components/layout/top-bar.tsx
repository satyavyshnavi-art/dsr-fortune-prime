"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MapPin, LogOut, User, ChevronDown } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FACILITY_LOCATION } from "@/lib/constants";
import { getDemoUser, demoLogout, type DemoUser } from "@/lib/auth";

interface TopBarProps {
  title: string;
  subtitle?: string;
}

export function TopBar({ title, subtitle }: TopBarProps) {
  const router = useRouter();
  const [user, setUser] = useState<DemoUser | null>(null);

  useEffect(() => {
    setUser(getDemoUser());
  }, []);

  function handleLogout() {
    demoLogout();
    router.push("/");
  }

  const displayName = user?.name || "Demo User";
  const initials = user?.initials || "DU";
  const role = user?.role || "User";
  const email = user?.email || "";

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

        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <button className="flex items-center gap-1.5 rounded-lg px-2 py-1 hover:bg-slate-50 transition-colors cursor-pointer">
                <Avatar className="h-7 w-7">
                  <AvatarFallback className="bg-[#ecfdf5] text-[#10b981] text-[10px] font-semibold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="text-left hidden sm:block">
                  <span className="text-[12px] font-medium text-slate-700 block leading-tight">
                    {displayName}
                  </span>
                  <span className="text-[10px] text-slate-400 block leading-tight">
                    {role}
                  </span>
                </div>
                <ChevronDown className="h-3 w-3 text-slate-400" />
              </button>
            }
          />
          <DropdownMenuContent align="end" className="w-56">
            {/* User info header */}
            <div className="px-3 py-2.5">
              <p className="text-[13px] font-semibold text-slate-900">{displayName}</p>
              <p className="text-[11px] text-slate-500">{email}</p>
              <p className="text-[10px] text-blue-600 font-medium mt-0.5">{role}</p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-[12px] cursor-pointer" onClick={() => router.push("/profile")}>
              <User className="h-3.5 w-3.5 mr-2" />
              My Profile
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-[12px] text-red-600 cursor-pointer"
              onClick={handleLogout}
            >
              <LogOut className="h-3.5 w-3.5 mr-2" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
