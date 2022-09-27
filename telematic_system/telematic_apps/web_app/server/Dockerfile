FROM node:16.16.0

WORKDIR /app
COPY . .

RUN npm init -y
RUN npm install

EXPOSE 9010

ENTRYPOINT ["npm", "start"]
