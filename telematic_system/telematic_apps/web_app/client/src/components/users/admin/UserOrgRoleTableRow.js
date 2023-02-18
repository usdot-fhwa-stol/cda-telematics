import DeleteIcon from '@mui/icons-material/Delete';
import { Button, TableCell, TableRow, Tooltip } from '@mui/material';
import React from 'react';
import RolesDropDown from './RolesDropDown';
const UserOrgROleTableRow = (props) => {
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
        props.onUserOrgRoleDelete({
            user_id: props.userOrgRole.user_id,
            org_id: props.userOrgRole.org_id
        });
    }

    return (
        <React.Fragment>
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
                    <Tooltip title={`Remove user from ${props.userOrgRole.org_name} organization`}
                        placement="top-start">
                        <Button onClick={handleOrgUserRoleDelete}><DeleteIcon /></Button>
                    </Tooltip>
                </TableCell>
            </TableRow>
        </React.Fragment>
    )
}

export default UserOrgROleTableRow