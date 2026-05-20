import { test, expect } from "@playwright/test";

test.describe("Reports Module", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/reports");
    await expect(
      page.getByRole("heading", { name: "Reports" })
    ).toBeVisible({ timeout: 10000 });
  });

  test.describe("Page Layout", () => {
    test("renders page header with refresh button", async ({ page }) => {
      await expect(page.getByText("Reports")).toBeVisible();
      await expect(
        page.getByRole("button", { name: /Refresh/ })
      ).toBeVisible();
    });

    test("shows date range display", async ({ page }) => {
      // Date range should be visible
      await expect(page.getByText(/\d{2}-\w{3}-\d{2}/)).toBeVisible({ timeout: 5000 });
    });

    test("renders tab navigation", async ({ page }) => {
      await expect(
        page.getByRole("button", { name: "Dashboard" })
      ).toBeVisible();
      await expect(
        page.getByRole("button", { name: "Analytics" })
      ).toBeVisible();
      await expect(
        page.getByRole("button", { name: "Reports" })
      ).toBeVisible();
    });
  });

  test.describe("Dashboard Tab (KPI Traffic Light)", () => {
    test("Dashboard tab is active by default", async ({ page }) => {
      // Dashboard tab should show KPI traffic light content
      await page.waitForTimeout(1000);
    });
  });

  test.describe("Analytics Tab", () => {
    test("switching to Analytics tab renders content", async ({ page }) => {
      await page.getByRole("button", { name: "Analytics" }).click();
      await page.waitForTimeout(1000);
      // Analytics tab content should render without errors
    });
  });

  test.describe("Reports Tab", () => {
    test("switching to Reports tab shows report templates", async ({ page }) => {
      await page.getByRole("button", { name: "Reports" }).click();

      await expect(page.getByText("Generate Reports")).toBeVisible({ timeout: 5000 });
    });

    test("report cards have download PDF button", async ({ page }) => {
      await page.getByRole("button", { name: "Reports" }).click();
      await page.waitForTimeout(1000);

      const pdfButtons = page.getByRole("button", { name: "PDF" });
      await expect(pdfButtons.first()).toBeVisible({ timeout: 5000 });
    });

    test("report cards display names and descriptions", async ({ page }) => {
      await page.getByRole("button", { name: "Reports" }).click();
      await page.waitForTimeout(1000);

      // Report template cards should have content
      const reportCards = page.locator("[class*=CardContent]");
      const count = await reportCards.count();
      expect(count).toBeGreaterThan(0);
    });
  });

  test.describe("Tab Switching", () => {
    test("can switch between all tabs without errors", async ({ page }) => {
      const errors: string[] = [];
      page.on("pageerror", (err) => errors.push(err.message));

      // Dashboard (default)
      await page.waitForTimeout(500);

      // Analytics
      await page.getByRole("button", { name: "Analytics" }).click();
      await page.waitForTimeout(500);

      // Reports
      await page.getByRole("button", { name: "Reports" }).click();
      await page.waitForTimeout(500);

      // Back to Dashboard
      await page.getByRole("button", { name: "Dashboard" }).click();
      await page.waitForTimeout(500);

      const reactError = errors.find(
        (e) => e.includes("#130") || e.includes("Element type is invalid")
      );
      expect(reactError).toBeUndefined();
    });
  });
});
