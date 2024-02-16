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
 */
import { Card, CardContent, CardHeader, Grid } from '@mui/material'
import { Box } from '@mui/system'
import React from 'react'
import EventsFilterForm from './EventsFilterForm'

const EventsFilter = (props) => {
  const onFilterEventsHandler = (filteredEventIds) => {
    props.onFilterEvents(filteredEventIds);
  }
  return (
    <React.Fragment>
      <Grid container item xs={12} columnSpacing={3} sx={{ margin: '0px 3px' }}>
        <Box sx={{ width: '100%' }}>
          <Card>
            <CardHeader sx={{ color: "#000", backgroundColor: "#eee", padding: 1 }} title="Filter Events" titleTypographyProps={{ variant: 'title' }} />
            <CardContent>
              <EventsFilterForm eventInfoList={props.eventInfoList} onFilterEvents={onFilterEventsHandler} testingTypeList={props.testingTypeList} locationList={props.locationList} />
            </CardContent>
          </Card>
        </Box>
      </Grid>
    </React.Fragment>
  )
}

export default EventsFilter