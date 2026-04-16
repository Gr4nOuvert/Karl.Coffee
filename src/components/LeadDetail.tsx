import { ChangeEvent, useState } from "react";
import {
  Lead,
  LeadStatus,
  OfferArticle,
  OfferArticleMode,
} from "../types";
import StatusPill from "./StatusPill";

type LeadDetailProps = {
  lead: Lead;
  onLeadChange: (lead: Lead) => void;
};

const leadStatusOptions: LeadStatus[] = [
  "Neu",
  "In Bearbeitung",
  "Angebot erzeugt",
  "Angebot versendet",
  "Angebot angenommen",
  "Geschlossen",
];

const machineOptions = [
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

function LeadDetail({ lead, onLeadChange }: LeadDetailProps) {
  const [expandedArticleId, setExpandedArticleId] = useState<string | null>(null);

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

  const handleFieldChange =
    (field: LeadTextField) =>
    (
      event: ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >,
    ) => {
      const value = event.target.value;
      onLeadChange({ ...lead, [field]: value });
    };

  const statusIndex = leadStatusOptions.indexOf(lead.status);
  const canMoveStatusLeft = statusIndex > 0;
  const canMoveStatusRight = statusIndex < leadStatusOptions.length - 1;

  const moveStatus = (direction: -1 | 1) => {
    const nextStatus = leadStatusOptions[statusIndex + direction];
    if (!nextStatus) {
      return;
    }

    onLeadChange({
      ...lead,
      status: nextStatus,
    });
  };

  const articles = lead.articles ?? [];

  const addArticle = () => {
    const nextArticle: OfferArticle = {
      id: `article-${Date.now()}`,
      machine: machineOptions[0],
      price: 0,
      mode: "Miete",
      extraFeatures: [],
    };

    onLeadChange({
      ...lead,
      articles: [...articles, nextArticle],
    });
    setExpandedArticleId(nextArticle.id);
  };

  const updateArticle = (
    articleId: string,
    field: keyof OfferArticle,
    value: string | number | string[],
  ) => {
    onLeadChange({
      ...lead,
      articles: articles.map((article) =>
        article.id === articleId ? { ...article, [field]: value } : article,
      ),
    });
  };

  const deleteArticle = (articleId: string) => {
    onLeadChange({
      ...lead,
      articles: articles.filter((article) => article.id !== articleId),
    });

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

  return (
    <section className="lead-detail-grid">
      <article className="panel lead-main-panel">
        <div className="lead-main-scroll">
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
                <StatusPill tone={lead.status} />
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

          <div className="lead-main-header">
            <span className="eyebrow">{lead.id}</span>
          </div>

          <div className="jira-like-fields">
            <div className="field-card field-card-compact">
              <span className="field-label">Kundeninformationen</span>
              <div className="request-form-grid">
                <label className="form-field">
                  <span>Firma</span>
                  <input
                    value={lead.company}
                    onChange={handleFieldChange("company")}
                  />
                </label>
                <label className="form-field">
                  <span>Ansprechpartner</span>
                  <input
                    value={lead.contactName}
                    onChange={handleFieldChange("contactName")}
                  />
                </label>
                <label className="form-field">
                  <span>E-Mail</span>
                  <input
                    type="email"
                    value={lead.email}
                    onChange={handleFieldChange("email")}
                  />
                </label>
                <label className="form-field">
                  <span>Telefon</span>
                  <input value={lead.phone} onChange={handleFieldChange("phone")} />
                </label>
                <label className="form-field field-span-2">
                  <span>Straße</span>
                  <input
                    value={lead.street}
                    onChange={handleFieldChange("street")}
                  />
                </label>
                <label className="form-field">
                  <span>PLZ</span>
                  <input
                    value={lead.postalCode}
                    onChange={handleFieldChange("postalCode")}
                  />
                </label>
                <label className="form-field">
                  <span>Ort</span>
                  <input value={lead.city} onChange={handleFieldChange("city")} />
                </label>
              </div>
            </div>

            <div className="field-card field-card-compact">
              <span className="field-label">Angebotsdetails</span>
              <div className="request-form-grid">
                <label className="form-field">
                  <span>Aufstellort</span>
                  <select
                    value={lead.locationType}
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
                    value={lead.offerType}
                    onChange={handleFieldChange("offerType")}
                  />
                </label>
                <label className="form-field">
                  <span>Zusatzfunktionen</span>
                  <input
                    value={lead.extraFeatures}
                    onChange={handleFieldChange("extraFeatures")}
                  />
                </label>
                <label className="form-field">
                  <span>Portionen</span>
                  <select
                    value={lead.portions}
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
              <label className="form-field">
                <textarea
                  value={lead.notes}
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
            <button type="button" className="primary-button" onClick={addArticle}>
              +
            </button>
          </div>

          <div className="offer-article-list">
            {articles.map((article, index) => {
              const isExpanded = expandedArticleId === article.id;

              return (
                <div key={article.id} className="offer-article-card">
                  <div className="offer-article-header">
                    <select
                      className="offer-machine-select"
                      value={article.machine}
                      onChange={(event) =>
                        updateArticle(article.id, "machine", event.target.value)
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
                        onClick={() =>
                          setExpandedArticleId((current) =>
                            current === article.id ? null : article.id,
                          )
                        }
                        aria-label="Artikel ein- oder ausklappen"
                      >
                        {isExpanded ? "▾" : "▸"}
                      </button>
                      <button
                        type="button"
                        className="offer-article-delete"
                        onClick={() => deleteArticle(article.id)}
                        aria-label="Artikel löschen"
                      >
                        ✕
                      </button>
                    </div>
                  </div>

                  {isExpanded ? (
                    <div className="offer-article-body">
                      <strong>Artikel {index + 1}</strong>

                      <div className="offer-article-grid offer-article-grid-compact">
                        <label className="form-field">
                          <span>Preis</span>
                          <input
                            type="number"
                            min="0"
                            step="1"
                            value={article.price}
                            onChange={(event) =>
                              updateArticle(
                                article.id,
                                "price",
                                Number(event.target.value || 0),
                              )
                            }
                          />
                        </label>

                        <label className="form-field">
                          <span>Mieten oder Kaufen</span>
                          <select
                            value={article.mode}
                            onChange={(event) =>
                              updateArticle(
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
                                onClick={() => toggleFeature(article, feature)}
                              >
                                {feature}
                              </button>
                            );
                          })}
                        </div>
                      </div>
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
        </article>
      </aside>
    </section>
  );
}

export default LeadDetail;
