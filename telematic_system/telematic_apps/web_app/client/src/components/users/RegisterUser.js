import { yupResolver } from '@hookform/resolvers/yup';
import KeyboardDoubleArrowLeftIcon from '@mui/icons-material/KeyboardDoubleArrowLeft';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { Alert, Avatar, Button, Container, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, FormControl, Grid, InputLabel, Link, MenuItem, Select, Snackbar, TextField } from '@mui/material';
import { Box } from '@mui/system';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import * as Yup from 'yup';
import { listOrgs } from '../../api/api-org';
import { registerNewUser } from '../../api/api-user';
import { SEVERITY } from './UserMetadata';

const RegisterUser = () => {
    const [open, setOpen] = useState(false);
    const [openSuccessDialog, setOpenSuccessDialog] = useState(false);
    const [password, setPwd] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const [username, setUsername] = useState('');
    const [errStatus, setErrorStatus] = useState('');
    const [email, setEmail] = useState('');
    const [selectedOrg, setSelectedOrg] = useState('');
    const [allOrgs, setAllOrgs] = useState([]);
    const [adminEmails, setAdminEmails] = useState(['Ankur.Tyagi@leidos.com', 'dan.du@leidos.com', 'abey.yoseph@leidos.com', 'anish.deva@leidos.com']);
    const handleClose = () => {
        setErrorMsg('')
        setOpen(false);
    }

    const handleSuccessDialogClose = () => {
        setOpenSuccessDialog(false);
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
    const handleOrgChange = (event) => {
        setSelectedOrg(event.target.value);
    }

    const saveUser = () => {
        const response = registerNewUser(username, email, password, selectedOrg);
        response.then(status => {
            if (status.errCode !== undefined && status.errMsg !== undefined) {
                setErrorMsg(status.errMsg);
                setErrorStatus(SEVERITY.ERROR);
                setOpen(true);
            } else {
                setOpen(true);
                setErrorStatus(SEVERITY.SUCCESS);
                setErrorMsg(status.message);
                setOpenSuccessDialog(true);
                //successfully change password, and reset the form
                resetForgetPwdForm();
            }
        }).catch(error => {
            console.error(error);
        })
    }
    const getAllOrgs = () => {
        const response = listOrgs();
        response.then(status => {
            if (status.errCode !== undefined && status.errMsg !== undefined) {
                setErrorMsg(status.errMsg);
                setErrorStatus(SEVERITY.ERROR);
                setOpen(true);
            } else {
                setAllOrgs(status);
            }
        }).catch(error => {
            console.error(error);
        })
    }

    useEffect(() => {
        getAllOrgs();
    }, [])

    const validationSchema = Yup.object().shape({
        username: Yup.string().required('User username is required'),
        email: Yup.string().required('Email is required'),
        password: Yup.string().required('Password is required'),
        selectedOrg: Yup.string().required('Organization is required'),
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
        setUsername('');
        setEmail('');
        setSelectedOrg('');
        clearErrors();
        resetField("username");
        resetField("email");
        resetField("password");
        resetField('selectedOrg');
    }

    return (
        <React.Fragment>
            <Snackbar
                anchorOrigin={{ vertical: "top", horizontal: "center" }}
                open={open}
                autoHideDuration={6000}
                key="Login">
                <Alert onClose={handleClose} severity={errStatus} sx={{ width: '100%' }}>
                    {errorMsg}
                </Alert>
            </Snackbar>
            <Dialog onClose={handleSuccessDialogClose} open={openSuccessDialog}>
                <DialogTitle sx={{ color: 'green' }}>Successfully registered user </DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">                       
                    The created user is by default assigned viewer role. Please send email to
                            <Link href={`mailto:${adminEmails.join(',')}?subject=Role update request&body=Request`}> administrators </Link>
                            &nbsp;request to update your role.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button variant='outlined' sx={{marginRight: '10px'}} onClick={handleSuccessDialogClose}>Close</Button>
                    <Button variant='contained' href='/telematic/login'>
                        Go To Login
                    </Button>
                </DialogActions>
            </Dialog>
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
                        <FormControl
                            size='small'
                            fullWidth
                            margin='normal'>
                            <InputLabel id="org-selection-label">All Organizations *</InputLabel>
                            <Select
                                {...register('selectedOrg')}
                                error={errors.selectedOrg ? true : false}
                                labelId='all-orgs'
                                id='org-selection'
                                label='All Organizations *'
                                value={selectedOrg}
                                onChange={handleOrgChange}>
                                {
                                    allOrgs.map(org => {
                                        return <MenuItem value={org.id} key={org.id}>{org.name}</MenuItem>
                                    })
                                }
                            </Select>
                        </FormControl>
                        <Box>
                            <Grid container>
                                <Grid item xs={6}>
                                    <Button sx={{ float: 'left' }} href="/telematic/login" variant='outlined'>
                                        <KeyboardDoubleArrowLeftIcon />
                                        Back To Login</Button>
                                </Grid>
                                <Grid item xs={6} >
                                    <Button
                                        sx={{ float: 'right' }}
                                        variant='contained'
                                        margin="normal"
                                        onClick={handleSubmit(saveUser)}>
                                        Create User
                                    </Button>
                                </Grid>
                            </Grid>
                        </Box>
                    </Box>
                </Box>
            </Container>
        </React.Fragment >
    )
}

export default RegisterUser