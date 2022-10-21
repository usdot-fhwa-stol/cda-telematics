import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { Tooltip } from '@mui/material';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import * as React from 'react';
import { Link } from 'react-router-dom';

export default function DashboardDropDownMenu(props) {
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
                <MenuItem onClick={handleClose} disableRipple>
                    <Button size="small" variant='outlined' onClick={onOpenAssignDashboardDialog}>(Un)Assign Dashboards</Button>
                </MenuItem>
            </Menu>
        </React.Fragment>
    );
}

