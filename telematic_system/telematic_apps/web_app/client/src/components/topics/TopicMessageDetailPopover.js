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
import { Popover, Typography } from '@mui/material';
import React from 'react';
import InfoIcon from '@mui/icons-material/Info';

const TopicMessageDetailPopover = React.memo((props) => {
    //Event Info popover Open/Close
    const [eventInfoAnchorEl, setEventInfoAnchorEl] = React.useState(null);
    const openEventInfoPopover = Boolean(eventInfoAnchorEl);

    const handleEventInfoPopoverOpen = (event) => {
        setEventInfoAnchorEl(event.currentTarget);
    };
    const handleEventInfoPopoverClose = () => {
        setEventInfoAnchorEl(null);
    }
    return (
        <React.Fragment>
            {
                props.selectedTopic !== '' &&
                <InfoIcon
                    onMouseEnter={handleEventInfoPopoverOpen}
                    onMouseLeave={handleEventInfoPopoverClose} />
            }

            {
                props.selectedTopic !== '' &&
                <Popover
                    id="mouse-over-popover"
                    sx={{ pointerEvents: 'none' }}
                    open={openEventInfoPopover}
                    anchorEl={eventInfoAnchorEl}
                    anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'left',
                    }}
                    transformOrigin={{
                        vertical: 'top',
                        horizontal: 'left',
                    }}

                    PaperProps={{ style: { minWidth: 200 } }}
                    onClose={handleEventInfoPopoverClose}
                    disableRestoreFocus >
                    <Typography display="inline" sx={{ fontWeight: "bolder", paddingLeft: 1 }} variant='body2'>Topic Name: </Typography>
                    <Typography display="inline" variant='body2' sx={{ paddingRight: 1}}>{props.topic_name}</Typography><br />
                    <Typography display="inline" sx={{ fontWeight: "bolder", paddingLeft: 1 }} variant='body2'>Message Type: </Typography>
                    <Typography display="inline" variant='body2' sx={{ paddingRight: 1}}>{props.message_type} </Typography><br />
                    <Typography display="inline" sx={{ fontWeight: "bolder", paddingLeft: 1 }} variant='body2'>Message Fields: </Typography>
                    <Typography display="inline" variant='body2' sx={{ paddingRight: 1}}>{props.message_fields}</Typography>
                </Popover>
            }
        </React.Fragment>
    )
})

export default TopicMessageDetailPopover