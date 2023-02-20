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
  email: null,
  sessionToken: null,
  last_seen_at: null,
  org_id: null,
  org_name: null,
  login: (username, sessionToken, email, last_seen_at, org_id, org_name, name) => { },
  logout: () => { }
})

export const AuthContextProvider = (props) => {
  const [isAuthenticated, setIsAuthenticated] = useSessionStorageString("isAuth", false);
  const [username, setUsername] = useSessionStorageString("username", null);
  const [email, setEmail] = useSessionStorageString("email", null);
  const [last_seen_at, setLastSeenAt] = useSessionStorageString("last_seen_at", null);
  const [org_id, setOrgId] = useSessionStorageString("org_id", null);
  const [org_name, setOrgName] = useSessionStorageString("org_name", null);
  const [name, setName] = useSessionStorageString("name", null);
  const [sessionToken, setSessionToken] = useSessionStorageString("sessionToken", null);
  const clearSessionStorage = useClearSessionStorage();

  const loginHandler = (username, sessionToken, email, last_seen_at, org_id, org_name, name) => {
    if (username !== undefined && username !== ""
      && sessionToken !== undefined && sessionToken !== "") {
      setIsAuthenticated(true);
      setUsername(username);
      setEmail(email);
      setSessionToken(sessionToken);
      setOrgName(org_name);
      setLastSeenAt(last_seen_at);
      setOrgId(org_id);
      setName(name);
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
    email: email,
    sessionToken: sessionToken,
    last_seen_at: last_seen_at,
    org_id: org_id,
    name: name,
    org_name: org_name,
    login: loginHandler,
    logout: logoutHandler
  }}>{props.children}</AuthContext.Provider>
}

export default AuthContext;
