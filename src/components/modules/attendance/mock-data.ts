// Mock employee data matching screenshots (Indian names)
export interface Employee {
  id: string;
  empId: string;
  firstName: string;
  lastName: string;
  designation: string;
  department: string;
  phone: string;
  email: string;
  dateOfBirth: string;
  qrConfigured: boolean;
  smartcardId?: string;
  shift?: string;
  isActive?: boolean;
}

export interface AttendanceRecord {
  employeeId: string;
  date: string;
  status: "P" | "A" | "L" | "WO" | "HD" | "";
  checkIn?: string;
  checkOut?: string;
  hours?: number;
}

export interface LeaveRequest {
  id: string;
  employeeName: string;
  type: string;
  dateFrom: string;
  dateTo: string;
  days: number;
  reason: string;
  status: "Pending" | "Approved" | "Rejected";
}

export interface WeekOff {
  employeeName: string;
  days: string;
}

export interface RecentScan {
  employeeName: string;
  empId: string;
  designation: string;
  checkIn: string;
  status: "Checked In" | "Checked Out";
}

export const DESIGNATIONS = [
  "Soft Services",
  "Technician",
  "Pest Control",
  "Housekeeping",
  "Gardening",
  "Security",
  "Electrician",
  "Plumber",
] as const;

export const MOCK_EMPLOYEES: Employee[] = [
  {
    id: "1",
    empId: "EMP0013",
    firstName: "Neha",
    lastName: "Agarwal",
    designation: "Soft Services",
    department: "Operations",
    phone: "+919602418631",
    email: "soft_services2@greenviewdemo.com",
    dateOfBirth: "1990-05-15",
    qrConfigured: true,
    smartcardId: "SC001",
    shift: "Flexible",
    isActive: true,
  },
  {
    id: "2",
    empId: "EMP0012",
    firstName: "Shalini",
    lastName: "Mehta",
    designation: "Soft Services",
    department: "Operations",
    phone: "+919842472237",
    email: "soft_services1@greenviewdemo.com",
    dateOfBirth: "1988-11-22",
    qrConfigured: true,
    smartcardId: "SC002",
    shift: "Flexible",
    isActive: true,
  },
  {
    id: "3",
    empId: "EMP0011",
    firstName: "Pradeep",
    lastName: "Desai",
    designation: "Technician",
    department: "Maintenance",
    phone: "+91-9400927859",
    email: "technician3@greenviewdemo.com",
    dateOfBirth: "1985-03-10",
    qrConfigured: true,
    smartcardId: "SC003",
    shift: "Flexible",
    isActive: true,
  },
  {
    id: "4",
    empId: "EMP0010",
    firstName: "Mahesh",
    lastName: "Joshi",
    designation: "Technician",
    department: "Maintenance",
    phone: "+91-9678422678",
    email: "technician2@greenviewdemo.com",
    dateOfBirth: "1992-07-28",
    qrConfigured: true,
    smartcardId: "SC004",
    shift: "Flexible",
    isActive: true,
  },
  {
    id: "5",
    empId: "EMP0009",
    firstName: "Sachin",
    lastName: "Menon",
    designation: "Technician",
    department: "Maintenance",
    phone: "+91-9831903033",
    email: "technician1@greenviewdemo.com",
    dateOfBirth: "1991-01-14",
    qrConfigured: true,
    smartcardId: "SC005",
    isActive: true,
  },
  {
    id: "6",
    empId: "EMP0008",
    firstName: "Raj",
    lastName: "Iyer",
    designation: "Technician",
    department: "Maintenance",
    phone: "+91-9424837434",
    email: "technician0@greenviewdemo.com",
    dateOfBirth: "1993-09-05",
    qrConfigured: true,
    smartcardId: "SC006",
    isActive: true,
  },
  {
    id: "7",
    empId: "EMP0007",
    firstName: "Deepak",
    lastName: "Nair",
    designation: "Pest Control",
    department: "Maintenance",
    phone: "+91-9854419679",
    email: "pest_control1@greenviewdemo.com",
    dateOfBirth: "1987-12-20",
    qrConfigured: true,
    smartcardId: "SC007",
    isActive: false,
  },
  {
    id: "8",
    empId: "EMP0006",
    firstName: "Amit",
    lastName: "Reddy",
    designation: "Pest Control",
    department: "Maintenance",
    phone: "+91-9881834930",
    email: "pest_control0@greenviewdemo.com",
    dateOfBirth: "1989-06-18",
    qrConfigured: true,
    smartcardId: "SC008",
    isActive: false,
  },
  {
    id: "9",
    empId: "EMP0004",
    firstName: "Kamala",
    lastName: "Patel",
    designation: "Housekeeping",
    department: "Housekeeping",
    phone: "+91-9507147130",
    email: "housekeeping2@greenviewdemo.com",
    dateOfBirth: "1994-02-25",
    qrConfigured: true,
    smartcardId: "SC009",
    isActive: true,
  },
  {
    id: "10",
    empId: "EMP0003",
    firstName: "Priya",
    lastName: "Sharma",
    designation: "Housekeeping",
    department: "Housekeeping",
    phone: "+91-9497258167",
    email: "housekeeping1@greenviewdemo.com",
    dateOfBirth: "1996-08-12",
    qrConfigured: true,
    smartcardId: "SC010",
    isActive: true,
  },
  {
    id: "11",
    empId: "EMP0002",
    firstName: "Kumar",
    lastName: "Singh",
    designation: "Gardening",
    department: "Gardening",
    phone: "+91-9426868824",
    email: "gardening1@greenviewdemo.com",
    dateOfBirth: "1986-04-30",
    qrConfigured: true,
    smartcardId: "SC011",
    isActive: true,
  },
  {
    id: "12",
    empId: "EMP0001",
    firstName: "Ramesh",
    lastName: "Kumar",
    designation: "Gardening",
    department: "Gardening",
    phone: "+91-9147160808",
    email: "gardening0@greenviewdemo.com",
    dateOfBirth: "1984-10-03",
    qrConfigured: true,
    smartcardId: "SC012",
    isActive: true,
  },
];

// Generate attendance records for April 2026
function generateAttendanceData(): AttendanceRecord[] {
  const records: AttendanceRecord[] = [];
  const statuses: ("P" | "A" | "L" | "WO")[] = ["P", "A", "L", "WO"];

  MOCK_EMPLOYEES.forEach((emp) => {
    for (let day = 1; day <= 30; day++) {
      const date = `2026-04-${day.toString().padStart(2, "0")}`;
      const dayOfWeek = new Date(date).getDay();

      let status: "P" | "A" | "L" | "WO";
      if (dayOfWeek === 0) {
        status = "WO"; // Sunday
      } else {
        // Weighted random: mostly present
        const rand = Math.random();
        if (rand < 0.7) status = "P";
        else if (rand < 0.85) status = "A";
        else if (rand < 0.95) status = "L";
        else status = "WO";
      }

      const hours = status === "P" ? 8 + Math.floor(Math.random() * 2) : 0;
      records.push({
        employeeId: emp.id,
        date,
        status,
        checkIn: status === "P" ? "09:00" : undefined,
        checkOut: status === "P" ? `${17 + Math.floor(Math.random() * 2)}:00` : undefined,
        hours,
      });
    }
  });

  return records;
}

export const MOCK_ATTENDANCE: AttendanceRecord[] = generateAttendanceData();

export const MOCK_LEAVE_REQUESTS: LeaveRequest[] = [
  {
    id: "1",
    employeeName: "Shalini Mehta",
    type: "Sick Leave",
    dateFrom: "2026-04-21",
    dateTo: "2026-04-23",
    days: 2,
    reason: "Personal work",
    status: "Pending",
  },
  {
    id: "2",
    employeeName: "Unknown",
    type: "Personal Leave",
    dateFrom: "2026-04-16",
    dateTo: "2026-04-19",
    days: 4,
    reason: "Sick leave",
    status: "Pending",
  },
  {
    id: "3",
    employeeName: "Amit Reddy",
    type: "Emergency Leave",
    dateFrom: "2026-04-11",
    dateTo: "2026-04-14",
    days: 4,
    reason: "",
    status: "Approved",
  },
];

export const MOCK_WEEK_OFFS: WeekOff[] = [
  { employeeName: "Deepak Nair", days: "Sunday, Saturday, Tuesday" },
  { employeeName: "Unknown", days: "Sunday, Monday" },
];

export const MOCK_RECENT_SCANS: RecentScan[] = [
  {
    employeeName: "Neha Agarwal",
    empId: "EMP0013",
    designation: "Soft Services",
    checkIn: "Invalid Date",
    status: "Checked Out",
  },
  {
    employeeName: "Neha Agarwal",
    empId: "EMP0013",
    designation: "Soft Services",
    checkIn: "05:40 PM",
    status: "Checked In",
  },
  {
    employeeName: "Amit Reddy",
    empId: "EMP0006",
    designation: "Pest Control",
    checkIn: "",
    status: "Checked In",
  },
];

export function getNextEmpId(): string {
  const maxNum = Math.max(
    ...MOCK_EMPLOYEES.map((e) => parseInt(e.empId.replace("EMP", "")))
  );
  return `EMP${(maxNum + 1).toString().padStart(4, "0")}`;
}
