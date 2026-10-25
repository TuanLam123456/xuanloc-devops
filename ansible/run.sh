#!/usr/bin/env bash
# Chạy lệnh Ansible trong Docker (Git Bash, đứng ở thư mục gốc repo)
#
#   ./ansible/run.sh ansible all -m ping                 # thử SSH vào 2 máy
#   ./ansible/run.sh ansible-playbook site.yml           # cài đặt + deploy toàn bộ
#   ./ansible/run.sh ansible-playbook 04-deploy-app.yml  # chỉ deploy lại app
#   ./ansible/run.sh ansible-vault edit group_vars/all/vault.yml
#
# SSH key và mật khẩu vault nằm ngoài repo, đổi đường dẫn bằng biến SSH_KEY / VAULT_PASS_FILE
set -euo pipefail

IMAGE="xuanloc-ansible:2.21.5"
KEY_DIR="$HOME/OneDrive/Desktop/Programming/DevOps/key"
SSH_KEY="${SSH_KEY:-$KEY_DIR/develops.pem}"
VAULT_PASS_FILE="${VAULT_PASS_FILE:-$KEY_DIR/xuanloc-vault-pass.txt}"

# Đường dẫn dạng C:/... để Docker Desktop mount được (trên Linux giữ nguyên)
to_docker_path() { if command -v cygpath >/dev/null 2>&1; then cygpath -m "$1"; else echo "$1"; fi; }

ANSIBLE_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(to_docker_path "$(dirname "$ANSIBLE_DIR")")"

# Build image Ansible ở lần chạy đầu tiên
if ! docker image inspect "$IMAGE" >/dev/null 2>&1; then
  echo ">> Building $IMAGE ..."
  docker build -t "$IMAGE" "$(to_docker_path "$ANSIBLE_DIR")"
fi

DOCKER_ARGS=(
  --rm -i
  -v "$REPO_ROOT:/workspace"
  -w /workspace/ansible
  # Thư mục repo trên Windows bị coi là "world writable" -> chỉ định ansible.cfg rõ ràng
  -e ANSIBLE_CONFIG=/workspace/ansible/ansible.cfg
)
[ -t 0 ] && [ -t 1 ] && DOCKER_ARGS+=(-t)

if [ -f "$SSH_KEY" ]; then
  DOCKER_ARGS+=(-v "$(to_docker_path "$SSH_KEY"):/tmp/ssh-key:ro")
fi
if [ -f "$VAULT_PASS_FILE" ]; then
  DOCKER_ARGS+=(-v "$(to_docker_path "$VAULT_PASS_FILE"):/tmp/vault-pass:ro" -e ANSIBLE_VAULT_PASSWORD_FILE=/tmp/vault-pass)
fi

# File mount từ Windows có quyền 777 -> SSH từ chối dùng key. Copy vào ~/.ssh rồi chmod 600
MSYS_NO_PATHCONV=1 docker run "${DOCKER_ARGS[@]}" "$IMAGE" bash -c '
  if [ -f /tmp/ssh-key ]; then
    mkdir -p ~/.ssh && cp /tmp/ssh-key ~/.ssh/develops.pem && chmod 600 ~/.ssh/develops.pem
  fi
  exec "$@"' _ "$@"
