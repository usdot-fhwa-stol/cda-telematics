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
 * Description: A table to display the preview of the files to be uploaded.
 */
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
    <Table size="large" aria-label="preview-table">
      <TableHead>
        <TableRow>
          <TableCell key={`preview-filename`} sx={{ fontWeight: "bolder" }}>File Name</TableCell>
          <TableCell key={`preview-desc`} sx={{ fontWeight: "bolder" }}>Description</TableCell>
          <TableCell key={`preview-filesize`} sx={{ fontWeight: "bolder" }}>File Size</TableCell>
          <TableCell key={`preview-control`} sx={{ fontWeight: "bolder" }}>Controls</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {props.previewFiles !== undefined && props.previewFiles["fields"] !== undefined && props.previewFiles["fields"].map((previewFileFields) => (
          <ROS2RosbagUploadPreviewTableRow key={`user-org-role-table-row-${previewFileFields.filename}`} previewFileFields={previewFileFields} onConfirm={(filename => props.onConfirm(filename))} onUpdateDescription={(updatedROS2RosbagInfo => props.onUpdateDescription(updatedROS2RosbagInfo))} />
        ))}
      </TableBody>
    </Table>
  );
};

export default ROS2RosbagUploadPreviewTable;
