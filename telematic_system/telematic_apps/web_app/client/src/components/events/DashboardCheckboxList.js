import { List } from '@mui/material'
import React from 'react'
import DashboardCheckBoxListItem from './DashboardCheckBoxListItem'

const DashboardCheckboxList = (props) => {
    return (
        <React.Fragment>
            <List key={`dashboard-checkbox-list-item-list`}>
                {props.searchedDashboards.map((dashboard) =>
                    <DashboardCheckBoxListItem
                        value={dashboard.id}
                        title={dashboard.title}
                        key={`dashboard-checkbox-list-item-${dashboard.id}-${dashboard.title}`}
                        onUnChecked={props.onUnChecked}
                        onChecked={props.onChecked}
                        // preChecked = {dashboard}
                        sx={{ display: 'inline' }}
                        labelId={`dashboard-checkbox-list-label-selected--${dashboard.id}-${dashboard.title}`} />
                )}
            </List>
        </React.Fragment>
    )
}

export default DashboardCheckboxList