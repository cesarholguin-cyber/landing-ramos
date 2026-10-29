import { useEffect, useRef, useState } from 'react';
import { whatsappOptions, whatsappLink } from './whatsapp-options.mjs';

function ChatIcon() {
  return <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M20.5 11.5a8.5 8.5 0 0 1-12.7 7.4L3 20l1.1-4.8a8.5 8.5 0 1 1 16.4-3.7Z"/><path d="M8 7.5c.5 4 2.5 6 6.5 7l1.5-2-2.5-1-.8 1c-1.5-.7-2.1-1.3-2.8-2.8l1-.8-1-2.5Z" strokeLinejoin="round"/></svg>;
}

export function WhatsAppContact() {
  const disclosure = useRef(null);
  const trigger = useRef(null);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState('');
  function close(restoreFocus = true) {
    disclosure.current.open = false;
    if (restoreFocus) trigger.current.focus();
  }
  useEffect(() => {
    if (!open) return;
    const onKey = event => { if (event.key === 'Escape') { event.preventDefault(); close(); } };
    const onOutside = event => {
      if (!disclosure.current.contains(event.target)) close(disclosure.current.contains(document.activeElement));
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onOutside);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onOutside);
    };
  }, [open]);
  return <details className="wa-contact" ref={disclosure} onToggle={event => setOpen(event.currentTarget.open)}>
    <summary className="wa-launcher" ref={trigger} aria-controls="wa-contact-panel" aria-label="Abrir o cerrar opciones de WhatsApp">
      <span className="wa-launcher-label">Conversemos</span><span className="wa-launcher-icon"><ChatIcon /></span>
    </summary>
    <section className="wa-panel" id="wa-contact-panel" aria-labelledby="wa-contact-title">
      <header className="wa-panel-head"><span className="wa-kicker">RAMOS & ASOCIADOS</span><button className="wa-close" type="button" onClick={() => close()} aria-label="Cerrar opciones de WhatsApp">×</button></header>
      <h2 id="wa-contact-title">Su siguiente <em>paso.</em></h2>
      <p className="wa-intro">Una conversación puede darle claridad.<br />¿Cómo podemos acompañarle?</p>
      <fieldset className="wa-options"><legend className="wa-sr-only">Seleccione el motivo de contacto</legend>
        {whatsappOptions.map((option, index) => <label className="wa-option" key={option.id}>
          <input type="radio" name="whatsapp-reason" value={option.id} checked={selected === option.id} onChange={() => setSelected(option.id)} />
          <span className="wa-option-index" aria-hidden="true">0{index + 1}</span><span className="wa-option-copy"><strong>{option.label}</strong><small>{option.detail}</small></span><span className="wa-option-mark" aria-hidden="true" />
        </label>)}
      </fieldset>
      <div className="wa-panel-foot">
        {selected ? <a className="wa-send" href={whatsappLink(selected)} target="_blank" rel="noopener noreferrer"><ChatIcon />Continuar en WhatsApp<span aria-hidden="true">↗</span><span className="wa-sr-only"> (abre en otra pestaña)</span></a> : <button className="wa-send" type="button" disabled>Seleccione una opción<span aria-hidden="true">↗</span></button>}
        <p className="wa-note">Se abrirá WhatsApp con su mensaje preparado. Usted decide cuándo enviarlo. Las citas se confirman con el despacho.</p>
      </div>
      <noscript><div className="wa-fallback"><p>Elija un motivo para abrir WhatsApp:</p>{whatsappOptions.map(option => <a key={option.id} href={whatsappLink(option.id)} target="_blank" rel="noopener noreferrer">{option.label} ↗</a>)}</div></noscript>
    </section>
  </details>;
}
