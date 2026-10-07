FROM node:24-bookworm-slim AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:24-bookworm-slim
ENV NODE_ENV=production HOST=0.0.0.0 PORT=3000 TOPFIT_DATA_DIR=/data/topfit
WORKDIR /app
COPY --from=build --chown=node:node /app/.output ./.output
RUN mkdir -p /data/topfit && chown -R node:node /data
USER node
EXPOSE 3000
CMD ["node", ".output/server/index.mjs"]
