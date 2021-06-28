import * as THREE from 'three'
import * as ethereal from 'ethereal'
import {Q_IDENTITY, V_111, WebLayer3D} from 'ethereal'
import {createApp} from 'vue'

import {App} from '../main'
import {UpdateEvent} from '../App'

import {createPrideUI} from './PrideUI'
import {createLabelUI} from './LabelUI'

export default class UI {
    augmentations: {[name: string]: THREE.Object3D} = {}

    pride = createPrideUI()
    state = this.pride.state
    main = this.app.createWebLayerTree( this.pride.vue.$el, {
        onLayerCreate: (layer) => {
            const adapter = this.app.system.getAdapter(layer)
            adapter.onUpdate = () => layer.update()
        }
    })
    
    procedure = this.main.querySelector('#procedure')!
    step = this.main.querySelector('#step')!
    instruction = this.main.querySelector('#instruction')!
    content = this.main.querySelector('#content')!
    media = this.main.querySelector('#media')!
    image = this.main.querySelector('#image')!
    video = this.main.querySelector('#video')!
    model = this.main.querySelector('#model')!
    controls = this.main.querySelector('#controls')!
    backButton = this.main.querySelector('#back')!
    doneButton = this.main.querySelector('#done')!
    recordButton = this.main.querySelector('#record')!
    yesButton = this.main.querySelector('#yes')!
    noButton = this.main.querySelector('#no')!
    immersiveButton = this.main.querySelector('#immersive-toggle')!
    
    immersiveAnchor = new THREE.Object3D()

    snubberBox = new THREE.BoxHelper(this.app.treadmill.snubber)

    constructor(private app: App) {
        
        const setupImmersiveAnchor = () => {
            this.app.scene.add(this.immersiveAnchor)
            const adapter = this.app.system.getAdapter(this.immersiveAnchor)
            const center = new THREE.Vector3
            adapter.onUpdate = () => {
                center.set(0, this.app.xrPresenting ? 1.6 : 0, this.app.xrPresenting ? -0.7 : -1.4) // position away from camera
                adapter.bounds.target.setFromCenterAndSize(center, ethereal.V_111)
            }
        }

        const setupPrideLayer = () => {
            const adapter = this.app.system.getAdapter(this.main)

            const immersiveLayout = adapter.createLayout()
                .orientation(Q_IDENTITY)
                .scale(V_111)
                .visualBounds({
                    front: '-10m',
                    center: {x:0,y:0}
                })
                .maximize()

            const flatLayout = adapter.createLayout()
                .poseRelativeTo(this.app.camera) // attach the UI to the camera
                .orientation(Q_IDENTITY)
                .keepAspect()
                .visualBounds({
                    front: '-4m',
                    size: {y: '100 vh'},//, diagonal:{gt:'50vh'}},
                    center: {x: '0 vdeg', y:'0 vdeg'}
                })
                .maximize()


            adapter.onUpdate = () => {
                this.main.options.autoRefresh = (this.app.timeSinceLastResize > 100)
                this.main.update()
                // we only want to move the entire pride UI into an immersive layout
                // on devices that offer an immersive interaction space (e.g., Quest/Hololens)
                if (this.app.interactionSpace === 'world') {
                    adapter.layouts = []
                } else {
                    adapter.layouts = [flatLayout]
                }
            }


            const adapterContent = this.app.system.getAdapter(this.main.contentMesh)
            adapterContent.bounds.enabled = true
            adapterContent.onUpdate = () => {
                if (this.state.immersiveMode) {
                    this.main.contentMesh.position.set(0,0,-1)
                    adapter.opacity.target = 0
                } else {
                    this.main.contentMesh.position.set(0,0,0)
                    adapter.opacity.target = 1
                }
            }

            setTimeout(() => (this.video.element as HTMLVideoElement).play(), 5000)
        }

        const setupTreadmillPoster = () => {
            const poster = this.app.treadmill.poster
            this.app.scene.add(poster)
            const adapter = app.system.getAdapter(poster) 
            adapter.onUpdate = () => {
                if (this.state.immersiveMode) {
                    const screenBasedInteraction = this.app.interactionSpace === 'screen'
                    poster.position.set(0,screenBasedInteraction ? 0 : 0.5,screenBasedInteraction ? -5:-1)
                    adapter.opacity.target = 1
                } else {
                    poster.position.set(0,0,-5)
                    adapter.opacity.target = 0
                }
            }
        }

        const setupSnubberModel = () => { 
            const snubber = this.app.treadmill.snubber
            snubber.position.set(10,-10,-10)
            this.app.scene.add(snubber)
            this.app.scene.add(this.snubberBox)

            const adapter = app.system.getAdapter(snubber)
            adapter.transition.maxWait = 10
            
            const flatLayout = adapter.createLayout()
                .poseRelativeTo(this.model)
                .orientation({swingRange:{x:'10deg',y:'10deg'}, twistRange:'0deg'})
                .keepAspect('xyz')
                .visualBounds({
                    back:       '100%',
                    left:       {gt: '10px'},
                    right:      {lt: '-10px'},
                    bottom:     {gt: '10px'},
                    top:        {lt: '-10px'}
                })
                // .magnetize()
                .maximize({minAreaPercent:0.1})

            // const immersiveFloating = adapter.createLayout()
            //     .orientation(Q_IDENTITY)
            //     .keepAspect('xyz')
            //     .bounds({size: {diagonal: '0.2m'}})
            //     .visualBounds({center: {x: '0', y: '0'}})
            
            const immersiveAnchored = adapter.createLayout() 
                .poseRelativeTo(this.app.treadmill.poster)
                .scale(V_111)
                .bounds({
                    center: this.app.treadmill.snubberAnchorPosition
                })
                // .position(V_000)
                .orientation(Q_IDENTITY)

            const IMMERSIVE = [immersiveAnchored] as any
            const FLAT = [flatLayout]

            adapter.onUpdate = () => {
                
                if (this.state.immersiveMode) {
                    adapter.layouts = IMMERSIVE
                    // adapter.parentNode = this.app.scene
                    // if (this.treadmill.treadmillAnchorObject && this.treadmill.treadmillAnchorObject.parent) {
                    //     snubberObject.position.copy(this.treadmill.snubberTargetPosition)
                    //     snubberObject.quaternion.setFromAxisAngle(ethereal.V_001, Math.PI)
                    // } else {
                    //     snubberObject.scale.setScalar(4)
                    //     snubberObject.position.set(0,this.app.xrPresenting ? 1.6 : 0,-1)
                    // }
                } else {
                    adapter.layouts = FLAT
                    // const modelBounds = this.app.system.getState(this.model).visualBounds
                }
            }

            adapter.onPostUpdate = () => {
                this.snubberBox.update()
            }
        }

        const setupContentLayer = () => {
            const adapter = this.app.system.getAdapter(this.content)
            const immersiveLayout = adapter.createLayout()
                .poseRelativeTo(this.app.treadmill.snubber)
                .keepAspect('xyz')
                .orientation(Q_IDENTITY)
                .bounds({
                    back: {gt:'0m'},
                    front: {lt:'0m'},
                    top: {lt:'0m'},
                    bottom: {gt:'-100%'}
                })
                .visualBounds({
                    right: {lt:'-100% -10px'}
                })
                .magnetize()
                .maximize() 
            adapter.onUpdate = () => {
                if (this.state.immersiveMode) adapter.layouts = [immersiveLayout]
                else adapter.layouts = []
                this.content.update()
            }
        }

        const setupMediaLayer = () => {
            const layer = this.media
            const adapter = this.app.system.getAdapter(layer)
            const immersiveLayout = adapter.createLayout()
                .poseRelativeTo(this.app.treadmill.poster)
                .keepAspect('xyz')
                .orientation(Q_IDENTITY)
                .bounds({
                    back:'100%',
                    center: {
                        x: 0,
                        y: 0
                    },
                    size: {
                        x: '100%'
                    }
                })
            adapter.onUpdate = () => {
                if (this.state.immersiveMode) adapter.layouts = [immersiveLayout]
                else adapter.layouts = []
                layer.update()
            }
        }
        
        setupImmersiveAnchor()
        setupPrideLayer()
        setupContentLayer()
        setupTreadmillPoster()
        setupSnubberModel()
        setupMediaLayer()

        this.backButton.element.addEventListener('click', async () => {
            this.state.back()
        })

        this.doneButton.element.addEventListener('click', async () => {
            this.state.done()
        })

        this.recordButton.element.addEventListener('click', async () => {
            this.state.done()
        })

        this.yesButton.element.addEventListener('click', async () => {
            this.state.done('yes')
        })

        this.noButton.element.addEventListener('click', async () => {
            this.state.done('no')
        })

        this.immersiveButton.element.addEventListener('click', async () => {
            this.state.immersiveMode = !this.state.immersiveMode
            if (this.state.immersiveMode) this.app.enterXR()
        })
    }

    updateAugmentations() {
        const prideObjects = this.state.pride.objects
        for (const name in prideObjects) {
            const prideObject = prideObjects[name]
            let augmentation = this.augmentations[name]
            if (!augmentation) {
                switch (prideObject.type) {
                    case 'box':
                        const size = prideObject.size
                        augmentation = new THREE.Mesh(new THREE.BoxGeometry(
                            size.x * 0.01,
                            size.y * 0.01,
                            size.z * 0.01,
                        ))
                        break
                    case 'sphere':
                        augmentation = new THREE.Mesh(new THREE.SphereGeometry(prideObject.radius * 0.01))
                        break
                    case 'label': 
                        const label = createLabelUI(prideObject.text)
                        augmentation = new WebLayer3D(label.vue.$el)
                    default:
                        augmentation = new THREE.Object3D
                        break
                }
                this.augmentations[name] = augmentation
            }
            augmentation.position.copy(prideObject.position as any).multiplyScalar(0.01)
            augmentation.rotation.x = prideObject.rotation.x * THREE.MathUtils.DEG2RAD
            augmentation.rotation.y = prideObject.rotation.y * THREE.MathUtils.DEG2RAD
            augmentation.rotation.z = prideObject.rotation.z * THREE.MathUtils.DEG2RAD
        }
    }

    update(event: UpdateEvent) {}

}