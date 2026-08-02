/* =========================================================
   Ryedz.id — Core utilities (auth mock, UI helpers)
   ========================================================= */
(function (global) {
  "use strict";

  const LS_KEY = "ryedz_session";
  const LS_LIKE = "ryedz_likes";
  const LS_FAV = "ryedz_favs";

  /* ---------------- Auth (mock — ganti dengan Supabase/JWT) ------------- */
  const Auth = {
    user() { try { return JSON.parse(localStorage.getItem(LS_KEY)); } catch { return null; } },
    isLogin() { return !!this.user(); },
    isAdmin() { const u = this.user(); return !!u && u.role === "admin"; },
    login(profile) { localStorage.setItem(LS_KEY, JSON.stringify(profile)); },
    logout() { localStorage.removeItem(LS_KEY); },
    async signIn(identifier, _password) {
      const users = await RyedzAPI.getUsers();
      const u = users.find(x => x.username === identifier || x.name.toLowerCase() === identifier.toLowerCase()) || users[2];
      if (u.status === "banned") return { ok: false, banned: true };
      if (u.status === "suspended") return { ok: false, suspended: true };
      this.login(u); return { ok: true, user: u };
    }
  };

  /* ---------------- Toast ---------------- */
  function toast(msg, type = "info") {
    let box = document.getElementById("toaster");
    if (!box) { box = document.createElement("div"); box.id = "toaster"; document.body.appendChild(box); }
    const colors = {
      info: "rgba(59,130,246,.18);color:#bfdbfe;border:1px solid rgba(59,130,246,.4)",
      ok: "rgba(34,197,94,.18);color:#bbf7d0;border:1px solid rgba(34,197,94,.4)",
      warn: "rgba(245,158,11,.18);color:#fde68a;border:1px solid rgba(245,158,11,.4)",
      bad: "rgba(239,68,68,.18);color:#fecaca;border:1px solid rgba(239,68,68,.4)"
    };
    const icons = { info: "fa-circle-info", ok: "fa-circle-check", warn: "fa-triangle-exclamation", bad: "fa-circle-xmark" };
    const el = document.createElement("div");
    el.className = "toast glass";
    el.style.cssText = "background:" + colors[type];
    el.innerHTML = `<i class="fa-solid ${icons[type]} mr-2"></i>${msg}`;
    box.appendChild(el);
    setTimeout(() => { el.style.opacity = "0"; el.style.transform = "translateY(10px)"; el.style.transition = ".35s"; }, 2600);
    setTimeout(() => el.remove(), 3100);
  }

  /* ---------------- Modal ---------------- */
  function modal(html, opts = {}) {
    let m = document.getElementById("ryedz-modal");
    if (!m) {
      m = document.createElement("div");
      m.id = "ryedz-modal"; m.className = "modal";
      m.innerHTML = `<div class="backdrop" data-close></div><div class="sheet glass"></div>`;
      document.body.appendChild(m);
      m.addEventListener("click", e => { if (e.target.dataset.close !== undefined) closeModal(); });
      document.addEventListener("keydown", e => { if (e.key === "Escape") closeModal(); });
    }
    const sheet = m.querySelector(".sheet");
    sheet.className = "sheet glass" + (opts.wide ? " wide" : "");
    sheet.innerHTML = html;
    m.classList.add("open");
    document.body.style.overflow = "hidden";
    return sheet;
  }
  function closeModal() {
    const m = document.getElementById("ryedz-modal");
    if (m) m.classList.remove("open");
    document.body.style.overflow = "";
  }

  /* ---------------- Formatters ---------------- */
  const fmt = n => n >= 1e6 ? (n / 1e6).toFixed(1).replace(".0", "") + "M"
    : n >= 1e3 ? (n / 1e3).toFixed(1).replace(".0", "") + "K" : String(n ?? 0);
  const dateID = s => new Date(s).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
  const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  /* ---------------- Badges ---------------- */
  function badgeHTML(key, small) {
    const b = RyedzData.BADGES[key]; if (!b) return "";
    return `<span class="badge ${b.cls}" title="${b.label}"><i class="fa-solid ${b.icon}"></i>${small ? "" : `<span>${b.label}</span>`}</span>`;
  }
  function badgesHTML(keys = [], opts = {}) {
    const list = opts.max ? keys.slice(0, opts.max) : keys;
    return list.map(k => badgeHTML(k, opts.small)).join("");
  }
  function levelHTML(rep) {
    const l = RyedzData.levelOf(rep);
    return `<span class="badge b-level" title="Reputasi ${fmt(rep)}"><i class="fa-solid fa-chart-line"></i>Lv.${l.lvl} ${l.name}</span>`;
  }
  function starsHTML(rating) {
    const full = Math.floor(rating), half = rating - full >= .5;
    let s = "";
    for (let i = 0; i < 5; i++) s += `<i class="fa-${i < full ? "solid fa-star" : (i === full && half ? "solid fa-star-half-stroke" : "regular fa-star")}"></i>`;
    return `<span class="stars">${s}</span>`;
  }

  /* ---------------- Syntax highlight (ringan) ---------------- */
  function highlight(code) {
    let h = esc(code);
    h = h.replace(/(^|\n)(#[^\n]*)/g, '$1<span class="tok-cmt">$2</span>');
    h = h.replace(/\{([a-z0-9_]+)\}/gi, '<span class="tok-var">{$1}</span>');
    h = h.replace(/&quot;([^&]*?)&quot;/g, '<span class="tok-str">&quot;$1&quot;</span>');
    h = h.replace(/\b(TUGAS|ATURAN|OUTPUT|INPUT|POSITIVE|NEGATIVE|Format|FORMAT|Keluarkan|Ketentuan|LAKUKAN REVIEW DALAM 5 BAGIAN|ATURAN KERJA|Aturan|Struktur wajib|Steps|CFG|Sampler|Stack|Brand|Soal|Ide|Dokumen)\b/g, '<span class="tok-key">$1</span>');
    h = h.replace(/(^|\s)(\d+(?:\.\d+)?)(?=[\s.:)])/g, '$1<span class="tok-num">$2</span>');
    return h;
  }

  /* ---------------- Local like / favorite ---------------- */
  const store = {
    get(k) { try { return JSON.parse(localStorage.getItem(k)) || []; } catch { return []; } },
    toggle(k, id) {
      const arr = this.get(k); const i = arr.indexOf(id);
      if (i > -1) arr.splice(i, 1); else arr.push(id);
      localStorage.setItem(k, JSON.stringify(arr)); return i === -1;
    },
    has(k, id) { return this.get(k).includes(id); }
  };
  const Likes = { toggle: id => store.toggle(LS_LIKE, id), has: id => store.has(LS_LIKE, id) };
  const Favs = { toggle: id => store.toggle(LS_FAV, id), has: id => store.has(LS_FAV, id) };

  /* ---------------- Copy ---------------- */
  async function copyText(text) {
    try { await navigator.clipboard.writeText(text); return true; }
    catch {
      const t = document.createElement("textarea"); t.value = text; document.body.appendChild(t);
      t.select(); document.execCommand("copy"); t.remove(); return true;
    }
  }

  /* ---------------- Scroll reveal ---------------- */
  function observeReveal(root = document) {
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { threshold: .12 });
    root.querySelectorAll(".reveal:not(.in)").forEach(el => io.observe(el));
  }

  /* ---------------- Count up ---------------- */
  function countUp(el, target, dur = 1200) {
    const start = performance.now();
    (function step(now) {
      const p = Math.min((now - start) / dur, 1);
      const e = 1 - Math.pow(1 - p, 3);
      el.textContent = fmt(Math.round(target * e));
      if (p < 1) requestAnimationFrame(step);
    })(start);
  }

  global.Ryedz = { Auth, toast, modal, closeModal, fmt, dateID, esc, badgeHTML, badgesHTML, levelHTML, starsHTML, highlight, Likes, Favs, copyText, observeReveal, countUp };
})(window);
