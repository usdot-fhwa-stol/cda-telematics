package com.telematic.telematic_cloud_messaging;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class TelematicCloudMessagingApplication {

	public static void main(String[] args) {
		SpringApplication.run(TelematicCloudMessagingApplication.class, args);
	}

}
