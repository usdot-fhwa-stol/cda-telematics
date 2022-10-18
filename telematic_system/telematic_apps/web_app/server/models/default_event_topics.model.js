const grafana_db = require("../models")

module.exports = (seq, Sequelize) => {
    const Default_event_topics = seq.define("default_event_topics", {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false,
        },
        topic_names: {
            type: Sequelize.TEXT,
            allowNull: false,
        },
        unit_identifier: {
            type: Sequelize.STRING,
            defaultValue: '',
            allowNull: false,
        },
        event_id: {
            type: Sequelize.INTEGER,
            defaultValue: 0,
            allowNull: false,
        },
        created_at: {
            type: 'TIMESTAMP',
            defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
            allowNull: false
        },
        created_by: {
            type: Sequelize.INTEGER,
            defaultValue: 0,
            allowNull: false,
        },
        updated_at: {
            type: 'TIMESTAMP',
            defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
            allowNull: false
        },
        updated_by: {
            type: Sequelize.INTEGER,
            defaultValue: 0,
            allowNull: false,
        }
    }, {
        underscored: true
    });
    return Default_event_topics;
}