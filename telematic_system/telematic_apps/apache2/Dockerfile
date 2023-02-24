FROM ubuntu/apache2:latest
RUN a2enmod proxy
RUN a2enmod rewrite 
RUN a2enmod proxy_balancer
RUN a2enmod proxy_http
RUN a2enmod headers
RUN touch /etc/apache2/grafana_htpasswd
RUN chmod 777 /etc/apache2/grafana_htpasswd
COPY ports.conf /etc/apache2/ports.conf
COPY 000-default.conf /etc/apache2/sites-available/000-default.conf
COPY 000-default.conf /etc/apache2/sites-enabled/000-default.conf