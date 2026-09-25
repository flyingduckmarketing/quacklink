export type Plan = "FREE" | "PREMIUM";

export const PLAN_LIMITS = {
  FREE: {
    maxLinks: 5,
    customThemeColors: false,
    backgroundImage: false,
    removeBranding: false,
    analytics: false,
  },
  PREMIUM: {
    maxLinks: Infinity,
    customThemeColors: true,
    backgroundImage: true,
    removeBranding: true,
    analytics: true,
  },
} as const;

export function limitsFor(plan: string) {
  return PLAN_LIMITS[plan === "PREMIUM" ? "PREMIUM" : "FREE"];
}

export function canAddLink(plan: string, currentLinkCount: number) {
  return currentLinkCount < limitsFor(plan).maxLinks;
}

export const PRICING = {
  FREE: {
    name: "Free",
    price: 0,
    features: [
      "Up to 5 links",
      "Basic theme customization",
      "QuackLink branding",
    ],
  },
  PREMIUM: {
    name: "Premium",
    priceINR: 199, // per month, via Razorpay
    priceUSD: 3, // per month, via PayPal
    features: [
      "Unlimited links",
      "Full theme & color customization",
      "Custom background image",
      "Remove QuackLink branding",
      "Click analytics per link",
    ],
  },
};
