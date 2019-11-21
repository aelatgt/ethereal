import * as THREE from 'three'
import {Layout} from './layout/Layout'
import {Transitioner} from './layout/Transitioner'

// accelerated raycasting
import { computeBoundsTree, disposeBoundsTree, acceleratedRaycast } from 'three-mesh-bvh'
THREE.BufferGeometry.prototype.computeBoundsTree = computeBoundsTree
THREE.BufferGeometry.prototype.disposeBoundsTree = disposeBoundsTree
THREE.Mesh.prototype.raycast = acceleratedRaycast
declare module 'three/src/core/BufferGeometry' {
    interface BufferGeometry {
        computeBoundsTree() : void
        disposeBoundsTree() : void
        boundsTree?: any
    }
}

declare module 'three/src/core/Object3D' {
    interface Object3D {
        /**
         * Layout properties
         */
        layout: Layout
        /**
         * When active, enables pose (position, quaternion, scale) 
         * and layout (align, origin, size) properties to be used 
         * as transition targets for smooth interpolation.
         */
        transitioner: Transitioner
        updateWorldMatrix(updateParents:boolean, updateChildren:boolean, updateLayout?:boolean) : void
    }
}

let _s = new THREE.Vector3
THREE.Object3D.prototype.updateMatrix = function(this:THREE.Object3D) {
    const {position, quaternion, scale} = this
    _s.copy(scale) // allow scale of 0 by making it very small
    if (_s.x === 0) _s.x = 1e-10
    if (_s.y === 0) _s.y = 1e-10
    if (_s.z === 0) _s.z = 1e-10
    this.matrix.compose(position, quaternion, scale)
}

// modify updateMatrixWorld to rely on updateWorldMatrix method
THREE.Object3D.prototype.updateMatrixWorld = function(force) {
    if (this._inUpdateWorldMatrix) return
    this.updateWorldMatrix(false, true, true)
}

// modify Object3D.updateWorldMatrix to apply layout
THREE.Object3D.prototype.updateWorldMatrix = function(this:THREE.Object3D, updateParents:boolean, updateChildren:boolean, updateLayout=true) {

    const parent = this.parent

    // update parents

    if ( updateParents === true && parent !== null ) {

        parent.updateWorldMatrix( true, false, true )

    }

    // update without layout

    if ( this.matrixAutoUpdate ) this.updateMatrix()

    if ( this.parent === null ) {

        this.matrixWorld.copy( this.matrix )

    } else {

        this.matrixWorld.multiplyMatrices( this.parent.matrixWorld, this.matrix )

    }

    // update children without layout

    const children = this.children;

    if ( updateChildren === true ) {

        for ( var i = 0, l = children.length; i < l; i ++ ) {

            children[ i ].updateWorldMatrix( false, true, false )

        }
    }

    // update and apply layout

    if ( updateLayout === true ) {

        updateChildren && this.layout.invalidateBounds() // only invalidate when traversing down
        this.layout.updateMatrix()
        const transitioner = this.transitioner as Transitioner
        
        transitioner.matrixLocal.target.multiplyMatrices( this.layout.matrix, this.matrix )
        const matrixLocal = transitioner.active ? transitioner.matrixLocal.current : transitioner.matrixLocal.target

        if ( parent === null ) {
            transitioner.matrixWorldTarget.copy(transitioner.matrixLocal.target)
            this.matrixWorld.copy(matrixLocal)
        } else {
            transitioner.matrixWorldTarget.multiplyMatrices( parent.transitioner.matrixWorldTarget, transitioner.matrixLocal.target)
            this.matrixWorld.multiplyMatrices( parent.matrixWorld, matrixLocal )
        }

        // update children with layout

        if ( updateChildren === true ) {

            for ( var i = 0, l = children.length; i < l; i ++ ) {

                children[ i ].updateWorldMatrix( false, true, true );
        
            }

        }

    }
    
    this['_inUpdateWorldMatrix'] = true
    this.updateMatrixWorld() // some three.js Object3D subclasses have special behavior here
    this['_inUpdateWorldMatrix'] = false

}

// create a SpatialLayout instance on first access of the `layout` property 
Object.defineProperty(THREE.Object3D.prototype, 'layout', {
    get: function getLayout(this:THREE.Object3D) {
        if (this === THREE.Object3D.prototype) return undefined
        Object.defineProperty(this, 'layout', {
            value: new Layout(this),
            writable: true,
            enumerable: true
        })
        return this.layout
    }
})

// create a SpatialTransitioner instance on first access of the `transitioner` property 
Object.defineProperty(THREE.Object3D.prototype, 'transitioner', {
    get: function getTransitioner(this:THREE.Object3D) {
        if (this === THREE.Object3D.prototype) return undefined
        Object.defineProperty(this, 'transitioner', {
            value: new Transitioner(this),
            writable: true,
            enumerable: true
        })
        return this.transitioner
    }
})