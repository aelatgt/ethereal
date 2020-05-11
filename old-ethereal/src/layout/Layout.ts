import * as THREE from 'three'
import { SpatialMetrics, Box3 } from '../metrics/SpatialMetrics'
import { V_000, V_111 } from '../utils'
import { MathUtils, Vector3, Matrix4, Quaternion } from 'three'

export const LayoutFit = {
    contain: 'contain',
    contain2d: 'contain2d',
    cover: 'cover',
    cover2d: 'cover2d',
    fill: 'fill',
    fill2d: 'fill2d',
}

export type LayoutFitType = keyof typeof LayoutFit

export type LayoutX = number|'center'|'left'|'right'
export type LayoutY = number|'center'|'top'|'bottom'
export type LayoutZ = number|'center'|'front'|'back'

const scratchV_1 = new Vector3
const scratchV_2 = new Vector3
const scratchV_3 = new Vector3
const scratchV_4 = new Vector3
const scratchV_5 = new Vector3
const scratchV_6 = new Vector3
const scratchV_7 = new Vector3
const scratchMat_1 = new Matrix4

const FIT_CONTAIN : LayoutFitMap = {
    contain: 1,
    contain2d: 0,
    cover: 0,
    cover2d: 0,
    fill: 0,
    fill2d: 0,
}

type LayoutFitMap = {
    [T in LayoutFitType]: number
}

/**
 * Extend THREE.Object3D functionality with 3D layout functionality.
 * 
 * Features include:
 *  - automatic inner bounds computation
 *  - modify layout with respect to inner bounds and outer bounds
 */
export class Layout {

    /**
     * Forces a new bounding context
     */
    forceBoundingContext = false

    /**
     * Specifies the degree to which the layout properties (`absolute`, and `relative`) influence 
     * the final transform. At 0, the layout properties have no effect. At 1, they have
     * their full intended effect. 
     */
    weight = 1

    /**
     * Specify relative layout bounds, with -0.5 to 0.5 spanning the 
     * range of `computedOuterBounds` for each dimension. A mininum or 
     * maximum value can be set to `NaN` in any dimension to remain 
     * unspecified. 
     *  
     * Note: any specified `relative` and `absolute` bounds
     * are combined to determine `computedBounds`
     */
    relative = new Box3().setFromCenterAndSize(V_000, V_111)
    
    /**
     * Specify absolute layout bounds. A mininum or maximum value
     * can be set to `NaN` in any dimension to remain unspecified. 
     * 
     * Note: any specified `relative` and `absolute` bounds
     * are combined to determine `computedBounds`
     */
    absolute =  new Box3().setFromCenterAndSize(V_000, V_000)

    /**
     * Specify the orientation of the layout. Default is identity. 
     */
    orientation = new Quaternion

    /**
     * 
     */
    minRelativeSize = new Vector3

    /**
     * 
     */
    minAbsoluteSize = new Vector3

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
    private _fit = 'contain2d' as LayoutFitType

    /** Used internally. */
    fitTargets:LayoutFitMap = {
        contain: 1,
        contain2d: 0,
        cover: 0,
        cover2d: 0,
        fill: 0,
        fill2d: 0,
    }

    /**
     * 
     */
    fitAlign = new Vector3

    clip = new Box3
    inner = new Box3
    innerAutoCompute = false

    computedInnerBounds = new Box3
    computedOuterBounds = new Box3
    computedBoundsPreClip = new Box3
    computedBoundsPreFit = new Box3
    computedBounds = new Box3

    public matrix = new Matrix4

    constructor(public object:THREE.Object3D) {
        this.computedInnerBounds.objectFilter = SpatialMetrics.objectFilter
        this.computedInnerBounds.objectExpansion = 'box'
        this.computedInnerBounds.coordinateSystem = object
    }

    resetLayout() {
        this.fit = 'contain'
        this.absolute.setFromCenterAndSize(V_000, V_000)
        this.relative.setFromCenterAndSize(V_000, V_111)
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
     * layout properties are only applied when inner bounds are defined
     */
    hasInnerBounds() {
        return this.computedInnerBounds.isFinite()
    }

    /**
     * If true, the `object` should not be included in the bounding calculation
     * for any parent layouts.
     */
    isBoundingContext() {
        if (this.forceBoundingContext) return true
        if (this.hasInnerBounds()) {
            return true
        }
        return false
    }

    updateMatrix() {
        const bounds = this.computedBounds

        Layout.updateOuterBounds(this.object)
        Layout.updateInnerBounds(this.object)
        
        if (!this.hasInnerBounds()) {
            this.computedBounds.copy(this.computedInnerBounds)
            this.matrix.identity()
            return
        }

        const {absolute, relative, fitTargets, orientation, computedInnerBounds, computedOuterBounds, clip} = this


        // combine relative and absolute bounds
        bounds.makeEmpty()
        computedOuterBounds.relativeToAbsolute(relative.min, bounds.min)
        computedOuterBounds.relativeToAbsolute(relative.max, bounds.max)
        bounds.min.add(absolute.min)
        bounds.max.add(absolute.max)

        // compute unclipped bounds (fill in any unspecified dimensions)
        const minSize = computedOuterBounds.getSize(scratchV_1).multiply(this.minRelativeSize).max(this.minAbsoluteSize)  
        if (!isFinite(minSize.x)) minSize.x = 0
        if (!isFinite(minSize.y)) minSize.y = 0
        if (!isFinite(minSize.z)) minSize.z = 0
        const innerSize = computedInnerBounds.getSize(scratchV_2)        
        // const innerCenter = computedInnerBounds.getCenter(scratchV_3)//.divide(unclippedLayoutScale)
        const unclippedLayoutScale = Layout.adjustScaleForFit(FIT_CONTAIN, bounds.getSize(scratchV_4).max(minSize).divide(innerSize))
        const unclippedSize = scratchV_5.multiplyVectors(innerSize, unclippedLayoutScale)
        if (!isFinite(bounds.min.x) && !isFinite(bounds.max.x)) {
            bounds.max.x = unclippedSize.x / 2
            bounds.min.x = - bounds.max.x
        }
        if (!isFinite(bounds.min.y) && !isFinite(bounds.max.y)) {
            bounds.max.y = unclippedSize.y / 2
            bounds.min.y = - bounds.max.y
        }
        if (!isFinite(bounds.min.z) && !isFinite(bounds.max.z)) {
            bounds.max.z = unclippedSize.z / 2
            bounds.min.z = - bounds.max.z
        }
        if (!isFinite(bounds.max.x)) bounds.max.x = bounds.min.x + unclippedSize.x
        if (!isFinite(bounds.max.y)) bounds.max.y = bounds.min.y + unclippedSize.y
        if (!isFinite(bounds.max.z)) bounds.max.z = bounds.min.z + unclippedSize.z
        if (!isFinite(bounds.min.x)) bounds.min.x = bounds.max.x - unclippedSize.x
        if (!isFinite(bounds.min.y)) bounds.min.y = bounds.max.y - unclippedSize.y
        if (!isFinite(bounds.min.z)) bounds.min.z = bounds.max.z - unclippedSize.z
        this.computedBoundsPreClip.copy(bounds)

        // apply clip
        const clipMin = scratchV_4.copy(clip.min).min(bounds.max)
        const clipMax = scratchV_5.copy(clip.max).max(bounds.min)
        const clipSize = scratchV_6.subVectors(clipMax, clipMin)
        if (clipSize.x === 0) clipMin.x -= 1e-10, clipMax.x += 1e-10
        if (clipSize.y === 0) clipMin.y -= 1e-10, clipMax.y += 1e-10
        if (clipSize.z === 0) clipMin.z -= 1e-10, clipMax.z += 1e-10
        if (isFinite(clip.min.x)) bounds.min.x = Math.max(bounds.min.x, clipMin.x)
        if (isFinite(clip.min.y)) bounds.min.y = Math.max(bounds.min.y, clipMin.y)
        if (isFinite(clip.min.z)) bounds.min.z = Math.max(bounds.min.z, clipMin.z)
        if (isFinite(clip.max.x)) bounds.max.x = Math.min(bounds.max.x, clipMax.x)
        if (isFinite(clip.max.y)) bounds.max.y = Math.min(bounds.max.y, clipMax.y)
        if (isFinite(clip.max.z)) bounds.max.z = Math.min(bounds.max.z, clipMax.z)
        this.computedBoundsPreFit.copy(bounds)

        // apply fit
        const finalLayoutScale = Layout.adjustScaleForFit(fitTargets, bounds.getSize(scratchV_4).max(minSize).divide(innerSize))
        const finalSize = scratchV_5.multiplyVectors(innerSize, finalLayoutScale)
        const halfFinalSize = finalSize.divideScalar(2)
        const layoutAlignOffset = bounds.relativeToAbsolute(this.fitAlign, scratchV_6)
        bounds.min.copy(layoutAlignOffset).sub(halfFinalSize)
        bounds.max.copy(layoutAlignOffset).add(halfFinalSize)
        const innerAlignOffset = computedInnerBounds.relativeToAbsolute(this.fitAlign, scratchV_7)
        innerAlignOffset.multiply(finalLayoutScale)
        bounds.min.sub(innerAlignOffset)
        bounds.max.sub(innerAlignOffset)

        // move bounds inside content region if necessary
        const diffMin = scratchV_1.subVectors(bounds.min, this.computedBoundsPreClip.min)
        const diffMax = scratchV_2.subVectors(bounds.max, this.computedBoundsPreClip.max)
        const sumDiff = scratchV_3.setScalar(0)
        if (diffMin.x < 0) sumDiff.x += diffMin.x
        if (diffMin.y < 0) sumDiff.y += diffMin.y
        if (diffMin.z < 0) sumDiff.z += diffMin.z
        if (diffMax.x > 0) sumDiff.x += diffMax.x
        if (diffMax.y > 0) sumDiff.y += diffMax.y
        if (diffMax.z > 0) sumDiff.z += diffMax.z
        const offset = scratchV_4.copy(layoutAlignOffset).sub(sumDiff)
        // offset.max(this.computedBoundsPreClip.min)
        // offset.min(this.computedBoundsPreClip.max)
        offset.sub(layoutAlignOffset)
        bounds.min.add(offset)
        bounds.max.add(offset)

        // compose layout matrix
        Layout.getMatrixFromBounds(this.orientation, this.computedInnerBounds, bounds, this.matrix)
    }

    private static _scratch_center = new Vector3
    private static _scratch_innerCenter = new Vector3
    private static _scratch_innerSize = new Vector3
    private static _scratch_scale = new Vector3
    public static getMatrixFromBounds(orientation:THREE.Quaternion, inner:Box3, bounds:Box3, matrix:Matrix4) {
        const orient = scratchMat_1.makeRotationFromQuaternion(orientation)
        const layoutPosition = bounds.getCenter(Layout._scratch_center).applyMatrix4(orient)
        const innerSize = inner.getSize(Layout._scratch_innerSize)
        const innerCenter = inner.getCenter(Layout._scratch_innerCenter)
        const boundsSize = bounds.getSize(Layout._scratch_scale)
        const scale = boundsSize.divide(innerSize)
        if (scale.x === 0) scale.x = 1e-10
        if (scale.y === 0) scale.y = 1e-10
        if (scale.z === 0) scale.z = 1e-10
        if (innerSize.x === 0) scale.x = 1
        if (innerSize.y === 0) scale.y = 1
        if (innerSize.z === 0) scale.z = 1
        layoutPosition.sub(innerCenter.multiply(scale))
        return matrix.compose(layoutPosition, orientation, scale)
    }
    
    public static updateOuterBounds(o:THREE.Object3D) {
        const layout = o.layout
        const outerBounds = layout.computedOuterBounds
        const parent = o.parent
        const cameraParent = parent as THREE.Camera
        if (cameraParent && cameraParent.isCamera) {
            const position = scratchV_1.setFromMatrixPosition(o.matrix)
            const projectionMatrixInverse = scratchMat_1.getInverse(cameraParent.projectionMatrix)
            const near = outerBounds.min.set(0,0,-1).applyMatrix4(projectionMatrixInverse).z
            const projectionZ = outerBounds.min.set(0,0,position.z).applyMatrix4(cameraParent.projectionMatrix).z
            outerBounds.min.set(-1, -1, projectionZ)
            outerBounds.max.set(1, 1, projectionZ)
            outerBounds.min.applyMatrix4(projectionMatrixInverse)
            outerBounds.max.applyMatrix4(projectionMatrixInverse)
            outerBounds.min.z = 0
            outerBounds.max.z = near - position.z
        } else if (parent) {
            if (parent.layout.hasInnerBounds()) outerBounds.copy(parent.layout.computedInnerBounds)
            else outerBounds.copy(parent.layout.computedOuterBounds)
        } else {
            outerBounds.makeEmpty()
        }
        const orient = scratchMat_1.makeRotationFromQuaternion(layout.orientation)
        outerBounds.applyMatrix4(orient.getInverse(orient))
        if (outerBounds.isEmpty()) outerBounds.makeEmpty()
        return outerBounds
    }

    public static updateInnerBounds(o:THREE.Object3D) {
        const layout = o.layout
        const innerBounds = layout.computedInnerBounds
        if (layout.innerAutoCompute) innerBounds.setFromObject(o)
        else innerBounds.makeEmpty()
        innerBounds.union(layout.inner)
        // if (innerBounds.min.x === innerBounds.max.x) innerBounds.max.x += 1e-10
        // if (innerBounds.min.y === innerBounds.max.y) innerBounds.max.y += 1e-10
        // if (innerBounds.min.z === innerBounds.max.z) innerBounds.max.z += 1e-10
        // if (innerBounds.isEmpty()) { // pass outer bounds down if there is no inner bounds 
        //     innerBounds.copy(layout.computedOuterBounds)
        // }
        return innerBounds
    }

    public static _fitScale = new Vector3
    public static adjustScaleForFit(fitTargets:LayoutFitMap, sizeScale:Vector3) {
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
        out.x = out.x < 0 ? MathUtils.clamp(out.x, -max, -min) : MathUtils.clamp(out.x, min, max)
        out.y = out.y < 0 ? MathUtils.clamp(out.y, -max, -min) : MathUtils.clamp(out.y, min, max)
        out.z = out.z < 0 ? MathUtils.clamp(out.z, -max, -min) : MathUtils.clamp(out.z, min, max)
        
        const {x,y,z} = out
        const ax = Math.abs(x)
        const ay = Math.abs(y)
        const az = Math.abs(z)

        // fill3d: allow all dimensions to fill layout size
        if (fitTargets.fill) {
            // no-op
        }

        // fill (2D): set z to average of x and y
        if (fitTargets.fill2d) {
            fitScale.set(x, y, (x + y) / 2)
            out.lerp(fitScale, fitTargets.fill2d)
        }

        // contain (2D): set all dimensions to smallest of x or y
        if (fitTargets.contain2d) {
            if (ax < ay) {
                fitScale.set(x, x, x)
            } else {
                fitScale.set(y, y, y)
            }
            out.lerp(fitScale, fitTargets.contain2d)
        }

        // contain3d: set all dimensions to smallest of x or y or z
        if (fitTargets.contain) {
            if (ax < ay && ax < az) {
                fitScale.set(x, x, x)
            } else if (ay < ax && ay < az) {
                fitScale.set(y, y, y)
            } else {
                fitScale.set(z, z, z)
            }
            out.lerp(fitScale, fitTargets.contain)
        }

        // cover (2D): set all dimensions to largest of x or y
        if (fitTargets.cover2d) {
            if (ax > ay) {
                fitScale.set(x, x, x)
            } else {
                fitScale.set(y, y, y)
            }
            out.lerp(fitScale, fitTargets.cover2d)
        }

        // cover (3D): set all dimensions to largest of x or y or z
        if (fitTargets.cover) {
            if (ax > ay && ax > az) {
                fitScale.set(x, x, x)
            } else if (ay > ax && ay > az) {
                fitScale.set(y, y, y)
            } else {
                fitScale.set(z, z, z)
            }
            out.lerp(fitScale, fitTargets.cover)
        }

        // clamp between 1e-10 and 1e10
        if (!isFinite(out.x)) out.x = min
        if (!isFinite(out.y)) out.y = min
        if (!isFinite(out.z)) out.z = min
        out.x = out.x < 0 ? MathUtils.clamp(out.x, -max, -min) : MathUtils.clamp(out.x, min, max)
        out.y = out.y < 0 ? MathUtils.clamp(out.y, -max, -min) : MathUtils.clamp(out.y, min, max)
        out.z = out.z < 0 ? MathUtils.clamp(out.z, -max, -min) : MathUtils.clamp(out.z, min, max)
        out.x = Math.abs(out.x)
        out.y = Math.abs(out.y)
        out.z = Math.abs(out.z)
        return out
    }
}

// function isNaN(a:number) {
//     return a !== a
// }