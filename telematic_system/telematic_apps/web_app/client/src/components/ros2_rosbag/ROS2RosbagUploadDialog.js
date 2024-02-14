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
 * Description: A dialog to choose files to be uploaded, and display a preview of the chosen files and allow users to edit description before the file upload.
 */
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
} from "@mui/material";
import React, { useState } from "react";
import { CustomizedButton } from "../ui/CustomizedButton";
import { CustomizedOutlinedButton } from "../ui/CustomizedOutlinedButton";
import ROS2RosbagUploadPreviewTable from "./ROS2RosbagUploadPreviewTable";
import { calFilesizes } from "./ROS2RosBagUtils";
import { ACCEPT_FILE_EXTENSIONS } from "./ROS2RosbagMetadata";

const ROS2RosbagUploadDialog = (props) => {
  const [selectedfilesForm, setSelectedFilesForm] = useState(new FormData());

  const closeHandler = (event) => {
    setSelectedFilesForm(new FormData());
    props.onClose();
  };

  const BrowseFilesChange = (event) => {
    let files = [];
    let filesInfo = [];
    for (let file of event.target.files) {
      files.push(file);
      filesInfo.push({
        filename: file.name,
        filetype: file.type,
        datetime: file.lastModifiedDate.toLocaleString(),
        filesize: calFilesizes(file.size),
        description: "",
      });
    }
    let formData = new FormData();
    formData["files"] = files;
    filesInfo.sort((a, b) => a.filename.localeCompare(b.filename));
    formData["fields"] = filesInfo;
    setSelectedFilesForm(formData);
  };

  const confirmRemovalHandler = (filename) => {
    let newForm = new FormData();
    newForm["files"] = selectedfilesForm["files"].filter(
      (item) => item.name !== filename
    );
    newForm["fields"] = selectedfilesForm["fields"].filter(
      (item) => item.filename !== filename
    );
    setSelectedFilesForm(newForm);
  };

  const updateDescriptionHandler = (updatedROS2RosbagInfo) => {
    let newForm = new FormData();
    newForm["files"] = selectedfilesForm["files"];
    newForm["fields"] = [
      ...selectedfilesForm["fields"].filter(
        (item) => item.filename !== updatedROS2RosbagInfo.filename
      ),
      updatedROS2RosbagInfo,
    ];
    newForm["fields"].sort((a, b) => a.filename.localeCompare(b.filename));
    setSelectedFilesForm(newForm);
  };

  const uploadAndProcessROS2RosbagsHandler = () => {
    props.onUpload(selectedfilesForm);
    closeHandler();
  }

  return (
    <Dialog open={props.open} onClose={closeHandler} maxWidth="md">
      <DialogTitle sx={{ fontWeight: "bolder" }}>{props.title}</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Upload ROS2 Rosbag files and send processing file requests. Accepted
          file extensions: <b> {ACCEPT_FILE_EXTENSIONS}</b>
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
              onChange={BrowseFilesChange}
              title="ROS2-Rosbag-upload-title"
              multiple
              accept={ACCEPT_FILE_EXTENSIONS}
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
            onConfirm={confirmRemovalHandler}
            onUpdateDescription={updateDescriptionHandler}
          ></ROS2RosbagUploadPreviewTable>
        </FormControl>
      </DialogContent>
      <DialogActions>
        <CustomizedOutlinedButton onClick={closeHandler}>
          Cancel
        </CustomizedOutlinedButton>
        <CustomizedButton onClick={uploadAndProcessROS2RosbagsHandler}>Process</CustomizedButton>
      </DialogActions>
    </Dialog>
  );
};

export default ROS2RosbagUploadDialog;
