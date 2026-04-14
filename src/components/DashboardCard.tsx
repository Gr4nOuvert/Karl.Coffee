type DashboardCardProps = {
  eyebrow: string;
  value: string;
  label: string;
  delta: string;
};

function DashboardCard({ eyebrow, value, label, delta }: DashboardCardProps) {
  return (
    <article className="panel">
      <span className="eyebrow">{eyebrow}</span>
      <h2>{value}</h2>
      <p>{label}</p>
      <small>{delta}</small>
    </article>
  );
}

export default DashboardCard;
