import { createRequire } from "node:module";
import { createActor } from '../../src/declarations/rootFeed/index.js';
import { _getHttpAgent } from './utils.js';

const require = createRequire(import.meta.url);
const localCanisterIds = require("../../.dfx/local/canister_ids.json");
const rootFeedCanisterId = localCanisterIds.rootFeed.local;

export class RootFeed {
    constructor(identity) {
        this.canisterId = rootFeedCanisterId;
        this.identity = identity;
        this.actor = createActor(rootFeedCanisterId, {
          agent: _getHttpAgent(identity),
        });
    }

    async createFeedCanister() {
        // console.log("rootFeedCanisterId : ", rootFeedCanisterId);

        const result = await this.actor.createFeedCanister();
        // console.log('createFeedCanister result', result);
        
        if (result.length > 0) {
            return result[0];
        } else {
            console.error("create feed canister failed");
        }
    }
}
