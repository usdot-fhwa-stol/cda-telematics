import axios from 'axios';
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

