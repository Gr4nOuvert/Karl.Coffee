import type { MachineTemplate } from "../types";

const baseTemplates: Array<{
  machineId: string;
  displayName: string;
  type: MachineTemplate["type"];
}> = [
  { machineId: "karl.coffeeBEAN'1plus", displayName: "coffeeBEAN 1plus", type: "Kaffee" },
  { machineId: "karl.coffeeBEAN'2plus", displayName: "coffeeBEAN 2plus", type: "Kaffee" },
  { machineId: "karl.coffeeBEAN'3", displayName: "coffeeBEAN 3", type: "Kaffee" },
  { machineId: "karl.coffeeBEAN'4touch", displayName: "coffeeBEAN 4touch", type: "Kaffee" },
  { machineId: "karl.coffeeBEAN'6big", displayName: "coffeeBEAN 6big", type: "Kaffee" },
  { machineId: "karl.coffeeBEAN'+milk", displayName: "coffeeBEAN +milk", type: "Kaffee" },
  { machineId: "karl.coffeeBEAN'Vplus", displayName: "coffeeBEAN Vplus", type: "Kaffee" },
  { machineId: "karl.coffeeBEAN'CXT4", displayName: "coffeeBEAN CXT4", type: "Kaffee" },
  { machineId: "karl.coffeeBEAN'CXT6", displayName: "coffeeBEAN CXT6", type: "Kaffee" },
  { machineId: "karl.coffeeBEAN'CXT7", displayName: "coffeeBEAN CXT7", type: "Kaffee" },
  { machineId: "karl.coffeeBEAN'elba", displayName: "coffeeBEAN elba", type: "Kaffee" },
  { machineId: "karl.coffeeLINE'500", displayName: "coffeeLINE 500", type: "Kaffee" },
  { machineId: "karl.coffeeLINE2L", displayName: "coffeeLINE 2L", type: "Kaffee" },
  { machineId: "karl.coffeeLINE'5L", displayName: "coffeeLINE 5L", type: "Kaffee" },
  { machineId: "karl.coffeeLINE'2x5L", displayName: "coffeeLINE 2x5L", type: "Kaffee" },
  { machineId: "karl.coffeeLINE'1.8", displayName: "coffeeLINE 1.8", type: "Kaffee" },
  { machineId: "karl.coffeeLINE'2.2", displayName: "coffeeLINE 2.2", type: "Kaffee" },
  { machineId: "karl.coffeeSPEED", displayName: "coffeeSPEED", type: "Kaffee" },
  { machineId: "karl.coffeeSPEED'4", displayName: "coffeeSPEED 4", type: "Kaffee" },
  { machineId: "karl.coffeeWATER'5.0", displayName: "coffeeWATER 5.0", type: "Wasser" },
  { machineId: "karl.coffeeWATER'5.0touch", displayName: "coffeeWATER 5.0touch", type: "Wasser" },
  { machineId: "karl.coffeeWATER'speed7.0", displayName: "coffeeWATER speed7.0", type: "Wasser" },
  { machineId: "karl.coffeeWATER'speed7.0touch", displayName: "coffeeWATER speed7.0touch", type: "Wasser" },
  { machineId: "karl.coffeeWATERspeed'6.0", displayName: "coffeeWATERspeed 6.0", type: "Wasser" },
  { machineId: "karl.coffeeWATER'4.0", displayName: "coffeeWATER 4.0", type: "Wasser" },
  { machineId: "karl.coffeeWATER'tower4.0", displayName: "coffeeWATER tower4.0", type: "Wasser" },
];

export const initialMachineTemplates: MachineTemplate[] = baseTemplates.map(
  (template, index) => ({
    ...template,
    confluencePageId: `CONF-${String(index + 1).padStart(3, "0")}`,
    confluencePageTitle: `${template.displayName} Textbaustein`,
    content:
      template.type === "Kaffee"
        ? `{{company}} erhält mit ${template.displayName} eine passende Kaffee-Lösung für den Standort {{city}}.\n\nDie Maschine unterstützt den geplanten Bedarf und wird inklusive Einweisung bereitgestellt.`
        : `{{company}} erhält mit ${template.displayName} einen passenden Wasserspender für den Standort {{city}}.\n\nDie Anlage unterstützt die tägliche Versorgung und wird inklusive Inbetriebnahme bereitgestellt.`,
    isActive: true,
    updatedAt: "2026-04-19T09:00:00.000Z",
  }),
);
