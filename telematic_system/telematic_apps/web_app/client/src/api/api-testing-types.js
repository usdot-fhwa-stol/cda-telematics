import axios from 'axios';

/**
 *@brief Find all testing types
 * @Return Response status and a list of testing types
 */
const findAllTestingTypes= async (criteria) => {
    try {
        let URL = `${process.env.REACT_APP_NODE_SERVER_URI}/api/testing_types/all`;
        const { data } = await axios.get(URL);
        return data;
    } catch (err) {
        console.log(err);
    }
}

export {findAllTestingTypes}

