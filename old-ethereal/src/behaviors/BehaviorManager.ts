import * as THREE from 'three'
import { Behavior } from './Behavior'
import { Transitioner } from '../layout/Transitioner'

type FunctionPropertyNames<T> = { [K in keyof T]: T[K] extends Function ? K : never }[keyof T]
type FunctionProperties<T> = Pick<T, FunctionPropertyNames<Required<T>>>

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
export class BehaviorManager {

    private static _getBehaviors = Symbol('getBehaviors')

    private static _didUpdate = Symbol('didUpdate')

    static addBehavior(object:THREE.Object3D, behavior:FunctionProperties<Behavior>|NonNullable<typeof Behavior.prototype.update>) {
        const behaviors = object[BehaviorManager._getBehaviors] = object[BehaviorManager._getBehaviors] || []
        let b:Behavior
        if (typeof behavior === 'function') b = {object, update:behavior} 
        else b = <Behavior>behavior
        b.object = object
        b.init && b.init()
        behaviors.push(b)
    }

    static getBehaviors(object:THREE.Object3D) {
        return object[BehaviorManager._getBehaviors] as Behavior[]
    }
    
    static currentScene:THREE.Scene
    static currentCamera:THREE.Camera
    static currentDeltaTime:number

    static update(scene:THREE.Scene, camera:THREE.Camera, deltaTime:number) {
        BehaviorManager.currentScene = scene
        BehaviorManager.currentCamera = camera
        BehaviorManager.currentDeltaTime = deltaTime
        scene.updateWorldMatrix(true, true)
        BehaviorManager.ensureUpdate(camera)
        scene.traverse(BehaviorManager.ensureUpdate)
        BehaviorManager.currentScene = undefined as any
        BehaviorManager.currentCamera = undefined as any
        BehaviorManager.currentDeltaTime = undefined as any
        Promise.resolve(scene).then(BehaviorManager.clearUpdateFlag)
    }

    static clearUpdateFlag(scene:THREE.Scene) {
        scene.traverse((obj) => obj[BehaviorManager._didUpdate] = false)
    }

    static ensureUpdate(obj:THREE.Object3D) {
        if (!BehaviorManager.currentScene) throw new Error('AdaptivityManager.ensureUpdate: must be called inside a Behavior callback')
        if (obj[BehaviorManager._didUpdate]) return
        obj[BehaviorManager._didUpdate] = true
        obj.parent && BehaviorManager.ensureUpdate(obj.parent)
        const behaviors = BehaviorManager.getBehaviors(obj)
        Transitioner.disableAllTransitions = true
        if (behaviors) for (const b of behaviors) {
            if (b.update) {
                b.update(BehaviorManager.currentDeltaTime!)
                obj.updateWorldMatrix(false, true)
            }
        }
        Transitioner.disableAllTransitions = false
        obj.transitioner.update(BehaviorManager.currentDeltaTime!, false)
        if (behaviors) for (const b of behaviors) {
            if (b.postUpdate) {
                b.postUpdate(BehaviorManager.currentDeltaTime!)
                obj.updateWorldMatrix(false, true)
            }
        }
    }
}