FROM openjdk:17-jdk-slim-buster
WORKDIR /telematic_cloud_messaging
COPY ./ /telematic_cloud_messaging/
RUN ./mvnw clean package -Dmaven.test.skip=true
RUN mv /telematic_cloud_messaging/target/*.jar app.jar
RUN rm -R target
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/telematic_cloud_messaging/app.jar" ]
