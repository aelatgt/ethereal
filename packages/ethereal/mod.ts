import {
    EtherealSystem, 
    SpatialMetrics,
    Node3D, 
    NodeState, 
    Box3
} from "@etherealjs/core/mod"

import type * as THREE from 'three'

declare module 'three/src/core/Object3D' {
    interface Object3D extends Node3D {}
}

export const ThreeBindings = {
    getChildren(metrics:SpatialMetrics, children:Node3D[]) {
        const nodeObj = metrics.node as THREE.Object3D
        children.length = 0
        for (let i = 0; i < nodeObj.children.length; i++) {
            children[i] = nodeObj.children[i]
        }
    },
    getState(metrics:SpatialMetrics, state:NodeState) {
        if (metrics.system.viewNode === metrics.node) {
            const cameraNode = metrics.node as THREE.Camera
            cameraNode.updateMatrixWorld()
            metrics.system.viewFrustum.setFromPerspectiveProjectionMatrix(cameraNode.projectionMatrix)
        }

        const nodeObj = metrics.node as THREE.Mesh
        nodeObj.matrixAutoUpdate && nodeObj.updateMatrix()
        state.localMatrix = nodeObj.matrix
        // state.opacity = (nodeObj.material as THREE.MeshBasicMaterial)?.opacity ?? 
        //                 (nodeObj.material as THREE.MeshBasicMaterial[])?.[0]?.opacity ?? 1
        // state.localOrientation = nodeObj.quaternion
        // state.localPosition = nodeObj.position
        // state.localScale = nodeObj.scale
        state.parent = nodeObj.parent
    },
    getIntrinsicBounds(metrics:SpatialMetrics, bounds:Box3) {
        const nodeObj = metrics.node as THREE.Mesh
        if (nodeObj.geometry) {
            if (!nodeObj.geometry.boundingBox) nodeObj.geometry.computeBoundingBox()
            return bounds.copy(nodeObj.geometry.boundingBox as any)
        }
        return bounds
    },
    apply(metrics:SpatialMetrics, state:NodeState) {
        const node = metrics.node as THREE.Mesh
        // if (node.material) {
        //     const materialList = node.material as THREE.MeshBasicMaterial[]
        //     if (materialList.length) materialList[0].opacity = state.opacity
        //     else (node.material as THREE.MeshBasicMaterial).opacity = state.opacity
        // }
        if (state.parent !== node.parent) {
            const newParent = state.parent as THREE.Object3D
            newParent.add(node)
        }
        node.quaternion.copy(state.localOrientation)
        node.position.copy(state.localPosition)
        node.scale.copy(state.localScale)
        node.matrix.copy(state.localMatrix)
        node.matrixWorld.copy(state.worldMatrix)
        // node.matrixAutoUpdate = true
        // node.matrixWorldNeedsUpdate = true
    }
}

export const DefaultBindings = {
    getChildren(metrics:SpatialMetrics, children:Node3D[]) {
        if ((metrics.node as THREE.Object3D).isObject3D) {
            ThreeBindings.getChildren(metrics, children)
        }
    },
    getState(metrics:SpatialMetrics, state:NodeState) {
        if ((metrics.node as THREE.Object3D).isObject3D) {
            ThreeBindings.getState(metrics, state)
        }
    },
    getIntrinsicBounds(metrics:SpatialMetrics, bounds:Box3) {
        if ((metrics.node as THREE.Object3D).isObject3D) {
            ThreeBindings.getIntrinsicBounds(metrics, bounds)
        }
        return bounds
    },
    apply(metrics:SpatialMetrics, state:NodeState) {
        if ((metrics.node as THREE.Object3D).isObject3D) {
             ThreeBindings.apply(metrics, state)
        }
    }
}

export function createSystem<T extends Node3D>(viewNode:T, bindings=DefaultBindings) {
    return new EtherealSystem(viewNode, bindings)
}

export * from '@etherealjs/core/mod'

export {WebLayer3D, WebLayer3DBase, WebRenderer} from '@etherealjs/web-layer/mod'