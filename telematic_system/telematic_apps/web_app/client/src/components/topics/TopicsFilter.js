import { Card, CardContent, CardHeader, Grid } from '@mui/material'
import { Box } from '@mui/system'
import React from 'react'
import TopicsFilterForm from './TopicsFilterForm'

const TopicsFilter = (props) => {

  const onSelectEventsHandler = (filteredEventList) => {
    props.onSelectEvents(filteredEventList);
  }

  return (
    <React.Fragment>
      <Grid container item xs={12} columnSpacing={3} sx={{ margin: '0px 3px' }}>
        <Box sx={{ width: '100%' }}>
          <Card>
            <CardHeader sx={{ color: "#000", backgroundColor: "#eee", padding: 1 }} title="Select an event" titleTypographyProps={{ variant: 'title' }} />
            <CardContent>
              <TopicsFilterForm eventInfoList={props.eventInfoList} onSelectEvents={onSelectEventsHandler} testingTypeList={props.testingTypeList} locationList={props.locationList} />
            </CardContent>
          </Card>
        </Box>
      </Grid>
    </React.Fragment>
  )
}

export default TopicsFilter