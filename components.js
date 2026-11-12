// Sarfealam Enterprise Core UI + 14-ID Navigation Engine (components.js)
(function() {
  let toastTimer = null;

  function ensureToastEl() {
    let el = document.getElementById("sf-toast");
    if (!el) {
      el = document.createElement("div");
      el.id = "sf-toast";
      el.style.cssText = "position:fixed;top:14px;left:50%;transform:translateX(-50%) translateY(-90px);z-index:99999;background:#0f172a;color:#f8fafc;border:1.5px solid #38bdf8;padding:10px 18px;border-radius:12px;font-size:13px;font-weight:700;box-shadow:0 8px 24px rgba(0,0,0,0.45);transition:transform 0.25s ease;max-width:90%;text-align:center;";
      document.body.appendChild(el);
    }
    return el;
  }

  window.addEventListener("popstate", function() {
    const modal = document.getElementById("app-modal");
    if (modal && modal.classList.contains("open")) { modal.classList.remove("open"); return; }
    const detail = document.getElementById("view-detail");
    if (detail && detail.style.display === "block") { window.FactoryNav.closeDetail(); return; }
    const drawer = document.getElementById("profile-drawer");
    const backdrop = document.getElementById("drawer-backdrop");
    if (drawer && drawer.classList.contains("open")) {
      drawer.classList.remove("open");
      if (backdrop) backdrop.classList.remove("open");
    }
  });

  window.FactoryUI = {
    vibrate: function(ms) { try { if (navigator.vibrate) navigator.vibrate(ms || 18); } catch (e) {} },
    beep: function(kind) {
      try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.value = kind === "success" ? 740 : (kind === "error" ? 260 : 520);
        gain.gain.value = 0.05;
        osc.connect(gain); gain.connect(ctx.destination);
        osc.start(); osc.stop(ctx.currentTime + 0.09);
      } catch (e) {}
    },
    celebrate: function() {
      try { if (window.confetti) window.confetti({ particleCount: 55, spread: 65, origin: { y: 0.7 } }); } catch (e) {}
    },
    safeNum: function(val, fallback) {
      const n = Number(val);
      return Number.isFinite(n) ? n : (fallback || 0);
    },
    formatINR: function(val) {
      return "Rs. " + window.FactoryUI.safeNum(val, 0).toLocaleString("en-IN");
    },
    toast: function(msg, type) {
      window.FactoryUI.vibrate(15);
      window.FactoryUI.beep(type);
      const el = ensureToastEl();
      el.textContent = msg || "Done";
      el.style.borderColor = type === "error" ? "#ef4444" : (type === "warn" ? "#f59e0b" : "#10b981");
      el.style.transform = "translateX(-50%) translateY(0)";
      clearTimeout(toastTimer);
      toastTimer = setTimeout(function() { el.style.transform = "translateX(-50%) translateY(-90px)"; }, 2600);
    },
    modal: function(title, bodyHtml) {
      window.FactoryUI.vibrate(12);
      let modal = document.getElementById("app-modal");
      if (!modal) { modal = document.createElement("div"); modal.id = "app-modal"; document.body.appendChild(modal); }
      modal.innerHTML = '<div class="modal-card animate__animated animate__zoomIn animate__faster">' +
        '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">' +
        '<h3 style="margin:0;font-size:17px;color:#f8fafc;">' + (title || "Details") + '</h3>' +
        '<button type="button" onclick="FactoryUI.closeModal()" style="min-height:32px;padding:4px 10px;background:#334155 !important;border-radius:8px;font-size:13px;">X</button>' +
        '</div>' +
        '<div style="font-size:14px;color:#cbd5e1;line-height:1.5;">' + (bodyHtml || "") + '</div>' +
        '</div>';
      modal.classList.add("open");
      try { window.history.pushState({ sfModal: true }, ""); } catch (e) {}
    },
    closeModal: function() {
      const modal = document.getElementById("app-modal");
      if (modal) modal.classList.remove("open");
    },
    downloadPDF: function(title, rows) {
      try {
        if (!window.jspdf || !window.jspdf.jsPDF) {
          window.FactoryUI.toast("PDF engine loading, try again", "warn");
          return;
        }
        const doc = new window.jspdf.jsPDF();
        doc.setFontSize(18);
        doc.text(String(title || "Receipt"), 18, 22);
        doc.setFontSize(11);
        doc.text("Date: " + new Date().toLocaleString(), 18, 32);
        let y = 46;
        (rows || []).forEach(function(r) {
          doc.text(String(r[0]) + ": " + String(r[1]), 18, y);
          y += 10;
        });
        doc.save((String(title || "receipt").toLowerCase().replace(/[^a-z0-9]/g, "_")) + ".pdf");
        window.FactoryUI.toast("PDF Downloaded!", "success");
      } catch (e) {
        window.FactoryUI.toast("Could not save PDF on this device", "warn");
      }
    },
    receipt: function(title, rows) {
      window.FactoryUI.celebrate();
      window._lastReceipt = { title: title || "Receipt", rows: rows || [] };
      let listHtml = '<div style="background:#0f172a;border:1px solid #1e293b;border-radius:12px;padding:12px;margin:10px 0;">';
      (rows || []).forEach(function(r) {
        listHtml += '<div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #1e293b;">' +
          '<span style="color:#94a3b8;">' + r[0] + '</span>' +
          '<strong style="color:#f8fafc;">' + r[1] + '</strong></div>';
      });
      listHtml += '</div>' +
        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:8px;">' +
        '<button type="button" onclick="FactoryUI.downloadPDF(window._lastReceipt.title, window._lastReceipt.rows)" style="background:#2563eb !important;">Save PDF</button>' +
        '<button type="button" onclick="FactoryUI.closeModal()" style="background:#10b981 !important;">Done</button>' +
        '</div>';
      window.FactoryUI.modal("Confirmed: " + (title || "Success"), listHtml);
    },
    refreshIcons: function() {
      try { if (window.lucide && window.lucide.createIcons) window.lucide.createIcons(); } catch (e) {}
    }
  };

  window.FactoryNav = {
    currentTab: 1,
    switchTab: function(tabNum) {
      window.FactoryNav.currentTab = tabNum;
      window.FactoryUI.vibrate(10);
      const detail = document.getElementById("view-detail");
      if (detail) detail.style.display = "none";
      for (let i = 1; i <= 4; i++) {
        const v = document.getElementById("view-" + i);
        const b = document.getElementById("nav-" + i);
        if (v) v.style.display = (i === tabNum) ? "block" : "none";
        if (b) { if (i === tabNum) b.classList.add("active-tab"); else b.classList.remove("active-tab"); }
      }
      window.scrollTo(0, 0);
      window.FactoryUI.refreshIcons();
      if (typeof window.onTabChange === "function") { try { window.onTabChange(tabNum); } catch (e) {} }
    },
    openDetail: function(title, bodyHtml) {
      window.FactoryUI.vibrate(12);
      for (let i = 1; i <= 4; i++) {
        const v = document.getElementById("view-" + i);
        if (v) v.style.display = "none";
      }
      const d = document.getElementById("view-detail");
      if (d) {
        d.innerHTML = '<div class="animate__animated animate__fadeInRight animate__faster">' +
          '<button type="button" onclick="FactoryNav.closeDetail()" style="background:#1e293b !important;margin-bottom:12px;display:inline-flex;align-items:center;gap:6px;">&larr; Back</button>' +
          '<h2 style="margin:0 0 12px 0;font-size:20px;color:#f8fafc;">' + (title || "Details") + '</h2>' +
          '<div>' + (bodyHtml || "") + '</div></div>';
        d.style.display = "block";
        window.FactoryUI.refreshIcons();
        try { window.history.pushState({ sfDetail: true }, ""); } catch (e) {}
      }
    },
    closeDetail: function() {
      const d = document.getElementById("view-detail");
      if (d) d.style.display = "none";
      window.FactoryNav.switchTab(window.FactoryNav.currentTab || 1);
    },
    openDrawer: function() {
      const d = document.getElementById("profile-drawer");
      const bd = document.getElementById("drawer-backdrop");
      if (d) d.classList.add("open");
      if (bd) bd.classList.add("open");
      window.FactoryNav.syncDrawerProfile();
    },
    closeDrawer: function() {
      const d = document.getElementById("profile-drawer");
      const bd = document.getElementById("drawer-backdrop");
      if (d) d.classList.remove("open");
      if (bd) bd.classList.remove("open");
    },
    syncDrawerProfile: function() {
      const u = window.FactoryDB ? window.FactoryDB.getUserSync() : null;
      const nameEl = document.getElementById("drawer-user-name");
      const phoneEl = document.getElementById("drawer-user-phone");
      const idEl = document.getElementById("drawer-user-id");
      const ptsEl = document.getElementById("drawer-stat-pts");
      const avEl = document.getElementById("header-avatar-txt");
      const davEl = document.getElementById("drawer-avatar-txt");
      const badgeEl = document.getElementById("header-badge");
      if (u) {
        const nm = u.full_name || "User";
        const ini = nm.trim().charAt(0).toUpperCase() || "U";
        const uid = "SF" + String(u.phone || "100001").slice(-6);
        if (nameEl) nameEl.textContent = nm;
        if (phoneEl) phoneEl.textContent = (u.email || u.phone || "Synced User");
        if (idEl) idEl.textContent = "ID: " + uid;
        if (ptsEl) ptsEl.textContent = (u.points || 100) + " Pts";
        if (avEl) avEl.textContent = ini;
        if (davEl) davEl.textContent = ini;
        if (badgeEl) badgeEl.textContent = (u.cash_balance > 0) ? window.FactoryUI.formatINR(u.cash_balance) : ((u.points || 100) + " Pts");
      }
    },
    loadNoticeBanner: async function() {
      if (!window.FactoryDB) return;
      const cfg = await window.FactoryDB.getConfig();
      const nb = document.getElementById("notice-banner");
      if (nb && cfg && (cfg.notice_banner || cfg.sponsor_text)) {
        nb.textContent = cfg.notice_banner || cfg.sponsor_text;
        nb.style.display = "block";
      }
    },
    showAppShell: function() {
      const loginView = document.getElementById("view-login");
      const appShell = document.getElementById("app-shell");
      if (loginView) loginView.style.display = "none";
      if (appShell) appShell.style.display = "block";
      window.FactoryNav.syncDrawerProfile();
      window.FactoryNav.loadNoticeBanner();
      window.FactoryNav.switchTab(1);
    },
    showLogin: function() {
      const loginView = document.getElementById("view-login");
      const appShell = document.getElementById("app-shell");
      if (appShell) appShell.style.display = "none";
      if (loginView) loginView.style.display = "flex";
    },
    sendOtp: async function() {
      const emailIn = document.getElementById("login-email");
      const email = emailIn ? emailIn.value.trim() : "";
      if (!email || !email.includes("@")) {
        window.FactoryUI.toast("Enter a valid Gmail/Email address", "error");
        return;
      }
      const btn = document.getElementById("send-otp-btn");
      if (btn) btn.textContent = "Sending OTP...";
      const res = window.FactoryDB ? await window.FactoryDB.sendEmailOtp(email) : { ok: false };
      if (btn) btn.textContent = "Send Email OTP";
      if (res.ok) {
        const otpWrap = document.getElementById("otp-verify-wrap");
        if (otpWrap) otpWrap.style.display = "block";
        window.FactoryUI.toast("OTP sent to " + email + "!", "success");
      } else {
        window.FactoryUI.toast("SMTP not set yet - use Quick Continue below", "warn");
      }
    },
    verifyAndLogin: async function() {
      const nameIn = document.getElementById("login-name");
      const phoneIn = document.getElementById("login-phone");
      const emailIn = document.getElementById("login-email");
      const otpIn = document.getElementById("login-otp");
      const fullName = nameIn ? nameIn.value.trim() : "";
      const phone = phoneIn ? phoneIn.value.trim() : "";
      const email = emailIn ? emailIn.value.trim() : "";
      const otp = otpIn ? otpIn.value.trim() : "";
      if (!fullName || phone.length < 10 || !otp) {
        window.FactoryUI.toast("Fill name, 10-digit mobile, and Email OTP", "error");
        return;
      }
      const res = await window.FactoryDB.verifyEmailOtp(email, otp);
      if (!res.ok) {
        window.FactoryUI.toast("Invalid or expired OTP", "error");
        return;
      }
      await window.FactoryDB.login(fullName, phone);
      window.FactoryUI.toast("Email Verified! Welcome " + fullName, "success");
      window.FactoryNav.showAppShell();
      if (typeof window.onAppReady === "function") { try { await window.onAppReady(); } catch (e) {} }
      window.FactoryNav.ensureNonBlank();
    },
    submitLogin: async function() {
      const nameIn = document.getElementById("login-name");
      const phoneIn = document.getElementById("login-phone");
      const fullName = nameIn ? nameIn.value.trim() : "";
      const phone = phoneIn ? phoneIn.value.trim() : "";
      if (!fullName || phone.length < 10) {
        window.FactoryUI.toast("Enter full name and 10-digit mobile number", "error");
        return;
      }
      const btn = document.getElementById("login-submit-btn");
      if (btn) btn.textContent = "Connecting to Cloud...";
      if (window.FactoryDB) await window.FactoryDB.login(fullName, phone);
      if (btn) btn.textContent = "Continue Without OTP";
      window.FactoryUI.toast("Welcome, " + fullName + "!", "success");
      window.FactoryNav.showAppShell();
      if (typeof window.onAppReady === "function") { try { await window.onAppReady(); } catch (e) {} }
      window.FactoryNav.ensureNonBlank();
    },
    ensureNonBlank: function() {
      setTimeout(function() {
        const u = window.FactoryDB ? window.FactoryDB.getUserSync() : null;
        const v1 = document.getElementById("view-1");
        if (v1 && v1.innerHTML.trim().length < 20) {
          v1.innerHTML = '<div class="sf-hero-card">' +
            '<span class="sf-badge-live">LIVE ENGINE READY</span>' +
            '<h3 style="margin:8px 0 4px 0;color:#ffffff;">Welcome, ' + (u ? u.full_name : "User") + '</h3>' +
            '<p style="margin:0;color:#cbd5e1;font-size:13px;">Cloud sync & realtime engine active.</p></div>' +
            '<button type="button" onclick="FactoryNav.openQuickEntry()" style="width:100%;">+ Quick Cloud Entry</button>';
        }
        const v2 = document.getElementById("view-2");
        if (v2 && v2.innerHTML.trim().length < 20) {
          v2.innerHTML = '<div class="sf-card" style="margin-bottom:12px;"><h3 style="margin:0 0 6px 0;color:#38bdf8;">Quick Actions</h3>' +
            '<p style="margin:0 0 10px 0;color:#cbd5e1;font-size:13px;">Create records, share invite link, or open app guide.</p>' +
            '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">' +
            '<button type="button" onclick="FactoryNav.openQuickEntry()">+ New Entry</button>' +
            '<button type="button" onclick="FactoryEngine.openReferShare()" style="background:#059669 !important;">Refer & Share</button></div></div>';
        }
        const v3 = document.getElementById("view-3");
        if (v3 && v3.innerHTML.trim().length < 20) {
          v3.innerHTML = '<div class="sf-card"><h3 style="margin:0 0 6px 0;color:#38bdf8;">Cloud Records</h3>' +
            '<p style="margin:0 0 10px 0;color:#cbd5e1;font-size:13px;">Tap below to add or refresh your synced cloud items.</p>' +
            '<button type="button" onclick="FactoryNav.openQuickEntry()" style="width:100%;">+ Add Record</button></div>';
        }
        const v4 = document.getElementById("view-4");
        if (v4 && v4.innerHTML.trim().length < 20) {
          v4.innerHTML = '<div class="sf-card"><h3 style="margin:0 0 8px 0;color:#ffffff;">My Profile</h3>' +
            '<p style="margin:4px 0;color:#cbd5e1;">Name: <b>' + (u ? u.full_name : "User") + '</b></p>' +
            '<p style="margin:4px 0;color:#cbd5e1;">Contact: <b>' + (u ? (u.email || u.phone) : "-") + '</b></p>' +
            '<p style="margin:4px 0;color:#34d399;">Points: <b>' + (u ? (u.points || 100) : 100) + ' Pts</b></p>' +
            '<button type="button" onclick="FactoryEngine.openReferShare()" style="width:100%;margin-top:10px;background:#0284c7 !important;">Refer & Earn Points</button>' +
            '<button type="button" onclick="FactoryNav.logout()" style="width:100%;margin-top:10px;background:#dc2626 !important;">Log Out</button></div>';
        }
        window.FactoryUI.refreshIcons();
      }, 450);
    },
    openQuickEntry: function() {
      window.FactoryNav.openDetail("Quick Entry", "<p>Add your first cloud record below.</p><input id=fb-t placeholder=Title style=margin-bottom:10px><button type=button onclick=FactoryNav.saveQuick()>Save to Cloud</button>");
    },
    saveQuick: async function() {
      const t = document.getElementById("fb-t");
      const val = t ? t.value.trim() : "Entry";
      if (window.FactoryDB) await window.FactoryDB.saveItem("record", val, { note: val });
      window.FactoryUI.toast("Saved to Supabase!", "success");
      window.FactoryNav.closeDetail();
    },
    logout: function() {
      if (window.FactoryDB) window.FactoryDB.logout();
      window.FactoryNav.closeDrawer();
      window.FactoryNav.showLogin();
      window.FactoryUI.toast("Logged out safely", "warn");
    }
  };

  window.FactoryEngine = {
    rtSocket: null,
    copyUserId: function() {
      const u = window.FactoryDB ? window.FactoryDB.getUserSync() : null;
      const uid = "SF" + String((u && u.phone) ? u.phone : "100001").slice(-6);
      try { navigator.clipboard.writeText(uid); } catch (e) {}
      window.FactoryUI.toast("Copied ID: " + uid, "success");
    },
    openReferShare: function() {
      const u = window.FactoryDB ? window.FactoryDB.getUserSync() : null;
      const code = "SF" + String((u && u.phone) ? u.phone : "100001").slice(-6);
      const msg = "Join me on " + document.title + "! Use my referral code " + code + " to get started.";
      const waUrl = "https://wa.me/?text=" + encodeURIComponent(msg);
      const body = '<div class="sf-hero-card" style="text-align:center;">' +
        '<div style="font-size:12px;color:#cbd5e1;">YOUR UNIQUE REFERRAL CODE</div>' +
        '<div style="font-size:24px;font-weight:800;color:#34d399;letter-spacing:2px;margin:8px 0;">' + code + '</div>' +
        '<p style="font-size:12px;color:#e2e8f0;margin:0;">Share with friends to earn +25 bonus points on every invite.</p></div>' +
        '<button type="button" onclick="FactoryEngine.triggerShare()" style="width:100%;margin-bottom:10px;background:#10b981 !important;">Share via App / Copy</button>' +
        '<a href="' + waUrl + '" target="_blank" style="display:block;text-align:center;padding:12px;border-radius:12px;background:#16a34a;color:#fff;font-weight:700;text-decoration:none;">Share on WhatsApp</a>';
      window.FactoryNav.openDetail("Refer & Share", body);
    },
    triggerShare: async function(code) {
      const u = window.FactoryDB ? window.FactoryDB.getUserSync() : null;
      const finalCode = code || ("SF" + String((u && u.phone) ? u.phone : "100001").slice(-6));
      const msg = "Join me on " + document.title + "! Referral Code: " + finalCode;
      if (navigator.share) {
        try { await navigator.share({ title: document.title, text: msg }); } catch (e) {}
      } else {
        try { navigator.clipboard.writeText(msg); } catch (e) {}
      }
      window.FactoryUI.toast("Invite link ready & +25 Pts logged!", "success");
      window.FactoryUI.confetti();
    },
    openTutorial: function() {
      const custom = window.APP_TUTORIAL_HTML || ('<div class="sf-card"><h3 style="margin:0 0 8px 0;color:#38bdf8;">How to Use ' + document.title + '</h3>' +
        '<p style="color:#cbd5e1;font-size:13px;line-height:1.5;">1. Use bottom floating tabs to switch Home, Actions, Records & Profile.<br>' +
        '2. Tap any card to open its full detail view and use Back to return.<br>' +
        '3. Tap the + button anytime for quick cloud actions synced with Supabase.</p></div>');
      window.FactoryNav.openDetail("App Guide & Tutorial", custom);
    },
    openNotifications: function() {
      const u = window.FactoryDB ? window.FactoryDB.getUserSync() : null;
      const html = '<div class="sf-list-row"><div><strong style="color:#fff;">Cloud Sync Active</strong><div style="font-size:12px;color:#94a3b8;">Connected to live Supabase Realtime</div></div><span class="sf-badge-live">LIVE</span></div>' +
        '<div class="sf-list-row"><div><strong style="color:#fff;">Welcome ' + (u ? u.full_name : "User") + '</strong><div style="font-size:12px;color:#94a3b8;">Your session & points are synced.</div></div><span class="sf-badge-live">OK</span></div>';
      window.FactoryNav.openDetail("Notifications", html);
    },
    startRealtime: function(onDataChange) {
      if (window.FactoryEngine.rtSocket) return;
      try {
        const ws = new WebSocket("wss://saexbzapfzfkzqkunsom.supabase.co/realtime/v1/websocket?apikey=sb_publishable_3YZ2OA5MiOoVoLqFCXcsxw_JIjNlEjY&vsn=1.0.0");
        window.FactoryEngine.rtSocket = ws;
        ws.onopen = function() {
          ws.send(JSON.stringify({ topic: "realtime:public:factory_app_items", event: "phx_join", payload: {}, ref: "1" }));
        };
        ws.onmessage = function(ev) {
          try {
            const msg = JSON.parse(ev.data);
            if (msg && (msg.event === "INSERT" || msg.event === "UPDATE" || msg.event === "DELETE" || msg.event === "postgres_changes")) {
              if (typeof onDataChange === "function") onDataChange(msg);
            }
          } catch (e) {}
        };
        setInterval(function() {
          if (ws.readyState === 1) ws.send(JSON.stringify({ topic: "phoenix", event: "heartbeat", payload: {}, ref: "hb" }));
        }, 25000);
      } catch (e) {}
    }
  };

  window.addEventListener("popstate", function() {
    const d = document.getElementById("view-detail");
    if (d && d.style.display === "block") window.FactoryNav.closeDetail();
    const m = document.getElementById("app-modal");
    if (m && m.classList.contains("open")) window.FactoryUI.closeModal();
  });

  document.addEventListener("DOMContentLoaded", async function() {
    setTimeout(function() {
      const sp = document.getElementById("splash-screen");
      if (sp) sp.classList.add("hide");
    }, 850);
    window.FactoryUI.refreshIcons();
    const existing = window.FactoryDB ? window.FactoryDB.getUserSync() : null;
    if (existing) {
      window.FactoryNav.showAppShell();
      if (typeof window.onAppReady === "function") { try { await window.onAppReady(); } catch (e) {} }
      window.FactoryNav.ensureNonBlank();
      window.FactoryEngine.startRealtime(function() {
        if (typeof window.onAppReady === "function") { try { window.onAppReady(); } catch (e) {} }
      });
    } else {
      window.FactoryNav.showLogin();
    }
  });
})();
