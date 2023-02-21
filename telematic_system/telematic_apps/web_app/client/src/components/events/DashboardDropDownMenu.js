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
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { Tooltip } from '@mui/material';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import * as React from 'react';
import { Link } from 'react-router-dom';
import AuthContext from '../../context/auth-context';
import { USER_ROLES } from '../users/UserMetadata';

export default function DashboardDropDownMenu(props) {
    const authCtx = React.useContext(AuthContext)
    //Assign a dashboard Dialog
    const [anchorEl, setAnchorEl] = React.useState(null);
    const open = Boolean(anchorEl);
    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };

    const onOpenAssignDashboardDialog = () => {
        props.onOpenAssignDashboardDialog();
    }

    return (
        <React.Fragment>
            <Tooltip title="List of Dashboards" placement="top" arrow>
                <Button
                    id="dashboards-options-button"
                    aria-controls={open ? 'demo-customized-menu' : undefined}
                    aria-haspopup="true"
                    aria-expanded={open ? 'true' : undefined}
                    variant="outlined"
                    disableElevation
                    onClick={handleClick}
                    endIcon={<KeyboardArrowDownIcon />}>
                    Dashboards
                </Button>
            </Tooltip>
            <Menu
                id="dashboards-menu"
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}>
                <MenuItem onClick={handleClose} component={Link} to="/grafana" disableRipple>
                    Default dashboard
                </MenuItem>
                <Divider sx={{ my: 0.5 }} />
                {
                    authCtx.role !== USER_ROLES.VIEWER && authCtx.role !== undefined && authCtx.role !== null && authCtx.role !== "" &&
                    <MenuItem onClick={handleClose} disableRipple>
                        <Button size="small" variant='outlined' onClick={onOpenAssignDashboardDialog}>(Un)Assign Dashboards</Button>
                    </MenuItem>
                }
            </Menu>
        </React.Fragment>
    );
}

