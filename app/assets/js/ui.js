/* ═══════════════════════════════════════════════════════════════
   UI toolkit — icons, formatting, toast, modal, tables, charts.
═══════════════════════════════════════════════════════════════ */
window.UI = (function () {
  const t = k => I18N.t(k);

  /* ---------- Icons (inline SVG, stroke) ---------- */
  const P = 'stroke="currentColor" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round"';
  const ICONS = {
    dashboard: `<rect x="3" y="3" width="7" height="9" rx="1" ${P}/><rect x="14" y="3" width="7" height="5" rx="1" ${P}/><rect x="14" y="12" width="7" height="9" rx="1" ${P}/><rect x="3" y="16" width="7" height="5" rx="1" ${P}/>`,
    building: `<rect x="4" y="3" width="16" height="18" rx="1" ${P}/><path d="M9 8h1M14 8h1M9 12h1M14 12h1M9 16h1M14 16h1" ${P}/>`,
    tag: `<path d="M20.59 13.41 13.42 20.58a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82Z" ${P}/><circle cx="7" cy="7" r="1.4" ${P}/>`,
    key: `<circle cx="7.5" cy="15.5" r="4.5" ${P}/><path d="M10.7 12.3 19 4m-3 0h3v3" ${P}/>`,
    inbox: `<path d="M22 12h-6l-2 3h-4l-2-3H2" ${P}/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11Z" ${P}/>`,
    file: `<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" ${P}/><path d="M14 2v6h6M9 15h6M9 11h2" ${P}/>`,
    receipt: `<path d="M5 3v18l2-1 2 1 2-1 2 1 2-1 2 1V3l-2 1-2-1-2 1-2-1-2 1Z" ${P}/><path d="M8 8h8M8 12h6" ${P}/>`,
    wallet: `<path d="M21 12V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-1" ${P}/><path d="M18 12a1.5 1.5 0 0 0 0 3h3v-3Z" ${P}/>`,
    shield: `<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" ${P}/><path d="m9 12 2 2 4-4" ${P}/>`,
    users: `<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" ${P}/><circle cx="9" cy="7" r="4" ${P}/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13A4 4 0 0 1 16 11" ${P}/>`,
    user: `<circle cx="12" cy="8" r="4" ${P}/><path d="M4 21v-1a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v1" ${P}/>`,
    chart: `<path d="M3 3v18h18" ${P}/><path d="M7 14l3-4 3 3 4-6" ${P}/>`,
    coins: `<circle cx="9" cy="9" r="6" ${P}/><path d="M18.09 10.37A6 6 0 1 1 10.34 18M7 6h1v4M16.71 13.88l.7.71-2.82 2.82" ${P}/>`,
    settings: `<circle cx="12" cy="12" r="3" ${P}/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-2.82 1.17V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 8 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" ${P}/>`,
    bell: `<path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0" ${P}/>`,
    search: `<circle cx="11" cy="11" r="7" ${P}/><path d="m21 21-4.3-4.3" ${P}/>`,
    plus: `<path d="M12 5v14M5 12h14" ${P}/>`,
    edit: `<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" ${P}/><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4Z" ${P}/>`,
    trash: `<path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m2 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" ${P}/>`,
    eye: `<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" ${P}/><circle cx="12" cy="12" r="3" ${P}/>`,
    printer: `<path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2M6 14h12v8H6Z" ${P}/>`,
    download: `<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" ${P}/>`,
    logout: `<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" ${P}/>`,
    x: `<path d="M18 6 6 18M6 6l12 12" ${P}/>`,
    menu: `<path d="M3 12h18M3 6h18M3 18h18" ${P}/>`,
    moon: `<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z" ${P}/>`,
    sun: `<circle cx="12" cy="12" r="4" ${P}/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5 19 19M5 19l1.5-1.5M17.5 6.5 19 5" ${P}/>`,
    globe: `<circle cx="12" cy="12" r="9" ${P}/><path d="M3 12h18M12 3a15 15 0 0 1 0 18 15 15 0 0 1 0-18Z" ${P}/>`,
    check: `<path d="M20 6 9 17l-5-5" ${P}/>`,
    map: `<path d="M9 3 3 6v15l6-3 6 3 6-3V3l-6 3-6-3Z" ${P}/><path d="M9 3v15M15 6v15" ${P}/>`,
    pin: `<path d="M12 21s7-5.5 7-11a7 7 0 1 0-14 0c0 5.5 7 11 7 11Z" ${P}/><circle cx="12" cy="10" r="2.5" ${P}/>`,
    bed: `<path d="M2 10v8M22 14v4M2 14h20v-2a3 3 0 0 0-3-3H8a3 3 0 0 0-3 3M2 14H2" ${P}/><path d="M2 12V6" ${P}/>`,
    calendar: `<rect x="3" y="4" width="18" height="18" rx="2" ${P}/><path d="M16 2v4M8 2v4M3 10h18" ${P}/>`,
    warning: `<path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" ${P}/><path d="M12 9v4M12 17h.01" ${P}/>`,
    trendUp: `<path d="M23 6l-9.5 9.5-5-5L1 18" ${P}/><path d="M17 6h6v6" ${P}/>`,
    money: `<rect x="2" y="5" width="20" height="14" rx="2" ${P}/><circle cx="12" cy="12" r="3" ${P}/><path d="M6 12h.01M18 12h.01" ${P}/>`,
    lock: `<rect x="3" y="11" width="18" height="11" rx="2" ${P}/><path d="M7 11V7a5 5 0 0 1 10 0v4" ${P}/>`,
    phone: `<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92Z" ${P}/>`,
    mail: `<rect x="2" y="4" width="20" height="16" rx="2" ${P}/><path d="m22 7-10 6L2 7" ${P}/>`,
    clock: `<circle cx="12" cy="12" r="9" ${P}/><path d="M12 7v5l3 2" ${P}/>`,
    grid: `<rect x="3" y="3" width="7" height="7" ${P}/><rect x="14" y="3" width="7" height="7" ${P}/><rect x="14" y="14" width="7" height="7" ${P}/><rect x="3" y="14" width="7" height="7" ${P}/>`,
    chevron: `<polyline points="6 9 12 15 18 9" ${P}/>`,
    home: `<path d="M3 10.5 12 3l9 7.5" ${P}/><path d="M5 9.5V21h14V9.5" ${P}/><path d="M9.5 21v-6h5v6" ${P}/>`,
  };
  function icon(name, cls) { return `<svg viewBox="0 0 24 24" ${cls ? 'class="' + cls + '"' : ''} aria-hidden="true">${ICONS[name] || ''}</svg>`; }

  /* Brand mark — the Tablo house-with-T logo (self-contained, theme-agnostic). */
  function logo() {
    return `<svg viewBox="0 0 120 120" width="100%" height="100%" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Tablo Real Estate">
      <rect width="120" height="120" rx="24" fill="#0c0d10"/>
      <rect x="74" y="16" width="13" height="42" rx="2" fill="#d5a93b"/>
      <path d="M10 60 L58 18 L110 60 Z" fill="#7f7395"/>
      <path d="M31 57 H89 V90 a8 8 0 0 1 -8 8 H39 a8 8 0 0 1 -8 -8 Z" fill="#d5a93b"/>
      <rect x="33" y="57" width="56" height="12.5" fill="#0c0d10"/>
      <rect x="51.5" y="57" width="17" height="41" fill="#0c0d10"/>
    </svg>`;
  }

  /* ---------- Formatting ---------- */
  function money(n) {
    const cur = (DB.load().settings.currency) || 'IQD';
    const v = Math.round(n || 0).toLocaleString('en-US');
    if (cur === 'IQD') return v + ' IQD';
    const sym = { USD: '$', EUR: '€' }[cur] || '$';
    return sym + v;
  }
  function num(n) { return (n || 0).toLocaleString('en-US'); }
  function moneyShort(n) {
    const cur = (DB.load().settings.currency) || 'IQD';
    const suf = cur === 'IQD' ? ' IQD' : '';
    const pre = cur === 'IQD' ? '' : ({ USD: '$', EUR: '€' }[cur] || '$');
    const a = Math.abs(n || 0);
    let v;
    if (a >= 1e9) v = (n / 1e9).toFixed(1).replace(/\.0$/, '') + 'B';
    else if (a >= 1e6) v = (n / 1e6).toFixed(1).replace(/\.0$/, '') + 'M';
    else if (a >= 1e4) v = Math.round(n / 1e3) + 'K';
    else v = Math.round(n || 0).toLocaleString('en-US');
    return pre + v + suf;
  }
  function fdate(d) { if (!d) return '—'; try { return new Date(d).toLocaleDateString(I18N.current() === 'en' ? 'en-GB' : 'en-GB', { day: '2-digit', month: 'short', year: 'numeric' }); } catch (e) { return d; } }
  function initials(n) { return (n || '?').split(' ').map(s => s[0]).slice(0, 2).join('').toUpperCase(); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }

  const STATUS_BADGE = {
    available: 'b-green', reserved: 'b-amber', sold: 'b-blue', rented: 'b-purple', archived: 'b-gray',
    active: 'b-green', expired: 'b-red', draft: 'b-gray', signed: 'b-blue',
    pending: 'b-amber', matched: 'b-blue', closed: 'b-gray',
    paid: 'b-green', due: 'b-amber', overdue: 'b-red', refunded: 'b-blue', held: 'b-gold',
    inactive: 'b-gray',
  };
  function badge(status, label) {
    const cls = STATUS_BADGE[status] || 'b-gray';
    return `<span class="badge ${cls}">${esc(label || t(status) || status)}</span>`;
  }

  /* ---------- Toast ---------- */
  function toast(msg, type) {
    let wrap = document.getElementById('toast-wrap');
    if (!wrap) { wrap = document.createElement('div'); wrap.id = 'toast-wrap'; document.body.appendChild(wrap); }
    const el = document.createElement('div');
    el.className = 'toast ' + (type || 'ok');
    const ic = type === 'err' ? icon('warning') : icon('check');
    el.innerHTML = ic + '<span>' + esc(msg) + '</span>';
    wrap.appendChild(el);
    setTimeout(() => { el.style.opacity = '0'; el.style.transform = 'translateX(20px)'; setTimeout(() => el.remove(), 300); }, 2600);
  }

  /* ---------- Modal ---------- */
  function modal({ title, body, footer, wide, onOpen }) {
    close();
    const ov = document.createElement('div');
    ov.className = 'modal-overlay';
    ov.innerHTML = `<div class="modal ${wide ? 'wide' : ''}" role="dialog">
      <div class="modal-head"><h3>${esc(title)}</h3><button class="icon-btn" data-close>${icon('x')}</button></div>
      <div class="modal-body">${body}</div>
      ${footer ? `<div class="modal-foot">${footer}</div>` : ''}
    </div>`;
    document.body.appendChild(ov);
    ov.addEventListener('click', e => { if (e.target === ov || e.target.closest('[data-close]')) close(); });
    document.addEventListener('keydown', escClose);
    if (onOpen) onOpen(ov);
    return ov;
  }
  function escClose(e) { if (e.key === 'Escape') close(); }
  function close() {
    const ov = document.querySelector('.modal-overlay');
    if (ov) ov.remove();
    document.removeEventListener('keydown', escClose);
  }
  function confirm(msg, onYes) {
    modal({
      title: t('delete'),
      body: `<p style="font-size:14px">${esc(msg)}</p>`,
      footer: `<button class="btn" data-close>${t('cancel')}</button><button class="btn btn-danger" data-yes>${t('delete')}</button>`,
      onOpen(ov) { ov.querySelector('[data-yes]').addEventListener('click', () => { close(); onYes(); }); },
    });
  }

  /* ---------- Form helpers ---------- */
  function field(label, name, value, opts = {}) {
    const req = opts.required ? 'required' : '';
    let control;
    if (opts.type === 'select') {
      const options = (opts.options || []).map(o => {
        const val = typeof o === 'string' ? o : o.value;
        const lbl = typeof o === 'string' ? o : o.label;
        return `<option value="${esc(val)}" ${String(value) === String(val) ? 'selected' : ''}>${esc(lbl)}</option>`;
      }).join('');
      control = `<select class="select" name="${name}" ${req}>${options}</select>`;
    } else if (opts.type === 'textarea') {
      control = `<textarea class="input" name="${name}" ${req}>${esc(value || '')}</textarea>`;
    } else {
      control = `<input class="input" name="${name}" type="${opts.type || 'text'}" value="${esc(value == null ? '' : value)}" ${req} ${opts.step ? 'step=' + opts.step : ''} placeholder="${esc(opts.placeholder || '')}">`;
    }
    return `<div class="field ${opts.full ? 'full' : ''}"><label>${esc(label)}</label>${control}</div>`;
  }
  function formData(ov) {
    const data = {};
    ov.querySelectorAll('input,select,textarea').forEach(el => { if (el.name) data[el.name] = el.value; });
    return data;
  }

  /* ---------- Charts (self-contained SVG) ---------- */
  const CHART_COLORS = ['#c9a84c', '#3b82c4', '#2fa86a', '#8b5cf6', '#d24b4b', '#d9a326', '#14b8a6', '#ec4899'];

  function donut(data, opts = {}) {
    // data: [{label, value, color}]
    const total = data.reduce((s, d) => s + d.value, 0) || 1;
    const R = 60, C = 2 * Math.PI * R, cx = 80, cy = 80;
    let off = 0;
    const segs = data.map((d, i) => {
      const frac = d.value / total;
      const len = frac * C;
      const col = d.color || CHART_COLORS[i % CHART_COLORS.length];
      const el = `<circle cx="${cx}" cy="${cy}" r="${R}" fill="none" stroke="${col}" stroke-width="20"
        stroke-dasharray="${len} ${C - len}" stroke-dashoffset="${-off}" transform="rotate(-90 ${cx} ${cy})"/>`;
      off += len; return el;
    }).join('');
    const legend = data.map((d, i) => `<span><i style="background:${d.color || CHART_COLORS[i % CHART_COLORS.length]}"></i>${esc(d.label)} · ${d.value}</span>`).join('');
    const svg = `<svg viewBox="0 0 160 160" style="max-width:190px;width:100%">
        <circle cx="${cx}" cy="${cy}" r="${R}" fill="none" stroke="var(--surface-3)" stroke-width="20"/>
        ${segs}
        <text x="${cx}" y="${cy - 2}" text-anchor="middle" class="donut-center" fill="var(--text)" style="font-size:24px;font-weight:800">${opts.center != null ? opts.center : total}</text>
        <text x="${cx}" y="${cy + 16}" text-anchor="middle" fill="var(--text-muted)" style="font-size:9px">${esc(opts.centerLabel || '')}</text>
      </svg>`;
    if (opts.hideLegend) return `<div style="text-align:center">${svg}</div>`;
    return `<div style="text-align:center">${svg}<div class="chart-legend">${legend}</div></div>`;
  }

  function bars(series, opts = {}) {
    // series: {labels:[], sets:[{name,color,data:[]}]}
    const W = 560, H = 240, pad = { t: 16, r: 12, b: 34, l: 44 };
    const iw = W - pad.l - pad.r, ih = H - pad.t - pad.b;
    const max = Math.max(1, ...series.sets.flatMap(s => s.data));
    const step = Math.ceil(max / 4);
    const ymax = step * 4;
    const n = series.labels.length;
    const groupW = iw / n;
    const nSets = series.sets.length;
    const barW = Math.min(22, (groupW * 0.6) / nSets);
    let bars = '';
    series.labels.forEach((lb, gi) => {
      series.sets.forEach((s, si) => {
        const v = s.data[gi] || 0;
        const h = (v / ymax) * ih;
        const x = pad.l + gi * groupW + groupW / 2 - (nSets * barW) / 2 + si * barW;
        const y = pad.t + ih - h;
        bars += `<rect x="${x}" y="${y}" width="${barW - 2}" height="${Math.max(0, h)}" rx="3" fill="${s.color}"><title>${esc(s.name)}: ${v}</title></rect>`;
      });
      const cx = pad.l + gi * groupW + groupW / 2;
      bars += `<text x="${cx}" y="${H - 12}" text-anchor="middle" fill="var(--text-muted)" style="font-size:10px">${esc(lb)}</text>`;
    });
    let grid = '';
    for (let i = 0; i <= 4; i++) {
      const y = pad.t + ih - (i / 4) * ih;
      grid += `<line x1="${pad.l}" y1="${y}" x2="${W - pad.r}" y2="${y}" stroke="var(--border)"/>`;
      grid += `<text x="${pad.l - 8}" y="${y + 3}" text-anchor="end" fill="var(--text-muted)" style="font-size:9px">${opts.money ? '$' + ((step * i) / 1000) + 'k' : step * i}</text>`;
    }
    const legend = series.sets.map(s => `<span><i style="background:${s.color}"></i>${esc(s.name)}</span>`).join('');
    return `<svg viewBox="0 0 ${W} ${H}" style="width:100%;height:auto">${grid}${bars}</svg><div class="chart-legend">${legend}</div>`;
  }

  function line(series, opts = {}) {
    const W = 560, H = 230, pad = { t: 16, r: 14, b: 30, l: 46 };
    const iw = W - pad.l - pad.r, ih = H - pad.t - pad.b;
    const max = Math.max(1, ...series.sets.flatMap(s => s.data));
    const step = Math.ceil(max / 4) || 1, ymax = step * 4;
    const n = series.labels.length;
    const xAt = i => pad.l + (n === 1 ? iw / 2 : (i / (n - 1)) * iw);
    const yAt = v => pad.t + ih - (v / ymax) * ih;
    let grid = '';
    for (let i = 0; i <= 4; i++) {
      const y = pad.t + ih - (i / 4) * ih;
      grid += `<line x1="${pad.l}" y1="${y}" x2="${W - pad.r}" y2="${y}" stroke="var(--border)"/>`;
      grid += `<text x="${pad.l - 8}" y="${y + 3}" text-anchor="end" fill="var(--text-muted)" style="font-size:9px">${opts.money ? '$' + ((step * i) / 1000) + 'k' : step * i}</text>`;
    }
    let paths = '';
    series.sets.forEach(s => {
      const pts = s.data.map((v, i) => `${xAt(i)},${yAt(v)}`);
      const d = 'M' + pts.join(' L');
      const area = `${d} L${xAt(n - 1)},${pad.t + ih} L${xAt(0)},${pad.t + ih} Z`;
      paths += `<path d="${area}" fill="${s.color}" opacity="0.08"/>`;
      paths += `<path d="${d}" fill="none" stroke="${s.color}" stroke-width="2.4" stroke-linejoin="round"/>`;
      paths += s.data.map((v, i) => `<circle cx="${xAt(i)}" cy="${yAt(v)}" r="3" fill="${s.color}"><title>${esc(s.name)}: ${v}</title></circle>`).join('');
    });
    const labels = series.labels.map((lb, i) => `<text x="${xAt(i)}" y="${H - 10}" text-anchor="middle" fill="var(--text-muted)" style="font-size:10px">${esc(lb)}</text>`).join('');
    const legend = series.sets.map(s => `<span><i style="background:${s.color}"></i>${esc(s.name)}</span>`).join('');
    return `<svg viewBox="0 0 ${W} ${H}" style="width:100%;height:auto">${grid}${paths}${labels}</svg><div class="chart-legend">${legend}</div>`;
  }

  /* ---------- Reusable data table ---------- */
  function table({ columns, rows, empty }) {
    if (!rows.length) {
      return `<div class="empty-state">${icon('inbox')}<div>${esc(empty || t('no_data'))}</div></div>`;
    }
    const head = columns.map(c => `<th ${c.align ? 'style="text-align:' + c.align + '"' : ''}>${esc(c.label)}</th>`).join('');
    const body = rows.map(r => {
      const tds = columns.map(c => {
        const v = c.render ? c.render(r) : esc(r[c.key]);
        return `<td ${c.align ? 'style="text-align:' + c.align + '"' : ''}>${v}</td>`;
      }).join('');
      return `<tr${r._id ? ' data-id="' + esc(r._id) + '"' : ''}>${tds}</tr>`;
    }).join('');
    return `<div class="table-wrap"><table class="data"><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table></div>`;
  }

  const PTYPE_OPTIONS = () => DB.meta.PTYPES.map(v => ({ value: v, label: t(v) }));
  const AGENT_OPTIONS = () => DB.meta.agents().filter(u => ['sales_agent','rental_agent','manager','administrator'].includes(u.role)).map(u => u.name);

  return {
    icon, logo, money, moneyShort, num, fdate, initials, esc, badge, toast, modal, close, confirm,
    field, formData, donut, bars, line, table, CHART_COLORS, t,
    PTYPE_OPTIONS, AGENT_OPTIONS, CITIES: () => DB.meta.CITIES, AREAS: () => DB.meta.AREAS,
  };
})();
