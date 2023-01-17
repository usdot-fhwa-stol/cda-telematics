import DeleteIcon from '@mui/icons-material/Delete';
import { Button, TableCell, Tooltip } from '@mui/material';
import React from 'react';
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
        <React.Fragment>
            <TableCell key={`${props.eventRow.id}-Unit-${props.unit.unit_identifier}-controls`}>

                <WarningDialog open={openWarningDialog} onConfirm={event => onConfirmUnassignUnitHandler(event, props.eventRow, props.unit)} onCloseWarning={handleCloseWarningDialog} title={`Unassign Unit Alert`} description={`Are you sure to unassign ${props.unit.unit_identifier} from event ${props.eventRow.name}?`} />
                <Tooltip title="Unassign Unit" placement="top" arrow>
                    <Button variant='outlined' size="small" key={`${props.eventRow.id}-Unit-${props.unit.unit_identifier}-unassign`} onClick={handleOpenWarningDialog}>
                        <DeleteIcon sx={{ color: "primary.main" }} />
                    </Button>
                </Tooltip>
            </TableCell>
        </React.Fragment>
    )
}

export default EventTableRowCollapseDialog