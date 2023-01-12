import { addDoc, collection } from "firebase/firestore"
import { db } from "../config/firebase"

const _addDoc = (table, data) => {
  return new Promise(async (resolve, reject) => {
    try {
      const docRef = await addDoc(collection(db, table), data)
      resolve(docRef)
    } catch (e) {
      reject(e)
    }
  })
}

export { _addDoc }
