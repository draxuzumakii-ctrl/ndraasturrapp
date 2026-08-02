# Ryedz.id — *Ryedz Pengen Famous*

Website modern berbagi prompt AI. Dark mode premium, glassmorphism, animasi halus, responsive.

## Struktur

```
ryedz/
├── beranda.html          # Halaman publik (hero, kategori, search, detail, upload, leaderboard, badge)
├── admin.html            # Admin panel (gate admin + 40+ menu sidebar)
├── assets/
│   ├── css/style.css     # Tema global (variabel warna, glass, badge, tabel, skeleton)
│   └── js/
│       ├── data.js       # Layer data / API facade  ← ganti ke backend di sini
│       ├── core.js       # Auth mock, toast, modal, badge, level, highlight, util
│       ├── app.js        # Logika beranda.html
│       └── admin.js      # Logika admin.html (router hash + Chart.js)
└── database/schema.sql   # Skema MySQL (kompatibel Supabase/Postgres dgn penyesuaian tipe)
```

## Cara menjalankan

```bash
cd ryedz
python3 -m http.server 8080
# buka http://localhost:8080/beranda.html
```

## Akun demo (mock)

| Username     | Peran      | Efek                                              |
|--------------|------------|---------------------------------------------------|
| `ryedz`      | Admin      | Bisa masuk `admin.html` (2FA apa saja 6 digit)     |
| `nadiapr`    | Moderator  | Badge moderator                                    |
| `farreladi`  | User       | Login normal                                       |
| `bagasetya`  | Suspended  | Login ditolak sementara                            |
| `spambot99`  | Banned     | Muncul pesan blokir permanen                       |

Password bebas (mock). Sesi disimpan di `localStorage`.

## Fitur beranda.html
Navbar lengkap · hero + statistik animasi · 15 kategori card · pencarian + filter
(Terbaru, Populer, Trending, Banyak Disalin, Banyak Like, AI Model, Kategori, Rating) ·
prompt card lengkap (thumbnail, badge, view/like/copy/komentar/rating, tombol copy, like,
favorit, share, laporkan) · modal detail prompt (syntax highlight, rating bintang,
komentar + balasan, prompt serupa, riwayat update) · form upload dengan status review ·
popup "Silakan login terlebih dahulu untuk mengunggah prompt." · login/register/forgot +
Google/GitHub/Discord · profil (banner, badge, level, reputasi, statistik, achievement) ·
peraturan & sanksi termasuk pesan ban permanen · sistem badge, level 1–8, reputasi.

## Fitur admin.html
Gate Administrator (2FA + CAPTCHA) · sidebar 40+ menu berkelompok dengan pencarian menu ·
Dashboard (8 kartu statistik + grafik harian/bulanan/tahunan + donut) · Analytics
(pengunjung, negara, browser, device, keyword, popular prompt/user) · manajemen prompt
(approve, reject, featured, pin, hidden, jadwal, soft delete, restore) · review prompt ·
manajemen user + modal kelola badge/level/reputasi/premium/sanksi + riwayat badge ·
moderasi & auto-moderation · laporan · leaderboard · badge & achievement · notifikasi,
banner, pengumuman, SEO, iklan, newsletter, email · backup, database (17 tabel), logs,
API, storage, file manager, cache, session, webhook, integrasi, domain, version ·
keamanan (2FA, CAPTCHA, rate limiter, anti spam/bot, CSRF, XSS, SQLi, IP ban, login logs) ·
role permission, blacklist, whitelist, audit log, activity · tema, pengaturan, maintenance,
system monitor.

## Integrasi backend

Semua data mengalir lewat `RyedzAPI` di `assets/js/data.js`. Contoh perpindahan ke REST:

```js
async getPrompts(filter = {}) {
  const q = new URLSearchParams(filter).toString();
  return (await fetch(`/api/v1/prompts?${q}`)).json();
}
```

Untuk Supabase, ganti isi metode dengan `supabase.from('prompts').select(...)`, dan
ganti `Ryedz.Auth` di `core.js` dengan `supabase.auth`. Skema tabel sudah tersedia di
`database/schema.sql` (users, prompts, categories, ai_models, comments, likes, favorites,
reports, notifications, achievements, badges, roles, permissions, activity_logs, analytics,
bans, settings, dan tabel pendukung).
