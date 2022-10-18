FROM python:3.9

RUN set -xe \
    && apt-get update \
    && apt-get install -y \
    iputils-ping \
    git \
    vim \
    python3-pip
    
COPY requirements.txt /tmp
WORKDIR /tmp
RUN pip install --upgrade -r requirements.txt

WORKDIR /ws
RUN ls -la && pwd

ADD telematic_system/telematic_units/carma_street_bridge/streets_nats_bridge src/streets_nats_bridge
#ADD streets_nats_bridge src/streets_nats_bridge

WORKDIR /ws/src/streets_nats_bridge/src

CMD [ "python", "-u", "main.py" ]
