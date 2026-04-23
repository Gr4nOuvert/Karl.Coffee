import { FormEvent, useState } from "react";

type LoginPageProps = {
  onLogin: () => void;
};

function LoginPage({ onLogin }: LoginPageProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    // TODO: enable when login works
    // if (!email || !password) {
    //   return;
    // }
    onLogin();
  }

  return (
    <div className="login-shell">
      <article className="panel login-card">
        <div className="login-brand">
          <img src={`${import.meta.env.BASE_URL}logo.png`} alt="Karl Coffee Logo" className="navbar-logo" />
          <span className="eyebrow">Karl Coffee</span>
          <h1>Interne Vertriebsoberfläche</h1>
          <p>Bitte melde dich an, um Leads und Angebote zu verwalten.</p>
        </div>

        <form onSubmit={handleSubmit}>
          <label className="form-field">
            <span>E-Mail</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              //   required
              placeholder="dein.name@firma.de"
            />
          </label>

          <label className="form-field">
            <span>Passwort</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              //   required
              placeholder="*******"
            />
          </label>

          <button type="submit" className="primary-button">
            Anmelden
          </button>
        </form>
      </article>
    </div>
  );
}

export default LoginPage;
