import WebLayer3D from 'three-web-layer'
import * as THREE from 'three'
import {DemoBase} from './DemoBase'
import {LayoutHelper, AdaptivityManager, SpatialMetrics, vectors, AdaptiveClippingBehavior, easing, V_000, V_111} from '../../src/'
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

    etherealLogo = new WebLayer3D(DOM(`
        <div class=${css({
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

    layoutInfo = new WebLayer3D(DOM(`
        <div class=${css({
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

    _euler = new THREE.Euler
    currentInfoText = ''

    adaptiveOcclusion = new AdaptiveClippingBehavior()

    constructor() {
        super()

        const sphereGeo = new THREE.SphereGeometry      
        for (let i=0; i < 20; i++) {
            const sphere = new THREE.Mesh(sphereGeo)
            const spherePosition = new Vector3(5-Math.random()*10, 5-Math.random()*10, 5-Math.random()*10)
            sphere.position.copy(spherePosition)
            sphere.scale.setScalar(0.5)
            this.container.add(sphere)
            sphere.layout.forceBoundsExclusion = true
            this.adaptiveOcclusion.occluders.push(sphere)

            const tMultiplier = Math.random()
            const factorX = Math.random() - 0.5
            const factorY = Math.random() - 0.5
            const factorZ = Math.random() - 0.5
            let t = 0
            AdaptivityManager.addBehavior(sphere, (deltaTime) => {
                t += deltaTime * tMultiplier
                sphere.position.x = factorX * Math.sin(t)
                sphere.position.y = factorY * Math.sin(t)
                sphere.position.z = factorZ * Math.cos(t)
                sphere.position.multiplyScalar(5)
                sphere.position.add(spherePosition)
            })
        }

        this.container.add(this.orientedContainerTop)
        this.orientedContainerTop.layout.relative.min.set(0,0.5,0)
        this.orientedContainerTop.add(new THREE.AxesHelper)

        const logo = this.etherealLogo
        ;(logo.mesh.material as THREE.MeshBasicMaterial).side = THREE.DoubleSide
        logo.add(new LayoutHelper)
        logo.layout.relative.min.set(-0.5, 0.5, -0.5)
        logo.layout.relative.max.set(0.5, NaN, NaN)
        logo.layout.minRelativeSize.x = 0.5
        logo.transitioner.active = true
        logo.transitioner.delay = 0.5
        logo.transitioner.debounce = 0.5
        logo.transitioner.threshold = 0.1
        // logo.transitioner.easing = easing.anticipate
        logo.transitioner.matrixLocal.scale.start.setScalar(0.0001)
        this.container.add(logo)
        
        const info = this.layoutInfo
        info.add(new LayoutHelper)
        info.layout.relative.min.set(0.55, -0.7, 0.5)
        info.layout.relative.max.set(1.6, 0.7, NaN)
        info.layout.fitAlign.set(-0.5,0.5,0)
        // info.layout.fit = 'fill'
        info.layout.minRelativeSize.y = 0.5
        info.transitioner.active = true
        info.transitioner.delay = 0.5
        info.transitioner.debounce = 0.5
        info.transitioner.threshold = 0.1
        // info.transitioner.easing = easing.anticipate
        info.transitioner.matrixLocal.scale.start.setScalar(0.0001)
        this.container.add(this.layoutInfo)
        
        const orientation = new THREE.Quaternion
        AdaptivityManager.addBehavior(this.container, {
            update: () => {
                SpatialMetrics.get(this.container).getClosestOrthogonalOrientationOf(AdaptivityManager.currentCamera, orientation)
            },
            postUpdate: () => {
                this.etherealLogo.layout.orientation.copy(orientation)
                this.layoutInfo.layout.orientation.copy(orientation)
                this.orientedContainerTop.layout.orientation.copy(orientation)
            }
        })

        AdaptivityManager.addBehavior(this.etherealLogo, () => {
            AdaptivityManager.ensureUpdate(this.orientedContainerTop)
            const camera = AdaptivityManager.currentCamera
            const cameraPositionTop = SpatialMetrics.get(this.orientedContainerTop).getPositionOf(camera, vectors.get())
            logo.layout.relative.min.z = (cameraPositionTop.y > 0) ? -0.5 : 0.5

            const layoutInfoText = `relative-min: ${JSON.stringify(logo.layout.relative.min, null, '\t')}
                                    relative-max: ${JSON.stringify(logo.layout.relative.max, null, '\t')}`
                                    // clip-min: ${JSON.stringify(logo.layout.clip.min, null, '\t')}
                                    // clip-max: ${JSON.stringify(logo.layout.clip.max, null, '\t')}`
                                    // orientation: ${JSON.stringify(this._euler.setFromQuaternion(logo.layout.orientation), null, '\t')}`
            if (this.currentInfoText !== layoutInfoText) {
                info.element.innerText = layoutInfoText
                this.currentInfoText = layoutInfoText
            }

            logo.update()
            info.update()
        })

        AdaptivityManager.addBehavior(this.etherealLogo, this.adaptiveOcclusion)
        AdaptivityManager.addBehavior(this.layoutInfo, new AdaptiveClippingBehavior)
    }
}