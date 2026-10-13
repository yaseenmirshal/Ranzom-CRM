from odoo import api, fields, models


class RanzomFollowup(models.Model):
    _name = "ranzom.followup"
    _description = "RanzomTech Follow-up"
    _order = "due_date asc, id desc"

    name = fields.Char(required=True)
    lead_id = fields.Many2one("crm.lead", string="Lead", ondelete="cascade")
    partner_id = fields.Many2one("res.partner", string="Client / Contact", ondelete="set null")
    due_date = fields.Date(required=True, default=fields.Date.context_today)
    followup_type = fields.Selection([
        ("whatsapp", "WhatsApp"),
        ("email", "Email"),
        ("call", "Call"),
        ("meeting", "Meeting"),
        ("other", "Other"),
    ], default="whatsapp", required=True)
    status = fields.Selection([
        ("pending", "Pending"),
        ("done", "Done"),
        ("cancelled", "Cancelled"),
    ], default="pending", required=True)
    notes = fields.Text()
    completed_at = fields.Datetime(readonly=True)

    def action_mark_done(self):
        self.write({"status": "done", "completed_at": fields.Datetime.now()})
        return True

    @api.model
    def cron_mark_overdue(self):
        # v1 deliberately keeps overdue records pending so they remain visible.
        # Automated messaging belongs to the n8n integration phase.
        return True
