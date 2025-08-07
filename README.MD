## 🐦 Twitter Clone – Version 1

A simple, functional Twitter clone built using modern web technologies. This version focuses on core social media features such as user authentication, tweet creation, and interaction.

---

### 🚀 Features (v1)

- **User Authentication**

  - Sign up, log in, and log out
  - JWT or session-based authentication

- **Create & Manage Tweets**

  - Post new tweets (text)
  - Delete own tweets

- **Like System**

  - Like and unlike tweets

- **Follow System**

  - Follow and unfollow other users
  - View posts only from followed users in the home feed

- **User Profile**

  - View user profile with tweet history
  - Profile bio and picture support (if available)

- **Basic Feed**

  - Reverse chronological feed of tweets from followed users

---

### 🛠️ Tech Stack

> Replace these with your actual tech stack

- **Frontend:** React.js / Next.js / Tailwind CSS
- **Backend:** Node.js / Express.js
- **Database:** MongoDB / PostgreSQL / Firebase
- **Authentication:** JWT / OAuth / Sessions
- **Deployment:** Vercel / Heroku / Render / Railway

---

### 📁 Folder Structure (Example)

```
/client        # Frontend
/server        # Backend (API)
.env           # Environment config (excluded from version control)
README.md
```

---

### 🔧 Getting Started

1. **Clone the repository**

   ```bash
   git clone https://github.com/your-username/twitter-clone.git
   cd twitter-clone
   ```

2. **Install dependencies**

   - Frontend:

     ```bash
     cd client
     npm install
     ```

   - Backend:

     ```bash
     cd server
     npm install
     ```

3. **Environment setup**

   - Create a `.env` file in both frontend and backend folders
   - Add relevant API keys, DB URIs, JWT secrets, etc.

4. **Run the app**

   ```bash
   # Run frontend
   cd client
   npm start

   # Run backend
   cd server
   npm run dev
   ```

---

### 📌 Notes

- This is **Version 1** of the project. The goal was to establish a minimal working social media experience.
- [Version 2 Roadmap](./docs/v2-roadmap.md) includes features like retweets, bookmarks, 2FA, and analytics.

# Twitter Clone - Version 2 Roadmap

This document outlines the planned features and enhancements for Version 2 (v2) of the Twitter Clone project.

---

## Planned Features

### Core Social Features

- **Retweet Functionality**  
  Support for direct and quote retweets.

- **Block User**  
  Ability to block users to hide their tweets and messages.

- **Save / Bookmark Posts**  
  Users can save tweets privately for later reading.

- **Customized Feed**  
  Algorithmic feed personalized based on user interests and follows.

- **Trending Section**  
  Display trending hashtags and posts based on real-time activity.

---

### Notifications

- **Real-Time Message Notifications**  
  Live alerts for new messages via WebSockets or other methods.

- **Email Notifications**  
  Notify users of new followers, direct messages, likes, and other events.

- **Personalized Notification Preferences**  
  Users can customize notification settings for email, in-app, and push notifications.

- **Push Notifications (Web Push / PWA)**  
  Browser and device notifications for alerts when users are offline.

---

### Power Features

- **Analytics for Users**  
  Provide users with insights on tweet impressions, likes, retweets, and engagement.

- **Scheduled Posts**  
  Allow users to schedule tweets to be posted at a later time.

- **Rate Limiting / Anti-Spam Middleware**  
  Implement backend protections against spamming and abuse.

---

### Security & UX

- **Two-Factor Authentication (2FA)**  
  Optional extra layer of security via email or OTP-based 2FA.

---

## Notes

- This roadmap is a guide for future development and may be updated as the project evolves.
- Features will be prioritized based on complexity and user impact.

---

Feel free to contribute or suggest additional features!
