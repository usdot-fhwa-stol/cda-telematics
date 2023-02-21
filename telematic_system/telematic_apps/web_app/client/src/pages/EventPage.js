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
import AddCircleIcon from '@mui/icons-material/AddCircle';
import EventIcon from '@mui/icons-material/Event';
import { Button, Grid } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { assignUnit2Event, createEvent, deleteEvent, editEvent, findAllEvents, unAssignUnit2Event } from '../api/api-events';
import { createLocation, findAllLocations } from '../api/api-locations';
import { findAllStates } from '../api/api-states';
import { findAllTestingTypes } from '../api/api-testing-types';
import { createUnit, findAllUnits } from '../api/api-units';
import { AddEventDialog } from '../components/events/AddEventDialog';
import { AddLocationDialog } from '../components/events/AddLocationDialog';
import { AddUnitDialog } from '../components/events/AddUnitDialog';
import EventsFilter from '../components/events/EventsFilter';
import EventTable from '../components/events/EventTable';
import { NOTIFICATION_STATUS } from '../components/topics/TopicMetadata';
import Notification from '../components/ui/Notification';
import { PageAvatar } from '../components/ui/PageAvatar';
import { USER_ROLES } from '../components/users/UserMetadata';
import AuthContext from '../context/auth-context';

const EventPage = React.memo(() => {
  const authCtx = React.useContext(AuthContext)
  //Add Alert notification
  const [alertStatus, setAlertStatus] = useState({});
  const closeAlertHandler = () => {
    setAlertStatus({
      open: false,
      severity: NOTIFICATION_STATUS.SUCCESS,
      title: '',
      message: ''
    });
  }

  //Add Location Dialog
  const [openAddLocationDialog, setOpenAddLocationDialog] = React.useState(false);
  const handleOpenLocation = () => {
    setOpenAddLocationDialog(true);
  };
  const handleCloseLocation = () => {
    setOpenAddLocationDialog(false);
  };

  //Add Event Dialog
  const [openAddEventDialog, setOpenAddEventDialog] = React.useState(false);
  const handleAddEventDialog = () => {
    setOpenAddEventDialog(true);
  };
  const handleCloseAddEventDialog = () => {
    setOpenAddEventDialog(false);
  };

  //Add Unit Dialog
  const [openAddUnitDialog, setOpenAddUnitDialog] = React.useState(false);
  const handleAddUnitDialog = () => {
    setOpenAddUnitDialog(true);
  };
  const handleCloseUnitDialog = () => {
    setOpenAddUnitDialog(false);
  };

  //Store available events
  const [eventInfoList, setEventInfoList] = useState([]);
  //Store available testing types
  const [testingTypeList, setTestingTypeList] = useState([]);
  //Store available states
  const [stateList, setStateList] = useState([]);
  //Store available locations
  const [locationList, setLocationList] = useState([]);
  //Store available units
  const [unitList, setUnitList] = useState([]);

  //Save & Edit an Event
  const onEventSaveHandler = (eventInfo) => {
    if (eventInfo.testing_type === undefined) {
      setAlertStatus({
        open: true,
        severity: NOTIFICATION_STATUS.ERROR,
        title: 'Failure',
        message: 'Failed to add/update an event because testing type is empty!'
      });
    } else if (eventInfo.location === undefined) {
      setAlertStatus({
        open: true,
        severity: NOTIFICATION_STATUS.ERROR,
        title: 'Failure',
        message: 'Failed to add/update an event because testing type is empty!'
      });
    }
    //call api to create event    
    const event = {
      name: eventInfo.name,
      testing_type_id: eventInfo.testing_type.id,
      location_id: eventInfo.location.id,
      start_at: eventInfo.start_at,
      end_at: eventInfo.end_at,
      description: eventInfo.description,
      status: eventInfo.status
    }
    let response_data;
    if (eventInfo.id !== undefined) {
      event.id = eventInfo.id;
      response_data = editEvent(event);
    } else {
      response_data = createEvent(event);
    }
    response_data.then(event_json => {
      if (event_json !== undefined) {
        eventInfo.id = event_json.id;
        setEventInfoList([...eventInfoList.filter(item => item.id !== eventInfo.id), eventInfo]);
        setAlertStatus({
          open: true,
          severity: NOTIFICATION_STATUS.SUCCESS,
          title: NOTIFICATION_STATUS.SUCCESS.toLocaleUpperCase(),
          message: 'Successfully add/update an event!'
        });
        setOpenAddEventDialog(false);
      } else {
        setAlertStatus({
          open: true,
          severity: NOTIFICATION_STATUS.ERROR,
          title: 'Failure',
          message: 'Failed to add/update an event!'
        });
      }
    });
  }

  //Delete an Event
  const onDeleteEventHandler = (id) => {
    //Call api to delete an event
    const response_data = deleteEvent(id);
    response_data.then(json => {
      if (json !== undefined) {
        setEventInfoList(eventInfoList.filter(item => item.id !== id));
        setAlertStatus({
          open: true,
          severity: NOTIFICATION_STATUS.SUCCESS,
          title: NOTIFICATION_STATUS.SUCCESS.toLocaleUpperCase(),
          message: 'Successfully delete an event!'
        });
      } else {
        setAlertStatus({
          open: true,
          severity: NOTIFICATION_STATUS.ERROR,
          title: 'Failure',
          message: 'Failed to delete an event!'
        });
      }
    });
  }

  //Assign a unit to an Event
  const onAssignUnitHandler = (assign_event_unit) => {
    const response_data = assignUnit2Event(assign_event_unit);
    response_data.then(json => {
      if (json !== undefined) {
        const existingItem = eventInfoList.filter(event => event.id === assign_event_unit.event_id);
        if (existingItem[0].event_units === undefined) {
          existingItem[0].event_units = [];
        }
        existingItem[0].event_units = [...existingItem[0].event_units.filter(event_unit => event_unit.unitId !== assign_event_unit.event_unit.unitId), assign_event_unit.event_unit];
        existingItem[0].units = [...existingItem[0].units.filter(unit => unit.id !== assign_event_unit.unit.id), assign_event_unit.unit];
        setEventInfoList([...eventInfoList.filter(event => event.id !== assign_event_unit.event_id), ...existingItem]);
        setAlertStatus({
          open: true,
          severity: NOTIFICATION_STATUS.SUCCESS,
          title: NOTIFICATION_STATUS.SUCCESS.toLocaleUpperCase(),
          message: 'Successfully assign a unit to event (' + existingItem[0].name + ')!'
        });
      } else {
        setAlertStatus({
          open: true,
          severity: NOTIFICATION_STATUS.ERROR,
          title: NOTIFICATION_STATUS.ERROR.toLocaleUpperCase(),
          message: 'Failed to assign a unit to an event!'
        });
      }
    })
  }

  //Unassign a unit to an event
  const onConfirmUnassignUnitHandler = (event_unit) => {
    const response_data = unAssignUnit2Event(event_unit);
    response_data.then(json => {
      if (json !== undefined) {
        const existingItem = eventInfoList.filter(event => event.id === event_unit.event_id);
        existingItem[0].units = [...existingItem[0].units.filter(unit => unit.id !== event_unit.unit.id)];
        setEventInfoList([...eventInfoList.filter(event => event.id !== event_unit.event_id), ...existingItem]);
        setAlertStatus({
          open: true,
          severity: NOTIFICATION_STATUS.SUCCESS,
          title: NOTIFICATION_STATUS.SUCCESS.toLocaleUpperCase(),
          message: 'Successfully unassign a unit to event (' + existingItem[0].name + ')!'
        });
      } else {
        setAlertStatus({
          open: true,
          severity: NOTIFICATION_STATUS.ERROR,
          title: NOTIFICATION_STATUS.ERROR.toLocaleUpperCase(),
          message: 'Failed to unassign a unit to an event!'
        });
      }
    });
  }

  const onSaveLocationHandler = (location) => {
    //call api to create a location
    const response_data = createLocation(location);
    response_data.then(location_json => {
      if (location_json !== undefined) {
        location.id = location_json.id;
        setLocationList([...locationList, location]);
        setAlertStatus({
          open: true,
          severity: NOTIFICATION_STATUS.SUCCESS,
          title: NOTIFICATION_STATUS.SUCCESS.toLocaleUpperCase(),
          message: 'Successfully add a location!'
        });
        setOpenAddLocationDialog(false);
      } else {
        setAlertStatus({
          open: true,
          severity: NOTIFICATION_STATUS.ERROR,
          title: NOTIFICATION_STATUS.ERROR.toLocaleUpperCase(),
          message: 'Failed to add a location!'
        });
      }
    });
  };

  const onSaveUnitHandler = (unit) => {
    //call api to create a unit
    const response_data = createUnit(unit);
    response_data.then(unit_json => {
      if (unit_json !== undefined) {
        unit.id = unit_json.id;
        setUnitList([...unitList, unit]);
        setAlertStatus({
          open: true,
          severity: NOTIFICATION_STATUS.SUCCESS,
          title: NOTIFICATION_STATUS.SUCCESS.toLocaleUpperCase(),
          message: 'Successfully add a unit!'
        });
        setOpenAddUnitDialog(false);
      } else {
        setAlertStatus({
          open: true,
          severity: NOTIFICATION_STATUS.ERROR,
          title: NOTIFICATION_STATUS.ERROR.toLocaleUpperCase(),
          message: 'Failed to add a unit!'
        });
      }
    });
  }

  //Filter Events
  const onFilterEventsHandler = (filteredEvents) => {
    setEventInfoList(filteredEvents);
  }

  useEffect(() => {
    const res_loc_data = findAllLocations();
    res_loc_data.then(json => {
      if (json !== undefined) {
        let locs = [];
        json.forEach(loc => {
          locs.push(loc);
        });
        setLocationList(locs);
      }
    });

    const res_unit_data = findAllUnits();
    res_unit_data.then(json => {
      if (json !== undefined) {
        let units = [];
        json.forEach(unit => {
          units.push(unit);
        });
        setUnitList(units);
      }
    });

    const res_event_data = findAllEvents({});
    res_event_data.then(json => {
      if (json !== undefined) {
        let events = [];
        json.forEach(event => {
          events.push(event);
        });
        setEventInfoList(events);
      }
    });

    const res_testing_types_data = findAllTestingTypes({});
    res_testing_types_data.then(json => {
      if (json !== undefined) {
        let testing_types = [];
        json.forEach(tt => {
          testing_types.push(tt);
        });
        setTestingTypeList(testing_types);
      }
    });

    const res_states_data = findAllStates();
    res_states_data.then(json => {
      if (json !== undefined) {
        let states = [];
        json.forEach(state => {
          states.push(state);
        });
        setStateList(states);
      }
    });
  }, []);

  return (
    <React.Fragment>
      <Notification open={alertStatus.open}
        closeAlert={closeAlertHandler}
        severity={alertStatus.severity}
        title={alertStatus.title}
        message={alertStatus.message} />
      <Grid container rowSpacing={1} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
        <PageAvatar icon={<EventIcon />} title="Event Management" />
        <Grid item xs={4}></Grid>
        {
          authCtx.role !== USER_ROLES.VIEWER &&  authCtx.role !== USER_ROLES.VIEWER && authCtx.role !== undefined && authCtx.role !== null && authCtx.role !== "" &&
          <Grid item xs={12} justifyContent="flex-end" display="flex">
            <Button variant="outlined" onClick={handleAddUnitDialog} sx={{ marginRight: 2 }} startIcon={<AddCircleIcon />}>
              Add Unit
            </Button>
            <AddUnitDialog close={!openAddUnitDialog} open={openAddUnitDialog} onSave={onSaveUnitHandler} onCloseAddUnitDialog={handleCloseUnitDialog} />
            <Button variant="outlined" onClick={handleOpenLocation} sx={{ marginRight: 2 }} startIcon={<AddCircleIcon />} >
              Add Location
            </Button>
            <AddLocationDialog stateList={stateList} close={!openAddLocationDialog} open={openAddLocationDialog} onSaveLocation={onSaveLocationHandler} onCloseAddLocationDialog={handleCloseLocation} />
            <Button variant="outlined" onClick={handleAddEventDialog} startIcon={<AddCircleIcon />} fullWidth={false} >
              Add Event
            </Button>
            <AddEventDialog title="Add Event" locationList={locationList} testingTypeList={testingTypeList} onEventSaveHandler={onEventSaveHandler} close={!openAddEventDialog} open={openAddEventDialog} onCloseEventDialog={handleCloseAddEventDialog} />
          </Grid>
        }

        <EventsFilter eventInfoList={eventInfoList} onFilterEvents={onFilterEventsHandler} testingTypeList={testingTypeList} locationList={locationList} />
        <Grid container item xs={12}>
          <EventTable eventInfoList={eventInfoList} unitList={unitList} locationList={locationList} testingTypeList={testingTypeList} onEventSaveHandler={onEventSaveHandler} onDeleteEvent={onDeleteEventHandler} onAssignUnitHandler={onAssignUnitHandler} onConfirmUnassignUnitHandler={onConfirmUnassignUnitHandler} />
        </Grid>
      </Grid>
    </React.Fragment >
  )
});

export default EventPage