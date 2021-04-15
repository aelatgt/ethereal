import * as THREE from 'three';
import * as CANNON from 'cannon';
import App from '../App';
interface Annotation {
    text: string;
    anchorPoint: [number, number, number];
}
export default class Treadmill {
    app: App;
    snubberObject: THREE.Object3D;
    private _snubberRoot;
    grid: THREE.GridHelper;
    lineMaterial: THREE.LineBasicMaterial;
    _scratchMatrix: THREE.Matrix4;
    annotations: Annotation[];
    annotationState: Map<Annotation, {
        spring: CANNON.Spring;
        anchorBody: CANNON.Body;
        annotationBody: CANNON.Body;
        anchorObject: THREE.Object3D;
        contentObject: THREE.Mesh;
        annotationObject: THREE.Object3D;
        lineDepthWriting: THREE.Line;
        line: THREE.Line;
    }>;
    treadmillAnchorObject?: THREE.Object3D;
    stlLoader: THREE.BufferGeometryLoader;
    snubberMeshPromise: Promise<THREE.Mesh>;
    snubberMesh?: THREE.Mesh;
    physicsWorld: CANNON.World;
    CENTRAL_REPULSION_FORCE: number;
    VIEW_DEPENDENT_REPULSION_FORCE: number;
    ANNOTATION_REPULSION_FACTOR: number;
    VIEW_DEPENDENT_ANNOTATION_REPULSION_FACTOR: number;
    _force: CANNON.Vec3;
    _cameraWorldPosition: THREE.Vector3;
    _directionA: THREE.Vector3;
    _directionB: THREE.Vector3;
    constructor(app: App);
    snubberTargetPosition: THREE.Vector3;
    initDefault(): void;
    enterXR(evt: any): Promise<void>;
    update(event: any): void;
}
export {};
