/*
 * Copyright (C) 2019-2024 LEIDOS.
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
const dbConfig = require('../config/mysql.config')
const Sequelize = require('sequelize');

const seq = new Sequelize(dbConfig.GRAFANA_DB, dbConfig.USER, dbConfig.PASSWORD, {
    host: dbConfig.HOST,
    port: dbConfig.PORT,
    dialect: dbConfig.dialect,
    define: dbConfig.define,
    pool: {
        max: dbConfig.pool.max,
        min: dbConfig.pool.min,
        acquire: dbConfig.pool.acquire,
        idle: dbConfig.pool.idle
    }
});

const grafana_db = {}
grafana_db.Sequelize = Sequelize;
grafana_db.seq = seq;

grafana_db.events = require('./events.model')(seq, Sequelize);
grafana_db.locations = require('./locations.model')(seq, Sequelize);
grafana_db.units = require('./units.model')(seq, Sequelize);
grafana_db.default_event_topics = require('./default_event_topics.model')(seq, Sequelize);
grafana_db.testing_types = require('./testing_types.model')(seq, Sequelize);
grafana_db.event_units = require('./event_units.model')(seq, Sequelize);
grafana_db.states = require('./states.model')(seq, Sequelize);
grafana_db.user = require('./user.model')(seq, Sequelize);
grafana_db.org = require('./org.model')(seq, Sequelize);
grafana_db.org_user = require('./org_user.model')(seq, Sequelize);
grafana_db.dashboard = require('./dashboard.model')(seq,Sequelize);
grafana_db.event_dashboard = require('./event_dashboard.model')(seq,Sequelize);
grafana_db.user_topic_request=require('./user_topic_request')(seq,Sequelize)
grafana_db.file_info=require('./file_info.model')(seq,Sequelize)

//Associations
grafana_db.events.belongsToMany(grafana_db.units, {
    through: grafana_db.event_units
});


grafana_db.units.belongsToMany(grafana_db.events, {
    through: grafana_db.event_units
});

grafana_db.events.hasMany(grafana_db.event_units);
grafana_db.event_units.belongsTo(grafana_db.events);
grafana_db.units.hasMany(grafana_db.event_units);
grafana_db.event_units.belongsTo(grafana_db.units);

grafana_db.locations.hasMany(grafana_db.events, {
    foreignKey: {
        name: 'locationId',
        field: 'location_id'
    }
});
grafana_db.events.belongsTo(grafana_db.locations);


grafana_db.events.hasMany(grafana_db.default_event_topics, {
    foreignKey: {
        name: 'eventId',
        field: 'event_id'
    }
});
grafana_db.default_event_topics.belongsTo(grafana_db.events);

grafana_db.testing_types.hasMany(grafana_db.events, {
    foreignKey: {
        name: 'testingTypeId',
        field: 'testing_type_id'
    }
});
grafana_db.events.belongsTo(grafana_db.testing_types);


module.exports = grafana_db;