import {Principal} from "@dfinity/principal";
import {getActor} from "../utils/Actor";
import {Account, AccountBalanceArgs, Result, SendArgs, Tokens, TransferArg} from "../declarations/Ledger/ledger";
import {idlFactory} from "../declarations/Ledger/ledger.did";


const ledgerCai = "ryjl3-tyaaa-aaaaa-aaaba-cai"
export default class Ledger {


  private async getActor() {
    return await getActor.createActor(idlFactory, ledgerCai);
  }

  async icpBalance(who: Principal) {
    const actor = await this.getActor()
    try {
      const account: Account = {
        owner: who,
        subaccount: []
      }
      const res=  await actor.icrc1_balance_of(account) as bigint
      console.log("icp",res)
      return res
    } catch (e) {
      console.log("icp_balance error", e)
      throw e
    }
  }

  async transferUsePrincipal(to: Principal, amount: number): Promise<bigint> {
    const actor = await this.getActor()
    try {
      const arg: TransferArg = {
        to: {owner: to, subaccount: []},
        amount: BigInt(amount * 1e8),
        fee: [],
        memo: [],
        from_subaccount: [],
        created_at_time: []
      }
      const res = await actor.icrc1_transfer(arg) as Result
      if ("Ok" in res) {
        return res.Ok
      }
      throw new Error(Object.keys(res.Err)[0])
    } catch (e) {
      console.log("transferUsePrincipal error", e)
      throw e
    }
  }

  async transferUseAccount(to: string, amount: number): Promise<bigint> {
    const actor = await this.getActor()
    try {
      const arg: SendArgs = {
        to,
        amount: {e8s: BigInt(amount * 1e8)},
        fee: {e8s: BigInt(10000)},
        memo: BigInt(0),
        from_subaccount: [],
        created_at_time: []
      }
      return await actor.send_dfx(arg) as bigint
    } catch (e) {
      console.log("transferUseAccount error", e)
      throw e
    }
  }
}

export const ledgerApi = new Ledger()
