import { Behavior } from './Behavior';
declare type FunctionPropertyNames<T> = {
    [K in keyof T]: T[K] extends Function ? K : never;
}[keyof T];
declare type FunctionProperties<T> = Pick<T, FunctionPropertyNames<Required<T>>>;
/**
 * When many objects in a scene-graph have behaviors that adapt to the
 * behavior of other objects, it is crucial that these chains of adaptive
 * behavior update in a way that minimizes unecessary scene-graph calculations
 * while also not adapting in the wrong order (which would cause some behaviors
 * to be permanently lagging behind one or more frames as they adapt to stale state).
 *
 * This class supports efficient execution of adaptive behaviors
 * in an optimal order such that all behaviors are adapting to fresh state
 * with minimal traversal of the scene-graph.
 */
export declare class AdaptivityManager {
    private static _getBehaviors;
    private static _didUpdate;
    static addBehavior(object: THREE.Object3D, behavior: FunctionProperties<Behavior> | NonNullable<typeof Behavior.prototype.update>): void;
    static getBehaviors(object: THREE.Object3D): Behavior[];
    static currentScene: THREE.Scene;
    static currentCamera: THREE.Camera;
    static currentDeltaTime: number;
    static update(scene: THREE.Scene, camera: THREE.Camera, deltaTime: number): void;
    static clearUpdateFlag(scene: THREE.Scene): void;
    static ensureUpdate(obj: THREE.Object3D): void;
}
export {};
