import {EtherealLayoutSystem, Node3D} from './EtherealLayoutSystem'
import {Box3} from './math-utils'

import {Object3D, Mesh, PerspectiveCamera} from 'three'
import { SpatialMetrics, NodeState } from './SpatialMetrics'

declare module 'three/src/core/Object3D' {
    interface Object3D extends Node3D {}
}

export class EtherealSystemMock extends EtherealLayoutSystem {
    constructor() {
        super(new PerspectiveCamera,{
            getChildren(metrics:SpatialMetrics, children:Node3D[]) {
                const nodeObj = metrics.node as Object3D
                children.length = 0
                for (let i = 0; i < nodeObj.children.length; i++) {
                    children[i] = nodeObj.children[i]
                }
            },
            getState(metrics:SpatialMetrics, state:NodeState) {
                const nodeObj = metrics.node as Mesh
                state.parent = nodeObj.parent
                // state.opacity = (nodeObj.material as MeshBasicMaterial)?.opacity ?? 
                //                 (nodeObj.material as MeshBasicMaterial[])?.[0]?.opacity ?? 1
                // state.localOrientation = nodeObj.quaternion
                // state.localPosition = nodeObj.position
                // state.localScale = nodeObj.scale
                if (nodeObj.matrixAutoUpdate) nodeObj.updateMatrix()
                state.localMatrix = nodeObj.matrix
                return state
            },
            getIntrinsicBounds(metrics:SpatialMetrics, bounds:Box3) {
                const nodeObj = metrics.node as Mesh
                if (nodeObj.geometry) {
                    if (!nodeObj.geometry.boundingBox) nodeObj.geometry.computeBoundingBox()
                    return bounds.copy(nodeObj.geometry.boundingBox!)
                }
                return bounds
            },
            apply(metrics:SpatialMetrics, state:NodeState) {

            }
        })
    }
}