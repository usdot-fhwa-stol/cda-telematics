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
import { yupResolver } from '@hookform/resolvers/yup';
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, FormControl, InputLabel, MenuItem, Select, TextField, Typography } from '@mui/material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import * as Yup from 'yup';
import { CustomizedButton } from '../ui/CustomizedButton';
import { CustomizedOutlinedButton } from '../ui/CustomizedOutlinedButton';

export const AssignUnitDialog = (props) => {
    const onCloseHandler = () => {
        setEndTimeValid(true);
        setStartTimeValid(true);
        setUnitId('');
        resetField('unitId');
        clearErrors();
        props.onCloseAssignUnitDialog();
    }

    const [unitId, setUnitId] = React.useState('');
    const handleUnitChange = (event) => {
        setUnitId(event.target.value);
    };

    const timestampNow = new Date().getTime();
    const [startTime, setStartTime] = useState(timestampNow);
    const [startTimeValid, setStartTimeValid] = useState(true);
    const handleStartTimeChange = (newStartDateTime) => {
        const unit_start_at = newStartDateTime.$d.getTime();
        setStartTime(unit_start_at);
        //Unit start time has to be between event start and end time
        setStartTimeValid(validateUnitAssignTime(unit_start_at));
    };

    const [endTime, setEndTime] = useState(timestampNow)
    const [endTimeValid, setEndTimeValid] = useState(true);
    const handleEndTimeChange = (newEndDateTime) => {
        const unit_end_at = newEndDateTime.$d.getTime();
        setEndTime(unit_end_at);
        //Unit end time has to be between event start and end time
        setEndTimeValid(validateUnitAssignTime(unit_end_at));
    };

    const validateUnitAssignTime = (assignedUnitTime) => {
        const event_start_at = new Date(props.eventInfo.start_at).getTime();
        const event_end_at = new Date(props.eventInfo.end_at).getTime();

        //Assigned unit time has to be between event start and end time
        if (assignedUnitTime - event_start_at > 0 && event_end_at - assignedUnitTime > 0) {
            return true;
        } else {
            return false;
        }
    }

    const onAssignUnitHandler = () => {
        const unit = props.unitList.filter(unit => unit.unit_identifier === unitId)[0];
        //Add start and end time for the unit assigned to an event
        const event_unit = {};
        event_unit.start_time = startTime;
        event_unit.end_time = endTime;
        event_unit.eventId = props.eventInfo.id;
        event_unit.unitId = unit.id;
        const assign_event_unit = {
            event_id: props.eventInfo.id,
            unit: unit,
            event_unit: event_unit
        }

        if (!validateUnitAssignTime(startTime)) {
            setStartTimeValid(false);
        }
        else if (!validateUnitAssignTime(endTime)) {
            setEndTimeValid(false);
        }
        else {
            props.onAssignUnitHandler(assign_event_unit);
            setUnitId('');
        }
    }

    const validationSchema = Yup.object().shape({
        unitId: Yup.string().required('Unit id is required'),
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
    return (
        <React.Fragment>
            <Dialog open={props.open} onClose={onCloseHandler}>
                <DialogTitle sx={{ fontWeight: "bolder" }}>Assign Unit</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        To assign a unit to an event, please fill out the required fields (*) and click "ASSIGN".
                    </DialogContentText>

                    <FormControl fullWidth>
                        <InputLabel id="UnitLabelId">Unit *</InputLabel>
                        <Select
                            {...register('unitId')}
                            error={errors.unitId ? true : false}
                            labelId="UnitLabelId"
                            id="unitId"
                            value={unitId}
                            label="Unit *"
                            sx={{ marginBottom: 5 }}
                            onChange={handleUnitChange}>
                            {props.unitList !== undefined && props.unitList.length > 0 &&
                                props.unitList.map(unit => (
                                    <MenuItem key={`${unit.unit_identifier}`} value={`${unit.unit_identifier}`}>{unit.unit_name}- ({unit.unit_identifier})</MenuItem>)
                                )}
                        </Select>
                    </FormControl>
                    <FormControl fullWidth>
                        {!startTimeValid && <Typography sx={{ color: "red" }}>Unit start time should be between event start and end time.</Typography>}
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DateTimePicker
                                label="Assign Start Time & Date"
                                value={startTime}
                                onChange={handleStartTimeChange}
                                renderInput={(params) =>
                                    <TextField {...params} sx={{ marginBottom: 5 }} />}
                            />
                            {!endTimeValid && <Typography sx={{ color: "red" }}>Unit end time should be between event start and end time.</Typography>}
                            <DateTimePicker
                                label="Assign End Time & Date"
                                value={endTime}
                                onChange={handleEndTimeChange}
                                sx={{ paddingBottom: 5 }}
                                renderInput={(params) =>
                                    <TextField {...params} sx={{ marginBottom: 5 }} />} />
                        </LocalizationProvider>
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <CustomizedOutlinedButton variant='outlined' onClick={onCloseHandler}>Cancel</CustomizedOutlinedButton>
                    <CustomizedButton onClick={handleSubmit(onAssignUnitHandler)}>Assign</CustomizedButton>
                </DialogActions>
            </Dialog>
        </React.Fragment >
    )
}
