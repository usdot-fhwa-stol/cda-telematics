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
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import EventIcon from '@mui/icons-material/Event';
import LogoutIcon from '@mui/icons-material/Logout';
import StreamIcon from '@mui/icons-material/Stream';
import { List, ListItem, ListItemButton, ListItemIcon, ListItemText, Toolbar, Tooltip } from '@mui/material';
import MuiDrawer from '@mui/material/Drawer';
import { styled } from '@mui/material/styles';
import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { getUserRole } from '../../api/api-org';
import { deleteUser } from '../../api/api-user';
import AuthContext from '../../context/auth-context';
import { USER_ROLES } from '../users/UserMetadata';

const NavMenu = React.memo(() => {
    const authCtx = React.useContext(AuthContext);
    useEffect(() => {
        //update user role if changed
        if (authCtx.user_id !== null && authCtx.user_id !== undefined && authCtx.org_id !== null
            && authCtx.org_id !== undefined && parseInt(authCtx.org_id) !== 0) {
            getUserRole({
                user_id: parseInt(authCtx.user_id),
                org_id: parseInt(authCtx.org_id)
            }).then(data => {
                if (data !== undefined && data.errCode === undefined && Array.isArray(data) && data.length > 0) {
                    if (data[0].role !== undefined && data[0].role.length > 0 && data[0].role !== authCtx) {
                        authCtx.updateRole(data[0].role);
                    }
                }
            });
        }
    })

    const location = useLocation();
    const logoutHandler = React.useCallback(() => {
        deleteUser(authCtx.username).then(status => {
            authCtx.logout();
        }).catch(error => {
            console.log("error logout: " + error);
        });
    }, [authCtx]);

    const closedMixin = (theme) => ({
        transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
        }),
        overflowX: 'hidden',
        width: `calc(${theme.spacing(7)} + 1px)`,
        [theme.breakpoints.up('sm')]: {
            width: `calc(${theme.spacing(8)} + 1px)`,
        },
    });

    const Drawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== 'open' })(
        ({ theme, open }) => ({
            ...(!open && {
                ...closedMixin(theme),
                '& .MuiDrawer-paper': closedMixin(theme),
            }),
        }),
    );

    return (
        <React.Fragment>
            <Drawer variant="permanent" open={false}>
                <Toolbar />
                <Toolbar />
                <List >
                    <ListItem key="Events" disablePadding sx={{ display: 'block' }}>
                        <ListItemButton
                            component={Link} to="/telematic/events"
                            selected={"/telematic/events" === location.pathname}>
                            <Tooltip title="Events" placement="right-start" arrow>
                                <ListItemIcon>
                                    <EventIcon />
                                </ListItemIcon>
                            </Tooltip>
                            <ListItemText primary="Events" />
                        </ListItemButton>
                    </ListItem>
                    <ListItem key="Topics" disablePadding sx={{ display: 'block' }}>
                        <ListItemButton
                            component={Link} to="/telematic/topics"
                            selected={"/telematic/topics" === location.pathname}>
                            <Tooltip title="Topics" placement="right-start" arrow>
                                <ListItemIcon>
                                    <StreamIcon />
                                </ListItemIcon>
                            </Tooltip>
                            <ListItemText primary="Topics" />
                        </ListItemButton>
                    </ListItem>
                    {
                        (parseInt(authCtx.is_admin) === 1 || authCtx.role === USER_ROLES.ADMIN) &&
                        <ListItem key="admin" disablePadding sx={{ display: 'block' }}>
                            <ListItemButton
                                component={Link} to="/telematic/admin"
                                selected={"/telematic/admin" === location.pathname}>
                                <Tooltip title="Administrators" placement="right-start" arrow>
                                    <ListItemIcon>
                                        <AdminPanelSettingsIcon />
                                    </ListItemIcon>
                                </Tooltip>
                                <ListItemText primary="Topics" />
                            </ListItemButton>
                        </ListItem>
                    }
                </List>
                <ListItemButton onClick={logoutHandler} sx={{
                    position: "absolute",
                    bottom: 20,
                    right: 0,
                    left: 0,
                    width: "fit-content",
                    backgroundColor: "transparent"
                }}>
                    <Tooltip title="Logout" placement="right-start" arrow>
                        <ListItemIcon>
                            <LogoutIcon />
                        </ListItemIcon>
                    </Tooltip>
                </ListItemButton>
            </Drawer>
        </React.Fragment>
    )
});

export default NavMenu