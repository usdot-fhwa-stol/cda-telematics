import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { Alert, Snackbar } from '@mui/material';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import TextField from '@mui/material/TextField';
import * as React from 'react';
import AuthContext from '../context/auth-context';


const theme = createTheme();

const Login = React.memo(() => {
    const authContext = React.useContext(AuthContext);
    const [loginState, setLoginState] = React.useState(true);

    const handleSubmit = (event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        const isLogin = authContext.login(data.get('username'), data.get("password"), "NA");
        if (!isLogin) {
            setLoginState(false);
        }
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
                    </Box>
                </Container>
            </ThemeProvider>
        </React.Fragment>
    );
});
export default Login;