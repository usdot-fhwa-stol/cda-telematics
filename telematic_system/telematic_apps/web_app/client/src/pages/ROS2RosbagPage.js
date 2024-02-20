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
import React, { useEffect, useState } from "react";
import {
  listROS2Rosbags,
  sendProcessRequest,
  updateDescription,
  uploadROS2Rosbags,
} from "../api/api-ros2-rosbag";
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
import ROS2RosbagContext from "../context/ros2-rosbag-context";

const ROS2RosbagPage = React.memo(() => {
  const ROS2RosbagCtx = React.useContext(ROS2RosbagContext);
  const authCtx = React.useContext(AuthContext);
  const [alertStatus, setAlertStatus] = useState({});
  const [uploadStatusList, setUploadStatusList] = useState(Object.keys(UPLOAD_STATUS).map((status) => status));
  const [processingStatusList, setProcessingStatusList] = useState(Object.keys(PROCESSING_STATUS).map((status) => status));
  const [ROS2RosbagList, setROS2RosbagList] = useState([]);

  const closeAlertHandler = () => {
    setAlertStatus({
      open: false,
      severity: NOTIFICATION_STATUS.SUCCESS,
      title: "",
      message: "",
    });
  };

  const saveDescriptionHandler = (UpdatedFileInfo) => {
    updateDescription(UpdatedFileInfo).then((data) => {
      if (data.errCode !== undefined && data.errMsg !== undefined) {
        setAlertStatus({
          open: true,
          severity: NOTIFICATION_STATUS.ERROR,
          title: "Error",
          message: data.errMsg,
        });
      } else {
        setROS2RosbagList([UpdatedFileInfo, ...ROS2RosbagList.filter((item) => item.original_filename !== UpdatedFileInfo.original_filename)]);
      }
    });
  };

  const isInCurrentOrg = (ROS2RosbagInfo, authCtx) => {
    return (ROS2RosbagInfo.user !== undefined && ROS2RosbagInfo.user !== null && ROS2RosbagInfo.user.org_id !== undefined && authCtx !== undefined && ROS2RosbagInfo.user.org_id === parseInt(authCtx.org_id));
  };

  const refreshHandler = () => {
    listROS2Rosbags().then((data) => {
      if (data.errCode !== undefined && data.errMsg !== undefined) {
        setAlertStatus({
          open: true,
          severity: NOTIFICATION_STATUS.ERROR,
          title: "Error",
          message: data.errMsg,
        });
      } else {
        setROS2RosbagList(data.filter((item) => isInCurrentOrg(item, authCtx)));
      }
    });
  };

  const processReqHandler = (ROS2RosBagInfo) => {
    sendProcessRequest(ROS2RosBagInfo).then((data) => {
      if (data.errCode !== undefined && data.errMsg !== undefined) {
        setAlertStatus({
          open: true,
          severity: NOTIFICATION_STATUS.ERROR,
          title: "Error",
          message: data.errMsg,
        });
      } else {
        setAlertStatus({
          open: true,
          severity: NOTIFICATION_STATUS.SUCCESS,
          title: "Processing Request Status",
          message: data,
        });
      }
    });
  };

  const validateUpload = (fileInfoList, uploadFileInfoList) => {
    let isValid = true;
    if (Array.isArray(uploadFileInfoList) && uploadFileInfoList.length > 0) {
      let messageList = [];
      uploadFileInfoList.forEach(newFileInfo => {
        for (let existingFile of fileInfoList) {
          //Existing original file name in DB includes the organization name as the uploaded folder
          if (existingFile.original_filename.split("/")[existingFile.original_filename.split("/").length -1] === newFileInfo.filename) {
            messageList.push(newFileInfo.filename);
            isValid = false;
          }
        }
      });

      if (messageList.length > 0) {
        setAlertStatus({
          open: true,
          severity: NOTIFICATION_STATUS.ERROR,
          title: "Error upload",
          message: "ROS2 Rosbag files exist: " + messageList.join(),
        });
        return isValid;
      }
    } else {
      setAlertStatus({
        open: true,
        severity: NOTIFICATION_STATUS.ERROR,
        title: "Error upload",
        message: "ROS2 Rosbag files cannot be empty!",
      });
      isValid = false;
    }
    return isValid;
  }

  const uploadHandler = (ROS2RosBagsFormData) => {
    let fields = ROS2RosBagsFormData["fields"] || [];
    console.log(ROS2RosBagsFormData);
    if (validateUpload(ROS2RosbagList, fields)) {
      uploadROS2Rosbags(ROS2RosBagsFormData).then((data) => {
        setAlertStatus({
          open: true,
          severity: NOTIFICATION_STATUS.SUCCESS,
          title: "ROS2 Rosbag files upload",
          message:
            "Server responds with ROS2 Rosbag files upload end! Click the refresh button to get the latest upload status.",
        });
      });
      setAlertStatus({
        open: true,
        severity: NOTIFICATION_STATUS.WARNING,
        title: "ROS2 Rosbag files upload",
        message:
          "ROS2 Rosbag files upload request sent! Please DOT NOT close this browser window tab until the ROS2 Rosbag files upload completed! Click the refresh button to get the latest upload status.",
      });
    }
  };

  const filterHandler = () => {
    listROS2Rosbags().then((data) => {
      if (data.errCode !== undefined && data.errMsg !== undefined) {
        setAlertStatus({
          open: true,
          severity: NOTIFICATION_STATUS.ERROR,
          title: "Error",
          message: data.errMsg,
        });
      } else {
        let filterredROS2RosbagList = data.filter((item) =>
          isInCurrentOrg(item, authCtx)
        );
        if (ROS2RosbagCtx.uploadStatus.length > 0) {
          filterredROS2RosbagList = filterredROS2RosbagList.filter(
            (item) => (item.upload_status !== null && item.upload_status.toUpperCase().trim() === ROS2RosbagCtx.uploadStatus) || (ROS2RosbagCtx.uploadStatus === UPLOAD_STATUS.NA && (item.upload_status === null || item.upload_status.length === 0))
          );
        }

        if (ROS2RosbagCtx.processingStatus.length > 0) {
          filterredROS2RosbagList = filterredROS2RosbagList.filter(
            (item) => (item.process_status !== null && item.process_status.toUpperCase().trim() === ROS2RosbagCtx.processingStatus) || (ROS2RosbagCtx.processingStatus === PROCESSING_STATUS.NA && (item.process_status === null || item.process_status.length === 0))
          );
        }

        if (ROS2RosbagCtx.filterText.length > 0) {
          filterredROS2RosbagList = filterredROS2RosbagList.filter(
            (item) => (item.description !== null && item.description.includes(ROS2RosbagCtx.filterText)) || (item.original_filename !== null && item.original_filename.includes(ROS2RosbagCtx.filterText))
          );
        }
        setROS2RosbagList(filterredROS2RosbagList);
      }
    });
  };

  useEffect(() => {
    listROS2Rosbags().then((data) => {
      if (data.errCode !== undefined && data.errMsg !== undefined) {
        setAlertStatus({
          open: true,
          severity: NOTIFICATION_STATUS.ERROR,
          title: "Error",
          message: data.errMsg,
        });
      } else {
        setROS2RosbagList((data) => data.filter((item) => isInCurrentOrg(item, authCtx)));
      }
    });
  }, [authCtx]);

  return (
    <React.Fragment>
      <Notification
        open={alertStatus.open}
        closeAlert={closeAlertHandler}
        severity={alertStatus.severity}
        title={alertStatus.title}
        message={alertStatus.message}
      />
      {authCtx.role !== undefined && authCtx.role !== null && authCtx.role !== "" && (
        <Grid container columnSpacing={2} rowSpacing={1}>
          <PageAvatar icon={<WorkHistorySharpIcon />} title="ROS2 Rosbag" />
          <Grid item xs={4}></Grid>
          <ROS2ROSBagFilter uploadStatusList={uploadStatusList} processingStatusList={processingStatusList} onRefresh={refreshHandler} filter={filterHandler} onUpload={uploadHandler} />
          <Grid container item xs={12}>
            <ROS2RosbagTable ROS2RosbagList={ROS2RosbagList} onSaveDescription={saveDescriptionHandler} onProcessReq={(ROS2RosBagInfo) => processReqHandler(ROS2RosBagInfo)} />
          </Grid>
        </Grid>
      )}
    </React.Fragment>
  );
});

export default ROS2RosbagPage;
