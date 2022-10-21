
import axios from 'axios';

const createUnit = async (unit) => {
    try {
        const URL = "http://localhost:9010/api/units/create"
        const { data } = await axios.post(URL, unit);
        return data;
    } catch (err) {
        console.log(err);
    }
};

const findAllUnits = async () => {
    try {
        const URL = "http://localhost:9010/api/units/all"
        const { data } = await axios.get(URL);
        return data;
    } catch (err) {
        console.log(err);
    }
};

export { createUnit, findAllUnits }