import React, { useState } from "react";
import { X, Sparkles, BadgeCheck, Check, ArrowRight, ShieldCheck } from "lucide-react";
import axios from "../../contexts/axios";
import { useDispatch } from "react-redux";
import { setUser as setReduxUser } from "../../contexts/userSlice";
import toast from "react-hot-toast";

const PremiumModal = ({ isOpen, onClose, onSubscribed }) => {
  const dispatch = useDispatch();
  const [selectedPlan, setSelectedPlan] = useState("premium"); // "basic" | "premium" | "premium_plus"
  const [billingCycle, setBillingCycle] = useState("annual");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubscribe = async () => {
    try {
      setIsSubmitting(true);
      const res = await axios.post("/subscription/subscribe", {
        plan: selectedPlan,
        billingCycle,
        paymentMethod: "Apple Pay",
      });

      if (res.data?.data?.user) {
        dispatch(setReduxUser(res.data.data.user));
      }

      toast.success(
        res.data?.message || `Subscribed to X ${selectedPlan === "premium_plus" ? "Premium+" : "Premium"}!`,
        { icon: "✨", duration: 4000 }
      );

      if (onSubscribed) onSubscribed(res.data.data);
      onClose();
    } catch (err) {
      console.error("Subscription failed", err);
      toast.error(err.response?.data?.message || "Failed to complete subscription");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn select-none">
      <div
        className="bg-[#000000] border border-[#2f3336] rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-[#24272c] flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 rounded-full bg-[#1d9bf0]/20 text-[#1d9bf0]">
              <Sparkles className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-white text-base">Subscribe to X Premium</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-white/10"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Header Copy */}
          <div className="text-center space-y-1.5">
            <h2 className="text-2xl font-black text-white">Upgrade your voice on Twitty</h2>
            <p className="text-xs text-gray-400">
              Get verified, 2x algorithm ranking boost, and exclusive creator features.
            </p>
          </div>

          {/* Billing Cycle Selector */}
          <div className="flex justify-center">
            <div className="bg-[#16181c] p-1 rounded-full border border-[#24272c] inline-flex items-center space-x-1">
              <button
                type="button"
                onClick={() => setBillingCycle("annual")}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                  billingCycle === "annual"
                    ? "bg-[#1d9bf0] text-white shadow"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                Annual <span className="text-emerald-400 text-[10px] ml-1">Save 12%</span>
              </button>
              <button
                type="button"
                onClick={() => setBillingCycle("monthly")}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                  billingCycle === "monthly"
                    ? "bg-[#1d9bf0] text-white shadow"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                Monthly
              </button>
            </div>
          </div>

          {/* Tier Selection Radio Cards */}
          <div className="space-y-3">
            {/* 1. Premium (Recommended) */}
            <div
              onClick={() => setSelectedPlan("premium")}
              className={`p-4 rounded-2xl border transition-all cursor-pointer relative ${
                selectedPlan === "premium"
                  ? "border-[#1d9bf0] bg-[#1d9bf0]/10 ring-1 ring-[#1d9bf0]"
                  : "border-[#24272c] bg-[#16181c] hover:border-gray-600"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center space-x-1.5 font-black text-white text-base">
                    <span>Premium</span>
                    <BadgeCheck className="w-4 h-4 text-[#1d9bf0] fill-current" />
                    <span className="text-[10px] bg-[#1d9bf0] text-white px-2 py-0.2 rounded-full uppercase tracking-wider font-extrabold ml-1">
                      Popular
                    </span>
                  </div>
                  <p className="text-xs text-gray-400">
                    Blue Checkmark · 2x Algorithm Boost · Edit Posts · Prioritized Replies
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-lg font-black text-white">
                    ${billingCycle === "annual" ? "7" : "8"}
                  </span>
                  <span className="text-xs text-gray-400 font-normal">/mo</span>
                </div>
              </div>
            </div>

            {/* 2. Premium+ (Gold Badge) */}
            <div
              onClick={() => setSelectedPlan("premium_plus")}
              className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                selectedPlan === "premium_plus"
                  ? "border-[#e2b714] bg-[#e2b714]/10 ring-1 ring-[#e2b714]"
                  : "border-[#24272c] bg-[#16181c] hover:border-gray-600"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center space-x-1.5 font-black text-white text-base">
                    <span>Premium+</span>
                    <BadgeCheck className="w-4 h-4 text-[#e2b714] fill-current" />
                  </div>
                  <p className="text-xs text-gray-400">
                    Gold Checkmark · Maximum Algorithm Boost · 100% Ad-Free · Grok AI
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-lg font-black text-white">
                    ${billingCycle === "annual" ? "14" : "16"}
                  </span>
                  <span className="text-xs text-gray-400 font-normal">/mo</span>
                </div>
              </div>
            </div>

            {/* 3. Basic */}
            <div
              onClick={() => setSelectedPlan("basic")}
              className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                selectedPlan === "basic"
                  ? "border-gray-400 bg-white/5 ring-1 ring-gray-400"
                  : "border-[#24272c] bg-[#16181c] hover:border-gray-600"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center space-x-1.5 font-black text-white text-base">
                    <span>Basic</span>
                  </div>
                  <p className="text-xs text-gray-400">
                    Edit Posts · Bookmark Folders · Small Reply Priority
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-lg font-black text-white">
                    ${billingCycle === "annual" ? "2.6" : "3"}
                  </span>
                  <span className="text-xs text-gray-400 font-normal">/mo</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Perks Summary */}
          <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1.5 text-xs text-gray-300">
            <div className="flex items-center space-x-2">
              <Check className="w-3.5 h-3.5 text-[#1d9bf0]" />
              <span>Instant activation & Blue/Gold badge next to your handle</span>
            </div>
            <div className="flex items-center space-x-2">
              <Check className="w-3.5 h-3.5 text-[#1d9bf0]" />
              <span>Prioritized placement in the Heavy Ranker recommendations</span>
            </div>
            <div className="flex items-center space-x-2">
              <Check className="w-3.5 h-3.5 text-[#1d9bf0]" />
              <span>Cancel anytime from settings with zero penalties</span>
            </div>
          </div>

          {/* Action CTA Button */}
          <button
            disabled={isSubmitting}
            onClick={handleSubscribe}
            className="w-full py-3 rounded-full bg-white hover:bg-gray-200 text-black font-extrabold text-sm transition-all duration-200 shadow-lg active:scale-95 disabled:opacity-50"
          >
            {isSubmitting
              ? "Verifying Membership..."
              : `Subscribe to ${selectedPlan === "premium_plus" ? "Premium+" : selectedPlan === "premium" ? "Premium" : "Basic"}`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PremiumModal;
