# Ansible - chạy trong container Ubuntu

Làm theo cách của khoá học (`devops_04/ansible/doc.md`). Khác vài chỗ:

- Mount **cả repo**: playbook copy file khởi tạo DB (`XuanLoc-BE/database/init`) và dashboard Grafana (`monitoring/grafana`) nằm ngoài thư mục `ansible`
- Mount thêm thư mục **key** (chứa `develops.pem` và chứng chỉ Cloudflare) ở chế độ chỉ đọc
- `ANSIBLE_CONFIG`: thư mục mount từ Windows bị Ansible coi là "world writable" nên bỏ qua `ansible.cfg` -> chỉ định rõ đường dẫn

## 1. Tạo container (PowerShell)

Dùng đường dẫn tuyệt đối `C:\Projects\xuanloc` nên đứng ở thư mục nào chạy cũng đúng
(`./` sẽ mount nhầm thư mục hiện tại, ví dụ `C:\Users\<bạn>`).

```bash
docker run --name ubuntu-ansible -d -it -e DEBIAN_FRONTEND=noninteractive -e ANSIBLE_CONFIG=/root/xuanloc/ansible/ansible.cfg -v C:\Projects\xuanloc:/root/xuanloc -v "$env:USERPROFILE\OneDrive\Desktop\Programming\DevOps\key:/root/key:ro" ubuntu:24.04

docker exec -it ubuntu-ansible bash

# Kiểm tra mount đúng: phải thấy ansible, terraform, XuanLoc-BE, XuanLoc-FE...
ls /root/xuanloc
```

## 2. Cài Ansible (chỉ làm 1 lần, trong container)

```bash
apt update
apt install -y software-properties-common openssh-client
add-apt-repository --yes --update ppa:ansible/ansible
apt install -y ansible

ansible --version
# phải thấy: config file = /root/xuanloc/ansible/ansible.cfg
ansible-galaxy collection list community.docker
```

## 3. SSH key và chứng chỉ HTTPS

```bash
# File mount từ Windows có quyền 777 -> SSH báo "UNPROTECTED PRIVATE KEY FILE"
# -> copy vào ~/.ssh rồi chmod 400 (chỉ chủ file được đọc)
mkdir -p ~/.ssh
cp /root/key/develops.pem ~/.ssh/develops.pem
chmod 400 ~/.ssh/develops.pem

# Chứng chỉ Cloudflare Origin cho nginx (ansible/files đã .gitignore *.crt, *.key)
cp /root/key/bui-van-tuan-lam.com.crt /root/key/bui-van-tuan-lam.com.key /root/xuanloc/ansible/files/
```

## 4. Secret (Ansible Vault) - chỉ làm 1 lần

```bash
cd /root/xuanloc/ansible

cp vault.example.yml group_vars/all/vault.yml
```

Mở `ansible/group_vars/all/vault.yml` bằng VS Code trên Windows (cùng một file vì đã mount), thay hết `change-me`:

- 3 mật khẩu MySQL: `openssl rand -hex 16` (chạy 3 lần)
- 2 khoá JWT: `openssl rand -hex 32` (chạy 2 lần)
- Email + ngân hàng: lấy từ `XuanLoc-BE/.env`
- Mật khẩu Grafana: tự đặt

Lưu file rồi mã hoá (đặt mật khẩu vault, nhớ mật khẩu này):

```bash
ansible-vault encrypt group_vars/all/vault.yml

# xem / sửa lại sau này
ansible-vault view group_vars/all/vault.yml
ansible-vault edit group_vars/all/vault.yml
```

## 5. Chạy (sau khi `terraform apply` đã sinh `inventory.ini`)

```bash
cd /root/xuanloc/ansible

ansible-inventory -i inventory.ini --graph

# PING - phải thấy 2 dòng SUCCESS / "pong" (UNREACHABLE thì đợi 1 phút cho EC2 khởi động)
ansible all -m ping -i inventory.ini

# Cài đặt + deploy toàn bộ (hỏi mật khẩu vault)
ansible-playbook -i inventory.ini site.yml --ask-vault-pass

# Hoặc chạy từng bước
ansible-playbook -i inventory.ini 01-common.yml
ansible-playbook -i inventory.ini 02-docker.yml
ansible-playbook -i inventory.ini 03-nginx.yml
ansible-playbook -i inventory.ini 04-deploy-app.yml --ask-vault-pass
ansible-playbook -i inventory.ini 05-deploy-monitoring.yml --ask-vault-pass
```

Kết quả đúng: `PLAY RECAP` có `failed=0` ở cả `xuanloc-app` và `xuanloc-monitoring`.

## Lần sau

```bash
docker start ubuntu-ansible
docker exec -it ubuntu-ansible bash
cd /root/xuanloc/ansible
```
