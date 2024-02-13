/*
 * Copyright (C) 2019-2024 LEIDOS.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not
 * use this file except in compliance with the License. You may obtain a copy of
 * the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
 *
 * Description:
 * Upload ROS2 rosbag files and display the list of uploaded ROS2 rosbag files.
 */
import { Card, CardContent, CardHeader, Grid } from "@mui/material";
import { Box } from "@mui/system";
import React from "react";
import ROS2ROSBagFilterForm from "./ROS2ROSBagFilterForm";

const ROS2ROSBagFilter = (props) => {
  const SearchROS2RosbagsHandler = (filteredEventList) => {
    props.onSearchROS2Rosbags(filteredEventList);
  };

  return (
    <Grid container item xs={12} columnSpacing={3} sx={{ margin: "0px 3px" }}>
      <Box sx={{ width: "100%" }}>
        <Card>
          <CardHeader
            sx={{ color: "#000", backgroundColor: "#eee", padding: 1 }}
            title="Filter ROS Rosbags"
            titleTypographyProps={{ variant: "title" }}
          />
          <CardContent>
            <ROS2ROSBagFilterForm
              eventInfoList={props.eventInfoList}
              onSearchROS2Rosbags={SearchROS2RosbagsHandler}
              uploadStatusList={props.uploadStatusList}
              processingStatusList={props.processingStatusList}
              onRefresh = {()=>{ props.onFresh()}}
              filterROS2RosbagList ={()=>props.filterROS2RosbagList()}
            />
          </CardContent>
        </Card>
      </Box>
    </Grid>
  );
};

export default ROS2ROSBagFilter;
