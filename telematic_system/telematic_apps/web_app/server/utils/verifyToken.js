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
 * 
 * Description:
 * verifyToken function to decode authentication token passed by user request and return the user information.
 */
const jwt = require("jsonwebtoken");
const verifyToken = (req) => {
  try {
    //Authorization: 'TOKEN'
    const token = req.headers.authorization;
    if (token) {
      const decodedToken = jwt.verify(token, process.env.SECRET);
      if (decodedToken && decodedToken.exp > new Date().getTime() / 1000) {
        return decodedToken;
      }
    }
  } catch (err) {
    console.log(err);
  }
  return undefined;
};

module.exports = { verifyToken };
