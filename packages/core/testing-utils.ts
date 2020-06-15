import {EtherealSystem, Node3D, NodeState} from './EtherealSystem'
import {Box3} from './math'

import {Object3D, Mesh, MeshBasicMaterial, PerspectiveCamera, MathUtils} from 'three'

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
                if (state.orientation.angleTo(nodeObj.quaternion) > this.system!.epsillonDegrees * MathUtils.DEG2RAD) 
                    state.orientation = state.orientation.copy(nodeObj.quaternion)
                if (state.position.distanceTo(nodeObj.position) > this.system!.epsillonMeters) 
                    state.position = state.position.copy(nodeObj.position)
                if (state.scale.distanceTo(nodeObj.scale) > this.system!.epsillonRatio)
                    state.scale = state.scale.copy(nodeObj.scale)

                let childrenChanged = false
                if (state.children.length !== nodeObj.children.length) {
                    childrenChanged = true
                } else {
                    for (let i = 0; i < nodeObj.children.length; i++) {
                        if (state.children[i] !== nodeObj.children[i]) {
                            childrenChanged = true
                            break
                        }
                    }
                }

                if (childrenChanged) {
                    state.children.length = 0
                    for (let i = 0; i < state.children.length; i++) {
                        state.children[i] = nodeObj.children[i]
                    }
                }
                return state
            },
            setCurrentState(node:Node3D, state:NodeState) {},
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