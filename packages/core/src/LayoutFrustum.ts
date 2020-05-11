import {tracked, memo} from './tracking'
import {MathUtils, Vector3, Matrix4} from './math'

export class LayoutFrustum {

    @tracked leftDegrees = -20
    @tracked rightDegrees = 20
    @tracked bottomDegrees = -20
    @tracked topDegrees = 20
    @tracked nearMeters = 0.5
    @tracked farMeters = 1000

    get horizontalDegrees() {
        return this.rightDegrees - this.leftDegrees 
    }

    get verticalDegrees() {
        return this.topDegrees - this.bottomDegrees 
    }

    @memo get leftMeters() {
        return this.nearMeters * Math.tan(this.leftDegrees * MathUtils.DEG2RAD)
    }

    @memo get rightMeters() {
        return this.nearMeters * Math.tan(this.rightDegrees * MathUtils.DEG2RAD)
    }

    @memo get bottomMeters() {
        return this.nearMeters * Math.tan(this.bottomDegrees * MathUtils.DEG2RAD)
    }

    @memo get topMeters() {
        return this.nearMeters * Math.tan(this.topDegrees * MathUtils.DEG2RAD)
    }

    get horizontalMeters() {
        return this.rightMeters - this.leftMeters 
    }

    get verticalMeters() {
        return this.topMeters - this.bottomMeters 
    }

    @memo get area() {
        return this.horizontalMeters * this.verticalMeters
    }

    get aspectRatio() {
        return this.verticalMeters / this.horizontalMeters
    }

    private _v1 = new Vector3
    private _inverseProjection = new Matrix4
    private _forwardDirection = new Vector3(0,0,-1)
    
    setFromPerspectiveProjectionMatrix(projectionMatrix: Matrix4) {
        const inverseProjection = this._inverseProjection.getInverse(projectionMatrix)
        const v = this._v1
        const forward = this._forwardDirection
        this.leftDegrees = -v.set(-1,0,-1).applyMatrix4(inverseProjection).angleTo(forward) * MathUtils.RAD2DEG
        this.rightDegrees = v.set(1,0,-1).applyMatrix4(inverseProjection).angleTo(forward) * MathUtils.RAD2DEG
        this.bottomDegrees = -v.set(0,-1,-1).applyMatrix4(inverseProjection).angleTo(forward) * MathUtils.RAD2DEG
        this.topDegrees = v.set(0,1,-1).applyMatrix4(inverseProjection).angleTo(forward) * MathUtils.RAD2DEG
        this.nearMeters = v.set(0,0,1).applyMatrix4(inverseProjection).z
        this.farMeters = v.set(0,0,-1).applyMatrix4(inverseProjection).z
        return this
    }

    @memo get perspectiveProjectionMatrix() {
        const near = this.nearMeters
        const far = this.farMeters
        const left = near * Math.tan(this.leftDegrees * MathUtils.DEG2RAD)
        const right = near * Math.tan(this.rightDegrees * MathUtils.DEG2RAD)
        const top = near * Math.tan(this.topDegrees * MathUtils.DEG2RAD)
        const bottom = near * Math.tan(this.bottomDegrees * MathUtils.DEG2RAD)
        return this.#perspective.makePerspective(
            left, right,
            bottom, top,
            near, far
        )
    }
    #perspective = new Matrix4
}