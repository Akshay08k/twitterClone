import { GoogleGenAI } from "@google/genai";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env
dotenv.config({ path: path.join(__dirname, ".env") });
dotenv.config({ path: path.join(__dirname, "../.env") });
dotenv.config({ path: path.join(__dirname, "../../.env") });

const apiKey =
  process.env.GEMINI_API_KEY ||
  process.env.GEMINI_KEY ||
  process.env.API_KEY;

const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;
const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:3000";

const personasPath = path.join(__dirname, "personas.json");
const personas = JSON.parse(fs.readFileSync(personasPath, "utf8"));

// Clean JSON helper
function extractJson(text) {
  if (!text) return null;
  const cleaned = text.replace(/```json/g, "").replace(/```/g, "").trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    const match = cleaned.match(/\[[\s\S]*\]/) || cleaned.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        return JSON.parse(match[0]);
      } catch {}
    }
  }
  return null;
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Verified working Gemini models with high-capacity 500 RPD models first
const MODEL_CANDIDATES = [
  "gemini-3.5-flash-lite", // 500 RPD, 15 RPM (High capacity & speed)
  "gemini-3.1-flash-lite", // 500 RPD, 15 RPM (High capacity & speed)
  "gemini-3.5-flash",
  "gemini-3.6-flash",
  "gemini-3.7-flash",
  "gemini-flash-lite-latest",
].filter(Boolean);

let currentModelIdx = 0;

async function runGeminiPrompt(systemInstruction, promptText, expectJson = false) {
  if (!ai) return null;

  const totalModels = MODEL_CANDIDATES.length;
  for (let i = 0; i < totalModels; i++) {
    const model = MODEL_CANDIDATES[(currentModelIdx + i) % totalModels];
    try {
      const config = {
        temperature: 0.9,
      };
      if (systemInstruction) config.systemInstruction = systemInstruction;
      if (expectJson) config.responseMimeType = "application/json";

      const response = await ai.models.generateContent({
        model,
        contents: promptText,
        config,
      });

      if (response?.text) {
        currentModelIdx = (currentModelIdx + i) % totalModels;
        return response.text;
      }
    } catch (err) {
      // Rotate model on error/quota limit
      currentModelIdx = (currentModelIdx + 1) % totalModels;
    }
  }
  return null;
}

// Expansive, diverse topics: Tasteful mature romance, magnetic chemistry, deep love, and lifestyle
const DIVERSE_HUMAN_TOPICS = [
  // Mature Romance, Magnetic Chemistry & Tension
  "that quiet electric tension when someone's hand accidentally brushes yours",
  "lingering eye contact across a candlelit room that says everything words can't",
  "slow dancing in the kitchen at 2 AM with bare feet and wine glasses on the counter",
  "the intoxicating scent of their perfume or cologne lingering on your sweater days later",
  "waking up tangled in soft sheets on a rainy Sunday morning with zero alarms set",
  "whispering vulnerabilities in the dark when the whole world is asleep",
  "someone gently brushing stray hair away from your face mid-sentence",
  "holding hands discreetly under the restaurant table while everyone else is talking",
  "the rush of adrenaline when you get a flirty late-night text that makes you bite your lip",
  "stealing a passionate kiss in an empty elevator right before the doors open",
  "that magnetic pull towards someone where logic completely leaves the room",
  "sharing a trench coat under heavy rain while laughing and running for shelter",
  "the hesitation right before an unforgettable kiss when breathing syncs up",
  "late-night drives with hands intertwined over the center console in comfortable silence",

  // Modern Dating, Chemistry & Situationships
  "why situationships hurt worse than actual breakups: mourning potential",
  "the difference between someone who loves you loudly in public vs tenderly in private",
  "that first kiss where your knees actually go weak and time stops",
  "dating someone whose voice alone can calm your entire nervous system",
  "chemistry that feels like gasoline and matches: thrilling, passionate, and magnetic",
  "flirty banter where both people know exactly what's happening but neither admits it yet",
  "leaving their apartment in the morning with that lingering warmth in your chest",
  "the beauty of someone remembering the exact way you take your coffee after one date",

  // Nightlife, Cocktails & City Romance
  "sharing a dark leather booth in a velvet-draped speakeasy with dirty martinis",
  "the intimacy of sharing a single headphone on a late-night train ride",
  "rooftop skyline views under city lights wrapped together in a cashmere coat",
  "running through empty city streets at 3 AM holding hands like the world belongs to you",
  "slow jazz in a dimly lit bar leaning across the table to whisper secrets",

  // Food, Wine & Cozy Indulgence
  "cooking a midnight carbonara together while sharing a bottle of full-bodied Tuscan red",
  "feeding someone fresh berries or warm pastry straight from your fingertips",
  "the romantic ritual of fresh espresso made for you before you even wake up",
  "sharing dessert with two forks and teasing glances across the candle",

  // Provocative Hot Takes & Relationship Reflections
  "hot take: people crave deep emotional intimacy but settle for casual detachment out of fear",
  "why being someone's safe haven is infinitely more attractive than any surface-level flex",
  "unpopular opinion: genuine romance and chivalry aren't dead, people just stopped risking vulnerability",
  "the difference between attachment and genuine soul-deep chemistry"
];

// Rich Procedural Fallback Library (Tasteful mature romance, chemistry & multi-hashtag themes)
const PROCEDURAL_POSTS_BANK = [
  {
    handle: "@romance_rebel",
    content: "Eye contact that lingers three seconds longer than it should in a dimly lit room is still the most dangerous, intoxicating thing in the human experience. My heart skipped two beats. 🥀👁️ #romance #chemistry #lateNightThoughts #intimacy #tension",
    reply: {
      handle: "@dating_diaries",
      content: "That unspoken mutual acknowledgment before anyone says a word... nothing tops that feeling. Goosebumps every single time. ✨💘 #dating #chemistry #lovers",
    },
  },
  {
    handle: "@nightlife_neo",
    content: "Tucked away in the darkest corner booth of the speakeasy. Two dirty martinis, candlelight flickering against her collarbone, and jazz soft enough that we have to lean in close to whisper. Pure cinema. 🍸✨ #nightlife #datenight #speakeasy #mood #cityvibes",
    reply: {
      handle: "@style_maven",
      content: "Leaning in close enough to catch their fragrance is the entire point of velvet booth seating. 10/10 setting. 🖤🥂 #aesthetics #romance #datenight",
    },
  },
  {
    handle: "@confessions_box",
    content: "Nothing prepares you for the intimacy of someone pulling you close in the cold rain and whispering 'you have no idea how long I've wanted to do this' right before kissing you. 🌧️💋 #love #confessions #passion #romantic #moments",
    reply: {
      handle: "@midnight_thinker",
      content: "Some memories live rent-free in your chest forever. Words spoken in quiet moments carry the weight of years. 🌙 #reflections #heart #romance",
    },
  },
  {
    handle: "@spicy_takes",
    content: "Physical attraction draws you in, but emotional safety is what makes you want to stay in bed until 2 PM talking about your childhood and tangled in each other's arms. Find someone who gives you peace, not anxiety. 🔥❤️ #relationships #datingadvice #realtalk #intimacy #love",
    reply: {
      handle: "@romance_rebel",
      content: "When passion meets emotional safety, that's when love becomes entirely addictive. Perfectly said. 🥀✨ #romance #truth #connection",
    },
  },
  {
    handle: "@chef_marco",
    content: "Cooking for someone you desire is pure seduction. Simmering rich ragù with red wine, soft jazz playing, hand-rolled pasta, and stealing bites with kisses in between. Food made with love changes everything. 🍝🍷 #foodie #datenight #cooking #romanticdinner #italianlove",
    reply: {
      handle: "@dating_diaries",
      content: "A partner who knows their way around a kitchen with wine in hand is the ultimate green flag. Irresistible! 🤌❤️ #greenflags #foodie #romance",
    },
  },
  {
    handle: "@dating_diaries",
    content: "Waking up on a Sunday morning with zero alarms, rainy skies tapping on the windowpane, and warm skin against yours. You couldn't pay me to leave this bed today. ☁️☕ #sundayvibes #cuddles #softlove #relationshipgoals #peace",
    reply: {
      handle: "@amber_glow",
      content: "Rainy morning bedhead and slow coffee shared in silence is the absolute gold standard of romance. 🕯️✨ #slowliving #love #morningvibes",
    },
  },
  {
    handle: "@gabriel_words",
    content: "There is an art to kissing that modern dating forgot—the slow tilt of the chin, the breath catching in the throat, and the world narrowing down to a single heartbeat. ✒️🥀 #poetry #romantic #vintageLove #passion #chemistry",
    reply: {
      handle: "@bookish_elena",
      content: "Straight out of the best chapters ever written. Real romance has a rhythm that can't be rushed. 📖✨ #booklover #romance #words",
    },
  },
  {
    handle: "@amber_glow",
    content: "That 1 AM drive with the windows cracked, cool breeze filling the car, your favourite track playing on low, and his hand resting warm on your thigh. Pure electric comfort. 🌌🚗 #nightdrives #mood #chemistry #connection #lateNightVibes",
    reply: {
      handle: "@nightlife_neo",
      content: "Those drives where nobody wants to arrive at the destination because the ride together is perfection. Pure vibe. 🖤✨ #nightvibes #romance",
    },
  },
  {
    handle: "@midnight_thinker",
    content: "The most intimate thing you can share with someone isn't touch—it's letting them see the parts of your soul you usually keep hidden behind sarcasm and polite smiles. 🌙🖤 #deepthoughts #intimacy #vulnerability #connections #soulmate",
    reply: {
      handle: "@confessions_box",
      content: "True intimacy is when your weird matches their weird and neither of you feels the need to pretend. 🥂💫 #relatable #love #realtalk",
    },
  },
  {
    handle: "@style_maven",
    content: "The way someone looks at you when you step out in a tailored little black dress and their jaw visibly drops for a second. You can't fake that kind of chemistry. 🖤✨ #outfitinspo #chemistry #glamour #confidence #datenightlook",
    reply: {
      handle: "@spicy_takes",
      content: "That stunned 2-second pause before they manage to speak is the highest compliment on earth. 💅🔥 #slay #dating #confidence",
    },
  },
  {
    handle: "@city_insider",
    content: "Underground jazz cellar in Soho. Dim red lights, sax solo vibrating through the floorboards, and whispering into each other's ears between cocktails. NYC nights have their own love language. 🎷🍸 #nycnights #speakeasy #jazz #cityromance #nightlife",
    reply: {
      handle: "@melody_vibes",
      content: "Live jazz in a dark basement with someone you're falling for will ruin all normal dates forever. Unmatched! 🎶❤️ #musiclovers #datenight",
    },
  },
  {
    handle: "@relatable_dan",
    content: "Find someone who will sit in the car with you for 45 minutes in the driveway just finishing a conversation because neither of you wants to say goodnight yet. That's real love. 🚗💤 #datinglife #relatable #romantic #goodvibes #wholesome",
    reply: {
      handle: "@dating_diaries",
      content: "The 'one more song' rule turning into a 2-hour conversation is peak new love behaviour. Adorable! 😂💘 #datingculture #chemistry",
    },
  },
];

async function startSimulation() {
  console.log("==================================================================");
  console.log("🌟 TWITTY MULTI-AGENT ULTRA-FAST SIMULATION & DATA SEEDER");
  console.log(`🌐 Backend Endpoint: ${BACKEND_URL}`);
  console.log(`👥 Loaded Personas: ${personas.length} rich human personalities`);
  console.log("🎯 Mode: Mature Romance & Chemistry, Multi-Hashtags & 40+ Social Likes");
  console.log("==================================================================\n");

  // Step 1: Synchronize all Personas in application
  console.log("1️⃣ Synchronizing personas into application database...");
  for (const p of personas) {
    try {
      const res = await fetch(`${BACKEND_URL}/api/sim/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(p),
      });
      const data = await res.json();
      console.log(`  ✓ Synced ${p.name} (${p.handle}) -> ${data.status}`);
    } catch (err) {
      console.error(`  ✗ Error registering ${p.handle}:`, err.message);
    }
  }

  // CLI Arguments
  const isSeedMode = process.argv.includes("--seed");
  const isFastMode = process.argv.includes("--fast") || isSeedMode;
  const isOneShot = process.argv.includes("--once");

  let targetPostsCount = 15;
  const seedArgIdx = process.argv.indexOf("--seed");
  if (seedArgIdx !== -1 && process.argv[seedArgIdx + 1]) {
    const parsed = parseInt(process.argv[seedArgIdx + 1], 10);
    if (!isNaN(parsed) && parsed > 0) targetPostsCount = parsed;
  }

  console.log(`\n⚡ Operating Mode: ${isSeedMode ? `RAPID SEED (${targetPostsCount} posts)` : isFastMode ? "FAST STREAM" : "REAL-TIME STREAM"}`);
  console.log("🚀 Generating unique, multi-hashtag human posts, threaded replies, and 40+ likes ratio...\n");

  let postsGenerated = 0;
  let batchIndex = 0;
  let fallbackCursor = 0;

  while (true) {
    batchIndex++;
    console.log(`\n━━━━━━━━━━ [Batch Cycle #${batchIndex}] ━━━━━━━━━━`);

    // High-speed batches of 3-5 to maximize throughput and minimize API roundtrips
    const batchSize = isSeedMode ? Math.min(5, targetPostsCount - postsGenerated) : 2;
    let newItems = [];

    // Attempt Gemini Batch Generation
    try {
      const selectedPersonas = [...personas]
        .sort(() => 0.5 - Math.random())
        .slice(0, batchSize);

      const personasDescription = selectedPersonas
        .map((p) => `${p.name} (${p.handle}): ${p.bio}`)
        .join("; ");

      const randomTopics = [...DIVERSE_HUMAN_TOPICS]
        .sort(() => 0.5 - Math.random())
        .slice(0, batchSize)
        .join(", ");

      const prompt = `Generate a JSON array of exactly ${batchSize} completely unique, high-engagement tweets from these personas:
${personasDescription}

Focus Inspiration: ${randomTopics}.

CRITICAL CONTENT RULES:
1. Theme: Mature romance, magnetic chemistry, deep love, emotional intimacy, flirty banter, romantic tension, and modern dating reflections.
2. ZERO crude vulgarity or explicit graphic sexual descriptions (NO pornographic text, no foul anatomical terms). Keep it tasteful, sensual, passionate, and deeply romantic like top relationship quotes and viral Twitter romance threads.
3. Max 240 chars per tweet. ALWAYS include 3 to 5 trending, diverse hashtags at the end of every tweet (e.g. #romance #chemistry #love #dating #lateNightThoughts #intimacy #connection).
4. For each tweet, also provide a realistic conversational reply from another persona in the list with 2-3 hashtags.

Format:
[
  {
    "handle": "@handle",
    "content": "tasteful romantic tweet text with 3-5 hashtags",
    "reply": {
      "handle": "@other_handle",
      "content": "witty/relatable conversational reply text with 2-3 hashtags"
    }
  }
]`;

      console.log(`🤖 Generating ${batchSize} viral romantic tweets with Gemini AI (3-5 hashtags)...`);
      const rawAiText = await runGeminiPrompt(
        "You are an expert social media simulation engine producing viral, mature, romantic, multi-hashtag human tweets with deep chemistry and zero crude vulgarity.",
        prompt,
        true
      );

      const parsedItems = extractJson(rawAiText);
      if (Array.isArray(parsedItems) && parsedItems.length > 0) {
        newItems = parsedItems;
        console.log(`  ✓ Successfully synthesized ${newItems.length} unique romantic posts from Gemini AI!`);
      }
    } catch (aiErr) {
      console.warn("  Notice: AI batch generation fallback:", aiErr.message);
    }

    // Fallback: If Gemini is rate-limited or fails, seamlessly use Procedural Bank
    if (!newItems || newItems.length === 0) {
      console.log(`  🔄 Using rich procedural human content bank (Zero-downtime fallback)...`);
      for (let i = 0; i < batchSize; i++) {
        const item = PROCEDURAL_POSTS_BANK[fallbackCursor % PROCEDURAL_POSTS_BANK.length];
        fallbackCursor++;
        newItems.push(item);
      }
    }

    // Publish Batch Posts, Threaded Replies, and 40+ Social Likes
    for (const item of newItems) {
      try {
        // 1. Post Main Tweet
        const postRes = await fetch(`${BACKEND_URL}/api/sim/post`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            handle: item.handle,
            content: item.content,
          }),
        });
        const postData = await postRes.json();
        postsGenerated++;

        console.log(`📢 [POST #${postData.tweet_id || postsGenerated}] ${item.handle}: ${item.content}`);

        // 2. High Like Ratio: 40 to 46 personas like every post!
        const likersPool = personas.filter((p) => p.handle !== item.handle);
        const targetLikes = Math.min(likersPool.length, Math.floor(Math.random() * 6) + 40); // 40-45 likes
        const chosenLikers = [...likersPool].sort(() => 0.5 - Math.random()).slice(0, targetLikes);

        // Process in parallel chunks of 10 for speed
        const chunkSize = 10;
        let successfulLikes = 0;
        for (let i = 0; i < chosenLikers.length; i += chunkSize) {
          const chunk = chosenLikers.slice(i, i + chunkSize);
          await Promise.all(
            chunk.map(async (liker) => {
              try {
                await fetch(`${BACKEND_URL}/api/sim/like`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    handle: liker.handle,
                    tweet_id: postData.tweet_id,
                    post_id: postData.mongo_id,
                  }),
                });
                successfulLikes++;
              } catch {}
            })
          );
        }
        console.log(`   ❤️ [40+ LIKES RATIO] ${successfulLikes} accounts liked post #${postData.tweet_id}!`);

        // 3. Post Threaded Conversational Reply
        if (item.reply && item.reply.content) {
          await sleep(isFastMode ? 200 : 800);
          const replyRes = await fetch(`${BACKEND_URL}/api/sim/post`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              handle: item.reply.handle,
              content: item.reply.content,
              parent_id: postData.tweet_id,
            }),
          });
          const replyData = await replyRes.json();
          console.log(`   └── 💬 [REPLY #${replyData.tweet_id}] ${item.reply.handle}: ${item.reply.content}`);

          // Also like the reply (1 or 2 personas like the reply)
          const replyLikers = personas.filter((p) => p.handle !== item.reply.handle).slice(0, 2);
          for (const rLiker of replyLikers) {
            try {
              await fetch(`${BACKEND_URL}/api/sim/like`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  handle: rLiker.handle,
                  tweet_id: replyData.tweet_id,
                  post_id: replyData.mongo_id,
                }),
              });
              console.log(`       ❤️ [LIKE] ${rLiker.handle} liked reply #${replyData.tweet_id}`);
            } catch {}
          }
        }

        await sleep(isFastMode ? 200 : 500);
      } catch (postErr) {
        console.error("Error saving post:", postErr.message);
      }
    }

    // 4. Social Engagement: Like Recent Application Posts
    try {
      const recentPostsRes = await fetch(`${BACKEND_URL}/api/sim/posts`);
      const recentPostsData = await recentPostsRes.json();
      if (Array.isArray(recentPostsData?.posts) && recentPostsData.posts.length > 0) {
        const randomTargetPost = recentPostsData.posts[Math.floor(Math.random() * recentPostsData.posts.length)];
        const randomLiker = personas[Math.floor(Math.random() * personas.length)];
        if (randomTargetPost && randomLiker) {
          await fetch(`${BACKEND_URL}/api/sim/like`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              handle: randomLiker.handle,
              post_id: randomTargetPost._id,
            }),
          });
          console.log(`❤️ [FEED LIKE] ${randomLiker.handle} liked an existing post in the feed!`);
        }
      }
    } catch {}

    // Check completion condition
    if (isOneShot || (isSeedMode && postsGenerated >= targetPostsCount)) {
      console.log("\n==================================================================");
      console.log(`🎉 RAPID SEED COMPLETE! Generated ${postsGenerated} diverse human posts, threaded replies, and likes.`);
      console.log("Your application feeds, hashtags, comments, and like counts are now packed with vibrant activity!");
      console.log("==================================================================\n");
      break;
    }

    const cycleDelay = isFastMode ? 2000 : 5000;
    console.log(`⏳ Next batch cycle in ${(cycleDelay / 1000).toFixed(1)}s...`);
    await sleep(cycleDelay);
  }
}

startSimulation().catch((err) => {
  console.error("Fatal simulation engine error:", err);
  process.exit(1);
});
