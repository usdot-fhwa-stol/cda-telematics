import axios from 'axios';

const registerNewUser = async (username, email, password, org_id) => {
    const URL = `${window.location.protocol}//${window.location.hostname}:9010/api/users/register`

    try {
        const { data } = await axios.post(URL, {
            username: username,
            email: email,
            password: password,
            org_id: org_id
        }, { withCredentials: true });
        return data;
    } catch (err) {
        console.log(err);
        return { errCode: err.response.status, errMsg: err.response.data !== undefined && err.response.data.message !== undefined ? err.response.data.message : err.response.statusText }
    }
}

const updatePassword = async (username, email, new_password) => {
    const URL = `${window.location.protocol}//${window.location.hostname}:9010/api/users/forget/password`
    try {
        const { data } = await axios.post(URL, {
            username: username,
            email: email,
            new_password: new_password
        }, { withCredentials: true });
        return data;
    } catch (err) {
        console.log(err);
        return { errCode: err.response.status, errMsg: err.response.data !== undefined && err.response.data.message !== undefined ? err.response.data.message : err.response.statusText }
    }
}

const loginUser = async (username, password) => {
    const URL = `${window.location.protocol}//${window.location.hostname}:9010/api/users/login`
    try {
        const { data } = await axios.post(URL, {
            username: username,
            password: password
        }, { withCredentials: true });
        return data;
    } catch (err) {
        console.log(err);
        return { errCode: err.response.status, errMsg: err.response.data !== undefined && err.response.data.message !== undefined ? err.response.data.message : err.response.statusText }
    }
}


const deleteUser = async (username) => {
    const URL = `${window.location.protocol}//${window.location.hostname}:9010/api/users/delete`

    try {
        const { data } = await axios.delete(URL + "?username=" + username, { withCredentials: true });
        return data;
    } catch (err) {
        console.log(err);
        return { errCode: err.response.status, errMsg: err.response.data !== undefined && err.response.data.message !== undefined ? err.response.data.message : err.response.statusText }
    }
}


const listUsers = async () => {
    const URL = `${window.location.protocol}//${window.location.hostname}:9010/api/users/all`

    try {
        const { data } = await axios.get(URL, { withCredentials: true });
        return data;
    } catch (err) {
        console.log(err);
        return { errCode: err.response.status, errMsg: err.response.data !== undefined && err.response.data.message !== undefined ? err.response.data.message : err.response.statusText }
    }
}
const updateUserServerAdmin = async (req) => {
    const URL = `${window.location.protocol}//${window.location.hostname}:9010/api/users/update/server/admin`
    try {
        const { data } = await axios.post(URL, req, { withCredentials: true });
        return data;
    } catch (err) {
        console.log(err);
        return { errCode: err.response.status, errMsg: err.response.data !== undefined && err.response.data.message !== undefined ? err.response.data.message : err.response.statusText }
    }
}
const checkServerSession = async () => {
    const URL = `${window.location.protocol}//${window.location.hostname}:9010/api/users/ping`
    try {
        const { data } = await axios.get(URL, { withCredentials: true });
        return data;
    } catch (err) {
        console.log(err);
        return {
            errCode: err.response.status, errMsg: err.response.data !== undefined
                && err.response.data.message !== undefined ? err.response.data.message : err.response.statusText,
            expired: err.response.data !== undefined && err.response.data.reason !== undefined ? true : false
        }
    }
}

export { loginUser, deleteUser, updatePassword, registerNewUser, listUsers, updateUserServerAdmin, checkServerSession }