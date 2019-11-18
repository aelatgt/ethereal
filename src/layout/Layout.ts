import * as THREE from 'three'
import { SpatialMetrics, Box3 } from '../metrics/SpatialMetrics'
import { matrices, vectors } from '../utils'

export const LayoutFit = {
    contain: 'contain',
    contain3d: 'contain3d',
    cover: 'cover',
    cover3d: 'cover3d',
    fill: 'fill',
    fill3d: 'fill3d',
}

const FIT_CONTAIN_3D = {
    contain: 0,
    contain3d: 1,
    cover: 0,
    cover3d: 0,
    fill: 0,
    fill3d: 0,
}

export type LayoutFitType = keyof typeof LayoutFit

export type LayoutX = number|'center'|'left'|'right'
export type LayoutY = number|'center'|'top'|'bottom'
export type LayoutZ = number|'center'|'front'|'back'


/**
 * Extend THREE.Object3D functionality with 3D layout functionality.
 * 
 * Features include:
 *  - automatic bounds computation
 *  - modify alignment, origin, and size with respect to bounds and parent bounds
 *  - pose & layout transitions
 */
export class Layout {

    /**
     * Force local layout bounds to be excluded from the parent bounding context 
     * (effectively, forces a new bounding context)
     */
    forceBoundsExclusion = false

    /**
     * Specifies the degree to which the layout properties (`absolute`, and `relative`) influence 
     * the final transform. At 0, the layout properties have no effect. At 1, they have
     * their full intended effect. 
     */
    weight = 1
    
    /**
     * Specify absolute layout bounds. A mininum or maximum boundary
     * can be set to `NaN` in any dimension to remain unspecified. 
     * 
     * Note: any specified `relative` and `absolute` bounds
     * are combined to determine `computedBounds`
     */
    absolute =  new Box3

    /**
     * Specify relative layout bounds, with -1 to 1 spanning the 
     * range of `computedOuterBounds` for each dimension. A mininum or 
     * maximum boundary can be set to `NaN` in any dimension to remain 
     * unspecified. 
     * 
     * Note: any specified `relative` and `absolute` bounds
     * are combined to determine `computedBounds`
     */
    relative = new Box3

    /**
     * Specify the orientation of the layout. Default is identity. 
     */
    orientation = new THREE.Quaternion

    /**
     * 
     */
    minRelativeSize = new THREE.Vector3

    /**
     * 
     */
    minAbsoluteSize = new THREE.Vector3

    /** 
     * Specifies how the object should fit within `absolute` and `relative` bounds,
     * which determines the `computedBounds`
    */
    set fit(fit:LayoutFitType) {
        this._fit = fit
        for (const id in this.fitTargets) this.fitTargets[id as LayoutFitType] = 0
        this.fitTargets[fit] = 1
    }
    get fit() {
        return this._fit
    }
    private _fit = 'contain' as LayoutFitType

    /** Used internally. */
    fitTargets = {
        contain: 1,
        contain3d: 0,
        cover: 0,
        cover3d: 0,
        fill: 0,
        fill3d: 0,
    }

    /**
     * 
     */
    fitAlign = new THREE.Vector3

    clip = new Box3

    inner = new Box3
    innerAutoUpdate = true

    computedBounds = new Box3
    computedInnerBounds = new Box3
    computedOuterBounds = new Box3
    computedClipBounds = new Box3

    public matrix = new THREE.Matrix4

    private _boundsValid = false

    constructor(public object:THREE.Object3D) {
        this.computedInnerBounds.objectFilter = SpatialMetrics.objectFilter
        this.computedInnerBounds.objectExpansion = 'box'
        this.computedInnerBounds.coordinateSystem = object
    }

    invalidateBounds() {
        this._boundsValid = false
    }

    resetLayout() {
        this.fit = 'contain'
        this.absolute.makeEmpty()
        this.relative.makeEmpty()
    }

    resetPose() {
        this.object.position.setScalar(0)
        this.object.quaternion.set(0,0,0,1)
        this.object.scale.setScalar(1)
    }

    reset() {
        this.resetLayout()
        this.resetPose()
    }

    /**
     * If true, the layout properties are effectively noop
     */
    isPassive() {
        return this.absolute.isEmpty() && this.relative.isEmpty()
    }

    /**
     * If true, the `object` should not be included in the bounding calculation
     * for any parent layouts.
     */
    isBoundingContext() {
        if (this.forceBoundsExclusion) return true
        if (!this.isPassive()) {
            this.forceBoundsExclusion = true
            return true
        }
        return false
    }

    updateMatrix() {
        const bounds = this.computedBounds
        
        if (this.isPassive()) {
            this.matrix.identity()
            return
        }

        if (!this._boundsValid) {
            Layout.updateInnerBounds(this.object)
            Layout.updateOuterBounds(this.object)
            if (this.computedInnerBounds.isEmpty()) {
                this.computedInnerBounds.copy(this.computedOuterBounds)
            }
            this._boundsValid = true
        }

        const {absolute, relative, fitTargets, orientation, computedInnerBounds, computedOuterBounds, clip} = this
        
        // combine relative and absolute bounds

        bounds.makeEmpty()
        computedOuterBounds.relativeToAbsolute(relative.min, bounds.min)
        computedOuterBounds.relativeToAbsolute(relative.max, bounds.max)
        if (isFinite(absolute.min.x)) bounds.min.x = (isFinite(bounds.min.x) ? bounds.min.x : 0) + absolute.min.x
        if (isFinite(absolute.min.y)) bounds.min.y = (isFinite(bounds.min.y) ? bounds.min.y : 0) + absolute.min.y
        if (isFinite(absolute.min.z)) bounds.min.z = (isFinite(bounds.min.z) ? bounds.min.z : 0) + absolute.min.z
        if (isFinite(absolute.max.x)) bounds.max.x = (isFinite(bounds.max.x) ? bounds.max.x : 0) + absolute.max.x
        if (isFinite(absolute.max.y)) bounds.max.y = (isFinite(bounds.max.y) ? bounds.max.y : 0) + absolute.max.y
        if (isFinite(absolute.max.z)) bounds.max.z = (isFinite(bounds.max.z) ? bounds.max.z : 0) + absolute.max.z

        // apply clip

        if (!clip.isEmpty()) {
            // const clipMax = vectors.get().copy(clip.max)//.subVectors(clip.max, bounds.max).min(V_000)
            // const clipMin = vectors.get().copy(clip.min)//.subVectors(clip.min, bounds.min).max(V_000)
            const clipMax = computedInnerBounds.absoluteToRelative(clip.max, vectors.get())//.subVectors(clip.max, bounds.max).min(V_000)
            const clipMin = computedInnerBounds.absoluteToRelative(clip.min, vectors.get())//.subVectors(clip.min, bounds.min).max(V_000)
            bounds.relativeToAbsolute(clipMax, clipMax)//.subVectors(clip.max, bounds.max).min(V_000)
            bounds.relativeToAbsolute(clipMin, clipMin)//.subVectors(clip.min, bounds.min).max(V_000)
            if (!isFinite(clipMax.x)) clipMax.x = Infinity
            if (!isFinite(clipMax.y)) clipMax.y = Infinity
            if (!isFinite(clipMax.z)) clipMax.z = Infinity
            if (!isFinite(clipMin.x)) clipMin.x = -Infinity
            if (!isFinite(clipMin.y)) clipMin.y = -Infinity
            if (!isFinite(clipMin.z)) clipMin.z = -Infinity
            bounds.max.min(clipMax)
            bounds.min.max(clipMin)
            vectors.pool(clipMax)
            vectors.pool(clipMin)
        }

        // compute min size
        const minSize = computedOuterBounds.getSize(vectors.get())
            .multiply(this.minRelativeSize).max(this.minAbsoluteSize)

        // compute final size
        const innerSize = computedInnerBounds.getSize(vectors.get())
        const layoutScale = bounds.getSize(vectors.get()).max(minSize).divide(innerSize)
        Layout.adjustScaleForFit(fitTargets, layoutScale)
        const finalSize = vectors.get().multiplyVectors(innerSize, layoutScale)
        finalSize.x = Math.abs(finalSize.x)
        finalSize.y = Math.abs(finalSize.y)
        finalSize.z = Math.abs(finalSize.z)

        if (!isFinite(bounds.min.x) && !isFinite(bounds.max.x)) {
            bounds.max.x = finalSize.x / 2
            bounds.min.x = - bounds.max.x
        }
        if (!isFinite(bounds.min.y) && !isFinite(bounds.max.y)) {
            bounds.max.y = finalSize.y / 2
            bounds.min.y = - bounds.max.y
        }
        if (!isFinite(bounds.min.z) && !isFinite(bounds.max.z)) {
            bounds.max.z = finalSize.z / 2
            bounds.min.z = - bounds.max.z
        }
        if (!isFinite(bounds.max.x)) bounds.max.x = bounds.min.x + finalSize.x
        if (!isFinite(bounds.max.y)) bounds.max.y = bounds.min.y + finalSize.y
        if (!isFinite(bounds.max.z)) bounds.max.z = bounds.min.z + finalSize.z
        if (!isFinite(bounds.min.x)) bounds.min.x = bounds.max.x - finalSize.x
        if (!isFinite(bounds.min.y)) bounds.min.y = bounds.max.y - finalSize.y
        if (!isFinite(bounds.min.z)) bounds.min.z = bounds.max.z - finalSize.z

        const orient = matrices.get().makeRotationFromQuaternion(orientation)
        const halfFinalSize = finalSize.divideScalar(2)

        const layoutAlignOffset = bounds.relativeToAbsolute(this.fitAlign, vectors.get())
        bounds.min.copy(layoutAlignOffset).sub(halfFinalSize)
        bounds.max.copy(layoutAlignOffset).add(halfFinalSize)
        bounds.applyMatrix4(orient)

        const innerAlignOffset = computedInnerBounds.relativeToAbsolute(this.fitAlign, vectors.get())
        innerAlignOffset.multiply(layoutScale).applyMatrix4(orient)
        bounds.min.sub(innerAlignOffset)
        bounds.max.sub(innerAlignOffset)

        // compose layout matrix

        const layoutPosition = bounds.getCenter(vectors.get())
        this.matrix.compose(layoutPosition, orientation, layoutScale)
        
        // cleanup

        vectors.pool(innerSize)
        vectors.pool(minSize)
        vectors.pool(finalSize)
        vectors.pool(layoutPosition)
        vectors.pool(layoutScale)
        vectors.pool(layoutAlignOffset)
        // vectors.pool(innerAlignOffset)
    }

    public static updateInnerBounds(o:THREE.Object3D) {
        const layout = o.layout
        const bounds = layout.computedInnerBounds
        if (layout._boundsValid) return bounds
        bounds.coordinateSystem = o
        bounds.setFromObject(o).union(layout.inner)
        if (bounds.min.x === bounds.max.x) bounds.max.x += 1e-10
        if (bounds.min.y === bounds.max.y) bounds.max.y += 1e-10
        if (bounds.min.z === bounds.max.z) bounds.max.z += 1e-10
        return bounds
    }
    
    public static updateOuterBounds(o:THREE.Object3D) {
        const layout = o.layout
        const parentBounds = layout.computedOuterBounds

        if (layout._boundsValid) return parentBounds

        const parent = o.parent
        const cameraParent = parent as THREE.Camera
        if (cameraParent && cameraParent.isCamera) {
            const position = vectors.get().setFromMatrixPosition(o.matrix)
            const projectionMatrixInverse = matrices.get().getInverse(cameraParent.projectionMatrix)
            const near = parentBounds.min.set(0,0,-1).applyMatrix4(projectionMatrixInverse).z
            const far = parentBounds.min.set(0,0,1).applyMatrix4(projectionMatrixInverse).z
            const projectionZ = parentBounds.min.set(0,0,position.z).applyMatrix4(cameraParent.projectionMatrix).z
            parentBounds.min.set(-1, -1, projectionZ)
            parentBounds.max.set(1, 1, projectionZ)
            parentBounds.min.applyMatrix4(projectionMatrixInverse)
            parentBounds.max.applyMatrix4(projectionMatrixInverse)
            parentBounds.min.z = far
            parentBounds.max.z = near
            vectors.pool(position)
            matrices.pool(projectionMatrixInverse)
        } else if (parent) {
            parentBounds.copy(parent.layout.computedInnerBounds)
        } else {
            parentBounds.makeEmpty()
        }

        const orient = matrices.get().makeRotationFromQuaternion(layout.orientation)
        parentBounds.applyMatrix4(orient.getInverse(orient))
        matrices.pool(orient)
        return parentBounds
    }

    public static _fitScale = new THREE.Vector3
    public static adjustScaleForFit(fitTargets:typeof Layout.prototype.fitTargets, sizeScale:THREE.Vector3) {
        const fitScale = this._fitScale
        const out = sizeScale
        const min = 1e-10
        const max = 1e10

        if (!isFinite(out.x) && !isFinite(out.y) && !isFinite(out.z)) {
            out.setScalar(1)
            return out
        }
        
        if (!isFinite(out.x)) out.x = max
        if (!isFinite(out.y)) out.y = max
        if (!isFinite(out.z)) out.z = max
        out.x = out.x < 0 ? THREE.Math.clamp(out.x, -max, -min) : THREE.Math.clamp(out.x, min, max)
        out.y = out.y < 0 ? THREE.Math.clamp(out.y, -max, -min) : THREE.Math.clamp(out.y, min, max)
        out.z = out.z < 0 ? THREE.Math.clamp(out.z, -max, -min) : THREE.Math.clamp(out.z, min, max)
        
        const {x,y,z} = out
        const ax = Math.abs(x)
        const ay = Math.abs(y)
        const az = Math.abs(z)

        // fill3d: allow all dimensions to fill layout size
        if (fitTargets.fill3d) {
            // no-op
        }

        // fill (2D): set z to average of x and y
        if (fitTargets.fill) {
            fitScale.set(x, y, x + y / 2)
            out.lerp(fitScale, fitTargets.fill)
        }

        // contain (2D): set all dimensions to smallest of x or y
        if (fitTargets.contain) {
            if (ax < ay) {
                fitScale.set(x, x, x)
            } else {
                fitScale.set(y, y, y)
            }
            out.lerp(fitScale, fitTargets.contain)
        }

        // contain3d: set all dimensions to smallest of x or y or z
        if (fitTargets.contain3d) {
            if (ax < ay && ax < az) {
                fitScale.set(x, x, x)
            } else if (ay < ax && ay < az) {
                fitScale.set(y, y, y)
            } else {
                fitScale.set(z, z, z)
            }
            out.lerp(fitScale, fitTargets.contain3d)
        }

        // cover (2D): set all dimensions to largest of x or y
        if (fitTargets.cover) {
            if (ax > ay) {
                fitScale.set(x, x, x)
            } else {
                fitScale.set(y, y, y)
            }
            out.lerp(fitScale, fitTargets.cover)
        }

        // cover (3D): set all dimensions to largest of x or y or z
        if (fitTargets.cover3d) {
            if (ax > ay && ax > az) {
                fitScale.set(x, x, x)
            } else if (ay > ax && ay > az) {
                fitScale.set(y, y, y)
            } else {
                fitScale.set(z, z, z)
            }
            out.lerp(fitScale, fitTargets.cover3d)
        }

        // clamp between 1e-10 and 1e10
        if (!isFinite(out.x)) out.x = min
        if (!isFinite(out.y)) out.y = min
        if (!isFinite(out.z)) out.z = min
        out.x = out.x < 0 ? THREE.Math.clamp(out.x, -max, -min) : THREE.Math.clamp(out.x, min, max)
        out.y = out.y < 0 ? THREE.Math.clamp(out.y, -max, -min) : THREE.Math.clamp(out.y, min, max)
        out.z = out.z < 0 ? THREE.Math.clamp(out.z, -max, -min) : THREE.Math.clamp(out.z, min, max)
        return out
    }
}

// function isNaN(a:number) {
//     return a !== a
// }