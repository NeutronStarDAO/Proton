import {Principal} from "@dfinity/principal";
import {getActor} from "../utils/Actor";
import {idlFactory} from "../declarations/Index/index.did";
import {
  GetAccountIdentifierTransactionsResponse,
  GetAccountIdentifierTransactionsResult,
  GetAccountTransactionsArgs
} from "../declarations/Index";


const indexCai = "qhbym-qaaaa-aaaaa-aaafq-cai"
export default class IndexCai {


  private async getActor() {
    return await getActor.createActor(idlFactory, indexCai);
  }

  async getTx(who: Principal): Promise<GetAccountIdentifierTransactionsResponse> {
    const actor = await this.getActor()
    try {
      const arg: GetAccountTransactionsArgs = {
        max_results: BigInt(100),
        start: [],
        account: {
          owner: who,
          subaccount: []
        }
      }
      const res = await actor.get_account_transactions(arg) as GetAccountIdentifierTransactionsResult
      if ("Ok" in res) {
        return res.Ok
      }
      throw new Error(res.Err.message)
    } catch (e) {
      console.log("get_account_transactions", e)
      throw e
    }

  }

}

export const indexApi = new IndexCai()
