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
export class AdaptivityManager {

    private static _getBehaviors = Symbol('getBehaviors')

    private static _didUpdate = Symbol('didUpdate')

    static addBehavior(object:THREE.Object3D, behavior:FunctionProperties<Behavior>|NonNullable<typeof Behavior.prototype.update>) {
        const behaviors = object[AdaptivityManager._getBehaviors] = object[AdaptivityManager._getBehaviors] || []
        let b:Behavior
        if (typeof behavior === 'function') b = {object, update:behavior} 
        else b = <Behavior>behavior
        b.object = object
        b.init && b.init()
        behaviors.push(b)
    }

    static getBehaviors(object:THREE.Object3D) {
        return object[AdaptivityManager._getBehaviors] as Behavior[]
    }
    
    static currentScene:THREE.Scene
    static currentCamera:THREE.Camera
    static currentDeltaTime:number

    static update(scene:THREE.Scene, camera:THREE.Camera, deltaTime:number) {
        AdaptivityManager.currentScene = scene
        AdaptivityManager.currentCamera = camera
        AdaptivityManager.currentDeltaTime = deltaTime
        scene.updateWorldMatrix(true, true)
        AdaptivityManager.ensureUpdate(camera)
        scene.traverse(AdaptivityManager.ensureUpdate)
        AdaptivityManager.currentScene = undefined as any
        AdaptivityManager.currentCamera = undefined as any
        AdaptivityManager.currentDeltaTime = undefined as any
        Promise.resolve(scene).then(AdaptivityManager.clearUpdateFlag)
    }

    static clearUpdateFlag(scene:THREE.Scene) {
        scene.traverse((obj) => obj[AdaptivityManager._didUpdate] = false)
    }

    static ensureUpdate(obj:THREE.Object3D) {
        if (!AdaptivityManager.currentScene) throw new Error('AdaptivityManager.ensureUpdate: must be called inside a Behavior callback')
        if (obj[AdaptivityManager._didUpdate]) return
        obj[AdaptivityManager._didUpdate] = true
        obj.parent && AdaptivityManager.ensureUpdate(obj.parent)
        const behaviors = AdaptivityManager.getBehaviors(obj)
        Transitioner.disableAllTransitions = true
        if (behaviors) for (const b of behaviors) {
            if (b.update) {
                b.update(AdaptivityManager.currentDeltaTime!)
                obj.updateWorldMatrix(false, true)
            }
        }
        Transitioner.disableAllTransitions = false
        obj.transitioner.update(AdaptivityManager.currentDeltaTime!, false)
        if (behaviors) for (const b of behaviors) {
            if (b.postUpdate) {
                b.postUpdate(AdaptivityManager.currentDeltaTime!)
                obj.updateWorldMatrix(false, true)
            }
        }
    }
}