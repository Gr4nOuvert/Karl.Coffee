export type LeadStatus =
  | "Neu"
  | "In Bearbeitung"
  | "Angebot erzeugt"
  | "Angebot versendet"
  | "Angebot angenommen"
  | "Geschlossen";

export type LeadActivity = {
  id: string;
  label: string;
  date: string;
  type: "call" | "mail" | "note";
};

export type OfferArticleMode = "Miete" | "Kauf";

export type OfferArticle = {
  id: string;
  machine: string;
  price: number;
  mode: OfferArticleMode;
  extraFeatures: string[];
};

export type Lead = {
  id: string;
  status: LeadStatus;
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
  articles?: OfferArticle[];
};
