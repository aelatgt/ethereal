import * as THREE from 'three';
import { DemoBase } from './DemoBase';
import { DemoApp } from '../DemoApp';
import { WebLayer3D } from 'ethereal';
export declare class GlobalAdaptivityDemo extends DemoBase {
    app: DemoApp;
    orientedContainerTop: THREE.Object3D;
    logoLayer: WebLayer3D;
    infoLayer: WebLayer3D;
    logoOccluders: THREE.Object3D[];
    _euler: THREE.Euler;
    currentInfoText: string;
    constructor(app: DemoApp);
}
