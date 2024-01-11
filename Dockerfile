FROM node:lts AS builder

WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn
ENV ADAPTER_NODE=true
COPY . .
RUN yarn build
RUN yarn --prod

FROM node:lts

WORKDIR /app
COPY --from=builder /app/build build/
COPY package.json .
COPY --from=builder /app/node_modules node_modules/
ENV NODE_ENV=production
EXPOSE 3000
CMD ["node", "build"]