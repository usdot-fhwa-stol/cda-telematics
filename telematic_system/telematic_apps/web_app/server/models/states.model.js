const grafana_db = require("../models")

module.exports = (seq, Sequelize) => {
    const Location = seq.define("states", {
        name: {
            type: Sequelize.STRING,
            primaryKey: true,
            allowNull: false,
        },
        code: {
            type: Sequelize.STRING,
            defaultValue: '',
            allowNull: false,
        }
    }, {
        underscored: true
    });
    return Location;
}