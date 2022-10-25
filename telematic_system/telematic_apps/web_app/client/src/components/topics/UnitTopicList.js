
import SyncIcon from '@mui/icons-material/Sync';
import { Button, Card, CardContent, CardHeader, FormControl, Grid, InputLabel, MenuItem, OutlinedInput, Select, Tooltip, Typography } from '@mui/material';
import { Box } from '@mui/system';
import React, { useContext, useEffect, useState } from 'react';
import { getAvailableLiveTopicsByEventUnits } from '../../api/api-topics';
import TopicContext from '../../context/topic-context';
import DefaultTopicSettings from './DefaultTopicSettings';
import TopicList from './TopicList';
import { DEFAULT_TOPIC_CATEGORY_NAME } from './TopicMetadata';

const UnitTopicList = React.memo((props) => {
    const TopicCtx = useContext(TopicContext);
    const ITEM_HEIGHT = 48;
    const ITEM_PADDING_TOP = 8;
    const MenuProps = {
        PaperProps: {
            style: {
                maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
                width: 250,
            },
        },
    };

    //Topics in Available topics section
    const [availableUnits, setAvailableUnits] = useState([]);
    const [selectedUnits, setSelectedUnits] = useState([]);
    const [selectedUnitIdentifiers, setSelectedUnitIdentifiers] = useState([]);
    const [isRefreshed, setIsRefreshed] = useState(false);
    const [refreshMsg, setRefreshMsg] = useState('');

    const handleInfrastructureChange = (event) => {
        let unitIdentifiers = event.target.value.includes(',') ? event.target.value.split(',') : event.target.value;
        setSelectedUnitIdentifiers(unitIdentifiers);

        let selectedUnits = [];
        availableUnits.forEach(unit => {
            unitIdentifiers.forEach(id => {
                if (id === unit.unit_identifier) {
                    selectedUnits.push(unit);
                };
            })
        });

        if (props.availableUnits !== undefined && props.availableUnits.length > 0) {
            //Get Live units and topics from server
            const resposne_data = getAvailableLiveTopicsByEventUnits(unitIdentifiers);
            resposne_data.then(jsonList => {
                let availableUnitTopicsFromServer = [];
                jsonList.forEach(json => {
                    if (json !== undefined && json.errCode === undefined) {
                        availableUnitTopicsFromServer.push(json);
                    } else {
                        console.error(json);
                    }
                });

                //update unit_topics from server for availableUnits
                if (availableUnitTopicsFromServer.length > 0) {
                    availableUnits.forEach(unit => {
                        unitIdentifiers.forEach(id => {
                            if (id === unit.unit_identifier) {
                                //update unit_topics from server for each unit
                                const updatedUnit = getUpdatedUnitWithServerUnitTopics(unit, availableUnitTopicsFromServer);
                                selectedUnits = [...selectedUnits.filter(unit => unit.unit_identifier !== updatedUnit.unit_identifier), updatedUnit];
                            };
                        })
                    });
                }
                //set selectedUnit if selectedUnitUpdate is available.
                setSelectedUnits(selectedUnits);
            }).catch(err => {
                console.error(err)
            });
        };

        //clear the refresh  button status
        setRefreshMsg('');
        //clear TopicContext for all seleted topics of current units
        TopicCtx.removeUnits(selectedUnitIdentifiers);
    };

    //Refresh button click to send request to server to get latest list of available topics for the current selected units
    const refreshAvailableLiveTopics4SelectedUnit = () => {
        if (selectedUnits.length > 0) {
            const resposne_data = getAvailableLiveTopicsByEventUnits(selectedUnitIdentifiers);
            resposne_data.then(jsonList => {
                let refreshed_num = 0;
                let availableUnitTopicsFromServer = [];
                jsonList.forEach(json => {
                    if (json !== undefined && json.errCode === undefined) {
                        refreshed_num += 1;
                        availableUnitTopicsFromServer.push(json);
                    } else {
                        console.error("getAvailableTopicsByEventUnits failed" + json.errCode !== undefined ? json.errMsg : "");

                    }
                });
                let selectedUnitsUpdate = [];
                if (availableUnitTopicsFromServer.length > 0) {
                    selectedUnits.forEach(unit => {
                        const updatedUnit = getUpdatedUnitWithServerUnitTopics(unit, availableUnitTopicsFromServer);
                        selectedUnitsUpdate = [...selectedUnitsUpdate, updatedUnit];
                    });
                }
                setSelectedUnits(selectedUnitsUpdate);

                if (refreshed_num !== 0 && refreshed_num === jsonList.length) {
                    setIsRefreshed(true);
                    setRefreshMsg('Success');
                } else {
                    setIsRefreshed(false);
                    setRefreshMsg('Server error with at least one unit.');
                }

            }).catch(err => {
                console.error(err);
                setIsRefreshed(false);
                setRefreshMsg(err);
            })
        } else {
            setIsRefreshed(false);
            setRefreshMsg('Units cannot be empty');
            console.error("selectedUnits cannot be empty");
        }
    }

    const getUpdatedUnitWithServerUnitTopics = (cur_unit, serverAvailableLiveTopicsByEventUnits) => {
        let updatedUnit = cur_unit;
        serverAvailableLiveTopicsByEventUnits.forEach(serverUnit => {
            if (cur_unit.unit_identifier === serverUnit.unit_id) {
                updatedUnit.unit_topics = [];
                let category_names = [];

                //Find categories from the live topics
                serverUnit.topics.forEach(topic => {
                    let category_topic_array = topic.name.split(".");
                    //If there is '/' from the topic name consider the first occurrence after "/" as category name
                    if (category_topic_array.length > 1) {
                        category_names.push(category_topic_array[0]);
                    }
                });

                //If the number of category names does not match live topic length, it means some topics do not have category.
                //Those topics without a category will be added to Default category
                if (category_names.length !== 0 && category_names.length !== serverUnit.topics.length) {
                    updatedUnit.unit_topics.push({
                        category: DEFAULT_TOPIC_CATEGORY_NAME,
                        topics: []
                    })
                }

                //Remove duplicated topic names from the list
                let unique_category_names = [];
                category_names.forEach(name => {
                    if (!unique_category_names.includes(name)) {
                        unique_category_names.push(name);
                        updatedUnit.unit_topics.push({
                            category: name,
                            topics: []
                        });
                    }
                })

                //If there is no category from the all topics, create a default category and add all topics to default category
                if (unique_category_names.length === 0) {
                    let default_categgory_topics = {
                        category: DEFAULT_TOPIC_CATEGORY_NAME,
                        topics: serverUnit.topics
                    }
                    updatedUnit.unit_topics.push(default_categgory_topics);
                } else {
                    //If there is category for the topics, add each topic to the correct category
                    serverUnit.topics.forEach(liveTopic => {
                        let isTopicInCategory = false;
                        updatedUnit.unit_topics.forEach(item => {
                            let topic_name = liveTopic.name;
                            //Topic is in a category
                            if (topic_name.split(".").length > 0 && topic_name.split(".")[0] === item.category) {
                                item.topics.push(liveTopic);
                                isTopicInCategory = true;
                            }
                        });

                        //After running through all category, the liveTopic does not belong to any category, then consider it in Default category
                        if (!isTopicInCategory) {
                            updatedUnit.unit_topics.forEach(item => {
                                if (item.category.includes(DEFAULT_TOPIC_CATEGORY_NAME)) {
                                    item.topics.push(liveTopic);
                                }
                            });
                        }
                    });
                }
                return;
            }
        });
        return updatedUnit;

    }

    useEffect(() => {
        setAvailableUnits(props.availableUnits);
        setSelectedUnitIdentifiers([]);
        setSelectedUnits([]);
    }, [props]);

    return (
        <React.Fragment>
            <Grid container item xs={6} >
                <Box sx={{ width: '100%' }}>
                    <Card>
                        <CardHeader sx={{ color: "#000", backgroundColor: "#eee", padding: 1 }} title={props.unitSectionTitle} titleTypographyProps={{ variant: 'title' }} />
                        <CardContent>
                            <Grid container item xs={12}>
                                <Grid item xs={5} sx={{ marginBottom: '5px' }}>
                                    <FormControl sx={{ marginLeft: 0, marginBottom: '5px', width: '100%' }}>
                                        <InputLabel id={`${props.unitSectionTitle}Label`}>{props.unitSectionTitle} Units</InputLabel>
                                        <Select
                                            labelId={`${props.unitSectionTitle}Label`}
                                            id={`${props.unitSectionTitle}Id`}
                                            multiple
                                            value={selectedUnitIdentifiers}
                                            onChange={handleInfrastructureChange}
                                            input={<OutlinedInput label={`${props.unitSectionTitle}`} />}
                                            renderValue={(selected) => selected.join(',')}
                                            MenuProps={MenuProps}>
                                            {availableUnits.length > 0 && availableUnits.map(unit => (
                                                <MenuItem value={unit.unit_identifier} key={unit.unit_identifier}>{`${unit.unit_name}(${unit.unit_identifier})`}</MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={1} >
                                    <FormControl sx={{ m: 1, width: 30, display: "inline-flex" }}>
                                        <Tooltip title={`Send request to get latest topic list for the selected ${props.unitSectionTitle}s.`} placement="top" arrow>
                                            <Button variant="outlined" size='large' key={`refresh-${props.unitSectionTitle}-topics`} onClick={refreshAvailableLiveTopics4SelectedUnit}>
                                                <SyncIcon sx={{ color: '#2196f3' }} />
                                            </Button>
                                        </Tooltip>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={2}>
                                    <FormControl sx={{ m: 1, width: '100%', display: "inline-flex" }}>
                                        {isRefreshed && refreshMsg.length > 0 && <Typography sx={{ color: 'green' }} style={{ flex: 1 }}>{refreshMsg}</Typography>}
                                        {!isRefreshed && refreshMsg.length > 0 && <Typography sx={{ color: 'red' }} style={{ flex: 1 }}>{refreshMsg}</Typography>}
                                    </FormControl>
                                </Grid>
                                <Grid item xs={4}>
                                    {selectedUnits !== undefined && <DefaultTopicSettings selectedUnits={selectedUnits} />}
                                </Grid>
                                {selectedUnits !== undefined && <TopicList selectedUnits={selectedUnits} />}
                            </Grid>
                        </CardContent>
                    </Card>
                </Box>
            </Grid>
        </React.Fragment>
    )
});

export default UnitTopicList;