const { locations, Sequelize, states } = require("../models");
const Op = Sequelize.Op;

/**
 *@brief Create a location
 * @Params Location information
 * @Return Response status and message
 */
exports.create = (req, res) => {
    if (!req.body.facility_name) {
        res.status(400).send({
            message: "Content cannot be empty."
        });
        return;
    }

    var location = req.body;
    location.created_by = 1;
    locations.create(location).then(data => {
        res.status(201).send(data);
    }).catch(err => {
        res.status(500).send({
            message: err.message || "Error while creating location."
        });
    });
}

/**
 *@brief Find all locations
 * @Return Response status and a list of locations
 */
exports.findAll = (req, res) => {
    locations.findAll()
        .then(data => {
            res.status(200).send(data);
        }).catch(err => {
            res.status(500).send({
                message: err.message || "Error while findAll locations."
            });
        });
}
