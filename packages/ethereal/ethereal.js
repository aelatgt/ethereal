import { EtherealLayoutSystem, Matrix4 } from "@etherealjs/core/mod";
const scratchMatrix = new Matrix4;
const scratchMatrix2 = new Matrix4;
export const ThreeBindings = {
    getChildren(metrics, children) {
        const nodeObj = metrics.node;
        if (!nodeObj.isObject3D)
            return;
        children.length = 0;
        for (let i = 0; i < nodeObj.children.length; i++) {
            children[i] = nodeObj.children[i];
        }
    },
    getState(metrics) {
        if (metrics.system.viewNode === metrics.node) {
            const cameraNode = metrics.node;
            cameraNode.updateMatrixWorld();
            metrics.system.viewFrustum.setFromPerspectiveProjectionMatrix(cameraNode.projectionMatrix);
        }
        const node = metrics.node;
        if (!node.isObject3D)
            return;
        let worldMatrix;
        let relativeMatrix;
        if (metrics.isAdaptive) {
            // IMPORTANT: this line can potentially end up recursively calling this same function
            // for an ancestor node, so we need to make sure we aren't relying on our scratch memory 
            // to be unchanged after this line. In other words, any calculations stored in our scratch 
            // memory before this line, must be assumed to be invalid after this line executes
            const refWorldMatrix = metrics.referenceMetrics?.target.worldMatrix;
            // For adaptive objects, we treat position/quaternion/scale as target state
            relativeMatrix = scratchMatrix.compose(node.position, node.quaternion, node.scale);
            worldMatrix = refWorldMatrix ? scratchMatrix2.multiplyMatrices(refWorldMatrix, relativeMatrix) : relativeMatrix;
        }
        else {
            worldMatrix = node.matrixWorld;
            relativeMatrix = node.matrix;
        }
        metrics.raw.parent = node.parent;
        metrics.raw.worldMatrix.copy(worldMatrix);
        metrics.raw.relativeMatrix.copy(relativeMatrix);
        metrics.raw.opacity = getThreeOpacity(metrics) || 1;
    },
    getIntrinsicBounds(metrics, bounds) {
        const node = metrics.node;
        if (!node.isObject3D)
            return;
        if (node.geometry) {
            if (!node.geometry.boundingBox)
                node.geometry.computeBoundingBox();
            return bounds.copy(node.geometry.boundingBox);
        }
        return bounds;
    },
    apply(metrics, currentState) {
        const node = metrics.node;
        if (!node.isObject3D)
            return;
        if (currentState.parent !== node.parent) {
            const newParent = currentState.parent;
            if (newParent)
                newParent.add(node);
        }
        let val = currentState.localMatrix;
        if (isNaN(val.elements[0]) || isNaN(val.elements[13]) || isNaN(val.elements[14]) || isNaN(val.elements[15]) || val.elements[0] === 0)
            throw new Error();
        val = currentState.worldMatrix;
        if (isNaN(val.elements[0]) || isNaN(val.elements[13]) || isNaN(val.elements[14]) || isNaN(val.elements[15]) || val.elements[0] === 0)
            throw new Error();
        node.matrixAutoUpdate = false;
        // node.quaternion.copy(currentState.localOrientation)
        // node.position.copy(currentState.localPosition)
        // node.scale.copy(currentState.localScale)
        node.matrix.copy(currentState.localMatrix);
        node.matrixWorld.copy(currentState.worldMatrix);
        applyThreeOpacity(metrics, currentState.opacity);
        // if (isNaN(currentState.localPosition.x)) throw new Error
    }
};
function getThreeOpacity(metrics) {
    const node = metrics.node;
    if (node.material) {
        const materialList = node.material;
        if (materialList.length) {
            for (const m of materialList) {
                if (m.opacity !== undefined)
                    return m.opacity;
            }
        }
        else {
            if ('opacity' in node.material)
                return node.material.opacity;
        }
    }
    for (const child of metrics.boundingChildMetrics) {
        const opacity = getThreeOpacity(child);
        if (opacity !== undefined)
            return opacity;
    }
    return undefined;
}
function applyThreeOpacity(metrics, opacity) {
    const node = metrics.node;
    if (node.material) {
        const materialList = node.material;
        if (materialList.length) {
            for (const m of materialList) {
                if ('opacity' in m)
                    m.opacity = opacity;
            }
        }
        else
            node.material.opacity = opacity;
    }
    for (const child of metrics.boundingChildMetrics) {
        applyThreeOpacity(child, opacity);
    }
}
export const DefaultBindings = {
    getChildren(metrics, children) {
        if (metrics.node.isObject3D) {
            ThreeBindings.getChildren(metrics, children);
        }
    },
    getState(metrics) {
        if (metrics.node.isObject3D) {
            ThreeBindings.getState(metrics);
        }
    },
    getIntrinsicBounds(metrics, bounds) {
        if (metrics.node.isObject3D) {
            ThreeBindings.getIntrinsicBounds(metrics, bounds);
        }
        return bounds;
    },
    apply(metrics, state) {
        if (metrics.node.isObject3D) {
            ThreeBindings.apply(metrics, state);
        }
    }
};
export function createLayoutSystem(viewNode, bindings = DefaultBindings) {
    return new EtherealLayoutSystem(viewNode, bindings);
}
export * from '@etherealjs/core/mod';
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
