
import * as THREE from 'three'
import {WebLayer3D} from 'ethereal'

export interface EnterXREvent {
    type: 'enterxr'
}

export interface ExitXREvent {
    type: 'exitxr'
}

export interface UpdateEvent {
    type: 'update'
    deltaTime: number,
    elapsedTime:number
}

export interface AppConfig {
    onUpdate: (event: UpdateEvent) => void
    onEnterXR: (event: EnterXREvent) => void
    onExitXR: (event: ExitXREvent) => void
}

// let lastConnectedVRDisplay: VRDisplay
// window.addEventListener('vrdisplayconnect', (evt) => {
//     lastConnectedVRDisplay = (evt as VRDisplayEvent).display;
// }, false)

export default class AppBase {

    scene = new THREE.Scene
    camera = new THREE.PerspectiveCamera

    renderer = new THREE.WebGLRenderer(<any>{
        desynchronized: true,
        antialias: false,
        alpha: true,
    })

    clock = new THREE.Clock

    pointer = new THREE.Vector2()
    raycaster = new THREE.Raycaster()
    mouseRay = [this.raycaster.ray]
    immersiveRays = new Set<THREE.Object3D>()

    // a map of XRCoordinateSystem instances and their Object3D proxies to be updated each frame
    xrObjects = new Map<any, THREE.Object3D>() // XRCoordinateSystem -> Three.js Object3D Map

    constructor(private _config: AppConfig) {
        this.scene.add(this.camera)

        const renderer = this.renderer
        document.documentElement.append(this.renderer.domElement)
        renderer.domElement.style.position = 'fixed'
        renderer.domElement.style.width = '100%'
        renderer.domElement.style.height ='100%'
        renderer.domElement.style.top = '0'
        renderer.domElement.addEventListener('mousemove', onMouseMove)
        renderer.domElement.addEventListener('touchmove', onTouchMove, { passive: false })
        renderer.domElement.addEventListener('touchstart', onTouchStart, { passive: false})
        renderer.domElement.addEventListener('touchend', onTouchEnd, { passive: false})
        renderer.domElement.addEventListener('click', onClick, false)
        renderer.setAnimationLoop(this.onAnimate)

        window.addEventListener('vrdisplaypresentchange', (evt) => {
            setTimeout(() => { if (!this.xrPresenting) this._exitXR(), 10 })
        }, false)

        document.documentElement.style.width = '100%'
        document.documentElement.style.height = '100%'
        const updateRay = (x:number, y:number) => {
            this.pointer.x = ((x + window.pageXOffset) / document.documentElement.offsetWidth) * 2 - 1
            this.pointer.y = (-(y + window.pageYOffset) / document.documentElement.offsetHeight) * 2 + 1
        }
        
        function onMouseMove(event:MouseEvent) {
            updateRay(event.clientX, event.clientY)
        }
        
        function onClick(event:MouseEvent) {
            redirectEvent(event)
        }
        
        function onTouchMove(event:TouchEvent) {
            event.preventDefault() // disable scrolling
            updateRay(event.touches[0].clientX, event.touches[0].clientY)
        }
        
        function onTouchStart(event:TouchEvent) {
            updateRay(event.touches[0].clientX, event.touches[0].clientY)
            redirectEvent(event)
        }

        function onTouchEnd(event:TouchEvent) {
            setTimeout(() => updateRay(-Infinity,-Infinity), 10)
        }
        
        // redirect DOM events from the canvas, to the 3D scene,
        // to the appropriate child Web3DLayer, and finally (back) to the
        // DOM to dispatch an event on the intended DOM target
        const redirectEvent = (evt:any) => {
            for (const layer of this.webLayers) {
                const hit = layer.hitTest(this.raycaster.ray)
                if (hit) {
                    hit.target.dispatchEvent(new evt.constructor(evt.type, evt))
                    hit.target.focus()
                    console.log('hit', hit.target, hit.layer)
                }
            }
        }

        const addController = (id:number) => {
            const meshColorOff = 0xDB3236 //  Red.
            const meshColorOn  = 0xF4C20D //  Yellow.
            const controllerMaterial = new THREE.MeshBasicMaterial({
                color: meshColorOff
            })
            const controller = renderer.xr.getController(id)
            this.scene.add(controller)
            controller.addEventListener('selectstart',  ( event:any ) => {
                controllerMaterial.color.setHex( meshColorOn )
                onSelect()
            })
            controller.addEventListener('selectend',  ( event:any ) => {
                controllerMaterial.color.setHex( meshColorOff )
            })
            controller.add(new THREE.AxesHelper(1))
            this.immersiveRays.add(controller)
            const rayPosition = new THREE.Vector3
            const rayDirection = new THREE.Vector3
            const onSelect = () => {
                controller.getWorldPosition(rayPosition)
                controller.getWorldDirection(rayDirection)
                this.raycaster.ray.set(rayPosition, rayDirection)
                for (const layer of this.webLayers) {
                    const hit = layer.hitTest(this.raycaster.ray)
                    if (hit) {
                        hit.target.click()
                        hit.target.focus()
                    }
                }
            }
        }

        addController(0)
        addController(1)
        

        // this.renderer.setAnimationLoop(this.onAnimate)

        // const box = new THREE.Mesh(new THREE.BoxGeometry(0.1,0.1,0.1), new THREE.MeshNormalMaterial)
        // this.scene.add(box)
        
        // setup VRController
        // window.addEventListener( 'vr controller connected', ( event:any ) => {
        //     const controller = event.detail
        //     this.scene.add( controller )
        //     controller.standingMatrix = renderer.xr.getController
        //     controller.head = this.camera
        //     var
        //     meshColorOff = 0xDB3236,//  Red.
        //     meshColorOn  = 0xF4C20D,//  Yellow.
        //     controllerMaterial = new THREE.MeshBasicMaterial({
        //         color: meshColorOff
        //     }),
        //     controllerMesh = new THREE.Mesh(
        //         new THREE.CylinderGeometry( 0.005, 0.05, 0.1, 6 ),
        //         controllerMaterial
        //     ),
        //     handleMesh = new THREE.Mesh(
        //         new THREE.BoxGeometry( 0.03, 0.1, 0.03 ),
        //         controllerMaterial
        //     )
        //     controllerMaterial.flatShading = true
        //     controllerMesh.rotation.x = -Math.PI / 2
        //     handleMesh.position.y = -0.05
        //     controllerMesh.add( handleMesh )
        //     controller.add( controllerMesh )

        //     const rayGeometry = new THREE.CylinderGeometry()
        //     const rayMesh = new THREE.Mesh(rayGeometry)
        //     rayMesh.position.set(0,0,-50)
        //     rayMesh.scale.set(0.002, 100, 0.002)
        //     rayMesh.quaternion.setFromAxisAngle(V_100, - Math.PI / 2)
        //     controller.add(rayMesh)

        //     const ray = new THREE.Object3D()
        //     controller.add(ray)
        //     ray.quaternion.setFromAxisAngle(V_100, Math.PI)
        //     // ray.add(new THREE.AxesHelper(1))

        //     this.immersiveRays.add(ray)
        //     controller.addEventListener( 'disconnected', ( event:any ) => {
        //         controller.parent.remove( controller )
        //         this.immersiveRays.delete(ray)
        //     })

        //     const rayPosition = new THREE.Vector3
        //     const rayDirection = new THREE.Vector3

        //     const onSelect = () => {
        //         ray.getWorldPosition(rayPosition)
        //         ray.getWorldDirection(rayDirection)
        //         this.raycaster.ray.set(rayPosition, rayDirection)
        //         for (const layer of this.webLayers) {
        //             const hit = layer.hitTest(this.raycaster.ray)
        //             if (hit) {
        //                 hit.target.click()
        //                 hit.target.focus()
        //                 console.log('hit', hit.target, hit.layer)
        //             }
        //         }
        //     }
            
        //     controller.addEventListener( 'primary press began', ( event:any ) => {
        //         controllerMaterial.color.setHex( meshColorOn )
        //         onSelect()
        //     })
        //     controller.addEventListener( 'primary press ended', ( event:any ) => {
        //         controllerMaterial.color.setHex( meshColorOff )
        //     })
        // })
    }

    webLayers = new Set<WebLayer3D>()

    registerWebLayer(layer:WebLayer3D) {
        this.webLayers.add(layer)
    }

    // requestVuforiaTrackableFromDataSet() {}

    getXRObject3D(xrCoordinateSystem: any) {
        let xrObject = this.xrObjects.get(xrCoordinateSystem)
        if (xrObject) { return xrObject }
        xrObject = new THREE.Object3D();
        (xrObject as any).xrCoordinateSystem = xrCoordinateSystem
        this.xrObjects.set(xrCoordinateSystem, xrObject)
        return xrObject
    }

    async start() {
        return this.enterXR().catch(() => {
            console.log('Enter XR failed')
            // document.documentElement.append(this.renderer.domElement)
            // this.renderer.domElement.style.position = 'fixed'
            // this.renderer.domElement.style.width = '100%'
            // this.renderer.domElement.style.height ='100%'
            // this.renderer.domElement.style.top = '0'
            this.renderer.domElement.style.backgroundColor = 'lightgrey'
            window.requestAnimationFrame(this.onAnimate)
        })
    }
    
    onAnimate = () => {
        const canvas = this.renderer.domElement
        if (!this.xrPresenting) this._setSize(canvas.clientWidth, canvas.clientHeight, window.devicePixelRatio)
        const delta = Math.min(this.clock.getDelta(), 1/60)
        this.update(delta)
        for (const layer of this.webLayers) {
            layer.interactionRays = this.interactionSpace === 'world' ? Array.from(this.immersiveRays) : this.mouseRay
        }
        this.renderer.render(this.scene, this.camera)
    }

    private _wasPresenting = false

    update = (deltaTime:number) => {
        
        // try {
        //     // buggy on HoloLens, sometimes crashes :\
        //     VRController.update()
        // } catch {} 
        

        if (this.xrPresenting) {
            // this.renderer.setClearColor(new THREE.Color('blue'))
            this._wasPresenting = true
            const vrCamera = this.renderer.xr.getCamera(this.camera) as THREE.ArrayCamera
            this.camera.matrix.copy(vrCamera.matrix)
            this.camera.matrix.decompose(this.camera.position, this.camera.quaternion, this.camera.scale)
            this.camera.projectionMatrix.copy(vrCamera.projectionMatrix)
            this.camera.projectionMatrixInverse.getInverse(this.camera.projectionMatrix)
            this.camera.updateWorldMatrix(true, true)
        } else {
            this.renderer.setClearColor(new THREE.Color('white'))
            if (this._wasPresenting) {
                this._wasPresenting = false
                this._exitXR()
                this.interactionSpace = 'screen'
            }
            const canvas = this.renderer.domElement
            const width = canvas.clientWidth
            const height = canvas.clientHeight
            const aspect = width / height
            this.camera.aspect = aspect
            this.camera.near = 0.001
            this.camera.far = 100000
            this.camera.updateProjectionMatrix()
        }

        if (this.session) {
            // update xr objects in the scene graph
            for (const xrObject of this.xrObjects.values()) {
                const xrCoordinateSystem = (xrObject as any).xrCoordinateSystem
                const transform = xrCoordinateSystem.getTransformTo(this.frameOfReference)
                if (transform) {
                    xrObject.matrixAutoUpdate = false
                    xrObject.matrix.fromArray(transform)
                    xrObject.updateMatrixWorld(true)
                    if (xrObject.parent !== this.scene) {
                        this.scene.add(xrObject)
                        console.log('added xrObject ' + xrCoordinateSystem.uid || '')
                    }
                } else {
                    if (xrObject.parent) {
                        this.scene.remove(xrObject)
                        console.log('removed xrObject ' + xrCoordinateSystem.uid || '')
                    }
                }
            }
        }

        // emit update event
        this.raycaster.setFromCamera(this.pointer, this.camera)
        this._config!.onUpdate({type: 'update', deltaTime, elapsedTime:this.clock.elapsedTime})
    }

    public interactionSpace = 'screen' as 'screen' | 'world'

    public get xrPresenting() {
        return this.renderer.xr.isPresenting
    }

    // public get device() {
    //     return this.renderer.vr.getDevice && this.renderer.vr.getDevice()
    // }

    public session:any
    public vuforia:any

    public frameOfReference:any

    public async enterXR() {
        if (this.xrPresenting) return

        if (!navigator.xr) throw new Error('WebXR is not supported by this browser')

        // if (!navigator.xr) {
        //     let device = this.renderer.vr.getDevice()!
        //     if (!device && navigator.getVRDisplays) {
        //         device = (await navigator.getVRDisplays())[0]
        //     } 
        //     if (!device) device = lastConnectedVRDisplay

        //     if (device) {
        //         this.renderer.z.setDevice(device)
        //         const success = device.requestPresent([{ source: this.renderer.domElement }])
        //         success.then(() => {
        //             this.interactionSpace = 'world'
        //             this._enterXR()
        //         }).catch(() => {
        //             this._exitXR()
        //         })
        //         return success
        //     } else {
        //         throw new Error('WebXR is not supported by this browser')
        //     }
        // }

        const frameOfRefType = 'local'
        this.renderer.xr.setReferenceSpaceType(frameOfRefType)
        
        const onXRSession = async (session:any) => {

            console.log("GOT XR SESSION")
            if (this.session) this.session.end()
            this.session = session

            // fix current rAF in Argon
            if (navigator.userAgent.includes('Argon')) {
                const rAF = session.requestAnimationFrame 
                session.requestAnimationFrame = (callback:Function) => {
                    rAF.call(session, (frame:any) => {
                        callback(performance.now(), frame)
                    })
                }
            } else {
                this.interactionSpace = 'world'
            }
            
            try {
                (this.renderer.vr as any).setSession(session)
            } catch {}

            this.frameOfReference = await session.requestReferenceSpace(frameOfRefType)
            
            session.addEventListener('end', () => {
                this.session = undefined
                this.frameOfReference = undefined
                ;(this.renderer.vr as any).setSession(null)
                this._exitXR()
            })

            if (session.requestTracker) {
                try {
                    this.vuforia = await session.requestTracker('ARGON_vuforia', {encryptedLicenseData: VUFORIA_LICENSE_DATA})
                } catch {}
            }
            
            this._enterXR()
        }

        if (navigator.xr.requestSession) {
            var sessionInit = { optionalFeatures: [ 'local-floor', 'bounded-floor' ] };
            const arSupported = await navigator.xr.isSessionSupported('immersive-ar', sessionInit)
            if (arSupported) {
                console.log("AR supported, trying AR")
                return navigator.xr.requestSession('immersive-ar', sessionInit).then(onXRSession)
            }
            console.log("AR not supported, trying VR")
            return navigator.xr.requestSession('immersive-vr', sessionInit).then(onXRSession)
        }

        // return navigator.xr.requestDevice().then((device: any) => {
        //     return (device.requestSession({immersive: true, type: 'augmentation'})).then(onXRSession)
        // })
    }

    private _enterXR() {
        this.renderer.xr.enabled = true
        this._config.onEnterXR({type:'enterxr'})
    }

    private _exitXR() {
        this._config.onExitXR({type:'exitxr'})
        this.camera.position.set(0,0,0)
        this.camera.quaternion.set(0,0,0,1)
        this.interactionSpace = 'screen'
        this.renderer.xr.enabled = false
    }

    lastResize = -Infinity
    lastWidth = window.innerWidth
    lastHeight = window.innerHeight
    timeSinceLastResize = Infinity

    private _setSize(width:number, height:number, pixelRatio=1) {
        if (width !== this.lastWidth || height !== this.lastHeight) {
            this.lastWidth = width
            this.lastHeight = height
            this.lastResize = performance.now()
        }
        this.timeSinceLastResize = performance.now() - this.lastResize
        if (this.timeSinceLastResize > 2000) {
            this.renderer.setSize(width, height, false)
            this.renderer.setPixelRatio(pixelRatio)
        } 
    }
}

declare global {
    interface Navigator {
        xr: any
    }
    const XRWebGLLayer: any
}

const VUFORIA_LICENSE_DATA =
`-----BEGIN PGP MESSAGE-----
Version: OpenPGP.js v2.3.2
Comment: http://openpgpjs.org

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
TDne/ON+Rnj/EKokFOU=
=kmoQ
-----END PGP MESSAGE-----
`
