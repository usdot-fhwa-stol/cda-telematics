
import axios from 'axios';
import {env} from "../env"

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
    
      return { errCode: err.response!== undefined ? err.response.status: "", errMsg:  err.response !== undefined  && err.response.data !== undefined && err.response.data.message !== undefined ? err.response.data.message : (err.response !== undefined ? err.response.statusText : "")}
  
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
    
      return { errCode: err.response!== undefined ? err.response.status: "", errMsg:  err.response !== undefined  && err.response.data !== undefined && err.response.data.message !== undefined ? err.response.data.message : (err.response !== undefined ? err.response.statusText : "")}
  
  }
}

export { createLocation, findAllLocations };

