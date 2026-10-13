# RanzomTech CRM — Odoo v1

A first usable CRM layer for RanzomTech, built on Odoo 19 + PostgreSQL and modeled from the existing Notion CRM structure.

## v1 scope
- Leads & pipeline: New Lead → Contacted → Qualified → Proposal / Quotation → Negotiation → Won
- RanzomTech lead metadata: service, industry, source, budget, next follow-up
- Client conversion into `res.partner`
- Client lifecycle: Lead / Active / Paused / Completed
- Client commercial tracking: quoted, cash received, outstanding
- Follow-up records with due date, channel and status
- Basic CRM dashboard
- Ready for standard Odoo Sales, Projects and Accounting apps

## Deliberately deferred
- AI lead scoring
- Automated outbound follow-ups
- WhatsApp API integration
- Email integration beyond Odoo's native mail capabilities
- n8n workflows
- Advanced quotation/invoice/payment customizations

These should be added after the core lead → pipeline → client workflow is stable.

## Run locally

Requires Docker Desktop.

```bash
docker compose up -d
```

Open http://localhost:8069 and create a database. Then install **RanzomTech CRM** from Apps.

For development updates:

```bash
docker compose exec odoo odoo -c /etc/odoo/odoo.conf -d <database_name> -u ranzomtech_crm --stop-after-init
docker compose restart odoo
```

## Architecture

Odoo's ORM stores business data in PostgreSQL. This module extends Odoo's native `crm.lead` and `res.partner` models and adds a small `ranzom.followup` model. Standard Odoo Sales, Projects and Accounting remain the system of record for quotations, projects, invoices and payments.

That keeps v1 close to Odoo's native workflows and makes the later n8n/API integrations easier.
