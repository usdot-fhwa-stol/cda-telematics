## CARMA Streets-Nats Bridge Setup 

1. Carma streets kafka and scheduling service containers need to be up
	a. Verify that "intersection_type" is set to "stop_controlled_intersection" in scheduling service manifest.json file		
2. Need to comment out anything referring to the Redshift DB in the worker.go code and rebuild with "docker-compose build worker"

3. Telematics cloud server docker-compose up everything (nats uri environment variables needs to be VM ethernet interface IP address)

4. In cda-telematics/telematic_system/telematic_units, run "sudo docker-compose up -d streets-nats-bridge"

5. Check the status of the telematic cloud worker with "sudo docker logs -f telematic_cloud_server_worker_1"

6. Send appropriate HTTP curl requests to test

7. Can check the status of the nats bridge with the "streets_nats_bridge_logger.log" file created inside of the container
	
## HTTP Curl Requests for Testing

1. request all available topics from carma streets: 
	```
	curl -X GET-v http://localhost:8080/requestAvailableTopics?UnitId=<unit_id>
	```

2. request to publish the specified topics: 
	```
	curl -d '{"UnitId": "streets_id", "UnitType": "streets", "TimeStamp": 1663084528513000325, "topics": [{"name": "v2xhub_scheduling_plan_sub"}]}'  -H "Content-Type: application/json" -X POST -v http://localhost:8080/publishSelectedTopics
	```

### Nats CLI for testing
1. request all available topcis:	
	```
	nats request "streets_id.available_topics" '' --raw
	```
2. request to publish the specific topics:
	```
	nats request "streets_id.publish_topics" '{"UnitId": "streets_id", "UnitType": "streets", "TimeStamp": 1663084528513000325, "topics": [{"name": "v2xhub_bsm_in"}]}' --raw
	```
