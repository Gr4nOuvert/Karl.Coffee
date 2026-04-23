import {
  ChangeEvent,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  GeneratedOffer,
  Lead,
  LeadChangeSet,
  LeadStatus,
  MachineTemplate,
  OfferArticle,
  OfferArticleMode,
  OfferArticleType,
} from "../types";
import StatusPill from "./StatusPill";
import { generateMailFromConfluence } from "../features/mailGeneration/mailService";

type LeadDetailProps = {
  lead: Lead;
  machineTemplates: MachineTemplate[];
  onLeadSave: (
    lead: Lead,
    changedFields: LeadChangeSet,
  ) => Promise<void> | void;
};

type LeadDetailTab = "lead" | "angebote";

type FloatingNotice = {
  message: string;
  tone: "info" | "error";
};

type OfferArticleSectionProps = {
  title: OfferArticleType;
  articles: OfferArticle[];
  machineTemplates: MachineTemplate[];
  expandedArticleId: string | null;
  selectedOfferArticleIds: string[];
  onAddArticle: (articleType: OfferArticleType) => void;
  onDeleteArticle: (articleId: string) => void;
  onRegisterArticleCard: (
    articleId: string,
    element: HTMLDivElement | null,
  ) => void;
  onToggleExpand: (articleId: string) => void;
  onToggleFeature: (article: OfferArticle, feature: string) => void;
  onToggleOfferSelection: (articleId: string, checked: boolean) => void;
  onUpdateArticle: (
    articleId: string,
    field: keyof OfferArticle,
    value: string | number | string[] | boolean,
  ) => void;
};

const leadStatusOptions: LeadStatus[] = [
  "Neu",
  "In Bearbeitung",
  "Angebot erzeugt",
  "Angebot versendet",
  "Angebot angenommen",
  "Geschlossen",
];

const extraFeatureOptions = [
  "Wassertank",
  "Festwasser",
  "Milchsystem",
  "Milchschäumer",
  "Kühleinheit",
  "Doppelbohnenbehälter",
  "Münzer",
];

const offerModes: OfferArticleMode[] = ["Miete", "Kauf"];

type LeadTextField =
  | "company"
  | "contactName"
  | "email"
  | "phone"
  | "street"
  | "postalCode"
  | "city"
  | "locationType"
  | "offerType"
  | "extraFeatures"
  | "portions"
  | "owner"
  | "notes";

function areValuesEqual(valueA: unknown, valueB: unknown) {
  return JSON.stringify(valueA) === JSON.stringify(valueB);
}

function getLeadChanges(originalLead: Lead, draftLead: Lead): LeadChangeSet {
  const changedFields: LeadChangeSet = {};
  const keys = new Set<keyof Lead>([
    ...(Object.keys(originalLead) as Array<keyof Lead>),
    ...(Object.keys(draftLead) as Array<keyof Lead>),
  ]);

  keys.forEach((key) => {
    if (key === "isNew") {
      return;
    }

    const previousValue =
      key === "articles"
        ? (originalLead.articles ?? [])
        : key === "generatedOffers"
          ? (originalLead.generatedOffers ?? [])
          : originalLead[key];
    const nextValue =
      key === "articles"
        ? (draftLead.articles ?? [])
        : key === "generatedOffers"
          ? (draftLead.generatedOffers ?? [])
          : draftLead[key];

    if (!areValuesEqual(previousValue, nextValue)) {
      changedFields[key] = {
        isChanged: true,
        isNew: Boolean(draftLead.isNew),
        previousValue,
        nextValue,
      };
    }
  });

  return changedFields;
}

function getArticleType(article: OfferArticle): OfferArticleType {
  return article.type ?? "Kaffee";
}

function getMachineOptions(
  articleType: OfferArticleType,
  machineTemplates: MachineTemplate[],
  currentMachine?: string,
) {
  const matchingTemplates = machineTemplates.filter(
    (template) => template.type === articleType && template.isActive,
  );
  const options = matchingTemplates.map((template) => ({
    value: template.machineId,
    label: template.displayName,
  }));

  if (
    currentMachine &&
    !options.some((option) => option.value === currentMachine)
  ) {
    options.unshift({
      value: currentMachine,
      label: currentMachine,
    });
  }

  return options;
}

function formatOfferDate(date: string) {
  return new Intl.DateTimeFormat("de-DE", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(date));
}

function getOfferTotal(offer: GeneratedOffer) {
  return offer.items.reduce((sum, item) => sum + item.quantity * item.price, 0);
}

function getSelectedOfferArticlesTotal(articles: OfferArticle[]) {
  return articles.reduce(
    (sum, article) => sum + article.quantity * article.price,
    0,
  );
}

function formatOfferChecklistLine(offer: GeneratedOffer) {
  return `- ${offer.id}: ${offer.items.length} Positionen, ${getOfferTotal(offer).toLocaleString("de-DE")} EUR`;
}

function formatOfferMachines(offer: GeneratedOffer) {
  return [...new Set(offer.items.map((item) => item.machine))].join(" | ");
}

function formatOfferMailDetails(offer: GeneratedOffer) {
  return [
    `${offer.id} (${formatOfferDate(offer.createdAt)})`,
    `Maschinen: ${formatOfferMachines(offer) || "-"}`,
    `Positionen: ${offer.items.length}`,
    `Gesamtsumme: ${getOfferTotal(offer).toLocaleString("de-DE")} EUR`,
  ].join("\n");
}

function downloadTextFile(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = objectUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(objectUrl);
}

function OfferArticleSection({
  title,
  articles,
  machineTemplates,
  expandedArticleId,
  selectedOfferArticleIds,
  onAddArticle,
  onDeleteArticle,
  onRegisterArticleCard,
  onToggleExpand,
  onToggleFeature,
  onToggleOfferSelection,
  onUpdateArticle,
}: OfferArticleSectionProps) {
  const isCoffeeSection = title === "Kaffee";
  const sectionMachineOptions = getMachineOptions(title, machineTemplates);

  return (
    <section className="offer-section">
      <div className="offer-section-header">
        <span className="offer-section-title">{title}</span>
        <button
          type="button"
          className="primary-button"
          onClick={() => onAddArticle(title)}
          aria-label={`${title}-Angebot hinzufügen`}
        >
          +
        </button>
      </div>

      <div className="offer-article-list">
        {articles.map((article, index) => {
          const isExpanded = expandedArticleId === article.id;
          const isSelected = selectedOfferArticleIds.includes(article.id);

          return (
            <div
              key={article.id}
              className={
                isSelected
                  ? "offer-article-card offer-article-card-selected"
                  : "offer-article-card"
              }
              ref={(element) => onRegisterArticleCard(article.id, element)}
            >
              <div className="offer-article-header">
                <select
                  className="offer-machine-select"
                  value={article.machine}
                  onChange={(event) =>
                    onUpdateArticle(article.id, "machine", event.target.value)
                  }
                >
                  {getMachineOptions(
                    title,
                    machineTemplates,
                    article.machine,
                  ).map((machine) => (
                    <option key={machine.value} value={machine.value}>
                      {machine.label}
                    </option>
                  ))}
                  {sectionMachineOptions.length === 0 ? (
                    <option value="">Keine aktive Maschine angelegt</option>
                  ) : null}
                </select>

                <div className="offer-article-actions">
                  <button
                    type="button"
                    className="offer-article-toggle"
                    onClick={() => onToggleExpand(article.id)}
                    aria-label="Artikel ein- oder ausklappen"
                  >
                    {isExpanded ? "v" : ">"}
                  </button>
                  <button
                    type="button"
                    className="offer-article-delete"
                    onClick={() => onDeleteArticle(article.id)}
                    aria-label="Artikel löschen"
                  >
                    x
                  </button>
                </div>
              </div>

              <label className="offer-article-selection">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={(event) =>
                    onToggleOfferSelection(article.id, event.target.checked)
                  }
                />
                <span>Für PDF-Angebot auswählen</span>
              </label>

              {isExpanded ? (
                <div className="offer-article-body">
                  <strong>Artikel {index + 1}</strong>

                  <div className="offer-article-grid offer-article-grid-compact">
                    <label className="form-field">
                      <span>Anzahl</span>
                      <input
                        type="number"
                        min="1"
                        step="1"
                        value={article.quantity}
                        onChange={(event) =>
                          onUpdateArticle(
                            article.id,
                            "quantity",
                            Math.max(1, Number(event.target.value || 1)),
                          )
                        }
                      />
                    </label>

                    <label className="form-field">
                      <span>Preis</span>
                      <div className="price-input-wrap">
                        <input
                          type="number"
                          min="0"
                          step="1"
                          value={article.price === 0 ? "" : article.price}
                          placeholder="0"
                          onChange={(event) =>
                            onUpdateArticle(
                              article.id,
                              "price",
                              Number(event.target.value || 0),
                            )
                          }
                        />
                        <span className="price-input-currency">EUR</span>
                      </div>
                    </label>

                    <label className="form-field">
                      <span>Mieten oder Kaufen</span>
                      <select
                        value={article.mode}
                        onChange={(event) =>
                          onUpdateArticle(
                            article.id,
                            "mode",
                            event.target.value as OfferArticleMode,
                          )
                        }
                      >
                        {offerModes.map((mode) => (
                          <option key={mode} value={mode}>
                            {mode}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>

                  {isCoffeeSection ? (
                    <div className="form-field">
                      <span>Zusatzfunktionen</span>
                      <div className="offer-feature-list">
                        {extraFeatureOptions.map((feature) => {
                          const isActive =
                            article.extraFeatures.includes(feature);

                          return (
                            <button
                              key={feature}
                              type="button"
                              className={
                                isActive
                                  ? "offer-feature-chip offer-feature-chip-active"
                                  : "offer-feature-chip"
                              }
                              onClick={() => onToggleFeature(article, feature)}
                            >
                              {feature}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>
          );
        })}

        {articles.length === 0 ? (
          <div className="offer-empty-state">
            <span>Noch keine Artikel angelegt.</span>
          </div>
        ) : null}
      </div>
    </section>
  );
}

function LeadDetail({ lead, machineTemplates, onLeadSave }: LeadDetailProps) {
  const [activeTab, setActiveTab] = useState<LeadDetailTab>("lead");
  const [expandedArticleId, setExpandedArticleId] = useState<string | null>(
    null,
  );
  const [draftLead, setDraftLead] = useState(lead);
  const [isSaving, setIsSaving] = useState(false);
  const [isSendingContract, setIsSendingContract] = useState(false);
  const [mailError, setMailError] = useState<string | null>(null);
  const [offerActionNotice, setOfferActionNotice] = useState<string | null>(
    null,
  );
  const [floatingNotice, setFloatingNotice] = useState<FloatingNotice | null>(
    null,
  );
  const [selectedOfferArticleIds, setSelectedOfferArticleIds] = useState<
    string[]
  >([]);
  const [confirmingDeleteOfferId, setConfirmingDeleteOfferId] = useState<
    string | null
  >(null);
  const [selectedMailOfferIds, setSelectedMailOfferIds] = useState<string[]>(
    [],
  );
  const articleCardRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useLayoutEffect(() => {
    setDraftLead(lead);
  }, [lead]);

  useLayoutEffect(() => {
    setExpandedArticleId(null);
    setActiveTab("lead");
    setSelectedOfferArticleIds(
      (lead.articles ?? [])
        .filter((article) => Boolean(article.selectedForOffer))
        .map((article) => article.id),
    );
    setSelectedMailOfferIds((lead.generatedOffers ?? []).map((offer) => offer.id));
    setOfferActionNotice(null);
    setMailError(null);
    setFloatingNotice(null);
    setConfirmingDeleteOfferId(null);
  }, [lead.id]);

  useEffect(() => {
    if (!offerActionNotice) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setOfferActionNotice(null);
    }, 2800);

    return () => window.clearTimeout(timeoutId);
  }, [offerActionNotice]);

  useEffect(() => {
    if (!floatingNotice) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setFloatingNotice(null);
    }, 2600);

    return () => window.clearTimeout(timeoutId);
  }, [floatingNotice]);

  useEffect(() => {
    if (!expandedArticleId) {
      return;
    }

    const handleInteractionOutside = (event: MouseEvent | FocusEvent) => {
      const expandedCard = articleCardRefs.current[expandedArticleId];
      const target = event.target;

      if (!expandedCard || !(target instanceof Node)) {
        return;
      }

      if (expandedCard.contains(target)) {
        return;
      }

      setExpandedArticleId(null);
    };

    document.addEventListener("mousedown", handleInteractionOutside);
    document.addEventListener("focusin", handleInteractionOutside);

    return () => {
      document.removeEventListener("mousedown", handleInteractionOutside);
      document.removeEventListener("focusin", handleInteractionOutside);
    };
  }, [expandedArticleId]);

  const handleFieldChange =
    (field: LeadTextField) =>
    (
      event: ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >,
    ) => {
      const value = event.target.value;
      setDraftLead((currentLead) => ({ ...currentLead, [field]: value }));
    };

  const changedFields = useMemo(
    () => getLeadChanges(lead, draftLead),
    [draftLead, lead],
  );
  const hasUnsavedChanges =
    Boolean(draftLead.isNew) || Object.keys(changedFields).length > 0;
  const statusIndex = leadStatusOptions.indexOf(draftLead.status);
  const canMoveStatusLeft = statusIndex > 0;
  const canMoveStatusRight = statusIndex < leadStatusOptions.length - 1;
  const articles = draftLead.articles ?? [];
  const generatedOffers = draftLead.generatedOffers ?? [];
  const selectedOfferArticles = articles.filter((article) =>
    selectedOfferArticleIds.includes(article.id),
  );
  const selectedOfferArticlesTotal = getSelectedOfferArticlesTotal(
    selectedOfferArticles,
  );
  const selectedMailOffers = generatedOffers.filter((offer) =>
    selectedMailOfferIds.includes(offer.id),
  );
  const offerToDelete =
    generatedOffers.find((offer) => offer.id === confirmingDeleteOfferId) ?? null;
  const coffeeArticles = articles.filter(
    (article) => getArticleType(article) === "Kaffee",
  );
  const waterArticles = articles.filter(
    (article) => getArticleType(article) === "Wasser",
  );

  useEffect(() => {
    setSelectedMailOfferIds((currentSelectedIds) => {
      const generatedOfferIds = generatedOffers.map((offer) => offer.id);
      const remainingIds = currentSelectedIds.filter((offerId) =>
        generatedOfferIds.includes(offerId),
      );
      const newIds = generatedOfferIds.filter(
        (offerId) => !remainingIds.includes(offerId),
      );

      if (
        currentSelectedIds.length === remainingIds.length &&
        newIds.length === 0
      ) {
        return currentSelectedIds;
      }

      return [...remainingIds, ...newIds];
    });
  }, [generatedOffers]);

  const moveStatus = (direction: -1 | 1) => {
    const nextStatus = leadStatusOptions[statusIndex + direction];
    if (!nextStatus) {
      return;
    }

    setDraftLead((currentLead) => ({
      ...currentLead,
      status: nextStatus,
    }));
  };

  const showFloatingNotice = (
    message: string,
    tone: FloatingNotice["tone"] = "info",
  ) => {
    setFloatingNotice((currentNotice) => {
      if (currentNotice?.message === message && currentNotice.tone === tone) {
        return currentNotice;
      }

      return { message, tone };
    });
  };

  const addArticle = (articleType: OfferArticleType) => {
    const machineOptions = getMachineOptions(articleType, machineTemplates);
    const nextArticle: OfferArticle = {
      id: `article-${Date.now()}`,
      type: articleType,
      machine: machineOptions[0]?.value ?? "",
      quantity: 1,
      price: 0,
      mode: "Miete",
      extraFeatures: [],
      selectedForOffer: false,
    };

    setDraftLead((currentLead) => ({
      ...currentLead,
      articles: [...(currentLead.articles ?? []), nextArticle],
    }));
    setExpandedArticleId(nextArticle.id);
  };

  const updateArticle = (
    articleId: string,
    field: keyof OfferArticle,
    value: string | number | string[] | boolean,
  ) => {
    setDraftLead((currentLead) => ({
      ...currentLead,
      articles: (currentLead.articles ?? []).map((article) =>
        article.id === articleId ? { ...article, [field]: value } : article,
      ),
    }));
  };

  const deleteArticle = (articleId: string) => {
    setDraftLead((currentLead) => ({
      ...currentLead,
      articles: (currentLead.articles ?? []).filter(
        (article) => article.id !== articleId,
      ),
    }));
    setSelectedOfferArticleIds((currentSelectedIds) =>
      currentSelectedIds.filter((currentArticleId) => currentArticleId !== articleId),
    );

    if (expandedArticleId === articleId) {
      setExpandedArticleId(null);
    }
  };

  const toggleFeature = (article: OfferArticle, feature: string) => {
    const hasFeature = article.extraFeatures.includes(feature);
    const nextFeatures = hasFeature
      ? article.extraFeatures.filter((entry) => entry !== feature)
      : [...article.extraFeatures, feature];

    updateArticle(article.id, "extraFeatures", nextFeatures);
  };

  const toggleOfferSelection = (articleId: string, checked: boolean) => {
    setSelectedOfferArticleIds((currentSelectedIds) =>
      checked
        ? currentSelectedIds.includes(articleId)
          ? currentSelectedIds
          : [...currentSelectedIds, articleId]
        : currentSelectedIds.filter((currentArticleId) => currentArticleId !== articleId),
    );
  };

  const registerArticleCard = (
    articleId: string,
    element: HTMLDivElement | null,
  ) => {
    articleCardRefs.current[articleId] = element;
  };

  const handleGenerateOffer = () => {
    if (selectedOfferArticles.length === 0) {
      setOfferActionNotice(
        "Bitte wähle mindestens einen Artikel für das PDF aus.",
      );
      return;
    }

    setOfferActionNotice(null);

    const nextOfferNumber = generatedOffers.length + 1;
    const nextOffer: GeneratedOffer = {
      id: `ANG-${draftLead.id}-${String(nextOfferNumber).padStart(2, "0")}`,
      createdAt: new Date().toISOString(),
      status: "Generiert",
      items: selectedOfferArticles.map((article) => ({
        articleId: article.id,
        type: getArticleType(article),
        machine: article.machine,
        quantity: article.quantity,
        price: article.price,
        mode: article.mode,
        extraFeatures: article.extraFeatures,
      })),
    };

    console.log("[Offer PDF Placeholder]", {
      leadId: draftLead.id,
      offerId: nextOffer.id,
      items: nextOffer.items,
    });

    setDraftLead((currentLead) => ({
      ...currentLead,
      generatedOffers: [nextOffer, ...(currentLead.generatedOffers ?? [])],
    }));
    setActiveTab("angebote");
  };

  const handleDownloadOffer = (offer: GeneratedOffer) => {
    const lines = [
      `Angebot: ${offer.id}`,
      `Lead: ${draftLead.id}`,
      `Firma: ${draftLead.company || "-"}`,
      `Ansprechpartner: ${draftLead.contactName || "-"}`,
      `Erzeugt am: ${formatOfferDate(offer.createdAt)}`,
      `Status: ${offer.status}`,
      "",
      "Positionen:",
      ...offer.items.map(
        (item, index) =>
          `${index + 1}. ${item.type} | ${item.machine} | Anzahl ${item.quantity} | ${item.mode} | ${item.price.toLocaleString("de-DE")} EUR`,
      ),
      "",
      `Gesamtsumme: ${getOfferTotal(offer).toLocaleString("de-DE")} EUR`,
    ];

    downloadTextFile(`${offer.id}.txt`, lines.join("\n"));
  };

  const handleDeleteOffer = (offerId: string) => {
    setDraftLead((currentLead) => ({
      ...currentLead,
      generatedOffers: (currentLead.generatedOffers ?? []).filter(
        (offer) => offer.id !== offerId,
      ),
    }));
    setSelectedMailOfferIds((currentSelectedIds) =>
      currentSelectedIds.filter((currentOfferId) => currentOfferId !== offerId),
    );
  };

  const handleConfirmDeleteOffer = () => {
    if (!confirmingDeleteOfferId) {
      return;
    }

    handleDeleteOffer(confirmingDeleteOfferId);
    setConfirmingDeleteOfferId(null);
  };

  const toggleMailOfferSelection = (offerId: string) => {
    setSelectedMailOfferIds((currentSelectedIds) =>
      currentSelectedIds.includes(offerId)
        ? currentSelectedIds.filter((currentOfferId) => currentOfferId !== offerId)
        : [...currentSelectedIds, offerId],
    );
  };

  const handleSave = async () => {
    if (!hasUnsavedChanges) {
      return;
    }

    setIsSaving(true);

    try {
      await onLeadSave(
        {
          ...draftLead,
          isNew: false,
        },
        changedFields,
      );
      setDraftLead((currentLead) => ({
        ...currentLead,
        isNew: false,
      }));
    } finally {
      setIsSaving(false);
    }
  };

  const handlePrepareMail = async () => {
    if (generatedOffers.length === 0) {
      showFloatingNotice(
        "Erzeuge zuerst ein Angebot, bevor du eine E-Mail vorbereitest.",
        "info",
      );
      return;
    }

    if (selectedMailOffers.length === 0) {
      showFloatingNotice(
        "Bitte wähle mindestens ein Angebot für die E-Mail aus.",
        "info",
      );
      return;
    }

    setIsSendingContract(true);
    setMailError(null);

    try {
      const result = await generateMailFromConfluence(draftLead, {});
      if (!result.to) {
        setMailError("Keine E-Mail-Adresse gefunden.");
        return;
      }

      const mailOfferChecklist = [
        "",
        "Ausgewählte Angebote:",
        ...selectedMailOffers.flatMap((offer) => [
          formatOfferChecklistLine(offer),
          formatOfferMailDetails(offer),
          "",
        ]),
      ].join("\n");
      const subject = encodeURIComponent(result.subject);
      const body = encodeURIComponent(`${result.body}${mailOfferChecklist}`);
      const mailtoUrl = `mailto:${encodeURIComponent(result.to)}?subject=${subject}&body=${body}`;

      console.log("[Offer Mail Placeholder]", {
        leadId: draftLead.id,
        offerIds: selectedMailOffers.map((offer) => offer.id),
      });

      setDraftLead((currentLead) => ({
        ...currentLead,
        generatedOffers: (currentLead.generatedOffers ?? []).map((offer) =>
          selectedMailOfferIds.includes(offer.id)
            ? { ...offer, status: "Mail vorbereitet" }
            : offer,
        ),
      }));

      window.location.href = mailtoUrl;
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Mail konnte nicht generiert werden.";
      setMailError(message);
    } finally {
      setIsSendingContract(false);
    }
  };

  return (
    <section className="lead-detail-grid">
      <article className="panel lead-main-panel">
        <div className="lead-main-scroll">
          <div className="lead-detail-toolbar">
            <div className="lead-main-header">
              <span className="eyebrow">{draftLead.id}</span>
            </div>
            <div className="lead-detail-toolbar-actions">
              {hasUnsavedChanges ? (
                <button
                  type="button"
                  className="primary-button"
                  onClick={() => void handleSave()}
                  disabled={isSaving}
                >
                  {isSaving ? "Speichert..." : "Speichern"}
                </button>
              ) : null}
              <div className="lead-status-control">
                <div className="lead-status-stepper">
                  <button
                    type="button"
                    className="lead-status-arrow"
                    onClick={() => moveStatus(-1)}
                    disabled={!canMoveStatusLeft}
                    aria-label="Vorherigen Status wählen"
                  >
                    &#8592;
                  </button>
                  <div className="lead-status-current">
                    <StatusPill tone={draftLead.status} />
                  </div>
                  <button
                    type="button"
                    className="lead-status-arrow"
                    onClick={() => moveStatus(1)}
                    disabled={!canMoveStatusRight}
                    aria-label="Nächsten Status wählen"
                  >
                    &#8594;
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="lead-detail-tabs">
            <button
              type="button"
              className={
                activeTab === "lead"
                  ? "lead-detail-tab lead-detail-tab-active"
                  : "lead-detail-tab"
              }
              onClick={() => setActiveTab("lead")}
            >
              <span>Lead</span>
            </button>
            <button
              type="button"
              className={
                activeTab === "angebote"
                  ? "lead-detail-tab lead-detail-tab-active"
                  : "lead-detail-tab"
              }
              onClick={() => setActiveTab("angebote")}
            >
              <span>Angebote</span>
              <span className="lead-detail-tab-badge">
                {generatedOffers.length}
              </span>
            </button>
          </div>

          {activeTab === "lead" ? (
            <div className="jira-like-fields">
              <div className="field-card field-card-compact">
                <span className="field-label">Kundeninformationen</span>
                <div className="request-form-grid">
                  <label className="form-field">
                    <span>Firma</span>
                    <input
                      value={draftLead.company}
                      onChange={handleFieldChange("company")}
                    />
                  </label>
                  <label className="form-field">
                    <span>Ansprechpartner</span>
                    <input
                      value={draftLead.contactName}
                      onChange={handleFieldChange("contactName")}
                    />
                  </label>
                  <label className="form-field">
                    <span>E-Mail</span>
                    <input
                      type="email"
                      value={draftLead.email}
                      onChange={handleFieldChange("email")}
                    />
                  </label>
                  <label className="form-field">
                    <span>Telefon</span>
                    <input
                      value={draftLead.phone}
                      onChange={handleFieldChange("phone")}
                    />
                  </label>
                  <label className="form-field field-span-2">
                    <span>Strasse</span>
                    <input
                      value={draftLead.street}
                      onChange={handleFieldChange("street")}
                    />
                  </label>
                  <label className="form-field">
                    <span>PLZ</span>
                    <input
                      value={draftLead.postalCode}
                      onChange={handleFieldChange("postalCode")}
                    />
                  </label>
                  <label className="form-field">
                    <span>Ort</span>
                    <input
                      value={draftLead.city}
                      onChange={handleFieldChange("city")}
                    />
                  </label>
                </div>
              </div>

              <div className="lead-fields-right">
                <div className="field-card field-card-compact">
                  <span className="field-label">Angebotsdetails</span>
                  <div className="request-form-grid">
                    <label className="form-field">
                      <span>Aufstellort</span>
                      <select
                        value={draftLead.locationType}
                        onChange={handleFieldChange("locationType")}
                      >
                        <option>Unternehmen/Büro</option>
                        <option>Kanzlei/Büro</option>
                        <option>Agentur</option>
                        <option>Praxis</option>
                      </select>
                    </label>
                    <label className="form-field">
                      <span>Angebot</span>
                      <input
                        value={draftLead.offerType}
                        onChange={handleFieldChange("offerType")}
                      />
                    </label>
                    <label className="form-field">
                      <span>Zusatzfunktionen</span>
                      <input
                        value={draftLead.extraFeatures}
                        onChange={handleFieldChange("extraFeatures")}
                      />
                    </label>
                    <label className="form-field">
                      <span>Portionen</span>
                      <select
                        value={draftLead.portions}
                        onChange={handleFieldChange("portions")}
                      >
                        <option>10-29</option>
                        <option>30-59</option>
                        <option>60-99</option>
                        <option>100+</option>
                      </select>
                    </label>
                    <label className="form-field">
                      <span>Bearbeiter</span>
                      <select
                        value={draftLead.owner}
                        onChange={handleFieldChange("owner")}
                      >
                        <option>Karl Hübner</option>
                        <option>Manja Hübner</option>
                      </select>
                    </label>
                  </div>
                </div>
              </div>

              <div className="field-card field-card-full lead-notes-card">
                <span className="field-label">Gesprächsnotizen</span>
                <label className="form-field lead-notes-field">
                  <textarea
                    value={draftLead.notes}
                    onChange={handleFieldChange("notes")}
                    rows={6}
                  />
                </label>
              </div>
                </div>
          ) : (
            <div className="lead-offer-tab-content">
              <section className="offer-generation-panel offer-panel-inline">
                <div className="offer-section-header">
                  <div className="offer-generation-summary">
                    <span className="offer-section-title">PDF-Erzeugung</span>
                    <p>
                      {selectedOfferArticles.length === 0
                        ? "Wähle rechts Artikel aus, die im Angebot enthalten sein sollen."
                        : `${selectedOfferArticles.length} Artikel ausgewählt · ${selectedOfferArticlesTotal.toLocaleString("de-DE")} EUR.`}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="primary-button offer-generate-button offer-generate-button-compact"
                    onClick={handleGenerateOffer}
                  >
                    PDF erzeugen
                  </button>
                </div>
                {offerActionNotice ? (
                  <div className="offer-inline-notice">{offerActionNotice}</div>
                ) : null}
              </section>

              <section className="offer-mail-panel offer-panel-inline">
                <div className="offer-section-header">
                  <div className="offer-generation-summary">
                    <span className="offer-section-title">E-Mail vorbereiten</span>
                    <p>
                      {generatedOffers.length === 0
                        ? "Erzeuge zuerst ein Angebot, damit du es für die E-Mail auswählen kannst."
                        : `Wähle unten die Angebote aus, die in die E-Mail übernommen werden sollen. Aktuell ausgewählt: ${selectedMailOffers.length}.`}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="primary-button offer-mail-prepare-button"
                    onClick={() => void handlePrepareMail()}
                    disabled={isSendingContract}
                  >
                    {isSendingContract ? "Bereitet vor..." : "E-Mail vorbereiten"}
                  </button>
                </div>

                {mailError ? (
                  <div className="offer-inline-notice offer-inline-notice-error">
                    {mailError}
                  </div>
                ) : null}
              </section>

              <section className="offer-history-panel offer-panel-inline">
                <div className="offer-section-header">
                  <span className="offer-section-title">Erzeugte Angebote</span>
                </div>

                <div className="offer-history-list">
                  {generatedOffers.map((offer) => (
                    <div
                      key={offer.id}
                      className={
                        selectedMailOfferIds.includes(offer.id)
                          ? "offer-history-item offer-history-item-selected"
                          : "offer-history-item"
                      }
                    >
                      <input
                        type="checkbox"
                        className="offer-history-checkbox"
                        checked={selectedMailOfferIds.includes(offer.id)}
                        onChange={() => toggleMailOfferSelection(offer.id)}
                        aria-label={`${offer.id} für E-Mail auswählen`}
                      />
                      <strong className="offer-history-name">{offer.id}</strong>
                      <span
                        className="offer-history-machines"
                        title={formatOfferMachines(offer)}
                      >
                        {formatOfferMachines(offer)}
                      </span>
                      <span className="offer-history-time">
                        {formatOfferDate(offer.createdAt)}
                      </span>
                      <button
                        type="button"
                        className="secondary-button offer-history-download-button"
                        onClick={() => handleDownloadOffer(offer)}
                        aria-label={`${offer.id} herunterladen`}
                        title="Herunterladen"
                      >
                        <svg
                          className="offer-history-download-icon"
                          viewBox="0 0 24 24"
                          aria-hidden="true"
                        >
                          <path
                            d="M12 3v10m0 0 4-4m-4 4-4-4M5 15v3a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-3"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </button>
                      <button
                        type="button"
                        className="secondary-button offer-history-delete-button"
                        onClick={() => setConfirmingDeleteOfferId(offer.id)}
                        aria-label={`${offer.id} löschen`}
                        title="Löschen"
                      >
                        <svg
                          className="offer-history-delete-icon"
                          viewBox="0 0 24 24"
                          aria-hidden="true"
                        >
                          <path
                            d="M4 7h16m-10 0V5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2m-7 0 1 11a1 1 0 0 0 1 .91h6a1 1 0 0 0 1-.91L17 7M10 11v5m4-5v5"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </button>
                    </div>
                  ))}

                  {generatedOffers.length === 0 ? (
                    <div className="offer-empty-state">
                      <span>Noch keine Angebote erzeugt.</span>
                    </div>
                  ) : null}
                </div>
              </section>
            </div>
          )}
        </div>
      </article>

      <aside className="lead-side-stack">
        <article className="panel lead-side-panel">
          <div className="section-heading">
            <span className="eyebrow">Angebot</span>
          </div>

          <OfferArticleSection
            title="Kaffee"
            articles={coffeeArticles}
            machineTemplates={machineTemplates}
            expandedArticleId={expandedArticleId}
            selectedOfferArticleIds={selectedOfferArticleIds}
            onAddArticle={addArticle}
            onDeleteArticle={deleteArticle}
            onRegisterArticleCard={registerArticleCard}
            onToggleExpand={(articleId) =>
              setExpandedArticleId((current) =>
                current === articleId ? null : articleId,
              )
            }
            onToggleFeature={toggleFeature}
            onToggleOfferSelection={toggleOfferSelection}
            onUpdateArticle={updateArticle}
          />

          <OfferArticleSection
            title="Wasser"
            articles={waterArticles}
            machineTemplates={machineTemplates}
            expandedArticleId={expandedArticleId}
            selectedOfferArticleIds={selectedOfferArticleIds}
            onAddArticle={addArticle}
            onDeleteArticle={deleteArticle}
            onRegisterArticleCard={registerArticleCard}
            onToggleExpand={(articleId) =>
              setExpandedArticleId((current) =>
                current === articleId ? null : articleId,
              )
            }
            onToggleFeature={toggleFeature}
            onToggleOfferSelection={toggleOfferSelection}
            onUpdateArticle={updateArticle}
          />
        </article>
      </aside>

      {offerToDelete ? (
        <div
          className="settings-modal-backdrop"
          onClick={() => setConfirmingDeleteOfferId(null)}
        >
          <div
            className="settings-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="offer-delete-modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <span className="eyebrow">Angebot löschen</span>
            <h3 id="offer-delete-modal-title">{offerToDelete.id}</h3>
            <p>
              Möchtest du dieses erzeugte Angebot wirklich löschen? Dieser
              Schritt kann nicht automatisch rückgängig gemacht werden.
            </p>
            <div className="settings-modal-actions">
              <button
                type="button"
                className="secondary-button"
                onClick={() => setConfirmingDeleteOfferId(null)}
              >
                Abbrechen
              </button>
              <button
                type="button"
                className="secondary-button danger-button"
                onClick={handleConfirmDeleteOffer}
              >
                Löschen
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {floatingNotice ? (
        <div
          className={
            floatingNotice.tone === "error"
              ? "floating-notice floating-notice-error"
              : "floating-notice"
          }
          role="status"
          aria-live="polite"
        >
          {floatingNotice.message}
        </div>
      ) : null}
    </section>
  );
}

export default LeadDetail;
