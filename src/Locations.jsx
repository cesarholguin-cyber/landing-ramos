import { OfficeHours } from './BusinessDetails.jsx';
const mapsUrl = 'https://maps.app.goo.gl/WMhXXXcYaHUpb2qm9';
const photos = [
  { file: 'fachada.webp', caption: 'La fachada · H-43', alt: 'Fachada de las oficinas en Miguel Hidalgo 43, con celosía de ladrillo y el número H-43' },
  { file: 'sala-espera.webp', caption: 'Sala de espera', alt: 'Sala de espera de las oficinas, con sillones negros y luz natural junto a la entrada' },
  { file: 'despacho.webp', caption: 'El despacho', alt: 'Interior del despacho, con escritorio de madera, librero y sillas para visitantes' },
];

export function Locations({ whatsapp }) {
  return <section className="locations section" id="ubicaciones" aria-labelledby="locations-title">
    <div className="section-top"><p className="eyebrow">05 / UBICACIONES</p><span className="edition">HERMOSILLO · SONORA</span></div>
    <div className="locations-heading">
      <h2 id="locations-title">Nuestras oficinas<br /><em>en Hermosillo.</em></h2>
      <p>Un espacio para conocer su asunto y conversar con claridad. Conozca nuestras oficinas y encuentre la ruta para visitarnos.</p>
    </div>
    <div className="locations-gallery">{photos.map((photo, index) => <figure key={photo.file}>
      <div className={`location-photo location-photo-${index + 1}`}><img src={`./public/assets/oficinas/${photo.file}`} alt={photo.alt} width="720" height="1280" loading="lazy" decoding="async" /></div>
      <figcaption><span className="location-photo-index">0{index + 1}</span>{photo.caption}</figcaption>
    </figure>)}</div>
    <div className="location-details">
      <div className="location-address"><p className="eyebrow">RAMOS & ASOCIADOS · OFICINAS</p><h3>El Centenario</h3><address>Blvd. Miguel Hidalgo 43<br />Col. El Centenario, C.P. 83260<br />Hermosillo, Sonora, México</address><p className="location-reference">Referencia de la fachada: H-43.</p></div>
      <div className="location-actions"><a className="button location-directions" href={mapsUrl} target="_blank" rel="noopener noreferrer" aria-label="Cómo llegar a las oficinas en Google Maps (abre en otra pestaña)">Cómo llegar <span aria-hidden="true">↗</span></a><a className="underlined-link" href={whatsapp} target="_blank" rel="noopener noreferrer">Coordinar una visita <span aria-hidden="true">↗</span></a><p>La ubicación se abre en Google Maps.</p></div>
    </div>
    <OfficeHours />
  </section>;
}
