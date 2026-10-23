# Xuan Loc BE

Backend API cho he thong quan ly Trung tam Ngoai ngu Xuan Loc: quan ly khoa hoc/lop hoc, ghi danh va hoc phi (tien mat), diem danh, diem so, de thi trac nghiem, chung chi, luong giao vien, CRM tu van dau vao, va bao cao.

Ghi chu: thanh toan chuyen khoan online chua duoc trien khai (chi ho tro ghi nhan thu tien mat thu cong).

## Cong nghe

- Node.js (ES Module) + Express 5
- MySQL + Prisma ORM (driver adapter `@prisma/adapter-mariadb`)
- Xac thuc: JWT (access token 15 phut, refresh token 7 ngay) luu trong httpOnly cookie
- Nodemailer (Gmail SMTP) cho email OTP/thong bao, ExcelJS cho xuat bao cao, PDFKit cho chung chi PDF

## Yeu cau

- Node.js 20+ va MySQL 8+ dang chay (local hoac Docker)

## Cai dat va chay (khong dung Docker)

```bash
npm install
```

Tao file `.env` o thu muc goc (xem cac bien can thiet ben duoi), sau do:

```bash
npm run dev      # chay bang nodemon, tu restart khi sua code
# hoac
npm start        # chay production, khong auto-restart
```

Server mac dinh chay tai `http://localhost:3069`, kiem tra nhanh bang `GET /api/health`.

### Khoi tao du lieu mau (seed)

Neu database da co san schema (bang), chi can seed du lieu mau:

```bash
npm run seed
```

Neu database con trong (chua co bang nao), day schema tu `prisma/schema.prisma` truoc:

```bash
npx prisma db push
npm run seed
```

Tai khoan mau sau khi seed (mat khau deu la `123456`):
- `admin@xuanloc.edu.vn` - Admin
- `teacher@xuanloc.edu.vn` - Giao vien
- `student@xuanloc.edu.vn` - Hoc vien

## Chay bang Docker

Xem `docker-compose.yml` o thu muc goc cua ca du an (ngang hang voi `XuanLoc-BE` va `XuanLoc-FE`):

```bash
docker compose up --build
```

Lenh nay se dung mot MySQL rieng (cong host 3307, khong dung chung voi MySQL dev ban dang chay tren 3306), tu dong tao bang (`prisma db push`) va seed du lieu mau khi container backend khoi dong lan dau.

## Bien moi truong (`.env`)

| Bien | Y nghia |
| --- | --- |
| `DATABASE_URL` | Chuoi ket noi MySQL, dang `mysql://user:pass@host:port/db` |
| `PORT` | Cong chay server (mac dinh 3069 neu bo trong) |
| `FRONTEND_URLS` | Danh sach origin frontend duoc phep goi API (CORS), phan tach boi dau phay |
| `JWT_SECRET` | Khoa ky access token - dung chuoi ngau nhien, dai, giu bi mat |
| `JWT_REFRESH_SECRET` | Khoa ky refresh token - dung chuoi ngau nhien, dai, giu bi mat |
| `EMAIL_USER` / `EMAIL_PASS` | Tai khoan Gmail (App Password) dung de gui email OTP/thong bao qua Nodemailer |

## Cau truc thu muc

```
src/
  common/        # constant, helper, middleware, ket noi Prisma
  controllers/   # nhan request, goi service, tra response
  routers/       # khai bao route + phan quyen theo vai tro (admin/teacher/student)
  services/      # toan bo logic nghiep vu + truy van Prisma
prisma/
  schema.prisma  # dinh nghia data model
  seed.js        # du lieu mau
docs/
  XuanLoc-BE.postman_collection.json  # Postman collection tham khao (chua bao phu het toan bo API)
```

## Ghi chu

- Chua co bo test tu dong (`npm test` hien la stub). Nen bo sung khi mo rong them tinh nang.
- Danh sach role hien co: `admin`, `teacher`, `student`. Chua co cong danh cho phu huynh hoac tai khoan le tan rieng.
