import { test, expect } from "@playwright/test";

test.describe("Tasks Module", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/daily-updates");
    await expect(
      page.getByRole("heading", { name: "Daily Updates" }).first()
    ).toBeVisible({ timeout: 10000 });
  });

  test.describe("Navigation & Rendering", () => {
    test("daily updates page has Tasks tab", async ({ page }) => {
      await expect(page.getByRole("button", { name: "Tasks" })).toBeVisible();
    });

    test("clicking Tasks tab renders task list", async ({ page }) => {
      await page.getByRole("button", { name: "Tasks" }).click();

      await expect(page.getByText("Tasks").first()).toBeVisible();
      // Wait for either the task table or loading indicator
      const table = page.locator("table");
      const loading = page.getByText("Loading tasks...");
      await expect(table.or(loading)).toBeVisible({ timeout: 10000 });
    });

    test("task list shows table headers", async ({ page }) => {
      await page.getByRole("button", { name: "Tasks" }).click();

      // Wait for table to render (mock data loads quickly)
      await page.waitForTimeout(2000);

      await expect(page.getByText("TASK TITLE")).toBeVisible({ timeout: 5000 });
      await expect(page.getByText("STATUS")).toBeVisible();
      await expect(page.getByText("ASSIGNED TO")).toBeVisible();
      await expect(page.getByText("DUE DATE")).toBeVisible();
      await expect(page.getByText("PRIORITY")).toBeVisible();
      await expect(page.getByText("ACTIONS")).toBeVisible();
    });

    test("task list shows pagination", async ({ page }) => {
      await page.getByRole("button", { name: "Tasks" }).click();
      await page.waitForTimeout(2000);

      await expect(page.getByText(/Showing \d+ to \d+ of \d+ tasks/)).toBeVisible({ timeout: 5000 });
      await expect(page.getByRole("button", { name: "Previous" })).toBeVisible();
      await expect(page.getByRole("button", { name: "Next" })).toBeVisible();
    });
  });

  test.describe("Task Creation", () => {
    test("Add New Task tab renders form", async ({ page }) => {
      await page.getByRole("button", { name: "Tasks" }).click();
      await page.waitForTimeout(1000);

      // Click "Add New Task" sub-nav
      await page.getByRole("button", { name: "Add New Task" }).click();

      await expect(page.getByText("Task Title *")).toBeVisible({ timeout: 5000 });
      await expect(page.getByText("Due Date")).toBeVisible();
      await expect(page.getByText("Description")).toBeVisible();
      await expect(page.getByText("Department")).toBeVisible();
      await expect(page.getByText("Priority")).toBeVisible();
      await expect(page.getByText("Source")).toBeVisible();
    });

    test("task creation form validates required title", async ({ page }) => {
      await page.getByRole("button", { name: "Tasks" }).click();
      await page.waitForTimeout(1000);
      await page.getByRole("button", { name: "Add New Task" }).click();

      // Click Create Task without filling title
      await page.getByRole("button", { name: "Create Task" }).click();

      await expect(page.getByText("Title is required")).toBeVisible({ timeout: 3000 });
    });

    test("task creation form accepts input and creates task", async ({ page }) => {
      await page.getByRole("button", { name: "Tasks" }).click();
      await page.waitForTimeout(1000);
      await page.getByRole("button", { name: "Add New Task" }).click();

      // Fill in the task form
      const titleInput = page.locator("input").first();
      await titleInput.fill("E2E Test Task - Playwright");

      // Select priority
      const prioritySelect = page.locator("select").filter({ hasText: "Low" }).first();
      await prioritySelect.selectOption("High");

      // Click Create Task
      await page.getByRole("button", { name: "Create Task" }).click();

      // Should switch back to list view after creation
      await expect(page.getByText("View Tasks")).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe("Task Actions", () => {
    test("View Tasks sub-nav shows task entries", async ({ page }) => {
      await page.getByRole("button", { name: "Tasks" }).click();
      await page.waitForTimeout(2000);

      // Should have task rows with action buttons
      const viewButtons = page.locator('button[title="View"]');
      await expect(viewButtons.first()).toBeVisible({ timeout: 5000 });
    });

    test("Bulk Upload button opens dialog", async ({ page }) => {
      await page.getByRole("button", { name: "Tasks" }).click();
      await page.waitForTimeout(1000);

      await page.getByRole("button", { name: "Bulk Upload" }).click();

      await expect(page.getByText("Bulk Upload Tasks")).toBeVisible({ timeout: 5000 });
      await expect(page.getByText("Excel Format Required")).toBeVisible();
    });
  });
});
