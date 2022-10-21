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