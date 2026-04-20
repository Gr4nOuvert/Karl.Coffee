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
  OfferArticle,
  OfferArticleMode,
  OfferArticleType,
} from "../types";
import StatusPill from "./StatusPill";
import { generateMailFromConfluence } from "../features/mailGeneration/mailService";

type LeadDetailProps = {
  lead: Lead;
  onLeadSave: (lead: Lead, changedFields: LeadChangeSet) => Promise<void> | void;
};

type OfferArticleSectionProps = {
  title: OfferArticleType;
  articles: OfferArticle[];
  expandedArticleId: string | null;
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

const coffeeMachineOptions = [
  "karl.coffeeBEAN'1plus",
  "karl.coffeeBEAN'2plus",
  "karl.coffeeBEAN'3",
  "karl.coffeeBEAN'4touch",
  "karl.coffeeBEAN'6big",
  "karl.coffeeBEAN'+milk",
  "karl.coffeeBEAN'Vplus",
  "karl.coffeeBEAN'CXT4",
  "karl.coffeeBEAN'CXT6",
  "karl.coffeeBEAN'CXT7",
  "karl.coffeeBEAN'elba",
  "karl.coffeeLINE'500",
  "karl.coffeeLINE2L",
  "karl.coffeeLINE'5L",
  "karl.coffeeLINE'2x5L",
  "karl.coffeeLINE'1.8",
  "karl.coffeeLINE'2.2",
  "karl.coffeeSPEED",
  "karl.coffeeSPEED'4",
];

const waterMachineOptions = [
  "karl.coffeeWATER'5.0",
  "karl.coffeeWATER'5.0touch",
  "karl.coffeeWATER'speed7.0",
  "karl.coffeeWATER'speed7.0touch",
  "karl.coffeeWATERspeed'6.0",
  "karl.coffeeWATER'4.0",
  "karl.coffeeWATER'tower4.0",
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
        ? originalLead.articles ?? []
        : key === "generatedOffers"
          ? originalLead.generatedOffers ?? []
          : originalLead[key];
    const nextValue =
      key === "articles"
        ? draftLead.articles ?? []
        : key === "generatedOffers"
          ? draftLead.generatedOffers ?? []
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

function getMachineOptions(articleType: OfferArticleType) {
  return articleType === "Wasser" ? waterMachineOptions : coffeeMachineOptions;
}

function isArticleSelectedForOffer(article: OfferArticle) {
  return Boolean(article.selectedForOffer);
}

function formatOfferDate(date: string) {
  return new Intl.DateTimeFormat("de-DE", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(date));
}

function getOfferTotal(offer: GeneratedOffer) {
  return offer.items.reduce(
    (sum, item) => sum + item.quantity * item.price,
    0,
  );
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
  expandedArticleId,
  onAddArticle,
  onDeleteArticle,
  onRegisterArticleCard,
  onToggleExpand,
  onToggleFeature,
  onToggleOfferSelection,
  onUpdateArticle,
}: OfferArticleSectionProps) {
  const isCoffeeSection = title === "Kaffee";
  const machineOptions = getMachineOptions(title);

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
          const isSelected = isArticleSelectedForOffer(article);

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
                  {machineOptions.map((machine) => (
                    <option key={machine} value={machine}>
                      {machine}
                    </option>
                  ))}
                </select>

                <div className="offer-article-actions">
                  <button
                    type="button"
                    className="offer-article-toggle"
                    onClick={() => onToggleExpand(article.id)}
                    aria-label="Artikel ein- oder ausklappen"
                  >
                    {isExpanded ? "▾" : "▸"}
                  </button>
                  <button
                    type="button"
                    className="offer-article-delete"
                    onClick={() => onDeleteArticle(article.id)}
                    aria-label="Artikel löschen"
                  >
                    ✕
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
                        <span className="price-input-currency">€</span>
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
                          const isActive = article.extraFeatures.includes(feature);

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

function LeadDetail({ lead, onLeadSave }: LeadDetailProps) {
  const [expandedArticleId, setExpandedArticleId] = useState<string | null>(null);
  const [draftLead, setDraftLead] = useState(lead);
  const [isSaving, setIsSaving] = useState(false);
  const [isSendingContract, setIsSendingContract] = useState(false);
  const [mailError, setMailError] = useState<string | null>(null);
  const articleCardRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useLayoutEffect(() => {
    setDraftLead(lead);
    setExpandedArticleId(null);
  }, [lead]);

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
  const selectedOfferArticles = articles.filter(isArticleSelectedForOffer);
  const coffeeArticles = articles.filter(
    (article) => getArticleType(article) === "Kaffee",
  );
  const waterArticles = articles.filter(
    (article) => getArticleType(article) === "Wasser",
  );

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

  const addArticle = (articleType: OfferArticleType) => {
    const nextArticle: OfferArticle = {
      id: `article-${Date.now()}`,
      type: articleType,
      machine: getMachineOptions(articleType)[0],
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
    updateArticle(articleId, "selectedForOffer", checked);
  };

  const registerArticleCard = (
    articleId: string,
    element: HTMLDivElement | null,
  ) => {
    articleCardRefs.current[articleId] = element;
  };

  const handleGenerateOffer = () => {
    if (selectedOfferArticles.length === 0) {
      return;
    }

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

  const handlePrepareMail = (offerId: string) => {
    console.log("[Offer Mail Placeholder]", {
      leadId: draftLead.id,
      offerId,
    });

    setDraftLead((currentLead) => ({
      ...currentLead,
      generatedOffers: (currentLead.generatedOffers ?? []).map((offer) =>
        offer.id === offerId ? { ...offer, status: "Mail vorbereitet" } : offer,
      ),
    }));
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

  const handleSendContract = async () => {
    setIsSendingContract(true);
    setMailError(null);

    try {
      const result = await generateMailFromConfluence(draftLead, {});
      if (!result.to) {
        setMailError("Keine E-Mail-Adresse gefunden.");
        return;
      }

      const subject = encodeURIComponent(result.subject);
      const body = encodeURIComponent(result.body);
      const mailtoUrl = `mailto:${encodeURIComponent(result.to)}?subject=${subject}&body=${body}`;
      window.location.href = mailtoUrl;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Mail konnte nicht generiert werden.";
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
              <button
                type="button"
                className="primary-button"
                onClick={() => void handleSendContract()}
                disabled={isSendingContract || hasUnsavedChanges}
              >
                {isSendingContract ? "Sendet..." : "Vertrag senden"}
              </button>
              {mailError ? (
                <span className="lead-toolbar-error">{mailError}</span>
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
                  <span>Straße</span>
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
              </div>
            </div>

            <div className="field-card field-card-full">
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
            expandedArticleId={expandedArticleId}
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
            expandedArticleId={expandedArticleId}
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

          <section className="offer-generation-panel">
            <div className="offer-generation-summary">
              <span className="offer-section-title">PDF-Erzeugung</span>
              <p>
                {selectedOfferArticles.length === 0
                  ? "Wähle Artikel aus, die im Angebot enthalten sein sollen."
                  : `${selectedOfferArticles.length} Artikel für das nächste Angebot ausgewählt.`}
              </p>
            </div>
            <button
              type="button"
              className="primary-button offer-generate-button"
              disabled={selectedOfferArticles.length === 0}
              onClick={handleGenerateOffer}
            >
              PDF erzeugen
            </button>
          </section>

          <section className="offer-history-panel">
            <div className="offer-section-header">
              <span className="offer-section-title">Erzeugte Angebote</span>
            </div>

            <div className="offer-history-list">
              {generatedOffers.map((offer) => (
                <div key={offer.id} className="offer-history-item">
                  <div className="offer-history-meta">
                    <strong>{offer.id}</strong>
                    <span>{formatOfferDate(offer.createdAt)}</span>
                  </div>

                  <div className="offer-history-summary">
                    <span>
                      {offer.items.length} Positionen ·{" "}
                      {getOfferTotal(offer).toLocaleString("de-DE")} EUR
                    </span>
                    <span className="offer-history-status">{offer.status}</span>
                  </div>

                  <div className="offer-history-machine-list">
                    {offer.items.map((item) => (
                      <span key={`${offer.id}-${item.articleId}`}>
                        {item.type}: {item.machine}
                      </span>
                    ))}
                  </div>

                  <div className="offer-history-actions">
                    <button
                      type="button"
                      className="secondary-button"
                      onClick={() => handleDownloadOffer(offer)}
                    >
                      Download
                    </button>
                    <button
                      type="button"
                      className="secondary-button"
                      onClick={() => handlePrepareMail(offer.id)}
                    >
                      Mail vorbereiten
                    </button>
                  </div>
                </div>
              ))}

              {generatedOffers.length === 0 ? (
                <div className="offer-empty-state">
                  <span>Noch keine Angebote erzeugt.</span>
                </div>
              ) : null}
            </div>
          </section>
        </article>
      </aside>
    </section>
  );
}

export default LeadDetail;
