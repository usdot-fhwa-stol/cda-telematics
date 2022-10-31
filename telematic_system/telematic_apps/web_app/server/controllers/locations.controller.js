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
