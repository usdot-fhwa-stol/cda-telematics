FROM node:16.16.0

WORKDIR /usr/app

COPY package*.json ./

RUN npm ci -qy

COPY . .

EXPOSE 3001

CMD ["npm", "start"]
