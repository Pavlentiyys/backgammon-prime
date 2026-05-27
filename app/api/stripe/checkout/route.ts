import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe";
import { env, isStripeConfigured } from "@/lib/env";

export async function POST(request: NextRequest) {
  if (!isStripeConfigured()) {
    return NextResponse.json({ error: "Stripe не настроен" }, { status: 503 });
  }
  const body = (await request.json().catch(() => ({}))) as { plan?: "monthly" | "yearly" };
  const plan = body.plan ?? "monthly";
  const price = plan === "yearly" ? env.STRIPE_PRICE_YEARLY : env.STRIPE_PRICE_MONTHLY;
  if (!price) return NextResponse.json({ error: "price not configured" }, { status: 500 });

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const stripe = getStripe();
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price, quantity: 1 }],
    customer_email: user.email,
    client_reference_id: user.id,
    success_url: `${env.APP_URL}/me?upgraded=1`,
    cancel_url: `${env.APP_URL}/pricing?canceled=1`,
    subscription_data: { metadata: { user_id: user.id, plan } },
  });
  return NextResponse.json({ url: session.url });
}
