/* ═══════════════════════════════════════════════════════════════
   Dashboard — card layout matching the Tablo HERP reference:
   breadcrumb, shortcut cards, and blue info-box stat cards.
═══════════════════════════════════════════════════════════════ */
Views.dashboard = function (root) {
  const t = k => I18N.t(k);
  const props = DB.all('properties');
  const contracts = DB.all('contracts');

  const forSale = props.filter(p => p.purpose === 'sale' && p.status !== 'archived').length;
  const forRent = props.filter(p => p.purpose === 'rent' && p.status !== 'archived').length;
  const salesC = contracts.filter(c => c.kind === 'sales').length;
  const rentalC = contracts.filter(c => c.kind === 'rental').length;

  // ---- Shortcut cards (top row) ----
  const shortcuts = [
    { label: 'sales_contracts', icon: 'file', go: 'contracts|sales' },
    { label: 'rental_contracts', icon: 'file', go: 'contracts|rental' },
    { label: 'nav_receipts', icon: 'receipt', go: 'receipts' },
    { label: 'nav_customers', icon: 'user', go: 'customers' },
  ];

  // ---- Info-box stat cards ----
  const stats = [
    { label: 'nav_for_sale', icon: 'tag', value: forSale, go: 'for_sale' },
    { label: 'nav_for_rent', icon: 'key', value: forRent, go: 'for_rent' },
    { label: 'nav_requests', icon: 'inbox', value: DB.all('requests').length, go: 'requests' },
    { label: 'nav_customers', icon: 'user', value: DB.all('customers').length, go: 'customers' },
    { label: 'sales_contracts', icon: 'file', value: salesC, go: 'contracts|sales' },
    { label: 'rental_contracts', icon: 'file', value: rentalC, go: 'contracts|rental' },
    { label: 'nav_receipts', icon: 'receipt', value: DB.all('receipts').length, go: 'receipts' },
    { label: 'nav_tenants', icon: 'users', value: DB.all('tenants').length, go: 'tenants' },
  ];

  const shortcutHtml = shortcuts.map(c => `<div class="link-card" data-go="${c.go}">
      <div class="lc-label">${t(c.label)}</div>
      <div class="lc-icon">${UI.icon(c.icon)}</div>
    </div>`).join('');

  const statHtml = stats.map(s => `<div class="info-box" data-go="${s.go}">
      <div class="ib-top">
        <div class="ib-icon">${UI.icon(s.icon)}</div>
        <div class="ib-numwrap"><div class="ib-label">${t('count')}</div><div class="ib-number mono">${UI.num(s.value)}</div></div>
      </div>
      <div class="ib-title">${t(s.label)}</div>
    </div>`).join('');

  root.innerHTML = `
    <div class="breadcrumb">${UI.icon('home')}<span>${t('nav_dashboard')}</span><span class="bc-sep">›</span><span>${t('nav_dashboard')}</span></div>
    <div class="page-head">
      <div><h1>${t('nav_dashboard')}</h1><p>${t('welcome')}, ${UI.esc(App.currentUser().name)}</p></div>
    </div>
    <div class="link-cards">${shortcutHtml}</div>
    <div class="info-boxes">${statHtml}</div>`;

  root.querySelectorAll('[data-go]').forEach(el => el.addEventListener('click', () => App.navigate(el.getAttribute('data-go'))));
};
