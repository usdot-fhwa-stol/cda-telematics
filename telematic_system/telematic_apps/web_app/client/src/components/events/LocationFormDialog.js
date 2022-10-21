import { yupResolver } from '@hookform/resolvers/yup';
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, FormControl, InputLabel, MenuItem, Select, TextField } from '@mui/material';
import React, { useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import * as Yup from 'yup';

const LocationFormDialog = (props) => {
    const facilityNameRef = useRef(null);
    const cityRef = useRef(null);
    const [stateCode, setStateCode] = useState('');
    const zipCodeRef = useRef(null);
    const onCloseHandler = () => {
        props.onClose();
        setStateCode('');
    }
    const handleStateCodeChange = (event) => {
        setStateCode(event.target.value);
    }

    const onSaveLocationHandler = () => {
        const location = {
            facility_name: facilityNameRef.current.value,
            city: cityRef.current.value,
            state_code: stateCode,
            zip_code: zipCodeRef.current.value
        }
        props.onSaveLocation(location);
        setStateCode('');
    }

    const validationSchema = Yup.object().shape({
        facilityName: Yup.string().required('Facility name is required'),
        city: Yup.string().required('City is required'),
        stateCode: Yup.string().required('State is required'),
        zipCode: Yup.string().required('Zip code is required'),
    });

    const {
        register,
        control,
        handleSubmit,
        formState: { errors }
    } = useForm({
        resolver: yupResolver(validationSchema)
    });

    return (
        <React.Fragment>
            <Dialog open={props.open} onClose={onCloseHandler}>
                <DialogTitle sx={{ fontWeight: "bolder" }}>Add Location</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        To create a location, please fill out the required fields (*) and click "SAVE".
                    </DialogContentText>

                    <FormControl fullWidth>
                        <TextField
                            {...register('facilityName')}
                            error={errors.facilityName ? true : false}
                            autoFocus
                            margin="dense"
                            id="facilityName"
                            name='facilityName'
                            label="Facility Name*"
                            variant="standard"
                            inputRef={facilityNameRef}
                            sx={{ marginBottom: 5 }} />
                    </FormControl>

                    <FormControl fullWidth>
                        <TextField
                            {...register('city')}
                            error={errors.city ? true : false}
                            autoFocus
                            margin="dense"
                            id="city"
                            label="City*"
                            variant="standard"
                            inputRef={cityRef}
                            sx={{ marginBottom: 5 }} />
                    </FormControl>

                    <FormControl fullWidth>
                        <InputLabel id="stateCodeLabel">State*</InputLabel>
                        <Controller
                            render={({ field }) => (
                                <Select
                                    {...field}
                                    value={stateCode}
                                    {...register('stateCode')}
                                    error={errors.stateCode ? true : false}
                                    sx={{ marginBottom: 5 }}
                                    onChange={handleStateCodeChange}>
                                    {
                                        props.stateList !== undefined && props.stateList.map(state =>
                                            <MenuItem key={state.code} value={state.code}>{state.name}</MenuItem>)
                                    }
                                </Select>
                            )}
                            control={control}
                            name="stateCode" />
                    </FormControl>

                    <FormControl fullWidth>
                        <TextField
                            {...register('zipCode')}
                            error={errors.zipCode ? true : false}
                            autoFocus
                            margin="dense"
                            id="zipCode"
                            label="Zip Code*"
                            variant="standard"
                            inputRef={zipCodeRef}
                            sx={{ marginBottom: 5 }} />
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button onClick={onCloseHandler}>Cancel</Button>
                    <Button onClick={handleSubmit(onSaveLocationHandler)}>Save</Button>
                </DialogActions>
            </Dialog>
        </React.Fragment >
    )
}

export default LocationFormDialog