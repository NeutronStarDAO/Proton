import {getActor} from "../utils/Actor";
import {idlFactory} from "../declarations/data_analysis/data_analysis.did";
import {Post} from "../declarations/feed/feed";

const cid = "tgj3t-faaaa-aaaan-quqfa-cai"
export default class DataAnalysis {

  private async getNoIdentityActor() {
    return await getActor.noIdentityActor(idlFactory, cid);
  }

  receive_post(tags: string[], postId: string) {
    return new Promise(async (resolve, reject) => {
      try {
        const actor = await this.getNoIdentityActor();
        const res = await actor.receive_post(tags, postId) as boolean
        if (res) {
          resolve(res)
        } else {
          reject("receive_post failed")
        }
      } catch (e) {
        reject(e)
      }
    })
  }

  get_hot_topic_in_week() {
    return new Promise(async (resolve, reject) => {
      try {
        const actor = await this.getNoIdentityActor();
        const res = await actor.get_hot_topic_in_week() as Array<[string, bigint]>
        resolve(res)
      } catch (e) {
        reject(e)
      }
    })
  }

  get_hot_topic(number: bigint) {
    return new Promise<[string, bigint][]>(async (resolve, reject) => {
      try {
        const actor = await this.getNoIdentityActor();
        const res = await actor.get_hot_topic(number) as Array<[string, bigint]>
        resolve(res)
      } catch (e) {
        reject(e)
      }
    })
  }

  get_topic_post(topic: string, start: number, count: number) {
    return new Promise<Post[]>(async (resolve, reject) => {
      try {
        const actor = await this.getNoIdentityActor();
        const res = await actor.get_topic_post(topic, BigInt(start), BigInt(count)) as Array<Post>
        resolve(res)
      } catch (e) {
        reject(e)
      }
    })

  }

}

export const dataAnalysisApi = new DataAnalysis()
