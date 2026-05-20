import { test, expect } from "@playwright/test";
import path from "path";

const SCREENSHOT_DIR = path.join(__dirname, "../docs/screenshots");
const opts = { fullPage: true };

function ss(name: string) {
  return path.join(SCREENSHOT_DIR, `${name}.png`);
}

test.use({
  viewport: { width: 1440, height: 900 },
  colorScheme: "light",
});

test.setTimeout(60000);

// Helper: wait for page to render
async function waitForLoad(page: any) {
  await page.waitForLoadState("domcontentloaded");
  await page.waitForTimeout(2500);
}

// ==================== DOCUMENTATION SCREENSHOTS ====================
test.describe("Documentation Screenshots", () => {

  test("01 - Login Page", async ({ page }) => {
    await page.goto("/");
    await waitForLoad(page);
    await page.screenshot({ path: ss("01-login-page"), ...opts });
  });

  test("02 - Login Error", async ({ page }) => {
    await page.goto("/");
    await waitForLoad(page);
    // Clear and type wrong credentials
    await page.locator('input[type="email"]').fill("wrong@test.com");
    await page.locator('input[type="password"]').fill("wrongpass");
    await page.locator('button[type="submit"]').click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: ss("02-login-error"), ...opts });
  });

  // ==================== 2. DASHBOARD ====================
  test("03 - Dashboard", async ({ page }) => {
    await page.goto("/dashboard");
    await waitForLoad(page);
    await page.screenshot({ path: ss("03-dashboard"), ...opts });
  });

  test("04 - Dashboard scrolled (widgets)", async ({ page }) => {
    await page.goto("/dashboard");
    await waitForLoad(page);
    await page.evaluate(() => window.scrollBy(0, 600));
    await page.waitForTimeout(500);
    await page.screenshot({ path: ss("04-dashboard-widgets"), ...opts });
  });

  // ==================== 3. PROFILE DROPDOWN ====================
  test("05 - Profile Dropdown", async ({ page }) => {
    await page.goto("/dashboard");
    await waitForLoad(page);
    // Click the profile dropdown trigger in top bar
    const profileBtn = page.locator("header button").last();
    await profileBtn.click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: ss("05-profile-dropdown") });
  });

  // ==================== 4. DAILY UPDATES ====================
  test("06 - Daily Updates", async ({ page }) => {
    await page.goto("/daily-updates");
    await waitForLoad(page);
    await page.screenshot({ path: ss("06-daily-updates"), ...opts });
  });

  // ==================== 5. ATTENDANCE ====================
  test("07 - Attendance", async ({ page }) => {
    await page.goto("/attendance");
    await waitForLoad(page);
    await page.screenshot({ path: ss("07-attendance"), ...opts });
  });

  // ==================== 6. ASSET MANAGEMENT ====================
  test("08 - Asset Management", async ({ page }) => {
    await page.goto("/asset-management");
    await waitForLoad(page);
    await page.screenshot({ path: ss("08-asset-management"), ...opts });
  });

  // ==================== 7. FACILITY CONFIG ====================
  test("09 - Facility Config", async ({ page }) => {
    await page.goto("/facility-config");
    await waitForLoad(page);
    await page.screenshot({ path: ss("09-facility-config"), ...opts });
  });

  // ==================== 8. ALERTS ====================
  test("10 - Alerts List", async ({ page }) => {
    await page.goto("/alerts");
    await waitForLoad(page);
    await page.screenshot({ path: ss("10-alerts-list"), ...opts });
  });

  test("11 - Alerts Configuration", async ({ page }) => {
    await page.goto("/alerts");
    await waitForLoad(page);
    await page.locator("button", { hasText: "Configuration" }).click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: ss("11-alerts-configuration"), ...opts });
  });

  // ==================== 9. REPORTS ====================
  test("12 - Reports", async ({ page }) => {
    await page.goto("/reports");
    await waitForLoad(page);
    await page.screenshot({ path: ss("12-reports"), ...opts });
  });

  // ==================== 10. AI AGENT ====================
  test("13 - AI Agent", async ({ page }) => {
    await page.goto("/ai-agent");
    await waitForLoad(page);
    await page.screenshot({ path: ss("13-ai-agent"), ...opts });
  });

  // ==================== 11. USER MANAGEMENT ====================
  test("14 - User Management - Users", async ({ page }) => {
    await page.goto("/user-management");
    await waitForLoad(page);
    await page.screenshot({ path: ss("14-user-management"), ...opts });
  });

  test("15 - User Management - Roles", async ({ page }) => {
    await page.goto("/user-management");
    await waitForLoad(page);
    await page.locator("button", { hasText: "Roles & Access" }).click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: ss("15-roles-permissions"), ...opts });
  });

  test("16 - User Management - Audit Log", async ({ page }) => {
    await page.goto("/user-management");
    await waitForLoad(page);
    await page.locator("button", { hasText: "User Audit" }).click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: ss("16-audit-log"), ...opts });
  });

  // ==================== 12. BIOMETRIC DEVICES ====================
  test("17 - Biometric Devices", async ({ page }) => {
    await page.goto("/biometric-devices");
    await waitForLoad(page);
    await page.screenshot({ path: ss("17-biometric-devices"), ...opts });
  });

  // ==================== 13. PROFILE PAGE ====================
  test("18 - My Profile", async ({ page }) => {
    // Must login first to set localStorage session
    await page.goto("/");
    await waitForLoad(page);
    await page.locator('input[type="email"]').fill("demo@dsrfortuneprime.com");
    await page.locator('input[type="password"]').fill("demo123");
    await page.locator('button[type="submit"]').click();
    await page.waitForURL("**/dashboard");
    await page.goto("/profile");
    await waitForLoad(page);
    await page.screenshot({ path: ss("18-profile"), ...opts });
  });

  // ==================== 14. SIDEBAR COLLAPSED ====================
  test("19 - Sidebar Collapsed", async ({ page }) => {
    await page.goto("/dashboard");
    await waitForLoad(page);
    const collapseBtn = page.locator("aside button").last();
    await collapseBtn.click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: ss("19-sidebar-collapsed") });
  });

  // ==================== 15. SIDEBAR USER SECTION ====================
  test("20 - Sidebar Sign Out", async ({ page }) => {
    // Login first to get user session
    await page.goto("/");
    await waitForLoad(page);
    await page.locator('input[type="email"]').fill("demo@dsrfortuneprime.com");
    await page.locator('input[type="password"]').fill("demo123");
    await page.locator('button[type="submit"]').click();
    await page.waitForURL("**/dashboard");
    await waitForLoad(page);
    await page.screenshot({ path: ss("20-sidebar-with-user") });
  });
});
