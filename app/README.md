# Tablo Real Estate — Enterprise ERP

A functional, self-contained front-end prototype of the **Tablo Real Estate**
enterprise management system, implementing the modules from the system
specification. It runs entirely in the browser (no build step, no server) and
is deployed with the site to GitHub Pages at **`/app/`**.

> Open **`/app/`** and sign in with any demo account (any password).

## Demo accounts

| Email | Role |
|-------|------|
| `admin@tablo.com` | Super Admin |
| `manager@tablo.com` | Manager |
| `sales@tablo.com` | Sales Agent |
| `rental@tablo.com` | Rental Agent |
| `accountant@tablo.com` | Accountant |

Password: **anything** (this is a front-end demo; auth is simulated).

## Modules implemented

1. **Dashboard** — 8 KPI widgets, monthly sales/rental bar chart, status-distribution
   donut, revenue-vs-expenses line chart, and recent-activity tables.
2. **Property Management** — full CRUD, all 12 property types, sale/rent variants,
   status, gallery, documents, GPS + Google Maps link, owner/agent, history, filters,
   search, pagination, CSV export.
3. **Property Requests** — purchase & rental requests with budget, area, location,
   assigned agent and status.
4. **Contracts** — sales / rental / commercial, with a printable (PDF-ready)
   contract document and digital-signature indicator.
5. **Financial Management** — Receipts (printable), Payments, Security Deposits
   (collect/refund), and Expenses with category analytics.
6. **Tenant Management** — tenant profiles, rent collection, overdue detection,
   reminders, and payment recording that generates receipts.
7. **Customer Management (CRM)** — buyers, sellers, landlords, tenants, investors,
   companies, communication log, and history.
8. **Reports & Analytics** — Financial (P&L, cash flow, commission), Property
   (occupancy, by type), Tenant, and Agent-performance reports.
9. **User & Role Management** — 9 roles, a permission matrix, and an audit log.
10. **Settings** — company info, currency, language, theme, commission/tax rates,
    backup/restore (JSON export), security policies, reset demo data.
11. **Profile** — personal info, change password, 2FA toggle, login history.
12. **Notifications** — in-app notification center with unread badges.
13. **Global Search** — searches properties, customers, and contracts.
14. **Security (simulated)** — session, role-based chrome, audit logging on actions.
15. **Multi-language** — English, Arabic, Kurdish (Sorani) with full **RTL**.
16. **Dark & Light mode**, fully responsive (desktop → mobile).

Data is seeded on first load and persisted in `localStorage`, so edits survive
page reloads. Use **Settings → Reset Demo Data** to restore the seed.

## File structure

```
app/
├── index.html                 # entry — loads styles + scripts in order
└── assets/
    ├── css/app.css            # design system (themeable, RTL-ready)
    └── js/
        ├── i18n.js            # EN / AR / KU dictionaries + direction
        ├── data.js            # DataStore: seed data + localStorage
        ├── ui.js              # icons, formatting, charts, table/modal/toast
        ├── app.js            # shell: auth, router, sidebar, topbar, search
        └── views/
            ├── _common.js     # generic CRUD list controller
            ├── dashboard.js
            ├── properties.js  # properties + for-sale + for-rent
            ├── requests.js
            ├── contracts.js
            ├── finance.js     # receipts, payments, deposits, expenses
            ├── people.js      # tenants, rent collection, customers
            ├── reports.js
            └── admin.js       # users & roles, settings, profile
```

The SVG charts (donut / bar / line) are hand-rolled with zero dependencies, so
the whole app is fully offline-capable once the fonts are cached.

## Relationship to the production stack in the spec

The specification targets **Next.js + Laravel 12 API + MySQL 8 + JWT**. This
prototype is the **presentation and interaction layer** of that system: every
screen, workflow, form, and report is here and clickable, backed by a browser
data store that mirrors the intended tables. To productionize:

| Prototype piece | Production equivalent |
|-----------------|-----------------------|
| `data.js` DataStore collections | MySQL tables via Laravel Eloquent models |
| `DB.upsert` / `DB.remove` / `DB.all` | Laravel REST controllers (`/api/*`) |
| `App.login` (simulated) | Laravel Sanctum/JWT auth + 2FA |
| Role chrome + `ROLE_MATRIX` | Laravel policies / `spatie/laravel-permission` |
| `App.bumpAudit` | server-side audit-log middleware |
| CSV export / print views | server PDF (dompdf) + Excel (maatwebsite/excel) |
| `localStorage` | S3 / local disk for files, MySQL for records |

The React/Next.js migration is a direct component-per-view mapping: each file in
`views/` becomes a route/page, `ui.js` becomes a shared component library, and
`i18n.js` becomes `next-intl` message catalogs.
