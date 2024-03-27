FROM openjdk:17-jdk-slim-buster
WORKDIR /telematic_cloud_messaging
COPY ./ /telematic_cloud_messaging/
RUN ./mvnw clean package -Dmaven.test.skip=true
RUN mv /telematic_cloud_messaging/target/*.jar app.jar
RUN rm -R target
RUN apt update && apt install wait-for-it
EXPOSE 8080