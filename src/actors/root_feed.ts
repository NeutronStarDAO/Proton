import {getActor} from "../utils/Actor";
import {idlFactory} from "../declarations/root_feed/root_feed.did.js"
import {Principal} from "@dfinity/principal";

const rootFeedCai = "br5f7-7uaaa-aaaaa-qaaca-cai"

class rootFeed {

  private static async getActor() {
    return await getActor.createActor(idlFactory, rootFeedCai);
  }

  async createFeedCanister(): Promise<Principal> {
    const actor = await rootFeed.getActor()
    try {
      const res = await actor.create_feed_canister() as [] | [Principal]
      console.log("create res", res)
      if (res[0]) return res[0]
      throw new Error("create error")
    } catch (e) {
      console.log("create error", e)
      throw e
    }
  }

  async getUserFeedCanister(principal: Principal): Promise<Principal | undefined> {
    const actor = await rootFeed.getActor()
    try {
      const res = await actor.get_user_feed_canister(principal) as [] | [Principal]
      return res[0]
    } catch (e) {
      console.log("get userCai error", e)
    }
  }

}

export const rootFeedApi = new rootFeed()
