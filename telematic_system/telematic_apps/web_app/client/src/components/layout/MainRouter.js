import React, { useContext } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import AuthContext from '../../context/auth-context';
import EventPage from '../../pages/EventPage';
import Grafana from '../../pages/Grafana';
import Login from '../../pages/Login';
import TopicPage from '../../pages/TopicPage';

const MainRouter = React.memo(() => {
  const authContext = useContext(AuthContext);

  return (
    <React.Fragment>
      <Routes>
        {authContext.sessionToken !== null && <Route path="/telematic/events" element={<EventPage />} />}
        {authContext.sessionToken !== null && <Route path="/telematic/topics" element={<TopicPage />} />}
        {authContext.sessionToken !== null && <Route path="/grafana" element={<Grafana />} />}
        {authContext.sessionToken === null && <Route path="/telematic/login" element={<Login />} />}
        {authContext.sessionToken !== null && <Route path="/telematic/login" element={<Navigate to="/telematic/events" replace></Navigate>}></Route>}
        {authContext.sessionToken === null && <Route path="*" element={<Navigate to="/telematic/login" replace></Navigate>}></Route>}
      </Routes>
    </React.Fragment>
  )
});

export default MainRouter