import {idlFactory} from "../declarations/user/user.did.js";
import {getActor} from "../utils/Actor";
import {Profile} from "../declarations/user/user";
import {Principal} from "@dfinity/principal";

const userCanisterId = "bkyz2-fmaaa-aaaaa-qaaaq-cai"

class User {

  private static async getActor() {
    return await getActor.createActor(idlFactory, userCanisterId);
  }

  async createProfile(newProfile: Profile) {
    const actor = await User.getActor()
    try {
      const res = await actor.create_profile(newProfile)
      console.log("create", res)
    } catch (e) {
      console.log("createProfile", e)
      throw e
    }
  }

  async getProfile(who: Principal): Promise<Profile | undefined> {
    const actor = await User.getActor()
    try {
      const res = await actor.get_profile(who) as [Profile]
      return res[0]
    } catch (e) {
      console.log("getProfile", e)
      throw e
    }
  }

  async batchGetProfile(who: Principal[]): Promise<Profile[]> {
    const actor = await User.getActor();
    try {
      return await actor.batch_get_profile(who) as Profile[]
    } catch (e) {
      console.log("batchGetProfile", e)
      throw e
    }
  }

  async getFollowerNumber(who: Principal): Promise<number> {
    const actor = await User.getActor()
    try {
      const res = await actor.get_follower_number(who) as bigint
      return Number(res)
    } catch (e) {
      console.log("getFollowerNumber", e)
      throw e
    }
  }

  async getFollowingNumber(who: Principal): Promise<number> {
    const actor = await User.getActor()
    try {
      const res = await actor.get_following_number(who) as bigint
      return Number(res)
    } catch (e) {
      console.log("getFollowingNumber", e)
      throw e
    }
  }

  async getFollowingList(who: Principal): Promise<Principal[]> {
    const actor = await User.getActor()
    try {
      return await actor.get_following_list(who) as Principal[]
    } catch (e) {
      console.log("getFollowingList", e)
      throw e
    }
  }

  async getFollowerList(who: Principal): Promise<Principal[]> {
    const actor = await User.getActor()
    try {
      return await actor.get_followers_list(who) as Principal[]
    } catch (e) {
      console.log("getFollowerList", e)
      throw e
    }
  }
  async follow(who: Principal) {
    const actor = await User.getActor()
    try {
      await actor.follow(who)
    } catch (e) {
      console.log("follow", e)
      throw e
    }
  }

  async isFollowed(A: Principal, B: Principal) {//判断 A 是否是 B的粉丝
    const actor = await User.getActor()
    try {
      return await actor.is_followed(A, B) as boolean
    } catch (e) {
      console.log("isFollowed", e)
      throw e
    }
  }
}


export const userApi = new User()
