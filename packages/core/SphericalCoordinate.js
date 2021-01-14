import { Vector3, MathUtils } from './math-utils';
const scratchVector3 = new Vector3;
export class SphericalCoordinate {
    constructor(horizontalRadians = 0, verticalRadians = 0, distance = 0) {
        this.horizontalRadians = horizontalRadians;
        this.verticalRadians = verticalRadians;
        this.distance = distance;
    }
    get horizontalDegrees() {
        return this.horizontalRadians * MathUtils.RAD2DEG;
    }
    set horizontalDegrees(h) {
        this.horizontalRadians = h * MathUtils.DEG2RAD;
    }
    get verticalDegrees() {
        return this.verticalRadians * MathUtils.RAD2DEG;
    }
    set verticalDegrees(h) {
        this.verticalRadians = h * MathUtils.DEG2RAD;
    }
    setWithRadians(horizontal, vertical, distance) {
        this.horizontalRadians = horizontal;
        this.verticalRadians = vertical;
        this.distance = distance;
        return this;
    }
    setWithDegrees(horizontal, vertical, distance) {
        this.horizontalDegrees = horizontal;
        this.verticalDegrees = vertical;
        this.distance = distance;
        return this;
    }
    fromCartesianDirection(cartesian) {
        const direction = scratchVector3.copy(cartesian).normalize();
        this.verticalRadians = Math.asin(direction.y) * MathUtils.RAD2DEG;
        this.horizontalRadians = Math.atan2(direction.x, -direction.z) * MathUtils.RAD2DEG;
        this.distance = 0;
        return this;
    }
    fromCartesianPosition(cartesian) {
        this.fromCartesianDirection(cartesian);
        this.distance = cartesian.length();
        return this;
    }
    toCartesianDirection(out) {
        const visualElevationRadians = this.verticalRadians;
        const visualAzimuthRadians = -Math.PI - this.horizontalRadians;
        const y = Math.sin(visualElevationRadians);
        const x = Math.cos(visualElevationRadians) * Math.sin(visualAzimuthRadians);
        const z = -Math.cos(visualElevationRadians) * Math.cos(visualAzimuthRadians);
        return out.set(x, y, z).normalize();
    }
    toCartesianPosition(out) {
        return this.toCartesianDirection(out).multiplyScalar(this.distance);
    }
}
