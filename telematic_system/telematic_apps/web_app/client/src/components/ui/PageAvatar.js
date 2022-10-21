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
