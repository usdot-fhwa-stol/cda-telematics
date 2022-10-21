const { states, Sequelize } = require("../models");
const Op = Sequelize.Op;

/**
 *@brief Find all states in the US
 * @Return Response status and a list of states
 */
exports.findAll = (req, res) => {
    states.findAll()
        .then(data => {
            res.status(200).send(data);
        }).catch(err => {
            res.status(500).send({
                message: err.message || "Error while findAll states."
            });
        });
}
