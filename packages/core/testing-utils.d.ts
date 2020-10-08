import { EtherealSystem, Node3D } from './EtherealSystem';
declare module 'three/src/core/Object3D' {
    interface Object3D extends Node3D {
    }
}
export declare class EtherealSystemMock extends EtherealSystem {
    constructor();
}
