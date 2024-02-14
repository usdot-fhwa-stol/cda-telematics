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
    props.onUpdateDescription({
      ...props.previewFileFields,
      description: event.target.value,
    });
  };

  return (
    <TableRow>
      <TableCell
        scope="row"
        key={`preview-file-fields-filename-${props.previewFileFields.filesize}-${props.previewFileFields.filename}`}
      >
        {props.previewFileFields.filename}
      </TableCell>
      <TableCell
        scope="row"
        key={`preview-file-fields-description-${props.previewFileFields.filesize}-${props.previewFileFields.filename}`}
      >
        <TextField
          key={`preview-file-fields-description-input-${props.previewFileFields.filesize}-${props.previewFileFields.filename}`}
          inputProps={{
            maxLength: 255,
          }}
          fullWidth
          value={description}
          onChange={descriptionChangeHandler}
        ></TextField>
      </TableCell>
      <TableCell
        scope="row"
        key={`preview-file-fields-filesize-${props.previewFileFields.filesize}-${props.previewFileFields.filename}`}
      >
        {props.previewFileFields.filesize}
      </TableCell>
      <TableCell
        scope="row"
        key={`preview-file-fields-control-${props.previewFileFields.filesize}-${props.previewFileFields.filename}`}
      >
        <CustomizedIcon title={`Remove file`} onClick={openHandler}>
          <DeleteIcon />
        </CustomizedIcon>
        <WarningDialog
          title={`Are you sure to remove file: ${props.previewFileFields.filename}`}
          open={open}
          onConfirm={() => {
            props.onConfirm(props.previewFileFields.filename);
          }}
          onCloseWarning={closeHandler}
        ></WarningDialog>
      </TableCell>
    </TableRow>
  );
};

export default ROS2RosbagUploadPreviewTableRow;
