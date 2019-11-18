export declare abstract class Behavior {
    object: THREE.Object3D;
    init?(this: Behavior): any;
    update?(this: Behavior, deltaTime: number): any;
    postUpdate?(this: Behavior, deltaTime: number): any;
}
