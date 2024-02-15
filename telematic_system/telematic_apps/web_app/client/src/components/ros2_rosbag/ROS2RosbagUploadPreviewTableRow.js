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
 * Description: Component to display each row of the file upload preview table.
 */
import DeleteIcon from "@mui/icons-material/Delete";
import { TableCell, TableRow, TextField } from "@mui/material";
import React from "react";
import { CustomizedIcon } from "../ui/CustomizedIcon";
import WarningDialog from "../ui/WarningDialog";

const ROS2RosbagUploadPreviewTableRow = (props) => {
  const [description, setDescription] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const closeHandler = () => {
    setOpen(false);
  };

  const openHandler = () => {
    setOpen(true);
  };

  const descriptionChangeHandler = (event) => {
    setDescription(event.target.value);
    props.onUpdateDescription({ ...props.previewFileFields, description: event.target.value });
  };

  return (
    <TableRow>
      <TableCell scope="row" key={`preview-filename-${props.previewFileFields.filesize}-${props.previewFileFields.filename}`}>{props.previewFileFields.filename}</TableCell>
      <TableCell scope="row" key={`preview-description-${props.previewFileFields.filesize}-${props.previewFileFields.filename}`}>
        <TextField key={`preview-description-input-${props.previewFileFields.filesize}-${props.previewFileFields.filename}`}
          inputProps={{ maxLength: 255 }} fullWidth value={description} onChange={descriptionChangeHandler}></TextField>
      </TableCell>
      <TableCell scope="row" key={`preview-filesize-${props.previewFileFields.filesize}-${props.previewFileFields.filename}`}>{props.previewFileFields.filesize}</TableCell>
      <TableCell scope="row" key={`preview-control-${props.previewFileFields.filesize}-${props.previewFileFields.filename}`}>
        <CustomizedIcon title={`Remove file`} onClick={openHandler}> <DeleteIcon /> </CustomizedIcon>
        <WarningDialog title={`Are you sure to remove file: ${props.previewFileFields.filename}`} onConfirm={() => { props.onConfirm(props.previewFileFields.filename); }} onCloseWarning={closeHandler} ></WarningDialog>
      </TableCell>
    </TableRow>
  );
};

export default ROS2RosbagUploadPreviewTableRow;
