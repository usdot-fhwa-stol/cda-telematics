import axios from 'axios';
const findAllTestingTypes= async (criteria) => {
    try {
        let URL = "http://localhost:9010/api/testing_types/all";
        const { data } = await axios.get(URL);
        return data;
    } catch (err) {
        console.log(err);
    }
}

export {findAllTestingTypes}

