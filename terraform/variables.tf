# Các giá trị có thể thay đổi mà không phải sửa main.tf.
# Muốn đổi thì tạo file terraform.tfvars (xem terraform.tfvars.example)

variable "project" {
  description = "Tiền tố đặt tên cho mọi tài nguyên"
  type        = string
  default     = "xuanloc"
}

variable "aws_region" {
  description = "Region AWS - Singapore gần Việt Nam nhất"
  type        = string
  default     = "ap-southeast-1"
}

variable "instance_type" {
  description = "Loại máy EC2 cho cả 2 VPS (t3.small = 2 vCPU, 2 GB RAM)"
  type        = string
  default     = "t3.small"
}

variable "root_volume_size" {
  description = "Dung lượng ổ cứng mỗi máy (GB). Mặc định của AWS chỉ 8 GB, không đủ cho Docker image + MySQL"
  type        = number
  default     = 20
}

variable "ssh_public_key_path" {
  description = "Public key đưa lên AWS để SSH vào máy (sinh từ develops.pem bằng ssh-keygen -y)"
  type        = string
  default     = "ssh/develops.pub"
}

variable "ssh_private_key_path" {
  description = "Đường dẫn private key ở máy chạy Ansible, được ghi vào inventory.ini"
  type        = string
  default     = "~/.ssh/develops.pem"
}

variable "ssh_allowed_cidrs" {
  description = "Dải IP được SSH vào máy. Để 0.0.0.0/0 vì GitHub Actions dùng IP thay đổi liên tục (chỉ đăng nhập bằng key)"
  type        = list(string)
  default     = ["0.0.0.0/0"]
}
