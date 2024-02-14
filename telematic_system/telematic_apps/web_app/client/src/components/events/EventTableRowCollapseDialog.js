import DeleteIcon from '@mui/icons-material/Delete';
import { TableCell } from '@mui/material';
import React from 'react';
import { CustomizedOutlinedButton } from '../ui/CustomizedOutlinedButton';
import WarningDialog from '../ui/WarningDialog';

const EventTableRowCollapseDialog = (props) => {
    //Open Warning Dialog
    const [openWarningDialog, setOpenWarningDialog] = React.useState(false);
    const handleOpenWarningDialog = () => {
        setOpenWarningDialog(true);
    }
    const handleCloseWarningDialog = () => {
        setOpenWarningDialog(false);
    }
    const onConfirmUnassignUnitHandler = (event, eventRow, unit) => {
        const event_unit = {
            event_id: eventRow.id,
            unit: unit
        }
        props.onConfirmUnassignUnitHandler(event_unit);
        setOpenWarningDialog(false);
    }
    return (
        <TableCell key={`${props.eventRow.id}-Unit-${props.unit.unit_identifier}-controls`}>
            {
                openWarningDialog && <WarningDialog open={openWarningDialog} onConfirm={event => onConfirmUnassignUnitHandler(event, props.eventRow, props.unit)} onCloseWarning={handleCloseWarningDialog} title={`Unassign Unit Alert`} description={`Are you sure to unassign ${props.unit.unit_identifier} from event ${props.eventRow.name}?`} />
            }
                <CustomizedOutlinedButton  title="Unassign Unit" key={`${props.eventRow.id}-Unit-${props.unit.unit_identifier}-unassign`} onClick={handleOpenWarningDialog}><DeleteIcon/></CustomizedOutlinedButton>
        </TableCell>
    )
}

export default EventTableRowCollapseDialog