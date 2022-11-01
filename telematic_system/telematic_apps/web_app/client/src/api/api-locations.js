
import axios from 'axios';

/**
 *@brief Create a location
 * @Params Location information
 * @Return Response status and message
 */
const createLocation = async (location) => {
  const URL = `${process.env.REACT_APP_NODE_SERVER_URI}/api/locations/create`
  try {
    const { data } = await axios.post(URL, location);
    return data;
  } catch (err) {
    console.log(err);
  }
}

/**
 *@brief Find all locations
 * @Return Response status and a list of locations
 */
const findAllLocations = async () => {
  const URL = `${process.env.REACT_APP_NODE_SERVER_URI}/api/locations/all`
  try {
    const { data } = await axios.get(URL);
    return data;
  } catch (err) {
    console.log(err);
  }
}

export { createLocation, findAllLocations }
