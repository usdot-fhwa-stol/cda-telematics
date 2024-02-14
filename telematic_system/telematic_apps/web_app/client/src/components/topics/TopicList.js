
/*
 * Copyright (C) 2019-2024 LEIDOS.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not
 * use this file except in compliance with the License. You may obtain a copy of
 * the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
 */
import { Card, CardContent, CardHeader, Grid } from '@mui/material';
import React, { useContext, useEffect, useState } from 'react';
import { findUserTopicRequestByUserEventUnits } from '../../api/user-topic-request';
import AuthContext from '../../context/auth-context';
import TopicContext from '../../context/topic-context';
import { CustomizedButton } from '../ui/CustomizedButton';
import TopicListPerUnit from './TopicListPerUnit';
import { CustomizedOutlinedButton } from '../ui/CustomizedOutlinedButton';

const TopicList = React.memo((props) => {
    const [selectedUnits, setSelectedUnits] = useState([]);
    const [selectedUnitIdentifiers, setSelectedUnitIdentifiers] = useState([]);
    const [checkedSelectedTopics, setCheckedSelectedTopics] = useState([]);
    const authCtx = React.useContext(AuthContext)
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
        addSelectedTopic(selectedUnits, checkedAvailableTopics);
    }

    const addSelectedTopic = (selectedUnitsLocal, checkedAvailableTopicsLocal) => {
        if (selectedUnitsLocal !== undefined) {
            let selectedTopics = [];
            let removedUnitIndetifiers = []
            selectedUnitsLocal.forEach(unit => {
                let unitTopics = [];
                if (unit.unit_topics !== undefined && Array.isArray(unit.unit_topics)) {
                    unit.unit_topics.forEach(item => {
                        let category = item.category;
                        let topics = [];
                        item.topics.forEach(topic => {
                            checkedAvailableTopicsLocal.forEach(checkedTopic => {
                                if (checkedTopic.topic_name === topic.name && checkedTopic.unit_identifier === unit.unit_identifier) {
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
                            unit_type: unit.unit_type,
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
                    if (Array.isArray(unit.unit_topics)) {
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
                    }

                    //If there are topics that are not checked to be removed, add the topics to the newSelectedTopics
                    if (new_unit_topics.length > 0) {
                        newSelectedTopicLists.push({
                            unit_identifier: unit.unit_identifier,
                            event_id: unit.event_id,
                            event_name: unit.event_name,
                            unit_name: unit.unit_name,
                            unit_type: unit.unit_type,
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

    //OnLoad existing user topic request into the selected topic section and update the available checkboxes with the requested topics
    const onloadUserTopicRequestForUnits = () => {
        TopicCtx.clearPreCheckedAvailableTopics();
        let unitIdentifiers = [];
        props.selectedUnits.forEach(selectedUnit => {
            unitIdentifiers.push(selectedUnit.unit_identifier);
        })
        if (authCtx.user_id === undefined) {
            console.error("Cannot load user topic request if user id is undefined.")
            return;
        }
        let event_id = props.selectedUnits[0].event_id;
        const response_data = findUserTopicRequestByUserEventUnits(event_id, unitIdentifiers, authCtx.user_id);
        response_data.then(data => {
            //Update the selected topic section with the existing topic request if the topic exist in the available topic list
            let preCheckedAvailableTopicsLocal = [];
            if (data !== undefined && Array.isArray(data) && data.length > 0) {
                data.forEach(userTopicRequest => {
                    const userReqTopicNames = userTopicRequest.topic_names;
                    userReqTopicNames.split(",").forEach(userReqTopicName => {
                        if (userReqTopicName !== undefined && userReqTopicName.length > 0) {

                            let preCheckedAvailableTopic = {
                                topic_name: userReqTopicName,
                                unit_identifier: userTopicRequest.unit_identifier
                            }
                            preCheckedAvailableTopicsLocal.push(preCheckedAvailableTopic);
                        }
                    });
                });
                //Automatically check the user request topic
                setCheckedAvailableTopics([...preCheckedAvailableTopicsLocal])
                //Use Topic context to help render the checked avaiable topics
                TopicCtx.updatePreCheckAvailableTopics(preCheckedAvailableTopicsLocal);
                //Automatically select the existing user requested topics
                addSelectedTopic(props.selectedUnits, preCheckedAvailableTopicsLocal);
            }

            //Add a dummy preCheckedAvailableTopics to topic context pre_checked_available_topics in order to enforce rendering checkbox checked on first load
            TopicCtx.updatePreCheckAvailableTopics([{
                topic_name: '',
                unit_identifier: ''
            }]);
        }).catch(error => {
            console.error(error)
        })
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

        //After loading the available topic list, update the selected topic section with existing user topic request
        if (props.selectedUnits.length > 0) {
            onloadUserTopicRequestForUnits();
        }
    }, [props])

    return (
        <React.Fragment>
            <Grid item xs={5}>
                <Card sx={{ height: '500px', overflowY: 'scroll' }}>
                    <CardHeader sx={{ color: "#000", backgroundColor: "#eee", padding: 1 }} title="Available Topics" titleTypographyProps={{ variant: 'title' }} />
                    <CardContent>
                        {
                            TopicCtx.pre_checked_available_topics !== undefined && TopicCtx.pre_checked_available_topics.length > 0 &&
                            selectedUnits !== undefined && selectedUnits.length !== 0 && selectedUnits.map(unit => (
                                <TopicListPerUnit key={`available-topics-${unit.unit_identifier}`}
                                    openItems={true}
                                    unit_type={unit.unit_type}
                                    unit_identifier={unit.unit_identifier}
                                    unit_name={unit.unit_name}
                                    unit_topics={unit.unit_topics}
                                    onChecked={checkAvailableTopicsHanlder}
                                    onUnChecked={unCheckAvailableTopicsHanlder}
                                    title="available" />
                            ))
                        }
                    </CardContent>
                </Card>
            </Grid>
            <Grid item xs={2} sx={{ textAlign: 'center', margin: 'auto' }}>
                
                <CustomizedOutlinedButton title="Move all available topics" key="selectedTopics" onClick={addSelectedTopicsHandler}>
                    &gt;&gt;
                </CustomizedOutlinedButton>
                <br />
                <CustomizedOutlinedButton title="Move all available topics" key="selectedAllTopics" onClick={selectAllTopicsHandler}>
                    &gt;&gt;&gt;
                </CustomizedOutlinedButton>
                <br />
                <br />
                <CustomizedOutlinedButton title="remove move checked selected topics"  key="removeSelectedTopics" onClick={removeSelectedTopicsHandler}>
                    &lt;&lt;
                </CustomizedOutlinedButton>
                <br />
                <CustomizedOutlinedButton title="Move checked selected topics" key="MoveSelectedTopics" onClick={unSelectAllTopicsHandler}>
                    &lt;&lt;&lt;
                </CustomizedOutlinedButton>
                <br />
            </Grid>
            <Grid item xs={5}>
                <Card sx={{ height: '500px', overflowY: 'scroll' }}>
                    <CardHeader sx={{ color: "#000", backgroundColor: "#eee", padding: 1 }} title="Selected Topics" titleTypographyProps={{ variant: 'title' }} />
                    <CardContent>
                        {
                            TopicCtx.selected_unit_topics_list !== undefined && TopicCtx.selected_unit_topics_list.length > 0
                            && TopicCtx.selected_unit_topics_list.map(selected_unit => {
                                if (selectedUnitIdentifiers.includes(selected_unit.unit_identifier)) {
                                    return <TopicListPerUnit
                                        key={`selected-topics-per-unit-${selected_unit.unit_identifier}-${selected_unit.unit_type}-${Date.now()}`}
                                        openItems={true}
                                        unit_type={selected_unit.unit_type}
                                        unit_identifier={selected_unit.unit_identifier}
                                        unit_name={selected_unit.unit_name}
                                        unit_topics={selected_unit.unit_topics}
                                        onChecked={checkSelectedTopicsHanlder}
                                        onUnChecked={unCheckSelectedTopicsHanlder}
                                        title="selected" />
                                }
                            })
                        }
                    </CardContent>
                </Card>
            </Grid>
        </React.Fragment >
    )
});

export default TopicList