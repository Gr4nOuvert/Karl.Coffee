import { useEffect, useLayoutEffect, useMemo, useState } from "react";
import { MachineTemplate, OfferArticleType } from "../types";

type SettingsPageProps = {
  machineTemplates: MachineTemplate[];
  onCreateMachineTemplate: (type: OfferArticleType) => MachineTemplate;
  onDeleteMachineTemplate: (machineId: string) => void;
  onSaveMachineTemplate: (
    machineTemplate: MachineTemplate,
    previousMachineId?: string,
  ) => void;
};

type SettingsSectionId = "maschinen" | "zusatzfunktionen";

const settingsSections: Array<{
  id: SettingsSectionId;
  label: string;
  description: string;
}> = [
  {
    id: "maschinen",
    label: "Maschinen Textbausteine verwalten",
    description:
      "Pflege Maschinenstammdaten, Confluence-Verknüpfung und die Inhalte für die spätere PDF-Erzeugung.",
  },
  {
    id: "zusatzfunktionen",
    label: "Zusatzfunktionen Textbausteine verwalten",
    description:
      "Vorbereitung für Textbausteine zu Milchsystem, Festwasser, Kühlung und weiteren Zusatzfunktionen.",
  },
];

function areValuesEqual(valueA: unknown, valueB: unknown) {
  return JSON.stringify(valueA) === JSON.stringify(valueB);
}

function normalizeMachineTemplate(machineTemplate: MachineTemplate | null) {
  if (!machineTemplate) {
    return null;
  }

  const { isNew: _isNew, ...persistedFields } = machineTemplate;
  return persistedFields;
}

function SettingsPage({
  machineTemplates,
  onCreateMachineTemplate,
  onDeleteMachineTemplate,
  onSaveMachineTemplate,
}: SettingsPageProps) {
  const [activeSection, setActiveSection] =
    useState<SettingsSectionId>("maschinen");
  const [typeFilter, setTypeFilter] = useState<OfferArticleType>("Kaffee");
  const [selectedMachineId, setSelectedMachineId] = useState(
    machineTemplates.find((template) => template.type === "Kaffee")?.machineId ??
      machineTemplates[0]?.machineId ??
      "",
  );
  const [isDeleteConfirming, setIsDeleteConfirming] = useState(false);
  const [draftMachine, setDraftMachine] = useState<MachineTemplate | null>(
    machineTemplates[0] ?? null,
  );

  const filteredTemplates = useMemo(
    () =>
      machineTemplates.filter((template) => template.type === typeFilter),
    [machineTemplates, typeFilter],
  );

  const selectedPersistedMachine =
    machineTemplates.find((template) => template.machineId === selectedMachineId) ??
    null;

  const shouldShowDraftInList = Boolean(
    draftMachine?.isNew &&
      draftMachine.machineId === selectedMachineId &&
      draftMachine.type === typeFilter,
  );

  const machineListTemplates = useMemo(
    () =>
      shouldShowDraftInList && draftMachine
        ? [draftMachine, ...filteredTemplates]
        : filteredTemplates,
    [draftMachine, filteredTemplates, shouldShowDraftInList],
  );

  useEffect(() => {
    if (machineListTemplates.length === 0) {
      if (selectedMachineId !== "") {
        setSelectedMachineId("");
      }
      return;
    }

    if (
      !machineListTemplates.some(
        (template) => template.machineId === selectedMachineId,
      )
    ) {
      setSelectedMachineId(machineListTemplates[0].machineId);
    }
  }, [machineListTemplates, selectedMachineId]);

  useLayoutEffect(() => {
    setDraftMachine((current) => {
      if (selectedPersistedMachine) {
        if (
          current?.machineId === selectedPersistedMachine.machineId &&
          !current.isNew
        ) {
          return current;
        }

        return selectedPersistedMachine;
      }

      if (current?.isNew && current.machineId === selectedMachineId) {
        return current;
      }

      return machineListTemplates[0] ?? null;
    });
  }, [machineListTemplates, selectedMachineId, selectedPersistedMachine]);

  useEffect(() => {
    setIsDeleteConfirming(false);
  }, [selectedMachineId]);

  useEffect(() => {
    if (!isDeleteConfirming) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsDeleteConfirming(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isDeleteConfirming]);

  const hasUnsavedChanges = useMemo(() => {
    if (!draftMachine) {
      return false;
    }

    if (draftMachine.isNew) {
      return true;
    }

    return !areValuesEqual(
      normalizeMachineTemplate(selectedPersistedMachine),
      normalizeMachineTemplate(draftMachine),
    );
  }, [draftMachine, selectedPersistedMachine]);

  const handleCreateMachine = () => {
    const createdMachine = onCreateMachineTemplate(typeFilter);
    setSelectedMachineId(createdMachine.machineId);
    setDraftMachine(createdMachine);
  };

  const handleSaveMachine = () => {
    if (!draftMachine || !hasUnsavedChanges) {
      return;
    }

    const updatedMachine = {
      ...draftMachine,
      updatedAt: new Date().toISOString(),
      isNew: false,
    };

    onSaveMachineTemplate(updatedMachine, selectedPersistedMachine?.machineId);
    setSelectedMachineId(updatedMachine.machineId);
    setDraftMachine(updatedMachine);
  };

  const handleDeleteMachine = () => {
    if (!draftMachine) {
      return;
    }

    const nextMachine = filteredTemplates.find(
      (template) => template.machineId !== selectedMachineId,
    );

    if (draftMachine.isNew) {
      setDraftMachine(nextMachine ?? null);
      setSelectedMachineId(nextMachine?.machineId ?? "");
      setIsDeleteConfirming(false);
      return;
    }

    onDeleteMachineTemplate(selectedMachineId);
    setDraftMachine(nextMachine ?? null);
    setSelectedMachineId(nextMachine?.machineId ?? "");
    setIsDeleteConfirming(false);
  };

  const activeSectionConfig = settingsSections.find(
    (section) => section.id === activeSection,
  );

  return (
    <div className="settings-page">
      <section className="panel filter-panel settings-header-panel">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Einstellungen</span>
          </div>
        </div>

        <div className="filter-row settings-section-tabs">
          {settingsSections.map((section) => (
            <button
              key={section.id}
              type="button"
              className={
                activeSection === section.id
                  ? "filter-chip filter-chip-active"
                  : "filter-chip"
              }
              onClick={() => setActiveSection(section.id)}
            >
              {section.label}
            </button>
          ))}
        </div>

        <p className="panel-copy settings-section-copy">
          {activeSectionConfig?.description}
        </p>
      </section>

      {activeSection === "maschinen" ? (
        <section className="settings-workspace">
          <article className="panel settings-machine-list-panel">
            <div className="settings-panel-header">
              <div className="section-heading">
                <div>
                  <span className="eyebrow">Maschinen</span>
                </div>
                <button
                  type="button"
                  className="lead-list-add-button"
                  onClick={handleCreateMachine}
                  aria-label={`${typeFilter} hinzufügen`}
                >
                  +
                </button>
              </div>

              <div className="settings-chip-row">
                {(["Kaffee", "Wasser"] as const).map((filter) => (
                  <button
                    key={filter}
                    type="button"
                    className={
                      typeFilter === filter
                        ? "filter-chip filter-chip-active"
                        : "filter-chip"
                    }
                    onClick={() => setTypeFilter(filter)}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>

            <div className="settings-machine-list-scroll">
              <div className="settings-machine-list">
                {machineListTemplates.map((template) => (
                  <button
                    key={template.machineId}
                    type="button"
                    className={[
                      "settings-machine-item",
                      selectedMachineId === template.machineId
                        ? "settings-machine-item-active"
                        : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    onClick={() => setSelectedMachineId(template.machineId)}
                  >
                    <div className="settings-machine-item-head">
                      <strong>{template.displayName}</strong>
                      <span
                        className={
                          template.isNew
                            ? "settings-status-badge"
                            : template.isActive
                              ? "settings-status-badge"
                              : "settings-status-badge settings-status-badge-muted"
                        }
                      >
                        {template.isNew
                          ? "Neu"
                          : template.isActive
                            ? "Aktiv"
                            : "Inaktiv"}
                      </span>
                    </div>
                    <span>{template.machineId}</span>
                    <span>{template.confluencePageId || "Keine Confluence-ID"}</span>
                  </button>
                ))}

                {machineListTemplates.length === 0 ? (
                  <div className="offer-empty-state">
                    <span>Für diesen Bereich gibt es noch keine Maschinen.</span>
                  </div>
                ) : null}
              </div>
            </div>
          </article>

          <article className="panel settings-editor-panel">
            {draftMachine ? (
              <div className="settings-editor-scroll">
                <div className="section-heading">
                  <div>
                    <span className="eyebrow">Editor</span>
                    <h2>{draftMachine.displayName}</h2>
                  </div>
                  <div className="settings-editor-actions">
                    {hasUnsavedChanges ? (
                      <button
                        type="button"
                        className="primary-button"
                        onClick={handleSaveMachine}
                      >
                        Speichern
                      </button>
                    ) : null}
                    <button
                      type="button"
                      className="secondary-button danger-button"
                      onClick={() => setIsDeleteConfirming(true)}
                    >
                      Löschen
                    </button>
                  </div>
                </div>

                <div className="settings-editor-grid">
                  <div className="field-card field-card-compact">
                    <span className="field-label">Maschinenstammdaten</span>
                    <div className="request-form-grid">
                      <label className="form-field">
                        <span>Anzeigename</span>
                        <input
                          value={draftMachine.displayName}
                          onChange={(event) =>
                            setDraftMachine((current) =>
                              current
                                ? { ...current, displayName: event.target.value }
                                : current,
                            )
                          }
                        />
                      </label>
                      <label className="form-field">
                        <span>Typ</span>
                        <select
                          value={draftMachine.type}
                          onChange={(event) =>
                            setDraftMachine((current) =>
                              current
                                ? {
                                    ...current,
                                    type: event.target.value as OfferArticleType,
                                  }
                                : current,
                            )
                          }
                        >
                          <option value="Kaffee">Kaffee</option>
                          <option value="Wasser">Wasser</option>
                        </select>
                      </label>
                      <label className="form-field field-span-2">
                        <span>Machine ID</span>
                        <input
                          value={draftMachine.machineId}
                          onChange={(event) =>
                            setDraftMachine((current) =>
                              current
                                ? { ...current, machineId: event.target.value }
                                : current,
                            )
                          }
                        />
                      </label>
                      <label className="form-field">
                        <span>Confluence Page ID</span>
                        <input
                          value={draftMachine.confluencePageId}
                          onChange={(event) =>
                            setDraftMachine((current) =>
                              current
                                ? {
                                    ...current,
                                    confluencePageId: event.target.value,
                                  }
                                : current,
                            )
                          }
                        />
                      </label>
                      <label className="form-field">
                        <span>Confluence Titel</span>
                        <input
                          value={draftMachine.confluencePageTitle}
                          onChange={(event) =>
                            setDraftMachine((current) =>
                              current
                                ? {
                                    ...current,
                                    confluencePageTitle: event.target.value,
                                  }
                                : current,
                            )
                          }
                        />
                      </label>
                      <div className="form-field field-span-2 settings-toggle-field">
                        <span>Status</span>
                        <label className="settings-inline-checkbox">
                          <input
                            type="checkbox"
                            checked={draftMachine.isActive}
                            onChange={(event) =>
                              setDraftMachine((current) =>
                                current
                                  ? {
                                      ...current,
                                      isActive: event.target.checked,
                                    }
                                  : current,
                              )
                            }
                          />
                          <span>Maschine ist aktiv und in Angeboten auswählbar</span>
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="field-card field-card-full">
                    <span className="field-label">Textbaustein</span>
                    <label className="form-field settings-textarea-field">
                      <textarea
                        value={draftMachine.content}
                        onChange={(event) =>
                          setDraftMachine((current) =>
                            current
                              ? { ...current, content: event.target.value }
                              : current,
                          )
                        }
                        rows={14}
                      />
                    </label>
                  </div>
                </div>
              </div>
            ) : (
              <div className="offer-empty-state">
                <span>Wähle links eine Maschine aus, um den Editor zu öffnen.</span>
              </div>
            )}
          </article>
        </section>
      ) : (
        <section className="settings-workspace settings-workspace-single">
          <article className="panel settings-placeholder-panel">
            <span className="eyebrow">Zusatzfunktionen</span>
            <h2>Textbausteine verwalten</h2>
            <p>
              Dieser Bereich ist bewusst schon als eigener Header angelegt. Hier
              können wir als Nächstes die Textbausteine für Milchsystem,
              Festwasser, Kühlung und weitere Zusatzfunktionen aufbauen.
            </p>
            <div className="validation-box">
              Die Struktur ist vorbereitet, damit wir später ohne Layoutbruch
              weitere Settings-Module ergänzen können.
            </div>
          </article>
        </section>
      )}

      {isDeleteConfirming && draftMachine ? (
        <div
          className="settings-modal-backdrop"
          onClick={() => setIsDeleteConfirming(false)}
        >
          <div
            className="settings-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="settings-delete-modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <span className="eyebrow">Maschine löschen</span>
            <h3 id="settings-delete-modal-title">{draftMachine.displayName}</h3>
            <p>
              Möchtest du diese Maschine wirklich löschen? Dieser Schritt kann
              nicht automatisch rückgängig gemacht werden.
            </p>
            <div className="settings-modal-actions">
              <button
                type="button"
                className="secondary-button"
                onClick={() => setIsDeleteConfirming(false)}
              >
                Abbrechen
              </button>
              <button
                type="button"
                className="secondary-button danger-button"
                onClick={handleDeleteMachine}
              >
                Löschen
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default SettingsPage;
