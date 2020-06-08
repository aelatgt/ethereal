import * as THREE from 'three'
import { DemoBase } from './DemoBase'
import { css } from 'emotion'
import { Vector3, Box3 } from 'three'
import { system, adapt, easing, V_000, WebLayer3D } from 'ethereal'

function DOM(html:string) {
    const wrapper = document.createElement('div')
    wrapper.innerHTML = html
    const el = wrapper.firstElementChild!
    wrapper.removeChild(el)
    return el
}

export class GlobalAdaptivityDemo extends DemoBase {

    orientedContainerTop = new THREE.Object3D

    logoLayer = new WebLayer3D(DOM(`
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
    `))

    infoLayer = new WebLayer3D(DOM(`
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
    `), {
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
        for (let i=0; i < 20; i++) {
            const sphere = new THREE.Mesh(sphereGeo)
            const spherePosition = new Vector3(5-Math.random()*10, 5-Math.random()*10, 5-Math.random()*10)
            sphere.position.copy(spherePosition)
            sphere.scale.setScalar(0.5)
            this.container.add(sphere)
            this.logoOccluders.push(sphere)

            const tMultiplier = Math.random()
            const factorX = Math.random() - 0.5
            const factorY = Math.random() - 0.5
            const factorZ = Math.random() - 0.5
            let t = 0

            adapt(sphere, ({behavior}) => {
                behavior(() => {
                    t += system.deltaTime * tMultiplier
                    sphere.position.x = factorX * Math.sin(t)
                    sphere.position.y = factorY * Math.sin(t)
                    sphere.position.z = factorZ * Math.cos(t)
                    sphere.position.multiplyScalar(5)
                    sphere.position.add(spherePosition)
                })
            })
        }

        this.orientedContainerTop.add(new THREE.AxesHelper(1))
        this.container.add(this.orientedContainerTop)
        adapt(this.orientedContainerTop, (adapter) => {
            adapter.innerBounds.target = new Box3().makeEmpty()
            adapter.layout((layout)=>{
                layout.bounds.bottom = {percent:50}
            })
        })
        // this.orientedContainerTop.layout.inner.makeZero()
        // this.orientedContainerTop.layout.relative.min.set(0,0.5,0)
        // this.orientedContainerTop.layout.relative.max.setScalar(NaN)

        const logo = this.logoLayer
        ;(logo.contentMesh.material as THREE.MeshBasicMaterial).side = THREE.DoubleSide
        this.container.add(logo)
        // logo.add(new LayoutHelper)
        adapt(logo, (adapter) => {
            adapter.transition.delay = 0.5
            adapter.transition.debounce = 0.5
            adapter.transition.threshold = 0.1
            adapter.transition.easing = easing.anticipate
            adapter.bounds.start.setFromCenterAndSize(V_000, V_000)
            adapter.layout(layout => {
                layout.bounds.left = {min: {percent: -50}} // flexible left
                layout.bounds.right = {max: {percent: 50}} // flexible right
                layout.bounds.bottom = {percent: -50} // fix to bottom
                layout.bounds.back = {percent: -50} // fix to back
                layout.aspect = 'preserve-3d'
            })
        })
        
        const info = this.infoLayer
        this.container.add(this.infoLayer)
        // info.add(new LayoutHelper)
        adapt(info, ({transition, layout, optimize}) => {
            transition.duration = 1
            transition.threshold = 0.112
            
            layout(layout => {
                layout.left = {percent: 55}
                layout.right = {max: {percent: 200}}
                layout.bottom = {max: {percent: 50}}
                layout.top = {min: {percent: -50}}
                layout.aspect = 'preserve-3d' 
                layout.pull = {direction: {x:-1,y:1,z:0}}
            })
            // ](metrics) =>
            //     return  0.5 * objectives.maximizeViewArea(metrics) +
            //             0.5 * objectives.maximizeDirection(metrics, )
            // }
        })
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