FROM node:22-alpine AS build
WORKDIR /build
COPY scripts/build-site.mjs scripts/build-resume.mjs ./scripts/
COPY src ./src
COPY public/assets ./public/assets
RUN node scripts/build-site.mjs --production

FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production HOST=0.0.0.0 PORT=8080 BASE_PATH=/portfolio/
COPY --chown=node:node server.mjs ./server.mjs
COPY --from=build --chown=node:node /build/dist ./public
USER node
EXPOSE 8080
CMD ["node", "server.mjs"]
