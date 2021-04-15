import * as THREE from 'three';
export declare function makeTextSprite(message: string, parameters: {
    fontface?: string;
    fontsize?: number;
    padding?: number;
    borderThickness?: number;
    borderColor?: string;
    backgroundColor?: string;
    pixelRatio?: number;
}): THREE.Mesh<THREE.Geometry, THREE.MeshBasicMaterial>;
