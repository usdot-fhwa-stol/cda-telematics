/*
 * Copyright (C) 2019-2024 LEIDOS.
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
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { Button, Tooltip } from '@mui/material';
import TableCell from '@mui/material/TableCell';
import * as React from 'react';
import AuthContext from '../../context/auth-context';
import WarningDialog from '../ui/WarningDialog';
import { USER_ROLES } from '../users/UserMetadata';
import { AssignUnitDialog } from './AssignUnitDialog';
import DashboardDropDownMenu from './DashboardDropDownMenu';
import { EditEventDialog } from './EditEventDialog';
import { CustomizedOutlinedButton } from '../ui/CustomizedOutlinedButton';

const EventTableControlsItem = (props) => {
  const authCtx = React.useContext(AuthContext)
  //Dashboards dropdown
  const [anchorEl, setAnchorEl] = React.useState(null);
  const handleClose = () => {
    setAnchorEl(null);
  };
  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
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
        <Tooltip title="List of Dashboards" placement="top" arrow>
          <Button
            id="dashboards-options-button"
            aria-controls={open ? 'demo-customized-menu' : undefined}
            aria-haspopup="true"
            aria-expanded={open ? 'true' : undefined}
            variant="outlined"
            disableElevation
            sx={{
              backgroundColor: "#fff",
              borderColor: '#748c93',
              margin: "1px",
              color: "#748c93",}}
            onClick={handleClick}
            endIcon={<KeyboardArrowDownIcon />}>
            Dashboards
          </Button>
        </Tooltip>
        {open && <DashboardDropDownMenu anchorEl={anchorEl} open={open} handleClose={handleClose} eventRow={props.eventRow} />}
      </TableCell>
      {
        authCtx.role !== USER_ROLES.VIEWER && authCtx.role !== USER_ROLES.VIEWER && authCtx.role !== undefined && authCtx.role !== null && authCtx.role !== "" &&
        <TableCell tabIndex={-1} key={`controls-${props.eventRow.id}`}>
          <EditEventDialog title="Edit Event" locationList={props.locationList} testingTypeList={props.testingTypeList} eventInfo={props.eventRow} onEventSaveHandler={onEventSaveHandler} onCloseEventDialog={onCloseEventDialog} close={!openEditEventDialog} open={openEditEventDialog} />
          <CustomizedOutlinedButton title="Edit Event" key={`edit-event-${props.eventRow.id}`} onClick={handleOpenEditEventDialog}>
            <EditIcon />
          </CustomizedOutlinedButton>
          {
            openWarningDialog &&
            <WarningDialog open={openWarningDialog} onConfirm={event => onConfirmDeleteEventHandler(event, props.eventRow.id)} onCloseWarning={handleCloseWarningDialog} title="Delete Event Alert" description={`Are you sure to delete event ${props.eventRow.name}?`} />
          }
          <CustomizedOutlinedButton title="Delete Event"  key={`delete-event-${props.eventRow.id}`} onClick={handleOpenWarningDialog}>
            <DeleteIcon/>
          </CustomizedOutlinedButton>
          {
            openAssignUnitDialog && <AssignUnitDialog eventInfo={props.eventRow} unitList={props.unitList} onAssignUnitHandler={onAssignUnitHandler} close={!openAssignUnitDialog} open={openAssignUnitDialog} onCloseAssignUnitDialog={handleCloseAssignUnitDialog} />
          }
          <CustomizedOutlinedButton title="Assign Unit " key={`assign-Units-for-event-${props.eventRow.eventId}`} onClick={handleOpenAssignUnitDialog}>
              <ElectricCarIcon/>
          </CustomizedOutlinedButton>
        </TableCell>
      }
    </React.Fragment>
  )
}

export default EventTableControlsItem