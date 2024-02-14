import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@mui/material";
import ROS2RosbagUploadPreviewTableRow from "./ROS2RosbagUploadPreviewTableRow";

const ROS2RosbagUploadPreviewTable = (props) => {
  return (
    <Table size="large" aria-label="ros2-rosbag-preview-table">
      <TableHead>
        <TableRow>
          <TableCell
            key={`ros2-rosbag-preview-filename`}
            sx={{ fontWeight: "bolder" }}
          >
            File Name
          </TableCell>
          <TableCell
            key={`ros2-rosbag-preview-desc`}
            sx={{ fontWeight: "bolder" }}
          >
            Description
          </TableCell>
          <TableCell
            key={`ros2-rosbag-preview-filesize`}
            sx={{ fontWeight: "bolder" }}
          >
            File Size
          </TableCell>
          <TableCell
            key={`ros2-rosbag-preview-control`}
            sx={{ fontWeight: "bolder" }}
          >
            Controls
          </TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {props.previewFiles !== undefined && props.previewFiles["fields"] !== undefined &&
          props.previewFiles["fields"].map((previewFileFields) => (
            <ROS2RosbagUploadPreviewTableRow
              key={`user-org-role-table-row-${previewFileFields.filename}`}
              previewFileFields={previewFileFields}
              onConfirm={(filename => props.onConfirm(filename))}
              onUpdateDescription={(updatedROS2RosbagInfo => props.onUpdateDescription(updatedROS2RosbagInfo))}
            />
          ))}
      </TableBody>
    </Table>
  );
};

export default ROS2RosbagUploadPreviewTable;
