import "server-only";
import Stripe from "stripe";
import { env } from "./env";

export function getStripe(): Stripe {
  return new Stripe(env.STRIPE_SECRET_KEY, { apiVersion: "2026-04-22.dahlia" });
}
