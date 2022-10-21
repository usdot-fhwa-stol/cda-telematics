import axios from 'axios';
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