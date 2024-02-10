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
import {
  FormControl,
  InputLabel,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Select,
} from "@mui/material";
import React, { useRef, useState } from "react";
const ROS2ROSBagFilterForm = (props) => {
  const [filteredEventList, setFilteredEventList] = useState([]);
  const [eventId, setEventId] = useState("");
  const eventNameRef = useRef();
  //Start time change
  const timestampNow = new Date().getTime();
  //End time change
  const [endTime, setEndTime] = useState(timestampNow);
  const [startTime, setStartTime] = useState(timestampNow);
  //IsLive Event Checked
  const [checked, setChecked] = React.useState(false);
  const [disabledTimePicker, setDisabledTimePicker] = useState(false);
  //Testing Type Change
  const uploadStatusRef = React.useRef();
  const [uploadStatusId, setuploadStatusId] = useState("");
  //processingStatus Change
  const processingStatusIdRef = React.useRef();
  const [processingStatusId, setprocessingStatusId] = React.useState("");

  const handleuploadStatusChange = (event) => {
    setuploadStatusId(event.target.value);
    let filterCriteria = {};
    if (!disabledTimePicker) {
      filterCriteria.start_at = new Date(startTime);
      filterCriteria.end_at = new Date(endTime);
    }
  };

  const handleprocessingStatusChange = (event) => {
    setprocessingStatusId(event.target.value);
    let filterCriteria = {};
    if (!disabledTimePicker) {
      filterCriteria.start_at = new Date(startTime);
      filterCriteria.end_at = new Date(endTime);
    }
  };

  return (
    <React.Fragment>
      <FormControl sx={{ minWidth: 150, margin: 1 }}>
        <InputLabel id="uploadStatusLabelId" sx={{paddingLeft: '20px'}}>Upload Status</InputLabel>
        <Select
          labelId="uploadStatusLabelId"
          id="uploadStatusId"
          value={uploadStatusId}
          label="Upload Status"
          inputProps={{
            name: uploadStatusRef.current,
            id: uploadStatusRef.current,
          }}
          IconComponent={FilterAltIcon}
          sx={{ 
          "& .MuiSvgIcon-root": {
            left: "5px",
          }}}
          onChange={handleuploadStatusChange}
        >
          {props.uploadStatusList !== undefined &&
            props.uploadStatusList.map((uploadStatus) => (
              <MenuItem key={uploadStatus} value={uploadStatus}>
                {uploadStatus}
              </MenuItem>
            ))}
        </Select>
      </FormControl>

      <FormControl sx={{ minWidth: 200, margin: 1 }}>
        <InputLabel id="processingStatusIdLabelId" sx={{paddingLeft: '20px'}}>
          Processing Status
        </InputLabel>
        <Select
          labelId="processingStatusIdLabelId"
          value={processingStatusId}
          inputProps={{
            name: processingStatusIdRef.current,
            id: processingStatusIdRef.current,
          }}
          IconComponent={FilterAltIcon}
          sx={{ 
          "& .MuiSvgIcon-root": {
            left: "5px",
          }}}
          label="processingStatus"
          onChange={handleprocessingStatusChange}
        >
          {props.processingStatusList !== undefined &&
            props.processingStatusList.map((processingStatus) => (
              <MenuItem key={processingStatus} value={processingStatus}>
                {processingStatus}
              </MenuItem>
            ))}
        </Select>
      </FormControl>
    </React.Fragment>
  );
};

export default ROS2ROSBagFilterForm;
