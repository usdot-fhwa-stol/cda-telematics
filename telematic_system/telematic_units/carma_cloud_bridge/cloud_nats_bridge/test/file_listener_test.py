import pytest
from multiprocessing import Lock
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler, LoggingEventHandler
import sys
sys.path.insert(1, '../src')
from cloud_nats_bridge import FileListener
import time

#Create Observer object for the logfile using the FileListener
def test_setup(event_handler):
    print("Creating file listener for " + str(carma_cloud_dir) + "/" + str(carma_cloud_logname))
    observer = Observer()
    observer.schedule(event_handler, carma_cloud_dir, recursive=True)
    observer.start()

#Append a TCR to the logfile
def append_TCR(newTCRLine):
    file1 = open(f'{carma_cloud_dir}/{carma_cloud_logname}', "a")  # append mode
    print("Writing TCR to log file")
    file1.write(newTCRLine + "\n")

#Append a TCM to the logfile
def append_TCM(newTCMLine):
    file1 = open(f'{carma_cloud_dir}/{carma_cloud_logname}', "a")  # append mode
    print("Writing TCM to log file")
    file1.write(newTCMLine + "\n")
   
if __name__ == '__main__':
    carma_cloud_dir = "/opt/tomcat/logs"
    carma_cloud_logname = "carmacloud.log"
    log_name = "test.log"
    tcr_search_string = "TrafficControlRequest" 
    tcm_search_string = "TrafficControlMessage"
    
    event_handler = FileListener(carma_cloud_dir, carma_cloud_logname, log_name, tcr_search_string, tcm_search_string)
    newTCRLine = "[DEBUG 13:41:50.470 [] - TCR <?xml version=\"1.0\" encoding=\"UTF-8\"?><TrafficControlRequest><reqid>3A0D0145E8934B48</reqid><reqseq>0</reqseq><scale>0</scale><bounds><oldest>27484661</oldest><reflon>-818349472</reflon><reflat>281118677</reflat><offsets><deltax>376</deltax><deltay>0</deltay></offsets><offsets><deltax>376</deltax><deltay>1320</deltay></offsets><offsets><deltax>0</deltax><deltay>1320</deltay></offsets></bounds></TrafficControlRequest>"
    newTCMLine = "[DEBUG 13:41:49.493 [] - TCM 404 <?xml version=\"1.0\" encoding=\"UTF-8\"?><TrafficControlMessage><tcmV01><reqid>280E68154DF847EA</reqid><reqseq>0</reqseq><msgtot>10</msgtot><msgnum>6</msgnum><id>000bc819a323ce4aef29d8cef9d3a938</id><updated>0</updated><package><label>workzone</label><tcids><Id128b>000bc819a323ce4aef29d8cef9d3a938</Id128b></tcids></package><params><vclasses><micromobile/><motorcycle/><passenger-car/><light-truck-van/><bus/><two-axle-six-tire-single-unit-truck/><three-axle-single-unit-truck/><four-or-more-axle-single-unit-truck/><four-or-fewer-axle-single-trailer-truck/><five-axle-single-trailer-truck/><six-or-more-axle-single-trailer-truck/><five-or-fewer-axle-multi-trailer-truck/><six-axle-multi-trailer-truck/><seven-or-more-axle-multi-trailer-truck/></vclasses><schedule><start>27500625</start><end>153722867280912</end><dow>1111111</dow></schedule><regulatory><true/></regulatory><detail><maxspeed>112</maxspeed></detail></params><geometry><proj>epsg:3785</proj><datum>WGS84</datum><reftime>27500625</reftime><reflon>-818326922</reflon><reflat>281167647</reflat><refelv>0</refelv><refwidth>424</refwidth><heading>3403</heading><nodes><PathNode><x>0</x><y>0</y><width>0</width></PathNode><PathNode><x>-203</x><y>722</y><width>0</width></PathNode><PathNode><x>-203</x><y>722</y><width>0</width></PathNode><PathNode><x>-203</x><y>722</y><width>0</width></PathNode><PathNode><x>-203</x><y>722</y><width>0</width></PathNode><PathNode><x>-203</x><y>722</y><width>0</width></PathNode><PathNode><x>-203</x><y>722</y><width>2</width></PathNode><PathNode><x>-202</x><y>722</y><width>-2</width></PathNode><PathNode><x>-203</x><y>722</y><width>0</width></PathNode><PathNode><x>-203</x><y>722</y><width>0</width></PathNode><PathNode><x>-203</x><y>722</y><width>0</width></PathNode><PathNode><x>-203</x><y>722</y><width>0</width></PathNode><PathNode><x>-203</x><y>722</y><width>0</width></PathNode><PathNode><x>-203</x><y>722</y><width>0</width></PathNode><PathNode><x>-203</x><y>722</y><width>0</width></PathNode><PathNode><x>-203</x><y>722</y><width>0</width></PathNode><PathNode><x>-203</x><y>722</y><width>0</width></PathNode><PathNode><x>-203</x><y>722</y><width>0</width></PathNode><PathNode><x>-203</x><y>722</y><width>0</width></PathNode><PathNode><x>-203</x><y>722</y><width>2</width></PathNode><PathNode><x>-202</x><y>722</y><width>-2</width></PathNode><PathNode><x>-203</x><y>722</y><width>0</width></PathNode><PathNode><x>-203</x><y>722</y><width>0</width></PathNode><PathNode><x>-203</x><y>722</y><width>0</width></PathNode><PathNode><x>-203</x><y>722</y><width>0</width></PathNode><PathNode><x>-203</x><y>721</y><width>0</width></PathNode><PathNode><x>-203</x><y>722</y><width>0</width></PathNode><PathNode><x>-203</x><y>722</y><width>0</width></PathNode><PathNode><x>-203</x><y>722</y><width>0</width></PathNode><PathNode><x>-203</x><y>722</y><width>0</width></PathNode><PathNode><x>-203</x><y>722</y><width>0</width></PathNode><PathNode><x>-203</x><y>722</y><width>0</width></PathNode><PathNode><x>-203</x><y>722</y><width>2</width></PathNode><PathNode><x>-202</x><y>722</y><width>-2</width></PathNode><PathNode><x>-203</x><y>722</y><width>0</width></PathNode><PathNode><x>-203</x><y>722</y><width>0</width></PathNode><PathNode><x>-203</x><y>722</y><width>0</width></PathNode><PathNode><x>-203</x><y>722</y><width>0</width></PathNode><PathNode><x>-203</x><y>722</y><width>0</width></PathNode><PathNode><x>-203</x><y>722</y><width>0</width></PathNode><PathNode><x>-203</x><y>722</y><width>0</width></PathNode><PathNode><x>-203</x><y>722</y><width>0</width></PathNode><PathNode><x>-203</x><y>722</y><width>0</width></PathNode><PathNode><x>-203</x><y>722</y><width>0</width></PathNode><PathNode><x>-203</x><y>722</y><width>0</width></PathNode><PathNode><x>-203</x><y>722</y><width>2</width></PathNode><PathNode><x>-202</x><y>722</y><width>-2</width></PathNode><PathNode><x>-203</x><y>722</y><width>0</width></PathNode><PathNode><x>-203</x><y>722</y><width>0</width></PathNode><PathNode><x>-203</x><y>722</y><width>0</width></PathNode><PathNode><x>-203</x><y>722</y><width>0</width></PathNode><PathNode><x>-203</x><y>722</y><width>0</width></PathNode><PathNode><x>-203</x><y>722</y><width>0</width></PathNode><PathNode><x>-203</x><y>722</y><width>0</width></PathNode><PathNode><x>-203</x><y>722</y><width>0</width></PathNode><PathNode><x>-203</x><y>722</y><width>0</width></PathNode><PathNode><x>-203</x><y>722</y><width>0</width></PathNode><PathNode><x>-203</x><y>722</y><width>0</width></PathNode><PathNode><x>-203</x><y>722</y><width>2</width></PathNode><PathNode><x>-202</x><y>722</y><width>-2</width></PathNode><PathNode><x>-203</x><y>722</y><width>0</width></PathNode><PathNode><x>-203</x><y>722</y><width>0</width></PathNode><PathNode><x>-203</x><y>722</y><width>0</width></PathNode><PathNode><x>-203</x><y>722</y><width>0</width></PathNode><PathNode><x>-203</x><y>722</y><width>0</width></PathNode><PathNode><x>-203</x><y>722</y><width>0</width></PathNode><PathNode><x>-203</x><y>722</y><width>0</width></PathNode><PathNode><x>-203</x><y>722</y><width>0</width></PathNode><PathNode><x>-203</x><y>722</y><width>0</width></PathNode><PathNode><x>-203</x><y>722</y><width>0</width></PathNode><PathNode><x>-203</x><y>722</y><width>0</width></PathNode><PathNode><x>-203</x><y>722</y><width>2</width></PathNode><PathNode><x>-170</x><y>606</y><width>-2</width></PathNode></nodes></geometry></tcmV01></TrafficControlMessage>"
    
    test_setup(event_handler)

    #Append a TCR to the logfile and verify the new carma cloud message type updates appropriately
    append_TCR(newTCRLine)
    time.sleep(1)
    assert (str(event_handler.getNewCarmaCloudMessageType()) == "TCR")

    #Append a TCM to the logfile and verify the new carma cloud message type updates appropriately
    append_TCM(newTCMLine)
    time.sleep(1)
    assert (str(event_handler.getNewCarmaCloudMessageType()) == "TCM")
