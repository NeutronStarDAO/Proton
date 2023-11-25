import { HttpAgent } from "@dfinity/agent";

export function _getHttpAgent(identity) {
    const _agent = new HttpAgent({
        identity: identity,
        host: "http://127.0.0.1:4943",
        verifyQuerySignatures: false
    });
    return _agent
}