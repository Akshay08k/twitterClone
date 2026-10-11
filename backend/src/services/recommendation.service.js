import Post from "../models/post.model.js";
import { PostLikes } from "../models/postlikes.model.js";
import { Comment } from "../models/comments.model.js";
import { Bookmark } from "../models/bookmark.model.js";
import { Follower } from "../models/follower.model.js";
import { Block } from "../models/block.model.js";
import UserInteraction from "../models/userInteraction.model.js";

/**
 * Semantic Topic Taxonomy (SimClusters)
 * Clusters related tags together so affinity for one tag propagates semantically.
 */
export const SIM_CLUSTERS = [
  {
    id: "romance_chemistry",
    label: "Romance & Deep Connection",
    icon: "❤️",
    tags: [
      "#romance",
      "#chemistry",
      "#deepconnection",
      "#soultie",
      "#love",
      "#intimacy",
      "#romanticvibes",
      "#slowlove",
      "#moderndating",
      "#dating",
      "#truelove",
      "#safehaven",
      "#vulnerability",
      "#secretromance",
      "#lovelanguages",
      "#connection",
    ],
  },
  {
    id: "nightlife_secrets",
    label: "Nightlife & Midnight Thoughts",
    icon: "🌃",
    tags: [
      "#nightlife",
      "#midnightthoughts",
      "#2amthoughts",
      "#rain",
      "#slowjazz",
      "#midnightsecrets",
      "#afterhours",
      "#cityvibes",
      "#latenightthoughts",
    ],
  },
  {
    id: "lifestyle_travel",
    label: "Travel & Visual Aesthetics",
    icon: "✈️",
    tags: [
      "#wanderlust",
      "#travel",
      "#goldenhour",
      "#photography",
      "#film",
      "#adventure",
      "#explore",
      "#aesthetic",
    ],
  },
  {
    id: "culinary_coffee",
    label: "Culinary & Espresso Rituals",
    icon: "☕",
    tags: [
      "#pasta",
      "#espresso",
      "#italianfood",
      "#cooking",
      "#coffee",
      "#coffeeritual",
      "#foodie",
      "#chef",
    ],
  },
  {
    id: "fitness_mindset",
    label: "Fitness, Wellness & Drive",
    icon: "⚡",
    tags: [
      "#fitness",
      "#gym",
      "#workout",
      "#wellness",
      "#health",
      "#active",
      "#mindset",
      "#discipline",
    ],
  },
];

/**
 * Real Twitter/X Heavy Ranker Recommendation Engine 2.0
 * Features:
 * 1. SimClusters: Semantic Topic Taxonomy matching
 * 2. GraphJet: 2-Hop Collaborative Filtering via Co-Engagers
 * 3. Dynamic Engagement Velocity: Detects accelerating virality
 * 4. Recency Half-Life Decay (48h)
 * 5. Algorithmic Transparency: Detailed score breakdown for "Why am I seeing this?"
 * 6. Author Diversity & Exponential Fatigue Cooldown
 */
export async function getRecommendedFeed(userId, options = {}) {
  const { limit = 30, page = 1, excludeIds = [] } = options;

  // 1. Negative Signals & Constraints (Blocks, Dismissed Posts, Following Graph)
  const [blocks, dismissals, followings] = await Promise.all([
    Block.find({
      $or: [{ blocker: userId }, { blocked: userId }],
    }),
    UserInteraction.find({
      user: userId,
      type: "dismiss",
    }).select("post"),
    Follower.find({ follower: userId }).select("user"),
  ]);

  const blockedUserIds = new Set(
    blocks.map((b) =>
      b.blocker.toString() === userId.toString()
        ? b.blocked.toString()
        : b.blocker.toString()
    )
  );

  const dismissedPostIds = new Set(
    dismissals.filter((d) => d.post).map((d) => d.post.toString())
  );

  const followedUserIds = new Set(
    followings.map((f) => f.user.toString())
  );

  // 2. Build User Preference Profile (Tag Affinity & Author Affinity)
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const recentInteractions = await UserInteraction.find({
    user: userId,
    createdAt: { $gte: thirtyDaysAgo },
  }).limit(500);

  // Query user's explicit likes and bookmarks
  const [userLikes, userBookmarks] = await Promise.all([
    PostLikes.find({ user: userId }).select("post").limit(100),
    Bookmark.find({ user: userId }).select("post").limit(100),
  ]);

  const explicitPostIds = [
    ...userLikes.map((l) => l.post),
    ...userBookmarks.map((b) => b.post),
  ];

  const explicitPosts = await Post.find({
    _id: { $in: explicitPostIds },
  }).select("hashtags user");

  // Calculate Tag Affinity Vector & Author Affinity Vector
  const tagAffinity = new Map();
  const authorAffinity = new Map();

  const addTagScore = (tag, points) => {
    if (!tag) return;
    const clean = tag.toLowerCase().trim();
    tagAffinity.set(clean, (tagAffinity.get(clean) || 0) + points);
  };

  const addAuthorScore = (authorId, points) => {
    if (!authorId) return;
    const key = authorId.toString();
    authorAffinity.set(key, (authorAffinity.get(key) || 0) + points);
  };

  // Process explicit likes/bookmarks (high confidence: +10 tags, +8 author)
  for (const p of explicitPosts) {
    if (Array.isArray(p.hashtags)) {
      p.hashtags.forEach((t) => addTagScore(t, 10.0));
    }
    if (p.user) {
      addAuthorScore(p.user, 8.0);
    }
  }

  // Process logged interactions (dwells, clicks, searches, dismissals)
  for (const inter of recentInteractions) {
    const w = inter.weight || 1.0;
    if (Array.isArray(inter.hashtags)) {
      inter.hashtags.forEach((t) => addTagScore(t, w));
    }
    if (inter.author) {
      addAuthorScore(inter.author, w * 0.7);
    }
  }

  // Calculate SimCluster affinity scores based on user's tag affinity
  const clusterAffinity = new Map();
  for (const cluster of SIM_CLUSTERS) {
    let score = 0;
    for (const tag of cluster.tags) {
      score += tagAffinity.get(tag) || 0;
    }
    if (score !== 0) {
      clusterAffinity.set(cluster.id, score);
    }
  }

  // 3. Multi-Source Candidate Retrieval
  const baseExcludeIds = [
    ...dismissedPostIds,
    ...excludeIds.map((id) => id.toString()),
  ];

  const candidateQuery = {
    _id: { $nin: baseExcludeIds },
  };

  // Retrieve up to 130 candidate posts
  const candidatePosts = await Post.find(candidateQuery)
    .populate("user", "username userHandle avatar isVerified isPremium premiumTier verifiedBadgeType")
    .sort({ createdAt: -1 })
    .limit(130);

  const candidatePostIds = candidatePosts.map((p) => p._id);

  // Fast Batch Parallel Aggregation for Likes & Comments
  const [likesAgg, commentsAgg, coLikersAgg] = await Promise.all([
    PostLikes.aggregate([
      { $match: { post: { $in: candidatePostIds } } },
      { $group: { _id: "$post", count: { $sum: 1 } } },
    ]),
    Comment.aggregate([
      { $match: { post: { $in: candidatePostIds } } },
      { $group: { _id: "$post", count: { $sum: 1 } } },
    ]),
    // GraphJet: Find top co-engaging users who liked the same posts as this user
    explicitPostIds.length > 0
      ? PostLikes.aggregate([
          { $match: { post: { $in: explicitPostIds }, user: { $ne: userId } } },
          { $group: { _id: "$user", count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 30 },
        ])
      : Promise.resolve([]),
  ]);

  const likesCountMap = new Map(likesAgg.map((i) => [i._id.toString(), i.count]));
  const commentsCountMap = new Map(commentsAgg.map((i) => [i._id.toString(), i.count]));

  // 2-Hop Collaborative Graph: Find candidate posts also liked by co-engagers
  const coLikerUserIds = coLikersAgg.map((c) => c._id);
  const collabScoresMap = new Map();

  if (coLikerUserIds.length > 0) {
    const coLikerPostLikes = await PostLikes.aggregate([
      { $match: { user: { $in: coLikerUserIds }, post: { $in: candidatePostIds } } },
      { $group: { _id: "$post", count: { $sum: 1 } } },
    ]);
    for (const item of coLikerPostLikes) {
      collabScoresMap.set(item._id.toString(), item.count * 7.5);
    }
  }

  // 4. Heavy Ranker Scoring Function
  const now = Date.now();
  const scoredCandidates = [];

  for (const post of candidatePosts) {
    if (!post.user || blockedUserIds.has(post.user._id.toString())) {
      continue;
    }

    const authorIdStr = post.user._id.toString();
    const isAuthorFollowed = followedUserIds.has(authorIdStr);
    const isOwnPost = authorIdStr === userId.toString();

    // A. Direct Hashtag Affinity Match
    let topicScore = 0;
    let matchedTag = null;
    let highestTagScore = 0;

    if (Array.isArray(post.hashtags)) {
      for (const tag of post.hashtags) {
        const cleanTag = tag.toLowerCase().trim();
        const score = tagAffinity.get(cleanTag) || 0;
        if (score !== 0) {
          topicScore += score * 3.5;
          if (score > highestTagScore) {
            highestTagScore = score;
            matchedTag = tag;
          }
        }
      }
    }

    // B. SimClusters Semantic Topic Match
    let clusterScore = 0;
    let matchedCluster = null;
    let highestClusterAffinity = 0;

    if (Array.isArray(post.hashtags)) {
      for (const cluster of SIM_CLUSTERS) {
        const hasTagInCluster = post.hashtags.some((t) =>
          cluster.tags.includes(t.toLowerCase().trim())
        );
        if (hasTagInCluster) {
          const aff = clusterAffinity.get(cluster.id) || 0;
          if (aff > highestClusterAffinity) {
            highestClusterAffinity = aff;
            matchedCluster = cluster;
            clusterScore = Math.min(aff * 0.45, 40.0);
          }
        }
      }
    }

    // C. Social Graph Score (In-Network & Interacted Authors)
    let socialScore = 0;
    if (isAuthorFollowed) {
      socialScore += 45.0;
    }
    const authorPriorAffinity = authorAffinity.get(authorIdStr) || 0;
    if (authorPriorAffinity > 0) {
      socialScore += Math.min(authorPriorAffinity * 2.5, 30.0);
    }

    // Twitter Verified / Premium Creator Ranking Boost (Heavy Ranker standard)
    if (post.user?.isPremium || post.user?.isVerified) {
      const premiumMultiplier = post.user?.premiumTier === "premium_plus" ? 1.6 : 1.35;
      socialScore += 22.0 * premiumMultiplier;
    }

    // D. GraphJet 2-Hop Collaborative Filtering
    const collabScore = collabScoresMap.get(post._id.toString()) || 0;

    // E. Engagement Count & Velocity (detect accelerating virality)
    const likesCount = likesCountMap.get(post._id.toString()) || 0;
    const commentsCount = commentsCountMap.get(post._id.toString()) || 0;

    const ageInHours = Math.max(
      (now - new Date(post.createdAt).getTime()) / (1000 * 60 * 60),
      0.1
    );

    const baseEngagementScore =
      Math.log10(1 + likesCount * 1.0 + commentsCount * 3.0) * 14.0;

    const velocity =
      (likesCount * 1.2 + commentsCount * 3.0) / Math.pow(ageInHours + 1.2, 0.75);
    const velocityScore = Math.min(velocity * 2.5, 25.0);

    // F. Recency Half-Life Decay (48 hour half-life)
    const recencyDecay = Math.exp(-ageInHours / 48.0);

    // G. Controlled Exploration Jitter (prevents feedback loop echo chambers)
    const explorationJitter = Math.random() * 4.0;

    // Aggregated Formula
    const rawScore =
      topicScore +
      clusterScore +
      socialScore +
      collabScore +
      baseEngagementScore +
      velocityScore +
      explorationJitter;

    const finalScore = rawScore * (0.35 + 0.65 * recencyDecay);

    // Attribution Reason Badge
    let reason = null;
    let reasonIcon = "✨";

    if (isOwnPost) {
      reason = "Your post";
      reasonIcon = "👤";
    } else if (isAuthorFollowed) {
      reason = `Following @${post.user.userHandle || post.user.username}`;
      reasonIcon = "👥";
    } else if (matchedTag && highestTagScore > 0) {
      reason = `✨ Based on your interest in ${matchedTag}`;
      reasonIcon = "✨";
    } else if (matchedCluster && highestClusterAffinity > 15) {
      reason = `${matchedCluster.icon} In your favorite topic: ${matchedCluster.label}`;
      reasonIcon = matchedCluster.icon;
    } else if (collabScore >= 12) {
      reason = "👥 People with similar taste liked this";
      reasonIcon = "👥";
    } else if (velocity >= 15) {
      reason = "⚡ Surging right now";
      reasonIcon = "⚡";
    } else if (likesCount >= 40) {
      reason = "🔥 Viral on Twitty";
      reasonIcon = "🔥";
    } else if (commentsCount >= 5) {
      reason = "💬 Active discussion";
      reasonIcon = "💬";
    } else if (topicScore > 10) {
      reason = "✨ Suggested for you";
      reasonIcon = "✨";
    } else {
      reason = "🌟 Discover";
      reasonIcon = "🌟";
    }

    scoredCandidates.push({
      post,
      score: finalScore,
      likesCount,
      commentsCount,
      reason,
      reasonIcon,
      authorId: authorIdStr,
      scoreBreakdown: {
        topicScore: Math.round(topicScore * 10) / 10,
        clusterScore: Math.round(clusterScore * 10) / 10,
        socialScore: Math.round(socialScore * 10) / 10,
        collabScore: Math.round(collabScore * 10) / 10,
        engagementScore: Math.round((baseEngagementScore + velocityScore) * 10) / 10,
        recencyMultiplier: Math.round((0.35 + 0.65 * recencyDecay) * 100) / 100,
        rawScore: Math.round(rawScore * 10) / 10,
        finalScore: Math.round(finalScore * 10) / 10,
        matchedTag,
        matchedClusterName: matchedCluster ? matchedCluster.label : null,
      },
    });
  }

  // Sort candidates descending by calculated score
  scoredCandidates.sort((a, b) => b.score - a.score);

  // 5. Author Diversity & Exponential Fatigue Cooldown Filter
  const diversified = [];
  const authorRecentCounts = new Map();

  for (const item of scoredCandidates) {
    const authorCount = authorRecentCounts.get(item.authorId) || 0;
    // Beyond 2 posts from same author, apply fatigue penalty
    if (authorCount >= 2 && diversified.length < limit) {
      continue;
    }
    authorRecentCounts.set(item.authorId, authorCount + 1);
    diversified.push(item);
  }

  // Backfill if needed
  if (diversified.length < limit) {
    for (const item of scoredCandidates) {
      if (!diversified.some((d) => d.post._id.toString() === item.post._id.toString())) {
        diversified.push(item);
        if (diversified.length >= limit) break;
      }
    }
  }

  // Pagination slice
  const startIndex = (page - 1) * limit;
  const paginated = diversified.slice(startIndex, startIndex + limit);

  // 6. Fast batch hydrate user interaction states
  const paginatedPostIds = paginated.map((p) => p.post._id);
  const [userLikesSet, userBookmarksSet] = await Promise.all([
    PostLikes.find({ post: { $in: paginatedPostIds }, user: userId }).select("post"),
    Bookmark.find({ post: { $in: paginatedPostIds }, user: userId }).select("post"),
  ]);

  const likedSet = new Set(userLikesSet.map((l) => l.post.toString()));
  const bookmarkedSet = new Set(userBookmarksSet.map((b) => b.post.toString()));

  const hydratedPosts = paginated.map(
    ({ post, likesCount, commentsCount, reason, score, scoreBreakdown }) => {
      return {
        ...post.toObject(),
        likesCount,
        commentsCount,
        userLiked: likedSet.has(post._id.toString()),
        isBookmarked: bookmarkedSet.has(post._id.toString()),
        comments: [],
        recommendationReason: reason,
        algoScore: Math.round(score * 10) / 10,
        scoreBreakdown,
      };
    }
  );

  return {
    posts: hydratedPosts,
    totalCount: scoredCandidates.length,
  };
}
