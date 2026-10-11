import React, { useState } from "react";
import { X, Sparkles, TrendingUp, Users, Clock, Compass, ThumbsUp, ThumbsDown, Check } from "lucide-react";
import axios from "../../contexts/axios";
import toast from "react-hot-toast";

const AlgoInspectModal = ({ isOpen, onClose, post }) => {
  const [tuningTag, setTuningTag] = useState(null);
  const [tunedTags, setTunedTags] = useState({});

  if (!isOpen || !post) return null;

  const breakdown = post.scoreBreakdown || {
    topicScore: Math.round((post.algoScore || 10) * 0.4),
    clusterScore: 15,
    socialScore: 0,
    collabScore: 8,
    engagementScore: 18,
    recencyMultiplier: 0.92,
    finalScore: post.algoScore || 25,
    matchedTag: post.hashtags?.[0] || null,
    matchedClusterName: "Trending Topics",
  };

  const handleTune = async (tag, delta) => {
    try {
      setTuningTag(tag);
      await axios.post("/posts/recommendations/tune-topic", { tag, delta });
      setTunedTags((prev) => ({ ...prev, [tag]: delta > 0 ? "boosted" : "muted" }));
      toast.success(
        delta > 0
          ? `Boosted ${tag}! You'll see more posts like this.`
          : `Muted ${tag}! You'll see fewer posts like this.`
      );
    } catch (err) {
      console.error("Failed to tune topic", err);
      toast.error("Could not update recommendation preference");
    } finally {
      setTuningTag(null);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div
        className="bg-[#000000] border border-[#2f3336] rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-[#2f3336] flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 rounded-full bg-[#1d9bf0]/15 text-[#1d9bf0]">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-white font-bold text-base leading-tight">
                Recommendation Breakdown
              </h2>
              <p className="text-gray-500 text-xs">
                Real-time Heavy Ranker algorithm factors
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Post preview card */}
          <div className="p-3.5 rounded-xl bg-[#16181c] border border-[#2f3336]/60">
            <div className="flex items-center space-x-2 text-xs text-gray-400 mb-1">
              <span className="font-bold text-white">
                @{post.user?.userHandle || post.user?.username}
              </span>
              <span>·</span>
              <span className="text-[#1d9bf0] font-medium">
                {post.recommendationReason || "Suggested for you"}
              </span>
            </div>
            <p className="text-gray-200 text-sm line-clamp-2">
              {post.description}
            </p>
          </div>

          {/* Heavy Ranker Score Total */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-gradient-to-r from-[#1d9bf0]/10 to-transparent border border-[#1d9bf0]/20">
            <div>
              <div className="text-xs text-gray-400">Calculated Timeline Rank</div>
              <div className="text-2xl font-black text-white mt-0.5">
                {breakdown.finalScore}{" "}
                <span className="text-xs font-normal text-gray-500">pts</span>
              </div>
            </div>
            <div className="text-right">
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-[#1d9bf0]/20 text-[#1d9bf0]">
                ⚡ {breakdown.finalScore > 100 ? "High Affinity" : "Discovery"}
              </span>
            </div>
          </div>

          {/* Metric Meters */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Why this post ranked here
            </h3>

            {/* 1. Topic Match */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-gray-300 flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-[#1d9bf0]" />
                  Topic Affinity {breakdown.matchedTag ? `(${breakdown.matchedTag})` : ""}
                </span>
                <span className="font-semibold text-white">
                  +{breakdown.topicScore} pts
                </span>
              </div>
              <div className="w-full bg-[#202327] rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-[#1d9bf0] h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min((breakdown.topicScore / 250) * 100, 100)}%` }}
                />
              </div>
            </div>

            {/* 2. SimCluster Semantic Match */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-gray-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                  Semantic Cluster {breakdown.matchedClusterName ? `(${breakdown.matchedClusterName})` : ""}
                </span>
                <span className="font-semibold text-white">
                  +{breakdown.clusterScore} pts
                </span>
              </div>
              <div className="w-full bg-[#202327] rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-purple-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min((breakdown.clusterScore / 40) * 100, 100)}%` }}
                />
              </div>
            </div>

            {/* 3. Engagement Velocity */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-gray-300 flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                  Engagement Velocity & Discussion
                </span>
                <span className="font-semibold text-white">
                  +{breakdown.engagementScore} pts
                </span>
              </div>
              <div className="w-full bg-[#202327] rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min((breakdown.engagementScore / 40) * 100, 100)}%` }}
                />
              </div>
            </div>

            {/* 4. Collaborative & Social Graph */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-gray-300 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-amber-400" />
                  Social Graph & Collaborative Taste
                </span>
                <span className="font-semibold text-white">
                  +{(breakdown.socialScore || 0) + (breakdown.collabScore || 0)} pts
                </span>
              </div>
              <div className="w-full bg-[#202327] rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-amber-400 h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min((((breakdown.socialScore || 0) + (breakdown.collabScore || 0)) / 60) * 100, 100)}%`,
                  }}
                />
              </div>
            </div>

            {/* 5. Recency Decay */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-gray-300 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-rose-400" />
                  Recency Multiplier (48h Half-Life)
                </span>
                <span className="font-semibold text-white">
                  {breakdown.recencyMultiplier}x
                </span>
              </div>
              <div className="w-full bg-[#202327] rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-rose-400 h-full rounded-full transition-all duration-500"
                  style={{ width: `${(breakdown.recencyMultiplier || 1) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Interactive Tuning Controls */}
          {post.hashtags && post.hashtags.length > 0 && (
            <div className="pt-2 border-t border-[#2f3336]/60">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                Tune your algorithm for these topics
              </h3>
              <div className="flex flex-wrap gap-2">
                {post.hashtags.map((tag, idx) => {
                  const state = tunedTags[tag];
                  return (
                    <div
                      key={idx}
                      className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-[#16181c] border border-[#2f3336] text-xs text-gray-300"
                    >
                      <span className="font-medium text-white">{tag}</span>
                      {state ? (
                        <span className="text-[10px] text-emerald-400 flex items-center gap-0.5 ml-1">
                          <Check className="w-3 h-3" /> {state}
                        </span>
                      ) : (
                        <div className="flex items-center space-x-1 ml-1">
                          <button
                            disabled={tuningTag === tag}
                            onClick={() => handleTune(tag, 25)}
                            title="Show more posts with this hashtag"
                            className="p-1 hover:text-[#1d9bf0] text-gray-500 transition-colors"
                          >
                            <ThumbsUp className="w-3 h-3" />
                          </button>
                          <button
                            disabled={tuningTag === tag}
                            onClick={() => handleTune(tag, -40)}
                            title="Show fewer posts with this hashtag"
                            className="p-1 hover:text-red-400 text-gray-500 transition-colors"
                          >
                            <ThumbsDown className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-[#2f3336] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-sm font-bold bg-white text-black hover:bg-gray-200 rounded-full transition-colors"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};

export default AlgoInspectModal;
