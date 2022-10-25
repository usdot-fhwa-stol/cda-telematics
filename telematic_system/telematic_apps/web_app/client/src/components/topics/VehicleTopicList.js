
import React from 'react';
import UnitTopicList from './UnitTopicList';

const VehicleTopicList = React.memo((props) => {
    return (
        <React.Fragment>
            <UnitTopicList availableUnits={props.availableUnits} unitSectionTitle="Vehicles"/>
        </React.Fragment>
    )
});

export default VehicleTopicList