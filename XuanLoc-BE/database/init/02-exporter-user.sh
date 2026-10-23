#!/bin/bash
# Tạo user chỉ-đọc cho mysqld_exporter (Prometheus dùng để theo dõi trạng thái MySQL).
# Chạy tự động sau 01-xuan_loc_center.sql ở lần khởi tạo đầu tiên của container MySQL.
# Mật khẩu lấy từ biến MYSQL_EXPORTER_PASSWORD trong file .env, không ghi cứng vào repo.
set -e

mysql --protocol=socket -uroot -p"${MYSQL_ROOT_PASSWORD}" <<-EOSQL
	CREATE USER IF NOT EXISTS 'exporter'@'%' IDENTIFIED BY '${MYSQL_EXPORTER_PASSWORD}' WITH MAX_USER_CONNECTIONS 3;
	GRANT PROCESS, REPLICATION CLIENT, SELECT ON *.* TO 'exporter'@'%';
	FLUSH PRIVILEGES;
EOSQL

echo "[init] Created MySQL user 'exporter' for mysqld_exporter"
