FROM node:12-buster-slim AS builder

WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn
COPY . .
RUN yarn build

FROM node:12-buster-slim

USER 1000
WORKDIR /app
COPY --from=builder /app/build .
EXPOSE 3000
CMD ["node", "./index.js"]