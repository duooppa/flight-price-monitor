import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, tinyint } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Flight routes and search tracking
export const routes = mysqlTable("routes", {
  id: int("id").autoincrement().primaryKey(),
  origin: varchar("origin", { length: 3 }).notNull(), // IATA code
  destination: varchar("destination", { length: 3 }).notNull(), // IATA code
  originName: text("originName"),
  destinationName: text("destinationName"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// Flight search sessions (for tracking polling results)
export const flightSearches = mysqlTable("flightSearches", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId"),
  sessionToken: varchar("sessionToken", { length: 255 }).unique(),
  origin: varchar("origin", { length: 3 }).notNull(),
  destination: varchar("destination", { length: 3 }).notNull(),
  departureDate: varchar("departureDate", { length: 10 }).notNull(),
  returnDate: varchar("returnDate", { length: 10 }),
  adults: int("adults").default(1),
  cabinClass: varchar("cabinClass", { length: 20 }).default("economy"),
  status: mysqlEnum("status", ["pending", "completed", "expired"]).default("pending"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  expiresAt: timestamp("expiresAt"),
});

// Individual flight itineraries
export const flights = mysqlTable("flights", {
  id: int("id").autoincrement().primaryKey(),
  searchId: int("searchId").notNull(),
  itineraryId: varchar("itineraryId", { length: 255 }).notNull(),
  price: int("price").notNull(), // in cents
  currency: varchar("currency", { length: 3 }).notNull(),
  isDirectFlight: int("isDirectFlight").notNull(), // 0 = false, 1 = true
  stopCount: int("stopCount").default(0),
  totalDuration: int("totalDuration"), // in minutes
  outboundDuration: int("outboundDuration"),
  returnDuration: int("returnDuration"),
  airline: varchar("airline", { length: 255 }),
  deepLink: text("deepLink"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// Flight legs (outbound and return)
export const flightLegs = mysqlTable("flightLegs", {
  id: int("id").autoincrement().primaryKey(),
  flightId: int("flightId").notNull(),
  legIndex: int("legIndex").notNull(), // 0 for outbound, 1 for return
  departure: timestamp("departure").notNull(),
  arrival: timestamp("arrival").notNull(),
  origin: varchar("origin", { length: 3 }).notNull(),
  destination: varchar("destination", { length: 3 }).notNull(),
  segmentCount: int("segmentCount").notNull(),
  duration: int("duration").notNull(), // in minutes
});

// Flight segments (individual stops)
export const flightSegments = mysqlTable("flightSegments", {
  id: int("id").autoincrement().primaryKey(),
  legId: int("legId").notNull(),
  segmentIndex: int("segmentIndex").notNull(),
  departure: timestamp("departure").notNull(),
  arrival: timestamp("arrival").notNull(),
  origin: varchar("origin", { length: 3 }).notNull(),
  destination: varchar("destination", { length: 3 }).notNull(),
  operatingCarrier: varchar("operatingCarrier", { length: 255 }),
  flightNumber: varchar("flightNumber", { length: 10 }),
  aircraft: varchar("aircraft", { length: 10 }),
  duration: int("duration").notNull(), // in minutes
});

// Price history for trend analysis
export const priceHistory = mysqlTable("priceHistory", {
  id: int("id").autoincrement().primaryKey(),
  flightId: int("flightId").notNull(),
  price: int("price").notNull(), // in cents
  currency: varchar("currency", { length: 3 }).notNull(),
  recordedAt: timestamp("recordedAt").defaultNow().notNull(),
});

// User saved routes
export const savedRoutes = mysqlTable("savedRoutes", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  origin: varchar("origin", { length: 3 }).notNull(),
  destination: varchar("destination", { length: 3 }).notNull(),
  originName: text("originName"),
  destinationName: text("destinationName"),
  name: varchar("name", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// Price alerts
export const priceAlerts = mysqlTable("priceAlerts", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  origin: varchar("origin", { length: 3 }).notNull(),
  destination: varchar("destination", { length: 3 }).notNull(),
  targetPrice: int("targetPrice").notNull(), // in cents
  currency: varchar("currency", { length: 3 }).notNull(),
  isActive: int("isActive").default(1), // 0 = false, 1 = true
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Route = typeof routes.$inferSelect;
export type FlightSearch = typeof flightSearches.$inferSelect;
export type Flight = typeof flights.$inferSelect;
export type FlightLeg = typeof flightLegs.$inferSelect;
export type FlightSegment = typeof flightSegments.$inferSelect;
export type PriceHistory = typeof priceHistory.$inferSelect;
export type SavedRoute = typeof savedRoutes.$inferSelect;
export type PriceAlert = typeof priceAlerts.$inferSelect;