import * as THREE from 'three'
import { Behavior } from './Behavior'
import { SpatialMetrics, Box3 } from '../metrics/SpatialMetrics'
import { vectors } from '../utils'
import { AdaptivityManager } from './AdaptivityManager'
import { Transitionable } from '../layout/Transitioner'

// TODO: take occluder velocity into account, ignore fast moving occluders
// TODO: clip change threshold to minimize small corrections

export class AdaptiveClippingBehavior extends Behavior {

    private _boxA = new Box3
    private _boxB = new Box3

    occluders = [] as THREE.Object3D[]

    occluderInfluenceDelay = 0.5

    occlusionTime = new WeakMap<THREE.Object3D, number>()

    update(deltaTime:number) {
        const camera = AdaptivityManager.currentCamera
        const cameraMetrics = SpatialMetrics.get(camera)

        const object = this.object
        object.layout.clip.makeEmpty()
        object.updateWorldMatrix(true, true)
        const objectMetrics = SpatialMetrics.get(object)
        const objectDistance = cameraMetrics.getDistanceOf(object)
        const objectBounds = this._boxA.copy(object.layout.computedInnerBounds)
        objectBounds.min.z = -Infinity
        objectBounds.max.z = Infinity

        const clip = object.layout.clip
        // const clip = this.clipTarget.target.makeEmpty()

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

            const occluderCenter = occluderBounds.getCenter(vectors.get())
            if (occluderCenter.x > 0) clip.max.x = isFinite(clip.max.x) ? Math.min(occluderBounds.min.x, clip.max.x) : occluderBounds.min.x
            if (occluderCenter.x < 0) clip.min.x = isFinite(clip.min.x) ? Math.max(occluderBounds.max.x, clip.min.x) : occluderBounds.max.x
            if (occluderCenter.y > 0) clip.max.y = isFinite(clip.max.y) ? Math.min(occluderBounds.min.y, clip.max.y) : occluderBounds.min.y
            if (occluderCenter.y < 0) clip.min.y = isFinite(clip.min.y) ? Math.max(occluderBounds.max.y, clip.min.y) : occluderBounds.max.y
        }
    }

    postUpdate() {
        // this.object.layout.clip.copy(this.clipTarget.current)
        // this.object.updateWorldMatrix(true, true)
    }
}