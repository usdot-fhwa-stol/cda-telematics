
import datetime
import csv

def parseInfluxfile():
    influx_log = open('/home/carma/wfd_ws/logs/xaa.log','r')

    results_file = open('/home/carma/wfd_ws/logs/xaa_result.csv', 'w')
    writer = csv.writer(results_file)
    writer.writerow(["Topic","Message Time","Log_Timestamp(s)", "Delay(s)"])
    topic_name = ""
    sec = 0
    nanosec = 0
    unique_topics = []
    
    for line in influx_log:
        split_line = line.split(":")
        if " Sending to influxdb" in split_line:
            # print(line)

            # Get write time 
            write_time_split = line.split("INFO")
            write_time_string = write_time_split[0][:len(write_time_split[0]) - 2]
            write_time_datetime = datetime.datetime.strptime(write_time_string, '%Y-%m-%d %H:%M:%S.%f')
            # print(write_time_string)
            # print(split_line)
            payload_index = split_line.index(" Sending to influxdb") + 1
            payload = split_line[payload_index]
            payload = payload[1:]
            # print(payload)
            payload_split = payload.split(",")

            for item in payload_split:
                item_split  = item.split("=")
                if "topic_name" in item_split:
                    topic_name = item_split[1].split(' ')[0]

                    if topic_name not in unique_topics:
                        unique_topics.append(topic_name)
                    # print(item_split)
                
                
                if "header.stamp.nanosec" in item_split:
                    nanosec = int(item_split[1])

                if "header.stamp.sec" in item_split:
                    # Check if space exists within string
                    if ' ' in item_split[1]:
                        sec = int((item_split[1].split())[0])
                    else:
                        sec = int(item_split[1].rstrip('\n'))

            time_in_s = (sec * 1e9 + nanosec)/1e9

            if time_in_s == 0:
                continue

            # message_time_in_datetime = datetime.datetime.fromtimestamp(time_in_s).strftime('%Y-%m-%d %H:%M:%S.%f')
            message_time_in_datetime = datetime.datetime.fromtimestamp(time_in_s)

            delay = (write_time_datetime - message_time_in_datetime).total_seconds() - 4*60*60
            # print(message_time_in_datetime)
            # starting_timestamp = datetime.date.fromtimestamp(1679065188.898000)
            # if(message_time_in_datetime.date() > starting_timestamp) and (topic_name != "modified_spat"):
            if(topic_name != "modified_spat"):
            # Write to a csv
                writer.writerow([topic_name, message_time_in_datetime, write_time_datetime, delay])
            # print([topic_name, message_time_in_datetime, write_time_datetime, delay])
            break

    print("Number of unique topics: ", len(unique_topics))
    print(unique_topics)

            


def main():
    parseInfluxfile()


if __name__ == "__main__":
    main()