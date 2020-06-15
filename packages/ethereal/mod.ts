import {
    EtherealSystem, 
    Node3D, 
    NodeState, 
    Box3,
    SpatialOptimizer,
    SpatialAdapter,
    // the following are used implicitly in this module, and need to be listed here
    // explicitly until api-extractor understands import() in d.ts files
    SpatialMetrics,
    SpatialLayout, 
    Transitionable,
    TransitionableConfig,
    MathType
} from "@etherealjs/core/mod"

import type * as THREE from 'three'

declare module 'three/src/core/Object3D' {
    interface Object3D extends Node3D {}
}

export const ThreeBindings = {
    getCurrentState(node:THREE.Object3D, state:NodeState) {
        node.matrixAutoUpdate && node.updateMatrix()
        const nodeObj = node as THREE.Mesh
        state.parent = nodeObj.parent
        state.opacity = (nodeObj.material as THREE.MeshBasicMaterial)?.opacity ?? 
                        (nodeObj.material as THREE.MeshBasicMaterial[])?.[0]?.opacity ?? 1
        node.matrix.decompose(state.position as any, state.orientation as any, state.scale as any)
        return state
    },
    setCurrentState(node:THREE.Object3D&THREE.Mesh, state:NodeState) {
        if (node.material) {
            const materialList = node.material as THREE.MeshBasicMaterial[]
            if (materialList.length) materialList[0].opacity = state.opacity
            else (node.material as THREE.MeshBasicMaterial).opacity = state.opacity
        }
        node.quaternion.copy(state.orientation as any)
        node.position.copy(state.position as any)
        node.scale.copy(state.scale as any)
        node.matrix.compose(node.position, node.quaternion, node.scale)
        node.matrixAutoUpdate = false
        node.matrixWorldNeedsUpdate = true
    },
    getCurrentChildren(node:THREE.Object3D, children:THREE.Object3D[]) {
        children.length = 0
        for (const child of node.children) {
            children.push(child)
        }
        return children
    },
    getIntrinsicBounds(node:THREE.Object3D, bounds:Box3) {
        const nodeObj = node as THREE.Mesh
        if (nodeObj.geometry) {
            if (!nodeObj.geometry.boundingBox) nodeObj.geometry.computeBoundingBox()
            return bounds.copy(nodeObj.geometry.boundingBox as any)
        }
        return bounds
    }
}

export const DefaultBindings = {
    getCurrentState(node:THREE.Object3D, state:NodeState) {
        if (node.isObject3D) {
            ThreeBindings.getCurrentState(node, state)
        }
        return state
    },
    setCurrentState(node:THREE.Object3D&THREE.Mesh, state:NodeState) {
        if (node.isObject3D) {
             ThreeBindings.setCurrentState(node, state)
        }
    },
    getCurrentChildren(node:THREE.Object3D, children:THREE.Object3D[]) {
        if (node.isObject3D) {
            ThreeBindings.getCurrentChildren(node, children)
        }
        return children
    },
    getIntrinsicBounds(node:THREE.Object3D, bounds:Box3) {
        if (node.isObject3D) {
            ThreeBindings.getIntrinsicBounds(node, bounds)
        }
        return bounds
    }
}

export const system = new EtherealSystem(DefaultBindings)

export const metrics = system.getMetrics

export function adapt<T extends Node3D>(node:T, cb:(adapter:SpatialAdapter<T>) => void) {
    const adapter = system.getAdapter(node)
    adapter.orientation.start = adapter.orientation.target = adapter.metrics.layoutOrientation
    adapter.bounds.start = adapter.bounds.target = adapter.metrics.layoutBounds
    adapter.opacity.start = adapter.opacity.target = adapter.metrics.opacity
    cb(adapter)
}

export const transitionable = system.createTransitionable

export const objective = SpatialOptimizer.objective

export * from '@etherealjs/core/mod'

export * from '@etherealjs/web-layer/mod'