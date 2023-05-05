/*
 * Copyright (C) 2019-2023 LEIDOS.
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

const { dashboard, event_dashboard, Sequelize } = require("../models");
const { Op } = require('sequelize');
/**
 *@brief Find all dashboards
 * @Return Response status and a list of dashboards
 */
exports.findDashboardsByOrg = (req, res) => {
    if (req == undefined || req.body == undefined || req.body.data == undefined || req.body.data.org_id == undefined) {
        res.status(400).send({ message: "Search content cannot be empty." });
        return;
    }
    dashboard.findAll({
        where: {
            [Op.and]: [
                { org_id: req.body.data.org_id }
            ]
        }
    })
        .then(data => {
            if (data !== undefined && Array.isArray(data) && data.length > 0) {
                let result = [];
                data.forEach(item => {
                    let dashboard_item = {
                        slug: item.slug,
                        uid: item.uid,
                        title: item.title,
                        id: item.id
                    }
                    result.push(dashboard_item);
                });
                res.status(200).send(result);
            }
        }).catch(err => {
            res.status(500).send({
                message: err.message || "Server error while findAll dashboards for an organization."
            });
        });
}

/**
 *@brief Search dashboards
 * @Return Response status and a list of dashboards
 */
exports.searchDashboardsByOrg = (req, res) => {
    if (req == undefined || req.body == undefined || req.body.data == undefined || req.body.data.org_id == undefined
        || req.body.data.search_text === undefined || req.body.data.search_text === "") {
        res.status(400).send({ message: "Search content cannot be empty." });
        return;
    }

    dashboard.findAll({
        where: {
            [Op.and]: [
                { org_id: req.body.data.org_id }
            ]
        }
    })
        .then(data => {
            let result = [];
            if (data !== undefined && Array.isArray(data) && data.length > 0) {
                let search_text = req.body.data.search_text.toLowerCase();
                data.forEach(item => {
                    if (item.is_folder === 0 && item.title.toLowerCase().includes(search_text)) {
                        let dashboard_item = {
                            slug: item.slug,
                            uid: item.uid,
                            title: item.title,
                            id: item.id
                        }
                        result.push(dashboard_item);
                    }
                })
            }
            res.status(200).send(result);
        }).catch(err => {
            res.status(500).send({
                message: err.message || "Server error while findAll dashboards for an organization."
            });
        });
}


/**
 *@brief List all dashboards urls belong to the selected event
 */
exports.listEventDashboards = (req, res) => {
    if (req == undefined || req.body == undefined || req.body.data == undefined || req.body.data.event_id == undefined) {
        res.status(400).send({ message: "Request content cannot be empty." });
        return;
    }
    event_dashboard.findAll({
        where:
        {
            event_id: req.body.data.event_id
        }
    }).then(data => {
        if (data !== undefined && Array.isArray(data) && data.length > 0) {
        }
        res.status(200).send(data);
    }).catch(err => {
        res.status(500).send({
            message: err.message || "Server error while fetching dashboards for an event."
        });
    });
}

/**
 *@brief update dashboards urls belong to the selected event
 */
exports.updateEventDashboards = (req, res) => {
    if (req == undefined || req.body == undefined || req.body.data == undefined || req.body.data.event_id == undefined
        || req.body.data.dashboard_id == undefined) {
        res.status(400).send({ message: "Search content cannot be empty." });
        return;
    }
    event_dashboard.create(
        {
            event_id: req.body.data.event_id,
            dashboard_id: req.body.data.dashboard_id
        }).then(data => {
            res.status(200).send(data);
        }).catch(err => {
            res.status(500).send({
                message: err.message || "Server error while updating dashboards for an event."
            });
        });
}


/**
 *@brief delete dashboards urls belong to the selected event
 */
exports.deleteEventDashboards = (req, res) => {
    if (req == undefined || req.query == undefined || req.query.event_id == undefined
        || req.query.dashboard_id == undefined) {
        res.status(400).send({ message: "Request content cannot be empty." });
        return;
    }
    event_dashboard.destroy(
        {
            where: {
                event_id: req.query.event_id,
                dashboard_id: req.query.dashboard_id
            }
        }
    ).then(data => {
        console.log(data)
        res.status(200).send({ message: "Successfully unassign dashboard!" });
    }).catch(err => {
        res.status(500).send({
            message: err.message || "Server error while deleting dashboards for an event."
        });
    });
}