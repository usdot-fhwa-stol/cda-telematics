/*
 * Copyright (C) 2019-2022 LEIDOS.
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
 */
import { Checkbox, FormControl, FormControlLabel, InputLabel, MenuItem, Select, TextField } from '@mui/material'
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import React, { useRef, useState } from 'react'
import { findAllEvents } from '../../api/api-events'
import { INVALID_LOCATION_ID, INVALID_LOCATION_ID_STR, INVALID_TESTING_TYPE_ID, INVALID_TESTING_TYPE_ID_STR, LIVE_EVENT } from '../events/EventMetadata'

const TopicsFilterForm = (props) => {
  const [filteredEventList, setFilteredEventList] = useState([]);
  const [eventId, setEventId] = useState('');
  const eventNameRef = useRef();
  //Start time change
  const timestampNow = new Date().getTime();
  //End time change
  const [endTime, setEndTime] = useState(timestampNow)
  const [startTime, setStartTime] = useState(timestampNow)
  //IsLive Event Checked
  const [checked, setChecked] = React.useState(false);
  const [disabledTimePicker, setDisabledTimePicker] = useState(false);
  //Testing Type Change
  const testingTypeRef = React.useRef();
  const [testingTypeId, setTestingTypeId] = useState('');
  //Location Change
  const locationIdRef = React.useRef();
  const [locationId, setLocationId] = React.useState('');

  const handleStartTimeChange = (newStartTime) => {
    setStartTime(newStartTime);
    let filterCriteria = {};
    filterCriteria.start_at = new Date(newStartTime);
    filterCriteria.end_at = new Date(endTime);

    if (locationId !== INVALID_LOCATION_ID_STR && locationId !== INVALID_LOCATION_ID) {
      filterCriteria.location_id = locationId;
    }

    if (testingTypeId !== INVALID_TESTING_TYPE_ID_STR && testingTypeId !== INVALID_TESTING_TYPE_ID) {
      filterCriteria.testing_type_id = testingTypeId;
    }

    let response_data = findAllEvents(filterCriteria);
    response_data.then(json => {
      setFilteredEventList(json);
      setEventId('');
    });
  };

  const handleEndTimeChange = (newEndTime) => {
    setEndTime(newEndTime);

    let filterCriteria = {};
    filterCriteria.start_at = new Date(startTime);
    filterCriteria.end_at = new Date(newEndTime);

    if (locationId !== INVALID_LOCATION_ID_STR && locationId !== INVALID_LOCATION_ID) {
      filterCriteria.location_id = locationId;
    }

    if (testingTypeId !== INVALID_TESTING_TYPE_ID_STR && testingTypeId !== INVALID_TESTING_TYPE_ID) {
      filterCriteria.testing_type_id = testingTypeId;
    }

    let response_data = findAllEvents(filterCriteria);
    response_data.then(json => {
      setFilteredEventList(json);
      setEventId('');
    });
  };

  const onLiveEventChangeHandler = (event) => {
    setChecked(event.target.checked);
    if (event.target.checked) {
      setDisabledTimePicker(true);
    } else {
      setDisabledTimePicker(false);
    }
    let filterCriteria = {};
    if (!event.target.checked) {
      filterCriteria.start_at = new Date(startTime);
      filterCriteria.end_at = new Date(endTime);
    } else {
      filterCriteria.status = LIVE_EVENT.toLowerCase();
    }

    if (locationId !== INVALID_LOCATION_ID_STR && locationId !== INVALID_LOCATION_ID) {
      filterCriteria.location_id = locationId;
    }

    if (testingTypeId !== INVALID_TESTING_TYPE_ID_STR && testingTypeId !== INVALID_TESTING_TYPE_ID) {
      filterCriteria.testing_type_id = testingTypeId;
    }

    let response_data = findAllEvents(filterCriteria);
    response_data.then(json => {
      setFilteredEventList(json);
      setEventId('');
    });
  }

  const handleTestingTypeChange = (event) => {
    setTestingTypeId(event.target.value);
    let filterCriteria = {};
    if (!disabledTimePicker) {
      filterCriteria.start_at = new Date(startTime);
      filterCriteria.end_at = new Date(endTime);
    } else {
      filterCriteria.status = LIVE_EVENT.toLowerCase();
    }

    if (locationId !== INVALID_LOCATION_ID_STR && locationId !== INVALID_LOCATION_ID) {
      filterCriteria.location_id = locationId;
    }

    if (event.target.value !== INVALID_TESTING_TYPE_ID_STR && event.target.value !== INVALID_TESTING_TYPE_ID) {
      filterCriteria.testing_type_id = event.target.value;
    }
    let response_data = findAllEvents(filterCriteria);
    response_data.then(json => {
      setFilteredEventList(json);
      setEventId('');
    });
  }

  const handleLocationChange = (event) => {
    setLocationId(event.target.value);
    let filterCriteria = {};
    if (!disabledTimePicker) {
      filterCriteria.start_at = new Date(startTime);
      filterCriteria.end_at = new Date(endTime);
    } else {
      filterCriteria.status = LIVE_EVENT.toLowerCase();
    }

    if (event.target.value !== INVALID_LOCATION_ID_STR && event.target.value !== INVALID_LOCATION_ID) {
      filterCriteria.location_id = event.target.value;
    }

    if (testingTypeId !== INVALID_TESTING_TYPE_ID_STR && testingTypeId !== INVALID_TESTING_TYPE_ID) {
      filterCriteria.testing_type_id = testingTypeId;
    }
    let response_data = findAllEvents(filterCriteria);
    response_data.then(json => {
      setFilteredEventList(json);
      setEventId('');
    });
  };

  //Event Change
  const handleEventNameChange = (event) => {
    setEventId(event.target.value);
    props.onSelectEvents(filteredEventList.filter(item => item.id === event.target.value));
  };


  return (
    <React.Fragment>
      <FormControl sx={{ margin: 1 }}>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker
            label="Start Date"
            value={startTime}
            disabled={disabledTimePicker}
            onChange={handleStartTimeChange}
            renderInput={(params) =>
              <TextField {...params} />} />
        </LocalizationProvider>
      </FormControl>

      <FormControl sx={{ margin: 1 }}>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker
            label="End Date"
            value={endTime}
            disabled={disabledTimePicker}
            onChange={handleEndTimeChange}
            renderInput={(params) =>
              <TextField {...params} />} />
        </LocalizationProvider>
      </FormControl>

      <FormControlLabel control={
        <Checkbox
          checked={checked}
          style={{ transform: "scale(1.5)" }}
          onChange={onLiveEventChangeHandler} />}
        label="Is Live Event" sx={{ margin: 1 }} />

      <FormControl sx={{ minWidth: 150, margin: 1 }}>
        <InputLabel id="testingTypeLabelId">Testing Type</InputLabel>
        <Select
          labelId="testingTypeLabelId"
          id="testingTypeId"
          value={testingTypeId}
          label="Testing Type"
          inputProps={{
            name: testingTypeRef.current,
            id: testingTypeRef.current
          }}
          onChange={handleTestingTypeChange}>
          {
            props.testingTypeList !== undefined && props.testingTypeList.map(testingType =>
              <MenuItem key={testingType.id} value={testingType.id}>{testingType.name}</MenuItem>)
          }
        </Select>
      </FormControl>

      <FormControl sx={{ minWidth: 150, margin: 1 }}>
        <InputLabel id="locationIdLabelId">Location</InputLabel>
        <Select
          labelId="locationIdLabelId"
          value={locationId}
          inputProps={{
            name: locationIdRef.current,
            id: locationIdRef.current
          }}
          label="Location"
          onChange={handleLocationChange}>
          {
            props.locationList !== undefined && props.locationList.map(location =>
              <MenuItem key={location.id} value={location.id}>{location.facility_name}</MenuItem>)
          }
        </Select>
      </FormControl>

      <FormControl sx={{ minWidth: 150, margin: 1 }} >
        <InputLabel id="assignedEventIdLabelId">Event Name</InputLabel>
        <Select
          labelId="assignedEventIdLabelId"
          value={eventId}
          inputProps={{
            name: eventNameRef.current,
            id: eventNameRef.current
          }}
          defaultValue=''
          label="Event Name"
          onChange={handleEventNameChange}>
          {
            filteredEventList !== undefined && filteredEventList.map(event =>
              <MenuItem key={event.id} value={event.id}>{event.name} ({event.location.facility_name})</MenuItem>)
          }
        </Select>
      </FormControl>
    </React.Fragment>
  )
}

export default TopicsFilterForm