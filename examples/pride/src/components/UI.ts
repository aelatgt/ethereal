import * as THREE from 'three'
import * as ethereal from 'ethereal'
import {Q_IDENTITY, V_111, V_000} from 'ethereal'

import {App} from '../main'
import {UpdateEvent} from '../app'
import Treadmill from './Treadmill'
import PrideAPI from '../lib/PrideAPI'
import PrideVue from './Pride.vue'
import {createApp} from 'vue'
import state from './state'

export default class UI {
                                                                                                                                                                                                                                                                                                                                                                                                        
    augmentations: {[name: string]: THREE.Object3D} = {}

    state = state
    prideVue = createApp(PrideVue).mount(document.createElement('div'))

    pride = this.app.createWebLayerTree( this.prideVue.$el, {
        layerSeparation: 0.002,
        onLayerCreate: (layer) => {
            const adapter = this.app.system.getAdapter(layer)
            // adapter.optimize.allowInvalidLayout = true
            adapter.syncWithParentAdapter = false
            adapter.transition.duration = 1
            // adapter.transition.debounce = 0.5 // 0.4
            adapter.transition.maxWait = 10
            adapter.onUpdate = () => {
                layer.update()
            }
            // adapter.onPostUpdate = () => {
            //     if (adapter.progress > 0.3) layer.updateContent()
            // }
        }
    })
    procedure = this.pride.querySelector('#procedure')!
    step = this.pride.querySelector('#step')!
    instruction = this.pride.querySelector('#instruction')!
    content = this.pride.querySelector('#content')!
    media = this.pride.querySelector('#media')!
    image = this.pride.querySelector('#image')!
    video = this.pride.querySelector('#video')!
    model = this.pride.querySelector('#model')!
    controls = this.pride.querySelector('#controls')!
    backButton = this.pride.querySelector('#back')!
    doneButton = this.pride.querySelector('#done')!
    yesButton = this.pride.querySelector('#yes')!
    noButton = this.pride.querySelector('#no')!
    immersiveButton = this.pride.querySelector('#immersive-toggle')!

    immersiveAnchor = new THREE.Object3D()

    box = new THREE.BoxHelper(this.pride)

    constructor(private app: App, private treadmill: Treadmill) {
        
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
            const adapter = this.app.system.getAdapter(this.pride)            
            // adapter.transition.delay = 5
            // adapter.transition.debounce = 0.5 // 0.1

            const immersiveLayout = adapter.createLayout()
                .attachedTo(this.app.scene)
                .localPosition({x:0,y:0,z:-1})
                .localScale(V_111)
                .localOrientation(Q_IDENTITY)
            
            // immersiveLayout.addPositionConstraint({})
            // immersiveLayout.addVisualConstraint({})
            // immersiveLayout.addObjectives({
            //     position: {},
            //     orientation: {
            //     maximizeVisual: true
            // })
            // immersiveLayout.addConstraint(new Constraint.Visual({

            // }))
            // immersiveLayout.addConstraint({
            //     position: {x:0,y:0,z:-1},
            //     threshold: 0.1
            // })

                const flatLayout = adapter.createLayout()
                    .attachedTo(this.app.camera) // attach the UI to the camera
                    .localOrientation(Q_IDENTITY)
                    .visualBounds({
                        back: {lt:'-1m'},
                        size: {y: '100 vh'},
                        center: {x: '0 vdeg', y:'0 vdeg'}
                    })
                    .preserveAspect('visual')
                // flatLayout.scale = V_111
                // flatLayout.orientation = Q_IDENTITY

                this.app.camera.add(this.pride)

                adapter.onUpdate = () => {
                    this.pride.options.autoRefresh = (this.app.timeSinceLastResize > 100)
                    this.pride.update()
                    if (this.state.immersiveMode) {
                        adapter.layouts = [immersiveLayout]
                    } else {
                        adapter.layouts = [flatLayout]
                    }
                }

                setTimeout(() => (this.video.element as HTMLVideoElement).play(), 5000)
            }

            const setupSnubberModel = () => { 
                const snubberObject = this.treadmill.snubberObject
                this.model.add(snubberObject)
                const adapter = app.system.getAdapter(snubberObject)
                adapter.transition.duration = 1
                adapter.transition.maxWait = 10
                
                const flatLayout = adapter.createLayout()
                flatLayout.attachedTo(this.model)
                    .localOrientation(Q_IDENTITY)
                    // .spatialBounds({back: '0.1m'})
                    .visualBounds({
                        back:       {gt: '0.1m'},
                        left:       {gt: '10px'},
                        right:      {lt: '-10px'},
                        bottom:     {gt: '10px'},
                        top:        {lt: '-10px'},
                        size:       {diagonal:   {gt: '10vdeg'}}
                    })
                    .visualForce({})
                    .preserveAspect('visual')
                    .visualMaximize({relativeTolerance:0.5})

                // flatLayout.visual.left      = {gt: '10px'}
                // flatLayout.visual.right     = {lt: '-10px'}
                // flatLayout.visual.bottom    = {gt: '10px'}
                // flatLayout.visual.top       = {lt: '-10px'}
                // flatLayout.visual.size      = {diagonal: {gt: '10vdeg'}}
                // flatLayout.pullCenter       = {position: {x:0,y:0}}
                // flatLayout.attractors       = [{x:'0',y:'0'}, this.model]
                // flatLayout.occluders        = [this.model]
                // flatLayout.repellers        = []
                // flatLayout.visual.pull = {position: {x:0,y:0}}

                const immersiveFloating = adapter.createLayout()
                    .attachedTo(this.app.scene)
                    .spatialOrientation({swingRange:{x:'10deg',y:'10deg'}, twistRange:'10deg'})
                    .spatialBounds({size: {diagonal: '0.2m'}})
                    .visualBounds({center: {x: '0', y: '0'}, size: {y: '50vh'}})
                immersiveFloating.visualAccuracy = '30px'


            // const immersiveFloating = adapter.createLayout()
            //     .attachedTo(this.app.scene)
            //     .preserveAspect('spatial')
            //     .localOrientation(Q_IDENTITY)
            //     .spatialBounds({size:{diagonal: '0.2m'}})
            //     .visualBounds({
            //         absolute: {
            //             center:{x: '0', y: '0'}
            //         }
            //     })
            //     .visualMaximize()
            //     .visualPhysics({
            //         attractors: []
            //         repellers: [],
            //         colliders: [],
            //     })
            // immersiveFloating.parentNode = this.app.scene
            // immersiveFloating.visual.center = {x: '0', y: '0'}
            // immersiveFloating.local.size = {diagonal: '0.2m'}
            // immersiveFloating.orientation = Q_IDENTITY  
            
            const immersiveAnchored = adapter.createLayout() 
                .attachedTo(this.treadmill.treadmillAnchorObject)
                .localPosition(V_000)
                .localOrientation(Q_IDENTITY)
                .localScale(V_111)

            const IMMERSIVE = [immersiveFloating, immersiveAnchored] as any
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
                // stop updating layout after finding a solution
                if (this.state.immersiveMode && adapter.hasValidContext) {
                    adapter.layouts = [] 
                }
            }
        }
        
        setupImmersiveAnchor()
        setupPrideLayer()
        setupSnubberModel()

        this.backButton.element.addEventListener('click', async () => {
            await PrideAPI.back()
            PrideAPI.get()
        })

        this.doneButton.element.addEventListener('click', async () => {
            await PrideAPI.done()
            PrideAPI.get()
        })

        this.yesButton.element.addEventListener('click', async () => {
            await PrideAPI.done('yes')
            PrideAPI.get()
        })

        this.noButton.element.addEventListener('click', async () => {
            await PrideAPI.done('no')
            PrideAPI.get()
        })

        this.immersiveButton.element.addEventListener('click', async () => {
            this.state.immersiveMode = !this.state.immersiveMode
            if (this.state.immersiveMode) this.app.enterXR()
        })
    }

    updateAugmentations() {
        const prideObjects = PrideAPI.data.objects
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

    update(event: UpdateEvent) {


        // for (const name in this.augmentations) {
        //     const augmentation = this.augmentations[name]
        //     if (prideObjects[name]) {
        //         this.snubber.snubberObject.add(augmentation)
        //     } else {
        //         this.snubber.snubberObject.remove(augmentation)
        //     }
        // }

        // this.snubberVisualSize.update(event.deltaTime)
        // this.snubberDirection.update(event.deltaTime)

        // const snubberObject = this.treadmill.snubberObject

        // const lerpFactor = THREE.MathUtils.clamp(event.deltaTime * 5, 0, 1)

        // only refresh the UI if it's been more than 500ms since the last window resize
        
        

        // // setup UI layout
        // if (this.data.immersiveMode) {
        //     this.pride.transitioner.parentTarget = this.immersiveAnchor
        //     this.pride.layout.reset()
        //     this.pride.position.set(0, this.app.xrPresenting ? 1.6 : 0, this.app.xrPresenting ? -0.7 : -1.4) // position away from camera
        // } else {
        //     this.pride.transitioner.parentTarget = this.app.camera // attach the UI to the camera
        //     this.pride.layout.relative.setFromCenterAndSize(ethereal.V_000, ethereal.V_111) 
        //     this.pride.layout.fitAlign.set(0,0,-0.5)
        //     this.pride.layout.fit = 'contain' // scale content to fit ('contain' is the default fit mode)
        //     this.pride.position.set(0,0,-1) // position away from camera
        // }

        // TODO: pull out the background div and place 10 meters away from the camera
        // FIX: detaching the content like this should not be affect the parent's layout
        // this.pride.content.layout.forceBoundsExclusion = true
        // this.pride.content.transitioner.parentTarget = this.app.camera
        // this.pride.content.layout.relative.setFromCenterAndSize(ethereal.V_000, ethereal.V_111) 
        // this.pride.content.layout.fit = 'fill' // fill the view
        // this.pride.content.position.set(0,0,-10)
        // this.pride.contentOpacity.target = this.data.xrMode ? 0 : 1
        // this.pride.contentTargetOpacity = 0

        // if (this.data.immersiveMode) {
        //     if (this.treadmill.treadmillAnchorObject && this.treadmill.treadmillAnchorObject.parent) {
        //         snubberObject.layout.reset()
        //         snubberObject.transitioner.parentTarget = this.treadmill.treadmillAnchorObject
        //         snubberObject.position.copy(this.treadmill.snubberTargetPosition)
        //         snubberObject.quaternion.setFromAxisAngle(ethereal.V_001, Math.PI)
        //     } else {
        //         snubberObject.transitioner.parentTarget = this.app.scene
        //         snubberObject.position.set(0,this.app.xrPresenting ? 1.6 : 0,-0.3)
        //         if (this.app.xrPresenting) snubberObject.scale.setScalar(4)
        //     }
        // } else {
        //     snubberObject.layout.reset()
        //     snubberObject.transitioner.parentTarget = this.model
        // } 
        // // since snubberObject is not a WebLayer3D instance, we should update it's layout directly
        // snubberObject.transitioner.update(lerpFactor)


        // transitioner = SpatialTransitioner.get(this.content)
        // if (this.data.xrMode) {
        //     transitioner.reset()
        //     transitioner.parent = this.treadmill.treadmillObject
        //     transitioner.size.set(NaN,0.5,NaN)
        //     transitioner.quaternion.setFromAxisAngle(V_001, Math.PI)
        // } else {
        //     transitioner.setFromObject(this.content.target)
        //     transitioner.parent = this.content.parentLayer!
        // }
        // transitioner.update(lerpFactor)

        
        // const i = this.instruction
        // i.transitioner.parentTarget = i.parentLayer!
        // i.layout.resetLayout()
        // if (this.data.immersiveMode) {
        //     i.layout.relative.min.set(1, -1, NaN)
        //     i.layout.relative.max.set(NaN, 1, NaN)
        //     i.transitioner.parentTarget = this.treadmill.snubberObject
        // }

        // if (this.data.immersiveMode) {
        //     const m = this.instruction
        //     m.layout.reset()
        //     m.layout.relative.min.set(NaN, -1, NaN)
        //     m.layout.relative.max.set(-1, 1, NaN)
        //     // m.layout.setSize(1, 1, 1)
        //     m.transitioner.parentTarget = this.treadmill.snubberObject
            // mediaLayout.sizeToFit('contain', this.app.camera, [obstacles])

            // mediaLayout.align.set(0,0,0)
            // mediaLayout.alignToObject(this.app.camera)
            // mediaLayout.alignSnapToEdge()
            // mediaLayout.origin.copy(mediaLayout.align).negate()
            // mediaLayout.origin.multiplyScalar(1.1)
            // mediaLayout.align
            // mediaLayout.sizeToFit('contain', this.app.camera)
            // mediaLayout.minSize(1,1,1)


            // const snubberContentSurface = new SpatialContentSurface(this.app.camera)
            // surface.autoClip = true
            // surface.autoRotate = true
            // surface.layout.minBounds
            // surface.getClosestRegion('left', 'right', 'top', 'bottom', 'center')
            // surface.getLargestRegion('')


            // this.treadmill.snubberObject.add(surface)
            // this.media.layout.targetParent = surface.closestArea
            
            // // SpatialLayout.get
            // // this.media.layout.targetParent = largestArea
            // const mediaSize = this.media.layout.bounds.getSize(vectors.get())
            // const rightSurfaceSize = rightSurface.getSize(vectors.get())
            // if (Math.abs(mediaSize.x - rightSurfaceSize.x) > 100 || Math.abs(mediaSize.y - rightSurfaceSize.y) > 100) {

            // }
        // }


        // if (this.snubberDirection.is('forward')) {
        //     this.instructionPanel.contentTargetOpacity = 0

        //     SpatialTransitioner.get(this.procedure).update(lerpFactor)
        // } else {
        //     let transition = SpatialTransitioner.get(this.video)
        //     transition.setFromObject(this.video.target)
        //     transition.parent = this.video.parentLayer!
        //     transition.update(lerpFactor)

        //     transition = SpatialTransitioner.get(this.procedure).reset()
        //     transition.parent = this.procedure.parentLayer!
        //     transition.update(lerpFactor)
        // }

        // if (this.snubberVisualSize.is('large')) {

        //     SpatialLayout.setParent(this.instructionPanel, this.app.camera)
        //     this.instructionPanel.position.lerp(vec.set(0,0,0), lerpFactor)
        //     this.instructionPanel.quaternion.slerp(Q_IDENTITY, lerpFactor)
        //     this.instructionPanel.layout!.align.lerp(vec.set(-1,0,-0.5), lerpFactor)
        //     this.instructionPanel.layout!.origin.lerp(vec.set(-1,0,-1), lerpFactor)
    
        // } else {
        //     // if far, attach UI to world
        //     SpatialLayout.setParent(this.instructionPanel, this.treadmill.treadmillObject)
        //     this.instructionPanel.position.lerp(vec.set(0,0,0), lerpFactor)
        //     this.instructionPanel.quaternion.slerp(Q_IDENTITY, lerpFactor)
        // }
    }

    // proceedToNextStep(step) {
    //     this.procedureTitle.object = replaceObject(
    //         this.procedureTitle.object,
    //         makeTextSprite(step.procedureTitle, {})
    //     )
    // }
}