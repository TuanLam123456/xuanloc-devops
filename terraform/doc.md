# Terraform - chạy trong container Ubuntu

Làm theo cách của khoá học (`devops_04/terraform/doc.md`). Khác một chỗ: mount **cả repo** thay vì chỉ thư mục `terraform`,
vì Terraform ghi file `ansible/inventory.ini` cho Ansible dùng.

## 1. Tạo container (PowerShell)

```bash
docker run --name ubuntu-terraform -d -it -e DEBIAN_FRONTEND=noninteractive -v C:\Projects\xuanloc:/root/xuanloc ubuntu:24.04

docker exec -it ubuntu-terraform bash

# Kiểm tra mount đúng: phải thấy ansible, terraform, XuanLoc-BE, XuanLoc-FE...
ls /root/xuanloc
```

- `-v C:\Projects\xuanloc:/root/xuanloc`: thư mục repo trên máy hiện ra trong container ở `/root/xuanloc`.
  Dùng đường dẫn tuyệt đối nên đứng ở thư mục nào chạy cũng đúng (`./` sẽ mount nhầm thư mục hiện tại)
- `DEBIAN_FRONTEND=noninteractive`: `apt install` không hỏi múi giờ giữa chừng

## 2. Cài Terraform + AWS CLI (chỉ làm 1 lần, trong container)

```bash
apt update && apt install -y curl unzip less

cd ~

# Terraform
curl -fsSLo terraform.zip https://releases.hashicorp.com/terraform/1.16.7/terraform_1.16.7_linux_amd64.zip
unzip terraform.zip -d /usr/local/bin
terraform --version

# AWS CLI
curl -fsSLo awscliv2.zip https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip
unzip -q awscliv2.zip
./aws/install
aws --version
```

## 3. Đăng nhập AWS

```bash
aws configure
# AWS Access Key ID     : cột 1 trong file xuanloc-terraform_accessKeys.csv
# AWS Secret Access Key : cột 2 trong file csv
# Default region name   : ap-southeast-1
# Default output format : json

aws sts get-caller-identity
# phải thấy "Arn": "arn:aws:iam::...:user/xuanloc-terraform"
```

## 4. Tạo / xoá hạ tầng

```bash
cd /root/xuanloc/terraform

terraform fmt

terraform init

terraform validate

terraform plan

terraform apply
# gõ yes -> tạo 2 EC2 + 2 Elastic IP + 2 Security Group + key pair, sinh ../ansible/inventory.ini

terraform output
# app_public_ip, monitoring_public_ip -> dùng để trỏ DNS trên Cloudflare

terraform destroy
# xoá toàn bộ khi không dùng (để không tốn tiền)
```

## Lần sau

Container vẫn còn (đã cài sẵn công cụ và `aws configure`), chỉ cần:

```bash
docker start ubuntu-terraform
docker exec -it ubuntu-terraform bash
cd /root/xuanloc/terraform
```
