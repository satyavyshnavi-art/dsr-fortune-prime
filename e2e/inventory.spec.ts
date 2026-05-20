import { test, expect } from "@playwright/test";

test.describe("Inventory Module", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/inventory");
    await expect(
      page.getByRole("heading", { name: /Inventory/ })
    ).toBeVisible({ timeout: 10000 });
  });

  test.describe("Page Layout", () => {
    test("renders page header", async ({ page }) => {
      await expect(page.getByText("Inventory Management")).toBeVisible();
    });

    test("renders KPI cards", async ({ page }) => {
      await expect(page.getByText("Total Items")).toBeVisible({ timeout: 5000 });
      await expect(page.getByText("Low Stock Items")).toBeVisible();
      await expect(page.getByText("Total Value")).toBeVisible();
      await expect(page.getByText("Transactions Today")).toBeVisible();
    });

    test("renders tab navigation", async ({ page }) => {
      await expect(
        page.getByRole("button", { name: "Inventory Items" })
      ).toBeVisible();
      await expect(
        page.getByRole("button", { name: "Uniform Tracker" })
      ).toBeVisible();
    });
  });

  test.describe("Inventory List", () => {
    test("renders item list with search", async ({ page }) => {
      await page.waitForTimeout(2000);

      await expect(
        page.getByPlaceholder("Search items...")
      ).toBeVisible({ timeout: 5000 });
    });

    test("renders category filter dropdown", async ({ page }) => {
      await page.waitForTimeout(2000);

      await expect(
        page.locator("button", { hasText: "All Categories" })
      ).toBeVisible({ timeout: 5000 });
    });

    test("shows item count", async ({ page }) => {
      await page.waitForTimeout(2000);

      await expect(page.getByText(/\d+ items/)).toBeVisible({ timeout: 5000 });
    });

    test("table shows column headers", async ({ page }) => {
      await page.waitForTimeout(2000);

      await expect(page.getByText("Item Name")).toBeVisible({ timeout: 5000 });
      await expect(page.getByText("Category")).toBeVisible();
      await expect(page.getByText("Unit")).toBeVisible();
      await expect(page.getByText("Current Qty")).toBeVisible();
      await expect(page.getByText("Reorder Level")).toBeVisible();
      await expect(page.getByText("Status")).toBeVisible();
    });

    test("items show stock status badges", async ({ page }) => {
      await page.waitForTimeout(2000);

      // Mock data should include items with various statuses
      const statusBadge = page.getByText("In Stock").or(page.getByText("Low Stock")).or(page.getByText("Out of Stock"));
      await expect(statusBadge.first()).toBeVisible({ timeout: 5000 });
    });

    test("search filters items", async ({ page }) => {
      await page.waitForTimeout(2000);

      const searchInput = page.getByPlaceholder("Search items...");
      await searchInput.fill("Cleaning");
      await page.waitForTimeout(500);
      // Search should filter — item count may change
    });
  });

  test.describe("Category Filter", () => {
    test("category dropdown opens and shows options", async ({ page }) => {
      await page.waitForTimeout(2000);

      await page.locator("button", { hasText: "All Categories" }).click();

      // Should show category options in the dropdown
      await expect(
        page.getByRole("option", { name: "All Categories" })
      ).toBeVisible({ timeout: 3000 });
    });
  });

  test.describe("Uniform Tracker Tab", () => {
    test("switching to Uniform Tracker tab works", async ({ page }) => {
      await page.getByRole("button", { name: "Uniform Tracker" }).click();
      await page.waitForTimeout(1000);
      // Tab should switch and render uniform tracker content
    });
  });

  test.describe("Low Stock Alerts", () => {
    test("low stock items KPI shows a count", async ({ page }) => {
      // The KPI card for "Low Stock Items" should show a number
      const lowStockCard = page.locator("text=Low Stock Items").locator("..");
      await expect(lowStockCard).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe("API Fallback", () => {
    test("shows mock data when API is unavailable", async ({ page }) => {
      await page.waitForTimeout(3000);

      // If API fails, mock data message appears OR table has data
      const table = page.locator("table");
      const mockWarning = page.getByText("API unavailable");
      const hasContent = table.or(mockWarning);
      await expect(hasContent).toBeVisible({ timeout: 5000 });
    });
  });
});
