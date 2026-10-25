# Image chứa Ansible để chạy từ Windows (Ansible không chạy trực tiếp trên Windows)
FROM python:3.13-slim

RUN apt-get update \
 && apt-get install -y --no-install-recommends openssh-client \
 && rm -rf /var/lib/apt/lists/*

# Gói "ansible" = ansible-core 2.21 + các collection phổ biến (có sẵn community.docker),
# không phải tải thêm từ Ansible Galaxy
RUN pip install --no-cache-dir "ansible==14.5.0" "ansible-lint==26.10.1"

WORKDIR /workspace/ansible
