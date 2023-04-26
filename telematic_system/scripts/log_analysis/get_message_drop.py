import datetime
import csv
import json
import sys
from datetime import timezone, date
import pytz
import re
import numpy as np
import pandas as pd
from glob import glob
import matplotlib
matplotlib.use("GTK3Agg")
import matplotlib.pyplot as plt
import matplotlib.dates as mdates

import warnings
warnings.filterwarnings("ignore")


def combineFiles(log_dir):
    messaging_server_csv = ""
    bluelexus_csv = ""
    fusion_csv = ""
    vehicle_bridge_csv = ""
    streets_bridge_csv = ""
    cloud_bridge_csv = ""

    # Get all csv files
    files = glob(log_dir + "/*.csv")

    for file in files:
        required_file = file.split("/")[-1]
        
        if "Messaging" in required_file.split("_"):
            messaging_server_csv = file
        elif "Streets" in required_file.split("_"):
            streets_bridge_csv = file
        elif "Cloud" in required_file.split("_"):
            cloud_bridge_csv = file
        elif "Vehicle" in required_file.split("_"):
            vehicle_bridge_csv = file
        elif "BlueLexus" in required_file.split("_"):
            bluelexus_csv = file
        elif "Fusion" in required_file.split("_"):
            fusion_csv = file
    
    # if vehicle_bridge_csv == "" and fusion_csv == "" and bluelexus_csv == "":
    #     sys.exit("Did not find any vehicle bridge csv logs in directory. File name needs to include the word Vehicle or BlueLexus or Fusion separated underscores(_)")
    if streets_bridge_csv == "":
        sys.exit("Did not find any streets bridge csv logs in directory. File name needs to include the word Streets separated underscores(_)")
    # elif cloud_bridge_csv == "":
    #     sys.exit("Did not find any cloud bridge csv logs in directory. File name needs to include the word Cloud separated underscores(_)")
    


    messaging_server_df = pd.read_csv(messaging_server_csv)
    # messaging_server_df = messaging_server_df.rename({'Log_Timestamp(s)':'Messaging_Server_Timestamp'})

    #Infrastructure topics including streets and cloud
    infrastructure_topics = ['TCR','TCM','v2xhub_mobility_operation_in', 'v2xhub_scheduling_plan_sub', 
                    'modified_spat', 'v2xhub_map_msg_in', 'tsc_config_state', 'v2xhub_mobility_path_in', 'v2xhub_bsm_in', 'vehicle_status_intent_output', 'desired_phase_plan']

    #carma streets topics
    streets_topics = ['v2xhub_mobility_operation_in', 'v2xhub_scheduling_plan_sub', 
                    'modified_spat', 'v2xhub_map_msg_in', 'tsc_config_state', 'v2xhub_mobility_path_in', 'v2xhub_bsm_in', 'vehicle_status_intent_output', 'desired_phase_plan']
    
    # cloud topics
    cloud_topics = ['TCR', 'TCM']

    infrastructure_units = ['streets_id', 'cloud_id']

    ############# Load messaging server logs and get a list of dataframes for all unit ids
    #### Dictionary of dataframes with unique unit ids
    messaging_server_dfs = dict(tuple(messaging_server_df.groupby('Unit Id')))

    #Remove null entries and metadata column from vehicle bridge dfs
    for key, value in messaging_server_dfs.items():
        if key not in infrastructure_units:
            value = value[~value['Message Time'].isnull()]
            # value = value.drop('Metadata',axis =1)
    
   
    #Get dataframes from bridge logs
    bridge_dfs = dict()
    if vehicle_bridge_csv:
        # Get unit id of vehicle bridge unit
        vehicle_bridge_df = pd.read_csv(vehicle_bridge_csv)
        bridge_dfs.update(dict(tuple(vehicle_bridge_df.groupby('Unit Id'))))
    
    if bluelexus_csv:
        vehicle_bridge_df = pd.read_csv(bluelexus_csv)
        bridge_dfs.update(dict(tuple(vehicle_bridge_df.groupby('Unit Id'))))
    
    if fusion_csv:
        vehicle_bridge_df = pd.read_csv(fusion_csv)
        bridge_dfs.update(dict(tuple(vehicle_bridge_df.groupby('Unit Id'))))

    if streets_bridge_csv:
        streets_bridge_df = pd.read_csv(streets_bridge_csv)
        bridge_dfs.update(dict(tuple(streets_bridge_df.groupby('Unit Id'))))

    if cloud_bridge_csv:
        cloud_bridge_df = pd.read_csv(cloud_bridge_csv)
        bridge_dfs.update(dict(tuple(cloud_bridge_df.groupby('Unit Id'))))

    print(bridge_dfs.keys())


    # Create combined dataframes from 
    for key in bridge_dfs:
        if key in messaging_server_dfs:
            
            vehicle_df_combined = pd.merge(bridge_dfs[key], messaging_server_dfs[key],  how='left', left_on=['Topic','Payload Timestamp'], right_on = ['Topic','Message Time'])
            vehicle_df_combined.to_csv(log_dir + key + "_combined.csv")

            vehicle_missing_message_count = vehicle_df_combined['Log_Timestamp(s)'].isnull().sum()
            vehicle_total_message_count = len(vehicle_df_combined['Payload Timestamp'])
            print("Message drop for unit: ", key)
            print("Missing count: ", vehicle_missing_message_count)
            print("Total count: ", vehicle_total_message_count)
            print("Percentage of messages received",(1 - (vehicle_missing_message_count/vehicle_total_message_count))*100)

            vehicle_topics_with_empty_count = {}
            for index, row  in vehicle_df_combined.iterrows():
                if pd.isnull(row['Message Time']):
                    if row['Topic'] not in vehicle_topics_with_empty_count:
                        vehicle_topics_with_empty_count[row['Topic']] = 1
                    else:
                        vehicle_topics_with_empty_count[row['Topic']] += 1
            
            print("{} missed messages: ".format(key))
            print(vehicle_topics_with_empty_count)

            # Plot vehicle data
            vehicle_df_combined = vehicle_df_combined[vehicle_df_combined['Message Time'].isnull()]
            vehicle_df_combined['Payload Timestamp'] = pd.to_datetime(vehicle_df_combined['Payload Timestamp'], infer_datetime_format=True)
            vehicle_df_combined['Message Time'] = pd.to_datetime(vehicle_df_combined['Message Time'], infer_datetime_format=True)
            

            ax1 = plt.plot(vehicle_df_combined['Topic'], vehicle_df_combined['Payload Timestamp'], '|')
            #Plot start and end lines
            # print(messaging_server_dfs[key])
            start_time = pd.to_datetime(messaging_server_dfs[key]['Log_Timestamp(s)'].iloc[0])
            end_time = pd.to_datetime(messaging_server_dfs[key]['Log_Timestamp(s)'].iloc[-1])

            plt.axhline(y = start_time, color = 'r', linestyle = '-', label = 'Test Start Time')
            plt.axhline(y = end_time, color = 'r', linestyle = '-', label = 'Test End Time')

            plt.title('{} : Topics against time of dropped message'.format(key))
            plt.xlabel('Topics with dropped messages hours:mins:seconds')
            plt.ylabel('Time of message drop')
            xfmt = mdates.DateFormatter('%H:%M:%S')
            plt.gcf().autofmt_xdate()
            plt.show()
            # plt.savefig('{}_Message_drop.png'.format(key))

    




def main():
    if len(sys.argv) < 2:
        print('Run with: "python3 combine_files_2.py directory_name"')
    else:
        log_dir = sys.argv[1]
        combineFiles(log_dir)


if __name__ == "__main__":
    main()