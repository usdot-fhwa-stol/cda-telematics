import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, FormControl, TextField } from '@mui/material';
import React from 'react';

export const AssignDashboardDialog = (props) => {
    const onCloseHandler = () => {
        props.onCloseAssignDashboardDialog();
    }
    return (
        <React.Fragment>
            <Dialog open={props.open} onClose={onCloseHandler}>
                <DialogTitle>(Un)Assign Dashboards</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        To subscribe to this website, please enter your email address here. We
                        will send updates occasionally.
                    </DialogContentText>
                    
                    <FormControl sx={{width: '80%'}}>
                        <TextField
                            autoFocus
                            margin="dense"
                            id="dashboardUrlID"
                            label="Dashboard URL*"
                            variant="standard"
                            sx={{ marginBottom: 5 }} />
                    </FormControl>

                    <FormControl  sx={{width: '20%', top: 10}}>
                        <Button variant="outlined" size='large'>Search</Button>
                    </FormControl>

                </DialogContent>
                <DialogActions>
                    <Button onClick={onCloseHandler}>Cancel</Button>
                    <Button onClick={onCloseHandler}>Assign</Button>
                </DialogActions>
            </Dialog>
        </React.Fragment>
    )
}
