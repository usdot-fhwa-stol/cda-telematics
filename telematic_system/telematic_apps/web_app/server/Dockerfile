FROM node:16.16.0-alpine

WORKDIR /usr/app

COPY package*.json ./
RUN npm ci -qy

COPY . .

EXPOSE 8080

CMD ["npm", "start"]