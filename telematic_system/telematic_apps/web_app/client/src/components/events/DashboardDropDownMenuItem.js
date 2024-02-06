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
import { Button, Divider, Menu, MenuItem } from '@mui/material';
import React from 'react'
import { Link } from 'react-router-dom';
import AuthContext from '../../context/auth-context';
import { USER_ROLES } from '../users/UserMetadata';
import { getDashboardsByOrg, listEventDashboards, updateEventDashboards } from '../../api/api-dashboards';
import { AssignDashboardDialog } from './AssignDashboardDialog';


const DashboardDropDownMenuItem = (props) => {
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

    const onAssignDashboardHandler = (event_id, dashboard_ids) => {
        updateEventDashboards(event_id, dashboard_ids);
    }
    React.useEffect(() => {
        console.log("DashboardDropDownMenuItem")
        if (authCtx.org_id !== null && authCtx !== undefined) {
            const response = getDashboardsByOrg(authCtx.org_id);
            response.then(data => {
                console.log(data)
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
                    <Button size="small" variant='outlined' onClick={handleOpenAssignDashboardDialog}>(Un)Assign Dashboards</Button>
                </MenuItem>
            }
            {
                openAssignDashboardDialog &&
                <AssignDashboardDialog
                    eventRow={props.eventRow}
                    eventDashboards={eventDashboards}
                    close={!openAssignDashboardDialog}
                    open={openAssignDashboardDialog}
                    onCloseAssignDashboardDialog={handleCloseAssignDashboardDialog}
                    onAssignDashboard={onAssignDashboardHandler} />
            }
        </Menu>
    )
}

export default DashboardDropDownMenuItem