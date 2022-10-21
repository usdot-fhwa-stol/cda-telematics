
import React from 'react';
import LocationFormDialog from './LocationFormDialog';

export const AddLocationDialog = (props) => {

    const onCloseHandler = () => {
        props.onCloseAddLocationDialog();
    }

    const onSaveLocationHandler = (location) => {
        props.onSaveLocation(location);
    }

    return (
        <React.Fragment>
            <LocationFormDialog open={props.open} stateList={props.stateList} onSaveLocation={onSaveLocationHandler} onClose={onCloseHandler} />
        </React.Fragment>
    )
}
