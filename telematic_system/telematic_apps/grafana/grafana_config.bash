#!/usr/bin/env bash
if [ -d "/opt/grafana" ]
then
    rm -R /opt/grafana
else
    mkdir -p /opt/grafana
fi
sudo chmod 777 -R /opt/grafana

# Directory where grafana can store logs
mkdir -p /opt/grafana/logs

# Grafana Configuration file
cd /opt/grafana
wget https://raw.githubusercontent.com/usdot-fhwa-stol/cda-telematics/dev/telematic_system/telematic_apps/grafana/grafana.ini?token=GHSAT0AAAAAABVTWARTIHJ3YZZ3YEU26AUUYXBOKZQ -O grafana.ini

# Path where Grafana can store temp files, sessions, and the sqlite3 db
mkdir -p /opt/grafana/data

# folder that contains provisioning config files that grafana will apply on startup and while running.
mkdir -p /opt/grafana/provisioning
mkdir -p /opt/grafana/provisioning/datasources
mkdir -p /opt/grafana/provisioning/plugins
mkdir -p /opt/grafana/provisioning/notifiers
mkdir -p /opt/grafana/provisioning/dashboards
