import { and, eq, gte } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, flights, flightLegs, flightSegments, priceHistory, savedRoutes, priceAlerts, flightSearches } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Flight search and flight queries
export async function getFlightsBySearch(searchId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(flights).where(eq(flights.searchId, searchId));
}

export async function getFlightWithDetails(flightId: number) {
  const db = await getDb();
  if (!db) return null;
  
  const flight = await db.select().from(flights).where(eq(flights.id, flightId)).limit(1);
  if (!flight.length) return null;
  
  const legs = await db.select().from(flightLegs).where(eq(flightLegs.flightId, flightId));
  const segments = await Promise.all(
    legs.map(leg => db.select().from(flightSegments).where(eq(flightSegments.legId, leg.id)))
  );
  
  return { flight: flight[0], legs, segments };
}

export async function getPriceHistory(flightId: number, days: number = 7) {
  const db = await getDb();
  if (!db) return [];
  
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  return await db.select().from(priceHistory)
    .where(and(eq(priceHistory.flightId, flightId), gte(priceHistory.recordedAt, since)))
    .orderBy(priceHistory.recordedAt);
}

export async function getUserSavedRoutes(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(savedRoutes).where(eq(savedRoutes.userId, userId));
}

export async function getUserPriceAlerts(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(priceAlerts).where(eq(priceAlerts.userId, userId));
}

export async function createFlightSearch(search: {
  userId?: number;
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
  adults: number;
  cabinClass: string;
  sessionToken?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(flightSearches).values({
    userId: search.userId,
    origin: search.origin,
    destination: search.destination,
    departureDate: search.departureDate,
    returnDate: search.returnDate,
    adults: search.adults,
    cabinClass: search.cabinClass,
    sessionToken: search.sessionToken,
    status: "pending",
    expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
  });
  
  return result;
}

export async function insertFlight(flight: {
  searchId: number;
  itineraryId: string;
  price: number;
  currency: string;
  isDirectFlight: number;
  stopCount: number;
  totalDuration?: number;
  outboundDuration?: number;
  returnDuration?: number;
  airline?: string;
  deepLink?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.insert(flights).values(flight);
}

export async function recordPriceChange(flightId: number, price: number, currency: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.insert(priceHistory).values({ flightId, price, currency });
}

export async function saveSavedRoute(userId: number, route: {
  origin: string;
  destination: string;
  originName?: string;
  destinationName?: string;
  name?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.insert(savedRoutes).values({ userId, ...route });
}

export async function createPriceAlert(userId: number, alert: {
  origin: string;
  destination: string;
  targetPrice: number;
  currency: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.insert(priceAlerts).values({ userId, ...alert });
}
