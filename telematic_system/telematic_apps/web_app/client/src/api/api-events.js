import axios from 'axios';

/**
 *@brief Create an event in database (DB)
 * @Params event information to save to DB
 * @Return Response status and message for create
 */
const createEvent = async (event) => {
    try {
        const URL = `${process.env.REACT_APP_NODE_SERVER_URI}/api/events/create`
        const { data } = await axios.post(URL, event);
        return data;
    } catch (err) {
        console.log(err);
    }
}

/**
 *@brief Find all events that match the search criteria
 * @Params Search criteria for events. The criteria includes location, event type, start_time, end_time, event name
 * @Return Response status and a list of events that matches
 */
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


/**
 *@brief Update an event
 * @Params Event information to update
 * @Return Response status and message
 */
const editEvent = async (event) => {
    try {
        const URL = `${process.env.REACT_APP_NODE_SERVER_URI}/api/events/update/${event.id}`;
        const { data } = await axios.put(URL, event);
        return data;
    } catch (err) {
        console.log(err);
    }
}

/**
 *@brief Assign a unit to an event.
 * @Params The unit and event information combination
 * @Return Response status and message
 */
const assignUnit2Event = async (assign_event_unit) => {
    try {
        const URL = `${process.env.REACT_APP_NODE_SERVER_URI}/api/event_units/create`
        const { data } = await axios.post(URL, assign_event_unit);
        return data;
    } catch (err) {
        console.log(err);
    }
}

/**
 *@brief Remove a unit from an event.
 * @Params The unit and event information combination
 * @Return Response status and message
 */
const unAssignUnit2Event = async (event_unit) => {
    try {
        const URL = `${process.env.REACT_APP_NODE_SERVER_URI}/api/event_units/delete?event_id=${event_unit.event_id}&unit_id=${event_unit.unit.id}`;
        const { data } = await axios.delete(URL);
        return data;
    } catch (err) {
        console.log(err);
    }
}

/**
 *@brief Delete an event based on the event id.
 * @Params Event id uniquely identify an event
 * @Return Response status and message
 */
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
