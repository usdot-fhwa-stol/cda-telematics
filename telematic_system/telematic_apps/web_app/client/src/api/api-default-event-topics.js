
import axios, { CanceledError } from 'axios';
/**
 *@brief Save the default topics setting for the given list of event and unit combinations
 * @Param The list of events and units combinations
 * @Return Response status and save a bulk of topics for each event and unit combination
 */
const createDefaultTopicsByEventUnits = async (seletedUnitsTopics) => {
  const URL =`${process.env.REACT_APP_NODE_SERVER_URI}/api/default_event_topics/create`
  let event_id = 0;
  let unit_identifiers = [];
  seletedUnitsTopics.forEach(element => {
    event_id = element.event_id;
    unit_identifiers.push(element.unit_identifier);
  });

  if (unit_identifiers.length === 0 || event_id === 0 || event_id === undefined) {
    return { errCode: "404", errMsg: "Event id or units cannot be empty" };
  }

  try {
    const { data } = await axios.post(URL, seletedUnitsTopics);
    return data;
  } catch (err) {
    console.log(err);
    return { errCode: err.response.status, errMsg: err.response.statusText }
  }
}

/**
 *@brief Load or find the default topics setting for the given event and list of units
 * @Params event id used to uniquely identifer each event
 * @Params selectedUnitIdentifiers: A list of unit identifiers. Each unit identifier is a string and is used to uniquely identify each unit.
 * @Return Response status and load a bulk of topics for each event and list of units for the event
 */
const findAllDefaultTopicsByEventUnits = async (event_id, selectedUnitIdentifiers) => {
  const URL = `${process.env.REACT_APP_NODE_SERVER_URI}/api/default_event_topics/all`
  if (selectedUnitIdentifiers.length === 0 || event_id === 0 || event_id === undefined) {
    return { errCode: CanceledError.ERR_BAD_REQUEST, errMsg: "Event id or units cannot be empty" };
  }

  try {
    const { data } = await axios.get(URL, {
      params: {
        event_id: event_id,
        unit_identifiers: selectedUnitIdentifiers
      }
    });
    return data;
  } catch (err) {
    console.log(err);
    return { errCode: err.response.status, errMsg: err.response.statusText }
  }
}

export { createDefaultTopicsByEventUnits, findAllDefaultTopicsByEventUnits }