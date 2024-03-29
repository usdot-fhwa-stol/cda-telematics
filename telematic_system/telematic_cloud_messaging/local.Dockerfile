FROM openjdk:17-jdk-slim-buster
WORKDIR /telematic_cloud_messaging
COPY ./ /telematic_cloud_messaging/
# Use local properties
RUN mv /telematic_cloud_messaging/src/main/resources/application.local.properties /telematic_cloud_messaging/src/main/resources/application.properties
RUN ./mvnw clean package -Dmaven.test.skip=true
RUN mv /telematic_cloud_messaging/target/*.jar app.jar
RUN rm -R target
RUN apt update && apt install wait-for-it
EXPOSE 8080
CMD ["java", "-jar", "/telematic_cloud_messaging/app.jar" ]
