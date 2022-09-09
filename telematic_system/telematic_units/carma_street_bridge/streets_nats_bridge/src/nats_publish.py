from nats.aio.client import Client as NATS
import json
import time
import asyncio 

class NatsPublish():

    #Creates a Nats Publisher object that connects to the NATS server
    def __init__(self, nats_ip, nats_port, unit_id, unit_type):
        print("Attempting to connect to nats at: " + str(nats_ip) + ":" + str(nats_port))
        self.nats_ip = nats_ip
        self.nats_port = nats_port
        self.nc = NATS()
        self.registered = False
        self.subscribers_list = {}
        self.async_sleep_rate = 0.0001
        self.vehicle_info = {"UnitId": unit_id, "UnitType": unit_type}


    #Connect to the NATS server with logging callbacks
    async def nats_connect(self):

        async def disconnected_cb():
            print("Got disconnected...")

        async def reconnected_cb():
            print("Got reconnected...")
        
        async def error_cb(err):
            print("{0}".format(err))

        try:
            await self.nc.connect("nats://"+str(self.nats_ip)+":"+str(self.nats_port), 
            error_cb=error_cb,
            reconnected_cb=reconnected_cb,
            disconnected_cb=disconnected_cb,
            max_reconnect_attempts=1)
        except:
            print("Error connecting to nats server")
        finally:
            print("Connected to nats server")
    
    #Register this unit with the NATS server and wait for ack
    async def register_unit(self):
        
        self.vehicle_info["TimeStamp"] = time.time_ns()
        vehicle_info_message = json.dumps(self.vehicle_info).encode('utf8')

        while(not self.registered):
            try:
                print("Server connected: {0}".format(self.nc.is_connected))
                if(self.nc.is_connected and not self.registered):
                    try:
                        print("Attempting to register unit")
                        response = await self.nc.request("register_node", vehicle_info_message, timeout=1)
                        print("Registering unit received response: {message}".format(message=response.data.decode()))
                    finally:
                        self.registered = True
            except:
                self.registered = False
                print("Error registering unit, retrying..")
                pass
            await asyncio.sleep(self.async_sleep_rate)

    async def test_unit(self):
        print("IN TEST UNIT")