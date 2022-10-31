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
import { Avatar, CardHeader, Grid } from '@mui/material';
import React from 'react'

export const PageAvatar = (props) => {
    const { icon, title } = props;
    return (
        <Grid item xs={8}>
            <CardHeader
                avatar={
                    <Avatar sx={{bgcolor: 'info.main' }}>
                        {icon}
                    </Avatar>
                }
                titleTypographyProps={{ fontSize: '150%' }}
                title={title}></CardHeader>
        </Grid>
    )
}
