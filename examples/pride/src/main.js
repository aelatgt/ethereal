import AppBase from './app';
import Treadmill from './components/Treadmill';
import UI from './components/UI';
import PrideAPI from './lib/PrideAPI';
import * as THREE from 'three';
import { createSystem } from 'ethereal';
import * as ethereal from 'ethereal';
import './lib/SpatialLayout';
import { computeBoundsTree, disposeBoundsTree, acceleratedRaycast } from 'three-mesh-bvh';
THREE.BufferGeometry.prototype.computeBoundsTree = computeBoundsTree;
THREE.BufferGeometry.prototype.disposeBoundsTree = disposeBoundsTree;
THREE.Mesh.prototype.raycast = acceleratedRaycast;
PrideAPI.get();
setInterval(() => PrideAPI.get(), 5000);
// TODO: switch to A-Frame
export class App extends AppBase {
    constructor() {
        super(...arguments);
        this.pride = PrideAPI;
        this.system = createSystem(this.camera);
        this.treadmill = new Treadmill(this);
        this.ui = new UI(this, this.treadmill);
        this.ethereal = ethereal;
    }
}
const app = new App({
    onUpdate: (event) => {
        app.system.update(event.deltaTime, event.elapsedTime);
        app.treadmill.update(event);
        app.ui.update(event);
    },
    onEnterXR: (event) => {
        app.treadmill.enterXR(event);
    },
    onExitXR: (event) => {
        app.ui.state.immersiveMode = false;
    }
});
app.system.config.optimize.swarmSize = 3;
app.system.config.optimize.iterationsPerFrame = 25;
app.system.config.optimize.stepSizeMin = 0.000001;
app.system.config.optimize.staleRestartRate = 0.02;
app.system.config.optimize.stepSizeStart = 0.5;
app.system.config.optimize.pulseRate = 0.01;
app.system.config.optimize.constraintRelativeTolerance = 0.3;
app.system.config.optimize.objectiveRelativeTolerance = 0.3;
app.start().catch((e) => {
    console.error(e);
    alert(e);
});
Object.assign(window, { THREE, app });
