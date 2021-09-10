import { RoomUser } from "../../entity/RoomUser";
import { User } from "../../entity/User";
import { Arg, Ctx, Mutation, Resolver } from "type-graphql";
import { MyContext } from "src/types/MyContext";

@Resolver()
export class AddUserToRoomResolver {
  @Mutation(() => Boolean)
  async addUserToRoom(
    @Arg("roomId") roomId: number,
    @Arg("emailOrUsernameTag") emailOrUsername: string,
    @Ctx() ctx: MyContext
  ): Promise<Boolean> {
    const valid = await RoomUser.findOne({
      where: {
        userId: ctx.req.session.userId,
        roomId,
      },
    });

    if (!valid) {
      return false;
    }

    const tag = emailOrUsername.split("#");

    const user = await User.findOne({
      where: [{ email: emailOrUsername }, { username: tag[0], tag: tag[1] }],
    });

    if (!user) {
      return false;
    }

    const userId = user?.id;

    const isUserAlreadInRoom = await RoomUser.findOne({
      where: { roomId, userId },
    });

    if (isUserAlreadInRoom) {
      return false;
    }

    await RoomUser.create({ roomId, userId }).save();
    return true;
  }
}
