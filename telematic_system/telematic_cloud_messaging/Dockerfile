FROM openjdk:17-jdk-slim-buster
COPY ./ /telematic_cloud_messaging
WORKDIR /telematic_cloud_messaging
RUN ./mvnw clean package -Dmaven.test.skip=true && \
    mv target/*.jar app.jar && \
    rm -R target
ENTRYPOINT ["java", "-jar", "/telematic_cloud_messaging/app.jar" ]
