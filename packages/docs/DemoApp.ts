import AppBase, {UpdateEvent, ExitXREvent, EnterXREvent} from './AppBase'
import * as THREE from 'three'
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader'
import {BufferGeometryUtils} from 'three/examples/jsm/utils/BufferGeometryUtils'
// import {vectors, vectors2, SpatialMetrics, BehaviorManager, easing, V_000, V_111, LayoutHelper} from 'old-ethereal/src'
import { GlobalAdaptivityDemo } from './demos/GlobalAdaptivityDemo'
import { DemoBase } from './demos/DemoBase'
// import { EtherealSystem, TrackedNodeState, Node3D, Box3D } from '@etherealjs/core'
import { system, adapt, metrics, easing, transitionable, SphericalCoordinate, V_000 } from 'ethereal/mod'

import * as ethereal from 'ethereal/mod'

export class DemoApp extends AppBase {

    ethereal = ethereal
    publicUrl = process.env.PUBLIC_URL ?? '/'

    gltfLoader = new GLTFLoader()
    cubeTextureLoader = new THREE.CubeTextureLoader()

    room = new THREE.Mesh()
    sky!:THREE.CubeTexture

    demos = [] as DemoBase[]

    plane = new THREE.PlaneGeometry
    surfaceWallA = new THREE.Mesh(this.plane)
    surfaceWallB = new THREE.Mesh(this.plane)
    surfaceWallC = new THREE.Mesh(this.plane)
    surfaceWallD = new THREE.Mesh(this.plane)
    
    surfaceAboveBed = new THREE.Mesh(this.plane)

    viewTarget!: THREE.Object3D
    belowRoomViewTarget = new THREE.Object3D()
    roomViewTarget = new THREE.Object3D()

    cameraMovement = transitionable(1, {
        duration:2, 
        easing: easing.easeIn
    })

    constructor() {
        super()

        system.viewNode = this.camera

        // setup scene
        this.loadSky()
        this.loadRoom()
        this.setupLights()
        this.camera.rotateZ(Math.PI)
        
        // const dollyDistance = transitionable(2, {duration:0})

        // let cameraMovement = 1
        // let dollyDistance = 2
        
        adapt(this.dolly, (adapter) => {
            adapter.transition.debounce = 0
            adapter.transition.delay = 0
            adapter.transition.duration = 4
            adapter.transition.easing = easing.easeInOut

            adapter.behavior(() => {
                const viewpointMetrics = metrics(this.viewTarget)
                adapter.bounds.target?.setFromCenterAndSize(viewpointMetrics.worldPosition, V_000)
                adapter.orientation.target = viewpointMetrics.worldOrientationInverse
            })
            
            // set the initial state
            this.dolly.position.set(0,-50,0)
        })

        adapt(this.camera, (adapter) => {
            adapter.transition.easing = easing.easeInOut
            adapter.behavior(() => {
                if (!this.xrPresenting) {
                    const viewpointMetrics = metrics(this.viewTarget)
                    spherical.setWithDegrees(-this.pointer.x * 90, -this.pointer.y * 90, this.cameraMovement.current)
                    spherical.toCartesianPosition(this.camera.position)
                    this.camera.updateMatrixWorld()
                    this.camera.lookAt( viewpointMetrics.worldPosition )
                }
            }) // disable memoization 
        })
        
        let scrollFactor = 0

        const spherical = new SphericalCoordinate

        this.onUpdate = (event:UpdateEvent) => {

            if (!this.xrPresenting) {
                scrollFactor = window.scrollY / window.innerHeight
                this.cameraMovement.target = 15

                this.viewTarget = this.roomViewTarget
                if (scrollFactor < 0.03) {
                    this.viewTarget = this.belowRoomViewTarget
                    this.cameraMovement.target = 1
                } else if (scrollFactor > 0.1) {
                    // nextTarget = demos[scrollFactor]
                }
            }

            system.viewFrustum.setFromPerspectiveProjectionMatrix(this.camera.projectionMatrix as any)
            system.update(event.deltaTime, event.elapsedTime)
        }
    
        this.onEnterXR = (event:EnterXREvent) => {
            // this.treadmill.enterXR(event)
        }
    
        this.onExitXR = (event:ExitXREvent) => {
            // this.ui.data.xrMode = false
        }

        // const cameraMovement = this.scene.transitioner.add({
        //     target: 1,
        //     duration: 2,
        //     easing: easing.easeIn
        // })
        // let cameraDollyDistance = this.scene.transitioner.add({
        //     target: 2, 
        //     duration: 0,
        // })


        // this.scene.transitioner.active = true
        // this.target.transitioner.active = true
        // this.target.transitioner.easing = easing.easeIn

        this.scene.add(this.belowRoomViewTarget)
        this.belowRoomViewTarget.position.y = 0
        this.belowRoomViewTarget.rotateX(Math.PI/2*0.99)
        this.belowRoomViewTarget.add(new THREE.AxesHelper(2))

        this.room.add(this.roomViewTarget)
        this.roomViewTarget.rotateY(Math.PI/4)
        // this.roomTarget.layout.forceBoundingContext = true
        // this.roomTarget.layout.inner.setFromCenterAndSize(V_000, V_000)
        this.roomViewTarget.add(new THREE.AxesHelper)

        // add demos
        let globalAdaptivityDemo = new GlobalAdaptivityDemo()
        this.room.add(globalAdaptivityDemo.container)
        this.demos.push(globalAdaptivityDemo)

        // this.renderer.gammaInput = true
        // this.renderer.gammaOutput = true
        this.renderer.gammaFactor = 2.2
    }

    loadSky() {
		const path = `${this.publicUrl}static/textures/skies/space5/`
		const format = ".jpg";
		const urls = [
			path + "px" + format, path + "nx" + format,
			path + "py" + format, path + "ny" + format,
			path + "pz" + format, path + "nz" + format
		]
        this.sky = this.cubeTextureLoader.load(urls, (textureCube) => {
            this.scene.background = textureCube
        })
    }

    loadRoom() {
        this.scene.add(this.room)

        // this.room.layout.innerAutoCompute = true
        // this.room.layout.absolute.min.set(NaN, 0, NaN) // floor at 0
        // this.room.layout.absolute.max.set(NaN, 6, NaN) // ceiling at 6 meters
        // this.room.layout.fit = 'fill' // contain mesh within layout bounds (default behavior)

        this.gltfLoader.load(`${this.publicUrl}static/models/stylized_room/scene.gltf`, (gltf) => {
            const geometries = [] as THREE.BufferGeometry[]
            gltf.scene.scale.setScalar(0.01)
            gltf.scene.position.y = 8
            gltf.scene.updateMatrixWorld()
            gltf.scene.traverse( ( child : THREE.Object3D ) => {
                const childMesh = child as THREE.Mesh
                if ( childMesh.isMesh ) {
                    childMesh.geometry.applyMatrix4(childMesh.matrixWorld)
                    geometries.push(childMesh.geometry as THREE.BufferGeometry)
                }
            })

            const roomGeo = BufferGeometryUtils.mergeBufferGeometries(geometries)
            // const roomMat = new THREE.MeshPhysicalMaterial( {
            //     color: 0xffffff,
            //     envMap: this.sky,
            //     envMapIntensity: 100,
            //     roughness: 0.1,
            //     reflectivity: 0.3,
            //     metalness: 0.2,
            //     polygonOffset: true,
            //     polygonOffsetFactor: 1,
            //     polygonOffsetUnits: 1,
            //     transparent: true,
            //     opacity: 0.6,
            // })
            const roomMat = new THREE.MeshBasicMaterial( {
                color: 0xcccccc,
                // envMap: this.sky,
                // reflectivity: 0.99,
                // refractionRatio: 0.1,
                polygonOffset: true,
                polygonOffsetFactor: 1,
                polygonOffsetUnits: 1,
                // transparent: true,
                // opacity: 0.8,
            })
            this.room.geometry = roomGeo
            this.room.material = roomMat

            const edgeGeometry = new THREE.EdgesGeometry( roomGeo, 15 )
            const edgeMaterial = new THREE.LineBasicMaterial({ 
                color: 0x151515,
                linewidth: 2
            })
            const roomLines = new THREE.LineSegments( edgeGeometry, edgeMaterial )
            // roomLines.layout.forceBoundingContext = true
            this.room.add( roomLines )

            // this.room.add(new LayoutHelper)

            // this.surfaceWallA.layout.relative.setFromCenterAndSize(V_000, V_111)

            adapt(this.room, ({layout}) => {
                layout(layout => {
                    layout.bounds.bottom = {meters:0}
                    layout.bounds.top = {meters:6}
                    layout.aspect = 'preserve-3d'
                })
            })
        })
    }

    setupLights() {
        const ambientLight = new THREE.AmbientLight(0xaaaaaa, 1)
        const directionalLight = new THREE.DirectionalLight(0x88bbff, 1)
        directionalLight.position.set(1, 1, 2)
        directionalLight.target.position.copy(this.scene.position)
        this.scene.add(directionalLight)
        this.scene.add(ambientLight)
    }
}

const app = new DemoApp()

app.start().catch((e: Error) => {
    console.error(e)
    alert(e)
})

Object.assign( window, { THREE, app } );
