import * as THREE from 'three';
export declare const V_00: Readonly<THREE.Vector2>;
export declare const V_11: Readonly<THREE.Vector2>;
export declare const V_000: Readonly<THREE.Vector3>;
export declare const V_100: Readonly<THREE.Vector3>;
export declare const V_010: Readonly<THREE.Vector3>;
export declare const V_001: Readonly<THREE.Vector3>;
export declare const V_111: Readonly<THREE.Vector3>;
export declare const Q_IDENTITY: Readonly<THREE.Quaternion>;
export declare class Pool<T> {
    private _factory;
    private _reset;
    constructor(_factory: () => T, _reset: (t: T) => T);
    private _pool;
    private _unpooled;
    private _nextAutoPool?;
    get(): T;
    pool(o: T): void;
    private _poolAll;
    private _autoPool;
}
export declare const vectors2: Pool<THREE.Vector2>;
export declare const vectors: Pool<THREE.Vector3>;
export declare const vectors4: Pool<THREE.Vector4>;
export declare const quaternions: Pool<THREE.Quaternion>;
export declare const matrices3: Pool<THREE.Matrix3>;
export declare const matrices: Pool<THREE.Matrix4>;
export declare function traverse(object: THREE.Object3D, each: (node: THREE.Object3D) => boolean, bind?: any): void;
