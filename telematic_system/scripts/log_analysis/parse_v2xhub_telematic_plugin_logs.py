import argparse
import json
import pandas as pd

class TelematicMessageConvertor:
    def __init__(self):
        self.published_msg : dict= {
                                    'unit_id':[],
                                    'topic_name':[],
                                    'timestamp':[],
                                    'payload_source':[],
                                    'event_name':[],
                                    'unit_type':[]
                                }   

    def convert_to_json(self, msg: str):
        try:
            msg_json = json.loads(msg)
            return msg_json
        except:
            return None
        
    def to_csv(self, output_path: str):
        df = pd.DataFrame.from_dict(self.published_msg, orient='columns')
        df.to_csv(output_path, index=False)
        
    def append_published_msg(self, msg_json: dict):
        self.published_msg['event_name'].append(msg_json['event_name'])
        self.published_msg['timestamp'].append(str(msg_json['timestamp']))
        self.published_msg['topic_name'].append(msg_json['topic_name'])
        self.published_msg['payload_source'].append(msg_json['payload']['source'])
        self.published_msg['unit_id'].append(msg_json['unit_id'])
        self.published_msg['unit_type'].append(msg_json['unit_type'])

    def split_lines(self, chunk: str)-> list[str]:
        lines = chunk.split('\n')
        remaining_part = lines.pop(-1)
        return (lines, remaining_part)

    def is_published_msg(self, line: str)->bool:
        return 'Topic:' in line and 'TelematicUnit'  in line
    
    def extract_published_msg(self, line: str)->str:
        msg_idx = line.find("Published:")
        msg_end_idx = line.find('n","stream"')
        published_msg = line[msg_idx+10:msg_end_idx].strip()
        published_msg = published_msg.replace('\\','')
        return published_msg
            
    def parse_log_file(self, log_file_path: str):
        incomplete_data = ''
        with open(log_file_path, "r") as file:
            while True:
                chunk = file.read(1024)
                if not chunk:
                    break
                complete_data = incomplete_data + chunk
                lines, incomplete_data = self.split_lines(complete_data)
                for line in lines:
                    # Process each line with topic and generated from TelematicUnit file
                    if not self.is_published_msg(line):
                        continue
                    msg = self.extract_published_msg(line)
                    msg_json = self.convert_to_json(msg)
                    if msg_json is None:
                        continue
                    self.append_published_msg(msg_json)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(prog="v2xhub_telematic_bridge_log_parser",
                                     description="Parse v2xhub telematic bridge log file")
    parser.add_argument("log_file_path", help="Path to v2xhub telematic bridge log file")
    parser.add_argument("output_path", help="Path to output csv file")
    args = parser.parse_args()

    converter = TelematicMessageConvertor()
    converter.parse_log_file(args.log_file_path)
    converter.to_csv(args.output_path)