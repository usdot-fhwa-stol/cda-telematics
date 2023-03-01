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
    const Dashboard = seq.define("dashboard", {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false,
        },
        version: {
            type: Sequelize.INTEGER,
            defaultValue: 0,
            allowNull: false,
        }, 
        org_id: {
            type: Sequelize.INTEGER,
            defaultValue: 0,
            allowNull: false,
        },
        data: {
            type: Sequelize.TEXT('medium'),
            defaultValue: 0,
            allowNull: false,
        },
        slug: {
            type: Sequelize.STRING,
            defaultValue: '',
            allowNull: false,
        },
        title: {
            type: Sequelize.STRING,
            defaultValue: '',
            allowNull: false,
        },
        plugin_id: {
            type: Sequelize.STRING,
            defaultValue: '',
            allowNull: true,
        },
        created_by: {
            type: Sequelize.INTEGER,
            defaultValue: 0,
            allowNull: true,
        },
        updated_by: {
            type: Sequelize.INTEGER,
            defaultValue: 0,
            allowNull: true,
        },
        gnet_id: {
            type: Sequelize.INTEGER,
            defaultValue: 0,
            allowNull: true,
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
        },
        folder_id: {
            type: Sequelize.INTEGER,
            defaultValue: 0,
            allowNull: false,
        },
        uid: {
            type: Sequelize.INTEGER,
            defaultValue: 0,
            allowNull: true
        },
        is_folder: {
            type: Sequelize.INTEGER,
            defaultValue: 0,
            allowNull: false,
        },
        has_acl: {
            type: Sequelize.INTEGER,
            defaultValue: 0,
            allowNull: false,
        },
        is_public: {
            type: Sequelize.INTEGER,
            defaultValue: 0,
            allowNull: false,
        },
    }, {
        underscored: true,
        freezeTableName: true 
    });
    return Dashboard;
}