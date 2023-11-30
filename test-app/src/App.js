// import logo from './logo.svg';
import './App.css';
import * as React from "react";
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import {Box, Drawer, List, ListItem, ListItemButton,ListItemIcon, ListItemText, Divider} from '@mui/material';
import InboxIcon from '@mui/icons-material/MoveToInbox';
import MailIcon from '@mui/icons-material/Mail';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import ButtonGroup from '@mui/material/ButtonGroup';
import { createTheme, ThemeProvider } from '@mui/material/styles';


import { useState } from 'react';
import '@babylonjs/loaders/glTF';

import { FreeCamera, Vector3, HemisphericLight, MeshBuilder } from "@babylonjs/core";
import SceneComponent from "./SceneComponent"; // uses above component in same directory
// import SceneComponent from 'babylonjs-hook'; // if you install 'babylonjs-hook' NPM.


let item;
let item2;
let item3;

var itemState = 0;
var itemRotation = 0.0;
let pivot;

const buttonStyles = {
  backgroundColor: 'black', // Set the background color you desire
  color: 'white', // Set the text color
};

/** Colors for buttons and other styling will be stored below */
const theme = createTheme({
  palette: {
    ochre: {
      main: '#000000',
      contrastText: '#FFFFFF',
    },
  },
});

/**
 * The next two const variables store the code for rendering a babylonjs scene component
 */
let box;
const onSceneReady = (scene) => {
  // This creates and positions a free camera (non-mesh)
  const camera = new FreeCamera("camera1", new Vector3(0, 5, -10), scene);

  // This targets the camera to scene origin
  camera.setTarget(Vector3.Zero());

  const canvas = scene.getEngine().getRenderingCanvas();

  // This attaches the camera to the canvas
  camera.attachControl(canvas, true);

  // This creates a light, aiming 0,1,0 - to the sky (non-mesh)
  const light = new HemisphericLight("light", new Vector3(0, 1, 0), scene);

  // Default intensity is 1. Let's dim the light a small amount
  light.intensity = 0.7;

  // Our built-in 'box' shape.
  box = MeshBuilder.CreateBox("box", { size: 2 }, scene);

  // Move the box upward 1/2 its height
  box.position.y = 1;

  // Our built-in 'ground' shape.
  MeshBuilder.CreateGround("ground", { width: 6, height: 6 }, scene);
};

/**
 * Will run on every frame render.  We are spinning the box on y-axis.
 */
const onRender = (scene) => {
  if (box !== undefined) {
    const deltaTimeInMillis = scene.getEngine().getDeltaTime();

    const rpm = 10;
    box.rotation.y += (rpm / 60) * Math.PI * 2 * (deltaTimeInMillis / 1000);
  }
};

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

  // export default function TemporaryDrawer() {
    const [state, setState] = React.useState({
      top: false,
      left: false,
      bottom: false,
      right: false,
    });
  
    const toggleDrawer = (anchor, open) => (event) => {
      if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
        return;
      }
  
      setState({ ...state, [anchor]: open });
    };
  
    const list = (anchor) => (
      <Box
        sx={{ width: anchor === 'top' || anchor === 'bottom' ? 'auto' : 250 }}
        role="presentation"
        onClick={toggleDrawer(anchor, false)}
        onKeyDown={toggleDrawer(anchor, false)}
      >
        <List>
          {['Inbox', 'Starred', 'Send email', 'Drafts'].map((text, index) => (
            <ListItem key={text} disablePadding>
              <ListItemButton>
                <ListItemIcon>
                  {index % 2 === 0 ? <InboxIcon /> : <MailIcon />}
                </ListItemIcon>
                <ListItemText primary={text} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
        <Divider />
        <List>
          {['All mail', 'Trash', 'Spam'].map((text, index) => (
            <ListItem key={text} disablePadding>
              <ListItemButton>
                <ListItemIcon>
                  {index % 2 === 0 ? <InboxIcon /> : <MailIcon />}
                </ListItemIcon>
                <ListItemText primary={text} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>
    );

  // const boxDefault = {
  //   height: 100,
  //   border: '1px solid black',
  //   padding: 2,
  //   minWidth: 600,
  //   m: 1
  // };

  const boxStyle = {
    marginLeft: 1
  };

  const [selectedItem, setSelectedItem] = useState(null);

  const handleMenuItemClick = (formType) => {
    setSelectedItem(formType);
  };

  return (
    <div className="App">
      <header className="App-header" >
        {/* <img src={logo} width={100} height={100} className="App-logo" alt="logo" /> */}

        {/* <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React!!!
        </a> */}
        <h1>
          City Explorer
        </h1>
      </header>
      <div className='vstack'>
      <ThemeProvider theme={theme}>
      <Box
          m={1}//margin
          display="flex"
          justifyContent="flex-start"
          alignItems="flex-start"
          sx={{width: '30%', border: 1}}
          style={boxStyle}
        >
        <Button
         id="basic-button"
         aria-controls={open2 ? 'basic-menu' : undefined}
         aria-haspopup="true"
         aria-expanded={open2 ? 'true' : undefined}
         onClick={handleClick2}
         variant="outlined" 
         >
          SideMenu
        </Button>
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
          vertical: 'bottom',
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
      <Button variant="contained" color="ochre">Test</Button>
        </Box>
        </ThemeProvider>
        </div>
        <br></br>
        <div className='hstack'>
        <div className='vstack'>
        <Menu
          id="basic-menu"
          aria-labelledby="demo-positioned-button"
          anchorEl={anchorEl2}
          open={open2}
          onClose={handleClose2}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'left',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'left',
          }}>
          <MenuItem onClick={() => handleMenuItemClick("land")}>Land</MenuItem>
          <MenuItem onClick={() => handleMenuItemClick("housing")}>Housing</MenuItem>
          <MenuItem onClick={() => handleMenuItemClick("misc")}>Miscellaneous</MenuItem>
        </Menu>
        <Box
      sx={{
        display: 'flex',
        '& > *': {
          m: 1,
        },
      }}>
        <ButtonGroup
        orientation="vertical"
        aria-label="vertical contained button group"
        variant="contained"
        
        >
        <Button style={buttonStyles} onClick={() => handleMenuItemClick("land")}>Land</Button>
        <Button style={buttonStyles} onClick={() => handleMenuItemClick("housing")}>Housing</Button>
        <Button style={buttonStyles} onClick={() => handleMenuItemClick("misc")}>Miscellaneous</Button>
      </ButtonGroup>
      </Box>
        {selectedItem === "land" && (
        <FormGroup>
          <FormControlLabel control={<Checkbox />} label="Residential" />
          <FormControlLabel control={<Checkbox />} label="Commercial" />
          <FormControlLabel control={<Checkbox />} label="Public and Semi" />
          <FormControlLabel control={<Checkbox />} label="Mixed Use" />
        </FormGroup>
        )}
        {selectedItem === "housing" && (
        <FormGroup>
          <FormControlLabel control={<Checkbox />} label="In Need of Major Repairs" />
          <FormControlLabel control={<Checkbox />} label="In Need of Minor Repairs" />
          <FormControlLabel control={<Checkbox />} label="N/A" />
        </FormGroup>
        )}
        {selectedItem === "misc" && (
        <FormGroup>
          <FormControlLabel control={<Checkbox />} label="Null" />
          <FormControlLabel control={<Checkbox />} label="Church" />
          <FormControlLabel control={<Checkbox />} label="None" />
          <FormControlLabel control={<Checkbox />} label="Shared" />
        </FormGroup>
        )}
        </div>
        <br></br>
        <SceneComponent antialias canvasWidth={1000} canvasHeight={600} onSceneReady={onSceneReady} onRender={onRender} id="my-canvas" />
        </div>
        {/* {['left', 'right', 'top', 'bottom '].map((anchor) => (
        <React.Fragment key={anchor}>
          <Button onClick={toggleDrawer(anchor, true)}>{anchor}</Button>
          <Drawer
            anchor={anchor}
            open={state[anchor]}
            onClose={toggleDrawer(anchor, false)}
          >
            {list(anchor)}
          </Drawer>
        </React.Fragment>
      ))} */}
    </div>
  );
}

export default App;