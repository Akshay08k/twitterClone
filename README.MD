# 🐦 Twitty — Full-Stack Twitter / X Clone

A full-stack, real-time Twitter / X clone built with Node.js, Express, MongoDB, Socket.io, React, Redux Toolkit, and Tailwind CSS.

---

## ✨ Features Implemented & Upgraded

### 🎨 Modern UI & UX (Twitter / X Design System)
- **3-Column Responsive Layout**:
  - **Left Sidebar**: Navigation (Home, Explore, Notifications, Messages, Bookmarks, Profile, Settings), Post CTA button, and user account switcher with popup.
  - **Center Feed**: Sticky glassmorphism header, feed tab toggle (**"For you"** vs **"Following"**), in-feed quick Tweet composer with media preview & character counter, and sleek tweet cards.
  - **Right Sidebar**: Instant search bar, **"What's happening"** trending topics widget, and **"Who to follow"** suggestions with live follow/unfollow buttons.
  - **Mobile Experience**: Responsive bottom navigation bar and floating compose FAB.
- **Micro-Interactions**: Real-time like counts, instant bookmarking, copy tweet link, comment threads, and smooth toast alerts.

### 🛡️ Backend & API Enhancements
- **Security & Authorization**:
  - Enforced strict ownership checks: Users can only delete their own tweets and comments.
  - Secured direct messaging so sender cannot be spoofed.
- **Bookmarks Engine**:
  - Full backend Bookmark model, toggle endpoint (`POST /posts/:postId/bookmark`), and retrieval endpoint (`GET /posts/bookmarks`).
- **Explore & User Discovery**:
  - Search posts by keyword or hashtag (`GET /posts?search=...`).
  - Search users by username or handle (`GET /user/search?q=...`).
  - Smart user recommendations (`GET /user/suggested`).
- **Follow & Unfollow Fixes**:
  - Corrected relational query inversion on follow and unfollow operations.
  - Fixed route aliases for `/isFollowing/:userId` (GET and POST).
- **Feed Optimization**:
  - Reverse chronological ordering (`createdAt: -1`).
  - Dual feeds: Global stream and Following-only stream (`/posts?type=following`).
- **Robust Error Handling & CORS**:
  - Global Express JSON error handler middleware (no raw HTML error pages).
  - Multi-origin CORS support for both local development (`localhost:5173`) and production deployments.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite 6, Tailwind CSS, Lucide React, Redux Toolkit, React Router 7, Socket.io Client, React Hot Toast
- **Backend**: Node.js, Express 4, MongoDB (Mongoose), Socket.io, Cloudinary, Multer, JWT, Bcrypt

---

## 🚀 Getting Started

### 1. Backend Setup
```bash
cd backend
npm install
npm run dev
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

---

## 🧭 Future Roadmap & Ideas
1. **Polls & Surveys**: Add interactive polls inside tweets with expiration timers.
2. **Hashtag & Mention Highlighting**: Parse `@username` and `#hashtag` inside tweet text into clickable links.
3. **GIF Picker & Video Playback**: Integration with Giphy / Tenor API and video attachment playback.
4. **Push Notifications**: Web push notifications for likes, comments, and direct messages using Web Push API.
5. **Infinite Scroll Pagination**: Replace static limit with cursor-based pagination for feeds.
