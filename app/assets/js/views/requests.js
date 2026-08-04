/* ═══════════════════════════════════════════════════════════════
   Property Requests — purchase & rental (tabbed).
═══════════════════════════════════════════════════════════════ */
(function () {
  const t = k => I18N.t(k);

  function formFields(rec) {
    return `<div class="form-grid">
      ${UI.field(t('kind') === 'kind' ? 'Request Type' : t('kind'), 'kind', rec.kind, { type: 'select', options: [{ value: 'purchase', label: t('purchase_requests') }, { value: 'rental', label: t('rental_requests') }], required: true })}
      ${UI.field(t('client'), 'client', rec.client, { required: true })}
      ${UI.field(t('phone'), 'phone', rec.phone)}
      ${UI.field(t('type'), 'type', rec.type, { type: 'select', options: UI.PTYPE_OPTIONS() })}
      ${UI.field(t('budget'), 'budget', rec.budget, { type: 'number' })}
      ${UI.field(t('area') + ' (m²)', 'area', rec.area, { type: 'number' })}
      ${UI.field(t('bedrooms'), 'bedrooms', rec.bedrooms, { type: 'number' })}
      ${UI.field(t('pref_location'), 'location', rec.location)}
      ${UI.field(t('move_in'), 'moveIn', rec.moveIn, { type: 'date' })}
      ${UI.field(t('agent'), 'agent', rec.agent, { type: 'select', options: UI.AGENT_OPTIONS() })}
      ${UI.field(t('status'), 'status', rec.status, { type: 'select', options: [{ value: 'pending', label: t('pending') }, { value: 'matched', label: t('matched') }, { value: 'closed', label: t('closed') }] })}
    </div>
    ${UI.field(t('notes'), 'notes', rec.notes, { type: 'textarea', full: true })}`;
  }
  function toRecord(fd, ex) {
    return { ...ex, kind: fd.kind, client: fd.client, phone: fd.phone, type: fd.type, budget: +fd.budget || 0,
      area: +fd.area || 0, bedrooms: +fd.bedrooms || 0, location: fd.location, moveIn: fd.moveIn || null,
      agent: fd.agent, status: fd.status, notes: fd.notes };
  }
  function columns() {
    return [
      { label: t('client'), key: 'client', render: r => `<div class="with-avatar"><span class="avatar">${UI.initials(r.client)}</span><div><div class="cell-main">${UI.esc(r.client)}</div><div class="cell-sub">${UI.esc(r.phone)}</div></div></div>` },
      { label: t('type'), key: 'type', render: r => `<span class="chip">${t(r.type)}</span>`, plain: r => t(r.type) },
      { label: t('budget'), key: 'budget', align: 'end', render: r => `<span class="mono">${UI.money(r.budget)}</span>` },
      { label: t('pref_location'), key: 'location', render: r => UI.esc(r.location) },
      { label: t('agent'), key: 'agent', render: r => UI.esc(r.agent) },
      { label: t('status'), key: 'status', align: 'end', render: r => UI.badge(r.status), plain: r => t(r.status) },
    ];
  }

  Views.requests = function (root) {
    let kind = 'all';
    const wrap = document.createElement('div');
    root.innerHTML = '';
    root.appendChild(wrap);
    function paint() {
      VC.crudList(wrap, {
        coll: 'requests', title: t('nav_requests'), subtitle: t('requests'),
        addLabel: t('new_request'),
        headerActions: `<div class="tabs" style="border:none;margin:0">
          ${['all','purchase','rental'].map(k => `<div class="tab ${kind === k ? 'active' : ''}" data-k="${k}">${k === 'all' ? t('all') : k === 'purchase' ? t('purchase_requests') : t('rental_requests')}</div>`).join('')}</div>`,
        columns: columns(),
        searchFields: ['client', 'phone', 'location', 'type'],
        filters: [{ key: 'status', options: [{ value: 'pending', label: t('pending') }, { value: 'matched', label: t('matched') }, { value: 'closed', label: t('closed') }] }],
        baseFilter: kind === 'all' ? null : (r => r.kind === kind),
        defaults: () => ({ kind: kind === 'rental' ? 'rental' : 'purchase', status: 'pending', type: 't_apartment', agent: UI.AGENT_OPTIONS()[0] }),
        formFields, toRecord, wideForm: true,
      });
      wrap.querySelectorAll('[data-k]').forEach(el => el.addEventListener('click', () => { kind = el.getAttribute('data-k'); paint(); }));
    }
    paint();
  };
})();
