"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/shared";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Mail,
  Phone,
  Shield,
  Building2,
  Calendar,
  LogOut,
  KeyRound,
  CheckCircle,
} from "lucide-react";
import { getDemoUser, demoLogout, type DemoUser } from "@/lib/auth";
import { toast } from "sonner";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<DemoUser | null>(null);
  const [facility, setFacility] = useState<Record<string, string> | null>(null);

  // Editable fields
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);

  // Password change
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    const u = getDemoUser();
    if (!u) {
      router.push("/");
      return;
    }
    setUser(u);
    setDisplayName(u.name);
    setEmail(u.email);

    // Fetch facility info
    fetch("/api/v1/facilities")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) setFacility(data[0]);
      })
      .catch(() => {});
  }, [router]);

  function handleSaveProfile() {
    if (!displayName.trim()) {
      toast.error("Name is required");
      return;
    }
    setSaving(true);
    // Update local session
    const updated: DemoUser = {
      ...user!,
      name: displayName.trim(),
      email: email.trim(),
      initials: displayName
        .trim()
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2),
    };
    localStorage.setItem("dsr_demo_user", JSON.stringify(updated));
    setUser(updated);
    setSaving(false);
    toast.success("Profile updated");
  }

  function handleChangePassword() {
    if (!currentPassword || !newPassword) {
      toast.error("Please fill in all password fields");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("New password must be at least 6 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    toast.success("Password changed successfully");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  }

  function handleLogout() {
    demoLogout();
    router.push("/");
  }

  if (!user) return null;

  return (
    <div className="p-5 space-y-5 max-w-4xl">
      <PageHeader title="My Profile" />

      {/* Profile Header Card */}
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <div className="flex items-start gap-5">
          <Avatar className="h-20 w-20">
            <AvatarFallback className="bg-emerald-100 text-emerald-700 text-2xl font-bold">
              {user.initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-slate-900">{user.name}</h2>
            <p className="text-[13px] text-blue-600 font-medium mt-0.5">{user.role}</p>
            <div className="flex flex-wrap items-center gap-4 mt-3 text-[13px] text-slate-500">
              <span className="flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5" />
                {user.email}
              </span>
              {phone && (
                <span className="flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5" />
                  {phone}
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <Shield className="h-3.5 w-3.5" />
                {user.role}
              </span>
              {facility && (
                <span className="flex items-center gap-1.5">
                  <Building2 className="h-3.5 w-3.5" />
                  {facility.name || "DSR Fortune Prime"}
                </span>
              )}
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="text-red-600 border-red-200 hover:bg-red-50 text-[12px]"
            onClick={handleLogout}
          >
            <LogOut className="h-3 w-3 mr-1.5" />
            Sign Out
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Personal Information */}
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h3 className="text-[14px] font-semibold text-slate-900 mb-4">Personal Information</h3>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-[12px] text-slate-500">Display Name</Label>
              <Input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="h-9 text-[13px]"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[12px] text-slate-500">Email Address</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-9 text-[13px]"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[12px] text-slate-500">Phone Number</Label>
              <Input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 XXXXX XXXXX"
                className="h-9 text-[13px]"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[12px] text-slate-500">Role</Label>
              <Input
                value={user.role}
                disabled
                className="h-9 text-[13px] bg-slate-50 text-slate-500"
              />
            </div>
            <Button
              size="sm"
              className="h-8 text-[12px] bg-blue-600 hover:bg-blue-700 text-white mt-2"
              onClick={handleSaveProfile}
              disabled={saving}
            >
              <CheckCircle className="h-3 w-3 mr-1.5" />
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>

        {/* Security + Facility Info */}
        <div className="space-y-5">
          {/* Change Password */}
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <h3 className="text-[14px] font-semibold text-slate-900 mb-4">
              <KeyRound className="h-4 w-4 inline mr-1.5 text-slate-400" />
              Change Password
            </h3>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label className="text-[12px] text-slate-500">Current Password</Label>
                <Input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="h-9 text-[13px]"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[12px] text-slate-500">New Password</Label>
                <Input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="h-9 text-[13px]"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[12px] text-slate-500">Confirm New Password</Label>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="h-9 text-[13px]"
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-[12px] mt-2"
                onClick={handleChangePassword}
              >
                Update Password
              </Button>
            </div>
          </div>

          {/* Facility Info */}
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <h3 className="text-[14px] font-semibold text-slate-900 mb-4">
              <Building2 className="h-4 w-4 inline mr-1.5 text-slate-400" />
              Facility Information
            </h3>
            <div className="space-y-2.5 text-[13px]">
              <div className="flex justify-between">
                <span className="text-slate-500">Facility</span>
                <span className="font-medium text-slate-900">{facility?.name || "DSR Fortune Prime"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Type</span>
                <span className="font-medium text-slate-900 capitalize">{facility?.type || "Residential"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">City</span>
                <span className="font-medium text-slate-900">{facility?.city || "Bangalore"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Client</span>
                <span className="font-medium text-slate-900">{facility?.clientName || facility?.client_name || "DSR Infrastructure"}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
