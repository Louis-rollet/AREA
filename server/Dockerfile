FROM node:lts-alpine AS builder
RUN apk add --no-cache python3 make g++ git openssh
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install
COPY . .
RUN npx prisma generate
RUN yarn test --coverage --coverageDirectory=./coverage
RUN yarn build

FROM node:lts-alpine
WORKDIR /app
COPY --from=builder /app/package.json /app/yarn.lock ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/.env ./

EXPOSE 8080
CMD ["node", "dist/main"]
