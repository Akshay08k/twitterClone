# 🐦 Twitty — Full-Stack Twitter / X Clone with Heavy Ranker & Premium

A production-grade, full-stack, real-time Twitter / X clone built with **Node.js, Express, MongoDB, Socket.io, React 18, Redux Toolkit, and Tailwind CSS**, featuring an authentic **Twitter Heavy Ranker Recommendation Engine (SimClusters + GraphJet)** and a complete **X Premium Subscription** system with Blue/Gold verified badges.

---

## 🌟 What's New in Recent Updates

### 1. 🧠 Twitter Heavy Ranker Recommendation Engine 2.0
Modeled directly after the open-source Twitter / X Recommendation Algorithm:
* **SimClusters Semantic Topic Graph**: Groups hashtags into topic clusters (`Romance & Connection`, `Nightlife & Midnight Thoughts`, `Travel & Aesthetics`, `Culinary & Espresso`, `Fitness & Mindset`). Interacting with one hashtag propagates affinity across the entire cluster.
* **GraphJet 2-Hop Collaborative Filtering**: Discovers users who co-engaged with posts you liked, traverses the graph to find what *other* posts they liked, and surfaces them with attribution badges (`👥 People with similar taste liked this`).
* **Dynamic Engagement Velocity**: Evaluates engagement rate of acceleration ($\text{Velocity} = \frac{1.2 \cdot \text{likes} + 3.0 \cdot \text{comments}}{(\text{ageInHours} + 1.2)^{0.75}}$) to identify and boost posts that are `⚡ Surging right now`.
* **Recency Half-Life Decay**: 48-hour exponential decay ($e^{-\frac{\Delta t}{48}}$) to ensure timeline freshness while preventing stale posts from camping at the top.
* **Author Fatigue Cooldown & Interleaving**: Applies an exponential penalty ($0.75^{k-1}$) to prevent any single author from flooding consecutive timeline slots.
* **Implicit Dwell Time Telemetry**: Automated `IntersectionObserver` in `Posts.jsx` tracks viewport reading time (>1.5s) as an implicit positive interest signal without requiring manual clicks.
* **Negative Feedback Telemetry**: "Not interested in this" option trains an immediate `-30.0` penalty for that post's tags and author, collapsing the card in real-time.
* **Algorithmic Transparency Inspector ("Why am I seeing this?")**:
  * Click any recommendation badge or choose "Why this post?" in the 3-dots menu to inspect exact point breakdowns (Topic Match, SimCluster, Velocity, Social/Collab, and Recency Decay).
  * In-modal interactive tuning controls: click **👍 Boost (+25)** or **👎 Mute (-40)** on any hashtag.
* **"Your Algorithm Mix" Widget (Right Sidebar)**:
  * Displays your primary detected SimCluster and learned hashtag pills.
  * Lets users view and unmute dismissed topics or click **Reset Algorithm** to start fresh at any time.

---

### 2. 👑 X Premium Subscription & Verification System
Complete multi-tier Twitter Premium subscription architecture:
* **3-Tier Subscription Catalog**:
  * **Basic** ($3/mo or $32/yr): Edit posts within 1 hour, bookmark folders, small reply priority.
  * **Premium** ($8/mo or $84/yr — Save 12%): **Verified Blue Checkmark badge**, **2x Recommendation Algorithm boost**, prioritized replies, 50% fewer ads, edit posts.
  * **Premium+** ($16/mo or $168/yr): **Exclusive Gold Checkmark badge**, **Maximum Algorithm boost**, 100% ad-free, Grok AI access, top priority in all conversations.
* **Verified Badges Across UI**:
  * Gold Checkmark for Premium+ and Blue Checkmark for Premium rendered on `PostHeader.jsx`, `ProfileInfo.jsx`, search results, and sidebar cards.
* **Algorithmic Heavy Ranker Boost**:
  * Posts by verified / Premium users automatically receive a **1.35x to 1.6x ranking multiplier** in `recommendation.service.js`.
* **Edit Post Feature**:
  * Post authors can click the 3-dots menu to select **"Edit post"** and update text and hashtags via `PUT /posts/:postId`.
* **Full Dedicated Premium Page (`/premium`)**:
  * Annual vs. Monthly discount toggle, detailed feature matrix table, and simulated checkout drawer (Apple Pay, Google Pay, Credit Card) with instant membership activation.
* **Quick Subscribe Modal (`PremiumModal.jsx`)**:
  * Available across the feed and right sidebar for 1-click subscription without leaving your timeline.

---

## 🎨 Complete Feature Set

### Modern Twitter / X User Interface
* **3-Column Responsive Layout**:
  * **Left Sidebar**: Navigation (Home, Explore, Notifications, Messages, Bookmarks, Premium, Profile, Settings), Post composer button, and account switcher.
  * **Center Feed**: Sticky glassmorphism header, tab toggle (**"For you"** vs **"Following"**), in-feed Tweet composer with media preview & character counter, and sleek tweet cards.
  * **Right Sidebar**: Instant search bar, **"Your Algorithm Mix"**, **"What's happening"** trends widget, and **"Who to follow"** suggestions.
* **Micro-Interactions**: Real-time optimistic likes (0ms visual latency), instant bookmarking, copy link, threaded comments, and toast notifications.

### Backend & API Architecture
* **Security & Authorization**: JWT cookie authentication, ownership checks for post editing and deletion, secure direct messaging.
* **Dual Database Sync**:
  * **SQLite Database (`backend/database.db`)**: Stores `users` and threaded `tweets` tables with relational `parent_id` linking.
  * **MongoDB Live Sync**: Dual-writes users, posts, comments, notifications, interactions, and bookmarks with indexed `#hashtags` and Socket.IO broadcasts.
* **High-Performance Aggregation**: Batch parallel `$group` aggregation replaces N+1 queries, returning ranked feeds in <80ms.

---

## 🛠️ Tech Stack

* **Frontend**: React 18, Vite 6, Tailwind CSS, Lucide React, Redux Toolkit, React Router 7, Socket.io Client, React Hot Toast
* **Backend**: Node.js, Express 4, MongoDB (Mongoose), SQLite3, Socket.io, Cloudinary, Multer, JWT, Bcrypt
* **AI & Simulation**: Google Gemini AI (`@google/genai`) for multi-persona simulation and real-time post generation

---

## 📡 API Endpoints Reference

### 🎯 Recommendation Engine & Telemetry
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/posts?type=for-you` | Fetches personalized timeline scored by Heavy Ranker |
| `GET` | `/posts/recommendations/affinity` | Returns learned tag affinities, muted topics, and active SimClusters |
| `POST` | `/posts/recommendations/tune-topic` | Manually boosts or mutes a specific tag (`{ tag, delta }`) |
| `POST` | `/posts/recommendations/reset` | Resets the user's recommendation profile back to baseline |
| `POST` | `/posts/dismiss/:postId` | Flags a post as "Not interested" (-30.0 negative penalty) |
| `POST` | `/posts/interaction` | Logs dwell time, detail clicks, searches, and profile visits |

### 👑 Premium & Subscriptions
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/subscription/plans` | Returns public catalog of Premium plans, pricing, and perks |
| `GET` | `/subscription/status` | Returns active membership, tier, expiration, and verified badge type |
| `POST` | `/subscription/subscribe` | Subscribes or upgrades to Basic, Premium, or Premium+ |
| `POST` | `/subscription/cancel` | Cancels active membership |
| `PUT` | `/posts/:postId` | Allows post authors to edit post text and hashtags (Premium perk) |

### 📝 Posts & Social Interactions
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/posts/create` | Creates new tweet with optional media attachments |
| `GET` | `/posts/post/:postId` | Fetches single post and logs click interaction |
| `POST` | `/posts/:postId/like` | Toggles like and logs positive interaction |
| `POST` | `/posts/:postId/bookmark` | Toggles bookmark (+12.0 interaction weight) |
| `GET` | `/posts/trends` | Fetches real trending hashtags aggregated across all posts |
| `DELETE`| `/posts/:postId` | Cascading delete of post, comments, likes, and bookmarks |

---

## 🚀 Getting Started

### 1. Prerequisites
* Node.js 18+ (tested on Node 22)
* MongoDB connection URI
* Gemini API Key (optional, for running AI simulation engine)

### 2. Backend Setup
```bash
cd backend
npm install
node index.js
```
The server will start on `http://localhost:3000`.

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
The client will run on `http://localhost:5173`.

### 4. Running the Gemini Persona Simulation Engine
To populate the database with realistic human posts, romantic/chemistry threads, and high-engagement replies:
```bash
cd backend

# Rapid Bulk Seeding (fills 35+ unique posts + replies + likes in seconds)
npm run simulate:quick

# Continuous Fast Simulation
npm run simulate:fast

# Real-Time Continuous Human Stream
npm run simulate
```

---

## 🤖 Gemini Multi-Agent Personas
The simulation engine powers 14+ distinct, human-like personas that converse, argue, like, and reply to posts across the platform:
* `@chef_marco` (Marco Romano 🍝 — Homemade pasta, culinary secrets, dark espresso)
* `@wander_luna` (Luna Nomad ✈️ — Solo travel, 35mm photography, mountain sunrises)
* `@relatable_dan` (Dan The Man 😂 — Observational comedy, snooze button struggles)
* `@coach_sarah` (Coach Sarah 💪 — Fitness, hydration reminders, mental resilience)
* `@bookish_elena` (Elena Vance 📚 — Fiction reviews, rainy coffee shop reading)
* `@midnight_thinker` (Deep Thoughts 🌙 — Quiet nighttime reflections, solitude)
* `@pixel_nova` & `@hype_maxi` (Gaming, situationships, and market banter)
* **Live Comment Reactions**: When an active user creates a post, an AI persona automatically analyzes it and posts a contextual reply within seconds!

---

## 📄 License
MIT License. Built for educational and portfolio demonstration purposes.
