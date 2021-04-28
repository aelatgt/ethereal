import { EtherealLayoutSystem, Node3D } from './EtherealLayoutSystem';
declare module 'three/src/core/Object3D' {
    interface Object3D extends Node3D {
    }
}
export declare class EtherealSystemMock extends EtherealLayoutSystem {
    constructor();
}
