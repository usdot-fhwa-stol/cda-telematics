import { createContext, useState } from "react";

const TopicContext = createContext({
    selected_unit_topics_list: [], //Selected topics for all selected units including both platform and infrastructure
    updateUnitTopics: (unitTopicsList) => { },
    removeUnits: (unitIdentifierList) => { },
    clear: () => { }
});

export const TopicContextProvider = (props) => {
    const [unitTopicsList, setUnitTopicsList] = useState([]);
    const updateUnitTopicsHandler = (unitTopicsList) => {
        unitTopicsList.forEach(unitTopics => {
            setUnitTopicsList(prev => [...prev.filter(item => item.unit_identifier !== unitTopics.unit_identifier), unitTopics])
        })
    }

    const removeUnitsHandler = (unitIdentifierList) => {
        setUnitTopicsList(prev => [...prev.filter(item => !unitIdentifierList.includes(item.unit_identifier))])
    }

    const clear = () => {
        setUnitTopicsList([])
    }

    const context = {
        selected_unit_topics_list: unitTopicsList,
        updateUnitTopics: updateUnitTopicsHandler,
        removeUnits: removeUnitsHandler,
        clear: clear
    }
    return <TopicContext.Provider value={context}>{props.children}</TopicContext.Provider>
}

export default TopicContext;