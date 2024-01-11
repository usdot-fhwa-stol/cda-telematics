echo '127.0.0.1       grafana.dev.com' >> /etc/hosts
echo '127.0.0.1       ui-service.dev.com' >> /etc/hosts
echo '127.0.0.1       topic-service.dev.com' >> /etc/hosts
mkdir /opt/grafana
chmod 777 -R /opt/grafana
touch /opt/apache2/grafana_htpasswd
chmod 777 /opt/apache2/grafana_htpasswd
