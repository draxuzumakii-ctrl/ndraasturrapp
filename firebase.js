// firebase.js — Konfigurasi Firebase
// NDRAA STURR BIND MANAGER
// Menggunakan Firebase v9 Compat SDK

// Konfigurasi Firebase
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

// Inisialisasi Firebase (Compat SDK)
firebase.initializeApp(firebaseConfig);

// Instance Firebase services
const auth = firebase.auth();
const db = firebase.firestore();

// Aktifkan offline persistence
db.enablePersistence({ synchronizeTabs: true })
  .then(() => {
    console.log('✅ Firestore offline persistence enabled');
  })
  .catch((err) => {
    if (err.code === 'failed-precondition') {
      console.warn('⚠️ Multiple tabs open, persistence can only be enabled in one tab at a time.');
    } else if (err.code === 'unimplemented') {
      console.warn('⚠️ Browser tidak mendukung offline persistence.');
    }
  });

// Set bahasa Indonesia untuk Firebase Auth
auth.useDeviceLanguage();

// Ekspor instance ke window global (digunakan oleh script.js)
window.auth = auth;
window.db = db;

console.log('🚀 Firebase initialized — NDRAA STURR BIND MANAGER');
