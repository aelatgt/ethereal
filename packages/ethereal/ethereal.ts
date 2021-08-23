import {
    EtherealLayoutSystem, 
    SpatialMetrics,
    Node3D, 
    NodeState, 
    Box3,
    Matrix4
} from "@etherealjs/core/mod"

export {WebLayer3D, WebLayer3DContent, WebRenderer, THREE, DOM as toDOM} from '@etherealjs/web-layer/mod'
export type {WebLayer3DOptions} from '@etherealjs/web-layer/mod'

declare module 'three/src/core/Object3D' {
    interface Object3D extends Node3D {}
}

const scratchMatrix = new Matrix4
const scratchMatrix2 = new Matrix4

export const ThreeBindings = {
    getChildren(metrics:SpatialMetrics, children:Node3D[]) {
        const nodeObj = metrics.node as THREE.Object3D
        if (!nodeObj.isObject3D) return
        children.length = 0
        for (let i = 0; i < nodeObj.children.length; i++) {
            children[i] = nodeObj.children[i]
        }
    },
    getState(metrics:SpatialMetrics) {
        if (metrics.system.viewNode === metrics.node) {
            const cameraNode = metrics.node as THREE.Camera
            cameraNode.updateMatrixWorld()
            metrics.system.viewFrustum.setFromPerspectiveProjectionMatrix(cameraNode.projectionMatrix)
        }

        const node = metrics.node as THREE.Mesh
        if (!node.isObject3D) return

        let worldMatrix:Matrix4
        let relativeMatrix:Matrix4
        if (metrics.isAdaptive) {
            // IMPORTANT: this line can potentially end up recursively calling this same function
            // for an ancestor node, so we need to make sure we aren't relying on our scratch memory 
            // to be unchanged after this line. In other words, any calculations stored in our scratch 
            // memory before this line, must be assumed to be invalid after this line executes
            const refWorldMatrix = metrics.referenceMetrics?.target.worldMatrix
            // For adaptive objects, we treat position/quaternion/scale as target state
            relativeMatrix = scratchMatrix.compose(node.position, node.quaternion, node.scale)
            worldMatrix = refWorldMatrix ? scratchMatrix2.multiplyMatrices(refWorldMatrix, relativeMatrix) : relativeMatrix
        } else {
            worldMatrix = node.matrixWorld
            relativeMatrix = node.matrix
        }

        metrics.raw.parent = node.parent
        metrics.raw.worldMatrix.copy(worldMatrix)
        metrics.raw.relativeMatrix.copy(relativeMatrix)
        metrics.raw.opacity = getThreeOpacity(metrics) || 1
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
    apply(metrics:SpatialMetrics, currentState:NodeState) {
        const node = metrics.node as THREE.Mesh
        if (!node.isObject3D) return

        if (currentState.parent !== node.parent) {
            const newParent = currentState.parent as THREE.Object3D
            if (newParent) newParent.add(node)
        }

        let val = currentState.localMatrix
        if (isNaN(val.elements[0]) || isNaN(val.elements[13]) || isNaN(val.elements[14]) || isNaN(val.elements[15]) ||val.elements[0] === 0) throw new Error()
        val = currentState.worldMatrix
        if (isNaN(val.elements[0]) || isNaN(val.elements[13]) || isNaN(val.elements[14]) || isNaN(val.elements[15]) ||val.elements[0] === 0) throw new Error()

        node.matrixAutoUpdate = false
        
        // node.quaternion.copy(currentState.localOrientation)
        // node.position.copy(currentState.localPosition)
        // node.scale.copy(currentState.localScale)
        node.matrix.copy(currentState.localMatrix)
        node.matrixWorld.copy(currentState.worldMatrix)
        applyThreeOpacity(metrics, currentState.opacity)

        // if (isNaN(currentState.localPosition.x)) throw new Error
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
    getState(metrics:SpatialMetrics) {
        if ((metrics.node as THREE.Object3D).isObject3D) {
            ThreeBindings.getState(metrics)
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