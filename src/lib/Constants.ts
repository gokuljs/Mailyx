import { Tier } from "./types";

export const FREE_CREDITS_PER_DAY = 15;
export const FREE_ACCOUNTS_PER_USER = 1;
export const PRO_ACCOUNTS_PER_USER = 3;

export const plans: Tier[] = [
  {
    id: "free",
    name: "Free Tier",
    price: "$0",
    description: "Great for getting started and trying basic features.",
    features: [
      "Sync 1 email account",
      "15 chats/day",
      "Last 30 days search",
      "Basic keyboard shortcuts",
    ],
    buttonText: "Start for Free",
    highlighted: false,
    buttonColor: "bg-gray-400/20",
  },
  {
    id: "monthly",
    name: "Pro Plan",
    price: "$25/mo",
    description: "Perfect for growing users needing unlimited access.",
    features: [
      "Sync up to 3 email accounts",
      "Unlimited AI Assistant",
      "Full AI Precision Search",
      "Priority Support",
    ],
    buttonText: "Subscribe to Pro",
    highlighted: true,
    buttonColor: "bg-orange-600",
    borderColor: "border-orange-300",
    priceId: process.env.PADDLE_MONTHLY_PRICE_ID,
  },
  {
    id: "annual",
    name: "Pro Plan Yearly",
    price: "$250/yr",
    description: "Best value - save 2 months on annual billing.",
    features: [
      "Sync up to 3 email accounts",
      "Unlimited AI Assistant",
      "Full AI Precision Search",
      "Priority Support",
      "2 months free",
      "Best for power users",
    ],
    buttonText: "Subscribe Yearly",
    highlighted: false,
    buttonColor: "bg-gray-400/20",
    priceId: process.env.PADDLE_YEARLY_PRICE_ID,
  },
];
