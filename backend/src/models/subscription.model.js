import mongoose, { Schema } from "mongoose";

const subscriptionSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    plan: {
      type: String,
      enum: ["basic", "premium", "premium_plus"],
      required: true,
    },
    billingCycle: {
      type: String,
      enum: ["monthly", "annual"],
      default: "annual",
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: "USD",
    },
    status: {
      type: String,
      enum: ["active", "cancelled", "expired"],
      default: "active",
      index: true,
    },
    badgeType: {
      type: String,
      enum: ["blue", "gold"],
      default: "blue",
    },
    features: {
      type: [String],
      default: [],
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    paymentMethod: {
      type: String,
      default: "Credit Card (simulated)",
    },
  },
  {
    timestamps: true,
  }
);

export const Subscription =
  mongoose.models.Subscription || mongoose.model("Subscription", subscriptionSchema);
