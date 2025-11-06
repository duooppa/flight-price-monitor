/**
 * Amex Points Redemption Calculator
 * Calculates optimal redemption strategies for American Express points
 */

export interface AmexRedemptionOption {
  method: "cash" | "points" | "hybrid";
  cashPrice: number; // in cents
  pointsRequired: number;
  pointsValue: number; // value per point in cents
  totalValue: number; // in cents
  savings: number; // in cents
  savingsPercent: number;
  recommendation: string;
}

export interface AmexCalculatorResult {
  cashPrice: number;
  bestOption: AmexRedemptionOption;
  allOptions: AmexRedemptionOption[];
  userPoints?: number;
  canAfford: boolean;
}

/**
 * Standard Amex points redemption rates for flights
 * These are typical rates; actual rates may vary by airline and route
 */
export const AMEX_REDEMPTION_RATES = {
  domestic: {
    economy: 12500, // 12,500 points for ~$150
    business: 50000, // 50,000 points for ~$600
  },
  international: {
    economy: 30000, // 30,000 points for ~$400
    business: 100000, // 100,000 points for ~$1500
  },
  unitedAirlines: {
    domestic: {
      economy: 12500,
      business: 50000,
    },
    international: {
      economy: 30000,
      business: 100000,
    },
  },
};

/**
 * Calculates the value per point based on cash price and points required
 */
export function calculatePointsValue(
  cashPrice: number,
  pointsRequired: number
): number {
  if (pointsRequired === 0) return 0;
  return (cashPrice / pointsRequired) * 100; // return value in cents per point
}

/**
 * Determines if a redemption is valuable (typically > 1 cent per point)
 */
export function isGoodRedemption(pointsValue: number): boolean {
  return pointsValue >= 100; // >= 1 cent per point
}

/**
 * Estimates points required based on cash price and route type
 */
export function estimatePointsRequired(
  cashPrice: number,
  routeType: "domestic" | "international" = "international",
  cabinClass: "economy" | "business" = "economy"
): number {
  // Typical redemption rates: 1 point = 0.8-1.5 cents
  // For international economy: typically 30,000-50,000 points for $400-600 flights
  
  const baseRate = routeType === "domestic" ? 0.008 : 0.01; // cents per point
  return Math.round(cashPrice / baseRate);
}

/**
 * Calculates all redemption options for a flight
 */
export function calculateRedemptionOptions(
  cashPrice: number,
  routeType: "domestic" | "international" = "international",
  cabinClass: "economy" | "business" = "economy",
  userPoints?: number
): AmexCalculatorResult {
  const pointsRequired = estimatePointsRequired(cashPrice, routeType, cabinClass);
  const pointsValue = calculatePointsValue(cashPrice, pointsRequired);

  const options: AmexRedemptionOption[] = [];

  // Option 1: Pure Cash
  options.push({
    method: "cash",
    cashPrice,
    pointsRequired: 0,
    pointsValue: 0,
    totalValue: cashPrice,
    savings: 0,
    savingsPercent: 0,
    recommendation: "Direct payment with credit card",
  });

  // Option 2: Pure Points
  const pointsOnlyValue = isGoodRedemption(pointsValue)
    ? cashPrice
    : cashPrice * 0.8; // If bad rate, value is lower
  options.push({
    method: "points",
    cashPrice,
    pointsRequired,
    pointsValue,
    totalValue: pointsOnlyValue,
    savings: pointsOnlyValue - cashPrice,
    savingsPercent: ((pointsOnlyValue - cashPrice) / cashPrice) * 100,
    recommendation: isGoodRedemption(pointsValue)
      ? "Excellent redemption value - use points!"
      : "Below average redemption rate - consider paying cash",
  });

  // Option 3: Hybrid (if points value is good, suggest partial redemption)
  if (isGoodRedemption(pointsValue) && userPoints && userPoints > 0) {
    const hybridPoints = Math.min(userPoints, pointsRequired);
    const hybridCash = cashPrice - (hybridPoints * pointsValue) / 100;
    const hybridValue = cashPrice; // Total value is same, but uses points

    options.push({
      method: "hybrid",
      cashPrice: hybridCash,
      pointsRequired: hybridPoints,
      pointsValue,
      totalValue: hybridValue,
      savings: (hybridPoints * pointsValue) / 100,
      savingsPercent: ((hybridPoints * pointsValue) / 100 / cashPrice) * 100,
      recommendation: `Use ${hybridPoints.toLocaleString()} points + $${(hybridCash / 100).toFixed(2)} cash`,
    });
  }

  // Determine best option
  let bestOption = options[0];
  for (const option of options) {
    if (option.totalValue > bestOption.totalValue) {
      bestOption = option;
    }
  }

  return {
    cashPrice,
    bestOption,
    allOptions: options,
    userPoints,
    canAfford: !userPoints || userPoints >= pointsRequired,
  };
}

/**
 * Compares redemption value across different routes
 */
export function compareRedemptionRates(
  flights: Array<{
    id: string;
    price: number;
    route: string;
    routeType: "domestic" | "international";
  }>
): Array<{
  id: string;
  price: number;
  route: string;
  pointsRequired: number;
  pointsValue: number;
  isGoodDeal: boolean;
}> {
  return flights.map((flight) => {
    const pointsRequired = estimatePointsRequired(
      flight.price,
      flight.routeType
    );
    const pointsValue = calculatePointsValue(flight.price, pointsRequired);

    return {
      id: flight.id,
      price: flight.price,
      route: flight.route,
      pointsRequired,
      pointsValue,
      isGoodDeal: isGoodRedemption(pointsValue),
    };
  });
}

/**
 * Calculates when to use points vs cash based on historical data
 */
export function getRedemptionRecommendation(
  pointsValue: number,
  historicalAverage: number = 100
): {
    recommendation: "use_points" | "use_cash" | "neutral";
    reason: string;
  } {
  const ratio = pointsValue / historicalAverage;

  if (ratio > 1.2) {
    return {
      recommendation: "use_points",
      reason: `Excellent value: ${(pointsValue / 100).toFixed(2)}¢ per point (${((ratio - 1) * 100).toFixed(0)}% above average)`,
    };
  } else if (ratio < 0.8) {
    return {
      recommendation: "use_cash",
      reason: `Poor value: ${(pointsValue / 100).toFixed(2)}¢ per point (${((1 - ratio) * 100).toFixed(0)}% below average)`,
    };
  } else {
    return {
      recommendation: "neutral",
      reason: `Average value: ${(pointsValue / 100).toFixed(2)}¢ per point`,
    };
  }
}

/**
 * Calculates the break-even point for points vs cash
 */
export function calculateBreakEvenPrice(
  pointsRequired: number,
  targetPointsValue: number = 100 // 1 cent per point
): number {
  // Break-even: pointsRequired * targetPointsValue = cashPrice
  return (pointsRequired * targetPointsValue) / 100;
}

/**
 * Formats Amex points value for display
 */
export function formatPointsValue(pointsValue: number): string {
  return `${(pointsValue / 100).toFixed(2)}¢ per point`;
}

/**
 * Formats points for display
 */
export function formatPoints(points: number): string {
  return points.toLocaleString();
}
