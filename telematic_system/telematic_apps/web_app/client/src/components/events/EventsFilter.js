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
            <CardHeader sx={{ color: "#000", backgroundColor: "#eee", padding: 1 }} title="Filters" titleTypographyProps={{ variant: 'title' }} />
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