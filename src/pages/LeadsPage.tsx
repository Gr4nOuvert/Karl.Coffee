import { useMemo, useState } from "react";
import LeadDetail from "../components/LeadDetail";
import LeadList from "../components/LeadList";
import { Lead, LeadStatus } from "../types";

const statusFilters: Array<LeadStatus | "Alle"> = [
  "Alle",
  "Neu",
  "In Bearbeitung",
  "Angebot erzeugt",
  "Angebot versendet",
  "Angebot angenommen",
  "Geschlossen",
];

type LeadsPageProps = {
  leads: Lead[];
  onUpdateLead: (lead: Lead) => void;
};

function LeadsPage({
  leads,
  onUpdateLead,
}: LeadsPageProps) {
  const [selectedLeadId, setSelectedLeadId] = useState(leads[0]?.id ?? "");
  const [activeFilter, setActiveFilter] = useState<LeadStatus | "Alle">("Alle");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredLeads = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLocaleLowerCase("de-DE");

    return leads.filter((lead) => {
      const matchesStatus =
        activeFilter === "Alle" || lead.status === activeFilter;

      if (!matchesStatus) {
        return false;
      }

      if (!normalizedQuery) {
        return true;
      }

      const searchableText =
        `${lead.company} ${lead.contactName}`.toLocaleLowerCase("de-DE");

      return searchableText.includes(normalizedQuery);
    });
  }, [activeFilter, leads, searchQuery]);

  const selectedLead =
    filteredLeads.find((lead) => lead.id === selectedLeadId) ??
    filteredLeads[0];

  const selectedLeadStatus = selectedLead?.status;

  const handleLeadChange = (updatedLead: Lead) => {
    onUpdateLead(updatedLead);
    setSelectedLeadId(updatedLead.id);
    setActiveFilter(updatedLead.status);
  };

  return (
    <div className="page-stack leads-page">
      <section className="panel filter-panel">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Lead Board</span>
            <h1>Leads zentral verwalten</h1>
          </div>
        </div>

        <div className="filter-row">
          {statusFilters.map((filter) => (
            <button
              key={filter}
              type="button"
              className={[
                "filter-chip",
                activeFilter === filter ? "filter-chip-active" : "",
                filter !== "Alle" && selectedLeadStatus === filter
                  ? "filter-chip-current-status"
                  : "",
              ]
                .filter(Boolean)
                .join(" ")}
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
          searchQuery={searchQuery}
          onSearchQueryChange={setSearchQuery}
          onSelectLead={setSelectedLeadId}
        />
        {selectedLead ? (
          <LeadDetail lead={selectedLead} onLeadChange={handleLeadChange} />
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
