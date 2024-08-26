import {Post} from "../declarations/feed/feed";
import * as SHA1 from "@dfinity/principal/lib/esm/utils/sha224";
import {getCrc32} from "@dfinity/principal/lib/esm/utils/getCrc";
import {Principal} from "@dfinity/principal"
import {Buffer} from "buffer";



export const getBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });


export const nanosecondsToDate = (nanoseconds: bigint) => {
  // 将纳秒转换为毫秒
  let milliseconds = Number(nanoseconds) / 1e6;
  const englishMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  // 创建一个 Date 对象
  let date = new Date(milliseconds);
  // 格式化日期和时间
  let year = date.getFullYear();
  let month = englishMonths[date.getMonth()]
  let day = String(date.getUTCDate()).padStart(2, '0');

  // 返回格式化的日期和时间字符串
  return `${month} ${day} , ${year}`;
}

export const getTime = (nanoseconds: bigint) => {
  let milliseconds = Math.floor(Number(nanoseconds) / 1e6);
  const now = Date.now()
  const diff = now - milliseconds
  const seconds = Math.floor(diff / 1000) //相差的秒数

  if (seconds < 60) return seconds + "s" //小于一分钟

  const minute = Math.floor(seconds / 60) // 相差的分钟数

  if (minute < 60) return minute + "m" //小于一小时

  const hours = Math.floor(minute / 60) //相差的小时数

  if (hours < 24) return hours + "h" //小于一天小时

  const days = Math.floor(hours / 24) //天数

  if (days < 3) return days + "d" //小于3天


  return nanosecondsToDate(nanoseconds)


}


export const isIn = (element: string, arr: string[]) => {
  return arr.findIndex(v => v === element) !== -1
}

export const postSort = (arr: Post[]): Post[] => {
  if (arr.length <= 1) {
    return arr;
  }
  const mid = arr[Math.floor(arr.length / 2)]
  const pivot = Number(mid.created_at)
  const left = [];
  const right = [];

  for (let i = 0; i < arr.length; i++) {
    if (i !== Math.floor(arr.length / 2)) {
      if (Number(arr[i].created_at) < pivot) {
        right.push(arr[i]);
      } else {
        left.push(arr[i]);
      }
    }
  }

  return [...postSort(left), mid, ...postSort(right)];
}

//account id
export const getToAccountIdentifier = (principal: Principal) => {
  const padding = new Buffer("\x0Aaccount-id");
  const array = new Uint8Array([
    // @ts-ignore
    ...padding,
    // @ts-ignore
    ...principal.toUint8Array(),
    ...getSubAccountArray(0),
  ]);
  const hash = SHA1.sha224(array);
  const checksum = to32bits(getCrc32(hash));
  // @ts-ignore
  const array2 = new Uint8Array([...checksum, ...hash]);
  return toHexString(array2);
};

const to32bits = (num: number) => {
  let b = new ArrayBuffer(4);
  new DataView(b).setUint32(0, num);
  return Array.from(new Uint8Array(b));
};
const toHexString = (byteArray: Uint8Array) => {
  return Array.from(byteArray, function (byte) {
    return ("0" + (byte & 0xff).toString(16)).slice(-2);
  }).join("");
};

const getSubAccountArray = (s: number) => {
  return Array(28)
  .fill(0)
  .concat(to32bits(s ? s : 0));
};
