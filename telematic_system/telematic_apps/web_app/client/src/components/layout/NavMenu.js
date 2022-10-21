import EventIcon from '@mui/icons-material/Event';
import LogoutIcon from '@mui/icons-material/Logout';
import StreamIcon from '@mui/icons-material/Stream';
import { List, ListItem, ListItemButton, ListItemIcon, ListItemText, Toolbar, Tooltip } from '@mui/material';
import MuiDrawer from '@mui/material/Drawer';
import { styled } from '@mui/material/styles';
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import AuthContext from '../../context/auth-context';

const NavMenu = React.memo(() => {
    const authCtx = React.useContext(AuthContext);
    const location = useLocation();
    const logoutHandler = React.useCallback(() => {
        authCtx.logout();
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