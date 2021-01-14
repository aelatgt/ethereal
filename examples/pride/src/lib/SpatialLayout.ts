// import * as THREE from 'three'
// import { SpatialLayoutTransitioner } from './SpatialLayoutTransitioner'
// import { SpatialMetrics } from './SpatialMetrics'
// import { matrices, vectors, V_111 } from './SpatialUtils'

// declare module 'three/src/core/Object3D' {
//     interface Object3D {
//         layout: SpatialLayout
//         updateWorldMatrix(updateParents:boolean, updateChildren:boolean, applyLayout?:boolean) : void
//     }
// }

// // modify updateMatrixWorld to rely on updateWorldMatrix method
// THREE.Object3D.prototype.updateMatrixWorld = function(force) {
//     this.updateWorldMatrix(false, true, true)
// }

// // modify Object3D.updateWorldMatrix to apply layout
// THREE.Object3D.prototype.updateWorldMatrix = function(updateParents:boolean, updateChildren:boolean, applyLayout:boolean=updateChildren) {
    
//     const layout = this.layout

//     if ( applyLayout ) layout.invalidateBounds()

//     const parent = this.parent;

//     if ( updateParents === true && parent !== null ) {

//         parent.updateWorldMatrix( true, false, false );

//     }

//     if ( applyLayout && this.matrixAutoUpdate ) this.updateMatrix();

//     if ( this.parent === null ) {

//         this.matrixWorld.copy( this.matrix );

//     } else {

//         this.matrixWorld.multiplyMatrices( this.parent.matrixWorld, this.matrix );

//     }

//     // update children

//     if ( updateChildren === true ) {

//         var children = this.children;

//         for ( var i = 0, l = children.length; i < l; i ++ ) {

//             children[ i ].updateWorldMatrix( false, true, applyLayout );

//         }

//     }

//     if (!applyLayout) return

//     SpatialLayout.apply(this)
// }

// // create a SpatialLayout instance on first access of the `layout` property 
// Object.defineProperty(THREE.Object3D.prototype, 'layout', {
//     get: function getLayout(this:THREE.Object3D) {
//         if (this === THREE.Object3D.prototype) return undefined
//         Object.defineProperty(this, 'layout', {
//             value: new SpatialLayout(this),
//             writable: true,
//             enumerable: true
//         })
//         return this.layout
//     }
// })

// export const SpatialLayoutFit = {
//     contain: 'contain',
//     contain3d: 'contain3d',
//     cover: 'cover',
//     cover3d: 'cover3d',
//     fill: 'fill',
//     fill3d: 'fill3d',
// }
// export type SpatialLayoutFitType = keyof typeof SpatialLayoutFit


// export type SpatialLayoutX = number|'center'|'left'|'right'
// export type SpatialLayoutY = number|'center'|'top'|'bottom'
// export type SpatialLayoutZ = number|'center'|'front'|'back'

// /**
//  * Extend THREE.Object3D functionality with 3D layout functionality.
//  * 
//  * Features include:
//  *  - automatic bounds computation
//  *  - modify alignment, origin, and size with respect to bounds and parent bounds
//  *  - pose & layout transitions
//  */
// export class SpatialLayout {

//     /**
//      * When active, enables pose (position, quaternion, scale) 
//      * and layout (align, origin, size) properties to be used 
//      * as transition targets for smooth linear interpolation.
//      */
//     transitioner : SpatialLayoutTransitioner

//     /**
//      * Force local layout bounds to be excluded from the parent bounding context 
//      * (effectively, forces a new bounding context)
//      */
//     forceBoundsExclusion = false

//     /**
//      * Specifies the anchor with respect to the `parentBounds`
//      * 
//      * Parent Center is (0,0,0)
//      * Parent Left is (-1,0,0)
//      * Parent Top-Right is (1,1,0)
//      * Parent Front is (0,0,1)
//      * 
//      * For no-op in any dimension, NaN can be used as a value
//      */
//     align = new THREE.Vector3().set(NaN,NaN,NaN)

//     /**
//      * Specifies the anchor with respect to local `bounds`.  
//      * 
//      * Center is (0,0,0)
//      * Left is (-1,0,0)
//      * Top-Right is (1,1,0)
//      * Front-Center is (0,0,1)
//      * 
//      * For no-op in any dimension, NaN can be used as a value
//      */
//     anchor = new THREE.Vector3().set(NaN,NaN,NaN)

//     /**
//      * Specifies the center of rotation/scaling with respect to local `bounds`.  
//      * This behaves similarly to transform-origin in CSS. 
//      * 
//      * Center is (0,0,0)
//      * Left is (-1,0,0)
//      * Top-Right is (1,1,0)
//      * Front-Center is (0,0,1)
//      * 
//      * For no-op in any dimension, NaN can be used as a value
//      */
//     origin = new THREE.Vector3().set(NaN,NaN,NaN)

//     /**
//      * Specifies the maximum layout size with respect to `parentBounds`
//      * 
//      * Same size as parent is (1, 1, 1)
//      * Half size as parent is (0.5, 0.5, 0.5)
//      * 
//      * For no-op in any dimension, NaN can be used as a value
//      */
//     size = new THREE.Vector3().set(NaN,NaN,NaN)

//     /** 
//      * Specifies how layout should fit within the the available `size`,
//      * with respect to the aspect ratios of local `bounds` and `parentBounds`
//     */
//     set fit(fit:SpatialLayoutFitType) {
//         this._fit = fit
//         for (const id in this.fitTargets) this.fitTargets[id as SpatialLayoutFitType] = 0
//         this.fitTargets[fit] = 1
//     }
//     get fit() {
//         return this._fit
//     }
//     private _fit = 'contain' as SpatialLayoutFitType

//     /** Used internally. */
//     fitTargets = {
//         contain: 1,
//         contain3d: 0,
//         cover: 0,
//         cover3d: 0,
//         fill: 0,
//         fill3d: 0,
//     }

//     /**
//      * Specifies the desired parent coordinate system.
//      * This is only useful when the transitioner is active (`update()` is being called each frame).
//      */
//     targetParent? : THREE.Object3D

//     /**
//      * Specifies the degree to which the layout properties (`align`, `anchor`, `origin`, and `size`) influence 
//      * the final transform. At 0, the layout properties have no effect. At 1, they have
//      * their full intended effect. 
//      */
//     weight = 1

//     computedAlignPosition = new THREE.Vector3(0,0,0)
//     computedAnchorPosition = new THREE.Vector3(0,0,0) 
//     computedOriginPosition = new THREE.Vector3(0,0,0) 
//     computedSizeScale = new THREE.Vector3(1,1,1)

//     boundsAutoUpdate = true
//     minBounds = new THREE.Box3

//     get bounds() {
//         if (!this.boundsAutoUpdate) return this._bounds
//         return SpatialLayout.updateBounds(this.object)
//     }

//     get parentBounds() {
//         return SpatialLayout.updateParentBounds(this.object)
//     }

//     private _boundsValid = false
//     private _bounds = new THREE.Box3
//     private _parentBounds = new THREE.Box3

//     constructor(public object:THREE.Object3D) {
//         this.transitioner =  new SpatialLayoutTransitioner(object)
//         this._bounds.objectFilter = SpatialMetrics.objectFilter
//         this._parentBounds.objectFilter = SpatialMetrics.objectFilter
//         this.minBounds.min.setScalar(0)
//         this.minBounds.max.setScalar(0)
//     }

//     invalidateBounds() {
//         this._boundsValid = false
//     }

//     noop(){
//         this.align.setScalar(NaN)
//         this.anchor.setScalar(NaN)
//         this.origin.setScalar(NaN)
//         this.size.setScalar(NaN)
//     }

//     reset() {
//         this.object.position.setScalar(0)
//         this.object.quaternion.set(0,0,0,1)
//         this.object.scale.setScalar(1)
//         this.align.setScalar(NaN)
//         this.anchor.setScalar(NaN)
//         this.origin.setScalar(NaN)
//         this.size.setScalar(NaN)
//         this.fit = 'contain'
//         return this
//     }

//     setTargetParent(targetParent:THREE.Object3D) {
//         this.targetParent = targetParent
//         return this
//     }

//     setAlign(x:SpatialLayoutX, y:SpatialLayoutY, z:SpatialLayoutZ) {
//         SpatialLayout._setXYZ(this.align, x,y,z)
//         return this
//     }

//     setAnchor(x:SpatialLayoutX, y:SpatialLayoutY, z:SpatialLayoutZ) {
//         SpatialLayout._setXYZ(this.anchor, x,y,z)
//         return this
//     }

//     setOrigin(x:SpatialLayoutX, y:SpatialLayoutY, z:SpatialLayoutZ) {
//         SpatialLayout._setXYZ(this.origin, x,y,z)
//         return this
//     }

//     setFit(fit:SpatialLayoutFitType) {
//         this.fit = fit
//         return this
//     }

//     /**
//      * Set the `size` property. 
//      * If 'auto' is specified for a given dimension, then that dimension 
//      * will be scaled by the average resulting scale of other two dimensions. 
//      * 
//      * By specifiesing size in only one dimension, with the other two set to 'auto', 
//      * the original aspect ratio will be maintained. 
//      * 
//      * @param x 
//      * @param y 
//      * @param z 
//      */
//     setSize(x:number, y:number, z:number) { //x:number|'auto', y:number|'auto', z:number|'auto') : this {
//         this.size.set(x,y,z)

//         // const isAutoX = x === 'auto'
//         // const isAutoY = y === 'auto'
//         // const isAutoZ = z === 'auto'
//         // const autoCount = +isAutoX + +isAutoY + +isAutoZ

//         // // if all dimensions are numerical, set size directly
//         // if (autoCount === 0) {
//         //     this.size.set(x as number, y as number, z as number)
//         //     return this
//         // }

//         // // if all dimensions are set to `auto`, assume size to fit
//         // if (autoCount === 3) {
//         //     return this.setSizeToFit('contain3d')
//         // }

//         // // if any dimension is not 'auto', we need to maintain aspect ratio in that dimension
//         // // by scaling by the average resulting scale of other specified dimensions

//         // // ensure we have the right parent
//         // this._setParent()

//         // // first calculate the size scale adjustment as if NaN was passed for 'auto' 
//         // this.size.set(isAutoX ? NaN : x as number, isAutoY ? NaN : y as number,isAutoZ ? NaN : z as number)
//         // const sizeScale = SpatialLayout.getScaleForSize(this.bounds, this.parentBounds, this.size, vectors.get())

//         // // then compute the average of non-auto (non-NaN) scales
//         // const averageSizeScale = (
//         //     (isAutoX ? 0 : sizeScale.x) + 
//         //     (isAutoY ? 0 : sizeScale.y) + 
//         //     (isAutoZ ? 0 : sizeScale.z)
//         // ) / (3 - autoCount) // dividend should never be 0 because of the autoCount === 3 gaurd above
//         // sizeScale.x = isAutoX ? averageSizeScale : sizeScale.x
//         // sizeScale.y = isAutoY ? averageSizeScale : sizeScale.y
//         // sizeScale.z = isAutoZ ? averageSizeScale : sizeScale.z

//         // // finally, convert the size scale back to a fully numerical size value
//         // SpatialLayout.getSizeForScale(this.bounds, this.parentBounds, sizeScale, this.size)

//         return this
//     }

//     // /**
//     //  * Modify the `size` property such that it fits within the parent bounds
//     //  * @param fit 
//     //  */
//     // setSizeToFit(fit = 'contain' as SpatialLayoutFitType) : this {

//     //     if (!SpatialLayoutFit[fit]) throw new Error(`Unknown fit type: ${fit}`)

//     //     if (fit === 'fill') {
//     //         return this.setSize(1,1,'auto')
//     //     }

//     //     if (fit === 'fill3d') {
//     //         return this.setSize(1,1,1)
//     //     }

//     //     this._setParent()
//     //     const parentSize = this.parentBounds.getSize(vectors.get())
//     //     const boundsSize = this.bounds.getSize(vectors.get())
//     //     const ratio = vectors.get().copy(boundsSize).divide(parentSize)

//     //     if (fit === 'contain') {
//     //         if (ratio.x > ratio.y) {
//     //             this.setSize(1, 'auto', 'auto')
//     //         } else {
//     //             this.setSize('auto', 1, 'auto')
//     //         }
//     //     }

//     //     if (fit === 'cover') {
//     //         if (ratio.x < ratio.y) {
//     //             this.setSize(1, 'auto', 'auto')
//     //         } else {
//     //             this.setSize('auto', 1, 'auto')
//     //         }
//     //     }

//     //     if (fit === 'contain3d') {
//     //         if (ratio.x > ratio.y && ratio.x > ratio.z) {
//     //             this.setSize(1, 'auto', 'auto')
//     //         } else if (ratio.y > ratio.x && ratio.y > ratio.z) {
//     //             this.setSize('auto', 1, 'auto')
//     //         } else {
//     //             this.setSize('auto', 'auto', 1)
//     //         }
//     //     }

//     //     if (fit === 'cover3d') {
//     //         if (ratio.x < ratio.y && ratio.x < ratio.z) {
//     //             this.setSize(1, 'auto', 'auto')
//     //         } else if (ratio.y < ratio.x && ratio.y < ratio.z) {
//     //             this.setSize('auto', 1, 'auto')
//     //         } else {
//     //             this.setSize('auto', 'auto', 1)
//     //         }
//     //     }

//     //     vectors.poolAll()

//     //     return this
//     // }

//     /**
//      * Activate the transitioner, which linearly interpolates the pose & layout of the Object3D instance.
//      * 
//      * When the transitioner is active, the object's pose properties (`position`, `quaternion`, and `scale`)
//      * and layout properties (`layout.align`, `layout.origin`, `layout.size`, and `layout.weight`) are treated as 
//      * transition targets (these no longer reflect the current state). As long as the transitioner is active, 
//      * the `update()` method is expected to be called each frame, and the current pose/layout state is maintained
//      * in the transitioner instance (`layout.transitioner.position`, `layout.transitioner.align`, etc.). 
//      * 
//      * If `targetParent` is set and differs from the current `object.parent`, 
//      * this method will smoothly switch to the new coordinate system. 
//      */
//     update(lerpFactor:number) {
//         this.transitioner.active = true
//         this._setParent()
//         this.transitioner.lerp(lerpFactor)
//     }

//     /**
//      * If true, the layout properties are effectively noop
//      */
//     isPassive() {
//         return isNaN(this.align.x) && isNaN(this.align.y) && isNaN(this.align.z) &&
//             isNaN(this.anchor.x) && isNaN(this.anchor.y) && isNaN(this.anchor.z) &&  
//             isNaN(this.origin.x) && isNaN(this.origin.y) && isNaN(this.origin.z) &&  
//             isNaN(this.size.x) && isNaN(this.size.y) && isNaN(this.size.z)
//     }

//     /**
//      * If true, the `object` should not be included in the bounding calculation
//      * for any parent layouts.
//      */
//     isBoundingContext() {
//         if (this.forceBoundsExclusion) return true
//         if (!this.isPassive()) {
//             this.forceBoundsExclusion = true
//             return true
//         }
//         return false
//     }

//     /**
//      * Ensure that this `object` is attached to the `targetParent` Object3D instance. 
//      * When the `transitioner` is active, this method ensures a smooth transition 
//      * to another coordinate system. If the `object` is already attached to the 
//      * `targetParent`, this method is effectively noop.
//      */
//     private _setParent(setChildren = true) {
//         const parent = this.targetParent
//         const o = this.object
//         if (!parent) return
//         if (o.parent !== parent) {
//             o.updateWorldMatrix(true, true)
//             const originalMatrixWorld = matrices.get().copy(o.matrixWorld)
//             o.parent && o.parent.remove(o)
//             parent && parent.add(o)
//             parent.updateWorldMatrix(true, true)
//             const inverseParentMatrixWorld = parent ? matrices.get().getInverse(parent.matrixWorld) : matrices.get().identity()
//             o.matrix.copy(inverseParentMatrixWorld.multiply(originalMatrixWorld))
//             const transitioner = o.layout.transitioner
//             if (transitioner.active) {
//                 transitioner.layoutWeight = 0
//                 o.matrix.decompose(transitioner.position, transitioner.quaternion, transitioner.scale)
//                 transitioner.align.setScalar(NaN)
//                 transitioner.anchor.setScalar(NaN)
//                 transitioner.origin.setScalar(NaN)
//                 transitioner.size.setScalar(NaN)
//                 for (const i in transitioner.fitTargets) transitioner.fitTargets[i as SpatialLayoutFitType] = 0
//                 transitioner.fitTargets.contain = 1
//             } else {
//                 o.matrix.decompose(o.position, o.quaternion, o.scale)
//             }
//             matrices.poolAll()
//         }
//     }

//     /**
//      * Apply the layout to matrix and matrixWorld. Used internally. 
//      */
//     static apply(o:THREE.Object3D) {
//         const layout = o.layout

//         if (layout.isBoundingContext()) {

//             const parent = o.parent
//             const {bounds: computedBounds, parentBounds: computedParentBounds} = layout
//             const transitionerActive = layout.transitioner.active
//             const {position, quaternion, scale} = transitionerActive ? layout.transitioner : o
//             const {align, anchor, origin, size} = transitionerActive ? layout.transitioner : layout
//             const fitTargets = transitionerActive ? layout.transitioner.fitTargets : layout.fitTargets
//             const weight = transitionerActive ? layout.transitioner.layoutWeight : layout.weight
//             // update computed size scale
//             const sizeScale = SpatialLayout.getScaleForSize(computedBounds, computedParentBounds, size, layout.computedSizeScale).lerp(V_111, 1-weight)
//             SpatialLayout.adjustScaleForFit(fitTargets, sizeScale)
//             const layoutScale = vectors.get().copy(scale).multiply(sizeScale)
//             // update computed align & anchor positions
//             const alignPosition = computedParentBounds.relativeToAbsolute(align, layout.computedAlignPosition)
//             alignPosition.multiplyScalar(weight)
//             const anchorPosition = computedBounds.relativeToAbsolute(anchor, layout.computedAnchorPosition)
//             anchorPosition.multiply(layoutScale).multiplyScalar(weight)
//             // apply computed align & anchor positions to local matrix
//             const layoutPosition = vectors.get().copy(position).add(alignPosition).sub(anchorPosition)
//             o.matrix.compose(layoutPosition, quaternion, layoutScale)
//             // apply transform origin for rotation/scaling 
//             const originPosition = computedBounds.relativeToAbsolute(origin, layout.computedOriginPosition)
//             if (originPosition.x !== 0 || originPosition.y !== 0 || originPosition.z !== 0) {
//                 const scaledOriginPosition = vectors.get().copy(originPosition).multiply(layoutScale)
//                 const originMatrix = matrices.get().setPosition(scaledOriginPosition)
//                 o.matrix.multiplyMatrices(originMatrix, o.matrix)
//                 originMatrix.setPosition(originPosition).getInverse(originMatrix)
//                 o.matrix.multiplyMatrices(o.matrix, originMatrix)
//                 matrices.pool(originMatrix)
//             }
//             // update matrix world
//             parent ? o.matrixWorld.multiplyMatrices( parent.matrixWorld, o.matrix ) : o.matrixWorld.copy(o.matrix)
//             // update child world positions without recalculating layout
//             const children = o.children
//             for ( var i = 0, l = o.children.length; i < l; i ++ ) {
//                 children[ i ].updateWorldMatrix( false, true, false )
//             }
//             vectors.poolAll()

//         } else {

//             layout.computedAlignPosition.setScalar(0)
//             layout.computedAnchorPosition.setScalar(0)
//             layout.computedOriginPosition.setScalar(0)
//             layout.computedSizeScale.setScalar(1)

//         }
//     }

//     private static _setXYZ(vector:THREE.Vector3, x:SpatialLayoutX,y:SpatialLayoutY,z:SpatialLayoutZ) {
//         if (typeof x === 'string') {
//             if (x === 'left') x = -1
//             if (x === 'center') x = 0
//             if (x === 'right') x = 1
//         }
//         if (typeof y === 'string') {
//             if (y === 'bottom') y = -1
//             if (y === 'center') y = 0
//             if (y === 'top') y = 1
//         }
//         if (typeof z === 'string') {
//             if (z === 'back') z = -1
//             if (z === 'center') z = 0
//             if (z === 'front') z = 1
//         }
//         vector.set(x,y,z)
//     }

//     public static updateBounds(o:THREE.Object3D) {
//         const layout = o.layout
//         const bounds = layout._bounds
//         if (layout._boundsValid) return bounds
//         layout._boundsValid = true
//         const {minBounds} = layout.transitioner.active ? layout.transitioner : layout
//         return SpatialMetrics.get(o).getBoundsOf(o, bounds).union(minBounds)
//     }
    
//     public static updateParentBounds(o:THREE.Object3D) {
//         const layout = o.layout
//         const parentBounds = layout._parentBounds
//         const parent = o.parent
//         const cameraParent = parent as THREE.Camera
//         if (cameraParent && cameraParent.isCamera) {
//             const positionZ = layout.transitioner.active ? layout.transitioner.position.z : o.position.z 
//             const projectionMatrixInverse = matrices.get().getInverse(cameraParent.projectionMatrix)
//             const near = parentBounds.min.set(0,0,-1).applyMatrix4(projectionMatrixInverse).z
//             const far = parentBounds.min.set(0,0,1).applyMatrix4(projectionMatrixInverse).z
//             const projectionZ = parentBounds.min.set(0,0,positionZ).applyMatrix4(cameraParent.projectionMatrix).z
//             parentBounds.min.set(-1, -1, projectionZ)
//             parentBounds.max.set(1, 1, projectionZ)
//             parentBounds.min.applyMatrix4(projectionMatrixInverse)
//             parentBounds.max.applyMatrix4(projectionMatrixInverse)
//             parentBounds.min.z = far
//             parentBounds.max.z = near
//             matrices.pool(projectionMatrixInverse)
//         } else if (parent) {
//             parentBounds.copy(parent.layout.bounds)
//         } else {
//             parentBounds.makeEmpty()
//         }
//         return parentBounds
//     }

//     private static _boundsSize = new THREE.Vector3
//     private static _parentSize = new THREE.Vector3

//     public static getScaleForSize(bounds:THREE.Box3, parentBounds:THREE.Box3, size:THREE.Vector3, out:THREE.Vector3) {
//         const boundsSize = bounds.getSize(this._boundsSize)
//         const parentSize = parentBounds.getSize(this._parentSize)
//         out.copy(parentSize).multiply(size).divide(boundsSize)
//         // if 0, set scale very close to 0 so matrix transforms remain valid
//         if (out.x === 0) out.x = 1e-10
//         if (out.y === 0) out.y = 1e-10
//         if (out.z === 0) out.z = 1e-10
//         // if any dimenion is not defined, set it close to 0
//         if (!isFinite(out.x)) out.x = 1e-10
//         if (!isFinite(out.y)) out.y = 1e-10
//         if (!isFinite(out.z)) out.z = 1e-10
//         // if any size dimension was NaN, leave it unscaled (set to 1)
//         if (isNaN(size.x)) out.x = 1
//         if (isNaN(size.y)) out.y = 1
//         if (isNaN(size.z)) out.z = 1
//         return out
//     }

//     public static getSizeForScale(bounds:THREE.Box3, parentBounds:THREE.Box3, scale:THREE.Vector3, out:THREE.Vector3) {
//         const boundsSize = bounds.getSize(this._boundsSize)
//         const parentSize = parentBounds.getSize(this._parentSize)
//         out.copy(scale).multiply(boundsSize).divide(parentSize)
//         // if 0, set scale very close to 0 so matrix transforms remain valid
//         if (out.x === 0) out.x = 1e-10
//         if (out.y === 0) out.y = 1e-10
//         if (out.z === 0) out.z = 1e-10
//         // if any dimenion is not defined, set it close to 0
//         if (!isFinite(out.x)) out.x = 1e-10
//         if (!isFinite(out.y)) out.y = 1e-10
//         if (!isFinite(out.z)) out.z = 1e-10
//         return out
//     }

//     public static _fitScale = new THREE.Vector3
//     public static adjustScaleForFit(fitTargets:typeof SpatialLayout.prototype.fitTargets, sizeScale:THREE.Vector3) {
//         const {x,y,z} = sizeScale
//         const fitScale = this._fitScale

//         // fill3d: allow all dimensions to fill layout size
//         if (fitTargets.fill3d) {
//             // no-op
//         }

//         // fill (2D): set z to average of x and y
//         if (fitTargets.fill) {
//             fitScale.set(x, y, x + y / 2)
//             sizeScale.lerp(fitScale, fitTargets.fill)
//         }

//         // contain (2D): set all dimensions to smallest of x or y
//         if (fitTargets.contain) {
//             if (x < y) {
//                 fitScale.set(x, x, x)
//             } else {
//                 fitScale.set(y, y, y)
//             }
//             sizeScale.lerp(fitScale, fitTargets.contain)
//         }

//         // contain3d: set all dimensions to smallest of x or y or z
//         if (fitTargets.contain3d) {
//             if (x < y && x < z) {
//                 fitScale.set(x, x, x)
//             } else if (y < x && y < z) {
//                 fitScale.set(y, y, y)
//             } else {
//                 fitScale.set(z, z, z)
//             }
//             sizeScale.lerp(fitScale, fitTargets.contain3d)
//         }

//         // cover (2D): set all dimensions to largest of x or y
//         if (fitTargets.cover) {
//             if (x > y) {
//                 fitScale.set(x, x, x)
//             } else {
//                 fitScale.set(y, y, y)
//             }
//             sizeScale.lerp(fitScale, fitTargets.cover)
//         }

//         // cover (3D): set all dimensions to largest of x or y or z
//         if (fitTargets.cover3d) {
//             if (x > y && x > z) {
//                 fitScale.set(x, x, x)
//             } else if (y > x && y > z) {
//                 fitScale.set(y, y, y)
//             } else {
//                 fitScale.set(z, z, z)
//             }
//             sizeScale.lerp(fitScale, fitTargets.cover3d)
//         }
//     }
// }

// function isNaN(a:number) {
//     return a !== a
// }

export {}