import { Message, type MessageType } from "../models/message";
import { Reaction } from "../models/reaction";
import { User } from "../models/user";

export const reactions = async (): Promise<void> => {
  const users = await User.all();
  const messages: MessageType[] = await Message.all();
  const emojis = ["👍", "👎", "❤️", "🚀", "🤣", "😒", "😢", "🤩", "🤔"];

  if (messages.length === 0) return;

  for (const message of messages) {
    if (!message || !message._id) continue;

    if (Math.random() < 0.5) continue;

    let count = Math.floor(Math.random() * 5);

    while (count-- > 0) {
      let user = users[Math.floor(Math.random() * users.length)];
      users.splice(users.indexOf(user), 1);

      if (!user || !user._id) continue;

      await Reaction.create(message, {
        user: user._id,
        message: message._id,
        content: emojis[Math.floor(Math.random() * emojis.length)],
      });
    }
  }
};
