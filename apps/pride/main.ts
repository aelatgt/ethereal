import AppBase from './App'
import Treadmill from './modules/Treadmill'
import UI from './modules/UI'
import PrideAPI from './modules/PrideAPI'
import * as THREE from 'three'
import * as ethereal from 'ethereal'

import { computeBoundsTree, disposeBoundsTree, acceleratedRaycast } from 'three-mesh-bvh'
import { PerspectiveCamera } from 'three'
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

// TODO: switch to A-Frame
export class App extends AppBase {
    pride = PrideAPI
    system = ethereal.createLayoutSystem(new PerspectiveCamera)
    treadmill = new Treadmill(this)
    ui = new UI(this)
    ethereal = ethereal
}

const app = new App({
    onUpdate: (event) => {
        app.renderer.getSize(app.system.viewResolution)
        app.system.update(event.deltaTime, event.elapsedTime)
    },
    onEnterXR: (event) => {},
    onExitXR: (event) => {
        app.ui.state.immersiveMode = false
    }
})

app.system.transition.duration = 0.4
app.system.transition.delay = 0
app.system.transition.maxWait = 4
app.system.transition.easing = ethereal.easing.easeOut

app.start().catch((e: Error) => {
    console.log(e.stack)
    alert(e)
})

Object.assign( window, { THREE, app } );

