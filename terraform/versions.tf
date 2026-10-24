# Phiên bản Terraform và các provider (plugin) cần dùng
terraform {
  required_version = ">= 1.6"

  required_providers {
    # Tạo tài nguyên trên AWS (EC2, Security Group, Elastic IP, Key Pair)
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.0"
    }
    # Ghi file trên máy chạy Terraform (sinh inventory cho Ansible)
    local = {
      source  = "hashicorp/local"
      version = "~> 2.5"
    }
  }
}

provider "aws" {
  region = var.aws_region

  # Tag gắn tự động cho mọi tài nguyên -> dễ lọc trên AWS Console và theo dõi chi phí
  default_tags {
    tags = {
      Project   = var.project
      ManagedBy = "terraform"
    }
  }
}
