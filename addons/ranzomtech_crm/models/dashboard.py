from odoo import api, fields, models


class RanzomDashboard(models.Model):
    _name = "ranzom.crm.dashboard"
    _description = "RanzomTech CRM Dashboard"

    name = fields.Char(default="RanzomTech CRM", readonly=True)
    total_leads = fields.Integer(compute="_compute_metrics")
    open_leads = fields.Integer(compute="_compute_metrics")
    won_leads = fields.Integer(compute="_compute_metrics")
    clients = fields.Integer(compute="_compute_metrics")
    pipeline_value = fields.Monetary(compute="_compute_metrics", currency_field="currency_id")
    quoted_value = fields.Monetary(compute="_compute_metrics", currency_field="currency_id")
    cash_received = fields.Monetary(compute="_compute_metrics", currency_field="currency_id")
    outstanding = fields.Monetary(compute="_compute_metrics", currency_field="currency_id")
    pending_followups = fields.Integer(compute="_compute_metrics")
    currency_id = fields.Many2one("res.currency", compute="_compute_metrics")

    @api.depends()
    def _compute_metrics(self):
        Lead = self.env["crm.lead"]
        Partner = self.env["res.partner"]
        Followup = self.env["ranzom.followup"]
        company = self.env.company
        for rec in self:
            rec.currency_id = company.currency_id
            leads = Lead.search([("active", "=", True)])
            rec.total_leads = len(leads)
            rec.open_leads = len(leads.filtered(lambda l: l.probability < 100 and not l.active is False))
            rec.won_leads = len(leads.filtered(lambda l: l.probability >= 100))
            clients = Partner.search([("ranzom_is_client", "=", True)])
            rec.clients = len(clients)
            rec.pipeline_value = sum(leads.mapped("expected_revenue"))
            rec.quoted_value = sum(clients.mapped("ranzom_quoted"))
            rec.cash_received = sum(clients.mapped("ranzom_cash_received"))
            rec.outstanding = sum(clients.mapped("ranzom_outstanding"))
            rec.pending_followups = Followup.search_count([("status", "=", "pending")])

    @api.model
    def get_dashboard(self):
        record = self.search([], limit=1)
        if not record:
            record = self.create({})
        return {
            "type": "ir.actions.act_window",
            "name": "RanzomTech CRM Dashboard",
            "res_model": self._name,
            "res_id": record.id,
            "view_mode": "form",
            "target": "current",
        }
