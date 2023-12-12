import {Principal} from "@dfinity/principal";
import {idlFactory} from "../declarations/feed/feed.did.js";
import {getActor} from "../utils/Actor";
import {PostImmutable} from "../declarations/feed/feed";
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

  async createPost(title: string, content: string) {
    const actor = await this.getActor()
    try {
      const checkAvailableBucket = await this.checkAvailableBucket()
      if (!checkAvailableBucket) throw new Error("have no available bucket")
      return await actor.createPost(title ? title : "", content) as string
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

  async getAllPost() {
    const actor = await this.getNoIdentityActor()
    try {
      const res = await actor.getAllPost() as PostImmutable[]
      updateAllData({allPost: res})
    } catch (e) {
      console.log("getAllPost", e)
      throw e
    }
  }

  async getAllPostWithoutUpate() {
    const actor = await this.getNoIdentityActor()
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

  async getLatestFeed(n: number) {
    const actor = await this.getActor()
    try {
      const res = await actor.getLatestFeed(BigInt(n)) as PostImmutable[]
      updateAllData({allFeed: res})
    } catch (e) {
      console.log("getLatestFeed error", e)
      throw e
    }
  }

}
