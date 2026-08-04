/* ═══════════════════════════════════════════════════════════════
   Contracts — sales, rental, commercial. Detail + printable PDF view.
═══════════════════════════════════════════════════════════════ */
(function () {
  const t = k => I18N.t(k);

  function kindBadge(k) {
    const map = { sales: 'b-blue', rental: 'b-purple', commercial: 'b-gold' };
    const lbl = { sales: t('sales_contracts'), rental: t('rental_contracts'), commercial: t('commercial_contracts') };
    return `<span class="badge ${map[k]} plain">${lbl[k]}</span>`;
  }

  function columns() {
    return [
      { label: t('contract'), key: 'id', render: c => `<div class="cell-main">${c.id}</div><div class="cell-sub">${c.property || ''}</div>` },
      { label: t('type'), key: 'kind', render: c => kindBadge(c.kind), plain: c => c.kind },
      { label: t('buyer') + ' / ' + t('tenant'), key: 'partyB', render: c => UI.esc(c.partyB) },
      { label: t('amount'), key: 'amount', align: 'end', render: c => `<span class="mono">${UI.money(c.amount)}${c.kind === 'sales' ? '' : '/mo'}</span>` },
      { label: t('end_date'), key: 'endDate', render: c => c.endDate ? UI.fdate(c.endDate) : '—' },
      { label: t('status'), key: 'status', align: 'end', render: c => UI.badge(c.status), plain: c => t(c.status) },
    ];
  }

  function formFields(rec) {
    return `<div class="form-grid">
      ${UI.field(t('type'), 'kind', rec.kind, { type: 'select', options: [
        { value: 'sales', label: t('sales_contracts') }, { value: 'rental', label: t('rental_contracts') }, { value: 'commercial', label: t('commercial_contracts') }], required: true })}
      ${UI.field(t('property'), 'property', rec.property, { type: 'select', options: DB.all('properties').map(p => ({ value: p.id, label: p.id + ' · ' + t(p.type) })) })}
      ${UI.field(t('seller') + ' / ' + t('landlord'), 'partyA', rec.partyA, { required: true })}
      ${UI.field(t('buyer') + ' / ' + t('tenant'), 'partyB', rec.partyB, { required: true })}
      ${UI.field(t('amount'), 'amount', rec.amount, { type: 'number', required: true })}
      ${UI.field(t('commission'), 'commission', rec.commission, { type: 'number' })}
      ${UI.field(t('deposit'), 'deposit', rec.deposit, { type: 'number' })}
      ${UI.field(t('start_date'), 'startDate', rec.startDate, { type: 'date' })}
      ${UI.field(t('end_date'), 'endDate', rec.endDate, { type: 'date' })}
      ${UI.field(t('agent'), 'agent', rec.agent, { type: 'select', options: UI.AGENT_OPTIONS() })}
      ${UI.field(t('status'), 'status', rec.status, { type: 'select', options: [
        { value: 'draft', label: t('draft') }, { value: 'active', label: t('active') }, { value: 'signed', label: t('signed') }, { value: 'expired', label: t('expired') }] })}
    </div>`;
  }
  function toRecord(fd, ex) {
    return { ...ex, kind: fd.kind, property: fd.property, partyA: fd.partyA, partyB: fd.partyB,
      amount: +fd.amount || 0, commission: +fd.commission || 0, deposit: +fd.deposit || 0,
      startDate: fd.startDate || null, endDate: fd.endDate || null, agent: fd.agent, status: fd.status,
      signed: fd.status === 'signed' || fd.status === 'active' };
  }

  function detail(c) {
    const s = DB.load().settings;
    const body = `<div class="print-doc" id="print-area">
      <div style="text-align:center;margin-bottom:18px">
        <div style="font-size:22px;font-weight:700;letter-spacing:3px">TAB<span style="color:var(--gold)">LO</span></div>
        <div class="cell-sub">${UI.esc(s.company)} · ${UI.esc(s.office)}</div>
      </div>
      <h3 style="text-align:center;margin-bottom:16px">${t(c.kind + '_contracts')} — ${c.id}</h3>
      <div class="grid-2">
        <div>
          <div class="kv"><span class="k">${t('seller')} / ${t('landlord')}</span><span class="v">${UI.esc(c.partyA)}</span></div>
          <div class="kv"><span class="k">${t('buyer')} / ${t('tenant')}</span><span class="v">${UI.esc(c.partyB)}</span></div>
          <div class="kv"><span class="k">${t('property')}</span><span class="v">${UI.esc(c.property || '—')}</span></div>
          <div class="kv"><span class="k">${t('agent')}</span><span class="v">${UI.esc(c.agent)}</span></div>
        </div>
        <div>
          <div class="kv"><span class="k">${t('amount')}</span><span class="v mono">${UI.money(c.amount)}${c.kind === 'sales' ? '' : ' / mo'}</span></div>
          <div class="kv"><span class="k">${t('commission')}</span><span class="v mono">${UI.money(c.commission)}</span></div>
          ${c.deposit ? `<div class="kv"><span class="k">${t('deposit')}</span><span class="v mono">${UI.money(c.deposit)}</span></div>` : ''}
          <div class="kv"><span class="k">${t('start_date')}</span><span class="v">${UI.fdate(c.startDate)}</span></div>
          <div class="kv"><span class="k">${t('end_date')}</span><span class="v">${c.endDate ? UI.fdate(c.endDate) : '—'}</span></div>
          <div class="kv"><span class="k">${t('status')}</span><span class="v">${UI.badge(c.status)}</span></div>
        </div>
      </div>
      <div class="divider"></div>
      <p class="cell-sub" style="line-height:1.9">This agreement is made between the parties named above for the referenced property under the terms and conditions of ${UI.esc(s.company)}. Payment schedule, obligations and renewal terms apply as per the signed annex.</p>
      <div class="grid-2" style="margin-top:40px">
        <div style="text-align:center"><div style="border-top:1px solid var(--border-2);padding-top:8px;margin-top:30px">${t('seller')}</div></div>
        <div style="text-align:center"><div style="border-top:1px solid var(--border-2);padding-top:8px;margin-top:30px">${t('buyer')} ${c.signed ? '<span class="badge b-green" style="margin-inline-start:6px">✓ ' + t('signed') + '</span>' : ''}</div></div>
      </div>
    </div>`;
    UI.modal({ title: c.id, wide: true, body,
      footer: `<button class="btn" data-close>${t('close')}</button><button class="btn btn-primary no-print" data-print>${UI.icon('printer')}${t('print')} PDF</button>`,
      onOpen(ov) { ov.querySelector('[data-print]').addEventListener('click', () => window.print()); } });
  }

  Views.contracts = function (root) {
    let kind = 'all';
    const wrap = document.createElement('div'); root.innerHTML = ''; root.appendChild(wrap);
    function paint() {
      const ctrl = VC.crudList(wrap, {
        coll: 'contracts', title: t('nav_contracts'), subtitle: t('contracts'),
        addLabel: t('new_contract'),
        headerActions: `<div class="tabs" style="border:none;margin:0">
          ${['all','sales','rental','commercial'].map(k => `<div class="tab ${kind === k ? 'active' : ''}" data-k="${k}">${k === 'all' ? t('all') : t(k + '_contracts')}</div>`).join('')}</div>`,
        columns: columns(),
        searchFields: ['id', 'partyA', 'partyB', 'property'],
        filters: [{ key: 'status', options: [{ value: 'active', label: t('active') }, { value: 'signed', label: t('signed') }, { value: 'expired', label: t('expired') }, { value: 'draft', label: t('draft') }] }],
        baseFilter: kind === 'all' ? null : (c => c.kind === kind),
        defaults: () => ({ kind: kind === 'all' ? 'sales' : kind, status: 'draft', agent: UI.AGENT_OPTIONS()[0], startDate: DB.daysFromNow(0) }),
        formFields, toRecord, onView: (c) => detail(c), wideForm: true,
      });
      wrap.querySelectorAll('[data-k]').forEach(el => el.addEventListener('click', () => { kind = el.getAttribute('data-k'); paint(); }));
    }
    paint();
  };
})();
