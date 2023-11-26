import { createRequire } from "node:module";
import { createActor } from "../../src/declarations/rootFetch/index.js";
import { _getHttpAgent } from './utils.js';

const require = createRequire(import.meta.url);
const localCanisterIds = require("../../.dfx/local/canister_ids.json");
const rootFetchCanisterId = localCanisterIds.rootFetch.local;

export class RootFetch {

  constructor(identity) {
    this.canisterId = rootFetchCanisterId;
    this.identity = identity;
    this.actor = createActor(rootFetchCanisterId, {
      agent: _getHttpAgent(identity),
    });
  }

  async init(rootFeedCanister) {
    const result = await this.actor.init(rootFeedCanister);
    return result;
  }

  async createPostFetchCanister() {
    const result = await this.actor.createPostFetchCanister();
    return result;
  }

  async createCommentFetchCanister() {
    const result = await this.actor.createCommentFetchCanister();
    return result;
  }

  async createLikeFetchCanister() {
    const result = await this.actor.createLikeFetchCanister();
    return result;
  }

}