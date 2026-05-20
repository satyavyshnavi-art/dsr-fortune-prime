import { test, expect } from "@playwright/test";

// ==================== NAVIGATION & PAGE LOADS ====================

test.describe("Page Navigation", () => {
  test("login page loads", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("text=Sign In")).toBeVisible();
  });

  test("dashboard loads", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible({ timeout: 10000 });
  });

  test("daily updates page loads", async ({ page }) => {
    await page.goto("/daily-updates");
    await expect(page.getByRole("heading", { name: "Daily Updates" }).first()).toBeVisible({ timeout: 10000 });
  });

  test("attendance page loads", async ({ page }) => {
    await page.goto("/attendance");
    await expect(page.getByRole("heading", { name: "Attendance" })).toBeVisible({ timeout: 10000 });
  });

  test("asset management page loads", async ({ page }) => {
    await page.goto("/asset-management");
    await expect(page.getByRole("heading", { name: "Asset Management" })).toBeVisible({ timeout: 10000 });
  });

  test("facility config page loads", async ({ page }) => {
    await page.goto("/facility-config");
    await expect(page.getByRole("heading", { name: /Facility/ })).toBeVisible({ timeout: 10000 });
  });

  test("alerts page loads", async ({ page }) => {
    await page.goto("/alerts");
    await expect(page.getByRole("heading", { name: "Alerts" })).toBeVisible({ timeout: 10000 });
  });

  test("reports page loads", async ({ page }) => {
    await page.goto("/reports");
    await expect(page.getByRole("heading", { name: "Reports" })).toBeVisible({ timeout: 10000 });
  });

  test("user management page loads", async ({ page }) => {
    await page.goto("/user-management");
    await expect(page.getByRole("heading", { name: "User Management" })).toBeVisible({ timeout: 10000 });
  });

  test("biometric devices page loads", async ({ page }) => {
    await page.goto("/biometric-devices");
    await expect(page.getByRole("heading", { name: /Biometric/ })).toBeVisible({ timeout: 10000 });
  });
});

// ==================== API HEALTH CHECKS ====================

test.describe("API Endpoints", () => {
  test("GET /api/v1/employees returns 200", async ({ request }) => {
    const res = await request.get("/api/v1/employees");
    expect(res.status()).toBe(200);
    const data = await res.json();
    expect(Array.isArray(data)).toBe(true);
  });

  test("GET /api/v1/assets returns 200", async ({ request }) => {
    const res = await request.get("/api/v1/assets");
    expect(res.status()).toBe(200);
    const data = await res.json();
    expect(Array.isArray(data)).toBe(true);
  });

  test("GET /api/v1/alerts returns 200", async ({ request }) => {
    const res = await request.get("/api/v1/alerts");
    expect(res.status()).toBe(200);
    const data = await res.json();
    expect(Array.isArray(data)).toBe(true);
  });

  test("GET /api/v1/users returns 200", async ({ request }) => {
    const res = await request.get("/api/v1/users");
    expect(res.status()).toBe(200);
    const data = await res.json();
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThan(0);
  });

  test("GET /api/v1/complaints returns 200", async ({ request }) => {
    const res = await request.get("/api/v1/complaints");
    expect(res.status()).toBe(200);
  });

  test("GET /api/v1/tasks returns 200", async ({ request }) => {
    const res = await request.get("/api/v1/tasks");
    expect(res.status()).toBe(200);
  });

  test("GET /api/v1/facilities returns 200", async ({ request }) => {
    const res = await request.get("/api/v1/facilities");
    expect(res.status()).toBe(200);
    const data = await res.json();
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThan(0);
  });

  test("GET /api/v1/dashboard/summary returns 200", async ({ request }) => {
    const res = await request.get("/api/v1/dashboard/summary");
    expect(res.status()).toBe(200);
  });

  test("GET /api/v1/audit-logs returns 200", async ({ request }) => {
    const res = await request.get("/api/v1/audit-logs");
    expect(res.status()).toBe(200);
    const data = await res.json();
    expect(Array.isArray(data)).toBe(true);
  });

  test("POST /api/v1/alerts/generate works", async ({ request }) => {
    const res = await request.post("/api/v1/alerts/generate");
    expect(res.status()).toBe(200);
    const data = await res.json();
    expect(data.count).toBeGreaterThan(0);
  });
});

// ==================== USER MANAGEMENT CRUD ====================

test.describe("User Management CRUD", () => {
  let createdUserId: string;

  test("create user", async ({ request }) => {
    const res = await request.post("/api/v1/users", {
      data: {
        displayName: "E2E Test User",
        email: "e2e-test@example.com",
        phone: "+910000000000",
        role: "supervisor",
      },
    });
    expect(res.status()).toBe(201);
    const user = await res.json();
    expect(user.displayName).toBe("E2E Test User");
    expect(user.email).toBe("e2e-test@example.com");
    expect(user.role).toBe("supervisor");
    createdUserId = user.id;
  });

  test("update user", async ({ request }) => {
    // Create first if needed
    if (!createdUserId) {
      const createRes = await request.post("/api/v1/users", {
        data: { displayName: "E2E Update Test", email: "e2e-update@test.com", role: "user" },
      });
      createdUserId = (await createRes.json()).id;
    }

    const res = await request.put(`/api/v1/users/${createdUserId}`, {
      data: { displayName: "E2E Updated User", role: "manager" },
    });
    expect(res.status()).toBe(200);
    const user = await res.json();
    expect(user.displayName).toBe("E2E Updated User");
    expect(user.role).toBe("manager");
  });

  test("delete user", async ({ request }) => {
    if (!createdUserId) {
      const createRes = await request.post("/api/v1/users", {
        data: { displayName: "E2E Delete Test", email: "e2e-delete@test.com", role: "user" },
      });
      createdUserId = (await createRes.json()).id;
    }

    const res = await request.delete(`/api/v1/users/${createdUserId}`);
    expect(res.status()).toBe(200);

    // Verify deleted
    const getRes = await request.get(`/api/v1/users/${createdUserId}`);
    expect(getRes.status()).toBe(404);
  });
});

// ==================== ALERTS FUNCTIONALITY ====================

test.describe("Alerts", () => {
  test("alerts page shows alert cards", async ({ page }) => {
    await page.goto("/alerts");
    await expect(page.getByRole("heading", { name: "Alerts" })).toBeVisible({ timeout: 10000 });
    // Should show the Refresh & Generate button
    await expect(page.getByRole("button", { name: /Refresh|Generate/ })).toBeVisible({ timeout: 10000 });
  });

  test("alerts configuration tab loads", async ({ page }) => {
    await page.goto("/alerts");
    // Click Configuration tab (button with icon + text)
    await page.locator("button", { hasText: "Configuration" }).click();
    await expect(page.locator("text=Alert Configuration")).toBeVisible({ timeout: 10000 });
    await expect(page.locator("text=Alerts Enabled")).toBeVisible();
  });
});

// ==================== NO REACT CRASHES ====================

test.describe("No React #130 Crashes", () => {
  const pages = [
    "/dashboard",
    "/daily-updates",
    "/attendance",
    "/asset-management",
    "/facility-config",
    "/alerts",
    "/reports",
    "/user-management",
    "/biometric-devices",
  ];

  for (const path of pages) {
    test(`${path} does not crash`, async ({ page }) => {
      // Listen for console errors
      const errors: string[] = [];
      page.on("pageerror", (err) => errors.push(err.message));

      await page.goto(path);
      await page.waitForTimeout(2000);

      // Should NOT see "Something went wrong" error page
      const errorPage = page.locator("text=Something went wrong");
      await expect(errorPage).not.toBeVisible();

      // No React #130 errors
      const reactError = errors.find((e) => e.includes("#130") || e.includes("Element type is invalid"));
      expect(reactError).toBeUndefined();
    });
  }
});
