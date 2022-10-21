import { Button, Stack, Tooltip, Typography } from '@mui/material';
import React, { useContext, useEffect, useState } from 'react';
import { createDefaultTopicsByEventUnits, findAllDefaultTopicsByEventUnits } from '../../api/api-default-event-topics';
import TopicContext from '../../context/topic-context';

const DefaultTopicSettings = (props) => {
    const TopicCtx = useContext(TopicContext);
    const [selectedUnitIdentifiers, setSelectedUnitIdentifiers] = useState([]);
    const [isLoaded, setIsLoaded] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [msg, setMsg] = useState('');

    //Save selected topics as default topics
    const saveDefaultSeletedTopicsHandler = () => {
        const currentUnitsSelectedTopicList = TopicCtx.selected_unit_topics_list.filter(item => selectedUnitIdentifiers.includes(item.unit_identifier));
        if (currentUnitsSelectedTopicList.length === 0) {
            setIsSaved(false);
            setIsLoaded(false);
            setMsg("Please select units and move topics to selected topic section.");
        } else {
            const response_data = createDefaultTopicsByEventUnits(currentUnitsSelectedTopicList);
            try {
                response_data.then(json => {
                    if (json !== undefined && json.errCode !== undefined) {
                        setIsSaved(false);
                        setIsLoaded(false);
                        setMsg(json.errMsg);
                        return;
                    }
                    setIsSaved(true);
                    setIsLoaded(false);
                    setMsg('Save success!');
                })
            } catch (err) {
                console.error(err)
            }
        }
    }

    const loadDefaultSelectedTopicsHandler = () => {
        if (props.selectedUnits.length !== 0) {
            let event_id = props.selectedUnits[0].event_id;
            if (selectedUnitIdentifiers.length === 0) {
                setIsSaved(false);
                setIsLoaded(false);
                setMsg("Please select units and move topics to selected topic section.");
            } else {
                try {
                    const response_data = findAllDefaultTopicsByEventUnits(event_id, selectedUnitIdentifiers);
                    response_data.then(json => {
                        if (json !== undefined && json.errCode !== undefined) {
                            setIsSaved(false);
                            setIsLoaded(false);
                            setMsg(json.errMsg);
                            return;
                        }
                        setIsLoaded(true);
                        setIsSaved(false);
                        setMsg('Load success!');

                        //Update TopicContext with the selectedUnitTopics from loaded default selected topics setting for these units
                        updateSelectedTopicList(props.selectedUnits, json)
                    })
                } catch (err) {
                    console.error(err)
                }
            }
        } else {
            setIsSaved(false);
            setIsLoaded(false);
            setMsg("Please select at least one unit.");
        }

    }

    const updateSelectedTopicList = (selectedUnits, loadedDefaultUnitTopics) => {
        let loadedSelectedUnitsTopics = [];
        loadedDefaultUnitTopics.forEach(defaultUnitTopics => {
            const defaultTopicList = defaultUnitTopics.topic_names.split(",");
            const unit_identifier = defaultUnitTopics.unit_identifier;
            const event_id = defaultUnitTopics.event_id;
            selectedUnits.forEach(unit => {
                let unitTopics = [];
                if (unit.unit_topics !== undefined && unit.unit_identifier === unit_identifier && unit.event_id === event_id) {
                    unit.unit_topics.forEach(item => {
                        let category = item.category;
                        let topics = [];
                        item.topics.forEach(topic => {
                            defaultTopicList.forEach(topic_name => {
                                if (topic_name === topic.name) {
                                    topics.push(topic);
                                }
                            })
                        })
                        if (topics.length !== 0) {
                            unitTopics.push({
                                category: category,
                                topics: topics
                            })
                        }
                    });

                    if (unitTopics.length > 0) {
                        loadedSelectedUnitsTopics.push({
                            unit_identifier: unit.unit_identifier,
                            event_id: unit.event_id,
                            event_name: unit.event_name,
                            unit_name: unit.unit_name,
                            unit_topics: unitTopics
                        })
                    }
                }
            });
        })

        //Remove all existing selectedTopics for the current units from TopicContext
        TopicCtx.removeUnits(selectedUnitIdentifiers);
        //Update TopicContext with the new loadedSelectedUnitsTopics
        TopicCtx.updateUnitTopics(loadedSelectedUnitsTopics);
    }

    useEffect(() => {
        props.selectedUnits.forEach(item => {
            setSelectedUnitIdentifiers(prev => [...prev.filter(n_item => n_item !== undefined && item !== undefined  && n_item.unit_identifier !== item.unit_identifier), item.unit_identifier]);
        });
        setMsg('');
        setIsLoaded(false);
        setIsLoaded(false);
    }, [props])

    return (
        <React.Fragment>
            <Stack spacing={1} direction="row" sx={{ float: 'right' }}>
                <Tooltip title="Default topic setting: Given an event and units, updating the list of selected topics to default selected topics for the units." placement="top" arrow>
                    <Button variant='outlined' size='small' onClick={saveDefaultSeletedTopicsHandler}>Save</Button>
                </Tooltip>
                <Tooltip title="Default topic setting: Given an event and units, loading the default list of selected topics for the units." placement="top" arrow >
                    <Button variant='outlined' size='small' onClick={loadDefaultSelectedTopicsHandler}>Load</Button>
                </Tooltip>
            </Stack>
            {isSaved || isLoaded ? <Typography sx={{ color: 'green', float: 'right', display: 'inline-flex' }}>{msg}</Typography> : <Typography sx={{ color: 'red', float: 'right' }}>{msg}</Typography>}
        </React.Fragment>
    )
}

export default DefaultTopicSettings