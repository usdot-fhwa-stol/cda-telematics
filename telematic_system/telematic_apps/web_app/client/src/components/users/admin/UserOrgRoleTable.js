import { Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';
import React from 'react';
import UserOrgRoleTableRow from './UserOrgRoleTableRow';
const UserOrgRoleTable = (props) => {
    return (
        <React.Fragment>
            <Table size="small" aria-label="user-role-table" >
                <TableHead >
                    <TableRow >
                        <TableCell key={`edit-user-role-org-name`} sx={{ fontWeight: "bolder" }}>Organization Name</TableCell>
                        <TableCell key={`edit-user-role-user-role`} sx={{ fontWeight: "bolder" }}>User Role</TableCell>
                        <TableCell key={`edit-user-role-control`} sx={{ fontWeight: "bolder" }}>Controls</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {props.userCurOrgsRoles !== undefined && props.userCurOrgsRoles.map((userOrgRole) => (
                        <UserOrgRoleTableRow userOrgRole={userOrgRole}
                            onUserOrgRoleChange={props.onUserOrgRoleChange}
                            onUserOrgRoleDelete={props.onUserOrgRoleDelete}
                            onChangeServerAdmin ={props.onChangeServerAdmin} />
                    ))}
                </TableBody>
            </Table>
        </React.Fragment>
    )
}

export default UserOrgRoleTable