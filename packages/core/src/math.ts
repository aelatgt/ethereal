export * from 'three/src/math/Vector2'
export * from 'three/src/math/Vector3'
export * from 'three/src/math/Vector4'
export * from 'three/src/math/Quaternion'
export * from 'three/src/math/Matrix3'
export * from 'three/src/math/Matrix4'
export * from 'three/src/math/Box3'
export * from 'three/src/math/Frustum'
export * from 'three/src/math/Ray'
export * from 'three/src/math/Plane'
export * from 'three/src/math/MathUtils'
export * from 'three/src/math/Color'
// export * from './SphericalCoordinate'

import {Vector2} from 'three/src/math/Vector2'
import {Vector3} from 'three/src/math/Vector3'
import {Quaternion} from 'three/src/math/Quaternion'
export const V_00 = Object.freeze(new Vector2(0,0))
export const V_11 = Object.freeze(new Vector2(1,1))
export const V_000 = Object.freeze(new Vector3(0,0,0))
export const V_100 = Object.freeze(new Vector3(1,0,0))
export const V_010 = Object.freeze(new Vector3(0,1,0))
export const V_001 = Object.freeze(new Vector3(0,0,1))
export const V_111 = Object.freeze(new Vector3(1,1,1))
export const Q_IDENTITY = Object.freeze(new Quaternion)