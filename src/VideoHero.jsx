import { useEffect, useRef, useState } from 'react';

export function VideoHero() {
  const video = useRef(null);
  const userPaused = useRef(false);
  const [paused, setPaused] = useState(true);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    const element = video.current;
    const preference = matchMedia('(prefers-reduced-motion: reduce)');
    let visible = true;
    const sync = () => {
      if (preference.matches || document.hidden || userPaused.current || !visible) element.pause();
      else element.play().catch(() => setPaused(true));
    };
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync(); });
    observer.observe(element);
    preference.addEventListener('change', sync);
    document.addEventListener('visibilitychange', sync);
    sync();
    return () => {
      preference.removeEventListener('change', sync);
      document.removeEventListener('visibilitychange', sync);
      observer.disconnect();
    };
  }, []);
  function toggle() {
    const element = video.current;
    userPaused.current = !element.paused;
    if (element.paused) element.play().catch(() => setPaused(true));
    else element.pause();
  }
  return <section className="film-hero" id="inicio" aria-labelledby="hero-title">
    <img className="film-poster" src="./public/assets/despacho-poster.jpg" alt="" fetchPriority="high" width="2560" height="1440" />
    <video ref={video} className="film-video" muted loop playsInline controls preload="metadata" poster="./public/assets/despacho-poster.jpg" aria-label="Recorrido cinematográfico conceptual de un despacho jurídico" onPlay={() => setPaused(false)} onPause={() => setPaused(true)} onCanPlay={() => setFailed(false)} onError={() => { if (video.current?.error) { setFailed(true); setPaused(true); } }}>
      <source src="./public/assets/despacho-mobile.mp4" media="(max-width: 760px)" type="video/mp4" />
      <source src="./public/assets/despacho-2k.mp4" type="video/mp4" />
      Su navegador no puede reproducir este video. El contenido completo del despacho está disponible a continuación.
    </video>
    <div className="film-shade" aria-hidden="true" />
    <div className="film-copy">
      <p className="eyebrow">RAMOS & ASOCIADOS · FIRMA JURÍDICA</p>
      <h1 id="hero-title">Estrategia<br />con <em>fundamento.</em></h1>
      <p className="film-description">Análisis, estrategia y acompañamiento legal<br className="desktop-break" /> en Hermosillo, Sonora.</p>
      <a className="button film-cta" href="#contacto">Hablemos de su asunto <span aria-hidden="true">↗</span></a>
    </div>
    <div className="film-foot"><a href="#editorial">Conozca la firma <span aria-hidden="true">↓</span></a><span className="film-motto">CRITERIO. DISCRECIÓN. CLARIDAD.</span><button className="film-toggle" type="button" onClick={toggle} aria-pressed={!paused} disabled={failed}>{failed ? 'Video no disponible' : paused ? 'Reproducir video' : 'Pausar video'}</button></div>
  </section>;
}
