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

  async createComment(postId: string, content: string) {
    const actor = await this.getActor()
    try {
      return await actor.createComment(postId, content) as boolean
    } catch (e) {
      console.log("createComment", e)
      throw e
    }
  }

  async createRepost(postId: string) {
    const actor = await this.getActor()
    try {
      return await actor.createRepost(postId) as boolean
    } catch (e) {
      console.log("createRepost", e)
      throw e
    }
  }

  async createLike(postId: string) {
    const actor = await this.getActor()
    try {
      return await actor.createLike(postId) as boolean
    } catch (e) {
      console.log("createLike", e)
      throw e
    }
  }

  async getPost(postId: string) {
    const actor = await this.getActor()
    try {
      return await actor.getPost(postId) as [] | [PostImmutable]
    } catch (e) {
      console.log("getPost", e)
      throw e
    }
  }

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
