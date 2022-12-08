import sys
from csv import writer
import os
import json
import shutil

#parser method to extract necessary fields from raw text file
def kafkaParser(logname, startTime, endTime):
    #Convert the text file into an array of lines
    with open(f'{logname}', encoding="utf8", errors='ignore') as textFile:
        textList = []
        for line in textFile:
            textList.append(line.strip())

    output_filename = logname.split(".")[0]
    #write data of interest to csv which will be used to produce plots
    with open(f'{output_filename}_parsed.csv', 'w', newline='') as write_obj:
        csv_writer = writer(write_obj)
        csv_writer.writerow(["Create_timestamp", "Message_Count", "Payload"])
    
        message_count = 1
        #extract relevant elements from the json
        for i in range(0, len(textList)):
            try:
                timestamp = textList[i].split("{")[0].split(":")[1].strip()
                
                if (timestamp >= startTime) and (timestamp <= endTime):
                    json_beg_index = textList[i].find("{")
                    json_message = textList[i][json_beg_index:]
                    csv_writer.writerow([timestamp, message_count, json_message])

                    message_count += 1
            except:
                print("Error")

if __name__ == '__main__':
    if len(sys.argv) < 4:
        print('Run with: "python3 kafka_parser.py logname startTime endTime"')
    else:       
        logname = sys.argv[1]
        start = sys.argv[2]
        end = sys.argv[3]
        kafkaParser(logname, start, end)