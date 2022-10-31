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
import React from 'react'
import { useSessionStorageString, useClearSessionStorage } from "react-use-window-sessionstorage";

const AuthContext = React.createContext({
  isAuth: false,
  username: null,
  sessionToken: null,
  login: (username, password, sessionToken) => { },
  logout: () => { }
})

export const AuthContextProvider = (props) => {
  const [isAuthenticated, setIsAuthenticated] = useSessionStorageString("isAuth", false);
  const [username, setUsername] = useSessionStorageString("username", null);
  const [sessionToken, setSessionToken] = useSessionStorageString("sessionToken", null);
  const clearSessionStorage = useClearSessionStorage();

  const loginHandler = (username, password, sessionToken) => {
    if (username === "admin" && password === "admin") {
      setIsAuthenticated(true);
      setUsername(username);
      setSessionToken(sessionToken);
      return true;
    } else {
      setIsAuthenticated(false);
      return false;
    }
  }

  const logoutHandler = () => {
    setIsAuthenticated(false);
    setUsername(null);
    clearSessionStorage();
  }

  return <AuthContext.Provider value={{
    isAuth: isAuthenticated,
    username: username,
    sessionToken: sessionToken,
    login: loginHandler,
    logout: logoutHandler
  }}>{props.children}</AuthContext.Provider>
}

export default AuthContext;
