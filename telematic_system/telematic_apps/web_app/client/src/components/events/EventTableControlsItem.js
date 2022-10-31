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
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import ElectricCarIcon from '@mui/icons-material/ElectricCar';
import { Button, Tooltip } from '@mui/material';
import TableCell from '@mui/material/TableCell';
import * as React from 'react';
import WarningDialog from '../ui/WarningDialog';
import { AssignDashboardDialog } from './AssignDashboardDialog';
import { AssignUnitDialog } from './AssignUnitDialog';
import DashboardDropDownMenu from './DashboardDropDownMenu';
import { EditEventDialog } from './EditEventDialog';

const EventTableControlsItem = (props) => {
  //Assign a dashboard Dialog
  const [openAssignDashboardDialog, setOpenAssignDashboardDialog] = React.useState(false);
  const handleOpenAssignDashboardDialog = () => {
    setOpenAssignDashboardDialog(true);
  };
  const handleCloseAssignDashboardDialog = () => {
    setOpenAssignDashboardDialog(false);
  };

  //Assign a Unit Dialog
  const [openAssignUnitDialog, setOpenAssignUnitDialog] = React.useState(false);
  const handleOpenAssignUnitDialog = () => {
    setOpenAssignUnitDialog(true);
  };
  const handleCloseAssignUnitDialog = () => {
    setOpenAssignUnitDialog(false);
  };
  const onAssignUnitHandler = (assignedUnitInfo) => {
    props.onAssignUnitHandler(assignedUnitInfo);
    setOpenAssignUnitDialog(false);
  }

  //Edit Event Dialog
  const [openEditEventDialog, setOpenEditEventDialog] = React.useState(false);
  const handleOpenEditEventDialog = () => {
    setOpenEditEventDialog(true);
  };
  const onEventSaveHandler = (eventInfo) => {
    props.onEventSaveHandler(eventInfo);
    setOpenEditEventDialog(false);
  }
  const onCloseEventDialog = () => {
    setOpenEditEventDialog(false);
  }

  //Open Warning Dialog
  const [openWarningDialog, setOpenWarningDialog] = React.useState(false);
  const handleOpenWarningDialog = () => {
    setOpenWarningDialog(true);
  }
  const handleCloseWarningDialog = () => {
    setOpenWarningDialog(false);
  }
  const onConfirmDeleteEventHandler = (event, id) => {
    props.onDeleteEvent(id);
    setOpenWarningDialog(false);
  }

  return (
    <React.Fragment>

      <TableCell tabIndex={-1} key={`dashboard-${props.eventRow.id}`}>
        <AssignDashboardDialog close={!openAssignDashboardDialog} open={openAssignDashboardDialog} onCloseAssignDashboardDialog={handleCloseAssignDashboardDialog} />
        <DashboardDropDownMenu onOpenAssignDashboardDialog={handleOpenAssignDashboardDialog} />
      </TableCell>

      <TableCell tabIndex={-1} key={`controls-${props.eventRow.id}`}>
        <EditEventDialog title="Edit Event" locationList={props.locationList} testingTypeList={props.testingTypeList} eventInfo={props.eventRow} onEventSaveHandler={onEventSaveHandler} onCloseEventDialog={onCloseEventDialog} close={!openEditEventDialog} open={openEditEventDialog} />
        <Tooltip title="Edit Event" placement="top" arrow>
          <Button variant='outlined' size="small" key={`edit-event-${props.eventRow.id}`} onClick={handleOpenEditEventDialog}>
            <EditIcon sx={{ color: "primary.main" }} />
          </Button>
        </Tooltip>

        <WarningDialog open={openWarningDialog} onConfirm={event => onConfirmDeleteEventHandler(event, props.eventRow.id)} onCloseWarning={handleCloseWarningDialog} title="Delete Event Alert" description={`Are you sure to delete event ${props.eventRow.name}?`} />
        <Tooltip title="Delete Event" placement="top" arrow>
          <Button variant='outlined' size="small" key={`delete-event-${props.eventRow.id}`} onClick={handleOpenWarningDialog}>
            <DeleteIcon sx={{ color: "primary.main" }} />
          </Button>
        </Tooltip>

        <AssignUnitDialog eventInfo={props.eventRow} unitList={props.unitList} onAssignUnitHandler={onAssignUnitHandler} close={!openAssignUnitDialog} open={openAssignUnitDialog} onCloseAssignUnitDialog={handleCloseAssignUnitDialog} />
        <Tooltip title="Assign Unit " placement="top" arrow>
          <Button variant='outlined' size="small" key={`assign-Units-for-event-${props.eventRow.eventId}`} onClick={handleOpenAssignUnitDialog}>
            <ElectricCarIcon sx={{ color: "primary.main" }} />
          </Button>
        </Tooltip>
      </TableCell>
    </React.Fragment>
  )
}

export default EventTableControlsItem