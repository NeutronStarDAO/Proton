import {Principal} from "@dfinity/principal";
import {idlFactory} from "../declarations/feed/feed.did.js";
import {getActor} from "../utils/Actor";
import {Post} from "../declarations/feed/feed";
import {updateAllData} from "../redux";


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

  async getAllPost() {
    const actor = await this.getNoIdentityActor()
    try {
      const res = await actor.get_all_post() as Post[]
      updateAllData({allPost: res})
      return res
    } catch (e) {
      console.log("getAllPost", e)
      throw e
    }
  }

  async getAllPostWithoutUpate() {
    const actor = await this.getNoIdentityActor()
    try {
      return await actor.getAllPost() as Post[]
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

  async getLatestFeed(n: number) {
    const actor = await this.getActor()
    try {
      const res = await actor.get_latest_feed(BigInt(n)) as Post[]
      updateAllData({allFeed: res})
      return res
    } catch (e) {
      console.log("getLatestFeed error", e)
      throw e
    }
  }

}
