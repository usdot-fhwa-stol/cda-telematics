import React from 'react';
import { EventFormDialog } from './EventFormDialog';

export const EditEventDialog = (props) => {   

    const onCloseHandler = () => {
        props.onCloseEventDialog();
    }

    const onEventSaveHandler = (updatedEventInfo) => {
        props.onEventSaveHandler(updatedEventInfo);
    }

    return (
        <React.Fragment>
            <EventFormDialog eventInfo={props.eventInfo} title="Edit Event" locationList={props.locationList}  testingTypeList={props.testingTypeList}  open={props.open} onEventSaveHandler={onEventSaveHandler} onCloseHandler={onCloseHandler} />
        </React.Fragment >
    )
}
