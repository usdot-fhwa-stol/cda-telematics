import React, { useEffect, useState } from 'react';
import { listUsers, updateUserServerAdmin } from '../api/api-user';
import { addOrgUser, deleteOrgUser, listOrgs, listOrgUsers, updateOrgUser } from '../api/api-org';
import { NOTIFICATION_STATUS } from '../components/topics/TopicMetadata';
import UserRoleManagement from '../components/users/admin/UserRoleManagement';
import Notification from '../components/ui/Notification';
import { PageAvatar } from '../components/ui/PageAvatar';
import { Grid, Typography } from '@mui/material';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import AuthContext from '../context/auth-context';

const AdminPage = () => {
    //Add Alert notification
    const [alertStatus, setAlertStatus] = useState({});
    const [users, setUsers] = useState([]);
    const [orgs, setOrgs] = useState([]);
    const [orgsUsers, setOrgsUsers] = useState([]);
    const authContxt = React.useContext(AuthContext);

    const closeAlertHandler = () => {
        setAlertStatus({
            open: false,
            severity: NOTIFICATION_STATUS.SUCCESS,
            title: '',
            message: ''
        });
    }
    const handleAddUserToOrg = (data) => {
        const response = addOrgUser(data);
        response.then(response_data => {
            if (response_data.errCode === undefined) {
                setOrgsUsers(prev => [...prev, response_data])
            }
        }).catch(error => {
            console.log(error);
        })
    }

    const handleUserOrgRoleChange = (data) => {
        const response = updateOrgUser(data);
        response.then(response_data => {
            if (response_data.errCode === undefined && Array.isArray(response_data) && response_data.length > 0) {
                setOrgsUsers(prev => [...prev.filter(item => item.id !== response_data[0].id), response_data[0]])
            }
        }).catch(error => {
            console.log(error);
        })
    }

    const handleUserOrgRoleDelete = (data) => {
        const response = deleteOrgUser(data);
        response.then(response_data => {
            if (response_data.errCode === undefined) {
                setOrgsUsers(prev => [...prev.filter(item => item.user_id !== data.user_id || item.org_id !== data.org_id)])
            }
        }).catch(error => {
            console.log(error);
        })
    }
    const handleChangeServerAdmin = (userData) => {
        const response = updateUserServerAdmin(userData);
        let filteredUser = users.filter(item => item.id === userData.user_id)
        filteredUser[0].is_admin = userData.is_admin === 1 ? "yes" : "no";
        response.then(response_data => {
            console.log(response_data)
            if (response_data.errCode === undefined) {
                setUsers(prev => [...prev.filter(item => item.id !== userData.user_id), filteredUser[0]])
            }
        }).catch(error => {
            console.log(error);
        })
    }

    useEffect(() => {
        const user_response = listUsers();
        user_response.then(data => {
            if (data !== undefined && Array.isArray(data) && data.length !== 0) {
                setUsers(data);
            }
        }).catch(err => {
            if (err.errCode !== undefined && err.errMsg !== undefined) {
                setAlertStatus({
                    open: true,
                    severity: NOTIFICATION_STATUS.ERROR,
                    title: 'Error',
                    message: err.errMsg
                });
            }
        });

        const org_response = listOrgs();
        org_response.then(data => {
            if (data !== undefined && Array.isArray(data) && data.length !== 0) {
                setOrgs(data);
            }
        }).catch(err => {
            if (err.errCode !== undefined && err.errMsg !== undefined) {
                setAlertStatus({
                    open: true,
                    severity: NOTIFICATION_STATUS.ERROR,
                    title: 'Error',
                    message: err.errMsg
                });
            }
        });

        const org_users_response = listOrgUsers();
        org_users_response.then(data => {
            if (data !== undefined && Array.isArray(data) && data.length !== 0) {
                setOrgsUsers(data);
            }
        }).catch(err => {
            if (err.errCode !== undefined && err.errMsg !== undefined) {
                setAlertStatus({
                    open: true,
                    severity: NOTIFICATION_STATUS.ERROR,
                    title: 'Error',
                    message: err.errMsg
                });
            }
        });
    }, [authContxt.org_id])
    return (
        <React.Fragment>
            <Notification open={alertStatus.open}
                closeAlert={closeAlertHandler}
                severity={alertStatus.severity}
                title={alertStatus.title}
                message={alertStatus.message} />
            <Grid container rowSpacing={1} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
                <Grid item xs={12}>
                    <PageAvatar icon={<AdminPanelSettingsIcon />} title="Administrator" />
                </Grid>
                <Grid item xs={12}>
                    <Typography sx={{ marginLeft: 2}}>Current Organization: {authContxt.org_name} </Typography>
                </Grid>
            </Grid>
            <UserRoleManagement
                users={users}
                orgs={orgs}
                orgsUsers={orgsUsers}
                onAddUserToOrg={handleAddUserToOrg}
                onUserOrgRoleChange={handleUserOrgRoleChange}
                onUserOrgRoleDelete={handleUserOrgRoleDelete}
                onChangeServerAdmin={handleChangeServerAdmin} />
        </React.Fragment>
    )
}

export default AdminPage