import * as THREE from 'three'
import * as ethereal from 'ethereal'
import {Q_IDENTITY, V_111, WebLayer3D, V_00} from 'ethereal'
import {createApp} from 'vue'

import {App} from '../main'
import {UpdateEvent} from '../App'

import {createPrideUI} from './PrideUI'
import {createLabelUI} from './LabelUI'
import { MeshPhongMaterial, MeshBasicMaterial, Vector3 } from 'three'
import { Quaternion } from 'cannon'

export default class UI {
    augmentations: {[name: string]: THREE.Object3D} = {}

    pride = createPrideUI()
    state = this.pride.state
    main = this.app.createWebLayerTree( this.pride.vue.$el, {
        onLayerCreate: (layer) => {
            const adapter = this.app.system.getAdapter(layer)
            adapter.opacity.enabled = true
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

    // snubberBox = new THREE.BoxHelper(this.app.treadmill.snubber)

    constructor(private app: App) {

        const setupPrideLayer = () => {
            const adapter = this.app.system.getAdapter(this.main)

            const immersiveLayout = adapter.createLayout()
                .bounds({
                    center: {x:0, y: 1.5, z:-1}
                })
                .orientation(Q_IDENTITY)
                .scale(new Vector3(0.5,0.5,0.5))

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
                this.state.worldInteraction = this.app.interactionSpace === 'world'
                if (this.app.interactionSpace === 'world') {
                    adapter.layouts = [immersiveLayout]
                } else if (this.app.interactionSpace === 'screen') {
                    adapter.layouts = [flatLayout]
                } else {
                    adapter.layouts = []
                }
            }


            const adapterContent = this.app.system.getAdapter(this.main.contentMesh)
            adapterContent.onUpdate = () => {
                if (this.state.immersiveMode) {
                    this.main.contentMesh.position.set(0,0,-1)
                    adapterContent.opacity.target = 0
                } else {
                    this.main.contentMesh.position.set(0,0,0)
                    adapterContent.opacity.target = 1
                }
            }

            setTimeout(() => (this.video.element as HTMLVideoElement).play(), 5000)
        }

        const setupTreadmillPoster = () => {
            const poster = this.app.treadmill.poster
            poster.material.transparent = true
            this.app.scene.add(poster)
            const adapter = app.system.getAdapter(poster) 
            adapter.onUpdate = () => {
                if (this.state.immersiveMode) {
                    const screenBasedInteraction = this.app.interactionSpace === 'screen'
                    poster.position.set(0,screenBasedInteraction ? -0.8 : 0.5,screenBasedInteraction ? -2:-1)
                    adapter.opacity.target = 1
                } else {
                    poster.position.set(0,0,-5)
                    adapter.opacity.target = 0
                }
            }
        }

        const setupSnubberModel = () => { 
            const snubber = this.app.treadmill.snubber
            this.app.scene.add(snubber)
            // this.app.scene.add(this.snubberBox)

            const adapter = app.system.getAdapter(snubber)
            adapter.transition.maxWait = 10
            
            const flatLayout = adapter.createLayout()
                .poseRelativeTo(this.model)
                .orientation(Q_IDENTITY)//{swingRange:{x:'10deg',y:'10deg'}, twistRange:'0deg'})
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

                this.updateAugmentations()
            }

            adapter.onPostUpdate = () => {
                // this.snubberBox.update()
            }
        }

        const setupContentLayer = () => {
            const adapter = this.app.system.getAdapter(this.content)
            const immersiveLayout = adapter.createLayout()
                .poseRelativeTo(this.app.treadmill.snubber)
                .keepAspect('xyz')
                .orientation(Q_IDENTITY)
                .bounds({
                    back: '0m',
                    top: '0m',
                    size: {x:'150%'},
                    right: '-100% - 10cm'
                })
                // .visualBounds({
                //     right: '-100% -10px'
                // })
            adapter.onUpdate = () => {
                if (this.state.immersiveMode) adapter.layouts = [immersiveLayout]
                else adapter.layouts = []
                immersiveLayout.orientation(app.system.getState(this.app.treadmill.snubber).viewAlignedOrientation)
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
                    back:'0m',
                    top: '0m',
                    size: {x:'100%'},
                    left: '100% + 10cm'
                })
                // .visualBounds({
                //     left: '100% + 10px'
                // })
            adapter.onUpdate = () => {
                if (this.state.immersiveMode) adapter.layouts = [immersiveLayout]
                else adapter.layouts = []
                layer.update()
            }
        }

        const setupProcedureLayer = () => {
            const layer = this.procedure
            const adapter = this.app.system.getAdapter(layer)
            const immersiveLayout = adapter.createLayout()
                .poseRelativeTo(this.app.treadmill.poster)
                .keepAspect('xyz')
                .orientation(Q_IDENTITY)
                .bounds({
                    back:'100%',
                    size: {x:'100%'},
                    left: {gt: '-20%'},
                    right: {lt: '20%'},
                    bottom: '100% + 20cm'
                })
                // .visualBounds({
                //     bottom: '100% + 20px',
                // })
                .magnetize()
            adapter.onUpdate = () => {
                if (this.state.immersiveMode) adapter.layouts = [immersiveLayout]
                else adapter.layouts = []
                layer.update()
            }
        }

        const setupControlsLayer = () => {
            const layer = this.controls
            const adapter = this.app.system.getAdapter(layer)
            const immersiveLayout = adapter.createLayout()
                .poseRelativeTo(this.content)
                .keepAspect('xyz')
                .orientation(Q_IDENTITY)
                .bounds({
                    back: '0m',
                    center: {x: '0m'},
                    top: '-100% - 10cm',
                    size: {x: '100%'}
                })
                // .visualBounds({
                //     top: '- 100 % - 10px',
                //     size: {x: '100%'}
                // })
            const attachedLayout = adapter.createLayout()
                .keepAspect('xyz')
                .orientation(new Quaternion(1,0,0,1))
                .bounds({
                    center: {x:0,y:0,z:0}
                })
                // .visualBounds({
                //     top: '-2vdeg',
                //     size: {x: '50vdeg'}
                // })
            adapter.onUpdate = () => {
                // if (app.controllers.left?.grip && this.state.immersiveMode) {
                //     attachedLayout.poseRelativeTo(app.controllers.left.grip)
                //     adapter.layouts = [attachedLayout]
                // } else 
                if (this.state.immersiveMode) {
                    adapter.layouts = [immersiveLayout]
                } else {
                    adapter.layouts = []
                }
                layer.update()
            }
        }
        
        setupPrideLayer()
        setupContentLayer()
        setupTreadmillPoster()
        setupSnubberModel()
        setupMediaLayer()
        setupProcedureLayer()
        setupControlsLayer()

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

        for (const name in this.augmentations) {
            const augmentation = this.augmentations[name]
            augmentation.scale.setScalar(0.00001)
        }

        for (const name in prideObjects) {
            const prideObject = prideObjects[name]
            const stringifiedObject = JSON.stringify(prideObject)
            let augmentation = this.augmentations[name]
            if (!augmentation || augmentation.userData.pride !== stringifiedObject) {
                delete this.augmentations[name]
                switch (prideObject.type) {
                    case 'box':
                        const size = prideObject.size
                        augmentation = new THREE.Mesh(new THREE.BoxGeometry(
                            size.x * 0.01,
                            size.y * 0.01,
                            size.z * 0.01,
                        ), new MeshBasicMaterial({
                            transparent: true,
                            blending: THREE.AdditiveBlending,
                        }))
                        break
                    case 'sphere':
                        augmentation = new THREE.Mesh(new THREE.SphereGeometry(
                            prideObject.radius * 0.01
                        ), new MeshBasicMaterial({
                            transparent: true,
                            blending: THREE.AdditiveBlending
                        }))
                        break
                    case 'label': 
                        const label = createLabelUI(prideObject.label)
                        augmentation = new WebLayer3D(label.vue.$el)
                        break
                    default:
                        augmentation = new THREE.Object3D
                        break
                }
                augmentation.userData.pride = stringifiedObject
                this.augmentations[name] = augmentation
                // const adapter = this.app.system.getAdapter(augmentation)
                // adapter.bounds.enabled = true
            }
            if (prideObject.position) {
                augmentation.scale.setScalar(1)
                this.app.treadmill.snubber.add(augmentation)
                augmentation.position.copy(prideObject.position as any).multiplyScalar(0.01)

                if (augmentation instanceof WebLayer3D) {
                    augmentation.update()
                } else {
                    // adapter.opacity.target = 0.2
                }
            }
            if (prideObject.rotation) {
                // augmentation.rotation.x = prideObject.rotation.x * THREE.MathUtils.DEG2RAD
                // augmentation.rotation.y = prideObject.rotation.y * THREE.MathUtils.DEG2RAD
                // augmentation.rotation.z = prideObject.rotation.z * THREE.MathUtils.DEG2RAD
            }
            augmentation.updateMatrix()
        }
    }

    update(event: UpdateEvent) {}

}