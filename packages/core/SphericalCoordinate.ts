

import {Vector3, MathUtils} from './math-utils'

const scratchVector3 = new Vector3

export class SphericalCoordinate {

    constructor(
        public horizontalRadians:number = 0,
        public verticalRadians:number = 0,
        public distance:number = 0
    ){}

    get horizontalDegrees() {
        return this.horizontalRadians * MathUtils.RAD2DEG
    }

    set horizontalDegrees(h:number) {
        this.horizontalRadians = h * MathUtils.DEG2RAD
    }

    get verticalDegrees() {
        return this.verticalRadians * MathUtils.RAD2DEG
    }

    set verticalDegrees(h:number) {
        this.verticalRadians = h * MathUtils.DEG2RAD
    }

    setWithRadians(horizontal:number, vertical:number, distance:number) {
        this.horizontalRadians = horizontal
        this.verticalRadians = vertical
        this.distance = distance
        return this
    }

    setWithDegrees(horizontal:number, vertical:number, distance:number) {
        this.horizontalDegrees = horizontal
        this.verticalDegrees = vertical
        this.distance = distance
        return this
    }

    fromCartesianDirection(cartesian: Vector3) {
        const direction = scratchVector3.copy(cartesian).normalize()
        this.verticalRadians = Math.asin(direction.y) * MathUtils.RAD2DEG
        this.horizontalRadians = Math.atan2(direction.x, -direction.z) * MathUtils.RAD2DEG
        this.distance = 0
        return this
    }

    fromCartesianPosition(cartesian: Vector3) {
        this.fromCartesianDirection(cartesian)
        this.distance = cartesian.length()
        return this
    }

    toCartesianDirection(out: Vector3) { 
        const visualElevationRadians = this.verticalRadians
        const visualAzimuthRadians = - Math.PI - this.horizontalRadians
        const y = Math.sin(visualElevationRadians)
        const x = Math.cos(visualElevationRadians) * Math.sin(visualAzimuthRadians)
        const z = - Math.cos(visualElevationRadians) * Math.cos(visualAzimuthRadians)
        return out.set(x, y, z).normalize()
    }

    toCartesianPosition(out: Vector3) {
        return this.toCartesianDirection(out).multiplyScalar(this.distance)
    }

}