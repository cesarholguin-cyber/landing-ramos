import { credentialGroups } from './credentials.js';

export function Credentials() {
  return <section className="credentials" id="cedulas-y-titulos" aria-label="Cédulas profesionales">
    <details className="credentials-disclosure">
      <summary className="credentials-toggle">Cédulas <span aria-hidden="true">+</span></summary>
      <div className="credentials-catalog">
        <p className="credentials-intro">Consulte los números de cédula proporcionados por el despacho. Las cédulas se presentan como fichas de consulta, sin publicar sus fotografías ni sus documentos originales.</p>
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
        </div>)}
      </div>
    </details>
  </section>;
}
