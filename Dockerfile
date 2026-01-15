# ---------- BUILD ----------
    FROM node:20-alpine AS builder

    WORKDIR /app
    
    COPY package*.json ./
    RUN npm ci
    
    # copy prisma schema
    COPY prisma ./prisma
    
    # generate prisma client (custom output → /generated/prisma)
    RUN npx prisma generate
    
    # copy source code AFTER generate
    COPY . .
    
    # build NestJS (TypeScript sudah kenal Prisma Client)
    RUN npm run build
    
    
    # ---------- PRODUCTION ----------
    FROM node:20-alpine
    
    WORKDIR /app
    
    COPY package*.json ./
    RUN npm ci --only=production
    
    COPY prisma ./prisma
    
    COPY --from=builder /app/generated ./generated
    
    COPY --from=builder /app/dist ./dist
    
    EXPOSE 3000
    
    CMD ["node", "dist/src/main.js"]
    