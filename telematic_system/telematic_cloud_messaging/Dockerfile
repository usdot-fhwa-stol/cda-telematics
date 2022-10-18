FROM openjdk:17-jdk-slim-buster
COPY ./ /telematic_cloud_messaging
WORKDIR /telematic_cloud_messaging
RUN /telematic_cloud_messaging/mvnw clean package -Dmaven.test.skip=true && \
    mv /telematic_cloud_messaging/target/*.jar app.jar && \
    rm -R target
ENTRYPOINT ["java", "-jar", "/telematic_cloud_messaging/app.jar" ]
