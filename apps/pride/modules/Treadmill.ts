import * as THREE from 'three'
import * as CANNON from 'cannon'
import CreateSTLLoader from 'three-stl-loader'
const STLLoader: typeof THREE.BufferGeometryLoader = CreateSTLLoader({...THREE})

import App from '../App'
import {makeTextSprite} from '../lib/label-utils'


interface Annotation {
    text: string
    anchorPoint: [number, number, number]
}

export default class Treadmill {

    textureLoader = new THREE.TextureLoader()
    stlLoader = new STLLoader() as THREE.BufferGeometryLoader

    snubber = new THREE.Object3D

    poster = new THREE.Mesh(
        new THREE.PlaneGeometry(1.04, 2.0), 
        new THREE.MeshBasicMaterial()
    )

    snubberAnchor = new THREE.Object3D()
    snubberAnchorPosition = new THREE.Vector3().set(-0.33, 0.92, 0.18)
    // snubberAnchorPosition = new THREE.Vector3().set(0.033, -0.062, 0.018)

    snubberMesh?: THREE.Mesh

    lineMaterial = new THREE.LineBasicMaterial({
        color: 0xffa500,
        depthTest: false,
    })

    _scratchMatrix = new THREE.Matrix4

    annotations: Annotation[] = [
        {
            text: 'TEST',
            anchorPoint: [0,0,0],
        },
        {
            text: 'Part A',
            anchorPoint: [-0.18, 0.06, 0.09],
        },
        {
            text: 'Part B',
            anchorPoint: [0.05, 0.05, 0.12],
        },
        {
            text: 'Part C',
            anchorPoint: [-0.1, 0.05, 0.11],
        },
        {
            text: 'Part D',
            anchorPoint: [0.14, -0.22, -0.06],
        },
        {
            text: 'Part E',
            anchorPoint: [0.11, 0, 0.1],
        },
        {
            text: 'Part F',
            anchorPoint: [-0.06, -0.04, 0.02],
        },
    ]

    annotationState: Map<Annotation, {
        spring: CANNON.Spring,
        anchorBody: CANNON.Body,
        annotationBody: CANNON.Body,
        anchorObject: THREE.Object3D,
        contentObject: THREE.Mesh,
        annotationObject: THREE.Object3D,
        lineDepthWriting: THREE.Line,
        line: THREE.Line,
    }> = new Map

    constructor(public app: App) {
        this.loadPoser()
        this.loadSnubberMesh()
    }

    private loadPoser() {
        this.poster.name = 'poster'
        this.textureLoader.load('./public/Treadmill.jpeg', (texture) => {
            this.poster.material.map = texture
            this.poster.material.needsUpdate = true
        })
        this.poster.add(this.snubberAnchor)
        this.snubberAnchor.position.copy(this.snubberAnchorPosition)
    }

    private loadSnubberMesh() {
        this.snubber.name = 'snubber'

        const snubberRoot = new THREE.Object3D()
        snubberRoot.quaternion.setFromAxisAngle(new THREE.Vector3(0,0,1), Math.PI) 
        snubberRoot.scale.setScalar(0.01)

        this.stlLoader.load('./public/fullSnubberSimplified.stl', (snubberGeometry) => {
            snubberGeometry.computeBoundsTree()
            const snubberMaterial = new THREE.MeshNormalMaterial()
            const snubberMesh = new THREE.Mesh(snubberGeometry, snubberMaterial)
            this.snubberMesh = snubberMesh
            this.snubberMesh.scale.setScalar(0.1)
            // this.snubberMesh.rotateZ(Math.PI)
            snubberRoot.add(snubberMesh)
            // const hull = SimplifiedHull.get(snubberMesh.geometry)
            // const hullMesh = new THREE.Mesh(hull, new THREE.MeshBasicMaterial({
            //     color: 0xF3A2B0,
            //     wireframe: true
            // }))
            // hullMesh.layoutIgnore = true
            // this.snubberMesh.add(hullMesh)
            this.snubber.add(snubberRoot)
        })
    }

    async enterXR(evt:any) {}

    update(event: any) {}

}
