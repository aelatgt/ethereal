import * as THREE from 'three'

export class LayoutHelper extends THREE.Object3D {

    private _transitional = new THREE.Object3D 
    private _transitionalBoxHelper = new THREE.Box3Helper(this._transitional.layout.inner)
    private _target = new THREE.Object3D 
    private _targetBoxHelper = new THREE.Box3Helper(this._target.layout.inner)

    constructor() {
        super()
        this.add(this._transitional)
        this._transitional.layout.innerAutoUpdate = false
        this._transitional.layout.forceBoundsExclusion = true
        this._transitional.add(this._transitionalBoxHelper)
        this._transitionalBoxHelper.layout.forceBoundsExclusion = true
        this.add(this._target)
        this._target.layout.innerAutoUpdate = false
        this._target.layout.forceBoundsExclusion = true
        this._target.add(this._targetBoxHelper)
        this._targetBoxHelper.layout.forceBoundsExclusion = true
        ;(this._targetBoxHelper.material as THREE.LineBasicMaterial).color.setStyle('magenta')
    }

    updateWorldMatrix(parents:boolean, children:boolean, layout?:boolean) {
        super.updateWorldMatrix(parents, children, layout)
        if (this.parent) {
            this._target.layout.inner.copy(this.parent.layout.computedInnerBounds)
            this._target.matrixWorld.copy(this.parent.transitioner.matrixWorldTarget)
            this._targetBoxHelper.updateMatrixWorld()
            this._transitional.layout.inner.copy(this.parent.layout.computedInnerBounds)
            this._transitional.updateMatrixWorld()
        }
    }

}