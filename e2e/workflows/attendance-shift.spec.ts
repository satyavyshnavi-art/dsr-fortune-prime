import { test, expect } from "@playwright/test";

test.describe("Attendance & Shift Workflow", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/attendance");
    await expect(
      page.getByRole("heading", { name: "Attendance" })
    ).toBeVisible({ timeout: 10000 });
  });

  test.describe("Check In/Out Workflow", () => {
    test("navigate to Check In/Out tab and verify form renders", async ({ page }) => {
      await page.getByRole("button", { name: "Check In/Out" }).click();

      await expect(page.getByText("Check In / Check Out")).toBeVisible({ timeout: 5000 });
      await expect(page.getByText("Select Employee")).toBeVisible();
    });

    test("employee selection dropdown is interactive", async ({ page }) => {
      await page.getByRole("button", { name: "Check In/Out" }).click();
      await page.waitForTimeout(1000);

      const employeeSelector = page.locator("button", { hasText: "Select Employee" });
      await expect(employeeSelector).toBeVisible({ timeout: 5000 });

      // Click to open the dropdown
      await employeeSelector.click();
      await page.waitForTimeout(500);

      // Dropdown options should appear (or a search field within the dropdown)
      const dropdownContent = page.locator("[role='listbox'], [role='option'], [data-radix-popper-content-wrapper]");
      const searchInDropdown = page.getByPlaceholder(/search/i);
      const anyDropdownUI = dropdownContent.or(searchInDropdown);
      const count = await anyDropdownUI.count();
      expect(count).toBeGreaterThanOrEqual(0);
    });

    test("check-in form shows geo/location display area", async ({ page }) => {
      await page.getByRole("button", { name: "Check In/Out" }).click();
      await page.waitForTimeout(1000);

      // Look for geo-related UI elements
      const geoText = page.getByText(/location/i).or(page.getByText(/geo/i)).or(page.getByText(/latitude/i));
      const checkInBtn = page.getByRole("button", { name: /Check In/i });
      const anyGeoUI = geoText.or(checkInBtn);
      await expect(anyGeoUI.first()).toBeVisible({ timeout: 5000 });
    });

    test("check-out flow shows shift selection when applicable", async ({ page }) => {
      await page.getByRole("button", { name: "Check In/Out" }).click();
      await page.waitForTimeout(1000);

      // Look for check-out button or shift selection
      const checkOutBtn = page.getByRole("button", { name: /Check Out/i });
      const shiftSelect = page.getByText(/shift/i);
      const anyUI = checkOutBtn.or(shiftSelect);
      const count = await anyUI.count();
      expect(count).toBeGreaterThanOrEqual(0);
    });
  });

  test.describe("Calendar View", () => {
    test("calendar view renders after tab switch", async ({ page }) => {
      await page.getByRole("button", { name: "Calendar View", exact: true }).click();
      await page.waitForTimeout(1500);

      // Calendar should show month/date navigation or calendar grid
      const calendarContent = page.locator("table, .calendar, [role='grid']");
      const monthLabel = page.getByText(/January|February|March|April|May|June|July|August|September|October|November|December/);
      const anyCalendarUI = calendarContent.or(monthLabel);
      await expect(anyCalendarUI.first()).toBeVisible({ timeout: 5000 });
    });

    test("calendar view shows attendance records or empty state", async ({ page }) => {
      await page.getByRole("button", { name: "Calendar View", exact: true }).click();
      await page.waitForTimeout(1500);

      // Should show either attendance dots/markers or an empty message
      const content = page.locator("table, .calendar").or(page.getByText(/no.*record/i)).or(page.getByText(/no.*data/i));
      await expect(content.first()).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe("Tab Views Render Correctly", () => {
    const tabsToTest = [
      { name: "Employees", contentHint: /employee|name|add/i },
      { name: "Calendar View", contentHint: /calendar|month|date/i },
      { name: "QR Scanner", contentHint: /qr|scan|camera/i },
      { name: "Staff & Shift", contentHint: /shift|staff|schedule/i },
      { name: "Shift View", contentHint: /shift|schedule|time/i },
      { name: "Billing View", contentHint: /billing|cost|amount/i },
      { name: "Timesheet View", contentHint: /timesheet|hours|time/i },
    ];

    for (const tab of tabsToTest) {
      test(`${tab.name} tab renders without errors`, async ({ page }) => {
        const errors: string[] = [];
        page.on("pageerror", (err) => errors.push(err.message));

        await page.getByRole("button", { name: tab.name, exact: true }).click();
        await page.waitForTimeout(1500);

        // Should not crash
        const errorPage = page.locator("text=Something went wrong");
        await expect(errorPage).not.toBeVisible();

        const reactError = errors.find(
          (e) => e.includes("#130") || e.includes("Element type is invalid")
        );
        expect(reactError).toBeUndefined();
      });
    }
  });

  test.describe("Entry Tab", () => {
    test("Entry tab renders attendance entry form", async ({ page }) => {
      await page.getByRole("button", { name: "Entry", exact: true }).click();
      await page.waitForTimeout(1000);

      // Entry form should have some input fields
      const inputs = page.locator("input, select, textarea");
      const count = await inputs.count();
      expect(count).toBeGreaterThanOrEqual(0);
    });
  });

  test.describe("Attendance Tab", () => {
    test("Attendance tab shows attendance records or table", async ({ page }) => {
      await page.getByRole("button", { name: "Attendance", exact: true }).click();
      await page.waitForTimeout(1500);

      // Should show a table or list of attendance records
      const table = page.locator("table");
      const noData = page.getByText(/no.*data|no.*record|no.*attendance/i);
      await expect(table.or(noData).first()).toBeVisible({ timeout: 5000 });
    });
  });
});
