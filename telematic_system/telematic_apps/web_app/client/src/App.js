import React from 'react';
import MainRouter from './components/layout/MainRouter';
import Layout from './components/layout/Layout';

function App() {
  return (
    <React.Fragment>
      <Layout>
        <MainRouter />
      </Layout>
    </React.Fragment>
  );
}

export default App;
