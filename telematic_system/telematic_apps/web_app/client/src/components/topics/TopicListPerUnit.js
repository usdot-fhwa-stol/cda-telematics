import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import { Collapse, List, ListItemButton, ListItemText } from '@mui/material';
import React from 'react';
import TopicListItems from './TopicListItems';

const TopicListPerUnit = React.memo((props) => {
    const [openItems, setOpenItems] = React.useState(true);
    const handleCheckboxClick = () => {
        setOpenItems(!openItems);
    };

    return (
        <React.Fragment>
            <ListItemButton key={`unit-list-expand-${props.unit_identifier}-${props.unit_name}`} onClick={handleCheckboxClick}>
                <ListItemText primary={`${props.unit_type}-${props.unit_name} (${props.unit_identifier})`} primaryTypographyProps={{ fontWeight: 'bolder' }} />
                {openItems ? <ExpandLess /> : <ExpandMore />}
            </ListItemButton>
            <Collapse key={`unit-list-collapse-${props.unit_identifier}-${props.unit_name}`} in={openItems} timeout="auto" unmountOnExit>
                <List key={`unit-list-topics-${props.unit_identifier}-${props.unit_name}`}>
                    {
                        props.unit_topics !== undefined && props.unit_topics.length !== 0 && props.unit_topics.map((topic_category) => (
                            <TopicListItems key={`topic-list-items-${props.unit_identifier}-${topic_category.category}`}
                                unit_identifier={props.unit_identifier}
                                unit_name={props.unit_name}
                                topic_category={topic_category}
                                onChecked={props.onChecked}
                                onUnChecked={props.onUnChecked} />
                        ))}
                </List>
            </Collapse>
        </React.Fragment>
    )
});

export default TopicListPerUnit