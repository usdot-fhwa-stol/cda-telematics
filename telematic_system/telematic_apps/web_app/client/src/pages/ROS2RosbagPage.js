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
 */
import WorkHistorySharpIcon from '@mui/icons-material/WorkHistorySharp';
import { Grid } from "@mui/material";
import React, { memo, useEffect, useState } from "react";
import ROS2ROSBagFilter from "../components/ros2_rosbag/ROS2ROSBagFilter";
import {
  PROCESSING_STATUS,
  UPLOAD_STATUS,
} from "../components/ros2_rosbag/ROS2RosbagMetadata";
import ROS2RosbagTable from "../components/ros2_rosbag/ROS2RosbagTable";
import Notification, {
  NOTIFICATION_STATUS,
} from "../components/ui/Notification";
import { PageAvatar } from "../components/ui/PageAvatar";
import AuthContext from "../context/auth-context";

const ROS2RosbagPage = memo(() => {
  const authCtx = React.useContext(AuthContext);
  //Add Alert notification
  const [alertStatus, setAlertStatus] = useState({});
  const [uploadStatusList, setUploadStatusList] = useState(
    Object.keys(UPLOAD_STATUS).map((status) => {
      return status;
    })
  );

  const [processingStatusList, setProcessingStatusList] = useState(
    Object.keys(PROCESSING_STATUS).map((status) => {
      return status;
    })
  );
  const closeAlertHandler = () => {
    setAlertStatus({
      open: false,
      severity: NOTIFICATION_STATUS.SUCCESS,
      title: "",
      message: "",
    });
  };
    useEffect(()=>{
  console.log(processingStatusList);
    },[processingStatusList])

  return (
    <React.Fragment>
      <Notification
        open={alertStatus.open}
        closeAlert={closeAlertHandler}
        severity={alertStatus.severity}
        title={alertStatus.title}
        messageList={alertStatus.messageList}
      />
      {authCtx.role !== undefined &&
        authCtx.role !== null &&
        authCtx.role !== "" && (
          <Grid container columnSpacing={2} rowSpacing={1}>
            <PageAvatar icon={<WorkHistorySharpIcon />} title="ROS2 Rosbag" />
            <Grid item xs={4}></Grid>
            <ROS2ROSBagFilter
              uploadStatusList={uploadStatusList}
              processingStatusList={processingStatusList}
            />
            <Grid container item xs={12}>
              <ROS2RosbagTable />
            </Grid>
          </Grid>
        )}
    </React.Fragment>
  );
});

export default ROS2RosbagPage;
