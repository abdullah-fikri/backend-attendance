# FROM node:20-alpine AS builder

# WORKDIR /app

# COPY package*.json ./
# COPY prisma ./prisma

# RUN npm ci
# RUN npx prisma generate

# COPY . .

# RUN npm run build


# # --- PRODUCTION ---
# FROM node:20-alpine

# WORKDIR /app

# COPY package*.json ./
# RUN npm ci --only=production

# COPY prisma ./prisma
# COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
# COPY --from=builder /app/dist ./dist


# EXPOSE 3000

# CMD ["node", "dist/main.js"]

# ---------- BUILDER ----------
    FROM node:20-alpine AS builder

    WORKDIR /app
    
    COPY package*.json ./
    RUN npm ci
    
    COPY prisma ./prisma
    RUN npx prisma generate
    
    COPY . .
    RUN npm run build
    
    
    # ---------- PRODUCTION ----------
    FROM node:20-alpine
    
    WORKDIR /app
    
    COPY package*.json ./
    RUN npm ci --omit=dev
    
    COPY --from=builder /app/dist ./dist
    COPY --from=builder /app/prisma ./prisma
    COPY --from=builder /app/generated ./generated
    
    EXPOSE 3000
    
    CMD ["node", "dist/src/main.js"]
    