# Hướng dẫn triển khai lên AWS

```
push main ─► GitHub Actions: CI ─► build 2 image ─► Docker Hub ─► SSH vào VPS app: pull + up
Jenkins (Docker Desktop, bấm tay) ─► build ─► Docker Hub ─► SSH vào VPS app: pull + up

Terraform (container ubuntu-terraform) ─► tạo 2 EC2 + Elastic IP + Security Group ─► sinh ansible/inventory.ini
Ansible   (container ubuntu-ansible)   ─► cài Docker, nginx (HTTPS Cloudflare), deploy app + monitoring

VPS app        : nginx ─► frontend :3000, backend :3069 | MySQL | node-exporter, mysqld-exporter
VPS monitoring : nginx ─► Grafana :3001 | Prometheus (đọc exporter của VPS app qua IP nội bộ)
```

| Domain | Trỏ về |
| --- | --- |
| https://xuanloc.bui-van-tuan-lam.com | VPS app (web) |
| https://api-xuanloc.bui-van-tuan-lam.com | VPS app (API) |
| https://grafana-xuanloc.bui-van-tuan-lam.com | VPS monitoring |

Terraform và Ansible chạy **trong container Ubuntu** giống cách của khoá học (`devops_04/terraform/doc.md`, `devops_04/ansible/doc.md`).
Lệnh `docker run` gõ trong **PowerShell** ở thư mục `C:\Projects\xuanloc`, Docker Desktop đang bật.

---

## 0. File bí mật (để ngoài repo)

Thư mục `C:\Users\<bạn>\OneDrive\Desktop\Programming\DevOps\key\` cần có:

| File | Dùng cho |
| --- | --- |
| `xuanloc-terraform_accessKeys.csv` | `aws configure` trong container Terraform |
| `develops.pem` | SSH vào 2 VPS (Ansible, GitHub Actions, Jenkins) |
| `bui-van-tuan-lam.com.crt`, `.key` | HTTPS (Cloudflare Origin) |
| `docker-login` | Docker Hub access token |

Container Ansible mount thư mục này (chỉ đọc) vào `/root/key`.

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

Chi tiết từng lệnh: [terraform/doc.md](terraform/doc.md).

```bash
# PowerShell
docker run --name ubuntu-terraform -d -it -e DEBIAN_FRONTEND=noninteractive -v C:\Projects\xuanloc:/root/xuanloc ubuntu:24.04
docker exec -it ubuntu-terraform bash
```

Trong container: cài Terraform + AWS CLI (lần đầu) → `aws configure` (key trong file csv, region `ap-southeast-1`) →

```bash
cd /root/xuanloc/terraform
terraform init
terraform validate
terraform plan
terraform apply      # gõ yes
terraform output     # app_public_ip, monitoring_public_ip
```

`terraform apply` tự tạo `ansible/inventory.ini` với IP thật. Từ lúc này bắt đầu tính tiền (~1.6 USD/ngày).

## 4. Cloudflare DNS

Cloudflare → domain `bui-van-tuan-lam.com` → **DNS → Records → Add record**, 3 bản ghi loại **A**, bật **Proxied** (mây cam):

| Name | IPv4 |
| --- | --- |
| `xuanloc` | `app_public_ip` |
| `api-xuanloc` | `app_public_ip` |
| `grafana-xuanloc` | `monitoring_public_ip` |

**SSL/TLS → Overview** phải là **Full (strict)** (Flexible sẽ bị lặp redirect).

## 5. Ansible: cài đặt và deploy

Chi tiết từng lệnh: [ansible/doc.md](ansible/doc.md).

```bash
# PowerShell
docker run --name ubuntu-ansible -d -it -e DEBIAN_FRONTEND=noninteractive -e ANSIBLE_CONFIG=/root/xuanloc/ansible/ansible.cfg -v C:\Projects\xuanloc:/root/xuanloc -v "$env:USERPROFILE\OneDrive\Desktop\Programming\DevOps\key:/root/key:ro" ubuntu:24.04
docker exec -it ubuntu-ansible bash
```

Trong container (lần đầu): cài Ansible từ PPA → copy `develops.pem` vào `~/.ssh` (`chmod 400`) và copy chứng chỉ vào `ansible/files/` → tạo `group_vars/all/vault.yml` từ `vault.example.yml`, điền secret, `ansible-vault encrypt`. Sau đó:

```bash
cd /root/xuanloc/ansible
ansible all -m ping -i inventory.ini
ansible-playbook -i inventory.ini site.yml --ask-vault-pass
```

Các playbook chạy lần lượt: `01-common` (múi giờ, swap) → `02-docker` → `03-nginx` → `04-deploy-app` → `05-deploy-monitoring`.
Chạy lại bao nhiêu lần cũng được (idempotent). Kết quả đúng: `failed=0` ở cả 2 máy.

**Kiểm tra:** mở 3 domain ở đầu trang. Grafana đăng nhập `admin` + mật khẩu trong vault, thư mục **Xuân Lộc** có 2 dashboard.

## 6. Bật tự động deploy bằng GitHub Actions

1. Secret `SSH_HOST` = `app_public_ip`
2. Variable `DEPLOY_ENABLED` = `true`
3. Sửa 1 dòng chữ trong `XuanLoc-FE`, commit, push `main` → tab Actions chạy đủ `ci → build → deploy`, vài phút sau web cập nhật.

## 7. Jenkins (chạy trên máy bạn)

**7.1. Khởi động** (PowerShell):

```bash
cd jenkins; docker compose up -d --build; cd ..
```

**7.2. Cài đặt lần đầu** - mở http://localhost:8090, lấy mật khẩu ban đầu:

```bash
docker exec xuanloc-jenkins cat /var/jenkins_home/secrets/initialAdminPassword
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

Tắt Jenkins cho nhẹ máy: `cd jenkins; docker compose stop`.

## 8. Tắt server khi không dùng

1. Variable `DEPLOY_ENABLED` = `false` (để push code không deploy vào server đã xoá)
2. Trong container Terraform:

```bash
docker start ubuntu-terraform
docker exec -it ubuntu-terraform bash
cd /root/xuanloc/terraform && terraform destroy
```

Khi tạo lại: chạy lại từ mục 3. Elastic IP mới sẽ khác IP cũ → cập nhật DNS (mục 4), `SSH_HOST` và credential `app-server-host`.

---

**Cách khác (không dùng container Ubuntu):** chạy trong Git Bash bằng 2 script có sẵn `./terraform/tf.sh <lệnh>` và `./ansible/run.sh <lệnh>` - chúng tự chạy Terraform / Ansible trong Docker.
