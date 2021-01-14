// import * as THREE from 'three'
// import {vectors, matrices, reparent} from './SpatialUtils'
// import {SpatialMetrics} from './SpatialMetrics'

// export class Surface extends THREE.Object3D {

//     constructor(public width:number=1, public height:number=1) {
//         super()
//     }
    
//     updateMatrix() {
//         if (this.width <= 0 || this.height <= 0) throw new Error('Surface width/height must be greater than 0')
//         super.updateMatrix()
//         const scale = matrices.get().makeScale(this.width, this.height, 1)
//         this.matrix.premultiply(scale)
//         matrices.pool(scale)
//     }

//     add(...objects:THREE.Object3D[]) {
//         for (const o of objects) {
//             if (this.children.indexOf(o) !== -1) continue 
//             const originalUpdateMatrix = o.updateMatrix
//             o.updateMatrix = () => {
//                 originalUpdateMatrix.call(o)
//                 const unscale = matrices.get().makeScale(1/this.width, 1/this.height, 1)
//                 o.matrix.premultiply(unscale)
//                 matrices.pool(unscale)
//             }
//         }
//         return super.add(...objects)
//     }

//     remove(...objects:THREE.Object3D[]) {
//         for (const o of objects) {
//             if (this.children.indexOf(o) === -1) continue 
//             delete o.updateMatrix
//         }
//         return super.remove(...objects)
//     }
// }

// export class CameraSurface extends Surface {
//     constructor(public distance:number=0.2) {
//         super()
//     }
//     updateMatrix() {
//         const camera = this.parent as THREE.Camera
//         if (!camera.isCamera) throw new Error('CameraSurface must be a child of a THREE.Camera object')
//         const distance = this.distance
//         const cameraMetrics = SpatialMetrics.get(camera)
//         const frustum = cameraMetrics.getVisualFrustum(camera)
//         if (distance <= frustum.near) throw new Error('CameraSurface distance must be greater than near plane')
//         // cameraMetrics.getCartesianPointFromVisualPoint(this.position, this.position)
//         this.width = 2 * Math.tan(THREE.Math.DEG2RAD * frustum.horizontal / 2) * distance
//         this.height = 2 * Math.tan(THREE.Math.DEG2RAD * frustum.vertical / 2) * distance
//         super.updateMatrix()
//         const translate = matrices.get().makeTranslation(0, 0, -distance)
//         this.matrix.premultiply(translate)
//     }
// }

// export class SpatialPlacement {

//     referenceFrame: THREE.Object3D
//     direction: THREE.Vector2
//     size:number = 0
//     mode: 'horizontal'|'vertical' = 'horizontal'
//     origin: THREE.Vector3
//     lerp = 1
//     parent?: THREE.Object3D

//     constructor(config:Partial<SpatialPlacement>&{referenceFrame:THREE.Object3D}) {
//       Object.assign(this, config)
//       this.referenceFrame = config.referenceFrame
//       this.direction = config.direction || new THREE.Vector2
//       this.origin = config.origin || new THREE.Vector3(0.5, 0.5, 0.5)
//     }

//     // TODO: 
//     // 1) first try to place at desired distance
//     // 2) then orient (on surface or facing referenceFrame)
//     // 3) then scale if necessary to match desired size
    
//     place(object:THREE.Object3D) {
//         let {referenceFrame, direction, size, mode, origin, lerp, parent} = this
//         if (parent) reparent(object, parent)
//         const metrics = SpatialMetrics.get(referenceFrame)
//         lerp = THREE.Math.clamp(lerp, 0, 1)
//         let distance: number
//         if (typeof size === 'number' && size > 0) {
//             // const currentVisualSize = metrics.getVisualSizeOf(object, vectors2.get())
//             // const currentSize = mode === 'horizontal' ? currentVisualSize.x : currentVisualSize.y
//             // const lerpedSize = THREE.Math.lerp(currentSize, size, lerp)
//             distance = metrics.computeDistanceFor(object, size, mode)
//         } else {
//             distance = metrics.getDistanceOf(object)
//         }
//         const end = metrics.getCartesianDirectionFromVisualDirection(direction, vectors.get()).multiplyScalar(distance)
//         object.position.lerp(end, lerp)
//         vectors.pool(end)
//     }
// }

export {}