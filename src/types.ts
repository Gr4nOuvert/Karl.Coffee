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
export type OfferArticleType = "Kaffee" | "Wasser";
export type GeneratedOfferStatus = "Generiert" | "Mail vorbereitet";

export type OfferArticle = {
  id: string;
  type: OfferArticleType;
  machine: string;
  quantity: number;
  price: number;
  mode: OfferArticleMode;
  extraFeatures: string[];
  selectedForOffer?: boolean;
};

export type GeneratedOfferItem = {
  articleId: string;
  type: OfferArticleType;
  machine: string;
  quantity: number;
  price: number;
  mode: OfferArticleMode;
  extraFeatures: string[];
};

export type GeneratedOffer = {
  id: string;
  createdAt: string;
  status: GeneratedOfferStatus;
  items: GeneratedOfferItem[];
};

export type LeadFieldChange = {
  isChanged: boolean;
  isNew: boolean;
  previousValue: unknown;
  nextValue: unknown;
};

export type LeadChangeSet = Partial<Record<keyof Lead, LeadFieldChange>>;

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
  generatedOffers?: GeneratedOffer[];
  isNew?: boolean;
};
