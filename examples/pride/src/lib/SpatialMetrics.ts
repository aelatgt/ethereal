// import * as THREE from 'three'
// import {vectors2, vectors, quaternions, matrices, traverse} from './SpatialUtils'
// import {ConvexGeometry} from './ConvexGeometry'
// import {SimplifyModifier} from './SimplifyModifier'

// export class SimplifiedHull {
//     static hulls = new WeakMap<THREE.Geometry|THREE.BufferGeometry, THREE.Geometry>()
  
//     static compute(geometry:THREE.Geometry|THREE.BufferGeometry, maxPoints:number) {
//       const bufferGeometry = (geometry as THREE.BufferGeometry).type === 'BufferGeometry' ? 
//         geometry as THREE.BufferGeometry : null
//       const normalGeometry = bufferGeometry ? 
//         new THREE.Geometry().fromBufferGeometry(bufferGeometry) : geometry as THREE.Geometry
//       if (normalGeometry.vertices.length < maxPoints) {
//         this.hulls.set(geometry, normalGeometry)
//         return normalGeometry
//       }
    
//       const modifier = new (SimplifyModifier as any)()
//       let hull = new ConvexGeometry(normalGeometry.vertices) as THREE.Geometry
//       const count = hull.vertices.length
//       if (count > maxPoints) {
//         const simplified = modifier.modify( hull, hull.vertices.length - maxPoints )
//         hull = new THREE.Geometry().fromBufferGeometry(simplified)
//       }
//       this.hulls.set(geometry, hull)
//       return hull
//     } 
    
//     static get(geometry:THREE.Geometry|THREE.BufferGeometry) {
//       if (this.hulls.has(geometry)) return this.hulls.get(geometry)!
//       return this.compute(geometry, 30)!
//     }
// }


// declare module 'three/src/math/Box3' {
//     interface Box3 {
//         objectFilter?: (obj:THREE.Object3D) => boolean
//         setFromObjectHulls(object:THREE.Object3D, transform?: THREE.Matrix4): Box3
//         setFromObjectBoxes(object: THREE.Object3D, transform?: THREE.Matrix4): Box3
//         relativeToAbsolute(offset:THREE.Vector3, out:THREE.Vector3) : THREE.Vector3
//         absoluteToRelative(position:THREE.Vector3, out:THREE.Vector3) : THREE.Vector3
//     }
// }

// THREE.Box3.prototype.setFromObjectHulls = function() {
//     const _mat4 = new THREE.Matrix4
//     const _vertex = new THREE.Vector3
//     let _transform: THREE.Matrix4|undefined
//     function onTraverse( this:THREE.Box3, node: THREE.Object3D ) {
//         const include = this.objectFilter ? this.objectFilter(node) : true
//         if ( include ) extendFromObject.call(this, node)
//         return include
//     }
//     function extendFromObject(this:THREE.Box3, node: THREE.Object3D) {
//         const mesh = node as THREE.Mesh
//         const geometry = mesh.geometry
//         if (!geometry) return
//         if (_transform) {
//             _mat4.multiplyMatrices( _transform, node.matrixWorld )
//         } else {
//             _mat4.copy( node.matrixWorld )
//         }
//         const vertices = SimplifiedHull.get(geometry).vertices    
//         for (let i = 0; i < vertices.length; ++i) {
//             const v = vertices[i]
//             _vertex.copy( v ).applyMatrix4( _mat4 )
//             this.expandByPoint( _vertex )
//         }
//     }
//     return function( this: THREE.Box3, object: THREE.Object3D, transform?: THREE.Matrix4) {
//         _transform = transform
//         this.makeEmpty()
//         extendFromObject.call(this, object) 
//         for (let i = 0; i < object.children.length; ++i) {
//             const c = object.children[i]
//             traverse(c, onTraverse, this)
//         }
//         return this
//     }
// }()

// /**
//  * Compute the bounding box of an object (including its children),
//  * based on the union of child bounding boxes. This is much more efficient
//  * than `setFromObject`, which traverses through all child geometry
//  * each time it is called.
//  */
// THREE.Box3.prototype.setFromObjectBoxes = function() {
//     const box = new THREE.Box3()
//     const _mat4 = new THREE.Matrix4
//     let _transform: THREE.Matrix4|undefined
//     function onTraverse ( this:THREE.Box3, node: THREE.Object3D ) {
//         const include = this.objectFilter ? this.objectFilter(node) : true
//         if ( include ) extendFromObject.call(this, node)
//         return include
//     }
//     function extendFromObject ( this:THREE.Box3, node:THREE.Object3D ) {
//         const mesh = node as THREE.Mesh
//         const geometry = mesh.geometry
//         if (!geometry) return
//         if ( geometry.boundingBox === null ) {
//             geometry.computeBoundingBox()
//         }
//         box.copy( geometry.boundingBox )
//         if (_transform) {
//             _mat4.multiplyMatrices( _transform, node.matrixWorld )
//             box.applyMatrix4( _mat4 )
//         } else {
//             box.applyMatrix4( node.matrixWorld )
//         }
//         this.union( box )
//     }
//     return function( this: THREE.Box3, object: THREE.Object3D, transform?: THREE.Matrix4) {
//         _transform = transform
//         this.makeEmpty()
//         extendFromObject.call(this, object)
//         for (const c of object.children) {
//             traverse(c, onTraverse, this)
//         }
//         return this
//     }

// }()

// THREE.Box3.prototype.relativeToAbsolute = function() {
//     const center = new THREE.Vector3
//     const size = new THREE.Vector3
//     return function relativeToAbsolute(this:THREE.Box3, relativePosition:THREE.Vector3, out:THREE.Vector3) {
//         if (!this.isEmpty()) {
//             this.getCenter(center)
//             this.getSize(size)
//             out.copy(relativePosition).multiplyScalar(0.5).multiply(size).add(center)
//         } else {
//             out.setScalar(0)
//         }
//         if (!isFinite(out.x)) out.x = 0
//         if (!isFinite(out.y)) out.y = 0
//         if (!isFinite(out.z)) out.z = 0
//         return out
//     }
// }()

// THREE.Box3.prototype.absoluteToRelative = function() {
//     const center = new THREE.Vector3
//     const size = new THREE.Vector3
//     return function absoluteToRelative(this:THREE.Box3,absolutePosition:THREE.Vector3, out:THREE.Vector3) {
//         if (!this.isEmpty()) {  
//             this.getCenter(center)
//             this.getSize(size)
//             out.copy(absolutePosition)
//             out.sub(center).divide(size).multiplyScalar(2)
//         } else {
//             out.setScalar(0)
//         }
//         if (!isFinite(out.x)) out.x = 0
//         if (!isFinite(out.y)) out.y = 0
//         if (!isFinite(out.z)) out.z = 0
//         return out
//     }
// }()

// const FORWARD = new THREE.Vector3(0, 0, -1)

// /**
//  * A visual viewing frustum, with angles specified in DEGREES
//  */
// export class VisualFrustum {
    
//     min = new THREE.Vector3(Infinity,Infinity,Infinity)
//     max = new THREE.Vector3(-Infinity,-Infinity,-Infinity)
//     minClamped = new THREE.Vector3
//     maxClamped = new THREE.Vector3
//     objectFilter?: (obj:THREE.Object3D) => boolean

//     minClamp?:THREE.Vector3
//     maxClamp?:THREE.Vector3

//     get left() {
//         if (this.isEmpty()) return 0
//         return this.min.x
//     }

//     get leftClamped() {
//         if (this.isEmpty()) return 0
//         return this.minClamped.x
//     } 

//     get top() {
//         if (this.isEmpty()) return 0
//         return this.max.y
//     }

//     get topClamped() {
//         if (this.isEmpty()) return 0
//         return this.maxClamped.y
//     }

//     get right() {
//         if (this.isEmpty()) return 0
//         return this.max.x   
//     }

//     get rightClamped() {
//         if (this.isEmpty()) return 0
//         return this.maxClamped.x   
//     }

//     get bottom() {
//         if (this.isEmpty()) return 0
//         return this.min.y
//     }

//     get bottomClamped() {
//         if (this.isEmpty()) return 0
//         return this.minClamped.y 
//     }

//     get near() {
//         if (this.isEmpty()) return 0
//         return this.min.z
//     }

//     get nearClamped() {
//         if (this.isEmpty()) return 0
//         return this.minClamped.z
//     }

//     get far() {
//         if (this.isEmpty()) return 0
//         return this.max.z
//     }

//     get farClamped() {
//         if (this.isEmpty()) return 0
//         return this.maxClamped.z
//     }

//     get horizontal() {
//         if (this.isEmpty()) return 0
//         return this.right - this.left
//     }

//     get horizontalClamped() {
//         if (this.isEmpty()) return 0
//         return this.rightClamped - this.leftClamped
//     }

//     get vertical() {
//         if (this.isEmpty()) return 0
//         return this.top - this.bottom
//     }

//     get verticalClamped() {
//         if (this.isEmpty()) return 0
//         return this.topClamped - this.bottomClamped
//     }

//     get depth() {
//         if (this.isEmpty()) return 0
//         return this.far - this.near
//     }

//     get depthClamped() {
//         if (this.isEmpty()) return 0
//         return this.farClamped - this.nearClamped
//     }

//     get diagonal() {
//         if (this.isEmpty()) return 0
//         const minDirection = SpatialMetrics.getCartesianForSphericalDirection(this.min, vectors.get())
//         const maxDirection = SpatialMetrics.getCartesianForSphericalDirection(this.max, vectors.get())
//         const diagonal = minDirection.angleTo(maxDirection)
//         vectors.pool(minDirection)
//         vectors.pool(maxDirection)
//         return diagonal * THREE.Math.RAD2DEG
//     }

//     get diagonalClamped() {
//         if (this.isEmpty()) return 0
//         const minDirection = SpatialMetrics.getCartesianForSphericalDirection(this.minClamped, vectors.get())
//         const maxDirection = SpatialMetrics.getCartesianForSphericalDirection(this.maxClamped, vectors.get())
//         const diagonal = minDirection.angleTo(maxDirection)
//         vectors.pool(minDirection)
//         vectors.pool(maxDirection)
//         return diagonal * THREE.Math.RAD2DEG
//     }

// 	isEmpty(){
// 		return this.max.x < this.min.x || this.max.y < this.min.y || this.max.z < this.min.z
// 	}

//     getCenter(out:THREE.Vector3) {
//         return out.set( 
//             this.right - this.horizontal / 2, 
//             this.top - this.vertical / 2,
//             this.far - this.depth / 2,
//         )
//     }

//     getClampedCenter(out:THREE.Vector3) {
//         return out.set( 
//             this.rightClamped - this.horizontalClamped / 2, 
//             this.topClamped - this.verticalClamped / 2,
//             this.farClamped - this.depthClamped / 2,
//         )
//     }

//     getSize(out:THREE.Vector3) {
//         return out.set(
//             this.horizontal, 
//             this.vertical, 
//             this.depth
//         )
//     }

//     getClampedSize(out:THREE.Vector3) {
//         return out.set(
//             this.horizontalClamped, 
//             this.verticalClamped, 
//             this.depthClamped
//         )
//     }

//     getPositionForOffset(offset:THREE.Vector3, out:THREE.Vector3) {
//         const center = this.getCenter(vectors.get())
//         const size = this.getSize(vectors.get())
//         out.copy(offset).multiplyScalar(0.5).multiply(size).add(center)
//         vectors.pool(center)
//         vectors.pool(size)
//         return out
//     }

//     getClampedPositionForOffset(offset:THREE.Vector3, out:THREE.Vector3) {
//         const center = this.getClampedCenter(vectors.get())
//         const size = this.getClampedSize(vectors.get())
//         out.copy(offset).multiplyScalar(0.5).multiply(size).add(center)
//         vectors.pool(center) 
//         vectors.pool(size)
//         return out
//     }
    
//     setFromPerspectiveProjectionMatrix(projectionMatrix:THREE.Matrix4) {
//         const inverseProjection = matrices.get().getInverse(projectionMatrix)
//         const vec = vectors.get()
//         this.min.x = -vec.set(-1,0,-1).applyMatrix4(inverseProjection).angleTo(FORWARD) * THREE.Math.RAD2DEG
//         this.max.x = vec.set(1,0,-1).applyMatrix4(inverseProjection).angleTo(FORWARD) * THREE.Math.RAD2DEG
//         this.min.y = -vec.set(0,-1,-1).applyMatrix4(inverseProjection).angleTo(FORWARD) * THREE.Math.RAD2DEG
//         this.max.y = vec.set(0,1,-1).applyMatrix4(inverseProjection).angleTo(FORWARD) * THREE.Math.RAD2DEG
//         this.min.z = -vec.set(0,0,-1).applyMatrix4(inverseProjection).z
//         this.max.z = -vec.set(0,0,1).applyMatrix4(inverseProjection).z
//         matrices.pool(inverseProjection)
//         vectors.pool(vec)
//         this._applyClamping()
//     }

//     makeEmpty() {
//         this.min.set(Infinity,Infinity,Infinity)
//         this.max.set(-Infinity,-Infinity,-Infinity)
//     }

//     setFromObjectHulls(o:THREE.Object3D, referenceFrame:THREE.Object3D) {
//         this._referenceFrame = referenceFrame
//         this.makeEmpty()
//         this.expandByObjectHulls(o)
//         return this
//     }

//     expandByObjectHulls(o:THREE.Object3D) {
//         const mesh = o as THREE.Mesh
//         if (mesh.isMesh) this._expandByMeshHull(mesh, this._referenceFrame)
//         for (const c of o.children) {
//             traverse(c, this._onTraverseForBounds, this)
//         }
//     }

//     private _referenceFrame!:THREE.Object3D

//     private _onTraverseForBounds(node:THREE.Object3D) {
//         if (this.objectFilter && !this.objectFilter(node)) return false
//         const mesh = node as THREE.Mesh
//         if (mesh.isMesh) this._expandByMeshHull(mesh, this._referenceFrame!)
//         return true
//     }

//     private _expandByMeshHull(m:THREE.Mesh, referenceFrame:THREE.Object3D) {
//         const vertexPosition = vectors.get()
//         const localToReferenceFrame = matrices.get().getInverse(referenceFrame.matrixWorld).multiply(m.matrixWorld)
//         const hull = SimplifiedHull.get(m.geometry)!
//         const metrics = SpatialMetrics.get(referenceFrame)

//         for (const vertex of hull.vertices) {
//             vertexPosition.copy(vertex).applyMatrix4(localToReferenceFrame)
//             const vertexVisualPosition = metrics.getVisualPositionForCartesianPosition(vertexPosition, vertexPosition)
//             this.min.min(vertexVisualPosition)
//             this.max.max(vertexVisualPosition)
//         }

//         this._applyClamping()

//         vectors.pool(vertexPosition)
//         matrices.pool(localToReferenceFrame)
//     }

//     private _applyClamping() {
//         this.minClamped.copy(this.min)
//         this.maxClamped.copy(this.max)
//         if (this.minClamp) this.minClamped.min(this.minClamp)
//         if (this.maxClamp) this.maxClamped.max(this.maxClamp)
//     }

// }

// /**
//  * Calculate spatial metrics between a primary object and a target object.
//  *
//  * The results are always in one of two *local* coordinate systems:
//  * `object-space` -
//  *      Local *cartesian* coordinate system [X,Y,Z]. By convention, this local coordinate system is
//  *      interpreted in two different ways, depending on whether or not the object is a camera:
//  *          Typical objects: [+X = left, +Y = up, +Z = forward]
//  *          Camera objects: [+X = right, +Y = up, -Z = forward]
//  * `visual-space` -
//  *      Local *spherical* coordinate system [azimuth, elevation, distance], where:
//  *          `azimuth` (-180 to 180 DEGREES) an angle around the horizontal plane
//  *              (increasing from left to right, with 0deg being aligned with this object's natural `forward` vector)
//  *          `elevation` (-90 to 90 DEGREES ) an angle above or below the horizontal plane
//  *              (increases from below to above, with 0deg at the horizon)
//  *          `distance` is distance along the direction defined by the azimuth and elevation
//  *      Unlike object-space, visual-space is consistent for camera and non-camera objects.
//  */
// export class SpatialMetrics {

//     private static _metrics = new WeakMap<THREE.Object3D, SpatialMetrics>()

//     public static objectFilter = (o:THREE.Object3D) => !o.layout.isBoundingContext()

//     static get(o:THREE.Object3D) {
//         if (this._metrics.has(o)) return this._metrics.get(o)!
//         this._metrics.set(o, new SpatialMetrics(o))
//         return this._metrics.get(o)!
//     }

//     static getCartesianForSphericalDirection(sphericalDirection: THREE.Vector2|THREE.Vector3, out: THREE.Vector3) { 
//         const visualElevationRadians = THREE.Math.DEG2RAD * sphericalDirection.y
//         const visualAzimuthRadians = THREE.Math.DEG2RAD * sphericalDirection.x
//         const y = Math.sin(visualElevationRadians)
//         const x = Math.cos(visualElevationRadians) * Math.sin(visualAzimuthRadians)
//         const z = - Math.cos(visualElevationRadians) * Math.cos(visualAzimuthRadians)
//         out.set(x, y, z).normalize()
//         return out
//     }

//     static getSphericalDirectionForCartesian(cartesian: THREE.Vector3, out: THREE.Vector2) {
//         const direction = vectors.get().copy(cartesian).normalize()
//         out.y = Math.asin(direction.y) * THREE.Math.RAD2DEG
//         out.x = Math.atan2(direction.x, -direction.z) * THREE.Math.RAD2DEG
//         vectors.pool(direction)
//         return out
//     }

//     static getSphericalPositionForCartesian(cartesian: THREE.Vector3, out: THREE.Vector3) {
//         const distance = cartesian.length()
//         const direction = out.copy(cartesian).normalize()
//         out.y = Math.asin(direction.y) * THREE.Math.RAD2DEG
//         out.x = Math.atan2(direction.x, -direction.z) * THREE.Math.RAD2DEG
//         out.z = distance
//         return out
//     }

//     static getCartesianForSphericalPosition(sphericalPosition:THREE.Vector3, out: THREE.Vector3) {
//         const distance = sphericalPosition.z
//         const visualDirection = vectors2.get().set(sphericalPosition.x, sphericalPosition.y)
//         SpatialMetrics.getCartesianForSphericalDirection(visualDirection, out).multiplyScalar(distance)
//         vectors2.pool(visualDirection)
//         return out
//     }

//     private constructor(public object: THREE.Object3D) {}

//     getCartesianForVisualDirection(visualDirection: THREE.Vector2, out: THREE.Vector3) {
//         SpatialMetrics.getCartesianForSphericalDirection(visualDirection, out)
//         if (!(this.object as THREE.Camera).isCamera) { out.negate() }
//         return out
//     }

//     getVisualDirectionForCartesian(cartesian: THREE.Vector3, out: THREE.Vector2) {
//         const cartesianPosition = vectors.get().copy(cartesian)
//         if (!(this.object as THREE.Camera).isCamera) { cartesianPosition.negate() }
//         SpatialMetrics.getSphericalDirectionForCartesian(cartesianPosition, out)
//         vectors.pool(cartesianPosition)
//         return out
//     }

//     getVisualPositionForCartesianPosition(cartesianPosition: THREE.Vector3, out: THREE.Vector3) {
//         const position = out.copy(cartesianPosition)
//         if (!(this.object as THREE.Camera).isCamera) { position.negate() }
//         SpatialMetrics.getSphericalPositionForCartesian(position, out)
//         return out
//     }

//     getCartesianForVisualPosition(visualPosition:THREE.Vector3, out: THREE.Vector3) {
//         const distance = visualPosition.z
//         const visualDirection = vectors2.get().set(visualPosition.x, visualPosition.y)
//         this.getCartesianForVisualDirection(visualDirection, out).multiplyScalar(distance)
//         vectors2.pool(visualDirection)
//         return out
//     }

//     /**
//      * Calculate the local position of target in `object space`
//      */
//     getPositionOf(target: THREE.Object3D, out: THREE.Vector3) {
//         out.setFromMatrixPosition(target.matrixWorld)
//         return this.object.worldToLocal(out)
//     }

//     /**
//      * Calculate the local distance of the target object
//      * (Note: this is the same for both `object-space` and `visual-space`)
//      */
//     getDistanceOf(target: THREE.Object3D) {
//         const vec = vectors.get()
//         const result = this.getPositionOf(target, vec).length()
//         vectors.pool(vec)
//         return result
//     }

//     /**
//      * Calculate the local direction of the target object in `object-space`
//      *
//      * Remember, by convention:
//      *     Normal objects: [+X = left, +Y = up, +Z = forward]
//      *     Camera objects: [+X = right, +Y = up, -Z = forward]
//      * Special Case: if both objects are at the same *exact* position,
//      *      the result is a `forward` vector ([0,0,-1] for cameras, [0,0,1] for other objects)
//      */
//     getDirectionOf(target: THREE.Object3D, out: THREE.Vector3) {
//         const position = this.getPositionOf(target, out)
//         const distance = position.lengthSq()
//         if (distance === 0 || !isFinite(distance)) { // if distance is 0
//             if ((this.object as THREE.Camera).isCamera) { return out.set(0, 0, -1) }
//             return out.set(0, 0, 1)
//         }
//         return position.normalize()
//     }

//     /**
//      * Get the world direction of the target object.
//      *
//      * Special Case: if both objects are at the same *exact* position,
//      *      the result is a `forward` vector ([0,0,-1] for cameras, [0,0,1] for other objects),
//      *      transformed into world coordinates
//      */
//     getWorldDirectionOf(target: THREE.Object3D, out: THREE.Vector3) {
//         return this.getDirectionOf(target, out).transformDirection(this.object.matrixWorld)
//     }

//     /**
//      * Set a position for the *target object*,
//      * based on the visual-space of *this object*.
//      *
//      * If the object has no bounding sphere, or if a visualSize is not specified,
//      * then the current distance will be assumed.
//      *
//      * @param target
//      * @param visualDirection the desired visual direction to the target
//      * @param visualSize the desired visual size of the target (in DEGREES)
//      * @param alpha a linear interpolation value (default is 1)
//      */
//     setPositionFor( target: THREE.Object3D,
//                     visualDirection: THREE.Vector2,
//                     visualSize?: number,
//                     alpha = 1) {
//         let distance: number
//         if (typeof visualSize === 'number' && visualSize > 0) {
//             distance = this.computeDistanceFor(target, visualSize)
//         } else {
//             distance = this.getDistanceOf(target)
//         }
//         const start = vectors.get().copy(target.position)
//         const end = target.position
//         this.getCartesianForVisualDirection(visualDirection, end)
//         end.transformDirection(this.object.matrixWorld).multiplyScalar(distance)
//         target.parent && target.parent.worldToLocal(end)
//         target.position.copy(start.lerp(end, alpha))
//         vectors.pool(start)
//     }

//     /**
//      * Set a new scale for the target that
//      * would make it have the desired visual size
//      * in this object's `visual-space`.
//      *
//      * @param target
//      * @param visualSize the desired visual size of the target (in DEGREES)
//      * @param alpha a linear interpolation value (default is 1)
//      */
//     setScaleFor(target: THREE.Object3D, visualSize: number, alpha = 1) {
//         const idealDistance = this.computeDistanceFor(target, visualSize)
//         const currentDistance = this.getDistanceOf(target)
//         const distanceScale = idealDistance / currentDistance
//         const start = vectors.get().copy(target.scale)
//         const end = target.scale
//         if (isFinite(distanceScale)) { end.multiplyScalar(distanceScale) }
//         target.scale.copy(start.lerp(end, alpha))
//         vectors.pool(start)
//     }

//     // /**
//     //  * Perform a look-at operation on the target object, based
//     //  * on this object's local up direction.
//     //  * @param target
//     //  */
//     // setOrientationFor(target: THREE.Object3D, alpha = 1) {
//     //     const localObjectUp = vectors.get().set(0, 1, 0)
//     //     const savedTargetUp = vectors.get().copy(target.up)
//     //     const globalObjectUp = localObjectUp.transformDirection(this.object.matrixWorld)
//     //     target.up.copy(globalObjectUp)
//     //     const start = quaternions.get().copy(target.quaternion)
//     //     const lookAtVector = vectors.get().setFromMatrixPosition(this.object.matrixWorld)
//     //     target.lookAt(lookAtVector)
//     //     target.up.copy(savedTargetUp)
//     //     const end = target.quaternion
//     //     target.quaternion.copy(start.slerp(end, alpha))
//     //     vectors.pool(localObjectUp, savedTargetUp, lookAtVector)
//     //     quaternions.pool(start)
//     // }


//     computeDistanceFor(target: THREE.Object3D, visualSize: number): number {
//         if (visualSize < 0 || visualSize > 360) { throw new Error('Invalid visualSize, must be between [0-360]') }
//         const targetMatrixWorldInverse = matrices.get().getInverse(target.matrixWorld)
//         const frustum = this.getVisualFrustumOf(target)
//         return 0
//         // if (sphereRadius === 0) { return this.getDistanceOf(target) }

//         // if (visualSize > 180) {
//         //     // special case: linearly decrease distance with increasing visual size within the bounding sphere.
//         //     return (360 - visualSize / 180) * sphereRadius
//         // }

//         // // see https://stackoverflow.com/questions/21648630/radius-of-projected-sphere-in-screen-space
//         // return sphereRadius / Math.sin( THREE.Math.DEG2RAD * visualSize / 2 )
//     }

//     getOrientationOf(target: THREE.Object3D, out: THREE.Quaternion) {
//         const targetWorldOrientation = target.getWorldQuaternion(quaternions.get())
//         const inverseThisWorldOrientation = this.object.getWorldQuaternion(quaternions.get()).inverse()
//         out.multiplyQuaternions(inverseThisWorldOrientation, targetWorldOrientation)
//         quaternions.pool(targetWorldOrientation) 
//         quaternions.pool(inverseThisWorldOrientation)
//         return out
//     } 

//     /**
//      * Calculate the visual direction towards the target object.
//      * Assumes that a normal object faces +Z, and a camera faces -Z.
//      *
//      * If pointing directly towards the target object, the direction is [0,0] (forward)
//      * If pointing directly opposite of the target object, the direction is [0,-180] (backwards)
//      * Special Case: if both are at the same exact position, the direction is [0,0] (forward)
//      */
//     getVisualDirectionOf(target: THREE.Object3D, out: THREE.Vector2) {
//         const direction = this.getDirectionOf(target, vectors.get())
//         const visualDirection = this.getVisualDirectionForCartesian(direction, out)
//         vectors.pool(direction)
//         return visualDirection
//     }


//     /**
//      * Calculate the bounds of the target object, in the local `object-space` coordinate system. 
//      * @param target 
//      * @param out 
//      */
//     getBoundsOf(target: THREE.Object3D, out = this._box) {
//         if (out === this._box) out.objectFilter = SpatialMetrics.objectFilter
//         const matrixWorldInverse = this._boundsMatrix.getInverse(this.object.matrixWorld)
//         out.setFromObjectHulls(target, matrixWorldInverse)
//         return out
//     }
//     private _boundsMatrix = new THREE.Matrix4
//     private _box = new THREE.Box3


//     private _visualFrustum = new VisualFrustum
//     getVisualFrustumOf(target: THREE.Object3D = this.object, out = this._visualFrustum) {
//         if (out === this._visualFrustum) out.objectFilter = SpatialMetrics.objectFilter
//         const camera = target as THREE.Camera
//         if (camera.isCamera) out.setFromPerspectiveProjectionMatrix(camera.projectionMatrix)
//         else out.setFromObjectHulls(target, this.object)
//         return out
//     }

//     // /**
//     //  * Calculate the visual bounds of the target object, in the local `visual-space` coordinate system
//     //  * @param target 
//     //  * @param out 
//     //  */
//     // getVisualBoundsOf(target: THREE.Object3D, out: VisualBounds) {
//     //     const direction = this.getDirectionOf(target, vectors.get())
//     //     const visualDirection = this.getVisualDirectionOf(target, vectors2.get())
//     //     const rotation = matrices.get().lookAt(V_000, direction, V_010)
//     //     const rotatedMatrixWorld = matrices.get().multiplyMatrices(rotation, this.object.matrixWorld)
//     //     const rotatedMatrixWorldInverse = rotatedMatrixWorld.getInverse(rotatedMatrixWorld)
//     //     _box.setFromObjectBoxes(target, rotatedMatrixWorldInverse)
//     //     this.getVisualPointFromCartesianPoint(_box.min, out.leftBottomNear)
//     //     this.getVisualPointFromCartesianPoint(_box.max, out.rightTopFar)
        
//     //     matrices.pool(objectMatrixWorldInverse)
//     // }

//     /**
//      * Calculate the angular offset (in DEGREES) between this object's forward vector,
//      * and the direction towards the target object (as calculated by getDirectionOf).
//      * Assumes that a normal object faces +Z, and a camera faces -Z.
//      *
//      * If pointing directly towards the target object, the visual offset is 0
//      * If pointing directly opposite of the target object, the visual offset is 180
//      * Special Case: if both are at the same position, the visual offset is 180
//      */
//     getVisualOffsetOf(target: THREE.Object3D): number {
//         const direction = this.getDirectionOf(target, vectors.get())
//         if (!(this.object as THREE.Camera).isCamera) { direction.negate() }
//         const result = FORWARD.angleTo(direction) * THREE.Math.RAD2DEG
//         vectors.pool(direction)
//         return result
//     }

//     /**
//      * Calculate the field of view of the target object as seen by this object.
//      *
//      * The `visual size` grows from 0 to 180 as the visual bouding box of the target grows in our
//      * field of view.
//      * Once we are inside the bounding box, the `visual size` continues to
//      * increase linearly, from 180 to 360 at the center of the bounding box.
//      * If the target object has no bounding sphere defined, the result is 0.
//      *
//      * @returns visual size of the target object in DEGREES, from [0-360], in horizontal and vertical dimensions
//      */
//     // getVisualSizeOf(target: THREE.Object3D, out:THREE.Vector2) {
//     //     const direction = this.getDirectionOf(target, vectors.get())
//     //     const rotation = matrices.get().lookAt(V_000, direction, V_010)
//     //     const rotatedMatrixWorld = matrices.get().multiplyMatrices(rotation, this.object.matrixWorld)
//     //     const rotatedMatrixWorldInverse = rotatedMatrixWorld.getInverse(rotatedMatrixWorld)
//     //     const facingBox = _box.setFromObjectBoxes(target, rotatedMatrixWorldInverse)
//     //     const facingBoxSize = facingBox.getSize(vectors.get())
//     //     // const linearSize = mode === 'horizontal' ? facingBoxSize.x : facingBoxSize.y
//     //     // const distance = this.getDistanceOf(target)
//     //     const near = 
//     //     out.x = 2 * Math.atan2(facingBoxSize.x / 2, distance) * THREE.Math.RAD2DEG
//     //     out.y = 2 * Math.atan2(facingBoxSize.y / 2, distance) * THREE.Math.RAD2DEG
//     //     vectors.pool(direction, facingBoxSize)
//     //     matrices.pool(rotation, rotatedMatrixWorld)
//     //     return out

//     //     // const objectMatrixWorldInverse = matrices.get().getInverse(this.object.matrixWorld)
//     //     // _box.setFromObjectBoxes(target, objectMatrixWorldInverse)
//     //     // matrices.pool(objectMatrixWorldInverse)
//     //     // const sphere = _box.getBoundingSphere(_sphere)
//     //     // const sphereRadius = sphere.radius
//     //     // if (sphereRadius <= 0) { return 0 }
//     //     // const sphereDistance = this.getDistanceOf(target)
//     //     // if (sphereDistance <= sphereRadius) {
//     //     //     return 180 + (180 * sphereDistance / sphereRadius)
//     //     // } // we are inside the bounding sphere
//     //     // // see https://stackoverflow.com/questions/21648630/radius-of-projected-sphere-in-screen-space
//     //     // return 2 * Math.asin(sphereRadius / sphereDistance) * 180 / Math.PI
//     // }

//     // getVisualWidthOf(target: THREE.Object3D) {
//     //     const size = this.getVisualSizeOf(target, vectors2.get())
//     //     const width = size.x
//     //     vectors2.pool(size)
//     //     return width
//     // }

//     // getVisualHeightOf(target: THREE.Object3D) {
//     //     const size = this.getVisualSizeOf(target, vectors2.get())
//     //     const height = size.y
//     //     vectors2.pool(size)
//     //     return height
//     // }

//     // getVisualDiameterOf(target: THREE.Object3D) {
//     //     const size = this.getVisualSizeOf(target, vectors2.get())
//     //     const length = size.length()
//     //     vectors2.pool(size)
//     //     return length
//     // }

//     /**
//      * Calculate the perspective visual frustum which bounds the the target object.
//      * If no target is specified and the current object is a camera, returns 
//      * a perspective visual frustum for the camera (assuming it is a perspective camera)
//      */
//     // getVisualFrustum(target:THREE.Object3D=this.object): VisualFrustum {
//     //     if (!this._visualFrustum) { this._visualFrustum =  new VisualFrustum }
//     //     const out = this._visualFrustum
//     //     const camera = this.object as THREE.Camera
//     //     if (camera.isCamera) { 
//     //         const invProjection = matrices.get().getInverse(camera.projectionMatrix, true)
//     //         out.setFromBoundsMatrix(invProjection)
//     //         matrices.pool(invProjection)
//     //     } else {
//     //         const direction = this.getDirectionOf(target, vectors.get())
//     //         const rotation = matrices.get().lookAt(V_000, direction, V_010)
//     //         const rotatedMatrixWorld = matrices.get().multiplyMatrices(rotation, this.object.matrixWorld)
//     //         const rotatedMatrixWorldInverse = rotatedMatrixWorld.getInverse(rotatedMatrixWorld)
//     //         const facingBox = _box.setFromObjectBoxes(target, rotatedMatrixWorldInverse)
//     //         const facingBoxSize = facingBox.getSize(vectors.get())
//     //         const near = facingBox.min.z
//     //         const far = facingBox.max.z
//     //         const left = facingBox.min.x
//     //         out.x = 2 * Math.atan2(facingBoxSize.x / 2, distance) * THREE.Math.RAD2DEG
//     //         out.y = 2 * Math.atan2(facingBoxSize.y / 2, distance) * THREE.Math.RAD2DEG
//     //         matrices.get().makePerspective()
//     //     }
//     //     return out
//     // }

// }

// const _box = new THREE.Box3


// // export function getMetrics(obj: THREE.Object3D) : SpatialMetrics {
// //     if (_metricsMap.has(obj)) return _metricsMap.get(obj)!
// //     const metrics = new SpatialMetrics(obj)
// //     _metricsMap.set(obj, metrics)
// //     return metrics
// // }

export {}