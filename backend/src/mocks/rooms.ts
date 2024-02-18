import { Room, RoomType } from "../models/room";
import { User, UserType } from "../models/user";

export const rooms = async (): Promise<void> => {
  const users: UserType[] = await User.all();
  const rooms: RoomType[] = [];

  if (users.length === 0) return;

  for (const user of users) {
    if (!user || !user._id) continue;
    if (await Room.findOne({ user: user._id }) !== null) continue;

    rooms.push({
      name: `Room ${user.nickname}`,
      user: user._id,
      is_public: Math.random() > 0.5,
    });
  }

  if (rooms.length === 0) return;

  await Room.bulkCreate(rooms);
};
