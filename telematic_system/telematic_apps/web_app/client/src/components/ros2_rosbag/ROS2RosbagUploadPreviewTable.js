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
    <Table size="small" aria-label="user-role-table">
      <TableHead>
        <TableRow>
          <TableCell
            key={`edit-user-role-org-name`}
            sx={{ fontWeight: "bolder" }}
          >
            File Name
          </TableCell>
          <TableCell
            key={`edit-user-role-user-role`}
            sx={{ fontWeight: "bolder" }}
          >
            Description
          </TableCell>
          <TableCell
            key={`edit-user-role-control`}
            sx={{ fontWeight: "bolder" }}
          >
            Controls
          </TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {props.previewFiles !== undefined && props.previewFiles["fields"] !== undefined  &&
          props.previewFiles["fields"].map((previewFileFields) => (
            <ROS2RosbagUploadPreviewTableRow
              key={`user-org-role-table-row-${previewFileFields.filename}`}
              previewFileFields={previewFileFields}
            />
          ))}
      </TableBody>
    </Table>
  );
};

export default ROS2RosbagUploadPreviewTable;
