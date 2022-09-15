FROM python:3.9

RUN set -xe \
    && apt-get update \
    && apt-get install -y \
    iputils-ping \
    git \
    vim \
    python3-pip
    
RUN pip install --upgrade pip nats-py
RUN pip install kafka-python
RUN pip install pyyaml

WORKDIR /ws

ADD streets_nats_bridge src/streets_nats_bridge

WORKDIR /ws/src/streets_nats_bridge/src

CMD [ "python", "main.py" ]
