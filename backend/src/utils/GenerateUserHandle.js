import User from "../models/user.model.js";

const adjectives = [
  "Cool",
  "Happy",
  "Tiny",
  "Fluffy",
  "Clever",
  "Sneaky",
  "Brave",
  "Shy",
  "Witty",
  "Lazy",
];

const nouns = [
  "Fox",
  "Banana",
  "Tiger",
  "Panda",
  "Dragon",
  "Penguin",
  "Koala",
  "Squirrel",
  "Unicorn",
  "Owl",
];

const generateUserHandle = async () => {
  let handle;
  let isUnique = false;

  while (!isUnique) {
    const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    const number = Math.floor(1000 + Math.random() * 9000); // 4-digit number

    handle = `${adjective}${noun}${number}`;

    const existingUser = await User.findOne({ userHandle: handle });
    if (!existingUser) {
      isUnique = true;
    }
  }

  return handle;
};

export default generateUserHandle;
