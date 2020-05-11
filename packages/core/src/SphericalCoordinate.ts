

import {Vector3, MathUtils} from './math'

const scratchVector3 = new Vector3

export class SphericalCoordinate {

    constructor(
        public horizontal:number = 0,
        public vertical:number = 0,
        public distance:number = 0
    ){}

    get horizontalDegrees() {
        return this.horizontal * MathUtils.RAD2DEG
    }

    get verticalDegrees() {
        return this.vertical * MathUtils.RAD2DEG
    }

    set(horizontal:number, vertical:number, distance:number) {
        this.horizontal = horizontal
        this.vertical = vertical
        this.distance = distance
        return this
    }

    fromCartesianDirection(cartesian: Vector3) {
        const direction = scratchVector3.copy(cartesian).normalize()
        this.vertical = Math.asin(direction.y) * MathUtils.RAD2DEG
        this.horizontal = Math.atan2(direction.x, -direction.z) * MathUtils.RAD2DEG
        this.distance = 0
        return this
    }

    fromCartesianPosition(cartesian: Vector3) {
        this.fromCartesianDirection(cartesian)
        this.distance = cartesian.length()
        return this
    }

    toCartesianDirection(out: Vector3) { 
        const visualElevationRadians = this.vertical
        const visualAzimuthRadians = this.horizontal
        const y = Math.sin(visualElevationRadians)
        const x = Math.cos(visualElevationRadians) * Math.sin(visualAzimuthRadians)
        const z = - Math.cos(visualElevationRadians) * Math.cos(visualAzimuthRadians)
        return out.set(x, y, z).normalize()
    }

    toCartesianPosition(out: Vector3) {
        return this.toCartesianDirection(out).multiplyScalar(this.distance)
    }

}