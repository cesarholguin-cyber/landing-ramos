import { businessProfile, confirmedDetails, dayNames } from './business-profile.mjs';

export function OfficeHours({ profile = businessProfile }) {
  const { hours } = confirmedDetails(profile);
  if (!hours.length) return null;
  return <div className="office-hours"><p className="eyebrow">HORARIO DE ATENCIÓN</p><dl>
    {hours.map(({ days, opens, closes }, index) => <div key={index}>
      <dt>{days.map(day => dayNames[day]).join(', ')}</dt>
      <dd><time>{opens}</time> – <time>{closes}</time></dd>
    </div>)}
  </dl><p className="location-reference">Hora local de Hermosillo, Sonora.</p></div>;
}

export function PracticeAreas({ profile = businessProfile }) {
  const { practiceAreas } = confirmedDetails(profile);
  if (!practiceAreas.length) return null;
  return <section className="practice-areas section" aria-labelledby="practice-title">
    <div className="section-top"><p className="eyebrow">SERVICIOS DEL DESPACHO</p></div>
    <h2 id="practice-title">Áreas de <em>práctica.</em></h2>
    <div className="offer-grid">{practiceAreas.map(({ name, description }, index) =>
      <article className="offer-card" key={name}><span className="card-index">{String(index + 1).padStart(2, '0')}</span>
        <div><h3>{name}</h3><p>{description}</p></div>
      </article>)}
    </div>
  </section>;
}
