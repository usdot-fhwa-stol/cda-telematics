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
import { Alert, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Divider, FormControl, IconButton, List, ListItem, ListItemText, Snackbar, TextField, Typography } from '@mui/material';
import { Box } from '@mui/system';
import React, { useState } from 'react';
import { searchDashboards } from '../../api/api-dashboards';
import AuthContext from '../../context/auth-context';
import DashboardCheckboxList from './DashboardCheckboxList';
import DeleteIcon from '@mui/icons-material/Delete';
import { CustomizedButton } from '../ui/CustomizedButton';
import { CustomizedOutlinedButton } from '../ui/CustomizedOutlinedButton';

export const AssignDashboardDialog = (props) => {
    const [errorMsg, setErrorMsg] = useState('');
    const [open, setOpen] = useState(false);
    const authCtx = React.useContext(AuthContext)
    const [searchTxt, setSearchTxt] = useState('');
    const [searchedDashboards, setSearchedDashboards] = useState([]);
    const [checkedDashboardIds, setCheckedDashboardIds] = useState([]);
    const [openDashboardAlert, setOpenDashboardAlert] = useState(false);
    const [dashboardToRemove, setDashboardToRemove] = useState({});
    const onCloseHandler = () => {
        props.onCloseAssignDashboardDialog();
    }
    const searchTextChangeHandler = (event) => {
        setSearchTxt(event.target.value)
    }
    const handleClose = () => {
        setErrorMsg('')
        setOpen(false);
    }
    const handleCloseConfirm = () => {
        setOpenDashboardAlert(false);
    }
    const handleOpenDashboardAlert = (eventDS) => {
        setDashboardToRemove(eventDS)
        setOpenDashboardAlert(true);
    }
    const handleConfirmRemoval = () => {
        props.onUnAssignDashboard(dashboardToRemove);
        setOpenDashboardAlert(false);
    }
    const searchHandler = (event) => {
        if (authCtx.org_id !== null && authCtx !== undefined) {
            const response = searchDashboards(authCtx.org_id, searchTxt);
            response.then(data => {
                if (data.errCode === undefined) {
                    setSearchedDashboards(data);
                    setErrorMsg('')
                    setOpen(false);
                } else {
                    setErrorMsg(data.errMsg)
                    setOpen(true);
                }
            }).catch(error => {
                console.error("Error search dashboards");
                setErrorMsg("Error search dashboards")
                setOpen(true);
            })
        }
    }
    const unCheckDashboardsHanlder = (value) => {
        setCheckedDashboardIds(prev => [...prev.filter(item => item !== value)]);
    }
    const checkDashboardsHanlder = (value) => {
        setCheckedDashboardIds(prev => [...prev, value]);
    }

    const onAssignDashboardHandler = () => {
        let checkedDashboards = [];
        searchedDashboards.forEach(ds => {
            checkedDashboardIds.forEach(id => {
                if (ds.id === id) {
                    checkedDashboards.push(ds);
                }
            })
        })
        if(checkedDashboards.length===0)
        {
            setErrorMsg("No dashboard is selected. Please search and select the dashboards from this organization.")
            setOpen(true);
            return;
        }
        props.onAssignDashboard(checkedDashboards);
    }
    return (
        <React.Fragment>
            {open && <Snackbar
                anchorOrigin={{ vertical: "top", horizontal: "center" }}
                open={open}
                autoHideDuration={6000}
                key="Login">
                <Alert onClose={handleClose} severity="error" sx={{ width: '100%' }}>
                    {errorMsg}
                </Alert>
            </Snackbar>
            }
            <Dialog open={props.open} onClose={onCloseHandler}>
                <DialogTitle>Assign Dashboards</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Users can search the list of dashboards using dashboard name, and assign the dashboard for an event.
                    </DialogContentText>
                    <FormControl sx={{ width: '80%' }}>
                        <TextField
                            autoFocus
                            margin="dense"
                            id="dashboardUrlID"
                            label="Dashboard Name*"
                            variant="standard"
                            value={searchTxt}
                            onChange={searchTextChangeHandler} />
                    </FormControl>
                    <FormControl sx={{ width: '20%', top: 10, marginRight: 0, float: 'right' }}>
                        <CustomizedButton  key ="search_event" onClick={searchHandler}>Search</CustomizedButton>
                    </FormControl>
                    {
                        searchedDashboards.length > 0 &&
                        <DashboardCheckboxList
                            searchedDashboards={searchedDashboards}
                            eventDashboards={props.eventDashboards}
                            onUnChecked={unCheckDashboardsHanlder}
                            onChecked={checkDashboardsHanlder} />
                    }
                </DialogContent>
                <DialogActions>
                    <CustomizedButton onClick={onAssignDashboardHandler}>Assign</CustomizedButton>
                </DialogActions>
                <Divider sx={{ marginTop: '20px' }} />
                <DialogTitle>
                    Unassign Dashboards
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Existing dashboard for event <Typography sx={{ color: 'green', display: 'inline' }}>{props.eventRow.name}</Typography>.
                        Users can click below trash icon to unassign the dashboard for this event
                    </DialogContentText>
                    <Box sx={{
                        margin: 0,
                        padding: 0,
                        display: 'flex',
                        flexDirection: 'column',
                        textAlign: 'left',
                        justifyContent: 'center',
                    }}>

                        {
                            props.eventDashboards !== undefined && props.eventDashboards.length > 0 &&
                            <List dense={true}>
                                {
                                    props.eventDashboards.map(eventDashboard =>
                                        <ListItem>
                                            <ListItemText primary={eventDashboard.title} key={`dashboard-id-${eventDashboard.id}`}></ListItemText>
                                            <IconButton edge="end" aria-label="delete" key={`dashboard-id-${eventDashboard.id}-btn`} onClick={() => {
                                                handleOpenDashboardAlert(eventDashboard)
                                            }}>
                                                <DeleteIcon />
                                            </IconButton>
                                        </ListItem>)
                                }
                            </List>
                        }
                    </Box>
                    <DialogActions>
                        <CustomizedOutlinedButton onClick={onCloseHandler}>Close</CustomizedOutlinedButton>
                    </DialogActions>
                </DialogContent>
            </Dialog>
            {
                openDashboardAlert &&
                <Dialog
                    open={openDashboardAlert}
                    aria-labelledby="remove-dashboards-dialog-title"
                    aria-describedby="remove-dashboards-dialog-description" >
                    <DialogTitle id="remove-dashboards-dialog-title" sx={{ color: 'black', fontWeight: 'bolder' }}>
                        Remove Dashboard Alert
                    </DialogTitle>
                    <DialogContent>
                        <DialogContentText id="remove-dashboards-dialog-description" sx={{ color: 'black' }}>
                            Are you sure you want to unassign this dashboard from the event?
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions sx={{ display: "block" }}>
                        <Box sx={{
                            margin: 0,
                            padding: 0,
                            display: 'flex',
                            flexDirection: 'row',
                            textAlign: 'center',
                            justifyContent: 'right'
                        }}>
                            <CustomizedOutlinedButton onClick={handleCloseConfirm}>Cancel</CustomizedOutlinedButton>
                            <CustomizedButton onClick={handleConfirmRemoval}>Confirm</CustomizedButton>
                        </Box>
                    </DialogActions>
                </Dialog>}
        </React.Fragment>
    )
}
