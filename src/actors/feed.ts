import {Principal} from "@dfinity/principal";
import {idlFactory} from "../declarations/feed/feed.did.js";
import {getActor} from "../utils/Actor";
import {Post} from "../declarations/feed/feed";


export default class Feed {

  private readonly canisterId: Principal;

  constructor(canisterId: Principal) {
    this.canisterId = canisterId;
  }

  private async getActor() {
    return await getActor.createActor(idlFactory, this.canisterId.toString());
  }

  private async getNoIdentityActor() {
    return await getActor.noIdentityActor(idlFactory, this.canisterId.toString());
  }

  async createPost(content: string, p_urls: string[]) {
    const actor = await this.getActor()
    try {
      const checkAvailableBucket = await this.checkAvailableBucket()
      if (!checkAvailableBucket) throw new Error("have no available bucket")
      return await actor.create_post(content, p_urls) as string
    } catch (e) {
      console.log("post error", e)
      throw e
    }
  }

  async checkAvailableBucket(): Promise<boolean> {
    const actor = await this.getActor()
    try {
      return await actor.check_available_bucket() as boolean
    } catch (e) {
      console.log("checkAvailableBucket", e)
      throw e
    }
  }

  async getAllPost(who: Principal) {
    const actor = await this.getNoIdentityActor()
    try {
      const res = await actor.get_all_post(who) as Post[]
      return res
    } catch (e) {
      console.log("getAllPost", e)
      throw e
    }
  }


  async createComment(postId: string, content: string) {
    const actor = await this.getActor()
    try {
      return await actor.create_comment(postId, content) as boolean
    } catch (e) {
      console.log("createComment", e)
      throw e
    }
  }

  async deletePost(postId: string) {
    const actor = await this.getActor()
    try {
      return await actor.delete_post(postId) as boolean
    } catch (e) {
      console.log("deletePost", e)
      throw e
    }
  }

  async createRepost(postId: string) {
    const actor = await this.getActor()
    try {
      return await actor.create_repost(postId) as boolean
    } catch (e) {
      console.log("createRepost", e)
      throw e
    }
  }

  async createLike(postId: string) {
    const actor = await this.getActor()
    try {
      return await actor.create_like(postId) as boolean
    } catch (e) {
      console.log("createLike", e)
      throw e
    }
  }

  async getPost(postId: string) {
    const actor = await this.getActor()
    try {
      return await actor.get_post(postId) as [] | [Post]
    } catch (e) {
      console.log("getPost", e)
      throw e
    }
  }

  async getLatestFeed(who: Principal, n: number) {
    const actor = await this.getActor()
    try {
      const res = await actor.get_latest_feed(who, BigInt(n)) as Post[]
      return res
    } catch (e) {
      console.log("getLatestFeed error", e)
      throw e
    }
  }

  async getHomeFeedByLength(who: Principal, start: number, count: number) {
    const actor = await this.getActor()
    try {
      return await actor.get_home_feed_by_length(who, BigInt(start), BigInt(count)) as Post[]
    } catch (e) {
      console.log("getHomeFeedByLength error", e)
      throw e
    }
  }
}
