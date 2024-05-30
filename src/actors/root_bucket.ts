import {getActor} from "../utils/Actor.js";
import {idlFactory} from "../declarations/root_bucket/root_bucket.did.js"
import {Principal} from "@dfinity/principal";

const rootPostCai = "lyksr-aiaaa-aaaan-qgj2q-cai"

class rootPost {
  private static async getActor() {
    return await getActor.createActor(idlFactory, rootPostCai);
  }

  async getAvailableBucket() {
    const actor = await rootPost.getActor()
    try {
      return await actor.getAvailableBucket() as [] | [Principal]
    } catch (e) {
      console.log("getAvailableBucket", e)
      throw e
    }
  }
}

export const rootPostApi = new rootPost()