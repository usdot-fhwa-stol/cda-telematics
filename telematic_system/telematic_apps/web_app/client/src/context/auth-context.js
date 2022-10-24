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
