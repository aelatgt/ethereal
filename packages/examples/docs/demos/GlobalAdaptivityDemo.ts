import * as THREE from 'three'
import { DemoBase } from './DemoBase'
import { css } from 'emotion'
import { Vector3 } from 'three'
import { adapt, V_000, WebLayer3D, easing } from 'ethereal'

export class GlobalAdaptivityDemo extends DemoBase {

    orientedContainerTop = new THREE.Object3D

    logoLayer = new WebLayer3D(`
        <div id="logo" class=${css({
            display: 'inline',
            color: 'rgb(180,120,250)',
            font: '400 100px/1.3 "Berkshire Swash"',
            textShadow: `3px 3px 0 #000,
                        -1px -1px 0 #000,  
                        1px -1px 0 #000,
                        -1px 1px 0 #000,
                        1px 1px 0 #000`
        })}>ethereal.js</div>
    `)

    infoLayer = new WebLayer3D(`
        <div id="info" class=${css({
            display: 'inline',
            color: 'white',
            fontSize: '20px',
            textShadow: `3px 3px 0 #000,
                        -1px -1px 0 #000,  
                        1px -1px 0 #000,
                        -1px 1px 0 #000,
                        1px 1px 0 #000`
        })}></div>
    `, {
        pixelRatio: 1
    })

    // logoClippingBehavior = new OcclusionClippingBehavior()
    // infoClippingBehavior = (() => {
    //     const b = new OcclusionClippingBehavior()
    //     // b.clipSides.left = false
    //     // b.clipSides.top = false
    //     return b
    // })()
    logoOccluders = [] as THREE.Object3D[]

    _euler = new THREE.Euler
    currentInfoText = ''

    constructor() {
        super()

        const sphereGeo = new THREE.SphereGeometry      
        for (let i=0; i < 10; i++) {
            const sphere = new THREE.Mesh(sphereGeo)
            const spherePosition = new Vector3((0.5-Math.random())*7, (0.5-Math.random())*7, (0.5-Math.random())*7)
            sphere.position.copy(spherePosition)
            this.container.add(sphere)
            this.logoOccluders.push(sphere)

            const tMultiplier = Math.random()
            const factorX = Math.random() - 0.5
            const factorY = Math.random() - 0.5
            const factorZ = Math.random() - 0.5
            let t = 0

            adapt(sphere, (adapter) => {
                const center = new Vector3
                const size = new Vector3(1,1,1)
                adapter.onUpdate = () => {
                    t += adapter.system.deltaTime * tMultiplier
                    center.x = factorX * Math.sin(t)
                    center.y = factorY * Math.sin(t)
                    center.z = factorZ * Math.cos(t)
                    center.multiplyScalar(5)
                    center.add(spherePosition)
                    adapter.bounds.target.setFromCenterAndSize(center,size)
                }
            })
        }

        // this.orientedContainerTop.add(new THREE.AxesHelper(1))
        this.container.add(this.orientedContainerTop)
        adapt(this.orientedContainerTop, (adapter) => {
            const layout = adapter.createLayout()
            layout.bounds.centerX = {meters: 0}
            layout.bounds.centerZ = {meters: 0}
            layout.bounds.centerY = {percent: 50}
            adapter.onUpdate = (system) => {
                layout.orientation = system.getState(this.container).viewAlignedOrientation
            }
        })
        // this.orientedContainerTop.layout.inner.makeZero()
        // this.orientedContainerTop.layout.relative.min.set(0,0.5,0)
        // this.orientedContainerTop.layout.relative.max.setScalar(NaN)

        const logo = this.logoLayer
        ;(logo.contentMesh.material as THREE.MeshBasicMaterial).side = THREE.DoubleSide
        this.container.add(logo)
        
        
        adapt(logo, (adapter) => {
            // adapter.transition.delay = 0.1
            adapter.transition.duration = 0.8
            adapter.transition.delay = 0.4
            adapter.transition.debounce = 0.2
            // adapter.orientation.duration  = 0.3
            // adapter.transition.threshold = 0.1
            // adapter.transition.easing = easing.anticipate
            
            const layout = adapter.createLayout()
            layout.bounds.left = {gt: {percent: -50}} // flexible left
            layout.bounds.right = {lt: {percent: 50}} // flexible right
            layout.bounds.bottom = {percent: 50, meters: 1} // fix to top of outer bounds
            layout.bounds.bottom = {percent: 50, meters: 1} // fix to top of outer bounds
            layout.bounds.centerZ = [{percent: -50},{percent: 50}] // fix to back or front of outer bounds
            layout.visual.diagonalLength = {gt: {degrees: 5}}
            // layout.bounds.centerZ = {gt:{percent: -50}, lt:{percent: 50}} // fix to back or front of outer bounds
            layout.aspect = 'preserve-3d'
            layout.visual.left = {gt: {percent: -50}}
            layout.visual.right = {lt: {percent: 50}}
            layout.visual.bottom = {gt: {percent: -50}}
            layout.visual.top = {lt: {percent: 50}}

            layout.objectives.unshift({score: (state) => {
                return 0 - (state.occludingPercent +  state.occludedPercent)  ** 4
            }})

            adapter.onUpdate = (system) => {
                // const relativeViewPosition = system.getState(this.orientedContainerTop).relativeViewPosition
                // layout.bounds.back = {percent: (relativeViewPosition.y > 0) ? -50 : 50}
                layout.orientation = system.getState(this.container).viewAlignedOrientation
                logo.update()
            }

            adapter.bounds.start.setFromCenterAndSize(V_000, V_000)
        })
        
        const info = this.infoLayer
        // this.container.add(this.infoLayer)
        // info.add(new LayoutHelper)
        // adapt(info, ({transition, layout, optimize}) => {
        //     transition.duration = 1
        //     transition.threshold = 0.112
            
        //     layout(layout => {
        //         layout.bounds.left = {percent: -55}
        //         layout.bounds.right = {max: {percent: 200}}
        //         layout.bounds.bottom = {max: {percent: 50}}
        //         layout.bounds.top = {max: {percent: 50}}
        //         layout.aspect = 'preserve-3d' 
        //         layout.pull = {direction: {x:-1,y:1,z:0}}
        //     })
        //     // ](metrics) =>
        //     //     return  0.5 * objectives.maximizeViewArea(metrics) +
        //     //             0.5 * objectives.maximizeDirection(metrics, )
        //     // }
        // })
        // info.layout.innerAutoCompute = true
        // info.layout.relative.min.set(0.55, -2, 0.5)
        // info.layout.relative.max.set(2, 2, NaN)
        // info.layout.fitAlign.set(-0.5,0.5,0)
        // info.layout.fit = 'fill'
        // info.layout.minRelativeSize.set(0.3, 0.3, 0)
        // info.transitioner.active = true
        // info.transitioner.duration = 1
        // info.transitioner.delay = 0.5
        // info.transitioner.debounce = 0.5
        // info.transitioner.threshold = 0.1
        // info.transitioner.easing = easing.anticipate
        
        // const orientation = new THREE.Quaternion
        // BehaviorManager.addBehavior(this.container, {
        //     update: () => {
        //         SpatialMetrics.get(this.container).getClosestOrthogonalOrientationOf(BehaviorManager.currentCamera, orientation)
        //     // },
        //     // postUpdate: () => {
        //         if (this.infoLayer.layout.orientation.equals(orientation)) {
        //             this.infoLayer.transitioner.duration = 0.5
        //         } else {
        //             this.infoLayer.transitioner.duration = 1
        //         }
        //         this.logoLayer.layout.orientation.copy(orientation)
        //         this.infoLayer.layout.orientation.copy(orientation)
        //         this.orientedContainerTop.layout.orientation.copy(orientation)
        //     }
        // })

        // BehaviorManager.addBehavior(this.logoLayer, () => {
        //     BehaviorManager.ensureUpdate(this.orientedContainerTop)
        //     const camera = BehaviorManager.currentCamera
        //     const cameraPositionTop = SpatialMetrics.get(this.orientedContainerTop).getPositionOf(camera, vectors.get())
        //     logo.layout.relative.min.z = (cameraPositionTop.y > 0) ? -0.5 : 0.5

        //     const layoutInfoText = `relative-min: ${JSON.stringify(logo.layout.relative.min, null, '\t')}
        //                             relative-max: ${JSON.stringify(logo.layout.relative.max, null, '\t')}`
        //                             // clip-min: ${JSON.stringify(logo.layout.clip.min, null, '\t')}
        //                             // clip-max: ${JSON.stringify(logo.layout.clip.max, null, '\t')}`
        //                             // orientation: ${JSON.stringify(this._euler.setFromQuaternion(logo.layout.orientation), null, '\t')}`
        //     if (this.currentInfoText !== layoutInfoText) {
        //         (info.element as HTMLElement).innerText = layoutInfoText
        //         this.currentInfoText = layoutInfoText
        //     }

        //     logo.update()
        //     info.update()
        // })

        // BehaviorManager.addBehavior(this.logoLayer, this.logoClippingBehavior)
        // BehaviorManager.addBehavior(this.infoLayer, this.infoClippingBehavior)
    }
}