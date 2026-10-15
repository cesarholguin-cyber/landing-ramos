import { useEffect, useRef, useState } from 'react';
import { credentialGroups, credentialPage } from './credentials.js';

function DocumentViewer({ document: item, owner, onClose }) {
  const dialog = useRef(null);
  const readingArea = useRef(null);
  const [page, setPage] = useState(0);
  const [zoom, setZoom] = useState(100);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    const previous = window.document.activeElement;
    const overflow = window.document.body.style.overflow;
    window.document.body.style.overflow = 'hidden';
    dialog.current.showModal();
    return () => { window.document.body.style.overflow = overflow; previous?.focus(); };
  }, []);
  function changePage(next) { setPage(next); setFailed(false); readingArea.current?.scrollTo(0, 0); }
  return <dialog className="credential-dialog" ref={dialog} aria-labelledby="credential-viewer-title" onClose={onClose}>
    <header className="credential-viewer-head">
      <div><p>{owner}</p><h2 id="credential-viewer-title">{item.title}</h2></div>
      <button type="button" className="credential-close" onClick={() => dialog.current.close()} aria-label="Cerrar documento">Cerrar <span aria-hidden="true">×</span></button>
    </header>
    <div className="credential-toolbar" aria-label="Controles del documento">
      <div className="credential-pagination"><button type="button" disabled={page === 0} onClick={() => changePage(page - 1)} aria-label="Página anterior">←</button><span aria-live="polite">Página {page + 1} de {item.pages.length}</span><button type="button" disabled={page === item.pages.length - 1} onClick={() => changePage(page + 1)} aria-label="Página siguiente">→</button></div>
      <div className="credential-zoom"><button type="button" disabled={zoom <= 100} onClick={() => setZoom(z => z - 25)} aria-label="Reducir documento">−</button><span aria-live="polite">{zoom}%</span><button type="button" disabled={zoom >= 200} onClick={() => setZoom(z => z + 25)} aria-label="Ampliar documento">+</button></div>
    </div>
    <div className="credential-page" ref={readingArea} tabIndex={0} aria-label="Área de lectura del documento">
      {failed ? <p role="alert">No se pudo cargar esta página. Cierre el visor e inténtelo de nuevo.</p> : <img key={page} src={credentialPage(item.pages[page])} alt={`${item.title} de ${owner}, página ${page + 1} de ${item.pages.length}`} style={{width:`${zoom}%`}} draggable="false" onError={() => setFailed(true)} />}
    </div>
    <p className="credential-viewer-note">Vista de consulta · Documento proporcionado por el despacho.</p>
  </dialog>;
}

export function Credentials() {
  const [selected, setSelected] = useState(null);
  return <section className="credentials" id="cedulas-y-titulos" aria-label="Documentación profesional">
    <details className="credentials-disclosure">
      <summary className="credentials-toggle">Cédulas y títulos <span aria-hidden="true">+</span></summary>
      <div className="credentials-catalog">
        <p className="credentials-intro">Consulte los números de cédula y los títulos académicos proporcionados por el despacho. Las cédulas se presentan como fichas de consulta, sin publicar sus fotografías ni sus documentos originales.</p>
        {credentialGroups.map(group => <div className="credential-group" key={group.name}>
          <h2>{group.name}</h2>
          <details className="credential-license">
            <summary><span>Cédulas de {group.name}</span><span className="credential-open">Ver números <span aria-hidden="true">+</span></span></summary>
            <div className="credential-license-body">
              <dl>{group.licenses.map(license => <div className="credential-license-row" key={license.number}>
                <dt>{license.label}</dt><dd>{license.number}</dd>
                {license.note && <dd className="credential-license-note">{license.note}</dd>}
              </div>)}</dl>
              <p className="credential-license-note">Números transcritos de los documentos proporcionados por el despacho. Esta ficha no sustituye una constancia oficial.</p>
              <a className="credential-registry-link" href="https://cedulaprofesional.sep.gob.mx/" target="_blank" rel="noopener noreferrer">Consultar cédulas federales en la SEP <span aria-hidden="true">↗</span><span className="credential-sr-only"> (abre en otra pestaña)</span></a>
            </div>
          </details>
          <div className="credential-list">{group.documents.map(item => <details className="credential-document" key={item.id}>
            <summary onClick={event => { event.preventDefault(); setSelected({document:item, owner:group.name}); }}>
              <span><strong>{item.title}</strong><small>{item.detail}</small></span><span className="credential-open">Ver documento <span aria-hidden="true">↗</span></span>
            </summary>
            <div className="credential-inline">{item.pages.map((page,index) => <img key={page} src={credentialPage(page)} loading="lazy" alt={`${item.title} de ${group.name}, página ${index + 1}`} />)}</div>
          </details>)}</div>
        </div>)}
      </div>
    </details>
    {selected && <DocumentViewer {...selected} onClose={() => setSelected(null)} />}
  </section>;
}
