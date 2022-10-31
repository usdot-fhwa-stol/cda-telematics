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