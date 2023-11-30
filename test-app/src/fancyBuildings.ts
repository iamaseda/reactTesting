import { Angle } from "@babylonjs/core/Maths/math";
import { Vector3 } from "@babylonjs/core/Maths/math";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { Color3 } from "@babylonjs/core/Maths/math";
import { Color4 } from "@babylonjs/core/Maths/math";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { ActionManager, IShadowLight,  MeshBuilder, Scalar, TransformNode } from "@babylonjs/core";
import { ExecuteCodeAction } from "@babylonjs/core";
import { SceneLoader } from "@babylonjs/core";
import { AdvancedDynamicTexture } from "@babylonjs/gui/2D/advancedDynamicTexture";
import { Button } from "@babylonjs/gui/2D/controls/button";
import { Control } from "@babylonjs/gui/2D/controls";
import { ISceneLoaderAsyncResult } from "@babylonjs/core";
import { BoundingInfo } from "@babylonjs/core";
import { AbstractMesh } from "@babylonjs/core/Meshes/abstractMesh";
import { InstancedMesh } from "@babylonjs/core";

import "@babylonjs/core/Materials/standardMaterial"
import "@babylonjs/inspector";

import {Game} from "./index";

export interface FancyBuildingJSON {
    "id": string;
    "filename": string;
    "rotation": number;
    "photo": string;
}

export interface AllFancyBuildings {
    "buildings": FancyBuildingJSON[];
}

export default class FancyBuildings {
    private lastSelectedBuildingIndex: number = -1;
    private lastSelectedBuilding: Mesh;
    private previousButton: Button;
    public ourFancyBuildings: AllFancyBuildings;


    constructor(public game: Game) {

    }

    public setupFancyBuildings(): void{
        this.replaceSimpleBuildingsWithFancy().then(() => {
            console.log("setting up buildings to be clickable now");
            console.log("number of buildings: " + this.game.allBuildings.length);
            for (let i = 0; i < this.game.allBuildings.length; i++) {
                const b = this.game.allBuildings[i];
                this.setupClickableBuilding(b,i);
            }
        });
    }

    public async loadJSON() {
        console.log("trying to load fancy_buildings.json");
        const url = window.location.href + "fancy_buildings.json";

        var res = await fetch(url); //then((res) => {
        //console.log("  fetch returned: " + res.status);

        if (res.status == 200) {
            var text = await res.text();

            //console.log("about to json parse for tile: " + tile.tileCoords);
            if (text.length == 0) {
                console.log("no buildings in this tile!");
                return;
            }
            this.ourFancyBuildings = JSON.parse(text);
        } else{
            console.error("couldn't load Fancy_buildings.json file! is it in the right directory?");
        }
    }

    //bringing models from sketchup to blender to GLB, seems to have a bunch of instanced parts, which if we want a single mesh, we need to collapse;
    private mergeBuildingMeshes(rawMeshes: AbstractMesh[]): Mesh
    {
        console.log("trying to do merge now!");

        const realMeshes: Mesh[] = [];

            for (let m of rawMeshes) {
                if (m.getClassName() == "Mesh") {
                    //console.log("found regular mesh: " + m.name);
                    const pureMesh = m as Mesh;

                    //console.log("  verticies: " + pureMesh.getTotalVertices());
                    if (pureMesh.getTotalVertices() > 0) {
                        //console.log("  adding mesh to merge list");
                        realMeshes.push(pureMesh);
                    }
                } else if (m.getClassName() == "InstancedMesh") {
                    //console.log("found instanced mesh: " + m.name);
                    //per https://forum.babylonjs.com/t/how-to-replace-instancedmesh-with-a-mesh/6185
                    const instanceMesh = m as InstancedMesh;
                    const newMesh = instanceMesh.sourceMesh.clone(instanceMesh.name + "non_instance", instanceMesh.parent)
                    newMesh.position = instanceMesh.position.clone();
                    if (instanceMesh.rotationQuaternion)
                        newMesh.rotationQuaternion = instanceMesh.rotationQuaternion.clone();
                    newMesh.scaling = instanceMesh.scaling.clone();

                    //console.log("  verticies: " + newMesh.getTotalVertices());
                    if (newMesh.getTotalVertices() > 0) {
                        //console.log("  adding mesh to merge list");
                        realMeshes.push(newMesh);
                    }
                } else{
                    console.error("unknown classtype: " + m.getClassName());
                }
            }

            console.log("trying to merge now. meshes: " + realMeshes.length);
            const merged = Mesh.MergeMeshes(realMeshes,false,true); 
            if (merged) {
                console.log("succesfully merged building pieces");
                merged.name = "merged_building_pieces";
            } else {
                console.error("unable to merge all building meshes!");
                return new Mesh("failed merge");
            }            

            return merged;
    }    

    private fixScale(originalMesh: Mesh, fancyMesh: Mesh) {
        const bbounds: BoundingInfo = originalMesh.getBoundingInfo();
        const bmax = bbounds.boundingBox.maximumWorld.clone();
        const bmin = bbounds.boundingBox.minimumWorld.clone();
        bmax.y = 0;
        bmin.y = 0;
        const bboundsNoY: BoundingInfo = new BoundingInfo(bmin, bmax);
        //console.log("adjusted bbounds: " + bboundsNoY.maximum + " " + bboundsNoY.minimum);

        const ibounds: BoundingInfo = fancyMesh.getBoundingInfo();
        const imax = ibounds.boundingBox.maximumWorld.clone();
        const imin = ibounds.boundingBox.minimumWorld.clone();
        imax.y = 0;
        imin.y = 0;
        const iboundsNoY: BoundingInfo = new BoundingInfo(imin, imax);
        //console.log("adjusted ibounds: " + iboundsNoY.maximum + " " + iboundsNoY.minimum);

        const correctRadius = bboundsNoY.boundingSphere.radiusWorld;
        const importRadius = iboundsNoY.boundingSphere.radiusWorld;
        const scaleCorrection = correctRadius / importRadius;
        
        console.log("original radius: " + correctRadius);
        console.log("import radius: " + importRadius);
       
        fancyMesh.scaling = fancyMesh.scaling.multiplyByFloats(scaleCorrection, scaleCorrection, scaleCorrection);

        //let's check to see 
        fancyMesh.computeWorldMatrix(true);
        const checkBounds: BoundingInfo = fancyMesh.getBoundingInfo();  
        const cmax = checkBounds.boundingBox.maximumWorld.clone();
        const cmin = checkBounds.boundingBox.minimumWorld.clone();
        cmax.y = 0;
        cmin.y = 0;
        
        const checkBoundsNoY: BoundingInfo = new BoundingInfo(cmin, cmax);
        //console.log("adjusted cbounds: " + checkBoundsNoY.maximum + " " + checkBoundsNoY.minimum);

        console.log("post radius: " + checkBoundsNoY.boundingSphere.radiusWorld);
    }

    private fixPosition(originalMesh: Mesh, importedMesh: Mesh) {
        const bbounds: BoundingInfo = originalMesh.getBoundingInfo();     
        const ibounds: BoundingInfo = importedMesh.getBoundingInfo();
     
        const correctPosition = bbounds.boundingSphere.centerWorld;
        const importPosition = ibounds.boundingSphere.centerWorld;       
        const positionCorrection = correctPosition.subtract(importPosition);
        positionCorrection.y=0; //don't adjust y

        console.log("original position: " + correctPosition);
        console.log("import position: " + importPosition);

        importedMesh.position=importedMesh.position.add(positionCorrection);
        importedMesh.computeWorldMatrix(true);

        const cbounds: BoundingInfo = importedMesh.getBoundingInfo();
        console.log("post position: " + cbounds.boundingSphere.centerWorld);
    }

    /*private computeDifferenceCost(originalMesh: Mesh, importedMesh: Mesh): number{
        const originalPosRaw: FloatArray = originalMesh.getVerticesData(VertexBuffer.PositionKind);
        const originalPosVec3: Vector3[]=[];

        for(let i=0;i<originalPosRaw.length;i+=3){
            const vec3=new Vector3(originalPosRaw[i],originalPosRaw[i+1],originalPosRaw[i+2]);
            const worldVec3=Vector3.TransformCoordinates(vec3, originalMesh.getWorldMatrix());
            originalPosVec3.push(worldVec3);
        }

        const importedPosRaw: FloatArray = importedMesh.getVerticesData(VertexBuffer.PositionKind);
        const importedPosVec3: Vector3[]=[];

        for(let i=0;i<importedPosRaw.length;i+=3){
            const vec3=new Vector3(importedPosRaw[i],importedPosRaw[i+1],importedPosRaw[i+2]);
            const worldVec3=Vector3.TransformCoordinates(vec3, importedMesh.getWorldMatrix());
            importedPosVec3.push(worldVec3);
        }

        let totalCost=0;
        for(let i=0;i<importedPosVec3.length;i++){
            let lowestCost=Number.POSITIVE_INFINITY;
            for(let e=0;e<originalPosVec3.length;e++){
                const cost=Vector3.Distance(importedPosVec3[i],originalPosVec3[e]);
                if(cost<lowestCost){
                    lowestCost=cost;
                }
            }
            totalCost+=lowestCost;
        }
        const costPerVertex=totalCost/importedPosVec3.length;
        
        return costPerVertex;
    }
    */
    /*private applyYaw(importedMesh: Mesh, originalRot: Quaternion, yaw: number){
        const rotAdjustment: Quaternion = Quaternion.FromEulerAngles(0, yaw, 0);
        importedMesh.rotationQuaternion = originalRot.multiply(rotAdjustment);
        importedMesh.computeWorldMatrix(true);
    }*/

    private async replaceSimpleBuildingsWithFancy() {
        console.log("trying to replace SimpleBuildings with Fancy Model");

        const buildingMaterial = new StandardMaterial("merged buildingMaterial");
        buildingMaterial.diffuseColor = new Color3(0.8, 0.8, 0.8);

        console.log("number of Fancy buildings found: " + this.ourFancyBuildings.buildings.length);
        
        //TODO: need check here if Fancybuilding json isn't found!
        for (let c of this.ourFancyBuildings.buildings) {
            var loadResult: ISceneLoaderAsyncResult = await SceneLoader.ImportMeshAsync("", "./models/", c.filename, this.game.scene);
            console.log("number of meshes loaded: " + loadResult.meshes.length);
            /*for( let m of loadResult.meshes){
                console.log("mesh loaded: " + m.name);
            }*/

            
            const merged = this.mergeBuildingMeshes(loadResult.meshes);

            for (let m of loadResult.meshes)            { m.dispose(); }
            for (let t of loadResult.transformNodes)    { t.dispose(); }
            for (let l of loadResult.lights)            { l.dispose(); }
            for (let g of loadResult.geometries)        { g.dispose(); }

            console.log("Fancy building loaded for: " + c.id);
            
            let buildingToRemove: Mesh | null=null;

            for (let b of this.game.allBuildings) {

                if (b.name.includes(c.id)) { //DANGER: this is dangerous!, as 11 will be found in 1011
                    console.log("found site for Fancy building!");

                    // b.showBoundingBox = true;
                    //merged.showBoundingBox = true;
                    b.enableEdgesRendering();
                    b.edgesColor=new Color4(1,0,0,1);
                    b.edgesWidth=0.3;

                    merged.enableEdgesRendering();
                    merged.edgesColor=new Color4(0,0,0,1);
                    merged.edgesWidth=0.3;

                    /*let originalImportedRot: Quaternion = merged.rotationQuaternion;
                    if (originalImportedRot == null) {
                        console.log("quaternion not defined, will create from rotation euler angles");
                        originalImportedRot = Quaternion.FromEulerVector(merged.rotation);
                    }
                    
                    let lowestCost: number = Number.POSITIVE_INFINITY;
                    let lowestAngle: number = 0;

                    for (let a = 0; a < 360; a++) {
                        
                        this.applyYaw(merged, originalImportedRot, a);
                        this.fixScale(b, merged);
                        this.fixPosition(b, merged);

                        const cost = this.computeDifferenceCost(b, merged);
                        console.log("computed cost per vertex: " + cost);

                        if(cost<lowestCost){
                            lowestCost=cost;
                            lowestAngle=a;
                        }
                    }

                    console.log("Lowest Cost: " + lowestCost);
                    console.log("Lowest Cost Angle: " + lowestAngle);
                    */
                    //this.applyYaw(merged, originalImportedRot, lowestAngle);
                    console.log("trying to set rotation to: " + c.rotation);
                    const radians=Angle.FromDegrees(c.rotation);
                    merged.rotation=new Vector3(0,radians.radians(),0);//Quaternion.FromEulerAngles(0, c.rotation, 0);
                    merged.computeWorldMatrix(true);
                    this.fixScale(b, merged);
                    this.fixPosition(b, merged); 
                    
                    const props = b.metadata as Map<string, string>;
                    props.set("photo",c.photo);
                    console.log("adding photo: " + c.photo);

                    merged.metadata=props;
                    merged.name=b.name;
                    buildingToRemove=b;

                    break;
                }
             
            }

            if(buildingToRemove){
                const index=this.game.allBuildings.indexOf(buildingToRemove);    
                this.game.allBuildings.splice(index,1);
                buildingToRemove.dispose();

                this.game.allBuildings.push(merged);
            }           
        }
        console.log("finished loading all Fancy buildings");
    }

    private setupClickableBuilding(b: Mesh, index: number) {
        b.isPickable = true;
        //console.log("setting up building: " + b.name);
        b.actionManager = new ActionManager(this.game.scene);
        b.actionManager.registerAction(
            new ExecuteCodeAction(
                {
                    trigger: ActionManager.OnPickTrigger //OnPointerOverTrigger
                },
                () => {
                    console.log("user clicked on building: " + b.name);

                    for(const n of b.getChildren()){
                        if(n.name.includes("gui")){
                            console.log("object is already selected!");
                            return; 
                        }
                    }                  

                    //const originalMaterial = b.material;
                    //b.material = this.ourMaterialHighlight;

                    
                    const props = b.metadata as Map<string, string>;

                    let popupText: string = "";
                    popupText += "id: " + b.name + "\n";
                    props.forEach((value: string, key: string) => {
                        popupText += key + ": " + value + "\n";
                    });

                    const bbounds: BoundingInfo = b.getBoundingInfo();             
                    const bpos = bbounds.boundingSphere.centerWorld;                  

                    var stick = MeshBuilder.CreatePlane("gui_stick", {height: 0.5, width: 0.1});
                    stick.position=bpos.add(new Vector3(0,0.25,0));   
                    //stick.setParent(b);
                    stick.billboardMode=TransformNode.BILLBOARDMODE_Y;
                    stick.material=this.game.ourBlackMaterial;

                    var plane = MeshBuilder.CreatePlane("gui_plane", {height: 1, width: 1});                
                    plane.position=bpos.add(new Vector3(0,1.0,0));   
                    //plane.setParent(b);
                    plane.billboardMode=TransformNode.BILLBOARDMODE_Y;                 
                
                    const floatingAdvancedTexture = AdvancedDynamicTexture.CreateForMesh(plane);

                    let button: Button = null;

                    if (props.has("photo")) {
                        plane.scaling.x=1.3; //make a little wider
                        button = Button.CreateImageOnlyButton("building photo", "photos/"+props.get("photo"));
                        button.width = "100%";
                        button.height = "100%";

                    } else {
                        button = Button.CreateSimpleButton("but", popupText);
                        button.width = "100%";
                        button.height = "100%";
                        button.color = "white";
                        button.textBlock.fontSize = "60px";
                        button.textBlock.paddingLeft = "10px";
                        button.textBlock.paddingTop = "10px";
                        button.textBlock.textVerticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;

                        button.background = "black";
                        button.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
                        button.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;

                        if (button.textBlock) {
                            button.textBlock.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
                        }
                    }
                    floatingAdvancedTexture.addControl(button);

                    button.onPointerClickObservable.add(() => {
                        console.log("user clicked on button");
                        //b.material = originalMaterial;
                        this.lastSelectedBuildingIndex = -1;
                        floatingAdvancedTexture.removeControl(button);
                        button.dispose();
                        floatingAdvancedTexture.dispose();
                        plane.dispose();           
                        stick.dispose();             
                    });

                    this.lastSelectedBuildingIndex = index;
                    this.lastSelectedBuilding = b;
                    this.previousButton = button;

                }
            )
        );
    }
}
