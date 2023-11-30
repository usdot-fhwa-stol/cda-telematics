
import axios from 'axios';
import {URL_Web_Server_Prefix } from "../env"
/**
 *@brief Create a unit
 * @Return Response status and message
 */
const createUnit = async (unit) => {
    try {
        const URL = `${URL_Web_Server_Prefix}/api/units/create`
        const { data } = await axios.post(URL, unit, { withCredentials: true });
        return data;
    } catch (err) {
        console.log(err);
        return { errCode: err.response.status, errMsg: err.response.data !== undefined && err.response.data.message !== undefined ? err.response.data.message : err.response.statusText }
    }
};

/**
 *@brief Find all units
 * @Return Response status and a list of all units
 */
const findAllUnits = async () => {
    try {
        const URL = `${URL_Web_Server_Prefix}/api/units/all`
        const { data } = await axios.get(URL, { withCredentials: true });
        return data;
    } catch (err) {
        console.log(err);
        return { errCode: err.response.status, errMsg: err.response.data !== undefined && err.response.data.message !== undefined ? err.response.data.message : err.response.statusText }
    }
};

export { createUnit, findAllUnits }