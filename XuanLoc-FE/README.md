# Xuan Loc FE

Giao dien web cho he thong quan ly Trung tam Ngoai ngu Xuan Loc, gom 3 khu vuc theo vai tro (Admin / Giao vien / Hoc vien) va trang gioi thieu cong khai (khoa hoc, lop hoc sap mo, xac minh chung chi, dang ky tu van).

## Cong nghe

- React 19 + Vite
- Redux Toolkit (state quan ly theo tung slice)
- React Router 7 (phan quyen route theo vai tro qua `ProtectedRoute`)
- Ant Design + React-Bootstrap cho giao dien
- Axios (co interceptor tu dong refresh token khi het han)

## Yeu cau

- Node.js 20+
- Backend (`XuanLoc-BE`) dang chay va MySQL da co du lieu (xem README cua XuanLoc-BE)

## Cai dat va chay (khong dung Docker)

```bash
npm install
```

Tao file `.env` o thu muc goc (copy cac bien `VITE_*` - xem muc Bien moi truong ben duoi), sau do:

```bash
npm run dev       # chay dev server, mac dinh tai http://localhost:5173
npm run build     # build production vao thu muc dist/
npm run preview   # xem thu ban build production
npm run lint      # kiem tra loi ESLint
```

## Chay bang Docker

Xem `docker-compose.yml` o thu muc goc cua ca du an:

```bash
docker compose up --build
```

## Bien moi truong (`.env`)

- `VITE_API_URL`: dia chi goc cua backend API (vi du `http://localhost:3069/api`)
- Cac bien `VITE_EP_*`: duong dan tung endpoint cu the, duoc tong hop lai trong `src/api/endpoints.jsx` (`ENDPOINTS`) - luon dung hang so `ENDPOINTS.*` khi goi API, khong hardcode chuoi duong dan.

## Cau truc thu muc

```
src/
  api/            # axiosClient (interceptor auth) + endpoints.jsx (hang so duong dan API)
  common/         # component/hook/constant/util dung chung (ProtectedRoute, Sidebar, roles...)
  layouts/        # layout rieng cho tung khu vuc: AdminLayout, TeacherLayout, StudentLayout, PublicLayout
  pages/
    admin/        # 12 trang quan tri
    teacher/      # 9 trang giang day
    student/      # 8 trang hoc tap
    public/       # trang gioi thieu, danh sach khoa hoc/lop hoc, xac minh chung chi
    auth/         # dang nhap, quen mat khau
  redux/
    slices/       # 1 slice Redux cho moi nhom nghiep vu
```

## Vai tro va phan quyen

3 vai tro: `admin`, `teacher`, `student` (dinh nghia tai `src/common/constants/roles.js`). Moi khu vuc (`/admin/*`, `/teacher/*`, `/student/*`) duoc bao boc boi 1 `ProtectedRoute` kiem tra vai tro dang dang nhap, tu dong chuyen huong ve trang chu dung vai tro neu truy cap sai khu vuc.

## Ghi chu

- Chua co bo test tu dong (chua cau hinh Vitest/Cypress...).
- Chua co he thong thong bao trong ung dung (moi thong bao hien chi qua email tu backend).
