import WebLayer3D from 'three-web-layer';
import * as THREE from 'three';
import { DemoBase } from './DemoBase';
import { AdaptiveClippingBehavior } from '../../src/';
export declare class GlobalAdaptivityDemo extends DemoBase {
    orientedContainerTop: THREE.Object3D;
    etherealLogo: WebLayer3D;
    layoutInfo: WebLayer3D;
    _euler: THREE.Euler;
    currentInfoText: string;
    adaptiveOcclusion: AdaptiveClippingBehavior;
    constructor();
}
