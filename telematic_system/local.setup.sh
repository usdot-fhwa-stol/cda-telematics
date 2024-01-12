echo '127.0.0.1       grafana.local.cav-telematics.com' >> /etc/hosts
echo '127.0.0.1       ui-service.local.cav-telematics.com' >> /etc/hosts
echo '127.0.0.1       topic-service.local.cav-telematics.com' >> /etc/hosts
echo '127.0.0.1       local.cav-telematics.com' >> /etc/hosts
if [ -d /opt/grafana ]; then
  echo "Directory /opt/grafana exists."
else
  mkdir /opt/grafana
fi
chmod 777 -R /opt/grafana

if [ /opt/apache2/grafana_htpasswd ]; then
  echo "File /opt/apache2/grafana_htpasswd exists."
else
    touch /opt/apache2/grafana_htpasswd
fi

if [ -d /opt/influxdb2 ]; then
  echo "Directory /opt/influxdb2 exists."
else
  mkdir /opt/influxdb2
fi
chmod 777 -R /opt/influxdb2

cp telematic-local.env .env
