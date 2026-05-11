// Demo auth — lightweight localStorage session for demo purposes.
// Replace with Auth0 / NextAuth when ready for production.

export interface DemoUser {
  id: string;
  name: string;
  email: string;
  role: string;
  initials: string;
}

const STORAGE_KEY = "dsr_demo_user";

// Demo credentials
const DEMO_ACCOUNTS: { email: string; password: string; user: DemoUser }[] = [
  {
    email: "demo@dsrfortuneprime.com",
    password: "demo123",
    user: {
      id: "demo-1",
      name: "Prakash Narasamy",
      email: "demo@dsrfortuneprime.com",
      role: "Facility Manager",
      initials: "PN",
    },
  },
];

export function demoLogin(
  email: string,
  password: string
): { success: true; user: DemoUser } | { success: false; error: string } {
  const account = DEMO_ACCOUNTS.find(
    (a) => a.email.toLowerCase() === email.toLowerCase() && a.password === password
  );
  if (!account) {
    return { success: false, error: "Invalid email or password" };
  }
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(account.user));
  }
  return { success: true, user: account.user };
}

export function demoLogout(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(STORAGE_KEY);
  }
}

export function getDemoUser(): DemoUser | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    return JSON.parse(stored) as DemoUser;
  } catch {
    return null;
  }
}
