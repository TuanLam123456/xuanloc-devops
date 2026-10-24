# Thông tin in ra sau khi terraform apply (xem lại bằng: terraform output)

output "app_public_ip" {
  description = "IP public của VPS app - trỏ DNS xuanloc / api-xuanloc về đây"
  value       = aws_eip.app.public_ip
}

output "app_private_ip" {
  description = "IP nội bộ của VPS app - Prometheus dùng IP này để lấy số liệu"
  value       = aws_instance.app.private_ip
}

output "monitoring_public_ip" {
  description = "IP public của VPS monitoring - trỏ DNS grafana-xuanloc về đây"
  value       = aws_eip.monitoring.public_ip
}

output "ssh_app" {
  description = "Lệnh SSH vào VPS app"
  value       = "ssh -i ${var.ssh_private_key_path} ubuntu@${aws_eip.app.public_ip}"
}

output "ssh_monitoring" {
  description = "Lệnh SSH vào VPS monitoring"
  value       = "ssh -i ${var.ssh_private_key_path} ubuntu@${aws_eip.monitoring.public_ip}"
}

output "ubuntu_ami" {
  description = "AMI Ubuntu đã dùng"
  value       = "${data.aws_ami.ubuntu.id} (${data.aws_ami.ubuntu.name})"
}
