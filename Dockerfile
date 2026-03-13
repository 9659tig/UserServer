# --- Build stage ---
FROM node:20-slim AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# --- Production stage ---
FROM node:20-slim

RUN apt-get update && apt-get install -y \
    mecab libmecab-dev git curl build-essential autoconf automake libtool \
    && rm -rf /var/lib/apt/lists/*

RUN git clone --depth 1 https://bitbucket.org/eunjeon/mecab-ko-dic.git /tmp/mecab-ko-dic \
    && cd /tmp/mecab-ko-dic \
    && ./autogen.sh && ./configure && make && make install \
    && rm -rf /tmp/mecab-ko-dic

WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY --from=builder /app/dist ./dist

HEALTHCHECK --interval=30s --timeout=5s --start-period=120s \
    CMD curl -f http://localhost:3004/health || exit 1

EXPOSE 3004
CMD ["node", "dist/app.js"]
