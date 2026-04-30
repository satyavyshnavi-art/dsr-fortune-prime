export const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: "LayoutDashboard" },
  { label: "Daily Update", href: "/daily-updates", icon: "CalendarDays" },
  { label: "Attendance", href: "/attendance", icon: "UserCheck" },
  { label: "Asset Management", href: "/asset-management", icon: "Package" },
  { label: "Facility Config", href: "/facility-config", icon: "Settings" },
  { label: "Alerts", href: "/alerts", icon: "Bell" },
  { label: "Reports", href: "/reports", icon: "BarChart3" },
  { label: "AI Agent", href: "/ai-agent", icon: "Bot" },
  { label: "User Management", href: "/user-management", icon: "Users" },
  { label: "Biometric Devices", href: "/biometric-devices", icon: "Fingerprint" },
] as const;

export const DEPARTMENTS = [
  "Housekeeping",
  "Security",
  "Maintenance",
  "Gardening",
  "Pest Control",
  "Electrical",
  "Plumbing",
  "HVAC",
  "Fire Safety",
  "Soft Services",
] as const;

export const ALERT_CATEGORIES = [
  "Attendance & Staffing",
  "Asset Maintenance",
  "Water Management",
  "Hygiene",
  "Critical Systems",
  "Power Management",
  "Complaint",
  "General",
] as const;

export const KPI_CATEGORIES = [
  "Attendance",
  "Operations",
  "Utilities",
  "Maintenance",
  "Quality",
  "Safety",
] as const;

export const FACILITY_LOCATION = {
  name: "DSR Fortune Prime",
  area: "Whitefield",
  city: "Bangalore",
  state: "Karnataka",
  pin: "560066",
  full: "DSR Fortune Prime, Whitefield, Bangalore, Karnataka 560066",
} as const;
