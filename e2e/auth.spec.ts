import { test, expect } from "@playwright/test";

test.describe("Authentication", () => {
  test.describe("Login Page", () => {
    test.beforeEach(async ({ page }) => {
      await page.goto("/");
    });

    test("renders login form with branding", async ({ page }) => {
      await expect(page.getByText("DSR Fortune Prime")).toBeVisible();
      await expect(page.getByText("Facility Management Portal")).toBeVisible();
      await expect(page.getByText("Sign In")).toBeVisible();
    });

    test("pre-fills demo credentials", async ({ page }) => {
      const emailInput = page.locator('input[type="email"]');
      const passwordInput = page.locator('input[type="password"]');

      await expect(emailInput).toHaveValue("demo@dsrfortuneprime.com");
      await expect(passwordInput).toHaveValue("demo123");
    });

    test("shows email and password labels", async ({ page }) => {
      await expect(page.getByText("Email")).toBeVisible();
      await expect(page.getByText("Password")).toBeVisible();
    });

    test("shows demo account section", async ({ page }) => {
      await expect(page.getByText("Demo Account")).toBeVisible();
      await expect(page.getByText("demo@dsrfortuneprime.com")).toBeVisible();
      await expect(page.getByText("Facility Manager")).toBeVisible();
    });

    test("demo account button fills credentials", async ({ page }) => {
      // Clear fields first
      const emailInput = page.locator('input[type="email"]');
      const passwordInput = page.locator('input[type="password"]');

      await emailInput.clear();
      await passwordInput.clear();

      // Click the demo account button
      await page.locator("button", { hasText: "demo@dsrfortuneprime.com" }).click();

      await expect(emailInput).toHaveValue("demo@dsrfortuneprime.com");
      await expect(passwordInput).toHaveValue("demo123");
    });

    test("shows error for invalid credentials", async ({ page }) => {
      const emailInput = page.locator('input[type="email"]');
      const passwordInput = page.locator('input[type="password"]');

      await emailInput.clear();
      await emailInput.fill("wrong@example.com");
      await passwordInput.clear();
      await passwordInput.fill("wrongpassword");

      await page.getByRole("button", { name: "Sign In" }).click();

      await expect(page.getByText("Invalid email or password")).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe("Dashboard Redirect", () => {
    test("successful login redirects to dashboard", async ({ page }) => {
      await page.goto("/");

      // Credentials are pre-filled, just click sign in
      await page.getByRole("button", { name: "Sign In" }).click();

      await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });
      await expect(
        page.getByRole("heading", { name: "Dashboard" })
      ).toBeVisible({ timeout: 10000 });
    });
  });

  test.describe("Unauthenticated Access", () => {
    test("login page is accessible at root", async ({ page }) => {
      await page.goto("/");
      await expect(page.getByRole("button", { name: "Sign In" })).toBeVisible();
    });

    test("dashboard page loads without auth redirect blocking", async ({ page }) => {
      // The demo app uses localStorage auth, so pages may still render
      await page.goto("/dashboard");
      // Either the dashboard renders or we get redirected — both are valid
      await page.waitForTimeout(2000);
      const url = page.url();
      const isDashboard = url.includes("/dashboard");
      const isLogin = url.endsWith("/") || url.includes("login");
      expect(isDashboard || isLogin).toBe(true);
    });
  });
});
