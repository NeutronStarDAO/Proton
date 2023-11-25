import { HttpAgent } from "@dfinity/agent";
import { createRequire } from "node:module";
import { createActor } from '../../src/declarations/feed/index.js';
import { _getHttpAgent } from './utils.js';

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
        console.log("checkAvailableBucket : ", (await this.actor.checkAvailableBucket()));
        
        const result = await this.actor.createPost(
            "this is title",
            "this is content"
        );
        // console.log('createPost result', result);
        return result
    }

}
