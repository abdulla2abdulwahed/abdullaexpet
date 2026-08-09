/* ═══════════════════════════════════════════════════════════════
   Contracts — list + full-page data-entry form (HERP style).
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

  /* ---------- Field builders for the full-page form ---------- */
  function input(name, value, type) {
    return `<input class="input" name="${name}" type="${type || 'text'}" value="${UI.esc(value == null ? '' : value)}">`;
  }
  function select(name, value, options) {
    const opts = options.map(o => {
      const v = typeof o === 'string' ? o : o.value, l = typeof o === 'string' ? o : o.label;
      return `<option value="${UI.esc(v)}" ${String(value) === String(v) ? 'selected' : ''}>${UI.esc(l)}</option>`;
    }).join('');
    return `<select class="select" name="${name}"><option value="">${t('cf_select')}</option>${opts}</select>`;
  }
  function textarea(name, value) { return `<textarea class="input" name="${name}">${UI.esc(value || '')}</textarea>`; }
  function row(labelKey, control, full) {
    return `<div class="cf-row ${full ? 'full' : ''}"><label>${t(labelKey)}:</label>
      <div class="cf-control">${control}</div>${full ? '' : `<span class="cf-info">${UI.icon('info')}</span>`}</div>`;
  }

  function contractForm(root, existing, kindDefault, back) {
    const c = existing || {};
    const cur = c.currency || DB.load().settings.currency || 'IQD';
    const propOpts = DB.all('properties').map(p => ({ value: p.id, label: p.id + ' · ' + t(p.type) }));
    const durOpts = [
      { value: '6m', label: '6 ' + (I18N.current() === 'en' ? 'months' : t('duration')) },
      { value: '1y', label: '1 ' + (I18N.current() === 'en' ? 'year' : t('duration')) },
      { value: '2y', label: '2 ' + (I18N.current() === 'en' ? 'years' : t('duration')) },
      { value: '3y', label: '3 ' + (I18N.current() === 'en' ? 'years' : t('duration')) },
      { value: '5y', label: '5 ' + (I18N.current() === 'en' ? 'years' : t('duration')) },
    ];
    const kind = c.kind || kindDefault || 'sales';
    const isEdit = !!c.id;
    const statusSel = select('status', c.status || 'draft', [
      { value: 'draft', label: t('draft') }, { value: 'active', label: t('active') },
      { value: 'signed', label: t('signed') }, { value: 'expired', label: t('expired') }]);

    // Field set differs by contract type (sales vs rental/commercial lease).
    let rows;
    if (kind === 'sales') {
      rows = [
        row('cf_first_party', input('partyA', c.partyA)),
        row('cf_second_party', input('partyB', c.partyB)),
        row('cf_mobile', input('firstMobile', c.firstMobile)),
        row('cf_mobile', input('secondMobile', c.secondMobile)),
        row('cf_property_type', select('propertyType', c.propertyType, UI.PTYPE_OPTIONS())),
        row('cf_area', input('area', c.area)),
        row('cf_property_no', select('property', c.property, propOpts)),
        row('cf_location', input('location', c.location)),
        row('cf_currency', select('currency', cur, ['USD', 'IQD', 'EUR'])),
        row('cf_advance', input('advance', c.advance || c.deposit, 'number')),
        row('cf_price', input('amount', c.amount, 'number')),
        row('cf_late_penalty', input('latePenalty', c.latePenalty, 'number')),
        row('cf_remaining', input('remaining', c.remaining, 'number')),
        row('cf_lawyer', input('lawyer', c.lawyer)),
        row('cf_guarantor', input('guarantor', c.guarantor)),
        row('cf_handover', input('handoverDate', c.handoverDate, 'date')),
        row('cf_payment_due', input('paymentDue', c.paymentDue, 'date')),
        row('cf_duration', select('duration', c.duration, durOpts)),
        row('status', statusSel),
        row('agent', select('agent', c.agent, UI.AGENT_OPTIONS())),
      ];
    } else {
      // Rental / commercial lease
      rows = [
        row('cf_landlord', input('partyA', c.partyA)),
        row('cf_tenant', input('partyB', c.partyB)),
        row('cf_mobile', input('firstMobile', c.firstMobile)),
        row('cf_mobile', input('secondMobile', c.secondMobile)),
        row('cf_property_type', select('propertyType', c.propertyType, UI.PTYPE_OPTIONS())),
        row('cf_area', input('area', c.area)),
        row('cf_property_no', select('property', c.property, propOpts)),
        row('cf_location', input('location', c.location)),
        row('cf_lease_start', input('startDate', c.startDate, 'date')),
        row('cf_lease_duration', select('duration', c.duration, durOpts)),
        row('cf_rent', input('amount', c.amount, 'number')),
        row('cf_late_penalty', input('latePenalty', c.latePenalty, 'number')),
        row('cf_advance_rent', input('advanceRent', c.advanceRent, 'number')),
        row('cf_daily_penalty', input('dailyPenalty', c.dailyPenalty, 'number')),
        row('cf_deposit', input('deposit', c.deposit, 'number')),
        row('cf_handover', input('handoverDate', c.handoverDate, 'date')),
        row('cf_currency', select('currency', cur, ['USD', 'IQD', 'EUR'])),
        row('cf_guarantor', input('guarantor', c.guarantor)),
        row('status', statusSel),
        row('agent', select('agent', c.agent, UI.AGENT_OPTIONS())),
      ];
    }
    const grid = rows.concat([row('cf_notes', textarea('notes', c.notes), true)]).join('');

    root.innerHTML = `<div class="contract-form">
      <div class="cf-back" data-back>${UI.icon('chevron')} ${t('cf_back')}</div>
      <div class="cf-card">
        <div style="text-align:end;margin-bottom:6px">${select('kind', kind, [
          { value: 'sales', label: t('sales_contracts') }, { value: 'rental', label: t('rental_contracts') }, { value: 'commercial', label: t('commercial_contracts') }])
          .replace('class="select"', 'class="select" style="max-width:220px;display:inline-block"')}</div>
        <div class="cf-title">${isEdit ? c.id + ' — ' : ''}${t(kind + '_contracts')}</div>
        <form id="cform"><div class="cf-grid">${grid}</div></form>
        <div class="cf-actions">
          <button class="btn btn-royal" data-save>${UI.icon('check')}${t('cf_save')}</button>
          <button class="btn" data-new>${UI.icon('file')}${t('cf_new')}</button>
          <button class="btn btn-royal" data-receive>${UI.icon('coins')}${t('cf_receive')}</button>
          ${isEdit ? `<button class="btn" data-print>${UI.icon('printer')}${t('print')} PDF</button>` : ''}
        </div>
      </div></div>`;

    function collect() {
      const fd = UI.formData(root);
      const price = +fd.amount || 0;
      const dep = (fd.deposit != null && fd.deposit !== '') ? +fd.deposit : (+fd.advance || 0);
      return {
        ...c, kind: fd.kind || kind,
        partyA: fd.partyA, partyB: fd.partyB, firstMobile: fd.firstMobile, secondMobile: fd.secondMobile,
        propertyType: fd.propertyType, property: fd.property, area: fd.area, location: fd.location,
        currency: fd.currency, amount: price, price: price,
        advance: +fd.advance || 0, advanceRent: +fd.advanceRent || 0, deposit: dep,
        remaining: +fd.remaining || 0, latePenalty: +fd.latePenalty || 0, dailyPenalty: +fd.dailyPenalty || 0,
        commission: c.commission || Math.round(price * (fd.kind === 'sales' || kind === 'sales' ? 0.02 : 1)),
        lawyer: fd.lawyer, guarantor: fd.guarantor, handoverDate: fd.handoverDate || null,
        paymentDue: fd.paymentDue || null, duration: fd.duration, status: fd.status, agent: fd.agent,
        notes: fd.notes, startDate: fd.startDate || c.startDate || DB.daysFromNow(0), endDate: c.endDate || null,
        signed: fd.status === 'signed' || fd.status === 'active',
      };
    }

    root.querySelector('[data-back]').addEventListener('click', back);
    // switching contract type re-renders with that type's field set (keeps entered values)
    root.querySelector('[name="kind"]').addEventListener('change', e => {
      const rec = collect(); rec.kind = e.target.value; contractForm(root, rec, e.target.value, back);
    });
    root.querySelector('[data-save]').addEventListener('click', () => {
      const form = root.querySelector('#cform');
      if (!form.reportValidity()) return;
      const rec = collect();
      if (!rec.partyA || !rec.partyB) { UI.toast(t('cf_first_party') + ' / ' + t('cf_second_party'), 'err'); return; }
      DB.upsert('contracts', rec); UI.toast(t('saved')); App.bumpAudit(isEdit ? 'updated a contract' : 'created a contract'); back();
    });
    root.querySelector('[data-new]').addEventListener('click', () => contractForm(root, null, kind, back));
    root.querySelector('[data-receive]').addEventListener('click', () => {
      const rec = collect();
      const amt = rec.advance || rec.amount;
      if (!rec.partyB || !amt) { UI.toast(t('cf_receive') + ' — ' + t('no_data'), 'err'); return; }
      DB.upsert('contracts', rec);
      DB.upsert('receipts', { invoice: 'INV-' + DB.uid('').slice(0, 4).toUpperCase(), customer: rec.partyB, amount: amt, method: 'cash', date: DB.daysFromNow(0), forItem: 'Sale Deposit', status: 'paid' });
      UI.toast(t('cf_receive') + ' ✓'); App.navigate('receipts');
    });
    const pr = root.querySelector('[data-print]'); if (pr) pr.addEventListener('click', () => detail(collect()));
  }

  function detail(c) {
    const s = DB.load().settings;
    const body = `<div class="print-doc" id="print-area">
      <div style="text-align:center;margin-bottom:18px">
        <div style="font-size:22px;font-weight:700;letter-spacing:3px">TAB<span style="color:var(--brand-gold)">LO</span></div>
        <div class="cell-sub">${UI.esc(s.company)} · ${UI.esc(s.office)}</div>
      </div>
      <h3 style="text-align:center;margin-bottom:16px">${t(c.kind + '_contracts')}${c.id ? ' — ' + c.id : ''}</h3>
      <div class="grid-2">
        <div>
          <div class="kv"><span class="k">${t('cf_first_party')}</span><span class="v">${UI.esc(c.partyA)}</span></div>
          <div class="kv"><span class="k">${t('cf_second_party')}</span><span class="v">${UI.esc(c.partyB)}</span></div>
          <div class="kv"><span class="k">${t('property')}</span><span class="v">${UI.esc(c.property || '—')}</span></div>
          <div class="kv"><span class="k">${t('cf_location')}</span><span class="v">${UI.esc(c.location || '—')}</span></div>
          <div class="kv"><span class="k">${t('cf_lawyer')}</span><span class="v">${UI.esc(c.lawyer || '—')}</span></div>
        </div>
        <div>
          <div class="kv"><span class="k">${t('cf_price')}</span><span class="v mono">${UI.money(c.amount)}</span></div>
          <div class="kv"><span class="k">${t('cf_advance')}</span><span class="v mono">${UI.money(c.advance || c.deposit)}</span></div>
          <div class="kv"><span class="k">${t('cf_remaining')}</span><span class="v mono">${UI.money(c.remaining)}</span></div>
          <div class="kv"><span class="k">${t('cf_handover')}</span><span class="v">${c.handoverDate ? UI.fdate(c.handoverDate) : '—'}</span></div>
          <div class="kv"><span class="k">${t('status')}</span><span class="v">${UI.badge(c.status)}</span></div>
        </div>
      </div>
      <div class="divider"></div>
      <div class="grid-2" style="margin-top:40px">
        <div style="text-align:center"><div style="border-top:1px solid var(--border-2);padding-top:8px;margin-top:30px">${t('cf_first_party')}</div></div>
        <div style="text-align:center"><div style="border-top:1px solid var(--border-2);padding-top:8px;margin-top:30px">${t('cf_second_party')} ${c.signed ? '<span class="badge b-green" style="margin-inline-start:6px">✓ ' + t('signed') + '</span>' : ''}</div></div>
      </div>
    </div>`;
    UI.modal({ title: c.id || t('new_contract'), wide: true, body,
      footer: `<button class="btn" data-close>${t('close')}</button><button class="btn btn-primary no-print" data-print>${UI.icon('printer')}${t('print')} PDF</button>`,
      onOpen(ov) { ov.querySelector('[data-print]').addEventListener('click', () => window.print()); } });
  }

  Views.contracts = function (root, param) {
    let kind = ['sales', 'rental', 'commercial'].includes(param) ? param : 'all';

    function showList() {
      root.innerHTML = '';
      const wrap = document.createElement('div'); root.appendChild(wrap);
      VC.crudList(wrap, {
        coll: 'contracts', title: t('nav_contracts'), subtitle: t('contracts'),
        canAdd: false, canEdit: false,
        headerActions: `<div class="tabs" style="border:none;margin:0">
            ${['all','sales','rental','commercial'].map(k => `<div class="tab ${kind === k ? 'active' : ''}" data-k="${k}">${k === 'all' ? t('all') : t(k + '_contracts')}</div>`).join('')}</div>
          <button class="btn btn-royal" data-newcontract>${UI.icon('plus')}${t('new_contract')}</button>`,
        columns: columns(),
        searchFields: ['id', 'partyA', 'partyB', 'property'],
        filters: [{ key: 'status', options: [{ value: 'active', label: t('active') }, { value: 'signed', label: t('signed') }, { value: 'expired', label: t('expired') }, { value: 'draft', label: t('draft') }] }],
        baseFilter: kind === 'all' ? null : (c => c.kind === kind),
        onView: (c) => showForm(c),
      });
      wrap.querySelectorAll('[data-k]').forEach(el => el.addEventListener('click', () => { kind = el.getAttribute('data-k'); showList(); }));
      const nb = wrap.querySelector('[data-newcontract]'); if (nb) nb.addEventListener('click', () => showForm(null));
    }
    function showForm(existing) { contractForm(root, existing, kind === 'all' ? 'sales' : kind, showList); }

    showList();
  };
})();
