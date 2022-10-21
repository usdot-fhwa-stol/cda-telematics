FROM node:16.16.0

# Create app directory
WORKDIR /app

#A wildcard is used to ensure both package.json AND package-lock.json are copied where available 
COPY package*.json ./

RUN npm install -g nodemon
RUN npm init -y
RUN npm install

COPY server.env .env

# Bundle app source
COPY . .

EXPOSE 9010

ENTRYPOINT ["npm", "start"]
