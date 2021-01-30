import './App.css';
import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Home from './components/Home';
import Video from './components/Video';

const App = () => {

  

  return (
    <>
      <Router>
        <Switch>
          <Route path="/" exact component={Home} />
          <Route path="/:url" component={Video} />
        </Switch>
      </Router>
    </>
  );
}

export default App;
