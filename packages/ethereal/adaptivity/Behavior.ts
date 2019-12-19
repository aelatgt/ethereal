export abstract class Behavior {
    object:THREE.Object3D
    init?(this:Behavior)
    update?(this:Behavior, deltaTime:number)
    postUpdate?(this:Behavior, deltaTime:number)
}