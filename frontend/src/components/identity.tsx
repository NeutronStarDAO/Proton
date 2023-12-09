import { useState } from 'react';
import { AuthClient} from "@dfinity/auth-client";
import { Identity } from '@dfinity/agent';
import { Principal } from '@dfinity/principal';

// export class IdentityService {

//     async getIdentity() {
//         const [identity, setIdentity] = useState<Identity | undefined>();
//         const [isAuthClientReady, setAuthClientReady] = useState(false);
//         const [principal, setPrincipal] = useState<Principal>(Principal.anonymous());
    
//         const handleAuthenticated = (authClient: AuthClient) => {
//             setAuthClientReady(true);
//             setIdentity(authClient.getIdentity());
//             setPrincipal(authClient.getIdentity().getPrincipal());
//         }
    
//         const authClient = await AuthClient.create();
        
//         authClient.login({
//             // 7 days
//             maxTimeToLive: BigInt(7 * 24 * 60 * 60 * 1000 * 1000 * 1000),
//             onSuccess: async () => {
//                 handleAuthenticated(authClient);
//             }
//         });
//     }
// }


export default function Identity() {

}

