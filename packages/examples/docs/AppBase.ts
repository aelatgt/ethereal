import * as THREE from 'three'
import { WebLayer3D } from 'ethereal'
import Stats from 'stats.js'
import { BlendFunction, BloomEffect, SMAAEffect, SMAAPreset, SSAOEffect, EffectComposer, EffectPass, NormalPass, RenderPass } from "postprocessing"

export interface EnterXREvent {
    type: 'enterxr'
}

export interface ExitXREvent {
    type: 'exitxr'
}

export interface UpdateEvent {
    type: 'update'
    deltaTime: number,
    elapsedTime: number
}

let lastConnectedVRDisplay: VRDisplay
window.addEventListener('vrdisplayconnect', (evt) => {
    lastConnectedVRDisplay = (evt as VRDisplayEvent).display;
}, false)

var stats = new Stats();
stats.showPanel( 1 ); // 0: fps, 1: ms, 2: mb, 3+: custom
document.body.appendChild( stats.dom );

export default class AppBase {

    scene = new THREE.Scene
    dolly = new THREE.Object3D
    camera = new THREE.PerspectiveCamera

    renderer = new THREE.WebGLRenderer({
        antialias: false,
        alpha: true,
        logarithmicDepthBuffer: true
    })

    clock = new THREE.Clock

    imageLoader = new THREE.ImageLoader()

    composer = new EffectComposer(this.renderer) 

    renderPass = new RenderPass(this.scene, this.camera)
    normalPass = new NormalPass(this.scene, this.camera, {
		resolutionScale: 1
    })

    areaImage = this.imageLoader.load(SMAAEffect.areaImageDataURL)
    searchImage = this.imageLoader.load(SMAAEffect.searchImageDataURL)
    smaaEffect = new SMAAEffect(this.searchImage, this.areaImage, SMAAPreset.ULTRA)

    ssaoEffect = new SSAOEffect(this.camera, this.normalPass.renderTarget.texture, {
		blendFunction: BlendFunction.MULTIPLY,
		//blendFunction: BlendFunction.ALPHA,
		samples: 11,
		rings: 4,
		distanceThreshold: 0.0,
		distanceFalloff: 1.0,
		rangeThreshold: 0.0,
		rangeFalloff: 1.0,
		luminanceInfluence: 0.2,
		radius: 18.0,
		scale: 0.6,
		bias: 0.8
    })
    
    bloomEffect = new BloomEffect()
    
    // effectPass = new EffectPass(this.camera, this.smaaEffect)
    effectPass = new EffectPass(this.camera, this.smaaEffect, this.ssaoEffect)

    pointer = new THREE.Vector2()
    raycaster = new THREE.Raycaster()

    // a map of XRCoordinateSystem instances and their Object3D proxies to be updated each frame
    xrObjects = new Map<any, THREE.Object3D>() // XRCoordinateSystem -> Three.js Object3D Map

    loaded = new Promise((resolve) => {
        THREE.DefaultLoadingManager.onLoad = () => {
            resolve()
        }
    })

    // lastFrameTime = -1
    constructor() {

        this.scene.add(this.dolly)
        this.dolly.add(this.camera)

        const renderer = this.renderer
        document.documentElement.append(this.renderer.domElement)
        renderer.domElement.style.position = 'fixed'
        renderer.domElement.style.zIndex = '-1'
        renderer.domElement.style.width = '100%'
        renderer.domElement.style.height ='100%'
        renderer.domElement.style.top = '0'

        document.documentElement.addEventListener('mousemove', onMouseMove)
        document.documentElement.addEventListener('touchmove', onTouchMove, { passive: false })
        document.documentElement.addEventListener('touchstart', onTouchStart, { passive: false})
        document.documentElement.addEventListener('touchend', onTouchEnd, { passive: false})
        document.documentElement.addEventListener('click', onClick, false)

        window.addEventListener('vrdisplaypresentchange', (evt) => {
            if (!this.xrPresenting) this._exitXR()
        }, false)

        document.documentElement.style.width = '100%'
        document.documentElement.style.height = '100%'
        const updateRay = (x:number, y:number) => {
            this.pointer.x = ( x / document.documentElement.offsetWidth) * 2 - 1
            this.pointer.y = (-y / document.documentElement.offsetHeight) * 2 + 1
        }
        
        function onMouseMove(event:MouseEvent) {
            updateRay(event.clientX, event.clientY)
        }
        
        function onClick(event:MouseEvent) {
            redirectEvent(event)
        }
        
        function onTouchMove(event:TouchEvent) {
            if (event.touches.length > 1) {
                event.preventDefault() // disable scrolling
                updateRay(event.touches[0].clientX, event.touches[0].clientY)
            }
        }
        
        function onTouchStart(event:TouchEvent) {
            if (event.touches.length > 1) {
                updateRay(event.touches[0].clientX, event.touches[0].clientY)
                redirectEvent(event)
            }
        }

        function onTouchEnd(event:TouchEvent) {
            // setTimeout(() => updateRay(-Infinity,-Infinity), 10)
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
    }

    webLayers = new Set<WebLayer3D>()

    registerWebLayer(layer:WebLayer3D) {
        layer.interactionRays = [this.raycaster.ray]
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
        await this.loaded

        // just render:
        this.renderPass.renderToScreen = true
        this.composer.addPass(this.renderPass)

        // render with effects:
        // this.composer.addPass(this.renderPass)
        // this.composer.addPass(this.normalPass)
        // this.effectPass.renderToScreen = true
        // this.composer.addPass(this.effectPass)

        this.renderer.setAnimationLoop(this.animate)
        
        return this.enterXR().then(() => {
            document.documentElement.style.backgroundColor = 'transparent'
        }).catch(() => {
            // document.documentElement.append(this.renderer.domElement)
            // this.renderer.domElement.style.position = 'fixed'
            // this.renderer.domElement.style.width = '100%'
            // this.renderer.domElement.style.height ='100%'
            // this.renderer.domElement.style.top = '0'
        })
    }
    
    animate = () => {
        stats.begin()
        if (!this.xrPresenting) {
            const canvas = this.renderer.domElement
            this._setSize(canvas.clientWidth, canvas.clientHeight, window.devicePixelRatio * 0.6)
        }
        const delta = Math.min(this.clock.getDelta(), 1/60)
        this.update(delta)
        // this.renderer.render(this.scene, this.camera)
        this.composer.render(delta)
        stats.end()
    }

    private _wasPresenting = false

    update = (deltaTime:number) => {

        if (this.xrPresenting) {
            this._wasPresenting = true
            const vrCamera = this.renderer.xr.getCamera(this.camera) as THREE.ArrayCamera  
            const firstCamera = vrCamera.cameras[0]         
            this.camera.matrix.identity()
            this.camera.applyMatrix4(firstCamera.matrix)
            this.camera.projectionMatrix.copy(firstCamera.projectionMatrix)
            ;(this.camera as any).projectionMatrixInverse.getInverse(this.camera.projectionMatrix)
            this.camera.updateMatrixWorld(true)
        } else {
            if (this._wasPresenting) {
                this._wasPresenting = false
                this._exitXR()
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
        // const now = performance.now()
        // const deltaTime = Math.min(Math.max((now - this.lastFrameTime) / 1000, 0.001), 1 / 60)
        // this.lastFrameTime = now
        this.raycaster.setFromCamera(this.pointer, this.camera)
        this.onUpdate({type: 'update', deltaTime, elapsedTime:this.clock.elapsedTime})
    }

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

        // if (!navigator.xr) {
        //     let device = this.renderer.vr.getDevice()!
        //     if (!device && navigator.getVRDisplays) {
        //         device = (await navigator.getVRDisplays())[0]
        //     } 
        //     if (!device) device = lastConnectedVRDisplay

        //     if (device) {
        //         this.renderer.vr.setDevice(device)
        //         const success = device.requestPresent([{ source: this.renderer.domElement }])
        //         success.then(() => {
        //             this._enterXR()
        //         }).catch(() => {
        //             this._exitXR()
        //         })
        //         return success
        //     } else {
        //         throw new Error('WebXR is not supported by this browser')
        //     }
        // }

        const frameOfRefType = 'eye-level'
        this.renderer.xr.setReferenceSpaceType(frameOfRefType)
        // ;(this.renderer.vr as any).setFrameOfReferenceType(frameOfRefType)

        const onXRSession = async (session:any) => {

            if (this.session) this.session.end()
            this.session = session
            
            this.renderer.xr.setSession(session)

            this.frameOfReference = await session.requestFrameOfReference(frameOfRefType)
            
            session.addEventListener('end', () => {
                this.session = undefined
                this.frameOfReference = undefined
                ;(this.renderer.vr as any).setSession(null)
                this._exitXR()
            })

            // if (session.requestTracker) {
            //     try {
            //         this.vuforia = await session.requestTracker('ARGON_vuforia', {encryptedLicenseData: VUFORIA_LICENSE_DATA})
            //     } catch {}
            // }
            
            this._enterXR()
        }

        // if (navigator.xr.requestSession) {
        //     return navigator.xr.requestSession('immersive-ar').then(onXRSession)
        // }

        return navigator.xr.requestDevice().then((device: any) => {
            return (device.requestSession({immersive: true, type: 'augmentation'})).then(onXRSession)
        })
    }

    private _enterXR() {
        this.renderer.xr.enabled = true
        this.onEnterXR({type:'enterxr'})
    }

    private _exitXR() {
        this.renderer.xr.enabled = false
        this.onExitXR({type:'exitxr'})
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
            this.composer.setSize(width, height, false)
            this.renderer.setPixelRatio(pixelRatio)
            this.lastResize = -Infinity
        }
    }

    onUpdate = (event: UpdateEvent) => {}
    onEnterXR = (event: EnterXREvent) => {}
    onExitXR = (event: ExitXREvent) => {}
}

// declare global {
//     interface Navigator {
//         xr: any
//     }
//     const XRWebGLLayer: any
// }