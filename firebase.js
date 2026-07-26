// ============================================================
// NDRAA STURR BIND MANAGER — Firebase Configuration
// ============================================================
// This file initializes Firebase Auth + Firestore using the
// modular Web SDK (v10) loaded via CDN in each HTML page.
// Security is enforced through firestore.rules, NOT by hiding
// this config — Firebase web API keys are not secret by design.
// ============================================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  updatePassword,
  updateProfile,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  getFirestore,
  collection,
  doc,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  writeBatch
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCzFNu3rM-pgIVxicaGyf23V7-SiBUWI-A",
  authDomain: "ndraapp-71d53.firebaseapp.com",
  databaseURL: "https://ndraapp-71d53-default-rtdb.firebaseio.com",
  projectId: "ndraapp-71d53",
  storageBucket: "ndraapp-71d53.firebasestorage.app",
  messagingSenderId: "554257825509",
  appId: "1:554257825509:web:2f7814c7655beb0b2a5e0c",
  measurementId: "G-1XHEED7SWF"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export {
  app,
  auth,
  db,
  // auth
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  updatePassword,
  updateProfile,
  signOut,
  // firestore
  collection,
  doc,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  writeBatch
};
