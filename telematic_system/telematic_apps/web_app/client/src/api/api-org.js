import axios from 'axios';
const listOrgs = async () => {
    const URL = `${process.env.REACT_APP_NODE_SERVER_URI}/api/org/all`
    try {
        const { data } = await axios.get(URL);
        return data;
    } catch (err) {
        console.log(err);
        return { errCode: err.response.status, errMsg: err.response.statusText }
    }
}

const listOrgUsers = async () => {
    const URL = `${process.env.REACT_APP_NODE_SERVER_URI}/api/org/all/users`
    try {
        const { data } = await axios.get(URL);
        return data;
    } catch (err) {
        console.log(err);
        return { errCode: err.response.status, errMsg: err.response.statusText }
    }
}

const addOrgUser = async (reqData) => {
    const URL = `${process.env.REACT_APP_NODE_SERVER_URI}/api/org/user/add`

    try {
        const { data } = await axios.post(URL, {
            data: reqData
        });
        return data;
    } catch (err) {
        console.log(err);
        return { errCode: err.response.status, errMsg: err.response.statusText }
    }
}

const updateOrgUser = async (reqData) => {
    const URL = `${process.env.REACT_APP_NODE_SERVER_URI}/api/org/user/update`

    try {
        const { data } = await axios.post(URL, {
            data: reqData
        });
        return data;
    } catch (err) {
        console.log(err);
        return { errCode: err.response.status, errMsg: err.response.statusText }
    }
}


const deleteOrgUser = async (req) => {
    const URL = `${process.env.REACT_APP_NODE_SERVER_URI}/api/org/user/delete`
    if (req === undefined || req.user_id === undefined || req.org_id === undefined) {
        console.error("Cannot delete org user because request data is empty")
    }
    try {
        const { data } = await axios.delete(URL + "?org_id=" + req.org_id + "&user_id=" + req.user_id);
        return data;
    } catch (err) {
        console.log(err);
        return { errCode: err.response.status, errMsg: err.response.statusText }
    }
}



export { listOrgs, listOrgUsers, addOrgUser, updateOrgUser, deleteOrgUser }