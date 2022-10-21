import React from 'react'
import { useSessionStorageString, useClearSessionStorage } from "react-use-window-sessionstorage";

const AuthContext = React.createContext({
  isAuth: false,
  username: null,
  sessionToken: null,
  login: () => { },
  logout: () => { }
})

export const AuthContextProvider = (props) => {
  const [isAuthenticated, setIsAuthenticated] = useSessionStorageString("isAuth",false);
  const [username, setUsername] = useSessionStorageString("username",null);
  const [sessionToken, setSessionToken] = useSessionStorageString("sessionToken",null);
  const clearSessionStorage = useClearSessionStorage();

  const loginHandler = (username,sessionToken) => {
    setIsAuthenticated(true);
    setUsername(username);
    setSessionToken(sessionToken);
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
