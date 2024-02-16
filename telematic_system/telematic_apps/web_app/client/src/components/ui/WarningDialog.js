/*
 * Copyright (C) 2019-2024 LEIDOS.
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
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import React from 'react';
import { CustomizedButton } from './CustomizedButton';
import { CustomizedOutlinedButton } from './CustomizedOutlinedButton';

const WarningDialog = (props) => {
    const onWarningCloseHandler = () => {
        props.onCloseWarning();
    }
    const onEventConfirmHandler = () => {
        props.onConfirm();
    }
    return (
        <Dialog open={props.open} onClose={onWarningCloseHandler}>
            <DialogTitle sx={{ fontWeight: "bolder"}}>{props.title}</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    {props.description}
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <CustomizedOutlinedButton onClick={onWarningCloseHandler} variant="outlined">Cancel</CustomizedOutlinedButton>
                <CustomizedButton onClick={onEventConfirmHandler} variant="contained">Confirm</CustomizedButton>
            </DialogActions>
        </Dialog>
    )
}

export default WarningDialog