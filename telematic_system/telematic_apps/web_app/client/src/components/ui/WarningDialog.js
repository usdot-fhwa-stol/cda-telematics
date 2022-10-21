import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material'
import React from 'react'

const WarningDialog = (props) => {
    const onWarningCloseHandler = () => {
        props.onCloseWarning();
    }
    const onEventConfirmHandler = () => {
        props.onConfirm();
    }
    return (
        <React.Fragment>
            <Dialog open={props.open} onClose={onWarningCloseHandler}>
                <DialogTitle sx={{ fontWeight: "bolder"}}>{props.title}</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        {props.description}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={onWarningCloseHandler} variant="outlined">Cancel</Button>
                    <Button onClick={onEventConfirmHandler} variant="contained">Confirm</Button>
                </DialogActions>
            </Dialog>
        </React.Fragment>

    )
}

export default WarningDialog