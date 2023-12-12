import {Principal} from "@dfinity/principal";
import {idlFactory} from "../declarations/feed/feed.did.js";
import {getActor} from "../utils/Actor";
import {PostImmutable} from "../declarations/feed/feed";


export default class Feed {

  private readonly canisterId: Principal;

  constructor(canisterId: Principal) {
    this.canisterId = canisterId;
  }

  private async getActor() {
    return await getActor.createActor(idlFactory, this.canisterId.toString());
  }

  async createPost() {
    const actor = await this.getActor()
    try {
      const checkAvailableBucket = await this.checkAvailableBucket()
      if (!checkAvailableBucket) throw new Error("have no available bucket")
      const res = await actor.createPost("test", "我是一个推文") as string
      console.log("post res", res)
      return res
    } catch (e) {
      console.log("post error", e)
      throw e
    }
  }

  async checkAvailableBucket(): Promise<boolean> {
    const actor = await this.getActor()
    try {
      return await actor.checkAvailableBucket() as boolean
    } catch (e) {
      console.log("checkAvailableBucket", e)
      throw e
    }
  }

  async getAllPost(): Promise<PostImmutable[]> {
    const actor = await this.getActor()
    try {
      return await actor.getAllPost() as PostImmutable[]
    } catch (e) {
      console.log("getAllPost", e)
      throw e
    }
  }

  // async createComment(postId, content) {
  //     const result = await this.actor.createComment(postId, content);
  //     return result;
  // }

  // async createRepost(postId) {
  //     const result = await this.actor.createRepost(postId);
  //     return result;
  // }

  // async createLike(postId) {
  //     const result = await this.actor.createLike(postId);
  //     return result;
  // }

  // async getFeedNumber() {
  //     const result = await this.actor.getFeedNumber();
  //     return result;
  // }

  // async getFeed(postId) {
  //     return await this.actor.getFeed(postId);
  // }

  async getLatestFeed(n: number): Promise<PostImmutable[]> {
    const actor = await this.getActor()
    try {
      const res = await actor.getLatestFeed(BigInt(n)) as PostImmutable[]
      console.log("feeds", res)
      return res
    } catch (e) {
      console.log("getLatestFeed error", e)
      throw e
    }
  }

}
