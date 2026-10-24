# ==================== Dữ liệu có sẵn trên AWS (data source - chỉ đọc) ====================

# Ubuntu 24.04 LTS mới nhất do Canonical phát hành
data "aws_ami" "ubuntu" {
  most_recent = true
  owners      = ["099720109477"] # Canonical

  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd-gp3/ubuntu-noble-24.04-amd64-server-*"]
  }
}

# VPC mặc định của region -> không phải tự tạo mạng
data "aws_vpc" "default" {
  default = true
}

# ==================== SSH key ====================

# Đưa public key lên AWS, máy EC2 sẽ cho phép đăng nhập bằng private key tương ứng (develops.pem)
resource "aws_key_pair" "deploy" {
  key_name   = "${var.project}-key"
  public_key = file(var.ssh_public_key_path)
}

# ==================== Firewall (Security Group) ====================

# VPS monitoring: SSH + web (Grafana qua nginx). Prometheus 9090 không mở ra ngoài
resource "aws_security_group" "monitoring" {
  name        = "${var.project}-monitoring-sg"
  description = "Xuan Loc monitoring server"
  vpc_id      = data.aws_vpc.default.id

  ingress {
    description = "SSH"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = var.ssh_allowed_cidrs
  }

  ingress {
    description = "HTTP"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "HTTPS"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    description = "Allow all outbound"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.project}-monitoring-sg"
  }
}

# VPS app: SSH + web, và cho riêng máy monitoring đọc số liệu từ 2 exporter
resource "aws_security_group" "app" {
  name        = "${var.project}-app-sg"
  description = "Xuan Loc app server"
  vpc_id      = data.aws_vpc.default.id

  ingress {
    description = "SSH"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = var.ssh_allowed_cidrs
  }

  ingress {
    description = "HTTP"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "HTTPS"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Chỉ máy thuộc SG monitoring mới gọi được (qua private IP), Internet không thấy 2 port này
  ingress {
    description     = "node-exporter from monitoring"
    from_port       = 9100
    to_port         = 9100
    protocol        = "tcp"
    security_groups = [aws_security_group.monitoring.id]
  }

  ingress {
    description     = "mysqld-exporter from monitoring"
    from_port       = 9104
    to_port         = 9104
    protocol        = "tcp"
    security_groups = [aws_security_group.monitoring.id]
  }

  egress {
    description = "Allow all outbound"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.project}-app-sg"
  }
}

# ==================== 2 máy EC2 ====================

# VPS 1: chạy app (MySQL + backend + frontend + exporter)
resource "aws_instance" "app" {
  ami                    = data.aws_ami.ubuntu.id
  instance_type          = var.instance_type
  key_name               = aws_key_pair.deploy.key_name
  vpc_security_group_ids = [aws_security_group.app.id]

  root_block_device {
    volume_type           = "gp3"
    volume_size           = var.root_volume_size
    encrypted             = true
    delete_on_termination = true
  }

  # Bắt buộc dùng IMDSv2 (chống lấy trộm thông tin máy qua lỗ hổng SSRF)
  metadata_options {
    http_tokens = "required"
  }

  tags = {
    Name = "${var.project}-app"
    Role = "app"
  }
}

# VPS 2: chạy monitoring (Prometheus + Grafana)
resource "aws_instance" "monitoring" {
  ami                    = data.aws_ami.ubuntu.id
  instance_type          = var.instance_type
  key_name               = aws_key_pair.deploy.key_name
  vpc_security_group_ids = [aws_security_group.monitoring.id]

  root_block_device {
    volume_type           = "gp3"
    volume_size           = var.root_volume_size
    encrypted             = true
    delete_on_termination = true
  }

  metadata_options {
    http_tokens = "required"
  }

  tags = {
    Name = "${var.project}-monitoring"
    Role = "monitoring"
  }
}

# ==================== IP tĩnh (Elastic IP) ====================
# IP public thường đổi mỗi lần tắt/bật máy -> dùng Elastic IP để DNS trên Cloudflare luôn đúng

resource "aws_eip" "app" {
  domain   = "vpc"
  instance = aws_instance.app.id

  tags = {
    Name = "${var.project}-app-eip"
  }
}

resource "aws_eip" "monitoring" {
  domain   = "vpc"
  instance = aws_instance.monitoring.id

  tags = {
    Name = "${var.project}-monitoring-eip"
  }
}
