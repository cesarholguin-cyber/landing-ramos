# Ramos & Asociados

Landing page de un despacho jurídico en Hermosillo, Sonora. Incluye HTML completo para lectores y buscadores, video 2K de 15 segundos, fotografías y enlaces de contacto.

## Desplegar en un VPS con Docker

El contenedor compila con Node.js y sirve únicamente los archivos públicos mediante Nginx, como usuario sin privilegios. No requiere una base de datos. Puerto interno: **8080**. Ruta de salud: **/healthz**.

```sh
git clone https://github.com/cesarholguin-cyber/landing-ramos.git
cd landing-ramos
docker build --pull --build-arg SITE_URL=https://tu-dominio.mx -t landing-ramos .
docker run -d --name landing-ramos --restart unless-stopped -p 127.0.0.1:8080:8080 landing-ramos
```

Sustituir `https://tu-dominio.mx` por el dominio real **antes de compilar**. `SITE_URL` es un argumento de construcción, no una variable que pueda cambiar los archivos ya compilados al arrancar. Actualiza canonical, enlaces sociales, identificadores del negocio, robots y sitemap. Sin este argumento, Docker detiene la construcción para no publicar referencias SEO al dominio anterior.

Configurar el proxy inverso del VPS para enviar el dominio al puerto 8080 y proporcionar HTTPS. Si el panel conecta directamente con la red del contenedor (por ejemplo, un panel de despliegue), seleccionar Dockerfile, contexto `.`, argumento `SITE_URL` y puerto interno `8080`; no es necesario publicar un puerto del host. La aplicación se sirve en la raíz del dominio, no en una subcarpeta.

El comando anterior deja el puerto accesible solo desde el VPS. No incluye la configuración del dominio, certificados ni acceso al servidor. No montar la carpeta del proyecto como raíz web: el contenedor ya incluye exclusivamente `dist/client`.

## Comprobar el despliegue

```sh
docker inspect --format='{{.State.Health.Status}}' landing-ramos
curl -f http://127.0.0.1:8080/healthz
curl -I http://127.0.0.1:8080/
curl -I -H 'Range: bytes=0-1023' http://127.0.0.1:8080/public/assets/despacho-2k.mp4
```

Revisar el contacto, reproducción del video, imágenes y títulos desde el dominio definitivo; comprobar canonical y sitemap. El video debe admitir solicitudes parciales (HTTP 206). Los archivos inexistentes responden 404; las secciones de la landing usan anclas (`#contacto`, `#ubicaciones`).

## Desarrollo y pruebas

```sh
npm ci
npm run build
node --test tests/*.test.mjs
npm run preview -- --host 127.0.0.1
```

Editar los componentes en `src/`, no el HTML ni JavaScript generados. Para una compilación local con otro dominio: `SITE_URL=https://tu-dominio.mx npm run build`.

La configuración `.openai/hosting.json` conserva la identidad del sitio previo en Sites; no contiene credenciales y Docker usa `SITE_URL` sin modificarla. Este repositorio es una exportación limpia, sin el historial anterior de publicación.

## Privacidad y pendientes

- No incluir tokens, archivos `.env`, PDFs originales de cédulas ni documentos de trabajo internos. `.dockerignore` restringe los archivos enviados a Docker.
- Las imágenes de los dos títulos ya publicadas se conservan. Las cédulas siguen como fichas de texto; no se restauran sus escaneos.
- Horarios y áreas de práctica continúan pendientes de aprobación. Analytics sigue desactivado.
- El correo público no concede acceso a una cuenta de Google.
- No se garantiza indexación ni posiciones en buscadores. Completar la configuración del dominio y Search Console con el cliente.

Validación al preparar esta entrega: compilación y pruebas locales. Docker no estaba instalado en el equipo de preparación, por lo que la construcción/ejecución real de la imagen debe comprobarse en un entorno con Docker antes de ponerla en producción.

Referencias: [compilaciones multietapa](https://docs.docker.com/build/building/multi-stage/), [imagen oficial Nginx](https://hub.docker.com/_/nginx), [imagen oficial Node.js](https://hub.docker.com/_/node).
