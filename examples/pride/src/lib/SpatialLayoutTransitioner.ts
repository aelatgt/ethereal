// import * as THREE from 'three'
// import {matrices, vectors, V_000, V_111} from './SpatialUtils';
// import { SpatialLayoutFitType, SpatialLayout } from './SpatialLayout';

// export class SpatialLayoutTransitioner {

//     active = false
    
//     layoutWeight = 1

//     position = new THREE.Vector3().set(0,0,0)
//     quaternion = new THREE.Quaternion().set(0,0,0,1)
//     scale = new THREE.Vector3().set(1,1,1)

//     align = new THREE.Vector3().set(NaN,NaN,NaN)
//     anchor = new THREE.Vector3().set(NaN,NaN,NaN)
//     origin = new THREE.Vector3().set(NaN,NaN,NaN)
//     size = new THREE.Vector3().set(NaN,NaN,NaN)
    
//     fitTargets = {
//         contain: 1,
//         cover: 0,
//         fill: 0,
//         contain3d: 0,
//         cover3d: 0,
//         fill3d: 0,
//     }

//     minBounds = new THREE.Box3
    
//     lerpClampMin = 0
//     lerpClampMax = 1

//     speedMultiplier = {
//         all: 1,
//         layoutWeight: 1,
//         position: 1,
//         quaternion: 1,
//         scale: 1,
//         align: 1,
//         anchor: 1,
//         origin: 1,
//         size: 1,
//         fit: 1,
//         minBounds: 1
//     }

//     constructor(public object:THREE.Object3D) {
//         this.minBounds.min.setScalar(0)
//         this.minBounds.max.setScalar(0)
//     }

//     lerp(alpha:number) {
//         const o = this.object
//         const layout = this.object.layout

//         const {position, scale, quaternion, size, align, anchor, origin, minBounds} = this
    
//         const speed = this.speedMultiplier
//         const speedAll = speed.all
//         const clamp = THREE.Math.clamp
//         const min = this.lerpClampMin
//         const max = this.lerpClampMax

//         if (!this.active) {
//             position.copy(o.position)
//             quaternion.copy(o.quaternion)
//             scale.copy(o.scale)
//             align.copy(layout.align)
//             anchor.copy(layout.anchor)
//             origin.copy(layout.origin)
//             size.copy(layout.size)
//             for (const id in this.fitTargets) 
//                 this.fitTargets[id as SpatialLayoutFitType] = layout.fitTargets[id as SpatialLayoutFitType]
//         }

//         this.active = true

//         const nullAlign = layout.parentBounds.absoluteToRelative(V_000, vectors.get())
//         const nullAnchor = layout.bounds.absoluteToRelative(V_000, vectors.get())
//         const nullSize = layout.bounds.getSize(vectors.get()).divide(layout.parentBounds.getSize(vectors.get()))
//         if (!isFinite(nullSize.x)) nullSize.x = 1
//         if (!isFinite(nullSize.y)) nullSize.y = 1
//         if (!isFinite(nullSize.z)) nullSize.z = 1

//         this.layoutWeight = THREE.Math.lerp(this.layoutWeight, layout.weight, clamp(alpha * speedAll * speed.layoutWeight, min, max))
       
//         SpatialLayoutTransitioner._lerpToLayoutTarget(align, layout.align, clamp(alpha * speedAll * speed.align, min, max), nullAlign)
//         SpatialLayoutTransitioner._lerpToLayoutTarget(anchor, layout.anchor, clamp(alpha * speedAll * speed.anchor, min, max), nullAnchor)
//         SpatialLayoutTransitioner._lerpToLayoutTarget(origin, layout.origin, clamp(alpha * speedAll * speed.origin, min, max), nullAnchor)
//         SpatialLayoutTransitioner._lerpToLayoutTarget(size, layout.size, clamp(alpha * speedAll * speed.size, min, max))
        
//         for (const id in this.fitTargets) {
//             const fit = id as SpatialLayoutFitType
//             this.fitTargets[fit] = THREE.Math.lerp(this.fitTargets[fit], layout.fitTargets[fit], clamp(alpha * speedAll * speed.fit, min, max))
//         }

//         this.position.lerp(o.position, clamp(alpha * speedAll * speed.position, min, max))
//         this.scale.lerp(o.scale, clamp(alpha * speedAll * speed.scale, min, max))
//         this.quaternion.slerp(o.quaternion, clamp(alpha * speedAll * speed.quaternion, min, max))
        
//         if (minBounds.isEmpty()) {
//             minBounds.min.setScalar(0)
//             minBounds.max.setScalar(0)
//         }

//         if (layout.minBounds.isEmpty()) {
//             minBounds.min.lerp(V_000, clamp(alpha * speedAll * speed.minBounds, min, max))
//             minBounds.max.lerp(V_000, clamp(alpha* speedAll * speed.minBounds, min, max))
//         } else {
//             minBounds.min.lerp(layout.minBounds.min, clamp(alpha * speedAll * speed.minBounds, min, max))
//             minBounds.max.lerp(layout.minBounds.max, clamp(alpha* speedAll * speed.minBounds, min, max))
//         }
        
//         vectors.poolAll()
        
//     }

//     private static _target = new THREE.Vector3
//     private static _lerpToLayoutTarget(vector:THREE.Vector3, target:THREE.Vector3, lerpFactor:number, def=target) {
//         const t = this._target.copy(target)
//         if (!isFinite(t.x)) t.x = def.x
//         if (!isFinite(t.y)) t.y = def.y
//         if (!isFinite(t.z)) t.z = def.z
//         if (!isFinite(vector.x)) vector.x = def.x
//         if (!isFinite(vector.y)) vector.y = def.y
//         if (!isFinite(vector.z)) vector.z = def.z
//         vector.lerp(t, lerpFactor)
//     }
// }

export {}