## CARMA Cloud-Nats Bridge Setup 

To use this carma cloud nats bridge, clone the cda-telematics github repository (https://github.com/usdot-fhwa-stol/cda-telematics.git) 
onto the carma cloud instance being tested with. Navigate to the "telematic_units" directory. Edit the "LOG_HANDLER_TYPE" environment variable 
in the cloud-nats-bridge section of the "docker-compose.units.yml" file as desired. Edit the "image" variable with the latest carma cloud nats 
bridge image on dockerhub. 

Run the bridge:
"sudo docker-compose -f docker-compose.units.yml up cloud-nats-bridge". 

Edit params.yaml:
If edits to the /config/params.yaml are required, rebuild the bridge with "sudo docker-compose -f docker-compose.units.yml build cloud-nats-bridge".
Then re-run the bridge with the above command.

	
