type StatusPillProps = {
  tone: string;
};

function StatusPill({ tone }: StatusPillProps) {
  const color =
    tone === "Neu"
      ? "#38bdf8"
      : tone === "Qualifiziert"
        ? "#fbbf24"
        : tone === "Angebot in Vorbereitung"
          ? "#a78bfa"
          : tone === "Warten auf Feedback"
            ? "#f97316"
            : tone === "Hoch"
              ? "#f87171"
              : tone === "Mittel"
                ? "#60a5fa"
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
