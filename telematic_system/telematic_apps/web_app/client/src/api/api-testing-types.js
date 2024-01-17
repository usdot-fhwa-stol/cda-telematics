import axios from 'axios';

/**
 *@brief Find all testing types
 * @Return Response status and a list of testing types
 */
const findAllTestingTypes= async (criteria) => {
    try {
        let URL = `${process.env.REACT_APP_WEB_SERVER_URI}/api/testing_types/all`;
        const { data } = await axios.get(URL, { withCredentials: true });
        return data;
    } catch (err) {
        
          return { errCode: err.response!== undefined ? err.response.status: "", errMsg:  err.response !== undefined  && err.response.data !== undefined && err.response.data.message !== undefined ? err.response.data.message : (err.response !== undefined ? err.response.statusText : "")}
  
    }
}

export {findAllTestingTypes}

