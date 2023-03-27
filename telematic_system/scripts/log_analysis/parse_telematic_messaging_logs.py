import datetime
import csv
import json
import sys

def parseInfluxfile(logname):
    fileName = logname.split(".")[0]
    influx_log = open(logname,'r')

    results_file = open(f'{fileName}_parsed.csv', 'w')
    writer = csv.writer(results_file)
    writer.writerow(["Topic","Message Time","Log_Timestamp(s)", "Delay(s)"])
    topic_name = ""
    time_in_s = 0
    sec = 0
    nanosec = 0
    skipped_lines_count = 0
    unique_topics = []

    for line in influx_log:
        split_line = line.split(":")
        if " Sending to influxdb" in split_line:
            
            # Get log json
            try:
                json_object = json.loads(line)
            except:
                skipped_lines_count += 1
                continue
            log_line = json_object["log"]
            
            # Get write time 
            write_time_split = log_line.split("INFO")
            write_time_string = write_time_split[0][:len(write_time_split[0]) - 2]
            write_time_datetime = datetime.datetime.strptime(write_time_string, '%Y-%m-%d %H:%M:%S.%f')

            search_string = " Sending to influxdb"
            payload_index = log_line.index(search_string) + 1
            payload = log_line[payload_index + len(search_string) + 1:]
            
            payload_split = payload.split(",")
            
            
            # Search within split payload string
            unit_type = ""
            for item in payload_split:
                # Get topic name
                item_split = item.split("=")
                if "topic_name" in item_split:
                    topic_name = item_split[1].split(' ')[0]

                    if topic_name not in unique_topics:
                        unique_topics.append(topic_name)

                # Get unit type
                if "unit_type" in item_split:
                    unit_type = item_split[1]
                    
                message_timestamp = 0
                if unit_type == "infrastructure" and "metadata.timestamp" in item_split:
                    # Get metadata timestamp
                    message_timestamp = int(item_split[1].split(' ')[0])
                    time_in_s = message_timestamp/1000
                    # message_time_in_datetime = datetime.datetime.fromtimestamp(message_timestamp/1000)
                    
                elif unit_type == "platform":
                    if "header.stamp.nanosec" in item_split:
                        nanosec = int(item_split[1])
                    elif "header.stamp.sec" in item_split:
                        # Check if space exists within string
                        if ' ' in item_split[1]:
                            sec = int((item_split[1].split())[0])
                        else:
                            sec = int(item_split[1].rstrip('\n'))
                

            if unit_type == "platform":
                time_in_s = (sec * 1e9 + nanosec)/1e9
            
            if time_in_s == 0:
                continue

            message_time_in_datetime = datetime.datetime.fromtimestamp(time_in_s)
            delay = (write_time_datetime - message_time_in_datetime).total_seconds() - 4*60*60

            writer.writerow([topic_name, message_time_in_datetime, write_time_datetime, delay])

    print("Number of unique topics: ", len(unique_topics))
    print(unique_topics)

            


def main():
    if len(sys.argv) < 2:
        print('Run with: "python3 influxLogParser.py logname"')
    else:       
        logname = sys.argv[1]
        parseInfluxfile(logname)


if __name__ == "__main__":
    main()