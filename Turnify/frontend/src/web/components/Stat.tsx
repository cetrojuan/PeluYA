export function Stat({ title, value, icon }: { title: string; value: number; icon: string }) {
  return (
    <section className="stat panel">
      <div>
        <small>{title}</small>
        <strong>{value}</strong>
      </div>
      <span>{icon}</span>
    </section>
  );
}
