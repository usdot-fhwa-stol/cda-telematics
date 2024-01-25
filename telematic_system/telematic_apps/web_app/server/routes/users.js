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
module.exports = app => {
  const users = require("../controllers/user.controller");
  let router = require('express').Router();

  /* GET users ping. */
  router.get('/ping', function (req, res, next) {
    res.sendStatus(200);
  });

  /* POST users creation. */
  router.post("/register", users.registerUser);
  //Update existing or create a new user
  router.post('/forget/password', users.forgetPwd);
  //authenticate user
  router.post('/login', users.loginUser);
  //Update existing or create a new user
  router.post('/update/server/admin', users.updateUserServerAdmin)
  //Delete a user
  router.delete('/delete', users.deleteUser);
  //Retrieve all users
  router.get("/all", users.findAll);

  app.use('/api/users', router);

  module.exports = router;
}
