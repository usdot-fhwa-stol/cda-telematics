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