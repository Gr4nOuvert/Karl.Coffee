import { Lead } from "../types";

type LeadListProps = {
  leads: Lead[];
  activeLeadId: string;
  searchQuery: string;
  isCreatingLead?: boolean;
  onCreateLead: () => void | Promise<void>;
  onSearchQueryChange: (value: string) => void;
  onSelectLead: (leadId: string) => void;
};

function LeadList({
  leads,
  activeLeadId,
  searchQuery,
  isCreatingLead = false,
  onCreateLead,
  onSearchQueryChange,
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

      <label className="form-field lead-search-field">
        <input
          type="search"
          value={searchQuery}
          onChange={(event) => onSearchQueryChange(event.target.value)}
          placeholder="Firma oder Kontaktperson suchen"
        />
      </label>

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
                <span className="lead-list-value">
                  {lead.estimatedValue.toLocaleString("de-DE")} EUR
                </span>
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
