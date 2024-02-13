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
import { Divider, Menu, MenuItem } from '@mui/material';
import * as React from 'react';
import { Link } from 'react-router-dom';
import { deleteEventDashboards, getDashboardsByOrg, listEventDashboards, updateEventDashboards } from '../../api/api-dashboards';
import AuthContext from '../../context/auth-context';
import { CustomizedOutlinedButton } from '../ui/CustomizedOutlinedButton';
import { USER_ROLES } from '../users/UserMetadata';
import { AssignDashboardDialog } from './AssignDashboardDialog';
export default function DashboardDropDownMenu(props) {
    const [eventDashboards, setEventDashboards] = React.useState([]);
    const authCtx = React.useContext(AuthContext)
    //Assign a dashboard Dialog
    const [openAssignDashboardDialog, setOpenAssignDashboardDialog] = React.useState(false);
    const handleOpenAssignDashboardDialog = () => {
        setOpenAssignDashboardDialog(true);
    };
    const handleCloseAssignDashboardDialog = () => {
        setOpenAssignDashboardDialog(false);
    };

    const onAssignDashboardHandler = (dashboards) => {
        dashboards.forEach(ds => {
            if (eventDashboards.length > 0) {
                eventDashboards.forEach(eventDs => {
                    //Only send update request when this dashboard is not assigned to current event
                    if (ds.id !== eventDs.id) {
                        const response = updateEventDashboards(props.eventRow.id, ds.id);
                        response.then(data => {
                            if (data.errCode === undefined) {
                                setEventDashboards(prev => [...prev, ds]);
                            }
                        }).catch(error => {
                            console.log(error);
                        })
                    }
                })
            } else {
                //No dashboard is currently assigned to the event
                const response = updateEventDashboards(props.eventRow.id, ds.id);
                response.then(data => {
                    if (data.errCode === undefined) {
                        setEventDashboards(prev => [...prev, ds]);
                    }
                }).catch(error => {
                    console.log(error);
                })
            }
        })
    }

    const onUnAssignDashboardHandler = (dashboard) => {
        const response = deleteEventDashboards(props.eventRow.id, dashboard.id);
        response.then(data => {
            console.log(data)
            if (data.errCode === undefined) {
                setEventDashboards(prev => [...prev.filter(item=>item.id !== dashboard.id)]);
            }
        }).catch(error => {
            console.log(error);
        })
    }

    React.useEffect(() => {
        if (authCtx.org_id !== null && authCtx !== undefined) {
            const response = getDashboardsByOrg(authCtx.org_id);
            response.then(data => {
                let dashboards = [];
                if (data.errCode === undefined) {
                    dashboards = data;
                }
                const response = listEventDashboards(props.eventRow.id);
                response.then(responseData => {
                    let eventDashboards = [];
                    if (responseData !== undefined && Array.isArray(responseData) && responseData.length > 0) {
                        responseData.forEach(ds => {
                            dashboards.forEach(dashboard => {
                                if (dashboard.id === ds.dashboard_id) {
                                    eventDashboards.push({
                                        slug: dashboard.slug,
                                        title: dashboard.title,
                                        id: dashboard.id,
                                        uid: dashboard.uid
                                    })
                                }
                            })
                        })
                    }
                    setEventDashboards(eventDashboards);
                })
            }).catch(error => {
                console.log(error)
                console.error("Error search dashboards");
            })
        }
    }, [])
    return (
        <React.Fragment>
            {
                openAssignDashboardDialog &&
                <AssignDashboardDialog
                    open={openAssignDashboardDialog}
                    eventDashboards={eventDashboards}
                    eventRow={props.eventRow}
                    onCloseAssignDashboardDialog={handleCloseAssignDashboardDialog}
                    onAssignDashboard={onAssignDashboardHandler}
                    onUnAssignDashboard={onUnAssignDashboardHandler} />
            }
            <Menu
                id="dashboards-menu"
                anchorEl={props.anchorEl}
                open={props.open}
                onClose={props.handleClose}>
                <MenuItem component={Link} key="dashboard" to="/grafana" disableRipple>
                    Default dashboard
                </MenuItem>
                {
                    eventDashboards.length > 0 &&
                    eventDashboards.map(item => <MenuItem
                        component={Link}
                        key={`dashboard-${item.id}`}
                        to={`/grafana?uid=${item.uid}&slug=${item.slug}&orgId=${authCtx.org_id}`}
                        disableRipple>
                        {item.title}
                    </MenuItem>)}
                <Divider sx={{ my: 0.5 }} />
                {
                    authCtx.role !== USER_ROLES.VIEWER && authCtx.role !== undefined && authCtx.role !== null && authCtx.role !== "" &&
                    <MenuItem disableRipple>
                        <CustomizedOutlinedButton onClick={handleOpenAssignDashboardDialog}>(Un)Assign Dashboards</CustomizedOutlinedButton>
                    </MenuItem>
                }
            </Menu>

        </React.Fragment>

    )
}

