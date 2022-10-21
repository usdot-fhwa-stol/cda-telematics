
import axios from 'axios';

const createLocation = async (location) => {
  const URL = "http://localhost:9010/api/locations/create"
  try {
    const { data } = await axios.post(URL, location);
    return data;
  } catch (err) {
    console.log(err);
  }
}
const findAllLocations = async () => {
  const URL = "http://localhost:9010/api/locations/all"
  try {
    const { data } = await axios.get(URL);
    return data;
  } catch (err) {
    console.log(err);
  }
}

export { createLocation, findAllLocations }
