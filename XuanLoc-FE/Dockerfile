# ============ Stage 1: builder - dùng Node build React ra file tĩnh ============
FROM node:24-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# URL của API được gắn cứng vào bundle lúc build.
# Không truyền build arg -> Vite lấy giá trị trong .env.production
# Truyền --build-arg VITE_API_URL=... -> ghi đè (vd: chạy local bằng docker compose)
ARG VITE_API_URL
RUN if [ -z "$VITE_API_URL" ]; then unset VITE_API_URL; fi && npm run build


# ============ Stage 2: nginx phục vụ file tĩnh - image nhỏ, không chứa Node ============
FROM nginx:1.30-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

# docker build -t xuanloc-fe ./XuanLoc-FE
