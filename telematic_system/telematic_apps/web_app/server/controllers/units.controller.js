const { units, Sequelize } = require("../models");
const Op = Sequelize.Op;

/**
 *@brief Create a unit
 * @Return Response status and message
 */
exports.create = (req, res) => {
    if (!req.body.unit_identifier) {
        res.status(400).send({
            message: "Content cannot be empty."
        });
        return;
    }

    var unit = req.body;
    unit.created_by = 1;
    units.create(unit).then(data => {
        res.status(201).send(data);
    }).catch(err => {
        res.status(500).send({
            message: err.message || "Error while creating unit."
        });
    });
}

/**
 *@brief Find all units
 * @Return Response status and a list of all units
 */
exports.findAll = (req, res) => {
    units.findAll()
        .then(data => {
            res.status(200).send(data);
        }).catch(err => {
            res.status(500).send({
                message: err.message || "Error while findAll units."
            });
        });
}
