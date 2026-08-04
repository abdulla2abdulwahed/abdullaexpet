/* ═══════════════════════════════════════════════════════════════
   Reports & Analytics — Financial, Property, Tenant, Agent.
═══════════════════════════════════════════════════════════════ */
Views.reports = function (root) {
  const t = k => I18N.t(k);
  let tab = 'financial';

  root.innerHTML = VC.pageHead(t('nav_reports'), t('reports'),
    `<button class="btn" id="rp-print">${UI.icon('printer')}${t('print')}</button>`);
  const tabsEl = document.createElement('div');
  tabsEl.className = 'tabs';
  const TABS = [['financial', t('financial_reports')], ['property', t('property_reports')], ['tenant', t('tenant_reports')], ['agent', t('agent_reports')]];
  tabsEl.innerHTML = TABS.map(x => `<div class="tab ${tab === x[0] ? 'active' : ''}" data-tab="${x[0]}">${x[1]}</div>`).join('');
  const bodyEl = document.createElement('div');
  root.appendChild(tabsEl); root.appendChild(bodyEl);
  tabsEl.addEventListener('click', e => { const el = e.target.closest('[data-tab]'); if (!el) return; tab = el.getAttribute('data-tab'); tabsEl.querySelectorAll('.tab').forEach(x => x.classList.toggle('active', x === el)); paint(); });
  document.getElementById('rp-print').addEventListener('click', () => window.print());

  const months = []; for (let i = 5; i >= 0; i--) { const d = new Date(); d.setMonth(d.getMonth() - i); months.push(d); }
  const mLabel = d => d.toLocaleDateString('en-US', { month: 'short' });
  const sameMonth = (s, d) => { const x = new Date(s); return x.getMonth() === d.getMonth() && x.getFullYear() === d.getFullYear(); };

  function stat(l, v, ic, cls) { return VC.stat(l, v, ic, cls); }

  function paint() {
    if (tab === 'financial') paintFinancial();
    else if (tab === 'property') paintProperty();
    else if (tab === 'tenant') paintTenant();
    else paintAgent();
  }

  function paintFinancial() {
    const receipts = DB.all('receipts'), expenses = DB.all('expenses'), payments = DB.all('payments');
    const revenue = receipts.reduce((s, r) => s + r.amount, 0);
    const expTotal = expenses.reduce((s, e) => s + e.amount, 0) + payments.reduce((s, p) => s + p.amount, 0);
    const profit = revenue - expTotal;
    const commission = DB.all('contracts').reduce((s, c) => s + (c.commission || 0), 0);
    const series = { labels: months.map(mLabel), sets: [
      { name: t('revenue'), color: UI.CHART_COLORS[2], data: months.map(m => receipts.filter(r => sameMonth(r.date, m)).reduce((s, r) => s + r.amount, 0)) },
      { name: t('expenses'), color: UI.CHART_COLORS[4], data: months.map(m => expenses.filter(e => sameMonth(e.date, m)).reduce((s, e) => s + e.amount, 0)) },
    ] };
    bodyEl.innerHTML = `<div class="stat-grid">
        ${stat(t('revenue'), UI.money(revenue), 'coins', 'ic-green')}
        ${stat(t('expenses'), UI.money(expTotal), 'wallet', 'ic-red')}
        ${stat(t('net_profit'), UI.money(profit), 'chart', profit >= 0 ? 'ic-gold' : 'ic-red')}
        ${stat(t('commission'), UI.money(commission), 'money', 'ic-blue')}
      </div>
      <div class="card" style="margin-bottom:18px"><div class="card-head"><h3>${t('cash_flow')} — ${t('revenue')} vs ${t('expenses')}</h3></div><div class="card-pad">${UI.line(series, { money: true })}</div></div>
      <div class="card"><div class="card-head"><h3>${t('profit_loss')}</h3></div><div class="card-pad">
        <div class="kv"><span class="k">${t('revenue')}</span><span class="v mono" style="color:var(--success)">${UI.money(revenue)}</span></div>
        <div class="kv"><span class="k">${t('expenses')}</span><span class="v mono" style="color:var(--danger)">-${UI.money(expTotal)}</span></div>
        <div class="kv" style="font-size:16px"><span class="k">${t('net_profit')}</span><span class="v mono">${UI.money(profit)}</span></div>
      </div></div>`;
  }

  function paintProperty() {
    const props = DB.all('properties');
    const sold = props.filter(p => p.status === 'sold'), rented = props.filter(p => p.status === 'rented');
    const available = props.filter(p => p.status === 'available');
    const rentables = props.filter(p => p.purpose === 'rent' && p.status !== 'archived');
    const occ = rentables.length ? Math.round((rented.length / rentables.length) * 100) : 0;
    const byType = {}; props.forEach(p => byType[p.type] = (byType[p.type] || 0) + 1);
    const donutData = Object.keys(byType).map(k => ({ label: t(k), value: byType[k] }));
    bodyEl.innerHTML = `<div class="stat-grid">
        ${stat(t('sold'), UI.num(sold.length), 'tag', 'ic-blue')}
        ${stat(t('rented'), UI.num(rented.length), 'key', 'ic-purple')}
        ${stat(t('available'), UI.num(available.length), 'building', 'ic-green')}
        ${stat(t('occupancy'), occ + '%', 'chart', 'ic-gold')}
      </div>
      <div class="grid-12">
        <div class="card"><div class="card-head"><h3>${t('property_reports')} · ${t('type')}</h3></div>
          ${UI.table({ columns: [
            { label: t('type'), render: r => t(r.k) }, { label: t('total'), align: 'end', render: r => r.v },
            { label: '%', align: 'end', render: r => Math.round((r.v / props.length) * 100) + '%' },
          ], rows: Object.keys(byType).map(k => ({ k, v: byType[k] })).sort((a, b) => b.v - a.v) })}
        </div>
        <div class="card"><div class="card-head"><h3>${t('status_distribution')}</h3></div><div class="card-pad">${UI.donut(donutData, { center: props.length, centerLabel: t('properties') })}</div></div>
      </div>`;
  }

  function paintTenant() {
    const tenants = DB.all('tenants');
    const active = tenants.filter(tn => tn.status !== 'expired');
    const late = tenants.filter(tn => tn.status === 'overdue');
    const collected = tenants.reduce((s, tn) => s + tn.paid, 0);
    const expired = DB.all('contracts').filter(c => c.kind === 'rental' && c.status === 'expired');
    bodyEl.innerHTML = `<div class="stat-grid">
        ${stat(t('active'), UI.num(active.length), 'users', 'ic-green')}
        ${stat(t('overdue'), UI.num(late.length), 'warning', 'ic-red')}
        ${stat(t('expired'), UI.num(expired.length), 'file', 'ic-amber')}
        ${stat(t('rent_collection'), UI.money(collected), 'coins', 'ic-gold')}
      </div>
      <div class="card"><div class="card-head"><h3>${t('tenant_reports')} · ${t('overdue')}</h3></div>
        ${UI.table({ columns: [
          { label: t('tenant'), render: tn => UI.esc(tn.name) }, { label: t('current_property'), render: tn => UI.esc(tn.propertyLabel) },
          { label: t('due_date'), render: tn => UI.fdate(tn.dueDate) }, { label: t('remaining'), align: 'end', render: tn => `<span class="mono" style="color:var(--warning)">${UI.money(tn.remaining)}</span>` },
        ], rows: late, empty: t('no_data') })}
      </div>`;
  }

  function paintAgent() {
    const agents = DB.all('users').filter(u => ['sales_agent', 'rental_agent', 'manager'].includes(u.role));
    const contracts = DB.all('contracts'), props = DB.all('properties');
    const rows = agents.map(a => {
      const sales = contracts.filter(c => c.agent === a.name && c.kind === 'sales');
      const rentals = contracts.filter(c => c.agent === a.name && c.kind === 'rental');
      const listings = props.filter(p => p.agent === a.name);
      const commission = contracts.filter(c => c.agent === a.name).reduce((s, c) => s + (c.commission || 0), 0);
      return { name: a.name, sales: sales.length, rentals: rentals.length, listings: listings.length, commission };
    }).sort((a, b) => b.commission - a.commission);
    const series = { labels: rows.map(r => r.name.split(' ')[0]), sets: [
      { name: t('sale'), color: UI.CHART_COLORS[0], data: rows.map(r => r.sales) },
      { name: t('rent'), color: UI.CHART_COLORS[1], data: rows.map(r => r.rentals) },
    ] };
    bodyEl.innerHTML = `<div class="card" style="margin-bottom:18px"><div class="card-head"><h3>${t('agent_reports')} · ${t('sale')} & ${t('rent')}</h3></div><div class="card-pad">${UI.bars(series)}</div></div>
      <div class="card"><div class="card-head"><h3>${t('commission')}</h3></div>
        ${UI.table({ columns: [
          { label: t('agent'), render: r => `<div class="with-avatar"><span class="avatar">${UI.initials(r.name)}</span>${UI.esc(r.name)}</div>` },
          { label: t('properties'), align: 'end', render: r => r.listings },
          { label: t('sale'), align: 'end', render: r => r.sales },
          { label: t('rent'), align: 'end', render: r => r.rentals },
          { label: t('commission'), align: 'end', render: r => `<span class="mono" style="color:var(--gold)">${UI.money(r.commission)}</span>` },
        ], rows })}
      </div>`;
  }

  paint();
};
