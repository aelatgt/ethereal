import {WebLayer3D} from 'three-web-layer'
import * as THREE from 'three'
import {DemoBase} from './DemoBase'
import {
    LayoutHelper, 
    SpatialMetrics, 
    vectors, 
    BehaviorManager, 
    OcclusionClippingBehavior
} from '@etherealjs/core'
import {css} from 'emotion'
import { Vector3 } from 'three'

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

    logoClippingBehavior = new OcclusionClippingBehavior()
    infoClippingBehavior = (() => {
        const b = new OcclusionClippingBehavior()
        // b.clipSides.left = false
        // b.clipSides.top = false
        return b
    })()

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
            sphere.layout.forceBoundingContext = true
            this.logoClippingBehavior.occluders.push(sphere)

            const tMultiplier = Math.random()
            const factorX = Math.random() - 0.5
            const factorY = Math.random() - 0.5
            const factorZ = Math.random() - 0.5
            let t = 0
            BehaviorManager.addBehavior(sphere, (deltaTime:number) => {
                t += deltaTime * tMultiplier
                sphere.position.x = factorX * Math.sin(t)
                sphere.position.y = factorY * Math.sin(t)
                sphere.position.z = factorZ * Math.cos(t)
                sphere.position.multiplyScalar(5)
                sphere.position.add(spherePosition)
            })
        }

        this.container.add(this.orientedContainerTop)
        this.orientedContainerTop.layout.inner.makeZero()
        this.orientedContainerTop.layout.relative.min.set(0,0.5,0)
        this.orientedContainerTop.layout.relative.max.setScalar(NaN)
        this.orientedContainerTop.add(new THREE.AxesHelper(1))

        const logo = this.logoLayer
        ;(logo.contentMesh.material as THREE.MeshBasicMaterial).side = THREE.DoubleSide
        logo.add(new LayoutHelper)
        logo.layout.innerAutoCompute = true
        logo.layout.relative.min.set(-0.5, 0.5, -0.5)
        logo.layout.relative.max.set(0.5, NaN, NaN)
        logo.layout.minRelativeSize.x = 0.5
        logo.layout.fitAlign.set(0, -0.5, 0)
        logo.transitioner.active = true
        logo.transitioner.delay = 0.5
        logo.transitioner.debounce = 0.5
        logo.transitioner.threshold = 0.1
        // logo.transitioner.easing = easing.anticipate
        // logo.transitioner.matrixLocal.scale.start.setScalar(0.0001)
        this.container.add(logo)
        
        const info = this.infoLayer
        info.add(new LayoutHelper)
        info.layout.innerAutoCompute = true
        info.layout.relative.min.set(0.55, -2, 0.5)
        info.layout.relative.max.set(2, 2, NaN)
        info.layout.fitAlign.set(-0.5,0.5,0)
        // info.layout.fit = 'fill'
        info.layout.minRelativeSize.set(0.3, 0.3, 0)
        info.transitioner.active = true
        info.transitioner.duration = 1
        // info.transitioner.delay = 0.5
        // info.transitioner.debounce = 0.5
        info.transitioner.threshold = 0.1
        // info.transitioner.easing = easing.anticipate
        this.container.add(this.infoLayer)
        
        const orientation = new THREE.Quaternion
        BehaviorManager.addBehavior(this.container, {
            update: () => {
                SpatialMetrics.get(this.container).getClosestOrthogonalOrientationOf(BehaviorManager.currentCamera, orientation)
            // },
            // postUpdate: () => {
                if (this.infoLayer.layout.orientation.equals(orientation)) {
                    this.infoLayer.transitioner.duration = 0.5
                } else {
                    this.infoLayer.transitioner.duration = 1
                }
                this.logoLayer.layout.orientation.copy(orientation)
                this.infoLayer.layout.orientation.copy(orientation)
                this.orientedContainerTop.layout.orientation.copy(orientation)
            }
        })

        BehaviorManager.addBehavior(this.logoLayer, () => {
            BehaviorManager.ensureUpdate(this.orientedContainerTop)
            const camera = BehaviorManager.currentCamera
            const cameraPositionTop = SpatialMetrics.get(this.orientedContainerTop).getPositionOf(camera, vectors.get())
            logo.layout.relative.min.z = (cameraPositionTop.y > 0) ? -0.5 : 0.5

            const layoutInfoText = `relative-min: ${JSON.stringify(logo.layout.relative.min, null, '\t')}
                                    relative-max: ${JSON.stringify(logo.layout.relative.max, null, '\t')}`
                                    // clip-min: ${JSON.stringify(logo.layout.clip.min, null, '\t')}
                                    // clip-max: ${JSON.stringify(logo.layout.clip.max, null, '\t')}`
                                    // orientation: ${JSON.stringify(this._euler.setFromQuaternion(logo.layout.orientation), null, '\t')}`
            if (this.currentInfoText !== layoutInfoText) {
                (info.element as HTMLElement).innerText = layoutInfoText
                this.currentInfoText = layoutInfoText
            }

            logo.update()
            info.update()
        })

        BehaviorManager.addBehavior(this.logoLayer, this.logoClippingBehavior)
        BehaviorManager.addBehavior(this.infoLayer, this.infoClippingBehavior)
    }
}