const { default_event_topics, Sequelize } = require("../models");
const Op = Sequelize.Op;

//create a default event topics
exports.create = (req, res) => {
    if (!req.body.topic_names) {
        res.status(400).send({
            message: "Content cannot be empty."
        });
        return;
    }

    var default_event_topic = req.body;
    default_event_topic.updated_by = 1;
    default_event_topic.created_by = 1;
    default_event_topics.create(default_event_topic).then(data => {
        res.status(201).send(data);
    }).catch(err => {
        res.status(500).send({
            message: err.message || "Error while creating default_event_topics."
        });
    });
}

//Retrieve all default event topics
exports.findAll = (req, res) => {
    const name = req.query.name;
    var condition = name ? { name: { [Op.like]: `%${name}%` } } : null;
    default_event_topics.findAll({ where: condition })
        .then(data => {
            res.status(200).send(data);
        }).catch(err => {
            res.status(500).send({
                message: err.message || "Error while findAll default_event_topics."
            });
        });
}

//update a default event topics
exports.update = (req, res) => {
    const id = req.params.id;
    var default_event_topic = req.body;
    default_event_topic.updated_by = 1;
    default_event_topic.updated_at = Sequelize.literal('CURRENT_TIMESTAMP');
    default_event_topics.update(default_event_topic, {
        where: { id: id }
    }).then(num => {
        if (num == 1) {
            res.status(204).send({ message: "default_event_topics was updated successfully." })
        } else {
            res.status(404).send({ message: `Cannot update default_event_topics id =${id}. Maybe default_event_topics was not found or request body was empty.` });
        }
    }).catch(err => {
        res.status(500).send({ message: `Error updating default_event_topics with id =${id}` })
    });
};