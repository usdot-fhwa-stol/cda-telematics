import React from 'react';

import InfoIcon from '@mui/icons-material/Info';
import { Popover, Typography } from '@mui/material';

const EventTableItemPopover = (props) => {

    //Table column header Info popover Open/Close
    const [tableColumnInfoAnchorEl, setTableColumnInfoAnchorEl] = React.useState(null);
    const handleTableColumnInfoPopoverOpen = (event) => {
        setTableColumnInfoAnchorEl(event.currentTarget);
    };
    const handleTableColumnInfoPopoverClose = () => {
        setTableColumnInfoAnchorEl(null);
    }
    const openTableColumnInfoPopover = Boolean(tableColumnInfoAnchorEl);
    return (
        <React.Fragment>
            <InfoIcon
                onMouseEnter={handleTableColumnInfoPopoverOpen}
                onMouseLeave={handleTableColumnInfoPopoverClose} />

            <Popover
                id="mouse-over-popover"
                PaperProps={{ style: { maxWidth: 300 } }}
                sx={{ pointerEvents: 'none' }}
                open={openTableColumnInfoPopover}
                anchorEl={tableColumnInfoAnchorEl}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'left',
                }}
                onClose={handleTableColumnInfoPopoverClose}
                disableRestoreFocus >
                <Typography sx={{ p: 1 }}>{props.info}</Typography>
            </Popover>
        </React.Fragment>
    )
}

export default EventTableItemPopover