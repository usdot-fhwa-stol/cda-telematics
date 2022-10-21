
import axios, { CanceledError } from 'axios';

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
