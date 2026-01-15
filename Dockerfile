# ---------- BUILD ----------
    FROM node:20-alpine AS builder

    WORKDIR /app
    
    COPY package*.json ./
    RUN npm ci
    
    COPY . .
    RUN npm run build
    
    
    # ---------- PRODUCTION ----------
    FROM node:20-alpine
    
    WORKDIR /app
    
    COPY package*.json ./
    RUN npm ci --only=production
    
    COPY prisma ./prisma
    COPY --from=builder /app/dist ./dist
    COPY --from=builder /app/node_modules ./node_modules
    
    EXPOSE 3000
    
    CMD ["sh", "-c", "npx prisma generate && node dist/main.js"]
    