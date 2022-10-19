const { states, Sequelize } = require("../models");
const Op = Sequelize.Op;

//Retrieve all states
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
