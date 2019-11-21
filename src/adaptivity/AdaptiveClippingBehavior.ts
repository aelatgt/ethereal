import * as THREE from 'three'
import { Behavior } from './Behavior'
import { SpatialMetrics, Box3, VisualFrustum } from '../metrics/SpatialMetrics'
import { vectors, matrices } from '../utils'
import { AdaptivityManager } from './AdaptivityManager'
import { Transitionable } from '../layout/Transitioner'

// TODO: take occluder velocity into account, ignore fast moving occluders
// TODO: clip change threshold to minimize small corrections

export class AdaptiveClippingBehavior extends Behavior {

    private _boxA = new Box3
    private _boxB = new Box3

    private _visualFrustum = new VisualFrustum(this.object)
    private _frustum = new THREE.Frustum()
    private _line = new THREE.Line3()
    private _corners = [
        new THREE.Vector3,
        new THREE.Vector3,
        new THREE.Vector3,
        new THREE.Vector3,
        new THREE.Vector3,
        new THREE.Vector3,
        new THREE.Vector3,
        new THREE.Vector3
    ]
    private _newCorners = [
        new THREE.Vector3,
        new THREE.Vector3,
        new THREE.Vector3,
        new THREE.Vector3,
        new THREE.Vector3,
        new THREE.Vector3,
        new THREE.Vector3,
        new THREE.Vector3
    ]
    private _intersectionCornerMap = new WeakMap<THREE.Vector3, number>()
    occluders = [] as THREE.Object3D[]

    occluderInfluenceDelay = 0.5

    occlusionTime = new WeakMap<THREE.Object3D, number>()

    update(deltaTime:number) {
        const object = this.object
        const clip = object.layout.clip.makeEmpty()
        const camera = AdaptivityManager.currentCamera
        const cameraMetrics = SpatialMetrics.get(camera)

        object.updateWorldMatrix(true, true)

        const objectMetrics = SpatialMetrics.get(object)
        const objectDistance = cameraMetrics.getDistanceOf(object)
        const objectBounds = this._boxA.copy(object.layout.computedInnerBounds)

        const cameraToObjectMatrix = matrices.get().getInverse(object.matrixWorld).multiply(camera.matrixWorld)        
        
        /***
         * 
         *  First: clip based on viewing frustum
         * 
         */
        const corners = this._corners
        corners[0].set(objectBounds.min.x, objectBounds.min.y, objectBounds.min.z)
        corners[1].set(objectBounds.min.x, objectBounds.min.y, objectBounds.max.z)
        corners[2].set(objectBounds.min.x, objectBounds.max.y, objectBounds.min.z)
        corners[3].set(objectBounds.min.x, objectBounds.max.y, objectBounds.max.z)
        corners[4].set(objectBounds.max.x, objectBounds.min.y, objectBounds.min.z)
        corners[5].set(objectBounds.max.x, objectBounds.min.y, objectBounds.max.z)
        corners[6].set(objectBounds.max.x, objectBounds.max.y, objectBounds.min.z)
        corners[7].set(objectBounds.max.x, objectBounds.max.y, objectBounds.max.z)
        const newCorners = this._newCorners
        for (const [i,corner] of newCorners.entries()) {
            corner.copy(corners[i])
            this._intersectionCornerMap.set(corner, i)
        }

        // 0:right, 1:left, 2:bottom, 3:top, 4:far, 5:near
        const frustum = this._frustum.setFromMatrix(camera.projectionMatrix)
        for (const p of frustum.planes) {
            p.applyMatrix4(cameraToObjectMatrix)
        }

        const line = this._line
        const intersectionScratch1 = vectors.get()
        for (const p of frustum.planes) {
            for (const [i, corner] of corners.entries()) {
                if (!frustum.containsPoint(corner)) {
                    line.end.copy(corner)
                    line.start.copy(corners[7-i])
                    const intersection = p.intersectLine(line, intersectionScratch1) 
                    if (intersection) newCorners[i].copy(intersection)
                }
            }
        }

        // const alignPosition = objectBounds.relativeToAbsolute(object.layout.fitAlign, vectors.get())
        // newCorners.sort((a,b) => {
        //     // const cornerA = this._intersectionCornerMap.get(a)!
        //     // const cornerB = this._intersectionCornerMap.get(b)!
        //     // return corners[cornerB].distanceToSquared(b) - corners[cornerA].distanceToSquared(a)
        //     return alignPosition.distanceToSquared(b) - alignPosition.distanceToSquared(a)
        // })
        
        clip.min.copy(corners[0])
        clip.max.copy(corners[7])

        let finalIntersections = [] as number[]
        for (const i of newCorners) {
            const corner = this._intersectionCornerMap.get(i)!

            // make sure intersection is not adjacent to any others
            if (finalIntersections.indexOf(corner) > -1) continue
            if (i.equals(corners[corner])) continue

            switch (corner) {
                case 0: clip.min.x = Math.max(i.x, clip.min.x); clip.min.y = Math.max(i.y, clip.min.y); clip.min.z = Math.max(i.z, clip.min.z); break;
                case 1: clip.min.x = Math.max(i.x, clip.min.x); clip.min.y = Math.max(i.y, clip.min.y); clip.max.z = Math.min(i.z, clip.max.z); break;
                case 2: clip.min.x = Math.max(i.x, clip.min.x); clip.max.y = Math.min(i.y, clip.max.y); clip.min.z = Math.max(i.z, clip.min.z); break;
                case 3: clip.min.x = Math.max(i.x, clip.min.x); clip.max.y = Math.min(i.y, clip.max.y); clip.max.z = Math.min(i.z, clip.max.z); break;
                case 4: clip.max.x = Math.min(i.x, clip.max.x); clip.min.y = Math.max(i.y, clip.min.y); clip.min.z = Math.max(i.z, clip.min.z); break;
                case 5: clip.max.x = Math.min(i.x, clip.max.x); clip.min.y = Math.max(i.y, clip.min.y); clip.max.z = Math.min(i.z, clip.max.z); break;
                case 6: clip.max.x = Math.min(i.x, clip.max.x); clip.max.y = Math.min(i.y, clip.max.y); clip.min.z = Math.max(i.z, clip.min.z); break;
                case 7: clip.max.x = Math.min(i.x, clip.max.x); clip.max.y = Math.min(i.y, clip.max.y); clip.max.z = Math.min(i.z, clip.max.z); break;
            }

            finalIntersections.push(corner)
        }

        const newClipSize = objectBounds.getSize(vectors.get())
        const clipCenter = clip.getCenter(vectors.get())
        const clipSize = clip.getSize(vectors.get())
        const epsilon = 1e-6
        newClipSize.x = (clipSize.x <= epsilon && clipSize.y >= epsilon) ? newClipSize.x : clipSize.x
        newClipSize.y = (clipSize.y <= epsilon && clipSize.x >= epsilon) ? newClipSize.y : clipSize.y
        newClipSize.z = (clipSize.z <= epsilon) ? newClipSize.z : clipSize.z
        if (clipSize.x <= epsilon && clipSize.y <= epsilon && clipSize.z <= epsilon) {
            objectBounds.getCenter(clipCenter)
            objectBounds.getSize(newClipSize)
        }
        clip.setFromCenterAndSize(clipCenter, newClipSize)

        /***
         * 
         *  Second: clip based on occluders
         * 
         */

        objectBounds.min.z = -Infinity
        objectBounds.max.z = Infinity
        const objectBoundsSize = objectBounds.getSize(vectors.get())

        // for each occluder, need to crop the layout by at most 
        // a single cut that minimizes the lost space 
        for (let i = 0; i < this.occluders.length; i++) {
            const occluder = this.occluders[i]

            // todo: add priority rule to allow adaptation to background (rather than foreground) objects
            const occluderDistance = cameraMetrics.getDistanceOf(occluder)
            if (occluderDistance > objectDistance) {
                this.occlusionTime.set(occluder, 0)
                continue
            }

            // make sure potential occluder behaviors have already executed
            AdaptivityManager.ensureUpdate(occluder)

            const occluderBounds = objectMetrics.getBoundsOf(occluder, this._boxB)
            occluderBounds.min.z = -Infinity
            occluderBounds.max.z = Infinity

            if (!objectBounds.intersectsBox(occluderBounds)) {
                this.occlusionTime.set(occluder, 0)
                continue
            }

            let occlusionTime = (this.occlusionTime.get(occluder) || 0) + deltaTime
            this.occlusionTime.set(occluder, occlusionTime)

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
            
            if (leftArea < rightArea && leftArea < bottomArea && leftArea < topArea) {
                clip.min.x = isFinite(clip.min.x) ? Math.max(occluderBounds.max.x, clip.min.x) : occluderBounds.max.x
            } else if (rightArea < leftArea && rightArea < bottomArea && rightArea < topArea) {
                clip.max.x = isFinite(clip.max.x) ? Math.min(occluderBounds.min.x, clip.max.x) : occluderBounds.min.x
            } else if (topArea < rightArea && topArea < bottomArea && topArea < leftArea) {
                clip.max.y = isFinite(clip.max.y) ? Math.min(occluderBounds.min.y, clip.max.y) : occluderBounds.min.y
            } else {
                clip.min.y = isFinite(clip.min.y) ? Math.max(occluderBounds.max.y, clip.min.y) : occluderBounds.max.y
            }
        }

        

    }

    postUpdate() {
        // this.object.layout.clip.copy(this.clipTarget.current)
        // this.object.updateWorldMatrix(true, true)
    }
}