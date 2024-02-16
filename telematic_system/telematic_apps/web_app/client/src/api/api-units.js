
import axios from 'axios';
import {env} from "../env"
import { constructError } from './api-utils';
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
        
          return constructError(err)
  
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
        
          return constructError(err)
  
    }
};

export { createUnit, findAllUnits }