import {idlFactory} from "../declarations/user/user.did.js";
import {getActor} from "../utils/Actor";
import {Profile} from "../declarations/user/user";
import {Principal} from "@dfinity/principal";

const userCanisterId = "pf4gs-dqaaa-aaaan-qmtha-cai"

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

  async updateProfile(newProfile: Profile) {
    const actor = await User.getActor()
    try {
      const res = await actor.update_profile(newProfile)
      console.log("updateProfile", res)
    } catch (e) {
      console.log("updateProfile", e)
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

  async cancel_follow(who: Principal) {
    const actor = await User.getActor()
    try {
      await actor.cancle_follow(who)
    } catch (e) {
      console.log("cancel_follow", e)
      throw e
    }
  }

  async is_handle_available(handle: string) {
    const actor = await User.getActor()
    try {
      return await actor.is_handle_available(handle) as boolean
    } catch (e) {
      console.log("is_handle_available", e)
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

  async update_handle(handle: string) {
    const actor = await User.getActor()
    try {
      return await actor.update_handle(handle) as boolean
    } catch (e) {
      console.log("update_handle", e)
      throw e
    }
  }

  add_black_list(who: Principal) {
    return new Promise(async (resolve, reject) => {
      const actor = await User.getActor()
      try {
        const res = await actor.add_black_list(who) as boolean
        resolve(res)
      } catch (e) {
        console.log("add_black_list", e)
        reject(e)
      }
    })
  }
  is_black_follow_list(A: Principal, B: Principal) {//B 是否在A的黑名单中
    return new Promise<boolean>(async (resolve, reject) => {
      const actor = await User.getActor()
      try {
        const res = await actor.is_black_follow_list(A, B) as boolean
        resolve(res)
      } catch (e) {
        console.log("is_black_follow_list", e)
        reject(e)
      }
    })
  }

  cancle_black_list(who: Principal) {
    return new Promise(async (resolve, reject) => {
        const actor = await User.getActor()
        try {
            const res = await actor.cancle_black_list(who) as boolean
            resolve(res)
        } catch (e) {
            console.log("cancle_black_list", e)
            reject(e)
        }
    })
  }
}


export const userApi = new User()
