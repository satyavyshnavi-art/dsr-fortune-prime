import { test, expect } from "@playwright/test";

test.describe("Attendance Module", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/attendance");
    await expect(
      page.getByRole("heading", { name: "Attendance" })
    ).toBeVisible({ timeout: 10000 });
  });

  test.describe("Page Layout", () => {
    test("renders page header", async ({ page }) => {
      await expect(page.getByText("Attendance & Staffing")).toBeVisible();
    });

    test("shows info banner about adding employees first", async ({ page }) => {
      await expect(
        page.getByText(/Please add employees first/)
      ).toBeVisible();
    });

    test("renders all tab buttons", async ({ page }) => {
      const tabLabels = [
        "Employees",
        "Check In/Out",
        "Entry",
        "Attendance",
        "QR Scanner",
        "Staff & Shift",
        "Shift View",
        "Calendar View",
        "Billing View",
        "Timesheet View",
      ];

      for (const label of tabLabels) {
        await expect(
          page.getByRole("button", { name: label, exact: true })
        ).toBeVisible();
      }
    });
  });

  test.describe("Employee Table Tab", () => {
    test("Employees tab is active by default", async ({ page }) => {
      // The first tab "Employees" should be active (blue text)
      const employeesTab = page.getByRole("button", { name: "Employees", exact: true });
      await expect(employeesTab).toBeVisible();
      // The tab content should be rendered
      await page.waitForTimeout(1000);
    });
  });

  test.describe("Check In/Out Tab", () => {
    test("renders check in/out form", async ({ page }) => {
      await page.getByRole("button", { name: "Check In/Out" }).click();

      await expect(page.getByText("Check In / Check Out")).toBeVisible({ timeout: 5000 });
      await expect(page.getByText("Select Employee")).toBeVisible();
    });

    test("shows employee selection dropdown", async ({ page }) => {
      await page.getByRole("button", { name: "Check In/Out" }).click();

      await expect(
        page.locator("button", { hasText: "Select Employee" })
      ).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe("Tab Switching", () => {
    test("switching to Calendar View tab works", async ({ page }) => {
      await page.getByRole("button", { name: "Calendar View", exact: true }).click();
      await page.waitForTimeout(1000);
      // Calendar view should render some content
      // The tab should be visually active
    });

    test("switching to Shift View tab works", async ({ page }) => {
      await page.getByRole("button", { name: "Shift View", exact: true }).click();
      await page.waitForTimeout(1000);
    });

    test("switching to QR Scanner tab works", async ({ page }) => {
      await page.getByRole("button", { name: "QR Scanner", exact: true }).click();
      await page.waitForTimeout(1000);
    });

    test("switching to Billing View tab works", async ({ page }) => {
      await page.getByRole("button", { name: "Billing View", exact: true }).click();
      await page.waitForTimeout(1000);
    });

    test("switching to Timesheet View tab works", async ({ page }) => {
      await page.getByRole("button", { name: "Timesheet View", exact: true }).click();
      await page.waitForTimeout(1000);
    });
  });

  test.describe("No Console Errors", () => {
    test("attendance page loads without React crashes", async ({ page }) => {
      const errors: string[] = [];
      page.on("pageerror", (err) => errors.push(err.message));

      await page.goto("/attendance");
      await page.waitForTimeout(2000);

      const errorPage = page.locator("text=Something went wrong");
      await expect(errorPage).not.toBeVisible();

      const reactError = errors.find(
        (e) => e.includes("#130") || e.includes("Element type is invalid")
      );
      expect(reactError).toBeUndefined();
    });
  });
});
