import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { assetIotData, iotThresholds, iotDevices, alerts, assets } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { z } from "zod";

const metricSchema = z.object({
  assetId: z.string().uuid(),
  deviceId: z.string().uuid().optional(),
  metricName: z.string().min(1).max(100),
  value: z.number(),
  unit: z.string().max(50).optional(),
  recordedAt: z.string().optional(),
});

const ingestSchema = z.object({
  metrics: z.array(metricSchema).min(1).max(1000),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = ingestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: parsed.error.issues[0].message } },
        { status: 400 }
      );
    }

    const { metrics } = parsed.data;
    const now = new Date();
    const alertsTriggered: string[] = [];
    let stored = 0;

    for (const metric of metrics) {
      // Store metric data
      await db.insert(assetIotData).values({
        assetId: metric.assetId,
        deviceId: metric.deviceId,
        metricName: metric.metricName,
        value: String(metric.value),
        unit: metric.unit,
        recordedAt: metric.recordedAt ? new Date(metric.recordedAt) : now,
      });
      stored++;

      // Update device lastSeenAt
      if (metric.deviceId) {
        await db
          .update(iotDevices)
          .set({ lastSeenAt: now })
          .where(eq(iotDevices.id, metric.deviceId));
      }

      // Check thresholds for this asset + metric
      const thresholds = await db
        .select()
        .from(iotThresholds)
        .where(
          and(
            eq(iotThresholds.assetId, metric.assetId),
            eq(iotThresholds.metricName, metric.metricName)
          )
        );

      for (const threshold of thresholds) {
        const min = threshold.minValue ? Number(threshold.minValue) : null;
        const max = threshold.maxValue ? Number(threshold.maxValue) : null;
        let breached = false;
        let message = "";

        if (min !== null && metric.value < min) {
          breached = true;
          message = `${metric.metricName} value ${metric.value} is below minimum threshold ${min}`;
        }
        if (max !== null && metric.value > max) {
          breached = true;
          message = `${metric.metricName} value ${metric.value} exceeds maximum threshold ${max}`;
        }

        if (breached) {
          const [asset] = await db
            .select({ facilityId: assets.facilityId })
            .from(assets)
            .where(eq(assets.id, metric.assetId))
            .limit(1);

          if (asset) {
            await db.insert(alerts).values({
              facilityId: asset.facilityId,
              category: "iot",
              severity: threshold.alertSeverity ?? "medium",
              title: `IoT Threshold Breach: ${metric.metricName}`,
              message,
              status: "unacknowledged",
              createdAt: now,
            });
            alertsTriggered.push(message);
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      metricsStored: stored,
      alertsTriggered: alertsTriggered.length,
      alerts: alertsTriggered,
    });
  } catch (error) {
    console.error("POST /api/v1/iot/ingest error:", error);
    return NextResponse.json(
      { error: "Failed to ingest IoT data" },
      { status: 500 }
    );
  }
}
