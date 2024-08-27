package com.telematic.telematic_cloud_messaging.web_services;

import java.io.IOException;
import java.time.Duration;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import io.nats.client.Connection;
import io.nats.client.Connection.Status;
import io.nats.client.ConnectionListener;
import io.nats.client.Nats;
import io.nats.client.Options;

@Component
public class NATSConnection implements ConnectionListener {
    private static Logger logger = LoggerFactory.getLogger(NATSConnection.class);

    // Get config parameters from application.properties
    @Value("${M_NATS_URI}")
    private String natServerURL;

    // NATS connection
    private Connection connection;

    /***
     * @brief Update the global NATS connection object if not exist or the service
     *        is disconnected from NATS.
     * @return The global NATS connection object
     */
    public Connection getConnection() {

        if (connection == null || (connection.getStatus() == Status.DISCONNECTED)) {
            Options.Builder connectionBuilder = new Options.Builder().connectionListener(this);
            logger.info("Connecting to NATS server = {}",  natServerURL);
            Options options = connectionBuilder.server(natServerURL).connectionTimeout(Duration.ofSeconds(5))
                    .pingInterval(Duration.ofSeconds(2))
                    .reconnectWait(Duration.ofSeconds(1))
                    .maxReconnects(-1)
                    .traceConnection()
                    .build();
            try {
                connection = Nats.connect(options);
            } catch (IOException | InterruptedException e) {
                logger.error("Cannot connect to NATS.");
                /* Clean up whatever needs to be handled before interrupting  */
                Thread.currentThread().interrupt();
                return null;
            }
        }
        return connection;
    }

    @Override
    public void connectionEvent(Connection connection, Events event) {
        logger.info("Connection event: {}", event);
        switch (event) {
            case CONNECTED:
                logger.info("CONNECTED!");
                break;
            case DISCONNECTED:
                try {
                    this.connection = null;
                    getConnection();
                } catch (Exception ex) {
                    logger.error(ex.getMessage());
                }
                break;
            case RECONNECTED:
                logger.info("RECONNECTED!");
                break;
            case RESUBSCRIBED:
                logger.info("RESUBSCRIBED!");
                break;
            default:
                break;
        }
    }
}
