/* ═══════════════════════════════════════════════════════════════
   View helpers — generic CRUD list controller used across modules.
═══════════════════════════════════════════════════════════════ */
window.Views = window.Views || {};
window.VC = (function () {
  const t = k => I18N.t(k);

  function pageHead(title, subtitle, actionsHtml) {
    return `<div class="page-head">
      <div><h1>${UI.esc(title)}</h1>${subtitle ? `<p>${UI.esc(subtitle)}</p>` : ''}</div>
      <div class="actions">${actionsHtml || ''}</div>
    </div>`;
  }

  /* Generic list page with search, filters, pagination, add/edit/delete. */
  function crudList(root, cfg) {
    const state = { search: '', filters: {}, page: 1, per: cfg.perPage || 8 };
    (cfg.filters || []).forEach(f => state.filters[f.key] = f.default || '');

    function data() {
      let rows = (cfg.source ? cfg.source() : DB.all(cfg.coll)).slice();
      if (cfg.baseFilter) rows = rows.filter(cfg.baseFilter);
      if (state.search) {
        const q = state.search.toLowerCase();
        rows = rows.filter(r => (cfg.searchFields || []).some(f => String(r[f] || '').toLowerCase().includes(q)));
      }
      (cfg.filters || []).forEach(f => {
        const v = state.filters[f.key];
        if (v) rows = rows.filter(r => String(f.get ? f.get(r) : r[f.key]) === String(v));
      });
      if (cfg.sort) rows.sort(cfg.sort);
      return rows;
    }

    function render() {
      const rows = data();
      const totalPages = Math.max(1, Math.ceil(rows.length / state.per));
      if (state.page > totalPages) state.page = totalPages;
      const pageRows = rows.slice((state.page - 1) * state.per, state.page * state.per);

      const filterControls = (cfg.filters || []).map(f => {
        const opts = ['<option value="">' + UI.esc(f.allLabel || t('all')) + '</option>']
          .concat((f.options || []).map(o => {
            const val = typeof o === 'string' ? o : o.value;
            const lbl = typeof o === 'string' ? o : o.label;
            return `<option value="${UI.esc(val)}" ${state.filters[f.key] === val ? 'selected' : ''}>${UI.esc(lbl)}</option>`;
          })).join('');
        return `<select class="select" data-filter="${f.key}">${opts}</select>`;
      }).join('');

      const cols = cfg.columns.slice();
      if (cfg.rowActions !== false) {
        cols.push({ label: t('actions'), align: 'end', render: r => rowActions(r) });
      }

      root.innerHTML = pageHead(cfg.title, cfg.subtitle,
        (cfg.headerActions || '') +
        (cfg.canAdd === false ? '' : `<button class="btn btn-primary" data-add>${UI.icon('plus')}${UI.esc(cfg.addLabel || t('add'))}</button>`)
      ) + `<div class="card">
        <div class="toolbar">
          ${cfg.searchFields ? `<div class="search-inline">${UI.icon('search')}<input class="input" data-search placeholder="${t('search')}" value="${UI.esc(state.search)}"></div>` : ''}
          ${filterControls}
          <div class="grow"></div>
          <button class="btn btn-sm" data-export>${UI.icon('download')}${t('export')}</button>
        </div>
        ${UI.table({ columns: cols, rows: pageRows.map(r => ({ ...r, _id: r.id })), empty: cfg.empty })}
        ${rows.length ? pagination(rows.length, totalPages) : ''}
      </div>`;

      wire(rows);
    }

    function rowActions(r) {
      let html = '<div class="row-actions">';
      if (cfg.onView) html += `<button class="icon-btn" data-view="${UI.esc(r.id)}" title="${t('view')}">${UI.icon('eye')}</button>`;
      if (cfg.canEdit !== false) html += `<button class="icon-btn" data-edit="${UI.esc(r.id)}" title="${t('edit')}">${UI.icon('edit')}</button>`;
      if (cfg.canDelete !== false) html += `<button class="icon-btn" data-del="${UI.esc(r.id)}" title="${t('delete')}">${UI.icon('trash')}</button>`;
      html += '</div>';
      return html;
    }

    function pagination(total, totalPages) {
      const from = (state.page - 1) * state.per + 1;
      const to = Math.min(total, state.page * state.per);
      return `<div class="pagination">
        <span>${t('showing')} ${from}–${to} ${t('of')} ${total}</span>
        <button class="btn btn-sm" data-prev ${state.page === 1 ? 'disabled' : ''}>${t('prev')}</button>
        <span>${state.page} / ${totalPages}</span>
        <button class="btn btn-sm" data-next ${state.page === totalPages ? 'disabled' : ''}>${t('next')}</button>
      </div>`;
    }

    function openForm(existing) {
      const rec = existing || (cfg.defaults ? cfg.defaults() : {});
      UI.modal({
        title: existing ? (cfg.editLabel || t('edit')) : (cfg.addLabel || t('add')),
        wide: cfg.wideForm,
        body: `<form data-form>${cfg.formFields(rec)}</form>`,
        footer: `<button class="btn" data-close>${t('cancel')}</button><button class="btn btn-primary" data-save>${t('save')}</button>`,
        onOpen(ov) {
          ov.querySelector('[data-save]').addEventListener('click', () => {
            const form = ov.querySelector('[data-form]');
            if (!form.reportValidity()) return;
            const fd = UI.formData(ov);
            const record = cfg.toRecord(fd, existing || {});
            DB.upsert(cfg.coll, record);
            UI.close(); UI.toast(t('saved')); App.bumpAudit(existing ? 'updated a ' + cfg.coll.slice(0, -1) : 'created a ' + cfg.coll.slice(0, -1));
            render();
          });
        },
      });
    }

    function wire(rows) {
      const q = sel => root.querySelector(sel);
      const add = q('[data-add]'); if (add) add.addEventListener('click', () => openForm(null));
      const s = q('[data-search]'); if (s) s.addEventListener('input', e => { state.search = e.target.value; state.page = 1; render(); if (root.querySelector('[data-search]')) { const el = root.querySelector('[data-search]'); el.focus(); el.setSelectionRange(el.value.length, el.value.length); } });
      root.querySelectorAll('[data-filter]').forEach(el => el.addEventListener('change', e => { state.filters[el.getAttribute('data-filter')] = e.target.value; state.page = 1; render(); }));
      const prev = q('[data-prev]'); if (prev) prev.addEventListener('click', () => { if (state.page > 1) { state.page--; render(); } });
      const next = q('[data-next]'); if (next) next.addEventListener('click', () => { state.page++; render(); });
      const exp = q('[data-export]'); if (exp) exp.addEventListener('click', () => exportCsv(rows));
      root.querySelectorAll('[data-edit]').forEach(el => el.addEventListener('click', () => openForm(DB.get(cfg.coll, el.getAttribute('data-edit')))));
      root.querySelectorAll('[data-view]').forEach(el => el.addEventListener('click', () => cfg.onView(DB.get(cfg.coll, el.getAttribute('data-view')), render)));
      root.querySelectorAll('[data-del]').forEach(el => el.addEventListener('click', () => {
        UI.confirm(t('confirm_delete'), () => { DB.remove(cfg.coll, el.getAttribute('data-del')); UI.toast(t('deleted')); App.bumpAudit('deleted a ' + cfg.coll.slice(0, -1)); render(); });
      }));
    }

    function exportCsv(rows) {
      const cols = cfg.exportColumns || cfg.columns;
      const header = cols.map(c => c.label).join(',');
      const lines = rows.map(r => cols.map(c => {
        let v = c.exportValue ? c.exportValue(r) : (c.plain ? c.plain(r) : r[c.key]);
        v = String(v == null ? '' : v).replace(/"/g, '""');
        return /[",\n]/.test(v) ? '"' + v + '"' : v;
      }).join(',')).join('\n');
      const blob = new Blob([header + '\n' + lines], { type: 'text/csv' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob); a.download = cfg.coll + '.csv'; a.click();
      UI.toast(t('export') + ' ✓');
    }

    render();
    return { render, edit: (rec) => openForm(rec), add: () => openForm(null) };
  }

  /* small stat tile helper */
  function stat(label, value, iconName, iconCls, trend) {
    return `<div class="stat">
      <div class="ic ${iconCls}">${UI.icon(iconName)}</div>
      <div><div class="val mono">${value}</div><div class="lbl">${UI.esc(label)}</div>
      ${trend ? `<div class="trend ${trend.dir}">${UI.icon(trend.dir === 'up' ? 'trendUp' : 'trendUp')} ${UI.esc(trend.text)}</div>` : ''}</div>
    </div>`;
  }

  function typeLabel(ty) { return t(ty); }

  return { crudList, pageHead, stat, typeLabel };
})();
