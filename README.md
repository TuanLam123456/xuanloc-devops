# Xuân Lộc English Center — Đồ án cuối khoá DevOps

Hệ thống quản lý Trung tâm Ngoại ngữ Xuân Lộc, dùng làm đồ án cuối khoá DevOps (CyberSoft): đóng gói Docker, tự động deploy bằng GitHub Actions + Jenkins, giám sát bằng Prometheus + Grafana, tạo hạ tầng AWS bằng Terraform và cài đặt bằng Ansible.

## Cấu trúc thư mục

| Thư mục | Nội dung |
| --- | --- |
| `XuanLoc-BE/` | API Node.js (Express 5 + Prisma 7 + MySQL) |
| `XuanLoc-FE/` | Giao diện web React 19 + Vite |
| `docker-compose.yml` | Chạy MySQL + backend + frontend + exporter trên Docker Desktop |
| `monitoring/` | Prometheus + Grafana (datasource và dashboard tự nạp) |
| `terraform/` | Tạo 2 VPS trên AWS (EC2, Elastic IP, Security Group) |
| `ansible/` | Cài Docker, nginx + HTTPS, deploy app và monitoring lên VPS |
| `.github/workflows/cicd.yml` | GitHub Actions: CI → build image → deploy |
| `Jenkinsfile`, `jenkins/` | Pipeline Jenkins và Jenkins chạy local trên Docker Desktop |
| `DEPLOY.md` | **Hướng dẫn cấu hình và triển khai lên AWS từng bước** |
| `HUONG-DAN-NGHIEP-VU.md` | Hướng dẫn nghiệp vụ theo từng vai trò |

## Địa chỉ triển khai (sắp có)

- Web: https://xuanloc.bui-van-tuan-lam.com
- API: https://api-xuanloc.bui-van-tuan-lam.com
- Grafana: https://grafana-xuanloc.bui-van-tuan-lam.com

## Chạy bằng Docker (Docker Desktop)

1. Tạo `.env` ở thư mục gốc từ `.env.example` (mật khẩu MySQL) và `XuanLoc-BE/.env` từ `XuanLoc-BE/.env.example` (JWT, email...).
2. Build và chạy:
   ```bash
   docker compose up -d --build
   ```
3. Mở web tại http://localhost:3000, kiểm tra API tại http://localhost:3069/api/health.

Lần chạy đầu tiên, MySQL tự nạp `XuanLoc-BE/database/init/01-xuan_loc_center.sql` (cấu trúc + dữ liệu mẫu). Dữ liệu được giữ trong volume `mysql-data`; muốn nạp lại từ đầu thì chạy `docker compose down -v` (xoá cả dữ liệu).

## Giám sát (Prometheus + Grafana)

App đã có sẵn 2 exporter trong `docker-compose.yml`: `node-exporter` (phần cứng) và `mysqld-exporter` (trạng thái MySQL).

1. Tạo `monitoring/.env` từ `monitoring/.env.example` (tài khoản admin Grafana).
2. Chạy:
   ```bash
   cd monitoring && docker compose up -d
   ```
3. Prometheus: http://localhost:9090 (Status → Targets), Grafana: http://localhost:3001 → thư mục **Xuân Lộc** có 2 dashboard: *Node Exporter Full* và *MySQL Exporter Quickstart and Dashboard*.

## Tiến độ DevOps

- [x] Git & GitHub
- [x] Docker + docker-compose
- [x] Monitoring (Prometheus + Grafana)
- [x] Terraform (AWS EC2)
- [x] Ansible
- [x] GitHub Actions
- [x] Jenkins
- [ ] Triển khai thật lên AWS + domain (làm theo [DEPLOY.md](DEPLOY.md))

Cách chạy local: xem README trong `XuanLoc-BE/` và `XuanLoc-FE/`.
