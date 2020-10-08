import AppBase from './app'
import Treadmill from './components/Treadmill'
import UI from './components/UI'
import PrideAPI from './lib/PrideAPI'
import * as THREE from 'three'
import {createSystem} from 'ethereal'
import './lib/SpatialLayout'

import { computeBoundsTree, disposeBoundsTree, acceleratedRaycast } from 'three-mesh-bvh'
THREE.BufferGeometry.prototype.computeBoundsTree = computeBoundsTree
THREE.BufferGeometry.prototype.disposeBoundsTree = disposeBoundsTree
THREE.Mesh.prototype.raycast = acceleratedRaycast
declare module 'three/src/core/BufferGeometry' {
    interface BufferGeometry {
        computeBoundsTree() : void
        disposeBoundsTree() : void
        boundsTree?: any
    }
}

PrideAPI.get()
setInterval(() => PrideAPI.get(), 5000)

// TODO: switch to A-Frame
export class App extends AppBase {
    pride = PrideAPI
    system = createSystem(this.camera)
    treadmill = new Treadmill(this)
    ui = new UI(this, this.treadmill)
}

const app = new App({
    onUpdate: (event) => {
        app.system.update(event.deltaTime, event.elapsedTime)
        app.treadmill.update(event)
        app.ui.update(event)
    },
    onEnterXR: (event) => {
        app.treadmill.enterXR(event)
    },
    onExitXR: (event) => {
        app.ui.state.immersiveMode = false
    }
})


app.system.config.optimize.swarmSize = 2
app.system.config.optimize.iterationsPerFrame = 15
app.system.config.optimize.stepSizeMin = 0.0001

app.start().catch((e: Error) => {
    console.error(e)
    alert(e)
})

Object.assign( window, { THREE, app } );
