/* =========================================================
   Ryedz.id — Mock Data Layer
   Ganti isi fungsi di RyedzAPI dengan fetch() ke backend
   (PHP / Laravel / Node.js / Supabase) tanpa mengubah UI.
   ========================================================= */
(function (global) {
  "use strict";

  const CATEGORIES = [
    { slug: "chatgpt", name: "ChatGPT", icon: "fa-comment-dots", color: "#10a37f" },
    { slug: "deepseek", name: "DeepSeek", icon: "fa-water", color: "#3b82f6" },
    { slug: "gemini", name: "Gemini", icon: "fa-gem", color: "#8b5cf6" },
    { slug: "claude", name: "Claude", icon: "fa-feather", color: "#f59e0b" },
    { slug: "grok", name: "Grok", icon: "fa-bolt", color: "#e2e8f0" },
    { slug: "midjourney", name: "Midjourney", icon: "fa-ship", color: "#22d3ee" },
    { slug: "stable-diffusion", name: "Stable Diffusion", icon: "fa-wand-magic-sparkles", color: "#ec4899" },
    { slug: "perplexity", name: "Perplexity", icon: "fa-magnifying-glass", color: "#06b6d4" },
    { slug: "cursor-ai", name: "Cursor AI", icon: "fa-i-cursor", color: "#a3e635" },
    { slug: "coding", name: "Coding", icon: "fa-code", color: "#60a5fa" },
    { slug: "website", name: "Website", icon: "fa-globe", color: "#34d399" },
    { slug: "android", name: "Android", icon: "fa-mobile-screen", color: "#4ade80" },
    { slug: "design", name: "Design", icon: "fa-palette", color: "#f472b6" },
    { slug: "video-ai", name: "Video AI", icon: "fa-film", color: "#fb7185" },
    { slug: "image-ai", name: "Image AI", icon: "fa-image", color: "#c084fc" }
  ];

  const AI_MODELS = ["ChatGPT", "DeepSeek", "Gemini", "Claude", "Grok", "Midjourney", "Stable Diffusion", "Perplexity", "Cursor AI"];

  const BADGES = {
    verified:  { label: "Verified",         icon: "fa-circle-check",       cls: "b-verified" },
    premium:   { label: "Premium",          icon: "fa-crown",              cls: "b-premium" },
    engineer:  { label: "Prompt Engineer",  icon: "fa-brain",              cls: "b-engineer" },
    top:       { label: "Top Creator",      icon: "fa-trophy",             cls: "b-top" },
    rising:    { label: "Rising Creator",   icon: "fa-star",               cls: "b-rising" },
    trending:  { label: "Trending Author",  icon: "fa-fire",               cls: "b-trending" },
    moderator: { label: "Moderator",        icon: "fa-shield-halved",      cls: "b-mod" },
    admin:     { label: "Admin",            icon: "fa-gear",               cls: "b-admin" },
    founder:   { label: "Founder",          icon: "fa-gem",                cls: "b-founder" },
    early:     { label: "Early Supporter",  icon: "fa-rocket",             cls: "b-early" },
    contributor:{label: "Contributor",      icon: "fa-medal",              cls: "b-contrib" }
  };

  const LEVELS = [
    { lvl: 1, name: "Beginner",               min: 0 },
    { lvl: 2, name: "Explorer",               min: 250 },
    { lvl: 3, name: "Creator",                min: 750 },
    { lvl: 4, name: "Advanced Creator",       min: 1800 },
    { lvl: 5, name: "Prompt Engineer",        min: 3500 },
    { lvl: 6, name: "Master Prompt Engineer", min: 6500 },
    { lvl: 7, name: "AI Specialist",          min: 11000 },
    { lvl: 8, name: "AI Legend",              min: 20000 }
  ];

  function levelOf(rep) {
    let cur = LEVELS[0];
    for (const l of LEVELS) if (rep >= l.min) cur = l;
    const next = LEVELS.find(l => l.min > rep);
    const pct = next ? Math.round(((rep - cur.min) / (next.min - cur.min)) * 100) : 100;
    return { ...cur, next, pct };
  }

  const AVA = (seed) => `https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${encodeURIComponent(seed)}&backgroundColor=1e1b4b,312e81,0f172a`;
  const THUMB = (seed, w = 800, h = 450) => `https://picsum.photos/seed/${encodeURIComponent(seed)}/${w}/${h}`;

  const USERS = [
    { id: 1, name: "Ryedz", username: "ryedz", avatar: AVA("ryedz"), banner: THUMB("ryedz-banner", 1400, 400), bio: "Founder Ryedz.id — Ryedz Pengen Famous 🚀", website: "https://ryedz.id", social: { x: "ryedz", github: "ryedz", discord: "ryedz" }, joined: "2024-01-08", role: "admin", status: "active", reputation: 24800, badges: ["founder", "admin", "verified", "premium", "engineer"], prompts: 148, views: 982400, likes: 51230, copies: 33120, followers: 18240, following: 92, country: "Indonesia", lastIp: "103.94.xx.11", device: "Android 14 · Chrome" },
    { id: 2, name: "Nadia Prawira", username: "nadiapr", avatar: AVA("nadia"), banner: THUMB("nadia-banner", 1400, 400), bio: "Prompt engineer & UI designer.", website: "", social: { x: "nadiapr" }, joined: "2024-03-19", role: "moderator", status: "active", reputation: 8420, badges: ["moderator", "verified", "engineer", "top"], prompts: 76, views: 412300, likes: 21980, copies: 15040, followers: 6120, following: 210, country: "Indonesia", lastIp: "180.243.xx.7", device: "Windows 11 · Edge" },
    { id: 3, name: "Farrel Adi", username: "farreladi", avatar: AVA("farrel"), banner: THUMB("farrel-banner", 1400, 400), bio: "Coding prompts untuk developer.", website: "", social: { github: "farreladi" }, joined: "2024-06-02", role: "user", status: "active", reputation: 3960, badges: ["verified", "rising", "contributor"], prompts: 41, views: 158900, likes: 9120, copies: 7440, followers: 2410, following: 330, country: "Indonesia", lastIp: "114.10.xx.51", device: "macOS · Safari" },
    { id: 4, name: "Kirana Ayu", username: "kiranaayu", avatar: AVA("kirana"), banner: THUMB("kirana-banner", 1400, 400), bio: "Midjourney artist.", website: "", social: {}, joined: "2024-09-14", role: "user", status: "active", reputation: 2110, badges: ["premium", "trending"], prompts: 29, views: 98300, likes: 6410, copies: 4210, followers: 1580, following: 120, country: "Indonesia", lastIp: "36.72.xx.90", device: "iOS 18 · Safari" },
    { id: 5, name: "Bagas Setya", username: "bagasetya", avatar: AVA("bagas"), banner: THUMB("bagas-banner", 1400, 400), bio: "Newbie yang rajin belajar.", website: "", social: {}, joined: "2025-02-05", role: "user", status: "suspended", reputation: 420, badges: ["early"], prompts: 8, views: 12400, likes: 640, copies: 380, followers: 190, following: 410, country: "Indonesia", lastIp: "125.166.xx.4", device: "Android 13 · Chrome" },
    { id: 6, name: "Spam Bot 99", username: "spambot99", avatar: AVA("spam"), banner: THUMB("spam-banner", 1400, 400), bio: "-", website: "", social: {}, joined: "2025-11-01", role: "user", status: "banned", reputation: -120, badges: [], prompts: 3, views: 400, likes: 2, copies: 0, followers: 1, following: 900, country: "Unknown", lastIp: "45.61.xx.202", device: "Linux · Headless" }
  ];

  const P = (o) => Object.assign({
    thumb: THUMB(o.title, 800, 450), views: 0, likes: 0, copies: 0, rating: 4.5, ratingCount: 10,
    status: "approved", featured: false, pinned: false, hidden: false, tags: [], comments: [], history: []
  }, o);

  const PROMPTS = [
    P({ id: 101, title: "Ultimate Content Writer GPT", desc: "Prompt lengkap untuk membuat artikel SEO 2000 kata yang natural dan enak dibaca.", ai: "ChatGPT", category: "chatgpt", authorId: 1, date: "2026-07-28", views: 48210, likes: 3120, copies: 2140, rating: 4.9, ratingCount: 412, featured: true, tags: ["seo", "artikel", "copywriting"],
      body: `Kamu adalah "Senior SEO Content Writer" dengan pengalaman 10 tahun.

TUGAS:
Tulis artikel sepanjang {jumlah_kata} kata tentang "{topik}" untuk audiens {audiens}.

ATURAN:
1. Gunakan gaya bahasa {gaya} yang natural, hindari kalimat kaku AI.
2. Sertakan struktur: H1, H2, H3, paragraf pembuka hook, dan kesimpulan.
3. Sisipkan keyword utama "{keyword}" dengan densitas 1-1.5%.
4. Tambahkan 5 FAQ di bagian akhir.
5. Jangan gunakan kata: "dalam dunia yang serba cepat", "di era digital ini".

OUTPUT:
Markdown rapi + meta title (<=60 karakter) + meta description (<=155 karakter).`,
      history: [{ v: "1.3", date: "2026-07-28", note: "Tambah aturan anti-cliche + FAQ" }, { v: "1.2", date: "2026-05-11", note: "Perbaiki struktur heading" }, { v: "1.0", date: "2026-02-02", note: "Rilis awal" }],
      comments: [
        { id: 1, userId: 3, text: "Hasilnya beneran natural, langsung dipakai buat blog client 🔥", date: "2026-07-29", likes: 24, replies: [{ id: 11, userId: 1, text: "Makasih! Coba juga versi 1.3 dengan FAQ generator.", date: "2026-07-29", likes: 8 }] },
        { id: 2, userId: 4, text: "Bisa dipakai buat bahasa Inggris juga?", date: "2026-07-30", likes: 5, replies: [] }
      ] }),
    P({ id: 102, title: "DeepSeek Code Reviewer Pro", desc: "Review kode otomatis: bug, security, performa, dan saran refactor bergaya senior engineer.", ai: "DeepSeek", category: "coding", authorId: 3, date: "2026-07-25", views: 31240, likes: 2410, copies: 1980, rating: 4.8, ratingCount: 260, tags: ["code review", "refactor", "security"],
      body: `Bertindaklah sebagai Staff Software Engineer.

INPUT:
\`\`\`{bahasa}
{kode}
\`\`\`

LAKUKAN REVIEW DALAM 5 BAGIAN:
1. Ringkasan fungsi kode (maks 3 kalimat)
2. Bug & potensi error (severity: low/medium/high)
3. Celah keamanan (OWASP relevan)
4. Masalah performa + kompleksitas Big-O
5. Versi refactor lengkap + alasan perubahan

Gunakan tabel untuk poin 2-4. Jangan memuji tanpa alasan teknis.` }),
    P({ id: 103, title: "Midjourney Cinematic Portrait v7", desc: "Formula prompt potret sinematik dengan lighting dramatis dan detail kulit realistis.", ai: "Midjourney", category: "midjourney", authorId: 4, date: "2026-07-30", views: 52890, likes: 4310, copies: 3620, rating: 4.9, ratingCount: 520, featured: true, tags: ["portrait", "cinematic", "photography"],
      body: `cinematic portrait of {subjek}, {emosi} expression, rim lighting from behind,
soft key light 45 degrees, volumetric haze, shot on ARRI Alexa 35, 85mm lens, f/1.4,
shallow depth of field, hyper detailed skin texture, film grain, teal and orange grade
--ar 4:5 --style raw --stylize 350 --v 7` }),
    P({ id: 104, title: "Gemini Riset Pasar Instan", desc: "Analisis pasar + kompetitor + SWOT dalam satu prompt terstruktur.", ai: "Gemini", category: "gemini", authorId: 2, date: "2026-07-22", views: 22140, likes: 1610, copies: 1240, rating: 4.7, ratingCount: 180, tags: ["bisnis", "riset", "swot"],
      body: `Kamu adalah konsultan strategi dari firma tier-1.

Analisis pasar untuk produk "{produk}" di wilayah {wilayah}.

Keluarkan dalam format:
A. Ukuran pasar (TAM/SAM/SOM) + asumsi perhitungan
B. 5 kompetitor utama (tabel: nama, positioning, harga, kelemahan)
C. Analisis SWOT
D. 3 strategi go-to-market dengan estimasi biaya
E. Risiko utama & mitigasi

Tandai setiap angka yang merupakan estimasi dengan (est.).` }),
    P({ id: 105, title: "Claude Legal Document Simplifier", desc: "Ubah dokumen hukum rumit jadi bahasa manusia tanpa kehilangan makna.", ai: "Claude", category: "claude", authorId: 2, date: "2026-07-18", views: 18730, likes: 1290, copies: 990, rating: 4.6, ratingCount: 140, tags: ["legal", "summary"],
      body: `Kamu adalah paralegal yang ahli menjelaskan hukum ke orang awam.

Dokumen:
"""
{dokumen}
"""

Keluarkan:
1. Ringkasan 5 poin bahasa sehari-hari
2. Kewajiban saya
3. Hak saya
4. Klausul berisiko (beri highlight ⚠️ + alasan)
5. Pertanyaan yang harus saya tanyakan sebelum tanda tangan

Disclaimer: ini bukan nasihat hukum resmi.` }),
    P({ id: 106, title: "Grok Roast My Startup Idea", desc: "Kritik pedas tapi konstruktif untuk ide startup kamu.", ai: "Grok", category: "grok", authorId: 1, date: "2026-07-15", views: 26410, likes: 2210, copies: 1410, rating: 4.8, ratingCount: 210, tags: ["startup", "kritik"],
      body: `Roast ide startup ini dengan brutal tapi jujur, lalu bangun ulang jadi versi yang layak investasi.

Ide: {ide}
Target user: {target}
Model bisnis: {model}

Format:
🔥 ROAST (5 poin paling mematikan)
📉 Kenapa ini gagal dalam 12 bulan
🛠️ Versi perbaikan (pivot yang masuk akal)
💰 Angka yang harus kamu buktikan dulu` }),
    P({ id: 107, title: "Stable Diffusion Product Mockup", desc: "Prompt + negative prompt untuk foto produk studio kelas komersial.", ai: "Stable Diffusion", category: "stable-diffusion", authorId: 4, date: "2026-07-12", views: 15980, likes: 1130, copies: 940, rating: 4.5, ratingCount: 120, tags: ["produk", "mockup", "studio"],
      body: `POSITIVE:
professional product photography of {produk}, floating on minimal podium,
studio softbox lighting, seamless {warna} background, subtle reflection,
ultra sharp, 8k, commercial advertising shot, octane render

NEGATIVE:
blurry, low quality, watermark, text, extra objects, distorted logo, jpeg artifacts

Steps: 32 | CFG: 6.5 | Sampler: DPM++ 2M Karras` }),
    P({ id: 108, title: "Cursor AI Full Feature Builder", desc: "Instruksi agar Cursor membangun fitur end-to-end lengkap dengan test.", ai: "Cursor AI", category: "cursor-ai", authorId: 3, date: "2026-07-09", views: 19420, likes: 1710, copies: 1520, rating: 4.9, ratingCount: 190, tags: ["cursor", "fullstack", "testing"],
      body: `Bangun fitur "{fitur}" pada codebase ini.

ATURAN KERJA:
1. Baca dulu struktur folder & konvensi yang ada, ikuti gaya kode existing.
2. Jangan buat file baru kalau bisa extend file yang ada.
3. Tulis: model/schema → service → controller/route → UI → test.
4. Sertakan unit test minimal 80% coverage untuk logika baru.
5. Setelah selesai, jalankan lint + test dan perbaiki error.
6. Output akhir: ringkasan perubahan per file.

Jangan menyentuh file di luar scope fitur.` }),
    P({ id: 109, title: "Perplexity Deep Research Agent", desc: "Riset mendalam dengan sitasi dan tingkat kepercayaan sumber.", ai: "Perplexity", category: "perplexity", authorId: 2, date: "2026-07-05", views: 13260, likes: 890, copies: 720, rating: 4.6, ratingCount: 95, tags: ["riset", "sitasi"],
      body: `Lakukan riset mendalam tentang "{topik}".

Aturan:
- Minimal 8 sumber, prioritaskan jurnal, situs resmi, dan data primer.
- Untuk tiap klaim penting, beri sitasi [n] dan skor kepercayaan (1-5).
- Pisahkan FAKTA vs OPINI vs SPEKULASI.
- Tampilkan sudut pandang yang bertentangan bila ada.
- Akhiri dengan "Apa yang masih belum diketahui".` }),
    P({ id: 110, title: "Landing Page Generator (HTML+Tailwind)", desc: "Satu prompt untuk landing page konversi tinggi siap deploy.", ai: "ChatGPT", category: "website", authorId: 1, date: "2026-07-02", views: 34120, likes: 2810, copies: 2610, rating: 4.8, ratingCount: 300, pinned: true, tags: ["landing page", "tailwind", "html"],
      body: `Buat landing page satu file HTML + Tailwind CDN untuk "{produk}".

Struktur wajib:
Navbar sticky → Hero (headline, subheadline, 2 CTA, mockup) → Social proof →
3 Fitur utama → Cara kerja (3 langkah) → Testimoni → Pricing (3 tier) →
FAQ accordion → CTA penutup → Footer.

Ketentuan:
- Dark mode, glassmorphism, animasi scroll reveal.
- Responsive mobile-first, aksesibel (aria-label).
- Tanpa dependency selain Tailwind CDN + Font Awesome.
- Copywriting bahasa Indonesia persuasif, bukan lorem ipsum.` }),
    P({ id: 111, title: "Android Jetpack Compose Architect", desc: "Rancang arsitektur aplikasi Android modern MVVM + Clean Architecture.", ai: "Claude", category: "android", authorId: 3, date: "2026-06-28", views: 11240, likes: 760, copies: 610, rating: 4.7, ratingCount: 80, tags: ["android", "compose", "mvvm"],
      body: `Rancang arsitektur aplikasi Android untuk "{aplikasi}".

Stack: Kotlin, Jetpack Compose, Hilt, Room, Retrofit, Coroutines/Flow.

Keluarkan:
1. Diagram modul (ASCII tree) — data/domain/presentation
2. Daftar entity + DAO + DTO
3. UseCase list
4. ViewModel + UiState (sealed class)
5. Contoh kode 1 fitur lengkap
6. Strategi testing & offline-first` }),
    P({ id: 112, title: "Brand Identity Designer Prompt", desc: "Bangun identitas brand lengkap: logo brief, palet, tipografi, tone.", ai: "Gemini", category: "design", authorId: 4, date: "2026-06-24", views: 9840, likes: 690, copies: 520, rating: 4.5, ratingCount: 70, tags: ["branding", "logo", "design system"],
      body: `Kamu adalah brand designer senior.

Brand: {nama_brand} | Industri: {industri} | Target: {target} | Kepribadian: {sifat}

Keluarkan:
- Positioning statement (1 kalimat)
- Brand personality (5 kata sifat + alasan)
- Logo brief (konsep, bentuk, yang harus dihindari)
- Palet warna (HEX + makna + kombinasi kontras AA)
- Tipografi (heading, body, alternatif Google Fonts)
- Tone of voice + 3 contoh caption
- Moodboard keyword untuk Midjourney` }),
    P({ id: 113, title: "Video AI Storyboard Writer", desc: "Ubah ide jadi storyboard shot-by-shot siap untuk Sora/Runway/Veo.", ai: "ChatGPT", category: "video-ai", authorId: 1, date: "2026-06-20", views: 14520, likes: 1120, copies: 880, rating: 4.7, ratingCount: 110, tags: ["video", "storyboard", "sora"],
      body: `Buat storyboard video {durasi} detik tentang "{ide}" bergaya {gaya}.

Untuk setiap shot berikan tabel:
| # | Durasi | Deskripsi visual | Gerakan kamera | Lighting | Audio/VO | Prompt AI siap pakai |

Ketentuan:
- Maksimal 8 detik per shot (batas model video).
- Konsisten pada karakter & wardrobe di semua shot.
- Prompt AI ditulis dalam bahasa Inggris deskriptif.` }),
    P({ id: 114, title: "Image AI Upscale & Restore Guide", desc: "Prompt untuk restorasi foto lama dan peningkatan detail wajah.", ai: "Stable Diffusion", category: "image-ai", authorId: 4, date: "2026-06-16", views: 8210, likes: 540, copies: 430, rating: 4.4, ratingCount: 60, tags: ["restore", "upscale"],
      body: `restore old photograph, repair scratches and creases, natural skin tone recovery,
preserve original facial identity, sharpen fine details, remove color fading,
realistic film photo, high dynamic range, 4x upscale

NEGATIVE: plastic skin, over-smoothing, changed face shape, cartoon, oversaturated` }),
    P({ id: 115, title: "DeepSeek Math Tutor Socratic", desc: "Tutor matematika yang membimbing, bukan memberi jawaban langsung.", ai: "DeepSeek", category: "deepseek", authorId: 2, date: "2026-06-11", views: 7640, likes: 610, copies: 470, rating: 4.6, ratingCount: 55, tags: ["edukasi", "matematika"],
      body: `Kamu tutor matematika metode Socratic untuk siswa {jenjang}.

Aturan:
1. JANGAN pernah memberi jawaban akhir langsung.
2. Ajukan satu pertanyaan penuntun per giliran.
3. Jika siswa salah, tunjukkan letak kesalahannya tanpa membenarkan.
4. Setelah siswa benar, minta dia menjelaskan ulang dengan kata sendiri.
5. Akhiri dengan 2 soal latihan serupa.

Soal: {soal}` }),
    P({ id: 116, title: "Prompt Belum Direview — Auto Blog", desc: "Prompt menunggu review admin.", ai: "ChatGPT", category: "chatgpt", authorId: 5, date: "2026-08-01", views: 0, likes: 0, copies: 0, status: "pending", rating: 0, ratingCount: 0, tags: ["blog"],
      body: `Tulis 30 artikel blog otomatis tentang {topik} dengan struktur SEO standar.` }),
    P({ id: 117, title: "Bulk Spam Comment Generator", desc: "Prompt melanggar aturan — ditolak moderasi.", ai: "ChatGPT", category: "chatgpt", authorId: 6, date: "2026-07-31", views: 0, likes: 0, copies: 0, status: "rejected", rating: 0, ratingCount: 0, tags: ["spam"],
      body: `Buat 500 komentar promosi untuk disebar otomatis.` })
  ];

  const REPORTS = [
    { id: 1, target: "Prompt #117", type: "Spam", reporter: "farreladi", reason: "Prompt untuk spam komentar massal.", date: "2026-07-31", status: "open" },
    { id: 2, target: "User @spambot99", type: "Penipuan", reporter: "nadiapr", reason: "Menyebar link phishing di komentar.", date: "2026-07-30", status: "open" },
    { id: 3, target: "Komentar #48", type: "Ujaran Kebencian", reporter: "kiranaayu", reason: "Kata kasar menyerang SARA.", date: "2026-07-28", status: "resolved" },
    { id: 4, target: "Prompt #116", type: "Plagiarisme", reporter: "ryedz", reason: "Duplikat dari prompt #101.", date: "2026-08-01", status: "open" }
  ];

  const ACTIVITY = [
    { id: 1, user: "ryedz", action: "Menyetujui prompt #110", ip: "103.94.xx.11", date: "2026-08-02 09:12" },
    { id: 2, user: "nadiapr", action: "Menghapus komentar #48", ip: "180.243.xx.7", date: "2026-08-02 08:40" },
    { id: 3, user: "ryedz", action: "Memberi badge Verified ke @farreladi", ip: "103.94.xx.11", date: "2026-08-01 21:05" },
    { id: 4, user: "system", action: "Auto-moderation memblokir 12 komentar spam", ip: "-", date: "2026-08-01 18:33" },
    { id: 5, user: "ryedz", action: "Ban permanen @spambot99", ip: "103.94.xx.11", date: "2026-08-01 17:20" }
  ];

  const NOTIFS = [
    { id: 1, icon: "fa-circle-check", text: "Prompt “Landing Page Generator” disetujui admin.", date: "2 jam lalu" },
    { id: 2, icon: "fa-heart", text: "Nadia Prawira menyukai prompt kamu.", date: "5 jam lalu" },
    { id: 3, icon: "fa-user-plus", text: "3 pengguna baru mengikuti kamu.", date: "Kemarin" }
  ];

  /* ---------- API facade (ganti ke fetch backend di sini) ---------- */
  const RyedzAPI = {
    async getCategories() { return CATEGORIES; },
    async getAiModels() { return AI_MODELS; },
    async getPrompts(filter = {}) {
      let list = PROMPTS.filter(p => !p.hidden);
      if (!filter.includeAll) list = list.filter(p => p.status === "approved");
      if (filter.q) {
        const q = filter.q.toLowerCase();
        list = list.filter(p => (p.title + p.desc + p.tags.join(" ") + p.ai).toLowerCase().includes(q));
      }
      if (filter.category) list = list.filter(p => p.category === filter.category);
      if (filter.ai) list = list.filter(p => p.ai === filter.ai);
      const sorters = {
        terbaru: (a, b) => new Date(b.date) - new Date(a.date),
        populer: (a, b) => b.views - a.views,
        trending: (a, b) => (b.likes + b.copies) / 1 - (a.likes + a.copies),
        copy: (a, b) => b.copies - a.copies,
        like: (a, b) => b.likes - a.likes,
        rating: (a, b) => b.rating - a.rating
      };
      list.sort(sorters[filter.sort] || sorters.terbaru);
      return list;
    },
    async getPrompt(id) { return PROMPTS.find(p => p.id === Number(id)); },
    async getUsers() { return USERS; },
    async getUser(id) { return USERS.find(u => u.id === Number(id)); },
    async getUserByUsername(u) { return USERS.find(x => x.username === u); },
    async getReports() { return REPORTS; },
    async getActivity() { return ACTIVITY; },
    async getNotifications() { return NOTIFS; },
    async getLeaderboard() {
      return [...USERS].filter(u => u.status !== "banned").sort((a, b) => b.reputation - a.reputation);
    },
    async createPrompt(data) {
      const p = P(Object.assign({ id: Date.now(), status: "pending", date: new Date().toISOString().slice(0, 10) }, data));
      PROMPTS.unshift(p); return p;
    },
    _raw: { PROMPTS, USERS, REPORTS, ACTIVITY }
  };

  global.RyedzData = { CATEGORIES, AI_MODELS, BADGES, LEVELS, levelOf, AVA, THUMB };
  global.RyedzAPI = RyedzAPI;
})(window);
