# Xuân Lộc English Center — Đồ án cuối khoá DevOps

Hệ thống quản lý Trung tâm Ngoại ngữ Xuân Lộc, dùng làm đồ án cuối khoá DevOps (CyberSoft): đóng gói Docker, tự động deploy bằng GitHub Actions + Jenkins, giám sát bằng Prometheus + Grafana, tạo hạ tầng AWS bằng Terraform và cài đặt bằng Ansible.

## Cấu trúc thư mục

| Thư mục | Nội dung |
| --- | --- |
| `XuanLoc-BE/` | API Node.js (Express 5 + Prisma 7 + MySQL) |
| `XuanLoc-FE/` | Giao diện web React 19 + Vite |
| `HUONG-DAN-NGHIEP-VU.md` | Hướng dẫn nghiệp vụ theo từng vai trò |

## Địa chỉ triển khai (sắp có)

- Web: https://xuanloc.bui-van-tuan-lam.com
- API: https://api-xuanloc.bui-van-tuan-lam.com
- Grafana: https://grafana-xuanloc.bui-van-tuan-lam.com

## Tiến độ DevOps

- [x] Git & GitHub
- [ ] Docker + docker-compose
- [ ] Monitoring (Prometheus + Grafana)
- [ ] Terraform (AWS EC2)
- [ ] Ansible
- [ ] GitHub Actions
- [ ] Jenkins

Cách chạy local: xem README trong `XuanLoc-BE/` và `XuanLoc-FE/`.
