/* ═══════════════════════════════════════════════════════════════
   Properties — list, For Sale, For Rent, detail with tabs.
═══════════════════════════════════════════════════════════════ */
(function () {
  const t = k => I18N.t(k);

  function priceCell(p) {
    return p.purpose === 'sale'
      ? `<span class="mono">${UI.money(p.salePrice)}</span>${p.negotiable ? ' <span class="cell-sub">(neg.)</span>' : ''}`
      : `<span class="mono">${UI.money(p.rent)}</span><span class="cell-sub">/mo</span>`;
  }

  function baseColumns() {
    return [
      { label: t('property'), key: 'id', plain: p => p.id,
        render: p => `<div class="cell-main">${p.id}</div><div class="cell-sub">${t(p.type)} · ${p.bedrooms} ${UI.icon('bed')} · ${p.area}m²</div>` },
      { label: t('location'), key: 'city', plain: p => p.district + ', ' + p.city,
        render: p => `<div>${UI.esc(p.district)}</div><div class="cell-sub">${UI.esc(p.city)}</div>` },
      { label: t('purpose'), key: 'purpose', render: p => `<span class="chip">${t(p.purpose)}</span>`, plain: p => t(p.purpose) },
      { label: t('price'), key: 'salePrice', align: 'end', render: priceCell, plain: p => p.purpose === 'sale' ? p.salePrice : p.rent },
      { label: t('agent'), key: 'agent', render: p => UI.esc(p.agent) },
      { label: t('status'), key: 'status', align: 'end', render: p => UI.badge(p.status), plain: p => t(p.status) },
    ];
  }

  function formFields(rec) {
    return `${UI.field(t('type'), 'type', rec.type, { type: 'select', options: UI.PTYPE_OPTIONS(), required: true })}
      ${UI.field(t('purpose'), 'purpose', rec.purpose, { type: 'select', options: [{ value: 'sale', label: t('sale') }, { value: 'rent', label: t('rent') }], required: true })}
      <div class="form-grid">
        ${UI.field(t('city'), 'city', rec.city, { type: 'select', options: UI.CITIES(), required: true })}
        ${UI.field(t('area') + ' (district)', 'district', rec.district, { placeholder: t('cf_select') })}
        ${UI.field(t('area') + ' (m²)', 'area', rec.area, { type: 'number', required: true })}
        ${UI.field(t('bedrooms'), 'bedrooms', rec.bedrooms, { type: 'number' })}
        ${UI.field(t('bathrooms'), 'bathrooms', rec.bathrooms, { type: 'number' })}
        ${UI.field(t('status'), 'status', rec.status, { type: 'select', options: [
          { value: 'available', label: t('available') }, { value: 'reserved', label: t('reserved') },
          { value: 'sold', label: t('sold') }, { value: 'rented', label: t('rented') }, { value: 'archived', label: t('archived') } ] })}
        ${UI.field(t('sale_price'), 'salePrice', rec.salePrice, { type: 'number' })}
        ${UI.field(t('monthly_rent'), 'rent', rec.rent, { type: 'number' })}
        ${UI.field(t('deposit'), 'deposit', rec.deposit, { type: 'number' })}
        ${UI.field(t('commission'), 'commission', rec.commission, { type: 'number' })}
        ${UI.field(t('owner'), 'owner', rec.owner)}
        ${UI.field(t('agent'), 'agent', rec.agent, { type: 'select', options: UI.AGENT_OPTIONS() })}
      </div>
      ${UI.field(t('description'), 'description', rec.description, { type: 'textarea', full: true })}`;
  }

  function toRecord(fd, existing) {
    return {
      ...existing,
      id: existing.id, type: fd.type, purpose: fd.purpose, city: fd.city, district: fd.district,
      area: +fd.area, bedrooms: +fd.bedrooms, bathrooms: +fd.bathrooms, status: fd.status,
      salePrice: +fd.salePrice || 0, rent: +fd.rent || 0, deposit: +fd.deposit || 0, commission: +fd.commission || 0,
      owner: fd.owner, agent: fd.agent, description: fd.description,
      gallery: existing.gallery || [DB.meta.IMGS[0] + '?auto=format&fit=crop&w=600&q=60'],
      lat: existing.lat || '36.19', lng: existing.lng || '43.99',
    };
  }

  function detail(p, onEdit) {
    let tab = 'overview';
    const ov = UI.modal({ title: p.id + ' · ' + t(p.type), wide: true, body: renderBody(), footer:
      `<button class="btn" data-close>${t('close')}</button><button class="btn btn-primary" data-edit>${UI.icon('edit')}${t('edit')}</button>` });
    bind();

    function renderBody() {
      const tabs = ['overview', 'gallery', 'documents', 'history'];
      const tabsHtml = tabs.map(x => `<div class="tab ${tab === x ? 'active' : ''}" data-tab="${x}">${t(x)}</div>`).join('');
      let inner = '';
      if (tab === 'overview') {
        inner = `<div class="grid-2">
          <div>
            <div class="kv"><span class="k">${t('purpose')}</span><span class="v">${UI.badge(p.purpose === 'sale' ? 'sold' : 'rented', t(p.purpose))}</span></div>
            <div class="kv"><span class="k">${t('status')}</span><span class="v">${UI.badge(p.status)}</span></div>
            <div class="kv"><span class="k">${t('type')}</span><span class="v">${t(p.type)}</span></div>
            <div class="kv"><span class="k">${t('area')}</span><span class="v">${p.area} m²</span></div>
            <div class="kv"><span class="k">${t('bedrooms')} / ${t('bathrooms')}</span><span class="v">${p.bedrooms} / ${p.bathrooms}</span></div>
            <div class="kv"><span class="k">${t('location')}</span><span class="v">${UI.esc(p.district)}, ${UI.esc(p.city)}</span></div>
          </div>
          <div>
            <div class="kv"><span class="k">${t('sale_price')}</span><span class="v mono">${UI.money(p.salePrice)}</span></div>
            <div class="kv"><span class="k">${t('monthly_rent')}</span><span class="v mono">${UI.money(p.rent)}</span></div>
            <div class="kv"><span class="k">${t('deposit')}</span><span class="v mono">${UI.money(p.deposit)}</span></div>
            <div class="kv"><span class="k">${t('commission')}</span><span class="v mono">${UI.money(p.commission)}</span></div>
            <div class="kv"><span class="k">${t('owner')}</span><span class="v">${UI.esc(p.owner)}</span></div>
            <div class="kv"><span class="k">${t('agent')}</span><span class="v">${UI.esc(p.agent)}</span></div>
          </div>
        </div>
        <div class="divider"></div>
        <p style="color:var(--text-sub)">${UI.esc(p.description)}</p>
        <div class="divider"></div>
        <div class="chip">${UI.icon('pin')} GPS: ${p.lat}, ${p.lng}</div>
        <a class="chip" style="margin-inline-start:8px" href="https://www.google.com/maps?q=${p.lat},${p.lng}" target="_blank" rel="noopener">${UI.icon('map')} Google Maps ↗</a>`;
      } else if (tab === 'gallery') {
        inner = `<div class="gallery">${(p.gallery || []).map(g => `<div class="g-thumb" style="background-image:url('${g}')"></div>`).join('')}</div>`;
      } else if (tab === 'documents') {
        const docs = ['Title Deed.pdf', 'Floor Plan.pdf', 'Ownership Certificate.pdf'].slice(0, (p.docs || 0) + 1);
        inner = docs.length ? docs.map(d => `<div class="kv"><span class="k">${UI.icon('file')} ${d}</span><span class="v"><button class="btn btn-sm">${UI.icon('download')}</button></span></div>`).join('') : `<div class="empty-state">${UI.icon('file')}<div>${t('no_data')}</div></div>`;
      } else {
        inner = [
          { a: 'Listed', by: p.agent, d: p.createdAt },
          { a: 'Status updated to ' + t(p.status), by: p.agent, d: DB.daysFromNow(-5) },
          { a: 'Price adjusted', by: p.agent, d: DB.daysFromNow(-12) },
        ].map(h => `<div class="kv"><span class="k">${UI.icon('clock')} ${UI.esc(h.a)} · ${UI.esc(h.by)}</span><span class="v">${UI.fdate(h.d)}</span></div>`).join('');
      }
      return `<div class="tabs">${tabsHtml}</div><div data-tabbody>${inner}</div>`;
    }
    function bind() {
      ov.querySelectorAll('[data-tab]').forEach(el => el.addEventListener('click', () => { tab = el.getAttribute('data-tab'); ov.querySelector('.modal-body').innerHTML = renderBody(); bind(); }));
      const ed = ov.querySelector('[data-edit]'); if (ed) ed.addEventListener('click', () => { UI.close(); if (onEdit) onEdit(p); });
    }
  }

  function build(root, opts) {
    const filters = [
      { key: 'status', label: t('status'), options: ['available','reserved','sold','rented','archived'].map(v => ({ value: v, label: t(v) })) },
      { key: 'type', label: t('type'), options: UI.PTYPE_OPTIONS() },
      { key: 'city', label: t('city'), options: UI.CITIES() },
    ];
    const ctrl = VC.crudList(root, {
      coll: 'properties',
      title: opts.title, subtitle: opts.subtitle,
      addLabel: t('add_property'), editLabel: t('edit_property'),
      columns: baseColumns(),
      searchFields: ['id', 'district', 'city', 'owner', 'agent', 'type'],
      filters: opts.purpose ? filters.filter(f => f.key !== 'purpose') : filters,
      baseFilter: opts.baseFilter,
      defaults: () => ({ purpose: opts.purpose || 'sale', status: 'available', city: 'Erbil', type: 't_apartment', agent: UI.AGENT_OPTIONS()[0] }),
      formFields, toRecord,
      onView: (p) => detail(p, (rec) => ctrl.edit(rec)),
      wideForm: true,
    });
    return ctrl;
  }

  Views.properties = function (root) { build(root, { title: t('nav_properties'), subtitle: t('properties') }); };
  Views.for_sale = function (root) { build(root, { title: t('nav_for_sale'), subtitle: t('for_sale'), purpose: 'sale', baseFilter: p => p.purpose === 'sale' }); };
  Views.for_rent = function (root) { build(root, { title: t('nav_for_rent'), subtitle: t('for_rent'), purpose: 'rent', baseFilter: p => p.purpose === 'rent' }); };
})();
