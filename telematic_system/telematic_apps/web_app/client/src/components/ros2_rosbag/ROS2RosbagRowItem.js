import { CircularProgress, LinearProgress, TableCell, TableRow } from "@mui/material";
import React from "react";
import InfoPopover from "../ui/InfoPopover";
import ROS2RosbagControlsItem from "./ROS2RosbagControlsItem";
import { PROCESSING_STATUS, UPLOAD_STATUS } from "./ROS2RosbagMetadata";

const ROS2RosbagRowItem = (props) => {
  const saveRos2RosbagDescriptionHandler = (UpdatedFileInfo) => {
    props.onSaveRos2RosbagDescription(UpdatedFileInfo);
  };

  return (
    <TableRow>
      {props.ROS2RosbagRow !== undefined &&
        props.columns.map((column) => {
          let value = props.ROS2RosbagRow[column.id] || "NA";
          return (
            <TableCell
              key={`ros2-rosbag-cell-${props.ROS2RosbagRow.id}-${column.id}`}
              align={column.align}
              style={{
                top: 0,
                minWidth: column.minWidth,
              }}
            >
              {value}
              {column.id === "processing_status" &&
                props.ROS2RosbagRow !== undefined &&
                props.ROS2RosbagRow.processing_status ===
                  PROCESSING_STATUS.ERROR && (
                  <InfoPopover sx={{color: 'red'}}
                    info={props.ROS2RosbagRow.processing_error_msg}
                  />
                )}
              {column.id === "upload_status" &&
                props.ROS2RosbagRow !== undefined &&
                props.ROS2RosbagRow.upload_status === UPLOAD_STATUS.ERROR && (
                  <InfoPopover info={props.ROS2RosbagRow.upload_error_msg} />
                )}
              {column.id === "upload_status" &&
                props.ROS2RosbagRow !== undefined &&
                props.ROS2RosbagRow.upload_status ===
                  UPLOAD_STATUS.IN_PROGRESS &&  <LinearProgress />} 
            </TableCell>
          );
        })}
      <ROS2RosbagControlsItem
        ROS2RosbagRow={props.ROS2RosbagRow}
        onSaveRos2RosbagDescription={saveRos2RosbagDescriptionHandler}
        onProcessROS2RosbagReq={(ROS2RosBagInfo) =>
          props.onProcessROS2RosbagReq(ROS2RosBagInfo)
        }
      ></ROS2RosbagControlsItem>
    </TableRow>
  );
};

export default ROS2RosbagRowItem;
