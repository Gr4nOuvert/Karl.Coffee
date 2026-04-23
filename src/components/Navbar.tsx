import { NavLink } from "react-router-dom";

type NavbarProps = {
  theme: "dark" | "light";
  onToggleTheme: () => void;
};

function Navbar({ theme, onToggleTheme }: NavbarProps) {
  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <img src={`${import.meta.env.BASE_URL}logo.png`} alt="Karl Coffee Logo" className="navbar-logo" />
        <div>
          <div className="navbar-title">Anfragen- und Angebotsmanagement</div>
        </div>
      </div>

      <div className="navbar-actions">
        <NavLink to="/uebersicht">Übersicht</NavLink>
        <NavLink to="/leads">Leads</NavLink>
        <NavLink to="/einstellungen">Einstellungen</NavLink>
        <button type="button" className="theme-toggle" onClick={onToggleTheme}>
          {theme === "dark" ? "Hellmodus" : "Dunkelmodus"}
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
