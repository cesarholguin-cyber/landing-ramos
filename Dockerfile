# syntax=docker/dockerfile:1
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json .npmrc ./
RUN npm ci --include=dev
COPY src ./src
COPY scripts ./scripts
COPY worker ./worker
COPY tests ./tests
COPY public ./public
COPY .openai/hosting.json ./.openai/hosting.json
# Build and test the default site before applying the deployment-specific origin.
RUN npm run build && node --test tests/*.test.mjs
ARG SITE_URL
RUN test -n "$SITE_URL" || (echo 'Set SITE_URL to the public HTTPS origin of your VPS.' >&2; exit 1)
RUN SITE_URL="$SITE_URL" npm run build

FROM nginx:stable-alpine AS runtime
COPY docker/nginx.conf /etc/nginx/nginx.conf
COPY --from=build /app/dist/client/ /srv/www/
USER nginx
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -q -O /dev/null http://127.0.0.1:8080/healthz || exit 1
ENTRYPOINT []
CMD ["nginx", "-g", "daemon off;"]
