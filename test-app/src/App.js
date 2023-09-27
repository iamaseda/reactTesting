import logo from './logo.svg';
import './App.css';
import * as React from "react";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
// import Button from "@material-ui/core/Button";

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React Aaaaaahhhhhh!!!
        </a>
        {/* <Menu>
          <MenuItem>Land</MenuItem>
          <MenuItem>Housing</MenuItem>
          <MenuItem>Miscellaneous</MenuItem>
        </Menu> */}
      </header>
    </div>
  );
}

export default App;
