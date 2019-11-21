import * as THREE from 'three';
import { Behavior } from './Behavior';
export declare class AdaptiveClippingBehavior extends Behavior {
    private _boxA;
    private _boxB;
    private _visualFrustum;
    private _frustum;
    private _line;
    private _corners;
    private _newCorners;
    private _intersectionCornerMap;
    occluders: THREE.Object3D[];
    occluderInfluenceDelay: number;
    occlusionTime: WeakMap<THREE.Object3D, number>;
    update(deltaTime: number): void;
    postUpdate(): void;
}
