
import axios from 'axios';

/**
 *@brief Create a location
 * @Params Location information
 * @Return Response status and message
 */
const createLocation = async (location) => {
  const URL = `${process.env.REACT_APP_NODE_SERVER_URI}/api/locations/create`
  try {
    const { data } = await axios.post(URL, location, { withCredentials: true });
    return data;
  } catch (err) {
    console.log(err);
    return { errCode: err.response.status, errMsg: err.response.data !== undefined && err.response.data.message !== undefined ? err.response.data.message : err.response.statusText }
  }
}

/**
 *@brief Find all locations
 * @Return Response status and a list of locations
 */
const findAllLocations = async () => {
  const URL = `${process.env.REACT_APP_NODE_SERVER_URI}/api/locations/all`
  try {
    const { data } = await axios.get(URL, { withCredentials: true });
    return data;
  } catch (err) {
    console.log(err);
    return { errCode: err.response.status, errMsg: err.response.data !== undefined && err.response.data.message !== undefined ? err.response.data.message : err.response.statusText }
  }
}

export { createLocation, findAllLocations }
