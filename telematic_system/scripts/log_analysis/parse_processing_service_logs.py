import re
import sys

from enum import Enum
import datetime
import pytz
import numpy as np

class ProcessingStatus(Enum):
    IN_PROGRESS= "IN_PROGRESS"
    COMPLETED= "COMPLETED"
    ERROR= "ERROR"


def to_utc_datetime(self, timestamp):
        return datetime.datetime.fromtimestamp(timestamp).astimezone(pytz.utc).replace(tzinfo=None)

def parse_start_end_processing_line(line, search_str):
    timestamp_match = re.search(r'"log":"(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2},\d+)', line)
    if timestamp_match:
        timestamp_str = timestamp_match.group(1)
    else:
        print("Could not find processing starting time for rosbag")

    log_timestamp = datetime.datetime.strptime(timestamp_str, '%Y-%m-%d %H:%M:%S,%f')


    # Extract the rosbag name
    rosbag_match = re.search(fr'{search_str} (\S+\.mcap)', line)
    rosbag_name = rosbag_match.group(1) if rosbag_match else None

    return log_timestamp, rosbag_name


def parse_processing_service_logs(logfile):
    processing_started_msg_str = "Processing rosbag:"
    processing_completed_msg_str = "Completed rosbag processing for:"
    processing_status_str = "Updated mysql entry for"

    processing_times = []

    with open(logfile, 'r') as file:
        is_processing_rosbag = False
        for line in file:
            # print(line)
            if processing_started_msg_str in line:
                # print(line)
                start_timestamp, rosbag_name = parse_start_end_processing_line(line, processing_started_msg_str)
                is_processing_rosbag = True
                continue

            elif processing_completed_msg_str in line:
                end_timestamp, rosbag_name = parse_start_end_processing_line(line, processing_completed_msg_str)
                # print(end_timestamp)
                is_processing_rosbag = False
                continue

            elif processing_status_str in line:
                status_pattern = r'\b(COMPLETED|IN_PROGRESS|ERROR)\b'
                status_match = re.search(status_pattern, line)
                status = status_match.group(1) if status_match else None

                # print(f"Status: {status}")
                if status == ProcessingStatus.COMPLETED.value:
                    processing_time_in_seconds = (end_timestamp - start_timestamp).total_seconds()
                    print(f"rosbag_name: {rosbag_name} processing_time: {processing_time_in_seconds} status: {status}")
                    processing_times.append(processing_time_in_seconds)


    arr = np.array(processing_times, dtype='float32')
    average_completion_time = np.mean(arr, axis=0)
    print(f'average_completion_time: {average_completion_time}')





def main():
    if len(sys.argv) < 2:
        print('Run with: "python3 parse_processing_service_logs.py logname"')
    else:
        logname = sys.argv[1]

        parse_processing_service_logs(logname)


if __name__ == "__main__":
    main()