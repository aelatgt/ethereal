import {Object3D} from 'three'
import {Vector2, Vector3, Quaternion, Matrix3, Matrix4} from '@etherealjs/core'

export const V_00 = Object.freeze(new Vector2(0,0))
export const V_11 = Object.freeze(new Vector2(1,1))
export const V_000 = Object.freeze(new Vector3(0,0,0))
export const V_100 = Object.freeze(new Vector3(1,0,0))
export const V_010 = Object.freeze(new Vector3(0,1,0))
export const V_001 = Object.freeze(new Vector3(0,0,1))
export const V_111 = Object.freeze(new Vector3(1,1,1))
export const Q_IDENTITY = Object.freeze(new Quaternion)

const next = Promise.resolve()

export class Pool<T> {

  constructor(private _factory:() => T, private _reset:(t:T) => T) {}

  private _pool = [] as T[]
  private _unpooled = new Set<T>()
  private _nextAutoPool?:Promise<void>

  get() { 
    const object = this._pool.pop() || this._reset(this._factory())
    this._unpooled.add(object)
    if (!this._nextAutoPool) this._nextAutoPool = next.then(this._autoPool)
    return object
  }

  pool(o:T) {
    this._pool.push(o)
    this._unpooled.delete(o)
    this._reset(o)
  }

  private _poolAll() {
    if (this._unpooled.size === 0) return
    for (const o of this._unpooled) this.pool(o)
  }

  private _autoPool = () => {
    this._nextAutoPool = undefined
    this._poolAll()
  }
}

export const vectors2 = new Pool<Vector2>(
  () => new Vector2, 
  (vec) => vec.set(0,0)
)

export const vectors = new Pool<Vector3>(
    () => new Vector3, 
    (vec) => vec.set(0,0,0)
)

export const quaternions = new Pool<Quaternion>(
    () => new Quaternion, 
    (quat) => quat.set(0,0,0,1)
)

export const matrices3 = new Pool<Matrix3>(
  () => new Matrix3, 
  (mat) => mat.identity()
)

export const matrices = new Pool<Matrix4>(
    () => new Matrix4, 
    (mat) => mat.identity()
)

export function traverse(
  object: Object3D,
  each: (node: Object3D) => boolean,
  bind?: any
) {
  if (!each.call(bind, object)) return
  for (let child of object.children) {
    traverse(child, each, bind)
  }
}