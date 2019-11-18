import * as THREE from 'three'

export class DemoBase {
    container = new THREE.Object3D
    view = new THREE.Object3D

    constructor() {
        this.container.layout.relative.min.set(-1,-1,-1)
        this.container.layout.relative.max.set(1,1,1)
        this.container.layout.innerAutoUpdate = false
    }
}