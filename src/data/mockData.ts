import type { JiraIssueType, Lead } from "../types";

export const mockIssueTypes: JiraIssueType[] = [
  { id: "10001", name: "Lead" },
  { id: "10002", name: "Angebot" },
];

export const mockLeads: Lead[] = [
  {
    id: "LEAD-001",
    status: "Neu",
    priority: "Mittel",
    createdAt: "2026-04-10",
    owner: "Vertrieb",
    company: "IAV GmbH",
    contactName: "Kevin Metzner",
    email: "km@kevin-metzner.de",
    phone: "+49 175 3725263",
    street: "Manfred-von-Ardenne-Ring 20",
    postalCode: "01099",
    city: "Dresden",
    locationType: "Unternehmen/Büro",
    offerType: "Kaffee/Heißwasser/Kakao",
    portions: "30-59",
    extraFeatures: "Wassertank",
    exactMachine: "Jura GIGA X8c",
    notes: "Telefonat zur Bedarfsanalyse geplant.",
    nextStep: "Telefonat führen und Maschine festlegen.",
    estimatedValue: 3200,
    monthlyVolume: "30-59",
    activity: [
      { id: "activity-1", label: "Lead aus E-Mail importiert", date: "10.04.2026", type: "mail" },
      { id: "activity-2", label: "Anruf terminiert", date: "11.04.2026", type: "call" },
    ],
  },
  {
    id: "LEAD-002",
    status: "Qualifiziert",
    priority: "Hoch",
    createdAt: "2026-04-08",
    owner: "Vertrieb",
    company: "KaffeeKonzepte GmbH",
    contactName: "Anna Schulz",
    email: "anna.schulz@kaffeekonzepte.de",
    phone: "+49 157 1234567",
    street: "Kaffeering 12",
    postalCode: "10115",
    city: "Berlin",
    locationType: "Agentur",
    offerType: "Kaffee",
    portions: "60-99",
    extraFeatures: "Wassertank, Milchschäumer",
    exactMachine: "Siemens EQ.9",
    notes: "Maschine für 80 Portionen pro Tag wird geprüft.",
    nextStep: "Angebotstext aus Vorlage generieren.",
    estimatedValue: 5400,
    monthlyVolume: "60-99",
    activity: [
      { id: "activity-3", label: "Lead manuell angelegt", date: "08.04.2026", type: "note" },
      { id: "activity-4", label: "Angebotsanfrage diskutiert", date: "09.04.2026", type: "call" },
    ],
  },
];

export function getIssueTypesFromMock(): JiraIssueType[] {
  return mockIssueTypes;
}

export function getLeadsFromMock(issueType: string): Lead[] {
  return mockLeads.filter((lead) => issueType === "Lead" || issueType === "Angebot");
}

export function updateLeadInMock(updatedLead: Lead): Lead {
  const index = mockLeads.findIndex((lead) => lead.id === updatedLead.id);
  if (index >= 0) {
    mockLeads[index] = { ...mockLeads[index], ...updatedLead };
    return mockLeads[index];
  }
  mockLeads.unshift(updatedLead);
  return updatedLead;
}
