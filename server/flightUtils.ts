/**
 * Flight data processing utilities
 * Handles direct vs connecting flight classification, price change detection, and data transformation
 */

export interface FlightData {
  id: string;
  airline: string;
  departure: Date;
  arrival: Date;
  duration: number; // in minutes
  price: number; // in cents
  currency: string;
  legs: FlightLeg[];
  deepLink?: string;
}

export interface FlightLeg {
  origin: string;
  destination: string;
  departure: Date;
  arrival: Date;
  segments: FlightSegment[];
  duration: number; // in minutes
}

export interface FlightSegment {
  origin: string;
  destination: string;
  departure: Date;
  arrival: Date;
  carrier: string;
  flightNumber: string;
  aircraft?: string;
  duration: number; // in minutes
}

/**
 * Determines if a flight is direct based on leg count
 * A direct flight has exactly 1 leg with 1 segment
 */
export function isDirectFlight(legs: FlightLeg[]): boolean {
  if (legs.length !== 1) return false;
  return legs[0].segments.length === 1;
}

/**
 * Counts the number of stops (connections) in a flight
 * Number of stops = total segments - 1
 */
export function countStops(legs: FlightLeg[]): number {
  const totalSegments = legs.reduce((sum, leg) => sum + leg.segments.length, 0);
  return Math.max(0, totalSegments - 1);
}

/**
 * Calculates total flight duration from legs
 */
export function calculateTotalDuration(legs: FlightLeg[]): number {
  return legs.reduce((sum, leg) => sum + leg.duration, 0);
}

/**
 * Extracts the primary airline from a flight (first operating carrier)
 */
export function getPrimaryAirline(legs: FlightLeg[]): string {
  if (legs.length === 0) return "Unknown";
  const firstSegment = legs[0].segments[0];
  return firstSegment?.carrier || "Unknown";
}

/**
 * Formats price for display (converts cents to dollars)
 */
export function formatPrice(priceCents: number, currency: string = "USD"): string {
  const dollars = priceCents / 100;
  return `${currency} $${dollars.toFixed(2)}`;
}

/**
 * Calculates price change percentage
 */
export function calculatePriceChange(
  currentPrice: number,
  previousPrice: number
): number {
  if (previousPrice === 0) return 0;
  return ((currentPrice - previousPrice) / previousPrice) * 100;
}

/**
 * Filters flights by type
 */
export function filterFlightsByType(
  flights: FlightData[],
  type: "all" | "direct" | "connecting"
): FlightData[] {
  if (type === "all") return flights;

  return flights.filter((flight) => {
    const isDirect = isDirectFlight(flight.legs);
    return type === "direct" ? isDirect : !isDirect;
  });
}

/**
 * Sorts flights by specified criteria
 */
export function sortFlights(
  flights: FlightData[],
  sortBy: "price" | "duration" | "departure"
): FlightData[] {
  const sorted = [...flights];

  switch (sortBy) {
    case "price":
      sorted.sort((a, b) => a.price - b.price);
      break;
    case "duration":
      sorted.sort((a, b) => a.duration - b.duration);
      break;
    case "departure":
      sorted.sort((a, b) => a.departure.getTime() - b.departure.getTime());
      break;
  }

  return sorted;
}

/**
 * Detects significant price changes
 * Returns true if price change exceeds threshold percentage
 */
export function isPriceChangeSignificant(
  currentPrice: number,
  previousPrice: number,
  thresholdPercent: number = 5
): boolean {
  if (previousPrice === 0) return false;
  const changePercent = Math.abs(calculatePriceChange(currentPrice, previousPrice));
  return changePercent >= thresholdPercent;
}

/**
 * Groups flights by airline
 */
export function groupFlightsByAirline(
  flights: FlightData[]
): Map<string, FlightData[]> {
  const grouped = new Map<string, FlightData[]>();

  flights.forEach((flight) => {
    const airline = getPrimaryAirline(flight.legs);
    if (!grouped.has(airline)) {
      grouped.set(airline, []);
    }
    grouped.get(airline)!.push(flight);
  });

  return grouped;
}

/**
 * Finds the best price among flights
 */
export function findBestPrice(flights: FlightData[]): number | null {
  if (flights.length === 0) return null;
  return Math.min(...flights.map((f) => f.price));
}

/**
 * Finds the fastest flight
 */
export function findFastestFlight(flights: FlightData[]): FlightData | null {
  if (flights.length === 0) return null;
  return flights.reduce((fastest, current) =>
    current.duration < fastest.duration ? current : fastest
  );
}

/**
 * Calculates average price of flights
 */
export function calculateAveragePrice(flights: FlightData[]): number {
  if (flights.length === 0) return 0;
  const sum = flights.reduce((total, flight) => total + flight.price, 0);
  return sum / flights.length;
}

/**
 * Generates a unique flight identifier for deduplication
 */
export function generateFlightId(flight: FlightData): string {
  const departure = flight.legs[0]?.departure.toISOString() || "";
  const arrival = flight.legs[flight.legs.length - 1]?.arrival.toISOString() || "";
  const airline = getPrimaryAirline(flight.legs);
  return `${airline}-${departure}-${arrival}-${flight.price}`;
}

/**
 * Validates flight data structure
 */
export function isValidFlightData(flight: any): flight is FlightData {
  return (
    flight &&
    typeof flight.id === "string" &&
    typeof flight.airline === "string" &&
    flight.departure instanceof Date &&
    flight.arrival instanceof Date &&
    typeof flight.duration === "number" &&
    typeof flight.price === "number" &&
    Array.isArray(flight.legs) &&
    flight.legs.length > 0
  );
}

/**
 * Extracts stopover cities from a flight
 */
export function getStopoverCities(flight: FlightData): string[] {
  const cities: string[] = [];

  flight.legs.forEach((leg) => {
    leg.segments.forEach((segment, index) => {
      if (index === 0) {
        cities.push(segment.origin);
      }
      cities.push(segment.destination);
    });
  });

  // Remove duplicates and return unique cities
  return Array.from(new Set(cities));
}

/**
 * Calculates layover duration between segments
 */
export function calculateLayoverDuration(
  arrivalTime: Date,
  departureTime: Date
): number {
  return (departureTime.getTime() - arrivalTime.getTime()) / (1000 * 60); // in minutes
}

/**
 * Checks if flight has long layover (> 4 hours)
 */
export function hasLongLayover(flight: FlightData): boolean {
  for (const leg of flight.legs) {
    for (let i = 0; i < leg.segments.length - 1; i++) {
      const layover = calculateLayoverDuration(
        leg.segments[i].arrival,
        leg.segments[i + 1].departure
      );
      if (layover > 240) return true; // 4 hours
    }
  }
  return false;
}
