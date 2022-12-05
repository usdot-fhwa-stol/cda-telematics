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
import StreamIcon from '@mui/icons-material/Stream';
import { Button, FormControl, Grid, Tooltip } from '@mui/material';
import React, { useContext, useEffect, useState } from 'react';
import { findAllEvents } from '../api/api-events';
import { findAllLocations } from '../api/api-locations';
import { findAllTestingTypes } from '../api/api-testing-types';
import { requestSelectedLiveUnitsTopics } from '../api/api-topics';
import { VALID_UNIT_TYPES } from '../components/events/EventMetadata';
import InfrastructureTopicList from '../components/topics/InfrastructureTopicList';
import { NOTIFICATION_STATUS } from '../components/topics/TopicMetadata';
import TopicsFilter from '../components/topics/TopicsFilter';
import VehicleTopicList from '../components/topics/VehicleTopicList';
import Notification from '../components/ui/Notification';
import { PageAvatar } from '../components/ui/PageAvatar';
import TopicContext from '../context/topic-context';

const TopicPage = React.memo(() => {
  const TopicCtx = useContext(TopicContext);
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
  const [eventInfoList, setEventInfoList] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [infrastructures, setInfrastructures] = useState([]);
  const [testingTypeList, setTestingTypeList] = useState([]);
  const [locationList, setLocationList] = useState([]);

  //Filter Events
  const onSelectEventsHandler = (filteredEventList) => {
    //Assuming that allowing to select one event from the dropdown at a time
    if (filteredEventList.length !== 0) {
      let filteredEvent = filteredEventList[0];
      const units = filteredEvent.units !== undefined ? filteredEvent.units : [];
      if (units.length > 0) {
        let filteredVehicles = [];
        let filteredInfrastructures = [];
        units.forEach(element => {
          element.event_id = filteredEvent.id;
          element.event_name = filteredEvent.name;
          if (element.unit_type !== undefined &&
            (element.unit_type.toLocaleLowerCase() === VALID_UNIT_TYPES.CAV_VEHICLE.toLocaleLowerCase()
              || element.unit_type.toLocaleLowerCase() === VALID_UNIT_TYPES.NON_CAV_VEHICLE.toLocaleLowerCase())) {
            filteredVehicles = [...filteredVehicles, element];
          } else if (element.unit_type !== undefined &&
            (element.unit_type.toLocaleLowerCase() === VALID_UNIT_TYPES.CLOUD_INFRASTRUCTURE.toLocaleLowerCase()
              || element.unit_type.toLocaleLowerCase() === VALID_UNIT_TYPES.STREETS_INFRASTRUCTURE.toLocaleLowerCase()
              || element.unit_type.toLocaleLowerCase() === VALID_UNIT_TYPES.V2XHUB_INFRASTRUCTURE.toLocaleLowerCase())) {
            filteredInfrastructures = [...filteredInfrastructures, element];
          }
          else {
            console.error("Invalid unit type in units for event = ", filteredEvent.name);
          }
        });
        setVehicles(filteredVehicles);
        setInfrastructures(filteredInfrastructures);
      }

      //clear TopicContext for all seleted event and unit topics
      TopicCtx.clear();
    }
  }


  //Send topic request to the server
  const confirmSelectedTopicHandler = () => {
    const seletedUnitTopicListToConfirm = TopicCtx.selected_unit_topics_list;
    if (seletedUnitTopicListToConfirm.length === 0) {
      setAlertStatus({
        open: true,
        severity: NOTIFICATION_STATUS.WARNING,
        title: NOTIFICATION_STATUS.WARNING,
        messageList: ["No topics selected."]
      });
      return;
    }
    const response_data = requestSelectedLiveUnitsTopics(seletedUnitTopicListToConfirm);
    let messageList = [];
    let num_failed = 0;
    let num_success = 0;
    response_data.then(json => {
      if (json !== undefined) {
        json.forEach(item => {
          if (item.data !== undefined) {
            messageList.push(item.data);
            num_success += 1;
          } else if (item.errCode !== undefined) {
            messageList.push(item.errMsg);
            num_failed += 1;
          }
        });
      }

      //Notification
      let severity = num_failed === 0 ? NOTIFICATION_STATUS.SUCCESS : (num_success === 0 ? NOTIFICATION_STATUS.ERROR : NOTIFICATION_STATUS.WARNING);
      setAlertStatus({
        open: true,
        severity: severity,
        title: severity,
        messageList: messageList
      });
    });
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

  }, []);

  return (
    <React.Fragment>
      <Notification open={alertStatus.open}
        closeAlert={closeAlertHandler}
        severity={alertStatus.severity}
        title={alertStatus.title}
        messageList={alertStatus.messageList} />
      <Grid container columnSpacing={2} rowSpacing={1}>
        <PageAvatar icon={<StreamIcon />} title="Topic Management" />
        <Grid item xs={4}></Grid>
        <TopicsFilter eventInfoList={eventInfoList} onSelectEvents={onSelectEventsHandler} testingTypeList={testingTypeList} locationList={locationList} />
        <VehicleTopicList availableUnits={vehicles} />
        <InfrastructureTopicList availableUnits={infrastructures} />
        <Grid item xs={12} sx={{ textAlign: 'center' }}>
          <FormControl>
            <Tooltip title="Send a request with a list of selected topics, and request telematic server to stream data for the selected topics." placement="top" arrow>
              <Button variant="outlined" onClick={confirmSelectedTopicHandler}>Confirm Selected Topics</Button>
            </Tooltip>
          </FormControl>
        </Grid>
      </Grid>
    </React.Fragment>
  )
});

export default TopicPage