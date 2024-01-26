
import axios from 'axios';
import {env} from "../env"
/**
 *@brief Create a unit
 * @Return Response status and message
 */
const createUnit = async (unit) => {
    try {
        const URL = `${env.REACT_APP_WEB_SERVER_URI}/api/units/create`
        const { data } = await axios.post(URL, unit, { withCredentials: true });
        return data;
    } catch (err) {
        
          return { errCode: err.response!== undefined ? err.response.status: "", errMsg:  err.response !== undefined  && err.response.data !== undefined && err.response.data.message !== undefined ? err.response.data.message : (err.response !== undefined ? err.response.statusText : "")}
  
    }
};

/**
 *@brief Find all units
 * @Return Response status and a list of all units
 */
const findAllUnits = async () => {
    try {
        const URL = `${env.REACT_APP_WEB_SERVER_URI}/api/units/all`
        const { data } = await axios.get(URL, { withCredentials: true });
        return data;
    } catch (err) {
        
          return { errCode: err.response!== undefined ? err.response.status: "", errMsg:  err.response !== undefined  && err.response.data !== undefined && err.response.data.message !== undefined ? err.response.data.message : (err.response !== undefined ? err.response.statusText : "")}
  
    }
};

export { createUnit, findAllUnits }