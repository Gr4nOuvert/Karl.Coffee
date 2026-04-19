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
  subjectTemplate: "Angebot fur {{company}}",
  missingValueFallback: "N/A",
  uiPlaceholders: [
    {
      key: "introLine",
      label: "Einleitung",
      placeholder: "Vielen Dank fur Ihre Anfrage.",
    },
    {
      key: "cta",
      label: "Call-to-Action",
      placeholder: "Gern stimmen wir die Details im nachsten Schritt ab.",
    },
  ],
  staticPlaceholders: {
    senderName: "Karl Coffee Vertrieb",
  },
};

export function buildLeadPlaceholderMap(lead: Lead): Record<string, string> {
  return {
    leadId: lead.id,
    company: lead.company,
    contactName: lead.contactName,
    owner: lead.owner,
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
