import React from 'react';
import { UnitFormDialog } from './UnitFormDialog';

export const AddUnitDialog = (props) => {
    const onCloseHandler = () => {
        props.onCloseAddUnitDialog();
    }

    const onSaveHandler = (unit) => {
        props.onSave(unit);
    }
    return (
        <React.Fragment>
            <UnitFormDialog open={props.open} onClose={onCloseHandler} onSave={onSaveHandler} />
        </React.Fragment>
    )
}
