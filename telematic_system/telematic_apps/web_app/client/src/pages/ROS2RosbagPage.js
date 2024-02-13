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
import WorkHistorySharpIcon from "@mui/icons-material/WorkHistorySharp";
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
import ROS2RosbagContext from "../context/ROS2-rosbag-context";
import AuthContext from "../context/auth-context";

const ROS2RosbagPage = memo(() => {
  const DUMMY = [
    {
      content_location: "content_location",
      created_at: 1707752416,
      updated_at: 1707752416,
      id: 1,
      original_filename: "test1",
      upload_status: "COMPLETED",
      upload_error_msg: "",
      processing_status: "ERROR",
      processing_error_msg: "Test",
      size: 12,
      created_by: 1,
      updated_by: 1,
      description: "test description",
    },
    {
      content_location: "content_location",
      created_at: 1707752416,
      updated_at: 1707752416,
      id: 2,
      original_filename: "test",
      upload_status: "IN_PROGRESS",
      upload_error_msg: "",
      processing_error_msg: "",
      processing_status: "NA",
      size: 12,
      created_by: 1,
      updated_by: 1,
      description: "test description",
    },
  ];
  const ROS2RosbagCtx = React.useContext(ROS2RosbagContext);
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
  const [ROS2RosbagList, setROS2RosbagList] = useState([]);

  const closeAlertHandler = () => {
    setAlertStatus({
      open: false,
      severity: NOTIFICATION_STATUS.SUCCESS,
      title: "",
      message: "",
    });
  };

  const saveRos2RosbagDescriptionHandler = (UpdatedFileInfo) => {
    setROS2RosbagList([
      UpdatedFileInfo,
      ...ROS2RosbagList.filter(
        (item) => item.original_filename !== UpdatedFileInfo.original_filename
      ),
    ]);
  };

  const RefreshHandler = () => {
    setROS2RosbagList(DUMMY);
  };

  const handleProcessROS2RosbagReq = (ROS2RosBagInfo) => {
    console.log(ROS2RosBagInfo);
  };

  const filterROS2RosbagListHandler = () => {
    let filterredROS2RosbagList = DUMMY;
    if (ROS2RosbagCtx.uploadStatus.length > 0) {
      filterredROS2RosbagList = filterredROS2RosbagList.filter(
        (item) =>
          item.upload_status.toUpperCase().trim() ===
            ROS2RosbagCtx.uploadStatus ||
          (ROS2RosbagCtx.uploadStatus === UPLOAD_STATUS.NA &&
            item.upload_status.length === 0)
      );
    }

    if (ROS2RosbagCtx.processingStatus.length > 0) {
      filterredROS2RosbagList = filterredROS2RosbagList.filter(
        (item) =>
          item.processing_status.toUpperCase().trim() ===
            ROS2RosbagCtx.processingStatus ||
          (ROS2RosbagCtx.processingStatus === PROCESSING_STATUS.NA &&
            item.processing_status.length === 0)
      );
    }

    if (ROS2RosbagCtx.filterText.length > 0) {
      filterredROS2RosbagList = filterredROS2RosbagList.filter(
        (item) =>
          item.description.includes(ROS2RosbagCtx.filterText) ||
          item.original_filename.includes(ROS2RosbagCtx.filterText)
      );
    }
    setROS2RosbagList(filterredROS2RosbagList);
  };

  useEffect(() => {
    setROS2RosbagList(DUMMY);
  }, []);

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
              onFresh={RefreshHandler}
              filterROS2RosbagList={filterROS2RosbagListHandler}
            />
            <Grid container item xs={12}>
              <ROS2RosbagTable
                ROS2RosbagList={ROS2RosbagList}
                onSaveRos2RosbagDescription={saveRos2RosbagDescriptionHandler}
                onProcessROS2RosbagReq={(ROS2RosBagInfo) =>
                  handleProcessROS2RosbagReq(ROS2RosBagInfo)
                }
              />
            </Grid>
          </Grid>
        )}
    </React.Fragment>
  );
});

export default ROS2RosbagPage;
