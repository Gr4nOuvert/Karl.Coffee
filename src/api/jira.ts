import type { Lead } from "../types";
import { getLeadsFromMock, updateLeadInMock } from "../data/mockData";

function delay(ms = 250) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function getLeads(): Promise<Lead[]> {
  await delay();
  return getLeadsFromMock();
}

export async function saveLead(lead: Lead): Promise<Lead> {
  await delay();
  return updateLeadInMock(lead);
}

export async function createQuote(leadId: string): Promise<{ quoteId: string; downloadUrl: string }> {
  await delay();
  return {
    quoteId: `QUOTE-${leadId}`,
    downloadUrl: `/mock/quotes/${leadId}`,
  };
}

export async function generateEmailFromTemplate(
  leadId: string,
): Promise<{ subject: string; body: string }> {
  await delay();
  return {
    subject: `Angebot für Lead ${leadId}`,
    body: `Hallo Team,\n\nbitte prüft dieses Angebot für Lead ${leadId} und ergänzt die finalen Details im PDF.\n\nBeste Grüße,\nKarl Coffee`,
  };
}
