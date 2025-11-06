/**
 * Amadeus API Integration
 * Fetches real flight data from Amadeus free tier API
 */

export interface FlightOffer {
  id: string;
  source: string;
  instantTicketingRequired: boolean;
  nonHomogeneous: boolean;
  oneWay: boolean;
  lastTicketingDate: string;
  numberOfBookableSeats: number;
  itineraries: Itinerary[];
  price: {
    currency: string;
    total: string;
    base: string;
    fee: string;
    grandTotal: string;
  };
  pricingOptions: {
    fareType: string[];
    includedCheckedBagsOnly: boolean;
  };
  validatingAirlineCodes: string[];
  travelerPricings: Array<{
    travelerId: string;
    fareOption: string;
    travelerType: string;
    price: {
      currency: string;
      total: string;
      base: string;
    };
    fareDetailsBySegment: Array<{
      segmentId: string;
      cabin: string;
      fareBasis: string;
      class: string;
      includedCheckedBags: {
        weight: number;
        weightUnit: string;
      };
    }>;
  }>;
}

export interface Itinerary {
  duration: string;
  segments: Segment[];
}

export interface Segment {
  departure: {
    iataCode: string;
    terminal?: string;
    at: string;
  };
  arrival: {
    iataCode: string;
    terminal?: string;
    at: string;
  };
  carrierCode: string;
  number: string;
  aircraft: {
    code: string;
  };
  operating?: {
    carrierCode: string;
  };
  stops?: number;
  class?: string;
  isBlacklistedInEU?: boolean;
}

export interface TransformedFlight {
  id: string;
  airline: string;
  carrierCode: string;
  flightNumber: string;
  departure: {
    airport: string;
    time: string;
    date: string;
  };
  arrival: {
    airport: string;
    time: string;
    date: string;
  };
  stops: number;
  duration: string;
  durationMinutes: number;
  price: number; // in cents
  currency: string;
  cabin: string;
  aircraft: string;
  source: string;
  isDirectFlight: boolean;
}

/**
 * Get airline name from carrier code
 */
function getAirlineName(carrierCode: string): string {
  const airlineMap: { [key: string]: string } = {
    UA: "United Airlines",
    AA: "American Airlines",
    DL: "Delta Airlines",
    CA: "Air China",
    MU: "China Eastern",
    CZ: "China Southern",
    BA: "British Airways",
    LH: "Lufthansa",
    AF: "Air France",
    KL: "KLM",
    SQ: "Singapore Airlines",
    NH: "ANA",
    CX: "Cathay Pacific",
    QR: "Qatar Airways",
    EK: "Emirates",
    AC: "Air Canada",
    CO: "United (legacy)",
  };

  return airlineMap[carrierCode] || carrierCode;
}

/**
 * Parse ISO 8601 duration format (e.g., "PT10H30M")
 */
function parseDuration(duration: string): number {
  const regex = /PT(?:(\d+)H)?(?:(\d+)M)?/;
  const match = duration.match(regex);

  if (!match) return 0;

  const hours = parseInt(match[1] || "0", 10);
  const minutes = parseInt(match[2] || "0", 10);

  return hours * 60 + minutes;
}

/**
 * Format duration to readable string
 */
function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours === 0) return `${mins}m`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
}

/**
 * Transform Amadeus flight offer to our format
 */
export function transformFlightOffer(offer: FlightOffer): TransformedFlight[] {
  const flights: TransformedFlight[] = [];

  // Process each itinerary (outbound + return for round trips)
  offer.itineraries.forEach((itinerary, itineraryIndex) => {
    const segments = itinerary.segments;

    if (segments.length === 0) return;

    // Get first and last segment for departure/arrival
    const firstSegment = segments[0];
    const lastSegment = segments[segments.length - 1];

    // Calculate duration
    const durationMinutes = parseDuration(itinerary.duration);
    const durationString = formatDuration(durationMinutes);

    // Determine if direct flight
    const isDirectFlight = segments.length === 1;

    // Get cabin class from traveler pricing if available
    let cabin = "economy";
    if (offer.travelerPricings && offer.travelerPricings.length > 0) {
      const fareDetails = offer.travelerPricings[0].fareDetailsBySegment;
      if (fareDetails && fareDetails.length > 0) {
        cabin = fareDetails[0].cabin?.toLowerCase() || "economy";
      }
    }

    // Convert price to cents
    const priceInCents = Math.round(
      parseFloat(offer.price.grandTotal) * 100
    );

    const flight: TransformedFlight = {
      id: `${offer.id}-${itineraryIndex}`,
      airline: getAirlineName(firstSegment.carrierCode),
      carrierCode: firstSegment.carrierCode,
      flightNumber: firstSegment.number,
      departure: {
        airport: firstSegment.departure.iataCode,
        time: firstSegment.departure.at.split("T")[1] || "",
        date: firstSegment.departure.at.split("T")[0] || "",
      },
      arrival: {
        airport: lastSegment.arrival.iataCode,
        time: lastSegment.arrival.at.split("T")[1] || "",
        date: lastSegment.arrival.at.split("T")[0] || "",
      },
      stops: segments.length - 1,
      duration: durationString,
      durationMinutes,
      price: priceInCents,
      currency: offer.price.currency,
      cabin,
      aircraft: firstSegment.aircraft.code,
      source: "amadeus",
      isDirectFlight,
    };

    flights.push(flight);
  });

  return flights;
}

/**
 * Mock function to simulate Amadeus API call
 * In production, this would call the real Amadeus API
 */
export async function searchFlights(
  origin: string,
  destination: string,
  departureDate: string,
  returnDate?: string,
  adults: number = 1
): Promise<TransformedFlight[]> {
  // In production, you would call the real Amadeus API here:
  // const response = await fetch(`https://api.amadeus.com/v2/shopping/flight-offers?...`);

  // For now, we'll return mock data that looks realistic
  // This demonstrates the data structure and transformation

  const mockOffers: FlightOffer[] = [
    {
      id: "1",
      source: "GDS",
      instantTicketingRequired: false,
      nonHomogeneous: false,
      oneWay: !returnDate,
      lastTicketingDate: "2024-11-14",
      numberOfBookableSeats: 9,
      itineraries: [
        {
          duration: "PT16H30M",
          segments: [
            {
              departure: {
                iataCode: origin,
                at: `${departureDate}T14:30:00`,
              },
              arrival: {
                iataCode: destination,
                at: `${departureDate}T18:45:00+08:00`,
              },
              carrierCode: "UA",
              number: "888",
              aircraft: { code: "787" },
            },
          ],
        },
      ],
      price: {
        currency: "USD",
        total: "580.00",
        base: "500.00",
        fee: "0.00",
        grandTotal: "580.00",
      },
      pricingOptions: {
        fareType: ["PUBLISHED"],
        includedCheckedBagsOnly: true,
      },
      validatingAirlineCodes: ["UA"],
      travelerPricings: [
        {
          travelerId: "1",
          fareOption: "PUBLISHED",
          travelerType: "ADULT",
          price: {
            currency: "USD",
            total: "580.00",
            base: "500.00",
          },
          fareDetailsBySegment: [
            {
              segmentId: "1",
              cabin: "ECONOMY",
              fareBasis: "YLXF2AUSO",
              class: "Y",
              includedCheckedBags: {
                weight: 23,
                weightUnit: "KG",
              },
            },
          ],
        },
      ],
    },
    {
      id: "2",
      source: "GDS",
      instantTicketingRequired: false,
      nonHomogeneous: false,
      oneWay: !returnDate,
      lastTicketingDate: "2024-11-14",
      numberOfBookableSeats: 5,
      itineraries: [
        {
          duration: "PT18H45M",
          segments: [
            {
              departure: {
                iataCode: origin,
                at: `${departureDate}T08:00:00`,
              },
              arrival: {
                iataCode: "PVG",
                at: `${departureDate}T22:00:00+08:00`,
              },
              carrierCode: "UA",
              number: "889",
              aircraft: { code: "777" },
            },
            {
              departure: {
                iataCode: "PVG",
                at: `${departureDate}T23:30:00+08:00`,
              },
              arrival: {
                iataCode: destination,
                at: `${departureDate}T12:15:00+08:00`,
              },
              carrierCode: "UA",
              number: "890",
              aircraft: { code: "787" },
            },
          ],
        },
      ],
      price: {
        currency: "USD",
        total: "520.00",
        base: "450.00",
        fee: "0.00",
        grandTotal: "520.00",
      },
      pricingOptions: {
        fareType: ["PUBLISHED"],
        includedCheckedBagsOnly: true,
      },
      validatingAirlineCodes: ["UA"],
      travelerPricings: [
        {
          travelerId: "1",
          fareOption: "PUBLISHED",
          travelerType: "ADULT",
          price: {
            currency: "USD",
            total: "520.00",
            base: "450.00",
          },
          fareDetailsBySegment: [
            {
              segmentId: "1",
              cabin: "ECONOMY",
              fareBasis: "YLXF2AUSO",
              class: "Y",
              includedCheckedBags: {
                weight: 23,
                weightUnit: "KG",
              },
            },
            {
              segmentId: "2",
              cabin: "ECONOMY",
              fareBasis: "YLXF2AUSO",
              class: "Y",
              includedCheckedBags: {
                weight: 23,
                weightUnit: "KG",
              },
            },
          ],
        },
      ],
    },
    {
      id: "3",
      source: "GDS",
      instantTicketingRequired: false,
      nonHomogeneous: false,
      oneWay: !returnDate,
      lastTicketingDate: "2024-11-15",
      numberOfBookableSeats: 12,
      itineraries: [
        {
          duration: "PT16H00M",
          segments: [
            {
              departure: {
                iataCode: origin,
                at: `${departureDate}T10:00:00`,
              },
              arrival: {
                iataCode: destination,
                at: `${departureDate}T14:30:00+08:00`,
              },
              carrierCode: "CA",
              number: "888",
              aircraft: { code: "777" },
            },
          ],
        },
      ],
      price: {
        currency: "USD",
        total: "620.00",
        base: "550.00",
        fee: "0.00",
        grandTotal: "620.00",
      },
      pricingOptions: {
        fareType: ["PUBLISHED"],
        includedCheckedBagsOnly: true,
      },
      validatingAirlineCodes: ["CA"],
      travelerPricings: [
        {
          travelerId: "1",
          fareOption: "PUBLISHED",
          travelerType: "ADULT",
          price: {
            currency: "USD",
            total: "620.00",
            base: "550.00",
          },
          fareDetailsBySegment: [
            {
              segmentId: "1",
              cabin: "ECONOMY",
              fareBasis: "YLXF2AUSO",
              class: "Y",
              includedCheckedBags: {
                weight: 23,
                weightUnit: "KG",
              },
            },
          ],
        },
      ],
    },
  ];

  // Transform all offers
  const allFlights: TransformedFlight[] = [];
  mockOffers.forEach((offer) => {
    allFlights.push(...transformFlightOffer(offer));
  });

  // Sort by price
  allFlights.sort((a, b) => a.price - b.price);

  return allFlights;
}

/**
 * Get real-time price for a specific flight
 */
export async function getFlightPrice(
  flightId: string
): Promise<number | null> {
  // In production, this would fetch real-time pricing
  // For now, return mock data
  return Math.round(Math.random() * 100000 + 40000); // Random price between $400-$1400
}
