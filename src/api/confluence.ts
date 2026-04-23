function delay(ms = 200) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function getConfluenceTemplate(templateId: string): Promise<string> {
  await delay();

  if (templateId !== "lead-offer-mail-v1") {
    return "Hallo {{contactName}},\n\n{{introLine}}\n\nViele Grüße,\n{{senderName}}";
  }

  return [
    "Hallo {{contactName}},",
    "",
    "{{introLine}}",
    "",
    "Hier ist Ihr Angebot zu {{offerType}} für {{company}}:",
    "- Standort: {{locationType}} in {{city}}",
    "- Volumen: {{monthlyVolume}} Portionen/Monat",
    "- Zusatzfunktionen: {{extraFeatures}}",
    "- Wunschmaschine: {{exactMachine}}",
    "- Geschätzter Wert: {{estimatedValue}} EUR",
    "",
    "Nächster Schritt: {{nextStep}}",
    "",
    "{{cta}}",
    "",
    "Viele Grüße,",
    "{{senderName}}",
  ].join("\n");
}
