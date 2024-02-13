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

const InfoPopover = (props) => {

    //Table column header Info popover Open/Close
    const [InfoAnchorEl, setInfoAnchorEl] = React.useState(null);
    const handleInfoPopoverOpen = (event) => {
        setInfoAnchorEl(event.currentTarget);
    };
    const handleInfoPopoverClose = () => {
        setInfoAnchorEl(null);
    }
    const openInfoPopover = Boolean(InfoAnchorEl);
    return (
        <React.Fragment>
            <InfoIcon
                onMouseEnter={handleInfoPopoverOpen}
                onMouseLeave={handleInfoPopoverClose} />

            <Popover
                id="mouse-over-popover"
                sx={{ pointerEvents: 'none'}}
                open={openInfoPopover}
                anchorEl={InfoAnchorEl}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'left',
                }}
                onClose={handleInfoPopoverClose}
                disableRestoreFocus >
                <Typography sx={{ p: 1 }}>{props.info}</Typography>
            </Popover>
        </React.Fragment>
    )
}

export default InfoPopover