import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Divider, FormControl, FormHelperText, Grid, InputLabel, MenuItem, Select, ToggleButton, ToggleButtonGroup, Tooltip, Typography } from '@mui/material';
import { Box } from '@mui/system';
import React, { useState } from 'react';
import AuthContext from '../../../context/auth-context';
import RolesDropDown from './RolesDropDown';
import UserOrgRoleTable from './UserOrgRoleTable';

const UserOrgRoleEditDialog = (props) => {
    const [isAdmin, setIsAdmin] = React.useState('NO');
    const [isChangeAdmin, setIsChangeAdmin] = React.useState(false);
    const [selectedOrg, setSelectedOrg] = React.useState('');
    const [orgAssignErr, setOrgAssignErr] = React.useState({});
    const [selectedOrgRole, setSelectedOrgRole] = React.useState('');
    const authContxt = React.useContext(AuthContext);
    const handleUserRoleChange = (role) => {
        setSelectedOrgRole(role);
    }
    const handleClose = () => {
        setSelectedOrgRole('');
        setSelectedOrg('');
        setIsAdmin(false);
        setIsChangeAdmin(false);
        props.onClose();
    }
    const handleOrgChange = (event) => {
        setSelectedOrg(event.target.value);
    }

    const onClickisChangeAdmin = () => {
        if (props.userRow !== undefined) {
            setIsAdmin(props.userRow.is_admin.toUpperCase());
        }
        setIsChangeAdmin(true);
    }
    const handleIsChangeAdminConfirm = (event) => {
        if (event.target.value === 'y') {
            if (isAdmin !== props.userRow.is_admin.toUpperCase()) {
                //If confirmed to change to server admin
                let updatedUser = {
                    user_id: props.userRow.id,
                    is_admin: isAdmin.trim() === "YES" ? 1 : 0
                };
                props.onChangeServerAdmin(updatedUser);
            }

        }
        setIsChangeAdmin(false);
    };

    const handleAdminValue = (event) => {
        setIsAdmin(event.target.value);
    }

    const handleAddUserToOrg = () => {
        if (selectedOrg === '') {
            setOrgAssignErr({
                color: "red",
                message: "Organization is required."
            });
            return;
        }
        if (props.curSelectedOrgsRoles !== undefined
            && props.curSelectedOrgsRoles.length > 0
            && props.curSelectedOrgsRoles[0].login !== undefined) {
            let isInOrg = false;
            props.curSelectedOrgsRoles.every(item => {
                if (item.org_id === selectedOrg) {
                    setOrgAssignErr({
                        color: "orange",
                        message: "User already in this org."
                    });
                    isInOrg = true;
                    return false;
                }
                return true;
            })
            if (isInOrg) { return; }
            if (selectedOrgRole === '') {
                setOrgAssignErr({
                    color: "red",
                    message: "Role is required."
                });
                return;
            }

            props.onAddUserToOrg({
                org_id: selectedOrg,
                user_id: props.curSelectedOrgsRoles[0].user_id,
                role: selectedOrgRole
            })
            setOrgAssignErr({
                color: "",
                message: ""
            });
            setSelectedOrgRole('');
            setSelectedOrg('');
        } else if (selectedOrg !== ''
            && selectedOrgRole !== ''
            && props.userRow !== undefined
            && props.userRow.id !== undefined) {
            props.onAddUserToOrg({
                org_id: selectedOrg,
                user_id: props.userRow.id,
                role: selectedOrgRole
            });
            setSelectedOrgRole('');
            setSelectedOrg('');
        }
        else {
            setOrgAssignErr({
                color: "red",
                message: "Cannot assign organization due to error!"
            })
        }
    }

    return (
        <React.Fragment>
            <Dialog open={props.open} onClose={handleClose}>
                <DialogTitle sx={{ fontWeight: "bolder" }}>
                    Update roles and organizations for user :  <Box sx={{ display: "inline", color: 'green' }}>
                        {
                            props.userRow !== undefined &&
                                props.userRow.login !== undefined ? props.userRow.login : ""
                        }
                    </Box>
                </DialogTitle>
                <DialogContent>
                    {
                        parseInt(authContxt.is_admin) === 1 &&
                        <DialogContentText sx={{ fontStyle: "italic", color: "#444444" }}>
                            Server administrators are allowed to access the list of all existing organizations and assign organizations to all users.
                            The server admin can also set other users as server admin.
                        </DialogContentText>

                    }
                    {
                        parseInt(authContxt.is_admin) === 1 &&
                        <Box
                            sx={{ marginTop: 2, marginBottom: 2 }}>
                            <Typography sx={{ fontWeight: 'bolder', display: "block" }}>Organizations</Typography>
                            <FormControl
                                size='small'
                                fullWidth
                                margin='normal'>
                                <InputLabel id="org-selection-label">All Organizations</InputLabel>
                                <Select
                                    labelId='all-orgs'
                                    id='org-selection'
                                    label='All Organizations'
                                    value={selectedOrg}
                                    onChange={handleOrgChange}>
                                    {
                                        props.orgs !== undefined && props.orgs.map(org => {
                                            return <MenuItem value={org.id} key={org.id}>{org.name}</MenuItem>
                                        })
                                    }
                                </Select>
                            </FormControl>
                            <RolesDropDown role={selectedOrgRole} onUserOrgRoleChange={handleUserRoleChange} />
                            <Tooltip title="Click assign button to add user to the selected organizations." placement="top-start">
                                <Button onClick={handleAddUserToOrg} data-testid='assign-user-to-org' variant="contained" sx={{ marginTop: 1 }}>Assign</Button>
                            </Tooltip>
                            {
                                orgAssignErr.color !== undefined && orgAssignErr.message !== undefined &&
                                <FormHelperText sx={{
                                    color: orgAssignErr.color,
                                    display: 'inline',
                                    marginLeft: 2,
                                    fontSize: '110%'
                                }}>
                                    {orgAssignErr.message}
                                </FormHelperText>
                            }
                        </Box>
                    }
                    {
                        parseInt(authContxt.is_admin) === 1 &&
                        <Divider />
                    }
                    {
                        parseInt(authContxt.is_admin) === 1 &&
                        <FormControl fullWidth>
                            <Box component="div" sx={{ marginTop: 2, marginBottom: 1 }}>
                                <Typography sx={{ fontWeight: 'bolder', display: "block" }}>Server Admin</Typography>
                                <Grid container spacing={1} >
                                    <Grid item xs={8}>
                                        Is Server Admin : {
                                            props.userRow !== undefined && !isChangeAdmin
                                            && props.userRow.is_admin.toUpperCase()
                                        }
                                        {
                                            props.userRow !== undefined && isChangeAdmin &&
                                            <ToggleButtonGroup
                                                color="primary"
                                                value={isAdmin}
                                                exclusive
                                                onChange={handleAdminValue}
                                                aria-label="text alignment">
                                                <ToggleButton value="YES" aria-label="YES aligned" data-testid="YES-aligned" >
                                                    Yes
                                                </ToggleButton>
                                                <ToggleButton value="NO" aria-label="NO aligned" data-testid="NO-aligned">
                                                    No
                                                </ToggleButton>
                                            </ToggleButtonGroup>
                                        }
                                    </Grid>
                                    <Grid item xs={4}>
                                        {!isChangeAdmin && <Button onClick={onClickisChangeAdmin} data-testid='change-to-admin-btn' >Change</Button>}
                                        {
                                            isChangeAdmin &&
                                            <ToggleButtonGroup
                                                size="small"
                                                color="primary"
                                                value='y'
                                                exclusive
                                                onChange={handleIsChangeAdminConfirm}
                                                aria-label="text alignment">
                                                <ToggleButton value="y" aria-label="Change aligned" data-testid='confirm-change-to-admin-toggle-btn'>
                                                    Change
                                                </ToggleButton>
                                                <ToggleButton value="n" aria-label="Cancel aligned">
                                                    Cancel
                                                </ToggleButton>
                                            </ToggleButtonGroup>
                                        }
                                    </Grid>
                                </Grid>
                            </Box>
                        </FormControl>
                    }
                    {
                        parseInt(authContxt.is_admin) === 1 &&
                        <Divider />
                    }
                    {
                        parseInt(authContxt.is_admin) === 1 &&
                        <Box sx={{ marginTop: 2, marginBottom: 1 }}>
                            <Typography sx={{ fontWeight: 'bolder', display: "block" }}>User organization roles</Typography>
                            <Typography sx={{ fontStyle: "italic", color: "#444444" }}>Note: Change the user role dropdown will update user role. Clicking the trash icon to remove the user from the selected organization. If the user is removed from all organizations, the user is reset to default organization and role. </Typography>
                        </Box>
                    }
                    <UserOrgRoleTable
                        userCurOrgsRoles={props.curSelectedOrgsRoles}
                        onUserOrgRoleChange={props.onUserOrgRoleChange}
                        onUserOrgRoleDelete={props.onUserOrgRoleDelete} />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} variant="outlined">Close</Button>
                </DialogActions>
            </Dialog>
        </React.Fragment >
    )
}

export default UserOrgRoleEditDialog