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
import { Alert, AlertTitle, Collapse, IconButton } from '@mui/material';
import { Box } from '@mui/system';
import React from 'react';
import CloseIcon from '@mui/icons-material/Close';

const SnackBarNotification = (props) => {
    const handleClose = (event) => {
        props.closeAlert();
    };
    return (
        <React.Fragment>
            <Box sx={{ width: '30%', zIndex: 9999, position: 'fixed', top: 50, left: '30%', minWidth: '300px' }} >
                <Collapse in={props.open} unmountOnExit timeout={{ enter: 600, exit: 100 }}>
                    <Alert severity={props.severity}
                        action={
                            <IconButton
                                aria-label="close"
                                color="inherit"
                                size="small"
                                onClick={handleClose}>
                                <CloseIcon fontSize="inherit" />
                            </IconButton>
                        }
                        sx={{ mb: 2 }}>
                        <AlertTitle>{props.title}</AlertTitle>
                        {props.message !== undefined && props.message}
                        {props.messageList !== undefined && props.messageList.length > 0 &&
                            props.messageList.map(message => (<li key={message}>{message}</li>))}
                    </Alert>
                </Collapse>
            </Box>
        </React.Fragment>
    )
}

export default SnackBarNotification