/**
 * Unified type exports
 * Import shared types from this single entry point.
 */

export type * from "../drizzle/schema";
export * from "./_core/errors";

// Extended types for queries that include computed fields
export type ArtistWithPortfolioCount = import("../drizzle/schema").Artist & {
  portfolioCount: number;
};
