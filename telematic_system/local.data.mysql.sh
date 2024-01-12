
docker exec -i telematic_system-mysqldb-1 mysql -utelematic -ptelematic wfd_grafana < ./scripts/database/mysql_insert_values.sql
