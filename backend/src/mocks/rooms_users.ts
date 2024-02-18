import { Room, RoomType } from "../models/room";
import { RoomsUser, RoomsUserType } from "../models/rooms_user";
import { User, UserType } from "../models/user";

export const roomsUsers = async (): Promise<void> => {
  const users: UserType[] = await User.all();
  const rooms: RoomType[] = await Room.all();
  const _roomsUsers: RoomsUserType[] = [];

  if (rooms.length === 0 || users.length === 0) return;

  for (const room of rooms) {
    if (!room || !room._id) continue;

    for (const user of users) {
      if (!user || !user._id) continue;
      if (await RoomsUser.findOne({ user: user._id, room: room._id })) continue;
      if (Math.random() < 0.5 && !room.is_public) continue;

      _roomsUsers.push({
        user: user._id,
        room: room._id,
      });
    }
  }

  if (_roomsUsers.length === 0) return;

  await RoomsUser.bulkCreate(_roomsUsers);
};
