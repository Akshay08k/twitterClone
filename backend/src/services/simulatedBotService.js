import { GoogleGenAI } from "@google/genai";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import User from "../models/user.model.js";
import Messages from "../models/messages.model.js";
import { Comment } from "../models/comments.model.js";
import { Notification } from "../models/notification.model.js";
import Post from "../models/post.model.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../../.env") });
dotenv.config({ path: path.join(__dirname, "../simulator/.env") });

const apiKey =
  process.env.GEMINI_API_KEY ||
  process.env.GEMINI_KEY ||
  process.env.API_KEY;

const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

// Load Personas
const personasPath = path.join(__dirname, "../../simulator/personas.json");
let personas = [];
try {
  personas = JSON.parse(fs.readFileSync(personasPath, "utf8"));
} catch (e) {
  console.warn("Could not load personas.json:", e.message);
}

const MODEL_POOL = [
  "gemini-3.5-flash-lite", // 500 RPD, 15 RPM
  "gemini-3.1-flash-lite", // 500 RPD, 15 RPM
  "gemini-3.5-flash",
  "gemini-3.6-flash",
  "gemini-3.7-flash",
  "gemini-flash-lite-latest",
];

// Fallback replies for personas if Gemini is rate limited
const FALLBACK_DM_REPLIES = {
  "@chef_marco": [
    "Hey! That reminds me of this little trattoria in Bologna. Simple food with lots of love is everything! What's your favorite meal?",
    "Ciao! Just perfected my focaccia recipe today. Crispy on the outside, fluffy inside. You doing anything fun today?",
    "Always happy to chat food! What are you having for dinner tonight?",
  ],
  "@wander_luna": [
    "Hey there! Just organizing some 35mm film scans from my trip to Kyoto. Have you been traveling lately?",
    "Hello! Always dreaming about the next sunrise viewpoint. Where is your dream destination right now?",
    "Hey! Life's an adventure. Hope your day is filled with great moments!",
  ],
  "@relatable_dan": [
    "Hey! Currently negotiating with myself whether to do laundry or take a 3-hour nap. How's your day going?",
    "Haha hey! Just poured my third iced coffee of the day. Send help or snacks please.",
    "Hey there! Surviving another week of adulting, barely. What are you up to?",
  ],
  "@coach_sarah": [
    "Hey! Love hearing from you! Remember to hydrate and take a nice deep stretch today. You're doing amazing! ✨",
    "Hello! Hope you're taking care of your body and mind today. Did you get any fresh air?",
    "Hey! Small consistent wins add up to big results. Keep crushing it!",
  ],
  "@screen_buff": [
    "Hey! Just finished rewatching a 90s classic. What's the best movie you've seen recently?",
    "Hey! Always up for a cinema debate. Have you checked out any good shows lately?",
    "Hello! Cinema is life. What genre are you in the mood for?",
  ],
  "@bookish_elena": [
    "Hey! Curled up with hot tea and a brilliant mystery novel right now. What are you reading?",
    "Hello! A quiet corner and a good paperback is pure therapy. Hope you're having a lovely day!",
    "Hey there! Book recommendations are my favorite thing. Need any good fiction suggestions?",
  ],
  "@nature_roots": [
    "Hey! Just got back from a morning trail hike in the pine trees. Nature always resets the mind. How are you?",
    "Hello! Hope you got some sunshine today. Spending time outside makes all the difference!",
    "Hey! Tending to my houseplants right now. How's your week treating you?",
  ],
  "@wholesome_tails": [
    "Hey! Cooper just wagged his tail and says hello! 🐾 Hope your day is as happy as a dog with a brand new tennis ball!",
    "Hello! My golden just stole another sock and is doing victory laps. How is your day going?",
    "Hey! Sending you positive puppy vibes and tail wags today! ✨",
  ],
  "@melody_vibes": [
    "Hey! Spinning a vintage jazz vinyl right now. What songs have you had on repeat today?",
    "Hello! Nothing cures a stressful week like an incredible playlist. What music are you listening to?",
    "Hey there! Dropping good frequencies your way. Hope your day has a great soundtrack!",
  ],
  "@midnight_thinker": [
    "Hello. In the quiet hours, life always feels a bit clearer. Hope you find peace and rest today.",
    "Hey. Taking things one slow breath at a time. It's a gift to pause in such a busy world.",
    "Hello there. Hope whatever you're working on brings you quiet fulfillment.",
  ],
  "@sports_zone": [
    "Yo! What an intense match that was! Are you catching the game tonight?",
    "Hey there! Game day energy all week. What's your favorite team right now?",
    "What's up! Big plays and pure adrenaline today. Hope you're having an awesome week!",
  ],
  "@pixel_nova": [
    "Hey! Just took a break from streaming. Finally beat that brutal boss on 1 HP! What games are you playing?",
    "Yo! Cozy gaming setup is ready for the night. What's your all-time favorite game?",
    "Hey there! Ready for some late night gaming sessions. How's your day been?",
  ],
};

async function generateAIResponse(systemInstruction, promptText) {
  if (!ai) return null;

  for (const model of MODEL_POOL) {
    try {
      const res = await ai.models.generateContent({
        model,
        contents: promptText,
        config: {
          systemInstruction,
          temperature: 0.85,
        },
      });
      if (res?.text) return res.text.trim();
    } catch (err) {
      // If quota or error, continue to next model
    }
  }
  return null;
}

// 1. Asynchronously reply to a user's direct message
export async function handleSimulatedBotReply({ botUserId, senderUserId, userMessage, io }) {
  try {
    const botUser = await User.findById(botUserId);
    if (!botUser) return;

    const botHandle = `@${(botUser.userHandle || "").toLowerCase()}`;
    const persona = personas.find(
      (p) => p.handle.toLowerCase() === botHandle || p.name.toLowerCase() === botUser.username?.toLowerCase()
    );

    // If recipient is not one of our simulated personas, ignore
    if (!persona && !botUser.email?.endsWith("@simulator.ai")) return;

    // Realistic typing delay: 1.5 - 2.5 seconds
    const delay = Math.floor(Math.random() * 1000) + 1500;
    setTimeout(async () => {
      try {
        let replyText = null;

        if (persona) {
          const prompt = `A user on Twitter/Twitty just sent you this private Direct Message: "${userMessage}". Write a short, warm, realistic human reply (max 160 characters). Sound like a real person having a casual DM chat. Match your personality.`;
          replyText = await generateAIResponse(persona.system_instruction, prompt);

          if (!replyText) {
            const fallbackList = FALLBACK_DM_REPLIES[persona.handle] || [
              `Hey! Always great to connect with you. Hope you're having a wonderful day!`,
              `Hello! That sounds awesome. What else have you been up to?`,
            ];
            replyText = fallbackList[Math.floor(Math.random() * fallbackList.length)];
          }
        } else {
          replyText = `Hey there! Great to hear from you. Hope you're having a fantastic day!`;
        }

        const botReplyMessage = await Messages.create({
          content: replyText,
          sender: botUserId,
          receiver: senderUserId,
          attachments: [],
        });

        await botReplyMessage.populate("sender", "username avatar userHandle");

        if (io) {
          io.to(senderUserId.toString()).emit("receiveMessage", botReplyMessage);
          io.to(botUserId.toString()).emit("receiveMessage", botReplyMessage);
        }
      } catch (err) {
        console.warn("handleSimulatedBotReply async error:", err.message);
      }
    }, delay);
  } catch (err) {
    console.warn("handleSimulatedBotReply init error:", err.message);
  }
}

// 2. Asynchronously comment on a real user's new post
export async function handleSimulatedPostReaction({ postId, postDescription, authorUserId, io }) {
  try {
    const author = await User.findById(authorUserId);
    if (!author || author.email?.endsWith("@simulator.ai")) return; // Only react to real users

    // Realistic reaction delay: 3 - 6 seconds
    const delay = Math.floor(Math.random() * 3000) + 3000;
    setTimeout(async () => {
      try {
        // Pick a random persona
        const persona = personas[Math.floor(Math.random() * personas.length)];
        if (!persona) return;

        const cleanHandle = persona.handle.replace(/^@/, "").toLowerCase();
        let botUser = await User.findOne({ userHandle: cleanHandle });
        if (!botUser) return;

        const prompt = `A user posted this tweet: "${postDescription}". Write a brief, realistic, engaging human comment/reply (max 140 chars). You can agree, share relatable humor, compliment, or ask a quick friendly question. Match your persona.`;
        let commentText = await generateAIResponse(persona.system_instruction, prompt);

        if (!commentText) {
          const fallbacks = [
            "This is so relatable! 👏",
            "Honestly agree with this 100%.",
            "Love this post! Hope your day is going great! ✨",
            "Couldn't agree more with you on this!",
          ];
          commentText = fallbacks[Math.floor(Math.random() * fallbacks.length)];
        }

        const newComment = await Comment.create({
          content: commentText,
          user: botUser._id,
          post: postId,
        });

        await newComment.populate("user", "username avatar userHandle");

        // Create notification for the post author
        const notification = await Notification.create({
          type: "comment",
          sourceUserId: botUser._id,
          receiverUserId: authorUserId,
          sourcePostId: postId,
          content: `${botUser.username} commented on your post`,
          is_read: false,
          isHidden: false,
        });

        if (io) {
          io.to(authorUserId.toString()).emit("notification", notification);
        }
      } catch (err) {
        console.warn("handleSimulatedPostReaction async error:", err.message);
      }
    }, delay);
  } catch (err) {
    console.warn("handleSimulatedPostReaction init error:", err.message);
  }
}
