import axios from 'axios';

/**
 *@brief Find all states in the US
 * @Return Response status and a list of states
 */
const findAllStates = async () => {
  const URL = `${process.env.REACT_APP_WEB_SERVER_URI}/api/states/all`
  try {
    const { data } = await axios.get(URL, { withCredentials: true });
    return data;
  } catch (err) {
    
    return { errCode:  err.response!==undefined && err.response.status !== undefined && err.response.status, errMsg:  err.response !==undefined && err.response.data !== undefined && err.response.data.message !== undefined ? err.response.data.message : (err.response !==undefined ? err.response.statusText :"")}
  }
}

export { findAllStates }