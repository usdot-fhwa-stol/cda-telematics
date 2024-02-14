import axios from 'axios';
import {env} from "../env"
import { constructError } from './api-utils';

/**
 *@brief Find all states in the US
 * @Return Response status and a list of states
 */
const findAllStates = async () => {
  const URL = `${env.REACT_APP_WEB_SERVER_URI}/api/states/all`
  try {
    const { data } = await axios.get(URL, { withCredentials: true });
    return data;
  } catch (err) {
    
    return constructError(err)
  }
}

export { findAllStates }