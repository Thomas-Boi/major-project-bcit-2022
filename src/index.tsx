import React from 'react';
import ReactDOM from 'react-dom';
import App from "./scenes/App";
import "./index.css"

// to go into flip mode, add a `?flip` to the end of the URL
ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>, 
  document.getElementById('root')
);