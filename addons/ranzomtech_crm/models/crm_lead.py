from odoo import api, fields, models
from odoo.exceptions import UserError


class CrmLead(models.Model):
    _inherit = "crm.lead"

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
    ], string="Industry", tracking=True)
    ranzom_service = fields.Selection([
        ("web", "Web Development"),
        ("app", "App Development"),
        ("uiux", "UI/UX Design"),
        ("ecommerce", "E-commerce"),
        ("marketing", "Lead Generation / Marketing"),
        ("automation", "Business Automation"),
        ("crm", "CRM / ERP"),
        ("nfc", "NFC Solutions"),
        ("graphic", "Graphic Design"),
        ("other", "Other"),
    ], string="Service", tracking=True)
    ranzom_source = fields.Selection([
        ("whatsapp", "WhatsApp"),
        ("instagram", "Instagram"),
        ("website", "Website"),
        ("referral", "Referral"),
        ("email", "Email"),
        ("cold_outreach", "Cold Outreach"),
        ("other", "Other"),
    ], string="Lead Source", tracking=True)
    ranzom_budget = fields.Monetary(string="Budget", currency_field="company_currency")
    ranzom_next_followup = fields.Datetime(string="Next Follow-up", tracking=True)
    ranzom_client_id = fields.Many2one("res.partner", string="Converted Client", readonly=True)
    ranzom_lost_reason = fields.Char(string="Loss Reason")

    def action_convert_to_client(self):
        self.ensure_one()
        if self.type == "lead" and not self.partner_id:
            partner = self.env["res.partner"].create({
                "name": self.partner_name or self.contact_name or self.name,
                "email": self.email_from,
                "phone": self.phone,
                "company_type": "company" if self.partner_name else "person",
            })
            self.partner_id = partner
        partner = self.partner_id
        if not partner:
            raise UserError("Add a contact/company to this lead before converting it to a client.")
        partner.write({
            "ranzom_is_client": True,
            "ranzom_client_status": "active",
            "ranzom_industry": self.ranzom_industry,
            "ranzom_quoted": self.expected_revenue or self.ranzom_budget,
            "ranzom_work_description": self.description,
            "ranzom_start_date": fields.Date.today(),
        })
        self.write({"ranzom_client_id": partner.id})
        if self.stage_id and self.probability < 100:
            self.action_set_won_rainbowman()
        return {
            "type": "ir.actions.act_window",
            "res_model": "res.partner",
            "res_id": partner.id,
            "view_mode": "form",
            "target": "current",
        }

    def action_create_followup(self):
        self.ensure_one()
        activity = self.env["ranzom.followup"].create({
            "name": f"Follow up: {self.name}",
            "lead_id": self.id,
            "partner_id": self.partner_id.id,
            "due_date": fields.Date.context_today(self),
            "notes": self.description,
        })
        return {
            "type": "ir.actions.act_window",
            "res_model": "ranzom.followup",
            "res_id": activity.id,
            "view_mode": "form",
            "target": "current",
        }
