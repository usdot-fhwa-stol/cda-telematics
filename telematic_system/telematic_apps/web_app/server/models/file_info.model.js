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
 * 
 * Revision:
 *  Fix the eager loading of file info table to include user info: Add user_id foreign key referenced to user table. It indicates who upload this file.
 */
module.exports = (seq, Sequelize) => {
    const file_info = seq.define("file_info", {
        id: {
            type: Sequelize.BIGINT(20),
            autoIncrement: true,
            primaryKey: true,
            allowNull: false,
        },
        content_location: {
            type: Sequelize.STRING,
            defaultValue: '',
            allowNull: false,
        },
        original_filename: {
            type: Sequelize.STRING,
            defaultValue: '',
            allowNull: false,
            unique: true
        },
        process_status: {
            type: Sequelize.STRING,
            allowNull: true,
        },
        process_error_msg: {
            type: Sequelize.TEXT,
            allowNull: true,
        },
        size: {
            type: Sequelize.BIGINT.UNSIGNED,
            allowNull: true,
        },
        upload_status: {
            type: Sequelize.STRING,
            allowNull: true,
        },
        upload_error_msg: {
            type: Sequelize.TEXT,
            allowNull: true,
        },
        description: {
            type: Sequelize.TEXT,
            allowNull: true,
        },
        created_at: {
            type: 'TIMESTAMP',
            defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
            allowNull: false
        },
        created_by: {
            type: Sequelize.BIGINT(20),
            allowNull: false,
        },
        //Has to defined user_id in file_info table to enable eager loading
        user_id: {
            type: Sequelize.BIGINT(20),
            allowNull: false,
        },
        updated_at: {
            type: 'TIMESTAMP',
            defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
            allowNull: false
        },
        updated_by: {
            type: Sequelize.BIGINT(20),
            allowNull: false,
        }
    }, {
        underscored: true
    });
    return file_info;
}