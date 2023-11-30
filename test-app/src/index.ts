/* Web-Based-VR-Tutorial Project Template
* Author: Evan Suma Rosenberg <suma@umn.edu> and Blair MacIntyre <blair@cc.gatech.edu>
* License: Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
*/

// Extended by David J. Zielinski

import { Engine } from "@babylonjs/core/Engines/engine";
import { Scene } from "@babylonjs/core/scene";
import { Vector3 } from "@babylonjs/core/Maths/math";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { Color3 } from "@babylonjs/core/Maths/math";
import { Vector2 } from "@babylonjs/core/Maths/math";
import { Color4 } from "@babylonjs/core/Maths/math";
import { UniversalCamera } from "@babylonjs/core/Cameras/universalCamera";
import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight";
import { DirectionalLight } from "@babylonjs/core/Lights/directionalLight";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Control } from "@babylonjs/gui/2D/controls";
import { StackPanel } from "@babylonjs/gui/2D/controls";
import { IShadowLight } from "@babylonjs/core";
import { Scalar } from "@babylonjs/core";
import { AdvancedDynamicTexture } from "@babylonjs/gui/2D/advancedDynamicTexture";

import TileSet from "babylonjs-mapping";
import PropertyGUI from "./propertyGUI";
import FancyBuildings from "./fancyBuildings";
import { ProjectionType } from "babylonjs-mapping/lib/TileMath";
import BuildingsCustom from "babylonjs-mapping/lib/BuildingsCustom";

export interface propertiesCharlotte {
    "Shape_Leng": number;
    "Shape_Area": number;
    "Block_numb": string;
    "Drawing_nu": string;
    "Plot_numbe": string;
    "Land_type": string;
    "Housing_co": string;
    "Additional": string;
    "Street": string;
    "Address": string;
    "Story": string;
}

export class Game {
    private canvas: HTMLCanvasElement;
    private engine: Engine;
    public scene: Scene;
    public advancedTexture: AdvancedDynamicTexture;

    private ourTS: TileSet;

    public allBuildings: Mesh[] = [];

    public propertyGUIs: PropertyGUI[] = [];
    public customBuildingGenerator: BuildingsCustom;

    public ourMaterialHighlight: StandardMaterial;
    public ourBlackMaterial: StandardMaterial;


    private dirLight: IShadowLight;
    private camera: UniversalCamera;

    constructor() {
        // Get the canvas element 
        this.canvas = document.getElementById("renderCanvas") as HTMLCanvasElement;

        // Generate the BABYLON 3D engine
        this.engine = new Engine(this.canvas, true);

        // Creates a basic Babylon Scene object
        this.scene = new Scene(this.engine);
    }

    start(): void {
        // Create the scene and then execute this function afterwards
        this.createScene().then(() => {

           // Register a render loop to repeatedly render the scene
           this.engine.runRenderLoop(() => { 
               this.update();
               this.scene.render();
           });

           // Watch for browser/canvas resize events
           window.addEventListener("resize", () => { 
               this.engine.resize();
           });
       });
    }    

    private async createScene() {
        const fb=new FancyBuildings(this);
        await fb.loadJSON();

        this.scene.clearColor = new Color4(135/255,206/255,235/255, 1.0);

        this.camera = new UniversalCamera("camera1", new Vector3(10, 10, -50), this.scene);    
        this.camera.setTarget(new Vector3(15,-15,30));
        this.camera.attachControl(this.canvas, true);
        this.camera.speed=0.1;
        this.camera.minZ=0.1;
        this.camera.angularSensibility=8000;
        
        var light = new HemisphericLight("light", new Vector3(0, 1, 0), this.scene);
        light.intensity = 0.5;
        this.dirLight = new DirectionalLight("DirectionalLight", new Vector3(0, -1, 1), this.scene);
        this.dirLight.intensity=0.5;

        this.ourMaterialHighlight = new StandardMaterial("infoSpotMaterialHighlight", this.scene);
        this.ourMaterialHighlight.diffuseColor = new Color3(1, 1, 1);
        this.ourMaterialHighlight.freeze();

        this.ourBlackMaterial = new StandardMaterial("black_color", this.scene);
        this.ourBlackMaterial.diffuseColor = new Color3(0, 0, 0);
        this.ourBlackMaterial.freeze();

        this.ourTS = new TileSet(this.scene,this.engine);
        this.ourTS.createGeometry(new Vector2(4,4), 25, 2);
        this.ourTS.setRasterProvider("OSM");
        this.ourTS.updateRaster(35.2258461, -80.8400777, 16); //charlotte
        this.advancedTexture = this.ourTS.getAdvancedDynamicTexture();

        const blockMaterial = new StandardMaterial("blockMaterial", this.scene);
        blockMaterial.diffuseColor = new Color3(0.4, 0.4, 0.4);
        blockMaterial.freeze();

        const blockUrl = "https://virtualblackcharlotte.net/geoserver/Charlotte/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=Charlotte%3ABlocks&outputFormat=application%2Fjson";
        const customBlockGenerator = new BuildingsCustom("blocks", blockUrl, ProjectionType.EPSG_3857, this.ourTS);
        customBlockGenerator.doMerge = false;
        customBlockGenerator.defaultBuildingHeight = 0.1;
        customBlockGenerator.buildingMaterial = blockMaterial;
        customBlockGenerator.generateBuildings();

        const url="https://virtualblackcharlotte.net/geoserver/Charlotte/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=Charlotte%3ABuildings&outputFormat=application%2Fjson";
        this.customBuildingGenerator=new BuildingsCustom("buildings", url, ProjectionType.EPSG_3857, this.ourTS);
        this.customBuildingGenerator.doMerge=false;
        this.customBuildingGenerator.generateBuildings();
        
        this.customBuildingGenerator.onCaughtUpObservable.addOnce(() => {
           
            for (let t of this.ourTS.ourTiles) {
                //console.log("tile: " + t.mesh.name + " contains buildings: " + t.buildings.length);
                for (let b of t.buildings) {
                    if(b.name.includes("Building")){
                        this.allBuildings.push(b);
                    }
                }
            }
            console.log("buildings found: " + this.allBuildings.length);

            //parse metadata into easy to use Map
            for (let i = 0; i < this.allBuildings.length; i++) {
                const b = this.allBuildings[i];
                const props = b.metadata as propertiesCharlotte;
                const ourMap: Map<string,string>=new Map<string,string>();          
                
                ourMap.set("Shape_Leng",props.Shape_Leng.toString());
                ourMap.set("Shape_Area",props.Shape_Area.toString());
                ourMap.set("Block_numb", props.Block_numb);
                ourMap.set("Drawing_nu", props.Drawing_nu);
                ourMap.set("Plot_numbe", props.Plot_numbe);
                ourMap.set("Land_type", props.Land_type);
                ourMap.set("Housing_co", props.Housing_co);
                ourMap.set("Additional", props.Additional ? props.Additional: "none");
                ourMap.set("Street", props.Street ? props.Street: "none");
                ourMap.set("Address", props.Address ? props.Address: "none");
                ourMap.set("Story", props.Story ? props.Story : "0");
                b.metadata=ourMap; //replace interface data with our new map!
            }

            var panel = new StackPanel();   
            panel.width = "200px";
            panel.height = 1.0;
            panel.isVertical = true;
            panel.background = "white";
            panel.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
            panel.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
    
            this.advancedTexture.addControl(panel);

            const pgui=new PropertyGUI("Land_type", this);
            pgui.generateGUI(panel);
            this.propertyGUIs.push(pgui);

            const pgui1=new PropertyGUI("Housing_co", this);
            pgui1.generateGUI(panel);
            this.propertyGUIs.push(pgui1);

            const pgui2 = new PropertyGUI("Additional", this);
            pgui2.generateGUI(panel);
            this.propertyGUIs.push(pgui2);

            fb.setupFancyBuildings();
        });      
        
        
        // Show the debug scene explorer and object inspector
        // You should comment this out when you build your final program 
        //this.scene.debugLayer.show();
    }

    // The main update loop will be executed once per frame before the scene is rendered
    // adjust fly speed based on height above ground
    private update(): void {
         const clampedY=Scalar.Clamp(this.camera.position.y,0.1,5);
        const percent=clampedY/5.0;
        const speed=0.02+percent*0.15;
        this.camera.speed=speed;       
    }

}
/******* End of the Game class ******/

// start the game
var game = new Game();
game.start();