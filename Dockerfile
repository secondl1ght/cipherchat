FROM node:lts AS builder

WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn
COPY . .
RUN yarn build

FROM node:lts

USER 1000
WORKDIR /app
COPY --from=builder /app/build .
EXPOSE 3000
CMD ["node", "./index.js"]