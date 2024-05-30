import {getActor} from "../utils/Actor";
import {idlFactory} from "../declarations/photo_storage/photo_storage.did.js";

const photo_storage_cid = ""

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
    return new Promise(async (resolve, reject) => {
      try {
        for (let i = 0; i < files.length; i++) {
          const data = await storage.FileRead(files[i])
        }
      } catch (e) {
        reject(e)
      }
    })
  }

}

export const aApi = new storage()
