import { Alert, Avatar, Button, Checkbox, Chip, Container, FormControl, FormControlLabel, IconButton, InputLabel, Link, Paper, Snackbar, TextField, Tooltip } from '@mui/material';
import { Box } from '@mui/system';
import React, { useState } from 'react';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { createUpdateUser, createUser } from '../../api/api-user';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
import * as Yup from 'yup';
import VisibilityIcon from '@mui/icons-material/Visibility';

const RegisterUser = () => {
    const [open, setOpen] = useState(false);
    const [password, setPwd] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const handleClose = () => {
        setErrorMsg('')
        setOpen(false);
    }
    const handleusername = (event) => {
        setUsername(event.target.value);
    }

    const handleEmail = (event) => {
        setEmail(event.target.value);
    }
    const handleCurrentPassword = (event) => {
        setPwd(event.target.value);
    }

    const saveUser = () => {
        const response = createUser(username, email, password);
        response.then(status => {
            console.log(status);
            if (status.errCode !== undefined && status.errMsg !== undefined) {
                setErrorMsg(status.errMsg);
                setOpen(true);
            } else {
                //successfully change password, and reset the form
                resetForgetPwdForm();
            }
        }).catch(error => {
            console.error(error);
        })
    }

    const validationSchema = Yup.object().shape({
        username: Yup.string().required('User username is required'),
        email: Yup.string().required('Email is required'),
        password: Yup.string().required('Password is required'),
    });

    const {
        register,
        handleSubmit,
        formState: { errors },
        clearErrors,
        resetField
    } = useForm({
        resolver: yupResolver(validationSchema)
    });

    const resetForgetPwdForm = () => {
        setPwd('');
        setErrorMsg('');
        setUsername('');
        setEmail('');
        clearErrors();
        resetField("username");
        resetField("email");
        resetField("password");
    }

    return (
        <React.Fragment>
            <Snackbar
                anchorOrigin={{ vertical: "top", horizontal: "center" }}
                open={open}
                autoHideDuration={6000}
                key="Login">
                <Alert onClose={handleClose} severity="error" sx={{ width: '100%' }}>
                    {errorMsg}
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
                        <PersonAddIcon />
                    </Avatar>
                    <Box component="form">
                        <FormControl fullWidth>
                            <TextField
                                {...register('username')}
                                error={errors.username ? true : false}
                                id="username"
                                label="Username *"
                                variant='outlined'
                                fullWidth
                                margin="normal"
                                onChange={handleusername} />
                        </FormControl>

                        <FormControl fullWidth>
                            <TextField
                                {...register('email')}
                                error={errors.email ? true : false}
                                id="email"
                                label="Email *"
                                variant='outlined'
                                fullWidth
                                margin="normal"
                                onChange={handleEmail} />
                        </FormControl>

                        <FormControl fullWidth>
                            <TextField
                                {...register('password')}
                                error={errors.password ? true : false}
                                id="password"
                                label="Password *"
                                fullWidth
                                margin="normal"
                                type="password"
                                variant='outlined'
                                onChange={handleCurrentPassword} />
                        </FormControl>
                        <FormControl>
                            <Tooltip title="User is assigned with default viewer role." placement="top-start">
                                <Chip label="Viewer" sx={{ marginTop: 2 }} icon={<VisibilityIcon />} variant="outlined" />
                            </Tooltip>
                        </FormControl>
                        <Box sx={{
                            "marginTop": 2,
                            alignItems: "left",
                            fontStyle: "italic"
                        }}>
                            A user is by default assigned with viewer role. Please send email to
                            <Link href={`mailto:dan.du@leidos.com?subject=Role update request&body=Request`}> administrators </Link>
                            &nbsp;to update your role.
                        </Box>
                        <Button variant='contained' sx={{ marginTop: 2 }} margin="normal" fullWidth onClick={handleSubmit(saveUser)}>
                            Create User
                        </Button>
                        <Box sx={{
                            "marginTop": 2,
                            flexDirection: 'column',
                            display: 'flex',
                            alignItems: "center"
                        }}>
                            <Link href='/telematic/login' >Back to login</Link>
                        </Box>
                    </Box>
                </Box>
            </Container>
        </React.Fragment >
    )
}

export default RegisterUser