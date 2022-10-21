import { AppBar, CssBaseline, List, ListItemButton, ListItemText, Toolbar } from '@mui/material';
import { Box } from '@mui/system';
import React, { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import logo from '../../assets/carma.png';
import AuthContext from '../../context/auth-context';
import NavMenu from './NavMenu';

const Layout = React.memo((props) => {
    const authContext = useContext(AuthContext);
    const location = useLocation();
    return (
        <React.Fragment>

            {authContext.sessionToken !== null &&
                <Box sx={{ display: 'flex' }}>
                    <CssBaseline />
                    <AppBar position="fixed" style={{ background: '#fff' }} sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
                        <Toolbar>
                                <Box
                                    component="img"
                                    alt="Logo"
                                    src={logo}/>

                                <List component="nav" sx={{ display: 'flex', color: 'primary.main', fontWeight: "bold" }}>
                                    <ListItemButton
                                        component={Link} to="/grafana"
                                        selected={"/grafana" === location.pathname}>
                                        <ListItemText primary="Grafana" primaryTypographyProps={{ fontSize: '150%' }} />
                                    </ListItemButton>
                                    <ListItemButton
                                        component={Link} to="/telematic/events"
                                        selected={location.pathname.includes("/telematic")}>
                                        <ListItemText primary="Telematic" primaryTypographyProps={{ fontSize: '150%' }} />
                                    </ListItemButton>
                                </List>
                        </Toolbar>
                    </AppBar>
                    {"/grafana" !== location.pathname && <NavMenu />}
                    <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
                        <Toolbar />
                        {props.children}
                    </Box>
                </Box>
            }

            {
                authContext.sessionToken === null &&
                <Box component="main" sx={{ flexGrow: 1 }}>
                    {props.children}
                </Box>
            }
        </React.Fragment>
    )
});

export default Layout