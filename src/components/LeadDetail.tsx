import { ChangeEvent } from "react";
import { Lead } from "../types";
import StatusPill from "./StatusPill";

type LeadDetailProps = {
  lead: Lead;
  onLeadChange: (lead: Lead) => void;
  onSaveLead: (lead: Lead) => void;
};

function LeadDetail({ lead, onLeadChange, onSaveLead }: LeadDetailProps) {
  const canCreateQuote = Boolean(lead.exactMachine.trim());

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
    | "portions"
    | "extraFeatures"
    | "exactMachine"
    | "notes"
    | "nextStep";

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

  const handleCreateQuote = () => {
    if (!canCreateQuote) {
      return;
    }
    onSaveLead({
      ...lead,
      status: "Angebot in Vorbereitung",
      nextStep: "Angebot im Backend anstoßen",
    });
  };

  return (
    <section className="lead-detail-grid">
      <article className="panel lead-main-panel">
        <div className="section-heading lead-main-header">
          <div>
            <span className="eyebrow">{lead.id}</span>
            <h2>{lead.company}</h2>
            <p className="lead-subtitle">
              <span>{lead.contactName}</span>
              <span className="lead-subtitle-separator" aria-hidden="true" />
              <span>{lead.email}</span>
            </p>
          </div>

          <div className="lead-badges">
            <StatusPill tone={lead.status} />
            <StatusPill tone={lead.priority} />
          </div>
        </div>

        <div className="jira-like-fields">
          <div className="field-card field-card-wide">
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
                <input
                  value={lead.phone}
                  onChange={handleFieldChange("phone")}
                />
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

          <div className="field-card field-card-wide">
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
              <label className="form-field">
                <span>Zusatzfunktionen</span>
                <input
                  value={lead.extraFeatures}
                  onChange={handleFieldChange("extraFeatures")}
                />
              </label>
            </div>
          </div>

          <div className="field-card">
            <span className="field-label">Maschine & Vorbereitung</span>
            <label className="form-field field-span-2">
              <span>Genaue Kaffeemaschine</span>
              <input
                value={lead.exactMachine}
                onChange={handleFieldChange("exactMachine")}
                placeholder="z. B. Jura GIGA X8c"
              />
            </label>
            <label className="form-field field-span-2">
              <span>Gesprächsnotizen</span>
              <textarea
                value={lead.notes}
                onChange={handleFieldChange("notes")}
                rows={5}
              />
            </label>
          </div>

          <div className="field-card">
            <span className="field-label">Aktionen</span>
            <div className="detail-actions">
              <button
                type="button"
                className="primary-button"
                onClick={handleCreateQuote}
                disabled={!canCreateQuote}
              >
                Angebot erzeugen
              </button>
              <button
                type="button"
                className="secondary-button"
                onClick={() => onSaveLead(lead)}
              >
                Lead speichern
              </button>
            </div>

            <p className="panel-copy">
              Für ein Angebot muss die exakte Kaffeemaschine eingetragen sein.
              Spätere PDF-Generierung und E-Mail-Vorlage werden hier angestoßen.
            </p>
          </div>
        </div>
      </article>

      <aside className="lead-side-stack">
        <article className="panel">
          <div className="section-heading">
            <div>
              <span className="eyebrow">Zusammenfassung</span>
              <h3>Lead-Kerndaten</h3>
            </div>
          </div>

          <div className="summary-list">
            <div>
              <span>Wert</span>
              <strong>{lead.estimatedValue.toLocaleString("de-DE")} EUR</strong>
            </div>
            <div>
              <span>Volumen</span>
              <strong>{lead.monthlyVolume}</strong>
            </div>
            <div>
              <span>Maschine</span>
              <strong>{lead.exactMachine || "Noch offen"}</strong>
            </div>
          </div>
        </article>

        <article className="panel">
          <div className="section-heading">
            <div>
              <span className="eyebrow">Aktivität</span>
              <h3>Letzte Schritte</h3>
            </div>
          </div>

          <div className="activity-list">
            {lead.activity.map((entry) => (
              <div key={entry.id} className="activity-item">
                <div
                  style={{ display: "flex", alignItems: "center", gap: "10px" }}
                >
                  <span className={`activity-dot activity-dot-${entry.type}`} />
                  <strong>{entry.label}</strong>
                </div>
                <span>{entry.date}</span>
              </div>
            ))}
          </div>
        </article>
      </aside>
    </section>
  );
}

export default LeadDetail;
