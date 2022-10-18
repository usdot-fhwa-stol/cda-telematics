const grafana_db = require("../models")

module.exports = (seq, Sequelize) => {
    const Event = seq.define("events", {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false,
        },
        name: {
            type: Sequelize.STRING,
            defaultValue: '',
            allowNull: false,
        },
        description: {
            type: Sequelize.STRING,
            defaultValue: '',
            allowNull: false,
        },
        status: {
            type: Sequelize.STRING,
            defaultValue: '',
            allowNull: false,
        },
        location_id: {
            type: Sequelize.INTEGER,
            defaultValue: 0,
            allowNull: false,
        },
        testing_type_id: {
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
    return Event;
}