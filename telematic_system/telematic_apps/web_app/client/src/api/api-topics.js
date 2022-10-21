import axios from 'axios';
const getAvailableLiveTopicsByEventUnits = async (event_id, selectedUnitIdentifiers) => {
    let sentStatus = [];
    await Promise.all(selectedUnitIdentifiers.map(async selectedUnitIdentifier => {
        const URL = `http://localhost:8080/requestAvailableTopics/${selectedUnitIdentifier}`
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

const requestSelectedLiveUnitsTopics = async (seletedUnitTopicListToConfirm) => {
    const URL = `http://localhost:8080/requestSelectedTopics`;
    let sentStatus = [];
    await Promise.all(seletedUnitTopicListToConfirm.map(async selectdUnitTopics => {
        let body = {
            unit_id: selectdUnitTopics.unit_identifier,
            unit_name: selectdUnitTopics.unit_name,
            timestamp: new Date().getTime(),
            topics: []
        }
        if (selectdUnitTopics.unit_topics !== undefined) {
            selectdUnitTopics.unit_topics.forEach(categorized_topic => {
                categorized_topic.topics.forEach(topic => {
                    body.topics.push(topic.name);
                });
            });

            let unitStatus = body.unit_name + " (" + body.unit_id + "): ";
            try {
                const { data } = await axios.post(URL, body);
                sentStatus.push({ data: unitStatus + data });
            } catch (err) {
                sentStatus.push({
                    errCode: err.response !== undefined ? err.response.status : "404",
                    errMsg: err.response !== undefined ? unitStatus + err.response.statusText + err.response.data : unitStatus + "No reponse from server."
                });
            }
        }
    }));
    return sentStatus;
}

export { getAvailableLiveTopicsByEventUnits, requestSelectedLiveUnitsTopics }