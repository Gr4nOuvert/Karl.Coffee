# Karl Coffee Lead & Quote Webapp

Eine moderne React-Frontend-Anwendung mit Express-Backend zum Erfassen, Bearbeiten und Automatisieren von Kaffee-Leads. Das System ist vorbereitet für Jira- und Confluence-Integration via API-Token.

## Struktur

- `src/` – React-Anwendung
- `server/` – Express-Backend mit Jira/Confluence-API-Stubs
- `public/` – statische HTML-Datei

## Start

1. `npm install`
2. `npm run dev:server` (Backend)
3. `npm run dev` (Frontend)

Alternativ:

- `npm run dev:all` startet Frontend und Backend parallel

## Env-Variablen

Kopiere `.env.example` nach `.env` und passe Werte an:

- `JIRA_BASE_URL`
- `JIRA_USER_EMAIL`
- `JIRA_API_TOKEN`
- `JIRA_PROJECT_KEY`
- `CONFLUENCE_BASE_URL`
- `CONFLUENCE_SPACE_KEY`
- `CONFLUENCE_TEMPLATE_PAGE_ID`

## Architektur

- React-Frontend: Lead-Dashboard, Lead-Detail, Angebots-Button
- Express-Backend: Proxy für Jira/Confluence und lokale API
- Authentifizierung: Platzhalter-Login für interne Nutzung

## Nächste Schritte

- Jira-Feld-Mapping für `Lead` anpassen
- Confluence-Textbausteine über die Template-API laden
- Login/SSO ergänzen
