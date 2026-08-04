/* ═══════════════════════════════════════════════════════════════
   Dashboard — KPI widgets, charts, recent lists.
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
  const rentalIncome = tenants.reduce((s, tn) => s + tn.paid, 0);
  const outstanding = tenants.reduce((s, tn) => s + tn.remaining, 0);

  const now = new Date();
  const monthRevenue = receipts.filter(r => {
    const d = new Date(r.date); return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).reduce((s, r) => s + r.amount, 0);

  // ---- KPI widgets ----
  const kpis = [
    ['total_properties', UI.num(props.length), 'building', 'ic-gold', { dir: 'up', text: '+4 this month' }],
    ['props_sale', UI.num(forSale.length), 'tag', 'ic-blue', null],
    ['props_rent', UI.num(forRent.length), 'key', 'ic-purple', null],
    ['requested_props', UI.num(requests.length), 'inbox', 'ic-amber', null],
    ['active_contracts', UI.num(activeContracts.length), 'file', 'ic-green', { dir: 'up', text: '+2' }],
    ['rental_income', UI.money(rentalIncome), 'coins', 'ic-green', { dir: 'up', text: '+8%' }],
    ['monthly_revenue', UI.money(monthRevenue), 'chart', 'ic-gold', { dir: 'up', text: '+12%' }],
    ['outstanding', UI.money(outstanding), 'wallet', 'ic-red', outstanding > 0 ? { dir: 'down', text: t('overdue') } : null],
  ];
  const kpiHtml = kpis.map(k => VC.stat(t(k[0]), k[1], k[2], k[3], k[4])).join('');

  // ---- Status distribution donut ----
  const statusCounts = {};
  props.forEach(p => statusCounts[p.status] = (statusCounts[p.status] || 0) + 1);
  const donutData = Object.keys(statusCounts).map(s => ({ label: t(s), value: statusCounts[s] }));

  // ---- Monthly sales & rentals (bars) ----
  const months = [];
  for (let i = 5; i >= 0; i--) { const d = new Date(); d.setMonth(d.getMonth() - i); months.push(d); }
  const mLabel = d => d.toLocaleDateString('en-US', { month: 'short' });
  const salesData = months.map(m => contracts.filter(c => c.kind === 'sales' && sameMonth(c.startDate, m)).length + rndSeed(m, 1, 4));
  const rentData = months.map(m => contracts.filter(c => c.kind === 'rental' && sameMonth(c.startDate, m)).length + rndSeed(m, 1, 3));
  const barSeries = { labels: months.map(mLabel), sets: [
    { name: t('sale'), color: UI.CHART_COLORS[0], data: salesData },
    { name: t('rent'), color: UI.CHART_COLORS[1], data: rentData },
  ] };

  // ---- Revenue vs Expenses (line) ----
  const expenses = DB.all('expenses');
  const revSeries = { labels: months.map(mLabel), sets: [
    { name: t('revenue'), color: UI.CHART_COLORS[2], data: months.map(m => receipts.filter(r => sameMonth(r.date, m)).reduce((s, r) => s + r.amount, 0)) },
    { name: t('expenses'), color: UI.CHART_COLORS[4], data: months.map(m => expenses.filter(e => sameMonth(e.date, m)).reduce((s, e) => s + e.amount, 0)) },
  ] };

  // ---- Recent lists ----
  const latestProps = props.slice().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);
  const recentTx = receipts.slice().sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);
  const upcomingRent = tenants.filter(tn => tn.remaining > 0).sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate)).slice(0, 5);
  const recentClients = customers.slice().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);

  root.innerHTML = VC.pageHead(t('nav_dashboard'), DB.load().settings.company + ' · ' + new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }))
    + `<div class="stat-grid">${kpiHtml}</div>
    <div class="grid-12" style="margin-bottom:18px">
      <div class="card"><div class="card-head"><h3>${t('sales_rental_stats')}</h3></div><div class="card-pad">${UI.bars(barSeries)}</div></div>
      <div class="card"><div class="card-head"><h3>${t('status_distribution')}</h3></div><div class="card-pad">${UI.donut(donutData, { center: props.length, centerLabel: t('properties') })}</div></div>
    </div>
    <div class="card" style="margin-bottom:18px"><div class="card-head"><h3>${t('revenue_expenses')}</h3></div><div class="card-pad">${UI.line(revSeries, { money: true })}</div></div>
    <div class="grid-2" style="margin-bottom:18px">
      <div class="card"><div class="card-head"><h3>${t('latest_properties')}</h3></div>
        ${UI.table({ columns: [
          { label: t('property'), render: p => `<div class="cell-main">${p.id}</div><div class="cell-sub">${t(p.type)} · ${p.district}</div>` },
          { label: t('purpose'), render: p => UI.badge(p.purpose === 'sale' ? 'sold' : 'rented', t(p.purpose)) },
          { label: t('price'), align: 'end', render: p => `<span class="mono">${UI.money(p.purpose === 'sale' ? p.salePrice : p.rent)}</span>` },
          { label: t('status'), align: 'end', render: p => UI.badge(p.status) },
        ], rows: latestProps })}
      </div>
      <div class="card"><div class="card-head"><h3>${t('recent_transactions')}</h3></div>
        ${UI.table({ columns: [
          { label: t('invoice_no'), render: r => `<div class="cell-main">${r.invoice}</div><div class="cell-sub">${r.customer}</div>` },
          { label: t('method'), render: r => `<span class="chip">${t(r.method)}</span>` },
          { label: t('date'), render: r => UI.fdate(r.date) },
          { label: t('amount'), align: 'end', render: r => `<span class="mono" style="color:var(--success)">${UI.money(r.amount)}</span>` },
        ], rows: recentTx })}
      </div>
    </div>
    <div class="grid-2">
      <div class="card"><div class="card-head"><h3>${t('upcoming_rent')}</h3></div>
        ${UI.table({ columns: [
          { label: t('tenant'), render: tn => `<div class="cell-main">${UI.esc(tn.name)}</div><div class="cell-sub">${UI.esc(tn.propertyLabel)}</div>` },
          { label: t('due_date'), render: tn => UI.fdate(tn.dueDate) },
          { label: t('remaining'), align: 'end', render: tn => `<span class="mono" style="color:var(--warning)">${UI.money(tn.remaining)}</span>` },
        ], rows: upcomingRent, empty: t('no_data') })}
      </div>
      <div class="card"><div class="card-head"><h3>${t('recent_clients')}</h3></div>
        ${UI.table({ columns: [
          { label: t('name'), render: c => `<div class="with-avatar"><span class="avatar">${UI.initials(c.name)}</span><div><div class="cell-main">${UI.esc(c.name)}</div><div class="cell-sub">${UI.esc(c.phone)}</div></div></div>` },
          { label: t('role'), align: 'end', render: c => `<span class="chip">${t(c.role + 's') || c.role}</span>` },
        ], rows: recentClients })}
      </div>
    </div>`;

  function sameMonth(dateStr, d) { const x = new Date(dateStr); return x.getMonth() === d.getMonth() && x.getFullYear() === d.getFullYear(); }
  function rndSeed(d, a, b) { const s = (d.getMonth() * 7 + 3) % (b - a + 1); return a + s; }
};
