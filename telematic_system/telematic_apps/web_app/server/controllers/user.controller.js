
var manager = require('htpasswd-mgr');
var htpasswordManager = manager('/etc/apache2/grafana_htpasswd')
const { org, user, Sequelize } = require("../models");

exports.createOrUpdateUser = (req, res) => {
    if (req == undefined || req.body == undefined || req.body.username == undefined || req.body.email == undefined || req.body.password == undefined) {
        res.sendStatus(400);
        return;
    }
    htpasswordManager.upsertUser(req.body.username, req.body.password).then((status) => {
        res.send({ username: req.body.username, password: req.body.password });
    }).catch((err) => {
        res.sendStatus(501);
    });
};


exports.updateUserServerAdmin = (req, res) => {
    if (!req.body || req.body.is_admin === undefined || req.body.user_id === undefined) {
        res.status(400).send({
            message: "Content cannot be empty."
        });
        return;
    }
    console.log(req.body.user_id)
    console.log(req.body.is_admin)
    user.update({ is_admin: req.body.is_admin }, {
        where: {
            id: req.body.user_id
        }
    })
        .then(data => {
            console.log(data)
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


exports.createUser = (req, res) => {
    if (req == undefined || req.body == undefined || req.body.username == undefined || req.body.email == undefined || req.body.password == undefined) {
        res.sendStatus(400);
        return;
    }
    htpasswordManager.upsertUser(req.body.username, req.body.password).then((status) => {
        res.send({ username: req.body.username, password: req.body.password });
    }).catch((err) => {
        res.sendStatus(501);
    });
};

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
