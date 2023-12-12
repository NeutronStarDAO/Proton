import {idlFactory} from "../declarations/user/user.did.js";
import {getActor} from "../utils/Actor";
import {NewProfile, Profile} from "../declarations/user/user";
import {Principal} from "@dfinity/principal";

const userCanisterId = "j6sa4-jyaaa-aaaan-qgjxq-cai"

class User {

  private static async getActor() {
    return await getActor.createActor(idlFactory, userCanisterId);
  }

  async createProfile(newProfile: NewProfile) {
    const actor = await User.getActor()
    try {
      await actor.createProfile(newProfile)
      console.log("create")
    } catch (e) {
      console.log("createProfile", e)
      throw e
    }
  }

  async getProfile(who: Principal): Promise<[] | [Profile]> {
    const actor = await User.getActor()
    try {
      return await actor.getProfile(who) as [] | [Profile]
    } catch (e) {
      console.log("getProfile", e)
      throw e
    }
  }

  async getFollowerNumber(who: Principal): Promise<number> {
    const actor = await User.getActor()
    try {
      const res = await actor.getFollowerNumber(who) as bigint
      return Number(res)
    } catch (e) {
      console.log("getFollowerNumber", e)
      throw e
    }
  }

  async getFollowingNumber(who: Principal): Promise<number> {
    const actor = await User.getActor()
    try {
      const res = await actor.getFollowingNumber(who) as bigint
      return Number(res)
    } catch (e) {
      console.log("getFollowingNumber", e)
      throw e
    }
  }
}


export const userApi = new User()

