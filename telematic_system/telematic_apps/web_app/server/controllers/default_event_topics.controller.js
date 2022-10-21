const { default_event_topics, Sequelize } = require("../models");
const Op = Sequelize.Op;

//create a default event topics
exports.create = (req, res) => {
    if (!req.body) {
        res.status(400).send({
            message: "Content cannot be empty."
        });
        return;
    }
    var defaultEventUnitsTopics = [];
    for (const unit of req.body) {
        if (!unit.event_id) {
            res.status(404).send({
                message: "Event Id is empty."
            });
            return;
        }

        if (!unit.unit_identifier) {
            res.status(404).send({
                message: "Unit identifier is empty."
            });
            return;
        }
        var defaultEventUnitTopic = {};
        defaultEventUnitTopic.updated_by = 1;
        defaultEventUnitTopic.created_by = 1;
        defaultEventUnitTopic.unit_identifier = unit.unit_identifier;
        defaultEventUnitTopic.event_id = unit.event_id;
        defaultEventUnitTopic.topic_names = '';
        for (const categories_topics of unit.unit_topics) {
            for (const topic of categories_topics.topics) {
                defaultEventUnitTopic.topic_names += topic.name + ',';
            }
        }
        defaultEventUnitsTopics.push(defaultEventUnitTopic)
    }

    for (var existing of defaultEventUnitsTopics) {
        default_event_topics.destroy({
            where: { unit_identifier: existing.unit_identifier, event_id: existing.event_id }
        }).then(num => {
            if (num == 1) {
                console.log(num)
            }
        }).catch(err => {
            console.log(`Error deleting default_event_topics with event id =${existing.event_id} and unit identifier = ${existing.unit_identifier}`)
        });
    }

    default_event_topics.bulkCreate(defaultEventUnitsTopics).then(data => {
        res.status(201).send(data);
    }).catch(err => {
        res.status(500).send({
            message: err.message || "Error while creating default_event_topics."
        });
    });
    return;
}

//Retrieve all default event topics
exports.findAll = (req, res) => {
    const event_id = req.query.event_id;
    const unit_identifiers = req.query.unit_identifiers;
    var condition = [];
    condition.push({ event_id: event_id });
    condition.push({ unit_identifier: unit_identifiers });
    default_event_topics.findAll({ where: condition })
        .then(data => {
            res.status(200).send(data);
        }).catch(err => {
            res.status(500).send({
                message: err.message || "Error while findAll default_event_topics."
            });
        });
}