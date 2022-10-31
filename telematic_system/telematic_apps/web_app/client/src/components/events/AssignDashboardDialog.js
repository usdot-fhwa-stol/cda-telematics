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
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, FormControl, TextField } from '@mui/material';
import React from 'react';

export const AssignDashboardDialog = (props) => {
    const onCloseHandler = () => {
        props.onCloseAssignDashboardDialog();
    }
    return (
        <React.Fragment>
            <Dialog open={props.open} onClose={onCloseHandler}>
                <DialogTitle>(Un)Assign Dashboards</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        To subscribe to this website, please enter your email address here. We
                        will send updates occasionally.
                    </DialogContentText>
                    
                    <FormControl sx={{width: '80%'}}>
                        <TextField
                            autoFocus
                            margin="dense"
                            id="dashboardUrlID"
                            label="Dashboard URL*"
                            variant="standard"
                            sx={{ marginBottom: 5 }} />
                    </FormControl>

                    <FormControl  sx={{width: '20%', top: 10}}>
                        <Button variant="outlined" size='large'>Search</Button>
                    </FormControl>

                </DialogContent>
                <DialogActions>
                    <Button onClick={onCloseHandler}>Cancel</Button>
                    <Button onClick={onCloseHandler}>Assign</Button>
                </DialogActions>
            </Dialog>
        </React.Fragment>
    )
}
