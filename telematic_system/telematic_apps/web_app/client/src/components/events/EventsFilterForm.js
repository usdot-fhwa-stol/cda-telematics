import { Button, Checkbox, FormControl, FormControlLabel, InputLabel, MenuItem, Select, TextField } from '@mui/material'
import { DateTimePicker, LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import React, { useState } from 'react'
import { findAllEvents } from '../../api/api-events'
import { INVALID_EVENT_NAME_ID_STR, INVALID_LOCATION_ID, INVALID_LOCATION_ID_STR, INVALID_TESTING_TYPE_ID, INVALID_TESTING_TYPE_ID_STR, LIVE_EVENT } from './EventMetadata'

const EventsFilterForm = (props) => {
  const timestampNow = new Date().getTime();
  const [startTime, setStartTime] = useState(timestampNow)
  const handleStartTimeChange = (newStartTime) => {
    setStartTime(newStartTime);
  };

  const [endTime, setEndTime] = useState(timestampNow)
  const handleEndTimeChange = (newEndTime) => {
    setEndTime(newEndTime);
  };

  const [checked, setChecked] = React.useState(false);
  const [disabledTimePicker, setDsiabledTimePicker] = useState(false);
  const onLiveEventChangeHandler = (event) => {
    setChecked(event.target.checked);
    if (event.target.checked) {
      setDsiabledTimePicker(true);
    } else {
      setDsiabledTimePicker(false);
    }
  }

  const testingTypeRef = React.useRef();
  const [testingTypeId, setTestingTypeId] = useState('');
  const handleTestingTypeChange = (event) => {
    setTestingTypeId(event.target.value);
  }

  const locationIdRef = React.useRef();
  const [locationId, setLocationId] = React.useState('');
  const handleLocationChange = (event) => {
    setLocationId(event.target.value);
  };

  const [eventName, setEventName] = useState('');
  const handleEventNameChange = (event) => {
    setEventName(event.target.value);
  };

  const onFilterEventsHandler = () => {
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

    if (testingTypeId !== INVALID_TESTING_TYPE_ID_STR && testingTypeId !== INVALID_TESTING_TYPE_ID) {
      filterCriteria.testing_type_id = testingTypeId;
    }

    if (eventName !== INVALID_EVENT_NAME_ID_STR) {
      filterCriteria.name = eventName;
    }

    let response_data = findAllEvents(filterCriteria);
    response_data.then(json => {
      props.onFilterEvents(json);
    });
  }

  return (
    <React.Fragment>
      <FormControl sx={{ margin: 1 }}>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DateTimePicker
            label="Start Datetime"
            value={startTime}
            disabled={disabledTimePicker}
            onChange={handleStartTimeChange}
            renderInput={(params) =>
              <TextField {...params} />} />
        </LocalizationProvider>
      </FormControl>

      <FormControl sx={{ margin: 1 }}>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DateTimePicker
            label="End Datetime"
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
        <InputLabel id="locationLabelId">Location</InputLabel>
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

      <FormControl sx={{ margin: 1 }}>
        <TextField
          autoFocus
          margin="dense"
          id="name"
          label="Event Name*"
          variant="standard"
          value={eventName}
          onChange={handleEventNameChange} />
      </FormControl>

      <FormControl sx={{ margin: 1 }}>
        <Button variant="outlined" size='large' onClick={onFilterEventsHandler}>Search</Button>
      </FormControl>
    </React.Fragment>
  )
}

export default EventsFilterForm