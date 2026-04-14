import { Lead } from "../types";

type LeadListProps = {
  leads: Lead[];
  activeLeadId: string;
  onSelectLead: (leadId: string) => void;
};

function LeadList({ leads, activeLeadId, onSelectLead }: LeadListProps) {
  return (
    <article className="panel">
      <div className="section-heading">
        <div>
          <span className="eyebrow">Leads</span>
          <h2>Offene Anfragen</h2>
        </div>
      </div>

      <ul className="lead-list">
        {leads.map((lead) => (
          <li
            key={lead.id}
            className={`lead-list-item ${lead.id === activeLeadId ? "active" : ""}`}
            onClick={() => onSelectLead(lead.id)}
          >
            <strong>{lead.company}</strong>
            <span>{lead.contactName}</span>
            <span>{lead.status}</span>
          </li>
        ))}
      </ul>
    </article>
  );
}

export default LeadList;
