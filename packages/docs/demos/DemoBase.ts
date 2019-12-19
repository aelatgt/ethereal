import * as THREE from 'three'
import {V_000, V_111} from 'ethereal'

export class DemoBase {
    container = new THREE.Object3D
    view = new THREE.Object3D

    constructor() {
        this.container.layout.relative.setFromCenterAndSize(V_000, V_111)
        this.container.layout.innerAutoUpdate = false
    }
}