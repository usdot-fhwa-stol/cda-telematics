/*
 * Copyright (C) 2019-2024 LEIDOS.
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
