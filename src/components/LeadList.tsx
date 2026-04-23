import { Lead } from "../types";

type LeadListProps = {
  leads: Lead[];
  activeLeadId: string;
  searchQuery: string;
  isCreatingLead?: boolean;
  onCreateLead: () => void | Promise<void>;
  onSearchQueryChange: (value: string) => void;
  onSearchSubmit: () => void;
  onSelectLead: (leadId: string) => void;
};

function LeadList({
  leads,
  activeLeadId,
  searchQuery,
  isCreatingLead = false,
  onCreateLead,
  onSearchQueryChange,
  onSearchSubmit,
  onSelectLead,
}: LeadListProps) {
  return (
    <article className="panel lead-list-panel">
      <div className="section-heading">
        <div>
          <span className="eyebrow">Leads</span>
        </div>
        <button
          type="button"
          className="lead-list-add-button"
          onClick={() => void onCreateLead()}
          aria-label="Neuen Lead anlegen"
          disabled={isCreatingLead}
        >
          +
        </button>
      </div>

      <form
        className="lead-search-form"
        onSubmit={(event) => {
          event.preventDefault();
          onSearchSubmit();
        }}
      >
        <label className="form-field lead-search-field">
          <input
            type="search"
            value={searchQuery}
            onChange={(event) => onSearchQueryChange(event.target.value)}
            placeholder="Firma oder Kontaktperson suchen"
          />
        </label>
        <button
          type="submit"
          className="lead-search-button"
          aria-label="Suche ausführen"
          title="Suche"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="m21 21-4.35-4.35m1.85-5.15a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </form>

      <div className="lead-list-scroll">
        <ul className="lead-list">
          {leads.map((lead) => (
            <li
              key={lead.id}
              className={`lead-list-item ${lead.id === activeLeadId ? "active" : ""}`}
              onClick={() => onSelectLead(lead.id)}
            >
              <div className="lead-list-item-top">
                <strong>{lead.company || "Neuer Lead"}</strong>
              </div>
              <span className="lead-list-contact">
                {lead.contactName || "Kontakt hinzufügen"}
              </span>
            </li>
          ))}
        </ul>

        {leads.length === 0 ? (
          <div className="lead-list-empty">
            <span className="eyebrow">Keine Treffer</span>
            <p>Zu deiner Suche gibt es aktuell keine passenden Leads.</p>
          </div>
        ) : null}
      </div>
    </article>
  );
}

export default LeadList;
