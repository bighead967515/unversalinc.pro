/**
 * Stripe Products and Prices
 * Define your products and prices here for centralized management
 */

export const PRODUCTS = {
  BOOKING_DEPOSIT: {
    name: "Tattoo Booking Deposit",
    description: "Refundable deposit to secure your tattoo appointment",
    priceInCents: 5000, // $50.00
    currency: "usd",
  },
} as const;

export const SUBSCRIPTION_PRODUCTS = {
  PREMIUM_MONTHLY: {
    name: "Premium Artist Subscription",
    description: "Monthly premium subscription for tattoo artists",
    priceInCents: 2999, // $29.99
    currency: "usd",
    interval: "month",
    stripePriceId: process.env.STRIPE_PREMIUM_MONTHLY_PRICE_ID,
  },
  PREMIUM_YEARLY: {
    name: "Premium Artist Subscription",
    description: "Yearly premium subscription for tattoo artists",
    priceInCents: 29999, // $299.99
    currency: "usd",
    interval: "year",
    stripePriceId: process.env.STRIPE_PREMIUM_YEARLY_PRICE_ID,
  },
} as const;

export type ProductKey = keyof typeof PRODUCTS;
export type SubscriptionProductKey = keyof typeof SUBSCRIPTION_PRODUCTS;
