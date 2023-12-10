import {Actor, HttpAgent} from "@dfinity/agent";
import {authClient} from "./IIForIdentity";

 class UserActor {

  async getAgent(): Promise<HttpAgent> {
    try {
      return new HttpAgent({
        identity: await authClient.getIdentity() as any,
        host: "https://ic0.app"
      })
    } catch (e) {
      throw e
    }

  }

  async getNoIdentityAgent() {
    return new HttpAgent({
      host: "https://ic0.app"
    });
  }

  public async createActor(idlFactory: any, canisterId: string | any) {
    const agent = await this.getAgent();
    return Actor.createActor(idlFactory, {
      agent,
      canisterId,
    });
  }

  public async noIdentityActor(IdlFactory: any, canisterId: string) {
    const agent = await this.getNoIdentityAgent();
    return Actor.createActor(IdlFactory, {
      agent,
      canisterId,
    });
  }
}

export const getActor = new UserActor()
