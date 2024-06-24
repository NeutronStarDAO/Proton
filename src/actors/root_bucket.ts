import {idlFactory} from "../declarations/root_bucket/root_bucket.did.js"
import {getActor} from "../utils/Actor";
import {Post} from "../declarations/root_bucket/root_bucket";

const rootPostCai = "be2us-64aaa-aaaaa-qaabq-cai"

class rootPost {
  private static async getActor() {
    return await getActor.createActor(idlFactory, rootPostCai);
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
