/*
 * Copyright (C) 2019-2022 LEIDOS.
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
import TopicListItems from './TopicListItems';

const TopicListPerUnit = React.memo((props) => {
    const [openItems, setOpenItems] = React.useState(true);
    const handleCheckboxClick = () => {
        setOpenItems(!openItems);
    };

    return (
        <React.Fragment>
            <ListItemButton key={`unit-list-expand-${props.unit_identifier}-${props.unit_name}`} onClick={handleCheckboxClick}>
                <ListItemText key={`unit-list-text-expand-${props.unit_identifier}-${props.unit_name}`}  primary={`${props.unit_type}-${props.unit_name} (${props.unit_identifier})`} primaryTypographyProps={{ fontWeight: 'bolder' }} />
                {openItems ? <ExpandLess /> : <ExpandMore />}
            </ListItemButton>
            <Collapse key={`unit-list-collapse-${props.unit_identifier}-${props.unit_name}`} in={openItems} timeout="auto" unmountOnExit>
                <List key={`unit-list-topics-${props.unit_identifier}-${props.unit_name}`}>
                    {
                        props.unit_topics !== undefined && props.unit_topics.length !== 0 && props.unit_topics.map((topic_category) => (
                            <TopicListItems key={`topic-list-items-${props.unit_identifier}-${topic_category.category}`}
                                unit_identifier={props.unit_identifier}
                                unit_name={props.unit_name}
                                topic_category={topic_category}
                                onChecked={props.onChecked}
                                onUnChecked={props.onUnChecked}
                                title={props.title} />
                        ))}
                </List>
            </Collapse>
        </React.Fragment>
    )
});

export default TopicListPerUnit