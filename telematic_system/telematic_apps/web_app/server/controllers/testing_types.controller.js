const { testing_types, Sequelize } = require("../models");
const Op = Sequelize.Op;

/**
 *@brief Find all testing types
 * @Return Response status and a list of testing types
 */
exports.findAll = (req, res) => {
    testing_types.findAll()
        .then(data => {
            res.status(200).send(data);
        }).catch(err => {
            res.status(500).send({
                message: err.message || "Error while findAll testing_types."
            });
        });
}
