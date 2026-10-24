#!/usr/bin/env bash
# Chạy Terraform bằng Docker -> không cần cài Terraform hay AWS CLI trên máy
#
# Cách dùng (Git Bash, đứng ở thư mục gốc repo):
#   ./terraform/tf.sh init
#   ./terraform/tf.sh plan
#   ./terraform/tf.sh apply
#   ./terraform/tf.sh output
#   ./terraform/tf.sh destroy
#
# Access key AWS đọc từ file .csv tải về khi tạo IAM user (không nằm trong repo).
# Đổi đường dẫn bằng biến AWS_KEY_CSV nếu file để chỗ khác.
set -euo pipefail

TERRAFORM_IMAGE="hashicorp/terraform:1.16.7"
AWS_KEY_CSV="${AWS_KEY_CSV:-$HOME/OneDrive/Desktop/Programming/DevOps/key/xuanloc-terraform_accessKeys.csv}"

if [ ! -f "$AWS_KEY_CSV" ]; then
  echo "Không tìm thấy file access key: $AWS_KEY_CSV" >&2
  exit 1
fi

# Dòng 2 của file csv: <Access key ID>,<Secret access key>
IFS=, read -r AWS_ACCESS_KEY_ID AWS_SECRET_ACCESS_KEY < <(sed -n 2p "$AWS_KEY_CSV" | tr -d '\r')
export AWS_ACCESS_KEY_ID AWS_SECRET_ACCESS_KEY

# Thư mục gốc repo, dạng C:/... trên Git Bash để Docker Desktop mount được
REPO_ROOT="$(cd "$(dirname "$0")/.." && (pwd -W 2>/dev/null || pwd))"

# Chỉ bật -t khi chạy trong terminal thật (để terraform apply hỏi yes/no)
TTY_FLAG="-i"
[ -t 0 ] && [ -t 1 ] && TTY_FLAG="-it"

# MSYS_NO_PATHCONV: chặn Git Bash tự đổi /workspace thành đường dẫn Windows
MSYS_NO_PATHCONV=1 docker run --rm $TTY_FLAG \
  -v "$REPO_ROOT:/workspace" \
  -w /workspace/terraform \
  -e AWS_ACCESS_KEY_ID \
  -e AWS_SECRET_ACCESS_KEY \
  "$TERRAFORM_IMAGE" "$@"
