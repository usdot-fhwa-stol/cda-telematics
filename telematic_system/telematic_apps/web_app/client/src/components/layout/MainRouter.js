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