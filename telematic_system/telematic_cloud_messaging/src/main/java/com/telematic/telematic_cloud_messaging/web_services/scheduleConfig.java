package com.telematic.telematic_cloud_messaging.web_services;

import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.SchedulingConfigurer;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;
import org.springframework.scheduling.config.ScheduledTaskRegistrar;

@Configuration
public class scheduleConfig implements SchedulingConfigurer {
    private final int POOL_SIZE = 10;

    @Override
    public void configureTasks(ScheduledTaskRegistrar taskRegistrar) {
        ThreadPoolTaskExecutor taskScheduler = new ThreadPoolTaskExecutor();
        taskScheduler.setMaxPoolSize(POOL_SIZE);
        taskScheduler.setThreadNamePrefix("scheduler-pool-");
        taskScheduler.initialize();
        taskRegistrar.setScheduler(taskScheduler);
    }
}
