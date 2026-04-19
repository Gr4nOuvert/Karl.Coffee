import { useMemo, useState } from "react";
import type { Lead } from "../../types";
import { mailGenerationConfig } from "./config";
import { generateMailFromConfluence } from "./mailService";

type MailGeneratorPanelProps = {
  lead: Lead;
};

type MailDraft = {
  to: string;
  subject: string;
  body: string;
};

function MailGeneratorPanel({ lead }: MailGeneratorPanelProps) {
  const [overrides, setOverrides] = useState<Record<string, string>>({});
  const [draft, setDraft] = useState<MailDraft | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resolvedEmail = useMemo(() => {
    return (lead.email || "").trim();
  }, [lead]);

  const handleOverrideChange = (key: string, value: string) => {
    setOverrides((current) => ({ ...current, [key]: value }));
  };

  const handleGenerate = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await generateMailFromConfluence(lead, overrides);
      setDraft(result);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Mail konnte nicht generiert werden.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <article className="panel lead-side-panel mail-generator-panel">
      <div className="section-heading">
        <div>
          <span className="eyebrow">Mail Generator</span>
          <h3>Automatische E-Mail</h3>
        </div>
        <button
          type="button"
          className="primary-button"
          onClick={handleGenerate}
          disabled={isLoading}
        >
          {isLoading ? "Lade..." : "Mail generieren"}
        </button>
      </div>

      <div className="mail-generator-meta">
        <div>
          <span className="mail-generator-label">Empfanger</span>
          <strong>{resolvedEmail || "Keine E-Mail gefunden"}</strong>
        </div>
        <div>
          <span className="mail-generator-label">Vorlage</span>
          <span>{mailGenerationConfig.confluenceTemplateId}</span>
        </div>
      </div>

      <div className="mail-generator-grid">
        {mailGenerationConfig.uiPlaceholders.map((field) => (
          <label key={field.key} className="form-field">
            <span>{field.label}</span>
            <input
              value={overrides[field.key] ?? ""}
              placeholder={field.placeholder}
              onChange={(event) => handleOverrideChange(field.key, event.target.value)}
            />
          </label>
        ))}
      </div>

      {error ? <div className="validation-box">{error}</div> : null}

      {draft ? (
        <div className="mail-generator-output">
          <label className="form-field">
            <span>Betreff</span>
            <input value={draft.subject} readOnly />
          </label>
          <label className="form-field">
            <span>Mail-Text</span>
            <textarea value={draft.body} readOnly rows={8} />
          </label>
        </div>
      ) : (
        <div className="validation-box">
          Generiere eine Mail, um Betreff und Inhalt zu sehen.
        </div>
      )}
    </article>
  );
}

export default MailGeneratorPanel;
