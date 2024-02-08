FROM node:16.16.0

# Create app directory
WORKDIR /app

#A wildcard is used to ensure both package.json AND package-lock.json are copied where available 
COPY package*.json ./

RUN npm install -g nodemon 
RUN npm init -y
RUN npm install 

# Bundle app source
COPY . .

# Add docker-compose-wait tool -------------------
ENV WAIT_VERSION 2.12.1
ADD https://github.com/ufoscout/docker-compose-wait/releases/download/$WAIT_VERSION/wait /wait
RUN chmod +x /wait
RUN useradd -ms /bin/bash nonroot
RUN chown -R nonroot /app
USER nonroot
RUN chmod +x service.sh

CMD /wait && ./service.sh
