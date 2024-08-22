import {getActor} from "../utils/Actor";
import {idlFactory} from "../declarations/root_feed/root_feed.did.js"
import {Principal} from "@dfinity/principal";
import {TransferResult, WalletTX} from "../declarations/root_feed/root_feed";

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

  async ckBTCBalance(account: Principal): Promise<bigint> {
    const actor = await rootFeed.getActor()
    try {
      return await actor.ckBTC_balance(account) as bigint
    } catch (e) {
      console.log("ckBTCBalance", e)
      return BigInt(0)
    }
  }

  async ghostBalance(account: Principal): Promise<bigint> {
    const actor = await rootFeed.getActor()
    try {
      return await actor.ghost_balance(account) as bigint
    } catch (e) {
      console.log("ghostBalance", e)
      return BigInt(0)
    }
  }

  async icpBalance(account: Principal): Promise<bigint> {
    const actor = await rootFeed.getActor()
    try {
      return await actor.icp_balance(account) as bigint
    } catch (e) {
      console.log("ghostBalance", e)
      return BigInt(0)
    }
  }

  async transferICP(to: Principal, amount: bigint): Promise<bigint> {
    const actor = await rootFeed.getActor()
    try {
      const res = await actor.transfer_icp(to, amount) as TransferResult
      if ("Ok" in res)
        return res.Ok
      throw new Error(Object.keys(res.Err)[0])
    } catch (e) {
      console.log("transferICP", e)
      throw e
    }

  }

  async icpTx(who: Principal): Promise<WalletTX[]> {

    const actor = await rootFeed.getActor()
    try {
      return await actor.icp_tx(who) as WalletTX[]
    } catch (e) {
      console.log("icpTx", e)
      return []
    }

  }


}

export const rootFeedApi = new rootFeed()
