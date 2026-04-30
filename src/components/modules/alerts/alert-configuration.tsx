"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Bell,
  RotateCcw,
  CheckCircle,
  Mail,
  MessageSquare,
  Smartphone,
  Send,
} from "lucide-react";
import { toast } from "sonner";

interface CategoryToggle {
  key: string;
  label: string;
  enabled: boolean;
}

interface NotificationChannel {
  key: string;
  label: string;
  icon: React.ElementType;
  enabled: boolean;
  description?: string;
  roles: { name: string; active: boolean }[];
}

const INITIAL_CATEGORIES: CategoryToggle[] = [
  { key: "attendance", label: "Attendance & Staffing", enabled: true },
  { key: "asset_maintenance", label: "Asset Maintenance", enabled: true },
  { key: "water_management", label: "Water Management", enabled: true },
  { key: "power_management", label: "Power Management", enabled: false },
  { key: "hygiene", label: "Hygiene", enabled: false },
  { key: "complaints", label: "Complaints", enabled: true },
  { key: "critical_systems", label: "Critical Systems", enabled: true },
  { key: "general", label: "General", enabled: true },
];

const ROLES = ["Admin", "Facility Manager", "Manager", "Supervisor", "Technical Supervisor", "Soft Services Supervisor"];

const INITIAL_CHANNELS: NotificationChannel[] = [
  {
    key: "email",
    label: "Email Notifications",
    icon: Mail,
    enabled: true,
    roles: ROLES.map((r) => ({
      name: r,
      active: r === "Admin" || r === "Facility Manager",
    })),
  },
  {
    key: "sms",
    label: "SMS Notifications",
    icon: MessageSquare,
    enabled: true,
    roles: ROLES.map((r) => ({
      name: r,
      active: r === "Admin" || r === "Facility Manager",
    })),
  },
  {
    key: "whatsapp",
    label: "WhatsApp Notifications",
    icon: Send,
    enabled: false,
    roles: ROLES.map((r) => ({ name: r, active: false })),
  },
  {
    key: "push",
    label: "Push Notifications",
    icon: Smartphone,
    enabled: true,
    description: "Sent to all facility users with browser subscriptions",
    roles: [],
  },
];

export function AlertConfiguration() {
  const [alertsEnabled, setAlertsEnabled] = useState(true);
  const [categories, setCategories] = useState(INITIAL_CATEGORIES);
  const [channels, setChannels] = useState(INITIAL_CHANNELS);

  // Attendance thresholds
  const [shortageTrigger, setShortageTrigger] = useState("80");
  const [criticalPriority, setCriticalPriority] = useState("50");
  const [highPriority, setHighPriority] = useState("30");

  // Maintenance thresholds
  const [criticalAfterDays, setCriticalAfterDays] = useState("7");
  const [highAfterDays, setHighAfterDays] = useState("3");
  const [lookaheadDays, setLookaheadDays] = useState("7");

  // Water Quality (MLSS)
  const [mlssMin, setMlssMin] = useState("2000");
  const [mlssMax, setMlssMax] = useState("4000");
  const [mlssCriticalFactor, setMlssCriticalFactor] = useState("0.5");
  const [mlssHighFactor, setMlssHighFactor] = useState("0.75");

  // Audit Deadline Reminders
  const [auditWeekly, setAuditWeekly] = useState("2");
  const [auditMonthly, setAuditMonthly] = useState("3");
  const [auditQuarterly, setAuditQuarterly] = useState("7");
  const [auditHalfYearly, setAuditHalfYearly] = useState("14");
  const [auditYearly, setAuditYearly] = useState("30");

  function toggleCategory(key: string) {
    setCategories((prev) =>
      prev.map((c) => (c.key === key ? { ...c, enabled: !c.enabled } : c))
    );
  }

  function toggleChannel(key: string) {
    setChannels((prev) =>
      prev.map((ch) => (ch.key === key ? { ...ch, enabled: !ch.enabled } : ch))
    );
  }

  function toggleChannelRole(channelKey: string, roleName: string) {
    setChannels((prev) =>
      prev.map((ch) =>
        ch.key === channelKey
          ? {
              ...ch,
              roles: ch.roles.map((r) =>
                r.name === roleName ? { ...r, active: !r.active } : r
              ),
            }
          : ch
      )
    );
  }

  function handleResetDefaults() {
    setAlertsEnabled(true);
    setCategories(INITIAL_CATEGORIES);
    setShortageTrigger("80");
    setCriticalPriority("50");
    setHighPriority("30");
    setCriticalAfterDays("7");
    setHighAfterDays("3");
    setLookaheadDays("7");
    setMlssMin("2000");
    setMlssMax("4000");
    setMlssCriticalFactor("0.5");
    setMlssHighFactor("0.75");
    setAuditWeekly("2");
    setAuditMonthly("3");
    setAuditQuarterly("7");
    setAuditHalfYearly("14");
    setAuditYearly("30");
    setChannels(INITIAL_CHANNELS);
    toast.info("Reset to defaults");
  }

  function handleSaveConfiguration() {
    toast.success("Configuration saved");
  }

  return (
    <div className="space-y-4 max-w-3xl">
      {/* Header with actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-md bg-slate-100 flex items-center justify-center">
            <Bell className="h-4 w-4 text-slate-500" />
          </div>
          <div>
            <h3 className="font-semibold text-[13px] text-slate-900">Alert Configuration</h3>
            <p className="text-[11px] text-slate-400">
              Configure thresholds, notification channels, and alert categories for this facility.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <Button variant="outline" size="sm" className="h-7 text-[11px] px-2.5" onClick={handleResetDefaults}>
            Reset Defaults
          </Button>
          <Button size="sm" className="h-7 text-[11px] px-2.5 bg-blue-600 hover:bg-blue-700 text-white" onClick={handleSaveConfiguration}>
            <CheckCircle className="h-3 w-3 mr-1" />
            Save Changes
          </Button>
        </div>
      </div>

      {/* Master toggle */}
      <Card className="shadow-none border-slate-200">
        <CardContent className="p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Bell className="h-4 w-4 text-slate-400" />
              <div>
                <p className="font-medium text-[12px] text-slate-800">Alerts Enabled</p>
                <p className="text-[10px] text-slate-400">Master toggle for all alert generation and notifications</p>
              </div>
            </div>
            <Checkbox
              checked={alertsEnabled}
              onCheckedChange={() => setAlertsEnabled(!alertsEnabled)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Alert Categories */}
      <Card className="shadow-none border-slate-200">
        <CardHeader className="px-4 py-3 pb-2">
          <CardTitle className="text-[12px] font-semibold text-slate-800">Alert Categories</CardTitle>
          <CardDescription className="text-[10px] text-slate-400">Enable or disable specific alert types</CardDescription>
        </CardHeader>
        <CardContent className="px-4 pb-3">
          <div className="grid grid-cols-2 gap-2">
            {categories.map((cat) => (
              <label
                key={cat.key}
                className="flex items-center justify-between rounded-md border border-slate-200 px-3 py-2 cursor-pointer hover:bg-slate-50/60 transition-colors"
              >
                <span className="text-[12px] text-slate-700">{cat.label}</span>
                <Checkbox
                  checked={cat.enabled}
                  onCheckedChange={() => toggleCategory(cat.key)}
                />
              </label>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Attendance Thresholds */}
      <Card className="shadow-none border-slate-200">
        <CardHeader className="px-4 py-3 pb-2">
          <CardTitle className="text-[12px] font-semibold text-slate-800">Attendance Thresholds</CardTitle>
          <CardDescription className="text-[10px] text-slate-400">Configure when attendance alerts trigger and their priority levels</CardDescription>
        </CardHeader>
        <CardContent className="px-4 pb-3">
          <div className="grid grid-cols-3 gap-3">
            <ThresholdInput
              label="Shortage Trigger (%)"
              value={shortageTrigger}
              onChange={setShortageTrigger}
              hint="Alert when present < this % of required"
            />
            <ThresholdInput
              label="Critical Priority (%)"
              value={criticalPriority}
              onChange={setCriticalPriority}
              hint="Critical when shortage >= this %"
            />
            <ThresholdInput
              label="High Priority (%)"
              value={highPriority}
              onChange={setHighPriority}
              hint="High when shortage >= this %"
            />
          </div>
        </CardContent>
      </Card>

      {/* Maintenance Thresholds */}
      <Card className="shadow-none border-slate-200">
        <CardHeader className="px-4 py-3 pb-2">
          <CardTitle className="text-[12px] font-semibold text-slate-800">Maintenance Thresholds</CardTitle>
          <CardDescription className="text-[10px] text-slate-400">Days overdue that trigger different priority levels</CardDescription>
        </CardHeader>
        <CardContent className="px-4 pb-3">
          <div className="grid grid-cols-3 gap-3">
            <ThresholdInput
              label="Critical After (days)"
              value={criticalAfterDays}
              onChange={setCriticalAfterDays}
              hint="Critical priority threshold"
            />
            <ThresholdInput
              label="High After (days)"
              value={highAfterDays}
              onChange={setHighAfterDays}
              hint="High priority threshold"
            />
            <ThresholdInput
              label="Lookahead (days)"
              value={lookaheadDays}
              onChange={setLookaheadDays}
              hint="Days ahead to generate schedules"
            />
          </div>
        </CardContent>
      </Card>

      {/* Water Quality (MLSS) */}
      <Card className="shadow-none border-slate-200">
        <CardHeader className="px-4 py-3 pb-2">
          <CardTitle className="text-[12px] font-semibold text-slate-800">Water Quality (MLSS)</CardTitle>
          <CardDescription className="text-[10px] text-slate-400">STP MLSS range thresholds in mg/L</CardDescription>
        </CardHeader>
        <CardContent className="px-4 pb-3 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <ThresholdInput label="Min Normal (mg/L)" value={mlssMin} onChange={setMlssMin} />
            <ThresholdInput label="Max Normal (mg/L)" value={mlssMax} onChange={setMlssMax} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <ThresholdInput
              label="Critical Factor"
              value={mlssCriticalFactor}
              onChange={setMlssCriticalFactor}
              hint="e.g. 0.5 = Critical if <50% of min"
              step="0.05"
            />
            <ThresholdInput
              label="High Factor"
              value={mlssHighFactor}
              onChange={setMlssHighFactor}
              hint="e.g. 0.75 = High if <75% of min"
              step="0.05"
            />
          </div>
        </CardContent>
      </Card>

      {/* Audit Deadline Reminders */}
      <Card className="shadow-none border-slate-200">
        <CardHeader className="px-4 py-3 pb-2">
          <CardTitle className="text-[12px] font-semibold text-slate-800">Audit Deadline Reminders</CardTitle>
          <CardDescription className="text-[10px] text-slate-400">Days before deadline to send reminders per frequency</CardDescription>
        </CardHeader>
        <CardContent className="px-4 pb-3">
          <div className="grid grid-cols-5 gap-2.5">
            <ThresholdInput label="Weekly" value={auditWeekly} onChange={setAuditWeekly} hint="days before" />
            <ThresholdInput label="Monthly" value={auditMonthly} onChange={setAuditMonthly} hint="days before" />
            <ThresholdInput label="Quarterly" value={auditQuarterly} onChange={setAuditQuarterly} hint="days before" />
            <ThresholdInput label="Half Yearly" value={auditHalfYearly} onChange={setAuditHalfYearly} hint="days before" />
            <ThresholdInput label="Yearly" value={auditYearly} onChange={setAuditYearly} hint="days before" />
          </div>
        </CardContent>
      </Card>

      {/* Notification Channels */}
      <Card className="shadow-none border-slate-200">
        <CardHeader className="px-4 py-3 pb-2">
          <CardTitle className="text-[12px] font-semibold text-slate-800">Notification Channels</CardTitle>
          <CardDescription className="text-[10px] text-slate-400">Configure which channels are active and who receives notifications</CardDescription>
        </CardHeader>
        <CardContent className="px-4 pb-3 space-y-3">
          {channels.map((channel, idx) => {
            const Icon = channel.icon;
            return (
              <div key={channel.key} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Icon className="h-3.5 w-3.5 text-slate-400" />
                    <div>
                      <p className="text-[12px] font-medium text-slate-800">{channel.label}</p>
                      {channel.description && (
                        <p className="text-[10px] text-slate-400">{channel.description}</p>
                      )}
                    </div>
                  </div>
                  <Checkbox
                    checked={channel.enabled}
                    onCheckedChange={() => toggleChannel(channel.key)}
                  />
                </div>
                {channel.enabled && channel.roles.length > 0 && (
                  <div className="flex flex-wrap gap-1 ml-6">
                    {channel.roles.map((role) => (
                      <button
                        key={role.name}
                        onClick={() => toggleChannelRole(channel.key, role.name)}
                        className={`inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[10px] font-medium border transition-colors cursor-pointer ${
                          role.active
                            ? "bg-blue-50 border-blue-200 text-blue-700"
                            : "bg-white border-slate-200 text-slate-500 hover:border-slate-300"
                        }`}
                      >
                        {role.active && <CheckCircle className="h-2.5 w-2.5" />}
                        {role.name}
                      </button>
                    ))}
                  </div>
                )}
                {idx < channels.length - 1 && <Separator className="mt-2" />}
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Bottom action bar */}
      <div className="flex items-center justify-end gap-2 pt-1 pb-4">
        <Button variant="outline" size="sm" className="h-7 text-[11px] px-3" onClick={handleResetDefaults}>
          Reset Defaults
        </Button>
        <Button size="sm" className="h-7 text-[11px] px-3 bg-blue-600 hover:bg-blue-700 text-white" onClick={handleSaveConfiguration}>
          <CheckCircle className="h-3 w-3 mr-1" />
          Save Configuration
        </Button>
      </div>
    </div>
  );
}

/* Reusable threshold input field */
function ThresholdInput({
  label,
  value,
  onChange,
  hint,
  step,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  hint?: string;
  step?: string;
}) {
  return (
    <div className="space-y-1">
      <Label className="text-[11px] font-medium text-slate-500">{label}</Label>
      <Input
        type="number"
        step={step}
        value={value}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
        className="h-8 text-[12px]"
      />
      {hint && <p className="text-[9px] text-slate-400">{hint}</p>}
    </div>
  );
}
