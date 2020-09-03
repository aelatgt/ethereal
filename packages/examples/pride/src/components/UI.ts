import * as THREE from 'three'

import App, {UpdateEvent} from '../app'
import {WebLayer3D} from 'three-web-layer'
import Treadmill from './Treadmill'
import PrideAPI from '../lib/PrideAPI'
import PrideVue from './Pride.vue'
import AdaptiveProperty from '../lib/AdaptiveProperty'
import * as ethereal from 'ethereal'
import {createApp} from 'vue'

export default class UI {

    data = {
        pride: PrideAPI.data,
        immersiveMode: false
    }

    augmentations: {[name: string]: THREE.Object3D} = {}

    prideVue = createApp(PrideVue,{
        data: this.data
    }).mount('')

    pride = new WebLayer3D( this.prideVue.$el, {
        layerSeparation: 0.002
    })
    procedure = this.pride.querySelector('#procedure')! as WebLayer3D
    step = this.pride.querySelector('#step')! as WebLayer3D
    instruction = this.pride.querySelector('#instruction')! as WebLayer3D
    content = this.pride.querySelector('#content')! as WebLayer3D
    media = this.pride.querySelector('#media')! as WebLayer3D
    image = this.pride.querySelector('#image')! as WebLayer3D
    video = this.pride.querySelector('#video')! as WebLayer3D
    model = this.pride.querySelector('#model')! as WebLayer3D
    controls = this.pride.querySelector('#controls') as WebLayer3D
    backButton = this.pride.querySelector('#back') as WebLayer3D
    doneButton = this.pride.querySelector('#done') as WebLayer3D
    yesButton = this.pride.querySelector('#yes') as WebLayer3D
    noButton = this.pride.querySelector('#no') as WebLayer3D
    immersiveButton = this.pride.querySelector('#immersive-toggle')! as WebLayer3D

    // doneButton = new HTMLElement3D('')
    // skipButton = new HTMLElement3D('')
    // clearButton = new HTMLElement3D('')
    // yesButton = new HTMLElement3D('')
    // noButton = new HTMLElement3D('')
    // commentButton = new HTMLElement3D('')

    snubberVisualSize = new AdaptiveProperty({
        metric: () => ethereal.SpatialMetrics.get(this.app.camera).getVisualFrustumOf(this.treadmill.snubberObject!).diagonal,
        zones: [
            {state: 'small', threshold: 15, delay: 100},
            40,
            {state: 'large', threshold: 15, delay: 100},
        ],
    })

    snubberDirection = new AdaptiveProperty({
        metric: () => ethereal.SpatialMetrics.get(this.app.camera).getVisualOffsetOf(this.treadmill.snubberObject!),
        zones: [
            {state: 'left', threshold: 15, delay: 100},
            -60,
            {state: 'forward', threshold: 15, delay: 100},
            60,
            {state: 'right', threshold: 15, delay: 100},
        ],
    })

    box = new THREE.BoxHelper(this.pride)

    constructor(private app: App, private treadmill: Treadmill) {
        
        setTimeout(() => (this.video.element as HTMLVideoElement).play(), 5000)

        this.app.registerWebLayer(this.pride)

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
            this.data.immersiveMode = !this.data.immersiveMode
            if (this.data.immersiveMode) this.app.enterXR()
        })
    }

    update(event: UpdateEvent) {

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
            augmentation.rotation.x = prideObject.rotation.x * THREE.Math.DEG2RAD
            augmentation.rotation.y = prideObject.rotation.y * THREE.Math.DEG2RAD
            augmentation.rotation.z = prideObject.rotation.z * THREE.Math.DEG2RAD
        }

        // for (const name in this.augmentations) {
        //     const augmentation = this.augmentations[name]
        //     if (prideObjects[name]) {
        //         this.snubber.snubberObject.add(augmentation)
        //     } else {
        //         this.snubber.snubberObject.remove(augmentation)
        //     }
        // }

        this.snubberVisualSize.update(event.deltaTime)
        this.snubberDirection.update(event.deltaTime)

        const snubberObject = this.treadmill.snubberObject

        const lerpFactor = THREE.Math.clamp(event.deltaTime * 5, 0, 1)

        // only refresh the UI if it's been more than 500ms since the last window resize
        this.pride.options.autoRefresh = this.app.timeSinceLastResize > 500
        
        // setup UI layout
        if (this.data.immersiveMode) {
            this.pride.transitioner.parentTarget = this.app.scene
            this.pride.layout.reset()
            this.pride.position.set(0, this.app.xrPresenting ? 1.6 : 0, this.app.xrPresenting ? -0.7 : -1.4) // position away from camera
        } else {
            this.pride.transitioner.parentTarget = this.app.camera // attach the UI to the camera
            this.pride.layout.relative.setFromCenterAndSize(ethereal.V_000, ethereal.V_111) 
            this.pride.layout.fitAlign.set(0,0,-0.5)
            this.pride.layout.fit = 'contain' // scale content to fit ('contain' is the default fit mode)
            this.pride.position.set(0,0,-1) // position away from camera
        }

        // TODO: pull out the background div and place 10 meters away from the camera
        // FIX: detaching the content like this should not be affect the parent's layout
        // this.pride.content.layout.forceBoundsExclusion = true
        // this.pride.content.transitioner.parentTarget = this.app.camera
        // this.pride.content.layout.relative.setFromCenterAndSize(ethereal.V_000, ethereal.V_111) 
        // this.pride.content.layout.fit = 'fill' // fill the view
        // this.pride.content.position.set(0,0,-10)
        // this.pride.contentOpacity.target = this.data.xrMode ? 0 : 1
        // this.pride.contentTargetOpacity = 0

        if (this.data.immersiveMode) {
            if (this.treadmill.treadmillAnchorObject && this.treadmill.treadmillAnchorObject.parent) {
                snubberObject.layout.reset()
                snubberObject.transitioner.parentTarget = this.treadmill.treadmillAnchorObject
                snubberObject.position.copy(this.treadmill.snubberTargetPosition)
                snubberObject.quaternion.setFromAxisAngle(ethereal.V_001, Math.PI)
            } else {
                snubberObject.transitioner.parentTarget = this.app.scene
                snubberObject.position.set(0,this.app.xrPresenting ? 1.6 : 0,-0.3)
                if (this.app.xrPresenting) snubberObject.scale.setScalar(4)
            }
        } else {
            snubberObject.layout.reset()
            snubberObject.transitioner.parentTarget = this.model
        } 
        // since snubberObject is not a WebLayer3D instance, we should update it's layout directly
        snubberObject.transitioner.update(lerpFactor)

        this.pride.update(event.deltaTime)
        

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