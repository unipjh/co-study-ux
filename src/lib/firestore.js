import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore'
import { db } from './firebase'

const OBSERVATION_COL = 'observations'
const EXPERIENCE_COL = 'experiences'
const VPC_COL = 'vpc_items'
const CORE_FEATURE_COL = 'core_features'
const INSIGHT_NOTE_COL = 'insight_notes'
const VPC_PAIR_NOTE_COL = 'vpc_pair_notes'
const PROTOTYPE_DECISION_COL = 'prototype_decisions'
const CHECKLIST_DOC = doc(db, 'checklist', 'progress')

function toDocData(snapshot) {
  return snapshot.docs.map((item) => ({ id: item.id, ...item.data() }))
}

export async function getObservations() {
  const snapshot = await getDocs(
    query(collection(db, OBSERVATION_COL), orderBy('createdAt', 'desc')),
  )
  return toDocData(snapshot)
}

export async function getObservation(id) {
  const snapshot = await getDoc(doc(db, OBSERVATION_COL, id))
  if (!snapshot.exists()) return null
  return { id: snapshot.id, ...snapshot.data() }
}

export async function addObservation(data, uid) {
  return addDoc(collection(db, OBSERVATION_COL), {
    ...data,
    uid,
    createdAt: serverTimestamp(),
  })
}

export async function updateObservation(id, data) {
  return updateDoc(doc(db, OBSERVATION_COL, id), data)
}

export async function deleteObservation(id) {
  return deleteDoc(doc(db, OBSERVATION_COL, id))
}

export async function getExperiences() {
  const snapshot = await getDocs(
    query(collection(db, EXPERIENCE_COL), orderBy('createdAt', 'desc')),
  )
  return toDocData(snapshot)
}

export async function addExperience(data) {
  return addDoc(collection(db, EXPERIENCE_COL), {
    ...data,
    createdAt: serverTimestamp(),
  })
}

export async function deleteExperience(id) {
  return deleteDoc(doc(db, EXPERIENCE_COL, id))
}

export async function getVpcItems() {
  const snapshot = await getDocs(query(collection(db, VPC_COL), orderBy('createdAt', 'asc')))
  return toDocData(snapshot)
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

export async function getCoreFeatures() {
  const snapshot = await getDocs(
    query(collection(db, CORE_FEATURE_COL), orderBy('order', 'asc')),
  )
  return toDocData(snapshot)
}

export async function addCoreFeature(title, description, order) {
  return addDoc(collection(db, CORE_FEATURE_COL), {
    title,
    description,
    order,
    createdAt: serverTimestamp(),
  })
}

export async function updateCoreFeature(id, data) {
  return updateDoc(doc(db, CORE_FEATURE_COL, id), data)
}

export async function deleteCoreFeature(id) {
  return deleteDoc(doc(db, CORE_FEATURE_COL, id))
}

export async function getInsightNotes() {
  const snapshot = await getDocs(
    query(collection(db, INSIGHT_NOTE_COL), orderBy('createdAt', 'desc')),
  )
  return toDocData(snapshot)
}

export async function addInsightNote(data) {
  return addDoc(collection(db, INSIGHT_NOTE_COL), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
}

export async function updateInsightNote(id, data) {
  return updateDoc(doc(db, INSIGHT_NOTE_COL, id), {
    ...data,
    updatedAt: serverTimestamp(),
  })
}

export async function deleteInsightNote(id) {
  return deleteDoc(doc(db, INSIGHT_NOTE_COL, id))
}

export async function getVpcPairNotes() {
  const snapshot = await getDocs(collection(db, VPC_PAIR_NOTE_COL))
  return toDocData(snapshot)
}

export async function upsertVpcPairNote(pairKey, data) {
  return setDoc(
    doc(db, VPC_PAIR_NOTE_COL, pairKey),
    {
      pairKey,
      ...data,
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  )
}

export async function getPrototypeDecisions() {
  const snapshot = await getDocs(
    query(collection(db, PROTOTYPE_DECISION_COL), orderBy('createdAt', 'desc')),
  )
  return toDocData(snapshot)
}

export async function addPrototypeDecision(data) {
  return addDoc(collection(db, PROTOTYPE_DECISION_COL), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
}

export async function updatePrototypeDecision(id, data) {
  return updateDoc(doc(db, PROTOTYPE_DECISION_COL, id), {
    ...data,
    updatedAt: serverTimestamp(),
  })
}

export async function deletePrototypeDecision(id) {
  return deleteDoc(doc(db, PROTOTYPE_DECISION_COL, id))
}

export function subscribeChecklist(callback) {
  return onSnapshot(
    CHECKLIST_DOC,
    (snapshot) => {
      callback(snapshot.exists() ? snapshot.data() : {})
    },
    (error) => {
      console.error('subscribeChecklist error:', error)
    },
  )
}

export async function toggleChecklistItem(key, value) {
  return setDoc(CHECKLIST_DOC, { [key]: value }, { merge: true })
}
