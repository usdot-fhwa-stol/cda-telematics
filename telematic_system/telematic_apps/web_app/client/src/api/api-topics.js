import axios from 'axios';
import {env, URL_Web_Messaging_Server_Prefix } from "../env"

/**
 *@brief Send request to telematic_cloud_messaging web service to get available topics for the given unit identifiers
 * @Param The list of unit_id (unit identifiers string that is used to uniquely identify each unit.)
 * @Return Response status and list of available topics from telematic_cloud_messaging server.
 */
const getAvailableLiveTopicsByEventUnits = async (selectedUnitIdentifiers) => {
    let sentStatus = [];
    await Promise.all(selectedUnitIdentifiers.map(async selectedUnitIdentifier => {
        const URL = `${URL_Web_Messaging_Server_Prefix}/requestAvailableTopics/${selectedUnitIdentifier}`
        try {
            const { data } = await axios.get(URL);
            sentStatus.push(data);
        } catch (err) {
            console.log(err);
            sentStatus.push({
                errCode: err.response !== undefined ? err.response.status : "404",
                errMsg: err.response !== undefined ? selectedUnitIdentifier + ": " + err.response.statusText + err.response.data : selectedUnitIdentifier + ": No reponse from server."
            });
        }
    }));
    return sentStatus;
}

/**
 *@brief Send request to telematic_cloud_messaging web service to request data stream for selected topics
 * @Param The list of selected topics for selected units
 * @Return Response status and message from telematic_cloud_messaging server.
 */
const requestSelectedLiveUnitsTopics = async (seletedUnitTopicListToConfirm) => {
    const URL = `${URL_Web_Messaging_Server_Prefix}/requestSelectedTopics`;
    let sentStatus = [];
    return await Promise.all(seletedUnitTopicListToConfirm.map(async selectdUnitTopics => {
        let body = {
            unit_id: selectdUnitTopics.unit_identifier,
            unit_name: selectdUnitTopics.unit_name,
            timestamp: new Date().getTime(),
            topics: [] //Selected topics for each unit
        }
        if (selectdUnitTopics.unit_topics !== undefined) {
            selectdUnitTopics.unit_topics.forEach(categorized_topic => {
                categorized_topic.topics.forEach(topic => {
                    body.topics.push(topic.name);
                });
            });
        }

        //Send request to stream data 
        let unitStatus = body.unit_name + " (" + body.unit_id + "): ";
        try {
            const { data } = await axios.post(URL, body);
            sentStatus.push({ data: unitStatus + data });
        } catch (err) {
            sentStatus.push({
                errCode: err.response !== undefined ? err.response.status : "404",
                errMsg: err.response !== undefined ? unitStatus + err.response.statusText +". " + err.response.data : unitStatus + "No reponse from server."
            });
        }
        return sentStatus;
    }));
}

export { getAvailableLiveTopicsByEventUnits, requestSelectedLiveUnitsTopics }