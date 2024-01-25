import axios from 'axios';
import {env} from "../env"

/**
 *@brief Create an event in database (DB)
 * @Params event information to save to DB
 * @Return Response status and message for create
 */
const createEvent = async (event) => {
    try {
        const URL = `${env.REACT_APP_WEB_SERVER_URI}/api/events/create`
        const { data } = await axios.post(URL, event, { withCredentials: true });
        return data;
    } catch (err) {
        
        return { errCode: err.response!== undefined ? err.response.status: "", errMsg:  err.response !== undefined  && err.response.data !== undefined && err.response.data.message !== undefined ? err.response.data.message : (err.response !== undefined ? err.response.statusText : "")}
    }
}

/**
 *@brief Find all events that match the search criteria
 * @Params Search criteria for events. The criteria includes location, event type, start_time, end_time, event name
 * @Return Response status and a list of events that matches
 */
const findAllEvents = async (criteria) => {
    try {
        let URL = `${env.REACT_APP_WEB_SERVER_URI}/api/events/all`;
        if (criteria !== undefined && Object.keys(criteria).length > 0) {
            URL += "?";
            let key_values = "";
            Object.keys(criteria).forEach((key) => {
                key_values += key + "=" + criteria[key] + "&";
            });
            URL += key_values;
        }

        const { data } = await axios.get(URL, { withCredentials: true });
        return data;
    } catch (err) {
        
        return { errCode: err.response!== undefined ? err.response.status: "", errMsg:  err.response !== undefined  && err.response.data !== undefined && err.response.data.message !== undefined ? err.response.data.message : (err.response !== undefined ? err.response.statusText : "")}
    }
}


/**
 *@brief Update an event
 * @Params Event information to update
 * @Return Response status and message
 */
const editEvent = async (event) => {
    try {
        const URL = `${env.REACT_APP_WEB_SERVER_URI}/api/events/update/${event.id}`;
        const { data } = await axios.put(URL, event, { withCredentials: true });
        return data;
    } catch (err) {
        
        return { errCode: err.response!== undefined ? err.response.status: "", errMsg:  err.response !== undefined  && err.response.data !== undefined && err.response.data.message !== undefined ? err.response.data.message : (err.response !== undefined ? err.response.statusText : "")}
    }
}

/**
 *@brief Assign a unit to an event.
 * @Params The unit and event information combination
 * @Return Response status and message
 */
const assignUnit2Event = async (assign_event_unit) => {
    try {
        const URL = `${env.REACT_APP_WEB_SERVER_URI}/api/event_units/create`
        const { data } = await axios.post(URL, assign_event_unit, { withCredentials: true });
        return data;
    } catch (err) {
        
        return { errCode: err.response!== undefined ? err.response.status: "", errMsg:  err.response !== undefined  && err.response.data !== undefined && err.response.data.message !== undefined ? err.response.data.message : (err.response !== undefined ? err.response.statusText : "")}
    }
}

/**
 *@brief Remove a unit from an event.
 * @Params The unit and event information combination
 * @Return Response status and message
 */
const unAssignUnit2Event = async (event_unit) => {
    try {
        const URL = `${env.REACT_APP_WEB_SERVER_URI}/api/event_units/delete?event_id=${event_unit.event_id}&unit_id=${event_unit.unit.id}`;
        const { data } = await axios.delete(URL, { withCredentials: true });
        return data;
    } catch (err) {
        
          return { errCode: err.response!== undefined ? err.response.status: "", errMsg:  err.response !== undefined  && err.response.data !== undefined && err.response.data.message !== undefined ? err.response.data.message : (err.response !== undefined ? err.response.statusText : "")}
  
    }
}

/**
 *@brief Delete an event based on the event id.
 * @Params Event id uniquely identify an event
 * @Return Response status and message
 */
const deleteEvent = async (id) => {
    try {
        const URL = `${env.REACT_APP_WEB_SERVER_URI}/api/events/delete/${id}`
        const { data } = await axios.delete(URL, { withCredentials: true });
        return data;
    } catch (err) {
        
          return { errCode: err.response!== undefined ? err.response.status: "", errMsg:  err.response !== undefined  && err.response.data !== undefined && err.response.data.message !== undefined ? err.response.data.message : (err.response !== undefined ? err.response.statusText : "")}
  
    }
}

export { deleteEvent, createEvent, findAllEvents, editEvent, assignUnit2Event, unAssignUnit2Event };
