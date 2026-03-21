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
  onSnapshot,
  setDoc,
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

// ── Empathize: Experience ──────────────────────────────────
const EXP_COL = 'experiences'

export async function getExperiences() {
  const q = query(collection(db, EXP_COL), orderBy('createdAt', 'desc'))
  const snapshot = await getDocs(q)
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))
}

export async function addExperience(data) {
  return addDoc(collection(db, EXP_COL), {
    ...data,
    createdAt: serverTimestamp(),
  })
}

export async function deleteExperience(id) {
  return deleteDoc(doc(db, EXP_COL, id))
}

// ── VPC ───────────────────────────────────────────────────
const VPC_COL = 'vpc_items'

export async function getVpcItems() {
  const q = query(collection(db, VPC_COL), orderBy('createdAt', 'asc'))
  const snapshot = await getDocs(q)
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))
}

export async function addVpcItem(section, text) {
  return addDoc(collection(db, VPC_COL), {
    section,
    text,
    createdAt: serverTimestamp(),
  })
}

export async function deleteVpcItem(id) {
  return deleteDoc(doc(db, VPC_COL, id))
}

// ── Checklist ──────────────────────────────────────────────
const CHECKLIST_DOC = doc(db, 'checklist', 'progress')

export function subscribeChecklist(callback) {
  return onSnapshot(
    CHECKLIST_DOC,
    (snap) => { callback(snap.exists() ? snap.data() : {}) },
    (err) => { console.error('subscribeChecklist error:', err) },
  )
}

export async function toggleChecklistItem(key, value) {
  return setDoc(CHECKLIST_DOC, { [key]: value }, { merge: true })
}
