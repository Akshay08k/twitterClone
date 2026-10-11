import { asyncHandler, ApiError, ApiResponce } from "../utils/index.js";
import User from "../models/user.model.js";
import { Subscription } from "../models/subscription.model.js";

// Plans catalog and pricing
const PLANS_CONFIG = {
  basic: {
    name: "Basic",
    monthlyPrice: 3,
    annualPrice: 32,
    badge: null,
    perks: [
      "Small reply prioritization",
      "Bookmark folders",
      "Edit posts within 1 hour",
      "Format posts (bold, italics)",
      "Highlights tab on profile",
    ],
  },
  premium: {
    name: "Premium",
    monthlyPrice: 8,
    annualPrice: 84, // ~12% savings
    badge: "blue",
    perks: [
      "Verified Blue Checkmark badge",
      "2x Recommendation algorithm boost (Heavy Ranker)",
      "Prioritized ranking in conversations",
      "50% fewer sponsored ads in timeline",
      "Edit posts within 1 hour",
      "Post up to 25,000 characters",
      "Creator monetization eligibility",
    ],
  },
  premium_plus: {
    name: "Premium+",
    monthlyPrice: 16,
    annualPrice: 168,
    badge: "gold",
    perks: [
      "Exclusive Gold Verified badge",
      "Maximum Recommendation algorithm boost (Heavy Ranker)",
      "Highest priority ranking in all conversations",
      "Zero ads in For You and Following feeds",
      "Full access to Grok AI assistant",
      "Write articles & long-form publications",
      "All Premium benefits included",
    ],
  },
};

// GET /subscription/plans
export const getSubscriptionPlans = asyncHandler(async (req, res) => {
  return res.status(200).json(
    new ApiResponce(200, PLANS_CONFIG, "Subscription plans catalog fetched successfully")
  );
});

// GET /subscription/status
export const getSubscriptionStatus = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const [user, activeSubscription] = await Promise.all([
    User.findById(userId).select("username userHandle isVerified isPremium premiumTier verifiedBadgeType subscriptionExpiresAt"),
    Subscription.findOne({ user: userId, status: "active" }).sort({ createdAt: -1 }),
  ]);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const isExpired = user.subscriptionExpiresAt && new Date(user.subscriptionExpiresAt) < new Date();

  const statusData = {
    isSubscribed: user.isPremium && !isExpired,
    tier: isExpired ? "none" : user.premiumTier || "none",
    isVerified: isExpired ? false : !!user.isVerified,
    badgeType: isExpired ? "none" : user.verifiedBadgeType || "none",
    expiresAt: user.subscriptionExpiresAt,
    activePlanDetails: user.premiumTier && PLANS_CONFIG[user.premiumTier] ? PLANS_CONFIG[user.premiumTier] : null,
    subscriptionRecord: activeSubscription,
  };

  return res.status(200).json(
    new ApiResponce(200, statusData, "Subscription status retrieved successfully")
  );
});

// POST /subscription/subscribe
export const subscribeToPremium = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { plan = "premium", billingCycle = "annual", paymentMethod = "Apple Pay" } = req.body;

  if (!PLANS_CONFIG[plan]) {
    throw new ApiError(400, "Invalid subscription plan selected");
  }

  const planConfig = PLANS_CONFIG[plan];
  const isAnnual = billingCycle === "annual";
  const amount = isAnnual ? planConfig.annualPrice : planConfig.monthlyPrice;
  const durationDays = isAnnual ? 365 : 30;

  const now = new Date();
  const expiresAt = new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000);

  const badgeType = plan === "premium_plus" ? "gold" : plan === "premium" ? "blue" : "none";
  const isVerified = plan !== "basic";

  // 1. Update user record
  const updatedUser = await User.findByIdAndUpdate(
    userId,
    {
      isPremium: true,
      premiumTier: plan,
      isVerified,
      verifiedBadgeType: badgeType,
      subscriptionExpiresAt: expiresAt,
    },
    { new: true }
  ).select("-password -passwordHash -refreshToken");

  // 2. Mark previous active subscriptions as superseded
  await Subscription.updateMany(
    { user: userId, status: "active" },
    { status: "cancelled" }
  );

  // 3. Create active subscription record
  const newSubscription = await Subscription.create({
    user: userId,
    plan,
    billingCycle,
    amount,
    currency: "USD",
    status: "active",
    badgeType: badgeType === "none" ? "blue" : badgeType,
    features: planConfig.perks,
    startDate: now,
    expiresAt,
    paymentMethod,
  });

  return res.status(200).json(
    new ApiResponce(
      200,
      {
        user: updatedUser,
        subscription: newSubscription,
        message: `Welcome to X ${planConfig.name}! You are now verified.`,
      },
      "Subscribed successfully"
    )
  );
});

// POST /subscription/cancel
export const cancelSubscription = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  await User.findByIdAndUpdate(userId, {
    isPremium: false,
    premiumTier: "none",
    isVerified: false,
    verifiedBadgeType: "none",
    subscriptionExpiresAt: null,
  });

  await Subscription.updateMany(
    { user: userId, status: "active" },
    { status: "cancelled" }
  );

  const updatedUser = await User.findById(userId).select("-password -passwordHash -refreshToken");

  return res.status(200).json(
    new ApiResponce(
      200,
      { user: updatedUser },
      "Subscription cancelled successfully"
    )
  );
});
