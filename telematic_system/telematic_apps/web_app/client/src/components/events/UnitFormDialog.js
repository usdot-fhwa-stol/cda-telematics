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
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, FormControl, InputLabel, MenuItem, Select, TextField } from '@mui/material';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import * as Yup from 'yup';
import { CustomizedButton } from '../ui/CustomizedButton';
import { CustomizedOutlinedButton } from '../ui/CustomizedOutlinedButton';
import { VALID_UNIT_TYPES } from './EventMetadata';

export const UnitFormDialog = (props) => {
    const [unitId, setUnitId] = useState('');
    const [unitName, setUnitName] = useState('');
    const [unitType, setUnitType] = useState('');

    const onCloseHandler = () => {
        resetUnitForm();
        props.onClose();
    }
    const handleUnitIdChange = (event) => {
        setUnitId(event.target.value);
    }
    const handleUnitNameChange = (event) => {
        setUnitName(event.target.value);
    }
    const handleUnitTypeChange = (event) => {
        setUnitType(event.target.value);
    }

    const onSaveHandler = () => {
        const unit = {
            unit_identifier: unitId,
            unit_name: unitName,
            unit_type: unitType
        }
        props.onSave(unit);
        resetUnitForm();
    }
    const validationSchema = Yup.object().shape({
        unitId: Yup.string().required('Unit id is required'),
        unitName: Yup.string().required('Unit name is required'),
        unitTypeId: Yup.string().required('Unit type is required'),
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

    const resetUnitForm = () => {
        setUnitType('');
        setUnitId('');
        setUnitName('');
        clearErrors();
        resetField("unitId");
        resetField("unitName");
        resetField("unitTypeId");
    }

    return (
        <React.Fragment>
            <Dialog open={props.open} onClose={onCloseHandler}>
                <DialogTitle sx={{ fontWeight: "bolder" }}>Add unit</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        To create a unit, please fill out the required fields (*), ensure unit id is unique, and click "SAVE".
                    </DialogContentText>
                    <FormControl fullWidth>
                        <TextField
                            {...register('unitId')}
                            error={errors.unitId ? true : false}
                            margin="dense"
                            id="unitId"
                            label="Unit ID*"
                            variant="standard"
                            value={unitId}
                            onChange={handleUnitIdChange}
                            sx={{ marginBottom: 5 }} />
                    </FormControl>

                    <FormControl fullWidth>
                        <TextField
                            {...register('unitName')}
                            error={errors.unitName ? true : false}
                            margin="dense"
                            id="unitName"
                            label="Unit Name*"
                            variant="standard"
                            value={unitName}
                            onChange={handleUnitNameChange}
                            sx={{ marginBottom: 5 }} />
                    </FormControl>

                    <FormControl fullWidth>
                        <InputLabel id="unitTypeLabelId">Unit Type*</InputLabel>
                        <Controller
                            render={({ field }) => (
                                <Select
                                    {...field}
                                    value={unitType}
                                    {...register('unitTypeId')}
                                    error={errors.unitTypeId ? true : false}
                                    onChange={handleUnitTypeChange}>
                                    {
                                        Object.entries(VALID_UNIT_TYPES).map(entry => (
                                            <MenuItem key={entry[1]} value={entry[1]}>{entry[1]}</MenuItem>
                                        ))
                                    }
                                </Select>
                            )}
                            control={control}
                            name="unitTypeId" />
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <CustomizedOutlinedButton onClick={onCloseHandler}>Cancel</CustomizedOutlinedButton>
                    <CustomizedButton onClick={handleSubmit(onSaveHandler)}>Save</CustomizedButton>
                </DialogActions>
            </Dialog>
        </React.Fragment>
    )
}
