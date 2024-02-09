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
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, FormControl, InputLabel, MenuItem, Select, TextField } from '@mui/material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import React, { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import * as Yup from 'yup';

export const EventFormDialog = (props) => {

    const validationSchema = Yup.object().shape({
        name: Yup.string().required('Name is required'),
        description: Yup.string().required('Description is required'),
        testingTypeId: Yup.string().required('Testing type is required'),
        locationId: Yup.string().required('Location is required'),
    });

    const {
        register,
        handleSubmit,
        control,
        formState: { errors },
        clearErrors,
        resetField
    } = useForm({
        resolver: yupResolver(validationSchema)
    });

    const timestampNow = new Date().getTime();
    const onCloseHandler = () => {
        resetEventForm();
        props.onCloseHandler();
    }

    const [startTime, setStartTime] = useState(timestampNow)
    const handleStartTimeChange = (newStartDateTime) => {
        setStartTime(newStartDateTime.$d.getTime());
    };

    const [endTime, setEndTime] = useState(timestampNow)
    const handleEndTimeChange = (newEndDateTime) => {
        setEndTime(newEndDateTime.$d.getTime());
    };

    const [testingTypeId, setTestingTypeId] = useState('');
    const handleTestingTypeChange = (event) => {
        setTestingTypeId(event.target.value);
    }

    const [locationId, setlocationId] = React.useState('');
    const handlelocationIdChange = (event) => {
        setlocationId(event.target.value);
    };

    const [eventName, setEventName] = React.useState('');
    const handleEventNameChange = (event) => {
        setEventName(event.target.value);
    };

    const [eventDescription, setEventDescription] = React.useState('');
    const handleEventDescriptionChange = (event) => {
        setEventDescription(event.target.value);
    };
    const [customErrorText, setCustomErrorText] = useState('');
    useEffect(() => {
        if (props.eventInfo !== undefined) {
            setEventName(props.eventInfo.name === undefined ? '' : props.eventInfo.name);
            setEventDescription(props.eventInfo.description === undefined ? '' : props.eventInfo.description);
            if (props.eventInfo.location !== undefined) {
                setlocationId(props.eventInfo.location.id === undefined ? '' : props.eventInfo.location.id);
            }
            if (props.eventInfo.testing_type !== undefined) {
                setTestingTypeId(props.eventInfo.testing_type.id === undefined ? '' : props.eventInfo.testing_type.id);
            }
            setStartTime(props.eventInfo.start_at === undefined ? new Date().getTime() : props.eventInfo.start_at);
            setEndTime(props.eventInfo.end_at === undefined ? new Date().getTime() : props.eventInfo.end_at);
        }
    }, [props]);

    const onEventSaveHandler = () => {
        const units = props.eventInfo === undefined || props.eventInfo.units === undefined ? [] : props.eventInfo.units;
        const assignLocation = props.locationList.filter(location => location.id === locationId)[0];
        const testingType = props.testingTypeList.filter(testing_type => testing_type.id === testingTypeId)[0];
        const status = props.eventInfo === undefined || props.eventInfo.status === undefined ? '' : props.eventInfo.status;
        const event_units = props.eventInfo === undefined || props.eventInfo.event_units === undefined ? [] : props.eventInfo.event_units;
        const localEventInfo = {
            name: eventName,
            testing_type: testingType,
            location: assignLocation,
            start_at: startTime,
            end_at: endTime,
            description: eventDescription,
            units: units,
            status: status,
            event_units: event_units
        }
        if (props.eventInfo !== undefined) {
            localEventInfo.id = props.eventInfo.id;
        }
        if (startTime > endTime) {
            setCustomErrorText("Event start time cannot be greater than the event end time.");
            return;
        }
        props.onEventSaveHandler(localEventInfo);
        if (props.eventInfo === undefined) {
            resetEventForm();
        }
    }
    const resetEventForm = () => {
        setEventName('');
        setlocationId('');
        setEventDescription('');
        setTestingTypeId('');
        setStartTime(new Date().getTime());
        setEndTime(new Date().getTime());
        setCustomErrorText('');
        clearErrors();
        resetField("name");
        resetField("description");
        resetField("testingTypeId");
        resetField("locationId");
    }

    return (
        <React.Fragment>
            <Dialog open={props.open} onClose={onCloseHandler}>
                <DialogTitle sx={{ fontWeight: "bolder" }}>{props.title}</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        To {props.title.toLowerCase()}, please fill out the required fields (*) and click "SAVE".
                    </DialogContentText>
                    <DialogContentText sx={{ color: "red", display: customErrorText === '' ? 'none' : '' }} >
                        {customErrorText}
                    </DialogContentText>

                    <FormControl fullWidth>
                        <TextField
                            {...register('name')}
                            error={errors.name ? true : false}
                            margin="dense"
                            id="name"
                            label="Event Name*"
                            variant="standard"
                            value={eventName}
                            onChange={handleEventNameChange}
                            sx={{ marginBottom: 5 }} />
                    </FormControl>

                    <FormControl fullWidth>
                        <TextField
                            {...register('description')}
                            error={errors.description ? true : false}
                            margin="dense"
                            id="description"
                            label="Event Description*"
                            variant="standard"
                            value={eventDescription}
                            onChange={handleEventDescriptionChange}
                            sx={{ marginBottom: 5 }} />
                    </FormControl>

                    <FormControl fullWidth>
                        <InputLabel id="testingTypeIdLabel">Testing Type*</InputLabel>
                        <Controller
                            render={({ field }) => (
                                <Select
                                    {...field}
                                    value={testingTypeId}
                                    {...register('testingTypeId')}
                                    error={errors.testingTypeId ? true : false}
                                    sx={{ marginBottom: 5 }}
                                    labelId="testingTypeIdLabel"
                                    onChange={handleTestingTypeChange}>
                                    {
                                        props.testingTypeList !== undefined && props.testingTypeList.map(testingType =>
                                            <MenuItem key={testingType.id} value={testingType.id}>{testingType.name}</MenuItem>)
                                    }
                                </Select>
                            )}
                            control={control}
                            name="testingtypeid" />
                    </FormControl>

                    <FormControl fullWidth>
                        <InputLabel id="locationIdLabelId">Location*</InputLabel>
                        <Controller
                            render={({ field }) => (
                                <Select
                                    {...field}
                                    value={locationId}
                                    {...register('locationId')}
                                    error={errors.locationId ? true : false}
                                    labelId="locationIdLabelId"
                                    sx={{ marginBottom: 5 }}
                                    onChange={handlelocationIdChange}>
                                    {
                                        props.locationList !== undefined && props.locationList.map(location =>
                                            <MenuItem key={location.id} value={location.id}>{location.facility_name}</MenuItem>)
                                    }
                                </Select>
                            )}
                            control={control}
                            name="locationId" />
                    </FormControl>

                    <FormControl fullWidth>
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DateTimePicker
                                label="Start Time & Date*"
                                value={startTime}
                                onChange={handleStartTimeChange}
                                renderInput={(params) =>
                                    <TextField {...params} sx={{ marginBottom: 5 }} />}
                            />
                            <DateTimePicker
                                label="End Time & Date*"
                                value={endTime}
                                onChange={handleEndTimeChange}
                                sx={{ paddingBottom: 5 }}
                                renderInput={(params) =>
                                    <TextField {...params} sx={{ marginBottom: 5 }} />}
                            />
                        </LocalizationProvider>
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button variant='outlined' onClick={onCloseHandler}>Cancel</Button>
                    <Button variant='contained' onClick={handleSubmit(onEventSaveHandler)}>Save</Button>

                </DialogActions>
            </Dialog>
        </React.Fragment >
    )
}
