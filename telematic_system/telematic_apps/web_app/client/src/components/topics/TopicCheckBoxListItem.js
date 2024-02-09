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
import { Checkbox, ListItem, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import React, { useContext, useEffect } from 'react';
import TopicContext from '../../context/topic-context';
import TopicMessageDetailPopover from './TopicMessageDetailPopover';

const TopicCheckBoxListItem = (props) => {
    const TopicCtx = useContext(TopicContext);

    const [checked, setChecked] = React.useState([0]);

    const handleToggle = (value) => () => {
        const currentIndex = checked.indexOf(value);
        const newChecked = [...checked];

        if (currentIndex === -1) {
            newChecked.push(value);
            props.onChecked(value);
        } else {
            newChecked.splice(currentIndex, 1);
            props.onUnChecked(value);
        }
        setChecked(newChecked);
    };

    useEffect(() => {
        //Automatically check the available topic if it is prechecked 
        if (TopicCtx.pre_checked_available_topics !== undefined && TopicCtx.pre_checked_available_topics.length > 0 && props.title ==="available") {
            TopicCtx.pre_checked_available_topics .forEach(preCheckedTopic => {
                if (preCheckedTopic.topic_name === props.value && preCheckedTopic.unit_identifier===props.unit_identifier) {
                    setChecked(props.value);
                }
            })
        }
    }, [])

    return (
        <React.Fragment>
            <ListItem
                sx={{ display: 'inline-list-item', m: 0, width: '100%', maxWidth: 360 }}
                key={`list-item-${props.unit_identifier}-${props.value}`}
                disablePadding>
                <ListItemButton key={`list-item-btn-${props.unit_identifier}-${props.value}`} role={undefined} onClick={handleToggle(props.value)} dense>
                    <ListItemIcon key={`list-item-icon-${props.unit_identifier}-${props.value}`} >
                        <Checkbox
                            key={`list-item-checkbox-${props.unit_identifier}-${props.value}`}
                            edge="start"
                            checked={checked.indexOf(props.value) !== -1}
                            tabIndex={-1}
                            sx={{ m: 0 }}
                            disableRipple
                            inputProps={{ 'aria-labelledby': props.labelId }} />
                    </ListItemIcon>
                    <ListItemText key={`list-item-text-${props.unit_identifier}-${props.value}`} sx={{ m: 0, p: 0, wordBreak: "break-all" }} id={props.labelId} primary={props.value} />
                </ListItemButton>
                <TopicMessageDetailPopover topic_name={props.topic_name} message_type={props.message_type} message_fields={props.message_fields} />
            </ListItem>
        </React.Fragment>
    )
}

export default TopicCheckBoxListItem