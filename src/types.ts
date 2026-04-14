export type LeadStatus =
  | "Neu"
  | "Qualifiziert"
  | "Angebot in Vorbereitung"
  | "Warten auf Feedback";

export type Priority = "Hoch" | "Mittel" | "Niedrig";

export type LeadActivity = {
  id: string;
  label: string;
  date: string;
  type: "call" | "mail" | "note";
};

export type Lead = {
  id: string;
  status: LeadStatus;
  priority: Priority;
  createdAt: string;
  owner: string;
  company: string;
  contactName: string;
  email: string;
  phone: string;
  street: string;
  postalCode: string;
  city: string;
  locationType: string;
  offerType: string;
  portions: string;
  extraFeatures: string;
  exactMachine: string;
  notes: string;
  nextStep: string;
  estimatedValue: number;
  monthlyVolume: string;
  activity: LeadActivity[];
};

export type JiraIssueType = {
  id: string;
  name: string;
};
