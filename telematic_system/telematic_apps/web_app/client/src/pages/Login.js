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
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { Alert, Grid, Link, Snackbar } from '@mui/material';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import TextField from '@mui/material/TextField';
import * as React from 'react';
import AuthContext from '../context/auth-context';
import { loginUser } from '../api/api-user';
import { listOrgs } from '../api/api-org';

const theme = createTheme();

const Login = React.memo(() => {
    const authContext = React.useContext(AuthContext);
    const [loginState, setLoginState] = React.useState(true);

    const handleSubmit = (event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        const status = loginUser(data.get('username'), data.get("password"));
        // let login
        status.then(resData => {
            setLoginState(true);
            //Checking if login is successful
            const org_response = listOrgs();
            org_response.then(data => {
                if (data !== undefined && Array.isArray(data) && data.length !== 0) {
                    //Get current user organization name
                    data.forEach(item => {
                        if (item !== undefined && item.id !== undefined && parseInt(item.id) === parseInt(resData.org_id)) {
                            authContext.login(resData.login, resData.session_token, resData.email,
                                resData.last_seen_at, resData.org_id, item.name, resData.name);
                        }
                    });
                }
            }).catch(err => {
                console.error(err);
            });

            //Get current user role

        }).catch(error => {
            console.error(error);
            setLoginState(false);
        });
    };
    const handleClose = () => {
        setLoginState(true);
    };

    return (
        <React.Fragment>
            <ThemeProvider theme={theme}>
                <Snackbar
                    anchorOrigin={{ vertical: "top", horizontal: "center" }}
                    open={!loginState}
                    onClose={handleClose}
                    autoHideDuration={6000}
                    key="Login">
                    <Alert onClose={handleClose} severity="error" sx={{ width: '100%' }}>
                        Your username or password is incorrect!
                    </Alert>
                </Snackbar>
                <Container component="main" maxWidth="xs">
                    <Box
                        sx={{
                            marginTop: 8,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                        }} >
                        <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
                            <LockOutlinedIcon />
                        </Avatar>
                        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                id="username"
                                label="User Name"
                                name="username"
                                autoComplete="username"
                                autoFocus />

                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                name="password"
                                label="Password"
                                type="password"
                                id="password"
                                autoComplete="current-password" />
                            <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                sx={{ mt: 3, mb: 2 }}>
                                Sign In
                            </Button>
                        </Box>
                        <Box component="div">
                            <Grid container spacing={1} >
                                <Grid item xs={6}>
                                    <Link href="/telematic/forget/password">Forget Password?</Link>
                                </Grid>
                                <Grid item xs={6}>
                                    <Link href="/telematic/register/user">Register user</Link>
                                </Grid>
                            </Grid>
                        </Box>
                    </Box>
                </Container>
            </ThemeProvider>
        </React.Fragment >
    );
});
export default Login;