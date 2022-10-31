FROM node:16.16.0 as builder

# Create app directory
WORKDIR /app

#A wildcard is used to ensure both package.json AND package-lock.json are copied where available 
COPY package*.json ./
RUN npm init -y
RUN npm install --force

# Bundle app source
COPY . .
RUN npm run build

# production environment
FROM nginx:stable-alpine
COPY --from=builder /app/build /usr/share/nginx/html
EXPOSE 80
#run in foreground
CMD ["nginx", "-g", "daemon off;"] 