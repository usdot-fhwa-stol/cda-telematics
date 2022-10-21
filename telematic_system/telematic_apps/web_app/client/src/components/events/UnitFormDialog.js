import { yupResolver } from '@hookform/resolvers/yup';
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, FormControl, InputLabel, MenuItem, Select, TextField } from '@mui/material';
import React, { useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import * as Yup from 'yup';
import { VALID_UNIT_TYPES } from './EventMetadata';

export const UnitFormDialog = (props) => {
    const unitIdRef = useRef(null);
    const unitNameRef = useRef(null);
    const [unitType, setUnitType] = useState('');

    const onCloseHandler = () => {
        setUnitType('');
        props.onClose();
    }
    const handleUnitTypeChange = (event)=>{
        setUnitType(event.target.value);
    }

    const onSaveHandler = () => {
        const unit = {
            unit_identifier: unitIdRef.current.value,
            unit_name: unitNameRef.current.value,
            unit_type: unitType
        }
        props.onSave(unit);
    }

    const validationSchema = Yup.object().shape({
        unitId: Yup.string().required('Unit id is required'),
        unitName: Yup.string().required('Unit name is required'),
        unitTypeId: Yup.string().required('Unit type is required'),
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
                <DialogTitle sx={{ fontWeight: "bolder" }}>Add unit</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        To create a unit, please fill out the required fields (*), ensure unit id is unique, and click "SAVE".
                    </DialogContentText>
                    <FormControl fullWidth>
                        <TextField
                            {...register('unitId')}
                            error={errors.unitId ? true : false}
                            autoFocus
                            margin="dense"
                            id="unitId"
                            label="Unit ID*"
                            variant="standard"
                            inputRef={unitIdRef}
                            sx={{ marginBottom: 5 }} />
                    </FormControl>

                    <FormControl fullWidth>
                        <TextField
                            {...register('unitName')}
                            error={errors.unitName ? true : false}
                            autoFocus
                            margin="dense"
                            id="unitName"
                            label="Unit Name*"
                            variant="standard"
                            inputRef={unitNameRef}
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
                    <Button onClick={onCloseHandler}>Cancel</Button>
                    <Button onClick={handleSubmit(onSaveHandler)}>Save</Button>
                </DialogActions>
            </Dialog>
        </React.Fragment>
    )
}
