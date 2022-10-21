
import axios from 'axios';

const createLocation = async (location) => {
  const URL = `${process.env.REACT_APP_NODE_SERVER_URI}/api/locations/create`
  try {
    const { data } = await axios.post(URL, location);
    return data;
  } catch (err) {
    console.log(err);
  }
}
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
