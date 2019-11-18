import * as THREE from 'three';
export declare class LayoutHelper extends THREE.Object3D {
    private _transitional;
    private _transitionalBoxHelper;
    private _target;
    private _targetBoxHelper;
    constructor();
    updateWorldMatrix(parents: boolean, children: boolean, layout?: boolean): void;
}
