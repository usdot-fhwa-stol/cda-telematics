FROM node:16.16.0 as builder

# Create app directory
WORKDIR /app

#A wildcard is used to ensure both package.json AND package-lock.json are copied where available 
COPY package*.json ./
RUN npm init -y
RUN npm install --force

# Bundle app source
COPY . .

# Read environment variables during build stage
ARG REACT_APP_NODE_SERVER_URI
ENV REACT_APP_NODE_SERVER_URI $REACT_APP_NODE_SERVER_URI
RUN echo $REACT_APP_NODE_SERVER_URI
ARG REACT_APP_MESSAGING_SERVER_URI
ENV REACT_APP_MESSAGING_SERVER_URI $REACT_APP_MESSAGING_SERVER_URI
ARG REACT_APP_GRAFANA_DEFAULT_DASHBOARD_EMBED_URL
ENV REACT_APP_GRAFANA_DEFAULT_DASHBOARD_EMBED_URL $REACT_APP_GRAFANA_DEFAULT_DASHBOARD_EMBED_URL
ARG REACT_APP_GRAFANA_PATH
ENV REACT_APP_GRAFANA_PATH $REACT_APP_GRAFANA_PATH

RUN npm run build

# production environment
FROM nginx:stable-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/build/ /usr/share/nginx/html

WORKDIR /usr/share/nginx/html
EXPOSE 80

#run in foreground
CMD ["nginx", "-g", "daemon off;"] 