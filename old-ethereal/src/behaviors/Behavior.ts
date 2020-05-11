import {Object3D} from 'three'

export abstract class Behavior {
    object:Object3D
    init?(this:Behavior)
    update?(this:Behavior, deltaTime:number)
    postUpdate?(this:Behavior, deltaTime:number)
}