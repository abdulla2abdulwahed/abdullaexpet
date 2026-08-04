/* ═══════════════════════════════════════════════════════════════
   DataStore — seed data + localStorage persistence.
   Simulates the Laravel/MySQL backend described in the spec.
═══════════════════════════════════════════════════════════════ */
window.DB = (function () {
  const KEY = 'tablo_erp_db_v1';
  const SEED_VERSION = 1;

  const CITIES = ['Erbil', 'Sulaymaniyah', 'Duhok', 'Kirkuk', 'Baghdad', 'Halabja'];
  const AREAS = ['Ankawa', 'Dream City', 'Italian Village', 'English Village', 'Downtown', 'Bakhtiari', 'Sarchnar', 'Naz City'];
  const IMGS = [
    'https://images.unsplash.com/photo-1560518883-ce09059eeffa',
    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750',
    'https://images.unsplash.com/photo-1613490493576-7fde63acd811',
    'https://images.unsplash.com/photo-1580587771525-78b9dba3b914',
    'https://images.unsplash.com/photo-1568605114967-8130f3a36994',
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9',
    'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c',
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c',
  ];
  const PTYPES = ['t_house','t_villa','t_apartment','t_building','t_farm','t_commercial','t_office','t_land','t_warehouse','t_factory','t_shop','t_other'];

  const rnd = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;
  const pick = arr => arr[rnd(0, arr.length - 1)];
  const uid = p => p + '-' + Math.random().toString(36).slice(2, 8);
  function daysFromNow(d) { const x = new Date(); x.setDate(x.getDate() + d); return x.toISOString().slice(0, 10); }
  const FIRST = ['Ahmed','Sara','Karwan','Layla','Hemin','Dilan','Omar','Nawroz','Rezan','Aland','Shahen','Bnar','Rekan','Dara','Avin','Zana','Hana','Soran','Lana','Peshraw'];
  const LAST = ['Ali','Hassan','Ahmed','Mohammed','Ibrahim','Rasul','Salih','Karim','Abdullah','Tahir','Amin','Qadir','Sabir','Mahmood','Jamal'];
  const fullName = () => pick(FIRST) + ' ' + pick(LAST);
  const phone = () => '+964 7' + rnd(50, 90) + ' ' + rnd(100, 999) + ' ' + rnd(1000, 9999);
  const emailOf = n => n.toLowerCase().replace(/[^a-z]/g, '.') + '@mail.com';

  function seed() {
    const db = { _v: SEED_VERSION };

    // Users & roles
    db.users = [
      { id: 'u-1', name: 'Abdulla Abdulwahed', email: 'admin@tablo.com', role: 'super_admin', phone: phone(), status: 'active', lastLogin: daysFromNow(0), avatar: '', twoFA: true },
      { id: 'u-2', name: 'Karwan Salih', email: 'manager@tablo.com', role: 'manager', phone: phone(), status: 'active', lastLogin: daysFromNow(-1), twoFA: false },
      { id: 'u-3', name: 'Sara Ahmed', email: 'sales@tablo.com', role: 'sales_agent', phone: phone(), status: 'active', lastLogin: daysFromNow(-1), twoFA: false },
      { id: 'u-4', name: 'Hemin Rasul', email: 'rental@tablo.com', role: 'rental_agent', phone: phone(), status: 'active', lastLogin: daysFromNow(-2), twoFA: false },
      { id: 'u-5', name: 'Layla Karim', email: 'accountant@tablo.com', role: 'accountant', phone: phone(), status: 'active', lastLogin: daysFromNow(-3), twoFA: true },
      { id: 'u-6', name: 'Dara Amin', email: 'reception@tablo.com', role: 'receptionist', phone: phone(), status: 'inactive', lastLogin: daysFromNow(-14), twoFA: false },
    ];
    const agents = db.users.filter(u => ['sales_agent','rental_agent','manager'].includes(u.role));

    // Customers (CRM)
    db.customers = [];
    const roles = ['buyer','seller','landlord','tenant','investor','company'];
    for (let i = 0; i < 26; i++) {
      const n = i === 25 ? 'Rojava Trading Co.' : fullName();
      const role = i === 25 ? 'company' : pick(roles);
      db.customers.push({
        id: uid('c'), name: n, role, phone: phone(), email: emailOf(n),
        city: pick(CITIES), createdAt: daysFromNow(-rnd(1, 300)),
        notes: '', documents: rnd(0, 4),
      });
    }
    const custByRole = r => db.customers.filter(c => c.role === r);

    // Properties
    db.properties = [];
    const statuses = ['available','reserved','sold','rented','archived'];
    for (let i = 0; i < 34; i++) {
      const purpose = Math.random() < 0.55 ? 'sale' : 'rent';
      let status;
      if (purpose === 'sale') status = pick(['available','available','reserved','sold']);
      else status = pick(['available','available','rented','reserved']);
      if (i % 17 === 0) status = 'archived';
      const type = pick(PTYPES);
      const salePrice = rnd(80, 900) * 1000;
      const rent = rnd(400, 3500);
      const gallery = [];
      const gcount = rnd(2, 5);
      for (let g = 0; g < gcount; g++) gallery.push(pick(IMGS) + '?auto=format&fit=crop&w=600&q=60');
      db.properties.push({
        id: 'PR-' + String(1000 + i),
        title: (I18N ? '' : '') + '', // display uses type
        type, purpose, status,
        area: rnd(90, 800), bedrooms: rnd(1, 6), bathrooms: rnd(1, 4),
        city: pick(CITIES), district: pick(AREAS),
        salePrice, rent, deposit: rent * 2, negotiable: Math.random() < 0.5,
        commission: purpose === 'sale' ? Math.round(salePrice * 0.02) : rent,
        owner: pick(custByRole('seller').concat(custByRole('landlord')).map(c => c.name).concat([fullName()])),
        agent: pick(agents).name,
        lat: (36 + Math.random()).toFixed(5), lng: (43 + Math.random()).toFixed(5),
        gallery, docs: rnd(0, 3),
        soldDate: status === 'sold' ? daysFromNow(-rnd(1, 90)) : null,
        buyer: status === 'sold' ? fullName() : null,
        description: 'A well-maintained property in a prime location with modern finishing, close to schools, markets and main roads.',
        createdAt: daysFromNow(-rnd(1, 200)),
      });
    }

    // Property Requests
    db.requests = [];
    for (let i = 0; i < 16; i++) {
      const kind = Math.random() < 0.55 ? 'purchase' : 'rental';
      db.requests.push({
        id: uid('rq'), kind,
        client: fullName(), phone: phone(),
        type: pick(PTYPES), area: rnd(100, 500),
        budget: kind === 'purchase' ? rnd(90, 700) * 1000 : rnd(400, 2500),
        location: pick(AREAS) + ', ' + pick(CITIES),
        bedrooms: rnd(1, 5),
        moveIn: kind === 'rental' ? daysFromNow(rnd(5, 60)) : null,
        status: pick(['pending','pending','matched','closed']),
        agent: pick(agents).name,
        notes: '',
        createdAt: daysFromNow(-rnd(1, 60)),
      });
    }

    // Contracts
    db.contracts = [];
    const soldProps = db.properties.filter(p => p.status === 'sold');
    const rentedProps = db.properties.filter(p => p.status === 'rented');
    let cn = 5000;
    soldProps.forEach(p => {
      db.contracts.push({
        id: 'CN-' + (cn++), kind: 'sales', property: p.id, propertyType: p.type,
        partyA: p.owner, partyB: p.buyer || fullName(),
        amount: p.salePrice, commission: p.commission,
        startDate: p.soldDate, endDate: null, status: 'signed',
        agent: p.agent, signed: true, createdAt: p.soldDate,
      });
    });
    rentedProps.forEach(p => {
      const start = daysFromNow(-rnd(30, 300));
      const end = daysFromNow(rnd(-20, 320));
      db.contracts.push({
        id: 'CN-' + (cn++), kind: 'rental', property: p.id, propertyType: p.type,
        partyA: p.owner, partyB: fullName(),
        amount: p.rent, deposit: p.deposit, commission: p.rent,
        startDate: start, endDate: end,
        status: new Date(end) < new Date() ? 'expired' : 'active',
        autoRenew: Math.random() < 0.5, agent: p.agent, signed: true, createdAt: start,
      });
    });
    // a couple commercial contracts
    for (let i = 0; i < 3; i++) {
      const start = daysFromNow(-rnd(60, 400));
      db.contracts.push({
        id: 'CN-' + (cn++), kind: 'commercial', property: pick(db.properties).id, propertyType: 't_commercial',
        partyA: 'Rojava Trading Co.', partyB: fullName(), business: 'Retail Store',
        amount: rnd(2000, 8000), deposit: rnd(4000, 16000), commission: rnd(2000, 5000),
        startDate: start, endDate: daysFromNow(rnd(30, 400)),
        status: 'active', taxId: 'TX-' + rnd(10000, 99999), agent: pick(agents).name,
        signed: true, createdAt: start,
      });
    }

    // Tenants (derived from rental contracts)
    db.tenants = db.contracts.filter(c => c.kind === 'rental').map(c => {
      const prop = db.properties.find(p => p.id === c.property);
      const total = c.amount;
      const paid = Math.random() < 0.35 ? Math.round(total * (Math.random() * 0.6)) : total;
      const due = daysFromNow(rnd(-15, 25));
      return {
        id: uid('tn'), name: c.partyB, phone: phone(), email: emailOf(c.partyB),
        contract: c.id, property: c.property, propertyLabel: prop ? prop.district + ', ' + prop.city : '',
        monthlyRent: total, paid, remaining: total - paid, dueDate: due,
        status: (total - paid) > 0 && new Date(due) < new Date() ? 'overdue' : (total - paid) > 0 ? 'due' : 'paid',
        moveIn: c.startDate, documents: rnd(1, 4),
      };
    });

    // Receipts (incoming)
    db.receipts = [];
    let inv = 8000;
    for (let i = 0; i < 20; i++) {
      db.receipts.push({
        id: uid('rc'), invoice: 'INV-' + (inv++),
        customer: pick(db.customers).name, method: pick(['cash','bank','card','online']),
        amount: rnd(400, 12000), forItem: pick(['Rent Payment','Sale Deposit','Commission','Booking Fee']),
        date: daysFromNow(-rnd(0, 120)), status: 'paid',
      });
    }
    // Payments (outgoing)
    db.payments = [];
    const payCats = ['vendor','salary','maintenance','utility','tax','office'];
    for (let i = 0; i < 16; i++) {
      db.payments.push({
        id: uid('py'), vendor: pick(['Zagros Maintenance','KRG Electricity','Newroz Telecom','Staff Payroll','Ashti Supplies','Tax Authority']),
        category: pick(payCats), amount: rnd(200, 6000),
        method: pick(['cash','bank','card']), date: daysFromNow(-rnd(0, 90)),
      });
    }
    // Security deposits
    db.deposits = db.contracts.filter(c => c.deposit).map(c => ({
      id: uid('dp'), contract: c.id, tenant: c.partyB, amount: c.deposit,
      status: c.status === 'expired' ? pick(['refunded','held']) : 'held',
      collectedAt: c.startDate, refundedAt: null,
    }));

    // Expenses
    db.expenses = [];
    const exCats = ['Office Rent','Employee Salaries','Marketing','Fuel','Utilities','Internet','Maintenance','Equipment','Miscellaneous'];
    for (let i = 0; i < 22; i++) {
      db.expenses.push({
        id: uid('ex'), category: pick(exCats), amount: rnd(150, 5000),
        vendor: pick(['Landlord','HR','Ad Agency','Fuel Station','KRG','Telecom','Contractor','Store']),
        date: daysFromNow(-rnd(0, 340)), notes: '',
      });
    }

    // Notifications
    db.notifications = [
      { id: uid('n'), type: 'contract', title: 'Contract expiring soon', body: 'Rental contract CN-5021 expires in 5 days.', time: daysFromNow(0), unread: true },
      { id: uid('n'), type: 'rent', title: 'Rent overdue', body: '3 tenants have overdue rent payments.', time: daysFromNow(0), unread: true },
      { id: uid('n'), type: 'property', title: 'New property added', body: 'PR-1032 was listed for sale.', time: daysFromNow(-1), unread: true },
      { id: uid('n'), type: 'payment', title: 'Payment received', body: 'INV-8012 — $4,200 received via bank transfer.', time: daysFromNow(-1), unread: false },
      { id: uid('n'), type: 'request', title: 'New rental request', body: 'A new rental request was submitted.', time: daysFromNow(-2), unread: false },
    ];

    // Audit / activity log
    db.audit = [];
    const acts = ['logged in','created a property','updated a contract','deleted a receipt','collected rent','exported a report','changed settings'];
    for (let i = 0; i < 18; i++) {
      db.audit.push({
        id: uid('a'), user: pick(db.users).name, action: pick(acts),
        ip: '10.0.' + rnd(0, 5) + '.' + rnd(2, 250), time: daysFromNow(-rnd(0, 20)),
      });
    }

    // Settings
    db.settings = {
      company: 'Tablo Real Estate', office: 'Ankawa, Erbil, Kurdistan Region – Iraq',
      phone: '+964 750 000 0000', email: 'info@tablo.com',
      currency: 'USD', timezone: 'Asia/Baghdad',
      commissionRate: 2, taxRate: 5, lastBackup: daysFromNow(-1),
    };

    return db;
  }

  let cache = null;
  function load() {
    if (cache) return cache;
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) { const p = JSON.parse(raw); if (p && p._v === SEED_VERSION) { cache = p; return cache; } }
    } catch (e) {}
    cache = seed(); persist();
    return cache;
  }
  function persist() { try { localStorage.setItem(KEY, JSON.stringify(cache)); } catch (e) {} }
  function reset() { localStorage.removeItem(KEY); cache = seed(); persist(); return cache; }

  // generic collection helpers
  function all(coll) { return load()[coll] || []; }
  function get(coll, id) { return all(coll).find(r => r.id === id); }
  function upsert(coll, rec) {
    const list = load()[coll];
    if (rec.id) {
      const i = list.findIndex(r => r.id === rec.id);
      if (i >= 0) { list[i] = { ...list[i], ...rec }; persist(); return list[i]; }
    }
    rec.id = rec.id || uid(coll.slice(0, 2));
    rec.createdAt = rec.createdAt || daysFromNow(0);
    list.unshift(rec); persist(); return rec;
  }
  function remove(coll, id) {
    const list = load()[coll];
    const i = list.findIndex(r => r.id === id);
    if (i >= 0) { list.splice(i, 1); persist(); return true; }
    return false;
  }
  function saveSettings(s) { load().settings = { ...load().settings, ...s }; persist(); }

  return {
    load, persist, reset, all, get, upsert, remove, saveSettings,
    uid, daysFromNow, meta: { CITIES, AREAS, PTYPES, IMGS, agents: () => all('users') },
  };
})();
