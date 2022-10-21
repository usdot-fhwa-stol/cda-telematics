
import React from 'react';
import UnitTopicList from './UnitTopicList';

const InfrastructureTopicList = React.memo((props) => {
    return (
        <React.Fragment>
            <UnitTopicList availableUnits={props.availableUnits} unitSectionTitle="Infrastructures"/>
        </React.Fragment>
    )
});

export default InfrastructureTopicList