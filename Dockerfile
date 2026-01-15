# ---------- BUILDER ----------
    FROM node:20-alpine AS builder

    WORKDIR /app
    
    COPY package*.json ./
    COPY prisma ./prisma
    
    RUN npm ci
    RUN npx prisma generate
    
    COPY . .
    RUN npm run build
    
    
    # ---------- PRODUCTION ----------
    FROM node:20-alpine
    
    WORKDIR /app
    
    COPY package*.json ./
    RUN npm ci --only=production
    
    COPY prisma ./prisma
    COPY --from=builder /app/generated ./generated
    COPY --from=builder /app/dist ./dist
    
    RUN npx prisma generate
    
    EXPOSE 3000
    CMD ["node", "dist/main.js"]
    