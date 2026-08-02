/* =========================================================
   Ryedz.id — admin.html logic
   ========================================================= */
(function () {
  "use strict";
  const { Auth, toast, modal, closeModal, fmt, dateID, esc, badgesHTML, levelHTML, countUp, observeReveal } = Ryedz;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

  let USERS = [], PROMPTS = [], REPORTS = [], ACTIVITY = [], CHARTS = [];

  const MENU = [
    { group: "Utama", items: [
      ["dashboard", "Dashboard", "fa-gauge-high"], ["analytics", "Analytics", "fa-chart-line"],
      ["statistik", "Statistik", "fa-chart-pie"], ["system-monitor", "System Monitor", "fa-microchip"]] },
    { group: "Konten", items: [
      ["prompt", "Prompt", "fa-wand-magic-sparkles"], ["review-prompt", "Review Prompt", "fa-clipboard-check"],
      ["kategori", "Kategori", "fa-folder-tree"], ["ai-model", "AI Model", "fa-robot"],
      ["komentar", "Komentar", "fa-comments"], ["laporan", "Laporan", "fa-flag"]] },
    { group: "Komunitas", items: [
      ["users", "Users", "fa-users"], ["moderator", "Moderator", "fa-shield-halved"],
      ["leaderboard", "Leaderboard", "fa-trophy"], ["badge", "Badge", "fa-certificate"],
      ["achievement", "Achievement", "fa-medal"], ["feedback", "Feedback", "fa-comment-dots"],
      ["support-ticket", "Support Ticket", "fa-headset"]] },
    { group: "Marketing", items: [
      ["notifikasi", "Notifikasi", "fa-bell"], ["banner", "Banner", "fa-image"],
      ["pengumuman", "Pengumuman", "fa-bullhorn"], ["seo", "SEO", "fa-magnifying-glass-chart"],
      ["iklan", "Iklan", "fa-rectangle-ad"], ["newsletter", "Newsletter", "fa-envelope-open-text"],
      ["email", "Email", "fa-envelope"]] },
    { group: "Sistem", items: [
      ["backup", "Backup", "fa-box-archive"], ["database", "Database", "fa-database"],
      ["logs", "Logs", "fa-file-lines"], ["api", "API", "fa-plug"], ["storage", "Storage", "fa-hard-drive"],
      ["file-manager", "File Manager", "fa-folder-open"], ["cache", "Cache", "fa-bolt"],
      ["session", "Session", "fa-clock"], ["webhook", "Webhook", "fa-diagram-project"],
      ["integrasi", "Integrasi", "fa-puzzle-piece"], ["domain", "Domain", "fa-globe"],
      ["version", "Version", "fa-code-branch"]] },
    { group: "Keamanan", items: [
      ["keamanan", "Keamanan", "fa-lock"], ["role-permission", "Role Permission", "fa-user-shield"],
      ["blacklist", "Blacklist", "fa-user-slash"], ["whitelist", "Whitelist", "fa-user-check"],
      ["audit-log", "Audit Log", "fa-scroll"], ["activity", "Activity", "fa-wave-square"]] },
    { group: "Pengaturan", items: [
      ["tema", "Tema Website", "fa-palette"], ["pengaturan", "Pengaturan Website", "fa-gear"],
      ["maintenance", "Maintenance", "fa-screwdriver-wrench"]] }
  ];

  /* ---------------- helpers ---------------- */
  const card = (t, v, i, c, sub) => `<div class="stat-card glass glass-hover reveal">
      <div class="flex items-start gap-3">
        <div class="w-10 h-10 rounded-xl grid place-items-center shrink-0" style="background:${c}22;color:${c};border:1px solid ${c}44"><i class="fa-solid ${i}"></i></div>
        <div class="min-w-0"><div class="text-[11px] text-[color:var(--muted)] font-bold uppercase tracking-wide">${t}</div>
          <div class="text-2xl font-extrabold" data-count="${typeof v === "number" ? v : ""}">${typeof v === "number" ? 0 : v}</div>
          ${sub ? `<div class="text-[11px] text-emerald-300 font-semibold mt-.5">${sub}</div>` : ""}</div></div></div>`;

  const panel = (title, body, actions = "") => `<section class="glass p-4 sm:p-5 reveal">
      <div class="flex flex-wrap items-center gap-2 mb-4"><h2 class="font-extrabold">${title}</h2>
      <div class="ml-auto flex flex-wrap gap-2">${actions}</div></div>${body}</section>`;

  const table = (heads, rows) => `<div class="overflow-x-auto"><table class="tbl min-w-[720px]">
      <thead><tr>${heads.map(h => `<th>${h}</th>`).join("")}</tr></thead><tbody>${rows}</tbody></table></div>`;

  const tools = (list) => `<div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">${list.map(([i, t, d]) => `
      <button class="glass glass-hover p-4 text-left act-tool" data-tool="${esc(t)}">
        <div class="flex items-center gap-2 mb-1.5"><i class="fa-solid ${i} text-cyan-300"></i><span class="font-bold text-sm">${t}</span></div>
        <p class="text-[11px] text-[color:var(--muted)]">${d}</p></button>`).join("")}</div>`;

  const toggles = (list) => `<div class="space-y-2">${list.map(([t, d, on]) => `
      <label class="glass p-3 flex items-center gap-3 cursor-pointer">
        <div class="flex-1"><div class="text-sm font-bold">${t}</div><div class="text-[11px] text-[color:var(--muted)]">${d}</div></div>
        <input type="checkbox" class="accent-cyan-400 w-4 h-4 sw" ${on ? "checked" : ""}></label>`).join("")}</div>`;

  function bindTools(root) {
    $$(".act-tool", root).forEach(b => b.onclick = () => toast(`${b.dataset.tool} dijalankan.`, "ok"));
    $$(".sw", root).forEach(s => s.onchange = () => toast(`Pengaturan ${s.checked ? "diaktifkan" : "dinonaktifkan"}.`, s.checked ? "ok" : "info"));
    $$("[data-count]").forEach(el => { const n = +el.dataset.count; if (n) countUp(el, n); });
    observeReveal(root);
  }

  function chart(id, cfg) {
    const el = document.getElementById(id); if (!el) return;
    CHARTS.push(new Chart(el, cfg));
  }
  function destroyCharts() { CHARTS.forEach(c => c.destroy()); CHARTS = []; }

  Chart.defaults.color = "#98a1c4";
  Chart.defaults.borderColor = "rgba(255,255,255,.07)";
  Chart.defaults.font.family = "Plus Jakarta Sans";

  const grad = (ctx, c1, c2) => {
    const g = ctx.createLinearGradient(0, 0, 0, 240);
    g.addColorStop(0, c1); g.addColorStop(1, c2); return g;
  };
  const days = Array.from({ length: 14 }, (_, i) => `${i + 19}/7`);
  const rnd = (n, a, b) => Array.from({ length: n }, () => Math.round(a + Math.random() * (b - a)));

  /* ---------------- VIEWS ---------------- */
  const V = {};

  V.dashboard = () => {
    const html = `
      <div class="grid sm:grid-cols-2 xl:grid-cols-4 gap-3">
        ${card("Total User", 128400, "fa-users", "#22d3ee", "+2.4% minggu ini")}
        ${card("Total Prompt", 24800, "fa-wand-magic-sparkles", "#a855f7", "+186 hari ini")}
        ${card("Total View", 4820000, "fa-eye", "#3b82f6", "+92K hari ini")}
        ${card("Total Copy", 912000, "fa-copy", "#22c55e", "+5.1K hari ini")}
      </div>
      <div class="grid sm:grid-cols-2 xl:grid-cols-4 gap-3">
        ${card("Total Like", 1340000, "fa-heart", "#ec4899")}
        ${card("Visitor Hari Ini", 18420, "fa-user-clock", "#f59e0b")}
        ${card("Online User", 342, "fa-signal", "#34d399", "Realtime")}
        ${card("Pending Review", 27, "fa-clipboard-check", "#ef4444", "Perlu tindakan")}
      </div>
      <div class="grid lg:grid-cols-[1.6fr_1fr] gap-3">
        ${panel("Grafik Harian (14 hari)", `<canvas id="cDaily" height="110"></canvas>`)}
        ${panel("Distribusi AI Model", `<canvas id="cDonut" height="180"></canvas>`)}
      </div>
      <div class="grid lg:grid-cols-2 gap-3">
        ${panel("Grafik Bulanan", `<canvas id="cMonth" height="130"></canvas>`)}
        ${panel("Grafik Tahunan", `<canvas id="cYear" height="130"></canvas>`)}
      </div>
      <div class="grid lg:grid-cols-2 gap-3">
        ${panel("Menunggu Review", table(["Judul", "Penulis", "Tanggal", "Aksi"],
          PROMPTS.filter(p => p.status === "pending").map(p => `<tr><td class="font-bold">${esc(p.title)}</td>
            <td>${esc((USERS.find(u => u.id === p.authorId) || {}).username || "-")}</td><td>${dateID(p.date)}</td>
            <td><button class="btn btn-sm btn-ok act-tool" data-tool="Approve ${esc(p.title)}">Approve</button>
            <button class="btn btn-sm btn-danger act-tool" data-tool="Reject ${esc(p.title)}">Reject</button></td></tr>`).join("")
            || `<tr><td colspan="4" class="text-[color:var(--muted)]">Tidak ada antrean.</td></tr>`))}
        ${panel("Aktivitas Terbaru", `<div class="space-y-2">${ACTIVITY.map(a => `
          <div class="flex gap-3 items-start text-sm"><div class="w-8 h-8 rounded-lg grid place-items-center bg-white/5 text-cyan-300 shrink-0"><i class="fa-solid fa-wave-square"></i></div>
          <div><div>${esc(a.action)}</div><div class="text-[11px] text-[color:var(--muted)]">@${a.user} · ${a.date} · IP ${a.ip}</div></div></div>`).join("")}</div>`)}
      </div>`;
    return { html, after() {
      const ctx = document.getElementById("cDaily").getContext("2d");
      chart("cDaily", { type: "line", data: { labels: days, datasets: [
        { label: "View", data: rnd(14, 40000, 95000), borderColor: "#22d3ee", backgroundColor: grad(ctx, "rgba(34,211,238,.35)", "rgba(34,211,238,0)"), fill: true, tension: .4, borderWidth: 2, pointRadius: 0 },
        { label: "Copy", data: rnd(14, 8000, 26000), borderColor: "#a855f7", backgroundColor: grad(ctx, "rgba(168,85,247,.3)", "rgba(168,85,247,0)"), fill: true, tension: .4, borderWidth: 2, pointRadius: 0 }] },
        options: { plugins: { legend: { labels: { boxWidth: 10 } } }, scales: { x: { grid: { display: false } } }, maintainAspectRatio: true } });
      chart("cDonut", { type: "doughnut", data: { labels: RyedzData.AI_MODELS.slice(0, 6), datasets: [{ data: rnd(6, 400, 4200), backgroundColor: ["#22d3ee", "#a855f7", "#3b82f6", "#ec4899", "#f59e0b", "#22c55e"], borderWidth: 0 }] }, options: { cutout: "62%", plugins: { legend: { position: "bottom", labels: { boxWidth: 10, font: { size: 10 } } } } } });
      chart("cMonth", { type: "bar", data: { labels: ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu"], datasets: [{ label: "Prompt baru", data: rnd(8, 800, 3600), backgroundColor: "rgba(59,130,246,.65)", borderRadius: 6 }] }, options: { scales: { x: { grid: { display: false } } } } });
      chart("cYear", { type: "line", data: { labels: ["2022", "2023", "2024", "2025", "2026"], datasets: [{ label: "Pengguna", data: [1200, 8600, 32400, 78200, 128400], borderColor: "#22c55e", tension: .35, borderWidth: 2, pointRadius: 4, pointBackgroundColor: "#22c55e" }] } });
    } };
  };

  V.analytics = () => ({ html: `
    <div class="grid sm:grid-cols-2 xl:grid-cols-4 gap-3">
      ${card("Bounce Rate", "38.2%", "fa-arrow-right-from-bracket", "#f59e0b")}
      ${card("Avg. Session", "6m 24s", "fa-stopwatch", "#22d3ee")}
      ${card("Jam Ramai", "20:00–22:00", "fa-clock", "#a855f7")}
      ${card("Referral Utama", "Google", "fa-share-nodes", "#22c55e")}
    </div>
    <div class="grid lg:grid-cols-2 gap-3">
      ${panel("Grafik Pengunjung", `<canvas id="aVisit" height="130"></canvas>`)}
      ${panel("Negara Pengunjung", `<canvas id="aGeo" height="130"></canvas>`)}
    </div>
    <div class="grid lg:grid-cols-3 gap-3">
      ${panel("Browser", `<canvas id="aBrowser" height="180"></canvas>`)}
      ${panel("Device", `<canvas id="aDevice" height="180"></canvas>`)}
      ${panel("Search Keyword", `<div class="space-y-2 text-sm">${[["prompt chatgpt seo", 4820], ["midjourney cinematic", 3910], ["code review deepseek", 2740], ["prompt landing page", 2210], ["gemini riset pasar", 1680]].map(([k, v]) => `
        <div><div class="flex justify-between text-xs mb-1"><span>${k}</span><span class="text-[color:var(--muted)]">${fmt(v)}</span></div>
        <div class="h-1.5 rounded-full bg-white/8"><div class="h-full rounded-full" style="width:${v / 50}%;background:linear-gradient(90deg,#22d3ee,#a855f7)"></div></div></div>`).join("")}</div>`)}
    </div>
    <div class="grid lg:grid-cols-2 gap-3">
      ${panel("Popular Prompt", table(["Judul", "View", "Copy"], PROMPTS.slice().sort((a, b) => b.views - a.views).slice(0, 6).map(p => `<tr><td class="font-bold">${esc(p.title)}</td><td>${fmt(p.views)}</td><td>${fmt(p.copies)}</td></tr>`).join("")))}
      ${panel("Popular User", table(["User", "Reputasi", "View"], USERS.slice().sort((a, b) => b.views - a.views).slice(0, 6).map(u => `<tr><td class="font-bold">@${esc(u.username)}</td><td>${fmt(u.reputation)}</td><td>${fmt(u.views)}</td></tr>`).join("")))}
    </div>`,
    after() {
      const c = document.getElementById("aVisit").getContext("2d");
      chart("aVisit", { type: "line", data: { labels: days, datasets: [{ label: "Visitor", data: rnd(14, 9000, 24000), borderColor: "#3b82f6", backgroundColor: grad(c, "rgba(59,130,246,.35)", "rgba(59,130,246,0)"), fill: true, tension: .4, borderWidth: 2, pointRadius: 0 }] } });
      chart("aGeo", { type: "bar", data: { labels: ["Indonesia", "Malaysia", "Singapura", "USA", "India", "Filipina"], datasets: [{ data: [72400, 9200, 6100, 5400, 3800, 2900], backgroundColor: "rgba(168,85,247,.65)", borderRadius: 6 }] }, options: { indexAxis: "y", plugins: { legend: { display: false } } } });
      chart("aBrowser", { type: "doughnut", data: { labels: ["Chrome", "Safari", "Edge", "Firefox", "Lain"], datasets: [{ data: [64, 18, 9, 5, 4], backgroundColor: ["#22d3ee", "#a855f7", "#3b82f6", "#f59e0b", "#64748b"], borderWidth: 0 }] }, options: { cutout: "60%", plugins: { legend: { position: "bottom", labels: { boxWidth: 10, font: { size: 10 } } } } } });
      chart("aDevice", { type: "polarArea", data: { labels: ["Mobile", "Desktop", "Tablet"], datasets: [{ data: [68, 27, 5], backgroundColor: ["rgba(34,211,238,.6)", "rgba(168,85,247,.6)", "rgba(236,72,153,.6)"] }] }, options: { plugins: { legend: { position: "bottom", labels: { boxWidth: 10, font: { size: 10 } } } } } });
    } });

  V.statistik = () => ({ html: `
    <div class="grid sm:grid-cols-2 xl:grid-cols-4 gap-3">
      ${card("Prompt / Hari", 186, "fa-chart-simple", "#22d3ee")}
      ${card("Rasio Approve", "82%", "fa-circle-check", "#22c55e")}
      ${card("Rata Rating", "4.7", "fa-star", "#f59e0b")}
      ${card("Retensi 30 Hari", "61%", "fa-repeat", "#a855f7")}
    </div>
    ${panel("Statistik Gabungan", `<canvas id="sMix" height="110"></canvas>`)}`,
    after() {
      chart("sMix", { type: "bar", data: { labels: days, datasets: [
        { type: "bar", label: "Upload", data: rnd(14, 60, 260), backgroundColor: "rgba(34,211,238,.55)", borderRadius: 5 },
        { type: "line", label: "Approve", data: rnd(14, 40, 220), borderColor: "#22c55e", tension: .4, borderWidth: 2, pointRadius: 0 },
        { type: "line", label: "Reject", data: rnd(14, 5, 60), borderColor: "#ef4444", tension: .4, borderWidth: 2, pointRadius: 0 }] } });
    } });

  V.prompt = () => ({ html: panel("Manajemen Prompt",
    table(["Judul", "AI", "Penulis", "Status", "View", "Like", "Copy", "Aksi"],
      PROMPTS.map(p => `<tr><td class="font-bold max-w-[240px] truncate">${esc(p.title)}
        ${p.featured ? `<span class="badge b-premium ml-1"><i class="fa-solid fa-star"></i></span>` : ""}
        ${p.pinned ? `<span class="badge b-top ml-1"><i class="fa-solid fa-thumbtack"></i></span>` : ""}</td>
        <td>${esc(p.ai)}</td><td>@${esc((USERS.find(u => u.id === p.authorId) || {}).username || "-")}</td>
        <td><span class="pill ${p.status === "approved" ? "p-ok" : p.status === "pending" ? "p-wait" : "p-bad"}">${p.status}</span></td>
        <td>${fmt(p.views)}</td><td>${fmt(p.likes)}</td><td>${fmt(p.copies)}</td>
        <td class="whitespace-nowrap">
          <button class="btn btn-sm act-tool" data-tool="Edit prompt"><i class="fa-solid fa-pen"></i></button>
          <button class="btn btn-sm act-tool" data-tool="Pin prompt"><i class="fa-solid fa-thumbtack"></i></button>
          <button class="btn btn-sm btn-danger act-tool" data-tool="Soft delete prompt"><i class="fa-solid fa-trash"></i></button></td></tr>`).join("")),
    `<button class="btn btn-sm btn-primary act-tool" data-tool="Tambah prompt"><i class="fa-solid fa-plus"></i> Tambah Prompt</button>`)
    + tools([["fa-plus", "Tambah Prompt", "Buat prompt langsung dari panel admin."], ["fa-pen", "Edit Prompt", "Ubah judul, isi, kategori, tag."],
      ["fa-trash", "Hapus Prompt", "Hapus permanen dari database."], ["fa-circle-check", "Approve Prompt", "Setujui prompt antrean review."],
      ["fa-circle-xmark", "Reject Prompt", "Tolak dengan alasan moderasi."], ["fa-star", "Featured Prompt", "Tampilkan di beranda utama."],
      ["fa-fire", "Trending Prompt", "Paksa masuk daftar trending."], ["fa-eye-slash", "Hidden Prompt", "Sembunyikan dari publik."],
      ["fa-thumbtack", "Pin Prompt", "Sematkan di atas daftar."], ["fa-calendar", "Jadwalkan Publish", "Publikasi otomatis pada waktu tertentu."],
      ["fa-rotate-left", "Restore Prompt", "Kembalikan dari recycle bin."], ["fa-box-archive", "Soft Delete", "Pindahkan ke sampah selama 30 hari."]]) });

  V["review-prompt"] = () => ({ html: panel("Antrean Review Prompt",
    `<div class="grid lg:grid-cols-2 gap-3">${PROMPTS.filter(p => p.status !== "approved").map(p => `
      <div class="glass p-4">
        <div class="flex gap-3"><img src="${p.thumb}" class="w-24 h-16 object-cover rounded-lg" alt="">
          <div class="min-w-0"><div class="font-bold text-sm truncate">${esc(p.title)}</div>
            <div class="text-[11px] text-[color:var(--muted)] line-clamp-2">${esc(p.desc)}</div>
            <div class="mt-1 flex gap-1.5"><span class="badge b-level">${esc(p.ai)}</span>
            <span class="pill ${p.status === "pending" ? "p-wait" : "p-bad"}">${p.status}</span></div></div></div>
        <pre class="code mt-3 max-h-32 text-[11px]">${esc(p.body)}</pre>
        <div class="flex gap-2 mt-3"><button class="btn btn-sm btn-ok act-tool" data-tool="Approve"><i class="fa-solid fa-check"></i> Approve</button>
          <button class="btn btn-sm btn-danger act-tool" data-tool="Reject"><i class="fa-solid fa-xmark"></i> Reject</button>
          <button class="btn btn-sm act-tool" data-tool="AI Content Checker"><i class="fa-solid fa-robot"></i> AI Check</button></div></div>`).join("")}</div>`) });

  V.users = () => ({ html: panel("Manajemen User",
    table(["User", "Level", "Reputasi", "Role", "Status", "IP Terakhir", "Device", "Aksi"],
      USERS.map(u => `<tr><td><div class="flex items-center gap-2"><img src="${u.avatar}" class="w-8 h-8 rounded-full" alt="">
        <div><div class="font-bold flex items-center gap-1">${esc(u.name)} ${badgesHTML(u.badges, { small: true, max: 3 })}</div>
        <div class="text-[11px] text-[color:var(--muted)]">@${esc(u.username)}</div></div></div></td>
        <td>${levelHTML(u.reputation)}</td><td class="font-bold">${fmt(u.reputation)}</td><td>${u.role}</td>
        <td><span class="pill ${u.status === "active" ? "p-ok" : u.status === "suspended" ? "p-wait" : "p-bad"}">${u.status}</span></td>
        <td class="font-mono text-[11px]">${u.lastIp}</td><td class="text-[11px]">${u.device}</td>
        <td class="whitespace-nowrap"><button class="btn btn-sm act-user" data-id="${u.id}"><i class="fa-solid fa-sliders"></i> Kelola</button></td></tr>`).join(""),
    ), `<input class="field !w-48 !py-1.5 !text-xs" id="uSearch" placeholder="Cari user…">`)
    + tools([["fa-magnifying-glass", "Cari User", "Pencarian username, email, ID."], ["fa-pen", "Edit Profil", "Ubah data profil pengguna."],
      ["fa-key", "Reset Password", "Kirim tautan reset."], ["fa-pause", "Suspend", "Bekukan akun sementara."],
      ["fa-ban", "Ban Permanen", "Blokir akun selamanya."], ["fa-unlock", "Unban", "Pulihkan akun terblokir."],
      ["fa-trash", "Hapus Akun", "Hapus akun & datanya."], ["fa-paper-plane", "Kirim Pesan", "Pesan langsung ke pengguna."],
      ["fa-wave-square", "Lihat Aktivitas", "Jejak aktivitas akun."], ["fa-right-to-bracket", "Riwayat Login", "Waktu, IP, device."],
      ["fa-upload", "Riwayat Upload", "Semua prompt yang diunggah."], ["fa-triangle-exclamation", "Riwayat Pelanggaran", "Catatan sanksi."]]),
    after(root) {
      $$(".act-user", root).forEach(b => b.onclick = () => userModal(+b.dataset.id));
      const s = $("#uSearch", root);
      if (s) s.oninput = () => {
        const q = s.value.toLowerCase();
        $$("tbody tr", root).forEach(tr => tr.style.display = tr.textContent.toLowerCase().includes(q) ? "" : "none");
      };
    } });

  function userModal(id) {
    const u = USERS.find(x => x.id === id);
    const lv = RyedzData.levelOf(u.reputation);
    const s = modal(`
      <div class="flex items-center gap-3 mb-4">
        <img src="${u.avatar}" class="w-12 h-12 rounded-xl" alt="">
        <div><div class="font-extrabold flex items-center gap-1.5">${esc(u.name)} ${badgesHTML(u.badges, { small: true })}</div>
          <div class="text-[11px] text-[color:var(--muted)]">@${esc(u.username)} · ${u.role} · ${u.status}</div></div>
        <button class="btn btn-sm btn-ghost ml-auto" data-close>&times;</button></div>

      <h4 class="lbl">Kelola Badge</h4>
      <div class="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
        ${Object.entries(RyedzData.BADGES).map(([k, b]) => `
          <label class="glass p-2 flex items-center gap-2 cursor-pointer text-[11px]">
            <input type="checkbox" class="accent-cyan-400 bdg" data-k="${k}" ${u.badges.includes(k) ? "checked" : ""}>
            <span class="badge ${b.cls}"><i class="fa-solid ${b.icon}"></i></span><span class="font-bold truncate">${b.label}</span></label>`).join("")}
      </div>

      <div class="grid sm:grid-cols-2 gap-3 mb-4">
        <div><label class="lbl">Level Pengguna</label><select class="field" id="mLevel">
          ${RyedzData.LEVELS.map(l => `<option ${l.lvl === lv.lvl ? "selected" : ""}>Level ${l.lvl} - ${l.name}</option>`).join("")}</select></div>
        <div><label class="lbl">Reputation Point</label><input class="field" type="number" id="mRep" value="${u.reputation}"></div>
        <div><label class="lbl">Masa Aktif Premium</label><input class="field" type="date" id="mPrem"></div>
        <div><label class="lbl">Status Akun</label><select class="field" id="mStatus">
          ${["active", "suspended", "banned"].map(x => `<option ${u.status === x ? "selected" : ""}>${x}</option>`).join("")}</select></div>
      </div>

      <h4 class="lbl">Tindakan Cepat</h4>
      <div class="flex flex-wrap gap-2 mb-4">
        ${[["Peringatan", "btn-sm"], ["Suspend 7 Hari", "btn-sm"], ["Hapus Semua Prompt", "btn-sm btn-danger"], ["Ban Permanen", "btn-sm btn-danger"], ["Unban", "btn-sm btn-ok"], ["Reset Password", "btn-sm"], ["Kirim Pesan", "btn-sm"]]
          .map(([t, c]) => `<button class="btn ${c} act-tool" data-tool="${t}">${t}</button>`).join("")}
      </div>

      <h4 class="lbl">Riwayat Perubahan Badge</h4>
      <div class="space-y-1.5 text-[12px] text-[color:var(--muted)] mb-4">
        <div>• 01 Ags 2026 — Admin @ryedz memberi badge <b>Verified</b></div>
        <div>• 12 Jul 2026 — Admin @ryedz mencabut badge <b>Premium</b> (masa aktif habis)</div>
        <div>• 03 Mar 2026 — Sistem memberi badge <b>Rising Creator</b></div>
      </div>

      <div class="flex gap-2"><button class="btn flex-1" data-close>Batal</button>
        <button class="btn btn-primary flex-1" id="mSave"><i class="fa-solid fa-floppy-disk"></i> Simpan Perubahan</button></div>`, { wide: true });
    $$(".act-tool", s).forEach(b => b.onclick = () => toast(`${b.dataset.tool} diterapkan ke @${u.username}.`, "ok"));
    $("#mSave", s).onclick = () => {
      u.badges = $$(".bdg:checked", s).map(x => x.dataset.k);
      u.reputation = +$("#mRep", s).value;
      u.status = $("#mStatus", s).value;
      closeModal(); toast(`Perubahan untuk @${u.username} disimpan.`, "ok"); render(current);
    };
  }

  V.moderator = () => ({ html: panel("Tim Moderator",
    table(["Moderator", "Tugas", "Tindakan 30 Hari", "Status"],
      USERS.filter(u => ["admin", "moderator"].includes(u.role)).map(u => `<tr>
        <td><div class="flex items-center gap-2"><img src="${u.avatar}" class="w-8 h-8 rounded-full" alt="">
        <span class="font-bold">${esc(u.name)}</span>${badgesHTML(u.badges, { small: true, max: 2 })}</div></td>
        <td>Review prompt, komentar, laporan</td><td>${Math.floor(Math.random() * 400 + 40)}</td>
        <td><span class="pill p-ok">aktif</span></td></tr>`).join(""))
      + `<div class="mt-4">${toggles([["Auto Moderation", "Blokir otomatis konten mencurigakan.", true],
        ["Filter Kata Kasar", "Sensor kata terlarang pada komentar.", true],
        ["Filter Spam", "Deteksi pola spam & link massal.", true],
        ["Filter Malware", "Pindai lampiran & tautan berbahaya.", true],
        ["AI Content Checker", "Model AI menilai kualitas & risiko prompt.", true]])}</div>`) });

  V.kategori = () => ({ html: panel("Kategori",
    table(["Kategori", "Slug", "Ikon", "Jumlah Prompt", "Aksi"],
      RyedzData.CATEGORIES.map(c => `<tr><td class="font-bold"><i class="fa-solid ${c.icon}" style="color:${c.color}"></i> ${c.name}</td>
        <td class="font-mono text-[11px]">${c.slug}</td><td class="font-mono text-[11px]">${c.icon}</td>
        <td>${PROMPTS.filter(p => p.category === c.slug).length}</td>
        <td><button class="btn btn-sm act-tool" data-tool="Edit kategori ${c.name}"><i class="fa-solid fa-pen"></i></button>
        <button class="btn btn-sm btn-danger act-tool" data-tool="Hapus kategori ${c.name}"><i class="fa-solid fa-trash"></i></button></td></tr>`).join(""),
    ), `<button class="btn btn-sm btn-primary act-tool" data-tool="Tambah kategori"><i class="fa-solid fa-plus"></i> Tambah</button>`) });

  V["ai-model"] = () => ({ html: panel("AI Model",
    `<div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">${RyedzData.AI_MODELS.map(a => `
      <div class="glass p-4 flex items-center gap-3"><div class="w-10 h-10 rounded-xl grid place-items-center bg-white/5 text-cyan-300"><i class="fa-solid fa-robot"></i></div>
        <div class="min-w-0"><div class="font-bold text-sm">${a}</div>
        <div class="text-[11px] text-[color:var(--muted)]">${PROMPTS.filter(p => p.ai === a).length} prompt</div></div>
        <button class="btn btn-sm ml-auto act-tool" data-tool="Edit ${a}"><i class="fa-solid fa-pen"></i></button></div>`).join("")}</div>`,
    `<button class="btn btn-sm btn-primary act-tool" data-tool="Tambah AI model"><i class="fa-solid fa-plus"></i> Tambah</button>`) });

  V.komentar = () => {
    const rows = [];
    PROMPTS.forEach(p => p.comments.forEach(c => rows.push([p, c])));
    return { html: panel("Moderasi Komentar",
      table(["Komentar", "Penulis", "Prompt", "Tanggal", "Aksi"], rows.map(([p, c]) => {
        const u = USERS.find(x => x.id === c.userId) || {};
        return `<tr><td class="max-w-[280px]">${esc(c.text)}</td><td>@${esc(u.username)}</td>
          <td class="truncate max-w-[160px]">${esc(p.title)}</td><td>${dateID(c.date)}</td>
          <td class="whitespace-nowrap"><button class="btn btn-sm btn-ok act-tool" data-tool="Approve komentar"><i class="fa-solid fa-check"></i></button>
          <button class="btn btn-sm btn-danger act-tool" data-tool="Hapus komentar"><i class="fa-solid fa-trash"></i></button></td></tr>`;
      }).join(""))) };
  };

  V.laporan = () => ({ html: panel("Laporan Pengguna",
    table(["Target", "Jenis", "Pelapor", "Alasan", "Tanggal", "Status", "Aksi"],
      REPORTS.map(r => `<tr><td class="font-bold">${esc(r.target)}</td><td><span class="pill p-info">${r.type}</span></td>
        <td>@${esc(r.reporter)}</td><td class="max-w-[220px]">${esc(r.reason)}</td><td>${dateID(r.date)}</td>
        <td><span class="pill ${r.status === "open" ? "p-wait" : "p-ok"}">${r.status}</span></td>
        <td class="whitespace-nowrap"><button class="btn btn-sm btn-ok act-tool" data-tool="Selesaikan laporan"><i class="fa-solid fa-check"></i></button>
        <button class="btn btn-sm btn-danger act-tool" data-tool="Tindak pelanggar"><i class="fa-solid fa-gavel"></i></button></td></tr>`).join(""))) });

  V.leaderboard = () => ({ html: panel("Leaderboard",
    table(["#", "Kreator", "Level", "Reputasi", "Prompt", "View", "Like", "Copy"],
      USERS.slice().sort((a, b) => b.reputation - a.reputation).map((u, i) => `<tr>
        <td class="font-extrabold">${["🥇", "🥈", "🥉"][i] || "#" + (i + 1)}</td>
        <td><div class="flex items-center gap-2"><img src="${u.avatar}" class="w-8 h-8 rounded-full" alt="">
        <span class="font-bold">${esc(u.name)}</span>${badgesHTML(u.badges, { small: true, max: 3 })}</div></td>
        <td>${levelHTML(u.reputation)}</td><td class="font-bold neon-text">${fmt(u.reputation)}</td>
        <td>${u.prompts}</td><td>${fmt(u.views)}</td><td>${fmt(u.likes)}</td><td>${fmt(u.copies)}</td></tr>`).join(""))) });

  V.badge = () => ({ html: panel("Manajemen Badge",
    `<div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">${Object.entries(RyedzData.BADGES).map(([k, b]) => `
      <div class="glass p-4"><div class="flex items-center gap-2 mb-2"><span class="badge ${b.cls}"><i class="fa-solid ${b.icon}"></i> ${b.label}</span></div>
        <div class="text-[11px] text-[color:var(--muted)] mb-3">${USERS.filter(u => u.badges.includes(k)).length} pengguna memiliki badge ini.</div>
        <div class="flex gap-2"><button class="btn btn-sm btn-ok act-tool" data-tool="Berikan badge ${b.label}">Berikan</button>
        <button class="btn btn-sm btn-danger act-tool" data-tool="Cabut badge ${b.label}">Cabut</button></div></div>`).join("")}</div>
      <div class="mt-4 glass p-4"><h3 class="font-bold text-sm mb-2">Riwayat Perubahan Badge</h3>
        <div class="space-y-1.5 text-[12px] text-[color:var(--muted)]">
          <div>• 01 Ags 2026 — @farreladi mendapat <b>Verified</b> oleh @ryedz</div>
          <div>• 28 Jul 2026 — @kiranaayu mendapat <b>Premium</b> (30 hari)</div>
          <div>• 20 Jul 2026 — @nadiapr mendapat <b>Prompt Engineer</b></div></div></div>`) });

  V.achievement = () => ({ html: panel("Achievement",
    `<div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">${[
      ["fa-seedling", "First Prompt", "Unggah prompt pertama"], ["fa-fire", "100 Prompt", "Unggah 100 prompt"],
      ["fa-eye", "1M View", "Total 1 juta view"], ["fa-heart", "50K Like", "Total 50 ribu like"],
      ["fa-copy", "10K Copy", "Prompt disalin 10 ribu kali"], ["fa-users", "10K Followers", "Punya 10 ribu pengikut"],
      ["fa-star", "Rating 5.0", "Prompt dengan rating sempurna"], ["fa-calendar-check", "1 Tahun", "Bergabung selama 1 tahun"]]
      .map(([i, t, d]) => `<div class="glass glass-hover p-4 text-center"><i class="fa-solid ${i} text-2xl text-cyan-300 mb-2"></i>
        <div class="font-bold text-sm">${t}</div><div class="text-[11px] text-[color:var(--muted)]">${d}</div></div>`).join("")}</div>`) });

  V.notifikasi = () => ({ html: panel("Kirim Notifikasi",
    `<div class="grid lg:grid-cols-2 gap-4">
      <form class="space-y-3 fk"><div><label class="lbl">Judul</label><input class="field" placeholder="Judul notifikasi"></div>
        <div><label class="lbl">Pesan</label><textarea class="field" rows="4" placeholder="Isi pesan…"></textarea></div>
        <div><label class="lbl">Target</label><select class="field"><option>Semua Pengguna</option><option>Premium</option><option>Moderator</option><option>Pengguna Baru</option></select></div>
        <button class="btn btn-primary act-tool" type="button" data-tool="Kirim notifikasi"><i class="fa-solid fa-paper-plane"></i> Kirim</button></form>
      <div class="space-y-2">${["Prompt kamu disetujui!", "Fitur baru: Riwayat Update Prompt", "Maintenance terjadwal 04:00 WIB", "Leaderboard bulanan dirilis"]
        .map(t => `<div class="glass p-3 text-sm flex items-center gap-2"><i class="fa-solid fa-bell text-cyan-300"></i>${t}
        <button class="btn btn-sm btn-ghost ml-auto act-tool" data-tool="Hapus notifikasi"><i class="fa-solid fa-trash"></i></button></div>`).join("")}</div>
    </div>`) });

  V.banner = () => ({ html: panel("Banner Website",
    `<div class="grid sm:grid-cols-3 gap-3">${[1, 2, 3].map(i => `
      <div class="glass overflow-hidden"><img src="${RyedzData.THUMB("banner" + i, 600, 220)}" class="w-full h-28 object-cover" alt="">
      <div class="p-3 flex items-center gap-2"><span class="text-xs font-bold">Banner ${i}</span>
      <span class="pill ${i === 1 ? "p-ok" : "p-wait"}">${i === 1 ? "aktif" : "draft"}</span>
      <button class="btn btn-sm ml-auto act-tool" data-tool="Edit banner ${i}"><i class="fa-solid fa-pen"></i></button></div></div>`).join("")}</div>`,
    `<button class="btn btn-sm btn-primary act-tool" data-tool="Upload banner"><i class="fa-solid fa-upload"></i> Upload</button>`) });

  V.pengumuman = () => ({ html: panel("Pengumuman",
    `<form class="space-y-3 max-w-xl"><div><label class="lbl">Judul</label><input class="field" placeholder="Judul pengumuman"></div>
      <div><label class="lbl">Isi</label><textarea class="field" rows="4"></textarea></div>
      <div class="grid sm:grid-cols-2 gap-3"><div><label class="lbl">Tipe</label><select class="field"><option>Info</option><option>Peringatan</option><option>Maintenance</option></select></div>
      <div><label class="lbl">Tampil Sampai</label><input class="field" type="date"></div></div>
      <button type="button" class="btn btn-primary act-tool" data-tool="Publikasikan pengumuman"><i class="fa-solid fa-bullhorn"></i> Publikasikan</button></form>`) });

  V.seo = () => ({ html: panel("Pengaturan SEO",
    `<div class="grid lg:grid-cols-2 gap-4">
      <form class="space-y-3"><div><label class="lbl">Meta Title</label><input class="field" value="Ryedz.id — Tempat Berbagi Prompt AI Terbaik"></div>
        <div><label class="lbl">Meta Description</label><textarea class="field" rows="3">Ryedz.id membantu semua orang menemukan prompt terbaik untuk ChatGPT, DeepSeek, Gemini, Claude, Grok, Perplexity, Midjourney, dan AI lainnya.</textarea></div>
        <div><label class="lbl">Keyword</label><input class="field" value="prompt ai, chatgpt, midjourney, prompt indonesia"></div>
        <div><label class="lbl">OG Image URL</label><input class="field" value="/assets/og.png"></div>
        <button type="button" class="btn btn-primary act-tool" data-tool="Simpan SEO"><i class="fa-solid fa-floppy-disk"></i> Simpan</button></form>
      ${tools([["fa-sitemap", "Generate Sitemap", "Buat ulang sitemap.xml."], ["fa-robot", "Edit robots.txt", "Atur crawler mesin pencari."],
        ["fa-link", "Cek Broken Link", "Pindai tautan rusak."], ["fa-gauge", "Core Web Vitals", "Skor performa halaman."]])}
    </div>`) });

  V.iklan = () => ({ html: panel("Manajemen Iklan",
    table(["Slot", "Tipe", "Impresi", "Klik", "CTR", "Status"],
      [["Header Banner", "Display", 482100, 9640, "2.0%", "aktif"], ["Sidebar", "Display", 210400, 3120, "1.5%", "aktif"],
       ["In-Feed Prompt", "Native", 640200, 18400, "2.9%", "aktif"], ["Detail Bottom", "Display", 98200, 1210, "1.2%", "pause"]]
      .map(r => `<tr><td class="font-bold">${r[0]}</td><td>${r[1]}</td><td>${fmt(r[2])}</td><td>${fmt(r[3])}</td><td>${r[4]}</td>
        <td><span class="pill ${r[5] === "aktif" ? "p-ok" : "p-wait"}">${r[5]}</span></td></tr>`).join(""))) });

  V.newsletter = () => ({ html: panel("Newsletter",
    `<div class="grid sm:grid-cols-3 gap-3 mb-4">${card("Subscriber", 42800, "fa-envelope", "#22d3ee")}
      ${card("Open Rate", "46%", "fa-envelope-open", "#22c55e")}${card("Click Rate", "12%", "fa-hand-pointer", "#a855f7")}</div>
      <form class="space-y-3 max-w-xl"><div><label class="lbl">Subjek</label><input class="field" placeholder="Prompt Pilihan Minggu Ini"></div>
      <div><label class="lbl">Isi Email (HTML)</label><textarea class="field font-mono !text-xs" rows="6"></textarea></div>
      <button type="button" class="btn btn-primary act-tool" data-tool="Kirim newsletter"><i class="fa-solid fa-paper-plane"></i> Kirim ke Semua</button></form>`) });

  V.email = () => ({ html: panel("Konfigurasi Email",
    `<div class="grid lg:grid-cols-2 gap-4"><form class="space-y-3">
      <div><label class="lbl">SMTP Host</label><input class="field" value="smtp.ryedz.id"></div>
      <div class="grid grid-cols-2 gap-3"><div><label class="lbl">Port</label><input class="field" value="587"></div>
      <div><label class="lbl">Enkripsi</label><select class="field"><option>TLS</option><option>SSL</option></select></div></div>
      <div><label class="lbl">Username</label><input class="field" value="no-reply@ryedz.id"></div>
      <div><label class="lbl">Password</label><input class="field" type="password" value="••••••••"></div>
      <button type="button" class="btn btn-primary act-tool" data-tool="Tes koneksi SMTP"><i class="fa-solid fa-vial"></i> Tes Koneksi</button></form>
      ${tools([["fa-file-lines", "Template Welcome", "Email sambutan pengguna baru."], ["fa-key", "Template Reset Password", "Email pemulihan akun."],
        ["fa-circle-check", "Template Approve Prompt", "Notifikasi prompt disetujui."], ["fa-ban", "Template Sanksi", "Pemberitahuan pelanggaran."]])}</div>`) });

  V.backup = () => ({ html: panel("Backup & Restore",
    tools([["fa-download", "Backup Sekarang", "Buat snapshot database + storage."], ["fa-upload", "Restore Backup", "Pulihkan dari file backup."],
      ["fa-clock", "Jadwal Otomatis", "Backup harian pukul 03:00 WIB."], ["fa-cloud", "Cloud Sync", "Sinkronkan ke S3 / Google Drive."]])
    + `<div class="mt-4">${table(["File", "Ukuran", "Tanggal", "Aksi"],
      [["ryedz_2026-08-02.sql.gz", "412 MB", "2 Ags 2026 03:00"], ["ryedz_2026-08-01.sql.gz", "408 MB", "1 Ags 2026 03:00"], ["ryedz_2026-07-31.sql.gz", "401 MB", "31 Jul 2026 03:00"]]
      .map(r => `<tr><td class="font-mono text-[12px]">${r[0]}</td><td>${r[1]}</td><td>${r[2]}</td>
        <td><button class="btn btn-sm act-tool" data-tool="Unduh backup"><i class="fa-solid fa-download"></i></button>
        <button class="btn btn-sm btn-danger act-tool" data-tool="Hapus backup"><i class="fa-solid fa-trash"></i></button></td></tr>`).join(""))}</div>`) });

  V.database = () => ({ html: panel("Database",
    table(["Tabel", "Baris", "Ukuran", "Engine", "Aksi"],
      [["users", 128400, "82 MB"], ["prompts", 24800, "310 MB"], ["categories", 15, "16 KB"], ["ai_models", 9, "8 KB"],
       ["comments", 96200, "64 MB"], ["likes", 1340000, "48 MB"], ["favorites", 412000, "18 MB"], ["reports", 3210, "2 MB"],
       ["notifications", 284000, "22 MB"], ["achievements", 48, "32 KB"], ["badges", 11, "8 KB"], ["roles", 4, "4 KB"],
       ["permissions", 62, "12 KB"], ["activity_logs", 982000, "142 MB"], ["analytics", 1240000, "196 MB"], ["bans", 412, "180 KB"], ["settings", 86, "24 KB"]]
      .map(r => `<tr><td class="font-mono font-bold">${r[0]}</td><td>${fmt(r[1])}</td><td>${r[2]}</td><td>InnoDB</td>
        <td class="whitespace-nowrap"><button class="btn btn-sm act-tool" data-tool="Optimize ${r[0]}"><i class="fa-solid fa-bolt"></i></button>
        <button class="btn btn-sm act-tool" data-tool="Export ${r[0]}"><i class="fa-solid fa-file-export"></i></button></td></tr>`).join(""),
    ), `<button class="btn btn-sm act-tool" data-tool="Jalankan query SQL"><i class="fa-solid fa-terminal"></i> SQL Runner</button>`) });

  V.logs = () => ({ html: panel("System Logs",
    `<pre class="code max-h-[520px] text-[11.5px]">${[
      "[2026-08-02 09:12:04] INFO  auth.login user=@ryedz ip=103.94.xx.11 ok",
      "[2026-08-02 09:12:31] INFO  prompt.approve id=110 by=@ryedz",
      "[2026-08-02 08:40:12] WARN  moderation.spam_detected comment=1284 score=0.94",
      "[2026-08-02 08:12:55] INFO  cache.flush key=prompts:trending",
      "[2026-08-02 07:59:02] ERROR storage.upload file=thumb_9182.png reason=size_limit",
      "[2026-08-02 06:00:00] INFO  cron.backup status=success size=412MB",
      "[2026-08-01 23:41:19] WARN  ratelimit.block ip=45.61.xx.202 hits=612/min",
      "[2026-08-01 21:05:44] INFO  badge.grant user=@farreladi badge=verified by=@ryedz",
      "[2026-08-01 17:20:03] CRIT  user.ban user=@spambot99 reason=phishing by=@ryedz"
    ].join("\n")}</pre>`,
    `<button class="btn btn-sm act-tool" data-tool="Unduh log"><i class="fa-solid fa-download"></i> Unduh</button>
     <button class="btn btn-sm btn-danger act-tool" data-tool="Bersihkan log"><i class="fa-solid fa-broom"></i> Bersihkan</button>`) });

  V.api = () => ({ html: panel("API Keys & Endpoint",
    table(["Endpoint", "Method", "Auth", "Rate Limit", "Status"],
      [["/api/v1/prompts", "GET", "public", "120/min", "ok"], ["/api/v1/prompts/:id", "GET", "public", "120/min", "ok"],
       ["/api/v1/prompts", "POST", "bearer", "20/min", "ok"], ["/api/v1/users/:id", "GET", "bearer", "60/min", "ok"],
       ["/api/v1/admin/review", "POST", "admin", "30/min", "ok"], ["/api/v1/analytics", "GET", "admin", "30/min", "degraded"]]
      .map(r => `<tr><td class="font-mono text-[12px]">${r[0]}</td><td><span class="pill p-info">${r[1]}</span></td><td>${r[2]}</td><td>${r[3]}</td>
        <td><span class="pill ${r[4] === "ok" ? "p-ok" : "p-wait"}">${r[4]}</span></td></tr>`).join(""))
    + `<div class="mt-4 glass p-3 flex items-center gap-2 font-mono text-xs">
        <span class="text-[color:var(--muted)]">API Key:</span><span>ryedz_live_sk_••••••••••••8f2a</span>
        <button class="btn btn-sm ml-auto act-tool" data-tool="Regenerate API key"><i class="fa-solid fa-rotate"></i> Regenerate</button></div>`) });

  V.storage = () => ({ html: panel("Storage",
    `<div class="grid sm:grid-cols-3 gap-3 mb-4">${card("Terpakai", "412 GB", "fa-hard-drive", "#22d3ee")}
      ${card("Kuota", "1 TB", "fa-database", "#a855f7")}${card("File", 284100, "fa-file", "#22c55e")}</div>
      <div class="h-3 rounded-full bg-white/8 overflow-hidden mb-2"><div class="h-full rounded-full" style="width:41%;background:linear-gradient(90deg,#22d3ee,#a855f7)"></div></div>
      <p class="text-xs text-[color:var(--muted)] mb-4">41% dari kuota terpakai.</p>
      ${tools([["fa-broom", "Bersihkan File Yatim", "Hapus file tanpa referensi."], ["fa-compress", "Kompresi Gambar", "Optimalkan thumbnail otomatis."],
        ["fa-cloud", "Pindah ke CDN", "Distribusikan aset ke edge."]])}`) });

  V["file-manager"] = () => ({ html: panel("File Manager",
    `<div class="grid sm:grid-cols-4 lg:grid-cols-6 gap-3">${["uploads", "thumbnails", "avatars", "banners", "backups", "exports"]
      .map(f => `<button class="glass glass-hover p-4 text-center act-tool" data-tool="Buka folder ${f}">
        <i class="fa-solid fa-folder text-2xl text-amber-300"></i><div class="text-xs font-bold mt-2">${f}</div></button>`).join("")}
      ${["og.png", "logo.svg", "robots.txt", "sitemap.xml"].map(f => `<button class="glass glass-hover p-4 text-center act-tool" data-tool="Buka ${f}">
        <i class="fa-solid fa-file text-2xl text-cyan-300"></i><div class="text-xs font-bold mt-2">${f}</div></button>`).join("")}</div>`,
    `<button class="btn btn-sm btn-primary act-tool" data-tool="Upload file"><i class="fa-solid fa-upload"></i> Upload</button>`) });

  V.cache = () => ({ html: panel("Cache",
    tools([["fa-broom", "Flush Semua Cache", "Kosongkan seluruh cache aplikasi."], ["fa-image", "Flush Cache Gambar", "Reset thumbnail cache."],
      ["fa-route", "Flush Route Cache", "Reset cache routing."], ["fa-database", "Flush Query Cache", "Reset cache kueri database."]])
    + `<div class="mt-4">${table(["Key", "Hit Rate", "TTL", "Ukuran"],
      [["prompts:trending", "94%", "5m", "2.1 MB"], ["prompts:latest", "91%", "2m", "1.8 MB"], ["users:leaderboard", "88%", "15m", "640 KB"], ["settings:global", "99%", "1h", "24 KB"]]
      .map(r => `<tr><td class="font-mono text-[12px]">${r[0]}</td><td>${r[1]}</td><td>${r[2]}</td><td>${r[3]}</td></tr>`).join(""))}</div>`) });

  V.session = () => ({ html: panel("Session Manager",
    table(["User", "IP", "Device", "Mulai", "Aksi"],
      USERS.slice(0, 5).map(u => `<tr><td class="font-bold">@${esc(u.username)}</td><td class="font-mono text-[11px]">${u.lastIp}</td>
        <td class="text-[12px]">${u.device}</td><td>2 Ags 2026 08:${10 + u.id}</td>
        <td><button class="btn btn-sm btn-danger act-tool" data-tool="Akhiri sesi @${esc(u.username)}">Akhiri Sesi</button></td></tr>`).join(""),
    ), `<button class="btn btn-sm btn-danger act-tool" data-tool="Akhiri semua sesi">Akhiri Semua</button>`) });

  V.webhook = () => ({ html: panel("Webhook",
    table(["URL", "Event", "Status", "Terakhir", "Aksi"],
      [["https://hooks.ryedz.id/discord", "prompt.approved", "aktif", "5 menit lalu"],
       ["https://hooks.ryedz.id/slack", "user.banned", "aktif", "1 jam lalu"],
       ["https://n8n.ryedz.id/webhook/x", "prompt.created", "error", "3 jam lalu"]]
      .map(r => `<tr><td class="font-mono text-[11.5px]">${r[0]}</td><td><span class="pill p-info">${r[1]}</span></td>
        <td><span class="pill ${r[2] === "aktif" ? "p-ok" : "p-bad"}">${r[2]}</span></td><td>${r[3]}</td>
        <td><button class="btn btn-sm act-tool" data-tool="Tes webhook"><i class="fa-solid fa-vial"></i></button></td></tr>`).join(""),
    ), `<button class="btn btn-sm btn-primary act-tool" data-tool="Tambah webhook"><i class="fa-solid fa-plus"></i> Tambah</button>`) });

  V.integrasi = () => ({ html: panel("Integrasi",
    `<div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">${[
      ["fa-brands fa-google", "Google OAuth", true], ["fa-brands fa-github", "GitHub OAuth", true],
      ["fa-brands fa-discord", "Discord OAuth", true], ["fa-solid fa-bolt", "Supabase", true],
      ["fa-brands fa-cloudflare", "Cloudflare", true], ["fa-brands fa-stripe", "Stripe", false],
      ["fa-solid fa-chart-simple", "Google Analytics", true], ["fa-brands fa-telegram", "Telegram Bot", false]]
      .map(([i, t, on]) => `<div class="glass p-4"><i class="${i} text-xl text-cyan-300"></i>
        <div class="font-bold text-sm mt-2">${t}</div>
        <label class="flex items-center gap-2 mt-2 text-[11px] cursor-pointer"><input type="checkbox" class="accent-cyan-400 sw" ${on ? "checked" : ""}> ${on ? "Terhubung" : "Nonaktif"}</label></div>`).join("")}</div>`) });

  V.domain = () => ({ html: panel("Domain & SSL",
    table(["Domain", "Tipe", "SSL", "Kedaluwarsa", "Status"],
      [["ryedz.id", "Primary", "Let's Encrypt", "12 Jan 2027", "aktif"],
       ["www.ryedz.id", "Alias", "Let's Encrypt", "12 Jan 2027", "aktif"],
       ["cdn.ryedz.id", "CDN", "Cloudflare", "Auto", "aktif"],
       ["api.ryedz.id", "API", "Let's Encrypt", "12 Jan 2027", "aktif"]]
      .map(r => `<tr><td class="font-bold font-mono">${r[0]}</td><td>${r[1]}</td><td>${r[2]}</td><td>${r[3]}</td>
        <td><span class="pill p-ok">${r[4]}</span></td></tr>`).join(""))) });

  V.version = () => ({ html: panel("Version & Changelog",
    `<div class="space-y-3">${[
      ["v3.4.0", "2 Ags 2026", "Riwayat update prompt, badge history, AI content checker."],
      ["v3.3.1", "18 Jul 2026", "Perbaikan bug rating & optimasi query leaderboard."],
      ["v3.3.0", "2 Jul 2026", "Sistem level & reputation point."],
      ["v3.2.0", "10 Jun 2026", "Login Google, GitHub, Discord."]]
      .map(([v, d, n]) => `<div class="glass p-3 flex gap-3 items-start"><span class="badge b-level">${v}</span>
        <div><div class="text-sm">${n}</div><div class="text-[11px] text-[color:var(--muted)]">${d}</div></div></div>`).join("")}</div>`) });

  V.keamanan = () => ({ html: panel("Keamanan",
    toggles([["Two Factor Authentication", "Wajibkan 2FA untuk admin & moderator.", true],
      ["CAPTCHA", "Aktifkan pada login, register, dan upload.", true],
      ["Rate Limiter", "Batasi 120 permintaan per menit per IP.", true],
      ["Anti Spam", "Deteksi pola spam otomatis.", true],
      ["Anti Bot", "Blokir user-agent mencurigakan.", true],
      ["CSRF Protection", "Token CSRF pada semua form.", true],
      ["XSS Protection", "Sanitasi input & output.", true],
      ["SQL Injection Protection", "Prepared statement wajib.", true]])
    + `<div class="grid lg:grid-cols-2 gap-3 mt-4">
      ${panel("Login Logs", table(["User", "IP", "Device", "Waktu", "Hasil"],
        USERS.map(u => `<tr><td>@${esc(u.username)}</td><td class="font-mono text-[11px]">${u.lastIp}</td><td class="text-[12px]">${u.device}</td>
          <td>2 Ags 2026</td><td><span class="pill ${u.status === "banned" ? "p-bad" : "p-ok"}">${u.status === "banned" ? "ditolak" : "sukses"}</span></td></tr>`).join("")))}
      ${panel("IP Ban", table(["IP", "Alasan", "Tanggal"],
        [["45.61.xx.202", "Brute force login", "1 Ags 2026"], ["185.220.xx.44", "Scraping massal", "28 Jul 2026"], ["91.219.xx.9", "Phishing link", "22 Jul 2026"]]
        .map(r => `<tr><td class="font-mono">${r[0]}</td><td>${r[1]}</td><td>${r[2]}</td></tr>`).join("")))}</div>`) });

  V["role-permission"] = () => ({ html: panel("Role & Permission",
    table(["Permission", "Admin", "Moderator", "Premium", "User"],
      ["Kelola pengguna", "Ban / Unban", "Approve prompt", "Hapus komentar", "Kelola kategori", "Akses analytics",
       "Upload prompt", "Beri badge", "Kelola pengaturan", "Akses API admin", "Backup database"]
      .map((p, i) => `<tr><td class="font-bold">${p}</td>
        ${[true, i > 1 && i < 6, i === 6, i === 6].map(v => `<td>${v ? '<i class="fa-solid fa-check text-emerald-400"></i>' : '<i class="fa-solid fa-xmark text-red-400/70"></i>'}</td>`).join("")}</tr>`).join(""),
    ), `<button class="btn btn-sm btn-primary act-tool" data-tool="Tambah role"><i class="fa-solid fa-plus"></i> Tambah Role</button>`) });

  V.blacklist = () => ({ html: panel("Blacklist",
    `<div class="grid lg:grid-cols-2 gap-3">
      ${panel("IP / Domain Diblokir", table(["Entri", "Tipe", "Alasan"],
        [["45.61.xx.202", "IP", "Brute force"], ["spam-link.xyz", "Domain", "Phishing"], ["free-crypto.top", "Domain", "Penipuan"]]
        .map(r => `<tr><td class="font-mono">${r[0]}</td><td>${r[1]}</td><td>${r[2]}</td></tr>`).join("")))}
      ${panel("Kata Terlarang", `<div class="flex flex-wrap gap-2">${["judi", "phishing", "crack", "keygen", "porn", "scam", "carding", "ddos"].map(w => `<span class="chip">${w} <i class="fa-solid fa-xmark ml-1"></i></span>`).join("")}</div>
        <div class="flex gap-2 mt-3"><input class="field" placeholder="Tambah kata…"><button class="btn btn-primary act-tool" data-tool="Tambah kata terlarang">Tambah</button></div>`)}
    </div>`) });

  V.whitelist = () => ({ html: panel("Whitelist",
    table(["Entri", "Tipe", "Catatan"],
      [["103.94.xx.11", "IP", "Kantor Ryedz.id"], ["ryedz.id", "Domain", "Domain utama"], ["github.com", "Domain", "Sumber tepercaya"], ["openai.com", "Domain", "Sumber tepercaya"]]
      .map(r => `<tr><td class="font-mono">${r[0]}</td><td>${r[1]}</td><td>${r[2]}</td></tr>`).join(""),
    ), `<button class="btn btn-sm btn-primary act-tool" data-tool="Tambah whitelist"><i class="fa-solid fa-plus"></i> Tambah</button>`) });

  V["audit-log"] = () => ({ html: panel("Audit Log",
    table(["Waktu", "Aktor", "Aksi", "IP"],
      ACTIVITY.concat(ACTIVITY).map(a => `<tr><td class="text-[12px]">${a.date}</td><td class="font-bold">@${a.user}</td>
        <td>${esc(a.action)}</td><td class="font-mono text-[11px]">${a.ip}</td></tr>`).join(""))) });

  V.activity = () => ({ html: panel("Activity Feed",
    `<div class="space-y-2">${ACTIVITY.concat(ACTIVITY).map(a => `
      <div class="glass p-3 flex gap-3 items-start"><div class="w-8 h-8 rounded-lg grid place-items-center bg-white/5 text-cyan-300 shrink-0"><i class="fa-solid fa-wave-square"></i></div>
      <div><div class="text-sm">${esc(a.action)}</div><div class="text-[11px] text-[color:var(--muted)]">@${a.user} · ${a.date}</div></div></div>`).join("")}</div>`) });

  V["support-ticket"] = () => ({ html: panel("Support Ticket",
    table(["#", "Subjek", "Pengguna", "Prioritas", "Status", "Aksi"],
      [["#1042", "Prompt saya ditolak tanpa alasan", "farreladi", "tinggi", "open"],
       ["#1041", "Tidak bisa upload thumbnail", "kiranaayu", "sedang", "open"],
       ["#1040", "Permintaan verifikasi centang biru", "nadiapr", "rendah", "pending"],
       ["#1039", "Banding ban permanen", "spambot99", "tinggi", "closed"]]
      .map(r => `<tr><td class="font-mono font-bold">${r[0]}</td><td>${r[1]}</td><td>@${r[2]}</td>
        <td><span class="pill ${r[3] === "tinggi" ? "p-bad" : r[3] === "sedang" ? "p-wait" : "p-info"}">${r[3]}</span></td>
        <td><span class="pill ${r[4] === "open" ? "p-wait" : r[4] === "closed" ? "p-ok" : "p-info"}">${r[4]}</span></td>
        <td><button class="btn btn-sm act-tool" data-tool="Balas tiket ${r[0]}"><i class="fa-solid fa-reply"></i> Balas</button></td></tr>`).join(""))) });

  V.feedback = () => ({ html: panel("Feedback Pengguna",
    `<div class="grid sm:grid-cols-2 gap-3">${[
      ["nadiapr", 5, "UI-nya keren banget, glassmorphism-nya smooth!"],
      ["farreladi", 4, "Tambahkan fitur folder untuk menyimpan prompt favorit dong."],
      ["kiranaayu", 5, "Leaderboard bikin semangat upload tiap hari."],
      ["bagasetya", 3, "Review prompt kadang lama, semoga bisa lebih cepat."]]
      .map(([u, r, t]) => `<div class="glass p-4"><div class="flex items-center gap-2 mb-1">
        <span class="font-bold text-sm">@${u}</span><span class="stars">${"★".repeat(r)}${"☆".repeat(5 - r)}</span></div>
        <p class="text-sm text-[color:var(--muted)]">${t}</p></div>`).join("")}</div>`) });

  V.tema = () => ({ html: panel("Tema Website",
    `<div class="grid lg:grid-cols-2 gap-4">
      <div><label class="lbl">Preset Warna</label>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">${[["Neon Cyan", "#22d3ee"], ["Ungu Galaksi", "#a855f7"], ["Biru Elektrik", "#3b82f6"], ["Pink Nebula", "#ec4899"]]
          .map(([n, c]) => `<button class="glass glass-hover p-3 text-center act-tool" data-tool="Terapkan tema ${n}">
            <div class="w-full h-8 rounded-lg mb-2" style="background:linear-gradient(135deg,${c},#0a0b1a)"></div>
            <div class="text-[11px] font-bold">${n}</div></button>`).join("")}</div>
        <div class="mt-4">${toggles([["Dark Mode Premium", "Tema gelap default situs.", true],
          ["Glassmorphism", "Efek kaca buram pada panel.", true],
          ["Animasi Halus", "Transisi & scroll reveal.", true],
          ["Loading Skeleton", "Placeholder saat memuat data.", true]])}</div></div>
      <div class="glass p-4"><div class="text-xs text-[color:var(--muted)] mb-2">Pratinjau</div>
        <div class="glass p-4"><div class="h-3 w-1/2 rounded-full mb-2" style="background:linear-gradient(90deg,#22d3ee,#a855f7)"></div>
          <div class="skeleton h-3 w-full mb-1.5"></div><div class="skeleton h-3 w-4/5 mb-3"></div>
          <button class="btn btn-sm btn-primary">Tombol Utama</button></div></div>
    </div>`) });

  V.pengaturan = () => ({ html: panel("Pengaturan Website",
    `<div class="grid lg:grid-cols-2 gap-4">
      <form class="space-y-3">
        <div><label class="lbl">Nama Website</label><input class="field" value="Ryedz.id"></div>
        <div><label class="lbl">Slogan</label><input class="field" value="Ryedz Pengen Famous"></div>
        <div><label class="lbl">Email Kontak</label><input class="field" value="halo@ryedz.id"></div>
        <div><label class="lbl">Bahasa Default</label><select class="field"><option>Indonesia</option><option>English</option></select></div>
        <div><label class="lbl">Zona Waktu</label><select class="field"><option>Asia/Jakarta (WIB)</option><option>UTC</option></select></div>
        <button type="button" class="btn btn-primary act-tool" data-tool="Simpan pengaturan"><i class="fa-solid fa-floppy-disk"></i> Simpan</button>
      </form>
      ${toggles([["Registrasi Terbuka", "Izinkan pendaftaran pengguna baru.", true],
        ["Wajib Verifikasi Email", "Aktivasi akun via email.", true],
        ["Upload Perlu Review", "Semua prompt melewati moderasi.", true],
        ["Komentar Aktif", "Izinkan komentar pada prompt.", true],
        ["Mode Iklan", "Tampilkan slot iklan (kecuali Premium).", true]])}
    </div>`) });

  V.maintenance = () => ({ html: panel("Maintenance Mode",
    `<div class="grid lg:grid-cols-2 gap-4">
      <form class="space-y-3">
        ${toggles([["Aktifkan Maintenance", "Situs hanya bisa diakses admin.", false]])}
        <div><label class="lbl">Pesan Maintenance</label><textarea class="field" rows="3">Ryedz.id sedang dalam perbaikan. Kami segera kembali!</textarea></div>
        <div class="grid grid-cols-2 gap-3"><div><label class="lbl">Mulai</label><input class="field" type="datetime-local"></div>
        <div><label class="lbl">Selesai</label><input class="field" type="datetime-local"></div></div>
        <button type="button" class="btn btn-danger act-tool" data-tool="Aktifkan maintenance"><i class="fa-solid fa-screwdriver-wrench"></i> Terapkan</button>
      </form>
      ${tools([["fa-broom", "Bersihkan Cache", "Setelah maintenance selesai."], ["fa-rotate", "Restart Worker", "Muat ulang antrean job."],
        ["fa-database", "Migrasi Database", "Jalankan migrasi terbaru."]])}
    </div>`) });

  V["system-monitor"] = () => ({ html: `
    <div class="grid sm:grid-cols-2 xl:grid-cols-4 gap-3">
      ${card("CPU Load", "34%", "fa-microchip", "#22d3ee")}${card("Memory", "6.2 / 16 GB", "fa-memory", "#a855f7")}
      ${card("Disk", "412 GB / 1 TB", "fa-hard-drive", "#3b82f6")}${card("Uptime", "182 hari", "fa-clock", "#22c55e")}
    </div>
    ${panel("Realtime Resource", `<canvas id="mLive" height="110"></canvas>`)}
    ${panel("Status Layanan", table(["Layanan", "Status", "Latensi", "Uptime"],
      [["Web Server", "ok", "42 ms", "99.99%"], ["Database", "ok", "8 ms", "99.98%"], ["Redis Cache", "ok", "1 ms", "100%"],
       ["Storage / CDN", "ok", "24 ms", "99.97%"], ["Queue Worker", "degraded", "310 ms", "99.42%"], ["Email SMTP", "ok", "120 ms", "99.90%"]]
      .map(r => `<tr><td class="font-bold">${r[0]}</td><td><span class="pill ${r[1] === "ok" ? "p-ok" : "p-wait"}">${r[1]}</span></td>
        <td>${r[2]}</td><td>${r[3]}</td></tr>`).join("")))}`,
    after() {
      chart("mLive", { type: "line", data: { labels: Array.from({ length: 20 }, (_, i) => i + 1), datasets: [
        { label: "CPU %", data: rnd(20, 18, 62), borderColor: "#22d3ee", tension: .4, borderWidth: 2, pointRadius: 0 },
        { label: "RAM %", data: rnd(20, 30, 70), borderColor: "#a855f7", tension: .4, borderWidth: 2, pointRadius: 0 }] },
        options: { scales: { y: { max: 100 } } } });
    } });

  /* ---------------- Router ---------------- */
  let current = "dashboard";
  function render(key) {
    destroyCharts();
    current = key;
    const meta = MENU.flatMap(g => g.items).find(i => i[0] === key) || ["", "Dashboard"];
    $("#pageTitle").textContent = meta[1];
    $("#pageSub").textContent = subOf(key);
    const view = (V[key] || fallback(meta[1]))();
    const root = $("#view");
    root.innerHTML = view.html;
    bindTools(root);
    if (view.after) view.after(root);
    $$("#sideNav .side-link").forEach(a => a.classList.toggle("active", a.dataset.k === key));
    if (innerWidth < 1024) $("#sidebar").classList.add("-translate-x-full");
    root.scrollIntoView({ behavior: "smooth", block: "start" });
  }
  function subOf(k) {
    return {
      dashboard: "Ringkasan performa Ryedz.id", analytics: "Perilaku dan asal pengunjung",
      prompt: "Kelola seluruh prompt di platform", users: "Kelola akun, badge, level, dan sanksi",
      keamanan: "Proteksi platform dan akun", database: "17 tabel utama Ryedz.id"
    }[k] || "Panel administrasi Ryedz.id";
  }
  const fallback = (t) => () => ({ html: panel(t,
    `<div class="text-center py-10"><i class="fa-solid fa-screwdriver-wrench text-3xl text-[color:var(--muted)] mb-3"></i>
      <p class="font-bold">Modul ${esc(t)} siap dihubungkan</p>
      <p class="text-sm text-[color:var(--muted)] max-w-md mx-auto mt-1">Struktur UI sudah tersedia. Hubungkan ke endpoint backend (PHP / Laravel / Node.js / Supabase) pada <code class="font-mono text-cyan-300">assets/js/data.js</code>.</p></div>`) });

  function buildSidebar() {
    $("#sideNav").innerHTML = MENU.map(g => `
      <div class="menu-group">
        <div class="text-[10px] font-extrabold uppercase tracking-widest text-[color:var(--muted)] px-2 mb-1">${g.group}</div>
        <div class="space-y-.5">${g.items.map(([k, l, i]) => `
          <a class="side-link" data-k="${k}"><i class="fa-solid ${i}"></i><span>${l}</span></a>`).join("")}</div>
      </div>`).join("");
    $$("#sideNav .side-link").forEach(a => a.onclick = () => { location.hash = a.dataset.k; });
    $("#menuSearch").oninput = e => {
      const q = e.target.value.toLowerCase();
      $$("#sideNav .menu-group").forEach(g => {
        let vis = 0;
        $$(".side-link", g).forEach(a => { const m = a.textContent.toLowerCase().includes(q); a.style.display = m ? "" : "none"; if (m) vis++; });
        g.style.display = vis ? "" : "none";
      });
    };
  }

  /* ---------------- Init ---------------- */
  document.addEventListener("DOMContentLoaded", async () => {
    USERS = await RyedzAPI.getUsers();
    PROMPTS = await RyedzAPI.getPrompts({ includeAll: true });
    REPORTS = await RyedzAPI.getReports();
    ACTIVITY = await RyedzAPI.getActivity();

    const openPanel = () => {
      $("#gate").classList.add("hide");
      $("#panel").classList.remove("hide");
      const adm = USERS[0];
      $("#admAva").src = adm.avatar; $("#admName").textContent = adm.name;
      buildSidebar();
      render(location.hash.slice(1) || "dashboard");
    };

    if (Auth.isAdmin()) openPanel();
    $("#gateForm").onsubmit = e => {
      e.preventDefault();
      const u = USERS.find(x => x.username === $("#gUser").value.trim());
      if (!u || u.role !== "admin") return toast("Akses ditolak. Akun ini bukan Administrator.", "bad");
      if ($("#g2fa").value.length !== 6) return toast("Kode 2FA tidak valid.", "bad");
      Auth.login(u); toast("Selamat datang kembali, Administrator.", "ok"); openPanel();
    };
    $("#btnLogout").onclick = () => { Auth.logout(); location.reload(); };
    $("#sideToggle").onclick = () => $("#sidebar").classList.toggle("-translate-x-full");
    $("#admNotif").onclick = () => modal(`<div class="flex items-center mb-4"><h3 class="text-lg font-extrabold">Notifikasi Admin</h3>
      <button class="btn btn-sm btn-ghost ml-auto" data-close>&times;</button></div>
      <div class="space-y-2 text-sm">
        <div class="glass p-3"><i class="fa-solid fa-clipboard-check text-amber-300"></i> 27 prompt menunggu review.</div>
        <div class="glass p-3"><i class="fa-solid fa-flag text-red-300"></i> 3 laporan baru belum ditindak.</div>
        <div class="glass p-3"><i class="fa-solid fa-shield-halved text-emerald-300"></i> Rate limiter memblokir 612 permintaan.</div>
        <div class="glass p-3"><i class="fa-solid fa-box-archive text-cyan-300"></i> Backup harian berhasil (412 MB).</div></div>`);
    addEventListener("hashchange", () => render(location.hash.slice(1) || "dashboard"));
  });
})();
