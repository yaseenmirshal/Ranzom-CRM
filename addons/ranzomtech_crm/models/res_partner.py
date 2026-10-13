from odoo import fields, models


class ResPartner(models.Model):
    _inherit = "res.partner"

    ranzom_is_client = fields.Boolean(string="RanzomTech Client", tracking=True)
    ranzom_client_status = fields.Selection([
        ("lead", "Lead"),
        ("active", "Active"),
        ("paused", "Paused"),
        ("completed", "Completed"),
    ], string="Client Status", default="lead", tracking=True)
    ranzom_industry = fields.Selection([
        ("marketing", "Marketing"),
        ("construction", "Construction"),
        ("healthcare", "Healthcare"),
        ("food_beverage", "Food & Beverage"),
        ("fitness", "Fitness"),
        ("real_estate", "Real Estate"),
        ("salon", "Salon"),
        ("traders", "Traders"),
        ("gold", "Gold"),
        ("man_power", "Man Power"),
        ("interior_design", "Interior Design"),
        ("other", "Other"),
    ], string="Industry")
    ranzom_start_date = fields.Date(string="Start Date")
    ranzom_work_description = fields.Text(string="Work Description")
    ranzom_quoted = fields.Monetary(string="Quoted", currency_field="currency_id")
    ranzom_cash_received = fields.Monetary(string="Cash Received", currency_field="currency_id")
    ranzom_outstanding = fields.Monetary(
        string="Outstanding", currency_field="currency_id",
        compute="_compute_ranzom_outstanding", store=True
    )
    ranzom_last_contacted = fields.Datetime(string="Last Contacted")

    def _compute_ranzom_outstanding(self):
        for partner in self:
            partner.ranzom_outstanding = max(partner.ranzom_quoted - partner.ranzom_cash_received, 0.0)
