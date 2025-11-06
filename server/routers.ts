import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import { createFlightSearch, getFlightsBySearch, getFlightWithDetails, getPriceHistory, getUserSavedRoutes, saveSavedRoute, getUserPriceAlerts, createPriceAlert } from "./db";

export const appRouter = router({
  system: systemRouter,
  
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  flights: router({
    search: publicProcedure
      .input(z.object({
        origin: z.string().length(3),
        destination: z.string().length(3),
        departureDate: z.string(),
        returnDate: z.string().optional(),
        adults: z.number().int().min(1).default(1),
        cabinClass: z.string().default("economy"),
      }))
      .query(async ({ input }) => {
        try {
          const { searchFlights } = await import("./amadeus");
          const flights = await searchFlights(
            input.origin,
            input.destination,
            input.departureDate,
            input.returnDate,
            input.adults
          );
          
          const directFlights = flights.filter((f: any) => f.isDirectFlight);
          const connectingFlights = flights.filter((f: any) => !f.isDirectFlight);
          
          return {
            success: true,
            flights,
            directFlights,
            connectingFlights,
            total: flights.length,
            directCount: directFlights.length,
            connectingCount: connectingFlights.length,
          };
        } catch (error) {
          console.error("Flight search error:", error);
          return {
            success: false,
            flights: [],
            directFlights: [],
            connectingFlights: [],
            total: 0,
            directCount: 0,
            connectingCount: 0,
            error: "Failed to search flights",
          };
        }
      }),

    getResults: publicProcedure
      .input(z.object({ searchId: z.number() }))
      .query(async ({ input }) => {
        return await getFlightsBySearch(input.searchId);
      }),

    getDetails: publicProcedure
      .input(z.object({ flightId: z.number() }))
      .query(async ({ input }) => {
        return await getFlightWithDetails(input.flightId);
      }),

    getPriceHistory: publicProcedure
      .input(z.object({ flightId: z.number(), days: z.number().default(7) }))
      .query(async ({ input }) => {
        return await getPriceHistory(input.flightId, input.days);
      }),
  }),

  routes: router({
    getSaved: protectedProcedure
      .query(async ({ ctx }) => {
        return await getUserSavedRoutes(ctx.user.id);
      }),

    save: protectedProcedure
      .input(z.object({
        origin: z.string().length(3),
        destination: z.string().length(3),
        originName: z.string().optional(),
        destinationName: z.string().optional(),
        name: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        await saveSavedRoute(ctx.user.id, input);
        return { success: true };
      }),
  }),

  alerts: router({
    getActive: protectedProcedure
      .query(async ({ ctx }) => {
        return await getUserPriceAlerts(ctx.user.id);
      }),

    create: protectedProcedure
      .input(z.object({
        origin: z.string().length(3),
        destination: z.string().length(3),
        targetPrice: z.number().int(),
        currency: z.string().length(3),
      }))
      .mutation(async ({ input, ctx }) => {
        await createPriceAlert(ctx.user.id, input);
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
