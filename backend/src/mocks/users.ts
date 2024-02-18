import { User, UserType } from "../models/user";
import { Hash } from "../utils/hash";

const numberOfUsers = 10;

export const users = async (): Promise<void> => {
  const users: UserType[] = [];

  for (let i = 1; i <= numberOfUsers; i++) {
    if (await User.findOne({ email: `user${i}@gmail.com` }) !== null) continue;

    users.push({
      nickname: `user${i}`,
      email: `user${i}@gmail.com`,
      password: Hash.make("Password*123"),
    });
  }

  if (users.length === 0) return;

  await User.bulkCreate(users);
};
