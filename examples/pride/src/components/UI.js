import * as THREE from 'three';
import * as ethereal from 'ethereal';
import { WebLayer3D, Q_IDENTITY, V_111 } from 'ethereal';
import PrideAPI from '../lib/PrideAPI';
import PrideVue from './Pride.vue';
import { createApp } from 'vue';
import state from './state';
export default class UI {
    constructor(app, treadmill) {
        this.app = app;
        this.treadmill = treadmill;
        this.augmentations = {};
        this.state = state;
        this.prideVue = createApp(PrideVue).mount(document.createElement('div'));
        this.pride = new WebLayer3D(this.prideVue.$el, {
            layerSeparation: 0.002
        });
        this.procedure = this.pride.querySelector('#procedure');
        this.step = this.pride.querySelector('#step');
        this.instruction = this.pride.querySelector('#instruction');
        this.content = this.pride.querySelector('#content');
        this.media = this.pride.querySelector('#media');
        this.image = this.pride.querySelector('#image');
        this.video = this.pride.querySelector('#video');
        this.model = this.pride.querySelector('#model');
        this.controls = this.pride.querySelector('#controls');
        this.backButton = this.pride.querySelector('#back');
        this.doneButton = this.pride.querySelector('#done');
        this.yesButton = this.pride.querySelector('#yes');
        this.noButton = this.pride.querySelector('#no');
        this.immersiveButton = this.pride.querySelector('#immersive-toggle');
        this.immersiveAnchor = new THREE.Object3D();
        this.box = new THREE.BoxHelper(this.pride);
        const setupImmersiveAnchor = () => {
            this.app.scene.add(this.immersiveAnchor);
            const adapter = this.app.system.getAdapter(this.immersiveAnchor);
            const center = new THREE.Vector3;
            adapter.onUpdate = () => {
                center.set(0, this.app.xrPresenting ? 1.6 : 0, this.app.xrPresenting ? -0.7 : -1.4); // position away from camera
                adapter.bounds.target.setFromCenterAndSize(center, ethereal.V_111);
            };
        };
        const setupPrideLayer = () => {
            this.app.registerWebLayer(this.pride);
            const adapter = this.app.system.getAdapter(this.pride);
            adapter.transition.duration = 0.5;
            adapter.transition.debounce = 0.3;
            adapter.transition.maxWait = 10;
            const immersiveLayout = adapter.createLayout();
            immersiveLayout.parentNode = this.app.scene;
            immersiveLayout.position = { x: 0, y: 0, z: -1 };
            immersiveLayout.local.centerX = { meters: 0 };
            immersiveLayout.local.centerY = { meters: 0 };
            immersiveLayout.local.centerZ = { meters: -1 };
            immersiveLayout.scale = V_111;
            immersiveLayout.orientation = Q_IDENTITY;
            const flatLayout = adapter.createLayout();
            flatLayout.parentNode = this.app.camera; // attach the UI to the camera
            flatLayout.visual.far = { meters: 1 };
            flatLayout.visual.near = { gt: { meters: this.app.camera.near } };
            flatLayout.visual.width = { percent: 100 };
            flatLayout.visual.height = { percent: 100 };
            flatLayout.visual.centerX = { degrees: 0 };
            flatLayout.visual.centerY = { degrees: 0 };
            flatLayout.orientation = Q_IDENTITY;
            this.app.camera.add(this.pride);
            adapter.onUpdate = () => {
                this.updateAugmentations();
                this.pride.options.autoRefresh = this.app.timeSinceLastResize > 500;
                this.pride.update(this.app.system.deltaTime);
                if (this.state.immersiveMode) {
                    adapter.layouts = [immersiveLayout];
                }
                else {
                    adapter.layouts = [flatLayout];
                }
            };
            setTimeout(() => this.video.element.play(), 5000);
        };
        const setupSnubberModel = () => {
            const snubberObject = this.treadmill.snubberObject;
            const adapter = app.system.getAdapter(snubberObject);
            adapter.transition.duration = 0.5;
            adapter.transition.debounce = 0.1;
            adapter.transition.maxWait = 10;
            const flatLayout = adapter.createLayout();
            flatLayout.parentNode = this.model;
            flatLayout.orientation = Q_IDENTITY;
            // flatLayout.bounds.centerZ = {meters:0}
            flatLayout.visual.pull = { position: { x: 0, y: 0 } };
            flatLayout.local.back = { percent: -50 };
            flatLayout.local.depth = { meters: 0.2 };
            // flatLayout.visual.left      = {gt: [{percent: -50}, {offsetDegrees:0}]}
            // flatLayout.visual.right     = {lt: {percent: 50}}
            // flatLayout.visual.bottom    = {gt: {percent: -50}}
            // flatLayout.visual.top       = {lt: {percent: 50}}
            // flatLayout.visual.left        = {gt: {percent: -50, referenceFrame:'parent'}}
            // flatLayout.visual.right       = {lt: {percent: 50, referenceFrame:'parent'}}
            // flatLayout.visual.bottom      = {gt: {percent: -50, referenceFrame:'parent'}}
            // flatLayout.visual.top         = {lt: {percent: -50, referenceFrame:'parent'}}
            flatLayout.aspect = "preserve-2d";
            const IMMERSIVE = [];
            const FLAT = [flatLayout];
            adapter.onUpdate = () => {
                if (this.state.immersiveMode) {
                    adapter.layouts = IMMERSIVE;
                    adapter.parentNode = this.app.scene;
                    if (this.treadmill.treadmillAnchorObject && this.treadmill.treadmillAnchorObject.parent) {
                        snubberObject.position.copy(this.treadmill.snubberTargetPosition);
                        snubberObject.quaternion.setFromAxisAngle(ethereal.V_001, Math.PI);
                    }
                    else {
                        snubberObject.scale.setScalar(4);
                        snubberObject.position.set(0, this.app.xrPresenting ? 1.6 : 0, -1);
                    }
                }
                else {
                    adapter.layouts = FLAT;
                    const modelVisual = this.app.system.getState(this.model).visualFrustum;
                    flatLayout.visual.left = { gt: { degrees: modelVisual.leftDegrees + 2 } };
                    flatLayout.visual.right = { lt: { degrees: modelVisual.rightDegrees - 2 } };
                    flatLayout.visual.bottom = { gt: { degrees: modelVisual.bottomDegrees + 2 } };
                    flatLayout.visual.top = { lt: { degrees: modelVisual.topDegrees - 2 } };
                }
            };
        };
        setupImmersiveAnchor();
        setupPrideLayer();
        setupSnubberModel();
        this.backButton.element.addEventListener('click', async () => {
            await PrideAPI.back();
            PrideAPI.get();
        });
        this.doneButton.element.addEventListener('click', async () => {
            await PrideAPI.done();
            PrideAPI.get();
        });
        this.yesButton.element.addEventListener('click', async () => {
            await PrideAPI.done('yes');
            PrideAPI.get();
        });
        this.noButton.element.addEventListener('click', async () => {
            await PrideAPI.done('no');
            PrideAPI.get();
        });
        this.immersiveButton.element.addEventListener('click', async () => {
            this.state.immersiveMode = !this.state.immersiveMode;
            if (this.state.immersiveMode)
                this.app.enterXR();
        });
    }
    updateAugmentations() {
        const prideObjects = PrideAPI.data.objects;
        for (const name in prideObjects) {
            const prideObject = prideObjects[name];
            let augmentation = this.augmentations[name];
            if (!augmentation) {
                switch (prideObject.type) {
                    case 'box':
                        const size = prideObject.size;
                        augmentation = new THREE.Mesh(new THREE.BoxGeometry(size.x * 0.01, size.y * 0.01, size.z * 0.01));
                        break;
                    case 'sphere':
                        augmentation = new THREE.Mesh(new THREE.SphereGeometry(prideObject.radius * 0.01));
                        break;
                    default:
                        augmentation = new THREE.Object3D;
                        break;
                }
                this.augmentations[name] = augmentation;
            }
            augmentation.position.copy(prideObject.position).multiplyScalar(0.01);
            augmentation.rotation.x = prideObject.rotation.x * THREE.MathUtils.DEG2RAD;
            augmentation.rotation.y = prideObject.rotation.y * THREE.MathUtils.DEG2RAD;
            augmentation.rotation.z = prideObject.rotation.z * THREE.MathUtils.DEG2RAD;
        }
    }
    update(event) {
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
}
