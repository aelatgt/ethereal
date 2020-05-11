import * as THREE from 'three'
import {Layout} from './Layout'

export class LayoutHelper extends THREE.Object3D {

    private _transitional = new THREE.Object3D 
    private _transitionalBoxHelper = new THREE.Box3Helper(this._transitional.layout.inner)

    private _bounds = new THREE.Object3D 
    private _boundsBoxHelper = new THREE.Box3Helper(this._bounds.layout.inner)

    private _boundsPreClip = new THREE.Object3D 
    private _boundsPreClipBoxHelper = new THREE.Box3Helper(this._boundsPreClip.layout.inner)

    private _boundsPreFit = new THREE.Object3D 
    private _boundsPreFitBoxHelper = new THREE.Box3Helper(this._boundsPreFit.layout.inner)

    private _matrixPreClip = new THREE.Matrix4
    private _matrixPreFit = new THREE.Matrix4

    constructor() {
        super()

        const startColor = new THREE.Color('magenta')

        this._boundsPreClip.add(this._boundsPreClipBoxHelper)
        // ;(this._boundsPreClipBoxHelper.material as THREE.LineBasicMaterial).color.setStyle('cyan')
        ;(this._boundsPreClipBoxHelper.material as THREE.LineBasicMaterial).color.lerpHSL(startColor, 1)

        this._boundsPreFit.add(this._boundsPreFitBoxHelper)
        // ;(this._boundsPreFitBoxHelper.material as THREE.LineBasicMaterial).color.setStyle('magenta')
        ;(this._boundsPreFitBoxHelper.material as THREE.LineBasicMaterial).color.lerpHSL(startColor, 2/3)

        this._bounds.add(this._boundsBoxHelper)
        // ;(this._boundsBoxHelper.material as THREE.LineBasicMaterial).color.setStyle('green')
        ;(this._boundsBoxHelper.material as THREE.LineBasicMaterial).color.lerpHSL(startColor, 1/3)

        this._transitional.add(this._transitionalBoxHelper)
        this._transitional.renderOrder = 1
    }

    updateWorldMatrix(parents:boolean, children:boolean, layout?:boolean) {
        super.updateWorldMatrix(parents, children, layout)
        if (this.parent) {
            const target = this.parent
            const targetParent = target.parent
            const layout = target.layout

            if (!layout.hasInnerBounds()) {
                if (this._bounds.parent) {
                    this.remove(this._boundsPreClip)
                    this.remove(this._boundsPreFit)
                    this.remove(this._bounds)
                    this.remove(this._transitional)
                }
                return
            } else if (!this._bounds.parent) {
                this.add(this._boundsPreClip)
                this.add(this._boundsPreFit)
                this.add(this._bounds)
                this.add(this._transitional)
            }

            Layout.getMatrixFromBounds(layout.orientation, layout.computedInnerBounds, layout.computedBoundsPreClip, this._matrixPreClip)
            Layout.getMatrixFromBounds(layout.orientation, layout.computedInnerBounds, layout.computedBoundsPreFit, this._matrixPreFit)

            let b = this._boundsPreClip
            targetParent ? b.matrixWorld.copy(targetParent.transitioner.matrixWorldTarget) : b.matrixWorld.identity()
            b.matrixWorld.multiply(target.matrix).multiply(this._matrixPreClip)
            this._boundsPreClipBoxHelper.box.copy(layout.computedInnerBounds)
            this._boundsPreClipBoxHelper.updateMatrixWorld()

            b = this._boundsPreFit
            targetParent ? b.matrixWorld.copy(targetParent.transitioner.matrixWorldTarget) : b.matrixWorld.identity()
            b.matrixWorld.multiply(target.matrix).multiply(this._matrixPreFit)
            this._boundsPreFitBoxHelper.box.copy(layout.computedInnerBounds)
            this._boundsPreFitBoxHelper.updateMatrixWorld()

            b = this._bounds            
            targetParent ? b.matrixWorld.copy(targetParent.transitioner.matrixWorldTarget) : b.matrixWorld.identity()
            b.matrixWorld.multiply(target.matrix).multiply(layout.matrix)
            this._boundsBoxHelper.box.copy(layout.computedInnerBounds)
            this._boundsBoxHelper.updateMatrixWorld()
            
            this._transitional.matrixWorld.copy(target.matrixWorld)
            this._transitionalBoxHelper.box.copy(layout.computedInnerBounds)
            this._transitionalBoxHelper.updateMatrixWorld()
        }
    }

}