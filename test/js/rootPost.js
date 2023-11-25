import { _getHttpAgent } from './utils.js'
import { createRequire } from "node:module";
import { createActor } from "../../src/declarations/rootPost/index.js";

const require = createRequire(import.meta.url);
const localCanisterIds = require("../../.dfx/local/canister_ids.json");
const rootPostCanisterId = localCanisterIds.rootPost.local;

export class RootPost {
    constructor(identity) {
        this.canisterId = rootPostCanisterId;
        this.identity = identity;
        this.actor = createActor(rootPostCanisterId, {
          agent: _getHttpAgent(identity),
        });
    }

    async initRootPost() {
        const result = await this.actor.init();
        console.log("initRootPost Result", result);
    } 
      
    async getAllBuckets() {
        const result = await this.actor.getAllBuckets();
        return result
    }
    
}
