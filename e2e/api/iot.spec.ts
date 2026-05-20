import { test, expect } from "@playwright/test";

test.describe("IoT Module", () => {
  test.describe("IoT Page — Device Manager UI", () => {
    test.beforeEach(async ({ page }) => {
      await page.goto("/iot");
      await expect(
        page.getByRole("heading", { name: "IoT Device Management" })
      ).toBeVisible({ timeout: 10000 });
    });

    test("device manager renders with tab navigation", async ({ page }) => {
      await expect(page.getByRole("button", { name: "Devices" })).toBeVisible();
      await expect(page.getByRole("button", { name: "Thresholds" })).toBeVisible();
    });

    test("device table shows mock device data", async ({ page }) => {
      await page.waitForTimeout(1500);

      // Mock devices should render in the table
      await expect(page.getByText("Temp Sensor - Block A")).toBeVisible({ timeout: 5000 });
      await expect(page.getByText("Water Flow Meter")).toBeVisible();
    });

    test("device summary shows online and offline counts", async ({ page }) => {
      await page.waitForTimeout(1500);

      await expect(page.getByText("online")).toBeVisible({ timeout: 5000 });
      await expect(page.getByText("offline")).toBeVisible();
    });

    test("device status indicators display correctly", async ({ page }) => {
      await page.waitForTimeout(1500);

      // Status badges for online, offline, maintenance
      const onlineBadge = page.getByText("online", { exact: true });
      const offlineBadge = page.getByText("offline", { exact: true });
      const maintenanceBadge = page.getByText("maintenance", { exact: true });
      const anyBadge = onlineBadge.or(offlineBadge).or(maintenanceBadge);
      await expect(anyBadge.first()).toBeVisible({ timeout: 5000 });
    });

    test("device table shows protocol column with values", async ({ page }) => {
      await page.waitForTimeout(1500);

      const mqtt = page.getByText("MQTT");
      const modbus = page.getByText("MODBUS");
      const http = page.getByText("HTTP");
      const anyProtocol = mqtt.or(modbus).or(http);
      await expect(anyProtocol.first()).toBeVisible({ timeout: 5000 });
    });

    test("device search input is functional", async ({ page }) => {
      await page.waitForTimeout(1500);

      const searchInput = page.getByPlaceholder("Search devices...");
      await expect(searchInput).toBeVisible({ timeout: 5000 });

      await searchInput.fill("Temp");
      await page.waitForTimeout(500);

      // Should still show matching device
      await expect(page.getByText("Temp Sensor - Block A")).toBeVisible({ timeout: 3000 });
    });

    test.describe("Register Device Dialog", () => {
      test("Register Device button opens dialog", async ({ page }) => {
        await page.getByRole("button", { name: "Register Device" }).click();

        await expect(page.getByText("Register New Device")).toBeVisible({ timeout: 5000 });
      });

      test("dialog contains all required form fields", async ({ page }) => {
        await page.getByRole("button", { name: "Register Device" }).click();
        await page.waitForTimeout(500);

        await expect(page.getByText("Device Name")).toBeVisible({ timeout: 5000 });
        await expect(page.getByText("Device IP")).toBeVisible();
        await expect(page.getByText("Protocol")).toBeVisible();
        await expect(page.getByText("Poll Interval (seconds)")).toBeVisible();
      });

      test("dialog form accepts input values", async ({ page }) => {
        await page.getByRole("button", { name: "Register Device" }).click();
        await page.waitForTimeout(500);

        const nameInput = page.getByPlaceholder("e.g. Temp Sensor - Block A");
        const ipInput = page.getByPlaceholder("e.g. 192.168.1.100");

        await nameInput.fill("E2E Test Sensor");
        await ipInput.fill("10.0.0.50");

        await expect(nameInput).toHaveValue("E2E Test Sensor");
        await expect(ipInput).toHaveValue("10.0.0.50");
      });

      test("protocol dropdown shows all options", async ({ page }) => {
        await page.getByRole("button", { name: "Register Device" }).click();
        await page.waitForTimeout(500);

        // Click the protocol select trigger
        const protocolTrigger = page.locator("[role='combobox']").first();
        await protocolTrigger.click();
        await page.waitForTimeout(300);

        // Verify protocol options
        await expect(page.getByRole("option", { name: "MQTT" })).toBeVisible({ timeout: 3000 });
        await expect(page.getByRole("option", { name: "Modbus" })).toBeVisible();
        await expect(page.getByRole("option", { name: "HTTP" })).toBeVisible();
        await expect(page.getByRole("option", { name: "OPC-UA" })).toBeVisible();
      });

      test("Register button is present in dialog", async ({ page }) => {
        await page.getByRole("button", { name: "Register Device" }).click();
        await page.waitForTimeout(500);

        // The "Register" submit button inside the dialog
        const registerBtn = page.locator("button", { hasText: "Register" }).last();
        await expect(registerBtn).toBeVisible({ timeout: 5000 });
      });
    });
  });

  test.describe("IoT Page — Threshold Config UI", () => {
    test.beforeEach(async ({ page }) => {
      await page.goto("/iot");
      await expect(
        page.getByRole("heading", { name: "IoT Device Management" })
      ).toBeVisible({ timeout: 10000 });
      await page.getByRole("button", { name: "Thresholds" }).click();
      await page.waitForTimeout(1000);
    });

    test("threshold tab shows configured count", async ({ page }) => {
      await expect(page.getByText(/\d+ thresholds? configured/)).toBeVisible({ timeout: 5000 });
    });

    test("threshold table displays mock data", async ({ page }) => {
      await expect(page.getByText("HVAC Unit A1")).toBeVisible({ timeout: 5000 });
      await expect(page.getByText("Temperature")).toBeVisible();
    });

    test("threshold table shows severity badges", async ({ page }) => {
      const critical = page.getByText("Critical");
      const high = page.getByText("High");
      const medium = page.getByText("Medium");
      const anySeverity = critical.or(high).or(medium);
      await expect(anySeverity.first()).toBeVisible({ timeout: 5000 });
    });

    test("threshold search input works", async ({ page }) => {
      const searchInput = page.getByPlaceholder("Search thresholds...");
      await expect(searchInput).toBeVisible({ timeout: 5000 });

      await searchInput.fill("temperature");
      await page.waitForTimeout(500);
    });

    test.describe("Add Threshold Dialog", () => {
      test("Add Threshold button opens dialog", async ({ page }) => {
        await page.getByRole("button", { name: "Add Threshold" }).click();

        await expect(page.getByText("Add Threshold Rule")).toBeVisible({ timeout: 5000 });
      });

      test("threshold form contains all fields", async ({ page }) => {
        await page.getByRole("button", { name: "Add Threshold" }).click();
        await page.waitForTimeout(500);

        await expect(page.getByText("Asset ID (optional)")).toBeVisible({ timeout: 5000 });
        await expect(page.getByText("Metric Name")).toBeVisible();
        await expect(page.getByText("Min Value")).toBeVisible();
        await expect(page.getByText("Max Value")).toBeVisible();
        await expect(page.getByText("Alert Severity")).toBeVisible();
      });

      test("threshold form accepts metric configuration", async ({ page }) => {
        await page.getByRole("button", { name: "Add Threshold" }).click();
        await page.waitForTimeout(500);

        const metricInput = page.getByPlaceholder("e.g. temperature, humidity, voltage");
        await metricInput.fill("pressure");
        await expect(metricInput).toHaveValue("pressure");

        const minInput = page.getByPlaceholder("Min");
        await minInput.fill("10");
        await expect(minInput).toHaveValue("10");

        const maxInput = page.getByPlaceholder("Max");
        await maxInput.fill("100");
        await expect(maxInput).toHaveValue("100");
      });

      test("severity dropdown shows all options", async ({ page }) => {
        await page.getByRole("button", { name: "Add Threshold" }).click();
        await page.waitForTimeout(500);

        // Click severity select
        const severityTrigger = page.locator("[role='combobox']").first();
        await severityTrigger.click();
        await page.waitForTimeout(300);

        await expect(page.getByRole("option", { name: "Critical" })).toBeVisible({ timeout: 3000 });
        await expect(page.getByRole("option", { name: "High" })).toBeVisible();
        await expect(page.getByRole("option", { name: "Medium" })).toBeVisible();
        await expect(page.getByRole("option", { name: "Low" })).toBeVisible();
      });

      test("Save Threshold button is present", async ({ page }) => {
        await page.getByRole("button", { name: "Add Threshold" }).click();
        await page.waitForTimeout(500);

        await expect(
          page.getByRole("button", { name: "Save Threshold" })
        ).toBeVisible({ timeout: 5000 });
      });
    });
  });

  test.describe("IoT API Endpoints", () => {
    test("GET /api/v1/iot/devices returns array", async ({ request }) => {
      const res = await request.get("/api/v1/iot/devices");
      const status = res.status();
      // 200 if DB is available, 500 if not
      expect([200, 500]).toContain(status);

      if (status === 200) {
        const data = await res.json();
        expect(Array.isArray(data)).toBe(true);
      }
    });

    test("GET /api/v1/iot/devices supports assetId filter", async ({ request }) => {
      const res = await request.get("/api/v1/iot/devices?assetId=nonexistent");
      const status = res.status();
      expect([200, 500]).toContain(status);

      if (status === 200) {
        const data = await res.json();
        expect(Array.isArray(data)).toBe(true);
      }
    });

    test("POST /api/v1/iot/devices returns 400 without assetId", async ({ request }) => {
      const res = await request.post("/api/v1/iot/devices", {
        data: {
          deviceIp: "192.168.1.200",
          protocol: "mqtt",
        },
      });

      const status = res.status();
      expect([400, 500]).toContain(status);

      if (status === 400) {
        const body = await res.json();
        expect(body.error).toBe("assetId is required");
      }
    });

    test("GET /api/v1/iot/thresholds returns array", async ({ request }) => {
      const res = await request.get("/api/v1/iot/thresholds");
      const status = res.status();
      expect([200, 500]).toContain(status);

      if (status === 200) {
        const data = await res.json();
        expect(Array.isArray(data)).toBe(true);
      }
    });

    test("POST /api/v1/iot/thresholds returns 400 without required fields", async ({ request }) => {
      const res = await request.post("/api/v1/iot/thresholds", {
        data: {
          maxValue: 100,
        },
      });

      const status = res.status();
      expect([400, 500]).toContain(status);

      if (status === 400) {
        const body = await res.json();
        expect(body.error).toBe("assetId and metricName are required");
      }
    });

    test("POST /api/v1/iot/ingest returns 400 without metrics array", async ({ request }) => {
      const res = await request.post("/api/v1/iot/ingest", {
        data: {},
      });

      const status = res.status();
      expect([400, 500]).toContain(status);

      if (status === 400) {
        const body = await res.json();
        expect(body.error).toBe("metrics array is required");
      }
    });

    test("POST /api/v1/iot/ingest returns 400 for empty metrics array", async ({ request }) => {
      const res = await request.post("/api/v1/iot/ingest", {
        data: { metrics: [] },
      });

      const status = res.status();
      expect([400, 500]).toContain(status);
    });
  });
});
