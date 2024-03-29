import pytest
import sys
sys.path.insert(1, '../src')
import unittest
import cloud_nats_bridge
from cloud_nats_bridge import cloud_nats_bridge
from cloud_nats_bridge.cloud_nats_bridge import CloudNatsBridge
import os

def test_main():
    # Set environment variables
    os.environ["CARMA_CLOUD_BRIDGE_LOG_ROTATION_SIZE_BYTES"] = "1"
    os.environ["CARMA_CLOUD_LOG"]= os.getcwd() + "/sample_cc_log.log"
    os.environ["CARMA_CLOUD_BRIDGE_LOG_NAME"]="cloud_nats_bridge"
    os.environ["CARMA_CLOUD_BRIDGE_LOG_HANDLER"]="console"

    os.environ["CLOUD_BRIDGE_EXCLUSION_LIST"]=""

    cloud_nats_bridge = CloudNatsBridge()
    
    #invalid tcr xml with "<" removed
    invalidTcrXML = "xml version=\"1.0\" encoding=\"UTF-8\"?><TrafficControlRequest><reqid>3A0D0145E8934B48</reqid><reqseq>0</reqseq><scale>0</scale><bounds><oldest>27484661</oldest><reflon>-818349472</reflon><reflat>281118677</reflat><offsets><deltax>376</deltax><deltay>0</deltay></offsets><offsets><deltax>376</deltax><deltay>1320</deltay></offsets><offsets><deltax>0</deltax><deltay>1320</deltay></offsets></bounds></TrafficControlRequest>"

    #valid tcr xml and json
    validTcrXML = '<?xml version=\"1.0\" encoding=\"UTF-8\"?><TrafficControlRequest><reqid>3A0D0145E8934B48</reqid><reqseq>0</reqseq><scale>0</scale><bounds><oldest>27484661</oldest><reflon>-818349472</reflon><reflat>281118677</reflat><offsets><deltax>376</deltax><deltay>0</deltay></offsets><offsets><deltax>376</deltax><deltay>1320</deltay></offsets><offsets><deltax>0</deltax><deltay>1320</deltay></offsets></bounds></TrafficControlRequest>'
    validTcrJson = '{"TrafficControlRequest": {"reqid": "3A0D0145E8934B48", "reqseq": "0", "scale": "0", "bounds": {"oldest": "27484661", "reflon": "-818349472", "reflat": "281118677", "offsets": [{"deltax": "376", "deltay": "0"}, {"deltax": "376", "deltay": "1320"}, {"deltax": "0", "deltay": "1320"}]}}}'
    
    #Verify invalid xml doesn't return a json
    assert (str(cloud_nats_bridge.xmlToJson(invalidTcrXML)) == "")

    #Verify valid xml returns correct json
    assert (str(cloud_nats_bridge.xmlToJson(validTcrXML)) == validTcrJson)


if __name__ == '__main__':
    unittest.main()
