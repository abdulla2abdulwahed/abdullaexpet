/* ═══════════════════════════════════════════════════════════════
   App shell — auth, routing, sidebar, topbar, search, notifications.
═══════════════════════════════════════════════════════════════ */
window.App = (function () {
  const t = k => I18N.t(k);
  let currentUserId = null;
  let route = 'dashboard';

  const NAV = [
    { group: 'grp_overview', items: [['dashboard', 'nav_dashboard', 'dashboard']] },
    { group: 'grp_properties', items: [
      ['properties', 'nav_properties', 'building'], ['for_sale', 'nav_for_sale', 'tag'],
      ['for_rent', 'nav_for_rent', 'key'], ['requests', 'nav_requests', 'inbox'] ] },
    { group: 'grp_sales', items: [['contracts', 'nav_contracts', 'file']] },
    { group: 'grp_finance', items: [
      ['receipts', 'nav_receipts', 'receipt'], ['payments', 'nav_payments', 'wallet'],
      ['deposits', 'nav_deposits', 'shield'], ['expenses', 'nav_expenses', 'coins'] ] },
    { group: 'grp_people', items: [
      ['tenants', 'nav_tenants', 'users'], ['rent_collection', 'nav_rent_collection', 'money'],
      ['customers', 'nav_customers', 'user'] ] },
    { group: 'grp_admin', items: [
      ['reports', 'nav_reports', 'chart'], ['users', 'nav_users', 'users'],
      ['settings', 'nav_settings', 'settings'], ['profile', 'nav_profile', 'user'] ] },
  ];
  const ROUTE_TITLES = {};
  NAV.forEach(g => g.items.forEach(i => ROUTE_TITLES[i[0]] = i[1]));

  /* ---------- Theme ---------- */
  function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('tablo_theme', theme);
    const btn = document.getElementById('theme-toggle');
    if (btn) btn.innerHTML = UI.icon(theme === 'light' ? 'moon' : 'sun');
  }
  function toggleTheme() { setTheme(document.documentElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light'); }

  /* ---------- Auth ---------- */
  function currentUser() { return DB.get('users', currentUserId) || DB.all('users')[0]; }

  function renderLogin() {
    document.documentElement.setAttribute('dir', I18N.dir());
    document.documentElement.setAttribute('lang', I18N.current());
    const el = document.getElementById('login-screen');
    const langPills = I18N.langs().map(l =>
      `<button type="button" class="lang-pill ${l.code === I18N.current() ? 'active' : ''}" data-lang="${l.code}">${UI.esc(l.name)}</button>`
    ).join('');
    el.innerHTML = `<div class="login-card">
      <div class="login-lang">${UI.icon('globe')}<div class="lang-pills">${langPills}</div></div>
      <div class="login-logo"><div class="brand">TAB<span>LO</span></div></div>
      <div class="login-sub">${t('welcome_back')}</div>
      <form id="login-form">
        ${UI.field(t('email'), 'email', 'admin@tablo.com', { type: 'email', required: true })}
        ${UI.field(t('password'), 'password', 'demo', { type: 'password', required: true })}
        <div class="field" style="display:flex;align-items:center;gap:8px"><input type="checkbox" id="rm" checked><label for="rm" style="margin:0">${t('remember_me')}</label></div>
        <button class="btn btn-primary btn-block" type="submit">${UI.icon('logout')}${t('sign_in')}</button>
      </form>
      <div class="login-demo"><b>${t('demo_accounts')}:</b><br>
        admin@tablo.com · manager@tablo.com<br>sales@tablo.com · accountant@tablo.com<br>
        <span style="opacity:.7">${t('password')}: any</span></div>
    </div>`;
    el.querySelectorAll('[data-lang]').forEach(btn => btn.addEventListener('click', () => {
      I18N.set(btn.getAttribute('data-lang'));
      renderLogin();
    }));
    document.getElementById('login-form').addEventListener('submit', e => {
      e.preventDefault();
      const email = e.target.email.value.trim().toLowerCase();
      const user = DB.all('users').find(u => u.email.toLowerCase() === email) || DB.all('users')[0];
      login(user.id);
    });
  }

  function login(userId) {
    currentUserId = userId;
    localStorage.setItem('tablo_session', userId);
    DB.upsert('users', { id: userId, lastLogin: DB.daysFromNow(0) });
    bumpAudit('logged in');
    document.getElementById('login-screen').classList.add('hidden');
    document.getElementById('app').classList.add('active');
    buildChrome();
    navigate('dashboard');
  }

  function logout() {
    bumpAudit('logged out');
    currentUserId = null;
    localStorage.removeItem('tablo_session');
    document.getElementById('app').classList.remove('active');
    const ls = document.getElementById('login-screen');
    ls.classList.remove('hidden');
    renderLogin();
  }

  function bumpAudit(action) {
    const u = currentUser(); if (!u) return;
    const list = DB.load().audit;
    list.unshift({ id: DB.uid('a'), user: u.name, action, ip: '10.0.0.12', time: DB.daysFromNow(0) });
    if (list.length > 60) list.pop();
    DB.persist();
  }

  /* ---------- Chrome (sidebar + topbar) ---------- */
  function buildChrome() {
    const app = document.getElementById('app');
    const unread = DB.all('notifications').filter(n => n.unread).length;
    app.innerHTML = `
      <aside class="sidebar" id="sidebar">
        <div class="sidebar-head"><div><div class="brand">TAB<span>LO</span></div><div class="tag">Real Estate ERP</div></div></div>
        <nav class="sidebar-nav" id="nav"></nav>
      </aside>
      <div class="sidebar-backdrop" id="backdrop"></div>
      <div class="main">
        <header class="topbar">
          <button class="icon-btn menu-toggle" id="menu-toggle">${UI.icon('menu')}</button>
          <div class="page-title" id="page-title">${t('nav_dashboard')}</div>
          <div class="spacer"></div>
          <div class="search-box" id="search-box">${UI.icon('search')}<input placeholder="${t('search')}" id="global-search" autocomplete="off"></div>
          <button class="icon-btn" id="theme-toggle" title="${t('theme')}"></button>
          <div class="dropdown"><button class="icon-btn ${unread ? 'has-dot' : ''}" id="notif-btn" title="${t('notifications')}">${UI.icon('bell')}</button></div>
          <div class="dropdown"><button class="icon-btn" id="lang-btn" title="${t('language')}">${UI.icon('globe')}</button></div>
          <div class="dropdown"><button class="icon-btn" id="user-btn" style="background:var(--gold-dim);color:var(--gold)">${UI.initials(currentUser().name)}</button></div>
        </header>
        <main class="content" id="view-root"></main>
      </div>`;
    buildNav();
    setTheme(localStorage.getItem('tablo_theme') || 'dark');
    wireTopbar();
  }

  function buildNav() {
    const nav = document.getElementById('nav');
    const overdue = DB.all('tenants').filter(tn => tn.status === 'overdue').length;
    const reqCount = DB.all('requests').filter(r => r.status === 'pending').length;
    const badges = { rent_collection: overdue, requests: reqCount };
    nav.innerHTML = NAV.map(g => `<div class="nav-group-label">${t(g.group)}</div>` +
      g.items.map(i => `<div class="nav-item ${route === i[0] ? 'active' : ''}" data-route="${i[0]}">
        ${UI.icon(i[2])}<span>${t(i[1])}</span>${badges[i[0]] ? `<span class="nav-badge">${badges[i[0]]}</span>` : ''}</div>`).join('')
    ).join('');
    nav.querySelectorAll('[data-route]').forEach(el => el.addEventListener('click', () => { navigate(el.getAttribute('data-route')); closeSidebar(); }));
  }

  function wireTopbar() {
    document.getElementById('theme-toggle').addEventListener('click', toggleTheme);
    document.getElementById('menu-toggle').addEventListener('click', () => {
      document.getElementById('sidebar').classList.toggle('open');
      document.getElementById('backdrop').classList.toggle('show');
    });
    document.getElementById('backdrop').addEventListener('click', closeSidebar);
    document.getElementById('notif-btn').addEventListener('click', e => { e.stopPropagation(); toggleNotif(e.currentTarget); });
    document.getElementById('lang-btn').addEventListener('click', e => { e.stopPropagation(); toggleLang(e.currentTarget); });
    document.getElementById('user-btn').addEventListener('click', e => { e.stopPropagation(); toggleUser(e.currentTarget); });
    document.addEventListener('click', () => document.querySelectorAll('.dd-menu, .search-results').forEach(m => m.remove()));
    wireSearch();
  }
  function closeSidebar() { const s = document.getElementById('sidebar'); if (s) s.classList.remove('open'); const b = document.getElementById('backdrop'); if (b) b.classList.remove('show'); }

  function dd(anchor, html) {
    document.querySelectorAll('.dd-menu').forEach(m => m.remove());
    const menu = document.createElement('div'); menu.className = 'dd-menu'; menu.innerHTML = html;
    menu.addEventListener('click', e => e.stopPropagation());
    anchor.parentElement.appendChild(menu);
    return menu;
  }

  function toggleNotif(anchor) {
    const notifs = DB.all('notifications');
    const items = notifs.length ? notifs.map(n => `<div class="notif-item ${n.unread ? 'unread' : ''}">
      <div class="notif-dot" style="${n.unread ? '' : 'opacity:.2'}"></div>
      <div><div class="n-title">${UI.esc(n.title)}</div><div class="cell-sub">${UI.esc(n.body)}</div><div class="n-time">${UI.fdate(n.time)}</div></div></div>`).join('')
      : `<div class="empty-state" style="padding:30px">${t('no_notifications')}</div>`;
    const menu = dd(anchor, `<div class="dd-head">${t('notifications')}<button class="btn btn-sm" id="mark-read">${t('mark_all_read')}</button></div>
      <div style="max-height:320px;overflow-y:auto">${items}</div>`);
    const mr = menu.querySelector('#mark-read');
    if (mr) mr.addEventListener('click', () => { DB.all('notifications').forEach(n => n.unread = false); DB.persist(); menu.remove(); refreshChrome(); });
  }
  function toggleLang(anchor) {
    dd(anchor, I18N.langs().map(l => `<div class="dd-item" data-lang="${l.code}">${UI.icon('globe')}${l.name}${l.code === I18N.current() ? ' ✓' : ''}</div>`).join(''))
      .querySelectorAll('[data-lang]').forEach(el => el.addEventListener('click', () => { I18N.set(el.getAttribute('data-lang')); rebuild(); }));
  }
  function toggleUser(anchor) {
    const u = currentUser();
    const menu = dd(anchor, `<div class="dd-head">${UI.esc(u.name)}<span class="chip">${t(u.role)}</span></div>
      <div class="dd-item" data-go="profile">${UI.icon('user')}${t('my_profile')}</div>
      <div class="dd-item" data-go="settings">${UI.icon('settings')}${t('nav_settings')}</div>
      <div class="dd-sep"></div>
      <div class="dd-item" id="do-logout" style="color:var(--danger)">${UI.icon('logout')}${t('logout')}</div>`);
    menu.querySelectorAll('[data-go]').forEach(el => el.addEventListener('click', () => { navigate(el.getAttribute('data-go')); menu.remove(); }));
    menu.querySelector('#do-logout').addEventListener('click', () => { menu.remove(); logout(); });
  }

  /* ---------- Global search ---------- */
  function wireSearch() {
    const input = document.getElementById('global-search');
    if (!input) return;
    input.addEventListener('input', () => {
      const q = input.value.trim().toLowerCase();
      document.querySelectorAll('.search-results').forEach(m => m.remove());
      if (q.length < 2) return;
      const results = [];
      DB.all('properties').filter(p => (p.id + p.district + p.city + p.type + p.owner + p.agent).toLowerCase().includes(q)).slice(0, 4)
        .forEach(p => results.push({ ic: 'building', title: p.id + ' · ' + t(p.type), sub: p.district + ', ' + p.city, route: p.purpose === 'sale' ? 'for_sale' : 'for_rent' }));
      DB.all('customers').filter(c => (c.name + c.phone + c.email).toLowerCase().includes(q)).slice(0, 3)
        .forEach(c => results.push({ ic: 'user', title: c.name, sub: t('customers'), route: 'customers' }));
      DB.all('contracts').filter(c => (c.id + c.partyA + c.partyB).toLowerCase().includes(q)).slice(0, 3)
        .forEach(c => results.push({ ic: 'file', title: c.id, sub: t('contracts'), route: 'contracts' }));
      const box = document.getElementById('search-box');
      const menu = document.createElement('div'); menu.className = 'search-results';
      menu.innerHTML = results.length ? results.map(r => `<div class="sr-item" data-route="${r.route}">${UI.icon(r.ic)}<div><div class="cell-main">${UI.esc(r.title)}</div><div class="cell-sub">${UI.esc(r.sub)}</div></div></div>`).join('')
        : `<div class="sr-empty">${t('no_data')}</div>`;
      menu.addEventListener('click', e => e.stopPropagation());
      box.appendChild(menu);
      menu.querySelectorAll('[data-route]').forEach(el => el.addEventListener('click', () => { navigate(el.getAttribute('data-route')); menu.remove(); input.value = ''; }));
    });
  }

  /* ---------- Routing ---------- */
  function navigate(r) {
    if (!Views[r]) r = 'dashboard';
    route = r;
    document.querySelectorAll('.nav-item').forEach(el => el.classList.toggle('active', el.getAttribute('data-route') === r));
    const title = document.getElementById('page-title'); if (title) title.textContent = t(ROUTE_TITLES[r] || 'nav_dashboard');
    const root = document.getElementById('view-root');
    root.innerHTML = '';
    window.scrollTo(0, 0);
    try { Views[r](root); } catch (e) { root.innerHTML = '<div class="empty-state">Error rendering view: ' + UI.esc(e.message) + '</div>'; console.error(e); }
  }

  function refreshChrome() { buildNav(); const t2 = document.getElementById('page-title'); if (t2) t2.textContent = t(ROUTE_TITLES[route]); }
  function rebuild() { document.documentElement.setAttribute('dir', I18N.dir()); buildChrome(); navigate(route); }

  /* ---------- Boot ---------- */
  function init() {
    I18N.set(I18N.current());
    setTheme(localStorage.getItem('tablo_theme') || 'dark');
    DB.load();
    const session = localStorage.getItem('tablo_session');
    if (session && DB.get('users', session)) { login(session); }
    else { renderLogin(); }
  }

  return { init, navigate, logout, currentUser, bumpAudit, setTheme, rebuild, refreshChrome };
})();

document.addEventListener('DOMContentLoaded', App.init);
