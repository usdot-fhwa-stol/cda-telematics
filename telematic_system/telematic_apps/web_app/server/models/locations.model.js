const grafana_db = require("../models")

module.exports = (seq, Sequelize) => {
    const Location = seq.define("locations", {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false,
        },
        facility_name: {
            type: Sequelize.STRING,
            defaultValue: '',
            allowNull: false,
        },
        city: {
            type: Sequelize.STRING,
            defaultValue: '',
            allowNull: false,
        },
        state_code: {
            type:Sequelize.STRING,
            defaultValue: '',
            allowNull: false,
        },
        zip_code: {
            type: Sequelize.STRING,
            defaultValue: '',
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
        }
    }, {
        underscored: true
    });
    return Location;
}