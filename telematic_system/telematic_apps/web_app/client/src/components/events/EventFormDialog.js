import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, FormControl, InputLabel, MenuItem, Select, TextField } from '@mui/material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import React, { useEffect, useState } from 'react'; import { Controller, useForm } from 'react-hook-form';
import * as Yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';

export const EventFormDialog = (props) => {
    const timestampNow = new Date().getTime();
    const onCloseHandler = () => {
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
        props.onEventSaveHandler(localEventInfo);
        if (props.eventInfo === undefined) {
            setEventName('');
            setlocationId('');
            setEventDescription('');
            setTestingTypeId('');
            setStartTime(new Date().getTime());
            setEndTime(new Date().getTime());
        }
    }

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
        formState: { errors }
    } = useForm({
        resolver: yupResolver(validationSchema)
    });

    return (
        <React.Fragment>
            <Dialog open={props.open} onClose={onCloseHandler}>
                <DialogTitle sx={{ fontWeight: "bolder" }}>{props.title}</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        To {props.title.toLowerCase()}, please fill out the required fields (*) and click "SAVE".
                    </DialogContentText>

                    <FormControl fullWidth>
                        <TextField
                            {...register('name')}
                            error={errors.name ? true : false}
                            autoFocus
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
                            autoFocus
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
                            name="testingtypeid"/>
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
                            name="locationId"/>                        
                    </FormControl>

                    <FormControl fullWidth>
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DateTimePicker
                                label="Start Datetime*"
                                value={startTime}
                                onChange={handleStartTimeChange}
                                renderInput={(params) =>
                                    <TextField {...params} sx={{ marginBottom: 5 }} />}
                            />
                            <DateTimePicker
                                label="End Datetime*"
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
                    <Button onClick={onCloseHandler}>Cancel</Button>
                    <Button onClick={handleSubmit(onEventSaveHandler)}>Save</Button>

                </DialogActions>
            </Dialog>
        </React.Fragment >
    )
}