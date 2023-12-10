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

  // async createPost() {
  //     // 发帖前更新当前可用的bucket
  //     assert(await this.actor.checkAvailableBucket(), true);

  //     const result = await this.actor.createPost(
  //         "this is title",
  //         "this is content"
  //     );
  //     // console.log('createPost result', result);
  //     return result
  // }

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
