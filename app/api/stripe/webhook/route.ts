import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getStripe } from "@/lib/stripe";
import { env, isStripeConfigured } from "@/lib/env";
import type Stripe from "stripe";

export async function POST(request: NextRequest) {
  if (!isStripeConfigured() || !env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "stripe not configured" }, { status: 503 });
  }
  const sig = request.headers.get("stripe-signature");
  if (!sig) return NextResponse.json({ error: "no signature" }, { status: 400 });

  const stripe = getStripe();
  const raw = await request.text();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(raw, sig, env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 400 });
  }

  const admin = createAdminClient();

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = session.client_reference_id;
    if (userId) {
      const period =
        session.metadata?.plan === "yearly" ? 365 : 31;
      const expires = new Date(Date.now() + period * 86400 * 1000).toISOString();
      await admin
        .from("profiles")
        .update({ is_pro: true, pro_expires_at: expires })
        .eq("id", userId);
    }
  }

  if (event.type === "customer.subscription.deleted") {
    const sub = event.data.object as Stripe.Subscription;
    const userId = sub.metadata?.user_id;
    if (userId) {
      await admin
        .from("profiles")
        .update({ is_pro: false, pro_expires_at: null })
        .eq("id", userId);
    }
  }

  return NextResponse.json({ received: true });
}
