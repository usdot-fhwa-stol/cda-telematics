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
 * Description:
 * Filter the list of ROS2 rosbag files.
 */
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import SearchIcon from "@mui/icons-material/Search";
import {
  FormControl,
  Grid,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";
import React, { memo, useContext, useEffect, useState } from "react";
import ROS2RosbagContext from "../../context/ros2-rosbag-context";
import { CustomizedButton } from "../ui/CustomizedButton";
import { CustomizedRefreshButton } from "../ui/CustomizedRefreshButton";
import ROS2RosbagUploadDialog from "./ROS2RosbagUploadDialog";
import AuthContext from "../../context/auth-context";
import { USER_ROLES } from "../users/UserMetadata";

const ROS2ROSBagFilterForm = memo((props) => {
  const authCtx = React.useContext(AuthContext);
  const ROS2RosbagCtx = useContext(ROS2RosbagContext);
  const uploadStatusRef = React.useRef();
  const [uploadStatusStr, setUploadStatusStr] = useState("");
  const processingStatusStrRef = React.useRef();
  const [processingStatusStr, setProcessingStatusStr] = React.useState("");
  const [inputText, setInputText] = React.useState("");
  const [open, setOpen] = React.useState(false);

  const handleUploadStatusChange = (event) => {
    setUploadStatusStr(event.target.value);
    ROS2RosbagCtx.updateUploadStatusFilter(event.target.value);
  };

  const handleProcessingStatusChange = (event) => {
    setProcessingStatusStr(event.target.value);
    ROS2RosbagCtx.updateProcessStatusFilter(event.target.value);
  };

  const handleInputTextChange = (event) => {
    setInputText(event.target.value);
    ROS2RosbagCtx.updateInputTextFilter(event.target.value);
  };

  const filterROS2RosbagListHandler = () => {
    props.filterROS2RosbagList();
  };

  const refreshHandler = () => {
    setProcessingStatusStr("");
    setUploadStatusStr("");
    setInputText("");
    ROS2RosbagCtx.clear();
    props.onRefresh();
  };

  const openHandler = () => {
    setOpen(true);
  };
  const closeHandler = () => {
    setOpen(false);
  };

  useEffect(() => {
    filterROS2RosbagListHandler();
  }, [ROS2RosbagCtx]);

  return (
    <Grid container>
      <Grid xs={10} item>
        <FormControl sx={{ minWidth: 450, margin: 1 }}>
          <TextField fullWidth value={inputText} label="Search by ROS2 Rosbag name or description" InputProps={{ startAdornment: (<InputAdornment position="start"> <SearchIcon /></InputAdornment>) }} onChange={handleInputTextChange} id="searchROS2rRosbagLabelId"  ></TextField>
        </FormControl>

        <FormControl sx={{ minWidth: 200, margin: 1 }}>
          <InputLabel id="uploadStatusLabelId" sx={{ paddingLeft: "20px" }}>Upload Status</InputLabel>
          <Select labelId="uploadStatusLabelId" id="uploadStatusStr" value={uploadStatusStr} label="Upload Status" inputProps={{ name: uploadStatusRef.current, id: uploadStatusRef.current }} IconComponent={FilterAltIcon} sx={{ paddingLeft: "20px", "& .MuiSvgIcon-root": { left: "5px" } }} onChange={handleUploadStatusChange}>
            {
              props.uploadStatusList !== undefined && props.uploadStatusList.map((uploadStatus) => (
                <MenuItem key={uploadStatus} value={uploadStatus}>  {uploadStatus}  </MenuItem>
              ))}
          </Select>
        </FormControl>

        <FormControl sx={{ minWidth: 200, margin: 1 }}>
          <InputLabel id="processingStatusStrLabelId" sx={{ paddingLeft: "20px" }}>Processing Status</InputLabel>
          <Select labelId="processingStatusStrLabelId" value={processingStatusStr} inputProps={{ name: processingStatusStrRef.current, id: processingStatusStrRef.current }} IconComponent={FilterAltIcon} sx={{ paddingLeft: "20px", "& .MuiSvgIcon-root": { left: "5px" } }} label="processingStatus"
            onChange={handleProcessingStatusChange} >
            {
              props.processingStatusList !== undefined && props.processingStatusList.map((processingStatus) => (
                <MenuItem key={processingStatus} value={processingStatus}> {processingStatus}   </MenuItem>
              ))}
          </Select>
        </FormControl>
        
        <FormControl sx={{ paddingTop: "10px" }}>
          <CustomizedRefreshButton title="Reset filters and refresh ROS2 Rosbags table" onClick={refreshHandler} ></CustomizedRefreshButton>
        </FormControl>
      </Grid>
      {
        authCtx.role !== USER_ROLES.VIEWER && authCtx.role !== undefined && authCtx.role !== null && authCtx.role !== "" && (
          <Grid item xs={2} sx={{ textAlign: "end" }}>
            <ROS2RosbagUploadDialog open={open} onClose={closeHandler} onUpload={(formdata) => props.onUpload(formdata)} title="Browse ROS2 Rosbag" />
            <FormControl sx={{ minWidth: 200, margin: 1 }}>
              <CustomizedButton title="Upload ROS2 Rosbag" data-testid="uploadROS2RosbagBtn" onClick={openHandler} > Browse ROS2 Rosbag </CustomizedButton>
            </FormControl>
          </Grid>
        )}
    </Grid>
  );
});

export default ROS2ROSBagFilterForm;
