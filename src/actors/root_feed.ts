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

  async getAccountIdentifier(who: Principal): Promise<string> {
    const actor = await rootFeed.getActor()
    try {
      return await actor.get_account_identifier(who) as string
    } catch (e) {
      console.log("get_account_identifier", e)
      return ""
    }
  }

  async transfer_icp(to: Principal, amount: bigint) {
    const actor = await rootFeed.getActor()
    try {
      return await actor.transfer_icp(to, amount)
    } catch (e) {
      console.log("transfer_icp error", e)
      throw e
    }

  }

}

export const rootFeedApi = new rootFeed()
