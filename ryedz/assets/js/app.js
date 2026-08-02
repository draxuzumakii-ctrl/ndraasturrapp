/* =========================================================
   Ryedz.id — beranda.html logic
   ========================================================= */
(function () {
  "use strict";
  const { Auth, toast, modal, closeModal, fmt, dateID, esc, badgesHTML, levelHTML, starsHTML, highlight, Likes, Favs, copyText, observeReveal, countUp } = Ryedz;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

  let STATE = { q: "", sort: "terbaru", category: "", ai: "" };
  let USERS = [];

  /* ---------------- Navbar ---------------- */
  function renderAuth() {
    const u = Auth.user();
    const box = $("#authArea");
    if (!u) {
      box.innerHTML = `
        <button class="btn btn-sm btn-ghost" id="btnLogin"><i class="fa-solid fa-right-to-bracket"></i> Login</button>
        <button class="btn btn-sm btn-primary" id="btnRegister"><i class="fa-solid fa-user-plus"></i> Register</button>`;
      $("#btnLogin").onclick = () => authModal("login");
      $("#btnRegister").onclick = () => authModal("register");
    } else {
      box.innerHTML = `
        <button class="btn btn-sm btn-ghost relative" id="btnNotif"><i class="fa-solid fa-bell"></i>
          <span class="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-pink-500 text-[9px] grid place-items-center font-bold">3</span></button>
        <button class="flex items-center gap-2 pl-1 pr-3 py-1 rounded-full border border-white/10 hover:border-white/25 transition" id="btnProfile">
          <img src="${u.avatar}" class="w-7 h-7 rounded-full" alt=""><span class="text-xs font-bold hidden sm:block">${esc(u.name)}</span>
          ${badgesHTML(u.badges, { small: true, max: 2 })}
        </button>`;
      $("#btnProfile").onclick = () => profileModal(u.id);
      $("#btnNotif").onclick = notifModal;
    }
  }

  /* ---------------- Auth modals ---------------- */
  function socialRow() {
    return `<div class="grid grid-cols-3 gap-2 mt-4">
      ${[["google", "fa-brands fa-google", "Google"], ["github", "fa-brands fa-github", "GitHub"], ["discord", "fa-brands fa-discord", "Discord"]]
        .map(([k, i, l]) => `<button class="btn btn-sm btn-ghost" data-social="${k}"><i class="${i}"></i> ${l}</button>`).join("")}
    </div>`;
  }

  function authModal(mode) {
    const isLogin = mode === "login";
    const s = modal(`
      <div class="flex items-center gap-3 mb-5">
        <div class="w-10 h-10 rounded-xl grid place-items-center text-[#06080f] font-black" style="background:linear-gradient(135deg,#22d3ee,#a855f7)">R</div>
        <div><h3 class="text-xl font-extrabold">${isLogin ? "Masuk ke Ryedz.id" : "Buat Akun Baru"}</h3>
        <p class="text-xs text-[color:var(--muted)]">Ryedz Pengen Famous — bergabunglah dengan komunitas.</p></div>
        <button class="btn btn-sm btn-ghost ml-auto" data-close>&times;</button>
      </div>
      <form id="authForm" class="space-y-3">
        ${isLogin ? "" : `<div><label class="lbl">Nama Lengkap</label><input name="name" class="field" required placeholder="Nama kamu"></div>`}
        <div><label class="lbl">${isLogin ? "Username / Email" : "Username"}</label><input name="id" class="field" required placeholder="${isLogin ? "ryedz" : "username_unik"}"></div>
        ${isLogin ? "" : `<div><label class="lbl">Email</label><input name="email" type="email" class="field" required placeholder="email@kamu.com"></div>`}
        <div><label class="lbl">Password</label><input name="pass" type="password" class="field" required placeholder="••••••••"></div>
        ${isLogin ? `<div class="flex items-center justify-between text-xs">
            <label class="flex items-center gap-2 text-[color:var(--muted)]"><input type="checkbox" class="accent-cyan-400"> Ingat saya</label>
            <button type="button" class="text-cyan-300 hover:underline" id="forgot">Lupa password?</button></div>` : ""}
        <button class="btn btn-primary w-full !rounded-xl" type="submit">${isLogin ? "Masuk" : "Daftar Sekarang"}</button>
      </form>
      <div class="flex items-center gap-3 my-4 text-[11px] text-[color:var(--muted)]"><div class="flex-1 h-px bg-white/10"></div>ATAU LANJUTKAN DENGAN<div class="flex-1 h-px bg-white/10"></div></div>
      ${socialRow()}
      <p class="text-center text-xs text-[color:var(--muted)] mt-5">
        ${isLogin ? "Belum punya akun?" : "Sudah punya akun?"}
        <button class="text-cyan-300 font-bold hover:underline" id="swapMode">${isLogin ? "Register" : "Login"}</button></p>
      <p class="text-center text-[10px] text-[color:var(--muted)] mt-3">Demo: coba username <b>ryedz</b> (admin), <b>bagasetya</b> (suspend), <b>spambot99</b> (banned).</p>
    `);
    $("#swapMode", s).onclick = () => authModal(isLogin ? "register" : "login");
    const fg = $("#forgot", s); if (fg) fg.onclick = forgotModal;
    $$("[data-social]", s).forEach(b => b.onclick = async () => {
      toast(`Menghubungkan ke ${b.textContent.trim()}…`);
      const r = await Auth.signIn("farreladi", "");
      if (r.ok) { closeModal(); renderAuth(); toast(`Berhasil masuk sebagai ${r.user.name}`, "ok"); }
    });
    $("#authForm", s).onsubmit = async (e) => {
      e.preventDefault();
      const id = e.target.id.value.trim();
      const r = await Auth.signIn(id, e.target.pass.value);
      if (r.banned) return bannedModal();
      if (r.suspended) { closeModal(); return toast("Akun kamu sedang disuspend sementara.", "warn"); }
      closeModal(); renderAuth();
      toast(`Selamat datang, ${r.user.name}!`, "ok");
    };
  }

  function forgotModal() {
    const s = modal(`<h3 class="text-lg font-extrabold mb-1">Lupa Password</h3>
      <p class="text-xs text-[color:var(--muted)] mb-4">Kami akan mengirim tautan reset ke email kamu.</p>
      <form id="fp" class="space-y-3"><input type="email" class="field" placeholder="email@kamu.com" required>
      <button class="btn btn-primary w-full !rounded-xl">Kirim Tautan Reset</button></form>
      <button class="btn btn-sm btn-ghost w-full mt-3" data-close>Kembali</button>`);
    $("#fp", s).onsubmit = e => { e.preventDefault(); closeModal(); toast("Tautan reset password telah dikirim.", "ok"); };
  }

  function bannedModal() {
    modal(`<div class="text-center py-4">
      <div class="w-16 h-16 rounded-2xl grid place-items-center mx-auto mb-4 bg-red-500/15 border border-red-500/30 text-red-400 text-2xl"><i class="fa-solid fa-ban"></i></div>
      <h3 class="text-xl font-extrabold text-red-300 mb-2">Akun Diblokir Permanen</h3>
      <p class="text-sm text-[color:var(--muted)] max-w-sm mx-auto">“Akun Anda telah diblokir permanen karena melanggar kebijakan Ryedz.id.”</p>
      <ul class="text-xs text-[color:var(--muted)] mt-4 space-y-1">
        <li>• Akun tidak bisa login.</li><li>• Semua prompt disembunyikan.</li></ul>
      <div class="flex gap-2 justify-center mt-5">
        <button class="btn btn-sm" data-close>Tutup</button>
        <button class="btn btn-sm btn-primary" onclick="Ryedz.toast('Banding dikirim ke tim moderasi.','ok');Ryedz.closeModal()">Ajukan Banding</button></div>
    </div>`);
  }

  function notifModal() {
    RyedzAPI.getNotifications().then(list => {
      modal(`<div class="flex items-center mb-4"><h3 class="text-lg font-extrabold">Notifikasi</h3>
        <button class="btn btn-sm btn-ghost ml-auto" data-close>&times;</button></div>
        <div class="space-y-2">${list.map(n => `<div class="glass p-3 flex gap-3 items-start">
          <div class="w-8 h-8 rounded-lg grid place-items-center bg-white/5 text-cyan-300"><i class="fa-solid ${n.icon}"></i></div>
          <div><div class="text-sm">${esc(n.text)}</div><div class="text-[11px] text-[color:var(--muted)] mt-.5">${n.date}</div></div></div>`).join("")}</div>
        <button class="btn btn-sm btn-danger w-full mt-4" onclick="Ryedz.Auth.logout();location.reload()"><i class="fa-solid fa-right-from-bracket"></i> Keluar</button>`);
    });
  }

  /* ---------------- Kategori ---------------- */
  function renderCategories() {
    const g = $("#catGrid");
    g.innerHTML = RyedzData.CATEGORIES.map((c, i) => `
      <button class="glass glass-hover p-4 text-left reveal cat-btn" data-cat="${c.slug}" style="transition-delay:${i * 25}ms">
        <div class="w-10 h-10 rounded-xl grid place-items-center mb-3" style="background:${c.color}22;color:${c.color};border:1px solid ${c.color}44">
          <i class="fa-solid ${c.icon}"></i></div>
        <div class="font-bold text-sm">${c.name}</div>
        <div class="text-[11px] text-[color:var(--muted)] mt-.5 cat-count">0 prompt</div>
      </button>`).join("");
    $$(".cat-btn", g).forEach(b => b.onclick = () => {
      STATE.category = STATE.category === b.dataset.cat ? "" : b.dataset.cat;
      $("#filterCat").value = STATE.category;
      $$(".cat-btn").forEach(x => x.classList.toggle("neon-ring", x.dataset.cat === STATE.category));
      renderResults(); document.getElementById("jelajah").scrollIntoView({ behavior: "smooth" });
    });
    RyedzAPI.getPrompts({}).then(list => {
      $$(".cat-btn", g).forEach(b => {
        const n = list.filter(p => p.category === b.dataset.cat).length;
        $(".cat-count", b).textContent = `${n} prompt`;
      });
    });
    observeReveal(g);
  }

  /* ---------------- Prompt card ---------------- */
  function cardHTML(p) {
    const author = USERS.find(u => u.id === p.authorId) || {};
    const liked = Likes.has(p.id), fav = Favs.has(p.id);
    return `
    <article class="pcard glass glass-hover reveal" data-id="${p.id}">
      <div class="thumb"><img loading="lazy" src="${p.thumb}" alt="${esc(p.title)}">
        <div class="absolute top-3 left-3 flex gap-1.5 z-10">
          <span class="badge b-level"><i class="fa-solid fa-robot"></i>${esc(p.ai)}</span>
          ${p.featured ? `<span class="badge b-premium"><i class="fa-solid fa-star"></i>Featured</span>` : ""}
          ${p.pinned ? `<span class="badge b-top"><i class="fa-solid fa-thumbtack"></i>Pinned</span>` : ""}
        </div>
        <div class="absolute bottom-3 right-3 z-10 flex items-center gap-2 text-[11px] font-bold text-white/90">
          ${starsHTML(p.rating)}<span>${p.rating.toFixed(1)}</span></div>
      </div>
      <div class="p-4 flex flex-col flex-1">
        <h3 class="font-extrabold leading-snug open-detail cursor-pointer hover:text-cyan-300 transition">${esc(p.title)}</h3>
        <p class="text-[13px] text-[color:var(--muted)] mt-1.5 line-clamp-2">${esc(p.desc)}</p>
        <div class="flex items-center gap-2 mt-3">
          <img src="${author.avatar}" class="w-6 h-6 rounded-full" alt="">
          <span class="text-xs font-bold">${esc(author.name || "-")}</span>
          ${badgesHTML(author.badges || [], { small: true, max: 3 })}
          <span class="ml-auto text-[11px] text-[color:var(--muted)]">${dateID(p.date)}</span>
        </div>
        <div class="flex items-center gap-3 mt-3 text-[11px] text-[color:var(--muted)] font-semibold">
          <span><i class="fa-solid fa-eye"></i> ${fmt(p.views)}</span>
          <span><i class="fa-solid fa-heart"></i> ${fmt(p.likes)}</span>
          <span><i class="fa-solid fa-copy"></i> ${fmt(p.copies)}</span>
          <span><i class="fa-solid fa-comment"></i> ${p.comments.length}</span>
        </div>
        <div class="flex flex-wrap gap-1.5 mt-3">${p.tags.map(t => `<span class="chip !py-.5 !px-2 !text-[10px]">#${esc(t)}</span>`).join("")}</div>
        <div class="flex items-center gap-1.5 mt-4 pt-3 border-t border-white/10">
          <button class="btn btn-sm btn-primary act-copy" data-id="${p.id}"><i class="fa-solid fa-copy"></i> Copy</button>
          <button class="btn btn-sm act-like ${liked ? "!text-pink-300 !border-pink-400/40" : ""}" data-id="${p.id}" title="Like"><i class="fa-${liked ? "solid" : "regular"} fa-heart"></i></button>
          <button class="btn btn-sm act-fav ${fav ? "!text-amber-300 !border-amber-400/40" : ""}" data-id="${p.id}" title="Favorit"><i class="fa-${fav ? "solid" : "regular"} fa-bookmark"></i></button>
          <button class="btn btn-sm act-share" data-id="${p.id}" title="Share"><i class="fa-solid fa-share-nodes"></i></button>
          <button class="btn btn-sm act-report ml-auto" data-id="${p.id}" title="Laporkan"><i class="fa-solid fa-flag"></i></button>
        </div>
      </div>
    </article>`;
  }

  function skeletons(n) {
    return Array.from({ length: n }).map(() => `<div class="glass p-0 overflow-hidden">
      <div class="skeleton" style="aspect-ratio:16/9;border-radius:0"></div>
      <div class="p-4 space-y-2"><div class="skeleton h-4 w-3/4"></div><div class="skeleton h-3 w-full"></div>
      <div class="skeleton h-3 w-2/3"></div><div class="skeleton h-8 w-full mt-3"></div></div></div>`).join("");
  }

  function bindCards(root) {
    $$(".pcard", root).forEach(c => {
      $(".open-detail", c).onclick = () => openDetail(c.dataset.id);
      $(".thumb", c).onclick = () => openDetail(c.dataset.id);
    });
    $$(".act-copy", root).forEach(b => b.onclick = async e => {
      e.stopPropagation();
      const p = await RyedzAPI.getPrompt(b.dataset.id);
      await copyText(p.body); p.copies++; toast("Prompt disalin ke clipboard!", "ok");
    });
    $$(".act-like", root).forEach(b => b.onclick = async e => {
      e.stopPropagation();
      if (!Auth.isLogin()) return needLogin("menyukai prompt");
      const on = Likes.toggle(Number(b.dataset.id));
      b.classList.toggle("!text-pink-300", on); b.classList.toggle("!border-pink-400/40", on);
      b.innerHTML = `<i class="fa-${on ? "solid" : "regular"} fa-heart"></i>`;
      toast(on ? "Ditambahkan ke Like" : "Like dibatalkan", on ? "ok" : "info");
    });
    $$(".act-fav", root).forEach(b => b.onclick = e => {
      e.stopPropagation();
      if (!Auth.isLogin()) return needLogin("menyimpan favorit");
      const on = Favs.toggle(Number(b.dataset.id));
      b.classList.toggle("!text-amber-300", on); b.classList.toggle("!border-amber-400/40", on);
      b.innerHTML = `<i class="fa-${on ? "solid" : "regular"} fa-bookmark"></i>`;
      toast(on ? "Disimpan ke Favorit" : "Dihapus dari Favorit", on ? "ok" : "info");
    });
    $$(".act-share", root).forEach(b => b.onclick = async e => {
      e.stopPropagation();
      const url = location.origin + location.pathname + "?prompt=" + b.dataset.id;
      if (navigator.share) { try { await navigator.share({ title: "Ryedz.id", url }); return; } catch {} }
      await copyText(url); toast("Link prompt disalin!", "ok");
    });
    $$(".act-report", root).forEach(b => b.onclick = e => { e.stopPropagation(); reportModal(b.dataset.id); });
    observeReveal(root);
  }

  function needLogin(aksi = "melanjutkan") {
    const s = modal(`<div class="text-center py-3">
      <div class="w-14 h-14 rounded-2xl grid place-items-center mx-auto mb-4 neon-ring" style="background:linear-gradient(135deg,#22d3ee33,#a855f733)"><i class="fa-solid fa-lock text-cyan-300 text-xl"></i></div>
      <h3 class="text-lg font-extrabold mb-2">Silakan login terlebih dahulu</h3>
      <p class="text-sm text-[color:var(--muted)]">“Silakan login terlebih dahulu untuk mengunggah prompt.”<br><span class="text-xs">Login diperlukan untuk ${esc(aksi)}.</span></p>
      <div class="flex gap-2 justify-center mt-5"><button class="btn btn-sm" data-close>Nanti saja</button>
      <button class="btn btn-sm btn-primary" id="goLogin">Login Sekarang</button></div></div>`);
    $("#goLogin", s).onclick = () => authModal("login");
  }

  function reportModal(id) {
    const s = modal(`<h3 class="text-lg font-extrabold mb-1">Laporkan Prompt</h3>
      <p class="text-xs text-[color:var(--muted)] mb-4">Bantu kami menjaga kualitas komunitas Ryedz.id.</p>
      <form id="rp" class="space-y-3">
        <div><label class="lbl">Alasan</label><select class="field" required>
          ${["Spam", "Prompt berbahaya", "Konten ilegal", "Penipuan", "Pornografi", "Malware / Virus", "Link phishing", "Ujaran kebencian", "Plagiarisme"].map(r => `<option>${r}</option>`).join("")}
        </select></div>
        <div><label class="lbl">Detail (opsional)</label><textarea class="field" rows="3" placeholder="Jelaskan singkat…"></textarea></div>
        <div class="flex gap-2"><button type="button" class="btn flex-1" data-close>Batal</button>
        <button class="btn btn-danger flex-1"><i class="fa-solid fa-flag"></i> Kirim Laporan</button></div>
      </form>`);
    $("#rp", s).onsubmit = e => { e.preventDefault(); closeModal(); toast("Laporan dikirim ke tim moderasi. Terima kasih!", "ok"); };
  }

  /* ---------------- Detail prompt ---------------- */
  async function openDetail(id) {
    const p = await RyedzAPI.getPrompt(id);
    if (!p) return;
    p.views++;
    const a = USERS.find(u => u.id === p.authorId) || {};
    const similar = (await RyedzAPI.getPrompts({ category: p.category })).filter(x => x.id !== p.id).slice(0, 3);
    const s = modal(`
      <div class="flex items-start gap-3 mb-4">
        <div class="flex-1">
          <div class="flex flex-wrap gap-1.5 mb-2"><span class="badge b-level"><i class="fa-solid fa-robot"></i>${esc(p.ai)}</span>
            <span class="badge b-top"><i class="fa-solid fa-folder"></i>${esc(RyedzData.CATEGORIES.find(c => c.slug === p.category)?.name || p.category)}</span></div>
          <h2 class="text-2xl font-extrabold leading-tight">${esc(p.title)}</h2>
          <p class="text-sm text-[color:var(--muted)] mt-1.5">${esc(p.desc)}</p>
        </div>
        <button class="btn btn-sm btn-ghost" data-close>&times;</button>
      </div>

      <div class="flex flex-wrap items-center gap-3 pb-4 mb-4 border-b border-white/10">
        <img src="${a.avatar}" class="w-10 h-10 rounded-full ring-1 ring-white/15" alt="">
        <div><div class="font-bold text-sm flex items-center gap-1.5">${esc(a.name)} ${badgesHTML(a.badges || [], { small: true })}</div>
          <div class="text-[11px] text-[color:var(--muted)]">@${esc(a.username)} · ${dateID(p.date)}</div></div>
        <button class="btn btn-sm ml-auto" id="viewProfile"><i class="fa-solid fa-user"></i> Profil</button>
      </div>

      <div class="grid grid-cols-4 gap-2 mb-4 text-center">
        ${[["eye", "View", fmt(p.views)], ["heart", "Like", fmt(p.likes)], ["copy", "Copy", fmt(p.copies)], ["comment", "Komentar", p.comments.length]]
          .map(([i, l, v]) => `<div class="glass p-2"><div class="font-extrabold text-sm">${v}</div><div class="text-[10px] text-[color:var(--muted)]"><i class="fa-solid fa-${i}"></i> ${l}</div></div>`).join("")}
      </div>

      <div class="relative mb-4">
        <button class="btn btn-sm btn-primary absolute right-3 top-3 z-10" id="dCopy"><i class="fa-solid fa-copy"></i> Copy Prompt</button>
        <pre class="code">${highlight(p.body)}</pre>
      </div>

      <div class="flex flex-wrap gap-2 mb-5">
        <button class="btn btn-sm" id="dLike"><i class="fa-${Likes.has(p.id) ? "solid" : "regular"} fa-heart"></i> Like</button>
        <button class="btn btn-sm" id="dFav"><i class="fa-${Favs.has(p.id) ? "solid" : "regular"} fa-bookmark"></i> Bookmark</button>
        <button class="btn btn-sm" id="dShare"><i class="fa-solid fa-share-nodes"></i> Share</button>
        <button class="btn btn-sm btn-danger ml-auto" id="dReport"><i class="fa-solid fa-flag"></i> Laporkan</button>
      </div>

      <div class="glass p-4 mb-5">
        <div class="flex items-center gap-3 flex-wrap">
          <div><div class="text-3xl font-extrabold neon-text">${p.rating.toFixed(1)}</div>
            <div class="text-[11px] text-[color:var(--muted)]">${p.ratingCount} penilaian</div></div>
          <div class="ml-auto text-right"><div class="text-[11px] text-[color:var(--muted)] mb-1">Beri rating kamu</div>
            <div id="rateStars" class="text-2xl text-amber-300 cursor-pointer select-none">
              ${[1, 2, 3, 4, 5].map(i => `<i class="fa-regular fa-star hover:scale-125 transition inline-block" data-r="${i}"></i>`).join("")}</div></div>
        </div>
      </div>

      <div class="mb-5">
        <h4 class="font-extrabold mb-3"><i class="fa-solid fa-clock-rotate-left text-cyan-300"></i> Riwayat Update Prompt</h4>
        <div class="space-y-2">${(p.history.length ? p.history : [{ v: "1.0", date: p.date, note: "Rilis awal" }]).map(h => `
          <div class="flex gap-3 items-start text-sm"><span class="badge b-level">v${h.v}</span>
          <div><div>${esc(h.note)}</div><div class="text-[11px] text-[color:var(--muted)]">${dateID(h.date)}</div></div></div>`).join("")}</div>
      </div>

      <div class="mb-5">
        <h4 class="font-extrabold mb-3"><i class="fa-solid fa-comments text-purple-300"></i> Komentar (${p.comments.length})</h4>
        <form id="cForm" class="flex gap-2 mb-4"><input class="field" placeholder="Tulis komentar…" required>
          <button class="btn btn-primary !px-4"><i class="fa-solid fa-paper-plane"></i></button></form>
        <div class="space-y-3" id="cList">${p.comments.map(c => commentHTML(c)).join("") || `<p class="text-sm text-[color:var(--muted)]">Belum ada komentar. Jadilah yang pertama!</p>`}</div>
      </div>

      <div>
        <h4 class="font-extrabold mb-3"><i class="fa-solid fa-layer-group text-cyan-300"></i> Prompt Serupa</h4>
        <div class="grid sm:grid-cols-3 gap-3">${similar.map(sp => `
          <button class="glass glass-hover p-3 text-left sim" data-id="${sp.id}">
            <img src="${sp.thumb}" class="w-full aspect-video object-cover rounded-lg mb-2" alt="">
            <div class="text-xs font-bold line-clamp-2">${esc(sp.title)}</div>
            <div class="text-[10px] text-[color:var(--muted)] mt-1"><i class="fa-solid fa-eye"></i> ${fmt(sp.views)}</div>
          </button>`).join("") || `<p class="text-sm text-[color:var(--muted)]">Tidak ada.</p>`}</div>
      </div>
    `, { wide: true });

    $("#dCopy", s).onclick = async () => { await copyText(p.body); p.copies++; toast("Prompt disalin!", "ok"); };
    $("#dLike", s).onclick = () => { if (!Auth.isLogin()) return needLogin("menyukai prompt"); const on = Likes.toggle(p.id); $("#dLike", s).innerHTML = `<i class="fa-${on ? "solid" : "regular"} fa-heart"></i> Like`; toast(on ? "Disukai!" : "Like dibatalkan", "ok"); };
    $("#dFav", s).onclick = () => { if (!Auth.isLogin()) return needLogin("menyimpan favorit"); const on = Favs.toggle(p.id); $("#dFav", s).innerHTML = `<i class="fa-${on ? "solid" : "regular"} fa-bookmark"></i> Bookmark`; toast(on ? "Disimpan!" : "Dihapus", "ok"); };
    $("#dShare", s).onclick = async () => { await copyText(location.origin + location.pathname + "?prompt=" + p.id); toast("Link disalin!", "ok"); };
    $("#dReport", s).onclick = () => reportModal(p.id);
    $("#viewProfile", s).onclick = () => profileModal(a.id);
    $$(".sim", s).forEach(b => b.onclick = () => openDetail(b.dataset.id));
    $$("#rateStars i", s).forEach(st => {
      st.onclick = () => { if (!Auth.isLogin()) return needLogin("memberi rating"); toast(`Terima kasih! Kamu memberi ${st.dataset.r} bintang.`, "ok"); };
      st.onmouseenter = () => $$("#rateStars i", s).forEach(x => x.className = `fa-${x.dataset.r <= st.dataset.r ? "solid" : "regular"} fa-star hover:scale-125 transition inline-block`);
    });
    $("#cForm", s).onsubmit = e => {
      e.preventDefault();
      if (!Auth.isLogin()) return needLogin("berkomentar");
      const u = Auth.user();
      const txt = e.target.querySelector("input").value;
      $("#cList", s).insertAdjacentHTML("afterbegin", commentHTML({ id: Date.now(), userId: u.id, text: txt, date: new Date().toISOString().slice(0, 10), likes: 0, replies: [] }, u));
      e.target.reset(); toast("Komentar terkirim!", "ok");
    };
  }

  function commentHTML(c, override) {
    const u = override || USERS.find(x => x.id === c.userId) || {};
    return `<div class="glass p-3 animate-in">
      <div class="flex items-center gap-2">
        <img src="${u.avatar}" class="w-7 h-7 rounded-full" alt="">
        <span class="text-xs font-bold">${esc(u.name)}</span>${badgesHTML(u.badges || [], { small: true, max: 3 })}
        <span class="ml-auto text-[10px] text-[color:var(--muted)]">${dateID(c.date)}</span>
      </div>
      <p class="text-sm mt-2">${esc(c.text)}</p>
      <div class="flex gap-3 mt-2 text-[11px] text-[color:var(--muted)] font-semibold">
        <button class="hover:text-pink-300"><i class="fa-regular fa-heart"></i> ${c.likes}</button>
        <button class="hover:text-cyan-300"><i class="fa-solid fa-reply"></i> Balas</button>
      </div>
      ${(c.replies || []).map(r => {
        const ru = USERS.find(x => x.id === r.userId) || {};
        return `<div class="mt-3 ml-6 pl-3 border-l border-white/10">
          <div class="flex items-center gap-2"><img src="${ru.avatar}" class="w-6 h-6 rounded-full" alt="">
          <span class="text-xs font-bold">${esc(ru.name)}</span>${badgesHTML(ru.badges || [], { small: true, max: 2 })}
          <span class="ml-auto text-[10px] text-[color:var(--muted)]">${dateID(r.date)}</span></div>
          <p class="text-[13px] mt-1.5">${esc(r.text)}</p></div>`;
      }).join("")}
    </div>`;
  }

  /* ---------------- Profil ---------------- */
  async function profileModal(id) {
    const u = await RyedzAPI.getUser(id); if (!u) return;
    const lv = RyedzData.levelOf(u.reputation);
    const mine = (await RyedzAPI.getPrompts({})).filter(p => p.authorId === u.id).slice(0, 4);
    const s = modal(`
      <div class="-m-6 mb-4 relative">
        <img src="${u.banner}" class="w-full h-36 object-cover rounded-t-[18px]" alt="">
        <div class="absolute inset-0 bg-gradient-to-t from-[#0a0b1a] to-transparent rounded-t-[18px]"></div>
        <button class="btn btn-sm btn-ghost absolute top-3 right-3" data-close>&times;</button>
        <img src="${u.avatar}" class="w-20 h-20 rounded-2xl absolute -bottom-8 left-6 ring-4 ring-[#0a0b1a] bg-[#131634]" alt="">
      </div>
      <div class="pt-8">
        <div class="flex flex-wrap items-center gap-2">
          <h3 class="text-xl font-extrabold">${esc(u.name)}</h3>${badgesHTML(u.badges, { small: true })}
        </div>
        <div class="text-xs text-[color:var(--muted)]">@${esc(u.username)} · Bergabung ${dateID(u.joined)}</div>
        <div class="flex flex-wrap gap-1.5 mt-2">${levelHTML(u.reputation)}<span class="badge b-level"><i class="fa-solid fa-bolt"></i>${fmt(u.reputation)} RP</span></div>
        <p class="text-sm mt-3">${esc(u.bio)}</p>
        <div class="flex flex-wrap gap-2 mt-3 text-xs">
          ${u.website ? `<a href="${u.website}" target="_blank" class="btn btn-sm btn-ghost"><i class="fa-solid fa-globe"></i> Website</a>` : ""}
          ${Object.entries(u.social || {}).map(([k, v]) => `<a href="#" class="btn btn-sm btn-ghost"><i class="fa-brands fa-${k === "x" ? "x-twitter" : k}"></i> ${esc(v)}</a>`).join("")}
        </div>

        <div class="mt-4">
          <div class="flex justify-between text-[11px] text-[color:var(--muted)] mb-1">
            <span>Level ${lv.lvl} · ${lv.name}</span><span>${lv.next ? `${fmt(u.reputation)} / ${fmt(lv.next.min)} RP` : "MAX"}</span></div>
          <div class="h-2 rounded-full bg-white/8 overflow-hidden"><div class="h-full rounded-full" style="width:${lv.pct}%;background:linear-gradient(90deg,#22d3ee,#a855f7)"></div></div>
        </div>

        <div class="grid grid-cols-3 sm:grid-cols-6 gap-2 mt-5 text-center">
          ${[["Prompt", u.prompts], ["View", fmt(u.views)], ["Like", fmt(u.likes)], ["Copy", fmt(u.copies)], ["Followers", fmt(u.followers)], ["Following", fmt(u.following)]]
            .map(([l, v]) => `<div class="glass p-2"><div class="font-extrabold text-sm">${v}</div><div class="text-[10px] text-[color:var(--muted)]">${l}</div></div>`).join("")}
        </div>

        <h4 class="font-extrabold mt-6 mb-2 text-sm">Riwayat Badge</h4>
        <div class="flex flex-wrap gap-1.5">${badgesHTML(u.badges)}</div>

        <h4 class="font-extrabold mt-5 mb-2 text-sm">Achievement</h4>
        <div class="grid sm:grid-cols-3 gap-2">
          ${[["fa-fire", "100 Prompt"], ["fa-users", "10K Followers"], ["fa-heart", "50K Like"]].map(([i, t]) => `
            <div class="glass p-3 flex items-center gap-2"><i class="fa-solid ${i} text-cyan-300"></i><span class="text-xs font-bold">${t}</span></div>`).join("")}
        </div>

        <h4 class="font-extrabold mt-5 mb-2 text-sm">Prompt Terbaru</h4>
        <div class="grid sm:grid-cols-2 gap-2">${mine.map(p => `
          <button class="glass glass-hover p-2 flex gap-2 items-center text-left sim" data-id="${p.id}">
            <img src="${p.thumb}" class="w-14 h-10 object-cover rounded-md" alt="">
            <div><div class="text-xs font-bold line-clamp-1">${esc(p.title)}</div>
            <div class="text-[10px] text-[color:var(--muted)]"><i class="fa-solid fa-eye"></i> ${fmt(p.views)}</div></div></button>`).join("") || `<p class="text-sm text-[color:var(--muted)]">Belum ada prompt.</p>`}</div>

        <div class="flex gap-2 mt-6">
          <button class="btn btn-primary flex-1" onclick="Ryedz.toast('Kamu mengikuti ${esc(u.name)}','ok')"><i class="fa-solid fa-user-plus"></i> Follow</button>
          ${Auth.user() && Auth.user().id === u.id ? `<button class="btn btn-danger" onclick="Ryedz.Auth.logout();location.reload()"><i class="fa-solid fa-right-from-bracket"></i> Keluar</button>` : ""}
          ${u.role === "admin" ? `<a class="btn" href="admin.html"><i class="fa-solid fa-gauge-high"></i> Admin</a>` : ""}
        </div>
      </div>`, { wide: true });
    $$(".sim", s).forEach(b => b.onclick = () => openDetail(b.dataset.id));
  }

  /* ---------------- Results ---------------- */
  async function renderResults() {
    const g = $("#promptGrid");
    g.innerHTML = skeletons(6);
    const list = await RyedzAPI.getPrompts(STATE);
    setTimeout(() => {
      $("#resultCount").textContent = `${list.length} prompt ditemukan`;
      const cat = RyedzData.CATEGORIES.find(c => c.slug === STATE.category);
      $("#resultTitle").textContent = STATE.q ? `Hasil untuk “${STATE.q}”` : cat ? `Kategori: ${cat.name}` : "Semua Prompt";
      g.innerHTML = list.length ? list.map(cardHTML).join("")
        : `<div class="col-span-full glass p-10 text-center"><i class="fa-solid fa-ghost text-3xl text-[color:var(--muted)] mb-3"></i>
           <p class="font-bold">Prompt tidak ditemukan</p><p class="text-sm text-[color:var(--muted)]">Coba kata kunci atau filter lain.</p></div>`;
      bindCards(g);
    }, 280);
  }

  async function renderSection(sel, sort, n) {
    const g = $(sel); g.innerHTML = skeletons(3);
    const list = (await RyedzAPI.getPrompts({ sort })).slice(0, n);
    setTimeout(() => { g.innerHTML = list.map(cardHTML).join(""); bindCards(g); }, 320);
  }

  async function renderLeaderboard() {
    const list = await RyedzAPI.getLeaderboard();
    $("#lbBody").innerHTML = list.map((u, i) => {
      const lv = RyedzData.levelOf(u.reputation);
      const medal = ["🥇", "🥈", "🥉"][i] || `#${i + 1}`;
      return `<tr class="cursor-pointer lb-row" data-id="${u.id}">
        <td class="font-extrabold">${medal}</td>
        <td><div class="flex items-center gap-2"><img src="${u.avatar}" class="w-8 h-8 rounded-full" alt="">
          <div><div class="font-bold flex items-center gap-1.5">${esc(u.name)} ${badgesHTML(u.badges, { small: true, max: 3 })}</div>
          <div class="text-[11px] text-[color:var(--muted)]">@${esc(u.username)}</div></div></div></td>
        <td><span class="badge b-level">Lv.${lv.lvl} ${lv.name}</span></td>
        <td class="font-bold neon-text">${fmt(u.reputation)}</td>
        <td>${u.prompts}</td><td>${fmt(u.views)}</td><td>${fmt(u.likes)}</td><td>${fmt(u.copies)}</td></tr>`;
    }).join("");
    $$(".lb-row").forEach(r => r.onclick = () => profileModal(r.dataset.id));
  }

  function renderBadgeAndLevel() {
    $("#badgeList").innerHTML = Object.entries(RyedzData.BADGES).map(([k, b]) => `
      <div class="glass p-3 flex items-start gap-3">
        <span class="badge ${b.cls} !text-[13px] !px-2.5 !py-1.5"><i class="fa-solid ${b.icon}"></i></span>
        <div><div class="text-sm font-bold">${b.label}</div>
        <div class="text-[11px] text-[color:var(--muted)]">${badgeDesc(k)}</div></div></div>`).join("");
    $("#levelList").innerHTML = RyedzData.LEVELS.map(l => `
      <div class="flex items-center gap-3 text-sm">
        <span class="w-10 h-10 rounded-xl grid place-items-center font-extrabold text-xs" style="background:linear-gradient(135deg,#22d3ee22,#a855f722);border:1px solid rgba(255,255,255,.12)">L${l.lvl}</span>
        <div class="flex-1"><div class="font-bold">${l.name}</div>
        <div class="text-[11px] text-[color:var(--muted)]">Mulai ${fmt(l.min)} RP</div></div></div>`).join("");
  }
  function badgeDesc(k) {
    return {
      verified: "Diberikan admin kepada pengguna terverifikasi.",
      premium: "Fitur eksklusif: upload lebih banyak, tema premium, tanpa iklan.",
      engineer: "Ahli membuat prompt berkualitas tinggi.",
      top: "View, like, dan copy terbanyak.",
      rising: "Naik daun dalam 30 hari terakhir.",
      trending: "Pembuat prompt yang sedang viral.",
      moderator: "Tim moderasi komunitas.",
      admin: "Administrator Ryedz.id.",
      founder: "Pemilik Ryedz.id.",
      early: "Bergabung sejak awal website dibuat.",
      contributor: "Aktif membantu komunitas."
    }[k] || "";
  }

  /* ---------------- Upload ---------------- */
  function initUpload() {
    const cats = RyedzData.CATEGORIES.map(c => `<option value="${c.slug}">${c.name}</option>`).join("");
    $("#upCat").innerHTML = cats;
    $("#filterCat").innerHTML = `<option value="">Semua Kategori</option>` + cats;
    const ais = RyedzData.AI_MODELS.map(a => `<option>${a}</option>`).join("");
    $("#upAi").innerHTML = ais;
    $("#filterAi").innerHTML = `<option value="">Semua AI Model</option>` + ais;

    $("#uploadForm").addEventListener("submit", async e => {
      e.preventDefault();
      if (!Auth.isLogin()) return needLogin("mengunggah prompt");
      const f = e.target;
      const u = Auth.user();
      await RyedzAPI.createPrompt({
        title: f.title.value, desc: f.desc.value, body: f.body.value,
        category: f.category.value, ai: f.ai.value, authorId: u.id,
        tags: f.tags.value.split(",").map(t => t.trim()).filter(Boolean),
        thumb: RyedzData.THUMB(f.title.value)
      });
      f.reset();
      $("#uploadStatusBox").innerHTML = `<span class="pill p-wait animate-in"><i class="fa-solid fa-hourglass-half"></i> Menunggu Review Admin</span>`;
      toast("Prompt terkirim! Status: Menunggu Review Admin.", "ok");
    });
    $("#uploadForm").addEventListener("focusin", () => {
      if (!Auth.isLogin() && !$("#uploadForm").dataset.warned) {
        $("#uploadForm").dataset.warned = "1"; needLogin("mengunggah prompt");
      }
    });
  }

  /* ---------------- Init ---------------- */
  document.addEventListener("DOMContentLoaded", async () => {
    USERS = await RyedzAPI.getUsers();
    renderAuth();
    renderCategories();
    initUpload();
    renderBadgeAndLevel();
    renderLeaderboard();
    renderResults();
    renderSection("#trendGrid", "trending", 3);
    renderSection("#newGrid", "terbaru", 3);

    const hero = await RyedzAPI.getPrompt(101);
    $("#heroCode").innerHTML = highlight(hero.body.split("\n").slice(0, 12).join("\n") + "\n…");
    $("#heroCopy").onclick = async () => { await copyText(hero.body); toast("Prompt of the day disalin!", "ok"); };

    let t; $("#searchInput").addEventListener("input", e => { clearTimeout(t); t = setTimeout(() => { STATE.q = e.target.value.trim(); renderResults(); }, 300); });
    $("#filterAi").onchange = e => { STATE.ai = e.target.value; renderResults(); };
    $("#filterCat").onchange = e => { STATE.category = e.target.value; renderResults(); };
    $$("#sortChips .chip").forEach(c => c.onclick = () => {
      $$("#sortChips .chip").forEach(x => x.classList.remove("active"));
      c.classList.add("active"); STATE.sort = c.dataset.sort; renderResults();
    });
    $("#clearCat").onclick = () => { STATE = { q: "", sort: "terbaru", category: "", ai: "" }; $("#searchInput").value = ""; $("#filterAi").value = ""; $("#filterCat").value = ""; $$(".cat-btn").forEach(x => x.classList.remove("neon-ring")); renderResults(); };
    $("#demoBan").onclick = bannedModal;

    $("#burger").onclick = () => $("#mobileMenu").classList.toggle("hide");
    $$("#mobileMenu a").forEach(a => a.onclick = () => $("#mobileMenu").classList.add("hide"));
    addEventListener("scroll", () => {
      const n = $("#nav");
      n.style.transform = scrollY > 90 ? "translateY(-6px)" : "";
      n.querySelector(".glass").style.background = scrollY > 90 ? "rgba(8,10,25,.75)" : "";
    });

    observeReveal();
    $$("[data-count]").forEach(el => {
      const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { countUp(el, +el.dataset.count); io.disconnect(); } }));
      io.observe(el);
    });

    const pid = new URLSearchParams(location.search).get("prompt");
    if (pid) setTimeout(() => openDetail(pid), 600);
  });
})();
