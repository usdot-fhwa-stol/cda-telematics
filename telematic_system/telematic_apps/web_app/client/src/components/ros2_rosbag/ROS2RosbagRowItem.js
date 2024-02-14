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
 * Description: A table row for each ROS2 rosbag file.
 */
import { TableCell, TableRow } from "@mui/material";
import React from "react";
import InfoPopover from "../ui/InfoPopover";
import { USER_ROLES } from "../users/UserMetadata";
import { calFilesizes } from "./ROS2RosBagUtils";
import ROS2RosbagControlsItem from "./ROS2RosbagControlsItem";
import { PROCESSING_STATUS, UPLOAD_STATUS } from "./ROS2RosbagMetadata";
import AuthContext from "../../context/auth-context";

const ROS2RosbagRowItem = (props) => {
  const authCtx = React.useContext(AuthContext);
  const saveRos2RosbagDescriptionHandler = (UpdatedFileInfo) => {
    props.onSaveRos2RosbagDescription(UpdatedFileInfo);
  };

  return (
    <TableRow>
      {
        props.ROS2RosbagRow !== undefined &&
        props.columns.map((column) => {
          let value = props.ROS2RosbagRow[column.id] || "NA";
          let isBlue = (column.id === "process_status" && props.ROS2RosbagRow.process_status === PROCESSING_STATUS.IN_PROGRESS) || (column.id === "upload_status" && props.ROS2RosbagRow.upload_status === UPLOAD_STATUS.IN_PROGRESS);
          let isGreen = (column.id === "process_status" && props.ROS2RosbagRow.process_status === PROCESSING_STATUS.COMPLETED) || (column.id === "upload_status" && props.ROS2RosbagRow.upload_status === UPLOAD_STATUS.COMPLETED);
          let createdBy = column.id === "created_by" && props.ROS2RosbagRow.user !== null && props.ROS2RosbagRow.user.email !== null ? props.ROS2RosbagRow.user.email : "NA";
          value = column.id === "size" ? calFilesizes(value) : value;
          value = column.id === "created_by" ? createdBy : value;
          value = column.id === "created_at" ? new Date(value).toLocaleString() : value;

          return (
            <TableCell key={`ros2-rosbag-cell-${props.ROS2RosbagRow.id}-${column.id}`} align={column.align}
              style={{ top: 0, minWidth: column.minWidth, color: isGreen ? "green" : isBlue ? "blue" : "black" }}>

              {value}

              {column.id === "process_status" && props.ROS2RosbagRow !== undefined && props.ROS2RosbagRow.process_status === PROCESSING_STATUS.ERROR &&
                (
                  <InfoPopover sx={{ color: "red" }} info={props.ROS2RosbagRow.process_error_msg} />
                )}

              {column.id === "upload_status" && props.ROS2RosbagRow !== undefined && props.ROS2RosbagRow.upload_status === UPLOAD_STATUS.ERROR &&
                (
                  <InfoPopover info={props.ROS2RosbagRow.upload_error_msg} />
                )}
            </TableCell>
          );
        })
      }

      {
        authCtx.role !== USER_ROLES.VIEWER && authCtx.role !== undefined && authCtx.role !== null && authCtx.role !== "" && (
          <ROS2RosbagControlsItem ROS2RosbagRow={props.ROS2RosbagRow}
            onSaveRos2RosbagDescription={saveRos2RosbagDescriptionHandler}
            onProcessROS2RosbagReq={(ROS2RosBagInfo) => props.onProcessROS2RosbagReq(ROS2RosBagInfo)} />
        )}
    </TableRow>
  )
};

export default ROS2RosbagRowItem;
