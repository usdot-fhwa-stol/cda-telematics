import datetime
import csv
import json
import sys
from datetime import timezone, date
import pytz
import re
import numpy as np
import pandas as pd
import glob
import seaborn as sns
import matplotlib.pyplot as plt
from matplotlib.pyplot import figure
import os

#concat all the runs into one dataframe
def concatRuns(folderName):
    directory_to_process = f'{folderName}'
    allFiles = []

    for filename in os.listdir(directory_to_process):
        df = pd.read_csv(f'{folderName}/{filename}', index_col=None, header=0)
        allFiles.append(df)

    concatOutput = pd.concat(allFiles, axis=0, ignore_index=True)
    concatOutput.to_csv(f'{folderName}_allruns.csv', index=False)

def plotter(folderName):
    allRuns = folderName + "_allruns.csv"

    #read in the combined csv data
    data = pd.read_csv(allRuns)

    #perform IQR outlier analysis
    Q1 = np.nanpercentile(data["Delay(s)"].to_numpy(), 25, interpolation='midpoint')
    Q3 = np.nanpercentile(data["Delay(s)"].to_numpy(), 75, interpolation='midpoint')
    IQR = Q3 - Q1
    upper=Q3+1.5*IQR
    lower=Q1-1.5*IQR
    trimmed_data = data[(data['Delay(s)'] < upper) & (data['Delay(s)'] > lower)]

    #print out latency statistics
    print("Mean Latency: " + str(trimmed_data["Delay(s)"].mean()))
    print("Max Latency: " + str(trimmed_data["Delay(s)"].max()))
    print("Std Dev Latency: " + str(trimmed_data["Delay(s)"].std()))
    print("75th Latency: " + str(trimmed_data["Delay(s)"].quantile(0.75)))
    print("95th Latency: " + str(trimmed_data["Delay(s)"].quantile(0.95)))

    #plot vehicle, streets, and cloud data histograms if they were part of the test
    streets_data = trimmed_data[trimmed_data['Unit Id'] == "streets_id"]
    
    if len(streets_data) > 0:
        fig, ax1 = plt.subplots()
        fig.set_size_inches(10, 10) 
        sns.histplot(streets_data['Delay(s)'], kde=False)
        plt.xlim(0, 0.75)
        plt.xlabel('Latency(s)', fontsize=18)
        plt.ylabel('Count', fontsize=18)
        plt.xticks(fontsize=15)
        plt.yticks(fontsize=15)
        plt.title(folderName + " Streets Bridge Latency Histogram", fontsize=18)
        plt.savefig(f'{folderName}_streets_latency_hist.png')


    cloud_data = trimmed_data[trimmed_data['Unit Id'] == "cloud_id"]
   
    if len(cloud_data) > 0:
        fig, ax1 = plt.subplots()
        fig.set_size_inches(10, 10) 
        sns.histplot(cloud_data['Delay(s)'], kde=False)
        plt.xlim(0, 0.75)
        plt.xlabel('Latency(s)', fontsize=18)
        plt.ylabel('Count', fontsize=18)
        plt.xticks(fontsize=15)
        plt.yticks(fontsize=15)
        plt.title(folderName + " Cloud Bridge Latency Histogram", fontsize=18)
        plt.savefig(f'{folderName}_cloud_latency_hist.png')

    vehicles = ["DOT-45244", "DOT-45254"]
    for vehicle in vehicles:
        vehicle_data = trimmed_data[trimmed_data['Unit Id'] == vehicle]
        
        if len(vehicle_data) > 0:
            fig, ax1 = plt.subplots()
            fig.set_size_inches(10, 10) 
            sns.histplot(vehicle_data['Delay(s)'], kde=False)
            plt.xlim(0, 0.75)
            plt.xlabel('Latency(s)', fontsize=18)
            plt.ylabel('Count', fontsize=18)
            plt.xticks(fontsize=15)
            plt.yticks(fontsize=15)
            plt.title(folderName + " " + vehicle + " Vehicle Bridge Latency Histogram", fontsize=18)
            plt.savefig(f'{folderName}_{vehicle}_latency_hist.png')


def main():
    if len(sys.argv) < 2:
        print('Run with: "python3 latencyPlotter.py testcase"')
    else:       
        test = sys.argv[1]
        
        concatRuns(test)
        plotter(test)

if __name__ == "__main__":
    main()



