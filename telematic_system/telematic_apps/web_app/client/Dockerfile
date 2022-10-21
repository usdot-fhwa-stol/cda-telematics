FROM node:16.16.0


WORKDIR /app
COPY . .

RUN npm init -y
RUN npm install --force

ENV PORT=3005
EXPOSE 3005

ENTRYPOINT ["npm", "start"]
