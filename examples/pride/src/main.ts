import AppBase from './app'
import Treadmill from './components/Treadmill'
import UI from './components/UI'
import PrideAPI from './lib/PrideAPI'
import * as THREE from 'three'
import {createSystem} from 'ethereal'
import * as ethereal from 'ethereal'
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
    ethereal = ethereal
}

const app = new App({
    onUpdate: (event) => {
        app.system.viewFrustum.setFromPerspectiveProjectionMatrix(app.camera.projectionMatrix)
        app.renderer.getSize(app.system.viewResolution)
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


// app.system.config.optimize.swarmSize = 3
// app.system.config.optimize.iterationsPerFrame = 20
// app.system.config.optimize.stepSizeMin = 0.000001
// app.system.config.optimize.staleRestartRate = 0.02
// app.system.config.optimize.stepSizeStart = 0.5
// app.system.config.optimize.pulseRate = 0.01
// app.system.config.optimize.constraintRelativeTolerance = 0.6
// app.system.config.optimize.objectiveRelativeTolerance = 0.6

app.start().catch((e: Error) => {
    console.log(e.stack)
    alert(e)
})

Object.assign( window, { THREE, app } );

