import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  orderBy,
  query,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from './firebase'

const COL = 'observations'

export async function getObservations() {
  const q = query(collection(db, COL), orderBy('createdAt', 'desc'))
  const snapshot = await getDocs(q)
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))
}

export async function getObservation(id) {
  const snap = await getDoc(doc(db, COL, id))
  if (!snap.exists()) return null
  return { id: snap.id, ...snap.data() }
}

export async function addObservation(data, uid) {
  return addDoc(collection(db, COL), {
    ...data,
    uid,
    createdAt: serverTimestamp(),
  })
}

export async function updateObservation(id, data) {
  return updateDoc(doc(db, COL, id), data)
}

export async function deleteObservation(id) {
  return deleteDoc(doc(db, COL, id))
}
