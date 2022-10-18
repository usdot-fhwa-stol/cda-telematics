const grafana_db = require(".")

module.exports = (seq, Sequelize) => {
    const Unit = seq.define("units", {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false,
        },
        unit_name: {
            type: Sequelize.STRING,
            defaultValue: '',
            allowNull: false,
        },
        unit_identifier: {
            type: Sequelize.STRING,
            defaultValue: '',
            allowNull: false,
        },
        unit_type: {
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
    return Unit;
}