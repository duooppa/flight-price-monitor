/**
 * Price Alert Service
 * Monitors flight prices and triggers alerts when targets are met
 */

import { notifyOwner } from "./_core/notification";
import { isPriceChangeSignificant } from "./flightUtils";

export interface PriceAlertEvent {
  alertId: number;
  userId: number;
  route: string; // "JFK-PVG"
  targetPrice: number; // in cents
  currentPrice: number; // in cents
  priceChange: number; // percentage
  timestamp: Date;
  flightLink?: string;
}

export interface AlertTriggerResult {
  triggered: boolean;
  reason?: string;
  event?: PriceAlertEvent;
}

/**
 * Checks if an alert should be triggered
 */
export function shouldTriggerAlert(
  currentPrice: number,
  targetPrice: number,
  previousPrice: number | null
): AlertTriggerResult {
  // Alert triggers when current price is at or below target
  if (currentPrice <= targetPrice) {
    return {
      triggered: true,
      reason: `Price dropped to $${(currentPrice / 100).toFixed(2)}, below target of $${(targetPrice / 100).toFixed(2)}`,
    };
  }

  // Also trigger if price dropped significantly (5%+) from previous
  if (
    previousPrice !== null &&
    isPriceChangeSignificant(currentPrice, previousPrice, 5)
  ) {
    const changePercent = ((currentPrice - previousPrice) / previousPrice) * 100;
    if (changePercent < 0) {
      return {
        triggered: true,
        reason: `Price dropped ${Math.abs(changePercent).toFixed(1)}% to $${(currentPrice / 100).toFixed(2)}`,
      };
    }
  }

  return { triggered: false };
}

/**
 * Creates a price alert event
 */
export function createAlertEvent(
  alertId: number,
  userId: number,
  route: string,
  targetPrice: number,
  currentPrice: number,
  previousPrice: number | null,
  flightLink?: string
): PriceAlertEvent {
  const priceChange = previousPrice
    ? ((currentPrice - previousPrice) / previousPrice) * 100
    : 0;

  return {
    alertId,
    userId,
    route,
    targetPrice,
    currentPrice,
    priceChange,
    timestamp: new Date(),
    flightLink,
  };
}

/**
 * Formats alert notification message
 */
export function formatAlertMessage(event: PriceAlertEvent): string {
  const currentPriceStr = `$${(event.currentPrice / 100).toFixed(2)}`;
  const targetPriceStr = `$${(event.targetPrice / 100).toFixed(2)}`;
  const savings = Math.max(0, event.targetPrice - event.currentPrice);
  const savingsStr = `$${(savings / 100).toFixed(2)}`;

  const message = `
Price Alert Triggered!

Route: ${event.route}
Current Price: ${currentPriceStr}
Target Price: ${targetPriceStr}
You Save: ${savingsStr}

Price Change: ${event.priceChange.toFixed(1)}%
Time: ${event.timestamp.toLocaleString()}

${event.flightLink ? `Book Now: ${event.flightLink}` : ""}
  `.trim();

  return message;
}

/**
 * Sends alert notification to owner
 */
export async function sendAlertNotification(
  event: PriceAlertEvent
): Promise<boolean> {
  try {
    const message = formatAlertMessage(event);
    const result = await notifyOwner({
      title: `Price Alert: ${event.route}`,
      content: message,
    });
    return result;
  } catch (error) {
    console.error("Failed to send alert notification:", error);
    return false;
  }
}

/**
 * Batch processes multiple price updates for alerts
 */
export async function processPriceUpdates(
  updates: Array<{
    alertId: number;
    userId: number;
    route: string;
    targetPrice: number;
    currentPrice: number;
    previousPrice: number | null;
    flightLink?: string;
  }>
): Promise<PriceAlertEvent[]> {
  const triggeredAlerts: PriceAlertEvent[] = [];

  for (const update of updates) {
    const result = shouldTriggerAlert(
      update.currentPrice,
      update.targetPrice,
      update.previousPrice
    );

    if (result.triggered) {
      const event = createAlertEvent(
        update.alertId,
        update.userId,
        update.route,
        update.targetPrice,
        update.currentPrice,
        update.previousPrice,
        update.flightLink
      );

      triggeredAlerts.push(event);

      // Send notification
      await sendAlertNotification(event);
    }
  }

  return triggeredAlerts;
}

/**
 * Calculates alert statistics
 */
export function calculateAlertStats(events: PriceAlertEvent[]): {
  totalAlerts: number;
  averageSavings: number;
  bestDeal: PriceAlertEvent | null;
  worstDeal: PriceAlertEvent | null;
} {
  if (events.length === 0) {
    return {
      totalAlerts: 0,
      averageSavings: 0,
      bestDeal: null,
      worstDeal: null,
    };
  }

  const totalSavings = events.reduce((sum, event) => {
    const savings = Math.max(0, event.targetPrice - event.currentPrice);
    return sum + savings;
  }, 0);
  const averageSavings = totalSavings / events.length;

  const bestDeal = events.reduce((best, current) =>
    Math.max(0, current.targetPrice - current.currentPrice) >
    Math.max(0, best.targetPrice - best.currentPrice)
      ? current
      : best
  );

  const worstDeal = events.reduce((worst, current) =>
    Math.max(0, current.targetPrice - current.currentPrice) <
    Math.max(0, worst.targetPrice - worst.currentPrice)
      ? current
      : worst
  );

  return {
    totalAlerts: events.length,
    averageSavings,
    bestDeal,
    worstDeal,
  };
}
