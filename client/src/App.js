import './App.css';
import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";
const ENDPOINT = "http://localhost:3001";


function App() {

  const [response, setResponse] = useState("");
  useEffect(() => {
    const socket = io(ENDPOINT);
    socket.on('error', error => {
      console.log(error);
    })
    socket.emit('test');
    socket.on("FromAPI", data => {
      setResponse(data);
    });
  }, []);

  return (
    <div className="App">
      <div className="container mt-1"></div>
      <input></input>
      <button className="btn btn-primary">Connect</button>
    </div>
  );
}

export default App;
