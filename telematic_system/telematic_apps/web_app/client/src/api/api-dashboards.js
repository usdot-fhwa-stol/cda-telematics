import axios from 'axios';
/**
 *@brief List all dashboards urls belong to the current user organization
 */
const searchDashboards = async (org_id, search_text) => {
  const URL = `${process.env.REACT_APP_WEB_SERVER_URI}/api/dashboards/org/search`


  try {
    const { data } = await axios.post(URL,
      {
        data: { org_id: org_id, search_text: search_text }
      }, { withCredentials: true });
    return data;
  } catch (err) {
    console.log(err);
    return { errCode: err.response.status, errMsg: err.response.data !== undefined && err.response.data.message !== undefined ? err.response.data.message : err.response.statusText }
  }
}

/**
 *@brief List all dashboards urls belong to the current user organization
 */
const getDashboardsByOrg = async (org_id) => {
  const URL = `${process.env.REACT_APP_WEB_SERVER_URI}/api/dashboards/org/all`


  try {
    const { data } = await axios.post(URL,
      {
        data: { org_id: org_id }
      }, { withCredentials: true });
    return data;
  } catch (err) {
    console.log(err);
    return { errCode: err.response.status, errMsg: err.response.data !== undefined && err.response.data.message !== undefined ? err.response.data.message : err.response.statusText }
  }
}

/**
 *@brief List all dashboards urls belong to the selected event
 */
const listEventDashboards = async (event_id) => {
  const URL = `${process.env.REACT_APP_WEB_SERVER_URI}/api/dashboards/event/list`


  try {
    const { data } = await axios.post(URL,
      {
        data: { event_id: event_id }
      }, { withCredentials: true });
    return data;
  } catch (err) {
    console.log(err);
    return { errCode: err.response.status, errMsg: err.response.data !== undefined && err.response.data.message !== undefined ? err.response.data.message : err.response.statusText }
  }
}


/**
 *@brief Update all dashboards urls belong to the selected event
 */
const updateEventDashboards = async (event_id, dashboard_id) => {
  const URL = `${process.env.REACT_APP_WEB_SERVER_URI}/api/dashboards/event/update`


  try {
    const { data } = await axios.post(URL,
      {
        data: { event_id: event_id, dashboard_id: dashboard_id }
      }, { withCredentials: true });
    return data;
  } catch (err) {
    console.log(err);
    return { errCode: err.response.status, errMsg: err.response.data !== undefined && err.response.data.message !== undefined ? err.response.data.message : err.response.statusText }
  }
}


/**
 *@brief Remove dashboards urls belong to the selected event
 */
const deleteEventDashboards = async (event_id, dashboard_id) => {
  const URL = `${process.env.REACT_APP_WEB_SERVER_URI}/api/dashboards/event/delete`


  try {
    const { data } = await axios.delete(URL+"?event_id="+event_id+"&dashboard_id="+dashboard_id, { withCredentials: true });
    console.log(data)
    return data;
  } catch (err) {
    console.log(err);
    return { errCode: err.response.status, errMsg: err.response.data !== undefined && err.response.data.message !== undefined ? err.response.data.message : err.response.statusText }
  }
}

export { searchDashboards, listEventDashboards, updateEventDashboards, getDashboardsByOrg, deleteEventDashboards };

