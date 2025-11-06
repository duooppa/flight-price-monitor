/**
 * Flight Intelligence Service
 * Provides insights on seat upgrades, delay risks, and travel optimization
 */

export interface UpgradeOpportunity {
  flightId: string;
  airline: string;
  route: string;
  currentCabin: "economy" | "premium_economy" | "business" | "first";
  upgradeProbability: number; // 0-1
  estimatedUpgradeValue: number; // in cents
  recommendation: string;
}

export interface DelayRiskAssessment {
  flightId: string;
  airline: string;
  route: string;
  delayRiskScore: number; // 0-100
  delayProbability: number; // 0-1
  averageDelay: number; // in minutes
  riskFactors: string[];
  recommendation: string;
}

export interface MilesAccumulation {
  basePoints: number;
  eliteBonus: number; // percentage
  promotionalBonus: number;
  totalPoints: number;
  pointsValue: number; // in cents
}

/**
 * Calculates upgrade probability based on various factors
 */
export function calculateUpgradeProbability(
  airline: string,
  flightDistance: number,
  bookingClass: string,
  daysUntilFlight: number,
  cabinLoadFactor: number // 0-1, how full the cabin is
): number {
  let probability = 0.3; // Base probability

  // Distance factor: longer flights have higher upgrade probability
  if (flightDistance > 3000) probability += 0.2;
  if (flightDistance > 5000) probability += 0.15;

  // Booking class factor: lower classes have higher upgrade probability
  if (bookingClass === "Y") probability += 0.2;
  if (bookingClass === "M") probability += 0.15;

  // Timing factor: upgrades more likely closer to flight
  if (daysUntilFlight < 7) probability += 0.15;
  if (daysUntilFlight < 3) probability += 0.1;

  // Cabin load factor: less full cabins have lower upgrade probability
  if (cabinLoadFactor < 0.7) probability -= 0.2;
  if (cabinLoadFactor > 0.9) probability += 0.15;

  // Airline factor
  if (airline === "United Airlines") probability += 0.1;

  return Math.min(1, Math.max(0, probability));
}

/**
 * Estimates upgrade value based on cabin upgrade
 */
export function estimateUpgradeValue(
  currentCabin: string,
  targetCabin: string,
  basePrice: number
): number {
  const upgradePremiums: { [key: string]: number } = {
    "economy_to_premium_economy": 0.3, // 30% of base price
    "economy_to_business": 1.5, // 150% of base price
    "economy_to_first": 2.5, // 250% of base price
    "premium_economy_to_business": 1.2,
    "premium_economy_to_first": 2.2,
    "business_to_first": 0.8,
  };

  const key = `${currentCabin}_to_${targetCabin}`;
  const premium = upgradePremiums[key] || 0;
  return Math.round(basePrice * premium);
}

/**
 * Detects upgrade opportunities
 */
export function detectUpgradeOpportunities(
  flights: Array<{
    id: string;
    airline: string;
    route: string;
    distance: number;
    bookingClass: string;
    daysUntilFlight: number;
    cabinLoadFactor: number;
    basePrice: number;
  }>
): UpgradeOpportunity[] {
  return flights.map((flight) => {
    const probability = calculateUpgradeProbability(
      flight.airline,
      flight.distance,
      flight.bookingClass,
      flight.daysUntilFlight,
      flight.cabinLoadFactor
    );

    const upgradeValue = estimateUpgradeValue(
      "economy",
      "business",
      flight.basePrice
    );

    let recommendation = "No upgrade expected";
    if (probability > 0.7) {
      recommendation = "High upgrade probability - check in early!";
    } else if (probability > 0.5) {
      recommendation = "Moderate upgrade chance - monitor seat map";
    }

    return {
      flightId: flight.id,
      airline: flight.airline,
      route: flight.route,
      currentCabin: "economy",
      upgradeProbability: probability,
      estimatedUpgradeValue: upgradeValue,
      recommendation,
    };
  });
}

/**
 * Calculates flight delay risk based on historical data
 */
export function calculateDelayRisk(
  airline: string,
  route: string,
  departureTime: Date,
  season: "peak" | "off-peak" = "off-peak"
): DelayRiskAssessment {
  let riskScore = 20; // Base risk
  const riskFactors: string[] = [];

  // Airline factor
  const airlineDelayRates: { [key: string]: number } = {
    "United Airlines": 15,
    "American Airlines": 18,
    "Delta Airlines": 14,
    "Southwest Airlines": 20,
    "China Eastern": 25,
    "Air China": 28,
    "China Southern": 26,
  };

  riskScore += airlineDelayRates[airline] || 20;
  if ((airlineDelayRates[airline] || 20) > 20) {
    riskFactors.push("Airline has higher than average delay rate");
  }

  // Route factor (international flights have higher risk)
  if (route.includes("PVG") || route.includes("SHA") || route.includes("PEI")) {
    riskScore += 15;
    riskFactors.push("International route to China has higher delay risk");
  }

  // Time factor
  const hour = departureTime.getHours();
  if (hour >= 6 && hour <= 9) {
    riskScore += 10;
    riskFactors.push("Early morning departure (higher congestion)");
  } else if (hour >= 17 && hour <= 20) {
    riskScore += 12;
    riskFactors.push("Evening departure (peak travel time)");
  }

  // Season factor
  if (season === "peak") {
    riskScore += 15;
    riskFactors.push("Peak travel season increases delay risk");
  }

  const delayProbability = Math.min(1, riskScore / 100);
  const averageDelay = Math.round(delayProbability * 45); // Up to 45 min average

  let recommendation = "Low delay risk - flight likely on time";
  if (riskScore > 70) {
    recommendation = "High delay risk - consider flexible plans";
  } else if (riskScore > 50) {
    recommendation = "Moderate delay risk - allow extra time";
  }

  return {
    flightId: `${airline}-${route}`,
    airline,
    route,
    delayRiskScore: Math.min(100, riskScore),
    delayProbability,
    averageDelay,
    riskFactors,
    recommendation,
  };
}

/**
 * Calculates miles accumulation for a flight
 */
export function calculateMilesAccumulation(
  distance: number,
  basePrice: number,
  eliteStatus: "none" | "silver" | "gold" | "platinum" | "1k" = "none",
  promotionMultiplier: number = 1
): MilesAccumulation {
  // Base calculation: typically 1 mile per mile flown, minimum 5,000 miles
  let basePoints = Math.max(5000, distance);

  // Elite bonuses
  const eliteBonuses: { [key: string]: number } = {
    none: 0,
    silver: 0.1,
    gold: 0.25,
    platinum: 0.5,
    "1k": 0.75,
  };

  const eliteBonus = Math.round(basePoints * (eliteBonuses[eliteStatus] || 0));

  // Promotional bonus
  const promotionalBonus = Math.round(basePoints * (promotionMultiplier - 1));

  const totalPoints = basePoints + eliteBonus + promotionalBonus;
  const pointsValue = Math.round((totalPoints / 30000) * 40000); // Rough conversion

  return {
    basePoints,
    eliteBonus,
    promotionalBonus,
    totalPoints,
    pointsValue,
  };
}

/**
 * Suggests hotel+flight combinations
 */
export function suggestHotelFlightCombos(
  flightPrice: number,
  destination: string,
  stayDays: number
): Array<{
  name: string;
  hotelPrice: number;
  totalPrice: number;
  savings: number;
  pointsRequired: number;
}> {
  // Typical hotel prices by destination
  const hotelRates: { [key: string]: number } = {
    "Shanghai": 15000, // $150/night
    "Beijing": 12000, // $120/night
    "Guangzhou": 10000, // $100/night
    "Chengdu": 8000, // $80/night
  };

  const nightly = hotelRates[destination] || 12000;
  const hotelTotal = nightly * stayDays;

  return [
    {
      name: "Budget Hotel + Flight",
      hotelPrice: Math.round(nightly * 0.7 * stayDays),
      totalPrice: flightPrice + Math.round(nightly * 0.7 * stayDays),
      savings: Math.round(nightly * 0.3 * stayDays),
      pointsRequired: Math.round((flightPrice + Math.round(nightly * 0.7 * stayDays)) / 100 * 30000 / 400),
    },
    {
      name: "Mid-Range Hotel + Flight",
      hotelPrice: hotelTotal,
      totalPrice: flightPrice + hotelTotal,
      savings: 0,
      pointsRequired: Math.round((flightPrice + hotelTotal) / 100 * 30000 / 400),
    },
    {
      name: "Premium Hotel + Flight",
      hotelPrice: Math.round(nightly * 1.5 * stayDays),
      totalPrice: flightPrice + Math.round(nightly * 1.5 * stayDays),
      savings: -Math.round(nightly * 0.5 * stayDays),
      pointsRequired: Math.round((flightPrice + Math.round(nightly * 1.5 * stayDays)) / 100 * 30000 / 400),
    },
  ];
}
