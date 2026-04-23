import { Lead } from "../types";
import DashboardCard from "../components/DashboardCard";

type OverviewPageProps = {
  leads: Lead[];
  onRefresh: () => void;
  isLoading: boolean;
  error: string | null;
};

function getLatestOfferValue(lead: Lead) {
  const latestOffer = [...(lead.generatedOffers ?? [])].sort((offerA, offerB) =>
    offerB.createdAt.localeCompare(offerA.createdAt),
  )[0];

  if (!latestOffer) {
    return 0;
  }

  return latestOffer.items.reduce((sum, item) => {
    const itemValue =
      item.mode === "Miete"
        ? item.quantity * item.price * 12
        : item.quantity * item.price;

    return sum + itemValue;
  }, 0);
}

function OverviewPage({
  leads,
  onRefresh,
  isLoading,
  error,
}: OverviewPageProps) {
  const totalPipeline = leads.reduce(
    (sum, lead) =>
      lead.status === "Angebot versendet"
        ? sum + getLatestOfferValue(lead)
        : sum,
    0,
  );
  const newLeadsCount = leads.filter(
    (lead) => lead.status === "Neu",
  ).length;
  const inProgressCount = leads.filter(
    (lead) => lead.status === "In Bearbeitung",
  ).length;
  const sentQuotesCount = leads.filter(
    (lead) => lead.status === "Angebot versendet",
  ).length;
  const displayLeads = leads.slice(0, 6);
  const nextActions = leads.slice(0, 5);

  return (
    <div className="page-stack">
      <section className="hero panel">
        <div className="hero-copy">
          <span className="eyebrow">Übersicht</span>
          {/* <h1>Leads & Angebote in einer zentralen Ansicht</h1> */}
          {/* <p>
            Hier sehen deine Vertriebsmitarbeiter den aktuellen Stand aller
            Lead, den Status von Angeboten und die wichtigsten nächsten
            Schritte.
          </p> */}
          {error ? <p className="panel-copy">Fehler: {error}</p> : null}
        </div>

        <div className="hero-highlight">
          <span>Pipeline gesamt</span>
          <strong>{totalPipeline.toLocaleString("de-DE")} EUR</strong>
          <small>
            {isLoading
              ? "Lade Daten aus Jira..."
              : "Live-Daten aller offenen Angebote"}
          </small>
        </div>
      </section>

      <section className="stats-grid">
        <DashboardCard
          eyebrow="Neue Leads"
          value={String(newLeadsCount)}
          label=""
          delta=""
        />
        <DashboardCard
          eyebrow="In Bearbeitung"
          value={String(inProgressCount)}
          label=""
          delta=""
        />
        <DashboardCard
          eyebrow="Angebot versendet"
          value={String(sentQuotesCount)}
          label=""
          delta=""
        />
      </section>

      <section className="overview-grid">
        <article className="panel">
          <div className="section-heading">
            <div>
              <span className="eyebrow">Deine Kaffee News</span>
              <h2>Agent Integration</h2>
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

          {/* <p className="panel-copy">
            Die wichtigsten offenen Leads sind hier kompakt und übersichtlich
            angeordnet.
          </p> */}

          {/* <div className="lead-grid">
            {displayLeads.map((lead) => (
              <article key={lead.id} className="lead-card">
                <div className="lead-card-head">
                  <span className="eyebrow">{lead.status}</span>
                </div>

                <strong>{lead.company}</strong>
                <p>{lead.nextStep}</p>

                <div className="lead-card-meta">
                  <span>{lead.contactName}</span>
                  <span>{lead.createdAt}</span>
                </div>
              </article>
            ))}
          </div> */}
        </article>

        {/* <article className="panel">
          <div className="section-heading">
            <div>
              <span className="eyebrow">Fokus</span>
              <h2>Schnellcheck</h2>
            </div>
          </div>

          <div className="mini-stat-grid">
            <div className="mini-stat-card">
              <span className="eyebrow">In Bearbeitung</span>
              <strong>{inProgressCount}</strong>
            </div>
            <div className="mini-stat-card">
              <span className="eyebrow">Angebot erzeugt</span>
              <strong>{createdQuotesCount}</strong>
            </div>
            <div className="mini-stat-card">
              <span className="eyebrow">Angebot versendet</span>
              <strong>{sentQuotesCount}</strong>
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
        </article> */}
      </section>
    </div>
  );
}

export default OverviewPage;
