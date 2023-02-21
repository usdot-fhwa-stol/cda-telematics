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

const { user, org_user, org, Sequelize } = require("../models");
/**
 *@brief Find all organizations
 * @Return Response status and a list of organizations
 */
exports.findAll = (req, res) => {
    org.findAll()
        .then(data => {
            res.status(200).send(data);
        }).catch(err => {
            res.status(500).send({
                message: err.message || "Error while findAll organizations."
            });
        });
}

exports.findAllOrgUsers = (req, res) => {
    org_user.findAll()
        .then(data => {
            res.status(200).send(data);
        }).catch(err => {
            res.status(500).send({
                message: err.message || "Error while findAll organizations."
            });
        });
}


exports.findAllOrgsByUser = (req, res) => {
    if (!req.body || req.body.data === undefined || !req.body.data.user_id) {
        res.status(400).send({
            message: "Content cannot be empty."
        });
        return;
    }
    org_user.findAll({
        where: {
            user_id: req.body.data.user_id
        }
    })
        .then(data => {
            res.status(200).send(data);
        }).catch(err => {
            res.status(500).send({
                message: err.message || "Error while find user organizations."
            });
        });
}


exports.getUserRole = (req, res) => {
    if (!req.body || !req.body.data || !req.body.data.org_id || !req.body.data.user_id) {
        res.status(400).send({
            message: "Content cannot be empty."
        });
        return;
    }
    org_user.findAll({
        where: {
            org_id: req.body.data.org_id,
            user_id: req.body.data.user_id
        }
    })
        .then(data => {
            console.log(data)
            res.status(200).send(data);
        }).catch(err => {
            res.status(500).send({
                message: err.message || "Error while findAll organizations."
            });
        });
}

exports.addOrgUser = (req, res) => {
    if (!req.body || !req.body.data || !req.body.data.org_id || !req.body.data.user_id) {
        res.status(400).send({
            message: "Content cannot be empty."
        });
        return;
    }
    var user = {
        org_id: req.body.data.org_id,
        user_id: req.body.data.user_id,
        role: req.body.data.role
    }
    org_user.create(user)
        .then(data => {
            res.status(200).send(data);
        }).catch(err => {
            res.status(500).send({
                message: err.message || "Error while adding user to an organization."
            });
        });
}

exports.updateOrgUser = (req, res) => {
    if (!req.body || !req.body.data || !req.body.data.org_id || !req.body.data.user_id) {
        res.status(400).send({
            message: "Content cannot be empty."
        });
        return;
    }
    var user = req.body.data;
    user.updated = Sequelize.literal('CURRENT_TIMESTAMP');
    org_user.update(user, {
        where: {
            org_id: user.org_id,
            user_id: user.user_id
        }
    })
        .then(data => {
            //Find the updated user
            org_user.findAll({
                where: {
                    org_id: user.org_id,
                    user_id: user.user_id
                }
            })
                .then(result => {
                    res.status(200).send(result);
                }).catch(err => {
                    res.status(500).send({
                        message: err.message || "Error while findAll organizations."
                    });
                });
        }).catch(err => {
            res.status(500).send({
                message: err.message || "Error while updating user for an organization."
            });
        });
}

exports.delOrgUser = (req, res) => {
    if (!req.query || !req.query.user_id || !req.query.org_id) {
        res.status(400).send({
            message: "Request content cannot be empty."
        });
        return;
    }
    org_user.destroy({
        where: {
            user_id: req.query.user_id,
            org_id: req.query.org_id
        }
    })
        .then(num => {
            if (num == 1) {
                //After delete the user organization, Remove the same organization id from user table by set it to 0
                user.update({ org_id: 0 }, {
                    where: {
                        id: req.query.user_id
                    }
                })
                    .then(data => {
                        res.status(200).send({ message: "Org user was deleted successfully." });
                    }).catch(err => {
                        res.status(500).send({
                            message: err.message || "Error while updating user for an organization."
                        });
                    });
            } else {
                res.status(400).send({ message: `Cannot delete Org user id =${req.query.user_id}. Maybe Org user was not found or request body was empty.` });
            }
        }).catch(err => {
            res.status(500).send({
                message: err.message || "Error while remove user for an organization."
            });
        });
}

