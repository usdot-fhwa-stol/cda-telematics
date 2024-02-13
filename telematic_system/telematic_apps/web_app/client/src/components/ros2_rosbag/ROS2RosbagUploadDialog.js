import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { CustomizedButton } from "../ui/CustomizedButton";
import { CustomizedOutlinedButton } from "../ui/CustomizedOutlinedButton";
import ROS2RosbagUploadPreviewTable from "./ROS2RosbagUploadPreviewTable";

const ROS2RosbagUploadDialog = (props) => {
  const [selectedfilesForm, setSelectedFilesForm] = useState(new FormData());

  const closeHandler = (event) => {
    setSelectedFilesForm(new FormData());
    props.onClose();
  };
  const filesizes = (bytes, decimals = 2) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
  };

  const BrowseFileChange = (event) => {
    let files = [];
    let filesInfo = [];
    for (let file of event.target.files) {
      files.push(file);
      filesInfo.push({
        filename: file.name,
        filetype: file.type,
        datetime: file.lastModifiedDate.toLocaleString(),
        filesize: filesizes(file.size),
      });
    }
    let formData = new FormData();
    formData["files"] = files;
    formData["fields"] = filesInfo;
    setSelectedFilesForm(formData);
  };
  return (
    <Dialog open={props.open} onClose={closeHandler}>
      <DialogTitle sx={{ fontWeight: "bolder" }}>{props.title}</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Upload ROS2 Rosbag files and send process file requests.
        </DialogContentText>

        <FormControl fullWidth>
          <div
            style={{
              border: "1px dashed #b6bed1",
              backgroundColor: "#f0f2f7",
              borderRadius: "4px",
              minHeight: "100px",
              position: "relative",
              overflow: "hidden",
              padding: "15px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <input
              type="file"
              id="ROS2-Rosbag-upload"
              className="ROS2-Rosbag-upload-input"
              onChange={BrowseFileChange}
              multiple
              style={{
                position: "absolute",
                left: 0,
                bottom: 0,
                opacity: 0,
                width: "100%",
                height: "100%",
                cursor: "pointer",
              }}
            />
            <span style={{ textDecoration: "underline", color: "#8194aa" }}>
              Choose Files
            </span>
          </div>
        </FormControl>

        <FormControl fullWidth>
          <ROS2RosbagUploadPreviewTable
            previewFiles={selectedfilesForm}
          ></ROS2RosbagUploadPreviewTable>
        </FormControl>
      </DialogContent>
      <DialogActions>
        <CustomizedOutlinedButton onClick={closeHandler}>
          Cancel
        </CustomizedOutlinedButton>
        <CustomizedButton onClick={() => {}}>Process</CustomizedButton>
      </DialogActions>
    </Dialog>
  );
};

export default ROS2RosbagUploadDialog;
