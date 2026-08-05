/* ═══════════════════════════════════════════════════════════════
   Admin — Users & Roles, Settings, Profile.
═══════════════════════════════════════════════════════════════ */
(function () {
  const t = k => I18N.t(k);
  const ROLES = ['super_admin', 'administrator', 'manager', 'sales_agent', 'rental_agent', 'accountant', 'receptionist', 'customer_service', 'viewer'];
  const roleOpts = () => ROLES.map(r => ({ value: r, label: t(r) }));

  const PERMS = ['Dashboard', 'Properties', 'Contracts', 'Finance', 'Tenants', 'Customers', 'Reports', 'Users', 'Settings'];
  const ROLE_MATRIX = {
    super_admin: PERMS, administrator: PERMS.filter(p => p !== 'Settings' ? true : true),
    manager: ['Dashboard', 'Properties', 'Contracts', 'Finance', 'Tenants', 'Customers', 'Reports'],
    sales_agent: ['Dashboard', 'Properties', 'Contracts', 'Customers'],
    rental_agent: ['Dashboard', 'Properties', 'Contracts', 'Tenants', 'Customers'],
    accountant: ['Dashboard', 'Finance', 'Reports'],
    receptionist: ['Dashboard', 'Customers'],
    customer_service: ['Dashboard', 'Customers'],
    viewer: ['Dashboard', 'Reports'],
  };

  /* ---- Users & Roles ---- */
  Views.users = function (root) {
    let tab = 'users';
    root.innerHTML = VC.pageHead(t('nav_users'), t('users'));
    const tabsEl = document.createElement('div'); tabsEl.className = 'tabs';
    const T = [['users', t('users')], ['roles', t('roles') + ' & ' + t('permissions')], ['audit', t('audit_log')]];
    tabsEl.innerHTML = T.map(x => `<div class="tab ${tab === x[0] ? 'active' : ''}" data-tab="${x[0]}">${x[1]}</div>`).join('');
    const bodyEl = document.createElement('div');
    root.appendChild(tabsEl); root.appendChild(bodyEl);
    tabsEl.addEventListener('click', e => { const el = e.target.closest('[data-tab]'); if (!el) return; tab = el.getAttribute('data-tab'); tabsEl.querySelectorAll('.tab').forEach(x => x.classList.toggle('active', x === el)); paint(); });

    function paint() {
      if (tab === 'users') paintUsers();
      else if (tab === 'roles') paintRoles();
      else paintAudit();
    }
    function paintUsers() {
      VC.crudList(bodyEl, {
        coll: 'users', title: '', subtitle: '', addLabel: t('add_user'),
        columns: [
          { label: t('name'), key: 'name', render: u => `<div class="with-avatar"><span class="avatar">${UI.initials(u.name)}</span><div><div class="cell-main">${UI.esc(u.name)}</div><div class="cell-sub">${UI.esc(u.email)}</div></div></div>` },
          { label: t('role'), key: 'role', render: u => `<span class="chip">${t(u.role)}</span>`, plain: u => t(u.role) },
          { label: t('phone'), key: 'phone', render: u => UI.esc(u.phone) },
          { label: t('last_login'), key: 'lastLogin', render: u => UI.fdate(u.lastLogin) },
          { label: t('status'), key: 'status', align: 'end', render: u => UI.badge(u.status === 'active' ? 'active' : 'inactive', t(u.status === 'active' ? 'active' : 'disabled')) },
        ],
        searchFields: ['name', 'email', 'phone'],
        filters: [{ key: 'role', options: roleOpts() }, { key: 'status', options: [{ value: 'active', label: t('active') }, { value: 'inactive', label: t('disabled') }] }],
        defaults: () => ({ role: 'sales_agent', status: 'active', lastLogin: DB.daysFromNow(0), twoFA: false }),
        formFields: rec => `<div class="form-grid">
            ${UI.field(t('name'), 'name', rec.name, { required: true })}
            ${UI.field(t('email'), 'email', rec.email, { type: 'email', required: true })}
            ${UI.field(t('phone'), 'phone', rec.phone)}
            ${UI.field(t('role'), 'role', rec.role, { type: 'select', options: roleOpts() })}
            ${UI.field(t('status'), 'status', rec.status, { type: 'select', options: [{ value: 'active', label: t('active') }, { value: 'inactive', label: t('disabled') }] })}
          </div>`,
        toRecord: (fd, ex) => ({ ...ex, name: fd.name, email: fd.email, phone: fd.phone, role: fd.role, status: fd.status }),
      });
    }
    function paintRoles() {
      const head = PERMS.map(p => `<th style="text-align:center">${p}</th>`).join('');
      const rows = ROLES.map(r => `<tr><td class="cell-main">${t(r)}</td>${PERMS.map(p => `<td style="text-align:center">${(ROLE_MATRIX[r] || []).includes(p) ? '<span style="color:var(--success)">' + UI.icon('check') + '</span>' : '<span style="color:var(--text-muted)">—</span>'}</td>`).join('')}</tr>`).join('');
      bodyEl.innerHTML = `<div class="card"><div class="card-head"><h3>${t('permissions')}</h3></div>
        <div class="table-wrap"><table class="data"><thead><tr><th>${t('role')}</th>${head}</tr></thead><tbody>${rows}</tbody></table></div></div>`;
    }
    function paintAudit() {
      bodyEl.innerHTML = `<div class="card"><div class="card-head"><h3>${t('audit_log')}</h3></div>
        ${UI.table({ columns: [
          { label: t('name'), render: a => `<div class="with-avatar"><span class="avatar">${UI.initials(a.user)}</span>${UI.esc(a.user)}</div>` },
          { label: 'Action', render: a => UI.esc(a.action) },
          { label: 'IP', render: a => `<span class="chip mono">${a.ip}</span>` },
          { label: t('date'), align: 'end', render: a => UI.fdate(a.time) },
        ], rows: DB.all('audit').slice().sort((x, y) => new Date(y.time) - new Date(x.time)) })}</div>`;
    }
    paint();
  };

  /* ---- Settings ---- */
  Views.settings = function (root) {
    const s = DB.load().settings;
    root.innerHTML = VC.pageHead(t('nav_settings'), t('settings')) + `
      <div class="grid-2">
        <div class="card"><div class="card-head"><h3>${t('company_info')}</h3></div><div class="card-pad">
          <form id="set-form">
            ${UI.field(t('company_name'), 'company', s.company)}
            ${UI.field('Office / ' + t('location'), 'office', s.office)}
            <div class="form-grid">
              ${UI.field(t('phone'), 'phone', s.phone)}
              ${UI.field(t('email'), 'email', s.email, { type: 'email' })}
              ${UI.field(t('currency'), 'currency', s.currency, { type: 'select', options: ['USD', 'IQD', 'EUR'] })}
              ${UI.field(t('timezone'), 'timezone', s.timezone, { type: 'select', options: ['Asia/Baghdad', 'Asia/Dubai', 'Europe/Istanbul', 'UTC'] })}
              ${UI.field(t('commission_rate') + ' (%)', 'commissionRate', s.commissionRate, { type: 'number', step: '0.1' })}
              ${UI.field(t('tax_rate') + ' (%)', 'taxRate', s.taxRate, { type: 'number', step: '0.1' })}
            </div>
            <button type="button" class="btn btn-primary" id="set-save">${UI.icon('check')}${t('save')}</button>
          </form>
        </div></div>
        <div>
          <div class="card" style="margin-bottom:18px"><div class="card-head"><h3>${t('language')} & ${t('theme')}</h3></div><div class="card-pad">
            <div class="field"><label>${t('language')}</label><select class="select" id="set-lang">${I18N.langs().map(l => `<option value="${l.code}" ${l.code === I18N.current() ? 'selected' : ''}>${l.name}</option>`).join('')}</select></div>
            <div class="field"><label>${t('theme')}</label><select class="select" id="set-theme">
              <option value="dark" ${document.documentElement.getAttribute('data-theme') !== 'light' ? 'selected' : ''}>${t('dark')}</option>
              <option value="light" ${document.documentElement.getAttribute('data-theme') === 'light' ? 'selected' : ''}>${t('light')}</option></select></div>
          </div></div>
          <div class="card" style="margin-bottom:18px"><div class="card-head"><h3>${t('backup')}</h3></div><div class="card-pad">
            <div class="kv"><span class="k">Last backup</span><span class="v">${UI.fdate(s.lastBackup)}</span></div>
            <div style="display:flex;gap:10px;margin-top:12px;flex-wrap:wrap">
              <button class="btn btn-primary" id="set-backup">${UI.icon('download')}${t('backup_now')}</button>
              <button class="btn" id="set-restore">${UI.icon('shield')}${t('restore')}</button>
              <button class="btn btn-danger" id="set-reset">${UI.icon('trash')}${t('reset_data')}</button>
            </div>
          </div></div>
          <div class="card"><div class="card-head"><h3>${t('security_policies')}</h3></div><div class="card-pad">
            ${policy('Enforce Two-Factor Authentication', true)}
            ${policy('Require strong passwords', true)}
            ${policy('IP restriction for admins', false)}
            ${policy('Auto-logout after 30 min idle', true)}
          </div></div>
        </div>
      </div>`;

    function policy(label, on) { return `<div class="kv"><span class="k">${label}</span><span class="v">${UI.badge(on ? 'active' : 'inactive', on ? t('enabled') : t('disabled'))}</span></div>`; }

    document.getElementById('set-save').addEventListener('click', () => {
      const fd = UI.formData(document.getElementById('set-form'));
      DB.saveSettings({ company: fd.company, office: fd.office, phone: fd.phone, email: fd.email, currency: fd.currency, timezone: fd.timezone, commissionRate: +fd.commissionRate, taxRate: +fd.taxRate });
      UI.toast(t('saved')); App.bumpAudit('changed settings'); App.refreshChrome();
    });
    document.getElementById('set-lang').addEventListener('change', e => { I18N.set(e.target.value); App.rebuild(); });
    document.getElementById('set-theme').addEventListener('change', e => App.setTheme(e.target.value));
    document.getElementById('set-backup').addEventListener('click', () => {
      const blob = new Blob([JSON.stringify(DB.load(), null, 2)], { type: 'application/json' });
      const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'tablo-backup-' + DB.daysFromNow(0) + '.json'; a.click();
      DB.saveSettings({ lastBackup: DB.daysFromNow(0) }); UI.toast(t('backup_now') + ' ✓'); Views.settings(root);
    });
    document.getElementById('set-restore').addEventListener('click', () => UI.toast('Restore: select a backup file (demo).'));
    document.getElementById('set-reset').addEventListener('click', () => UI.confirm(t('reset_data') + '?', () => { DB.reset(); UI.toast(t('saved')); App.rebuild(); }));
  };

  /* ---- Profile ---- */
  Views.profile = function (root, param) {
    const me = App.currentUser();
    let tab = ['info', 'password', 'security', 'history'].includes(param) ? param : 'info';
    root.innerHTML = VC.pageHead(t('nav_profile'), t('my_profile'));
    const card = document.createElement('div'); card.className = 'card'; card.style.marginBottom = '18px'; card.innerHTML = `<div class="card-pad" style="display:flex;gap:16px;align-items:center;flex-wrap:wrap">
        <span class="avatar lg">${UI.initials(me.name)}</span>
        <div style="flex:1"><div style="font-size:20px;font-weight:600">${UI.esc(me.name)}</div>
          <div class="cell-sub">${t(me.role)} · ${UI.esc(me.email)}</div></div>
        <button class="btn">${UI.icon('user')}Upload Avatar</button></div>`;
    const tabsEl = document.createElement('div'); tabsEl.className = 'tabs';
    const T = [['info', t('personal_info')], ['password', t('change_password')], ['security', t('security')], ['history', t('login_history')]];
    tabsEl.innerHTML = T.map(x => `<div class="tab ${tab === x[0] ? 'active' : ''}" data-tab="${x[0]}">${x[1]}</div>`).join('');
    const bodyEl = document.createElement('div');
    root.appendChild(card); root.appendChild(tabsEl); root.appendChild(bodyEl);
    tabsEl.addEventListener('click', e => { const el = e.target.closest('[data-tab]'); if (!el) return; tab = el.getAttribute('data-tab'); tabsEl.querySelectorAll('.tab').forEach(x => x.classList.toggle('active', x === el)); paint(); });

    function paint() {
      if (tab === 'info') {
        bodyEl.innerHTML = `<div class="card"><div class="card-pad"><form id="pf-form">
          <div class="form-grid">
            ${UI.field(t('name'), 'name', me.name)}
            ${UI.field(t('email'), 'email', me.email, { type: 'email' })}
            ${UI.field(t('phone'), 'phone', me.phone)}
            ${UI.field(t('language'), 'lang', I18N.current(), { type: 'select', options: I18N.langs().map(l => ({ value: l.code, label: l.name })) })}
          </div>
          <button type="button" class="btn btn-primary" id="pf-save">${t('save')}</button>
        </form></div></div>`;
        document.getElementById('pf-save').addEventListener('click', () => {
          const fd = UI.formData(document.getElementById('pf-form'));
          DB.upsert('users', { id: me.id, name: fd.name, email: fd.email, phone: fd.phone });
          if (fd.lang !== I18N.current()) { I18N.set(fd.lang); }
          UI.toast(t('saved')); App.rebuild();
        });
      } else if (tab === 'password') {
        bodyEl.innerHTML = `<div class="card" style="max-width:460px"><div class="card-pad">
          ${UI.field(t('current_password'), 'cp', '', { type: 'password' })}
          ${UI.field(t('new_password'), 'np', '', { type: 'password' })}
          ${UI.field(t('confirm_password'), 'cf', '', { type: 'password' })}
          <button class="btn btn-primary" id="pf-pw">${UI.icon('lock')}${t('change_password')}</button>
        </div></div>`;
        document.getElementById('pf-pw').addEventListener('click', () => UI.toast(t('saved')));
      } else if (tab === 'security') {
        bodyEl.innerHTML = `<div class="card"><div class="card-pad">
          <div class="kv"><span class="k">${t('two_fa')}</span><span class="v" style="display:flex;gap:10px;align-items:center">${UI.badge(me.twoFA ? 'active' : 'inactive', me.twoFA ? t('enabled') : t('disabled'))}<button class="btn btn-sm" id="pf-2fa">${me.twoFA ? t('disable') : t('enable')}</button></span></div>
          <div class="kv"><span class="k">Active session</span><span class="v">${navigator.platform || 'Web'} · now</span></div>
          <div class="kv"><span class="k">${t('notifications')}</span><span class="v">${UI.badge('active', t('enabled'))}</span></div>
        </div></div>`;
        document.getElementById('pf-2fa').addEventListener('click', () => { DB.upsert('users', { id: me.id, twoFA: !me.twoFA }); me.twoFA = !me.twoFA; UI.toast(t('saved')); paint(); });
      } else {
        const rows = [];
        for (let i = 0; i < 6; i++) rows.push({ ip: '10.0.0.' + (12 + i), device: i % 2 ? 'Chrome · Windows' : 'Safari · iPhone', time: DB.daysFromNow(-i) });
        bodyEl.innerHTML = `<div class="card"><div class="card-head"><h3>${t('login_history')}</h3></div>
          ${UI.table({ columns: [
            { label: 'Device', render: r => UI.esc(r.device) }, { label: 'IP', render: r => `<span class="chip mono">${r.ip}</span>` }, { label: t('date'), align: 'end', render: r => UI.fdate(r.time) },
          ], rows })}</div>`;
      }
    }
    paint();
  };
})();
