import { FormControl, InputLabel, MenuItem, Select } from '@mui/material'
import React, { useEffect, useState } from 'react'
import { USER_ROLES } from '../UserMetadata'

const RolesDropDown = (props) => {
    const [selectedOrgRole, setSelectedOrgRole] = useState('');
    const handleOrgUserRoleChange = (event)=>{
        setSelectedOrgRole(event.target.value);
        props.onUserOrgRoleChange(event.target.value);
    }
    useEffect(()=>{
        setSelectedOrgRole(props.role);
    },[props])
    return (
        <React.Fragment>
            <FormControl sx={{ minWidth: 120 }} size="small" fullWidth>
                <InputLabel id="user-role-select-small">User Role</InputLabel>
                <Select
                    labelId='user-roles'
                    id='user-role'
                    label='User Role'
                    value={selectedOrgRole}
                    onChange={handleOrgUserRoleChange}>
                    <MenuItem value={USER_ROLES.ADMIN} key={USER_ROLES.ADMIN}>{USER_ROLES.ADMIN}</MenuItem>
                    <MenuItem value={USER_ROLES.EDITOR} key={USER_ROLES.EDITOR}>{USER_ROLES.EDITOR}</MenuItem>
                    <MenuItem value={USER_ROLES.VIEWER} key={USER_ROLES.VIEWER}>{USER_ROLES.VIEWER}</MenuItem>
                </Select>
            </FormControl>
        </React.Fragment>
    )
}

export default RolesDropDown