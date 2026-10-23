# ============ Stage 1: builder - cài đủ thư viện (kể cả devDependencies) để sinh Prisma Client ============
FROM node:24-alpine AS builder

WORKDIR /app

# Copy package*.json trước để tận dụng cache: sửa code mà không đổi thư viện thì không phải cài lại
COPY package.json package-lock.json ./
RUN npm ci

# Prisma Client bị gitignore nên phải sinh lại trong image
COPY prisma ./prisma
COPY prisma.config.ts ./
# prisma.config.ts đọc DATABASE_URL nhưng generate không kết nối DB, nên dùng giá trị giả chỉ cho lệnh này
RUN DATABASE_URL="mysql://build:build@localhost:3306/build" npx prisma generate


# ============ Stage 2: runner - image chạy thật, chỉ chứa thư viện production ============
FROM node:24-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY . .
COPY --from=builder /app/src/common/prisma/generated ./src/common/prisma/generated

# Thư mục lưu avatar - compose mount volume vào đây để không mất file khi tạo lại container
RUN mkdir -p uploads/avatars && chown -R node:node uploads

# Chạy bằng user thường (node) thay vì root
USER node

EXPOSE 3069

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD wget -qO- "http://127.0.0.1:${PORT:-3069}/api/health" || exit 1

CMD ["node", "server.js"]

# docker build -t xuanloc-be ./XuanLoc-BE
