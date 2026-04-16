type StatusPillProps = {
  tone: string;
};

function StatusPill({ tone }: StatusPillProps) {
  const color =
    tone === "Neu"
      ? "#38bdf8"
      : tone === "In Bearbeitung"
        ? "#fbbf24"
        : tone === "Angebot erzeugt"
          ? "#a78bfa"
          : tone === "Angebot versendet"
            ? "#f97316"
            : tone === "Angebot angenommen"
              ? "#22c55e"
              : tone === "Geschlossen"
                ? "#94a3b8"
                : "#94a3b8";

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "10px 14px",
        borderRadius: "999px",
        background: `${color}20`,
        color,
        fontWeight: 600,
        fontSize: "0.9rem",
      }}
    >
      {tone}
    </span>
  );
}

export default StatusPill;
