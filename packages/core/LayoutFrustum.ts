import {tracked, cached} from './tracking'
import {MathUtils, Vector3, Matrix4} from './math'

export class LayoutFrustum {

    isLayoutFrustum = true

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

    @cached get leftMeters() {
        return this.nearMeters * Math.tan(this.leftDegrees * MathUtils.DEG2RAD)
    }

    @cached get rightMeters() {
        return this.nearMeters * Math.tan(this.rightDegrees * MathUtils.DEG2RAD)
    }

    @cached get bottomMeters() {
        return this.nearMeters * Math.tan(this.bottomDegrees * MathUtils.DEG2RAD)
    }

    @cached get topMeters() {
        return this.nearMeters * Math.tan(this.topDegrees * MathUtils.DEG2RAD)
    }

    @cached get depthMeters() {
        return this.nearMeters - this.farMeters 
    }

    get horizontalMeters() {
        return this.rightMeters - this.leftMeters 
    }

    get verticalMeters() {
        return this.topMeters - this.bottomMeters 
    }

    @cached get centerDegrees() {
        return this.#centerDegrees.set(this.horizontalDegrees, this.verticalDegrees, this.depthMeters)
    }
    #centerDegrees = new Vector3

    @cached get centerMeters() {
        return this.#centerMeters.set(this.horizontalMeters, this.verticalMeters, this.depthMeters)
    }
    #centerMeters = new Vector3

    @cached get area() {
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
        const leftDegrees = -v.set(-1,0,-1).applyMatrix4(inverseProjection).angleTo(forward) * MathUtils.RAD2DEG
        const rightDegrees = v.set(1,0,-1).applyMatrix4(inverseProjection).angleTo(forward) * MathUtils.RAD2DEG
        const bottomDegrees = -v.set(0,-1,-1).applyMatrix4(inverseProjection).angleTo(forward) * MathUtils.RAD2DEG
        const topDegrees = v.set(0,1,-1).applyMatrix4(inverseProjection).angleTo(forward) * MathUtils.RAD2DEG
        const nearMeters = v.set(0,0,1).applyMatrix4(inverseProjection).z
        const farMeters = v.set(0,0,-1).applyMatrix4(inverseProjection).z
        if (this.leftDegrees !== leftDegrees) this.leftDegrees = leftDegrees
        if (this.rightDegrees !== rightDegrees) this.rightDegrees = rightDegrees
        if (this.bottomDegrees !== bottomDegrees) this.bottomDegrees = bottomDegrees
        if (this.topDegrees !== topDegrees) this.topDegrees = topDegrees
        if (this.nearMeters !== nearMeters) this.nearMeters = nearMeters
        if (this.farMeters !== farMeters) this.farMeters = farMeters
        return this
    }

    @cached get perspectiveProjectionMatrix() {
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