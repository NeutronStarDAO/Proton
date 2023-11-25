import { createRequire } from "node:module";
import { createActor } from "../../src/declarations/bucket/index.js";
import { _getHttpAgent } from './utils.js';

export class Bucket {
  constructor(canisterId, identity) {
    this.canisterId = canisterId;
    this.identity = identity;
    this.actor = createActor(canisterId, {
      agent: _getHttpAgent(identity),
    });
  }

  async getPost(postId) {
    const result = await this.actor.getPost(postId);
    if (result.length > 0) {
      return result;
    } else {
      console.error("null post");
    }
  }
}