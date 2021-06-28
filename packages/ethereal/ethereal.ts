import {
    EtherealLayoutSystem, 
    SpatialMetrics,
    Node3D, 
    NodeState, 
    Box3
} from "@etherealjs/core/mod"

export {WebLayer3D, WebLayer3DContent, WebRenderer, THREE, DOM as toDOM} from '@etherealjs/web-layer/mod'
export type {WebLayer3DOptions} from '@etherealjs/web-layer/mod'

declare module 'three/src/core/Object3D' {
    interface Object3D extends Node3D {}
}

export const ThreeBindings = {
    getChildren(metrics:SpatialMetrics, children:Node3D[]) {
        const nodeObj = metrics.node as THREE.Object3D
        if (!nodeObj.isObject3D) return
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

        const node = metrics.node as THREE.Mesh
        if (!node.isObject3D) return

        node.updateMatrix()
        state.localMatrix = node.matrix
        state.parent = node.parent
        state.opacity = getThreeOpacity(metrics) || 1
    },
    getIntrinsicBounds(metrics:SpatialMetrics, bounds:Box3) {
        const node = metrics.node as THREE.Mesh
        if (!node.isObject3D) return
        if (node.geometry) {
            if (!node.geometry.boundingBox) node.geometry.computeBoundingBox()
            return bounds.copy(node.geometry.boundingBox as any)
        }
        return bounds
    },
    apply(metrics:SpatialMetrics, state:NodeState) {
        const node = metrics.node as THREE.Mesh
        if (!node.isObject3D) return
        if (state.parent !== node.parent) {
            const newParent = state.parent as THREE.Object3D
            newParent.add(node)
        }
        node.quaternion.copy(state.localOrientation)
        node.position.copy(state.localPosition)
        node.scale.copy(state.localScale)
        node.matrix.copy(state.localMatrix)
        node.matrixWorld.copy(state.worldMatrix)
        applyThreeOpacity(metrics, state.opacity)

        if (isNaN(state.localPosition.x)) throw new Error
        node.matrixAutoUpdate = false
        node.matrixWorldNeedsUpdate = false
    }
}

function getThreeOpacity(metrics:SpatialMetrics) : number|undefined {    
    const node = metrics.node as THREE.Mesh
    if (node.material) {
        const materialList = node.material as THREE.MeshBasicMaterial[]
        if (materialList.length) {
            for (const m of materialList) {
                if (m.opacity !== undefined) return m.opacity
            }
        } else {
            if ('opacity' in node.material) return node.material.opacity
        }
    }
    for (const child of metrics.boundingChildMetrics) {
        const opacity = getThreeOpacity(child)
        if (opacity !== undefined) return opacity
    }
    return undefined
}

function applyThreeOpacity(metrics:SpatialMetrics, opacity:number) {
    const node = metrics.node as THREE.Mesh
    if (node.material) {
        const materialList = node.material as THREE.MeshBasicMaterial[]
        if (materialList.length) {
            for (const m of materialList) {
                if ('opacity' in m) m.opacity = opacity
            }
        }
        else (node.material as THREE.MeshBasicMaterial).opacity = opacity
    }
    for (const child of metrics.boundingChildMetrics) {
        applyThreeOpacity(child, opacity)
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

export function createLayoutSystem<T extends Node3D>(viewNode:T, bindings=DefaultBindings) {
    return new EtherealLayoutSystem(viewNode, bindings)
}

export * from '@etherealjs/core/mod'
export type {Node3D} from '@etherealjs/core/mod'


// import {WebLayer3D,WebLayer3DOptions} from '@etherealjs/web-layer/mod'

// export class AdaptiveWebLayer extends WebLayer3D {
//     constructor(elementOrHTML:Element|string, options:WebLayer3DOptions) {
//         super(elementOrHTML, options)
//         const oLC = options.onLayerCreate
//         options.onLayerCreate = (layer) => {

//             oLC?.(layer)
//         }
//     }
// }