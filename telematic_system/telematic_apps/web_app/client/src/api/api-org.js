import axios from 'axios';
import {URL_Web_Server_Prefix } from "../env"
const listOrgs = async () => {
    const URL = `${URL_Web_Server_Prefix}/api/org/all`
    try {
        const { data } = await axios.get(URL, { withCredentials: true });
        return data;
    } catch (err) {
        console.log(err);
        return { errCode: err.response.status, errMsg: err.response.data !== undefined && err.response.data.message !== undefined ? err.response.data.message : err.response.statusText }
    }
}

const listOrgUsers = async () => {
    const URL = `${URL_Web_Server_Prefix}/api/org/all/users`
    try {
        const { data } = await axios.get(URL, { withCredentials: true });
        return data;
    } catch (err) {
        console.log(err);
        return { errCode: err.response.status, errMsg: err.response.data !== undefined && err.response.data.message !== undefined ? err.response.data.message : err.response.statusText }
    }
}

const addOrgUser = async (reqData) => {
    const URL = `${URL_Web_Server_Prefix}/api/org/user/add`

    try {
        const { data } = await axios.post(URL, {
            data: reqData
        }, { withCredentials: true });
        return data;
    } catch (err) {
        console.log(err);
        return { errCode: err.response.status, errMsg: err.response.data !== undefined && err.response.data.message !== undefined ? err.response.data.message : err.response.statusText }
    }
}

const getUserRole = async (reqData) => {
    const URL = `${URL_Web_Server_Prefix}/api/org/role/get`
    try {
        const { data } = await axios.post(URL, {
            data: reqData
        }, { withCredentials: true });
        return data;
    } catch (err) {
        console.log(err);
        return { errCode: err.response.status, errMsg: err.response.data !== undefined && err.response.data.message !== undefined ? err.response.data.message : err.response.statusText }
    }
}


const getOrgsByUser = async (userId) => {
    const URL = `${URL_Web_Server_Prefix}/api/org/user/find`

    try {
        const { data } = await axios.post(URL, {
            data: { user_id: userId }
        }, { withCredentials: true });
        return data;
    } catch (err) {
        console.log(err);
        return { errCode: err.response.status, errMsg: err.response.data !== undefined && err.response.data.message !== undefined ? err.response.data.message : err.response.statusText }
    }
}

const updateOrgUser = async (reqData) => {
    const URL = `${URL_Web_Server_Prefix}/api/org/user/update`

    try {
        const { data } = await axios.post(URL, {
            data: reqData
        }, { withCredentials: true });
        return data;
    } catch (err) {
        console.log(err);
        return { errCode: err.response.status, errMsg: err.response.data !== undefined && err.response.data.message !== undefined ? err.response.data.message : err.response.statusText }
    }
}


const deleteOrgUser = async (req) => {
    const URL = `${URL_Web_Server_Prefix}/api/org/user/delete`
    if (req === undefined || req.user_id === undefined || req.org_id === undefined) {
        console.error("Cannot delete org user because request data is empty")
    }
    try {
        const { data } = await axios.delete(URL + "?org_id=" + req.org_id + "&user_id=" + req.user_id, { withCredentials: true });
        return data;
    } catch (err) {
        console.log(err);
        return { errCode: err.response.status, errMsg: err.response.data !== undefined && err.response.data.message !== undefined ? err.response.data.message : err.response.statusText }
    }
}



export { listOrgs, listOrgUsers, addOrgUser, updateOrgUser, deleteOrgUser, getUserRole, getOrgsByUser }