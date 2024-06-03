import {getActor} from "../utils/Actor";
import {idlFactory} from "../declarations/photo_storage/photo_storage.did.js";

const photo_storage_cid = "asrmz-lmaaa-aaaaa-qaaeq-cai"

class storage {

  private static async getActor() {
    return await getActor.createActor(idlFactory, photo_storage_cid);
  }

  static async FileRead(file: File | Blob): Promise<unknown> {
    try {
      return new Promise((resolve, reject) => {
        let reader = new FileReader();
        reader.onload = async function (e: any) {
          const data = new Uint8Array(e.target.result)
          return resolve(data)
        }
        reader.onerror = (error) => {
          reject(error)
        }
        reader.readAsArrayBuffer(file.slice(0, file.size));

      })
    } catch (e) {
      throw e
    }
  }

  upload_photo(files: File[]) {
    return new Promise<string[]>(async (resolve, reject) => {
      if (files.length === 0) return resolve([])
      try {
        const actor = await storage.getActor()
        const allPromises: Promise<any>[] = []
        for (let i = 0; i < files.length; i++) {
          if (files[i].size === 0) {
            allPromises.push(new Promise((resolve) => resolve("")))
          } else {
            const data = (await storage.FileRead(files[i]))
            allPromises.push(actor.upload_photo(data))
          }
        }
        console.log(allPromises)
        const res = (await Promise.all(allPromises)) as bigint[]
        console.log(res)
        const urls = res.map((v: any) => {
          if (v === "") return ""
          return `http://${photo_storage_cid}.localhost:4943/${Number(v)}`
        })
        console.log(urls)
        return resolve(urls)
      } catch (e) {
        reject(e)
      }
    })
  }

}

export const aApi = new storage()
