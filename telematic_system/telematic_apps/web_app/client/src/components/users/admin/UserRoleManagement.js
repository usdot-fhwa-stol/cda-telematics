
import React from 'react';
import UserTable from './UserTable';

const UserRoleManagement = (props) => {
  return (
    <React.Fragment>
      <UserTable key={`user-table`}
        users={props.users}
        orgs={props.orgs}
        orgsusers={props.orgsusers}
        onAddUserToOrg={props.onAddUserToOrg}
        onUserOrgRoleChange={props.onUserOrgRoleChange}
        onUserOrgRoleDelete={props.onUserOrgRoleDelete}
        onChangeServerAdmin ={props.onChangeServerAdmin} />
    </React.Fragment>
  )
}

export default UserRoleManagement