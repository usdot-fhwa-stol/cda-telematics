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
import { CircularProgress, Grid } from '@mui/material';
import { Box } from '@mui/system';
import React, { useContext, useEffect, useState } from 'react';
import Iframe from 'react-iframe';
import { useSearchParams } from 'react-router-dom';
import AuthContext from '../context/auth-context';
import {env} from '../env'
const Grafana = () => {
  const [embedURL, setEmbedURL] = useState(env.REACT_APP_GRAFANA_URI + "/dashboards?theme=light")
  const [loading, setLoading] = useState(true);
  const authContext = useContext(AuthContext);
  const loadedHanlder = () => {
    setLoading(false);
  }

  const [searchParams, setSearchParams] = useSearchParams();
  useEffect(() => {
    if (searchParams.get("uid") !== null && searchParams.get("slug") !== null) {
      setEmbedURL(env.REACT_APP_GRAFANA_URI + '/d/' + searchParams.get("uid") + '/' + searchParams.get("slug") + "?=orgId=" + authContext.org_id + "&theme=light")
    }
  }, [])
  return (
    <React.Fragment>
      {loading && <Box sx={{ display: 'flex', width: '100%', height: '100vh' }}>
        <CircularProgress sx={{ margin: 'auto' }} />
      </Box>
      }
      <Grid container rowSpacing={1} columnSpacing={{ xs: 1, sm: 2, md: 3 }} sx={{ height: '100vh' }}>
        <Iframe url={embedURL}
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