FROM openjdk:17-jdk-slim-buster
WORKDIR /telematic_cloud_messaging
COPY ./ /telematic_cloud_messaging/
# Use local properties
RUN mv /telematic_cloud_messaging/src/main/resources/application.local.properties /telematic_cloud_messaging/src/main/resources/application.properties
RUN ./mvnw clean package -Dmaven.test.skip=true
RUN mv /telematic_cloud_messaging/target/*.jar app.jar
RUN rm -R target
EXPOSE 8080

# Add docker-compose-wait tool -------------------
ENV WAIT_VERSION 2.12.1
ADD https://github.com/ufoscout/docker-compose-wait/releases/download/$WAIT_VERSION/wait /wait
RUN chmod +x /wait

ENTRYPOINT ["/bin/sh", "-c", "/wait && java -jar /telematic_cloud_messaging/app.jar"]
