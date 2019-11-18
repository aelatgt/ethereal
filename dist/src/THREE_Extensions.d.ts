import { Layout } from './layout/Layout';
import { Transitioner } from './layout/Transitioner';
declare module 'three/src/core/BufferGeometry' {
    interface BufferGeometry {
        computeBoundsTree(): void;
        disposeBoundsTree(): void;
        boundsTree?: any;
    }
}
declare module 'three/src/core/Object3D' {
    interface Object3D {
        /**
         * Layout properties
         */
        layout: Layout;
        /**
         * When active, enables pose (position, quaternion, scale)
         * and layout (align, origin, size) properties to be used
         * as transition targets for smooth interpolation.
         */
        transitioner: Transitioner;
        updateWorldMatrix(updateParents: boolean, updateChildren: boolean, updateLayout?: boolean): void;
    }
}
