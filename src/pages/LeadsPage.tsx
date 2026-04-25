import { useEffect, useMemo, useRef, useState } from "react";
import LeadDetail from "../components/LeadDetail";
import LeadList from "../components/LeadList";
import { Lead, LeadChangeSet, LeadStatus, MachineTemplate } from "../types";

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
  machineTemplates: MachineTemplate[];
  onCreateLead: () => Promise<Lead>;
  onDiscardLead: (leadId: string) => void;
  onSaveLead: (lead: Lead, changedFields: LeadChangeSet) => Promise<void>;
};

function filterLeads(
  leads: Lead[],
  activeFilter: LeadStatus | "Alle",
  searchQuery: string,
) {
  const normalizedQuery = searchQuery.trim().toLocaleLowerCase("de-DE");

  if (normalizedQuery) {
    return leads.filter((lead) => {
      const searchableText =
        `${lead.company} ${lead.contactName}`.toLocaleLowerCase("de-DE");

      return searchableText.includes(normalizedQuery);
    });
  }

  return leads.filter(
    (lead) => activeFilter === "Alle" || lead.status === activeFilter,
  );
}

function LeadsPage({
  leads,
  machineTemplates,
  onCreateLead,
  onDiscardLead,
  onSaveLead,
}: LeadsPageProps) {
  const [selectedLeadId, setSelectedLeadId] = useState(leads[0]?.id ?? "");
  const [activeFilter, setActiveFilter] = useState<LeadStatus | "Alle">("Alle");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [isCreatingLead, setIsCreatingLead] = useState(false);
  const onDiscardLeadRef = useRef(onDiscardLead);
  const pendingDiscardLeadIdRef = useRef<string | null>(null);
  const effectiveSearchQuery = isSearchActive ? searchQuery : "";

  const filteredLeads = useMemo(
    () => filterLeads(leads, activeFilter, effectiveSearchQuery),
    [activeFilter, effectiveSearchQuery, leads],
  );
  const focusedLead =
    leads.find((lead) => lead.id === selectedLeadId) ?? leads[0];

  const selectedLead =
    filteredLeads.find((lead) => lead.id === selectedLeadId) ??
    filteredLeads[0];

  const selectedLeadStatus = selectedLead?.status;

  useEffect(() => {
    onDiscardLeadRef.current = onDiscardLead;
  }, [onDiscardLead]);

  useEffect(() => {
    pendingDiscardLeadIdRef.current = focusedLead?.isNew ? focusedLead.id : null;
  }, [focusedLead]);

  useEffect(() => {
    return () => {
      if (pendingDiscardLeadIdRef.current) {
        onDiscardLeadRef.current(pendingDiscardLeadIdRef.current);
      }
    };
  }, []);

  const handleLeadSave = async (
    updatedLead: Lead,
    changedFields: LeadChangeSet,
  ) => {
    setSelectedLeadId(updatedLead.id);
    setActiveFilter(updatedLead.status);
    await onSaveLead(updatedLead, changedFields);
  };

  const getNextVisibleLeadId = (
    nextFilter: LeadStatus | "Alle",
    nextSearchQuery: string,
    leadsToDisplay: Lead[],
  ) => filterLeads(leadsToDisplay, nextFilter, nextSearchQuery)[0]?.id ?? "";

  const discardFocusedLeadIfNeeded = (
    nextFilter: LeadStatus | "Alle",
    nextSearchQuery: string,
    nextSelectedId: string,
  ) => {
    if (!focusedLead?.isNew) {
      return false;
    }

    const normalizedQuery = nextSearchQuery.trim().toLocaleLowerCase("de-DE");
    const searchableText =
      `${focusedLead.company} ${focusedLead.contactName}`.toLocaleLowerCase("de-DE");
    const staysVisible =
      normalizedQuery.length > 0
        ? searchableText.includes(normalizedQuery)
        : nextFilter === "Alle" || focusedLead.status === nextFilter;
    const keepsFocus = nextSelectedId === focusedLead.id;

    if (staysVisible && keepsFocus) {
      return false;
    }

    onDiscardLead(focusedLead.id);
    return true;
  };

  const handleSelectLead = (leadId: string) => {
    const targetLead = leads.find((lead) => lead.id === leadId);
    const hasActiveSearch = Boolean(effectiveSearchQuery.trim());
    const didDiscard = discardFocusedLeadIfNeeded(
      activeFilter,
      effectiveSearchQuery,
      leadId,
    );

    if (didDiscard && leadId === focusedLead?.id) {
      setSelectedLeadId(
        getNextVisibleLeadId(activeFilter, effectiveSearchQuery, leads),
      );
      return;
    }

    setSelectedLeadId(leadId);
    if (hasActiveSearch && targetLead) {
      setActiveFilter(targetLead.status);
      setIsSearchActive(false);
    }
  };

  const handleFilterChange = (filter: LeadStatus | "Alle") => {
    const remainingLeads = focusedLead?.isNew
      ? leads.filter((lead) => lead.id !== focusedLead.id)
      : leads;
    const nextLeadId = getNextVisibleLeadId(filter, "", remainingLeads);

    discardFocusedLeadIfNeeded(filter, "", nextLeadId);
    setIsSearchActive(false);
    setActiveFilter(filter);
    setSelectedLeadId(nextLeadId);
  };

  const handleSearchChange = (value: string) => {
    const remainingLeads = focusedLead?.isNew
      ? leads.filter((lead) => lead.id !== focusedLead.id)
      : leads;
    const nextLeadId = getNextVisibleLeadId(activeFilter, value, remainingLeads);
    const nextLead = leads.find((lead) => lead.id === nextLeadId);

    discardFocusedLeadIfNeeded(activeFilter, value, nextLeadId);
    setSearchQuery(value);
    setIsSearchActive(Boolean(value.trim()));
    setSelectedLeadId(nextLeadId);

    if (value.trim() && nextLead) {
      setActiveFilter(nextLead.status);
    }
  };

  const handleSearchSubmit = () => {
    const remainingLeads = focusedLead?.isNew
      ? leads.filter((lead) => lead.id !== focusedLead.id)
      : leads;
    const normalizedQuery = searchQuery.trim();
    const nextLeadId = getNextVisibleLeadId(
      activeFilter,
      normalizedQuery,
      remainingLeads,
    );

    discardFocusedLeadIfNeeded(activeFilter, normalizedQuery, nextLeadId);
    setIsSearchActive(Boolean(normalizedQuery));
    setSelectedLeadId(nextLeadId);
  };

  const handleCreateLead = async () => {
    if (isCreatingLead) {
      return;
    }

    if (focusedLead?.isNew) {
      setSelectedLeadId(focusedLead.id);
      setActiveFilter("Neu");
      setSearchQuery("");
      return;
    }

    setIsCreatingLead(true);

    try {
      if (focusedLead?.isNew) {
        onDiscardLead(focusedLead.id);
      }

      const newLead = await onCreateLead();
      setSearchQuery("");
      setIsSearchActive(false);
      setActiveFilter("Neu");
      pendingDiscardLeadIdRef.current = newLead.id;
      setSelectedLeadId(newLead.id);
    } finally {
      setIsCreatingLead(false);
    }
  };

  return (
    <div className="page-stack leads-page">
      <section className="panel filter-panel">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Lead Board</span>
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
                ((filter === "Alle" && activeFilter === "Alle") ||
                  (activeFilter !== "Alle" &&
                    filter !== "Alle" &&
                    selectedLeadStatus === filter))
                  ? "filter-chip-current-status"
                  : "",
              ]
                .filter(Boolean)
                .join(" ")}
              onClick={() => handleFilterChange(filter)}
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
          isCreatingLead={isCreatingLead}
          onCreateLead={handleCreateLead}
          onSearchQueryChange={handleSearchChange}
          onSearchSubmit={handleSearchSubmit}
          onSelectLead={handleSelectLead}
        />
        {selectedLead ? (
          <LeadDetail
            lead={selectedLead}
            machineTemplates={machineTemplates}
            onLeadSave={handleLeadSave}
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
