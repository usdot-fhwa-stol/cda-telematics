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
var express = require('express');
var router = express.Router();
var manager = require('htpasswd-mgr');
var htpasswordManager = manager('/etc/apache2/grafana_htpasswd')

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.sendStatus(200);
});

/* POST users listing. */
router.post('/upsert', function (req, res, next) {
  if (req == undefined || req.body == undefined || req.body.username == undefined || req.body.email == undefined || req.body.password == undefined) {
    res.sendStatus(400);
    return;
  }
  htpasswordManager.upsertUser(req.body.username, req.body.password).then((status) => {
    res.send({ username: req.body.username, password: req.body.password });
  }).catch((err) => {
    res.sendStatus(501);
  });
});

/* POST users listing. */
router.post('/create', function (req, res, next) {
  if (req == undefined || req.body == undefined || req.body.username == undefined || req.body.email == undefined || req.body.password == undefined) {
    res.sendStatus(400);
    return;
  }
  htpasswordManager.upsertUser(req.body.username, req.body.password).then((status) => {
    res.send({ username: req.body.username, password: req.body.password });
  }).catch((err) => {
    res.sendStatus(501);
  });
});

router.delete('/delete', function (req, res, next) {
  if (req == undefined || req.query == undefined || req.query.username == undefined) {
    res.sendStatus(400);
    return;
  }
  htpasswordManager.removeUser(req.query.username).then((status) => {
    res.sendStatus(200);
  }).catch((err) => {
    res.sendStatus(501);
  })
})
module.exports = router;
