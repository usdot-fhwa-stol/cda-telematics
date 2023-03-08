import axios from 'axios';

/**
 *@brief Find all testing types
 * @Return Response status and a list of testing types
 */
const findAllTestingTypes= async (criteria) => {
    try {
        let URL = `${window.location.protocol}//${window.location.hostname}:9010/api/testing_types/all`;
        const { data } = await axios.get(URL, { withCredentials: true });
        return data;
    } catch (err) {
        console.log(err);
        return { errCode: err.response.status, errMsg: err.response.data !== undefined && err.response.data.message !== undefined ? err.response.data.message : err.response.statusText }
    }
}

export {findAllTestingTypes}

