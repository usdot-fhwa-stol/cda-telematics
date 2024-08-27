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
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import { Collapse, List, ListItemButton, ListItemText } from '@mui/material';
import React from 'react';
import TopicCheckBoxListItem from './TopicCheckBoxListItem';

const TopicListItems = React.memo((props) => {

    const [openItems, setOpenItems] = React.useState(true);
    const handleCheckboxClick = () => {
        setOpenItems(!openItems);
    };

    const checkTopicHanlder = (checkedTopicName) => {
        const checkedTopic = {
            unit_name: props.unit_name,
            unit_identifier: props.unit_identifier,
            topic_name: checkedTopicName
        }
        props.onChecked(checkedTopic);
    }

    const unCheckTopicHanlder = (checkedTopicName) => {
        const unCheckedTopic = {
            unit_name: props.unit_name,
            unit_identifier: props.unit_identifier,
            topic_name: checkedTopicName
        }
        props.onUnChecked(unCheckedTopic);
    }


    return (
        <React.Fragment>
            <ListItemButton key={`topic-list-item-expand-${props.unit_identifier}-${props.unit_name}-${props.topic_category.category}`} onClick={handleCheckboxClick}>
                <ListItemText primary={`${props.topic_category.category}`} primaryTypographyProps={{ marginLeft:1, p:0 }} />
                {openItems ? <ExpandLess /> : <ExpandMore />}
            </ListItemButton>
            <Collapse key={`topic-list-item-collapse-${props.unit_identifier}-${props.unit_name}-${props.topic_category.category}`} in={openItems} timeout="auto" unmountOnExit>
                <List key={`topic-list-item-list-${props.unit_identifier}-${props.unit_name}-${props.topic_category.category}`}>
                    {props.topic_category.topics.map((topic) =>
                            <TopicCheckBoxListItem 
                                value={topic.name}
                                key={`topic-list-item-topic-name-${props.unit_identifier}-${props.unit_name}-${props.topic_category.category}-${topic.name}`}
                                onUnChecked={unCheckTopicHanlder}
                                onChecked={checkTopicHanlder}
                                sx={{display: 'inline'}}
                                labelId={`checkbox-list-label-selected-${topic.name}`} 
                                topic_name={topic.name}
                                title={props.title}
                                message_type="NA"
                                message_fields="NA"
                                unit_identifier={props.unit_identifier}/>
                    )}
                </List>
            </Collapse>
        </React.Fragment>
    )
});

export default TopicListItems