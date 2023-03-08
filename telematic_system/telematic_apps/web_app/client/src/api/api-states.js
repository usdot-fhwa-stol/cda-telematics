import axios from 'axios';

/**
 *@brief Find all states in the US
 * @Return Response status and a list of states
 */
const findAllStates = async () => {
  const URL = `${window.location.protocol}//${window.location.hostname}:9010/api/states/all`
  try {
    const { data } = await axios.get(URL, { withCredentials: true });
    return data;
  } catch (err) {
    console.log(err);
    return { errCode: err.response.status !== undefined && err.response.status, errMsg: err.response.data !== undefined && err.response.data.message !== undefined ? err.response.data.message : err.response.statusText }
  }
}

export { findAllStates }