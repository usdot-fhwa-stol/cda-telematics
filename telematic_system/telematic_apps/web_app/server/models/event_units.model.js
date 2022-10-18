const grafana_db = require("../models")

module.exports = (seq, Sequelize) => {
    const Event_Unit = seq.define("event_units", {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false,
        },
        eventId: {
            type: Sequelize.INTEGER,
            allowNull: false,
        },
        unitId: {
            type: Sequelize.INTEGER,
            allowNull: false,
        },
        start_time: {
            type: 'TIMESTAMP',
            defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
            allowNull: false
        },
        end_time: {
            type: 'TIMESTAMP',
            defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
            allowNull: false
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
        }
    }, {
        underscored: true
    });
    return Event_Unit;
}