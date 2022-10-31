/*
 * Copyright (C) 2019-2022 LEIDOS.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not
 * use this file except in compliance with the License. You may obtain a copy of
 * the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
 */
const { events, Sequelize, locations, testing_types, units, event_units } = require("../models");
const Op = Sequelize.Op;

/**
 *@brief Create an event in database (DB)
 * @Params event information to save to DB
 * @Return Response status and message for create
 */
exports.create = (req, res) => {
    if (!req.body.name) {
        res.status(400).send({
            message: "Content cannot be empty."
        });
        return;
    }

    var event = req.body;
    event.start_at = new Date(event.start_at);
    event.end_at = new Date(event.end_at);
    event.updated_by = 1;
    event.created_by = 1;
    events.create(event).then(data => {
        res.status(201).send(data);
    }).catch(err => {
        res.status(500).send({
            message: err.message || "Error while creating event."
        });
    });
}


/**
 *@brief Find all events that match the search criteria
 * @Params Search criteria for events. The criteria includes location, event type, start_time, end_time, event name
 * @Return Response status and a list of events that matches
 */
exports.findAll = (req, res) => {
    var condition = {};
    const name = req.query.name;
    if (name) {
        condition.name = { [Op.like]: `%${name}%` }
    };

    const location_id = req.query.location_id;
    if (location_id) {
        condition.location_id = location_id;
    }

    const status = req.query.status;
    if (status) {
        condition.status = status;
    } else {
        const start_at = req.query.start_at;
        if (start_at) {
            condition.start_at = {
                [Op.gt]: new Date(start_at)
            };
        }

        const end_at = req.query.end_at;
        if (end_at) {
            condition.end_at = {
                [Op.lt]: new Date(end_at)
            };
        }
    }

    const testing_type_id = req.query.testing_type_id;
    if (testing_type_id) {
        condition.testing_type_id = testing_type_id;
    }
    events.findAll({
        where: condition,
        include: [{
            model: locations,
            attributes: ["id", "facility_name", "city", "state_code", "zip_code"]
        }, {
            model: testing_types,
            attributes: ["id", "name"]
        }, {
            model: units,
            attributes: ["id", "unit_name", "unit_type", "unit_identifier"],
            through: {
                attributes: [],
            }
        },{
            model: event_units,
        }
        ]
    })
        .then(data => {
            res.status(200).send(data);
        }).catch(err => {
            res.status(500).send({
                message: err.message || "Error while findAll events."
            });
        });
}

/**
 *@brief Update an event
 * @Params Event information to update
 * @Return Response status and message
 */
exports.update = (req, res) => {
    const id = req.params.id;
    var event = req.body;
    event.updated_at = Sequelize.literal('CURRENT_TIMESTAMP');
    event.updated_by = 0;
    event.start_at = new Date(event.start_at);
    event.end_at = new Date(event.end_at);
    //update an event
    events.update(event, {
        where: { id: id }
    }).then(num => {
        if (num == 1) {
            res.status(200).send(event);
        } else {
            res.status(404).send({ message: `Cannot update event id =${id}. Maybe event was not found or request body was empty.` });
        }
    }).catch(err => {
        res.status(500).send({ message: `Error updating event with id =${id}` })
    });
}


/**
 *@brief Delete an event based on the event id.
 * @Params Event id uniquely identify an event
 * @Return Response status and message
 */
exports.delete = (req, res) => {
    const id = req.params.id;
    events.destroy({
        where: { id: id }
    }).then(num => {
        if (num == 1) {
            res.status(204).send({ message: "Event was deleted successfully." })
        } else {
            res.status(404).send({ message: `Cannot delete event id =${id}. Maybe event was not found or request body was empty.` });
        }
    }).catch(err => {
        res.status(500).send({ message: `Error deleting event with id =${id}` })
    });

};