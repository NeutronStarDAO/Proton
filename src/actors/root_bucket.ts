import {idlFactory} from "../declarations/root_bucket/root_bucket.did.js"
import {getActor} from "../utils/Actor";
import {Post} from "../declarations/root_bucket/root_bucket";

const root_bucket = "pc5ag-oiaaa-aaaan-qmthq-cai"

class rootPost {
  private static async getActor() {
    return await getActor.createActor(idlFactory, root_bucket);
  }

  async get_buckets_latest_feed(count: number) {
    const actor = await rootPost.getActor()
    try {
      return await actor.get_buckets_latest_feed(BigInt(count)) as Post[]
    } catch (e) {
      throw e
    }
  }
}

export const rootPostApi = new rootPost()
