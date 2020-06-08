import {EtherealSystem, Node3D, NodeState} from './EtherealSystem'
import {Box3} from './math'

import {Object3D, Mesh, MeshBasicMaterial, PerspectiveCamera} from 'three'

declare module 'three/src/core/Object3D' {
    interface Object3D extends Node3D {}
}

export class EtherealSystemMock extends EtherealSystem {
    constructor() {
        super({
            getCurrentState(node:Object3D, state:NodeState) {
                const nodeObj = node as Mesh
                if (state.parent !== nodeObj.parent) state.parent = nodeObj.parent
                const opacity = (nodeObj.material as MeshBasicMaterial)?.opacity ?? 
                                (nodeObj.material as MeshBasicMaterial[])?.[0]?.opacity ?? 1
                if (state.opacity !== opacity) state.opacity = opacity
                if (state.orientation.angleTo(nodeObj.quaternion) < 1e10) 
                    state.orientation = state.orientation.copy(nodeObj.quaternion)
                if (state.position.distanceTo(nodeObj.position) < 1e10) 
                    state.position = state.position.copy(nodeObj.position)
                if (state.scale.distanceTo(nodeObj.scale) < 1e10)
                    state.scale = state.scale.copy(nodeObj.scale)
                return state
            },
            setCurrentState(node:Node3D, state:NodeState) {},
            getCurrentChildren(node:Object3D, children:Object3D[]) {
                children.length = 0
                for (const child of node.children) {
                    children.push(child)
                }
                return children
            },
            getIntrinsicBounds(node:Node3D, bounds:Box3) {
                const nodeObj = node as Mesh
                if (nodeObj.geometry) {
                    if (!nodeObj.geometry.boundingBox) nodeObj.geometry.computeBoundingBox()
                    return bounds.copy(nodeObj.geometry.boundingBox)
                }
                return bounds
            }
        })
        this.viewNode = new PerspectiveCamera
    }
}