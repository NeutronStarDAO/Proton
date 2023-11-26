import { createRequire } from "node:module";
import { createActor } from "../../src/declarations/user/index.js";
import { _getHttpAgent } from './utils.js';

const require = createRequire(import.meta.url);
const localCanisterIds = require("../../.dfx/local/canister_ids.json");
const userCanisterId = localCanisterIds.user.local;

// console.log(`userCanisterId: ${userCanisterId}`);

export class User {
  constructor(identity) {
    this.canisterId = userCanisterId;
    this.identity = identity;
    this.actor = createActor(userCanisterId, {
      agent: _getHttpAgent(identity),
    });
  }

  async createProfile() {
    const result = await this.actor.createProfile({
        name: "John",
        biography : "I am a developer",
        education : "MIT",
        company : "Dfinity Foundation",
        imgUrl : "https://images.unsplash.com/photo-1593642532842-98d0fd5ebc1a?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80",
        feedCanister : [] //,
    });
    console.log("createProfile Result", result, "\n");
  } 

  async updateProfile() {
    const result = await this.actor.updateProfile({
      name: "update: John",
      biography : "update: I am a developer",
      education : "update: MIT",
      company : "update: Dfinity Foundation",
      imgUrl : "https://images.unsplash.com/photo-1593642532842-98d0fd5ebc1a?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80",
      feedCanister : [] //,
    });
    console.log("updateProfile Result", result, "\n");
  }

  async getProfile() {
    const result = await this.actor.getProfile(this.identity.getPrincipal());
    console.log("getProfile result : ", result, "\n");
  }

  async follow(user) {
    const result = await this.actor.follow(user);
    return result;
  }

  async getFollowersList(user) {
    const result = await this.actor.getFollowersList(user);
    return result;
  }

  async init(_rootFeedCanister) {
    const result = await this.actor.init(_rootFeedCanister);
    return result;
  }
}