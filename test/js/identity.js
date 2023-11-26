// identity.js
import { Secp256k1KeyIdentity } from "@dfinity/identity-secp256k1";

// Completely insecure seed phrase. Do not use for any purpose other than testing.
// Resolves to "rwbxt-jvr66-qvpbz-2kbh3-u226q-w6djk-b45cp-66ewo-tpvng-thbkh-wae"
const seed = "test test test test test test test test test test test test";

const identity = Secp256k1KeyIdentity.fromSeedPhrase(seed);

// console.log(`identity principal : ${identity.getPrincipal()}`)

export const identityTest = identity;

export const identityA = Secp256k1KeyIdentity.generate();

export const identityB = Secp256k1KeyIdentity.generate();

export const identityC = Secp256k1KeyIdentity.generate();

export const identityD = Secp256k1KeyIdentity.generate();

export const identityE = Secp256k1KeyIdentity.generate();

export function newIdentity() {
    return Secp256k1KeyIdentity.generate();
}