const { units, Sequelize } = require("../models");
const Op = Sequelize.Op;

//Create a unit
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

//Retrieve all units
exports.findAll = (req, res) => {
    const unit_identifier = req.query.unit_identifier;
    var condition = unit_identifier ? { unit_identifier: { [Op.like]: `%${unit_identifier}%` } } : null;
    units.findAll({ where: condition })
        .then(data => {
            res.status(200).send(data);
        }).catch(err => {
            res.status(500).send({
                message: err.message || "Error while findAll units."
            });
        });
}
