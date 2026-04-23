import type { Lead } from "../../types";

export type MailPlaceholderField = {
  key: string;
  label: string;
  placeholder?: string;
};

export type MailGenerationConfig = {
  confluenceTemplateId: string;
  customEmailField: string;
  subjectTemplate: string;
  missingValueFallback: string;
  uiPlaceholders: MailPlaceholderField[];
  staticPlaceholders: Record<string, string>;
};

export const mailGenerationConfig: MailGenerationConfig = {
  confluenceTemplateId: "lead-offer-mail-v1",
  customEmailField: "E-Mail",
  subjectTemplate: "Angebot für {{company}}",
  missingValueFallback: "N/A",
  uiPlaceholders: [
    {
      key: "introLine",
      label: "Einleitung",
      placeholder: "Vielen Dank für Ihre Anfrage.",
    },
    {
      key: "cta",
      label: "Call-to-Action",
      placeholder: "Gern stimmen wir die Details im nächsten Schritt ab.",
    },
  ],
  staticPlaceholders: {},
};

export function buildLeadPlaceholderMap(lead: Lead): Record<string, string> {
  const fallbackSender = "Karl Coffee Vertrieb";
  const ownerName = lead.owner?.trim();
  const senderName = ownerName && ownerName !== "None" ? ownerName : fallbackSender;

  return {
    leadId: lead.id,
    company: lead.company,
    contactName: lead.contactName,
    senderName,
    offerType: lead.offerType,
    portions: lead.portions,
    locationType: lead.locationType,
    extraFeatures: lead.extraFeatures,
    exactMachine: lead.exactMachine || "N/A",
    notes: lead.notes || "N/A",
    nextStep: lead.nextStep || "N/A",
    estimatedValue: lead.estimatedValue.toLocaleString("de-DE"),
    monthlyVolume: lead.monthlyVolume,
    city: lead.city,
  };
}
