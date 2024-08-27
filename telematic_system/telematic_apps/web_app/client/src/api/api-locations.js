
import axios from 'axios';
import {env} from "../env"
import { constructError } from './api-utils';

/**
 *@brief Create a location
 * @Params Location information
 * @Return Response status and message
 */
const createLocation = async (location) => {
  const URL = `${env.REACT_APP_WEB_SERVER_URI}/api/locations/create`
  try {
    const { data } = await axios.post(URL, location, { withCredentials: true });
    return data;
  } catch (err) {
    
      return constructError(err)
  
  }
}

/**
 *@brief Find all locations
 * @Return Response status and a list of locations
 */
const findAllLocations = async () => {
  const URL = `${env.REACT_APP_WEB_SERVER_URI}/api/locations/all`
  try {
    const { data } = await axios.get(URL, { withCredentials: true });
    return data;
  } catch (err) {
    
      return constructError(err)
  
  }
}

export { createLocation, findAllLocations };

