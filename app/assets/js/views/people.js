/* ═══════════════════════════════════════════════════════════════
   People — Tenants, Rent Collection (+overdue), Customers (CRM).
═══════════════════════════════════════════════════════════════ */
(function () {
  const t = k => I18N.t(k);

  /* ---- Tenants ---- */
  Views.tenants = function (root) {
    VC.crudList(root, {
      coll: 'tenants', title: t('nav_tenants'), subtitle: t('tenant_s'), canAdd: false,
      columns: [
        { label: t('tenant'), key: 'name', render: tn => `<div class="with-avatar"><span class="avatar">${UI.initials(tn.name)}</span><div><div class="cell-main">${UI.esc(tn.name)}</div><div class="cell-sub">${UI.esc(tn.phone)}</div></div></div>` },
        { label: t('current_property'), key: 'propertyLabel', render: tn => `${UI.esc(tn.propertyLabel)}<div class="cell-sub">${tn.contract}</div>` },
        { label: t('monthly_rent'), key: 'monthlyRent', align: 'end', render: tn => `<span class="mono">${UI.money(tn.monthlyRent)}</span>` },
        { label: t('status'), key: 'status', align: 'end', render: tn => UI.badge(tn.status), plain: tn => t(tn.status) },
      ],
      searchFields: ['name', 'phone', 'propertyLabel', 'contract'],
      filters: [{ key: 'status', options: [{ value: 'paid', label: t('paid') }, { value: 'due', label: t('overdue') === 'overdue' ? 'Due' : t('due') || 'Due' }, { value: 'overdue', label: t('overdue') }] }],
      canEdit: false, canDelete: false, onView: tn => tenantDetail(tn),
    });
  };

  function tenantDetail(tn) {
    const prop = DB.get('properties', tn.property);
    UI.modal({ title: tn.name, wide: true, body: `
      <div class="with-avatar" style="margin-bottom:16px"><span class="avatar lg">${UI.initials(tn.name)}</span>
        <div><div style="font-size:18px;font-weight:600">${UI.esc(tn.name)}</div><div class="cell-sub">${UI.icon('phone')} ${UI.esc(tn.phone)} · ${UI.icon('mail')} ${UI.esc(tn.email)}</div></div></div>
      <div class="grid-2">
        <div>
          <div class="kv"><span class="k">${t('current_property')}</span><span class="v">${UI.esc(tn.propertyLabel)}</span></div>
          <div class="kv"><span class="k">${t('contract')}</span><span class="v">${tn.contract}</span></div>
          <div class="kv"><span class="k">${t('monthly_rent')}</span><span class="v mono">${UI.money(tn.monthlyRent)}</span></div>
          <div class="kv"><span class="k">${t('move_in')}</span><span class="v">${UI.fdate(tn.moveIn)}</span></div>
        </div>
        <div>
          <div class="kv"><span class="k">${t('paid')}</span><span class="v mono" style="color:var(--success)">${UI.money(tn.paid)}</span></div>
          <div class="kv"><span class="k">${t('remaining')}</span><span class="v mono" style="color:var(--warning)">${UI.money(tn.remaining)}</span></div>
          <div class="kv"><span class="k">${t('due_date')}</span><span class="v">${UI.fdate(tn.dueDate)}</span></div>
          <div class="kv"><span class="k">${t('status')}</span><span class="v">${UI.badge(tn.status)}</span></div>
        </div>
      </div>
      <div class="divider"></div>
      <h3 style="font-size:14px;margin-bottom:10px">${t('payment_history')}</h3>
      ${UI.table({ columns: [
        { label: t('date'), render: r => UI.fdate(r.d) }, { label: t('amount'), align: 'end', render: r => `<span class="mono">${UI.money(r.a)}</span>` }, { label: t('status'), align: 'end', render: () => UI.badge('paid') },
      ], rows: [{ d: DB.daysFromNow(-30), a: tn.monthlyRent }, { d: DB.daysFromNow(-60), a: tn.monthlyRent }, { d: DB.daysFromNow(-90), a: tn.monthlyRent }] })}`,
      footer: `<button class="btn" data-close>${t('close')}</button>` });
  }

  /* ---- Rent Collection ---- */
  Views.rent_collection = function (root) {
    let mode = 'all'; // all | overdue
    const wrap = document.createElement('div'); root.innerHTML = ''; root.appendChild(wrap);
    function paint() {
      const tenants = DB.all('tenants');
      const overdue = tenants.filter(tn => tn.status === 'overdue');
      const dueSoon = tenants.filter(tn => tn.remaining > 0);
      const head = summary([
        { label: t('rent_collection'), value: UI.money(tenants.reduce((s, tn) => s + tn.paid, 0)), icon: 'coins', cls: 'ic-green' },
        { label: t('outstanding'), value: UI.money(tenants.reduce((s, tn) => s + tn.remaining, 0)), icon: 'wallet', cls: 'ic-amber' },
        { label: t('overdue'), value: UI.num(overdue.length), icon: 'warning', cls: 'ic-red' },
      ]);
      VC.crudList(wrap, {
        coll: 'tenants', title: t('nav_rent_collection'), subtitle: t('rent_collection'), canAdd: false, canEdit: false, canDelete: false,
        headerActions: `<div class="tabs" style="border:none;margin:0">
          <div class="tab ${mode === 'all' ? 'active' : ''}" data-m="all">${t('all')}</div>
          <div class="tab ${mode === 'overdue' ? 'active' : ''}" data-m="overdue">${t('overdue')} <span class="nav-badge" style="position:static;margin-inline-start:6px">${overdue.length}</span></div></div>`,
        source: () => DB.all('tenants').filter(tn => tn.remaining > 0),
        baseFilter: mode === 'overdue' ? (tn => tn.status === 'overdue') : null,
        columns: [
          { label: t('tenant'), key: 'name', render: tn => `<div class="cell-main">${UI.esc(tn.name)}</div><div class="cell-sub">${UI.esc(tn.propertyLabel)}</div>` },
          { label: t('due_date'), key: 'dueDate', render: tn => `${UI.fdate(tn.dueDate)}${tn.status === 'overdue' ? ' <span class="badge b-red plain" style="font-size:10px">' + t('overdue') + '</span>' : ''}` },
          { label: t('monthly_rent'), key: 'monthlyRent', align: 'end', render: tn => UI.money(tn.monthlyRent) },
          { label: t('remaining'), key: 'remaining', align: 'end', render: tn => `<span class="mono" style="color:var(--warning)">${UI.money(tn.remaining)}</span>` },
          { label: '', align: 'end', render: tn => `<div class="row-actions"><button class="btn btn-sm btn-primary" data-collect="${tn.id}">${t('collect')}</button><button class="btn btn-sm" data-remind="${tn.id}">${UI.icon('bell')}</button></div>` },
        ],
        searchFields: ['name', 'propertyLabel'],
      });
      wrap.insertAdjacentElement('afterbegin', head);
      wrap.querySelectorAll('[data-m]').forEach(el => el.addEventListener('click', () => { mode = el.getAttribute('data-m'); paint(); }));
      wrap.querySelectorAll('[data-collect]').forEach(el => el.addEventListener('click', () => collect(el.getAttribute('data-collect'), paint)));
      wrap.querySelectorAll('[data-remind]').forEach(el => el.addEventListener('click', () => UI.toast(t('send_reminder') + ' ✓ (SMS + Email)')));
    }
    function summary(items) { const d = document.createElement('div'); d.innerHTML = `<div class="stat-grid">${items.map(i => VC.stat(i.label, i.value, i.icon, i.cls)).join('')}</div>`; return d; }
    function collect(id, done) {
      const tn = DB.get('tenants', id);
      UI.modal({ title: t('collect') + ' · ' + tn.name, body: `<div class="kv"><span class="k">${t('remaining')}</span><span class="v mono">${UI.money(tn.remaining)}</span></div>
        ${UI.field(t('amount'), 'amount', tn.remaining, { type: 'number', required: true })}
        ${UI.field(t('method'), 'method', 'cash', { type: 'select', options: [{ value: 'cash', label: t('cash') }, { value: 'bank', label: t('bank') }, { value: 'card', label: t('card') }] })}`,
        footer: `<button class="btn" data-close>${t('cancel')}</button><button class="btn btn-primary" data-save>${t('collect')}</button>`,
        onOpen(ov) { ov.querySelector('[data-save]').addEventListener('click', () => {
          const amt = Math.min(+UI.formData(ov).amount || 0, tn.remaining);
          const paid = tn.paid + amt, remaining = tn.monthlyRent - paid;
          DB.upsert('tenants', { id: tn.id, paid, remaining, status: remaining <= 0 ? 'paid' : tn.status });
          DB.upsert('receipts', { invoice: 'INV-' + DB.uid('').slice(0, 4).toUpperCase(), customer: tn.name, amount: amt, method: UI.formData(ov).method, date: DB.daysFromNow(0), forItem: 'Rent Payment', status: 'paid' });
          UI.close(); UI.toast(t('saved')); App.bumpAudit('collected rent'); done();
        }); } });
    }
    paint();
  };

  /* ---- Customers (CRM) ---- */
  Views.customers = function (root) {
    const roleOpts = [
      { value: 'buyer', label: t('buyers') }, { value: 'seller', label: t('sellers') },
      { value: 'landlord', label: t('landlords') }, { value: 'tenant', label: t('tenants') },
      { value: 'investor', label: t('investors') }, { value: 'company', label: t('companies') },
    ];
    VC.crudList(root, {
      coll: 'customers', title: t('nav_customers'), subtitle: t('customers'), addLabel: t('add_customer'),
      columns: [
        { label: t('name'), key: 'name', render: c => `<div class="with-avatar"><span class="avatar">${UI.initials(c.name)}</span><div><div class="cell-main">${UI.esc(c.name)}</div><div class="cell-sub">${UI.esc(c.email)}</div></div></div>` },
        { label: t('role'), key: 'role', render: c => `<span class="chip">${(roleOpts.find(r => r.value === c.role) || {}).label || c.role}</span>`, plain: c => c.role },
        { label: t('phone'), key: 'phone', render: c => UI.esc(c.phone) },
        { label: t('city'), key: 'city', render: c => UI.esc(c.city) },
        { label: t('documents'), key: 'documents', align: 'end', render: c => `<span class="chip">${UI.icon('file')} ${c.documents}</span>` },
      ],
      searchFields: ['name', 'email', 'phone', 'city'],
      filters: [{ key: 'role', options: roleOpts }, { key: 'city', options: UI.CITIES() }],
      defaults: () => ({ role: 'buyer', city: 'Erbil', documents: 0 }),
      formFields: rec => `<div class="form-grid">
          ${UI.field(t('name'), 'name', rec.name, { required: true })}
          ${UI.field(t('role'), 'role', rec.role, { type: 'select', options: roleOpts })}
          ${UI.field(t('phone'), 'phone', rec.phone)}
          ${UI.field(t('email'), 'email', rec.email, { type: 'email' })}
          ${UI.field(t('city'), 'city', rec.city, { type: 'select', options: UI.CITIES() })}
        </div>${UI.field(t('notes'), 'notes', rec.notes, { type: 'textarea', full: true })}`,
      toRecord: (fd, ex) => ({ ...ex, name: fd.name, role: fd.role, phone: fd.phone, email: fd.email, city: fd.city, notes: fd.notes, documents: ex.documents || 0 }),
      onView: c => customerDetail(c, roleOpts),
    });
  };

  function customerDetail(c, roleOpts) {
    const props = DB.all('properties').filter(p => p.owner === c.name);
    const contracts = DB.all('contracts').filter(x => x.partyA === c.name || x.partyB === c.name);
    UI.modal({ title: c.name, wide: true, body: `
      <div class="with-avatar" style="margin-bottom:16px"><span class="avatar lg">${UI.initials(c.name)}</span>
        <div><div style="font-size:18px;font-weight:600">${UI.esc(c.name)}</div>
        <div class="cell-sub">${(roleOpts.find(r => r.value === c.role) || {}).label} · ${UI.esc(c.city)}</div></div></div>
      <div class="kv"><span class="k">${UI.icon('phone')} ${t('phone')}</span><span class="v">${UI.esc(c.phone)}</span></div>
      <div class="kv"><span class="k">${UI.icon('mail')} ${t('email')}</span><span class="v">${UI.esc(c.email)}</span></div>
      <div class="divider"></div>
      <h3 style="font-size:14px;margin-bottom:8px">${t('comm_log')}</h3>
      ${['Called about listing PR-1004', 'Sent property brochure by email', 'Follow-up meeting scheduled'].map((m, i) => `<div class="kv"><span class="k">${UI.icon('clock')} ${m}</span><span class="v">${UI.fdate(DB.daysFromNow(-i * 4 - 1))}</span></div>`).join('')}
      <div class="divider"></div>
      <h3 style="font-size:14px;margin-bottom:8px">${t('history')} — ${t('properties')} (${props.length}) · ${t('contracts')} (${contracts.length})</h3>
      ${contracts.length ? UI.table({ columns: [{ label: t('contract'), render: x => x.id }, { label: t('type'), render: x => t(x.kind + '_contracts') }, { label: t('amount'), align: 'end', render: x => UI.money(x.amount) }], rows: contracts.slice(0, 5) }) : `<div class="cell-sub">${t('no_data')}</div>`}`,
      footer: `<button class="btn" data-close>${t('close')}</button>` });
  }
})();
