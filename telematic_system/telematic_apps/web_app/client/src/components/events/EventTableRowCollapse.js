import DeleteIcon from '@mui/icons-material/Delete';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { Button, Collapse, IconButton, Tooltip, Typography } from '@mui/material';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { Box } from '@mui/system';
import * as React from 'react';
import WarningDialog from '../ui/WarningDialog';
import { ACTIVE_EVENT, DEFAULT_NA, INVALID_LOCATION_ID, INVALID_LOCATION_ID_STR, INVALID_TESTING_TYPE_ID, INVALID_TESTING_TYPE_ID_STR, LIVE_EVENT, PAST_EVENT, UNKNOW_DATE, UNKNOW_EVENT } from './EventMetadata';
import EventTableControlsItem from './EventTableControlsItem';
import EventTableItemPopover from './EventTableItemPopover';

const EventTableRowCollapse = (props) => {
    //Collapse Open/close
    const [open, setOpen] = React.useState(false);

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
            <TableRow hover role="checkbox" tabIndex={-1} key={props.eventRow.id}>
                <TableCell key={`${props.eventRow.id}-expand-icon`}>
                    <IconButton
                        aria-label="expand row"
                        size="small"
                        onClick={() => setOpen(!open)}>
                        {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                    </IconButton>
                </TableCell>
                {
                    props.columns.map((column) => {
                        let value = props.eventRow[column.id];
                        if (column.id === "end_at" || column.id === "start_at") {
                            const datetime = new Date(value);
                            value = datetime.toLocaleString();
                        }

                        if (column.id === "testing_type") {
                            value = (value === undefined || value.name === undefined || value.id === INVALID_TESTING_TYPE_ID
                                || value.id === INVALID_TESTING_TYPE_ID_STR) ? DEFAULT_NA : value.name
                        }

                        if (column.id === "location") {
                            value = (value === undefined || value.facility_name === undefined ||
                                value.id === INVALID_LOCATION_ID || value.id === INVALID_LOCATION_ID_STR) ? DEFAULT_NA : value.facility_name + " ," + value.city + " ," + value.state_code + " " + value.zip_code
                        }

                        if (column.id === "status") {
                            if (value !== undefined && value.length > 0 && value.toLowerCase() === LIVE_EVENT.toLowerCase()) {
                                value = LIVE_EVENT;
                            } else {
                                const start_ts = new Date(props.eventRow['start_at']).getTime();
                                const end_ts = new Date(props.eventRow['end_at']).getTime();
                                if (new Date().getTime() <= end_ts && new Date().getTime() >= start_ts) {
                                    value = ACTIVE_EVENT;
                                } else if (new Date().getTime() > end_ts || new Date().getTime() < start_ts) {
                                    value = PAST_EVENT;
                                } else {
                                    value = UNKNOW_EVENT;
                                }
                            }
                        }
                        return (
                            <TableCell sx={{
                                color: value.toLowerCase() === LIVE_EVENT.toLowerCase() ? "#33bfff" : "",
                                fontWeight: value.toLowerCase() === LIVE_EVENT.toLowerCase() ? "bolder" : ""
                            }}
                                key={`event-row-${props.eventRow.id}-${column.id}`} align={column.align}>
                                {value}

                                {
                                    column.id === "name" && props.eventRow.description !== '' &&
                                    <EventTableItemPopover info={props.eventRow.description} />
                                }
                            </TableCell>
                        );
                    })
                }
                <EventTableControlsItem eventRow={props.eventRow} unitList={props.unitList} locationList={props.locationList} testingTypeList={props.testingTypeList} onEventSaveHandler={props.onEventSaveHandler} onDeleteEvent={props.onDeleteEvent} onAssignUnitHandler={props.onAssignUnitHandler} />
            </TableRow>

            <TableRow>
                <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={8}>
                    <Collapse in={open} timeout="auto" unmountOnExit>
                        <Box sx={{ margin: 1 }}>
                            <Typography variant="inherit" sx={{ fontWeight: 'bolder' }} gutterBottom component="div">
                                Unit Assignment History
                            </Typography>
                            <Table size="small" aria-label="purchases">
                                <TableHead >
                                    <TableRow >
                                        <TableCell sx={{ fontWeight: 'bolder' }} key={`Unit-name`}>Unit Name</TableCell>
                                        <TableCell sx={{ fontWeight: 'bolder' }} key={`Unit-type`}>Unit Type</TableCell>
                                        <TableCell sx={{ fontWeight: 'bolder' }} key={`Unit-start-date`}>Start Datetime</TableCell>
                                        <TableCell sx={{ fontWeight: 'bolder' }} key={`Unit-end-date`}>End Datetime</TableCell>
                                        <TableCell sx={{ fontWeight: 'bolder' }} key={`Unit-controls`}>Controls</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {
                                        props.eventRow.units !== undefined &&
                                        props.eventRow.units.length !== 0 &&
                                        props.eventRow.units.map((unit) => (
                                            <TableRow key={`Unit-row-${unit.unit_identifier}`}>
                                                <TableCell component="th" scope="row" key={`${props.eventRow.id}-Unit-name-${unit.unit_identifier}`}>
                                                    {unit.unit_name} ({unit.unit_identifier} )
                                                </TableCell>
                                                <TableCell component="th" scope="row" key={`${props.eventRow.id}-Unit-type-${unit.unit_type}-${Math.random()*100}`}>
                                                    {unit.unit_type} 
                                                </TableCell>
                                                {props.eventRow.event_units !== undefined &&
                                                    <React.Fragment>
                                                        <TableCell key={`${props.eventRow.id}-Unit-${unit.unit_identifier}-start-${props.eventRow.event_units.filter(event_unit => event_unit.unitId === unit.id)[0].start_time}`}>
                                                            {new Date(props.eventRow.event_units.filter(event_unit => event_unit.unitId === unit.id)[0].start_time).toLocaleString()}
                                                        </TableCell>
                                                        <TableCell key={`${props.eventRow.id}-Unit-${unit.unit_identifier}-end-${props.eventRow.event_units.filter(event_unit => event_unit.unitId === unit.id)[0].end_time}`}>
                                                            {new Date(props.eventRow.event_units.filter(event_unit => event_unit.unitId === unit.id)[0].end_time).toLocaleString()}
                                                        </TableCell>
                                                    </React.Fragment>
                                                }

                                                {props.eventRow.event_units === undefined &&
                                                    <React.Fragment>
                                                        <TableCell key={`${props.eventRow.id}-Unit-${unit.unit_identifier}-start`}>
                                                            {UNKNOW_DATE}
                                                        </TableCell>
                                                        <TableCell key={`${props.eventRow.id}-Unit-${unit.unit_identifier}-end`}>
                                                            {UNKNOW_DATE}
                                                        </TableCell>
                                                    </React.Fragment>
                                                }
                                                <TableCell key={`${props.eventRow.id}-Unit-${unit.unit_identifier}-controls`}>
                                                    <WarningDialog open={openWarningDialog} onConfirm={event => onConfirmUnassignUnitHandler(event, props.eventRow, unit)} onCloseWarning={handleCloseWarningDialog} title="Unassign Unit Alert" description={`Are you sure to unassign ${unit.unit_identifier} from event ${props.eventRow.name}?`} />
                                                    <Tooltip title="Unassign Unit" placement="top" arrow>
                                                        <Button variant='outlined' size="small" key={`${props.eventRow.id}-Unit-${unit.unit_identifier}-unassign`} onClick={handleOpenWarningDialog}>
                                                            <DeleteIcon sx={{ color: "primary.main" }} />
                                                        </Button>
                                                    </Tooltip>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                </TableBody>
                            </Table>
                        </Box>
                    </Collapse>
                </TableCell>
            </TableRow>
        </React.Fragment>
    )
}

export default EventTableRowCollapse