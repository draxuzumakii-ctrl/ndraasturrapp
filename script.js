// ================================================================
// NDRAA STURR BIND MANAGER — script.js
// Shared logic: auth guard, Firestore helpers, countdown engine,
// UI utilities (toast, ripple, sidebar/bottom-nav, copy actions).
// Page-specific logic lives at the bottom, gated by document IDs.
// ================================================================

import {
  auth, db,
  onAuthStateChanged, signOut,
  collection, doc, addDoc, setDoc, updateDoc, deleteDoc,
  getDoc, getDocs, query, where, orderBy, onSnapshot,
  serverTimestamp, writeBatch
} from './firebase.js';

/* ============================================================
   CONSTANTS
============================================================ */
const GAMES = ["Free Fire","MLBB","PUBG","CODM","Roblox","Honor Of Kings","Arena Breakout","Blood Strike","Delta Force","Lainnya"];
const BINDS = ["Google","Facebook","VK","Apple","Twitter/X","Garena","Moonton","Lainnya"];
const DURATIONS = [
  {label:"7 Hari", days:7},{label:"14 Hari", days:14},{label:"30 Hari", days:30},
  {label:"60 Hari", days:60},{label:"90 Hari", days:90},{label:"Custom", days:null}
];
const LABELS = ["Ready","Sold","Pribadi","Dipakai","Dijual"];
const CATEGORIES = ["Penjualan","MC","Jasa Admin","Pemasukan","Pengeluaran","Pembelian","Hutang","Piutang","Lainnya"];
const TX_STATUS = ["Pending","Proses","Selesai","Dibatalkan"];

const GAME_INITIALS = {
  "Free Fire":"FF","MLBB":"ML","PUBG":"PB","CODM":"CD","Roblox":"RB",
  "Honor Of Kings":"HK","Arena Breakout":"AB","Blood Strike":"BS","Delta Force":"DF","Lainnya":"?"
};

let currentUser = null;
let unsubAccounts = null;
let unsubTx = null;
let cachedAccounts = [];
let cachedTx = [];

/* ============================================================
   TOAST + FEEDBACK HELPERS
============================================================ */
function toast(msg, type = 'default'){
  const colors = {
    success: 'linear-gradient(135deg,#00E5A0,#3E8EFF)',
    error: 'linear-gradient(135deg,#FF5C7A,#FF8A4C)',
    default: 'linear-gradient(135deg,#7B5CFF,#3E8EFF)'
  };
  if (typeof Toastify === 'undefined'){ console.log(msg); return; }
  Toastify({
    text: msg, duration: 2800, gravity: 'top', position: 'right',
    style: { background: colors[type] || colors.default },
    className: 'ndraa-toast', stopOnFocus: true
  }).showToast();
}

function swalGlass(opts){
  return Swal.fire({ customClass: { popup: 'ndraa-popup' }, background: 'transparent', ...opts });
}

async function confirmDelete(itemName = 'item ini'){
  const res = await swalGlass({
    title: 'Hapus data?',
    html: `Yakin ingin menghapus <b>${escapeHtml(itemName)}</b>? Tindakan ini tidak bisa dibatalkan.`,
    icon: 'warning', showCancelButton: true,
    confirmButtonText: 'Hapus', cancelButtonText: 'Batal',
    reverseButtons: true
  });
  return res.isConfirmed;
}

function escapeHtml(str){
  const d = document.createElement('div'); d.innerText = str ?? ''; return d.innerHTML;
}

/* Ripple effect on all .btn / .chip-btn / .icon-btn */
document.addEventListener('click', (e) => {
  const btn = e.target.closest('.btn, .chip-btn, .icon-btn, .qa-btn, .nav-item, .bnav-item, .cal-cell');
  if (!btn) return;
  const rect = btn.getBoundingClientRect();
  const ripple = document.createElement('span');
  ripple.className = 'ripple';
  const size = Math.max(rect.width, rect.height);
  ripple.style.width = ripple.style.height = size + 'px';
  ripple.style.left = (e.clientX - rect.left - size/2) + 'px';
  ripple.style.top = (e.clientY - rect.top - size/2) + 'px';
  btn.style.position = btn.style.position || 'relative';
  btn.appendChild(ripple);
  setTimeout(() => ripple.remove(), 600);
});

/* ============================================================
   CLIPBOARD
============================================================ */
async function copyText(text, label = 'Disalin'){
  try{
    await navigator.clipboard.writeText(text);
    toast(`${label} ke clipboard`, 'success');
  }catch(err){
    // fallback
    const ta = document.createElement('textarea');
    ta.value = text; document.body.appendChild(ta); ta.select();
    document.execCommand('copy'); ta.remove();
    toast(`${label} ke clipboard`, 'success');
  }
}

/* ============================================================
   COUNTDOWN ENGINE
============================================================ */
function computeUnbindDate(tanggalBind, durasiHari){
  const d = new Date(tanggalBind);
  d.setDate(d.getDate() + Number(durasiHari || 0));
  return d;
}

function daysRemaining(unbindDate){
  const now = new Date(); now.setHours(0,0,0,0);
  const target = new Date(unbindDate); target.setHours(0,0,0,0);
  return Math.round((target - now) / 86400000);
}

// returns { key, label, colorVar } based on remaining days
function bindStatus(remaining){
  if (remaining <= 0) return { key:'ready', label:'READY UNBIND', emoji:'🟢' };
  if (remaining === 1) return { key:'d1', label:'1 Hari Lagi', emoji:'🔵' };
  if (remaining <= 3) return { key:'d3', label:`${remaining} Hari Lagi`, emoji:'🟠' };
  if (remaining <= 7) return { key:'d7', label:`${remaining} Hari Lagi`, emoji:'🟡' };
  return { key:'bind', label:'Masih Bind', emoji:'🔴' };
}

function ringSvg(remaining, totalDuration, size = 52){
  const status = bindStatus(remaining);
  const r = (size/2) - 6;
  const circumference = 2 * Math.PI * r;
  const pct = totalDuration > 0 ? Math.max(0, Math.min(1, remaining / totalDuration)) : 0;
  const offset = circumference * (1 - pct);
  const displayVal = remaining <= 0 ? '✓' : remaining;
  return `
    <div class="bind-ring s-${status.key}" style="width:${size}px;height:${size}px;">
      <svg viewBox="0 0 ${size} ${size}">
        <circle class="track" cx="${size/2}" cy="${size/2}" r="${r}"></circle>
        <circle class="progress" cx="${size/2}" cy="${size/2}" r="${r}"
          stroke-dasharray="${circumference}" stroke-dashoffset="${offset}"></circle>
      </svg>
      <div class="ring-label">${displayVal}</div>
    </div>`;
}

function statusBadge(remaining){
  const s = bindStatus(remaining);
  return `<span class="badge ${s.key}"><span class="badge-dot" style="background:currentColor"></span>${s.emoji} ${s.label}</span>`;
}

/* ============================================================
   AUTH GUARD — runs on every page except index.html (login)
============================================================ */
const isAuthPage = document.body.dataset.page === 'auth';

onAuthStateChanged(auth, (user) => {
  if (user){
    currentUser = user;
    if (isAuthPage){
      window.location.href = 'beranda.html';
      return;
    }
    document.dispatchEvent(new CustomEvent('ndraa:ready', { detail: { user } }));
    initUserChrome(user);
    startRealtimeListeners();
  } else {
    currentUser = null;
    if (unsubAccounts) unsubAccounts();
    if (unsubTx) unsubTx();
    if (!isAuthPage){
      window.location.href = 'index.html';
    }
  }
});

function initUserChrome(user){
  const nameEls = document.querySelectorAll('[data-user-name]');
  const emailEls = document.querySelectorAll('[data-user-email]');
  const initialEls = document.querySelectorAll('[data-user-initial]');
  const displayName = user.displayName || user.email?.split('@')[0] || 'User';
  nameEls.forEach(el => el.textContent = displayName);
  emailEls.forEach(el => el.textContent = user.email || '');
  initialEls.forEach(el => el.textContent = displayName.charAt(0).toUpperCase());
}

document.querySelectorAll('[data-action="logout"]').forEach(btn => {
  btn.addEventListener('click', async () => {
    const res = await swalGlass({
      title:'Keluar akun?', text:'Kamu perlu login kembali untuk mengakses data.',
      icon:'question', showCancelButton:true, confirmButtonText:'Logout', cancelButtonText:'Batal'
    });
    if (res.isConfirmed){
      await signOut(auth);
      toast('Berhasil logout', 'success');
    }
  });
});

/* ============================================================
   SIDEBAR COLLAPSE + MOBILE NAV ACTIVE STATE
============================================================ */
const sidebar = document.querySelector('.sidebar');
const collapseBtn = document.querySelector('.collapse-btn');
if (collapseBtn && sidebar){
  const saved = localStorage.getItem('ndraa_sidebar_collapsed');
  if (saved === '1') sidebar.classList.add('collapsed');
  collapseBtn.addEventListener('click', () => {
    sidebar.classList.toggle('collapsed');
    localStorage.setItem('ndraa_sidebar_collapsed', sidebar.classList.contains('collapsed') ? '1' : '0');
  });
}

const currentPageFile = window.location.pathname.split('/').pop() || 'beranda.html';
document.querySelectorAll('.nav-item, .bnav-item').forEach(item => {
  if (item.getAttribute('href') === currentPageFile) item.classList.add('active');
});

/* ============================================================
   FIRESTORE PATH HELPERS
============================================================ */
function accountsRef(){ return collection(db, 'users', currentUser.uid, 'accounts'); }
function txRef(){ return collection(db, 'users', currentUser.uid, 'transactions'); }
function settingsDoc(name = 'profile'){ return doc(db, 'users', currentUser.uid, 'settings', name); }

function startRealtimeListeners(){
  if (!currentUser) return;
  unsubAccounts = onSnapshot(query(accountsRef(), orderBy('createdAt', 'desc')), (snap) => {
    cachedAccounts = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    document.dispatchEvent(new CustomEvent('ndraa:accounts', { detail: cachedAccounts }));
  }, (err) => { console.error(err); toast('Gagal memuat data akun', 'error'); });

  unsubTx = onSnapshot(query(txRef(), orderBy('createdAt', 'desc')), (snap) => {
    cachedTx = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    document.dispatchEvent(new CustomEvent('ndraa:transactions', { detail: cachedTx }));
  }, (err) => { console.error(err); toast('Gagal memuat data catatan', 'error'); });
}

/* ============================================================
   CRUD: ACCOUNTS
============================================================ */
async function createAccount(data){
  await addDoc(accountsRef(), { ...data, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
}
async function updateAccount(id, data){
  await updateDoc(doc(db, 'users', currentUser.uid, 'accounts', id), { ...data, updatedAt: serverTimestamp() });
}
async function deleteAccount(id){
  await deleteDoc(doc(db, 'users', currentUser.uid, 'accounts', id));
}

/* ============================================================
   CRUD: TRANSACTIONS (Catatan)
============================================================ */
async function createTx(data){
  await addDoc(txRef(), { ...data, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
}
async function updateTx(id, data){
  await updateDoc(doc(db, 'users', currentUser.uid, 'transactions', id), { ...data, updatedAt: serverTimestamp() });
}
async function deleteTx(id){
  await deleteDoc(doc(db, 'users', currentUser.uid, 'transactions', id));
}

/* ============================================================
   EXPORT / IMPORT
============================================================ */
function exportJSON(data, filename){
  const blob = new Blob([JSON.stringify(data, null, 2)], { type:'application/json' });
  downloadBlob(blob, filename);
}
function exportCSV(rows, filename){
  if (!rows.length){ toast('Tidak ada data untuk diexport', 'error'); return; }
  const headers = Object.keys(rows[0]).filter(k => k !== 'id');
  const csv = [headers.join(',')].concat(
    rows.map(r => headers.map(h => `"${String(r[h] ?? '').replace(/"/g,'""')}"`).join(','))
  ).join('\n');
  downloadBlob(new Blob([csv], { type:'text/csv' }), filename);
}
function downloadBlob(blob, filename){
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); a.remove();
  URL.revokeObjectURL(url);
}

async function fullBackup(){
  const backup = {
    exportedAt: new Date().toISOString(),
    accounts: cachedAccounts,
    transactions: cachedTx
  };
  exportJSON(backup, `ndraa-backup-${Date.now()}.json`);
  toast('Backup berhasil diunduh', 'success');
}

async function restoreBackup(file){
  const text = await file.text();
  const parsed = JSON.parse(text);
  const batch = writeBatch(db);
  let count = 0;
  (parsed.accounts || []).forEach(acc => {
    const { id, ...rest } = acc;
    const ref = doc(accountsRef());
    batch.set(ref, { ...rest, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
    count++;
  });
  (parsed.transactions || []).forEach(tx => {
    const { id, ...rest } = tx;
    const ref = doc(txRef());
    batch.set(ref, { ...rest, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
    count++;
  });
  await batch.commit();
  toast(`Restore berhasil: ${count} data dipulihkan`, 'success');
}

/* ============================================================
   FORMAT HELPERS
============================================================ */
function formatRupiah(num){
  return 'Rp' + Number(num || 0).toLocaleString('id-ID');
}
function formatDate(d){
  if (!d) return '-';
  const dt = d instanceof Date ? d : new Date(d);
  return dt.toLocaleDateString('id-ID', { day:'2-digit', month:'short', year:'numeric' });
}

/* ============================================================
   EXPOSE SHARED API for page-specific inline modules
============================================================ */
window.NDRAA = {
  GAMES, BINDS, DURATIONS, LABELS, CATEGORIES, TX_STATUS, GAME_INITIALS,
  toast, swalGlass, confirmDelete, escapeHtml, copyText,
  computeUnbindDate, daysRemaining, bindStatus, ringSvg, statusBadge,
  createAccount, updateAccount, deleteAccount,
  createTx, updateTx, deleteTx,
  exportJSON, exportCSV, fullBackup, restoreBackup,
  formatRupiah, formatDate,
  get accounts(){ return cachedAccounts; },
  get transactions(){ return cachedTx; },
  get user(){ return currentUser; },
  db, auth
};

/* ============================================================
   SERVICE WORKER REGISTRATION (PWA)
============================================================ */
if ('serviceWorker' in navigator){
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(err => console.warn('SW registration failed', err));
  });
}
