import { HttpAgent } from "@dfinity/agent";
import { createRequire } from "node:module";
import { createActor } from '../../src/declarations/feed/index.js';
import { _getHttpAgent } from './utils.js';
import assert from "assert";

export class Feed {

  constructor(canisterId, identity) {
    this.canisterId = canisterId;
    this.identity = identity;
    this.actor = createActor(canisterId, {
      agent: _getHttpAgent(identity),
    });
  }

  async createPost() {
      // 发帖前更新当前可用的bucket
      assert(await this.actor.checkAvailableBucket(), true);
      
      const result = await this.actor.createPost(
          "this is title",
          "this is content"
      );
      // console.log('createPost result', result);
      return result
  }

  async createComment(postId, content) {
    const result = await this.actor.createComment(postId, content);
    return result;
  }

  async createRepost(postId) {
    const result = await this.actor.createRepost(postId);
    return result;
  }
  
  async createLike(postId) {
    const result = await this.actor.createLike(postId);
    return result;
  }

  async getFeedNumber() {
    const result = await this.actor.getFeedNumber();
    return result;
  }

  async getFeed(postId) {
    return await this.actor.getFeed(postId);
  }

  async getLatestFeed(n) {
    return await this.actor.getLatestFeed(n);
  }

}
