import axios from 'axios';
import {env} from "../env"
import { constructError } from './api-utils';

/**
 *@brief Find all testing types
 * @Return Response status and a list of testing types
 */
const findAllTestingTypes= async (criteria) => {
    try {
        let URL = `${env.REACT_APP_WEB_SERVER_URI}/api/testing_types/all`;
        const { data } = await axios.get(URL, { withCredentials: true });
        return data;
    } catch (err) {
        
          return constructError(err)
  
    }
}

export {findAllTestingTypes}

