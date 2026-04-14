import { Lead } from "../types";
import DashboardCard from "../components/DashboardCard";

type OverviewPageProps = {
  leads: Lead[];
  onRefresh: () => void;
  isLoading: boolean;
  error: string | null;
};

function OverviewPage({
  leads,
  onRefresh,
  isLoading,
  error,
}: OverviewPageProps) {
  const totalPipeline = leads.reduce(
    (sum, lead) => sum + lead.estimatedValue,
    0,
  );
  const highPriorityCount = leads.filter(
    (lead) => lead.priority === "Hoch",
  ).length;
  const preparingQuotes = leads.filter(
    (lead) => lead.status === "Angebot in Vorbereitung",
  ).length;
  const urgentLeads = leads.filter((lead) => lead.priority === "Hoch");
  const displayLeads = leads.slice(0, 6);
  const nextActions = leads.slice(0, 5);

  return (
    <div className="page-stack">
      <section className="hero panel">
        <div className="hero-copy">
          <span className="eyebrow">Übersicht</span>
          <h1>Leads & Angebote in einer zentralen Ansicht</h1>
          <p>
            Hier sehen deine Vertriebsmitarbeiter den aktuellen Stand aller
            Leads, den Status von Angeboten und die wichtigsten nächsten
            Schritte.
          </p>
          {error ? <p className="panel-copy">Fehler: {error}</p> : null}
        </div>

        <div className="hero-highlight">
          <span>Pipeline gesamt</span>
          <strong>{totalPipeline.toLocaleString("de-DE")} EUR</strong>
          <small>
            {isLoading
              ? "Lade Daten aus Jira..."
              : "Live-Daten aus dem Backend"}
          </small>
        </div>
      </section>

      <section className="stats-grid">
        <DashboardCard
          eyebrow="Offen"
          value={String(leads.length)}
          label="aktive Leads"
          delta="immer aktuell"
        />
        <DashboardCard
          eyebrow="Fokus"
          value={String(highPriorityCount)}
          label="hohe Priorität"
          delta="sofort prüfen"
        />
        <DashboardCard
          eyebrow="Angebote"
          value={String(preparingQuotes)}
          label="in Vorbereitung"
          delta="bereit zur Berechnung"
        />
      </section>

      <section className="overview-grid">
        <article className="panel">
          <div className="section-heading">
            <div>
              <span className="eyebrow">Offene Leads</span>
              <h2>Direkt weiterarbeiten</h2>
            </div>
            <button
              type="button"
              className="secondary-button"
              onClick={onRefresh}
              disabled={isLoading}
            >
              {isLoading ? "Aktualisiere..." : "Aktualisieren"}
            </button>
          </div>

          <p className="panel-copy">
            Die wichtigsten offenen Leads sind hier kompakt und übersichtlich
            angeordnet.
          </p>

          <div className="lead-grid">
            {displayLeads.map((lead) => (
              <article
                key={lead.id}
                className={`lead-card ${lead.priority === "Hoch" ? "lead-card-highlight" : ""}`}
              >
                <div className="lead-card-head">
                  <span className="eyebrow">{lead.status}</span>
                  <span className="status-pill">{lead.priority}</span>
                </div>

                <strong>{lead.company}</strong>
                <p>{lead.nextStep}</p>

                <div className="lead-card-meta">
                  <span>{lead.contactName}</span>
                  <span>{lead.createdAt}</span>
                </div>
              </article>
            ))}
          </div>
        </article>

        <article className="panel">
          <div className="section-heading">
            <div>
              <span className="eyebrow">Fokus</span>
              <h2>Schnellcheck</h2>
            </div>
          </div>

          <div className="mini-stat-grid">
            <div className="mini-stat-card">
              <span className="eyebrow">High-Priority</span>
              <strong>{urgentLeads.length}</strong>
            </div>
            <div className="mini-stat-card">
              <span className="eyebrow">In Vorbereitung</span>
              <strong>{preparingQuotes}</strong>
            </div>
            <div className="mini-stat-card">
              <span className="eyebrow">Total Leads</span>
              <strong>{leads.length}</strong>
            </div>
          </div>

          <div className="section-heading section-heading-tight">
            <h3>Als Nächstes</h3>
          </div>

          <div className="action-list compact">
            {nextActions.map((lead) => (
              <div key={lead.id} className="action-row">
                <div>
                  <strong>{lead.company}</strong>
                  <span>{lead.nextStep}</span>
                </div>
                <span>{lead.createdAt}</span>
              </div>
            ))}
          </div>

          <div className="validation-box validation-box-ready">
            Konzentriere dich auf die wichtigsten Leads, damit die Pipeline
            schnell weiterläuft.
          </div>
        </article>
      </section>
    </div>
  );
}

export default OverviewPage;
