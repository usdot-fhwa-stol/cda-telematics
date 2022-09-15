## Login to redhat
```
chmod 400 <pem file name>
ssh -i "<pem file name>" ec2-user@<amazone ec2 instance url>
```

## Install docker
```
# Install docker
sudo yum install docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Output compose version
docker -v
```

## Install docker-compose 
```
# get latest docker compose released tag
COMPOSE_VERSION=$(curl -s https://api.github.com/repos/docker/compose/releases/latest | grep 'tag_name' | cut -d\" -f4)

# Install docker-compose
sudo curl -L "https://github.com/docker/compose/releases/download/${COMPOSE_VERSION}/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Output compose version
docker-compose -v

```

## Launch influxDB container with docker-compose
```
# navigate to a folder where the docker-compose file is located, and check the influxDB service is located in this docker-compose file
cd <directory name>/telematic_system

# Docker compose up to launch container
docker-compose up -d

# Shutdown container
docker-compose down
```

## Open a browser to view influxDB UI
http://<amazone ec2 instance url>:8086/orgs/04cb75631ee68b28