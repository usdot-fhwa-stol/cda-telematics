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
    const User = seq.define("user", {
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
        login: {
            type: Sequelize.STRING,
            defaultValue: '',
            allowNull: false,
        },
        email: {
            type: Sequelize.STRING,
            defaultValue: '',
            allowNull: false,
        },
        name: {
            type: Sequelize.STRING,
            defaultValue: '',
            allowNull: true,
        },
        password: {
            type: Sequelize.STRING,
            defaultValue: '',
            allowNull: true,
        },
        salt: {
            type: Sequelize.STRING,
            defaultValue: '',
            allowNull: true,
        },
        rands: {
            type: Sequelize.STRING,
            defaultValue: '',
            allowNull: true,
        },
        company: {
            type: Sequelize.STRING,
            defaultValue: '',
            allowNull: true,
        },
        org_id: {
            type: Sequelize.INTEGER,
            defaultValue: 0,
            allowNull: false,
        },
        email_verified: {
            type: Sequelize.INTEGER,
            defaultValue: 0,
            allowNull: false,
        },
        is_admin: {
            type: Sequelize.INTEGER,
            defaultValue: 0,
            allowNull: false,
        },
        theme: {
            type: Sequelize.STRING,
            defaultValue: '',
            allowNull: true,
        },
        created: {
            type: 'TIMESTAMP',
            defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
            allowNull: false
        },
        updated: {
            type: Sequelize.INTEGER,
            defaultValue: 0,
            allowNull: false,
        },
        help_flags1: {
            type: Sequelize.INTEGER,
            defaultValue: 0,
            allowNull: true,
        },
        last_seen_at: {
            type: 'TIMESTAMP',
            defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
            allowNull: false
        },
        is_disabled: {
            type: Sequelize.INTEGER,
            defaultValue: 0,
            allowNull: true,
        },
        is_service_account: {
            type: Sequelize.INTEGER,
            defaultValue: 0,
            allowNull: true,
        },
    }, {
        underscored: true,
        freezeTableName: true 
    });
    return User;
}