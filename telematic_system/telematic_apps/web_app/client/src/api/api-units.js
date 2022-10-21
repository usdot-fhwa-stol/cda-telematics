
import axios from 'axios';
/**
 *@brief Create a unit
 * @Return Response status and message
 */
const createUnit = async (unit) => {
    try {
        const URL = `${process.env.REACT_APP_NODE_SERVER_URI}/api/units/create`
        const { data } = await axios.post(URL, unit);
        return data;
    } catch (err) {
        console.log(err);
    }
};

/**
 *@brief Find all units
 * @Return Response status and a list of all units
 */
const findAllUnits = async () => {
    try {
        const URL = `${process.env.REACT_APP_NODE_SERVER_URI}/api/units/all`
        const { data } = await axios.get(URL);
        return data;
    } catch (err) {
        console.log(err);
    }
};

export { createUnit, findAllUnits }