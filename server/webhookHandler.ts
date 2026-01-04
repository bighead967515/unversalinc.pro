import { Request, Response } from "express";
import { constructWebhookEvent } from "./stripe";
import * as db from "./db";
import { sendBookingPaymentReceipt, sendSubscriptionPaymentReceipt } from "./email";

export async function handleStripeWebhook(req: Request, res: Response) {
  const signature = req.headers["stripe-signature"];

  if (!signature || typeof signature !== "string") {
    console.error("[Webhook] Missing or invalid stripe-signature header");
    return res.status(400).send("Missing signature");
  }

  try {
    const event = await constructWebhookEvent(req.body, signature);

    console.log(`[Webhook] Received event: ${event.type} (${event.id})`);

    // Handle test events
    if (event.id.startsWith("evt_test_")) {
      console.log("[Webhook] Test event detected, returning verification response");
      return res.json({
        verified: true,
      });
    }

    // Handle real events
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as any;
        const bookingId = parseInt(session.metadata?.bookingId || "0");

        if (bookingId) {
          console.log(`[Webhook] Payment successful for booking ${bookingId}`);
          
          // Update booking with payment information
          await db.updateBooking(bookingId, {
            stripePaymentIntentId: session.payment_intent as string,
            depositAmount: session.amount_total,
            depositPaid: 1,
            status: "confirmed",
          });

          // Send payment receipt
          try {
            const booking = await db.getBookingById(bookingId);
            if (booking && booking.customerEmail) {
              const artist = await db.getArtistById(booking.artistId);
              if (artist) {
                await sendBookingPaymentReceipt(booking.customerEmail, {
                  customerName: booking.customerName,
                  artistName: artist.shopName,
                  shopName: artist.shopName,
                  appointmentDate: booking.preferredDate.toLocaleDateString(),
                  amount: (session.amount_total || 0) / 100, // Convert from cents
                  transactionId: session.payment_intent as string,
                  paymentDate: new Date().toLocaleDateString(),
                });
                console.log(`[Webhook] Payment receipt sent for booking ${bookingId}`);
              }
            }
          } catch (error) {
            console.error(`[Webhook] Failed to send payment receipt for booking ${bookingId}:`, error);
          }

          console.log(`[Webhook] Booking ${bookingId} updated successfully`);
        } else if (session.mode === 'subscription') {
          // Handle subscription checkout
          const artistId = parseInt(session.metadata?.artistId || "0");
          if (artistId) {
            console.log(`[Webhook] Subscription created for artist ${artistId}`);
            await db.updateArtist(artistId, {
              subscriptionTier: 'premium',
            });

            // Send subscription payment receipt
            try {
              const artist = await db.getArtistById(artistId);
              if (artist) {
                // Get user email from the artist (we'd need to join or modify the query)
                // For now, we'll skip the subscription receipt until we have user email access
                console.log(`[Webhook] Subscription receipt sending skipped - need user email access`);
              }
            } catch (error) {
              console.error(`[Webhook] Failed to send subscription receipt for artist ${artistId}:`, error);
            }

            console.log(`[Webhook] Artist ${artistId} upgraded to premium`);
          }
        }
        break;
      }

      case "customer.subscription.created": {
        const subscription = event.data.object as any;
        console.log(`[Webhook] Subscription created: ${subscription.id}`);
        // Subscription is handled in checkout.session.completed
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as any;
        console.log(`[Webhook] Subscription updated: ${subscription.id}`);
        // Handle subscription changes (upgrades/downgrades)
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as any;
        console.log(`[Webhook] Subscription cancelled: ${subscription.id}`);
        
        // Find the artist by subscription ID and downgrade to free
        // In a real implementation, you'd store subscription IDs in the database
        // For now, we'll handle this through the cancel endpoint
        break;
      }

      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object as any;
        console.log(`[Webhook] Payment intent succeeded: ${paymentIntent.id}`);
        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as any;
        console.error(`[Webhook] Payment failed: ${paymentIntent.id}`);
        break;
      }

      default:
        console.log(`[Webhook] Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error("[Webhook] Error processing webhook:", error);
    res.status(400).send(`Webhook Error: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}
