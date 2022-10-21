
import { Button, Card, CardContent, CardHeader, Grid, Tooltip } from '@mui/material';
import React, { useContext, useEffect, useState } from 'react';
import TopicContext from '../../context/topic-context';
import TopicListPerUnit from './TopicListPerUnit';

const TopicList = React.memo((props) => {
    const [selectedUnits, setSelectedUnits] = useState([]);
    const [selectedUnitIdentifiers, setSelectedUnitIdentifiers] = useState([]);
    const [checkedSelectedTopics, setCheckedSelectedTopics] = useState([]);
    //Topics in Selected topics section
    const TopicCtx = useContext(TopicContext);
    //Checkbox checked and in Available Topics section
    const [checkedAvailableTopics, setCheckedAvailableTopics] = useState([]);

    const checkAvailableTopicsHanlder = (checkedTopic) => {
        const foundChecked = checkedAvailableTopics.filter(item => item.topic_name === checkedTopic.topic_name && item.unit_identifier === checkedTopic.unit_identifier);
        if (foundChecked.length === 0) //Checked a topic not exists in the checked topic list
        {
            setCheckedAvailableTopics([...checkedAvailableTopics, checkedTopic])
        }
    }

    const unCheckAvailableTopicsHanlder = (checkedTopic) => {
        let index = 0;
        checkedAvailableTopics.forEach(item => {
            if (item.topic_name.includes(checkedTopic.topic_name) && item.unit_identifier.includes(checkedTopic.unit_identifier)) {
                checkedAvailableTopics.splice(index, 1);
            }
            index++;
        })
        setCheckedAvailableTopics(checkedAvailableTopics);
    }

    const addSelectedTopicsHandler = () => {
        if (selectedUnits !== undefined) {
            let selectedTopics = [];
            let removedUnitIndetifiers = []
            selectedUnits.forEach(unit => {
                let unitTopics = [];
                if (unit.unit_topics !== undefined) {
                    unit.unit_topics.forEach(item => {
                        let category = item.category;
                        let topics = [];
                        item.topics.forEach(topic => {
                            checkedAvailableTopics.forEach(checkedTopic => {
                                if (checkedTopic.topic_name === topic.name) {
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
                        selectedTopics.push({
                            unit_identifier: unit.unit_identifier,
                            event_id: unit.event_id,
                            event_name: unit.event_name,
                            unit_name: unit.unit_name,
                            unit_topics: unitTopics
                        })
                    } else {
                        removedUnitIndetifiers.push(unit.unit_identifier)
                    }
                }
            });

            if (checkedAvailableTopics.length === 0) {
                //Remove the units if no topics in the newSelectedTopicLists
                if (removedUnitIndetifiers.length > 0) {
                    //If no available topics selected and click on the select topics button, it will clear the selected topic list.
                    TopicCtx.removeUnits(removedUnitIndetifiers);
                }
            }

            if (selectedTopics.length > 0) {
                //Remove the units if no topics in the newSelectedTopicLists
                if (removedUnitIndetifiers.length > 0) {
                    TopicCtx.removeUnits(removedUnitIndetifiers);
                }
                TopicCtx.updateUnitTopics(selectedTopics);
            }
        }
    }

    const checkSelectedTopicsHanlder = (checkedTopic) => {
        const foundChecked = checkedSelectedTopics.filter(item => item.topic_name === checkedTopic.topic_name && item.unit_identifier === checkedTopic.unit_identifier);
        if (foundChecked.length === 0) //Checked a topic not exists in the checked topic list
        {
            setCheckedSelectedTopics([...checkedSelectedTopics, checkedTopic])
        }
    }
    const unCheckSelectedTopicsHanlder = (checkedTopic) => {
        let index = 0;
        checkedSelectedTopics.forEach(item => {
            if (item.topic_name.includes(checkedTopic.topic_name) && item.unit_identifier.includes(checkedTopic.unit_identifier)) {
                checkedSelectedTopics.splice(index, 1);
            }
            index++;
        })
        setCheckedSelectedTopics(checkedSelectedTopics);
    }

    const removeSelectedTopicsHandler = () => {
        if (TopicCtx.selected_unit_topics_list !== undefined) {
            let checkedTopicNames = [];
            checkedSelectedTopics.forEach(checkedTopic => {
                checkedTopicNames.push(checkedTopic.topic_name);
            });
            if (checkedTopicNames.length === 0) { return; }

            let newSelectedTopicLists = [];
            let checked_count = 0;
            let removedUnitIndetifiers = []
            //The topic context includes units from both platform and infrastructure
            TopicCtx.selected_unit_topics_list.forEach(unit => {
                if (selectedUnitIdentifiers.includes(unit.unit_identifier)) {
                    let new_unit_topics = [];
                    unit.unit_topics.forEach(item => {
                        let newTopics = [];
                        item.topics.forEach(topic => {
                            if (!checkedTopicNames.includes(topic.name)) {
                                newTopics.push(topic);
                            } else {
                                checked_count++;
                            }
                        });

                        //If there are topics that are not checked meaning the newTopics array is not empty, add topics to the newunit_topics.
                        if (newTopics.length !== 0) {
                            new_unit_topics.push({
                                category: item.category,
                                topics: newTopics
                            });
                        }
                    });

                    //If there are topics that are not checked to be removed, add the topics to the newSelectedTopics
                    if (new_unit_topics.length > 0) {
                        newSelectedTopicLists.push({
                            unit_identifier: unit.unit_identifier,
                            event_id: unit.event_id,
                            event_name: unit.event_name,
                            unit_name: unit.unit_name,
                            unit_topics: new_unit_topics
                        });
                    } else {
                        //All topics belong to the current unit are checked to be removed, thus this unit won't be added to newSelectedTopicsList.
                        //Keep track of the removed unit
                        removedUnitIndetifiers.push(unit.unit_identifier);
                    }
                }
            });

            //If there are topics that are not checked, replace the selectedTopicLists with the newSelectedTopicLists 
            if (newSelectedTopicLists.length > 0) {
                //If there are topics for units in the newSelectedTopicLists, update the topics for the units.
                TopicCtx.updateUnitTopics(newSelectedTopicLists);
                //Remove the units if no topics in the newSelectedTopicLists
                if (removedUnitIndetifiers.length > 0) {
                    TopicCtx.removeUnits(removedUnitIndetifiers);
                }
            } else if (checked_count > 0) {
                //Remove the units if no topics in the newSelectedTopicLists
                if (removedUnitIndetifiers.length > 0) {
                    TopicCtx.removeUnits(removedUnitIndetifiers);
                }
            }
            setCheckedSelectedTopics([]);
        }
    }

    const selectAllTopicsHandler = () => {
        //Move all available topics to selected topics section only when there are at one available topics.
        let isAnyTopicSelected = false;
        selectedUnits.forEach(unit => {
            if (unit.unit_topics !== undefined && unit.unit_topics.length > 0) {
                isAnyTopicSelected = true;
            };
        });

        if (selectedUnits !== undefined && selectedUnits.length > 0 && isAnyTopicSelected) {
            TopicCtx.updateUnitTopics(selectedUnits);
        }
    }

    const unSelectAllTopicsHandler = () => {
        //Remove the units if remove all selected topics from the selected topics section
        TopicCtx.removeUnits(selectedUnitIdentifiers);
        setCheckedSelectedTopics([]);
    }

    useEffect(() => {
        setSelectedUnits([...props.selectedUnits]);
        props.selectedUnits.forEach(item => {
            setSelectedUnitIdentifiers(prev => [...prev, item.unit_identifier]);
        });
    }, [props])

    return (
        <React.Fragment>
            <Grid item xs={5}>
                <Card sx={{ height: '500px', overflowY: 'scroll' }}>
                    <CardHeader sx={{ color: "#000", backgroundColor: "#eee", padding: 1 }} title="Available Topics" titleTypographyProps={{ variant: 'title' }} />
                    <CardContent>
                        {
                            selectedUnits !== undefined && selectedUnits.length !== 0 && selectedUnits.map(unit => (
                                <TopicListPerUnit key={`available-topics-${unit.unit_identifier}`}
                                    openItems={true}
                                    unit_identifier={unit.unit_identifier}
                                    unit_name={unit.unit_name}
                                    unit_topics={unit.unit_topics}
                                    onChecked={checkAvailableTopicsHanlder}
                                    onUnChecked={unCheckAvailableTopicsHanlder} />
                            ))
                        }
                    </CardContent>
                </Card>
            </Grid>
            <Grid item xs={2} sx={{ textAlign: 'center', margin: 'auto' }}>
                <Tooltip title="Move checked available topics" placement="top">
                    <Button variant="outlined" onClick={addSelectedTopicsHandler}>&gt;&gt;</Button>
                </Tooltip>
                <br />
                <Tooltip title="Move all available topics" placement="top">
                    <Button variant="outlined" onClick={selectAllTopicsHandler} sx={{ marginTop: '10px' }}>&gt;&gt;&gt;</Button>
                </Tooltip>
                <br />
                <br />
                <Tooltip title="Move checked selected topics" placement="top">
                    <Button variant="outlined" onClick={removeSelectedTopicsHandler}>&lt;&lt;</Button>
                </Tooltip>
                <br />
                <Tooltip title="Move all selected topics" placement="top">
                    <Button variant="outlined" onClick={unSelectAllTopicsHandler} sx={{ marginTop: '10px' }}>&lt;&lt;&lt;</Button>
                </Tooltip>
                <br />
            </Grid>
            <Grid item xs={5}>
                <Card sx={{ height: '500px', overflowY: 'scroll' }}>
                    <CardHeader sx={{ color: "#000", backgroundColor: "#33bfff", padding: 1 }} title="Selected Topics" titleTypographyProps={{ variant: 'title' }} />
                    <CardContent>
                        {
                            TopicCtx.selected_unit_topics_list !== undefined && TopicCtx.selected_unit_topics_list.length > 0
                            && TopicCtx.selected_unit_topics_list.map(selected_unit => {
                                if (selectedUnitIdentifiers.includes(selected_unit.unit_identifier)) {
                                    return <TopicListPerUnit key={`selected-topics-${selected_unit.unit_identifier}`}
                                        openItems={true}
                                        unit_identifier={selected_unit.unit_identifier}
                                        unit_name={selected_unit.unit_name}
                                        unit_topics={selected_unit.unit_topics}
                                        onChecked={checkSelectedTopicsHanlder}
                                        onUnChecked={unCheckSelectedTopicsHanlder} />
                                }
                                return <React.Fragment>No Topics</React.Fragment>
                            })
                        }
                    </CardContent>
                </Card>
            </Grid>
        </React.Fragment >
    )
});

export default TopicList