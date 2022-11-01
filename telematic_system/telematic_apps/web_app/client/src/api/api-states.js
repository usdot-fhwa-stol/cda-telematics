import axios from 'axios';

/**
 *@brief Find all states in the US
 * @Return Response status and a list of states
 */
const findAllStates = async () => {
    const URL = `${process.env.REACT_APP_NODE_SERVER_URI}/api/states/all`
    try {
      const { data } = await axios.get(URL);
      return data;
    } catch (err) {
      console.log(err);
    }
  }
  
  export {  findAllStates }