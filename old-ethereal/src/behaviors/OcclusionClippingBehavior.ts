import * as THREE from 'three'
import { Behavior } from './Behavior'
import { Layout } from '../layout/Layout'
import { SpatialMetrics, Box3, VisualFrustum } from '../metrics/SpatialMetrics'
import { BehaviorManager } from './BehaviorManager'
import { Vector3, Matrix4, Frustum, Ray } from 'three' 
import '../THREE_Extensions'

// TODO: take occluder velocity into account, ignore fast moving occluders
// TODO: clip change threshold to minimize small corrections

export class OcclusionClippingBehavior extends Behavior {
    
    occluders = [] as THREE.Object3D[]

    occluderInfluenceDelay = 0.5

    clipSides = {
        left: true,
        right: true,
        top: true,
        bottom: true,
    }

    /**
     * Enable frustum-based clipping
     */
    cameraClippingEnabled = true

    /**
     * Frustum clipping inset in DEGREES
     */
    cameraClippingInset = 1

    private _occlusionTime = new WeakMap<THREE.Object3D, number>()
    private _preClipLayoutMatrix = new Matrix4
    private _preClipLocalMatrix = new Matrix4
    private _preClipMatrixWorld = new Matrix4
    private _cameraToObjectMatrix = new Matrix4
    // private _cameraPosition = new Vector3
    private _cameraDirection = new Vector3
    private _projectionMatrix = new Matrix4
    private _inverseOrientationMatrix = new Matrix4

    private _corner = new Vector3
    private _scratchV1 = new Vector3

    private _boxA = new Box3
    private _boxB = new Box3
    private _visualFrustum = new VisualFrustum()
    private _frustum = new Frustum()
    private _ray = new Ray()
    private _oppositeCorner = new Vector3()

    update(deltaTime:number) {
        const layout = this.object.layout
        const preClipLayoutMatrix = Layout.getMatrixFromBounds(layout.orientation, layout.computedInnerBounds, layout.computedBoundsPreClip, this._preClipLayoutMatrix)
        const preClipLocalMatrix = this._preClipLocalMatrix.multiplyMatrices(this.object.matrix, preClipLayoutMatrix)
        this.object.parent ? 
            this._preClipMatrixWorld.multiplyMatrices(this.object.parent.transitioner.matrixWorldTarget, preClipLocalMatrix) : 
            this._preClipMatrixWorld.copy(this._preClipLocalMatrix)
            
        layout.clip.makeEmpty()
        this._performCameraClipping()
        // this.performOccluderClipping(deltaTime)
        layout.clip.applyMatrix4(preClipLocalMatrix)
        this._inverseOrientationMatrix.makeRotationFromQuaternion(layout.orientation)
        this._inverseOrientationMatrix.getInverse(this._inverseOrientationMatrix)
        layout.clip.applyMatrix4(this._inverseOrientationMatrix)
    }

    private _cornerScratch = new Vector3
    private _cameraSpaceCornerScratch = new Vector3
    private _cameraForward = new Vector3(0,0,-1)
    private _getClosestCorner(bounds:Box3, objectToCameraMatrix:THREE.Matrix4, out:THREE.Vector3) {
        let dot = -1
        for (let i=0; i <= 0b111; i++) {
            const corner = this._cornerScratch
            corner.x = i & 4 ? bounds.max.x : bounds.min.x
            corner.y = i & 2 ? bounds.max.y : bounds.min.y
            corner.z = i & 1 ? bounds.max.z : bounds.min.z
            const cornerDirection = this._cameraSpaceCornerScratch.copy(corner).applyMatrix4(objectToCameraMatrix).normalize()
            const newDot = cornerDirection.dot(this._cameraForward)
            if (newDot > dot) {
                dot = newDot
                out.copy(corner)
            }
        }
        return out
    }

    private _performCameraClipping() {
        if (!this.cameraClippingEnabled) return

        const object = this.object
        const layout = object.layout
        const camera = BehaviorManager.currentCamera
        const clip = layout.clip
        const objectBounds = this._boxA.copy(layout.computedInnerBounds)
        const cameraToObjectMatrix = this._cameraToObjectMatrix.getInverse(this._preClipMatrixWorld).multiply(camera.matrixWorld)
        
        this._visualFrustum.setFromPerspectiveProjectionMatrix(camera.projectionMatrix)
        this._visualFrustum.min.x += this.cameraClippingInset
        this._visualFrustum.max.x -= this.cameraClippingInset
        this._visualFrustum.min.y += this.cameraClippingInset
        this._visualFrustum.max.y -= this.cameraClippingInset

        const projectionMatrix = this._visualFrustum.getPerspectiveProjectionMatrix(this._projectionMatrix)
        const frustum = this._frustum.setFromProjectionMatrix(projectionMatrix)
        for (const p of frustum.planes) {
            p.applyMatrix4(cameraToObjectMatrix)
        }

        clip.min.copy(objectBounds.min)
        clip.max.copy(objectBounds.max)

        let corner = null as THREE.Vector3|null
        let cornerScore = -Infinity 
        let cornerIndex = -1
        const ray = this._ray
        const sides = this.clipSides

        // clip corners until all corners are inside inside the frustum
        do {
            corner = null
            cornerScore = -Infinity
            cornerIndex = -1

            for (const plane of frustum.planes) { // 0:right, 1:left, 2:top, 3:bottom, 4:far, 5:near
                for (let i=0; i <= 0b111; i++) { // corners are 0b{xyz}
                    const isRightSide = i & 4 
                    const isTopSide = i & 2
                    const isNearSide = i & 1
                    ray.origin.x = isRightSide ? clip.max.x : clip.min.x
                    ray.origin.y = isTopSide   ? clip.max.y : clip.min.y
                    ray.origin.z = isNearSide  ? clip.max.z : clip.min.z
                    const oppositeCorner = this._oppositeCorner
                    oppositeCorner.x = isRightSide ? clip.min.x : clip.max.x
                    oppositeCorner.y = isTopSide   ? clip.min.y : clip.max.y
                    oppositeCorner.z = isNearSide  ? clip.min.z : clip.max.z
    
                    ray.direction.copy(plane.normal)
                    let ignoreX = !sides.right && isRightSide || !sides.left && !isRightSide
                    let ignoreY = !sides.top && isTopSide || !sides.bottom && !isTopSide
                    if (ignoreX) ray.direction.x = 0
                    if (ignoreY) ray.direction.y = 0
                    ray.direction.z = 0
                    ray.direction.normalize()

                    const intersection = ray.intersectPlane(plane, this._scratchV1)
                    if (!intersection) continue

                    const distance = intersection.distanceTo(ray.origin)
                    const score = distance
                    if (intersection && distance > 1e-10 && score > cornerScore) {
                        corner = this._corner.copy(intersection)
                        cornerIndex = i
                        cornerScore = score
                    }
                }
            }
            
            if (corner) {
                cornerIndex & 4 ? clip.max.x = corner.x : clip.min.x = corner.x
                cornerIndex & 2 ? clip.max.y = corner.y : clip.min.y = corner.y
                cornerIndex & 1 ? clip.max.z = corner.z : clip.min.z = corner.z
            }

        } while (corner)

        let isInsideFrustum = false
        for (let i=0; i <= 0b111; i++) {
            const corner = this._scratchV1
            corner.x = i & 4 ? clip.max.x : clip.min.x
            corner.y = i & 2 ? clip.max.y : clip.min.y
            corner.z = i & 1 ? clip.max.z : clip.min.z
            if (frustum.containsPoint(corner)) {
                isInsideFrustum = true
                break
            }
        }
        
        if (!isInsideFrustum) {
            const objectToCameraMatrix = cameraToObjectMatrix.getInverse(cameraToObjectMatrix)
            // const cameraDirection = this._cameraDirection.set(0,0,-1).transformDirection(cameraToObjectMatrix)
            this._getClosestCorner(objectBounds, objectToCameraMatrix, clip.min)
            clip.max.copy(clip.min)
            clip.min.addScalar(-1e-10)
            clip.max.addScalar(1e-10)
        }
    }

    private _performOccluderClipping(deltaTime:number) {

        if (!this.occluders.length) return

        const object = this.object
        const camera = BehaviorManager.currentCamera
        const cameraMetrics = SpatialMetrics.get(camera)
        const objectDistance = cameraMetrics.getDistanceOf(object)
        const objectBounds = this._boxA.copy(object.layout.computedInnerBounds)

        objectBounds.min.z = -Infinity
        objectBounds.max.z = Infinity
        const objectBoundsSize = objectBounds.getSize(this._scratchV1)
        const objectMetrics = SpatialMetrics.get(object)
        const clip = object.layout.clip

        // for each occluder, need to crop the layout by at most 
        // a single cut that minimizes the lost space 
        for (let i = 0; i < this.occluders.length; i++) {
            const occluder = this.occluders[i]
            
            // todo: add priority rule to allow adaptation to background (rather than foreground) objects
            const occluderDistance = cameraMetrics.getDistanceOf(occluder)
            if (occluderDistance > objectDistance) {
                this._occlusionTime.set(occluder, 0)
                continue
            }

            // make sure potential occluder behaviors have already executed
            BehaviorManager.ensureUpdate(occluder)

            const occluderBounds = objectMetrics.getBoundsOf(occluder, this._boxB)
            occluderBounds.min.z = -Infinity
            occluderBounds.max.z = Infinity

            if (!objectBounds.intersectsBox(occluderBounds)) {
                this._occlusionTime.set(occluder, 0)
                continue
            }

            let occlusionTime = (this._occlusionTime.get(occluder) || 0) + deltaTime
            this._occlusionTime.set(occluder, occlusionTime)

            if (occlusionTime < this.occluderInfluenceDelay) {
                continue
            }
            
            const leftClipSpan = occluderBounds.max.x - objectBounds.min.x
            const rightClipSpan = objectBounds.max.x - occluderBounds.min.x
            const bottomClipSpan = occluderBounds.max.y - objectBounds.min.y
            const topClipSpan = objectBounds.max.y - occluderBounds.min.y
            const leftArea = leftClipSpan * objectBoundsSize.y
            const rightArea = rightClipSpan * objectBoundsSize.y
            const bottomArea = bottomClipSpan * objectBoundsSize.x
            const topArea = topClipSpan * objectBoundsSize.x
            
            // if (leftArea < rightArea && leftArea < bottomArea && leftArea < topArea) {
            //     clip.min.x = isFinite(clip.min.x) ? Math.max(occluderBounds.max.x, clip.min.x) : occluderBounds.max.x
            // } else if (rightArea < leftArea && rightArea < bottomArea && rightArea < topArea) {
            //     clip.max.x = isFinite(clip.max.x) ? Math.min(occluderBounds.min.x, clip.max.x) : occluderBounds.min.x
            // } else if (topArea < rightArea && topArea < bottomArea && topArea < leftArea) {
            //     clip.max.y = isFinite(clip.max.y) ? Math.min(occluderBounds.min.y, clip.max.y) : occluderBounds.min.y
            // } else {
            //     clip.min.y = isFinite(clip.min.y) ? Math.max(occluderBounds.max.y, clip.min.y) : occluderBounds.max.y
            // }
        }
    }
}