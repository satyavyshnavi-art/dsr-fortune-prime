"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import {
  Bell,
  CheckCircle,
  Mail,
  MessageSquare,
  Smartphone,
  Send,
  Shield,
  Droplets,
  Zap,
  Users,
  Wrench,
  AlertTriangle,
  MessageCircle,
  Info,
  RotateCcw,
} from "lucide-react";
import { toast } from "sonner";

interface CategoryToggle {
  key: string;
  label: string;
  icon: React.ElementType;
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
  { key: "attendance", label: "Attendance & Staffing", icon: Users, enabled: true },
  { key: "asset_maintenance", label: "Asset Maintenance", icon: Wrench, enabled: true },
  { key: "water_management", label: "Water Management", icon: Droplets, enabled: true },
  { key: "power_management", label: "Power Management", icon: Zap, enabled: false },
  { key: "hygiene", label: "Hygiene", icon: Shield, enabled: false },
  { key: "complaints", label: "Complaints", icon: MessageCircle, enabled: true },
  { key: "critical_systems", label: "Critical Systems", icon: AlertTriangle, enabled: true },
  { key: "general", label: "General", icon: Info, enabled: true },
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

  const [shortageTrigger, setShortageTrigger] = useState("80");
  const [criticalPriority, setCriticalPriority] = useState("50");
  const [highPriority, setHighPriority] = useState("30");

  const [criticalAfterDays, setCriticalAfterDays] = useState("7");
  const [highAfterDays, setHighAfterDays] = useState("3");
  const [lookaheadDays, setLookaheadDays] = useState("7");

  const [mlssMin, setMlssMin] = useState("2000");
  const [mlssMax, setMlssMax] = useState("4000");
  const [mlssCriticalFactor, setMlssCriticalFactor] = useState("0.5");
  const [mlssHighFactor, setMlssHighFactor] = useState("0.75");

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
    <div className="space-y-5 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-blue-50 flex items-center justify-center">
            <Bell className="h-4.5 w-4.5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-[14px] text-slate-900">Alert Configuration</h3>
            <p className="text-[11px] text-slate-500">
              Configure thresholds, notification channels, and alert categories.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-8 text-[12px] px-3" onClick={handleResetDefaults}>
            <RotateCcw className="h-3 w-3 mr-1.5" />
            Reset Defaults
          </Button>
          <Button size="sm" className="h-8 text-[12px] px-3 bg-blue-600 hover:bg-blue-700 text-white" onClick={handleSaveConfiguration}>
            <CheckCircle className="h-3 w-3 mr-1.5" />
            Save Changes
          </Button>
        </div>
      </div>

      {/* Master toggle */}
      <Section>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-emerald-50 flex items-center justify-center">
              <Bell className="h-4 w-4 text-emerald-600" />
            </div>
            <div>
              <p className="font-semibold text-[13px] text-slate-900">Alerts Enabled</p>
              <p className="text-[11px] text-slate-500">Master toggle for all alert generation and notifications</p>
            </div>
          </div>
          <Switch
            checked={alertsEnabled}
            onCheckedChange={() => setAlertsEnabled(!alertsEnabled)}
          />
        </div>
      </Section>

      {/* Alert Categories */}
      <Section title="Alert Categories" description="Enable or disable specific alert types">
        <div className="grid grid-cols-2 gap-2.5">
          {categories.map((cat) => {
            const CatIcon = cat.icon;
            return (
              <button
                key={cat.key}
                onClick={() => toggleCategory(cat.key)}
                className={`flex items-center justify-between rounded-lg border px-3.5 py-2.5 cursor-pointer transition-all ${
                  cat.enabled
                    ? "border-blue-200 bg-blue-50/50 hover:bg-blue-50"
                    : "border-slate-200 bg-white hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <CatIcon className={`h-3.5 w-3.5 ${cat.enabled ? "text-blue-600" : "text-slate-400"}`} />
                  <span className={`text-[12px] font-medium ${cat.enabled ? "text-blue-700" : "text-slate-600"}`}>
                    {cat.label}
                  </span>
                </div>
                <div className={`h-4.5 w-4.5 rounded flex items-center justify-center text-white transition-colors ${
                  cat.enabled ? "bg-blue-600" : "border border-slate-300 bg-white"
                }`}>
                  {cat.enabled && <CheckCircle className="h-3 w-3" />}
                </div>
              </button>
            );
          })}
        </div>
      </Section>

      {/* Threshold sections in 2-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Attendance Thresholds */}
        <Section title="Attendance Thresholds" description="When attendance alerts trigger and their priority levels">
          <div className="grid grid-cols-3 gap-3">
            <ThresholdInput label="Shortage Trigger (%)" value={shortageTrigger} onChange={setShortageTrigger} hint="Present < this %" />
            <ThresholdInput label="Critical (%)" value={criticalPriority} onChange={setCriticalPriority} hint="Shortage >= this %" />
            <ThresholdInput label="High (%)" value={highPriority} onChange={setHighPriority} hint="Shortage >= this %" />
          </div>
        </Section>

        {/* Maintenance Thresholds */}
        <Section title="Maintenance Thresholds" description="Days overdue that trigger different priority levels">
          <div className="grid grid-cols-3 gap-3">
            <ThresholdInput label="Critical (days)" value={criticalAfterDays} onChange={setCriticalAfterDays} hint="Critical threshold" />
            <ThresholdInput label="High (days)" value={highAfterDays} onChange={setHighAfterDays} hint="High threshold" />
            <ThresholdInput label="Lookahead (days)" value={lookaheadDays} onChange={setLookaheadDays} hint="Days ahead" />
          </div>
        </Section>
      </div>

      {/* Water Quality */}
      <Section title="Water Quality (MLSS)" description="STP MLSS range thresholds in mg/L">
        <div className="grid grid-cols-4 gap-3">
          <ThresholdInput label="Min Normal (mg/L)" value={mlssMin} onChange={setMlssMin} />
          <ThresholdInput label="Max Normal (mg/L)" value={mlssMax} onChange={setMlssMax} />
          <ThresholdInput label="Critical Factor" value={mlssCriticalFactor} onChange={setMlssCriticalFactor} hint="e.g. 0.5" step="0.05" />
          <ThresholdInput label="High Factor" value={mlssHighFactor} onChange={setMlssHighFactor} hint="e.g. 0.75" step="0.05" />
        </div>
      </Section>

      {/* Audit Deadline Reminders */}
      <Section title="Audit Deadline Reminders" description="Days before deadline to send reminders per frequency">
        <div className="grid grid-cols-5 gap-2.5">
          <ThresholdInput label="Weekly" value={auditWeekly} onChange={setAuditWeekly} hint="days before" />
          <ThresholdInput label="Monthly" value={auditMonthly} onChange={setAuditMonthly} hint="days before" />
          <ThresholdInput label="Quarterly" value={auditQuarterly} onChange={setAuditQuarterly} hint="days before" />
          <ThresholdInput label="Half Yearly" value={auditHalfYearly} onChange={setAuditHalfYearly} hint="days before" />
          <ThresholdInput label="Yearly" value={auditYearly} onChange={setAuditYearly} hint="days before" />
        </div>
      </Section>

      {/* Notification Channels */}
      <Section title="Notification Channels" description="Configure which channels are active and who receives notifications">
        <div className="space-y-0 divide-y divide-slate-100">
          {channels.map((channel) => {
            const Icon = channel.icon;
            return (
              <div key={channel.key} className="py-3 first:pt-0 last:pb-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`h-7 w-7 rounded-md flex items-center justify-center ${
                      channel.enabled ? "bg-blue-50" : "bg-slate-100"
                    }`}>
                      <Icon className={`h-3.5 w-3.5 ${channel.enabled ? "text-blue-600" : "text-slate-400"}`} />
                    </div>
                    <div>
                      <p className={`text-[12px] font-medium ${channel.enabled ? "text-slate-900" : "text-slate-500"}`}>
                        {channel.label}
                      </p>
                      {channel.description && (
                        <p className="text-[10px] text-slate-400">{channel.description}</p>
                      )}
                    </div>
                  </div>
                  <Switch
                    checked={channel.enabled}
                    onCheckedChange={() => toggleChannel(channel.key)}
                    size="sm"
                  />
                </div>
                {channel.enabled && channel.roles.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 ml-10 mt-2">
                    {channel.roles.map((role) => (
                      <button
                        key={role.name}
                        onClick={() => toggleChannelRole(channel.key, role.name)}
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-medium border transition-all cursor-pointer ${
                          role.active
                            ? "bg-blue-50 border-blue-200 text-blue-700 shadow-sm"
                            : "bg-white border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50"
                        }`}
                      >
                        {role.active && <CheckCircle className="h-2.5 w-2.5" />}
                        {role.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Section>

      {/* Bottom action bar */}
      <div className="flex items-center justify-end gap-2 pt-1 pb-6">
        <Button variant="outline" size="sm" className="h-8 text-[12px] px-4" onClick={handleResetDefaults}>
          <RotateCcw className="h-3 w-3 mr-1.5" />
          Reset Defaults
        </Button>
        <Button size="sm" className="h-8 text-[12px] px-4 bg-blue-600 hover:bg-blue-700 text-white" onClick={handleSaveConfiguration}>
          <CheckCircle className="h-3 w-3 mr-1.5" />
          Save Configuration
        </Button>
      </div>
    </div>
  );
}

/* Section wrapper */
function Section({
  title,
  description,
  children,
}: {
  title?: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      {title && (
        <div className="mb-3">
          <h4 className="font-semibold text-[13px] text-slate-900">{title}</h4>
          {description && (
            <p className="text-[11px] text-slate-500 mt-0.5">{description}</p>
          )}
        </div>
      )}
      {children}
    </div>
  );
}

/* Threshold input */
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
    <div className="space-y-1.5">
      <Label className="text-[11px] font-medium text-slate-600">{label}</Label>
      <Input
        type="number"
        step={step}
        value={value}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
        className="h-9 text-[12px] bg-slate-50/50 border-slate-200 focus:bg-white"
      />
      {hint && <p className="text-[10px] text-slate-400">{hint}</p>}
    </div>
  );
}
