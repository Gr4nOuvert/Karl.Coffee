import type { Lead } from "../../types";
import { getConfluenceTemplate } from "../../api/confluence";
import { buildLeadPlaceholderMap, mailGenerationConfig } from "./config";

export type MailGenerationResult = {
  to: string;
  subject: string;
  body: string;
};

export type MailGenerationOverrides = Record<string, string>;

function resolveRecipientEmail(lead: Lead): string {
  const fromCustomField = lead.email;
  return (fromCustomField || lead.email || "").trim();
}

function replacePlaceholders(template: string, values: Record<string, string>): string {
  return template.replace(/\{\{\s*([\w.-]+)\s*\}\}/g, (_match, key: string) => {
    return values[key] ?? mailGenerationConfig.missingValueFallback;
  });
}

export async function generateMailFromConfluence(
  lead: Lead,
  overrides: MailGenerationOverrides,
): Promise<MailGenerationResult> {
  const template = await getConfluenceTemplate(
    mailGenerationConfig.confluenceTemplateId,
  );

  const placeholderValues: Record<string, string> = {
    ...buildLeadPlaceholderMap(lead),
    ...(lead.email ? { "E-Mail": lead.email } : {}),
    ...mailGenerationConfig.staticPlaceholders,
    ...overrides,
  };

  const subject = replacePlaceholders(
    mailGenerationConfig.subjectTemplate,
    placeholderValues,
  );
  const body = replacePlaceholders(template, placeholderValues);

  return {
    to: resolveRecipientEmail(lead),
    subject,
    body,
  };
}
