import {getActor} from "../utils/Actor";
import {idlFactory} from "../declarations/root_feed/root_feed.did.js"
import {Principal} from "@dfinity/principal";

const rootFeedCai = "n7aoo-5aaaa-aaaan-qmtia-cai"

class rootFeed {

  private static async getActor() {
    return await getActor.createActor(idlFactory, rootFeedCai);
  }

  async init_user_feed(): Promise<Principal> {
    const actor = await rootFeed.getActor()
    try {
      const res = await actor.init_user_feed() as Principal
      console.log("create res", res)
      return res
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
