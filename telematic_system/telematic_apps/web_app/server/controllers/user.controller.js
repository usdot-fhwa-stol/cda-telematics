
var manager = require('htpasswd-mgr');
var htpasswordManager = manager('/etc/apache2/grafana_htpasswd')
const { org_user, user, Sequelize } = require("../models");
const { Op } = require("sequelize");
const { addOrgUser } = require('./org.controller');
const getUuid = require('uuid-by-string');

exports.updateUserServerAdmin = (req, res) => {
    if (!req.body || req.body.is_admin === undefined || req.body.user_id === undefined) {
        res.status(400).send({
            message: "Content cannot be empty."
        });
        return;
    }
    user.update({ is_admin: req.body.is_admin }, {
        where: {
            id: req.body.user_id
        }
    })
        .then(data => {
            if (data > 0) {
                res.status(200).send({
                    message: `Successfully updated server admin for user id = ${req.body.user_id}.`
                });
            } else {
                res.status(400).send({
                    message: `Failed to update server admin for user id = ${req.body.user_id}.`
                });
            }
        }).catch(err => {
            res.status(500).send({
                message: err.message || "Error while updating user for an organization."
            });
        });
}


exports.registerUser = (req, res) => {
    if (req == undefined || req.body == undefined || req.body.username == undefined
        || req.body.org_id == undefined || req.body.email == undefined || req.body.password == undefined) {
        res.sendStatus(400);
        return;
    }

    user.findAll({
        where: {
            [Op.or]: [
                { login: req.body.username },
                { email: req.body.email }
            ]
        }
    }).then(data => {
        //Check if username is already used. If used, send error response      
        if (data !== undefined && Array.isArray(data) && data.length > 0) {
            res.status(404).send({
                message: "Username or email already exist."
            });
        } else {
            //If valid request, create user
            var registerUser = {
                login: req.body.username,
                email: req.body.email,
                password: req.body.password,
                org_id: req.body.org_id
            }
            user.create(registerUser).then(data => {
                //If usr is created, add user to the requested organization
                var registerOrgUser = {
                    org_id: data.org_id,
                    user_id: data.id,
                    role: "Viewer"
                }
                org_user.create(registerOrgUser)
                    .then(data => {
                        //Add user to credential file
                        htpasswordManager.upsertUser(req.body.username, req.body.password).then((status) => {
                            res.status(201).send({ message: "Successfully registered user." });
                        }).catch((err) => {
                            console.log(err)
                            res.status(400).send({
                                message: "Error while registering user."
                            });
                        });
                    }).catch(err => {
                        res.status(500).send("Error while adding user to an organization.");
                    });
            }).catch(err => {
                console.log(err)
                res.status(500).send({
                    message: "Error while registering user."
                });
            });
        }
    }).catch(err => {
        console.log(err)
        res.status(404).send({
            message: "Error while checking user."
        });
    });
};

exports.forgetPwd = (req, res) => {
    if (req.body == undefined || req.body.username == undefined
        || req.body.email == undefined || req.body.new_password == undefined) {

        console.log(req.body)
        res.sendStatus(400);
        return;
    }
    user.findAll({
        where: {
            [Op.and]: [
                { login: req.body.username },
                { email: req.body.email }
            ]
        }
    }).then(data => {
        if (data !== undefined && Array.isArray(data) && data.length > 0) {
            user.update({ password: req.body.new_password }, {
                where: {
                    id: data[0].id
                }
            })
                .then(data => {
                    if (data > 0) {
                        //Update user credential file
                        htpasswordManager.upsertUser(req.body.username, req.body.new_password).then((status) => {
                            res.status(200).send({ message: `Successfully updated password for user ${req.body.username}` });
                        }).catch((err) => {
                            console.log(err)
                            res.status(500).send({ message: "Server error while registering user." });
                        });
                    } else {
                        res.status(500).send({ message: `Server cannot update password.` });
                    }
                }).catch(err => {
                    res.status(500).send({ message: "Server Error while updating user password." });
                });
        } else {
            res.status(400).send({ message: `Failed to update user password due to incorrect username or email.` });
        }
    }).catch(err => {
        console.log(err)
        res.status(500).send({ message: "Server error while updating user password." });
    });
}


exports.loginUser = (req, res) => {
    if (req.body == undefined || req.body.password == undefined
        || req.body.username == undefined) {
        res.status(400).send({ message: "Content is empty" });
        return;
    }
    user.findAll({
        where: {
            [Op.and]: [
                { login: req.body.username },
                { password: req.body.password }
            ]
        }
    }).then(data => {
        if (data !== undefined && Array.isArray(data) && data.length > 0) {
            //Update user credential file
            htpasswordManager.upsertUser(req.body.username, req.body.password).then((status) => {
                var result = {
                    id:  data[0].id,
                    last_seen_at: data[0].last_seen_at,
                    is_admin: data[0].is_admin,
                    email: data[0].email,
                    name: data[0].name,
                    org_id: data[0].org_id,
                    login: data[0].login,
                    username: data[0].login,
                    session_token: getUuid(data[0].login + data[0].email)
                }
                res.status(200).send(result);
            }).catch((err) => {
                console.log(err)
                res.status(500).send({ message: "Server error while user login." });
            });
        } else {
            res.status(401).send({ message: `Failed to authenticate user = ${req.body.username} , password = ${req.body.password} ` });
        }
    }).catch(err => {
        console.log(err);
        res.status(500).send({ message: "Error while authenticating user." });
    });
}

exports.deleteUser = (req, res) => {
    if (req == undefined || req.query == undefined || req.query.username == undefined) {
        res.sendStatus(400);
        return;
    }
    htpasswordManager.removeUser(req.query.username).then((status) => {
        res.sendStatus(200);
    }).catch((err) => {
        res.sendStatus(501);
    })
}

exports.findAll = (req, res) => {
    var condition = {};
    user.findAll({
        where: condition
    })
        .then(data => {
            if (data !== undefined && Array.isArray(data) && data.length > 0) {
                let response = [];
                data.forEach(user => {
                    response.push({
                        id: user.id,
                        last_seen_at: user.last_seen_at,
                        is_admin: user.is_admin === 1 ? "yes" : "no",
                        login: user.login,
                        org_id: user.org_id,
                        email: user.email
                    });
                });
                res.status(200).send(response);
            }
        }).catch(err => {
            console.log(err)
            res.status(500).send({
                message: err.message || "Error while findAll users."
            });
        });
};
