FROM node:16.16.0

# Create app directory
WORKDIR /app

#A wildcard is used to ensure both package.json AND package-lock.json are copied where available 
COPY package*.json ./

RUN npm install -g nodemon --ignore-scripts
RUN npm init -y
RUN npm install --ignore-scripts

# Bundle app source
COPY . .

# Add docker-compose-wait tool -------------------
ENV WAIT_VERSION 2.12.1
ADD https://github.com/ufoscout/docker-compose-wait/releases/download/$WAIT_VERSION/wait /wait
RUN chmod +x /wait
USER nonroot
ENTRYPOINT ["/bin/sh", "-c", "/wait && npm start"]
