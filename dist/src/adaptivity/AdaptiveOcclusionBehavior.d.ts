import * as THREE from 'three';
import { Behavior } from './Behavior';
export declare class AdaptiveClippingBehavior extends Behavior {
    private _boxA;
    private _boxB;
    occluders: THREE.Object3D[];
    occluderInfluenceDelay: number;
    occlusionTime: WeakMap<THREE.Object3D, number>;
    update(deltaTime: number): void;
    postUpdate(): void;
}
