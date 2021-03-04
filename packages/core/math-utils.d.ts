import { Vector2 } from 'three/src/math/Vector2';
import { Vector3 } from 'three/src/math/Vector3';
import { Vector4 } from 'three/src/math/Vector4';
import { Quaternion } from 'three/src/math/Quaternion';
import { Euler } from 'three/src/math/Euler';
import { Color } from 'three/src/math/Color';
import { Box2 } from 'three/src/math/Box2';
import { Box3 } from 'three/src/math/Box3';
import { Ray } from 'three/src/math/Ray';
import { Line3 } from 'three/src/math/Line3';
import { Plane } from 'three/src/math/Plane';
export declare const V_00: Readonly<Vector2>;
export declare const V_11: Readonly<Vector2>;
export declare const V_000: Readonly<Vector3>;
export declare const V_100: Readonly<Vector3>;
export declare const V_010: Readonly<Vector3>;
export declare const V_001: Readonly<Vector3>;
export declare const V_111: Readonly<Vector3>;
export declare const Q_IDENTITY: Readonly<Quaternion>;
export declare const DIRECTION: {
    RIGHT: Readonly<Vector3>;
    UP: Readonly<Vector3>;
    NEAR: Readonly<Vector3>;
    LEFT: Readonly<Vector3>;
    DOWN: Readonly<Vector3>;
    FAR: Readonly<Vector3>;
};
export { Vector2, Vector3, Vector4, Quaternion, Euler, Color, Box2, Box3, Ray, Line3, Plane, };
export * from 'three/src/math/Matrix3';
export * from 'three/src/math/Matrix4';
export * from 'three/src/math/MathUtils';
export declare function computeRelativeDifference<T extends MathType = MathType>(start: T, end: T): number;
export declare type MathType = number | Vector2 | Vector3 | Color | Quaternion | Box3;
/**
 * Return random number with gaussian distribution
 * @param [standardDeviation=1]
 */
export declare const gaussian: (standardDeviation?: number) => number;
/**
 * Return random number with levy distribution
 * @param [scale=1]
 *
 * Based on:
 * http://andreweckford.blogspot.com/2011/05/generating-levy-random-variables-from.html
 */
export declare const levy: (scale?: number) => number;
/**
 * Return a random quaternion
 * @param out
 * @param twistScale
 * @param swingScale
 */
export declare const randomQuaternion: (twistScale?: number, swingScale?: number) => Quaternion;
export declare function randomSelect<T>(arr: T[], weights?: number[]): T;
/**
 * Use the swing-twist decomposition to get the component of a rotation
 * around the given axis.
 *
 * @param rotation  The rotation.
 * @param direction The axis (should be normalized).
 * @return The component of rotation about the axis.
 */
export declare const extractRotationAboutAxis: (rot: Quaternion, direction: Vector3, out: Quaternion) => Quaternion;
