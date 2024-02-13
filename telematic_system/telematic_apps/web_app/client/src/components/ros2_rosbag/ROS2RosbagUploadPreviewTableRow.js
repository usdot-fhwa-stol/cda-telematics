import DeleteIcon from "@mui/icons-material/Delete";
import { TableCell, TableRow } from "@mui/material";
import React from "react";
import { CustomizedIcon } from "../ui/CustomizedIcon";
import WarningDialog from "../ui/WarningDialog";
const ROS2RosbagUploadPreviewTableRow = (props) => {
  const [open, setOpen] = React.useState(false);
  const closeHandler = () => {
    setOpen(false);
  };
  const openHandler = () => {
    setOpen(true);
  };
  const confirmHandler = () => {
    alert("confimred");
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
          onConfirm={confirmHandler}
          onCloseWarning={closeHandler}
        ></WarningDialog>
      </TableCell>
    </TableRow>
  );
};

export default ROS2RosbagUploadPreviewTableRow;
