
module.exports = (seq, Sequelize) => {
    const Org = seq.define("org", {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false,
        },
        version: {
            type: Sequelize.INTEGER,
            allowNull: false,
        },
        name: {
            type: Sequelize.STRING,
            defaultValue: '',
            allowNull: true,
        },
        address1: {
            type: Sequelize.STRING,
            defaultValue: '',
            allowNull: true,
        },
        address2: {
            type: Sequelize.STRING,
            defaultValue: '',
            allowNull: true,
        },
        city: {
            type: Sequelize.STRING,
            defaultValue: '',
            allowNull: true,
        },
        state: {
            type: Sequelize.STRING,
            defaultValue: '',
            allowNull: true,
        },
        zip_code: {
            type: Sequelize.STRING,
            defaultValue: '',
            allowNull: true,
        },
        country: {
            type: Sequelize.STRING,
            defaultValue: '',
            allowNull: true,
        },
        billing_email: {
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
            type: 'TIMESTAMP',
            defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
            allowNull: false
        }
    }, {
        underscored: true,
        freezeTableName: true 
    });
    return Org;
}