/**
 * @author Mugen87 / https://github.com/Mugen87
 *
 * adapted for Typescript by Gheric Speiginer
 */
import * as THREE from 'three';
export declare class ConvexGeometry extends THREE.Geometry {
    points: THREE.Vector3[];
    constructor(points: THREE.Vector3[]);
}
export declare class ConvexBufferGeometry extends THREE.BufferGeometry {
    points: THREE.Vector3[];
    constructor(points: THREE.Vector3[]);
}
