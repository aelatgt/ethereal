import * as THREE from 'three'
import {vectors2, vectors, quaternions, matrices, traverse, V_000, V_001, V_010} from '../utils'
import {ConvexGeometry} from './ConvexGeometry'
import {SimplifyModifier} from './SimplifyModifier'
import {Vector2, Vector3, MathUtils} from 'packages/core/src'

export class SimplifiedHull {
    static hulls = new WeakMap<THREE.Geometry|THREE.BufferGeometry, THREE.Geometry|undefined>()
  
    static compute(geometry:THREE.Geometry|THREE.BufferGeometry, maxPoints = 30) {
      const bufferGeometry = (geometry as THREE.BufferGeometry).type === 'BufferGeometry' ? 
        geometry as THREE.BufferGeometry : null
      const normalGeometry = bufferGeometry ? 
        new THREE.Geometry().fromBufferGeometry(bufferGeometry) : geometry as THREE.Geometry
      if (normalGeometry.vertices.length < maxPoints) {
        this.hulls.set(geometry, normalGeometry)
        return normalGeometry
      }
    
      const modifier = new (SimplifyModifier as any)()
      let hull = new ConvexGeometry(normalGeometry.vertices) as THREE.Geometry
      const count = hull.vertices.length
      if (count > maxPoints) {
        const simplified = modifier.modify( hull, hull.vertices.length - maxPoints )
        hull = new THREE.Geometry().fromBufferGeometry(simplified)
      }
      this.hulls.set(geometry, hull)
      return hull
    } 
    
    static get(geometry:THREE.Geometry|THREE.BufferGeometry) {
        return this.hulls.get(geometry) || geometry
    }
}

export class Box3 extends THREE.Box3 {
    objectFilter? = SpatialMetrics.objectFilter
    objectExpansion = 'box' as 'geometry'|'hull'|'box'
    coordinateSystem = undefined as THREE.Object3D|undefined

    private _objectExpandFunction:(o:THREE.Object3D)=>void

    private _onObjectTraverse( node: THREE.Object3D, ) {
        if (this.objectFilter && !this.objectFilter(node)) return false
        this._objectExpandFunction.call(this, node)
        return true
    }

    private static _points = [
        new Vector3(),
        new Vector3(),
        new Vector3(),
        new Vector3(),
        new Vector3(),
        new Vector3(),
        new Vector3(),
        new Vector3()
    ]


    setFromObject( object:THREE.Object3D ) {

        if (!this.coordinateSystem) this.coordinateSystem = object
        this.makeEmpty()

        switch (this.objectExpansion) {
            case 'geometry': this._objectExpandFunction = this.expandByObjectGeometry; break;
            case 'hull': this._objectExpandFunction = this.expandByObjectHull; break;
            case 'box':   
            default: this._objectExpandFunction = this.expandByObjectBox; break;
        }

        this._objectExpandFunction.call(this, object)
        for (const c of object.children) {
            traverse(c, this._onObjectTraverse, this)
        }

        return this
    }

    private _vector = new Vector3
    private _mat4 = new THREE.Matrix4

    expandByObjectGeometry ( node: THREE.Object3D ) {
        let i, l
        const vector = this._vector
        const mesh = node as THREE.Mesh
		node.updateWorldMatrix( false, false )
		var geometry = mesh.geometry as THREE.Geometry&THREE.BufferGeometry
		if ( geometry !== undefined ) {
            const mat = this._getCoordinateSystemTransform(node)
			if ( geometry.isGeometry ) {
				var vertices = geometry.vertices
				for ( i = 0, l = vertices.length; i < l; i ++ ) {
					vector.copy( vertices[ i ] )
					vector.applyMatrix4( mat )
					this.expandByPoint( vector )
				}
			} else if ( geometry.isBufferGeometry ) {
				var attribute = geometry.attributes.position
				if ( attribute !== undefined ) {
					for ( i = 0, l = attribute.count; i < l; i ++ ) {
						vector.fromBufferAttribute( attribute as any, i ).applyMatrix4( mat )
						this.expandByPoint( vector )
					}
				}
			}
		}
		return this
    }

    expandByObjectHull( node: THREE.Object3D ) {
        const mesh = node as THREE.Mesh
        const vector = this._vector
        let geometry = mesh.geometry
        if (!geometry) return this
        const mat = this._getCoordinateSystemTransform(node) 
        geometry = SimplifiedHull.get(geometry)
        if (geometry && 'vertices' in geometry) {
            const vertices = geometry.vertices    
            for (let i = 0; i < vertices.length; ++i) {
                const v = vertices[i]
                vector.copy( v ).applyMatrix4( mat )
                this.expandByPoint( vector )
            }
        } else {
            const vertices = (geometry as THREE.BufferGeometry).getAttribute('position')  
            for (let i = 0; i < vertices.count; i+=vertices.itemSize) {
                vector.set( vertices.getX(i), vertices.getY(i), vertices.getZ(i) ).applyMatrix4( mat )
                this.expandByPoint( vector )
            }
        }
        return this
    }

    private _box = new THREE.Box3

    expandByObjectBox ( node:THREE.Object3D ) {
        const box = this._box
        const mesh = node as THREE.Mesh
        const geometry = mesh.geometry
        if (!geometry) return this
        if ( geometry.boundingBox === null ) {
            geometry.computeBoundingBox()
        }
        box.copy( geometry.boundingBox )
        box.applyMatrix4( this._getCoordinateSystemTransform(node) )
        this.union( box )
        return this
    }

    private _getCoordinateSystemTransform(node: THREE.Object3D) {
        const mat4 = this._mat4
        if (this.coordinateSystem) {
            mat4.getInverse(this.coordinateSystem.matrixWorld).multiply( node.matrixWorld )
        } else {
            mat4.copy( node.matrixWorld )
        }
        return mat4
    }

    private _center = new Vector3
    private _size = new Vector3

    getCenter(v=this._center) {
        return v.addVectors(this.min, this.max).multiplyScalar(0.5)
    }

    getSize(v=this._size) {
        return v.subVectors(this.max, this.min)
    }

    relativeToAbsolute(relativePosition:Vector3, out = relativePosition) {
        const center = this.getCenter()
        const size = this.getSize()
        out.copy(relativePosition).multiply(size).add(center)
        if (!isFinite(size.x)) out.x = 0
        if (!isFinite(size.y)) out.y = 0
        if (!isFinite(size.z)) out.z = 0
        return out
    }

    absoluteToRelative(absolutePosition:Vector3, out = absolutePosition) {
        const center = this.getCenter()
        const size = this.getSize()
        out.copy(absolutePosition).sub(center).divide(size)
        if (!isFinite(size.x)) out.x = 0
        if (!isFinite(size.y)) out.y = 0
        if (!isFinite(size.z)) out.z = 0
        return out
    }

    isEmpty() {
        const s = this.getSize()
        return s.x < 0 || s.y < 0 || s.z < 0
    }

    isFinite() {
        return isFinite(this.min.x) && isFinite(this.min.y) && isFinite(this.min.z)
            && isFinite(this.max.x) && isFinite(this.max.y) && isFinite(this.max.z)
    }

    makeZero() {
        this.min.setScalar(0)
        this.max.setScalar(0)
    }

    applyMatrix4(matrix:THREE.Matrix4) {
        const _points = Box3._points
        _points[ 0 ].set( this.min.x, this.min.y, this.min.z ).applyMatrix4( matrix ) // 000
        _points[ 1 ].set( this.min.x, this.min.y, this.max.z ).applyMatrix4( matrix ) // 001
        _points[ 2 ].set( this.min.x, this.max.y, this.min.z ).applyMatrix4( matrix ) // 010
        _points[ 3 ].set( this.min.x, this.max.y, this.max.z ).applyMatrix4( matrix ) // 011
        _points[ 4 ].set( this.max.x, this.min.y, this.min.z ).applyMatrix4( matrix ) // 100
        _points[ 5 ].set( this.max.x, this.min.y, this.max.z ).applyMatrix4( matrix ) // 101
        _points[ 6 ].set( this.max.x, this.max.y, this.min.z ).applyMatrix4( matrix ) // 110
        _points[ 7 ].set( this.max.x, this.max.y, this.max.z ).applyMatrix4( matrix ) // 111
        this.setFromPoints( _points )
        return this;
    }
}

const rotateY180 = new THREE.Quaternion().setFromAxisAngle(V_010, Math.PI)

/**
 * A visual viewing frustum, with angles (x and y axis) specified in DEGREES
 */
export class VisualFrustum {
    
    objectFilter? = SpatialMetrics.objectFilter
    objectExpansion = 'box' as 'geometry'|'hull'|'box'
    private _objectExpandFunction:(o:THREE.Object3D)=>void
    public coordinateSystem: THREE.Object3D|undefined

    min = new Vector3(Infinity,Infinity,Infinity)
    max = new Vector3(-Infinity,-Infinity,-Infinity)

    get horizontal() {
        return this.max.x - this.min.x
    }

    get vertical() {
        return this.max.y - this.min.y
    }

    get near() {
        return -this.max.z
    }
    
    get far() {
        return -this.min.z
    }

    get depth() {
        return this.far - this.near
    }

    get diagonal() {
        const minDirection = SpatialMetrics.getCartesianForSphericalDirection(this.min, vectors.get())
        const maxDirection = SpatialMetrics.getCartesianForSphericalDirection(this.max, vectors.get())
        const diagonal = minDirection.angleTo(maxDirection)
        vectors.pool(minDirection)
        vectors.pool(maxDirection)
        return diagonal * MathUtils.RAD2DEG
    }

	isEmpty(){
		return this.max.x < this.min.x || this.max.y < this.min.y || this.max.z < this.min.z
	}

    getCenter(out:Vector3) {
        return out.set( 
            this.max.x - this.horizontal / 2, 
            this.max.y - this.vertical / 2,
            this.far - this.depth / 2,
        )
    }

    getSize(out:Vector3) {
        return out.set(
            this.horizontal, 
            this.vertical, 
            this.depth
        )
    }

    getPositionForOffset(offset:Vector3, out:Vector3) {
        const center = this.getCenter(vectors.get())
        const size = this.getSize(vectors.get())
        out.copy(offset).multiplyScalar(0.5).multiply(size).add(center)
        vectors.pool(center)
        vectors.pool(size)
        return out
    }

    private _v1 = new Vector3
    private _forward = new Vector3(0,0,-1)
    private _inverseProjection = new THREE.Matrix4
    
    setFromPerspectiveProjectionMatrix(projectionMatrix:THREE.Matrix4) {
        const inverseProjection = this._inverseProjection.getInverse(projectionMatrix)
        const v = this._v1
        this.min.x = -v.set(-1,0,-1).applyMatrix4(inverseProjection).angleTo(this._forward) * MathUtils.RAD2DEG
        this.max.x = v.set(1,0,-1).applyMatrix4(inverseProjection).angleTo(this._forward) * MathUtils.RAD2DEG
        this.min.y = -v.set(0,-1,-1).applyMatrix4(inverseProjection).angleTo(this._forward) * MathUtils.RAD2DEG
        this.max.y = v.set(0,1,-1).applyMatrix4(inverseProjection).angleTo(this._forward) * MathUtils.RAD2DEG
        this.min.z = v.set(0,0,1).applyMatrix4(inverseProjection).z
        this.max.z = v.set(0,0,-1).applyMatrix4(inverseProjection).z
        matrices.pool(inverseProjection)
    }

    getPerspectiveProjectionMatrix(projectionMatrix:THREE.Matrix4) {
        const near = this.near
        const far = this.far
        const left = this.near * Math.tan(this.min.x * MathUtils.DEG2RAD)
        const right = this.near * Math.tan(this.max.x * MathUtils.DEG2RAD)
        const top = this.near * Math.tan(this.max.y * MathUtils.DEG2RAD)
        const bottom = this.near * Math.tan(this.min.y * MathUtils.DEG2RAD)
        return projectionMatrix.makePerspective(
            left, right,
            bottom, top,
            near, far
        )
    }

    makeEmpty() {
        this.min.set(Infinity,Infinity,Infinity)
        this.max.set(-Infinity,-Infinity,-Infinity)
    }

    setFromObject( object:THREE.Object3D ) {

        if (!this.coordinateSystem) this.coordinateSystem = object
        this.makeEmpty()

        switch (this.objectExpansion) {
            case 'geometry': //this._objectExpandFunction = this.expandByObjectGeometry; break;
            case 'hull': this._objectExpandFunction = this.expandByObjectHull; break;
            case 'box':   
            default: this._objectExpandFunction = this.expandByObjectBox; break;
        }

        this._objectExpandFunction.call(this, object)
        for (const c of object.children) {
            traverse(c, this._onObjectTraverse, this)
        }

        return this
    }
    
    private _onObjectTraverse( node: THREE.Object3D, ) {
        if (this.objectFilter && !this.objectFilter(node)) return false
        this._objectExpandFunction.call(this, node)
        return true
    }

    private _vec3 = new Vector3
    private _mat4 = new THREE.Matrix4

    private expandByObjectHull(object:THREE.Object3D) {
        const m = object as THREE.Mesh
        if (!m.isMesh) return

        const coordinateSystem = this.coordinateSystem || object
        const vertexPosition = this._vec3
        const localToReferenceFrame = this._mat4.getInverse(coordinateSystem.matrixWorld).multiply(m.matrixWorld)
        const hull = SimplifiedHull.get(m.geometry)!
        const metrics = SpatialMetrics.get(coordinateSystem)

        if ('vertices' in hull) {
            for (const vertex of hull.vertices) {
                vertexPosition.copy(vertex).applyMatrix4(localToReferenceFrame)
                const vertexVisualPosition = metrics.getVisualPositionForCartesianPosition(vertexPosition, vertexPosition)
                this.min.min(vertexVisualPosition)
                this.max.max(vertexVisualPosition)
            }
        } else {
            const vertices = hull.getAttribute('position')
            for (let i = 0; i < vertices.count; i += vertices.itemSize) {
                vertexPosition.set(vertices.getX(i), vertices.getY(i), vertices.getZ(i)).applyMatrix4(localToReferenceFrame)
                const vertexVisualPosition = metrics.getVisualPositionForCartesianPosition(vertexPosition, vertexPosition)
                this.min.min(vertexVisualPosition)
                this.max.max(vertexVisualPosition)
            }
        }
    }

    private _boxPoints = [
        new Vector3(),
        new Vector3(),
        new Vector3(),
        new Vector3(),
        new Vector3(),
        new Vector3(),
        new Vector3(),
        new Vector3()
    ] as Vector3[]

    expandByObjectBox ( node:THREE.Object3D ) {
        const mat4 = this._mat4
        const mesh = node as THREE.Mesh
        const geometry = mesh.geometry
        if (!geometry) return this

        if ( geometry.boundingBox === null ) {
            geometry.computeBoundingBox()
        }
    
        const box = geometry.boundingBox
        const points = this._boxPoints
		points[ 0 ].set( box.min.x, box.min.y, box.min.z ) // 000
		points[ 1 ].set( box.min.x, box.min.y, box.max.z ) // 001
		points[ 2 ].set( box.min.x, box.max.y, box.min.z ) // 010
		points[ 3 ].set( box.min.x, box.max.y, box.max.z ) // 011
		points[ 4 ].set( box.max.x, box.min.y, box.min.z ) // 100
		points[ 5 ].set( box.max.x, box.min.y, box.max.z ) // 101
		points[ 6 ].set( box.max.x, box.max.y, box.min.z ) // 110
        points[ 7 ].set( box.max.x, box.max.y, box.max.z ) // 111

        const coordinateSystem = this.coordinateSystem || node
        const metrics = SpatialMetrics.get(coordinateSystem)
        const localToReferenceFrame = mat4.getInverse(coordinateSystem.matrixWorld).multiply(mesh.matrixWorld)

        for (const p of points) {
            p.applyMatrix4(localToReferenceFrame)
            const vertexVisualPosition = metrics.getVisualPositionForCartesianPosition(p, p)
            this.min.min(vertexVisualPosition)
            this.max.max(vertexVisualPosition)
        }
    }

}

/**
 * Calculate spatial metrics between a primary object and a target object.
 *
 * The results are always in one of two *local* coordinate systems:
 * `object-space` -
 *      Local *cartesian* coordinate system [X,Y,Z]. By convention, this local coordinate system is
 *      interpreted in two different ways, depending on whether or not the object is a camera:
 *          Typical objects: [+X = left, +Y = up, +Z = forward]
 *          Camera objects: [+X = right, +Y = up, -Z = forward]
 * `visual-space` -
 *      Local *spherical* coordinate system [azimuth, elevation, distance], where:
 *          `azimuth` (-180 to 180 DEGREES) an angle around the horizontal plane
 *              (increasing from left to right, with 0deg being aligned with this object's natural `forward` vector)
 *          `elevation` (-90 to 90 DEGREES ) an angle above or below the horizontal plane
 *              (increases from below to above, with 0deg at the horizon)
 *          `distance` is distance along the direction defined by the azimuth and elevation
 *      Unlike object-space, visual-space is consistent for camera and non-camera objects.
 */
export class SpatialMetrics {

    public matrixWorldGetter = 'target' as 'current' | 'target'

    private static _metrics = new WeakMap<THREE.Object3D, SpatialMetrics>()

    public static objectFilter = (o:THREE.Object3D) => !o.layout.isBoundingContext()

    static get(o:THREE.Object3D) {
        if (this._metrics.has(o)) return this._metrics.get(o)!
        this._metrics.set(o, new SpatialMetrics(o))
        return this._metrics.get(o)!
    }

    static getCartesianForSphericalDirection(sphericalDirection: Vector2|Vector3, out: Vector3) { 
        const visualElevationRadians = MathUtils.DEG2RAD * sphericalDirection.y
        const visualAzimuthRadians = MathUtils.DEG2RAD * sphericalDirection.x
        const y = Math.sin(visualElevationRadians)
        const x = Math.cos(visualElevationRadians) * Math.sin(visualAzimuthRadians)
        const z = - Math.cos(visualElevationRadians) * Math.cos(visualAzimuthRadians)
        out.set(x, y, z).normalize()
        return out
    }

    static getSphericalDirectionForCartesian(cartesian: Vector3, out: Vector2) {
        const direction = vectors.get().copy(cartesian).normalize()
        out.y = Math.asin(direction.y) * MathUtils.RAD2DEG
        out.x = Math.atan2(direction.x, -direction.z) * MathUtils.RAD2DEG
        vectors.pool(direction)
        return out
    }

    static getSphericalPositionForCartesian(cartesian: Vector3, out: Vector3) {
        const distance = cartesian.length()
        const direction = out.copy(cartesian).normalize()
        out.y = Math.asin(direction.y) * MathUtils.RAD2DEG
        out.x = Math.atan2(direction.x, -direction.z) * MathUtils.RAD2DEG
        out.z = distance
        return out
    }

    static getCartesianForSphericalPosition(sphericalPosition:Vector3, out: Vector3) {
        const distance = sphericalPosition.z
        const visualDirection = vectors2.get().set(sphericalPosition.x, sphericalPosition.y)
        SpatialMetrics.getCartesianForSphericalDirection(visualDirection, out).multiplyScalar(distance)
        vectors2.pool(visualDirection)
        return out
    }

    private constructor(public object: THREE.Object3D) {}

    private getMatrixWorld(o:THREE.Object3D) {
        return this.matrixWorldGetter === 'current' ? 
            o.matrixWorld : o.transitioner.matrixWorldTarget
    }

    getCartesianForVisualDirection(visualDirection: Vector2, out: Vector3) {
        SpatialMetrics.getCartesianForSphericalDirection(visualDirection, out)
        if (!(this.object as THREE.Camera).isCamera) { out.applyQuaternion(rotateY180) }
        return out
    }

    getVisualDirectionForCartesian(cartesian: Vector3, out: Vector2) {
        const cartesianPosition = vectors.get().copy(cartesian)
        if (!(this.object as THREE.Camera).isCamera) { cartesianPosition.applyQuaternion(rotateY180) }
        SpatialMetrics.getSphericalDirectionForCartesian(cartesianPosition, out)
        vectors.pool(cartesianPosition)
        return out
    }

    getVisualPositionForCartesianPosition(cartesianPosition: Vector3, out: Vector3) {
        const position = out.copy(cartesianPosition)
        if (!(this.object as THREE.Camera).isCamera) { position.applyQuaternion(rotateY180) }
        SpatialMetrics.getSphericalPositionForCartesian(position, out)
        return out
    }

    getCartesianForVisualPosition(visualPosition:Vector3, out: Vector3) {
        const distance = visualPosition.z
        const visualDirection = vectors2.get().set(visualPosition.x, visualPosition.y)
        this.getCartesianForVisualDirection(visualDirection, out).multiplyScalar(distance)
        vectors2.pool(visualDirection)
        return out
    }

    /**
     * Calculate the local position of target in `object space`
     */
    getPositionOf(target: THREE.Object3D, out: Vector3) {
        out.setFromMatrixPosition(this.getMatrixWorld(target))  
        const invMatrixWorld = matrices.get().getInverse(this.getMatrixWorld(this.object))
        out.applyMatrix4(invMatrixWorld)
        matrices.pool(invMatrixWorld)
        return out
    }

    /**
     * Calculate the local distance of the target object
     * (Note: this is the same for both `object-space` and `visual-space`)
     */
    getDistanceOf(target: THREE.Object3D) {
        const vec = vectors.get()
        const result = this.getPositionOf(target, vec).length()
        vectors.pool(vec)
        return result
    }

    /**
     * Calculate the local direction of the target object in `object-space`
     *
     * Remember, by convention:
     *     Normal objects: [+X = left, +Y = up, +Z = forward]
     *     Camera objects: [+X = right, +Y = up, -Z = forward]
     * Special Case: if both objects are at the same *exact* position,
     *      the result is a `forward` vector ([0,0,-1] for cameras, [0,0,1] for other objects)
     */
    getDirectionOf(target: THREE.Object3D, out: Vector3) {
        const position = this.getPositionOf(target, out)
        const distance = position.lengthSq()
        if (distance === 0 || !isFinite(distance)) { // if distance is 0
            if ((this.object as THREE.Camera).isCamera) { return out.set(0, 0, -1) }
            return out.set(0, 0, 1)
        }
        return position.normalize()
    }

    /**
     * Get the world direction of the target object.
     *
     * Special Case: if both objects are at the same *exact* position,
     *      the result is a `forward` vector ([0,0,-1] for cameras, [0,0,1] for other objects),
     *      transformed into world coordinates
     */
    getWorldDirectionOf(target: THREE.Object3D, out: Vector3) {
        return this.getDirectionOf(target, out).transformDirection(this.getMatrixWorld(this.object))
    }

    getClosestOrthogonalOrientationOf(target: THREE.Object3D, out: THREE.Quaternion) {
        const o = this.object
        const viewToObjectMat = (o ? matrices.get().getInverse(this.getMatrixWorld(o)) : matrices.get())
                .multiply(this.getMatrixWorld(target))
        const mat = viewToObjectMat.extractRotation(viewToObjectMat)
        const orientation = out.setFromRotationMatrix(mat)

        const forwardDirection = vectors.get().set(0,0,1).applyQuaternion(orientation)
        const upDirection = vectors.get().set(0,1,0).applyQuaternion(orientation)

        let distForward = Infinity
        let distUp = Infinity
        let closestForwardDirection!:Vector3
        let closestUpDirection!:Vector3

        for (const dir of directions) {
            let dist = upDirection.distanceToSquared(dir)
            if (dist < distUp) {
                distUp = dist
                closestUpDirection = dir
            }
        }

        for (const dir of directions) {
            // avoid having forward & up defined on the same axis
            if (dir.x && closestUpDirection.x) continue
            if (dir.y && closestUpDirection.y) continue
            if (dir.z && closestUpDirection.z) continue
            let dist = forwardDirection.distanceToSquared(dir)
            if (dist < distForward) {
                distForward = dist
                closestForwardDirection = dir
            }
        }

        mat.identity()
        mat.lookAt(closestForwardDirection, V_000, closestUpDirection)
        orientation.setFromRotationMatrix(mat)
        matrices.pool(mat)
    }

    /**
     * Set a position for the *target object*,
     * based on the visual-space of *this object*.
     *
     * If the object has no bounding sphere, or if a visualSize is not specified,
     * then the current distance will be assumed.
     *
     * @param target
     * @param visualDirection the desired visual direction to the target
     * @param visualSize the desired visual size of the target (in DEGREES)
     * @param alpha a linear interpolation value (default is 1)
     */
    // setPositionFor( target: THREE.Object3D,
    //                 visualDirection: Vector2,
    //                 visualSize?: number,
    //                 alpha = 1) {
    //     let distance: number
    //     if (typeof visualSize === 'number' && visualSize > 0) {
    //         distance = this.computeDistanceFor(target, visualSize)
    //     } else {
    //         distance = this.getDistanceOf(target)
    //     }
    //     const start = vectors.get().copy(target.position)
    //     const end = target.position
    //     this.getCartesianForVisualDirection(visualDirection, end)
    //     end.transformDirection(this.object.matrixWorld).multiplyScalar(distance)
    //     target.parent && target.parent.worldToLocal(end)
    //     target.position.copy(start.lerp(end, alpha))
    //     vectors.pool(start)
    // }

    /**
     * Set a new scale for the target that
     * would make it have the desired visual size
     * in this object's `visual-space`.
     *
     * @param target
     * @param visualSize the desired visual size of the target (in DEGREES)
     * @param alpha a linear interpolation value (default is 1)w
     */
    // setScaleFor(target: THREE.Object3D, visualSize: number, alpha = 1) {
    //     const idealDistance = this.computeDistanceFor(target, visualSize)
    //     const currentDistance = this.getDistanceOf(target)
    //     const distanceScale = idealDistance / currentDistance
    //     const start = vectors.get().copy(target.scale)
    //     const end = target.scale
    //     if (isFinite(distanceScale)) { end.multiplyScalar(distanceScale) }
    //     target.scale.copy(start.lerp(end, alpha))
    //     vectors.pool(start)
    // }

    // /**
    //  * Perform a look-at operation on the target object, based
    //  * on this object's local up direction.
    //  * @param target
    //  */
    // setOrientationFor(target: THREE.Object3D, alpha = 1) {
    //     const localObjectUp = vectors.get().set(0, 1, 0)
    //     const savedTargetUp = vectors.get().copy(target.up)
    //     const globalObjectUp = localObjectUp.transformDirection(this.object.matrixWorld)
    //     target.up.copy(globalObjectUp)
    //     const start = quaternions.get().copy(target.quaternion)
    //     const lookAtVector = vectors.get().setFromMatrixPosition(this.object.matrixWorld)
    //     target.lookAt(lookAtVector)
    //     target.up.copy(savedTargetUp)
    //     const end = target.quaternion
    //     target.quaternion.copy(start.slerp(end, alpha))
    //     vectors.pool(localObjectUp, savedTargetUp, lookAtVector)
    //     quaternions.pool(start)
    // }


    // computeDistanceFor(target: THREE.Object3D, visualSize: number): number {
    //     if (visualSize < 0 || visualSize > 360) { throw new Error('Invalid visualSize, must be between [0-360]') }
    //     const targetMatrixWorldInverse = matrices.get().getInverse(this.getMatrixWorld(target))
    //     const frustum = this.getVisualFrustumOf(target)
    //     return 0
    //     // if (sphereRadius === 0) { return this.getDistanceOf(target) }

    //     // if (visualSize > 180) {
    //     //     // special case: linearly decrease distance with increasing visual size within the bounding sphere.
    //     //     return (360 - visualSize / 180) * sphereRadius
    //     // }

    //     // // see https://stackoverflow.com/questions/21648630/radius-of-projected-sphere-in-screen-space
    //     // return sphereRadius / Math.sin( MathUtils.DEG2RAD * visualSize / 2 )
    // }

    getOrientationOf(target: THREE.Object3D, out: THREE.Quaternion) {
        const rotMat = matrices.get()
        const targetWorldOrientation = quaternions.get().setFromRotationMatrix(rotMat.extractRotation(this.getMatrixWorld(target)))
        const inverseThisWorldOrientation = quaternions.get().setFromRotationMatrix(rotMat.extractRotation(this.getMatrixWorld(this.object))).inverse()
        out.multiplyQuaternions(inverseThisWorldOrientation, targetWorldOrientation)
        quaternions.pool(targetWorldOrientation) 
        quaternions.pool(inverseThisWorldOrientation)
        matrices.pool(rotMat)
        return out
    } 

    /**
     * Calculate the visual direction towards the target object.
     * Assumes that a normal object faces +Z, and a camera faces -Z.
     *
     * If pointing directly towards the target object, the direction is [0,0] (forward)
     * If pointing directly opposite of the target object, the direction is [0,-180] (backwards)
     * Special Case: if both are at the same exact position, the direction is [0,0] (forward)
     */
    getVisualDirectionOf(target: THREE.Object3D, out: Vector2) {
        const direction = this.getDirectionOf(target, vectors.get())
        const visualDirection = this.getVisualDirectionForCartesian(direction, out)
        vectors.pool(direction)
        return visualDirection
    }


    /**
     * Calculate the visual angle towards the target object.
     * Assumes that a normal object faces +Z, and a camera faces -Z.
     *
     * If the target object is to the right of the forward vector, the angle is 0
     * If the target object is above the forward vector, the angle is 90
     * If the target object is to the left of the forward vector, then angle is 180
     * If the target object is below the forward vector, the angle is 270
     * If pointing directly towards the target object, the angle is 90 (up)
     * If pointing directly opposite of the target object, the direction is [0,-180] (backwards)
     * Special Case: if both are at the same exact position, the direction is [0,0] (forward)
     */
    getVisualAngleOf(target: THREE.Object3D, out: Vector2) {
        const direction = this.getDirectionOf(target, vectors.get())
        const visualDirection = this.getVisualDirectionForCartesian(direction, out)
        vectors.pool(direction)
        return visualDirection
    }

    /**
     * Calculate the bounds of the target object, in the local `object-space` coordinate system. 
     * @param target 
     * @param out 
     */
    getBoundsOf(target: THREE.Object3D, out = this._box) {
        if (out === this._box) {
            out.objectFilter = SpatialMetrics.objectFilter
            out.objectExpansion = 'box'
        }
        out.coordinateSystem = this.object
        return out.setFromObject(target)
    }
    private _box = new Box3


    private _visualFrustum = new VisualFrustum
    getVisualFrustumOf(target: THREE.Object3D = this.object, out = this._visualFrustum) {
        if (out === this._visualFrustum) {
            out.objectFilter = SpatialMetrics.objectFilter
            out.objectExpansion = 'box'
        }
        out.coordinateSystem = this.object
        const camera = target as THREE.Camera
        if (camera.isCamera) out.setFromPerspectiveProjectionMatrix(camera.projectionMatrix)
        else out.setFromObject(target)
        return out
    }

    // /**
    //  * Calculate the visual bounds of the target object, in the local `visual-space` coordinate system
    //  * @param target 
    //  * @param out 
    //  */
    // getVisualBoundsOf(target: THREE.Object3D, out: VisualBounds) {
    //     const direction = this.getDirectionOf(target, vectors.get())
    //     const visualDirection = this.getVisualDirectionOf(target, vectors2.get())
    //     const rotation = matrices.get().lookAt(V_000, direction, V_010)
    //     const rotatedMatrixWorld = matrices.get().multiplyMatrices(rotation, this.object.matrixWorld)
    //     const rotatedMatrixWorldInverse = rotatedMatrixWorld.getInverse(rotatedMatrixWorld)
    //     _box.setFromObjectBoxes(target, rotatedMatrixWorldInverse)
    //     this.getVisualPointFromCartesianPoint(_box.min, out.leftBottomNear)
    //     this.getVisualPointFromCartesianPoint(_box.max, out.rightTopFar)
        
    //     matrices.pool(objectMatrixWorldInverse)
    // }

    /**
     * Calculate the angular offset (in DEGREES) between this object's forward vector,
     * and the direction towards the target object (as calculated by getDirectionOf).
     * Assumes that a normal object faces +Z, and a camera faces -Z.
     *
     * If pointing directly towards the target object, the visual offset is 0
     * If pointing directly opposite of the target object, the visual offset is 180
     * Special Case: if both are at the same position, the visual offset is 180
     */
    getVisualOffsetOf(target: THREE.Object3D): number {
        const direction = this.getDirectionOf(target, vectors.get())
        if (!(this.object as THREE.Camera).isCamera) { direction.applyQuaternion(rotateY180) }
        const result = V_001.angleTo(direction) * MathUtils.RAD2DEG
        vectors.pool(direction)
        return result
    }

    /**
     * Calculate the field of view of the target object as seen by this object.
     *
     * The `visual size` grows from 0 to 180 as the visual bouding box of the target grows in our
     * field of view.
     * Once we are inside the bounding box, the `visual size` continues to
     * increase linearly, from 180 to 360 at the center of the bounding box.
     * If the target object has no bounding sphere defined, the result is 0.
     *
     * @returns visual size of the target object in DEGREES, from [0-360], in horizontal and vertical dimensions
     */
    // getVisualSizeOf(target: THREE.Object3D, out:Vector2) {
    //     const direction = this.getDirectionOf(target, vectors.get())
    //     const rotation = matrices.get().lookAt(V_000, direction, V_010)
    //     const rotatedMatrixWorld = matrices.get().multiplyMatrices(rotation, this.object.matrixWorld)
    //     const rotatedMatrixWorldInverse = rotatedMatrixWorld.getInverse(rotatedMatrixWorld)
    //     const facingBox = _box.setFromObjectBoxes(target, rotatedMatrixWorldInverse)
    //     const facingBoxSize = facingBox.getSize(vectors.get())
    //     // const linearSize = mode === 'horizontal' ? facingBoxSize.x : facingBoxSize.y
    //     // const distance = this.getDistanceOf(target)
    //     const near = 
    //     out.x = 2 * Math.atan2(facingBoxSize.x / 2, distance) * MathUtils.RAD2DEG
    //     out.y = 2 * Math.atan2(facingBoxSize.y / 2, distance) * MathUtils.RAD2DEG
    //     vectors.pool(direction, facingBoxSize)
    //     matrices.pool(rotation, rotatedMatrixWorld)
    //     return out

    //     // const objectMatrixWorldInverse = matrices.get().getInverse(this.object.matrixWorld)
    //     // _box.setFromObjectBoxes(target, objectMatrixWorldInverse)
    //     // matrices.pool(objectMatrixWorldInverse)
    //     // const sphere = _box.getBoundingSphere(_sphere)
    //     // const sphereRadius = sphere.radius
    //     // if (sphereRadius <= 0) { return 0 }
    //     // const sphereDistance = this.getDistanceOf(target)
    //     // if (sphereDistance <= sphereRadius) {
    //     //     return 180 + (180 * sphereDistance / sphereRadius)
    //     // } // we are inside the bounding sphere
    //     // // see https://stackoverflow.com/questions/21648630/radius-of-projected-sphere-in-screen-space
    //     // return 2 * Math.asin(sphereRadius / sphereDistance) * 180 / Math.PI
    // }

    // getVisualWidthOf(target: THREE.Object3D) {
    //     const size = this.getVisualSizeOf(target, vectors2.get())
    //     const width = size.x
    //     vectors2.pool(size)
    //     return width
    // }

    // getVisualHeightOf(target: THREE.Object3D) {
    //     const size = this.getVisualSizeOf(target, vectors2.get())
    //     const height = size.y
    //     vectors2.pool(size)
    //     return height
    // }

    // getVisualDiameterOf(target: THREE.Object3D) {
    //     const size = this.getVisualSizeOf(target, vectors2.get())
    //     const length = size.length()
    //     vectors2.pool(size)
    //     return length
    // }

    /**
     * Calculate the perspective visual frustum which bounds the the target object.
     * If no target is specified and the current object is a camera, returns 
     * a perspective visual frustum for the camera (assuming it is a perspective camera)
     */
    // getVisualFrustum(target:THREE.Object3D=this.object): VisualFrustum {
    //     if (!this._visualFrustum) { this._visualFrustum =  new VisualFrustum }
    //     const out = this._visualFrustum
    //     const camera = this.object as THREE.Camera
    //     if (camera.isCamera) { 
    //         const invProjection = matrices.get().getInverse(camera.projectionMatrix, true)
    //         out.setFromBoundsMatrix(invProjection)
    //         matrices.pool(invProjection)
    //     } else {
    //         const direction = this.getDirectionOf(target, vectors.get())
    //         const rotation = matrices.get().lookAt(V_000, direction, V_010)
    //         const rotatedMatrixWorld = matrices.get().multiplyMatrices(rotation, this.object.matrixWorld)
    //         const rotatedMatrixWorldInverse = rotatedMatrixWorld.getInverse(rotatedMatrixWorld)
    //         const facingBox = _box.setFromObjectBoxes(target, rotatedMatrixWorldInverse)
    //         const facingBoxSize = facingBox.getSize(vectors.get())
    //         const near = facingBox.min.z
    //         const far = facingBox.max.z
    //         const left = facingBox.min.x
    //         out.x = 2 * Math.atan2(facingBoxSize.x / 2, distance) * MathUtils.RAD2DEG
    //         out.y = 2 * Math.atan2(facingBoxSize.y / 2, distance) * MathUtils.RAD2DEG
    //         matrices.get().makePerspective()
    //     }
    //     return out
    // }

}


const directions = [
    new Vector3( 1, 0, 0),
    new Vector3( 0, 1, 0), 
    new Vector3( 0, 0, 1), 
    new Vector3(-1, 0, 0), 
    new Vector3( 0,-1, 0), 
    new Vector3( 0, 0,-1), 
]


// export function getMetrics(obj: THREE.Object3D) : SpatialMetrics {
//     if (_metricsMap.has(obj)) return _metricsMap.get(obj)!
//     const metrics = new SpatialMetrics(obj)
//     _metricsMap.set(obj, metrics)
//     return metrics
// }