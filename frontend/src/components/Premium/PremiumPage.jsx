import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  Sparkles,
  BadgeCheck,
  Check,
  Zap,
  ShieldCheck,
  Crown,
  CreditCard,
  ArrowRight,
  RotateCcw,
  Star,
  CheckCircle2,
} from "lucide-react";
import axios from "../../contexts/axios";
import { setUser as setReduxUser } from "../../contexts/userSlice";
import toast from "react-hot-toast";

const PremiumPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const reduxUser = useSelector((state) => state.user);

  const [billingCycle, setBillingCycle] = useState("annual"); // "annual" | "monthly"
  const [selectedPlan, setSelectedPlan] = useState("premium"); // "basic" | "premium" | "premium_plus"
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [subStatus, setSubStatus] = useState(null);
  const [subscribing, setSubscribing] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("Apple Pay");

  // Fetch current subscription status
  const fetchStatus = async () => {
    try {
      setLoadingStatus(true);
      const res = await axios.get("/subscription/status");
      if (res.data?.data) {
        setSubStatus(res.data.data);
        if (res.data.data.isSubscribed) {
          setSelectedPlan(res.data.data.tier);
        }
      }
    } catch (err) {
      console.error("Failed to fetch subscription status", err);
    } finally {
      setLoadingStatus(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleSubscribe = async () => {
    try {
      setSubscribing(true);
      const res = await axios.post("/subscription/subscribe", {
        plan: selectedPlan,
        billingCycle,
        paymentMethod,
      });

      if (res.data?.data?.user) {
        dispatch(setReduxUser(res.data.data.user));
      }

      toast.success(res.data?.message || "Subscribed to X Premium successfully!", {
        icon: "🎉",
        duration: 4000,
      });

      setShowCheckout(false);
      await fetchStatus();
    } catch (err) {
      console.error("Subscription error", err);
      toast.error(err.response?.data?.message || "Failed to process subscription");
    } finally {
      setSubscribing(false);
    }
  };

  const handleCancel = async () => {
    if (!window.confirm("Are you sure you want to cancel your Premium subscription?")) return;
    try {
      setSubscribing(true);
      const res = await axios.post("/subscription/cancel");
      if (res.data?.data?.user) {
        dispatch(setReduxUser(res.data.data.user));
      }
      toast.success("Subscription cancelled. We'll miss you!", { icon: "👋" });
      await fetchStatus();
    } catch (err) {
      toast.error("Failed to cancel subscription");
    } finally {
      setSubscribing(false);
    }
  };

  const isCurrentPlan = (planKey) => {
    return subStatus?.isSubscribed && subStatus?.tier === planKey;
  };

  const plans = [
    {
      key: "basic",
      name: "Basic",
      tagline: "Essential tools for active creators",
      badgeType: null,
      monthlyPrice: 3,
      annualPrice: 32,
      perks: [
        "Small reply prioritization in threads",
        "Bookmark folders & organization",
        "Edit posts within 1 hour",
        "Rich text formatting (bold, italics)",
        "Highlights tab on your profile",
        "SMS 2-factor authentication",
      ],
      ctaText: "Subscribe to Basic",
      accent: "from-gray-700 to-gray-900",
      border: "border-gray-800",
      buttonClass: "bg-white/10 hover:bg-white/20 text-white",
    },
    {
      key: "premium",
      name: "Premium",
      tagline: "Everything you need to grow and get verified",
      badgeType: "blue",
      isPopular: true,
      monthlyPrice: 8,
      annualPrice: 84, // Save 12%
      perks: [
        "Verified Blue Checkmark badge",
        "2x Recommendation Algorithm boost (Heavy Ranker)",
        "Prioritized ranking in all conversations",
        "50% fewer ads across your feeds",
        "Edit posts within 1 hour",
        "Write posts up to 25,000 characters",
        "Creator analytics & audience insights",
        "Creator ad revenue sharing eligibility",
      ],
      ctaText: "Get Verified & Subscribe",
      accent: "from-[#1d9bf0]/20 via-[#1d9bf0]/10 to-transparent",
      border: "border-[#1d9bf0]",
      buttonClass: "bg-[#1d9bf0] hover:bg-[#1a8cd8] text-white shadow-lg shadow-[#1d9bf0]/25",
    },
    {
      key: "premium_plus",
      name: "Premium+",
      tagline: "The ultimate experience with zero compromises",
      badgeType: "gold",
      monthlyPrice: 16,
      annualPrice: 168,
      perks: [
        "Exclusive Gold Verified Checkmark badge",
        "Maximum Recommendation Algorithm boost",
        "Highest priority ranking in all conversations",
        "Zero ads in For You and Following feeds",
        "Full access to Grok AI Assistant",
        "Write full Articles and publications",
        "Largest reply boost multiplier",
        "All Premium features included",
      ],
      ctaText: "Upgrade to Premium+",
      accent: "from-[#e2b714]/20 via-[#e2b714]/10 to-transparent",
      border: "border-[#e2b714]/70",
      buttonClass: "bg-[#e2b714] hover:bg-[#cfa50e] text-black font-extrabold shadow-lg shadow-[#e2b714]/25",
    },
  ];

  return (
    <div className="min-h-screen text-white pb-20 select-none">
      {/* Top Banner */}
      <div className="sticky top-0 z-20 bg-black/85 backdrop-blur-md border-b border-[#24272c] px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-full bg-[#1d9bf0]/15 text-[#1d9bf0]">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-black">X Premium</h1>
            <p className="text-xs text-gray-400">Upgrade your voice, credibility, and reach</p>
          </div>
        </div>

        {subStatus?.isSubscribed && (
          <div className="flex items-center space-x-2 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded-full">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-xs font-bold text-emerald-400 capitalize">
              {subStatus.tier?.replace("_", "+")} Active
            </span>
          </div>
        )}
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* Hero Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-gray-300">
            <Crown className="w-3.5 h-3.5 text-[#e2b714]" />
            <span>Over 1,000+ creators and personalities verified</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
            Choose the right tier for you
          </h2>
          <p className="text-gray-400 text-sm max-w-lg mx-auto leading-relaxed">
            Get verified, boost your timeline rank in our Heavy Ranker algorithm, and unlock creator-exclusive superpowers.
          </p>

          {/* Billing Toggle */}
          <div className="pt-2 flex items-center justify-center">
            <div className="bg-[#16181c] p-1 rounded-full border border-[#24272c] inline-flex items-center space-x-1">
              <button
                onClick={() => setBillingCycle("annual")}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-200 flex items-center space-x-1.5 ${
                  billingCycle === "annual"
                    ? "bg-[#1d9bf0] text-white shadow-md"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                <span>Annual</span>
                <span className="bg-emerald-500 text-black text-[10px] font-black px-1.5 py-0.2 rounded-full uppercase">
                  Save 12%
                </span>
              </button>
              <button
                onClick={() => setBillingCycle("monthly")}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-200 ${
                  billingCycle === "monthly"
                    ? "bg-[#1d9bf0] text-white shadow-md"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                Monthly
              </button>
            </div>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {plans.map((p) => {
            const isSelected = selectedPlan === p.key;
            const isUserCurrent = isCurrentPlan(p.key);
            const price = billingCycle === "annual" ? Math.round(p.annualPrice / 12) : p.monthlyPrice;

            return (
              <div
                key={p.key}
                onClick={() => setSelectedPlan(p.key)}
                className={`relative rounded-3xl p-6 transition-all duration-300 cursor-pointer flex flex-col justify-between border ${
                  isSelected
                    ? `${p.border} bg-[#16181c] ring-2 ring-offset-2 ring-offset-black ${
                        p.key === "premium_plus"
                          ? "ring-[#e2b714]"
                          : p.key === "premium"
                          ? "ring-[#1d9bf0]"
                          : "ring-gray-700"
                      }`
                    : "border-[#24272c] bg-[#16181c]/60 hover:border-gray-600 hover:bg-[#16181c]"
                }`}
              >
                {/* Popular Pill */}
                {p.isPopular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#1d9bf0] text-white text-[11px] font-extrabold uppercase tracking-wider px-3 py-0.5 rounded-full shadow-lg">
                    Most Popular
                  </div>
                )}

                {/* Card Header */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1.5">
                      <h3 className="text-xl font-black text-white">{p.name}</h3>
                      {p.badgeType === "blue" && (
                        <BadgeCheck className="w-5 h-5 text-[#1d9bf0] fill-current" />
                      )}
                      {p.badgeType === "gold" && (
                        <BadgeCheck className="w-5 h-5 text-[#e2b714] fill-current" />
                      )}
                    </div>
                    {isUserCurrent && (
                      <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        Current
                      </span>
                    )}
                  </div>

                  <p className="text-gray-400 text-xs leading-relaxed min-h-[32px]">
                    {p.tagline}
                  </p>

                  {/* Price */}
                  <div className="pt-2 border-t border-[#24272c]">
                    <div className="flex items-baseline space-x-1">
                      <span className="text-3xl font-black text-white">${price}</span>
                      <span className="text-xs text-gray-400 font-medium">/ month</span>
                    </div>
                    <div className="text-[11px] text-gray-500 mt-0.5">
                      {billingCycle === "annual" ? `Billed annually at $${p.annualPrice}/yr` : "Billed monthly"}
                    </div>
                  </div>

                  {/* Perks List */}
                  <div className="pt-4 space-y-2.5">
                    <div className="text-xs font-bold text-gray-300 uppercase tracking-wider">
                      Included features:
                    </div>
                    <ul className="space-y-2">
                      {p.perks.map((perk, idx) => (
                        <li key={idx} className="flex items-start space-x-2 text-xs text-gray-300 leading-snug">
                          <Check className="w-3.5 h-3.5 text-[#1d9bf0] shrink-0 mt-0.5" />
                          <span>{perk}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Card Button */}
                <div className="pt-6 mt-4">
                  {isUserCurrent ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toast.success(`You are already enjoying ${p.name}!`);
                      }}
                      className="w-full py-2.5 rounded-full text-xs font-bold bg-white/10 text-white cursor-default"
                    >
                      Active Plan
                    </button>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedPlan(p.key);
                        setShowCheckout(true);
                      }}
                      className={`w-full py-2.5 rounded-full text-xs font-bold transition-all duration-200 active:scale-95 flex items-center justify-center space-x-1.5 ${p.buttonClass}`}
                    >
                      <span>{p.ctaText}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Feature Comparison Matrix */}
        <div className="bg-[#16181c] rounded-3xl p-6 border border-[#24272c] space-y-4">
          <h3 className="text-lg font-black text-white">Compare Plan Features</h3>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-[#24272c] text-gray-400">
                  <th className="py-3 px-2 font-bold">Feature</th>
                  <th className="py-3 px-2 text-center font-bold">Basic</th>
                  <th className="py-3 px-2 text-center font-bold text-[#1d9bf0]">Premium</th>
                  <th className="py-3 px-2 text-center font-bold text-[#e2b714]">Premium+</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#24272c]/40 text-gray-300">
                <tr>
                  <td className="py-3 px-2 font-medium">Verified Checkmark Badge</td>
                  <td className="py-3 px-2 text-center text-gray-600">—</td>
                  <td className="py-3 px-2 text-center text-[#1d9bf0] font-bold">Blue Checkmark</td>
                  <td className="py-3 px-2 text-center text-[#e2b714] font-bold">Gold Checkmark</td>
                </tr>
                <tr>
                  <td className="py-3 px-2 font-medium">Algorithm Heavy Ranker Boost</td>
                  <td className="py-3 px-2 text-center text-gray-400">1.0x (Standard)</td>
                  <td className="py-3 px-2 text-center text-white font-bold">2.0x Boost</td>
                  <td className="py-3 px-2 text-center text-[#e2b714] font-bold">Max (3.0x Boost)</td>
                </tr>
                <tr>
                  <td className="py-3 px-2 font-medium">Edit Post within 1 hour</td>
                  <td className="py-3 px-2 text-center text-emerald-400">✓</td>
                  <td className="py-3 px-2 text-center text-emerald-400">✓</td>
                  <td className="py-3 px-2 text-center text-emerald-400">✓</td>
                </tr>
                <tr>
                  <td className="py-3 px-2 font-medium">Prioritized Replies in Threads</td>
                  <td className="py-3 px-2 text-center text-gray-400">Small</td>
                  <td className="py-3 px-2 text-center text-white font-bold">High Priority</td>
                  <td className="py-3 px-2 text-center text-[#e2b714] font-bold">Top Priority</td>
                </tr>
                <tr>
                  <td className="py-3 px-2 font-medium">Feed Ad Reduction</td>
                  <td className="py-3 px-2 text-center text-gray-600">Standard</td>
                  <td className="py-3 px-2 text-center text-white">50% Fewer Ads</td>
                  <td className="py-3 px-2 text-center text-emerald-400 font-bold">100% Ad-Free</td>
                </tr>
                <tr>
                  <td className="py-3 px-2 font-medium">Post Character Limit</td>
                  <td className="py-3 px-2 text-center text-gray-400">280 chars</td>
                  <td className="py-3 px-2 text-center text-white font-bold">25,000 chars</td>
                  <td className="py-3 px-2 text-center text-white font-bold">25,000 chars + Articles</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Active Subscription Management */}
        {subStatus?.isSubscribed && (
          <div className="bg-[#16181c] rounded-2xl p-5 border border-[#24272c] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h4 className="text-sm font-bold text-white">Manage Active Membership</h4>
              <p className="text-xs text-gray-400 mt-0.5">
                Renews on{" "}
                {subStatus.expiresAt
                  ? new Date(subStatus.expiresAt).toLocaleDateString()
                  : "Next billing cycle"}
              </p>
            </div>
            <button
              disabled={subscribing}
              onClick={handleCancel}
              className="text-xs text-red-400 hover:text-red-300 border border-red-500/30 hover:border-red-500 px-4 py-2 rounded-full font-medium transition-colors"
            >
              Cancel Subscription
            </button>
          </div>
        )}
      </div>

      {/* Simulated Checkout Modal */}
      {showCheckout && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div
            className="bg-[#000000] border border-[#2f3336] rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-scaleUp p-6 space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#24272c] pb-3">
              <div className="flex items-center space-x-2">
                <div className="p-1.5 rounded-full bg-[#1d9bf0]/20 text-[#1d9bf0]">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-white text-base">Complete Subscription</h3>
              </div>
              <button
                onClick={() => setShowCheckout(false)}
                className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-white/10"
              >
                ✕
              </button>
            </div>

            {/* Selected Plan Summary */}
            <div className="p-4 rounded-2xl bg-[#16181c] border border-[#24272c] space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1.5 font-bold text-white">
                  <span>X {selectedPlan === "premium_plus" ? "Premium+" : selectedPlan === "premium" ? "Premium" : "Basic"}</span>
                  {selectedPlan === "premium_plus" ? (
                    <BadgeCheck className="w-4 h-4 text-[#e2b714] fill-current" />
                  ) : (
                    <BadgeCheck className="w-4 h-4 text-[#1d9bf0] fill-current" />
                  )}
                </div>
                <span className="text-lg font-black text-white">
                  ${billingCycle === "annual"
                    ? selectedPlan === "premium_plus" ? "168" : selectedPlan === "premium" ? "84" : "32"
                    : selectedPlan === "premium_plus" ? "16" : selectedPlan === "premium" ? "8" : "3"}
                  <span className="text-xs text-gray-400 font-normal">
                    {billingCycle === "annual" ? "/yr" : "/mo"}
                  </span>
                </span>
              </div>
              <p className="text-xs text-gray-400">
                Instant activation of Verified Badge and Recommendation Heavy Ranker boost.
              </p>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Select Payment Method
              </label>
              <div className="grid grid-cols-3 gap-2">
                {["Apple Pay", "Google Pay", "Credit Card"].map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setPaymentMethod(m)}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                      paymentMethod === m
                        ? "border-[#1d9bf0] bg-[#1d9bf0]/10 text-white"
                        : "border-[#24272c] text-gray-400 hover:border-gray-600"
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            {/* Confirm CTA */}
            <button
              disabled={subscribing}
              onClick={handleSubscribe}
              className="w-full py-3 rounded-full bg-white hover:bg-gray-200 text-black font-extrabold text-sm transition-all duration-200 shadow-lg active:scale-95 disabled:opacity-50"
            >
              {subscribing ? "Activating Verified Status..." : `Subscribe with ${paymentMethod}`}
            </button>

            <p className="text-[11px] text-gray-500 text-center leading-relaxed">
              By subscribing, you agree to Twitter's Terms of Service. Cancel anytime from your account settings.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PremiumPage;
