import axios from 'axios';

const createEvent = async (event) => {
    try {
        const URL = `${process.env.REACT_APP_NODE_SERVER_URI}/api/events/create`
        const { data } = await axios.post(URL, event);
        return data;
    } catch (err) {
        console.log(err);
    }
}

const findAllEvents = async (criteria) => {
    try {
        let URL = `${process.env.REACT_APP_NODE_SERVER_URI}/api/events/all`;
        if (criteria !== undefined && Object.keys(criteria).length > 0) {
            URL += "?";
            let key_values = "";
            Object.keys(criteria).forEach((key) => {
                key_values += key + "=" + criteria[key] + "&";
            });
            URL += key_values;
        }

        const { data } = await axios.get(URL);
        return data;
    } catch (err) {
        console.log(err);
    }
}

const editEvent = async (event) => {
    try {
        const URL = `${process.env.REACT_APP_NODE_SERVER_URI}/api/events/update/${event.id}`;
        const { data } = await axios.put(URL, event);
        return data;
    } catch (err) {
        console.log(err);
    }
}


const assignUnit2Event = async (assign_event_unit) => {
    try {
        const URL = `${process.env.REACT_APP_NODE_SERVER_URI}/api/event_units/create`
        const { data } = await axios.post(URL, assign_event_unit);
        return data;
    } catch (err) {
        console.log(err);
    }
}


const unAssignUnit2Event = async (event_unit) => {
    try {
        const URL = `${process.env.REACT_APP_NODE_SERVER_URI}/api/event_units/delete?event_id=${event_unit.event_id}&unit_id=${event_unit.unit.id}`;
        const { data } = await axios.delete(URL);
        return data;
    } catch (err) {
        console.log(err);
    }
}


const deleteEvent = async (id) => {
    try {
        const URL = `${process.env.REACT_APP_NODE_SERVER_URI}/api/events/delete/${id}`
        const { data } = await axios.delete(URL);
        return data;
    } catch (err) {
        console.log(err);
    }
}

export { deleteEvent, createEvent, findAllEvents, editEvent, assignUnit2Event, unAssignUnit2Event };
