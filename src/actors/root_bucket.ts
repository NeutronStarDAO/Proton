import {idlFactory} from "../declarations/root_bucket/root_bucket.did.js"
import {Principal} from "@dfinity/principal";
import {getActor} from "../utils/Actor";

const rootPostCai = "be2us-64aaa-aaaaa-qaabq-cai"

class rootPost {
  private static async getActor() {
    return await getActor.createActor(idlFactory, rootPostCai);
  }

  async getAvailableBucket() {
    const actor = await rootPost.getActor()
    try {
      return await actor.get_availeable_bucket() as [] | [Principal]
    } catch (e) {
      console.log("getAvailableBucket", e)
      throw e
    }
  }
}

export const rootPostApi = new rootPost()
