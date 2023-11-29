import logo from './logo.svg';
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
import { purple, red } from '@mui/material/colors';
import { ColorPicker } from "material-ui-color";
import { PaletteGenerator } from "material-ui-color";


import { FC, useState } from 'react';
import { useEffect, useRef } from "react";
import * as BABYLON from 'babylonjs';
import { WebXRSessionManager, 
  WebXRTrackingState, 
  WebXRFeatureName, 
  WebXRFeaturesManager,
  WebXRExperienceHelper,
  WebXRCamera,
  WebXRHitTest,
  WebXRState,
  WebXRPlaneDetector,
  WebXRAnchorSystem,
  IWebXRHitResult
 } from '@babylonjs/core/XR';
 import {
  AbstractMesh,
  Axis,
  Color3,
  Engine,
  HemisphericLight,
  MeshBuilder,
  Mesh,
  PointLight,
  PolygonMeshBuilder,
  PointerEventTypes,
  Scene,
  Space,
  StandardMaterial,
  FreeCamera,
  SceneLoader, 
  ExtrudeShapeCustom,
  TransformNode
} from '@babylonjs/core';

import '@babylonjs/loaders/glTF';
import earcut from 'earcut';

import { Quaternion, Vector3, Vector2 } from '@babylonjs/core/Maths/math.vector';
import {ArcRotateCamera} from '@babylonjs/core/Cameras/arcRotateCamera';

let item;
let item2;
let item3;

var itemState = 0;
var itemRotation = 0.0;
let pivot;

const loadmodel = async (scene) => {

  const model = await BABYLON.SceneLoader.ImportMeshAsync("", "https://bafybeibyoumttavsexltkqbcbkkae6rgm46a6mijdahzwp6yclkzeuecia.ipfs.nftstorage.link/","toolbox.glb" , scene);

  // const model = await BABYLON.SceneLoader.ImportMeshAsync("", "https://nftstorage.link/ipfs/bafybeibyoumttavsexltkqbcbkkae6rgm46a6mijdahzwp6yclkzeuecia/","toolbox.glb" , scene);
  // const model = await BABYLON.SceneLoader.ImportMeshAsync("", "https://gateway.pinata.cloud/ipfs/QmSmaEnrPWZoos4SH9btG2xe3osrgMwmyac4h2n7xcWeNa/","toolbox.glb" , scene);
  // const model = await BABYLON.SceneLoader.ImportMeshAsync("", "https://siegfriedschaefer.github.io/rn-babylonjs-pg/assets/", "toolbox.glb", scene);

  item = model.meshes[0];
  item.name = "Toolbox";
  item2 = model.meshes[1];
  item3 = model.meshes[2];

  item.setEnabled(false);
  item.scaling.scaleInPlace(0.2);

  /*
  // load animations from glTF
  const fanRunning = scene.getAnimationGroupByName("fanRunning");

  // Stop all animations to make sure the asset is ready
  scene.stopAllAnimations();
  
  // run the fanRunning animation
  if (fanRunning !== null)
    fanRunning.start(true);
  */
};


// import { FreeCamera, Vector3, HemisphericLight, MeshBuilder } from "@babylonjs/core";
// import SceneComponent from "./SceneComponent"; // uses above component in same directory
// import SceneComponent from 'babylonjs-hook'; // if you install 'babylonjs-hook' NPM.

async function activateWebXR(scene) {
  let placementIndicator;
  var modelPlaced = false;
  var hitpoint;

  const sessionManager = new WebXRSessionManager(scene);
  const supported = await sessionManager.isSessionSupportedAsync('immersive-ar');
  if (!supported) {
    return;
  }

  try {
    const xr = await scene.createDefaultXRExperienceAsync({
      uiOptions: {
        sessionMode: "immersive-ar",
      },
      optionalFeatures: ["hit-test", "anchors", "unbounded"],
    });

    if (!xr.baseExperience) {
      return;
    }

    loadmodel(scene);

    const fm = xr.baseExperience.featuresManager;

    const hitTest = fm.enableFeature(WebXRHitTest, 'latest');

    placementIndicator = MeshBuilder.CreateTorus("torus", {
      thickness: 0.01,
      diameter: 0.1,
      tessellation: 64
    }, scene);
    var indicatorMat = new StandardMaterial('noLight', scene);
    indicatorMat.disableLighting = true;
    indicatorMat.emissiveColor = Color3.White();
    placementIndicator.material = indicatorMat;
    placementIndicator.scaling = new Vector3(1, 0.01, 1);
    placementIndicator.setEnabled(false);

    hitTest.onHitTestResultObservable.add((results) => {
      if (results.length) {
        if (!modelPlaced) {
          placementIndicator.setEnabled(true);
        } else {
          // Do something when model is placed
        }

        if (placementIndicator) {
          if (itemState == 0) {
            hitpoint = results[0];
            let quat = placementIndicator.rotationQuaternion;
            hitpoint.transformationMatrix.decompose(placementIndicator.scaling, quat, placementIndicator.position);
            placementIndicator.position = results[0].position;
          }
          // Do something else
        }
      } else {
        placementIndicator.setEnabled(false);
      }
    });

    const anchorSystem = fm.enableFeature(WebXRAnchorSystem, 'latest');

    if (anchorSystem) {
      anchorSystem.onAnchorAddedObservable.add(webxranchor => {
        let anchor = webxranchor;
        if (item !== undefined) {
          // Do something with the anchor
        }
      });

      anchorSystem.onAnchorRemovedObservable.add(webxranchor => {
        let anchor = webxranchor;
        if (anchor) {
          // Do something when anchor is removed
        }
      });
    }

    scene.onBeforeRenderObservable.add(() => {
      if (item !== undefined) {
        // Do something before rendering
      }
    });
  } catch (error) {
    console.error(error);
  }
}

function createScene(engine, canvas) {
  // Create the scene space
  var scene = new BABYLON.Scene(engine);
  scene.createDefaultEnvironment({ createGround: false, createSkybox: false });

  // Add a camera to the scene and attach it to the canvas
  var camera = new BABYLON.FreeCamera("camera1", new BABYLON.Vector3(0, 2, -10), scene);
  camera.setTarget(BABYLON.Vector3.Zero());

  camera.attachControl(canvas, true);

  // Add lights to the scene
  var light1 = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, 3, 0), scene);

  activateWebXR(scene);

  return scene;
}


function BabylonView() {
  const [xrScene, setXrScene] = useState();
  const [xrEngine, setXrEngine] = useState();
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas === null) return;

    // Fullpage support
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const engine = new BABYLON.Engine(canvas, true);
    setXrEngine(engine);

    var scene;

    scene = createScene(engine, canvas);

    // Register a render loop to repeatedly render the scene
    engine.runRenderLoop(function () {
      scene.render();
    });
    setXrScene(scene);

    // Watch for browser/canvas resize events
    window.addEventListener("resize", function () {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      engine.resize();
    });
  }, []);

  const onToggleXR = () => {
    if (xrScene !== undefined) {
      // xrScene.getEngine().switchFullscreen(false);
    }
  }

  return (
    <>
      <button className="btn btn-primary" onClick={onToggleXR}>
        XR On/Off
      </button>
      <canvas id="renderCanvas" width="100%" height="100%" ref={canvasRef} style={{ flex: 1 }} />
    </>
  );
}

const buttonStyles = {
  backgroundColor: 'black', // Set the background color you desire
  color: 'white', // Set the text color
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
      <header className="App-header" style={{ textAlign: 'left' }}>
        {/* <img src={logo} width={100} height={100} className="App-logo" alt="logo" /> */}
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React!!!
        </a>
        <br></br>
        
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
        </Box>
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
      <BabylonView />
      </header>
    </div>
  );
}

export default App;
