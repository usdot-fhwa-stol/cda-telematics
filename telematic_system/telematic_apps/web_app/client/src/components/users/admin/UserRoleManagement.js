
import React from 'react';
import UserTable from './UserTable';

const UserRoleManagement = (props) => {
  return (
      <UserTable key={`user-table`}
        users={props.users}
        orgs={props.orgs}
        orgsusers={props.orgsusers}
        onAddUserToOrg={props.onAddUserToOrg}
        onUserOrgRoleChange={props.onUserOrgRoleChange}
        onUserOrgRoleDelete={props.onUserOrgRoleDelete}
        onChangeServerAdmin ={props.onChangeServerAdmin} />
  )
}

export default UserRoleManagement