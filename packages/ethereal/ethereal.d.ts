import { EtherealLayoutSystem, SpatialMetrics, Node3D, NodeState, Box3 } from "@etherealjs/core/mod";
declare module 'three/src/core/Object3D' {
    interface Object3D extends Node3D {
    }
}
export declare const ThreeBindings: {
    getChildren(metrics: SpatialMetrics, children: Node3D[]): void;
    getState(metrics: SpatialMetrics): void;
    getIntrinsicBounds(metrics: SpatialMetrics, bounds: Box3): Box3 | undefined;
    apply(metrics: SpatialMetrics, currentState: NodeState): void;
};
export declare const DefaultBindings: {
    getChildren(metrics: SpatialMetrics, children: Node3D[]): void;
    getState(metrics: SpatialMetrics): void;
    getIntrinsicBounds(metrics: SpatialMetrics, bounds: Box3): Box3;
    apply(metrics: SpatialMetrics, state: NodeState): void;
};
export declare function createLayoutSystem<T extends Node3D>(viewNode: T, bindings?: {
    getChildren(metrics: SpatialMetrics<Node3D>, children: Node3D[]): void;
    getState(metrics: SpatialMetrics<Node3D>): void;
    getIntrinsicBounds(metrics: SpatialMetrics<Node3D>, bounds: Box3): Box3;
    apply(metrics: SpatialMetrics<Node3D>, state: NodeState<Node3D>): void;
}): EtherealLayoutSystem<Node3D>;
export * from '@etherealjs/core/mod';
export type { Node3D } from '@etherealjs/core/mod';
