const dbConfig = require('../config/mysql.config')
const Sequelize = require('sequelize');

const seq = new Sequelize(dbConfig.GRAFANA_DB, dbConfig.USER, dbConfig.PASSWORD, {
    host: dbConfig.HOST,
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

//Associations
grafana_db.events.belongsToMany(grafana_db.units, {
    through: grafana_db.event_units
});


grafana_db.units.belongsToMany(grafana_db.events, {
    through: grafana_db.event_units
});


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