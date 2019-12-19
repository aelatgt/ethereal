import AppBase from './AppBase'
import * as THREE from 'three'
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader'
import {BufferGeometryUtils} from 'three/examples/jsm/utils/BufferGeometryUtils'
import {vectors, vectors2, SpatialMetrics, AdaptivityManager, easing, V_000, V_111} from 'ethereal'
import { GlobalAdaptivityDemo } from './demos/GlobalAdaptivityDemo'
import { DemoBase } from './demos/DemoBase'

export class DemoApp extends AppBase {
    gltfLoader = new GLTFLoader()
    cubeTextureLoader = new THREE.CubeTextureLoader()

    room = new THREE.Mesh()
    sky:THREE.CubeTexture

    demos = [] as DemoBase[]

    plane = new THREE.PlaneGeometry
    surfaceWallA = new THREE.Mesh(this.plane)
    surfaceWallB = new THREE.Mesh(this.plane)
    surfaceWallC = new THREE.Mesh(this.plane)
    surfaceWallD = new THREE.Mesh(this.plane)
    
    surfaceAboveBed = new THREE.Mesh(this.plane)

    target = new THREE.Object3D()
    belowRoomTarget = new THREE.Object3D()
    roomTarget = new THREE.Object3D()

    constructor() {
        super({
            onUpdate: (event) => {
                AdaptivityManager.update(this.scene, this.camera, event.deltaTime)
            },
            onEnterXR: (event) => {
                // this.treadmill.enterXR(event)
            },
            onExitXR: (event) => {
                // this.ui.data.xrMode = false
            }
        })

        // setup scene
        this.loadSky()
        this.loadRoom()
        this.setupLights()
        // this.cameraDolly.transitioner.duration = 2
        this.cameraDolly.transitioner.debounce = 0
        this.cameraDolly.transitioner.delay = 0
        this.cameraDolly.transitioner.easing = easing.easeInOut
        this.cameraDolly.transitioner.matrixLocal.position.start.set(0,-50,0)
        this.camera.rotateZ(Math.PI)
        this.scene.add(this.target)

        let scrollFactor = 0
        const cameraMovement = this.scene.transitioner.add({
            target: 1,
            duration: 2,
            easing: easing.easeIn
        })
        let cameraDollyDistance = this.scene.transitioner.add({
            target: 2, 
            duration: 0,
        })

        AdaptivityManager.addBehavior(this.scene, () => {
            scrollFactor = window.scrollY / window.innerHeight
            cameraDollyDistance.target = 2
            cameraMovement.target = 15

            let nextTarget = this.roomTarget

            if (scrollFactor < 0.03) {
                nextTarget = this.belowRoomTarget
                cameraDollyDistance.target = 15
                cameraMovement.target = 1
            } else if (scrollFactor > 0.1) {
                // nextTarget = demos[scrollFactor]
            }
            
            const target = this.target
            nextTarget.updateWorldMatrix(true, false)
            nextTarget.matrixWorld.decompose(target.position, target.quaternion, target.scale)
        })

        AdaptivityManager.addBehavior(this.cameraDolly, ()=> {
            if (this.xrPresenting) {
                this.cameraDolly.transitioner.active = false
                return
            }

            this.cameraDolly.transitioner.active = true
            AdaptivityManager.ensureUpdate(this.target)

            this.target.localToWorld(this.cameraDolly.position.set(0,0,cameraDollyDistance.current))
            const currentTargetPosition = this.target.getWorldPosition(vectors.get())
            this.cameraDolly.updateWorldMatrix(true, false)
            this.cameraDolly.lookAt(currentTargetPosition)
            // this.camera.position.z += scrollFactor * 0.01
            const sphericalDirection = vectors2.get().set(-this.pointer.x * 90, -this.pointer.y * 90)
            SpatialMetrics.getCartesianForSphericalDirection(sphericalDirection, this.camera.position)
            vectors2.pool(sphericalDirection)
            this.camera.position.multiplyScalar(cameraMovement.current)
            this.camera.updateMatrixWorld()
            this.camera.lookAt(currentTargetPosition)
            vectors.pool(currentTargetPosition)
        })

        this.scene.transitioner.active = true
        this.target.transitioner.active = true
        // this.target.transitioner.easing = easing.easeIn

        this.scene.add(this.belowRoomTarget)
        this.belowRoomTarget.rotateX(Math.PI/2*0.999)

        this.room.add(this.roomTarget)
        this.roomTarget.rotateY(Math.PI/4)

        // add demos
        let globalAdaptivityDemo = new GlobalAdaptivityDemo()
        this.room.add(globalAdaptivityDemo.container)
        this.demos.push(globalAdaptivityDemo)

        this.renderer.gammaInput = true
        this.renderer.gammaOutput = true
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
        this.room.layout.absolute.min.set(NaN, 0, NaN) // floor at 0
        this.room.layout.absolute.max.set(NaN, 6, NaN) // ceiling at 6 meters
        this.room.layout.fit = 'contain' // contain mesh within layout bounds (default behavior)
        this.scene.add(this.room)

        this.gltfLoader.load('/models/stylized_room/scene.gltf', (gltf) => {
            const geometries = [] as THREE.BufferGeometry[]
            gltf.scene.scale.setScalar(0.01)
            gltf.scene.updateMatrixWorld()
            gltf.scene.traverse( ( child : THREE.Mesh ) => {
                if ( child.isMesh ) {
                    child.geometry.applyMatrix(child.matrixWorld)
                    geometries.push(child.geometry as THREE.BufferGeometry)
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
            roomLines.layout.forceBoundsExclusion = true
            this.room.add( roomLines )

            this.surfaceWallA.layout.relative.setFromCenterAndSize(V_000, V_111)
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
