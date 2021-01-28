import './App.css';
import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Home from './components/Home';
import Video from './components/Video';
import { socket } from './service/socket';

const App = () => {

  const [response, setResponse] = useState("");
  useEffect(() => {
    socket.on('error', error => {
      console.log(error);
    })
    socket.emit('test');
  }, []);

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
