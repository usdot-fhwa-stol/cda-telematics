const { locations, Sequelize, states } = require("../models");
const Op = Sequelize.Op;

//create a location
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

//Retrieve all locations
exports.findAll = (req, res) => {
    const facility_name = req.query.facility_name;
    var condition = facility_name ? { facility_name: { [Op.like]: `%${facility_name}%` } } : null;
    locations.findAll({ where: condition })
        .then(data => {
            res.status(200).send(data);
        }).catch(err => {
            res.status(500).send({
                message: err.message || "Error while findAll locations."
            });
        });
}
