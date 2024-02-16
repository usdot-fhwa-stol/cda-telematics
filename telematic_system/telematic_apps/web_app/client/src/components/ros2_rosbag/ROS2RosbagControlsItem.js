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
 * Description: A table cell that includes control items for each ROS2 rosbag file. The current control options include: Edit an existing file description and send processing request.
 */
import EditIcon from "@mui/icons-material/Edit";
import RunningWithErrorsIcon from "@mui/icons-material/RunningWithErrors";
import TableCell from "@mui/material/TableCell";
import * as React from "react";
import AuthContext from "../../context/auth-context";
import { CustomizedOutlinedButton } from "../ui/CustomizedOutlinedButton";
import { USER_ROLES } from "../users/UserMetadata";
import ROS2RosbagDescriptionDialog from "./ROS2RosbagDescriptionDialog";
import { PROCESSING_STATUS, UPLOAD_STATUS } from "./ROS2RosbagMetadata";

const ROS2RosbagControlsItem = (props) => {
  const authCtx = React.useContext(AuthContext);
  const [open, setOpen] = React.useState(false);
  const openHandler = () => {
    setOpen(true);
  };

  const handleProcessReq = () => {
    props.onProcessReq(props.ROS2RosbagRow);
  };
  
  const closeHandler = () => {
    setOpen(false);
  };

  const saveDescHandler = (UpdatedFileInfo) => {
    props.onSaveDescription(UpdatedFileInfo);
  };

  return (
    <React.Fragment>
      {
        authCtx.role !== USER_ROLES.VIEWER && authCtx.role !== undefined && authCtx.role !== null && authCtx.role !== "" && (
          <TableCell key={`controls-${props.ROS2RosbagRow.id}`}>
            <ROS2RosbagDescriptionDialog open={open} onClose={closeHandler} title={`Edit (${props.ROS2RosbagRow.original_filename}) Description`} ROS2RosbagRow={props.ROS2RosbagRow} OnDescriptionSave={saveDescHandler}></ROS2RosbagDescriptionDialog>
            <CustomizedOutlinedButton title={"Edit description"} key={`edit-Rosbag-${props.ROS2RosbagRow.id}`} onClick={openHandler}><EditIcon /></CustomizedOutlinedButton>

            {
              props.ROS2RosbagRow !== undefined && props.ROS2RosbagRow.upload_status === UPLOAD_STATUS.COMPLETED && props.ROS2RosbagRow.process_status !== PROCESSING_STATUS.COMPLETED && (
                <CustomizedOutlinedButton title={"Process ROS2 Rosbag"} key={`process-Rosbag-${props.ROS2RosbagRow.id}`} onClick={handleProcessReq}><RunningWithErrorsIcon /></CustomizedOutlinedButton>
              )}
          </TableCell>
        )}
    </React.Fragment>
  );
};

export default ROS2RosbagControlsItem;
