import { useMemo, useState } from "react";
import LeadDetail from "../components/LeadDetail";
import LeadList from "../components/LeadList";
import { Lead, LeadStatus } from "../types";
import { JiraIssueType } from "../types";

const statusFilters: Array<LeadStatus | "Alle"> = [
  "Alle",
  "Neu",
  "Qualifiziert",
  "Angebot in Vorbereitung",
  "Warten auf Feedback",
];

type LeadsPageProps = {
  leads: Lead[];
  issueTypes: JiraIssueType[];
  selectedIssueType: string;
  onChangeIssueType: (issueType: string) => void;
  onUpdateLead: (lead: Lead) => void;
};

function LeadsPage({
  leads,
  issueTypes,
  selectedIssueType,
  onChangeIssueType,
  onUpdateLead,
}: LeadsPageProps) {
  const [selectedLeadId, setSelectedLeadId] = useState(leads[0]?.id ?? "");
  const [activeFilter, setActiveFilter] = useState<LeadStatus | "Alle">("Alle");

  const filteredLeads = useMemo(() => {
    if (activeFilter === "Alle") {
      return leads;
    }
    return leads.filter((lead) => lead.status === activeFilter);
  }, [activeFilter, leads]);

  const selectedLead =
    filteredLeads.find((lead) => lead.id === selectedLeadId) ??
    filteredLeads[0];

  return (
    <div className="page-stack">
      <section className="panel filter-panel">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Lead Board</span>
            <h1>Leads zentral verwalten</h1>
          </div>

          <label className="form-field">
            <span>Work Item Type</span>
            <select
              value={selectedIssueType}
              onChange={(event) => onChangeIssueType(event.target.value)}
            >
              {issueTypes.map((type) => (
                <option key={type.id} value={type.name}>
                  {type.name}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="filter-row">
          {statusFilters.map((filter) => (
            <button
              key={filter}
              type="button"
              className={
                activeFilter === filter
                  ? "filter-chip filter-chip-active"
                  : "filter-chip"
              }
              onClick={() => {
                setActiveFilter(filter);
                const nextLead =
                  filter === "Alle"
                    ? leads[0]
                    : leads.find((lead) => lead.status === filter);
                if (nextLead) {
                  setSelectedLeadId(nextLead.id);
                }
              }}
            >
              {filter}
            </button>
          ))}
        </div>
      </section>

      <section className="leads-layout">
        <LeadList
          leads={filteredLeads}
          activeLeadId={selectedLead?.id ?? ""}
          onSelectLead={setSelectedLeadId}
        />
        {selectedLead ? (
          <LeadDetail
            lead={selectedLead}
            onLeadChange={onUpdateLead}
            onSaveLead={onUpdateLead}
          />
        ) : (
          <article className="panel empty-state">
            <span className="eyebrow">Keine Treffer</span>
            <h2>Für diesen Filter gibt es aktuell keine offenen Leads.</h2>
          </article>
        )}
      </section>
    </div>
  );
}

export default LeadsPage;
