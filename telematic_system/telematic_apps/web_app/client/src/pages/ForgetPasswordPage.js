import { yupResolver } from '@hookform/resolvers/yup';
import PasswordIcon from '@mui/icons-material/Password';
import { Alert, Avatar, Box, Button, Container, FormControl, Link, Snackbar, TextField } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import * as Yup from 'yup';
import { updatePassword } from '../api/api-user';

const ForgetPasswordPage = () => {
  const [open, setOpen] = useState(false);
  const [curPwd, setCurPwd] = useState('');
  const [confirmCurPwd, setConfirmCurPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const theme = createTheme();
  const handleClose = () => {
    setErrorMsg('')
    setOpen(false);
  }
  const handleName = (event) => {
    setUsername(event.target.value);
  }

  const handleEmail = (event) => {
    setEmail(event.target.value);
  }
  const handleCurrentPassword = (event) => {
    setCurPwd(event.target.value);
  }

  const handleConfirmPassword = (event) => {
    setConfirmCurPwd(event.target.value);
  }
  const handleNewPassword = (event) => {
    setNewPwd(event.target.value);
  }

  const changePassword = (event) => {
    //Current password and confirm password shall match
    if (curPwd !== "" && confirmCurPwd !== "" && curPwd !== confirmCurPwd) {
      setErrorMsg('Current passwords do not match.')
      setOpen(true);
      return;
    } else {
      setErrorMsg('');
      setOpen(false);
    }

    const response = updatePassword(username, email, newPwd);
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
    name: Yup.string().required('Name is required'),
    email: Yup.string().required('Email is required'),
    current_password: Yup.string().required('Current password is required'),
    confirm_current_password: Yup.string().required('Confirm password is required'),
    new_password: Yup.string().required('New password is required'),
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
    setCurPwd('');
    setConfirmCurPwd('');
    setNewPwd('');
    setErrorMsg('');
    setUsername('');
    setEmail('');
    clearErrors();
    resetField("name");
    resetField("email");
    resetField("current_password");
    resetField("confirm_current_password");
    resetField("new_password");
  }

  return (
    <React.Fragment>
      <ThemeProvider theme={theme}>
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
              marginTop: 12,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }} >
            <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
              <PasswordIcon />
            </Avatar>
            <Box component="form" sx={{ mt: 1 }}>
              <FormControl fullWidth>
                <TextField id="name"
                  label="Name *"
                  variant='outlined'
                  fullWidth
                  {...register('name')}
                  error={errors.name ? true : false}
                  margin="normal"
                  value={username}
                  onChange={handleName} />
              </FormControl>

              <FormControl fullWidth>
                <TextField id="email"
                  label="Email *"
                  variant='outlined'
                  fullWidth
                  margin="normal"
                  {...register('email')}
                  value={email}
                  error={errors.email ? true : false}
                  onChange={handleEmail} />
              </FormControl>
              <FormControl fullWidth>
                <TextField
                  id="current_password"
                  label="Current Password *"
                  fullWidth
                  name="current_password"
                  margin="normal"
                  type="password"
                  variant='outlined'
                  value={curPwd}
                  {...register('current_password')}
                  error={errors.current_password ? true : false}
                  onChange={handleCurrentPassword} />
              </FormControl>

              <FormControl fullWidth>
                <TextField
                  id="confirm_current_password"
                  label="Confirm Current Password *"
                  fullWidth
                  margin="normal"
                  name="confirm_current_password"
                  type="password"
                  {...register('confirm_current_password')}
                  error={errors.confirm_current_password ? true : false}
                  variant='outlined'
                  value={confirmCurPwd}
                  onChange={handleConfirmPassword} />
              </FormControl>

              <FormControl fullWidth>
                <TextField
                  id="new_password"
                  label="New Password *"
                  name="new_password"
                  type="password"
                  fullWidth
                  value={newPwd}
                  margin="normal"
                  variant='outlined'
                  {...register('new_password')}
                  error={errors.new_password ? true : false}
                  onChange={handleNewPassword} />
              </FormControl>

              <Button
                variant='contained'
                fullWidth
                margin="normal"
                onClick={handleSubmit(changePassword)}>
                Change Password
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
      </ThemeProvider>
    </React.Fragment >
  )
}

export default ForgetPasswordPage