FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci
COPY . .

# NEXT_PUBLIC_* vars are baked into the client bundle at build time, not read at container
# start — they must be supplied as build args here, not as docker-compose environment vars.
ARG NEXT_PUBLIC_ROOM_SERVICE_URL
ARG NEXT_PUBLIC_PRICING_SERVICE_URL
ENV NEXT_PUBLIC_ROOM_SERVICE_URL=$NEXT_PUBLIC_ROOM_SERVICE_URL
ENV NEXT_PUBLIC_PRICING_SERVICE_URL=$NEXT_PUBLIC_PRICING_SERVICE_URL

RUN npm run build

FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/public ./public
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
EXPOSE 3000
CMD ["node", "server.js"]
