import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import { Button, ButtonGroup, TableCell, TableRow, Tooltip } from '@mui/material';
import React, { useState } from 'react';
import UserOrgRoleEditDialog from './UserOrgRoleEditDialog';

const UserTableRow = (props) => {
    const [open, setOpen] = useState(false);
    const [curSelectedOrgsRoles, setSelectedUserOrgsRole] = useState([]);

    const handleClose = () => {
        setSelectedUserOrgsRole([]);
        setOpen(false)
    }
    const handleOpen = () => {
        updateSelectedUserOrgsRoles();
        setOpen(true);
    }
    const updateSelectedUserOrgsRoles = () => {
        let userOrgs = [];
        props.orgsUsers !== undefined && props.userRow !== undefined && props.orgsUsers.forEach(orgUser => {
            if (orgUser.user_id === props.userRow["id"]) {
                let org_name = getOrgNameById(orgUser.org_id);
                userOrgs.push({
                    user_id: orgUser.user_id,
                    org_id: orgUser.org_id,
                    org_name: org_name,
                    role: orgUser.role,
                    login: props.userRow.login,
                    is_admin: props.userRow.is_admin,
                    id: orgUser.id
                })
            }
        })
        if (userOrgs.length > 0) {
            setSelectedUserOrgsRole(userOrgs);
        }
    }

    const getOrgNameById = (org_id) => {
        let org_name = "";
        if (props.orgs !== undefined) {
            props.orgs.forEach(org => {
                if (org.id === org_id) {
                    org_name = org.name;
                }
            })
            return org_name
        }
        return org_name;
    }

    const handleAddUserToOrg = (data) => {
        let userOrgRole = {
            user_id: data.user_id,
            org_id: data.org_id,
            role: data.role,
            org_name: getOrgNameById(data.org_id),
            login: props.userRow.login,
            is_admin: props.userRow.is_admin
        }
        setSelectedUserOrgsRole(prev => [...prev, userOrgRole]);
        props.onAddUserToOrg(data);
    }

    const handleUserOrgRoleUpdate = (data) => {
        setSelectedUserOrgsRole(prev => [...prev.filter(item => {
            if (data.user_id === item.user_id && data.org_id === item.org_id) {
                return false;
            }
            return true;
        }), data]);
        props.onUserOrgRoleChange(data);
    }

    const handleUserOrgRoleDelete = (data) => {
        setSelectedUserOrgsRole(prev => [...prev.filter(item => {
            if (data !== undefined && data.user_id === item.user_id && data.org_id===item.org_id) {
                return false;
            }
            return true;
        })]);
        props.onUserOrgRoleDelete(data);
    }

    return (
        <React.Fragment>
            <TableRow key={`user-table-row-content-${props.userRow.id}`}>
                {
                    props.columns.map((column) => {
                        let value = props.userRow[column.id];
                        if (column.id === "org_role") {
                            return (
                                <TableCell
                                    key={`user-org-role-${props.userRow.id}-${column.id}`} align={column.align}>
                                    {
                                        props.orgsUsers !== undefined && props.orgsUsers.map(orgUser => {
                                            //Find roles for current user
                                            let org_name_role = "";
                                            if (orgUser.user_id === props.userRow["id"]) {
                                                if (props.orgs !== undefined) {
                                                    props.orgs.forEach(org => {
                                                        if (org.id === orgUser.org_id) {
                                                            //Find current user organization
                                                            if (props.userRow["org_id"] === org.id) {
                                                                org_name_role = `<strong style='color:green'>${org.name}: ${orgUser.role}</strong><br>`;
                                                            }
                                                            else {
                                                                org_name_role = `${org.name}: ${orgUser.role}`;
                                                            }
                                                        }
                                                    })
                                                }
                                                return <div key={orgUser.user_id + org_name_role} dangerouslySetInnerHTML={{ __html: org_name_role }}></div>
                                            }
                                        })
                                    }
                                </TableCell>
                            );
                        } else {
                            return (
                                <TableCell
                                    key={`user-table-row-cell-${props.userRow.id}-${column.id}`} align={column.align} orgsUsers={props.orgsUsers}>
                                    {value}
                                </TableCell>
                            );
                        }
                    })
                }
                <TableCell key={`user-table-row-actions-${props.userRow.id}`}>
                    <ButtonGroup variant="outlined" aria-label="controls">
                        <Tooltip key={`user-table-row-control-${props.userRow.id}`} title="Update user organizations and roles">
                            <Button onClick={handleOpen}><AssignmentIndIcon /></Button>
                        </Tooltip>
                    </ButtonGroup>
                </TableCell>
            </TableRow>
            {open && <UserOrgRoleEditDialog key={'user-org-dialog'}
                open={open}
                onClose={handleClose}
                orgs={props.orgs}
                userRow={props.userRow}
                onAddUserToOrg={handleAddUserToOrg}
                curSelectedOrgsRoles={curSelectedOrgsRoles}
                onUserOrgRoleChange={handleUserOrgRoleUpdate}
                onUserOrgRoleDelete={handleUserOrgRoleDelete} 
                onChangeServerAdmin ={props.onChangeServerAdmin}/>}
        </React.Fragment>
    )
}

export default UserTableRow