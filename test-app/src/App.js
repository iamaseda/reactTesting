import logo from './logo.svg';
import './App.css';
import * as React from "react";
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';

function App() {

  const [anchorEl1, setAnchorEl1] = React.useState(null);
  const [anchorEl2, setAnchorEl2] = React.useState(null);

  const open1 = Boolean(anchorEl1);
  const open2 = Boolean(anchorEl2);

  const handleClick1 = (event) => {
    setAnchorEl1(event.currentTarget);
  };
  const handleClick2 = (event) => {
    setAnchorEl2(event.currentTarget);
  };

  const handleClose1 = () => {
    setAnchorEl1(null);
  };
  const handleClose2 = () => {
    setAnchorEl2(null);
  };

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
        <Button
         id="basic-button"
         aria-controls={open2 ? 'basic-menu' : undefined}
         aria-haspopup="true"
         aria-expanded={open2 ? 'true' : undefined}
         onClick={handleClick2}>
          SideMenu
        </Button>
        <Menu
          id="basic-menu"
          aria-labelledby="demo-positioned-button"
          anchorEl={anchorEl2}
          open={open2}
          onClose={handleClose2}
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'left',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'left',
          }}>
          <MenuItem>Land</MenuItem>
          <MenuItem>Housing</MenuItem>
          <MenuItem>Miscellaneous</MenuItem>
        </Menu>
        <p>Check 1</p>

         <Button
        id="demo-positioned-button"
        aria-controls={open1 ? 'demo-positioned-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open1 ? 'true' : undefined}
        onClick={handleClick1}
      >
        Dashboard
      </Button>
      <Menu
        id="demo-positioned-menu"
        aria-labelledby="demo-positioned-button"
        anchorEl={anchorEl1}
        open={open1}
        onClose={handleClose1}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
      >
        <MenuItem onClick={handleClose1}>Profile</MenuItem>
        <MenuItem onClick={handleClose1}>My account</MenuItem>
        <MenuItem onClick={handleClose1}>Logout</MenuItem>
      </Menu>
      </header>
    </div>
  );
}

export default App;
