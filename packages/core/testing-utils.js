import { EtherealSystem } from './EtherealSystem';
import { PerspectiveCamera } from 'three';
export class EtherealSystemMock extends EtherealSystem {
    constructor() {
        super({
            getChildren(metrics, children) {
                const nodeObj = metrics.node;
                children.length = 0;
                for (let i = 0; i < nodeObj.children.length; i++) {
                    children[i] = nodeObj.children[i];
                }
            },
            getState(metrics, state) {
                const nodeObj = metrics.node;
                state.parent = nodeObj.parent;
                // state.opacity = (nodeObj.material as MeshBasicMaterial)?.opacity ?? 
                //                 (nodeObj.material as MeshBasicMaterial[])?.[0]?.opacity ?? 1
                // state.localOrientation = nodeObj.quaternion
                // state.localPosition = nodeObj.position
                // state.localScale = nodeObj.scale
                if (nodeObj.matrixAutoUpdate)
                    nodeObj.updateMatrix();
                state.localMatrix = nodeObj.matrix;
                return state;
            },
            getIntrinsicBounds(metrics, bounds) {
                const nodeObj = metrics.node;
                if (nodeObj.geometry) {
                    if (!nodeObj.geometry.boundingBox)
                        nodeObj.geometry.computeBoundingBox();
                    return bounds.copy(nodeObj.geometry.boundingBox);
                }
                return bounds;
            },
            apply(metrics, state) {
            },
        });
        this.viewNode = new PerspectiveCamera;
    }
}
