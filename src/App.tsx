import { useEffect, useState } from "react";
import {
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";
import Navbar from "./components/Navbar";
import OverviewPage from "./pages/OverviewPage";
import LeadsPage from "./pages/LeadsPage";
import LoginPage from "./pages/LoginPage";
import SettingsPage from "./pages/SettingsPage";
import { getLeads, saveLead } from "./api/jira";
import {
  Lead,
  LeadChangeSet,
  MachineTemplate,
  OfferArticleType,
} from "./types";
import { initialMachineTemplates } from "./data/machineTemplates";

const initialLead: Lead = {
  id: "LEAD-001",
  status: "Neu",
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
  articles: [
    {
      id: "article-1",
      type: "Kaffee",
      machine: "karl.coffeeBEAN'1plus",
      quantity: 1,
      price: 89,
      mode: "Miete",
      extraFeatures: ["Wassertank"],
      selectedForOffer: false,
    },
  ],
};

function getNextLeadId(leads: Lead[]) {
  const highestLeadNumber = leads.reduce((max, lead) => {
    const match = lead.id.match(/^LEAD-(\d+)$/);
    if (!match) {
      return max;
    }

    return Math.max(max, Number(match[1]));
  }, 0);

  return `LEAD-${String(highestLeadNumber + 1).padStart(3, "0")}`;
}

function createEmptyLead(leads: Lead[]): Lead {
  const today = new Date().toISOString().slice(0, 10);

  return {
    id: getNextLeadId(leads),
    status: "Neu",
    createdAt: today,
    owner: "Vertrieb",
    company: "",
    contactName: "",
    email: "",
    phone: "",
    street: "",
    postalCode: "",
    city: "",
    locationType: "Unternehmen/Büro",
    offerType: "",
    portions: "10-29",
    extraFeatures: "",
    exactMachine: "",
    notes: "",
    nextStep: "",
    estimatedValue: 0,
    monthlyVolume: "10-29",
    activity: [],
    articles: [],
    isNew: true,
  };
}

function App() {
  const [leads, setLeads] = useState<Lead[]>([initialLead]);
  const [machineTemplates, setMachineTemplates] = useState<MachineTemplate[]>(
    initialMachineTemplates,
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // TODO: Test-Bypass wieder entfernen und Auth-Status zurück auf `false` setzen,
  // sobald die Login-Seite wieder aktiv genutzt werden soll.
  const [authenticated, setAuthenticated] = useState(true);
  const [theme, setTheme] = useState<"dark" | "light">("light");
  const navigate = useNavigate();
  const location = useLocation();

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

    loadLeads();
  }, [authenticated]);

  async function loadLeads(options?: { silent?: boolean }) {
    const { silent = false } = options || {};

    if (!silent) {
      setIsLoading(true);
      setError(null);
    }

    try {
      const remoteLeads = await getLeads();
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

  const handleLeadSave = async (
    updatedLead: Lead,
    changedFields: LeadChangeSet,
  ) => {
    const persistedLead = {
      ...updatedLead,
      isNew: false,
    };

    console.log("[Lead Save Placeholder]", {
      leadId: persistedLead.id,
      mode: updatedLead.isNew ? "create" : "update",
      changedFields,
    });

    setLeads((currentLeads) =>
      currentLeads.map((lead) =>
        lead.id === persistedLead.id ? persistedLead : lead,
      ),
    );

    try {
      await saveLead(persistedLead);
    } catch (err) {
      console.error(err);
      setError("Konnte Lead nicht speichern.");
    }
  };

  const handleLeadCreate = async () => {
    const nextLead = createEmptyLead(leads);

    setLeads((currentLeads) => [nextLead, ...currentLeads]);

    return nextLead;
  };

  const handleDiscardLead = (leadId: string) => {
    setLeads((currentLeads) =>
      currentLeads.filter((lead) => lead.id !== leadId),
    );
  };

  const handleCreateMachineTemplate = (type: OfferArticleType) => {
    const machineNumber =
      machineTemplates.filter((template) => template.type === type).length + 1;
    return {
      machineId: `${type.toLowerCase()}-neu-${machineNumber}`,
      displayName:
        type === "Kaffee"
          ? `Neue Kaffeemaschine ${machineNumber}`
          : `Neue Wassermaschine ${machineNumber}`,
      type,
      confluencePageId: "",
      confluencePageTitle: "",
      content:
        type === "Kaffee"
          ? "{{company}} erhält mit {{machine}} eine passende Kaffee-Lösung für den Standort {{city}}."
          : "{{company}} erhält mit {{machine}} einen passenden Wasserspender für den Standort {{city}}.",
      isActive: true,
      updatedAt: new Date().toISOString(),
      isNew: true,
    };
  };

  const handleSaveMachineTemplate = (
    machineTemplate: MachineTemplate,
    previousMachineId?: string,
  ) => {
    const persistedMachine = {
      ...machineTemplate,
      isNew: false,
    };

    setMachineTemplates((currentTemplates) => {
      const existingIndex = currentTemplates.findIndex(
        (template) =>
          template.machineId === previousMachineId ||
          template.machineId === machineTemplate.machineId,
      );

      if (existingIndex === -1) {
        return [persistedMachine, ...currentTemplates];
      }

      return currentTemplates.map((template) =>
        template.machineId === currentTemplates[existingIndex].machineId
          ? persistedMachine
          : template,
      );
    });
  };

  const handleDeleteMachineTemplate = (machineId: string) => {
    setMachineTemplates((currentTemplates) =>
      currentTemplates.filter((template) => template.machineId !== machineId),
    );
  };

  const handleLogin = () => {
    setAuthenticated(true);
    navigate("/uebersicht");
  };

  const refreshLeads = () => {
    loadLeads();
  };

  const pageFrameClassName =
    location.pathname === "/leads" || location.pathname === "/einstellungen"
      ? "page-frame page-frame-wide"
      : "page-frame";

  // TODO: Diese Login-Schranke nach der Testphase wieder aktivieren.
  if (!authenticated) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div className="app-shell">
      <div className="background-orb background-orb-left" />
      <div className="background-orb background-orb-right" />
      <Navbar theme={theme} onToggleTheme={toggleTheme} />
      <main className={pageFrameClassName}>
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
                machineTemplates={machineTemplates}
                onCreateLead={handleLeadCreate}
                onDiscardLead={handleDiscardLead}
                onSaveLead={handleLeadSave}
              />
            }
          />
          <Route
            path="/einstellungen"
            element={
              <SettingsPage
                machineTemplates={machineTemplates}
                onCreateMachineTemplate={handleCreateMachineTemplate}
                onDeleteMachineTemplate={handleDeleteMachineTemplate}
                onSaveMachineTemplate={handleSaveMachineTemplate}
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
