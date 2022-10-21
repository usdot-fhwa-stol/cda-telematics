import axios from 'axios';
const findAllStates = async () => {
    const URL = "http://localhost:9010/api/states/all"
    try {
      const { data } = await axios.get(URL);
      return data;
    } catch (err) {
      console.log(err);
    }
  }
  
  export {  findAllStates }