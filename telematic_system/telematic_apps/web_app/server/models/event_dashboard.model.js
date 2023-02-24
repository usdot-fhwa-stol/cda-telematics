/*
 * Copyright (C) 2019-2023 LEIDOS.
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
const grafana_db = require("../models")

module.exports = (seq, Sequelize) => {
    const EventDashboard = seq.define("event_dashboard", {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false,
        }, 
        event_id: {
            type: Sequelize.INTEGER,
            defaultValue: 0,
            allowNull: false,
        },
        dashboard_id: {
            type: Sequelize.INTEGER,
            defaultValue: 0,
            allowNull: false,
        },
        created: {
            type: 'TIMESTAMP',
            defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
            allowNull: false
        },
        updated: {
            type: 'TIMESTAMP',
            defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
            allowNull: false,
        }
    }, {
        underscored: true,
        freezeTableName: true ,
        indexes:[
            {
                unique: true,
                fields: ['dashboard_id','event_id']
            }
        ]
    });
    return EventDashboard;
}