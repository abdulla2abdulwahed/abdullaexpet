/* ═══════════════════════════════════════════════════════════════
   Dashboard — KPI widgets, quick actions, charts, recent lists.
   Layout matches the Tablo design mockup.
═══════════════════════════════════════════════════════════════ */
Views.dashboard = function (root) {
  const t = k => I18N.t(k);
  const props = DB.all('properties');
  const contracts = DB.all('contracts');
  const receipts = DB.all('receipts');
  const tenants = DB.all('tenants');
  const customers = DB.all('customers');
  const requests = DB.all('requests');

  const forSale = props.filter(p => p.purpose === 'sale' && p.status !== 'archived');
  const forRent = props.filter(p => p.purpose === 'rent' && p.status !== 'archived');
  const activeContracts = contracts.filter(c => c.status === 'active' || c.status === 'signed');
  const now = new Date();
  const sameMonth = (dateStr, d) => { const x = new Date(dateStr); return x.getMonth() === d.getMonth() && x.getFullYear() === d.getFullYear(); };
  const monthRevenue = receipts.filter(r => sameMonth(r.date, now)).reduce((s, r) => s + r.amount, 0);

  // ---- KPI widgets (6, matching mockup) ----
  const kpis = [
    ['total_properties', UI.num(props.length), 'building', 'ic-navy', { dir: 'up', text: '+4' }],
    ['props_sale', UI.num(forSale.length), 'tag', 'ic-green', null],
    ['props_rent', UI.num(forRent.length), 'key', 'ic-teal', null],
    ['requested_props', UI.num(requests.length), 'inbox', 'ic-orange', null],
    ['active_contracts', UI.num(activeContracts.length), 'file', 'ic-blue', { dir: 'up', text: '+2' }],
    ['monthly_revenue', UI.moneyShort(monthRevenue), 'wallet', 'ic-gold', { dir: 'up', text: '+12%' }],
  ];
  const kpiHtml = kpis.map(k => `<div class="stat">
      <div class="st-body"><div class="lbl">${t(k[0])}</div><div class="val mono">${k[1]}</div>
      ${k[4] ? `<div class="trend ${k[4].dir}">${UI.icon('trendUp')} ${UI.esc(k[4].text)}</div>` : ''}</div>
      <div class="ic ${k[3]}">${UI.icon(k[2])}</div>
    </div>`).join('');

  // ---- Quick actions ----
  const actions = [
    ['add_property', 'home', 'ic-green', 'for_sale'],
    ['new_request', 'user', 'ic-orange', 'requests'],
    ['new_contract', 'file', 'ic-blue', 'contracts'],
    ['new_receipt', 'coins', 'ic-teal', 'receipts'],
    ['new_payment', 'wallet', 'ic-red', 'payments'],
    ['nav_reports', 'chart', 'ic-gold', 'reports'],
  ];
  const qaHtml = actions.map(a => `<div class="qa" data-go="${a[3]}">
      <div class="qa-ic ${a[2]}">${UI.icon(a[1])}</div><div class="qa-label">${t(a[0])}</div></div>`).join('');

  // ---- Trend area chart (sales vs rentals over recent weeks) ----
  const weeks = 8, wl = [];
  for (let i = 1; i <= weeks; i++) wl.push('W' + i);
  const wobble = (base, amp, i) => Math.max(0, Math.round(base + amp * Math.sin(i * 1.1) + amp * 0.4 * Math.cos(i * 2.3)));
  const salesSeries = wl.map((_, i) => wobble(48, 26, i + 1));
  const rentSeries = wl.map((_, i) => wobble(56, 22, i + 3));
  const trend = { labels: wl, sets: [
    { name: t('sale'), color: UI.CHART_COLORS[0], data: salesSeries },
    { name: t('rent'), color: '#1e2a3d', data: rentSeries },
  ] };

  // ---- Property composition donut (by type) ----
  const byType = {}; props.forEach(p => byType[p.type] = (byType[p.type] || 0) + 1);
  const compEntries = Object.keys(byType).map(k => ({ type: k, value: byType[k] })).sort((a, b) => b.value - a.value);
  const top = compEntries.slice(0, 5);
  const otherVal = compEntries.slice(5).reduce((s, e) => s + e.value, 0);
  const compData = top.map((e, i) => ({ label: t(e.type), value: e.value, color: UI.CHART_COLORS[i % UI.CHART_COLORS.length] }));
  if (otherVal) {
    const existing = compData.find(d => d.label === t('t_other'));
    if (existing) existing.value += otherVal; // avoid duplicate "Other" in legend
    else compData.push({ label: t('t_other'), value: otherVal, color: '#9aa3b0' });
  }
  const compTotal = props.length || 1;
  const legendRows = compData.map(d => `<div class="lr"><i style="background:${d.color}"></i>
      <span class="lr-name">${UI.esc(d.label)}</span><span class="lr-val">${Math.round((d.value / compTotal) * 100)}%</span></div>`).join('');

  // ---- Recent lists ----
  const latestProps = props.slice().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 3);
  const recentTx = receipts.slice().sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);
  const reminders = DB.all('notifications').slice(0, 4);
  const reminderIcon = { contract: ['file', 'ic-blue'], rent: ['warning', 'ic-red'], property: ['calendar', 'ic-green'], payment: ['coins', 'ic-teal'], request: ['inbox', 'ic-orange'] };

  root.innerHTML = VC.pageHead(t('nav_dashboard'), DB.load().settings.company + ' · ' + new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }))
    + `<div class="stat-grid kpi-grid">${kpiHtml}</div>

    <div class="grid-12" style="margin-bottom:20px">
      <div class="card"><div class="card-head"><h3>${t('sales_rental_stats')}</h3></div><div class="card-pad">${UI.line(trend)}</div></div>
      <div class="card"><div class="card-head"><h3>${t('status_distribution')}</h3></div>
        <div class="card-pad" style="display:flex;align-items:center;gap:18px;flex-wrap:wrap">
          <div class="legend-rows" style="flex:1;min-width:150px">${legendRows}</div>
          <div style="flex:0 0 160px">${UI.donut(compData, { center: props.length, centerLabel: t('properties'), hideLegend: true })}</div>
        </div>
      </div>
    </div>

    <div style="margin-bottom:20px">
      <div class="nav-group-label" style="color:var(--text-muted);padding:0 2px 10px">${t('quick_actions')}</div>
      <div class="quick-actions">${qaHtml}</div>
    </div>

    <div class="grid-3">
      <div class="card"><div class="card-head"><h3>${t('latest_properties')}</h3><span class="card-link" data-go="properties">${t('view_all')} →</span></div>
        <div class="card-pad" style="display:flex;flex-direction:column;gap:14px">
          ${latestProps.map(p => `<div style="display:flex;gap:12px;align-items:center">
            <div class="g-thumb" style="width:56px;height:44px;flex:0 0 56px;border-radius:9px;${p.gallery && p.gallery[0] ? `background-image:url('${p.gallery[0]}')` : ''}"></div>
            <div style="flex:1;min-width:0"><div class="cell-main">${t(p.type)} · ${t(p.purpose)}</div>
              <div class="cell-sub">${UI.icon('pin')} ${UI.esc(p.district)} · ${p.area} m² · ${p.id}</div></div>
            <div class="mono" style="font-weight:700;white-space:nowrap">${UI.money(p.purpose === 'sale' ? p.salePrice : p.rent)}</div>
          </div>`).join('')}
        </div>
      </div>

      <div class="card"><div class="card-head"><h3>${t('recent_transactions')}</h3><span class="card-link" data-go="receipts">${t('view_all')} →</span></div>
        <div class="card-pad" style="display:flex;flex-direction:column;gap:2px">
          ${recentTx.map(r => `<div class="kv"><span class="k">${UI.esc(r.forItem)}<div class="cell-sub">${UI.fdate(r.date)}</div></span>
            <span class="v mono" style="color:var(--success)">+ ${UI.money(r.amount)}</span></div>`).join('')}
        </div>
      </div>

      <div class="card"><div class="card-head"><h3>${t('reminders')}</h3><span class="card-link" data-go="settings">${t('view_all')} →</span></div>
        <div class="card-pad">
          ${reminders.map(n => { const ic = reminderIcon[n.type] || ['bell', 'ic-gold']; return `<div class="reminder-row">
            <div class="r-ic ${ic[1]}">${UI.icon(ic[0])}</div>
            <div class="r-body"><div class="r-title">${UI.esc(n.title)}</div><div class="r-time">${UI.fdate(n.time)}</div></div></div>`; }).join('')}
        </div>
      </div>
    </div>`;

  root.querySelectorAll('[data-go]').forEach(el => el.addEventListener('click', () => App.navigate(el.getAttribute('data-go'))));
};
