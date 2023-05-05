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
const { user_topic_request, Sequelize } = require("../models");
const Op = Sequelize.Op;

/**
 *@brief Save the user topic request for the given list of event and unit combinations
 * @Param The list of events and units combinations
 * @Return Response status and save a bulk of topics for each event and unit combination
 */
exports.createOrUpdate = (req, res) => {
    if (!req.body && !req.body.unitsTopics && !req.body.user_id) {
        res.status(400).send({
            message: "Content cannot be empty."
        });
        return;
    }
    var userRequestEventUnitTopics = [];
    for (const unit of req.body.unitsTopics) {
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
        var userRequestEventUnitTopic = {};
        userRequestEventUnitTopic.updated_by = req.body.user_id;
        userRequestEventUnitTopic.created_by = req.body.user_id;
        userRequestEventUnitTopic.unit_identifier = unit.unit_identifier;
        userRequestEventUnitTopic.event_id = unit.event_id;
        userRequestEventUnitTopic.topic_names = '';
        if (unit.unit_topics !== undefined) {
            for (const categories_topics of unit.unit_topics) {
                for (const topic of categories_topics.topics) {
                    userRequestEventUnitTopic.topic_names += topic.name + ',';
                }
            }
        }
        userRequestEventUnitTopics.push(userRequestEventUnitTopic)
    }

    for (var existing of userRequestEventUnitTopics) {
        user_topic_request.destroy({
            where: { unit_identifier: existing.unit_identifier, event_id: existing.event_id, updated_by: existing.updated_by }
        }).then(num => {
            if (num == 1) {
                console.log("Successfully delete existing user topic request.")
            }
        }).catch(err => {
            console.log(`Error deleting user_topic_request with event id =${existing.event_id} and unit identifier = ${existing.unit_identifier}`)
        });
    }

    user_topic_request.bulkCreate(userRequestEventUnitTopics).then(data => {
        res.status(201).send(data);
    }).catch(err => {
        res.status(500).send({
            message: err.message || "Error while creating user_topic_request."
        });
    });
    return;
}

/**
 *@brief Load or find the user topic request for the given event, user and list of units
 * @Params event id used to uniquely identifer each event
 * @Params selectedUnitIdentifiers: A list of unit identifiers. Each unit identifier is a string and is used to uniquely identify each unit.
 * @Params user id used to uniquely identifer each user
 * @Return Response status and load a bulk of topics request from a user for each event and list of units for the event
 */
exports.findUserRequestByUserEventUnit = (req, res) => {
    const event_id = req.query.event_id;
    const unit_identifiers = req.query.unit_identifiers;
    const user_id = req.query.user_id;
    var condition = [];
    condition.push({ event_id: event_id });
    condition.push({ unit_identifier: unit_identifiers });
    condition.push({ updated_by: user_id });
    user_topic_request.findAll({ where: condition })
        .then(data => {
            res.status(200).send(data);
        }).catch(err => {
            res.status(500).send({
                message: err.message || "Error while findAll user_topic_request."
            });
        });
}

/**
 *@brief Load or find the user topic request for the given event, user and list of units
 * @Params event id used to uniquely identifer each event
 * @Params selectedUnitIdentifiers: A list of unit identifiers. Each unit identifier is a string and is used to uniquely identify each unit.
 * @Return Response status and load a bulk of topics request from a user for each event and list of units for the event
 */
 exports.findAllUserRequestByEventUnit = (req, res) => {
    const event_id = req.query.event_id;
    const unit_identifiers = req.query.unit_identifiers;
    const exclude_user_id = req.query.exclude_user_id;
    user_topic_request.findAll({ where: {
        event_id: event_id,
        unit_identifier: unit_identifiers,
        updated_by :{ [Op.ne]: exclude_user_id}
    } })
        .then(data => {
            res.status(200).send(data);
        }).catch(err => {
            res.status(500).send({
                message: err.message || "Error while findAll user_topic_request."
            });
        });
}