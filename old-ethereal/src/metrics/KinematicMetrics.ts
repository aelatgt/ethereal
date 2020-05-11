import * as THREE from 'three'
import {vectors, quaternions} from '../utils'

const EMA_PERIOD = 5

const IDENTITY_ROTATION = new THREE.Quaternion

export default class KinematicMetrics {

    /**
     * Linear velocity is meters per second
     */

    linearVelocity = new THREE.Vector3

    /**
     * Linear speed is meters per second
     */
    linearSpeed = 0

    /**
     * Angular velocity is radians per second
     */
    angularVelocity = new THREE.Quaternion

    /**
     * Angular speed is degrees per second
     */
    angularSpeed = 0

    private _vectorLastPosition = new THREE.Vector3
    private _vectorA = new THREE.Vector3
    private _vectorB = new THREE.Vector3
    private _quatLastOrientation = new THREE.Quaternion
    private _quatA = new THREE.Quaternion
    private _quatB = new THREE.Quaternion
    private _quatA2 = new THREE.Quaternion
    private _quatB2 = new THREE.Quaternion

    private _lastObjectPosition = new THREE.Vector3
    private _lastOriginPosition = new THREE.Vector3
    private _lastObjectOrientation = new THREE.Quaternion
    private _lastOriginOrientation = new THREE.Quaternion

    private _linearVelocityX = new ExponentialMovingAverage(EMA_PERIOD)
    private _linearVelocityY = new ExponentialMovingAverage(EMA_PERIOD)
    private _linearVelocityZ = new ExponentialMovingAverage(EMA_PERIOD)

    private _angularVelocityX = new ExponentialMovingAverage(EMA_PERIOD)
    private _angularVelocityY = new ExponentialMovingAverage(EMA_PERIOD)
    private _angularVelocityZ = new ExponentialMovingAverage(EMA_PERIOD)
    private _angularVelocityW = new ExponentialMovingAverage(EMA_PERIOD)

    constructor(public object: THREE.Object3D, public origin: THREE.Object3D) {
        this._lastObjectPosition.setFromMatrixPosition(this.object.matrixWorld)
        this._lastOriginPosition.setFromMatrixPosition(this.origin.matrixWorld)
    }

    update(deltaTime: number) {
        const lastObjectPosition = this._vectorLastPosition.copy(this._lastObjectPosition)
        const objectPosition = this._vectorA.setFromMatrixPosition(this.object.matrixWorld)
        this._lastObjectPosition.copy(objectPosition)
        const deltaObjectPosition = objectPosition.sub(lastObjectPosition)
        const objectVelocity = deltaObjectPosition.divideScalar(deltaTime)

        const lastOriginPosition = this._vectorLastPosition.copy(this._lastOriginPosition)
        const originPosition = this._vectorB.setFromMatrixPosition(this.origin.matrixWorld)
        this._lastOriginPosition.copy(originPosition)
        const deltaOriginPosition = originPosition.sub(lastOriginPosition)
        const originVelocity = deltaOriginPosition.divideScalar(deltaTime)

        const relativeVelocity = originVelocity.sub(objectVelocity)
        this._linearVelocityX.update(relativeVelocity.x)
        this._linearVelocityY.update(relativeVelocity.y)
        this._linearVelocityZ.update(relativeVelocity.z)

        this.linearVelocity.set(this._linearVelocityX.current, this._linearVelocityY.current, this._linearVelocityZ.current)
        this.linearSpeed = this.linearVelocity.length()

        const tempVec = vectors.get()
        const lastObjectOrientation = this._quatLastOrientation.copy(this._lastObjectOrientation)
        this.object.matrixWorld.decompose(tempVec, this._quatA, tempVec)
        const objectOrientation = this._quatA
        
        this._lastObjectOrientation.copy(objectOrientation)
        const deltaObjectOrientation = lastObjectOrientation.inverse().multiply(objectOrientation)
        const objectAngularVelocity = THREE.Quaternion
            .slerpUnclamped(IDENTITY_ROTATION, deltaObjectOrientation, this._quatA2, 1 / deltaTime )
        objectAngularVelocity.normalize()

        const lastOriginOrientation = this._quatLastOrientation.copy(this._lastOriginOrientation)
        this.origin.matrixWorld.decompose(tempVec, this._quatB, tempVec)
        const originOrientation = this._quatB
        vectors.pool(tempVec)

        this._lastOriginOrientation.copy(originOrientation)
        const deltaOriginOrientation = lastOriginOrientation.inverse().multiply(originOrientation)
        const originAngularVelocity = THREE.Quaternion
            .slerpUnclamped(IDENTITY_ROTATION, deltaOriginOrientation, this._quatB2, 1 / deltaTime )
        originAngularVelocity.normalize()

        const relativeAngularVelocity = originAngularVelocity.inverse().multiply(objectAngularVelocity).normalize()
        this._angularVelocityX.update(relativeAngularVelocity.x)
        this._angularVelocityY.update(relativeAngularVelocity.y)
        this._angularVelocityZ.update(relativeAngularVelocity.z)
        this._angularVelocityW.update(relativeAngularVelocity.w)

        this.angularVelocity.set(
            this._angularVelocityX.current,
            this._angularVelocityY.current,
            this._angularVelocityZ.current,
            this._angularVelocityW.current,
        )
        this.angularVelocity.normalize()
        this._angularVelocityX.current = this._angularVelocityX.current
        this._angularVelocityY.current = this._angularVelocityY.current
        this._angularVelocityZ.current = this._angularVelocityZ.current
        this._angularVelocityW.current = this._angularVelocityW.current
        this.angularSpeed = angleTo(IDENTITY_ROTATION, this.angularVelocity) * THREE.MathUtils.RAD2DEG
    }
}


function angleTo(q1: THREE.Quaternion, q2: THREE.Quaternion) {
    return 2 * Math.acos( Math.abs( THREE.MathUtils.clamp( q1.dot( q2 ), - 1, 1 ) ) )
}


declare module 'three/src/math/Quaternion' {
    interface Quaternion {
        _w: number; _x: number; _y: number; _z: number
        slerpUnclamped(q: Quaternion, t: number): Quaternion
    }

    namespace Quaternion {
        export function slerpUnclamped(qa: Quaternion, ab: Quaternion, qm: Quaternion, t: number): Quaternion
    }
}

THREE.Quaternion.slerpUnclamped = function(qa, qb, qm, t) {
    return qm.copy( qa ).slerpUnclamped( qb, t )
}


THREE.Quaternion.prototype.slerpUnclamped = function( this: THREE.Quaternion, qb, t ) {

    if ( t === 0 ) { return this }
    if ( t === 1 ) { return this.copy( qb ) }

    const x = this._x, y = this._y, z = this._z, w = this._w

    // http://www.euclideanspace.com/maths/algebra/realNormedAlgebra/quaternions/slerp/

    let cosHalfTheta = w * qb._w + x * qb._x + y * qb._y + z * qb._z

    if ( cosHalfTheta < 0 ) {

        this._w = - qb._w
        this._x = - qb._x
        this._y = - qb._y
        this._z = - qb._z

        cosHalfTheta = - cosHalfTheta

    } else {

        this.copy( qb )

    }

    // if ( cosHalfTheta >= 1.0 ) {

    //     this._w = w;
    //     this._x = x;
    //     this._y = y;
    //     this._z = z;

    //     return this;

    // }

    const sqrSinHalfTheta = 1.0 - cosHalfTheta * cosHalfTheta

    if ( sqrSinHalfTheta <= Number.EPSILON ) {

        const s = 1 - t
        this._w = s * w + t * this._w
        this._x = s * x + t * this._x
        this._y = s * y + t * this._y
        this._z = s * z + t * this._z

        return this.normalize()

    }

    const sinHalfTheta = Math.sqrt( sqrSinHalfTheta )
    const halfTheta = Math.atan2( sinHalfTheta, cosHalfTheta )
    const ratioA = Math.sin( ( 1 - t ) * halfTheta ) / sinHalfTheta,
        ratioB = Math.sin( t * halfTheta ) / sinHalfTheta

    this._w = ( w * ratioA + this._w * ratioB )
    this._x = ( x * ratioA + this._x * ratioB )
    this._y = ( y * ratioA + this._y * ratioB )
    this._z = ( z * ratioA + this._z * ratioB )

    this._onChangeCallback()

    return this

}

class ExponentialMovingAverage {

    current: number
    alpha: number

    constructor(timePeriods = 10, startingMean = 0) {
        this.current = startingMean
        this.alpha = 2 / (timePeriods + 1)
    }

    update(sample: number) {
        this.current = sample * this.alpha + (1-this.alpha) * this.current
    }
}
