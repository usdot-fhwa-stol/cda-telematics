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
import { Checkbox, ListItem, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import React from 'react';
import TopicMessageDetailPopover from './TopicMessageDetailPopover';

const TopicCheckBoxListItem = (props) => {

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

    return (
        <React.Fragment>
            <ListItem
                sx={{ display: 'inline-list-item', m: 0, width: '100%', maxWidth: 360 }}
                key={`list-item-${props.value}`}
                disablePadding>
                <ListItemButton key={`list-item-btn-${props.value}`} role={undefined} onClick={handleToggle(props.value)} dense>
                    <ListItemIcon key={`list-item-icon-${props.value}`} >
                        <Checkbox
                            key={`list-item-checkbox-${props.value}`}
                            edge="start"
                            checked={checked.indexOf(props.value) !== -1}
                            tabIndex={-1}
                            sx={{ m: 0 }}
                            disableRipple
                            inputProps={{ 'aria-labelledby': props.labelId }} />
                    </ListItemIcon>
                    <ListItemText key={`list-item-text-${props.value}`} sx={{ m: 0, p: 0, wordBreak: "break-all" }} id={props.labelId} primary={props.value} />
                </ListItemButton>
                <TopicMessageDetailPopover topic_name={props.topic_name} message_type={props.message_type} message_fields={props.message_fields} />
            </ListItem>
        </React.Fragment>
    )
}

export default TopicCheckBoxListItem