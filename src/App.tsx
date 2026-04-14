import { useEffect, useMemo, useState } from "react";
import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import OverviewPage from "./pages/OverviewPage";
import LeadsPage from "./pages/LeadsPage";
import LoginPage from "./pages/LoginPage";
import { getIssueTypes, getLeads, saveLead } from "./api/jira";
import { Lead, JiraIssueType } from "./types";

const initialLead: Lead = {
  id: "LEAD-001",
  status: "Neu",
  priority: "Mittel",
  createdAt: "2026-04-10",
  owner: "Vertrieb",
  company: "IAV GmbH",
  contactName: "Kevin Metzner",
  email: "km@kevin-metzner.de",
  phone: "+49 175 3725263",
  street: "Manfred-von-Ardenne-Ring 20",
  postalCode: "01099",
  city: "Dresden",
  locationType: "Unternehmen/Büro",
  offerType: "Kaffee/Heißwasser/Kakao",
  portions: "30-59",
  extraFeatures: "Wassertank",
  exactMachine: "",
  notes: "Telefonat zur Bedarfsanalyse geplant.",
  nextStep: "Telefonat führen und Maschine festlegen.",
  estimatedValue: 3200,
  monthlyVolume: "30-59",
  activity: [
    {
      id: "activity-1",
      label: "Lead aus E-Mail importiert",
      date: "10.04.2026",
      type: "mail",
    },
  ],
};

function App() {
  const [leads, setLeads] = useState<Lead[]>([initialLead]);
  const [issueTypes, setIssueTypes] = useState<JiraIssueType[]>([]);
  const [selectedIssueType, setSelectedIssueType] = useState("Lead");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [authenticated, setAuthenticated] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const navigate = useNavigate();

  useEffect(() => {
    const storedTheme = window.localStorage.getItem("theme");
    if (storedTheme === "light" || storedTheme === "dark") {
      setTheme(storedTheme);
    }
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((currentTheme) => (currentTheme === "dark" ? "light" : "dark"));
  };

  useEffect(() => {
    if (!authenticated) {
      return;
    }

    async function loadIssueTypes() {
      try {
        const types = await getIssueTypes();
        setIssueTypes(types);
        setSelectedIssueType(types[0]?.name ?? "Lead");
      } catch (err) {
        console.error(err);
        setError("Konnte Jira Issue-Typen nicht laden.");
      }
    }

    loadIssueTypes();
  }, [authenticated]);

  useEffect(() => {
    if (!authenticated || !selectedIssueType) {
      return;
    }

    loadLeads(selectedIssueType);
  }, [authenticated, selectedIssueType]);

  async function loadLeads(issueType: string, options?: { silent?: boolean }) {
    const { silent = false } = options || {};

    if (!silent) {
      setIsLoading(true);
      setError(null);
    }

    try {
      const remoteLeads = await getLeads(issueType);
      if (remoteLeads.length) {
        setLeads(remoteLeads);
      }
    } catch (err) {
      console.error(err);
      if (!silent) {
        setError("Konnte Leads aus Jira nicht laden.");
      }
    } finally {
      if (!silent) {
        setIsLoading(false);
      }
    }
  }

  const handleLeadUpdate = async (updatedLead: Lead) => {
    setLeads((currentLeads) =>
      currentLeads.map((lead) =>
        lead.id === updatedLead.id ? updatedLead : lead,
      ),
    );

    try {
      await saveLead(updatedLead);
    } catch (err) {
      console.error(err);
      setError("Konnte Lead nicht speichern.");
    }
  };

  const handleIssueTypeChange = (issueType: string) => {
    setSelectedIssueType(issueType);
  };

  const handleLogin = () => {
    setAuthenticated(true);
    navigate("/uebersicht");
  };

  const refreshLeads = () => {
    loadLeads(selectedIssueType);
  };

  if (!authenticated) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div className="app-shell">
      <div className="background-orb background-orb-left" />
      <div className="background-orb background-orb-right" />
      <Navbar theme={theme} onToggleTheme={toggleTheme} />
      <main className="page-frame">
        <Routes>
          <Route path="/" element={<Navigate to="/uebersicht" replace />} />
          <Route
            path="/uebersicht"
            element={
              <OverviewPage
                leads={leads}
                onRefresh={refreshLeads}
                isLoading={isLoading}
                error={error}
              />
            }
          />
          <Route
            path="/leads"
            element={
              <LeadsPage
                leads={leads}
                issueTypes={issueTypes}
                selectedIssueType={selectedIssueType}
                onChangeIssueType={handleIssueTypeChange}
                onUpdateLead={handleLeadUpdate}
              />
            }
          />
          <Route path="*" element={<Navigate to="/uebersicht" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
