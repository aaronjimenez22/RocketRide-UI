export default function PlaceholderPage({ title }) {
  return (
    <div className="rr-page rr-container rr-stack">
      <section className="rr-surface rr-stack">
        <h1 className="rr-title">{title}</h1>
        <p className="rr-body">
          This section is ready for content. Let me know what details to surface
          here next.
        </p>
      </section>
    </div>
  );
}
