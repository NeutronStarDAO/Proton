import { AuthClient } from "@dfinity/auth-client";
import { HttpAgent, Identity } from "@dfinity/agent";

export function _getHttpAgent(identity: Identity) {
    const _agent = new HttpAgent({
        identity: identity,
        host: "http://127.0.0.1:4943",
        verifyQuerySignatures: false
    });
    return _agent
}

export function getPrincipal(auth: AuthClient) {
    return auth.getIdentity().getPrincipal();
}

export const checkIdentity = (auth: AuthClient | undefined) => {
    // console.log('checkIdentity auth : ', auth);
    if(auth == undefined) return false;
    let _principal = auth.getIdentity().getPrincipal();
    return _principal.isAnonymous();
    // let _isAuthenticated = false;
    // let result = auth.isAuthenticated()
    // .then((_value) => { _isAuthenticated = _value; console.log('_value : ', _value); return _value;});

    // console.log('checkIdentity : ', _isAuthenticated);
    // return _isAuthenticated
}

export default function getIdentity(auth: AuthClient) {
    return auth.getIdentity();
}