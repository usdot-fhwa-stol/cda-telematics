import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import * as React from 'react';
import EventTableItemPopover from './EventTableItemPopover';
import EventTableRowCollapse from './EventTableRowCollapse';

const columns = [
  { id: 'name', label: 'Event Name', minWidth: 170, info: '' },
  { id: 'testing_type', label: 'Testing Type', minWidth: 100, info: '' },
  { id: 'location', label: 'Location', minWidth: 170, align: 'right', info: '' },
  { id: 'start_at', label: 'Start Datetime', minWidth: 170, align: 'right', format: (value) => value.toLocaleString('en-US'), info: '' },
  { id: 'end_at', label: 'End Datetime', minWidth: 170, align: 'right', format: (value) => value.toLocaleString('en-US'), info: '' },
  { id: 'status', label: 'Event Status', minWidth: 170, info: 'Past event: An event end datetime is prior to the current datetime. Active event: Current datetime is within the event start and end datetime. Live event: There are running units currently testing for this event.' }
];

export default function EventTable(props) {
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
    console.log(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const onDeleteEventHandler = (id) => {
    props.onDeleteEvent(id);
  };

  const onEventSaveHandler = (eventInfo) => {
    props.onEventSaveHandler(eventInfo);
  }

  const onAssignUnitHandler = (unitsInfo) => {
    props.onAssignUnitHandler(unitsInfo);
  }

  const onConfirmUnassignUnitHandler = (unitsInfo) => {
    props.onConfirmUnassignUnitHandler(unitsInfo);
  }

  return (
    <Paper sx={{ width: '100%' }}>
      <TableContainer sx={{ minHeight: 0, overflowY: 'scroll', overflowX: 'hidden', maxHeight: "600px" }}>
        <Table stickyHeader aria-label="sticky table">
          <TableHead  >
            <TableRow >
              <TableCell key={'header-space'} style={{ backgroundColor: "#eee" }}>&nbsp;</TableCell>
              {columns.map((column) => (
                <TableCell
                  key={column.id}
                  align={column.align}
                  style={{ top: 0, minWidth: column.minWidth, fontWeight: "bolder", backgroundColor: "#eee" }}>
                  {column.label}
                  {column.info !== '' && <EventTableItemPopover info={column.info} />}
                </TableCell>
              ))}
              <TableCell tabIndex={-1} key={`dashboard`} style={{ top: 0, fontWeight: "bolder", backgroundColor: "#eee" }}>
                Dashboards
              </TableCell>
              <TableCell tabIndex={-1} key={`controls`} style={{ top: 0, fontWeight: "bolder", backgroundColor: "#eee" }}>
                Controls
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {props.eventInfoList !== undefined &&
              props.eventInfoList
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map(
                  (eventRow) => {
                    return (
                      <EventTableRowCollapse key={eventRow.id} eventRow={eventRow} columns={columns} unitList={props.unitList} locationList={props.locationList} testingTypeList={props.testingTypeList} onEventSaveHandler={onEventSaveHandler} onDeleteEvent={onDeleteEventHandler} onAssignUnitHandler={onAssignUnitHandler} onConfirmUnassignUnitHandler={onConfirmUnassignUnitHandler} />
                    );
                  })}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[10, 25, 100]}
        component="div"
        count={props.eventInfoList !== undefined ? props.eventInfoList.length : 0}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Paper>
  );
}
