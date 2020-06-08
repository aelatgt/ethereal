import AppBase, {UpdateEvent, ExitXREvent, EnterXREvent} from './AppBase'
import * as THREE from 'three'
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader'
import {BufferGeometryUtils} from 'three/examples/jsm/utils/BufferGeometryUtils'
// import {vectors, vectors2, SpatialMetrics, BehaviorManager, easing, V_000, V_111, LayoutHelper} from 'old-ethereal/src'
import { GlobalAdaptivityDemo } from './demos/GlobalAdaptivityDemo'
import { DemoBase } from './demos/DemoBase'
// import { EtherealSystem, TrackedNodeState, Node3D, Box3D } from '@etherealjs/core'
import { system, adapt, metrics, easing, SphericalCoordinate } from 'ethereal'

export class DemoApp extends AppBase {
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

    viewpoint = new THREE.Object3D()
    belowRoomViewpoint = new THREE.Object3D()
    roomViewpoint = new THREE.Object3D()

    constructor() {
        super()

        system.viewNode = this.camera

        // setup scene
        this.loadSky()
        this.loadRoom()
        this.setupLights()
        this.camera.rotateZ(Math.PI)
        this.scene.add(this.viewpoint)

        // const cameraMovement = transitionable(1, {
        //     duration:2, 
        //     easing: easing.easeIn
        // })
        
        // const dollyDistance = transitionable(2, {duration:0})

        let cameraMovement = 1
        let dollyDistance = 2
        
        adapt(this.dolly, ({transition, layout, node}) => {
            transition.debounce = 0
            transition.delay = 0
            transition.easing = easing.easeInOut
            // add a layout to manage pose
            layout(layout => {
                const viewpointMetrics = metrics(this.viewpoint)
                this.viewpoint.localToWorld(node.position.set(0,0,dollyDistance))
                node.updateWorldMatrix(true, false)
                node.lookAt(viewpointMetrics.worldPosition as any)
                layout.setFromNodeState(node)
            }) // memoization enabled by default, tracking viewpoint metrics
            // set the initial states
            node.position.set(0,-50,0)
        })

        adapt(this.camera, (adapter) => {
            adapter.transition.easing = easing.easeInOut
            // disable this adapter when not presenting 
            adapter.layout((layout) => {
                adapter.enabled = !!this.xrPresenting
                if (adapter.enabled) {
                    const viewpointMetrics = metrics(this.viewpoint)
                    spherical.setWithDegrees(-this.pointer.x * 90, -this.pointer.y * 90, cameraMovement)
                    spherical.toCartesianPosition(this.camera.position as any)
                    this.camera.updateMatrixWorld()
                    this.camera.lookAt( viewpointMetrics.worldPosition as any)
                    layout.setFromNodeState(this.camera)
                }
            }, false) // disable memoization since `xrPresenting` is not a tracked property
        })
        
        let scrollFactor = 0

        const spherical = new SphericalCoordinate

        this.onUpdate = (event:UpdateEvent) => {

            if (!this.xrPresenting) {
                scrollFactor = window.scrollY / window.innerHeight
                dollyDistance = 2
                cameraMovement = 15

                this.viewpoint = this.roomViewpoint
                if (scrollFactor < 0.03) {
                    this.viewpoint = this.belowRoomViewpoint
                    dollyDistance = 15
                    cameraMovement = 1
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

        this.scene.add(this.belowRoomViewpoint)
        this.belowRoomViewpoint.position.y = 0
        this.belowRoomViewpoint.rotateX(Math.PI/2*0.99)
        this.belowRoomViewpoint.add(new THREE.AxesHelper(2))

        this.room.add(this.roomViewpoint)
        this.roomViewpoint.rotateY(Math.PI/4)
        // this.roomTarget.layout.forceBoundingContext = true
        // this.roomTarget.layout.inner.setFromCenterAndSize(V_000, V_000)
        this.roomViewpoint.add(new THREE.AxesHelper)

        // add demos
        let globalAdaptivityDemo = new GlobalAdaptivityDemo()
        this.room.add(globalAdaptivityDemo.container)
        this.demos.push(globalAdaptivityDemo)

        // this.renderer.gammaInput = true
        // this.renderer.gammaOutput = true
        this.renderer.gammaFactor = 2.2
    }

    loadSky() {
		const path = "textures/skies/space5/"
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

        this.gltfLoader.load('/models/stylized_room/scene.gltf', (gltf) => {
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
