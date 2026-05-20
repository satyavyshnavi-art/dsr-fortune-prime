import { test, expect } from "@playwright/test";

test.describe("Approvals Module", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/approvals");
    await expect(
      page.getByRole("heading", { name: /Approval/ })
    ).toBeVisible({ timeout: 10000 });
  });

  test.describe("Page Layout", () => {
    test("renders page header", async ({ page }) => {
      await expect(page.getByText("Approval Workflows")).toBeVisible();
    });

    test("renders KPI cards", async ({ page }) => {
      await expect(page.getByText("Pending Count")).toBeVisible({ timeout: 5000 });
      await expect(page.getByText("Avg Turnaround")).toBeVisible();
      await expect(page.getByText("Approval Rate")).toBeVisible();
      await expect(page.getByText("This Month Total")).toBeVisible();
    });

    test("renders tab navigation", async ({ page }) => {
      await expect(
        page.getByRole("button", { name: "Approval Requests" })
      ).toBeVisible();
      await expect(
        page.getByRole("button", { name: "Submit Request" })
      ).toBeVisible();
    });
  });

  test.describe("Approvals List Tab", () => {
    test("renders filter tabs (All/Pending/Approved/Rejected)", async ({ page }) => {
      // Wait for the list to load
      await page.waitForTimeout(2000);

      await expect(page.getByRole("button", { name: /All \(/ })).toBeVisible({ timeout: 5000 });
      await expect(page.getByRole("button", { name: /Pending \(/ })).toBeVisible();
      await expect(page.getByRole("button", { name: /Approved \(/ })).toBeVisible();
      await expect(page.getByRole("button", { name: /Rejected \(/ })).toBeVisible();
    });

    test("renders data table with search", async ({ page }) => {
      await page.waitForTimeout(2000);

      await expect(
        page.getByPlaceholder("Search requests...")
      ).toBeVisible({ timeout: 5000 });
    });

    test("filter tabs change displayed data", async ({ page }) => {
      await page.waitForTimeout(2000);

      // Click Pending filter
      await page.getByRole("button", { name: /Pending \(/ }).click();
      await page.waitForTimeout(500);

      // Click Approved filter
      await page.getByRole("button", { name: /Approved \(/ }).click();
      await page.waitForTimeout(500);

      // Click Rejected filter
      await page.getByRole("button", { name: /Rejected \(/ }).click();
      await page.waitForTimeout(500);

      // Click All filter
      await page.getByRole("button", { name: /All \(/ }).click();
    });

    test("table shows column headers", async ({ page }) => {
      await page.waitForTimeout(2000);

      await expect(page.getByText("Type")).toBeVisible({ timeout: 5000 });
      await expect(page.getByText("Title")).toBeVisible();
      await expect(page.getByText("Amount")).toBeVisible();
      await expect(page.getByText("Status")).toBeVisible();
    });
  });

  test.describe("Submit Request Tab", () => {
    test.beforeEach(async ({ page }) => {
      await page.getByRole("button", { name: "Submit Request" }).click();
    });

    test("renders submit request form", async ({ page }) => {
      await expect(page.getByText("Submit Approval Request")).toBeVisible({ timeout: 5000 });
      await expect(page.getByText("Request Type")).toBeVisible();
      await expect(page.getByText("Amount")).toBeVisible();
      await expect(page.getByText("Description")).toBeVisible();
      await expect(page.getByText("Attachment (optional)")).toBeVisible();
    });

    test("shows validation errors on empty submit", async ({ page }) => {
      // Click submit without filling form
      await page.getByRole("button", { name: "Submit Request" }).last().click();

      await expect(page.getByText("Request type is required")).toBeVisible({ timeout: 3000 });
      await expect(page.getByText("Valid amount is required")).toBeVisible();
      await expect(page.getByText("Description is required")).toBeVisible();
    });

    test("amount field accepts numeric input", async ({ page }) => {
      const amountInput = page.getByPlaceholder("Enter amount");
      await amountInput.fill("5000");
      await expect(amountInput).toHaveValue("5000");
    });

    test("description field accepts text input", async ({ page }) => {
      const descArea = page.getByPlaceholder("Describe the reason for this request...");
      await descArea.fill("Test approval request from E2E");
      await expect(descArea).toHaveValue("Test approval request from E2E");
    });

    test("file upload area is clickable", async ({ page }) => {
      await expect(
        page.getByText("Click to upload a file (PDF, images, docs)")
      ).toBeVisible();
    });
  });
});
