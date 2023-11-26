import { createRequire } from "node:module";
import { createActor } from "../../src/declarations/postFetch/index.js";
import { _getHttpAgent } from './utils.js';

export class PostFetch {

  constructor(canisterId, identity) {
    this.canisterId = canisterId;
    this.identity = identity;
    this.actor = createActor(canisterId, {
      agent: _getHttpAgent(identity),
    });
  }

}