// src/index.js
import { HttpAgent } from "@dfinity/agent";
import { createRequire } from "node:module";
import { canisterId, createActor } from "../../src/declarations/user/index.js";

import { identity } from "./identity.js";

// Require syntax is needed for JSON file imports
const require = createRequire(import.meta.url);
const localCanisterIds = require("../../.dfx/local/canister_ids.json");

// Use `process.env` if available provided, or fall back to local
const effectiveCanisterId = canisterId?.toString() ?? localCanisterIds.user.local;

console.log(`effectiveCanisterId: ${effectiveCanisterId}`);

const agent = new HttpAgent({
  identity: identity,
  host: "http://127.0.0.1:4943",
  fetch,
});

const actor = createActor(effectiveCanisterId, {
  agent,
});

// Rest of your code...
