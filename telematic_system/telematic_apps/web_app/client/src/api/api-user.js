import axios from 'axios';

const createUpdateUser = async (username, email, password) => {
    const URL = `${process.env.REACT_APP_NODE_SERVER_URI}/api/users/upsert`
    try {
        const { data } = await axios.post(URL, {
            username: username,
            email: email,
            password: password
        });
        return data;
    } catch (err) {
        console.log(err);
        return { errCode: err.response.status, errMsg: err.response.statusText }
    }
}


const createUser = async (username, email, password) => {
    const URL = `${process.env.REACT_APP_NODE_SERVER_URI}/api/users/create`

    try {
        const { data } = await axios.post(URL, {
            username: username,
            email: email,
            password: password
        });
        return data;
    } catch (err) {
        console.log(err);
        return { errCode: err.response.status, errMsg: err.response.statusText }
    }
}

const updatePassword = async (username, email, password) => {
    const URL = `${process.env.REACT_APP_NODE_SERVER_URI}/api/users/upsert/password`
    try {
        const { data } = await axios.post(URL, {
            username: username,
            email: email,
            password: password
        });
        return data;
    } catch (err) {
        console.log(err);
        return { errCode: err.response.status, errMsg: err.response.statusText }
    }
}

const deleteUser = async (username) => {
    const URL = `${process.env.REACT_APP_NODE_SERVER_URI}/api/users/delete`

    try {
        const { data } = await axios.delete(URL + "?username=" + username);
        return data;
    } catch (err) {
        console.log(err);
        return { errCode: err.response.status, errMsg: err.response.statusText }
    }
}


const listUsers = async () => {
    const URL = `${process.env.REACT_APP_NODE_SERVER_URI}/api/users/all`

    try {
        const { data } = await axios.get(URL);
        return data;
    } catch (err) {
        console.log(err);
        return { errCode: err.response.status, errMsg: err.response.statusText }
    }
}
const updateUserServerAdmin = async (req) => {
    const URL = `${process.env.REACT_APP_NODE_SERVER_URI}/api/users/update/server/admin`
    try {
        const { data } = await axios.post(URL, req);
        return data;
    } catch (err) {
        console.log(err);
        return { errCode: err.response.status, errMsg: err.response.statusText }
    }
}

export { createUpdateUser, deleteUser, updatePassword, createUser, listUsers, updateUserServerAdmin }