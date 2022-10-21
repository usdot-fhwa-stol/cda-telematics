import { CircularProgress, Grid } from '@mui/material'
import { Box } from '@mui/system';
import React, { useState } from 'react'
import Iframe from 'react-iframe'
const Grafana = () => {
  const embed_url = "http://ec2-44-206-13-7.compute-1.amazonaws.com:9000/d/_HrLXUI4k/default-dashboard-uc3?orgId=1&from=now-10d&to=now&kiosk&theme=light";
  const [loading, setLoading] = useState(true);
  const loadedHanlder = () => {
    setLoading(false);
  }
  return (
    <React.Fragment>
      {loading && <Box sx={{ display: 'flex', width: '100%', height: '100vh' }}>
        <CircularProgress sx={{ margin: 'auto' }} />
      </Box>
      }
      <Grid container rowSpacing={1} columnSpacing={{ xs: 1, sm: 2, md: 3 }} sx={{ height: '100vh' }}>
        <Iframe url={embed_url}
          onLoad={loadedHanlder}
          id="grafana_iframe"
          position="absolute"
          width="100%"
          height="100%"
          frameBorder="0"
          allowFullScreen />
      </Grid>

    </React.Fragment>
  )
}

export default Grafana