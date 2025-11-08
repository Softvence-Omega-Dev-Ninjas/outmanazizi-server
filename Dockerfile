FROM node:22 as builder

WORKDIR /usr/src/app

COPY package*.json ./
COPY prisma ./prisma 

RUN npm install 

COPY . .

RUN npm run build 

RUN npm prune --production 

# stage runtime
FROM node:22-alpine as production

RUN apk add --no-cache openssl 

# Create non-root user
RUN addgroup -S app && adduser -S -G app app

WORKDIR /usr/src/app

COPY --from=builder /usr/src/app/package*.json ./
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/prisma ./prisma

COPY scripts/wait-for-it.sh .
COPY scripts/entrypoint.sh .

RUN mkdir -p /usr/src/app/public/uploads
RUN chown -R app:app /usr/src/app/node_modules/@prisma/engines 

RUN chmod +x wait-for-it.sh


RUN npx prisma generate

RUN chmod +x entrypoint.sh

# use crated non-root user 
USER app

ENV NODE_ENV=production

EXPOSE 6969
ENTRYPOINT ["./entrypoint.sh"]
