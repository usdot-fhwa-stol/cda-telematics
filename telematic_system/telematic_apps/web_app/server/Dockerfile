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

ENTRYPOINT ["npm", "start"]
