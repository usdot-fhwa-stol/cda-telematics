import React from 'react';
import { EventFormDialog } from './EventFormDialog';


export const AddEventDialog = (props) => {
    const onCloseHandler = () => {
        props.onCloseEventDialog();
    }

    const onEventSaveHandler = (createdEventInfo) => {
        props.onEventSaveHandler(createdEventInfo);
    }

    return (
        <React.Fragment>
            <EventFormDialog open={props.open} title="Add Event" locationList={props.locationList} testingTypeList={props.testingTypeList}  onEventSaveHandler={onEventSaveHandler} onCloseHandler={onCloseHandler} />
        </React.Fragment >
    )
}
