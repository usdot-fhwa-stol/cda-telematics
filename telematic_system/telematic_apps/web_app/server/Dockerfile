FROM node:20.11.1

# Create app directory
WORKDIR /app

#A wildcard is used to ensure both package.json AND package-lock.json are copied where available 
COPY package*.json ./

RUN npm install -g nodemon
RUN npm install -g node-wait-for-it
RUN npm init -y
RUN npm install

# Bundle app source
COPY . .
RUN chmod +x service.sh