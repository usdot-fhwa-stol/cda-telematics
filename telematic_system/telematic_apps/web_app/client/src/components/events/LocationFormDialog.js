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
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import * as Yup from 'yup';

const LocationFormDialog = (props) => {
    const [facilityName, setFacilityName] = useState('');
    const [city, setCity] = useState('');
    const [stateCode, setStateCode] = useState('');
    const [zipCode, setZipCode] = useState('');
    const onCloseHandler = () => {
        resetLocationForm();
        props.onClose();
    }
    const handleStateCodeChange = (event) => {
        setStateCode(event.target.value);
    }

    const handleFacilityNameChange = (event) => {
        setFacilityName(event.target.value);
    }

    const handleCityChange = (event) => {
        setCity(event.target.value);
    }
    const handleZipCodeChange = (event) => {
        setZipCode(event.target.value);
    }
    const onSaveLocationHandler = () => {
        const location = {
            facility_name: facilityName,
            city: city,
            state_code: stateCode,
            zip_code: zipCode
        }
        props.onSaveLocation(location);
        resetLocationForm();
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
        formState: { errors },
        clearErrors,
        resetField
    } = useForm({
        resolver: yupResolver(validationSchema)
    });

    const resetLocationForm = () => {
        setStateCode('');
        setZipCode('');
        setCity('');
        setFacilityName('');
        clearErrors();
        resetField("facilityName");
        resetField("city");
        resetField("stateCode");
        resetField("zipCode");
    }
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
                            margin="dense"
                            id="facilityName"
                            name='facilityName'
                            label="Facility Name*"
                            variant="standard"
                            value={facilityName}
                            onChange={handleFacilityNameChange}
                            sx={{ marginBottom: 5 }} />
                    </FormControl>

                    <FormControl fullWidth>
                        <TextField
                            {...register('city')}
                            error={errors.city ? true : false}
                            margin="dense"
                            id="city"
                            label="City*"
                            variant="standard"
                            value={city}
                            onChange={handleCityChange}
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
                            margin="dense"
                            id="zipCode"
                            label="Zip Code*"
                            variant="standard"
                            value={zipCode}
                            sx={{ marginBottom: 5 }}
                            onChange={handleZipCodeChange} />
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button variant='outlined' onClick={onCloseHandler}>Cancel</Button>
                    <Button variant='contained' onClick={handleSubmit(onSaveLocationHandler)}>Save</Button>
                </DialogActions>
            </Dialog>
        </React.Fragment >
    )
}

export default LocationFormDialog