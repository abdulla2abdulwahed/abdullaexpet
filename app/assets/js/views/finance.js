/* ═══════════════════════════════════════════════════════════════
   Finance — Receipts, Payments, Security Deposits, Expenses.
═══════════════════════════════════════════════════════════════ */
(function () {
  const t = k => I18N.t(k);
  const methodOpts = () => [{ value: 'cash', label: t('cash') }, { value: 'bank', label: t('bank') }, { value: 'card', label: t('card') }, { value: 'online', label: t('online') }];

  function summaryBar(items) {
    return `<div class="stat-grid">${items.map(i => VC.stat(i.label, i.value, i.icon, i.cls)).join('')}</div>`;
  }

  /* ---- Receipts (incoming) ---- */
  Views.receipts = function (root) {
    const list = DB.all('receipts');
    const total = list.reduce((s, r) => s + r.amount, 0);
    const head = document.createElement('div');
    head.innerHTML = summaryBar([
      { label: t('receipts'), value: UI.num(list.length), icon: 'receipt', cls: 'ic-green' },
      { label: t('total'), value: UI.money(total), icon: 'coins', cls: 'ic-gold' },
      { label: t('monthly_revenue'), value: UI.money(list.filter(r => new Date(r.date).getMonth() === new Date().getMonth()).reduce((s, r) => s + r.amount, 0)), icon: 'chart', cls: 'ic-blue' },
    ]);
    root.innerHTML = ''; const body = document.createElement('div');
    VC.crudList(body, {
      coll: 'receipts', title: t('nav_receipts'), subtitle: t('receipts'), addLabel: t('new_receipt'),
      columns: [
        { label: t('invoice_no'), key: 'invoice', render: r => `<div class="cell-main">${r.invoice}</div><div class="cell-sub">${UI.esc(r.forItem)}</div>` },
        { label: t('client'), key: 'customer', render: r => UI.esc(r.customer) },
        { label: t('method'), key: 'method', render: r => `<span class="chip">${t(r.method)}</span>`, plain: r => t(r.method) },
        { label: t('date'), key: 'date', render: r => UI.fdate(r.date) },
        { label: t('amount'), key: 'amount', align: 'end', render: r => `<span class="mono" style="color:var(--success)">${UI.money(r.amount)}</span>` },
      ],
      searchFields: ['invoice', 'customer', 'forItem'],
      filters: [{ key: 'method', options: methodOpts() }],
      defaults: () => ({ invoice: 'INV-' + DB.uid('').slice(0, 4).toUpperCase(), method: 'cash', date: DB.daysFromNow(0), status: 'paid', forItem: 'Rent Payment' }),
      formFields: rec => `<div class="form-grid">
          ${UI.field(t('invoice_no'), 'invoice', rec.invoice, { required: true })}
          ${UI.field(t('client'), 'customer', rec.customer, { required: true })}
          ${UI.field(t('amount'), 'amount', rec.amount, { type: 'number', required: true })}
          ${UI.field(t('method'), 'method', rec.method, { type: 'select', options: methodOpts() })}
          ${UI.field(t('date'), 'date', rec.date, { type: 'date' })}
          ${UI.field(t('details'), 'forItem', rec.forItem, { type: 'select', options: ['Rent Payment', 'Sale Deposit', 'Commission', 'Booking Fee'] })}
        </div>`,
      toRecord: (fd, ex) => ({ ...ex, invoice: fd.invoice, customer: fd.customer, amount: +fd.amount, method: fd.method, date: fd.date, forItem: fd.forItem, status: 'paid' }),
      onView: r => printReceipt(r),
    });
    root.appendChild(head); root.appendChild(body);
  };

  /* ---- Number to words (English) for the receipt ---- */
  function toWords(n) {
    n = Math.round(n || 0);
    if (n === 0) return 'Zero';
    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    function three(num) {
      let s = ''; const h = Math.floor(num / 100), r = num % 100;
      if (h) s += ones[h] + ' Hundred' + (r ? ' ' : '');
      if (r < 20) s += ones[r];
      else { s += tens[Math.floor(r / 10)]; if (r % 10) s += '-' + ones[r % 10]; }
      return s;
    }
    const units = ['', 'Thousand', 'Million', 'Billion'];
    let words = '', i = 0;
    while (n > 0) { const chunk = n % 1000; if (chunk) words = three(chunk) + (units[i] ? ' ' + units[i] : '') + (words ? ' ' + words : ''); n = Math.floor(n / 1000); i++; }
    return words.trim();
  }
  function amountWords(amount, currency) {
    const w = { USD: 'US Dollars', IQD: 'Iraqi Dinars', EUR: 'Euros' }[currency] || (currency || '');
    return toWords(amount) + ' ' + w + ' Only';
  }

  function receiptCopy(r, s) {
    const cur = s.currency || 'IQD';
    const dt = new Date(r.date);
    const stamp = dt.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-')
      + ' – ' + dt.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    const field = (en, ku, val) => `<div class="rf"><span class="rf-ku">${ku}:</span><span class="rf-val">${val}</span><span class="rf-en">${en}:</span></div>`;
    return `<div class="rcpt" dir="rtl">
      <div class="rcpt-head">
        <div class="rcpt-company">
          <div class="rc-ku">کۆمپانیای تابلۆ بۆ خانووبەرە</div>
          <div class="rc-ar">شركة تابلو العقارية</div>
          <div class="rc-en">${UI.esc(s.company)}</div>
        </div>
        <div class="rcpt-logo">${UI.logo()}</div>
      </div>
      <div class="rcpt-rule"></div>
      <div class="rcpt-meta">
        <span>پسوولە # ${UI.esc(r.invoice)}</span>
        <span class="rcpt-title">پسوولەی پارەوەرگرتن${r.forItem ? ' (' + UI.esc(r.forItem) + ')' : ''}<br><small>Receipt of Payment</small></span>
        <span>بەروار / Date: ${stamp}</span>
      </div>
      <div class="rcpt-fields">
        ${field('Receipt from', 'وەرگری لە', UI.esc(r.customer))}
        ${field('Amount', 'بڕی پارە و قەدرە', '<b>' + UI.money(r.amount) + '</b> — ' + amountWords(r.amount, cur))}
        ${field('For', 'لە بری', UI.esc(r.forItem || '—'))}
        ${field('Receptor', 'وەرگر / الدافع', UI.esc(App.currentUser().name))}
        ${field('Note', 'تێبینی / الملاحظات', UI.esc(r.note || '—'))}
      </div>
      <div class="rcpt-sign">
        <div><div class="rs-line"></div>واژووی پێکخەر<br><small>Prepared by</small></div>
        <div><div class="rs-line"></div>وەرگر واژوو<br><small>Receiver</small></div>
        <div><div class="rs-line"></div>کۆمپانیای عقاراتی تابلۆ<br><small>Tablo Real Estate</small></div>
      </div>
    </div>`;
  }

  function printReceipt(r) {
    const s = DB.load().settings;
    // two copies per page (office + customer), matching the reference
    const body = `<div class="print-doc" id="print-area">${receiptCopy(r, s)}${receiptCopy(r, s)}</div>`;
    UI.modal({ title: r.invoice, wide: true, body,
      footer: `<button class="btn" data-close>${t('close')}</button><button class="btn btn-primary no-print" data-print>${UI.icon('printer')}${t('print')}</button>`,
      onOpen(ov) { ov.querySelector('[data-print]').addEventListener('click', () => window.print()); } });
  }

  /* ---- Payments (outgoing) ---- */
  Views.payments = function (root) {
    const list = DB.all('payments');
    const head = document.createElement('div');
    head.innerHTML = summaryBar([
      { label: t('payments'), value: UI.num(list.length), icon: 'wallet', cls: 'ic-red' },
      { label: t('total'), value: UI.money(list.reduce((s, p) => s + p.amount, 0)), icon: 'coins', cls: 'ic-amber' },
    ]);
    root.innerHTML = ''; const body = document.createElement('div');
    const catOpts = [{ value: 'vendor', label: 'Vendor' }, { value: 'salary', label: 'Salary' }, { value: 'maintenance', label: 'Maintenance' }, { value: 'utility', label: 'Utility Bills' }, { value: 'tax', label: 'Taxes' }, { value: 'office', label: 'Office Expenses' }];
    VC.crudList(body, {
      coll: 'payments', title: t('nav_payments'), subtitle: t('payments'), addLabel: t('new_payment'),
      columns: [
        { label: t('vendor'), key: 'vendor', render: p => `<div class="cell-main">${UI.esc(p.vendor)}</div>` },
        { label: t('category'), key: 'category', render: p => `<span class="chip">${UI.esc((catOpts.find(c => c.value === p.category) || {}).label || p.category)}</span>`, plain: p => p.category },
        { label: t('method'), key: 'method', render: p => t(p.method) },
        { label: t('date'), key: 'date', render: p => UI.fdate(p.date) },
        { label: t('amount'), key: 'amount', align: 'end', render: p => `<span class="mono" style="color:var(--danger)">-${UI.money(p.amount)}</span>` },
      ],
      searchFields: ['vendor', 'category'],
      filters: [{ key: 'category', options: catOpts }],
      defaults: () => ({ method: 'bank', date: DB.daysFromNow(0), category: 'vendor' }),
      formFields: rec => `<div class="form-grid">
          ${UI.field(t('vendor'), 'vendor', rec.vendor, { required: true })}
          ${UI.field(t('category'), 'category', rec.category, { type: 'select', options: catOpts })}
          ${UI.field(t('amount'), 'amount', rec.amount, { type: 'number', required: true })}
          ${UI.field(t('method'), 'method', rec.method, { type: 'select', options: methodOpts() })}
          ${UI.field(t('date'), 'date', rec.date, { type: 'date' })}
        </div>`,
      toRecord: (fd, ex) => ({ ...ex, vendor: fd.vendor, category: fd.category, amount: +fd.amount, method: fd.method, date: fd.date }),
    });
    root.appendChild(head); root.appendChild(body);
  };

  /* ---- Security Deposits ---- */
  Views.deposits = function (root) {
    const list = DB.all('deposits');
    const held = list.filter(d => d.status === 'held').reduce((s, d) => s + d.amount, 0);
    const head = document.createElement('div');
    head.innerHTML = summaryBar([
      { label: t('held'), value: UI.money(held), icon: 'lock', cls: 'ic-gold' },
      { label: t('deposits'), value: UI.num(list.length), icon: 'shield', cls: 'ic-blue' },
      { label: t('refunded'), value: UI.num(list.filter(d => d.status === 'refunded').length), icon: 'wallet', cls: 'ic-green' },
    ]);
    root.innerHTML = ''; const body = document.createElement('div');
    VC.crudList(body, {
      coll: 'deposits', title: t('nav_deposits'), subtitle: t('deposits'), canAdd: false, canEdit: false, canDelete: false,
      columns: [
        { label: t('contract'), key: 'contract', render: d => `<div class="cell-main">${d.contract}</div><div class="cell-sub">${UI.esc(d.tenant)}</div>` },
        { label: t('amount'), key: 'amount', align: 'end', render: d => `<span class="mono">${UI.money(d.amount)}</span>` },
        { label: t('date'), key: 'collectedAt', render: d => UI.fdate(d.collectedAt) },
        { label: t('status'), key: 'status', align: 'end', render: d => UI.badge(d.status) },
        { label: '', align: 'end', render: d => d.status === 'held' ? `<button class="btn btn-sm" data-refund="${d.id}">${t('refunded')}</button>` : '' },
      ],
      searchFields: ['contract', 'tenant'],
      filters: [{ key: 'status', options: [{ value: 'held', label: t('held') }, { value: 'refunded', label: t('refunded') }] }],
    });
    body.addEventListener('click', e => {
      const b = e.target.closest('[data-refund]'); if (!b) return;
      DB.upsert('deposits', { id: b.getAttribute('data-refund'), status: 'refunded', refundedAt: DB.daysFromNow(0) });
      UI.toast(t('refunded')); Views.deposits(root);
    });
    root.appendChild(head); root.appendChild(body);
  };

  /* ---- Expenses ---- */
  Views.expenses = function (root) {
    const list = DB.all('expenses');
    const cats = ['Office Rent', 'Employee Salaries', 'Marketing', 'Fuel', 'Utilities', 'Internet', 'Maintenance', 'Equipment', 'Miscellaneous'];
    const now = new Date();
    const monthly = list.filter(e => new Date(e.date).getMonth() === now.getMonth() && new Date(e.date).getFullYear() === now.getFullYear()).reduce((s, e) => s + e.amount, 0);
    const annual = list.filter(e => new Date(e.date).getFullYear() === now.getFullYear()).reduce((s, e) => s + e.amount, 0);
    // by category donut
    const byCat = {}; list.forEach(e => byCat[e.category] = (byCat[e.category] || 0) + e.amount);
    const donutData = Object.keys(byCat).map(c => ({ label: c, value: Math.round(byCat[c]) }));

    const head = document.createElement('div');
    head.innerHTML = summaryBar([
      { label: t('monthly_expenses'), value: UI.money(monthly), icon: 'wallet', cls: 'ic-red' },
      { label: t('annual_expenses'), value: UI.money(annual), icon: 'chart', cls: 'ic-amber' },
      { label: t('category'), value: UI.num(Object.keys(byCat).length), icon: 'grid', cls: 'ic-blue' },
    ]) + `<div class="card" style="margin-bottom:18px"><div class="card-head"><h3>${t('category')} · ${t('annual_expenses')}</h3></div><div class="card-pad">${UI.donut(donutData, { center: UI.money(annual).replace(/[^0-9kK.,$]/g, '') || annual, centerLabel: t('total') })}</div></div>`;
    root.innerHTML = ''; const body = document.createElement('div');
    VC.crudList(body, {
      coll: 'expenses', title: t('nav_expenses'), subtitle: t('expenses'), addLabel: t('add_expense'),
      columns: [
        { label: t('category'), key: 'category', render: e => `<span class="chip">${UI.esc(e.category)}</span>`, plain: e => e.category },
        { label: t('vendor'), key: 'vendor', render: e => UI.esc(e.vendor) },
        { label: t('date'), key: 'date', render: e => UI.fdate(e.date) },
        { label: t('amount'), key: 'amount', align: 'end', render: e => `<span class="mono" style="color:var(--danger)">-${UI.money(e.amount)}</span>` },
      ],
      searchFields: ['category', 'vendor'],
      filters: [{ key: 'category', options: cats }],
      defaults: () => ({ category: 'Miscellaneous', date: DB.daysFromNow(0) }),
      formFields: rec => `<div class="form-grid">
          ${UI.field(t('category'), 'category', rec.category, { type: 'select', options: cats })}
          ${UI.field(t('vendor'), 'vendor', rec.vendor)}
          ${UI.field(t('amount'), 'amount', rec.amount, { type: 'number', required: true })}
          ${UI.field(t('date'), 'date', rec.date, { type: 'date' })}
        </div>${UI.field(t('notes'), 'notes', rec.notes, { type: 'textarea', full: true })}`,
      toRecord: (fd, ex) => ({ ...ex, category: fd.category, vendor: fd.vendor, amount: +fd.amount, date: fd.date, notes: fd.notes }),
    });
    root.appendChild(head); root.appendChild(body);
  };
})();
