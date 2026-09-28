import Link from 'next/link';

export type LegalSection = {
  id: string;
  title: string;
  content: React.ReactNode;
};

export default function LegalPage({ eyebrow, title, summary, effectiveDate, sections }: {
  eyebrow: string;
  title: string;
  summary: string;
  effectiveDate: string;
  sections: LegalSection[];
}) {
  return <main className="legal-page section">
    <div className="legal-breadcrumb"><Link href="/">Home</Link><span aria-hidden="true">/</span><span>{title}</span></div>
    <header className="legal-hero">
      <span className="eyebrow">{eyebrow}</span>
      <h1>{title}<span>.</span></h1>
      <p>{summary}</p>
      <small>Effective date: {effectiveDate}</small>
    </header>
    <div className="legal-layout">
      <aside className="legal-index" aria-label={`${title} contents`}>
        <strong>On this page</strong>
        <nav>{sections.map((section, index) => <a key={section.id} href={`#${section.id}`}><span>{String(index + 1).padStart(2, '0')}</span>{section.title}</a>)}</nav>
      </aside>
      <article className="legal-copy">
        {sections.map((section, index) => <section id={section.id} key={section.id}>
          <span className="legal-number">{String(index + 1).padStart(2, '0')}</span>
          <h2>{section.title}</h2>
          {section.content}
        </section>)}
      </article>
    </div>
  </main>;
}
