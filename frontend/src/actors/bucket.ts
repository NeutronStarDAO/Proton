import {Principal} from "@dfinity/principal";
import {idlFactory} from "../declarations/bucket/bucket.did.js";
import {getActor} from "../utils/Actor";
import {PostImmutable} from "../declarations/bucket/bucket";


export default class Bucket {

  private readonly canisterId: Principal;

  constructor(canisterId: Principal) {
    this.canisterId = canisterId;
  }

  private async getActor() {
    return await getActor.createActor(idlFactory, this.canisterId.toString());
  }

  async getLatestFeed(n: number) {
    const actor = await this.getActor()
    try {
      return await actor.getLatestFeed(BigInt(n)) as PostImmutable[]
    } catch (e) {
      console.log("getLatestFeed", e)
      throw e
    }
  }

}
