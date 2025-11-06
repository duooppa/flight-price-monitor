/**
 * Advanced Amex Points Optimizer
 * Multi-airline redemption strategy with real booking links
 */

export type Airline = "United" | "American" | "Delta" | "Air China" | "China Eastern" | "China Southern";
export type CabinClass = "economy" | "premium_economy" | "business" | "first";
export type Season = "low" | "standard" | "peak";

export interface AirlineRedemptionRate {
  airline: Airline;
  domesticEconomy: number; // points
  domesticBusiness: number;
  internationalEconomy: number;
  internationalBusiness: number;
  transferPartners: string[];
  bookingUrl: string;
  pointValueCents: number; // typical cents-per-point valuation
}

export interface RedemptionOption {
  airline: Airline;
  method: "cash" | "points" | "hybrid" | "transfer_partner";
  cashPrice: number; // in cents
  pointsRequired: number;
  pointsValue: number; // ¢ per point
  totalCost: number; // effective resource cost in cents (cash + point valuation)
  savings: number; // in cents compared to all-cash price
  savingsPercent: number;
  bookingUrl: string;
  recommendation: string;
  rank: number;
}

export interface OptimizationResult {
  flightId: string;
  origin: string;
  destination: string;
  cashPrice: number;
  season: Season;
  allOptions: RedemptionOption[];
  bestOption: RedemptionOption;
  topThree: RedemptionOption[];
  totalSavings: number;
  userPoints: number;
  canAfford: boolean;
}

/**
 * Comprehensive airline redemption rate database
 * Based on real Amex transfer partner rates and airline award charts
 */
export const AIRLINE_RATES: Record<Airline, AirlineRedemptionRate> = {
  United: {
    airline: "United",
    domesticEconomy: 12500,
    domesticBusiness: 50000,
    internationalEconomy: 30000,
    internationalBusiness: 100000,
    transferPartners: ["Singapore Airlines", "ANA", "Lufthansa"],
    bookingUrl: "https://www.united.com/en/us/",
    pointValueCents: 1.3,
  },
  American: {
    airline: "American",
    domesticEconomy: 10000,
    domesticBusiness: 45000,
    internationalEconomy: 25000,
    internationalBusiness: 90000,
    transferPartners: ["British Airways", "Cathay Pacific", "Qatar"],
    bookingUrl: "https://www.aa.com/",
    pointValueCents: 1.4,
  },
  Delta: {
    airline: "Delta",
    domesticEconomy: 11000,
    domesticBusiness: 55000,
    internationalEconomy: 28000,
    internationalBusiness: 110000,
    transferPartners: ["Virgin Atlantic", "Air France", "KLM"],
    bookingUrl: "https://www.delta.com/",
    pointValueCents: 1.2,
  },
  "Air China": {
    airline: "Air China",
    domesticEconomy: 8000,
    domesticBusiness: 32000,
    internationalEconomy: 20000,
    internationalBusiness: 80000,
    transferPartners: ["Oneworld Alliance"],
    bookingUrl: "https://www.airchina.com/",
    pointValueCents: 1.1,
  },
  "China Eastern": {
    airline: "China Eastern",
    domesticEconomy: 7500,
    domesticBusiness: 30000,
    internationalEconomy: 18000,
    internationalBusiness: 75000,
    transferPartners: ["SkyTeam Alliance"],
    bookingUrl: "https://www.ceair.com/",
    pointValueCents: 1.15,
  },
  "China Southern": {
    airline: "China Southern",
    domesticEconomy: 7000,
    domesticBusiness: 28000,
    internationalEconomy: 17000,
    internationalBusiness: 70000,
    transferPartners: ["SkyTeam Alliance"],
    bookingUrl: "https://www.csair.com/",
    pointValueCents: 1.2,
  },
};

/**
 * Determines season based on date
 */
export function determineSeason(departureDate: Date): Season {
  const month = departureDate.getMonth();
  const dayOfWeek = departureDate.getDay();

  // Peak season: holidays and summer (June-Aug, Nov-Dec, holidays)
  if ([5, 6, 7, 10, 11].includes(month) || [0, 6].includes(dayOfWeek)) {
    return "peak";
  }

  // Standard season: shoulder months
  if ([3, 4, 8, 9].includes(month)) {
    return "standard";
  }

  // Low season: Jan-Feb
  return "low";
}

/**
 * Gets base redemption points for a route
 */
export function getBaseRedemptionPoints(
  airline: Airline,
  isInternational: boolean,
  cabinClass: CabinClass
): number {
  const rates = AIRLINE_RATES[airline];

  if (cabinClass === "first") {
    return isInternational ? rates.internationalBusiness * 1.5 : rates.domesticBusiness * 1.5;
  }

  if (cabinClass === "business") {
    return isInternational ? rates.internationalBusiness : rates.domesticBusiness;
  }

  if (cabinClass === "premium_economy") {
    return isInternational ? rates.internationalEconomy * 1.3 : rates.domesticEconomy * 1.3;
  }

  // economy
  return isInternational ? rates.internationalEconomy : rates.domesticEconomy;
}

/**
 * Adjusts redemption points based on season
 */
export function adjustForSeason(basePoints: number, season: Season): number {
  const seasonMultipliers: Record<Season, number> = {
    low: 0.8, // 20% discount in low season
    standard: 1.0, // standard rate
    peak: 1.25, // 25% premium in peak season
  };

  return Math.round(basePoints * seasonMultipliers[season]);
}

/**
 * Calculates all redemption options for a flight
 */
export function calculateAllRedemptionOptions(
  flightId: string,
  origin: string,
  destination: string,
  cashPrice: number,
  isInternational: boolean,
  cabinClass: CabinClass,
  departureDate: Date,
  userAmexPoints: number
): OptimizationResult {
  const season = determineSeason(departureDate);
  const options: RedemptionOption[] = [];

  // Evaluate each airline
  for (const [airlineName, airlineRate] of Object.entries(AIRLINE_RATES)) {
    const airline = airlineName as Airline;

    // Option 1: Pure Cash
    options.push({
      airline,
      method: "cash",
      cashPrice,
      pointsRequired: 0,
      pointsValue: 0,
      totalCost: cashPrice,
      savings: 0,
      savingsPercent: 0,
      bookingUrl: `${airlineRate.bookingUrl}?origin=${origin}&destination=${destination}`,
      recommendation: "Direct payment with credit card",
      rank: 0,
    });

    // Option 2: Pure Points
    const basePoints = getBaseRedemptionPoints(airline, isInternational, cabinClass);
    const adjustedPoints = adjustForSeason(basePoints, season);
    const pointsValue = adjustedPoints === 0 ? 0 : cashPrice / adjustedPoints;
    const typicalPointCost = adjustedPoints * airlineRate.pointValueCents;

    options.push({
      airline,
      method: "points",
      cashPrice,
      pointsRequired: adjustedPoints,
      pointsValue,
      totalCost: typicalPointCost,
      savings: cashPrice - typicalPointCost,
      savingsPercent: ((cashPrice - typicalPointCost) / cashPrice) * 100,
      bookingUrl: `${airlineRate.bookingUrl}?origin=${origin}&destination=${destination}&awards=true`,
      recommendation: isGoodPointsValue(pointsValue)
        ? "Excellent value - use points!"
        : "Below average - consider cash",
      rank: 0,
    });

    // Option 3: Hybrid (if user has enough points)
    if (userAmexPoints > 0) {
      const hybridPoints = Math.min(userAmexPoints, adjustedPoints);
      const redeemedValue = hybridPoints * pointsValue;
      const hybridCash = Math.max(0, cashPrice - Math.round(redeemedValue));
      const hybridPointCost = hybridPoints * airlineRate.pointValueCents;
      const hybridTotalCost = hybridCash + hybridPointCost;

      options.push({
        airline,
        method: "hybrid",
        cashPrice: hybridCash,
        pointsRequired: hybridPoints,
        pointsValue,
        totalCost: hybridTotalCost,
        savings: cashPrice - hybridTotalCost,
        savingsPercent: ((cashPrice - hybridTotalCost) / cashPrice) * 100,
        bookingUrl: `${airlineRate.bookingUrl}?origin=${origin}&destination=${destination}&hybrid=true`,
        recommendation: `Use ${hybridPoints.toLocaleString()} points + $${(hybridCash / 100).toFixed(2)} cash`,
        rank: 0,
      });
    }

    // Option 4: Transfer Partner (if available)
    if (airlineRate.transferPartners.length > 0) {
      const partnerPoints = Math.round(adjustedPoints * 0.9); // Usually 10% cheaper via partners
      const partnerValue = partnerPoints === 0 ? 0 : cashPrice / partnerPoints;
      const partnerPointCost =
        partnerPoints * (airlineRate.pointValueCents * 0.9);

      options.push({
        airline,
        method: "transfer_partner",
        cashPrice,
        pointsRequired: partnerPoints,
        pointsValue: partnerValue,
        totalCost: partnerPointCost,
        savings: cashPrice - partnerPointCost,
        savingsPercent: ((cashPrice - partnerPointCost) / cashPrice) * 100,
        bookingUrl: `${airlineRate.bookingUrl}?origin=${origin}&destination=${destination}&partner=true`,
        recommendation: `Transfer to ${airlineRate.transferPartners[0]} for better value`,
        rank: 0,
      });
    }
  }

  // Sort by total cost (lowest first)
  options.sort((a, b) => a.totalCost - b.totalCost);

  // Assign ranks
  options.forEach((opt, idx) => {
    opt.rank = idx + 1;
  });

  const bestOption = options[0];
  const topThree = options.slice(0, 3);
  const totalSavings = bestOption.savings;

  return {
    flightId,
    origin,
    destination,
    cashPrice,
    season,
    allOptions: options,
    bestOption,
    topThree,
    totalSavings,
    userPoints: userAmexPoints,
    canAfford: userAmexPoints >= bestOption.pointsRequired,
  };
}

/**
 * Determines if points value is good (> 1.2¢ per point)
 */
export function isGoodPointsValue(pointsValue: number): boolean {
  return pointsValue >= 1.2; // >= 1.2 cents per point
}

/**
 * Generates booking URL with parameters
 */
export function generateBookingUrl(
  option: RedemptionOption,
  origin: string,
  destination: string,
  departureDate: string
): string {
  const url = new URL(option.bookingUrl);
  url.searchParams.set("origin", origin);
  url.searchParams.set("destination", destination);
  url.searchParams.set("departureDate", departureDate);
  url.searchParams.set("cabin", option.method === "cash" ? "economy" : "award");

  return url.toString();
}

/**
 * Calculates potential savings across all options
 */
export function calculateSavingsComparison(
  options: RedemptionOption[]
): {
  cheapestOption: RedemptionOption;
  savingsVsCash: number;
  savingsPercent: number;
} {
  if (options.length === 0) {
    throw new Error("No redemption options provided");
  }

  const cheapest = options.reduce((min, opt) =>
    opt.totalCost < min.totalCost ? opt : min
  );

  const cashOption = options.find((opt) => opt.method === "cash");
  const savings = (cashOption?.cashPrice || 0) - cheapest.totalCost;
  const savingsPercent = cashOption
    ? (savings / cashOption.cashPrice) * 100
    : 0;

  return {
    cheapestOption: cheapest,
    savingsVsCash: savings,
    savingsPercent,
  };
}

/**
 * Formats redemption option for display
 */
export function formatRedemptionOption(option: RedemptionOption): {
  title: string;
  subtitle: string;
  cost: string;
  value: string;
} {
  let title = `${option.airline} - ${option.method.toUpperCase()}`;
  let subtitle = "";
  let cost = "";
  let value = "";

  if (option.method === "cash") {
    subtitle = "Direct payment";
    cost = `$${(option.cashPrice / 100).toFixed(2)}`;
    value = "100% cash";
  } else if (option.method === "points") {
    subtitle = `${option.pointsRequired.toLocaleString()} points`;
    cost = `${option.pointsValue.toFixed(2)}¢/pt`;
    value = `Save $${(option.savings / 100).toFixed(2)}`;
  } else if (option.method === "hybrid") {
    subtitle = `${option.pointsRequired.toLocaleString()} pts + $${(option.cashPrice / 100).toFixed(2)}`;
    cost = `${option.pointsValue.toFixed(2)}¢/pt`;
    value = `Save $${(option.savings / 100).toFixed(2)}`;
  } else {
    subtitle = `Transfer to partner (${option.pointsRequired.toLocaleString()} pts)`;
    cost = `${option.pointsValue.toFixed(2)}¢/pt`;
    value = `Save $${(option.savings / 100).toFixed(2)}`;
  }

  return { title, subtitle, cost, value };
}
