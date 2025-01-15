FROM node:lts-alpine AS builder
WORKDIR /app
COPY package.json ./
RUN npm install
COPY . .

FROM node:lts-alpine
WORKDIR /app
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/index.js ./

EXPOSE 8090
CMD ["node", "index.js"]
