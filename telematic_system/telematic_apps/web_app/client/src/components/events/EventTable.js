/*
 * Copyright (C) 2019-2022 LEIDOS.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not
 * use this file except in compliance with the License. You may obtain a copy of
 * the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
 */
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import * as React from 'react';
import AuthContext from '../../context/auth-context';
import { USER_ROLES } from '../users/UserMetadata';
import EventTableItemPopover from './EventTableItemPopover';
import EventTableRowCollapse from './EventTableRowCollapse';

const columns = [
  { id: 'name', label: 'Event Name', minWidth: 170, info: '' },
  { id: 'testing_type', label: 'Testing Type', minWidth: 100, info: '' },
  { id: 'location', label: 'Location', minWidth: 170, align: 'right', info: '' },
  { id: 'start_at', label: 'Start Time & Date', minWidth: 170, align: 'right', format: (value) => value.toLocaleString('en-US'), info: '' },
  { id: 'end_at', label: 'End Time & Date', minWidth: 170, align: 'right', format: (value) => value.toLocaleString('en-US'), info: '' },
  { id: 'status', label: 'Event Status', minWidth: 170, info: 'Past event: An event end Time & Date is prior to the current Time & Date. Active event: Current Time & Date is within the event start and end Time & Date. Live event: There are running units currently testing for this event.' }
];

export default function EventTable(props) {
  const authCtx = React.useContext(AuthContext)
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
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
              {
                authCtx.role !== USER_ROLES.VIEWER && authCtx.role !== USER_ROLES.VIEWER && authCtx.role !== undefined && authCtx.role !== null && authCtx.role !== "" &&
                <TableCell tabIndex={-1} key={`controls`} style={{ top: 0, fontWeight: "bolder", backgroundColor: "#eee" }}>
                  Controls
                </TableCell>
              }
            </TableRow>
          </TableHead>
          <TableBody>
            {props.eventInfoList !== undefined &&
              Array.isArray(props.eventInfoList) &&
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
        count={props.eventInfoList !== undefined && Array.isArray(props.eventInfoList) ? props.eventInfoList.length : 0}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Paper>
  );
}
