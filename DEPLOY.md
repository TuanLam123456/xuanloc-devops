# Hướng dẫn triển khai lên AWS

```
push main ─► GitHub Actions: CI ─► build 2 image ─► Docker Hub ─► SSH vào VPS app: pull + up
Jenkins (Docker Desktop, bấm tay) ─► build ─► Docker Hub ─► SSH vào VPS app: pull + up

Terraform ─► tạo 2 EC2 + Elastic IP + Security Group ─► sinh ansible/inventory.ini
Ansible   ─► cài Docker, nginx (HTTPS Cloudflare), deploy app + monitoring

VPS app        : nginx ─► frontend :3000, backend :3069 | MySQL | node-exporter, mysqld-exporter
VPS monitoring : nginx ─► Grafana :3001 | Prometheus (đọc exporter của VPS app qua IP nội bộ)
```

| Domain | Trỏ về |
| --- | --- |
| https://xuanloc.bui-van-tuan-lam.com | VPS app (web) |
| https://api-xuanloc.bui-van-tuan-lam.com | VPS app (API) |
| https://grafana-xuanloc.bui-van-tuan-lam.com | VPS monitoring |

Mọi lệnh bên dưới chạy trong **Git Bash** ở thư mục gốc repo, Docker Desktop đang bật.

---

## 0. File bí mật (để ngoài repo)

Thư mục `C:\Users\<bạn>\OneDrive\Desktop\Programming\DevOps\key\` cần có:

| File | Dùng cho |
| --- | --- |
| `develops.pem` | SSH vào 2 VPS (Ansible, GitHub Actions, Jenkins) |
| `xuanloc-terraform_accessKeys.csv` | Terraform tạo tài nguyên AWS |
| `bui-van-tuan-lam.com.crt`, `.key` | HTTPS (Cloudflare Origin) |
| `docker-login` | Docker Hub access token |
| `xuanloc-vault-pass.txt` | Mật khẩu mở Ansible Vault (tạo ở mục 5.2) |

---

## 1. GitHub: Secrets và Variables

Repo trên GitHub → **Settings → Secrets and variables → Actions**.

Tab **Variables** → *New repository variable*:

| Tên | Giá trị |
| --- | --- |
| `DOCKERHUB_USERNAME` | `lam141000` |
| `DEPLOY_ENABLED` | `false` (đổi thành `true` ở mục 6) |

Tab **Secrets** → *New repository secret*:

| Tên | Giá trị |
| --- | --- |
| `DOCKERHUB_TOKEN` | nội dung file `docker-login` |
| `SSH_PRIVATE_KEY` | toàn bộ nội dung `develops.pem` (cả dòng `-----BEGIN/END ...-----`) |
| `SSH_HOST` | IP public của VPS app (có sau mục 3) |

## 2. Build image lần đầu

Tab **Actions** → workflow **CI/CD** → **Run workflow** (nhánh `main`).
Job `ci` và 2 job `build` xanh là Docker Hub đã có `lam141000/xuanloc-be` và `lam141000/xuanloc-fe`.
Job `deploy` bị bỏ qua vì `DEPLOY_ENABLED=false` - đúng như mong đợi.

## 3. Tạo 2 VPS bằng Terraform

```bash
./terraform/tf.sh init
./terraform/tf.sh apply
```

Gõ `yes` khi được hỏi. Xong sẽ in ra `app_public_ip`, `monitoring_public_ip` và tự tạo `ansible/inventory.ini`.
Xem lại bất cứ lúc nào: `./terraform/tf.sh output`. Từ lúc này bắt đầu tính tiền (~1.6 USD/ngày).

## 4. Cloudflare DNS

Cloudflare → domain `bui-van-tuan-lam.com` → **DNS → Records → Add record**, 3 bản ghi loại **A**, bật **Proxied** (mây cam):

| Name | IPv4 |
| --- | --- |
| `xuanloc` | `app_public_ip` |
| `api-xuanloc` | `app_public_ip` |
| `grafana-xuanloc` | `monitoring_public_ip` |

**SSL/TLS → Overview** phải là **Full (strict)** (Flexible sẽ bị lặp redirect).

## 5. Ansible: cài đặt và deploy

**5.1. Chứng chỉ HTTPS** - copy 2 file `bui-van-tuan-lam.com.crt` và `bui-van-tuan-lam.com.key` vào `ansible/files/`.

**5.2. Mật khẩu Vault** (chỉ làm 1 lần):

```bash
openssl rand -hex 24 > ~/OneDrive/Desktop/Programming/DevOps/key/xuanloc-vault-pass.txt
```

**5.3. File secret** - copy `ansible/vault.example.yml` thành `ansible/group_vars/all/vault.yml`, điền giá trị thật:

- 3 mật khẩu MySQL: chuỗi chữ + số mới (`openssl rand -hex 16`)
- 2 khoá JWT: chuỗi mới (`openssl rand -hex 32`), **không** dùng lại khoá ở máy local
- Email + ngân hàng: lấy từ `XuanLoc-BE/.env`
- Mật khẩu Grafana: tự đặt

Rồi mã hoá:

```bash
./ansible/run.sh ansible-vault encrypt group_vars/all/vault.yml
```

Sửa lại sau này: `./ansible/run.sh ansible-vault edit group_vars/all/vault.yml`

**5.4. Thử kết nối** (lần đầu tự build image Ansible, mất vài phút):

```bash
./ansible/run.sh ansible all -m ping
```

**5.5. Chạy toàn bộ:**

```bash
./ansible/run.sh ansible-playbook site.yml
```

Các playbook chạy lần lượt: `01-common` (múi giờ, swap) → `02-docker` → `03-nginx` → `04-deploy-app` → `05-deploy-monitoring`.
Chạy lại bao nhiêu lần cũng được (idempotent). Chỉ deploy lại app: `./ansible/run.sh ansible-playbook 04-deploy-app.yml`.

**5.6. Kiểm tra:** mở 3 domain ở đầu trang. Grafana đăng nhập `admin` + mật khẩu trong vault, thư mục **Xuân Lộc** có 2 dashboard.

## 6. Bật tự động deploy bằng GitHub Actions

1. Secret `SSH_HOST` = `app_public_ip`
2. Variable `DEPLOY_ENABLED` = `true`
3. Sửa 1 dòng chữ trong `XuanLoc-FE`, commit, push `main` → tab Actions chạy đủ `ci → build → deploy`, vài phút sau web cập nhật.

## 7. Jenkins (chạy trên máy bạn)

**7.1. Khởi động:**

```bash
cd jenkins && docker compose up -d --build && cd ..
```

**7.2. Cài đặt lần đầu** - mở http://localhost:8090, lấy mật khẩu ban đầu:

```bash
MSYS_NO_PATHCONV=1 docker exec xuanloc-jenkins cat /var/jenkins_home/secrets/initialAdminPassword
```

Màn hình cài plugin chọn **Select plugins to install → None** (plugin đã cài sẵn trong image) → tạo tài khoản admin.

**7.3. Credentials** - *Manage Jenkins → Credentials → System → Global credentials → Add Credentials*:

| Kind | ID | Nội dung |
| --- | --- | --- |
| Username with password | `dockerhub-login` | Username `lam141000`, Password = token Docker Hub |
| SSH Username with private key | `app-server-ssh` | Username `ubuntu`, Private Key → *Enter directly* → dán `develops.pem` |
| Secret text | `app-server-host` | `app_public_ip` |

**7.4. Tạo job** - *New Item* → tên `xuanloc-deploy` → **Pipeline** → OK:

- *Definition*: **Pipeline script from SCM**
- *SCM*: **Git**, Repository URL `https://github.com/TuanLam123456/xuanloc-devops.git` (repo public, không cần credentials)
- *Branch*: `*/main`, *Script Path*: `Jenkinsfile` → **Save**

**7.5. Chạy** - **Build Now** (lần đầu Jenkins đọc Jenkinsfile để biết tham số), các lần sau **Build with Parameters**, tick `DEPLOY` để deploy lên VPS.

Jenkins chạy ở máy cá nhân nên GitHub không gọi webhook vào được. Muốn tự chạy khi có commit mới: *Configure → Triggers → Poll SCM* `H/5 * * * *` (khi đó GitHub Actions cũng deploy cùng commit - không lỗi, chỉ chạy 2 lần).

Tắt Jenkins cho nhẹ máy: `cd jenkins && docker compose stop`.

## 8. Tắt server khi không dùng

1. Variable `DEPLOY_ENABLED` = `false` (để push code không deploy vào server đã xoá)
2. Xoá toàn bộ tài nguyên AWS:

```bash
./terraform/tf.sh destroy
```

Khi tạo lại: chạy lại từ mục 3. Elastic IP mới sẽ khác IP cũ → cập nhật DNS (mục 4), `SSH_HOST` và credential `app-server-host`.
