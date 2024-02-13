import DeleteIcon from '@mui/icons-material/Delete';
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TableCell, TableRow, Tooltip } from '@mui/material';
import React, { useState } from 'react';
import { CustomizedButton } from '../../ui/CustomizedButton';
import { CustomizedIcon } from '../../ui/CustomizedIcon';
import { CustomizedOutlinedButton } from '../../ui/CustomizedOutlinedButton';
import RolesDropDown from './RolesDropDown';
const UserOrgROleTableRow = (props) => {
    const [open, setOpen] = useState(false);
    const handleOrgUserRoleChange = (role) => {
        props.onUserOrgRoleChange({
            user_id: props.userOrgRole.user_id,
            org_id: props.userOrgRole.org_id,
            role: role,
            org_name: props.userOrgRole.org_name,
            login: props.userOrgRole.login,
            is_admin: props.userOrgRole.is_admin
        });
    }

    const handleOrgUserRoleDelete = () => {
        setOpen(true);
    }

    const handleClose = (event) => {
        setOpen(false);
    }

    const handleConfirmDelete = () => {
        props.onUserOrgRoleDelete({
            user_id: props.userOrgRole.user_id,
            org_id: props.userOrgRole.org_id
        });
        setOpen(false);
    }

    return (
        <React.Fragment>
            <Dialog onClose={handleClose} open={open}>
                <DialogTitle sx={{ fontWeight: 'bold' }}>Are you sure you want to delete this user ({props.userOrgRole.login}) from organization ({props.userOrgRole.org_name})?</DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description-delete">
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <CustomizedOutlinedButton onClick={handleClose}>No</CustomizedOutlinedButton>
                    <CustomizedButton onClick={handleConfirmDelete}>Yes</CustomizedButton>
                </DialogActions>
            </Dialog>
            <TableRow
                key={props.userOrgRole.login + props.userOrgRole.org_name + props.userOrgRole.role}
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                <TableCell scope="row" key={`edit-user-role-org-name-${props.userOrgRole.login}-${props.userOrgRole.org_name}`}>
                    {props.userOrgRole.org_name}
                </TableCell>
                <TableCell scope="row" key={`edit-user-role-org-name-${props.userOrgRole.login}-${props.userOrgRole.role}`}>
                    <RolesDropDown role={props.userOrgRole.role} onUserOrgRoleChange={handleOrgUserRoleChange} />
                </TableCell>
                <TableCell scope='row' key={`edit-user-role-control-${props.userOrgRole.login}-${props.userOrgRole.org_name}`}>
                    <CustomizedIcon onClick={handleOrgUserRoleDelete} title={`Remove user from ${props.userOrgRole.org_name} organization`}><DeleteIcon /></CustomizedIcon>
                </TableCell>
            </TableRow>
        </React.Fragment>
    )
}

export default UserOrgROleTableRow