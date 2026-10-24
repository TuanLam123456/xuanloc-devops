# Sinh file inventory cho Ansible từ IP thật của 2 máy vừa tạo
# -> chạy terraform apply xong là chạy Ansible được ngay, không phải chép IP bằng tay
resource "local_file" "ansible_inventory" {
  filename        = "${path.module}/../ansible/inventory.ini"
  file_permission = "0644"

  content = templatefile("${path.module}/templates/inventory.ini.tftpl", {
    app_public_ip         = aws_eip.app.public_ip
    app_private_ip        = aws_instance.app.private_ip
    monitoring_public_ip  = aws_eip.monitoring.public_ip
    monitoring_private_ip = aws_instance.monitoring.private_ip
    ssh_private_key_path  = var.ssh_private_key_path
  })
}
