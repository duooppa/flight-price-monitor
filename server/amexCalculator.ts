/**
 * Amex Points Redemption Calculator
 * Calculates optimal redemption strategies for American Express points
 */

export interface AmexRedemptionOption {
  method: "cash" | "points" | "hybrid";
  cashPrice: number; // in cents
  pointsRequired: number;
  pointsValue: number; // value per point in cents
  totalValue: number; // effective cost in cents after accounting for points value
  savings: number; // in cents compared to paying full cash price
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

const CENTS_PER_POINT: Record<
  "domestic" | "international",
  Record<"economy" | "business", number>
> = {
  domestic: {
    economy: 1.2,
    business: 1.2,
  },
  international: {
    economy: 1.33,
    business: 1.5,
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
  // cashPrice is provided in cents, so dividing by points gives the
  // effective cents-per-point rate for this redemption.
  return cashPrice / pointsRequired;
}

/**
 * Determines if a redemption is valuable (typically > 1 cent per point)
 */
export function isGoodRedemption(pointsValue: number): boolean {
  // A redemption is generally considered worthwhile if it clears ~1¢/point.
  return pointsValue >= 1;
}

/**
 * Estimates points required based on cash price and route type
 */
export function estimatePointsRequired(
  cashPrice: number,
  routeType: "domestic" | "international" = "international",
  cabinClass: "economy" | "business" = "economy"
): number {
  const centsPerPoint = CENTS_PER_POINT[routeType][cabinClass];
  const estimated = Math.round(cashPrice / centsPerPoint);

  // Ensure the estimate never drops below the typical published award charts.
  const chartBaseline = AMEX_REDEMPTION_RATES[routeType][cabinClass];
  return Math.max(chartBaseline, estimated);
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
  const typicalCentsPerPoint = CENTS_PER_POINT[routeType][cabinClass];

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
  const pointsOnlyValue = pointsRequired * typicalCentsPerPoint;
  options.push({
    method: "points",
    cashPrice,
    pointsRequired,
    pointsValue,
    totalValue: pointsOnlyValue,
    savings: cashPrice - pointsOnlyValue,
    savingsPercent: ((cashPrice - pointsOnlyValue) / cashPrice) * 100,
    recommendation: isGoodRedemption(pointsValue)
      ? "Excellent redemption value - use points!"
      : "Below average redemption rate - consider paying cash",
  });

  // Option 3: Hybrid (if points value is good, suggest partial redemption)
  if (isGoodRedemption(pointsValue) && userPoints && userPoints > 0) {
    const hybridPoints = Math.min(userPoints, pointsRequired);
    const redeemedValue = hybridPoints * pointsValue;
    const hybridCash = Math.max(0, cashPrice - Math.round(redeemedValue));
    const hybridPointCost = hybridPoints * typicalCentsPerPoint;
    const hybridTotalCost = hybridCash + hybridPointCost;
    const hybridSavings = cashPrice - hybridTotalCost;

    options.push({
      method: "hybrid",
      cashPrice: hybridCash,
      pointsRequired: hybridPoints,
      pointsValue,
      totalValue: hybridTotalCost,
      savings: hybridSavings,
      savingsPercent: (hybridSavings / cashPrice) * 100,
      recommendation: `Use ${hybridPoints.toLocaleString()} points + $${(hybridCash / 100).toFixed(2)} cash`,
    });
  }

  // Determine best option
  let bestOption = options[0];
  for (const option of options) {
    if (option.savings > bestOption.savings) {
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
  historicalAverage: number = 1
): {
    recommendation: "use_points" | "use_cash" | "neutral";
    reason: string;
  } {
  const ratio = pointsValue / historicalAverage;

  if (ratio > 1.2) {
    return {
      recommendation: "use_points",
      reason: `Excellent value: ${pointsValue.toFixed(2)}¢ per point (${((ratio - 1) * 100).toFixed(0)}% above average)`,
    };
  } else if (ratio < 0.8) {
    return {
      recommendation: "use_cash",
      reason: `Poor value: ${pointsValue.toFixed(2)}¢ per point (${((1 - ratio) * 100).toFixed(0)}% below average)`,
    };
  } else {
    return {
      recommendation: "neutral",
      reason: `Average value: ${pointsValue.toFixed(2)}¢ per point`,
    };
  }
}

/**
 * Calculates the break-even point for points vs cash
 */
export function calculateBreakEvenPrice(
  pointsRequired: number,
  targetPointsValue: number = 1 // 1 cent per point
): number {
  // Break-even: pointsRequired * targetPointsValue = cashPrice
  return pointsRequired * targetPointsValue;
}

/**
 * Formats Amex points value for display
 */
export function formatPointsValue(pointsValue: number): string {
  return `${pointsValue.toFixed(2)}¢ per point`;
}

/**
 * Formats points for display
 */
export function formatPoints(points: number): string {
  return points.toLocaleString();
}
