import {Vector2} from 'three/src/math/Vector2'
import {Vector3} from 'three/src/math/Vector3'
import {Vector4} from 'three/src/math/Vector4'
import {Quaternion} from 'three/src/math/Quaternion'
import {Color} from 'three/src/math/Color'
import {Box2} from 'three/src/math/Box2'
import {Box3} from 'three/src/math/Box3'
import {Ray} from 'three/src/math/Ray'
import {Line3} from 'three/src/math/Line3'
import {Plane} from 'three/src/math/Plane'
// import {Matrix3} from 'three/src/math/Matrix3'
// import {Matrix4} from 'three/src/math/Matrix4'


// export class PropertyIterator<T = any> implements Iterator<number> {
//     constructor(private _obj:T, private _keys:ReadonlyArray<keyof T>) {}
//     private _idx = 0
//     next() : IteratorResult<number, number> {
//         return {
//             done: this._idx === (Vector2Keys.length - 1),
//             value: this._obj[this._keys[this._idx++]] as any
//         }
//     }
// }

// declare module 'three/src/math/Vector2' {
//     interface Vector2 {
//         [Symbol.iterator](): PropertyIterator
//     }
// }
// const Vector2Keys = ['x','y'] as const
// Vector2.prototype[Symbol.iterator] = function () {
//     return new PropertyIterator(this, Vector2Keys)
// }

// declare module 'three/src/math/Vector3' {
//     interface Vector3 {
//         [Symbol.iterator](): PropertyIterator
//     }
// }
// const Vector3Keys = ['x','y','z'] as const
// Vector3.prototype[Symbol.iterator] = function () {
//     return new PropertyIterator(this, Vector3Keys)
// }

// declare module 'three/src/math/Quaternion' {
//     interface Quaternion {
//         [Symbol.iterator](): PropertyIterator
//     }
// }
// const QuaternionKeys = ['x','y','z'] as const
// Quaternion.prototype[Symbol.iterator] = function () {
//     return new PropertyIterator(this, QuaternionKeys)
// }

// import {tracked} from './tracking'
// tracked(Vector2.prototype, 'x')
// tracked(Vector2.prototype, 'y')
// tracked(Vector3.prototype, 'x')
// tracked(Vector3.prototype, 'y')
// tracked(Vector3.prototype, 'z')
// tracked(Vector4.prototype, 'x')
// tracked(Vector4.prototype, 'y')
// tracked(Vector4.prototype, 'z')
// tracked(Vector4.prototype, 'w')
// tracked(Quaternion.prototype, '_x')
// tracked(Quaternion.prototype, '_y')
// tracked(Quaternion.prototype, '_z')
// tracked(Quaternion.prototype, '_w')
// tracked(Color.prototype, 'r')
// tracked(Color.prototype, 'g')
// tracked(Color.prototype, 'b')

export const V_00 = Object.freeze(new Vector2(0,0))
export const V_11 = Object.freeze(new Vector2(1,1))
export const V_000 = Object.freeze(new Vector3(0,0,0))
export const V_100 = Object.freeze(new Vector3(1,0,0))
export const V_010 = Object.freeze(new Vector3(0,1,0))
export const V_001 = Object.freeze(new Vector3(0,0,1))
export const V_111 = Object.freeze(new Vector3(1,1,1))
export const Q_IDENTITY = Object.freeze(new Quaternion)

export const DIRECTION = {
    RIGHT: Object.freeze(new Vector3(1, 0, 0)),
    UP: Object.freeze(new Vector3(0, 1, 0)),
    NEAR: Object.freeze(new Vector3(0, 0, 1)),
    LEFT: Object.freeze(new Vector3(-1, 0, 0)),
    DOWN: Object.freeze(new Vector3(0, -1, 0)),
    FAR: Object.freeze(new Vector3(0, 0, -1))
}

// declare module 'three/src/math/Box3' {
//     interface Box3 {
//         left:number
//         right:number
//         bottom:number
//         top:number
//         center:Vector3
//     }
// }

// Object.defineProperty(Box3.prototype, 'left', {
//     get(this:Box3) {
//         return this.min.x
//     }
// })

// Object.defineProperty(Box3.prototype, 'right', {
//     get(this:Box3) {
//         return this.max.x
//     }
// })

// Object.defineProperty(Box3.prototype, 'top', {
//     get(this:Box3) {
//         return this.min.y
//     }
// })

// Object.defineProperty(Box3.prototype, 'bottom', {
//     get(this:Box3) {
//         return this.max.y
//     }
// })

// const centerMap = new WeakMap<Box3>()
// Object.defineProperty(Box3.prototype, 'center', {
//     get(this:Box3) {
//         if (!centerMap.has(this)) centerMap.set(this, new Vector3)
//         return this.getCenter(centerMap.get(this))
//     }
// })

// const sizeMap = new WeakMap<Box3>()
// Object.defineProperty(Box3.prototype, 'size', {
//     get(this:Box3) {
//         if (!sizeMap.has(this)) sizeMap.set(this, new Vector3)
//         return this.getSize(sizeMap.get(this))
//     }
// })

export {
    Vector2,
    Vector3,
    Vector4,
    Quaternion,
    Color,
    Box2,
    Box3,
    Ray,
    Line3,
    Plane,
}


// export interface Vector2Like {x:number, y:number}
// export interface Vector3Like {x:number, y:number, z:number}
// export interface Vector4Like {x:number, y:number, z:number, w:number}
// export interface QuaternionLike {x:number, y:number, z:number, w:number}
// export interface ColorLike {r:number, g:number, b:number}
// export interface Box3Like {min:Vector3Like, max:Vector3Like}
// export interface RayLike {origin:Vector3Like, direction:Vector3Like}

export * from 'three/src/math/Matrix3'
export * from 'three/src/math/Matrix4'
export * from 'three/src/math/MathUtils'

/*
* The relative difference is a unitless scalar measure of the difference
* between the `target` value and the previous target value (staged or committed)
* @see https://en.wikipedia.org/wiki/Relative_change_and_difference
* 
* Exactly how relative difference is calculated is based on the value type:

* number - linear distance between / avg absolute value
* vector - linear distance between / avg magnitude
* box - avg corresponding corner distances / avg size magnitude
* quaternion - angular distance between / max angular distance (180 deg)
* color - avg rgb distance / max rgb distance (white = sqrt(3))
* 
* If there is no change, the relative difference is 0
* Otherwise, the relative difference is positive. 
*/
export function computeRelativeDifference<T extends MathType = MathType>(start:T, end:T) {
    if (typeof start === 'number') return computedRelativeDifferenceNumber(start, end as number)    
    if ('isVector3' in start) return computedRelativeDifferenceVector3(start as Vector3, end as Vector3)    
    if ('isVector2' in start) return computedRelativeDifferenceVector2(start as Vector2, end as Vector2)    
    if ('isBox3' in start) return computedRelativeDifferenceBox3(start as Box3, end as Box3)
    // the following types are naturally bounded,
    // so instead of dividing by average magnitudes,
    // we can simply divide by the maximum distance 
    // between any two possible values
    if ('isQuaternion' in start) return computedRelativeDifferenceQuaternion(start as Quaternion, end as Quaternion)
    if ('isColor' in start) return computedRelativeDifferenceColor(start as Color, end as Color)
    return Infinity
}
export type MathType = number|Vector2|Vector3|Color|Quaternion|Box3


function computedRelativeDifferenceNumber(s:number, e:number) {
    if (e === s) return 0
    const distance = Math.abs(e-s)
    const avgAbsoluteValue = ((Math.abs(e) + Math.abs(s))/2)
    return distance / avgAbsoluteValue
}

function computedRelativeDifferenceVector3(s:THREE.Vector3,e:THREE.Vector3) {
    if (e.equals(s)) return 0
    const distance = e.distanceTo(s)
    const avgMagnitude = (e.length() + s.length())/2
    return distance / avgMagnitude
}

function computedRelativeDifferenceVector2(s:THREE.Vector2,e:THREE.Vector2) {
    if (e.equals(s)) return 0
    const distance = e.distanceTo(s)
    const avgMagnitude = (e.length() + s.length())/2
    return distance / avgMagnitude
}

function computedRelativeDifferenceBox3(s:Box3, e:Box3) {
    if (s.equals(e)) return 0
    const v = scratchV3
    const minDist = e.min.distanceTo(s.min)
    const maxDist = e.max.distanceTo(s.max)
    const avgDistance = (minDist + maxDist) / 2
    const avgSizeMagnitude = (e.getSize(v).length() + s.getSize(v).length()) / 2
    return avgDistance / avgSizeMagnitude
}
const scratchV3 = new Vector3

function computedRelativeDifferenceQuaternion(s:Quaternion, e:Quaternion) {
    if (s.equals(e)) return 0
    return s.angleTo(e) / Math.PI
}

function computedRelativeDifferenceColor(s:Color, e:Color) {
    if (s.equals(e)) return 0
    const v = scratchV3
    const distance = v.set(
        Math.abs(e.r - s.r),
        Math.abs(e.g - s.g), 
        Math.abs(e.b - s.b)
    ).length()
    return distance / sqrt3
}
const sqrt3 = Math.sqrt(3)



/** 
 * Return random number with gaussian distribution
 * @param [standardDeviation=1]
 */
export const gaussian = (standardDeviation=1) => {
  var u = Math.random()
  return (u%1e-8>5e-9?1:-1)*Math.sqrt(-Math.log(Math.max(1e-9,u)))*standardDeviation;
}
// export const gaussian = (() => {
//     const _2PI = Math.PI
//     let z0:number, z1:number
//     let generate = false
//     return (standardDeviation=1) => {
//         generate = !generate
//         if (!generate) return z1 * standardDeviation
//         let u1:number, u2:number
//         do { u1 = Math.random() } while (u1 < Number.EPSILON)
//         u2 = Math.random()
//         z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(_2PI * u2)
//         z1 = Math.sqrt(-2.0 * Math.log(u1)) * Math.sin(_2PI * u2)
//         return z0 * standardDeviation
//     }
// })()

/**
 * Return random number with levy distribution
 * @param [scale=1]
 * 
 * Based on:
 * http://andreweckford.blogspot.com/2011/05/generating-levy-random-variables-from.html
 */
export const levy = (scale=1) =>  {
    const stdDeviation = Math.sqrt( Math.sqrt(1 / (2 * scale)) )
    return 1 / (gaussian(stdDeviation) ** 2)
}

/**
 * Return a random quaternion
 * @param out 
 * @param twistScale 
 * @param swingScale 
 */
export const randomQuaternion = (() => {
    const _2PI = Math.PI * 2
    const V_001 = new Vector3(0,0,1)
    const twist = new Quaternion
    const swing = new Quaternion
    const swingAxis = new Vector3
    const out = new Quaternion
    return function randomQuaternion(twistScale=1, swingScale=1) {
        var twistMagnitude = (Math.random() - 0.5) * _2PI * twistScale 
        var swingDirection = Math.random() * _2PI
        var swingMagnitude = Math.random() * Math.PI * swingScale
        swingAxis.set(1,0,0).applyAxisAngle(V_001, swingDirection)
        twist.setFromAxisAngle(V_001, twistMagnitude)
        swing.setFromAxisAngle(swingAxis, swingMagnitude)
        return out.multiplyQuaternions(swing, twist)
    }
})()


export function randomSelect<T>(arr:T[], weights?:number[]) : T {
    let total = 0
    for (let i=0; i< arr.length; i++) { total += weights?.[i]||1 }
    const threshold = Math.random() * total
    total = 0
    for (let i=0; i< arr.length; i++) {
        total += weights?.[i]||1
        if (total > threshold) return arr[i]
    }
    return arr[0] // make tsc happy
}