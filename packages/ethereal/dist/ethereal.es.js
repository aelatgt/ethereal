var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
var _a, _b, _c;
class Vector2 {
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }
  get width() {
    return this.x;
  }
  set width(value) {
    this.x = value;
  }
  get height() {
    return this.y;
  }
  set height(value) {
    this.y = value;
  }
  set(x, y) {
    this.x = x;
    this.y = y;
    return this;
  }
  setScalar(scalar) {
    this.x = scalar;
    this.y = scalar;
    return this;
  }
  setX(x) {
    this.x = x;
    return this;
  }
  setY(y) {
    this.y = y;
    return this;
  }
  setComponent(index, value) {
    switch (index) {
      case 0:
        this.x = value;
        break;
      case 1:
        this.y = value;
        break;
      default:
        throw new Error("index is out of range: " + index);
    }
    return this;
  }
  getComponent(index) {
    switch (index) {
      case 0:
        return this.x;
      case 1:
        return this.y;
      default:
        throw new Error("index is out of range: " + index);
    }
  }
  clone() {
    return new this.constructor(this.x, this.y);
  }
  copy(v) {
    this.x = v.x;
    this.y = v.y;
    return this;
  }
  add(v, w) {
    if (w !== void 0) {
      console.warn("THREE.Vector2: .add() now only accepts one argument. Use .addVectors( a, b ) instead.");
      return this.addVectors(v, w);
    }
    this.x += v.x;
    this.y += v.y;
    return this;
  }
  addScalar(s) {
    this.x += s;
    this.y += s;
    return this;
  }
  addVectors(a2, b2) {
    this.x = a2.x + b2.x;
    this.y = a2.y + b2.y;
    return this;
  }
  addScaledVector(v, s) {
    this.x += v.x * s;
    this.y += v.y * s;
    return this;
  }
  sub(v, w) {
    if (w !== void 0) {
      console.warn("THREE.Vector2: .sub() now only accepts one argument. Use .subVectors( a, b ) instead.");
      return this.subVectors(v, w);
    }
    this.x -= v.x;
    this.y -= v.y;
    return this;
  }
  subScalar(s) {
    this.x -= s;
    this.y -= s;
    return this;
  }
  subVectors(a2, b2) {
    this.x = a2.x - b2.x;
    this.y = a2.y - b2.y;
    return this;
  }
  multiply(v) {
    this.x *= v.x;
    this.y *= v.y;
    return this;
  }
  multiplyScalar(scalar) {
    this.x *= scalar;
    this.y *= scalar;
    return this;
  }
  divide(v) {
    this.x /= v.x;
    this.y /= v.y;
    return this;
  }
  divideScalar(scalar) {
    return this.multiplyScalar(1 / scalar);
  }
  applyMatrix3(m) {
    const x = this.x, y = this.y;
    const e = m.elements;
    this.x = e[0] * x + e[3] * y + e[6];
    this.y = e[1] * x + e[4] * y + e[7];
    return this;
  }
  min(v) {
    this.x = Math.min(this.x, v.x);
    this.y = Math.min(this.y, v.y);
    return this;
  }
  max(v) {
    this.x = Math.max(this.x, v.x);
    this.y = Math.max(this.y, v.y);
    return this;
  }
  clamp(min2, max2) {
    this.x = Math.max(min2.x, Math.min(max2.x, this.x));
    this.y = Math.max(min2.y, Math.min(max2.y, this.y));
    return this;
  }
  clampScalar(minVal, maxVal) {
    this.x = Math.max(minVal, Math.min(maxVal, this.x));
    this.y = Math.max(minVal, Math.min(maxVal, this.y));
    return this;
  }
  clampLength(min2, max2) {
    const length = this.length();
    return this.divideScalar(length || 1).multiplyScalar(Math.max(min2, Math.min(max2, length)));
  }
  floor() {
    this.x = Math.floor(this.x);
    this.y = Math.floor(this.y);
    return this;
  }
  ceil() {
    this.x = Math.ceil(this.x);
    this.y = Math.ceil(this.y);
    return this;
  }
  round() {
    this.x = Math.round(this.x);
    this.y = Math.round(this.y);
    return this;
  }
  roundToZero() {
    this.x = this.x < 0 ? Math.ceil(this.x) : Math.floor(this.x);
    this.y = this.y < 0 ? Math.ceil(this.y) : Math.floor(this.y);
    return this;
  }
  negate() {
    this.x = -this.x;
    this.y = -this.y;
    return this;
  }
  dot(v) {
    return this.x * v.x + this.y * v.y;
  }
  cross(v) {
    return this.x * v.y - this.y * v.x;
  }
  lengthSq() {
    return this.x * this.x + this.y * this.y;
  }
  length() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }
  manhattanLength() {
    return Math.abs(this.x) + Math.abs(this.y);
  }
  normalize() {
    return this.divideScalar(this.length() || 1);
  }
  angle() {
    const angle = Math.atan2(-this.y, -this.x) + Math.PI;
    return angle;
  }
  distanceTo(v) {
    return Math.sqrt(this.distanceToSquared(v));
  }
  distanceToSquared(v) {
    const dx = this.x - v.x, dy = this.y - v.y;
    return dx * dx + dy * dy;
  }
  manhattanDistanceTo(v) {
    return Math.abs(this.x - v.x) + Math.abs(this.y - v.y);
  }
  setLength(length) {
    return this.normalize().multiplyScalar(length);
  }
  lerp(v, alpha) {
    this.x += (v.x - this.x) * alpha;
    this.y += (v.y - this.y) * alpha;
    return this;
  }
  lerpVectors(v1, v2, alpha) {
    this.x = v1.x + (v2.x - v1.x) * alpha;
    this.y = v1.y + (v2.y - v1.y) * alpha;
    return this;
  }
  equals(v) {
    return v.x === this.x && v.y === this.y;
  }
  fromArray(array, offset = 0) {
    this.x = array[offset];
    this.y = array[offset + 1];
    return this;
  }
  toArray(array = [], offset = 0) {
    array[offset] = this.x;
    array[offset + 1] = this.y;
    return array;
  }
  fromBufferAttribute(attribute, index, offset) {
    if (offset !== void 0) {
      console.warn("THREE.Vector2: offset has been removed from .fromBufferAttribute().");
    }
    this.x = attribute.getX(index);
    this.y = attribute.getY(index);
    return this;
  }
  rotateAround(center, angle) {
    const c2 = Math.cos(angle), s = Math.sin(angle);
    const x = this.x - center.x;
    const y = this.y - center.y;
    this.x = x * c2 - y * s + center.x;
    this.y = x * s + y * c2 + center.y;
    return this;
  }
  random() {
    this.x = Math.random();
    this.y = Math.random();
    return this;
  }
  *[Symbol.iterator]() {
    yield this.x;
    yield this.y;
  }
}
Vector2.prototype.isVector2 = true;
const _lut = [];
for (let i = 0; i < 256; i++) {
  _lut[i] = (i < 16 ? "0" : "") + i.toString(16);
}
let _seed = 1234567;
const DEG2RAD = Math.PI / 180;
const RAD2DEG = 180 / Math.PI;
function generateUUID() {
  const d0 = Math.random() * 4294967295 | 0;
  const d1 = Math.random() * 4294967295 | 0;
  const d2 = Math.random() * 4294967295 | 0;
  const d3 = Math.random() * 4294967295 | 0;
  const uuid = _lut[d0 & 255] + _lut[d0 >> 8 & 255] + _lut[d0 >> 16 & 255] + _lut[d0 >> 24 & 255] + "-" + _lut[d1 & 255] + _lut[d1 >> 8 & 255] + "-" + _lut[d1 >> 16 & 15 | 64] + _lut[d1 >> 24 & 255] + "-" + _lut[d2 & 63 | 128] + _lut[d2 >> 8 & 255] + "-" + _lut[d2 >> 16 & 255] + _lut[d2 >> 24 & 255] + _lut[d3 & 255] + _lut[d3 >> 8 & 255] + _lut[d3 >> 16 & 255] + _lut[d3 >> 24 & 255];
  return uuid.toLowerCase();
}
function clamp(value, min2, max2) {
  return Math.max(min2, Math.min(max2, value));
}
function euclideanModulo(n, m) {
  return (n % m + m) % m;
}
function mapLinear(x, a1, a2, b1, b2) {
  return b1 + (x - a1) * (b2 - b1) / (a2 - a1);
}
function inverseLerp(x, y, value) {
  if (x !== y) {
    return (value - x) / (y - x);
  } else {
    return 0;
  }
}
function lerp(x, y, t) {
  return (1 - t) * x + t * y;
}
function damp(x, y, lambda, dt) {
  return lerp(x, y, 1 - Math.exp(-lambda * dt));
}
function pingpong(x, length = 1) {
  return length - Math.abs(euclideanModulo(x, length * 2) - length);
}
function smoothstep(x, min2, max2) {
  if (x <= min2)
    return 0;
  if (x >= max2)
    return 1;
  x = (x - min2) / (max2 - min2);
  return x * x * (3 - 2 * x);
}
function smootherstep(x, min2, max2) {
  if (x <= min2)
    return 0;
  if (x >= max2)
    return 1;
  x = (x - min2) / (max2 - min2);
  return x * x * x * (x * (x * 6 - 15) + 10);
}
function randInt(low, high) {
  return low + Math.floor(Math.random() * (high - low + 1));
}
function randFloat(low, high) {
  return low + Math.random() * (high - low);
}
function randFloatSpread(range) {
  return range * (0.5 - Math.random());
}
function seededRandom(s) {
  if (s !== void 0)
    _seed = s;
  let t = _seed += 1831565813;
  t = Math.imul(t ^ t >>> 15, t | 1);
  t ^= t + Math.imul(t ^ t >>> 7, t | 61);
  return ((t ^ t >>> 14) >>> 0) / 4294967296;
}
function degToRad(degrees) {
  return degrees * DEG2RAD;
}
function radToDeg(radians) {
  return radians * RAD2DEG;
}
function isPowerOfTwo(value) {
  return (value & value - 1) === 0 && value !== 0;
}
function ceilPowerOfTwo(value) {
  return Math.pow(2, Math.ceil(Math.log(value) / Math.LN2));
}
function floorPowerOfTwo(value) {
  return Math.pow(2, Math.floor(Math.log(value) / Math.LN2));
}
function setQuaternionFromProperEuler(q, a2, b2, c2, order) {
  const cos2 = Math.cos;
  const sin2 = Math.sin;
  const c22 = cos2(b2 / 2);
  const s2 = sin2(b2 / 2);
  const c13 = cos2((a2 + c2) / 2);
  const s13 = sin2((a2 + c2) / 2);
  const c1_3 = cos2((a2 - c2) / 2);
  const s1_3 = sin2((a2 - c2) / 2);
  const c3_1 = cos2((c2 - a2) / 2);
  const s3_1 = sin2((c2 - a2) / 2);
  switch (order) {
    case "XYX":
      q.set(c22 * s13, s2 * c1_3, s2 * s1_3, c22 * c13);
      break;
    case "YZY":
      q.set(s2 * s1_3, c22 * s13, s2 * c1_3, c22 * c13);
      break;
    case "ZXZ":
      q.set(s2 * c1_3, s2 * s1_3, c22 * s13, c22 * c13);
      break;
    case "XZX":
      q.set(c22 * s13, s2 * s3_1, s2 * c3_1, c22 * c13);
      break;
    case "YXY":
      q.set(s2 * c3_1, c22 * s13, s2 * s3_1, c22 * c13);
      break;
    case "ZYZ":
      q.set(s2 * s3_1, s2 * c3_1, c22 * s13, c22 * c13);
      break;
    default:
      console.warn("THREE.MathUtils: .setQuaternionFromProperEuler() encountered an unknown order: " + order);
  }
}
function denormalize(value, array) {
  switch (array.constructor) {
    case Float32Array:
      return value;
    case Uint16Array:
      return value / 65535;
    case Uint8Array:
      return value / 255;
    case Int16Array:
      return Math.max(value / 32767, -1);
    case Int8Array:
      return Math.max(value / 127, -1);
    default:
      throw new Error("Invalid component type.");
  }
}
function normalize(value, array) {
  switch (array.constructor) {
    case Float32Array:
      return value;
    case Uint16Array:
      return Math.round(value * 65535);
    case Uint8Array:
      return Math.round(value * 255);
    case Int16Array:
      return Math.round(value * 32767);
    case Int8Array:
      return Math.round(value * 127);
    default:
      throw new Error("Invalid component type.");
  }
}
var MathUtils = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  DEG2RAD,
  RAD2DEG,
  generateUUID,
  clamp,
  euclideanModulo,
  mapLinear,
  inverseLerp,
  lerp,
  damp,
  pingpong,
  smoothstep,
  smootherstep,
  randInt,
  randFloat,
  randFloatSpread,
  seededRandom,
  degToRad,
  radToDeg,
  isPowerOfTwo,
  ceilPowerOfTwo,
  floorPowerOfTwo,
  setQuaternionFromProperEuler,
  normalize,
  denormalize
});
class Quaternion {
  constructor(x = 0, y = 0, z = 0, w = 1) {
    this._x = x;
    this._y = y;
    this._z = z;
    this._w = w;
  }
  static slerp(qa, qb, qm, t) {
    console.warn("THREE.Quaternion: Static .slerp() has been deprecated. Use qm.slerpQuaternions( qa, qb, t ) instead.");
    return qm.slerpQuaternions(qa, qb, t);
  }
  static slerpFlat(dst, dstOffset, src0, srcOffset0, src1, srcOffset1, t) {
    let x0 = src0[srcOffset0 + 0], y0 = src0[srcOffset0 + 1], z0 = src0[srcOffset0 + 2], w0 = src0[srcOffset0 + 3];
    const x1 = src1[srcOffset1 + 0], y1 = src1[srcOffset1 + 1], z1 = src1[srcOffset1 + 2], w1 = src1[srcOffset1 + 3];
    if (t === 0) {
      dst[dstOffset + 0] = x0;
      dst[dstOffset + 1] = y0;
      dst[dstOffset + 2] = z0;
      dst[dstOffset + 3] = w0;
      return;
    }
    if (t === 1) {
      dst[dstOffset + 0] = x1;
      dst[dstOffset + 1] = y1;
      dst[dstOffset + 2] = z1;
      dst[dstOffset + 3] = w1;
      return;
    }
    if (w0 !== w1 || x0 !== x1 || y0 !== y1 || z0 !== z1) {
      let s = 1 - t;
      const cos2 = x0 * x1 + y0 * y1 + z0 * z1 + w0 * w1, dir = cos2 >= 0 ? 1 : -1, sqrSin = 1 - cos2 * cos2;
      if (sqrSin > Number.EPSILON) {
        const sin2 = Math.sqrt(sqrSin), len = Math.atan2(sin2, cos2 * dir);
        s = Math.sin(s * len) / sin2;
        t = Math.sin(t * len) / sin2;
      }
      const tDir = t * dir;
      x0 = x0 * s + x1 * tDir;
      y0 = y0 * s + y1 * tDir;
      z0 = z0 * s + z1 * tDir;
      w0 = w0 * s + w1 * tDir;
      if (s === 1 - t) {
        const f = 1 / Math.sqrt(x0 * x0 + y0 * y0 + z0 * z0 + w0 * w0);
        x0 *= f;
        y0 *= f;
        z0 *= f;
        w0 *= f;
      }
    }
    dst[dstOffset] = x0;
    dst[dstOffset + 1] = y0;
    dst[dstOffset + 2] = z0;
    dst[dstOffset + 3] = w0;
  }
  static multiplyQuaternionsFlat(dst, dstOffset, src0, srcOffset0, src1, srcOffset1) {
    const x0 = src0[srcOffset0];
    const y0 = src0[srcOffset0 + 1];
    const z0 = src0[srcOffset0 + 2];
    const w0 = src0[srcOffset0 + 3];
    const x1 = src1[srcOffset1];
    const y1 = src1[srcOffset1 + 1];
    const z1 = src1[srcOffset1 + 2];
    const w1 = src1[srcOffset1 + 3];
    dst[dstOffset] = x0 * w1 + w0 * x1 + y0 * z1 - z0 * y1;
    dst[dstOffset + 1] = y0 * w1 + w0 * y1 + z0 * x1 - x0 * z1;
    dst[dstOffset + 2] = z0 * w1 + w0 * z1 + x0 * y1 - y0 * x1;
    dst[dstOffset + 3] = w0 * w1 - x0 * x1 - y0 * y1 - z0 * z1;
    return dst;
  }
  get x() {
    return this._x;
  }
  set x(value) {
    this._x = value;
    this._onChangeCallback();
  }
  get y() {
    return this._y;
  }
  set y(value) {
    this._y = value;
    this._onChangeCallback();
  }
  get z() {
    return this._z;
  }
  set z(value) {
    this._z = value;
    this._onChangeCallback();
  }
  get w() {
    return this._w;
  }
  set w(value) {
    this._w = value;
    this._onChangeCallback();
  }
  set(x, y, z, w) {
    this._x = x;
    this._y = y;
    this._z = z;
    this._w = w;
    this._onChangeCallback();
    return this;
  }
  clone() {
    return new this.constructor(this._x, this._y, this._z, this._w);
  }
  copy(quaternion) {
    this._x = quaternion.x;
    this._y = quaternion.y;
    this._z = quaternion.z;
    this._w = quaternion.w;
    this._onChangeCallback();
    return this;
  }
  setFromEuler(euler, update) {
    if (!(euler && euler.isEuler)) {
      throw new Error("THREE.Quaternion: .setFromEuler() now expects an Euler rotation rather than a Vector3 and order.");
    }
    const x = euler._x, y = euler._y, z = euler._z, order = euler._order;
    const cos2 = Math.cos;
    const sin2 = Math.sin;
    const c1 = cos2(x / 2);
    const c2 = cos2(y / 2);
    const c3 = cos2(z / 2);
    const s1 = sin2(x / 2);
    const s2 = sin2(y / 2);
    const s3 = sin2(z / 2);
    switch (order) {
      case "XYZ":
        this._x = s1 * c2 * c3 + c1 * s2 * s3;
        this._y = c1 * s2 * c3 - s1 * c2 * s3;
        this._z = c1 * c2 * s3 + s1 * s2 * c3;
        this._w = c1 * c2 * c3 - s1 * s2 * s3;
        break;
      case "YXZ":
        this._x = s1 * c2 * c3 + c1 * s2 * s3;
        this._y = c1 * s2 * c3 - s1 * c2 * s3;
        this._z = c1 * c2 * s3 - s1 * s2 * c3;
        this._w = c1 * c2 * c3 + s1 * s2 * s3;
        break;
      case "ZXY":
        this._x = s1 * c2 * c3 - c1 * s2 * s3;
        this._y = c1 * s2 * c3 + s1 * c2 * s3;
        this._z = c1 * c2 * s3 + s1 * s2 * c3;
        this._w = c1 * c2 * c3 - s1 * s2 * s3;
        break;
      case "ZYX":
        this._x = s1 * c2 * c3 - c1 * s2 * s3;
        this._y = c1 * s2 * c3 + s1 * c2 * s3;
        this._z = c1 * c2 * s3 - s1 * s2 * c3;
        this._w = c1 * c2 * c3 + s1 * s2 * s3;
        break;
      case "YZX":
        this._x = s1 * c2 * c3 + c1 * s2 * s3;
        this._y = c1 * s2 * c3 + s1 * c2 * s3;
        this._z = c1 * c2 * s3 - s1 * s2 * c3;
        this._w = c1 * c2 * c3 - s1 * s2 * s3;
        break;
      case "XZY":
        this._x = s1 * c2 * c3 - c1 * s2 * s3;
        this._y = c1 * s2 * c3 - s1 * c2 * s3;
        this._z = c1 * c2 * s3 + s1 * s2 * c3;
        this._w = c1 * c2 * c3 + s1 * s2 * s3;
        break;
      default:
        console.warn("THREE.Quaternion: .setFromEuler() encountered an unknown order: " + order);
    }
    if (update !== false)
      this._onChangeCallback();
    return this;
  }
  setFromAxisAngle(axis, angle) {
    const halfAngle = angle / 2, s = Math.sin(halfAngle);
    this._x = axis.x * s;
    this._y = axis.y * s;
    this._z = axis.z * s;
    this._w = Math.cos(halfAngle);
    this._onChangeCallback();
    return this;
  }
  setFromRotationMatrix(m) {
    const te = m.elements, m11 = te[0], m12 = te[4], m13 = te[8], m21 = te[1], m22 = te[5], m23 = te[9], m31 = te[2], m32 = te[6], m33 = te[10], trace = m11 + m22 + m33;
    if (trace > 0) {
      const s = 0.5 / Math.sqrt(trace + 1);
      this._w = 0.25 / s;
      this._x = (m32 - m23) * s;
      this._y = (m13 - m31) * s;
      this._z = (m21 - m12) * s;
    } else if (m11 > m22 && m11 > m33) {
      const s = 2 * Math.sqrt(1 + m11 - m22 - m33);
      this._w = (m32 - m23) / s;
      this._x = 0.25 * s;
      this._y = (m12 + m21) / s;
      this._z = (m13 + m31) / s;
    } else if (m22 > m33) {
      const s = 2 * Math.sqrt(1 + m22 - m11 - m33);
      this._w = (m13 - m31) / s;
      this._x = (m12 + m21) / s;
      this._y = 0.25 * s;
      this._z = (m23 + m32) / s;
    } else {
      const s = 2 * Math.sqrt(1 + m33 - m11 - m22);
      this._w = (m21 - m12) / s;
      this._x = (m13 + m31) / s;
      this._y = (m23 + m32) / s;
      this._z = 0.25 * s;
    }
    this._onChangeCallback();
    return this;
  }
  setFromUnitVectors(vFrom, vTo) {
    let r = vFrom.dot(vTo) + 1;
    if (r < Number.EPSILON) {
      r = 0;
      if (Math.abs(vFrom.x) > Math.abs(vFrom.z)) {
        this._x = -vFrom.y;
        this._y = vFrom.x;
        this._z = 0;
        this._w = r;
      } else {
        this._x = 0;
        this._y = -vFrom.z;
        this._z = vFrom.y;
        this._w = r;
      }
    } else {
      this._x = vFrom.y * vTo.z - vFrom.z * vTo.y;
      this._y = vFrom.z * vTo.x - vFrom.x * vTo.z;
      this._z = vFrom.x * vTo.y - vFrom.y * vTo.x;
      this._w = r;
    }
    return this.normalize();
  }
  angleTo(q) {
    return 2 * Math.acos(Math.abs(clamp(this.dot(q), -1, 1)));
  }
  rotateTowards(q, step) {
    const angle = this.angleTo(q);
    if (angle === 0)
      return this;
    const t = Math.min(1, step / angle);
    this.slerp(q, t);
    return this;
  }
  identity() {
    return this.set(0, 0, 0, 1);
  }
  invert() {
    return this.conjugate();
  }
  conjugate() {
    this._x *= -1;
    this._y *= -1;
    this._z *= -1;
    this._onChangeCallback();
    return this;
  }
  dot(v) {
    return this._x * v._x + this._y * v._y + this._z * v._z + this._w * v._w;
  }
  lengthSq() {
    return this._x * this._x + this._y * this._y + this._z * this._z + this._w * this._w;
  }
  length() {
    return Math.sqrt(this._x * this._x + this._y * this._y + this._z * this._z + this._w * this._w);
  }
  normalize() {
    let l = this.length();
    if (l === 0) {
      this._x = 0;
      this._y = 0;
      this._z = 0;
      this._w = 1;
    } else {
      l = 1 / l;
      this._x = this._x * l;
      this._y = this._y * l;
      this._z = this._z * l;
      this._w = this._w * l;
    }
    this._onChangeCallback();
    return this;
  }
  multiply(q, p) {
    if (p !== void 0) {
      console.warn("THREE.Quaternion: .multiply() now only accepts one argument. Use .multiplyQuaternions( a, b ) instead.");
      return this.multiplyQuaternions(q, p);
    }
    return this.multiplyQuaternions(this, q);
  }
  premultiply(q) {
    return this.multiplyQuaternions(q, this);
  }
  multiplyQuaternions(a2, b2) {
    const qax = a2._x, qay = a2._y, qaz = a2._z, qaw = a2._w;
    const qbx = b2._x, qby = b2._y, qbz = b2._z, qbw = b2._w;
    this._x = qax * qbw + qaw * qbx + qay * qbz - qaz * qby;
    this._y = qay * qbw + qaw * qby + qaz * qbx - qax * qbz;
    this._z = qaz * qbw + qaw * qbz + qax * qby - qay * qbx;
    this._w = qaw * qbw - qax * qbx - qay * qby - qaz * qbz;
    this._onChangeCallback();
    return this;
  }
  slerp(qb, t) {
    if (t === 0)
      return this;
    if (t === 1)
      return this.copy(qb);
    const x = this._x, y = this._y, z = this._z, w = this._w;
    let cosHalfTheta = w * qb._w + x * qb._x + y * qb._y + z * qb._z;
    if (cosHalfTheta < 0) {
      this._w = -qb._w;
      this._x = -qb._x;
      this._y = -qb._y;
      this._z = -qb._z;
      cosHalfTheta = -cosHalfTheta;
    } else {
      this.copy(qb);
    }
    if (cosHalfTheta >= 1) {
      this._w = w;
      this._x = x;
      this._y = y;
      this._z = z;
      return this;
    }
    const sqrSinHalfTheta = 1 - cosHalfTheta * cosHalfTheta;
    if (sqrSinHalfTheta <= Number.EPSILON) {
      const s = 1 - t;
      this._w = s * w + t * this._w;
      this._x = s * x + t * this._x;
      this._y = s * y + t * this._y;
      this._z = s * z + t * this._z;
      this.normalize();
      this._onChangeCallback();
      return this;
    }
    const sinHalfTheta = Math.sqrt(sqrSinHalfTheta);
    const halfTheta = Math.atan2(sinHalfTheta, cosHalfTheta);
    const ratioA = Math.sin((1 - t) * halfTheta) / sinHalfTheta, ratioB = Math.sin(t * halfTheta) / sinHalfTheta;
    this._w = w * ratioA + this._w * ratioB;
    this._x = x * ratioA + this._x * ratioB;
    this._y = y * ratioA + this._y * ratioB;
    this._z = z * ratioA + this._z * ratioB;
    this._onChangeCallback();
    return this;
  }
  slerpQuaternions(qa, qb, t) {
    return this.copy(qa).slerp(qb, t);
  }
  random() {
    const u1 = Math.random();
    const sqrt1u1 = Math.sqrt(1 - u1);
    const sqrtu1 = Math.sqrt(u1);
    const u2 = 2 * Math.PI * Math.random();
    const u3 = 2 * Math.PI * Math.random();
    return this.set(sqrt1u1 * Math.cos(u2), sqrtu1 * Math.sin(u3), sqrtu1 * Math.cos(u3), sqrt1u1 * Math.sin(u2));
  }
  equals(quaternion) {
    return quaternion._x === this._x && quaternion._y === this._y && quaternion._z === this._z && quaternion._w === this._w;
  }
  fromArray(array, offset = 0) {
    this._x = array[offset];
    this._y = array[offset + 1];
    this._z = array[offset + 2];
    this._w = array[offset + 3];
    this._onChangeCallback();
    return this;
  }
  toArray(array = [], offset = 0) {
    array[offset] = this._x;
    array[offset + 1] = this._y;
    array[offset + 2] = this._z;
    array[offset + 3] = this._w;
    return array;
  }
  fromBufferAttribute(attribute, index) {
    this._x = attribute.getX(index);
    this._y = attribute.getY(index);
    this._z = attribute.getZ(index);
    this._w = attribute.getW(index);
    return this;
  }
  _onChange(callback) {
    this._onChangeCallback = callback;
    return this;
  }
  _onChangeCallback() {
  }
  *[Symbol.iterator]() {
    yield this._x;
    yield this._y;
    yield this._z;
    yield this._w;
  }
}
Quaternion.prototype.isQuaternion = true;
class Vector3 {
  constructor(x = 0, y = 0, z = 0) {
    this.x = x;
    this.y = y;
    this.z = z;
  }
  set(x, y, z) {
    if (z === void 0)
      z = this.z;
    this.x = x;
    this.y = y;
    this.z = z;
    return this;
  }
  setScalar(scalar) {
    this.x = scalar;
    this.y = scalar;
    this.z = scalar;
    return this;
  }
  setX(x) {
    this.x = x;
    return this;
  }
  setY(y) {
    this.y = y;
    return this;
  }
  setZ(z) {
    this.z = z;
    return this;
  }
  setComponent(index, value) {
    switch (index) {
      case 0:
        this.x = value;
        break;
      case 1:
        this.y = value;
        break;
      case 2:
        this.z = value;
        break;
      default:
        throw new Error("index is out of range: " + index);
    }
    return this;
  }
  getComponent(index) {
    switch (index) {
      case 0:
        return this.x;
      case 1:
        return this.y;
      case 2:
        return this.z;
      default:
        throw new Error("index is out of range: " + index);
    }
  }
  clone() {
    return new this.constructor(this.x, this.y, this.z);
  }
  copy(v) {
    this.x = v.x;
    this.y = v.y;
    this.z = v.z;
    return this;
  }
  add(v, w) {
    if (w !== void 0) {
      console.warn("THREE.Vector3: .add() now only accepts one argument. Use .addVectors( a, b ) instead.");
      return this.addVectors(v, w);
    }
    this.x += v.x;
    this.y += v.y;
    this.z += v.z;
    return this;
  }
  addScalar(s) {
    this.x += s;
    this.y += s;
    this.z += s;
    return this;
  }
  addVectors(a2, b2) {
    this.x = a2.x + b2.x;
    this.y = a2.y + b2.y;
    this.z = a2.z + b2.z;
    return this;
  }
  addScaledVector(v, s) {
    this.x += v.x * s;
    this.y += v.y * s;
    this.z += v.z * s;
    return this;
  }
  sub(v, w) {
    if (w !== void 0) {
      console.warn("THREE.Vector3: .sub() now only accepts one argument. Use .subVectors( a, b ) instead.");
      return this.subVectors(v, w);
    }
    this.x -= v.x;
    this.y -= v.y;
    this.z -= v.z;
    return this;
  }
  subScalar(s) {
    this.x -= s;
    this.y -= s;
    this.z -= s;
    return this;
  }
  subVectors(a2, b2) {
    this.x = a2.x - b2.x;
    this.y = a2.y - b2.y;
    this.z = a2.z - b2.z;
    return this;
  }
  multiply(v, w) {
    if (w !== void 0) {
      console.warn("THREE.Vector3: .multiply() now only accepts one argument. Use .multiplyVectors( a, b ) instead.");
      return this.multiplyVectors(v, w);
    }
    this.x *= v.x;
    this.y *= v.y;
    this.z *= v.z;
    return this;
  }
  multiplyScalar(scalar) {
    this.x *= scalar;
    this.y *= scalar;
    this.z *= scalar;
    return this;
  }
  multiplyVectors(a2, b2) {
    this.x = a2.x * b2.x;
    this.y = a2.y * b2.y;
    this.z = a2.z * b2.z;
    return this;
  }
  applyEuler(euler) {
    if (!(euler && euler.isEuler)) {
      console.error("THREE.Vector3: .applyEuler() now expects an Euler rotation rather than a Vector3 and order.");
    }
    return this.applyQuaternion(_quaternion$1.setFromEuler(euler));
  }
  applyAxisAngle(axis, angle) {
    return this.applyQuaternion(_quaternion$1.setFromAxisAngle(axis, angle));
  }
  applyMatrix3(m) {
    const x = this.x, y = this.y, z = this.z;
    const e = m.elements;
    this.x = e[0] * x + e[3] * y + e[6] * z;
    this.y = e[1] * x + e[4] * y + e[7] * z;
    this.z = e[2] * x + e[5] * y + e[8] * z;
    return this;
  }
  applyNormalMatrix(m) {
    return this.applyMatrix3(m).normalize();
  }
  applyMatrix4(m) {
    const x = this.x, y = this.y, z = this.z;
    const e = m.elements;
    const w = 1 / (e[3] * x + e[7] * y + e[11] * z + e[15]);
    this.x = (e[0] * x + e[4] * y + e[8] * z + e[12]) * w;
    this.y = (e[1] * x + e[5] * y + e[9] * z + e[13]) * w;
    this.z = (e[2] * x + e[6] * y + e[10] * z + e[14]) * w;
    return this;
  }
  applyQuaternion(q) {
    const x = this.x, y = this.y, z = this.z;
    const qx = q.x, qy = q.y, qz = q.z, qw = q.w;
    const ix = qw * x + qy * z - qz * y;
    const iy = qw * y + qz * x - qx * z;
    const iz = qw * z + qx * y - qy * x;
    const iw = -qx * x - qy * y - qz * z;
    this.x = ix * qw + iw * -qx + iy * -qz - iz * -qy;
    this.y = iy * qw + iw * -qy + iz * -qx - ix * -qz;
    this.z = iz * qw + iw * -qz + ix * -qy - iy * -qx;
    return this;
  }
  project(camera) {
    return this.applyMatrix4(camera.matrixWorldInverse).applyMatrix4(camera.projectionMatrix);
  }
  unproject(camera) {
    return this.applyMatrix4(camera.projectionMatrixInverse).applyMatrix4(camera.matrixWorld);
  }
  transformDirection(m) {
    const x = this.x, y = this.y, z = this.z;
    const e = m.elements;
    this.x = e[0] * x + e[4] * y + e[8] * z;
    this.y = e[1] * x + e[5] * y + e[9] * z;
    this.z = e[2] * x + e[6] * y + e[10] * z;
    return this.normalize();
  }
  divide(v) {
    this.x /= v.x;
    this.y /= v.y;
    this.z /= v.z;
    return this;
  }
  divideScalar(scalar) {
    return this.multiplyScalar(1 / scalar);
  }
  min(v) {
    this.x = Math.min(this.x, v.x);
    this.y = Math.min(this.y, v.y);
    this.z = Math.min(this.z, v.z);
    return this;
  }
  max(v) {
    this.x = Math.max(this.x, v.x);
    this.y = Math.max(this.y, v.y);
    this.z = Math.max(this.z, v.z);
    return this;
  }
  clamp(min2, max2) {
    this.x = Math.max(min2.x, Math.min(max2.x, this.x));
    this.y = Math.max(min2.y, Math.min(max2.y, this.y));
    this.z = Math.max(min2.z, Math.min(max2.z, this.z));
    return this;
  }
  clampScalar(minVal, maxVal) {
    this.x = Math.max(minVal, Math.min(maxVal, this.x));
    this.y = Math.max(minVal, Math.min(maxVal, this.y));
    this.z = Math.max(minVal, Math.min(maxVal, this.z));
    return this;
  }
  clampLength(min2, max2) {
    const length = this.length();
    return this.divideScalar(length || 1).multiplyScalar(Math.max(min2, Math.min(max2, length)));
  }
  floor() {
    this.x = Math.floor(this.x);
    this.y = Math.floor(this.y);
    this.z = Math.floor(this.z);
    return this;
  }
  ceil() {
    this.x = Math.ceil(this.x);
    this.y = Math.ceil(this.y);
    this.z = Math.ceil(this.z);
    return this;
  }
  round() {
    this.x = Math.round(this.x);
    this.y = Math.round(this.y);
    this.z = Math.round(this.z);
    return this;
  }
  roundToZero() {
    this.x = this.x < 0 ? Math.ceil(this.x) : Math.floor(this.x);
    this.y = this.y < 0 ? Math.ceil(this.y) : Math.floor(this.y);
    this.z = this.z < 0 ? Math.ceil(this.z) : Math.floor(this.z);
    return this;
  }
  negate() {
    this.x = -this.x;
    this.y = -this.y;
    this.z = -this.z;
    return this;
  }
  dot(v) {
    return this.x * v.x + this.y * v.y + this.z * v.z;
  }
  lengthSq() {
    return this.x * this.x + this.y * this.y + this.z * this.z;
  }
  length() {
    return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
  }
  manhattanLength() {
    return Math.abs(this.x) + Math.abs(this.y) + Math.abs(this.z);
  }
  normalize() {
    return this.divideScalar(this.length() || 1);
  }
  setLength(length) {
    return this.normalize().multiplyScalar(length);
  }
  lerp(v, alpha) {
    this.x += (v.x - this.x) * alpha;
    this.y += (v.y - this.y) * alpha;
    this.z += (v.z - this.z) * alpha;
    return this;
  }
  lerpVectors(v1, v2, alpha) {
    this.x = v1.x + (v2.x - v1.x) * alpha;
    this.y = v1.y + (v2.y - v1.y) * alpha;
    this.z = v1.z + (v2.z - v1.z) * alpha;
    return this;
  }
  cross(v, w) {
    if (w !== void 0) {
      console.warn("THREE.Vector3: .cross() now only accepts one argument. Use .crossVectors( a, b ) instead.");
      return this.crossVectors(v, w);
    }
    return this.crossVectors(this, v);
  }
  crossVectors(a2, b2) {
    const ax = a2.x, ay = a2.y, az = a2.z;
    const bx = b2.x, by = b2.y, bz = b2.z;
    this.x = ay * bz - az * by;
    this.y = az * bx - ax * bz;
    this.z = ax * by - ay * bx;
    return this;
  }
  projectOnVector(v) {
    const denominator = v.lengthSq();
    if (denominator === 0)
      return this.set(0, 0, 0);
    const scalar = v.dot(this) / denominator;
    return this.copy(v).multiplyScalar(scalar);
  }
  projectOnPlane(planeNormal) {
    _vector$3.copy(this).projectOnVector(planeNormal);
    return this.sub(_vector$3);
  }
  reflect(normal) {
    return this.sub(_vector$3.copy(normal).multiplyScalar(2 * this.dot(normal)));
  }
  angleTo(v) {
    const denominator = Math.sqrt(this.lengthSq() * v.lengthSq());
    if (denominator === 0)
      return Math.PI / 2;
    const theta = this.dot(v) / denominator;
    return Math.acos(clamp(theta, -1, 1));
  }
  distanceTo(v) {
    return Math.sqrt(this.distanceToSquared(v));
  }
  distanceToSquared(v) {
    const dx = this.x - v.x, dy = this.y - v.y, dz = this.z - v.z;
    return dx * dx + dy * dy + dz * dz;
  }
  manhattanDistanceTo(v) {
    return Math.abs(this.x - v.x) + Math.abs(this.y - v.y) + Math.abs(this.z - v.z);
  }
  setFromSpherical(s) {
    return this.setFromSphericalCoords(s.radius, s.phi, s.theta);
  }
  setFromSphericalCoords(radius, phi, theta) {
    const sinPhiRadius = Math.sin(phi) * radius;
    this.x = sinPhiRadius * Math.sin(theta);
    this.y = Math.cos(phi) * radius;
    this.z = sinPhiRadius * Math.cos(theta);
    return this;
  }
  setFromCylindrical(c2) {
    return this.setFromCylindricalCoords(c2.radius, c2.theta, c2.y);
  }
  setFromCylindricalCoords(radius, theta, y) {
    this.x = radius * Math.sin(theta);
    this.y = y;
    this.z = radius * Math.cos(theta);
    return this;
  }
  setFromMatrixPosition(m) {
    const e = m.elements;
    this.x = e[12];
    this.y = e[13];
    this.z = e[14];
    return this;
  }
  setFromMatrixScale(m) {
    const sx = this.setFromMatrixColumn(m, 0).length();
    const sy = this.setFromMatrixColumn(m, 1).length();
    const sz = this.setFromMatrixColumn(m, 2).length();
    this.x = sx;
    this.y = sy;
    this.z = sz;
    return this;
  }
  setFromMatrixColumn(m, index) {
    return this.fromArray(m.elements, index * 4);
  }
  setFromMatrix3Column(m, index) {
    return this.fromArray(m.elements, index * 3);
  }
  setFromEuler(e) {
    this.x = e._x;
    this.y = e._y;
    this.z = e._z;
    return this;
  }
  equals(v) {
    return v.x === this.x && v.y === this.y && v.z === this.z;
  }
  fromArray(array, offset = 0) {
    this.x = array[offset];
    this.y = array[offset + 1];
    this.z = array[offset + 2];
    return this;
  }
  toArray(array = [], offset = 0) {
    array[offset] = this.x;
    array[offset + 1] = this.y;
    array[offset + 2] = this.z;
    return array;
  }
  fromBufferAttribute(attribute, index, offset) {
    if (offset !== void 0) {
      console.warn("THREE.Vector3: offset has been removed from .fromBufferAttribute().");
    }
    this.x = attribute.getX(index);
    this.y = attribute.getY(index);
    this.z = attribute.getZ(index);
    return this;
  }
  random() {
    this.x = Math.random();
    this.y = Math.random();
    this.z = Math.random();
    return this;
  }
  randomDirection() {
    const u = (Math.random() - 0.5) * 2;
    const t = Math.random() * Math.PI * 2;
    const f = Math.sqrt(1 - u ** 2);
    this.x = f * Math.cos(t);
    this.y = f * Math.sin(t);
    this.z = u;
    return this;
  }
  *[Symbol.iterator]() {
    yield this.x;
    yield this.y;
    yield this.z;
  }
}
Vector3.prototype.isVector3 = true;
const _vector$3 = /* @__PURE__ */ new Vector3();
const _quaternion$1 = /* @__PURE__ */ new Quaternion();
class Vector4 {
  constructor(x = 0, y = 0, z = 0, w = 1) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.w = w;
  }
  get width() {
    return this.z;
  }
  set width(value) {
    this.z = value;
  }
  get height() {
    return this.w;
  }
  set height(value) {
    this.w = value;
  }
  set(x, y, z, w) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.w = w;
    return this;
  }
  setScalar(scalar) {
    this.x = scalar;
    this.y = scalar;
    this.z = scalar;
    this.w = scalar;
    return this;
  }
  setX(x) {
    this.x = x;
    return this;
  }
  setY(y) {
    this.y = y;
    return this;
  }
  setZ(z) {
    this.z = z;
    return this;
  }
  setW(w) {
    this.w = w;
    return this;
  }
  setComponent(index, value) {
    switch (index) {
      case 0:
        this.x = value;
        break;
      case 1:
        this.y = value;
        break;
      case 2:
        this.z = value;
        break;
      case 3:
        this.w = value;
        break;
      default:
        throw new Error("index is out of range: " + index);
    }
    return this;
  }
  getComponent(index) {
    switch (index) {
      case 0:
        return this.x;
      case 1:
        return this.y;
      case 2:
        return this.z;
      case 3:
        return this.w;
      default:
        throw new Error("index is out of range: " + index);
    }
  }
  clone() {
    return new this.constructor(this.x, this.y, this.z, this.w);
  }
  copy(v) {
    this.x = v.x;
    this.y = v.y;
    this.z = v.z;
    this.w = v.w !== void 0 ? v.w : 1;
    return this;
  }
  add(v, w) {
    if (w !== void 0) {
      console.warn("THREE.Vector4: .add() now only accepts one argument. Use .addVectors( a, b ) instead.");
      return this.addVectors(v, w);
    }
    this.x += v.x;
    this.y += v.y;
    this.z += v.z;
    this.w += v.w;
    return this;
  }
  addScalar(s) {
    this.x += s;
    this.y += s;
    this.z += s;
    this.w += s;
    return this;
  }
  addVectors(a2, b2) {
    this.x = a2.x + b2.x;
    this.y = a2.y + b2.y;
    this.z = a2.z + b2.z;
    this.w = a2.w + b2.w;
    return this;
  }
  addScaledVector(v, s) {
    this.x += v.x * s;
    this.y += v.y * s;
    this.z += v.z * s;
    this.w += v.w * s;
    return this;
  }
  sub(v, w) {
    if (w !== void 0) {
      console.warn("THREE.Vector4: .sub() now only accepts one argument. Use .subVectors( a, b ) instead.");
      return this.subVectors(v, w);
    }
    this.x -= v.x;
    this.y -= v.y;
    this.z -= v.z;
    this.w -= v.w;
    return this;
  }
  subScalar(s) {
    this.x -= s;
    this.y -= s;
    this.z -= s;
    this.w -= s;
    return this;
  }
  subVectors(a2, b2) {
    this.x = a2.x - b2.x;
    this.y = a2.y - b2.y;
    this.z = a2.z - b2.z;
    this.w = a2.w - b2.w;
    return this;
  }
  multiply(v) {
    this.x *= v.x;
    this.y *= v.y;
    this.z *= v.z;
    this.w *= v.w;
    return this;
  }
  multiplyScalar(scalar) {
    this.x *= scalar;
    this.y *= scalar;
    this.z *= scalar;
    this.w *= scalar;
    return this;
  }
  applyMatrix4(m) {
    const x = this.x, y = this.y, z = this.z, w = this.w;
    const e = m.elements;
    this.x = e[0] * x + e[4] * y + e[8] * z + e[12] * w;
    this.y = e[1] * x + e[5] * y + e[9] * z + e[13] * w;
    this.z = e[2] * x + e[6] * y + e[10] * z + e[14] * w;
    this.w = e[3] * x + e[7] * y + e[11] * z + e[15] * w;
    return this;
  }
  divideScalar(scalar) {
    return this.multiplyScalar(1 / scalar);
  }
  setAxisAngleFromQuaternion(q) {
    this.w = 2 * Math.acos(q.w);
    const s = Math.sqrt(1 - q.w * q.w);
    if (s < 1e-4) {
      this.x = 1;
      this.y = 0;
      this.z = 0;
    } else {
      this.x = q.x / s;
      this.y = q.y / s;
      this.z = q.z / s;
    }
    return this;
  }
  setAxisAngleFromRotationMatrix(m) {
    let angle, x, y, z;
    const epsilon = 0.01, epsilon2 = 0.1, te = m.elements, m11 = te[0], m12 = te[4], m13 = te[8], m21 = te[1], m22 = te[5], m23 = te[9], m31 = te[2], m32 = te[6], m33 = te[10];
    if (Math.abs(m12 - m21) < epsilon && Math.abs(m13 - m31) < epsilon && Math.abs(m23 - m32) < epsilon) {
      if (Math.abs(m12 + m21) < epsilon2 && Math.abs(m13 + m31) < epsilon2 && Math.abs(m23 + m32) < epsilon2 && Math.abs(m11 + m22 + m33 - 3) < epsilon2) {
        this.set(1, 0, 0, 0);
        return this;
      }
      angle = Math.PI;
      const xx = (m11 + 1) / 2;
      const yy = (m22 + 1) / 2;
      const zz = (m33 + 1) / 2;
      const xy = (m12 + m21) / 4;
      const xz = (m13 + m31) / 4;
      const yz = (m23 + m32) / 4;
      if (xx > yy && xx > zz) {
        if (xx < epsilon) {
          x = 0;
          y = 0.707106781;
          z = 0.707106781;
        } else {
          x = Math.sqrt(xx);
          y = xy / x;
          z = xz / x;
        }
      } else if (yy > zz) {
        if (yy < epsilon) {
          x = 0.707106781;
          y = 0;
          z = 0.707106781;
        } else {
          y = Math.sqrt(yy);
          x = xy / y;
          z = yz / y;
        }
      } else {
        if (zz < epsilon) {
          x = 0.707106781;
          y = 0.707106781;
          z = 0;
        } else {
          z = Math.sqrt(zz);
          x = xz / z;
          y = yz / z;
        }
      }
      this.set(x, y, z, angle);
      return this;
    }
    let s = Math.sqrt((m32 - m23) * (m32 - m23) + (m13 - m31) * (m13 - m31) + (m21 - m12) * (m21 - m12));
    if (Math.abs(s) < 1e-3)
      s = 1;
    this.x = (m32 - m23) / s;
    this.y = (m13 - m31) / s;
    this.z = (m21 - m12) / s;
    this.w = Math.acos((m11 + m22 + m33 - 1) / 2);
    return this;
  }
  min(v) {
    this.x = Math.min(this.x, v.x);
    this.y = Math.min(this.y, v.y);
    this.z = Math.min(this.z, v.z);
    this.w = Math.min(this.w, v.w);
    return this;
  }
  max(v) {
    this.x = Math.max(this.x, v.x);
    this.y = Math.max(this.y, v.y);
    this.z = Math.max(this.z, v.z);
    this.w = Math.max(this.w, v.w);
    return this;
  }
  clamp(min2, max2) {
    this.x = Math.max(min2.x, Math.min(max2.x, this.x));
    this.y = Math.max(min2.y, Math.min(max2.y, this.y));
    this.z = Math.max(min2.z, Math.min(max2.z, this.z));
    this.w = Math.max(min2.w, Math.min(max2.w, this.w));
    return this;
  }
  clampScalar(minVal, maxVal) {
    this.x = Math.max(minVal, Math.min(maxVal, this.x));
    this.y = Math.max(minVal, Math.min(maxVal, this.y));
    this.z = Math.max(minVal, Math.min(maxVal, this.z));
    this.w = Math.max(minVal, Math.min(maxVal, this.w));
    return this;
  }
  clampLength(min2, max2) {
    const length = this.length();
    return this.divideScalar(length || 1).multiplyScalar(Math.max(min2, Math.min(max2, length)));
  }
  floor() {
    this.x = Math.floor(this.x);
    this.y = Math.floor(this.y);
    this.z = Math.floor(this.z);
    this.w = Math.floor(this.w);
    return this;
  }
  ceil() {
    this.x = Math.ceil(this.x);
    this.y = Math.ceil(this.y);
    this.z = Math.ceil(this.z);
    this.w = Math.ceil(this.w);
    return this;
  }
  round() {
    this.x = Math.round(this.x);
    this.y = Math.round(this.y);
    this.z = Math.round(this.z);
    this.w = Math.round(this.w);
    return this;
  }
  roundToZero() {
    this.x = this.x < 0 ? Math.ceil(this.x) : Math.floor(this.x);
    this.y = this.y < 0 ? Math.ceil(this.y) : Math.floor(this.y);
    this.z = this.z < 0 ? Math.ceil(this.z) : Math.floor(this.z);
    this.w = this.w < 0 ? Math.ceil(this.w) : Math.floor(this.w);
    return this;
  }
  negate() {
    this.x = -this.x;
    this.y = -this.y;
    this.z = -this.z;
    this.w = -this.w;
    return this;
  }
  dot(v) {
    return this.x * v.x + this.y * v.y + this.z * v.z + this.w * v.w;
  }
  lengthSq() {
    return this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w;
  }
  length() {
    return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w);
  }
  manhattanLength() {
    return Math.abs(this.x) + Math.abs(this.y) + Math.abs(this.z) + Math.abs(this.w);
  }
  normalize() {
    return this.divideScalar(this.length() || 1);
  }
  setLength(length) {
    return this.normalize().multiplyScalar(length);
  }
  lerp(v, alpha) {
    this.x += (v.x - this.x) * alpha;
    this.y += (v.y - this.y) * alpha;
    this.z += (v.z - this.z) * alpha;
    this.w += (v.w - this.w) * alpha;
    return this;
  }
  lerpVectors(v1, v2, alpha) {
    this.x = v1.x + (v2.x - v1.x) * alpha;
    this.y = v1.y + (v2.y - v1.y) * alpha;
    this.z = v1.z + (v2.z - v1.z) * alpha;
    this.w = v1.w + (v2.w - v1.w) * alpha;
    return this;
  }
  equals(v) {
    return v.x === this.x && v.y === this.y && v.z === this.z && v.w === this.w;
  }
  fromArray(array, offset = 0) {
    this.x = array[offset];
    this.y = array[offset + 1];
    this.z = array[offset + 2];
    this.w = array[offset + 3];
    return this;
  }
  toArray(array = [], offset = 0) {
    array[offset] = this.x;
    array[offset + 1] = this.y;
    array[offset + 2] = this.z;
    array[offset + 3] = this.w;
    return array;
  }
  fromBufferAttribute(attribute, index, offset) {
    if (offset !== void 0) {
      console.warn("THREE.Vector4: offset has been removed from .fromBufferAttribute().");
    }
    this.x = attribute.getX(index);
    this.y = attribute.getY(index);
    this.z = attribute.getZ(index);
    this.w = attribute.getW(index);
    return this;
  }
  random() {
    this.x = Math.random();
    this.y = Math.random();
    this.z = Math.random();
    this.w = Math.random();
    return this;
  }
  *[Symbol.iterator]() {
    yield this.x;
    yield this.y;
    yield this.z;
    yield this.w;
  }
}
Vector4.prototype.isVector4 = true;
class Matrix4 {
  constructor() {
    this.elements = [
      1,
      0,
      0,
      0,
      0,
      1,
      0,
      0,
      0,
      0,
      1,
      0,
      0,
      0,
      0,
      1
    ];
    if (arguments.length > 0) {
      console.error("THREE.Matrix4: the constructor no longer reads arguments. use .set() instead.");
    }
  }
  set(n11, n12, n13, n14, n21, n22, n23, n24, n31, n32, n33, n34, n41, n42, n43, n44) {
    const te = this.elements;
    te[0] = n11;
    te[4] = n12;
    te[8] = n13;
    te[12] = n14;
    te[1] = n21;
    te[5] = n22;
    te[9] = n23;
    te[13] = n24;
    te[2] = n31;
    te[6] = n32;
    te[10] = n33;
    te[14] = n34;
    te[3] = n41;
    te[7] = n42;
    te[11] = n43;
    te[15] = n44;
    return this;
  }
  identity() {
    this.set(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
    return this;
  }
  clone() {
    return new Matrix4().fromArray(this.elements);
  }
  copy(m) {
    const te = this.elements;
    const me = m.elements;
    te[0] = me[0];
    te[1] = me[1];
    te[2] = me[2];
    te[3] = me[3];
    te[4] = me[4];
    te[5] = me[5];
    te[6] = me[6];
    te[7] = me[7];
    te[8] = me[8];
    te[9] = me[9];
    te[10] = me[10];
    te[11] = me[11];
    te[12] = me[12];
    te[13] = me[13];
    te[14] = me[14];
    te[15] = me[15];
    return this;
  }
  copyPosition(m) {
    const te = this.elements, me = m.elements;
    te[12] = me[12];
    te[13] = me[13];
    te[14] = me[14];
    return this;
  }
  setFromMatrix3(m) {
    const me = m.elements;
    this.set(me[0], me[3], me[6], 0, me[1], me[4], me[7], 0, me[2], me[5], me[8], 0, 0, 0, 0, 1);
    return this;
  }
  extractBasis(xAxis, yAxis, zAxis) {
    xAxis.setFromMatrixColumn(this, 0);
    yAxis.setFromMatrixColumn(this, 1);
    zAxis.setFromMatrixColumn(this, 2);
    return this;
  }
  makeBasis(xAxis, yAxis, zAxis) {
    this.set(xAxis.x, yAxis.x, zAxis.x, 0, xAxis.y, yAxis.y, zAxis.y, 0, xAxis.z, yAxis.z, zAxis.z, 0, 0, 0, 0, 1);
    return this;
  }
  extractRotation(m) {
    const te = this.elements;
    const me = m.elements;
    const scaleX = 1 / _v1$1.setFromMatrixColumn(m, 0).length();
    const scaleY = 1 / _v1$1.setFromMatrixColumn(m, 1).length();
    const scaleZ = 1 / _v1$1.setFromMatrixColumn(m, 2).length();
    te[0] = me[0] * scaleX;
    te[1] = me[1] * scaleX;
    te[2] = me[2] * scaleX;
    te[3] = 0;
    te[4] = me[4] * scaleY;
    te[5] = me[5] * scaleY;
    te[6] = me[6] * scaleY;
    te[7] = 0;
    te[8] = me[8] * scaleZ;
    te[9] = me[9] * scaleZ;
    te[10] = me[10] * scaleZ;
    te[11] = 0;
    te[12] = 0;
    te[13] = 0;
    te[14] = 0;
    te[15] = 1;
    return this;
  }
  makeRotationFromEuler(euler) {
    if (!(euler && euler.isEuler)) {
      console.error("THREE.Matrix4: .makeRotationFromEuler() now expects a Euler rotation rather than a Vector3 and order.");
    }
    const te = this.elements;
    const x = euler.x, y = euler.y, z = euler.z;
    const a2 = Math.cos(x), b2 = Math.sin(x);
    const c2 = Math.cos(y), d = Math.sin(y);
    const e = Math.cos(z), f = Math.sin(z);
    if (euler.order === "XYZ") {
      const ae = a2 * e, af = a2 * f, be = b2 * e, bf = b2 * f;
      te[0] = c2 * e;
      te[4] = -c2 * f;
      te[8] = d;
      te[1] = af + be * d;
      te[5] = ae - bf * d;
      te[9] = -b2 * c2;
      te[2] = bf - ae * d;
      te[6] = be + af * d;
      te[10] = a2 * c2;
    } else if (euler.order === "YXZ") {
      const ce = c2 * e, cf = c2 * f, de = d * e, df = d * f;
      te[0] = ce + df * b2;
      te[4] = de * b2 - cf;
      te[8] = a2 * d;
      te[1] = a2 * f;
      te[5] = a2 * e;
      te[9] = -b2;
      te[2] = cf * b2 - de;
      te[6] = df + ce * b2;
      te[10] = a2 * c2;
    } else if (euler.order === "ZXY") {
      const ce = c2 * e, cf = c2 * f, de = d * e, df = d * f;
      te[0] = ce - df * b2;
      te[4] = -a2 * f;
      te[8] = de + cf * b2;
      te[1] = cf + de * b2;
      te[5] = a2 * e;
      te[9] = df - ce * b2;
      te[2] = -a2 * d;
      te[6] = b2;
      te[10] = a2 * c2;
    } else if (euler.order === "ZYX") {
      const ae = a2 * e, af = a2 * f, be = b2 * e, bf = b2 * f;
      te[0] = c2 * e;
      te[4] = be * d - af;
      te[8] = ae * d + bf;
      te[1] = c2 * f;
      te[5] = bf * d + ae;
      te[9] = af * d - be;
      te[2] = -d;
      te[6] = b2 * c2;
      te[10] = a2 * c2;
    } else if (euler.order === "YZX") {
      const ac = a2 * c2, ad = a2 * d, bc = b2 * c2, bd = b2 * d;
      te[0] = c2 * e;
      te[4] = bd - ac * f;
      te[8] = bc * f + ad;
      te[1] = f;
      te[5] = a2 * e;
      te[9] = -b2 * e;
      te[2] = -d * e;
      te[6] = ad * f + bc;
      te[10] = ac - bd * f;
    } else if (euler.order === "XZY") {
      const ac = a2 * c2, ad = a2 * d, bc = b2 * c2, bd = b2 * d;
      te[0] = c2 * e;
      te[4] = -f;
      te[8] = d * e;
      te[1] = ac * f + bd;
      te[5] = a2 * e;
      te[9] = ad * f - bc;
      te[2] = bc * f - ad;
      te[6] = b2 * e;
      te[10] = bd * f + ac;
    }
    te[3] = 0;
    te[7] = 0;
    te[11] = 0;
    te[12] = 0;
    te[13] = 0;
    te[14] = 0;
    te[15] = 1;
    return this;
  }
  makeRotationFromQuaternion(q) {
    return this.compose(_zero, q, _one);
  }
  lookAt(eye, target, up) {
    const te = this.elements;
    _z.subVectors(eye, target);
    if (_z.lengthSq() === 0) {
      _z.z = 1;
    }
    _z.normalize();
    _x.crossVectors(up, _z);
    if (_x.lengthSq() === 0) {
      if (Math.abs(up.z) === 1) {
        _z.x += 1e-4;
      } else {
        _z.z += 1e-4;
      }
      _z.normalize();
      _x.crossVectors(up, _z);
    }
    _x.normalize();
    _y.crossVectors(_z, _x);
    te[0] = _x.x;
    te[4] = _y.x;
    te[8] = _z.x;
    te[1] = _x.y;
    te[5] = _y.y;
    te[9] = _z.y;
    te[2] = _x.z;
    te[6] = _y.z;
    te[10] = _z.z;
    return this;
  }
  multiply(m, n) {
    if (n !== void 0) {
      console.warn("THREE.Matrix4: .multiply() now only accepts one argument. Use .multiplyMatrices( a, b ) instead.");
      return this.multiplyMatrices(m, n);
    }
    return this.multiplyMatrices(this, m);
  }
  premultiply(m) {
    return this.multiplyMatrices(m, this);
  }
  multiplyMatrices(a2, b2) {
    const ae = a2.elements;
    const be = b2.elements;
    const te = this.elements;
    const a11 = ae[0], a12 = ae[4], a13 = ae[8], a14 = ae[12];
    const a21 = ae[1], a22 = ae[5], a23 = ae[9], a24 = ae[13];
    const a31 = ae[2], a32 = ae[6], a33 = ae[10], a34 = ae[14];
    const a41 = ae[3], a42 = ae[7], a43 = ae[11], a44 = ae[15];
    const b11 = be[0], b12 = be[4], b13 = be[8], b14 = be[12];
    const b21 = be[1], b22 = be[5], b23 = be[9], b24 = be[13];
    const b31 = be[2], b32 = be[6], b33 = be[10], b34 = be[14];
    const b41 = be[3], b42 = be[7], b43 = be[11], b44 = be[15];
    te[0] = a11 * b11 + a12 * b21 + a13 * b31 + a14 * b41;
    te[4] = a11 * b12 + a12 * b22 + a13 * b32 + a14 * b42;
    te[8] = a11 * b13 + a12 * b23 + a13 * b33 + a14 * b43;
    te[12] = a11 * b14 + a12 * b24 + a13 * b34 + a14 * b44;
    te[1] = a21 * b11 + a22 * b21 + a23 * b31 + a24 * b41;
    te[5] = a21 * b12 + a22 * b22 + a23 * b32 + a24 * b42;
    te[9] = a21 * b13 + a22 * b23 + a23 * b33 + a24 * b43;
    te[13] = a21 * b14 + a22 * b24 + a23 * b34 + a24 * b44;
    te[2] = a31 * b11 + a32 * b21 + a33 * b31 + a34 * b41;
    te[6] = a31 * b12 + a32 * b22 + a33 * b32 + a34 * b42;
    te[10] = a31 * b13 + a32 * b23 + a33 * b33 + a34 * b43;
    te[14] = a31 * b14 + a32 * b24 + a33 * b34 + a34 * b44;
    te[3] = a41 * b11 + a42 * b21 + a43 * b31 + a44 * b41;
    te[7] = a41 * b12 + a42 * b22 + a43 * b32 + a44 * b42;
    te[11] = a41 * b13 + a42 * b23 + a43 * b33 + a44 * b43;
    te[15] = a41 * b14 + a42 * b24 + a43 * b34 + a44 * b44;
    return this;
  }
  multiplyScalar(s) {
    const te = this.elements;
    te[0] *= s;
    te[4] *= s;
    te[8] *= s;
    te[12] *= s;
    te[1] *= s;
    te[5] *= s;
    te[9] *= s;
    te[13] *= s;
    te[2] *= s;
    te[6] *= s;
    te[10] *= s;
    te[14] *= s;
    te[3] *= s;
    te[7] *= s;
    te[11] *= s;
    te[15] *= s;
    return this;
  }
  determinant() {
    const te = this.elements;
    const n11 = te[0], n12 = te[4], n13 = te[8], n14 = te[12];
    const n21 = te[1], n22 = te[5], n23 = te[9], n24 = te[13];
    const n31 = te[2], n32 = te[6], n33 = te[10], n34 = te[14];
    const n41 = te[3], n42 = te[7], n43 = te[11], n44 = te[15];
    return n41 * (+n14 * n23 * n32 - n13 * n24 * n32 - n14 * n22 * n33 + n12 * n24 * n33 + n13 * n22 * n34 - n12 * n23 * n34) + n42 * (+n11 * n23 * n34 - n11 * n24 * n33 + n14 * n21 * n33 - n13 * n21 * n34 + n13 * n24 * n31 - n14 * n23 * n31) + n43 * (+n11 * n24 * n32 - n11 * n22 * n34 - n14 * n21 * n32 + n12 * n21 * n34 + n14 * n22 * n31 - n12 * n24 * n31) + n44 * (-n13 * n22 * n31 - n11 * n23 * n32 + n11 * n22 * n33 + n13 * n21 * n32 - n12 * n21 * n33 + n12 * n23 * n31);
  }
  transpose() {
    const te = this.elements;
    let tmp;
    tmp = te[1];
    te[1] = te[4];
    te[4] = tmp;
    tmp = te[2];
    te[2] = te[8];
    te[8] = tmp;
    tmp = te[6];
    te[6] = te[9];
    te[9] = tmp;
    tmp = te[3];
    te[3] = te[12];
    te[12] = tmp;
    tmp = te[7];
    te[7] = te[13];
    te[13] = tmp;
    tmp = te[11];
    te[11] = te[14];
    te[14] = tmp;
    return this;
  }
  setPosition(x, y, z) {
    const te = this.elements;
    if (x.isVector3) {
      te[12] = x.x;
      te[13] = x.y;
      te[14] = x.z;
    } else {
      te[12] = x;
      te[13] = y;
      te[14] = z;
    }
    return this;
  }
  invert() {
    const te = this.elements, n11 = te[0], n21 = te[1], n31 = te[2], n41 = te[3], n12 = te[4], n22 = te[5], n32 = te[6], n42 = te[7], n13 = te[8], n23 = te[9], n33 = te[10], n43 = te[11], n14 = te[12], n24 = te[13], n34 = te[14], n44 = te[15], t11 = n23 * n34 * n42 - n24 * n33 * n42 + n24 * n32 * n43 - n22 * n34 * n43 - n23 * n32 * n44 + n22 * n33 * n44, t12 = n14 * n33 * n42 - n13 * n34 * n42 - n14 * n32 * n43 + n12 * n34 * n43 + n13 * n32 * n44 - n12 * n33 * n44, t13 = n13 * n24 * n42 - n14 * n23 * n42 + n14 * n22 * n43 - n12 * n24 * n43 - n13 * n22 * n44 + n12 * n23 * n44, t14 = n14 * n23 * n32 - n13 * n24 * n32 - n14 * n22 * n33 + n12 * n24 * n33 + n13 * n22 * n34 - n12 * n23 * n34;
    const det = n11 * t11 + n21 * t12 + n31 * t13 + n41 * t14;
    if (det === 0)
      return this.set(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
    const detInv = 1 / det;
    te[0] = t11 * detInv;
    te[1] = (n24 * n33 * n41 - n23 * n34 * n41 - n24 * n31 * n43 + n21 * n34 * n43 + n23 * n31 * n44 - n21 * n33 * n44) * detInv;
    te[2] = (n22 * n34 * n41 - n24 * n32 * n41 + n24 * n31 * n42 - n21 * n34 * n42 - n22 * n31 * n44 + n21 * n32 * n44) * detInv;
    te[3] = (n23 * n32 * n41 - n22 * n33 * n41 - n23 * n31 * n42 + n21 * n33 * n42 + n22 * n31 * n43 - n21 * n32 * n43) * detInv;
    te[4] = t12 * detInv;
    te[5] = (n13 * n34 * n41 - n14 * n33 * n41 + n14 * n31 * n43 - n11 * n34 * n43 - n13 * n31 * n44 + n11 * n33 * n44) * detInv;
    te[6] = (n14 * n32 * n41 - n12 * n34 * n41 - n14 * n31 * n42 + n11 * n34 * n42 + n12 * n31 * n44 - n11 * n32 * n44) * detInv;
    te[7] = (n12 * n33 * n41 - n13 * n32 * n41 + n13 * n31 * n42 - n11 * n33 * n42 - n12 * n31 * n43 + n11 * n32 * n43) * detInv;
    te[8] = t13 * detInv;
    te[9] = (n14 * n23 * n41 - n13 * n24 * n41 - n14 * n21 * n43 + n11 * n24 * n43 + n13 * n21 * n44 - n11 * n23 * n44) * detInv;
    te[10] = (n12 * n24 * n41 - n14 * n22 * n41 + n14 * n21 * n42 - n11 * n24 * n42 - n12 * n21 * n44 + n11 * n22 * n44) * detInv;
    te[11] = (n13 * n22 * n41 - n12 * n23 * n41 - n13 * n21 * n42 + n11 * n23 * n42 + n12 * n21 * n43 - n11 * n22 * n43) * detInv;
    te[12] = t14 * detInv;
    te[13] = (n13 * n24 * n31 - n14 * n23 * n31 + n14 * n21 * n33 - n11 * n24 * n33 - n13 * n21 * n34 + n11 * n23 * n34) * detInv;
    te[14] = (n14 * n22 * n31 - n12 * n24 * n31 - n14 * n21 * n32 + n11 * n24 * n32 + n12 * n21 * n34 - n11 * n22 * n34) * detInv;
    te[15] = (n12 * n23 * n31 - n13 * n22 * n31 + n13 * n21 * n32 - n11 * n23 * n32 - n12 * n21 * n33 + n11 * n22 * n33) * detInv;
    return this;
  }
  scale(v) {
    const te = this.elements;
    const x = v.x, y = v.y, z = v.z;
    te[0] *= x;
    te[4] *= y;
    te[8] *= z;
    te[1] *= x;
    te[5] *= y;
    te[9] *= z;
    te[2] *= x;
    te[6] *= y;
    te[10] *= z;
    te[3] *= x;
    te[7] *= y;
    te[11] *= z;
    return this;
  }
  getMaxScaleOnAxis() {
    const te = this.elements;
    const scaleXSq = te[0] * te[0] + te[1] * te[1] + te[2] * te[2];
    const scaleYSq = te[4] * te[4] + te[5] * te[5] + te[6] * te[6];
    const scaleZSq = te[8] * te[8] + te[9] * te[9] + te[10] * te[10];
    return Math.sqrt(Math.max(scaleXSq, scaleYSq, scaleZSq));
  }
  makeTranslation(x, y, z) {
    this.set(1, 0, 0, x, 0, 1, 0, y, 0, 0, 1, z, 0, 0, 0, 1);
    return this;
  }
  makeRotationX(theta) {
    const c2 = Math.cos(theta), s = Math.sin(theta);
    this.set(1, 0, 0, 0, 0, c2, -s, 0, 0, s, c2, 0, 0, 0, 0, 1);
    return this;
  }
  makeRotationY(theta) {
    const c2 = Math.cos(theta), s = Math.sin(theta);
    this.set(c2, 0, s, 0, 0, 1, 0, 0, -s, 0, c2, 0, 0, 0, 0, 1);
    return this;
  }
  makeRotationZ(theta) {
    const c2 = Math.cos(theta), s = Math.sin(theta);
    this.set(c2, -s, 0, 0, s, c2, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
    return this;
  }
  makeRotationAxis(axis, angle) {
    const c2 = Math.cos(angle);
    const s = Math.sin(angle);
    const t = 1 - c2;
    const x = axis.x, y = axis.y, z = axis.z;
    const tx = t * x, ty = t * y;
    this.set(tx * x + c2, tx * y - s * z, tx * z + s * y, 0, tx * y + s * z, ty * y + c2, ty * z - s * x, 0, tx * z - s * y, ty * z + s * x, t * z * z + c2, 0, 0, 0, 0, 1);
    return this;
  }
  makeScale(x, y, z) {
    this.set(x, 0, 0, 0, 0, y, 0, 0, 0, 0, z, 0, 0, 0, 0, 1);
    return this;
  }
  makeShear(xy, xz, yx, yz, zx, zy) {
    this.set(1, yx, zx, 0, xy, 1, zy, 0, xz, yz, 1, 0, 0, 0, 0, 1);
    return this;
  }
  compose(position, quaternion, scale) {
    const te = this.elements;
    const x = quaternion._x, y = quaternion._y, z = quaternion._z, w = quaternion._w;
    const x2 = x + x, y2 = y + y, z2 = z + z;
    const xx = x * x2, xy = x * y2, xz = x * z2;
    const yy = y * y2, yz = y * z2, zz = z * z2;
    const wx = w * x2, wy = w * y2, wz = w * z2;
    const sx = scale.x, sy = scale.y, sz = scale.z;
    te[0] = (1 - (yy + zz)) * sx;
    te[1] = (xy + wz) * sx;
    te[2] = (xz - wy) * sx;
    te[3] = 0;
    te[4] = (xy - wz) * sy;
    te[5] = (1 - (xx + zz)) * sy;
    te[6] = (yz + wx) * sy;
    te[7] = 0;
    te[8] = (xz + wy) * sz;
    te[9] = (yz - wx) * sz;
    te[10] = (1 - (xx + yy)) * sz;
    te[11] = 0;
    te[12] = position.x;
    te[13] = position.y;
    te[14] = position.z;
    te[15] = 1;
    return this;
  }
  decompose(position, quaternion, scale) {
    const te = this.elements;
    let sx = _v1$1.set(te[0], te[1], te[2]).length();
    const sy = _v1$1.set(te[4], te[5], te[6]).length();
    const sz = _v1$1.set(te[8], te[9], te[10]).length();
    const det = this.determinant();
    if (det < 0)
      sx = -sx;
    position.x = te[12];
    position.y = te[13];
    position.z = te[14];
    _m1.copy(this);
    const invSX = 1 / sx;
    const invSY = 1 / sy;
    const invSZ = 1 / sz;
    _m1.elements[0] *= invSX;
    _m1.elements[1] *= invSX;
    _m1.elements[2] *= invSX;
    _m1.elements[4] *= invSY;
    _m1.elements[5] *= invSY;
    _m1.elements[6] *= invSY;
    _m1.elements[8] *= invSZ;
    _m1.elements[9] *= invSZ;
    _m1.elements[10] *= invSZ;
    quaternion.setFromRotationMatrix(_m1);
    scale.x = sx;
    scale.y = sy;
    scale.z = sz;
    return this;
  }
  makePerspective(left, right, top, bottom, near, far) {
    if (far === void 0) {
      console.warn("THREE.Matrix4: .makePerspective() has been redefined and has a new signature. Please check the docs.");
    }
    const te = this.elements;
    const x = 2 * near / (right - left);
    const y = 2 * near / (top - bottom);
    const a2 = (right + left) / (right - left);
    const b2 = (top + bottom) / (top - bottom);
    const c2 = -(far + near) / (far - near);
    const d = -2 * far * near / (far - near);
    te[0] = x;
    te[4] = 0;
    te[8] = a2;
    te[12] = 0;
    te[1] = 0;
    te[5] = y;
    te[9] = b2;
    te[13] = 0;
    te[2] = 0;
    te[6] = 0;
    te[10] = c2;
    te[14] = d;
    te[3] = 0;
    te[7] = 0;
    te[11] = -1;
    te[15] = 0;
    return this;
  }
  makeOrthographic(left, right, top, bottom, near, far) {
    const te = this.elements;
    const w = 1 / (right - left);
    const h = 1 / (top - bottom);
    const p = 1 / (far - near);
    const x = (right + left) * w;
    const y = (top + bottom) * h;
    const z = (far + near) * p;
    te[0] = 2 * w;
    te[4] = 0;
    te[8] = 0;
    te[12] = -x;
    te[1] = 0;
    te[5] = 2 * h;
    te[9] = 0;
    te[13] = -y;
    te[2] = 0;
    te[6] = 0;
    te[10] = -2 * p;
    te[14] = -z;
    te[3] = 0;
    te[7] = 0;
    te[11] = 0;
    te[15] = 1;
    return this;
  }
  equals(matrix) {
    const te = this.elements;
    const me = matrix.elements;
    for (let i = 0; i < 16; i++) {
      if (te[i] !== me[i])
        return false;
    }
    return true;
  }
  fromArray(array, offset = 0) {
    for (let i = 0; i < 16; i++) {
      this.elements[i] = array[i + offset];
    }
    return this;
  }
  toArray(array = [], offset = 0) {
    const te = this.elements;
    array[offset] = te[0];
    array[offset + 1] = te[1];
    array[offset + 2] = te[2];
    array[offset + 3] = te[3];
    array[offset + 4] = te[4];
    array[offset + 5] = te[5];
    array[offset + 6] = te[6];
    array[offset + 7] = te[7];
    array[offset + 8] = te[8];
    array[offset + 9] = te[9];
    array[offset + 10] = te[10];
    array[offset + 11] = te[11];
    array[offset + 12] = te[12];
    array[offset + 13] = te[13];
    array[offset + 14] = te[14];
    array[offset + 15] = te[15];
    return array;
  }
}
Matrix4.prototype.isMatrix4 = true;
const _v1$1 = /* @__PURE__ */ new Vector3();
const _m1 = /* @__PURE__ */ new Matrix4();
const _zero = /* @__PURE__ */ new Vector3(0, 0, 0);
const _one = /* @__PURE__ */ new Vector3(1, 1, 1);
const _x = /* @__PURE__ */ new Vector3();
const _y = /* @__PURE__ */ new Vector3();
const _z = /* @__PURE__ */ new Vector3();
const _matrix = /* @__PURE__ */ new Matrix4();
const _quaternion = /* @__PURE__ */ new Quaternion();
class Euler {
  constructor(x = 0, y = 0, z = 0, order = Euler.DefaultOrder) {
    this._x = x;
    this._y = y;
    this._z = z;
    this._order = order;
  }
  get x() {
    return this._x;
  }
  set x(value) {
    this._x = value;
    this._onChangeCallback();
  }
  get y() {
    return this._y;
  }
  set y(value) {
    this._y = value;
    this._onChangeCallback();
  }
  get z() {
    return this._z;
  }
  set z(value) {
    this._z = value;
    this._onChangeCallback();
  }
  get order() {
    return this._order;
  }
  set order(value) {
    this._order = value;
    this._onChangeCallback();
  }
  set(x, y, z, order = this._order) {
    this._x = x;
    this._y = y;
    this._z = z;
    this._order = order;
    this._onChangeCallback();
    return this;
  }
  clone() {
    return new this.constructor(this._x, this._y, this._z, this._order);
  }
  copy(euler) {
    this._x = euler._x;
    this._y = euler._y;
    this._z = euler._z;
    this._order = euler._order;
    this._onChangeCallback();
    return this;
  }
  setFromRotationMatrix(m, order = this._order, update = true) {
    const te = m.elements;
    const m11 = te[0], m12 = te[4], m13 = te[8];
    const m21 = te[1], m22 = te[5], m23 = te[9];
    const m31 = te[2], m32 = te[6], m33 = te[10];
    switch (order) {
      case "XYZ":
        this._y = Math.asin(clamp(m13, -1, 1));
        if (Math.abs(m13) < 0.9999999) {
          this._x = Math.atan2(-m23, m33);
          this._z = Math.atan2(-m12, m11);
        } else {
          this._x = Math.atan2(m32, m22);
          this._z = 0;
        }
        break;
      case "YXZ":
        this._x = Math.asin(-clamp(m23, -1, 1));
        if (Math.abs(m23) < 0.9999999) {
          this._y = Math.atan2(m13, m33);
          this._z = Math.atan2(m21, m22);
        } else {
          this._y = Math.atan2(-m31, m11);
          this._z = 0;
        }
        break;
      case "ZXY":
        this._x = Math.asin(clamp(m32, -1, 1));
        if (Math.abs(m32) < 0.9999999) {
          this._y = Math.atan2(-m31, m33);
          this._z = Math.atan2(-m12, m22);
        } else {
          this._y = 0;
          this._z = Math.atan2(m21, m11);
        }
        break;
      case "ZYX":
        this._y = Math.asin(-clamp(m31, -1, 1));
        if (Math.abs(m31) < 0.9999999) {
          this._x = Math.atan2(m32, m33);
          this._z = Math.atan2(m21, m11);
        } else {
          this._x = 0;
          this._z = Math.atan2(-m12, m22);
        }
        break;
      case "YZX":
        this._z = Math.asin(clamp(m21, -1, 1));
        if (Math.abs(m21) < 0.9999999) {
          this._x = Math.atan2(-m23, m22);
          this._y = Math.atan2(-m31, m11);
        } else {
          this._x = 0;
          this._y = Math.atan2(m13, m33);
        }
        break;
      case "XZY":
        this._z = Math.asin(-clamp(m12, -1, 1));
        if (Math.abs(m12) < 0.9999999) {
          this._x = Math.atan2(m32, m22);
          this._y = Math.atan2(m13, m11);
        } else {
          this._x = Math.atan2(-m23, m33);
          this._y = 0;
        }
        break;
      default:
        console.warn("THREE.Euler: .setFromRotationMatrix() encountered an unknown order: " + order);
    }
    this._order = order;
    if (update === true)
      this._onChangeCallback();
    return this;
  }
  setFromQuaternion(q, order, update) {
    _matrix.makeRotationFromQuaternion(q);
    return this.setFromRotationMatrix(_matrix, order, update);
  }
  setFromVector3(v, order = this._order) {
    return this.set(v.x, v.y, v.z, order);
  }
  reorder(newOrder) {
    _quaternion.setFromEuler(this);
    return this.setFromQuaternion(_quaternion, newOrder);
  }
  equals(euler) {
    return euler._x === this._x && euler._y === this._y && euler._z === this._z && euler._order === this._order;
  }
  fromArray(array) {
    this._x = array[0];
    this._y = array[1];
    this._z = array[2];
    if (array[3] !== void 0)
      this._order = array[3];
    this._onChangeCallback();
    return this;
  }
  toArray(array = [], offset = 0) {
    array[offset] = this._x;
    array[offset + 1] = this._y;
    array[offset + 2] = this._z;
    array[offset + 3] = this._order;
    return array;
  }
  _onChange(callback) {
    this._onChangeCallback = callback;
    return this;
  }
  _onChangeCallback() {
  }
  *[Symbol.iterator]() {
    yield this._x;
    yield this._y;
    yield this._z;
    yield this._order;
  }
}
Euler.prototype.isEuler = true;
Euler.DefaultOrder = "XYZ";
Euler.RotationOrders = ["XYZ", "YZX", "ZXY", "XZY", "YXZ", "ZYX"];
const SRGBColorSpace = "srgb";
const LinearSRGBColorSpace = "srgb-linear";
function SRGBToLinear(c2) {
  return c2 < 0.04045 ? c2 * 0.0773993808 : Math.pow(c2 * 0.9478672986 + 0.0521327014, 2.4);
}
function LinearToSRGB(c2) {
  return c2 < 31308e-7 ? c2 * 12.92 : 1.055 * Math.pow(c2, 0.41666) - 0.055;
}
const FN = {
  [SRGBColorSpace]: { [LinearSRGBColorSpace]: SRGBToLinear },
  [LinearSRGBColorSpace]: { [SRGBColorSpace]: LinearToSRGB }
};
const ColorManagement = {
  legacyMode: true,
  get workingColorSpace() {
    return LinearSRGBColorSpace;
  },
  set workingColorSpace(colorSpace) {
    console.warn("THREE.ColorManagement: .workingColorSpace is readonly.");
  },
  convert: function(color, sourceColorSpace, targetColorSpace) {
    if (this.legacyMode || sourceColorSpace === targetColorSpace || !sourceColorSpace || !targetColorSpace) {
      return color;
    }
    if (FN[sourceColorSpace] && FN[sourceColorSpace][targetColorSpace] !== void 0) {
      const fn = FN[sourceColorSpace][targetColorSpace];
      color.r = fn(color.r);
      color.g = fn(color.g);
      color.b = fn(color.b);
      return color;
    }
    throw new Error("Unsupported color space conversion.");
  },
  fromWorkingColorSpace: function(color, targetColorSpace) {
    return this.convert(color, this.workingColorSpace, targetColorSpace);
  },
  toWorkingColorSpace: function(color, sourceColorSpace) {
    return this.convert(color, sourceColorSpace, this.workingColorSpace);
  }
};
const _colorKeywords = {
  "aliceblue": 15792383,
  "antiquewhite": 16444375,
  "aqua": 65535,
  "aquamarine": 8388564,
  "azure": 15794175,
  "beige": 16119260,
  "bisque": 16770244,
  "black": 0,
  "blanchedalmond": 16772045,
  "blue": 255,
  "blueviolet": 9055202,
  "brown": 10824234,
  "burlywood": 14596231,
  "cadetblue": 6266528,
  "chartreuse": 8388352,
  "chocolate": 13789470,
  "coral": 16744272,
  "cornflowerblue": 6591981,
  "cornsilk": 16775388,
  "crimson": 14423100,
  "cyan": 65535,
  "darkblue": 139,
  "darkcyan": 35723,
  "darkgoldenrod": 12092939,
  "darkgray": 11119017,
  "darkgreen": 25600,
  "darkgrey": 11119017,
  "darkkhaki": 12433259,
  "darkmagenta": 9109643,
  "darkolivegreen": 5597999,
  "darkorange": 16747520,
  "darkorchid": 10040012,
  "darkred": 9109504,
  "darksalmon": 15308410,
  "darkseagreen": 9419919,
  "darkslateblue": 4734347,
  "darkslategray": 3100495,
  "darkslategrey": 3100495,
  "darkturquoise": 52945,
  "darkviolet": 9699539,
  "deeppink": 16716947,
  "deepskyblue": 49151,
  "dimgray": 6908265,
  "dimgrey": 6908265,
  "dodgerblue": 2003199,
  "firebrick": 11674146,
  "floralwhite": 16775920,
  "forestgreen": 2263842,
  "fuchsia": 16711935,
  "gainsboro": 14474460,
  "ghostwhite": 16316671,
  "gold": 16766720,
  "goldenrod": 14329120,
  "gray": 8421504,
  "green": 32768,
  "greenyellow": 11403055,
  "grey": 8421504,
  "honeydew": 15794160,
  "hotpink": 16738740,
  "indianred": 13458524,
  "indigo": 4915330,
  "ivory": 16777200,
  "khaki": 15787660,
  "lavender": 15132410,
  "lavenderblush": 16773365,
  "lawngreen": 8190976,
  "lemonchiffon": 16775885,
  "lightblue": 11393254,
  "lightcoral": 15761536,
  "lightcyan": 14745599,
  "lightgoldenrodyellow": 16448210,
  "lightgray": 13882323,
  "lightgreen": 9498256,
  "lightgrey": 13882323,
  "lightpink": 16758465,
  "lightsalmon": 16752762,
  "lightseagreen": 2142890,
  "lightskyblue": 8900346,
  "lightslategray": 7833753,
  "lightslategrey": 7833753,
  "lightsteelblue": 11584734,
  "lightyellow": 16777184,
  "lime": 65280,
  "limegreen": 3329330,
  "linen": 16445670,
  "magenta": 16711935,
  "maroon": 8388608,
  "mediumaquamarine": 6737322,
  "mediumblue": 205,
  "mediumorchid": 12211667,
  "mediumpurple": 9662683,
  "mediumseagreen": 3978097,
  "mediumslateblue": 8087790,
  "mediumspringgreen": 64154,
  "mediumturquoise": 4772300,
  "mediumvioletred": 13047173,
  "midnightblue": 1644912,
  "mintcream": 16121850,
  "mistyrose": 16770273,
  "moccasin": 16770229,
  "navajowhite": 16768685,
  "navy": 128,
  "oldlace": 16643558,
  "olive": 8421376,
  "olivedrab": 7048739,
  "orange": 16753920,
  "orangered": 16729344,
  "orchid": 14315734,
  "palegoldenrod": 15657130,
  "palegreen": 10025880,
  "paleturquoise": 11529966,
  "palevioletred": 14381203,
  "papayawhip": 16773077,
  "peachpuff": 16767673,
  "peru": 13468991,
  "pink": 16761035,
  "plum": 14524637,
  "powderblue": 11591910,
  "purple": 8388736,
  "rebeccapurple": 6697881,
  "red": 16711680,
  "rosybrown": 12357519,
  "royalblue": 4286945,
  "saddlebrown": 9127187,
  "salmon": 16416882,
  "sandybrown": 16032864,
  "seagreen": 3050327,
  "seashell": 16774638,
  "sienna": 10506797,
  "silver": 12632256,
  "skyblue": 8900331,
  "slateblue": 6970061,
  "slategray": 7372944,
  "slategrey": 7372944,
  "snow": 16775930,
  "springgreen": 65407,
  "steelblue": 4620980,
  "tan": 13808780,
  "teal": 32896,
  "thistle": 14204888,
  "tomato": 16737095,
  "turquoise": 4251856,
  "violet": 15631086,
  "wheat": 16113331,
  "white": 16777215,
  "whitesmoke": 16119285,
  "yellow": 16776960,
  "yellowgreen": 10145074
};
const _rgb = { r: 0, g: 0, b: 0 };
const _hslA = { h: 0, s: 0, l: 0 };
const _hslB = { h: 0, s: 0, l: 0 };
function hue2rgb(p, q, t) {
  if (t < 0)
    t += 1;
  if (t > 1)
    t -= 1;
  if (t < 1 / 6)
    return p + (q - p) * 6 * t;
  if (t < 1 / 2)
    return q;
  if (t < 2 / 3)
    return p + (q - p) * 6 * (2 / 3 - t);
  return p;
}
function toComponents(source, target) {
  target.r = source.r;
  target.g = source.g;
  target.b = source.b;
  return target;
}
class Color {
  constructor(r, g, b2) {
    if (g === void 0 && b2 === void 0) {
      return this.set(r);
    }
    return this.setRGB(r, g, b2);
  }
  set(value) {
    if (value && value.isColor) {
      this.copy(value);
    } else if (typeof value === "number") {
      this.setHex(value);
    } else if (typeof value === "string") {
      this.setStyle(value);
    }
    return this;
  }
  setScalar(scalar) {
    this.r = scalar;
    this.g = scalar;
    this.b = scalar;
    return this;
  }
  setHex(hex, colorSpace = SRGBColorSpace) {
    hex = Math.floor(hex);
    this.r = (hex >> 16 & 255) / 255;
    this.g = (hex >> 8 & 255) / 255;
    this.b = (hex & 255) / 255;
    ColorManagement.toWorkingColorSpace(this, colorSpace);
    return this;
  }
  setRGB(r, g, b2, colorSpace = LinearSRGBColorSpace) {
    this.r = r;
    this.g = g;
    this.b = b2;
    ColorManagement.toWorkingColorSpace(this, colorSpace);
    return this;
  }
  setHSL(h, s, l, colorSpace = LinearSRGBColorSpace) {
    h = euclideanModulo(h, 1);
    s = clamp(s, 0, 1);
    l = clamp(l, 0, 1);
    if (s === 0) {
      this.r = this.g = this.b = l;
    } else {
      const p = l <= 0.5 ? l * (1 + s) : l + s - l * s;
      const q = 2 * l - p;
      this.r = hue2rgb(q, p, h + 1 / 3);
      this.g = hue2rgb(q, p, h);
      this.b = hue2rgb(q, p, h - 1 / 3);
    }
    ColorManagement.toWorkingColorSpace(this, colorSpace);
    return this;
  }
  setStyle(style, colorSpace = SRGBColorSpace) {
    function handleAlpha(string) {
      if (string === void 0)
        return;
      if (parseFloat(string) < 1) {
        console.warn("THREE.Color: Alpha component of " + style + " will be ignored.");
      }
    }
    let m;
    if (m = /^((?:rgb|hsl)a?)\(([^\)]*)\)/.exec(style)) {
      let color;
      const name2 = m[1];
      const components = m[2];
      switch (name2) {
        case "rgb":
        case "rgba":
          if (color = /^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(components)) {
            this.r = Math.min(255, parseInt(color[1], 10)) / 255;
            this.g = Math.min(255, parseInt(color[2], 10)) / 255;
            this.b = Math.min(255, parseInt(color[3], 10)) / 255;
            ColorManagement.toWorkingColorSpace(this, colorSpace);
            handleAlpha(color[4]);
            return this;
          }
          if (color = /^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(components)) {
            this.r = Math.min(100, parseInt(color[1], 10)) / 100;
            this.g = Math.min(100, parseInt(color[2], 10)) / 100;
            this.b = Math.min(100, parseInt(color[3], 10)) / 100;
            ColorManagement.toWorkingColorSpace(this, colorSpace);
            handleAlpha(color[4]);
            return this;
          }
          break;
        case "hsl":
        case "hsla":
          if (color = /^\s*(\d*\.?\d+)\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(components)) {
            const h = parseFloat(color[1]) / 360;
            const s = parseInt(color[2], 10) / 100;
            const l = parseInt(color[3], 10) / 100;
            handleAlpha(color[4]);
            return this.setHSL(h, s, l, colorSpace);
          }
          break;
      }
    } else if (m = /^\#([A-Fa-f\d]+)$/.exec(style)) {
      const hex = m[1];
      const size = hex.length;
      if (size === 3) {
        this.r = parseInt(hex.charAt(0) + hex.charAt(0), 16) / 255;
        this.g = parseInt(hex.charAt(1) + hex.charAt(1), 16) / 255;
        this.b = parseInt(hex.charAt(2) + hex.charAt(2), 16) / 255;
        ColorManagement.toWorkingColorSpace(this, colorSpace);
        return this;
      } else if (size === 6) {
        this.r = parseInt(hex.charAt(0) + hex.charAt(1), 16) / 255;
        this.g = parseInt(hex.charAt(2) + hex.charAt(3), 16) / 255;
        this.b = parseInt(hex.charAt(4) + hex.charAt(5), 16) / 255;
        ColorManagement.toWorkingColorSpace(this, colorSpace);
        return this;
      }
    }
    if (style && style.length > 0) {
      return this.setColorName(style, colorSpace);
    }
    return this;
  }
  setColorName(style, colorSpace = SRGBColorSpace) {
    const hex = _colorKeywords[style.toLowerCase()];
    if (hex !== void 0) {
      this.setHex(hex, colorSpace);
    } else {
      console.warn("THREE.Color: Unknown color " + style);
    }
    return this;
  }
  clone() {
    return new this.constructor(this.r, this.g, this.b);
  }
  copy(color) {
    this.r = color.r;
    this.g = color.g;
    this.b = color.b;
    return this;
  }
  copySRGBToLinear(color) {
    this.r = SRGBToLinear(color.r);
    this.g = SRGBToLinear(color.g);
    this.b = SRGBToLinear(color.b);
    return this;
  }
  copyLinearToSRGB(color) {
    this.r = LinearToSRGB(color.r);
    this.g = LinearToSRGB(color.g);
    this.b = LinearToSRGB(color.b);
    return this;
  }
  convertSRGBToLinear() {
    this.copySRGBToLinear(this);
    return this;
  }
  convertLinearToSRGB() {
    this.copyLinearToSRGB(this);
    return this;
  }
  getHex(colorSpace = SRGBColorSpace) {
    ColorManagement.fromWorkingColorSpace(toComponents(this, _rgb), colorSpace);
    return clamp(_rgb.r * 255, 0, 255) << 16 ^ clamp(_rgb.g * 255, 0, 255) << 8 ^ clamp(_rgb.b * 255, 0, 255) << 0;
  }
  getHexString(colorSpace = SRGBColorSpace) {
    return ("000000" + this.getHex(colorSpace).toString(16)).slice(-6);
  }
  getHSL(target, colorSpace = LinearSRGBColorSpace) {
    ColorManagement.fromWorkingColorSpace(toComponents(this, _rgb), colorSpace);
    const r = _rgb.r, g = _rgb.g, b2 = _rgb.b;
    const max2 = Math.max(r, g, b2);
    const min2 = Math.min(r, g, b2);
    let hue, saturation;
    const lightness = (min2 + max2) / 2;
    if (min2 === max2) {
      hue = 0;
      saturation = 0;
    } else {
      const delta = max2 - min2;
      saturation = lightness <= 0.5 ? delta / (max2 + min2) : delta / (2 - max2 - min2);
      switch (max2) {
        case r:
          hue = (g - b2) / delta + (g < b2 ? 6 : 0);
          break;
        case g:
          hue = (b2 - r) / delta + 2;
          break;
        case b2:
          hue = (r - g) / delta + 4;
          break;
      }
      hue /= 6;
    }
    target.h = hue;
    target.s = saturation;
    target.l = lightness;
    return target;
  }
  getRGB(target, colorSpace = LinearSRGBColorSpace) {
    ColorManagement.fromWorkingColorSpace(toComponents(this, _rgb), colorSpace);
    target.r = _rgb.r;
    target.g = _rgb.g;
    target.b = _rgb.b;
    return target;
  }
  getStyle(colorSpace = SRGBColorSpace) {
    ColorManagement.fromWorkingColorSpace(toComponents(this, _rgb), colorSpace);
    if (colorSpace !== SRGBColorSpace) {
      return `color(${colorSpace} ${_rgb.r} ${_rgb.g} ${_rgb.b})`;
    }
    return `rgb(${_rgb.r * 255 | 0},${_rgb.g * 255 | 0},${_rgb.b * 255 | 0})`;
  }
  offsetHSL(h, s, l) {
    this.getHSL(_hslA);
    _hslA.h += h;
    _hslA.s += s;
    _hslA.l += l;
    this.setHSL(_hslA.h, _hslA.s, _hslA.l);
    return this;
  }
  add(color) {
    this.r += color.r;
    this.g += color.g;
    this.b += color.b;
    return this;
  }
  addColors(color1, color2) {
    this.r = color1.r + color2.r;
    this.g = color1.g + color2.g;
    this.b = color1.b + color2.b;
    return this;
  }
  addScalar(s) {
    this.r += s;
    this.g += s;
    this.b += s;
    return this;
  }
  sub(color) {
    this.r = Math.max(0, this.r - color.r);
    this.g = Math.max(0, this.g - color.g);
    this.b = Math.max(0, this.b - color.b);
    return this;
  }
  multiply(color) {
    this.r *= color.r;
    this.g *= color.g;
    this.b *= color.b;
    return this;
  }
  multiplyScalar(s) {
    this.r *= s;
    this.g *= s;
    this.b *= s;
    return this;
  }
  lerp(color, alpha) {
    this.r += (color.r - this.r) * alpha;
    this.g += (color.g - this.g) * alpha;
    this.b += (color.b - this.b) * alpha;
    return this;
  }
  lerpColors(color1, color2, alpha) {
    this.r = color1.r + (color2.r - color1.r) * alpha;
    this.g = color1.g + (color2.g - color1.g) * alpha;
    this.b = color1.b + (color2.b - color1.b) * alpha;
    return this;
  }
  lerpHSL(color, alpha) {
    this.getHSL(_hslA);
    color.getHSL(_hslB);
    const h = lerp(_hslA.h, _hslB.h, alpha);
    const s = lerp(_hslA.s, _hslB.s, alpha);
    const l = lerp(_hslA.l, _hslB.l, alpha);
    this.setHSL(h, s, l);
    return this;
  }
  equals(c2) {
    return c2.r === this.r && c2.g === this.g && c2.b === this.b;
  }
  fromArray(array, offset = 0) {
    this.r = array[offset];
    this.g = array[offset + 1];
    this.b = array[offset + 2];
    return this;
  }
  toArray(array = [], offset = 0) {
    array[offset] = this.r;
    array[offset + 1] = this.g;
    array[offset + 2] = this.b;
    return array;
  }
  fromBufferAttribute(attribute, index) {
    this.r = attribute.getX(index);
    this.g = attribute.getY(index);
    this.b = attribute.getZ(index);
    if (attribute.normalized === true) {
      this.r /= 255;
      this.g /= 255;
      this.b /= 255;
    }
    return this;
  }
  toJSON() {
    return this.getHex();
  }
  *[Symbol.iterator]() {
    yield this.r;
    yield this.g;
    yield this.b;
  }
}
Color.NAMES = _colorKeywords;
Color.prototype.isColor = true;
Color.prototype.r = 1;
Color.prototype.g = 1;
Color.prototype.b = 1;
const _vector$2 = /* @__PURE__ */ new Vector2();
class Box2 {
  constructor(min2 = new Vector2(Infinity, Infinity), max2 = new Vector2(-Infinity, -Infinity)) {
    this.min = min2;
    this.max = max2;
  }
  set(min2, max2) {
    this.min.copy(min2);
    this.max.copy(max2);
    return this;
  }
  setFromPoints(points) {
    this.makeEmpty();
    for (let i = 0, il = points.length; i < il; i++) {
      this.expandByPoint(points[i]);
    }
    return this;
  }
  setFromCenterAndSize(center, size) {
    const halfSize = _vector$2.copy(size).multiplyScalar(0.5);
    this.min.copy(center).sub(halfSize);
    this.max.copy(center).add(halfSize);
    return this;
  }
  clone() {
    return new this.constructor().copy(this);
  }
  copy(box) {
    this.min.copy(box.min);
    this.max.copy(box.max);
    return this;
  }
  makeEmpty() {
    this.min.x = this.min.y = Infinity;
    this.max.x = this.max.y = -Infinity;
    return this;
  }
  isEmpty() {
    return this.max.x < this.min.x || this.max.y < this.min.y;
  }
  getCenter(target) {
    return this.isEmpty() ? target.set(0, 0) : target.addVectors(this.min, this.max).multiplyScalar(0.5);
  }
  getSize(target) {
    return this.isEmpty() ? target.set(0, 0) : target.subVectors(this.max, this.min);
  }
  expandByPoint(point) {
    this.min.min(point);
    this.max.max(point);
    return this;
  }
  expandByVector(vector) {
    this.min.sub(vector);
    this.max.add(vector);
    return this;
  }
  expandByScalar(scalar) {
    this.min.addScalar(-scalar);
    this.max.addScalar(scalar);
    return this;
  }
  containsPoint(point) {
    return point.x < this.min.x || point.x > this.max.x || point.y < this.min.y || point.y > this.max.y ? false : true;
  }
  containsBox(box) {
    return this.min.x <= box.min.x && box.max.x <= this.max.x && this.min.y <= box.min.y && box.max.y <= this.max.y;
  }
  getParameter(point, target) {
    return target.set((point.x - this.min.x) / (this.max.x - this.min.x), (point.y - this.min.y) / (this.max.y - this.min.y));
  }
  intersectsBox(box) {
    return box.max.x < this.min.x || box.min.x > this.max.x || box.max.y < this.min.y || box.min.y > this.max.y ? false : true;
  }
  clampPoint(point, target) {
    return target.copy(point).clamp(this.min, this.max);
  }
  distanceToPoint(point) {
    const clampedPoint = _vector$2.copy(point).clamp(this.min, this.max);
    return clampedPoint.sub(point).length();
  }
  intersect(box) {
    this.min.max(box.min);
    this.max.min(box.max);
    return this;
  }
  union(box) {
    this.min.min(box.min);
    this.max.max(box.max);
    return this;
  }
  translate(offset) {
    this.min.add(offset);
    this.max.add(offset);
    return this;
  }
  equals(box) {
    return box.min.equals(this.min) && box.max.equals(this.max);
  }
}
Box2.prototype.isBox2 = true;
class Box3 {
  constructor(min2 = new Vector3(Infinity, Infinity, Infinity), max2 = new Vector3(-Infinity, -Infinity, -Infinity)) {
    this.min = min2;
    this.max = max2;
  }
  set(min2, max2) {
    this.min.copy(min2);
    this.max.copy(max2);
    return this;
  }
  setFromArray(array) {
    let minX = Infinity;
    let minY = Infinity;
    let minZ = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    let maxZ = -Infinity;
    for (let i = 0, l = array.length; i < l; i += 3) {
      const x = array[i];
      const y = array[i + 1];
      const z = array[i + 2];
      if (x < minX)
        minX = x;
      if (y < minY)
        minY = y;
      if (z < minZ)
        minZ = z;
      if (x > maxX)
        maxX = x;
      if (y > maxY)
        maxY = y;
      if (z > maxZ)
        maxZ = z;
    }
    this.min.set(minX, minY, minZ);
    this.max.set(maxX, maxY, maxZ);
    return this;
  }
  setFromBufferAttribute(attribute) {
    let minX = Infinity;
    let minY = Infinity;
    let minZ = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    let maxZ = -Infinity;
    for (let i = 0, l = attribute.count; i < l; i++) {
      const x = attribute.getX(i);
      const y = attribute.getY(i);
      const z = attribute.getZ(i);
      if (x < minX)
        minX = x;
      if (y < minY)
        minY = y;
      if (z < minZ)
        minZ = z;
      if (x > maxX)
        maxX = x;
      if (y > maxY)
        maxY = y;
      if (z > maxZ)
        maxZ = z;
    }
    this.min.set(minX, minY, minZ);
    this.max.set(maxX, maxY, maxZ);
    return this;
  }
  setFromPoints(points) {
    this.makeEmpty();
    for (let i = 0, il = points.length; i < il; i++) {
      this.expandByPoint(points[i]);
    }
    return this;
  }
  setFromCenterAndSize(center, size) {
    const halfSize = _vector$1.copy(size).multiplyScalar(0.5);
    this.min.copy(center).sub(halfSize);
    this.max.copy(center).add(halfSize);
    return this;
  }
  setFromObject(object, precise = false) {
    this.makeEmpty();
    return this.expandByObject(object, precise);
  }
  clone() {
    return new this.constructor().copy(this);
  }
  copy(box) {
    this.min.copy(box.min);
    this.max.copy(box.max);
    return this;
  }
  makeEmpty() {
    this.min.x = this.min.y = this.min.z = Infinity;
    this.max.x = this.max.y = this.max.z = -Infinity;
    return this;
  }
  isEmpty() {
    return this.max.x < this.min.x || this.max.y < this.min.y || this.max.z < this.min.z;
  }
  getCenter(target) {
    return this.isEmpty() ? target.set(0, 0, 0) : target.addVectors(this.min, this.max).multiplyScalar(0.5);
  }
  getSize(target) {
    return this.isEmpty() ? target.set(0, 0, 0) : target.subVectors(this.max, this.min);
  }
  expandByPoint(point) {
    this.min.min(point);
    this.max.max(point);
    return this;
  }
  expandByVector(vector) {
    this.min.sub(vector);
    this.max.add(vector);
    return this;
  }
  expandByScalar(scalar) {
    this.min.addScalar(-scalar);
    this.max.addScalar(scalar);
    return this;
  }
  expandByObject(object, precise = false) {
    object.updateWorldMatrix(false, false);
    const geometry = object.geometry;
    if (geometry !== void 0) {
      if (precise && geometry.attributes != void 0 && geometry.attributes.position !== void 0) {
        const position = geometry.attributes.position;
        for (let i = 0, l = position.count; i < l; i++) {
          _vector$1.fromBufferAttribute(position, i).applyMatrix4(object.matrixWorld);
          this.expandByPoint(_vector$1);
        }
      } else {
        if (geometry.boundingBox === null) {
          geometry.computeBoundingBox();
        }
        _box.copy(geometry.boundingBox);
        _box.applyMatrix4(object.matrixWorld);
        this.union(_box);
      }
    }
    const children = object.children;
    for (let i = 0, l = children.length; i < l; i++) {
      this.expandByObject(children[i], precise);
    }
    return this;
  }
  containsPoint(point) {
    return point.x < this.min.x || point.x > this.max.x || point.y < this.min.y || point.y > this.max.y || point.z < this.min.z || point.z > this.max.z ? false : true;
  }
  containsBox(box) {
    return this.min.x <= box.min.x && box.max.x <= this.max.x && this.min.y <= box.min.y && box.max.y <= this.max.y && this.min.z <= box.min.z && box.max.z <= this.max.z;
  }
  getParameter(point, target) {
    return target.set((point.x - this.min.x) / (this.max.x - this.min.x), (point.y - this.min.y) / (this.max.y - this.min.y), (point.z - this.min.z) / (this.max.z - this.min.z));
  }
  intersectsBox(box) {
    return box.max.x < this.min.x || box.min.x > this.max.x || box.max.y < this.min.y || box.min.y > this.max.y || box.max.z < this.min.z || box.min.z > this.max.z ? false : true;
  }
  intersectsSphere(sphere) {
    this.clampPoint(sphere.center, _vector$1);
    return _vector$1.distanceToSquared(sphere.center) <= sphere.radius * sphere.radius;
  }
  intersectsPlane(plane) {
    let min2, max2;
    if (plane.normal.x > 0) {
      min2 = plane.normal.x * this.min.x;
      max2 = plane.normal.x * this.max.x;
    } else {
      min2 = plane.normal.x * this.max.x;
      max2 = plane.normal.x * this.min.x;
    }
    if (plane.normal.y > 0) {
      min2 += plane.normal.y * this.min.y;
      max2 += plane.normal.y * this.max.y;
    } else {
      min2 += plane.normal.y * this.max.y;
      max2 += plane.normal.y * this.min.y;
    }
    if (plane.normal.z > 0) {
      min2 += plane.normal.z * this.min.z;
      max2 += plane.normal.z * this.max.z;
    } else {
      min2 += plane.normal.z * this.max.z;
      max2 += plane.normal.z * this.min.z;
    }
    return min2 <= -plane.constant && max2 >= -plane.constant;
  }
  intersectsTriangle(triangle) {
    if (this.isEmpty()) {
      return false;
    }
    this.getCenter(_center);
    _extents.subVectors(this.max, _center);
    _v0.subVectors(triangle.a, _center);
    _v1.subVectors(triangle.b, _center);
    _v2.subVectors(triangle.c, _center);
    _f0.subVectors(_v1, _v0);
    _f1.subVectors(_v2, _v1);
    _f2.subVectors(_v0, _v2);
    let axes = [
      0,
      -_f0.z,
      _f0.y,
      0,
      -_f1.z,
      _f1.y,
      0,
      -_f2.z,
      _f2.y,
      _f0.z,
      0,
      -_f0.x,
      _f1.z,
      0,
      -_f1.x,
      _f2.z,
      0,
      -_f2.x,
      -_f0.y,
      _f0.x,
      0,
      -_f1.y,
      _f1.x,
      0,
      -_f2.y,
      _f2.x,
      0
    ];
    if (!satForAxes(axes, _v0, _v1, _v2, _extents)) {
      return false;
    }
    axes = [1, 0, 0, 0, 1, 0, 0, 0, 1];
    if (!satForAxes(axes, _v0, _v1, _v2, _extents)) {
      return false;
    }
    _triangleNormal.crossVectors(_f0, _f1);
    axes = [_triangleNormal.x, _triangleNormal.y, _triangleNormal.z];
    return satForAxes(axes, _v0, _v1, _v2, _extents);
  }
  clampPoint(point, target) {
    return target.copy(point).clamp(this.min, this.max);
  }
  distanceToPoint(point) {
    const clampedPoint = _vector$1.copy(point).clamp(this.min, this.max);
    return clampedPoint.sub(point).length();
  }
  getBoundingSphere(target) {
    this.getCenter(target.center);
    target.radius = this.getSize(_vector$1).length() * 0.5;
    return target;
  }
  intersect(box) {
    this.min.max(box.min);
    this.max.min(box.max);
    if (this.isEmpty())
      this.makeEmpty();
    return this;
  }
  union(box) {
    this.min.min(box.min);
    this.max.max(box.max);
    return this;
  }
  applyMatrix4(matrix) {
    if (this.isEmpty())
      return this;
    _points[0].set(this.min.x, this.min.y, this.min.z).applyMatrix4(matrix);
    _points[1].set(this.min.x, this.min.y, this.max.z).applyMatrix4(matrix);
    _points[2].set(this.min.x, this.max.y, this.min.z).applyMatrix4(matrix);
    _points[3].set(this.min.x, this.max.y, this.max.z).applyMatrix4(matrix);
    _points[4].set(this.max.x, this.min.y, this.min.z).applyMatrix4(matrix);
    _points[5].set(this.max.x, this.min.y, this.max.z).applyMatrix4(matrix);
    _points[6].set(this.max.x, this.max.y, this.min.z).applyMatrix4(matrix);
    _points[7].set(this.max.x, this.max.y, this.max.z).applyMatrix4(matrix);
    this.setFromPoints(_points);
    return this;
  }
  translate(offset) {
    this.min.add(offset);
    this.max.add(offset);
    return this;
  }
  equals(box) {
    return box.min.equals(this.min) && box.max.equals(this.max);
  }
}
Box3.prototype.isBox3 = true;
const _points = [
  /* @__PURE__ */ new Vector3(),
  /* @__PURE__ */ new Vector3(),
  /* @__PURE__ */ new Vector3(),
  /* @__PURE__ */ new Vector3(),
  /* @__PURE__ */ new Vector3(),
  /* @__PURE__ */ new Vector3(),
  /* @__PURE__ */ new Vector3(),
  /* @__PURE__ */ new Vector3()
];
const _vector$1 = /* @__PURE__ */ new Vector3();
const _box = /* @__PURE__ */ new Box3();
const _v0 = /* @__PURE__ */ new Vector3();
const _v1 = /* @__PURE__ */ new Vector3();
const _v2 = /* @__PURE__ */ new Vector3();
const _f0 = /* @__PURE__ */ new Vector3();
const _f1 = /* @__PURE__ */ new Vector3();
const _f2 = /* @__PURE__ */ new Vector3();
const _center = /* @__PURE__ */ new Vector3();
const _extents = /* @__PURE__ */ new Vector3();
const _triangleNormal = /* @__PURE__ */ new Vector3();
const _testAxis = /* @__PURE__ */ new Vector3();
function satForAxes(axes, v0, v1, v2, extents) {
  for (let i = 0, j = axes.length - 3; i <= j; i += 3) {
    _testAxis.fromArray(axes, i);
    const r = extents.x * Math.abs(_testAxis.x) + extents.y * Math.abs(_testAxis.y) + extents.z * Math.abs(_testAxis.z);
    const p0 = v0.dot(_testAxis);
    const p1 = v1.dot(_testAxis);
    const p2 = v2.dot(_testAxis);
    if (Math.max(-Math.max(p0, p1, p2), Math.min(p0, p1, p2)) > r) {
      return false;
    }
  }
  return true;
}
const _vector = /* @__PURE__ */ new Vector3();
const _segCenter = /* @__PURE__ */ new Vector3();
const _segDir = /* @__PURE__ */ new Vector3();
const _diff = /* @__PURE__ */ new Vector3();
const _edge1 = /* @__PURE__ */ new Vector3();
const _edge2 = /* @__PURE__ */ new Vector3();
const _normal = /* @__PURE__ */ new Vector3();
class Ray {
  constructor(origin = new Vector3(), direction = new Vector3(0, 0, -1)) {
    this.origin = origin;
    this.direction = direction;
  }
  set(origin, direction) {
    this.origin.copy(origin);
    this.direction.copy(direction);
    return this;
  }
  copy(ray) {
    this.origin.copy(ray.origin);
    this.direction.copy(ray.direction);
    return this;
  }
  at(t, target) {
    return target.copy(this.direction).multiplyScalar(t).add(this.origin);
  }
  lookAt(v) {
    this.direction.copy(v).sub(this.origin).normalize();
    return this;
  }
  recast(t) {
    this.origin.copy(this.at(t, _vector));
    return this;
  }
  closestPointToPoint(point, target) {
    target.subVectors(point, this.origin);
    const directionDistance = target.dot(this.direction);
    if (directionDistance < 0) {
      return target.copy(this.origin);
    }
    return target.copy(this.direction).multiplyScalar(directionDistance).add(this.origin);
  }
  distanceToPoint(point) {
    return Math.sqrt(this.distanceSqToPoint(point));
  }
  distanceSqToPoint(point) {
    const directionDistance = _vector.subVectors(point, this.origin).dot(this.direction);
    if (directionDistance < 0) {
      return this.origin.distanceToSquared(point);
    }
    _vector.copy(this.direction).multiplyScalar(directionDistance).add(this.origin);
    return _vector.distanceToSquared(point);
  }
  distanceSqToSegment(v0, v1, optionalPointOnRay, optionalPointOnSegment) {
    _segCenter.copy(v0).add(v1).multiplyScalar(0.5);
    _segDir.copy(v1).sub(v0).normalize();
    _diff.copy(this.origin).sub(_segCenter);
    const segExtent = v0.distanceTo(v1) * 0.5;
    const a01 = -this.direction.dot(_segDir);
    const b0 = _diff.dot(this.direction);
    const b1 = -_diff.dot(_segDir);
    const c2 = _diff.lengthSq();
    const det = Math.abs(1 - a01 * a01);
    let s0, s1, sqrDist, extDet;
    if (det > 0) {
      s0 = a01 * b1 - b0;
      s1 = a01 * b0 - b1;
      extDet = segExtent * det;
      if (s0 >= 0) {
        if (s1 >= -extDet) {
          if (s1 <= extDet) {
            const invDet = 1 / det;
            s0 *= invDet;
            s1 *= invDet;
            sqrDist = s0 * (s0 + a01 * s1 + 2 * b0) + s1 * (a01 * s0 + s1 + 2 * b1) + c2;
          } else {
            s1 = segExtent;
            s0 = Math.max(0, -(a01 * s1 + b0));
            sqrDist = -s0 * s0 + s1 * (s1 + 2 * b1) + c2;
          }
        } else {
          s1 = -segExtent;
          s0 = Math.max(0, -(a01 * s1 + b0));
          sqrDist = -s0 * s0 + s1 * (s1 + 2 * b1) + c2;
        }
      } else {
        if (s1 <= -extDet) {
          s0 = Math.max(0, -(-a01 * segExtent + b0));
          s1 = s0 > 0 ? -segExtent : Math.min(Math.max(-segExtent, -b1), segExtent);
          sqrDist = -s0 * s0 + s1 * (s1 + 2 * b1) + c2;
        } else if (s1 <= extDet) {
          s0 = 0;
          s1 = Math.min(Math.max(-segExtent, -b1), segExtent);
          sqrDist = s1 * (s1 + 2 * b1) + c2;
        } else {
          s0 = Math.max(0, -(a01 * segExtent + b0));
          s1 = s0 > 0 ? segExtent : Math.min(Math.max(-segExtent, -b1), segExtent);
          sqrDist = -s0 * s0 + s1 * (s1 + 2 * b1) + c2;
        }
      }
    } else {
      s1 = a01 > 0 ? -segExtent : segExtent;
      s0 = Math.max(0, -(a01 * s1 + b0));
      sqrDist = -s0 * s0 + s1 * (s1 + 2 * b1) + c2;
    }
    if (optionalPointOnRay) {
      optionalPointOnRay.copy(this.direction).multiplyScalar(s0).add(this.origin);
    }
    if (optionalPointOnSegment) {
      optionalPointOnSegment.copy(_segDir).multiplyScalar(s1).add(_segCenter);
    }
    return sqrDist;
  }
  intersectSphere(sphere, target) {
    _vector.subVectors(sphere.center, this.origin);
    const tca = _vector.dot(this.direction);
    const d2 = _vector.dot(_vector) - tca * tca;
    const radius2 = sphere.radius * sphere.radius;
    if (d2 > radius2)
      return null;
    const thc = Math.sqrt(radius2 - d2);
    const t0 = tca - thc;
    const t1 = tca + thc;
    if (t0 < 0 && t1 < 0)
      return null;
    if (t0 < 0)
      return this.at(t1, target);
    return this.at(t0, target);
  }
  intersectsSphere(sphere) {
    return this.distanceSqToPoint(sphere.center) <= sphere.radius * sphere.radius;
  }
  distanceToPlane(plane) {
    const denominator = plane.normal.dot(this.direction);
    if (denominator === 0) {
      if (plane.distanceToPoint(this.origin) === 0) {
        return 0;
      }
      return null;
    }
    const t = -(this.origin.dot(plane.normal) + plane.constant) / denominator;
    return t >= 0 ? t : null;
  }
  intersectPlane(plane, target) {
    const t = this.distanceToPlane(plane);
    if (t === null) {
      return null;
    }
    return this.at(t, target);
  }
  intersectsPlane(plane) {
    const distToPoint = plane.distanceToPoint(this.origin);
    if (distToPoint === 0) {
      return true;
    }
    const denominator = plane.normal.dot(this.direction);
    if (denominator * distToPoint < 0) {
      return true;
    }
    return false;
  }
  intersectBox(box, target) {
    let tmin, tmax, tymin, tymax, tzmin, tzmax;
    const invdirx = 1 / this.direction.x, invdiry = 1 / this.direction.y, invdirz = 1 / this.direction.z;
    const origin = this.origin;
    if (invdirx >= 0) {
      tmin = (box.min.x - origin.x) * invdirx;
      tmax = (box.max.x - origin.x) * invdirx;
    } else {
      tmin = (box.max.x - origin.x) * invdirx;
      tmax = (box.min.x - origin.x) * invdirx;
    }
    if (invdiry >= 0) {
      tymin = (box.min.y - origin.y) * invdiry;
      tymax = (box.max.y - origin.y) * invdiry;
    } else {
      tymin = (box.max.y - origin.y) * invdiry;
      tymax = (box.min.y - origin.y) * invdiry;
    }
    if (tmin > tymax || tymin > tmax)
      return null;
    if (tymin > tmin || tmin !== tmin)
      tmin = tymin;
    if (tymax < tmax || tmax !== tmax)
      tmax = tymax;
    if (invdirz >= 0) {
      tzmin = (box.min.z - origin.z) * invdirz;
      tzmax = (box.max.z - origin.z) * invdirz;
    } else {
      tzmin = (box.max.z - origin.z) * invdirz;
      tzmax = (box.min.z - origin.z) * invdirz;
    }
    if (tmin > tzmax || tzmin > tmax)
      return null;
    if (tzmin > tmin || tmin !== tmin)
      tmin = tzmin;
    if (tzmax < tmax || tmax !== tmax)
      tmax = tzmax;
    if (tmax < 0)
      return null;
    return this.at(tmin >= 0 ? tmin : tmax, target);
  }
  intersectsBox(box) {
    return this.intersectBox(box, _vector) !== null;
  }
  intersectTriangle(a2, b2, c2, backfaceCulling, target) {
    _edge1.subVectors(b2, a2);
    _edge2.subVectors(c2, a2);
    _normal.crossVectors(_edge1, _edge2);
    let DdN = this.direction.dot(_normal);
    let sign2;
    if (DdN > 0) {
      if (backfaceCulling)
        return null;
      sign2 = 1;
    } else if (DdN < 0) {
      sign2 = -1;
      DdN = -DdN;
    } else {
      return null;
    }
    _diff.subVectors(this.origin, a2);
    const DdQxE2 = sign2 * this.direction.dot(_edge2.crossVectors(_diff, _edge2));
    if (DdQxE2 < 0) {
      return null;
    }
    const DdE1xQ = sign2 * this.direction.dot(_edge1.cross(_diff));
    if (DdE1xQ < 0) {
      return null;
    }
    if (DdQxE2 + DdE1xQ > DdN) {
      return null;
    }
    const QdN = -sign2 * _diff.dot(_normal);
    if (QdN < 0) {
      return null;
    }
    return this.at(QdN / DdN, target);
  }
  applyMatrix4(matrix4) {
    this.origin.applyMatrix4(matrix4);
    this.direction.transformDirection(matrix4);
    return this;
  }
  equals(ray) {
    return ray.origin.equals(this.origin) && ray.direction.equals(this.direction);
  }
  clone() {
    return new this.constructor().copy(this);
  }
}
const _startP = /* @__PURE__ */ new Vector3();
const _startEnd = /* @__PURE__ */ new Vector3();
class Line3 {
  constructor(start = new Vector3(), end = new Vector3()) {
    this.start = start;
    this.end = end;
  }
  set(start, end) {
    this.start.copy(start);
    this.end.copy(end);
    return this;
  }
  copy(line) {
    this.start.copy(line.start);
    this.end.copy(line.end);
    return this;
  }
  getCenter(target) {
    return target.addVectors(this.start, this.end).multiplyScalar(0.5);
  }
  delta(target) {
    return target.subVectors(this.end, this.start);
  }
  distanceSq() {
    return this.start.distanceToSquared(this.end);
  }
  distance() {
    return this.start.distanceTo(this.end);
  }
  at(t, target) {
    return this.delta(target).multiplyScalar(t).add(this.start);
  }
  closestPointToPointParameter(point, clampToLine) {
    _startP.subVectors(point, this.start);
    _startEnd.subVectors(this.end, this.start);
    const startEnd2 = _startEnd.dot(_startEnd);
    const startEnd_startP = _startEnd.dot(_startP);
    let t = startEnd_startP / startEnd2;
    if (clampToLine) {
      t = clamp(t, 0, 1);
    }
    return t;
  }
  closestPointToPoint(point, clampToLine, target) {
    const t = this.closestPointToPointParameter(point, clampToLine);
    return this.delta(target).multiplyScalar(t).add(this.start);
  }
  applyMatrix4(matrix) {
    this.start.applyMatrix4(matrix);
    this.end.applyMatrix4(matrix);
    return this;
  }
  equals(line) {
    return line.start.equals(this.start) && line.end.equals(this.end);
  }
  clone() {
    return new this.constructor().copy(this);
  }
}
class Matrix3 {
  constructor() {
    this.elements = [
      1,
      0,
      0,
      0,
      1,
      0,
      0,
      0,
      1
    ];
    if (arguments.length > 0) {
      console.error("THREE.Matrix3: the constructor no longer reads arguments. use .set() instead.");
    }
  }
  set(n11, n12, n13, n21, n22, n23, n31, n32, n33) {
    const te = this.elements;
    te[0] = n11;
    te[1] = n21;
    te[2] = n31;
    te[3] = n12;
    te[4] = n22;
    te[5] = n32;
    te[6] = n13;
    te[7] = n23;
    te[8] = n33;
    return this;
  }
  identity() {
    this.set(1, 0, 0, 0, 1, 0, 0, 0, 1);
    return this;
  }
  copy(m) {
    const te = this.elements;
    const me = m.elements;
    te[0] = me[0];
    te[1] = me[1];
    te[2] = me[2];
    te[3] = me[3];
    te[4] = me[4];
    te[5] = me[5];
    te[6] = me[6];
    te[7] = me[7];
    te[8] = me[8];
    return this;
  }
  extractBasis(xAxis, yAxis, zAxis) {
    xAxis.setFromMatrix3Column(this, 0);
    yAxis.setFromMatrix3Column(this, 1);
    zAxis.setFromMatrix3Column(this, 2);
    return this;
  }
  setFromMatrix4(m) {
    const me = m.elements;
    this.set(me[0], me[4], me[8], me[1], me[5], me[9], me[2], me[6], me[10]);
    return this;
  }
  multiply(m) {
    return this.multiplyMatrices(this, m);
  }
  premultiply(m) {
    return this.multiplyMatrices(m, this);
  }
  multiplyMatrices(a2, b2) {
    const ae = a2.elements;
    const be = b2.elements;
    const te = this.elements;
    const a11 = ae[0], a12 = ae[3], a13 = ae[6];
    const a21 = ae[1], a22 = ae[4], a23 = ae[7];
    const a31 = ae[2], a32 = ae[5], a33 = ae[8];
    const b11 = be[0], b12 = be[3], b13 = be[6];
    const b21 = be[1], b22 = be[4], b23 = be[7];
    const b31 = be[2], b32 = be[5], b33 = be[8];
    te[0] = a11 * b11 + a12 * b21 + a13 * b31;
    te[3] = a11 * b12 + a12 * b22 + a13 * b32;
    te[6] = a11 * b13 + a12 * b23 + a13 * b33;
    te[1] = a21 * b11 + a22 * b21 + a23 * b31;
    te[4] = a21 * b12 + a22 * b22 + a23 * b32;
    te[7] = a21 * b13 + a22 * b23 + a23 * b33;
    te[2] = a31 * b11 + a32 * b21 + a33 * b31;
    te[5] = a31 * b12 + a32 * b22 + a33 * b32;
    te[8] = a31 * b13 + a32 * b23 + a33 * b33;
    return this;
  }
  multiplyScalar(s) {
    const te = this.elements;
    te[0] *= s;
    te[3] *= s;
    te[6] *= s;
    te[1] *= s;
    te[4] *= s;
    te[7] *= s;
    te[2] *= s;
    te[5] *= s;
    te[8] *= s;
    return this;
  }
  determinant() {
    const te = this.elements;
    const a2 = te[0], b2 = te[1], c2 = te[2], d = te[3], e = te[4], f = te[5], g = te[6], h = te[7], i = te[8];
    return a2 * e * i - a2 * f * h - b2 * d * i + b2 * f * g + c2 * d * h - c2 * e * g;
  }
  invert() {
    const te = this.elements, n11 = te[0], n21 = te[1], n31 = te[2], n12 = te[3], n22 = te[4], n32 = te[5], n13 = te[6], n23 = te[7], n33 = te[8], t11 = n33 * n22 - n32 * n23, t12 = n32 * n13 - n33 * n12, t13 = n23 * n12 - n22 * n13, det = n11 * t11 + n21 * t12 + n31 * t13;
    if (det === 0)
      return this.set(0, 0, 0, 0, 0, 0, 0, 0, 0);
    const detInv = 1 / det;
    te[0] = t11 * detInv;
    te[1] = (n31 * n23 - n33 * n21) * detInv;
    te[2] = (n32 * n21 - n31 * n22) * detInv;
    te[3] = t12 * detInv;
    te[4] = (n33 * n11 - n31 * n13) * detInv;
    te[5] = (n31 * n12 - n32 * n11) * detInv;
    te[6] = t13 * detInv;
    te[7] = (n21 * n13 - n23 * n11) * detInv;
    te[8] = (n22 * n11 - n21 * n12) * detInv;
    return this;
  }
  transpose() {
    let tmp;
    const m = this.elements;
    tmp = m[1];
    m[1] = m[3];
    m[3] = tmp;
    tmp = m[2];
    m[2] = m[6];
    m[6] = tmp;
    tmp = m[5];
    m[5] = m[7];
    m[7] = tmp;
    return this;
  }
  getNormalMatrix(matrix4) {
    return this.setFromMatrix4(matrix4).invert().transpose();
  }
  transposeIntoArray(r) {
    const m = this.elements;
    r[0] = m[0];
    r[1] = m[3];
    r[2] = m[6];
    r[3] = m[1];
    r[4] = m[4];
    r[5] = m[7];
    r[6] = m[2];
    r[7] = m[5];
    r[8] = m[8];
    return this;
  }
  setUvTransform(tx, ty, sx, sy, rotation, cx, cy) {
    const c2 = Math.cos(rotation);
    const s = Math.sin(rotation);
    this.set(sx * c2, sx * s, -sx * (c2 * cx + s * cy) + cx + tx, -sy * s, sy * c2, -sy * (-s * cx + c2 * cy) + cy + ty, 0, 0, 1);
    return this;
  }
  scale(sx, sy) {
    const te = this.elements;
    te[0] *= sx;
    te[3] *= sx;
    te[6] *= sx;
    te[1] *= sy;
    te[4] *= sy;
    te[7] *= sy;
    return this;
  }
  rotate(theta) {
    const c2 = Math.cos(theta);
    const s = Math.sin(theta);
    const te = this.elements;
    const a11 = te[0], a12 = te[3], a13 = te[6];
    const a21 = te[1], a22 = te[4], a23 = te[7];
    te[0] = c2 * a11 + s * a21;
    te[3] = c2 * a12 + s * a22;
    te[6] = c2 * a13 + s * a23;
    te[1] = -s * a11 + c2 * a21;
    te[4] = -s * a12 + c2 * a22;
    te[7] = -s * a13 + c2 * a23;
    return this;
  }
  translate(tx, ty) {
    const te = this.elements;
    te[0] += tx * te[2];
    te[3] += tx * te[5];
    te[6] += tx * te[8];
    te[1] += ty * te[2];
    te[4] += ty * te[5];
    te[7] += ty * te[8];
    return this;
  }
  equals(matrix) {
    const te = this.elements;
    const me = matrix.elements;
    for (let i = 0; i < 9; i++) {
      if (te[i] !== me[i])
        return false;
    }
    return true;
  }
  fromArray(array, offset = 0) {
    for (let i = 0; i < 9; i++) {
      this.elements[i] = array[i + offset];
    }
    return this;
  }
  toArray(array = [], offset = 0) {
    const te = this.elements;
    array[offset] = te[0];
    array[offset + 1] = te[1];
    array[offset + 2] = te[2];
    array[offset + 3] = te[3];
    array[offset + 4] = te[4];
    array[offset + 5] = te[5];
    array[offset + 6] = te[6];
    array[offset + 7] = te[7];
    array[offset + 8] = te[8];
    return array;
  }
  clone() {
    return new this.constructor().fromArray(this.elements);
  }
}
Matrix3.prototype.isMatrix3 = true;
const _vector1 = /* @__PURE__ */ new Vector3();
const _vector2 = /* @__PURE__ */ new Vector3();
const _normalMatrix = /* @__PURE__ */ new Matrix3();
class Plane {
  constructor(normal = new Vector3(1, 0, 0), constant = 0) {
    this.normal = normal;
    this.constant = constant;
  }
  set(normal, constant) {
    this.normal.copy(normal);
    this.constant = constant;
    return this;
  }
  setComponents(x, y, z, w) {
    this.normal.set(x, y, z);
    this.constant = w;
    return this;
  }
  setFromNormalAndCoplanarPoint(normal, point) {
    this.normal.copy(normal);
    this.constant = -point.dot(this.normal);
    return this;
  }
  setFromCoplanarPoints(a2, b2, c2) {
    const normal = _vector1.subVectors(c2, b2).cross(_vector2.subVectors(a2, b2)).normalize();
    this.setFromNormalAndCoplanarPoint(normal, a2);
    return this;
  }
  copy(plane) {
    this.normal.copy(plane.normal);
    this.constant = plane.constant;
    return this;
  }
  normalize() {
    const inverseNormalLength = 1 / this.normal.length();
    this.normal.multiplyScalar(inverseNormalLength);
    this.constant *= inverseNormalLength;
    return this;
  }
  negate() {
    this.constant *= -1;
    this.normal.negate();
    return this;
  }
  distanceToPoint(point) {
    return this.normal.dot(point) + this.constant;
  }
  distanceToSphere(sphere) {
    return this.distanceToPoint(sphere.center) - sphere.radius;
  }
  projectPoint(point, target) {
    return target.copy(this.normal).multiplyScalar(-this.distanceToPoint(point)).add(point);
  }
  intersectLine(line, target) {
    const direction = line.delta(_vector1);
    const denominator = this.normal.dot(direction);
    if (denominator === 0) {
      if (this.distanceToPoint(line.start) === 0) {
        return target.copy(line.start);
      }
      return null;
    }
    const t = -(line.start.dot(this.normal) + this.constant) / denominator;
    if (t < 0 || t > 1) {
      return null;
    }
    return target.copy(direction).multiplyScalar(t).add(line.start);
  }
  intersectsLine(line) {
    const startSign = this.distanceToPoint(line.start);
    const endSign = this.distanceToPoint(line.end);
    return startSign < 0 && endSign > 0 || endSign < 0 && startSign > 0;
  }
  intersectsBox(box) {
    return box.intersectsPlane(this);
  }
  intersectsSphere(sphere) {
    return sphere.intersectsPlane(this);
  }
  coplanarPoint(target) {
    return target.copy(this.normal).multiplyScalar(-this.constant);
  }
  applyMatrix4(matrix, optionalNormalMatrix) {
    const normalMatrix = optionalNormalMatrix || _normalMatrix.getNormalMatrix(matrix);
    const referencePoint = this.coplanarPoint(_vector1).applyMatrix4(matrix);
    const normal = this.normal.applyMatrix3(normalMatrix).normalize();
    this.constant = -referencePoint.dot(normal);
    return this;
  }
  translate(offset) {
    this.constant -= offset.dot(this.normal);
    return this;
  }
  equals(plane) {
    return plane.normal.equals(this.normal) && plane.constant === this.constant;
  }
  clone() {
    return new this.constructor().copy(this);
  }
}
Plane.prototype.isPlane = true;
const V_00 = Object.freeze(new Vector2(0, 0));
const V_11 = Object.freeze(new Vector2(1, 1));
const V_000 = Object.freeze(new Vector3(0, 0, 0));
const V_100 = Object.freeze(new Vector3(1, 0, 0));
const V_010 = Object.freeze(new Vector3(0, 1, 0));
const V_001 = Object.freeze(new Vector3(0, 0, 1));
const V_111 = Object.freeze(new Vector3(1, 1, 1));
const Q_IDENTITY = Object.freeze(new Quaternion());
const DIRECTION = {
  RIGHT: Object.freeze(new Vector3(1, 0, 0)),
  UP: Object.freeze(new Vector3(0, 1, 0)),
  NEAR: Object.freeze(new Vector3(0, 0, 1)),
  LEFT: Object.freeze(new Vector3(-1, 0, 0)),
  DOWN: Object.freeze(new Vector3(0, -1, 0)),
  FAR: Object.freeze(new Vector3(0, 0, -1))
};
function computeRelativeDifference(start, end) {
  if (typeof start === "number")
    return computedRelativeDifferenceNumber(start, end);
  if ("isVector3" in start)
    return computedRelativeDifferenceVector3(start, end);
  if ("isVector2" in start)
    return computedRelativeDifferenceVector2(start, end);
  if ("isBox3" in start)
    return computedRelativeDifferenceBox3(start, end);
  if ("isQuaternion" in start)
    return computedRelativeDifferenceQuaternion(start, end);
  if ("isColor" in start)
    return computedRelativeDifferenceColor(start, end);
  return Infinity;
}
function computedRelativeDifferenceNumber(s, e) {
  if (e === s)
    return 0;
  const distance = Math.abs(e - s);
  const avgAbsoluteValue = (Math.abs(e) + Math.abs(s)) / 2;
  return distance / avgAbsoluteValue;
}
function computedRelativeDifferenceVector3(s, e) {
  if (e.equals(s))
    return 0;
  const distance = e.distanceTo(s);
  const avgMagnitude = (e.length() + s.length()) / 2;
  return distance / avgMagnitude;
}
function computedRelativeDifferenceVector2(s, e) {
  if (e.equals(s))
    return 0;
  const distance = e.distanceTo(s);
  const avgMagnitude = (e.length() + s.length()) / 2;
  return distance / avgMagnitude;
}
function computedRelativeDifferenceBox3(s, e) {
  if (s.equals(e))
    return 0;
  const v = scratchV3;
  const minDist = e.min.distanceTo(s.min);
  const maxDist = e.max.distanceTo(s.max);
  const avgDistance = (minDist + maxDist) / 2;
  const avgSizeMagnitude = (e.getSize(v).length() + s.getSize(v).length()) / 2;
  return avgDistance / avgSizeMagnitude;
}
const scratchV3 = new Vector3();
function computedRelativeDifferenceQuaternion(s, e) {
  if (s.equals(e))
    return 0;
  return s.angleTo(e) / Math.PI;
}
function computedRelativeDifferenceColor(s, e) {
  if (s.equals(e))
    return 0;
  const v = scratchV3;
  const distance = v.set(Math.abs(e.r - s.r), Math.abs(e.g - s.g), Math.abs(e.b - s.b)).length();
  return distance / sqrt3;
}
const sqrt3 = Math.sqrt(3);
const gaussian = (standardDeviation = 1) => {
  var u = Math.random();
  return (u % 1e-8 > 5e-9 ? 1 : -1) * Math.sqrt(-Math.log(Math.max(1e-9, u))) * standardDeviation;
};
const levy = (scale = 1) => {
  const stdDeviation = Math.sqrt(Math.sqrt(1 / (2 * scale)));
  return 1 / gaussian(stdDeviation) ** 2;
};
const randomQuaternion = (() => {
  const _2PI = Math.PI * 2;
  const V_0012 = new Vector3(0, 0, 1);
  const twist = new Quaternion();
  const swing = new Quaternion();
  const swingAxis = new Vector3();
  const out = new Quaternion();
  return function randomQuaternion2(twistScale = 1, swingScale = 1) {
    var twistMagnitude = (Math.random() - 0.5) * _2PI * twistScale;
    var swingDirection = Math.random() * _2PI;
    var swingMagnitude = Math.random() * Math.PI * swingScale;
    swingAxis.set(1, 0, 0).applyAxisAngle(V_0012, swingDirection);
    twist.setFromAxisAngle(V_0012, twistMagnitude);
    swing.setFromAxisAngle(swingAxis, swingMagnitude);
    return out.multiplyQuaternions(swing, twist);
  };
})();
function randomSelect(arr, weights) {
  let total = 0;
  for (let i = 0; i < arr.length; i++) {
    total += (weights == null ? void 0 : weights[i]) || 1;
  }
  const threshold = Math.random() * total;
  total = 0;
  for (let i = 0; i < arr.length; i++) {
    total += (weights == null ? void 0 : weights[i]) || 1;
    if (total > threshold)
      return arr[i];
  }
  return arr[0];
}
const extractRotationAboutAxis = (() => {
  const vec = new Vector3();
  return function extractRotationAboutAxis2(rot, direction, out) {
    const rotAxis = vec.set(rot.x, rot.y, rot.z);
    const dotProd = direction.dot(rotAxis);
    const projection = vec.copy(direction).multiplyScalar(dotProd);
    const twist = out.set(projection.x, projection.y, projection.z, rot.w).normalize();
    if (dotProd < 0) {
      twist.x = -twist.x;
      twist.y = -twist.y;
      twist.z = -twist.z;
      twist.w = -twist.w;
    }
    return twist;
  };
})();
class MemoizationCache {
  constructor() {
    __publicField(this, "callbacks", []);
  }
  memoize(cb2, ...caches) {
    caches.push(this);
    const memoized = memoize$1(cb2);
    for (const cache of caches) {
      cache.callbacks.push(memoized);
    }
    return memoized;
  }
  invalidateAll() {
    const callbacks = this.callbacks;
    for (let i = 0; i < this.callbacks.length; i++) {
      callbacks[i].needsUpdate = true;
    }
  }
  isFullyInvalid() {
    const callbacks = this.callbacks;
    for (let i = 0; i < this.callbacks.length; i++) {
      if (!callbacks[i].needsUpdate)
        return false;
    }
    return true;
  }
}
const UNSET = void 0;
function memoize$1(cb2) {
  let value = UNSET;
  const wrapped = () => {
    if (wrapped.needsUpdate) {
      wrapped.needsUpdate = false;
      value = cb2();
    }
    if (value === UNSET) {
      throw new Error("Possible recursive memoization detected");
    }
    return value;
  };
  wrapped.needsUpdate = true;
  return wrapped;
}
const InternalCurrentState = Symbol("current");
const InternalTargetState = Symbol("target");
const InternalPreviousTargetState = Symbol("previousTarget");
class NodeStateBase {
  constructor(mode, metrics) {
    this.mode = mode;
    this.metrics = metrics;
  }
}
const _NodeState = class extends NodeStateBase {
  constructor(mode, metrics) {
    super(mode, metrics);
    __publicField(this, "_cache", new MemoizationCache());
    __publicField(this, "opacity", 1);
    __publicField(this, "_parent", null);
    __publicField(this, "_localMatrix", new Matrix4());
    __publicField(this, "_worldMatrix", new Matrix4());
    __publicField(this, "_worldMatrixInverse", new Matrix4());
    __publicField(this, "_worldPosition", new Vector3());
    __publicField(this, "_worldOrientation", new Quaternion());
    __publicField(this, "_worldOrientationInverse", new Quaternion());
    __publicField(this, "_worldScale", new Vector3(1, 1, 1));
    __publicField(this, "_worldRotation", new Matrix4());
    __publicField(this, "_worldRotationInverse", new Matrix4());
    __publicField(this, "_relativePosition", new Vector3());
    __publicField(this, "_relativeOrientation", new Quaternion());
    __publicField(this, "_relativeScale", new Vector3(1, 1, 1));
    __publicField(this, "_cachedWorldCenter", this._cache.memoize(() => {
      return this._worldCenter.copy(this.metrics.innerCenter).applyMatrix4(this.worldMatrix);
    }));
    __publicField(this, "_worldCenter", new Vector3());
    __publicField(this, "_cachedSpatialMatrix", this._cache.memoize(() => {
      const worldFromSpatial = this._worldFromSpatial.compose(this.outerOrigin, this.worldOrientation, V_111);
      this._spatialFromWorld.copy(this._worldFromSpatial).invert();
      this._localFromSpatial.multiplyMatrices(this.worldMatrixInverse, worldFromSpatial);
      this._spatialFromLocal.copy(this._localFromSpatial).invert();
      const reference = this.referenceState;
      if (reference) {
        this._spatialFromReference.multiplyMatrices(this._spatialFromWorld, reference.worldMatrix);
      } else {
        this._spatialFromReference.copy(this._spatialFromWorld);
      }
      return worldFromSpatial;
    }));
    __publicField(this, "_worldFromSpatial", new Matrix4());
    __publicField(this, "_spatialFromWorld", new Matrix4());
    __publicField(this, "_localFromSpatial", new Matrix4());
    __publicField(this, "_spatialFromLocal", new Matrix4());
    __publicField(this, "_spatialFromReference", new Matrix4());
    __publicField(this, "_cachedSpatialBounds", this._cache.memoize(() => {
      this._spatialBounds.copy(this.metrics.innerBounds);
      const bounds = this._spatialBounds.applyMatrix4(this.spatialFromLocal);
      bounds.getCenter(this._spatialCenter);
      bounds.getSize(this._spatialSize);
      return bounds;
    }));
    __publicField(this, "_spatialBounds", new Box3());
    __publicField(this, "_spatialSize", new Vector3());
    __publicField(this, "_spatialCenter", new Vector3());
    __publicField(this, "_cachedOuterBounds", this._cache.memoize(() => {
      const bounds = this._outerBounds;
      const adapter = this.metrics.system.nodeAdapters.get(this.metrics.node);
      if (adapter) {
        bounds.copy(adapter.outerBounds[this.mode]);
      } else {
        const referenceState = this.referenceState;
        if (!referenceState)
          bounds.setFromCenterAndSize(V_000, V_000);
        else
          bounds.copy(referenceState.metrics.innerBounds);
        bounds.applyMatrix4(this.spatialFromReference);
      }
      bounds.getCenter(this._outerCenter);
      bounds.getSize(this._outerSize);
      return bounds;
    }));
    __publicField(this, "_outerBounds", new Box3());
    __publicField(this, "_outerCenter", new Vector3());
    __publicField(this, "_outerSize", new Vector3());
    __publicField(this, "_cachedOuterVisualBounds", this._cache.memoize(() => {
      const bounds = this._outerVisualBounds;
      const adapter = this.metrics.system.nodeAdapters.get(this.metrics.node);
      if (adapter) {
        bounds.copy(adapter.outerVisualBounds[this.mode]);
      } else {
        const referenceState = this.referenceState;
        if (!referenceState)
          bounds.setFromCenterAndSize(V_000, V_000);
        else
          bounds.copy(referenceState.visualBounds);
      }
      bounds.getCenter(this._outerVisualCenter);
      bounds.getSize(this._outerVisualSize);
      return bounds;
    }));
    __publicField(this, "_outerVisualBounds", new Box3());
    __publicField(this, "_outerVisualCenter", new Vector3());
    __publicField(this, "_outerVisualSize", new Vector3());
    __publicField(this, "_viewFromWorld", new Matrix4());
    __publicField(this, "_viewFromSpatial", new Matrix4());
    __publicField(this, "_spatialFromView", new Matrix4());
    __publicField(this, "_cachedNDCBounds", this._cache.memoize(() => {
      if (this.metrics.system.viewNode === this.metrics.node) {
        this._ndcBounds.min.setScalar(-1);
        this._ndcBounds.max.setScalar(1);
        return this._ndcBounds;
      }
      const viewFrustum = this.metrics.system.viewFrustum;
      const projection = viewFrustum.perspectiveProjectionMatrix;
      const viewFromWorld = this.viewFromWorld;
      const viewProjectionFromWorld = this._viewProjectionFromWorld.multiplyMatrices(projection, viewFromWorld);
      const bounds = this._ndcBounds.copy(this.metrics.innerBounds).applyMatrix4(viewProjectionFromWorld);
      bounds.getCenter(this._ndcCenter);
      bounds.getSize(this._ndcSize);
      if (!isFinite(bounds.min.x) || !isFinite(bounds.min.y) || !isFinite(bounds.min.z) || !isFinite(bounds.max.x) || !isFinite(bounds.max.y) || !isFinite(bounds.max.z)) {
        bounds.min.setScalar(-1);
        bounds.max.setScalar(1);
        bounds.getCenter(this._ndcCenter);
        bounds.getSize(this._ndcSize);
      }
      return bounds;
    }, this._viewState._cache));
    __publicField(this, "_viewProjectionFromWorld", new Matrix4());
    __publicField(this, "_ndcBounds", new Box3());
    __publicField(this, "_ndcCenter", new Vector3());
    __publicField(this, "_ndcSize", new Vector3());
    __publicField(this, "_cachedVisualBounds", this._cache.memoize(() => {
      const system = this.metrics.system;
      const projection = system.viewFrustum.perspectiveProjectionMatrix;
      const inverseProjection = this._inverseProjection.copy(projection).invert();
      const bounds = this._visualBounds.copy(this.ndcBounds);
      const v = this._v1;
      const nearMeters = v.set(0, 0, bounds.min.z).applyMatrix4(inverseProjection).z;
      const farMeters = v.set(0, 0, bounds.max.z).applyMatrix4(inverseProjection).z;
      bounds.min.z = farMeters;
      bounds.max.z = nearMeters;
      bounds.min.x *= 0.5 * system.viewResolution.x;
      bounds.max.x *= 0.5 * system.viewResolution.x;
      bounds.min.y *= 0.5 * system.viewResolution.y;
      bounds.max.y *= 0.5 * system.viewResolution.y;
      bounds.getCenter(this._visualCenter);
      bounds.getSize(this._visualSize);
      return bounds;
    }, this._viewState._cache));
    __publicField(this, "_visualBounds", new Box3());
    __publicField(this, "_visualCenter", new Vector3());
    __publicField(this, "_visualSize", new Vector3());
    __publicField(this, "_v1", new Vector3());
    __publicField(this, "_inverseProjection", new Matrix4());
    __publicField(this, "_viewPosition", new Vector3());
    __publicField(this, "_cachedViewAlignedOrientation", this._cache.memoize(() => {
      const relativeViewMatrix = this._relativeViewMatrix.multiplyMatrices(this.worldMatrixInverse, this._viewState.worldMatrix);
      const relativeViewRotation = this._relativeViewRotation.extractRotation(relativeViewMatrix);
      const relativeViewOrientation = this._relativeViewOrientation.setFromRotationMatrix(relativeViewRotation);
      const forwardDirection = this._relativeViewForward.set(0, 0, 1).applyQuaternion(relativeViewOrientation);
      const upDirection = this._relativeViewUp.set(0, 1, 0).applyQuaternion(relativeViewOrientation);
      let distForward = Infinity;
      let distUp = Infinity;
      let closestForwardDirection;
      let closestUpDirection;
      let d;
      for (d in DIRECTION) {
        const dir = DIRECTION[d];
        var dist2 = upDirection.distanceToSquared(dir);
        if (dist2 < distUp) {
          distUp = dist2;
          closestUpDirection = dir;
        }
      }
      for (d in DIRECTION) {
        const dir = DIRECTION[d];
        if (dir.x && closestUpDirection.x)
          continue;
        if (dir.y && closestUpDirection.y)
          continue;
        if (dir.z && closestUpDirection.z)
          continue;
        const dist22 = forwardDirection.distanceToSquared(dir);
        if (dist22 < distForward) {
          distForward = dist22;
          closestForwardDirection = dir;
        }
      }
      const rot = this._orthogonalRotation.identity();
      rot.lookAt(closestForwardDirection, V_000, closestUpDirection);
      return this._orthogonalOrientation.setFromRotationMatrix(rot);
    }, this._viewState._cache));
    __publicField(this, "_relativeViewMatrix", new Matrix4());
    __publicField(this, "_relativeViewRotation", new Matrix4());
    __publicField(this, "_relativeViewOrientation", new Quaternion());
    __publicField(this, "_relativeViewUp", new Vector3());
    __publicField(this, "_relativeViewForward", new Vector3());
    __publicField(this, "_orthogonalRotation", new Matrix4());
    __publicField(this, "_orthogonalOrientation", new Quaternion());
    __publicField(this, "_computeOcclusion", this._cache.memoize(() => {
      this._occludingPercent = 0;
      this._occludedPercent = 0;
      const metrics = this.metrics;
      if (metrics.innerBounds.isEmpty())
        return;
      const system = metrics.system;
      const adapters = system.nodeAdapters.values();
      const myBounds = this.visualBounds;
      const myNear = myBounds.min.z;
      const a2 = _NodeState._boxA;
      const b2 = _NodeState._boxB;
      a2.min.set(myBounds.min.x, myBounds.min.y);
      a2.min.set(myBounds.max.x, myBounds.max.y);
      const myLength = a2.getSize(_NodeState._sizeA).length();
      for (const adapter of adapters) {
        const otherMetrics = adapter.metrics;
        if (otherMetrics === metrics)
          continue;
        if (!otherMetrics.isAdaptive || otherMetrics.innerBounds.isEmpty())
          continue;
        if (otherMetrics.containedByNode(adapter.node))
          continue;
        const otherState = this.mode === "current" ? otherMetrics.current : otherMetrics.target;
        const otherBounds = otherState.visualBounds;
        a2.min.set(myBounds.min.x, myBounds.min.y);
        a2.min.set(myBounds.max.x, myBounds.max.y);
        b2.min.set(otherBounds.min.x, otherBounds.min.y);
        b2.min.set(otherBounds.max.x, otherBounds.max.y);
        const overlapPercent = a2.intersect(b2).getSize(_NodeState._sizeB).length() / myLength;
        if (overlapPercent > 0) {
          if (myNear < otherBounds.min.z)
            this._occludingPercent += overlapPercent;
          else
            this._occludedPercent += overlapPercent;
        }
      }
    }, this._viewState._cache));
    __publicField(this, "_occludingPercent", 0);
    __publicField(this, "_occludedPercent", 0);
  }
  invalidate() {
    this._cache.invalidateAll();
  }
  get parent() {
    return this._parent;
  }
  set parent(val) {
    const current = this._parent;
    if (current !== val) {
      this._parent = val;
      this.invalidate();
    }
  }
  get parentState() {
    var _a2;
    return (_a2 = this.metrics.parentMetrics) == null ? void 0 : _a2[this.mode];
  }
  get localMatrix() {
    var _a2;
    const parentWorldInverse = (_a2 = this.parentState) == null ? void 0 : _a2.worldMatrixInverse;
    return parentWorldInverse ? this._localMatrix.multiplyMatrices(parentWorldInverse, this.worldMatrix) : this._localMatrix.copy(this.worldMatrix);
  }
  get referenceState() {
    var _a2;
    return (_a2 = this.metrics.referenceMetrics) == null ? void 0 : _a2[this.mode];
  }
  get worldMatrix() {
    return this._worldMatrix;
  }
  set worldMatrix(val) {
    if (isNaN(val.elements[0]) || isNaN(val.elements[15]) || val.elements[0] === 0)
      throw new Error();
    if (!this._worldMatrix.equals(val)) {
      this.invalidate();
      this._worldMatrix.copy(val);
      this._worldMatrixInverse.copy(this._worldMatrix).invert();
      this._worldMatrix.decompose(this._worldPosition, this._worldOrientation, this._worldScale);
      this._worldOrientationInverse.copy(this._worldOrientation).invert();
      this._worldRotation.makeRotationFromQuaternion(this._worldOrientation);
      this._worldRotationInverse.makeRotationFromQuaternion(this._worldOrientationInverse);
    }
  }
  get relativePosition() {
    var _a2;
    const refPosition = (_a2 = this.referenceState) == null ? void 0 : _a2.worldPosition;
    return refPosition ? this._relativePosition.subVectors(this.worldPosition, refPosition) : this._relativePosition.copy(this.worldPosition);
  }
  get relativeOrientation() {
    var _a2;
    const refOrientationInv = (_a2 = this.referenceState) == null ? void 0 : _a2.worldOrientationInverse;
    return refOrientationInv ? this._relativeOrientation.multiplyQuaternions(this.worldOrientation, refOrientationInv) : this._relativeOrientation.copy(this.worldOrientation);
  }
  get relativeScale() {
    var _a2;
    const refScale = (_a2 = this.referenceState) == null ? void 0 : _a2.worldScale;
    return refScale ? this._relativeScale.copy(this.worldScale).divide(refScale) : this._relativeScale.copy(this.worldScale);
  }
  get worldMatrixInverse() {
    return this._worldMatrixInverse;
  }
  get worldPosition() {
    return this._worldPosition;
  }
  get worldOrientation() {
    return this._worldOrientation;
  }
  get worldScale() {
    return this._worldScale;
  }
  get worldOrientationInverse() {
    return this._worldOrientationInverse;
  }
  get worldRotation() {
    return this._worldRotation;
  }
  get worldRotationInverse() {
    return this._worldRotationInverse;
  }
  get worldCenter() {
    return this._cachedWorldCenter();
  }
  get spatialMatrix() {
    return this._cachedSpatialMatrix();
  }
  get spatialMatrixInverse() {
    this.spatialMatrix;
    return this._spatialFromWorld;
  }
  get localFromSpatial() {
    this.spatialMatrix;
    return this._localFromSpatial;
  }
  get spatialFromLocal() {
    this.spatialMatrix;
    return this._spatialFromLocal;
  }
  get spatialFromReference() {
    this.spatialMatrix;
    return this._spatialFromReference;
  }
  get spatialBounds() {
    return this._cachedSpatialBounds();
  }
  get spatialSize() {
    this.spatialBounds;
    return this._spatialSize;
  }
  get spatialCenter() {
    this.spatialBounds;
    return this._spatialCenter;
  }
  get outerBounds() {
    return this._cachedOuterBounds();
  }
  get outerCenter() {
    this.outerBounds;
    return this._outerCenter;
  }
  get outerSize() {
    this.outerBounds;
    return this._outerSize;
  }
  get outerOrigin() {
    return this.metrics.outerOrigin[this.mode]();
  }
  get outerOrientation() {
    var _a2, _b2;
    const adapter = this.metrics.system.nodeAdapters.get(this.metrics.node);
    if (adapter)
      return adapter.outerOrientation[this.mode];
    return (_b2 = (_a2 = this.referenceState) == null ? void 0 : _a2.worldOrientation) != null ? _b2 : Q_IDENTITY;
  }
  get outerVisualBounds() {
    return this._cachedOuterVisualBounds();
  }
  get outerVisualCenter() {
    this.outerVisualBounds;
    return this._outerVisualCenter;
  }
  get outerVisualSize() {
    this.outerVisualBounds;
    return this._outerVisualSize;
  }
  get _viewState() {
    if (this.metrics.system.viewNode === this.metrics.node)
      return this;
    const viewMetrics = this.metrics.system.viewMetrics;
    if (this.mode === "current")
      return viewMetrics[InternalCurrentState];
    return viewMetrics[InternalTargetState];
  }
  get viewFromWorld() {
    return this._viewFromWorld.multiplyMatrices(this._viewState.worldMatrixInverse, this.worldMatrix);
  }
  get viewFromSpatial() {
    return this._viewFromSpatial.multiplyMatrices(this._viewState.worldMatrixInverse, this.spatialMatrix);
  }
  get spatialFromView() {
    return this._spatialFromView.copy(this.viewFromSpatial).invert();
  }
  get ndcBounds() {
    return this._cachedNDCBounds();
  }
  get ndcCenter() {
    this._cachedNDCBounds();
    return this._ndcCenter;
  }
  get ndcSize() {
    this._cachedNDCBounds();
    return this._ndcSize;
  }
  get visualBounds() {
    return this._cachedVisualBounds();
  }
  get visualCenter() {
    this._cachedVisualBounds();
    return this._visualCenter;
  }
  get visualSize() {
    this._cachedVisualBounds();
    return this._visualSize;
  }
  get relativeViewPosition() {
    return this._viewPosition.copy(this._viewState.worldPosition).applyMatrix4(this.worldMatrixInverse);
  }
  get viewAlignedOrientation() {
    return this._cachedViewAlignedOrientation();
  }
  get occludingPercent() {
    this._computeOcclusion();
    return this._occludingPercent;
  }
  get occludedPercent() {
    this._computeOcclusion();
    return this._occludedPercent;
  }
  visualAverageEdgeLength() {
  }
};
let NodeState = _NodeState;
__publicField(NodeState, "_boxA", new Box2());
__publicField(NodeState, "_boxB", new Box2());
__publicField(NodeState, "_sizeA", new Vector2());
__publicField(NodeState, "_sizeB", new Vector2());
class SpatialMetricsBase {
  constructor(system, node) {
    this.system = system;
    this.node = node;
  }
}
class SpatialMetrics extends SpatialMetricsBase {
  constructor(system, node) {
    super(system, node);
    __publicField(this, "_cache", new MemoizationCache());
    __publicField(this, "needsUpdate", true);
    __publicField(this, "parentNode");
    __publicField(this, "parentMetrics");
    __publicField(this, "referenceMetrics");
    __publicField(this, "_adapter");
    __publicField(this, "_cachedInnerBounds", this._cache.memoize(() => {
      const inner = this._innerBounds;
      if (!this.raw.parent) {
        return inner.makeEmpty();
      }
      if (this.node !== this.system.viewNode) {
        inner.copy(this.intrinsicBounds);
        const childBounds = this._childBounds;
        for (const c2 of this.boundingChildMetrics) {
          c2.update();
          childBounds.copy(c2.innerBounds);
          childBounds.applyMatrix4(c2.raw.relativeMatrix);
          inner.union(childBounds);
        }
      }
      const center = inner.getCenter(this._innerCenter);
      const size = inner.getSize(this._innerSize);
      if (size.length() > 0) {
        const sizeEpsillon = this.system.epsillonMeters;
        if (Math.abs(size.x) <= sizeEpsillon)
          size.x = (Math.sign(size.x) || 1) * sizeEpsillon * 1e3;
        if (Math.abs(size.y) <= sizeEpsillon)
          size.y = (Math.sign(size.y) || 1) * sizeEpsillon * 1e3;
        if (Math.abs(size.z) <= sizeEpsillon) {
          size.z = (Math.sign(size.z) || 1) * sizeEpsillon * 1e3;
          center.z -= sizeEpsillon * 1e3 / 2;
        }
        inner.setFromCenterAndSize(center, size);
      }
      return inner;
    }));
    __publicField(this, "_childBounds", new Box3());
    __publicField(this, "_innerBounds", new Box3());
    __publicField(this, "_innerCenter", new Vector3());
    __publicField(this, "_innerSize", new Vector3());
    __publicField(this, "_intrinsicBoundsNeedsUpdate", true);
    __publicField(this, "_intrinsicBounds", new Box3());
    __publicField(this, "_intrinsicCenter", new Vector3());
    __publicField(this, "_intrinsicSize", new Vector3());
    __publicField(this, "_cachedNodeChildren", this._cache.memoize(() => {
      this.system.bindings.getChildren(this, this._nodeChildren);
      return this._nodeChildren;
    }));
    __publicField(this, "_nodeChildren", new Array());
    __publicField(this, "_computeState", (() => {
      const relativeMatrix = new Matrix4();
      const relativeOrientation = new Quaternion();
      const worldMatrix = new Matrix4();
      const worldPosition = new Vector3();
      const worldOrientation = new Quaternion();
      const worldScale = new Vector3();
      const spatialCenter = new Vector3();
      const spatialSize = new Vector3();
      const spatialOffset = new Vector3();
      const innerOffset = new Vector3();
      return function computeState(state) {
        var _a2;
        state.parent = this.raw.parent;
        const adapter = this._adapter;
        const referenceState = (_a2 = this.referenceMetrics) == null ? void 0 : _a2[state.mode];
        relativeOrientation.copy((adapter == null ? void 0 : adapter.orientation.enabled) && (adapter == null ? void 0 : adapter.orientation[state.mode]) || this.raw.relativeOrientation);
        const spatialBounds = (adapter == null ? void 0 : adapter.bounds.enabled) && (adapter == null ? void 0 : adapter.bounds[state.mode]);
        if (spatialBounds) {
          spatialBounds.getCenter(spatialCenter);
          spatialBounds.getSize(spatialSize);
          const innerCenter = this.innerCenter;
          const innerSize = this.innerSize;
          const sizeEpsillon = this.system.epsillonMeters;
          if (Math.abs(spatialSize.x) <= sizeEpsillon)
            spatialSize.x = (Math.sign(spatialSize.x) || 1) * sizeEpsillon * 10;
          if (Math.abs(spatialSize.y) <= sizeEpsillon)
            spatialSize.y = (Math.sign(spatialSize.y) || 1) * sizeEpsillon * 10;
          if (Math.abs(spatialSize.z) <= sizeEpsillon)
            spatialSize.z = (Math.sign(spatialSize.z) || 1) * sizeEpsillon * 10;
          worldScale.copy(spatialSize);
          if (Math.abs(innerSize.x) >= sizeEpsillon)
            worldScale.x /= innerSize.x;
          if (Math.abs(innerSize.y) >= sizeEpsillon)
            worldScale.y /= innerSize.y;
          if (Math.abs(innerSize.z) >= sizeEpsillon)
            worldScale.z /= innerSize.z;
          worldOrientation.multiplyQuaternions(state.outerOrientation, relativeOrientation).normalize();
          spatialOffset.copy(spatialCenter).applyQuaternion(worldOrientation);
          innerOffset.copy(innerCenter).multiply(worldScale).applyQuaternion(worldOrientation);
          worldPosition.copy(state.outerOrigin).add(spatialOffset).sub(innerOffset);
          worldMatrix.compose(worldPosition, worldOrientation, worldScale);
          state.worldMatrix = worldMatrix;
        } else {
          relativeMatrix.compose(this.raw.relativePosition, relativeOrientation, this.raw.relativeScale);
          state.worldMatrix = (referenceState == null ? void 0 : referenceState.worldMatrix) ? worldMatrix.multiplyMatrices(referenceState == null ? void 0 : referenceState.worldMatrix, relativeMatrix) : relativeMatrix;
        }
        const opacity = (adapter == null ? void 0 : adapter.opacity.enabled) && (adapter == null ? void 0 : adapter.opacity[state.mode]);
        state.opacity = typeof opacity === "number" ? opacity : 1;
        return state;
      };
    })());
    __publicField(this, "raw", {
      parent: null,
      worldMatrix: new Matrix4(),
      relativeMatrix: new Matrix4(),
      opacity: 0,
      worldPosition: new Vector3(),
      worldOrientation: new Quaternion(),
      worldScale: new Vector3(),
      relativePosition: new Vector3(),
      relativeOrientation: new Quaternion(),
      relativeScale: new Vector3(),
      spatialBounds: new Box3(),
      worldFromSpatial: new Matrix4(),
      localFromSpatial: new Matrix4(),
      spatialFromLocal: new Matrix4()
    });
    __publicField(this, "outerOrigin", {
      current: () => this._getOuterOrigin("current"),
      target: () => this._getOuterOrigin("target")
    });
    __publicField(this, "_cachedCurrentState", this._cache.memoize(() => {
      return this._computeState(this[InternalCurrentState]);
    }));
    __publicField(this, _a, new NodeState("current", this));
    __publicField(this, "_cachedTargetState", this._cache.memoize(() => {
      return this._computeState(this[InternalTargetState]);
    }));
    __publicField(this, _b, new NodeState("target", this));
    __publicField(this, _c, new NodeState("target", this));
    __publicField(this, "_cachedBoundsChildren", this._cache.memoize(() => {
      const nodeChildren = this.nodeChildren;
      const children = this._boundingChildren;
      children.length = 0;
      for (const child of nodeChildren) {
        const metrics = this.system.getMetrics(child);
        if (metrics.isAdaptive)
          continue;
        children.push(metrics);
      }
      return children;
    }));
    __publicField(this, "_boundingChildren", []);
  }
  update() {
    var _a2, _b2;
    if (this.needsUpdate) {
      this.needsUpdate = false;
      const adapter = this._adapter = this.system.nodeAdapters.get(this.node);
      this.parentNode = this.raw.parent;
      this.parentMetrics = this.parentNode && this.system.getMetrics(this.parentNode);
      const reference = ((_a2 = adapter == null ? void 0 : adapter.activeLayout) == null ? void 0 : _a2.referenceNode) || (adapter == null ? void 0 : adapter.referenceNode) || this.parentNode;
      this.referenceMetrics = reference && this.system.getMetrics(reference);
      (_b2 = this.referenceMetrics) == null ? void 0 : _b2.update();
      if (adapter) {
        adapter._update();
      } else {
        this.invalidateInnerBounds();
        this.invalidateStates();
        this.updateRawState();
      }
    }
  }
  get innerBounds() {
    return this._cachedInnerBounds();
  }
  get innerCenter() {
    this.innerBounds;
    return this._innerCenter;
  }
  get innerSize() {
    this.innerBounds;
    return this._innerSize;
  }
  get intrinsicBounds() {
    if (this._intrinsicBoundsNeedsUpdate) {
      this._intrinsicBoundsNeedsUpdate = false;
      this.system.bindings.getIntrinsicBounds(this, this._intrinsicBounds);
      this._intrinsicBounds.getCenter(this._intrinsicCenter);
      this._intrinsicBounds.getSize(this._intrinsicSize);
    }
    return this._intrinsicBounds;
  }
  get intrinsicCenter() {
    this.intrinsicBounds;
    return this._intrinsicCenter;
  }
  get intrinsicSize() {
    this.intrinsicBounds;
    return this._intrinsicSize;
  }
  invalidateIntrinsicBounds() {
    this._intrinsicBoundsNeedsUpdate = true;
    for (const c2 of this.boundingChildMetrics) {
      c2.invalidateIntrinsicBounds();
    }
  }
  invalidateInnerBounds() {
    if (this._cachedInnerBounds.needsUpdate)
      return;
    this._cachedNodeChildren.needsUpdate = true;
    this._cachedBoundsChildren.needsUpdate = true;
    this._cachedInnerBounds.needsUpdate = true;
    for (const c2 of this.boundingChildMetrics) {
      c2.invalidateInnerBounds();
    }
  }
  containsNode(node) {
    this.update();
    let parentMetrics = this.system.getMetrics(node);
    while (parentMetrics) {
      if (parentMetrics.parentMetrics === this)
        return parentMetrics.node;
      parentMetrics = parentMetrics.parentMetrics;
    }
    return false;
  }
  containedByNode(node) {
    this.update();
    let parentMetrics = this.parentMetrics;
    while (parentMetrics) {
      if (parentMetrics.node === node)
        return parentMetrics.node;
      parentMetrics = parentMetrics.parentMetrics;
    }
    return false;
  }
  get nodeChildren() {
    return this._cachedNodeChildren();
  }
  invalidateStates() {
    this._cachedCurrentState.needsUpdate = true;
    this._cachedTargetState.needsUpdate = true;
    this[InternalCurrentState].invalidate();
    this[InternalTargetState].invalidate();
  }
  updateRawState() {
    this.system.bindings.getState(this);
    const raw = this.raw;
    raw.worldMatrix.decompose(raw.worldPosition, raw.worldOrientation, raw.worldScale);
    raw.relativeMatrix.decompose(raw.relativePosition, raw.relativeOrientation, raw.relativeScale);
    raw.worldFromSpatial.compose(this.outerOrigin.target(), raw.worldOrientation, V_111);
    raw.localFromSpatial.copy(raw.worldMatrix).invert().multiply(raw.worldFromSpatial);
    raw.spatialFromLocal.copy(raw.localFromSpatial).invert();
    raw.spatialBounds.copy(this.innerBounds).applyMatrix4(raw.spatialFromLocal);
  }
  _getOuterOrigin(mode) {
    var _a2, _b2, _c2;
    const adapter = this.system.nodeAdapters.get(this.node);
    if (adapter)
      return adapter.outerOrigin[mode];
    return (_c2 = (_b2 = (_a2 = this.referenceMetrics) == null ? void 0 : _a2[mode]) == null ? void 0 : _b2.worldCenter) != null ? _c2 : V_000;
  }
  get current() {
    this.update();
    return this._cachedCurrentState();
  }
  get target() {
    this.update();
    return this._cachedTargetState();
  }
  get previousTarget() {
    this.update();
    return this[InternalPreviousTargetState];
  }
  get boundingChildMetrics() {
    return this._cachedBoundsChildren();
  }
  get isAdaptive() {
    return this.system.nodeAdapters.has(this.node);
  }
}
_a = InternalCurrentState, _b = InternalTargetState, _c = InternalPreviousTargetState;
class OptimizerConfig {
  constructor(config2) {
    __publicField(this, "relativeTolerance");
    __publicField(this, "stepSizeMin");
    __publicField(this, "stepSizeMax");
    __publicField(this, "stepSizeStart");
    __publicField(this, "minFeasibleTime");
    __publicField(this, "maxInfeasibleTime");
    __publicField(this, "maxIterationsPerFrame");
    __publicField(this, "swarmSize");
    __publicField(this, "pulseRate");
    __publicField(this, "pulseFrequencyMin");
    __publicField(this, "pulseFrequencyMax");
    config2 && Object.assign(this, config2);
  }
}
class SpatialOptimizer {
  constructor(system) {
    __publicField(this, "_config", new OptimizerConfig());
    __publicField(this, "_prevOrientation", new Quaternion());
    __publicField(this, "_prevBounds", new Box3());
    __publicField(this, "_scratchSolution", new LayoutSolution());
    __publicField(this, "_scratchBestSolution", new LayoutSolution());
    this.system = system;
  }
  _setConfig(config2) {
    var _a2, _b2, _c2, _d, _e, _f, _g, _h, _i, _j;
    const defaultConfig = this.system.optimize;
    this._config.minFeasibleTime = (_a2 = config2.minFeasibleTime) != null ? _a2 : defaultConfig.minFeasibleTime;
    this._config.maxInfeasibleTime = (_b2 = config2.maxInfeasibleTime) != null ? _b2 : defaultConfig.maxInfeasibleTime;
    this._config.pulseRate = (_c2 = config2.pulseRate) != null ? _c2 : defaultConfig.pulseRate;
    this._config.maxIterationsPerFrame = (_d = config2.maxIterationsPerFrame) != null ? _d : defaultConfig.maxIterationsPerFrame;
    this._config.swarmSize = (_e = config2.swarmSize) != null ? _e : defaultConfig.swarmSize;
    this._config.pulseFrequencyMin = (_f = config2.pulseFrequencyMin) != null ? _f : defaultConfig.pulseFrequencyMin;
    this._config.pulseFrequencyMax = (_g = config2.pulseFrequencyMax) != null ? _g : defaultConfig.pulseFrequencyMax;
    this._config.stepSizeMax = (_h = config2.stepSizeMax) != null ? _h : defaultConfig.stepSizeMax;
    this._config.stepSizeMin = (_i = config2.stepSizeMin) != null ? _i : defaultConfig.stepSizeMin;
    this._config.stepSizeStart = (_j = config2.stepSizeStart) != null ? _j : defaultConfig.stepSizeStart;
  }
  update(adapter) {
    if (adapter.layouts.length === 0 || adapter.metrics.innerBounds.isEmpty()) {
      adapter.activeLayout = null;
      return false;
    }
    const prevOrientation = this._prevOrientation.copy(adapter.orientation.target);
    const prevBounds = this._prevBounds.copy(adapter.bounds.target);
    for (const layout of adapter.layouts) {
      this._setConfig(layout);
      this._updateLayout(adapter, layout);
    }
    let bestLayout;
    let bestSolution;
    for (const layout of adapter.layouts) {
      const solution = layout.solutions[0];
      if (!bestSolution || !bestSolution.isFeasible && solution.isFeasible) {
        bestSolution = solution;
        bestLayout = layout;
        if (bestSolution.isFeasible)
          break;
      }
    }
    adapter.layoutFeasibleTime += adapter.system.deltaTime;
    adapter.layoutInfeasibleTime += adapter.system.deltaTime;
    if (!(bestSolution == null ? void 0 : bestSolution.isFeasible)) {
      adapter.layoutFeasibleTime = 0;
    }
    if (bestSolution && bestSolution.isFeasible && adapter.layoutFeasibleTime >= this._config.minFeasibleTime || adapter.layoutInfeasibleTime >= this._config.maxInfeasibleTime) {
      adapter.layoutInfeasibleTime = 0;
      bestSolution.apply(false);
    } else {
      adapter.orientation.target = prevOrientation;
      adapter.bounds.target = prevBounds;
      adapter.metrics.invalidateStates();
    }
    adapter.activeLayout = bestLayout;
    return true;
  }
  _updateLayout(adapter, layout) {
    var _a2;
    adapter.measureBoundsCache.clear();
    layout.processObjectives();
    const solutions = layout.solutions;
    const c2 = this._config;
    const newSolution = this._scratchSolution;
    const bestSolution = this._scratchBestSolution;
    const diversificationFactor = 1.5;
    const intensificationFactor = 1.5 ** (-1 / 4);
    let iterations = c2.maxIterationsPerFrame;
    if ((_a2 = layout.solutions[0]) == null ? void 0 : _a2.isFeasible)
      iterations = 1;
    this._manageSolutionPopulation(adapter, layout, c2.swarmSize, c2.stepSizeStart);
    solutions[0].apply();
    for (let i = 0; i < iterations; i++) {
      layout.iteration++;
      bestSolution.copy(solutions[0]);
      let changed = false;
      for (let j = 0; j < solutions.length; j++) {
        const solution = solutions[j];
        newSolution.copy(solution);
        newSolution.mutationStrategies = solution.mutationStrategies;
        let mutationStrategy = void 0;
        if (Math.random() < c2.pulseRate) {
          const best = bestSolution !== solution ? bestSolution : solutions[1];
          let randomSolution;
          if (solutions.length > 2) {
            do {
              randomSolution = solutions[Math.floor(Math.random() * solutions.length)];
            } while (randomSolution === solution);
          }
          newSolution.moveTowards(best, c2.pulseFrequencyMin, c2.pulseFrequencyMax);
          if (randomSolution && layout.compareSolutions(randomSolution, solution) <= 0) {
            newSolution.moveTowards(randomSolution, c2.pulseFrequencyMin, c2.pulseFrequencyMax);
          }
        } else {
          mutationStrategy = newSolution.perturb();
        }
        newSolution.apply();
        const success = layout.compareSolutions(newSolution, solution) < 0;
        if (success) {
          solution.copy(newSolution);
          if (solution !== solutions[0] && layout.compareSolutions(solution, solutions[0]) < 0) {
            solutions[0].copy(solution);
          }
          changed = true;
        }
        if (mutationStrategy) {
          mutationStrategy.stepSize *= success ? diversificationFactor : intensificationFactor;
          if (!success && mutationStrategy.stepSize < c2.stepSizeMin || mutationStrategy.stepSize > c2.stepSizeMax) {
            for (const m of solution.mutationStrategies) {
              m.stepSize = c2.stepSizeStart;
            }
            if (solution !== solutions[0]) {
              layout.restartRate = 1e-3 + (1 - 1e-3) * layout.restartRate;
              solution.randomize(1);
              solution.apply();
              changed = true;
            }
          } else {
            if (solution !== solutions[0]) {
              layout.restartRate = (1 - 1e-3) * layout.restartRate;
            }
          }
        }
      }
      if (changed)
        layout.sortSolutions();
      if (layout.compareSolutions(bestSolution, solutions[0]) <= 0) {
        layout.successRate = (1 - 5e-3) * layout.successRate;
      } else {
        layout.successRate = 5e-3 + (1 - 5e-3) * layout.successRate;
      }
    }
  }
  _manageSolutionPopulation(adapter, layout, swarmSize, startStepSize) {
    if (swarmSize <= 1)
      throw new Error("Swarm size must be larger than 1");
    if (layout.solutions.length < swarmSize) {
      while (layout.solutions.length < swarmSize) {
        const solution = new LayoutSolution(layout);
        for (const s of solution.mutationStrategies)
          s.stepSize = startStepSize;
        solution.randomize(1);
        layout.solutions.push(solution);
      }
    } else if (layout.solutions.length > swarmSize) {
      while (layout.solutions.length > swarmSize) {
        layout.solutions.pop();
      }
    }
  }
}
class SpatialObjective {
  constructor(layout) {
    __publicField(this, "type", "ratio");
    __publicField(this, "sortBlame", 0);
    __publicField(this, "relativeTolerance");
    __publicField(this, "absoluteTolerance");
    __publicField(this, "computedAbsoluteTolerance", -Infinity);
    __publicField(this, "computedRelativeTolerance", -Infinity);
    __publicField(this, "priority", 0);
    __publicField(this, "index", -1);
    __publicField(this, "layout");
    __publicField(this, "reduceFromOneOrManySpec", (value, spec, applyFn) => {
      if (spec === void 0)
        return 0;
      if (spec instanceof Array) {
        let score = -Infinity;
        for (const s of spec) {
          score = Math.max(applyFn(value, s), score);
        }
        return score;
      }
      return applyFn(value, spec);
    });
    __publicField(this, "_getNumberScoreSingle", (value, spec) => {
      let diff = 0;
      if (typeof spec !== "object") {
        const target = this.layout.adapter.system.measureNumber(spec);
        diff = -Math.abs(value - target);
      } else {
        const min2 = "gt" in spec ? this.layout.adapter.system.measureNumber(spec.gt) : void 0;
        const max2 = "lt" in spec ? this.layout.adapter.system.measureNumber(spec.lt) : void 0;
        if (min2 !== void 0 && value < min2) {
          diff = value - min2;
        } else if (max2 !== void 0 && value > max2) {
          diff = max2 - value;
        }
      }
      return diff;
    });
    __publicField(this, "_getVector3ScoreSingle", (value, spec) => {
      const xScore = "x" in spec && typeof spec.x !== "undefined" ? this.getNumberScore(value.x, spec.x) : 0;
      const yScore = "y" in spec && typeof spec.y !== "undefined" ? this.getNumberScore(value.y, spec.y) : 0;
      const zScore = "z" in spec && typeof spec.z !== "undefined" ? this.getNumberScore(value.z, spec.z) : 0;
      const magnitudeScore = "magnitude" in spec && typeof spec.magnitude !== "undefined" ? this.getNumberScore(value.length(), spec.magnitude) : 0;
      return xScore + yScore + zScore + magnitudeScore;
    });
    __publicField(this, "_quat", new Quaternion());
    __publicField(this, "_euler", new Euler());
    __publicField(this, "_getQuaternionScoreSingle", (value, spec) => {
      var _a2, _b2;
      if (spec === void 0)
        return 0;
      if ("x" in spec) {
        const s = this._quat.copy(spec);
        return -s.angleTo(value) * RAD2DEG;
      } else if ("swingRange" in spec) {
        const euler = this._euler.setFromQuaternion(value);
        const swingX = euler.x * RAD2DEG;
        const swingY = euler.y * RAD2DEG;
        const twistZ = euler.z * RAD2DEG;
        const system = this.layout.adapter.system;
        const deg = system.mathScope.degree;
        let swingRangeX = ((_a2 = spec.swingRange) == null ? void 0 : _a2.x) ? system.measureNumber(spec.swingRange.x, deg) : 0;
        let swingRangeY = ((_b2 = spec.swingRange) == null ? void 0 : _b2.y) ? system.measureNumber(spec.swingRange.y, deg) : 0;
        swingRangeX = Math.max(swingRangeX, 0.01);
        swingRangeY = Math.max(swingRangeY, 0.01);
        const twistRange = spec.twistRange ? system.measureNumber(spec.twistRange, deg) : 0;
        const swingScore = 1 - (swingX / swingRangeX) ** 2 - (swingY / swingRangeY) ** 2;
        const twistScore = twistRange - Math.abs(twistZ);
        return (swingScore > 0 ? 0 : swingScore) + (twistScore > 0 ? 0 : twistScore);
      }
      return 0;
    });
    __publicField(this, "_getBoundsMeasureScoreSingle", (value, spec, type, subType) => {
      if (spec === void 0)
        return 0;
      if (typeof spec === "object") {
        if ("gt" in spec) {
          const min2 = this.layout.adapter.measureBounds(spec.gt, type, subType);
          if (value < min2)
            return value - min2;
        }
        if ("lt" in spec) {
          const max2 = this.layout.adapter.measureBounds(spec.lt, type, subType);
          if (value > max2)
            return max2 - value;
        }
        return 0;
      }
      return -Math.abs(value - this.layout.adapter.measureBounds(spec, type, subType));
    });
    this.layout = layout;
  }
  static isDiscreteSpec(s) {
    const type = typeof s;
    return type === "string" || type === "number";
  }
  static isContinuousSpec(s) {
    return s !== void 0 && s instanceof Array === false && typeof s === "object" && ("gt" in s || "lt" in s) === true;
  }
  get bestScore() {
    return this.layout.solutions[0].scores[this.index];
  }
  getNumberScore(value, spec) {
    return this.reduceFromOneOrManySpec(value, spec, this._getNumberScoreSingle);
  }
  getVector3Score(value, spec) {
    return this.reduceFromOneOrManySpec(value, spec, this._getVector3ScoreSingle);
  }
  getQuaternionScore(value, spec) {
    return this.reduceFromOneOrManySpec(value, spec, this._getQuaternionScoreSingle);
  }
  getBoundsScore(spec, boundsType) {
    if (spec === void 0)
      return 0;
    let score = 0;
    for (const key in spec) {
      if (key === "absolute") {
        continue;
      }
      let k = key;
      if (k === "size" || k === "center") {
        const subSpec = spec[k];
        for (const subKey of VECTOR3_SPEC_KEYS) {
          let sk = subKey;
          if (boundsType !== "spatial") {
            if (this.type === "meter" && sk !== "z")
              continue;
            if (this.type === "pixel" && sk === "z")
              continue;
          }
          score += this.getBoundsMeasureScore(subSpec == null ? void 0 : subSpec[sk], boundsType, k + sk);
        }
      } else {
        if (boundsType !== "spatial") {
          if (this.type === "meter" && k !== "back" && k !== "front")
            continue;
          if (this.type === "pixel" && (k === "back" || k === "front"))
            continue;
        }
        score += this.getBoundsMeasureScore(spec[k], boundsType, k);
      }
    }
    return score;
  }
  getBoundsMeasureScore(spec, type, subType) {
    if (spec === void 0)
      return 0;
    const state = this.layout.adapter.metrics.target;
    let bounds;
    let center;
    let size;
    switch (type) {
      case "spatial":
        bounds = state.spatialBounds;
        center = state.spatialCenter;
        size = state.spatialSize;
        break;
      case "visual":
      case "view":
        bounds = state.visualBounds;
        center = state.visualCenter;
        size = state.visualSize;
        break;
      default:
        throw new Error(`Unknown measure type "${type}.${subType}" in spec:
 "${spec}"`);
    }
    let value = 0;
    switch (subType) {
      case "left":
        value = bounds.min.x;
        break;
      case "right":
        value = bounds.max.x;
        break;
      case "bottom":
        value = bounds.min.y;
        break;
      case "top":
        value = bounds.max.y;
        break;
      case "back":
        value = bounds.min.z;
        break;
      case "front":
        value = bounds.max.z;
        break;
      case "centerx":
        value = center.x;
        break;
      case "centery":
        value = center.y;
        break;
      case "centerz":
        value = center.z;
        break;
      case "centerdistance":
        value = type === "spatial" ? center.length() : Math.sqrt(center.x ** 2 + size.y ** 2);
        break;
      case "sizex":
        value = size.x;
        break;
      case "sizey":
        value = size.y;
        break;
      case "sizez":
        value = size.z;
        break;
      case "sizediagonal":
        value = type === "spatial" ? size.length() : Math.sqrt(size.x ** 2 + size.y ** 2);
        break;
      default:
        throw new Error(`Unknown measure subtype ${type}.${subType} in spec "${spec}"`);
    }
    if (spec instanceof Array) {
      let score = -Infinity;
      for (const s of spec) {
        score = Math.max(this._getBoundsMeasureScoreSingle(value, s, type, subType), score);
      }
      return score;
    }
    return this._getBoundsMeasureScoreSingle(value, spec, type, subType);
  }
  attenuateVisualScore(score) {
    let penalty = 0;
    const acc = this.layout.getComputedAbsoluteTolerance("pixel");
    const adapter = this.layout.adapter;
    const viewResolution = adapter.system.viewResolution;
    const viewFrustum = adapter.system.viewFrustum;
    const vw = viewResolution.x;
    const vh = viewResolution.y;
    const viewSize = viewResolution.length();
    const visualBounds = adapter.metrics.target.visualBounds;
    const leftOffset = visualBounds.min.x - -vw / 2 + acc;
    const rightOffset = visualBounds.max.x - vw / 2 - acc;
    const bottomOffset = visualBounds.min.y - -vh / 2 + acc;
    const topOffset = visualBounds.max.y - vh / 2 - acc;
    const nearOffset = visualBounds.max.z + viewFrustum.nearMeters;
    if (leftOffset < 0)
      penalty += Math.abs(leftOffset / vw);
    if (rightOffset > 0)
      penalty += Math.abs(rightOffset / vw);
    if (bottomOffset < 0)
      penalty += Math.abs(bottomOffset / vh);
    if (topOffset > 0)
      penalty += Math.abs(topOffset / vh);
    if (nearOffset > 0)
      penalty += nearOffset * 10;
    return score - Math.abs(viewSize) * penalty;
  }
}
class RelativeOrientationConstraint extends SpatialObjective {
  constructor(layout) {
    super(layout);
    __publicField(this, "spec");
    this.type = "degree";
  }
  evaluate() {
    const state = this.layout.adapter.metrics.target;
    return this.getQuaternionScore(state.relativeOrientation, this.spec);
  }
}
class WorldScaleConstraint extends SpatialObjective {
  constructor(layout) {
    super(layout);
    __publicField(this, "spec");
    this.type = "ratio";
  }
  evaluate() {
    const state = this.layout.adapter.metrics.target;
    return this.getVector3Score(state.worldScale, this.spec);
  }
}
class AspectConstraint extends SpatialObjective {
  constructor(layout) {
    super(layout);
    __publicField(this, "mode", "xyz");
    __publicField(this, "_scale", new Vector3());
    this.type = "ratio";
  }
  evaluate() {
    const state = this.layout.adapter.metrics.target;
    const mode = this.mode;
    if (!mode)
      return 0;
    const s = this._scale.copy(state.worldScale);
    const largest = mode === "xyz" ? Math.max(Math.abs(s.x), Math.abs(s.y), Math.abs(s.z)) : Math.max(Math.abs(s.x), Math.abs(s.y));
    const aspectFill = s.divideScalar(largest);
    return -(1 / aspectFill.x) + 1 + -(1 / aspectFill.y) + 1 + (mode === "xyz" ? -(1 / aspectFill.z) + 1 : aspectFill.z > 1 ? 1 - aspectFill.z : 0);
  }
}
const VECTOR3_SPEC_KEYS = ["x", "y", "z", "diagonal", "distance"];
class SpatialBoundsConstraint extends SpatialObjective {
  constructor(layout) {
    super(layout);
    __publicField(this, "spec");
    this.type = "meter";
  }
  evaluate() {
    return this.getBoundsScore(this.spec, "spatial");
  }
}
class VisualBoundsConstraint extends SpatialObjective {
  constructor(layout) {
    super(layout);
    __publicField(this, "spec");
    __publicField(this, "pixelTolerance");
    __publicField(this, "meterTolerance");
    this.type = "pixel";
  }
  evaluate() {
    var _a2;
    if (this.type === "meter")
      this.absoluteTolerance = this.meterTolerance;
    if (this.type === "pixel")
      this.absoluteTolerance = this.pixelTolerance;
    return this.getBoundsScore(this.spec, "visual") + this.getBoundsScore((_a2 = this.spec) == null ? void 0 : _a2.absolute, "view");
  }
}
class VisualMaximizeObjective extends SpatialObjective {
  constructor(layout) {
    super(layout);
    __publicField(this, "minAreaPercent", 0);
    this.type = "pixel";
  }
  evaluate() {
    var _a2;
    const target = this.layout.adapter.metrics.target;
    const visualSize = target.visualSize;
    const viewSize = this.layout.adapter.system.viewResolution;
    const visualArea = Math.min(visualSize.x * visualSize.y, viewSize.x * viewSize.y);
    const refVisualSize = ((_a2 = target.referenceState) == null ? void 0 : _a2.visualSize) || viewSize;
    const refVisualArea = refVisualSize.x * refVisualSize.y;
    const score = this.attenuateVisualScore(visualArea) - refVisualArea * this.minAreaPercent;
    return score;
  }
}
class MagnetizeObjective extends SpatialObjective {
  constructor(layout) {
    super(layout);
    this.type = "meter";
    this.absoluteTolerance = 1e10;
  }
  evaluate() {
    const center = this.layout.adapter.metrics.target.visualCenter;
    return -center.length();
  }
}
const scratchVector3$1 = new Vector3();
class SpatialLayout extends OptimizerConfig {
  constructor(adapter) {
    super();
    __publicField(this, "absoluteTolerance", {
      meter: "10mm",
      pixel: "4px",
      degree: "0.002deg",
      ratio: 2e-3
    });
    __publicField(this, "successRate", 0);
    __publicField(this, "restartRate", 0);
    __publicField(this, "objectives", new Array());
    __publicField(this, "referenceNode", null);
    __publicField(this, "maximizeObjective");
    __publicField(this, "orientationConstraint");
    __publicField(this, "keepAspectConstraint");
    __publicField(this, "scaleConstraint");
    __publicField(this, "boundsConstraint");
    __publicField(this, "visualBoundsMeterConstraint");
    __publicField(this, "visualBoundsPixelConstraint");
    __publicField(this, "magnetizeObjective");
    __publicField(this, "minimizeOcclusionObjective");
    __publicField(this, "solutions", new Array());
    __publicField(this, "iteration", 0);
    __publicField(this, "bestSolution");
    __publicField(this, "compareSolutions", (a2, b2) => {
      const objectives = this.objectives;
      if (a2.scores.length < objectives.length)
        return 1;
      if (b2.scores.length < objectives.length)
        return -1;
      if (a2.boundsCenterDistance > 1e20)
        return 1;
      if (b2.boundsCenterDistance > 1e10)
        return -1;
      if (a2.boundsManhattanLength > 1e20)
        return 1;
      if (b2.boundsManhattanLength > 1e10)
        return -1;
      const aFeasible = a2.isFeasible;
      const bFeasible = b2.isFeasible;
      if (aFeasible && !bFeasible)
        return -1;
      if (bFeasible && !aFeasible)
        return 1;
      let rank = 0;
      const bestScores = this.solutions[0].scores;
      for (let i = 0; i < objectives.length; i++) {
        const scoreA = a2.scores[i];
        const scoreB = b2.scores[i];
        if (isNaN(scoreA))
          return 1;
        if (isNaN(scoreB))
          return -1;
        const objective = objectives[i];
        const oRelTol = objective.computedRelativeTolerance;
        const oAbsTol = objective.computedAbsoluteTolerance;
        const best = Math.max(bestScores[i], scoreA, scoreB);
        const tolerance = Math.min(best - Math.abs(best) * oRelTol, -oAbsTol);
        if (scoreA < tolerance || scoreB < tolerance) {
          objective.sortBlame++;
          return scoreB - scoreA;
        }
        if (scoreB - scoreA !== 0)
          rank = scoreB - scoreA;
      }
      return rank;
    });
    this.adapter = adapter;
  }
  getComputedAbsoluteTolerance(type) {
    return this.adapter.system.measureNumber(this.absoluteTolerance[type], type);
  }
  poseRelativeTo(reference) {
    this.referenceNode = reference;
    return this;
  }
  maximize(opts) {
    var _a2;
    const obj = this.maximizeObjective = (_a2 = this.maximizeObjective) != null ? _a2 : new VisualMaximizeObjective(this);
    obj.priority = -1e3;
    obj.relativeTolerance = 0.1;
    return this.addObjective(obj, opts);
  }
  orientation(spec, opts) {
    var _a2;
    const obj = this.orientationConstraint = (_a2 = this.orientationConstraint) != null ? _a2 : new RelativeOrientationConstraint(this);
    obj.spec = spec;
    obj.priority = -999;
    return this.addObjective(obj, opts);
  }
  keepAspect(mode = "xyz", opts) {
    var _a2;
    const obj = this.keepAspectConstraint = (_a2 = this.keepAspectConstraint) != null ? _a2 : new AspectConstraint(this);
    obj.mode = mode;
    obj.priority = -998;
    return this.addObjective(obj, opts);
  }
  scale(spec, opts) {
    var _a2;
    const obj = this.scaleConstraint = (_a2 = this.scaleConstraint) != null ? _a2 : new WorldScaleConstraint(this);
    obj.spec = spec;
    obj.priority = -2;
    return this.addObjective(obj, opts);
  }
  bounds(spec, opts) {
    var _a2;
    const obj = this.boundsConstraint = (_a2 = this.boundsConstraint) != null ? _a2 : new SpatialBoundsConstraint(this);
    obj.spec = spec;
    return this.addObjective(obj, opts);
  }
  visualOrientation(spec, opts) {
    var _a2;
    const obj = this.orientationConstraint = (_a2 = this.orientationConstraint) != null ? _a2 : new RelativeOrientationConstraint(this);
    obj.spec = spec;
    obj.priority = -999;
    return this.addObjective(obj, opts);
  }
  visualBounds(spec, opts) {
    var _a2, _b2;
    const meterConstraint = this.visualBoundsMeterConstraint = (_a2 = this.visualBoundsMeterConstraint) != null ? _a2 : new VisualBoundsConstraint(this);
    const pixelConstraint = this.visualBoundsPixelConstraint = (_b2 = this.visualBoundsPixelConstraint) != null ? _b2 : new VisualBoundsConstraint(this);
    meterConstraint.spec = spec;
    meterConstraint.type = "meter";
    pixelConstraint.spec = spec;
    pixelConstraint.type = "pixel";
    return this.addObjective(meterConstraint, opts).addObjective(pixelConstraint, opts);
  }
  magnetize(opts) {
    var _a2;
    const obj = this.magnetizeObjective = (_a2 = this.magnetizeObjective) != null ? _a2 : new MagnetizeObjective(this);
    obj.priority = -900;
    obj.relativeTolerance = 0.95;
    return this.addObjective(obj, opts);
  }
  avoidOcclusion(opts) {
    var _a2;
    const obj = this.minimizeOcclusionObjective = (_a2 = this.minimizeOcclusionObjective) != null ? _a2 : new MagnetizeObjective(this);
    obj.priority = 11;
    return this.addObjective(obj, opts);
  }
  addObjective(obj, opts) {
    Object.assign(obj, opts);
    if (this.objectives.indexOf(obj) === -1)
      this.objectives.push(obj);
    this.processObjectives();
    return this;
  }
  get hasValidSolution() {
    var _a2;
    return ((_a2 = this.solutions[0]) == null ? void 0 : _a2.isFeasible) === true;
  }
  processObjectives() {
    var _a2, _b2;
    const sys = this.adapter.system;
    const objectives = this.objectives;
    let index = 0;
    for (const o of objectives) {
      o.index = index++;
      o.computedAbsoluteTolerance = o.absoluteTolerance !== void 0 ? sys.measureNumber(o.absoluteTolerance, sys.mathScope[o.type]) : this.getComputedAbsoluteTolerance(o.type);
      o.computedRelativeTolerance = (_b2 = (_a2 = o.relativeTolerance) != null ? _a2 : this.relativeTolerance) != null ? _b2 : this.adapter.system.optimize.relativeTolerance;
    }
  }
  sortSolutions() {
    this.solutions.sort(this.compareSolutions);
    this.bestSolution = this.solutions[0];
  }
}
const _LayoutSolution = class {
  constructor(layout) {
    __publicField(this, "layout");
    __publicField(this, "orientation", new Quaternion());
    __publicField(this, "bounds", new Box3());
    __publicField(this, "scores", []);
    __publicField(this, "isFeasible", false);
    __publicField(this, "mutationStrategies", [
      { type: "rotate", stepSize: 0.1 },
      { type: "center", stepSize: 0.1 },
      { type: "size", stepSize: 0.1 },
      { type: "minmax", stepSize: 0.1 }
    ]);
    __publicField(this, "_mutationWeights", []);
    __publicField(this, "boundsManhattanLength");
    __publicField(this, "boundsCenterDistance");
    if (layout)
      this.layout = layout;
  }
  get aspectPenalty() {
    return this.scores[this.layout.objectives.indexOf(this.layout.keepAspectConstraint)] || 0;
  }
  get orientationPenalty() {
    return this.scores[this.layout.objectives.indexOf(this.layout.orientationConstraint)] || 0;
  }
  get spatialBoundsPenalty() {
    return this.scores[this.layout.objectives.indexOf(this.layout.boundsConstraint)] || 0;
  }
  _selectStrategy() {
    const strategies = this.mutationStrategies;
    const weights = this._mutationWeights;
    const orientationConstraint = this.layout.orientationConstraint;
    const aspectConstraint = this.layout.keepAspectConstraint;
    for (let i = 0; i < strategies.length; i++) {
      weights[i] = strategies[i].stepSize;
      if (orientationConstraint && strategies[i].type == "rotate" && this.orientationPenalty > -orientationConstraint.computedAbsoluteTolerance)
        weights[i] *= 0.01;
      if (aspectConstraint && strategies[i].type == "size" && this.aspectPenalty < -aspectConstraint.computedAbsoluteTolerance)
        weights[i] *= 100;
    }
    return randomSelect(strategies, weights);
  }
  copy(solution) {
    this.layout = solution.layout;
    this.orientation.copy(solution.orientation);
    this.bounds.copy(solution.bounds);
    this.scores.length = 0;
    for (let i = 0; i < solution.scores.length; i++) {
      this.scores[i] = solution.scores[i];
    }
    this.isFeasible = solution.isFeasible;
    return this;
  }
  randomize(sizeHint) {
    const far = levy(sizeHint);
    const center = _LayoutSolution._scratchV1.set(0, 0, -far);
    const viewState = this.layout.adapter.system.viewMetrics.target;
    center.applyMatrix4(viewState.worldMatrix);
    const parentState = this.layout.adapter.metrics.target.parentState;
    parentState && center.applyMatrix4(parentState.worldMatrixInverse);
    this.orientation.copy(viewState.worldOrientation);
    parentState && this.orientation.multiply(parentState.worldOrientationInverse);
    const inner = this.layout.adapter.metrics.innerBounds;
    const size = inner.isEmpty() ? _LayoutSolution._scratchV2.set(1, 1, 1) : inner.getSize(_LayoutSolution._scratchV2);
    size.normalize();
    size.multiplyScalar(far * 2 * Math.tan(5 * DEG2RAD));
    this.bounds.setFromCenterAndSize(center, size);
    return this;
  }
  moveTowards(solution, minFreq, maxFreq) {
    const center = this.bounds.getCenter(_LayoutSolution._center);
    const size = this.bounds.getSize(_LayoutSolution._size);
    const otherBounds = solution.bounds;
    const otherCenter = otherBounds.getCenter(_LayoutSolution._otherCenter);
    const otherSize = otherBounds.getSize(_LayoutSolution._otherSize);
    this.orientation.slerp(solution.orientation, _LayoutSolution.generatePulseFrequency(minFreq, maxFreq)).normalize();
    if (Math.random() < 0.5) {
      center.lerp(otherCenter, _LayoutSolution.generatePulseFrequency(minFreq, maxFreq));
      size.lerp(otherSize, _LayoutSolution.generatePulseFrequency(minFreq, maxFreq));
      this.bounds.setFromCenterAndSize(center, size);
    } else {
      this.bounds.min.lerp(otherBounds.min, _LayoutSolution.generatePulseFrequency(minFreq, maxFreq));
      this.bounds.max.lerp(otherBounds.max, _LayoutSolution.generatePulseFrequency(minFreq, maxFreq));
    }
  }
  perturb() {
    var _a2;
    const strategy = this._selectStrategy();
    const strategyType = strategy.type;
    let stepSize = strategy.stepSize;
    if (strategyType === "rotate" || Math.random() < 1e-3) {
      const orientationSpec = (_a2 = this.layout.orientationConstraint) == null ? void 0 : _a2.spec;
      if ((orientationSpec == null ? void 0 : orientationSpec.isQuaternion) && this.orientationPenalty < orientationSpec.computedAbsoluteTolerance && Math.random() < 0.01) {
        this.orientation.copy(orientationSpec);
      } else {
        const scale = Math.min(levy(Math.min(stepSize, 1) * 1e-4), 1);
        this.orientation.multiply(randomQuaternion(scale, scale)).normalize();
      }
    }
    const bounds = this.bounds;
    const center = bounds.getCenter(_LayoutSolution._center);
    const size = bounds.getSize(_LayoutSolution._size);
    if (strategyType === "center") {
      const offset = _LayoutSolution._direction.set(0, 0, 1).applyQuaternion(randomQuaternion(1, 1));
      offset.setLength(gaussian(stepSize)).multiplyScalar(size.length());
      center.add(offset);
    }
    if (strategyType === "size") {
      const scale = 2 ** gaussian(stepSize);
      size.multiplyScalar(scale);
    }
    size.clampScalar(this.layout.adapter.system.epsillonMeters / 10, 1e20);
    bounds.setFromCenterAndSize(center, size);
    if (strategyType === "minmax") {
      const offset = _LayoutSolution._direction.set(0, 0, 1).applyQuaternion(randomQuaternion(1, 1));
      offset.setLength(gaussian(stepSize)).multiply(size);
      if (Math.random() < 0.5) {
        bounds.min.add(offset);
      } else {
        bounds.min.add(offset);
      }
    }
    const min2 = bounds.min;
    const max2 = bounds.max;
    if (min2.x > max2.x)
      this._swap(min2, max2, "x");
    if (min2.y > max2.y)
      this._swap(min2, max2, "y");
    if (min2.z > max2.z)
      this._swap(min2, max2, "z");
    return strategy;
  }
  _swap(a2, b2, key) {
    const aValue = a2[key];
    const bValue = b2[key];
    a2[key] = bValue;
    b2[key] = aValue;
  }
  static generatePulseFrequency(min2, max2) {
    return min2 + Math.random() * (max2 - min2);
  }
  apply(evaluate = true) {
    const layout = this.layout;
    const adapter = layout.adapter;
    adapter.orientation.target = this.orientation;
    adapter.bounds.target = this.bounds;
    adapter.metrics.invalidateStates();
    if (evaluate) {
      this.isFeasible = true;
      for (let i = 0; i < layout.objectives.length; i++) {
        const o = layout.objectives[i];
        const score = this.scores[i] = o.evaluate();
        if (score < -o.computedAbsoluteTolerance || !isFinite(score))
          this.isFeasible = false;
      }
    }
    this.boundsManhattanLength = this.bounds.getSize(scratchVector3$1).manhattanLength();
    this.boundsCenterDistance = this.bounds.getCenter(scratchVector3$1).length();
  }
};
let LayoutSolution = _LayoutSolution;
__publicField(LayoutSolution, "_scratchV1", new Vector3());
__publicField(LayoutSolution, "_scratchV2", new Vector3());
__publicField(LayoutSolution, "_direction", new Vector3());
__publicField(LayoutSolution, "_center", new Vector3());
__publicField(LayoutSolution, "_size", new Vector3());
__publicField(LayoutSolution, "_otherCenter", new Vector3());
__publicField(LayoutSolution, "_otherSize", new Vector3());
var DEFAULT_OVERSHOOT_STRENGTH = 1.525;
var reversed = function(easing2) {
  return function(p) {
    return 1 - easing2(1 - p);
  };
};
var mirrored = function(easing2) {
  return function(p) {
    return p <= 0.5 ? easing2(2 * p) / 2 : (2 - easing2(2 * (1 - p))) / 2;
  };
};
var createReversedEasing = reversed;
var createMirroredEasing = mirrored;
var createExpoIn = function(power) {
  return function(p) {
    return Math.pow(p, power);
  };
};
var createBackIn = function(power) {
  return function(p) {
    return p * p * ((power + 1) * p - power);
  };
};
var createAnticipateEasing = function(power) {
  var backEasing = createBackIn(power);
  return function(p) {
    return (p *= 2) < 1 ? 0.5 * backEasing(p) : 0.5 * (2 - Math.pow(2, -10 * (p - 1)));
  };
};
var linear = function(p) {
  return p;
};
var easeIn = /* @__PURE__ */ createExpoIn(2);
var easeOut = /* @__PURE__ */ reversed(easeIn);
var easeInOut = /* @__PURE__ */ mirrored(easeIn);
var circIn = function(p) {
  return 1 - Math.sin(Math.acos(p));
};
var circOut = /* @__PURE__ */ reversed(circIn);
var circInOut = /* @__PURE__ */ mirrored(circOut);
var backIn = /* @__PURE__ */ createBackIn(DEFAULT_OVERSHOOT_STRENGTH);
var backOut = /* @__PURE__ */ reversed(backIn);
var backInOut = /* @__PURE__ */ mirrored(backIn);
var anticipate = /* @__PURE__ */ createAnticipateEasing(DEFAULT_OVERSHOOT_STRENGTH);
var BOUNCE_FIRST_THRESHOLD = 4 / 11;
var BOUNCE_SECOND_THRESHOLD = 8 / 11;
var BOUNCE_THIRD_THRESHOLD = 9 / 10;
var ca = 4356 / 361;
var cb = 35442 / 1805;
var cc = 16061 / 1805;
var bounceOut = function(p) {
  var p2 = p * p;
  return p < BOUNCE_FIRST_THRESHOLD ? 7.5625 * p2 : p < BOUNCE_SECOND_THRESHOLD ? 9.075 * p2 - 9.9 * p + 3.4 : p < BOUNCE_THIRD_THRESHOLD ? ca * p2 - cb * p + cc : 10.8 * p * p - 20.52 * p + 10.72;
};
var bounceIn = function(p) {
  return 1 - bounceOut(1 - p);
};
var bounceInOut = function(p) {
  return p < 0.5 ? 0.5 * (1 - bounceOut(1 - p * 2)) : 0.5 * bounceOut(p * 2 - 1) + 0.5;
};
var NEWTON_ITERATIONS = 8;
var NEWTON_MIN_SLOPE = 1e-3;
var SUBDIVISION_PRECISION = 1e-7;
var SUBDIVISION_MAX_ITERATIONS = 10;
var K_SPLINE_TABLE_SIZE = 11;
var K_SAMPLE_STEP_SIZE = 1 / (K_SPLINE_TABLE_SIZE - 1);
var FLOAT_32_SUPPORTED = typeof Float32Array !== "undefined";
var a = function(a1, a2) {
  return 1 - 3 * a2 + 3 * a1;
};
var b = function(a1, a2) {
  return 3 * a2 - 6 * a1;
};
var c = function(a1) {
  return 3 * a1;
};
var getSlope = function(t, a1, a2) {
  return 3 * a(a1, a2) * t * t + 2 * b(a1, a2) * t + c(a1);
};
var calcBezier = function(t, a1, a2) {
  return ((a(a1, a2) * t + b(a1, a2)) * t + c(a1)) * t;
};
function cubicBezier(mX1, mY1, mX2, mY2) {
  var sampleValues = FLOAT_32_SUPPORTED ? new Float32Array(K_SPLINE_TABLE_SIZE) : new Array(K_SPLINE_TABLE_SIZE);
  var binarySubdivide = function(aX, aA, aB) {
    var i = 0;
    var currentX;
    var currentT;
    do {
      currentT = aA + (aB - aA) / 2;
      currentX = calcBezier(currentT, mX1, mX2) - aX;
      if (currentX > 0) {
        aB = currentT;
      } else {
        aA = currentT;
      }
    } while (Math.abs(currentX) > SUBDIVISION_PRECISION && ++i < SUBDIVISION_MAX_ITERATIONS);
    return currentT;
  };
  var newtonRaphsonIterate = function(aX, aGuessT) {
    var i = 0;
    var currentSlope = 0;
    var currentX;
    for (; i < NEWTON_ITERATIONS; ++i) {
      currentSlope = getSlope(aGuessT, mX1, mX2);
      if (currentSlope === 0) {
        return aGuessT;
      }
      currentX = calcBezier(aGuessT, mX1, mX2) - aX;
      aGuessT -= currentX / currentSlope;
    }
    return aGuessT;
  };
  var calcSampleValues = function() {
    for (var i = 0; i < K_SPLINE_TABLE_SIZE; ++i) {
      sampleValues[i] = calcBezier(i * K_SAMPLE_STEP_SIZE, mX1, mX2);
    }
  };
  var getTForX = function(aX) {
    var intervalStart = 0;
    var currentSample = 1;
    var lastSample = K_SPLINE_TABLE_SIZE - 1;
    var dist2 = 0;
    var guessForT = 0;
    var initialSlope = 0;
    for (; currentSample !== lastSample && sampleValues[currentSample] <= aX; ++currentSample) {
      intervalStart += K_SAMPLE_STEP_SIZE;
    }
    --currentSample;
    dist2 = (aX - sampleValues[currentSample]) / (sampleValues[currentSample + 1] - sampleValues[currentSample]);
    guessForT = intervalStart + dist2 * K_SAMPLE_STEP_SIZE;
    initialSlope = getSlope(guessForT, mX1, mX2);
    if (initialSlope >= NEWTON_MIN_SLOPE) {
      return newtonRaphsonIterate(aX, guessForT);
    } else if (initialSlope === 0) {
      return guessForT;
    } else {
      return binarySubdivide(aX, intervalStart, intervalStart + K_SAMPLE_STEP_SIZE);
    }
  };
  calcSampleValues();
  var resolver = function(aX) {
    var returnValue;
    if (mX1 === mY1 && mX2 === mY2) {
      returnValue = aX;
    } else if (aX === 0) {
      returnValue = 0;
    } else if (aX === 1) {
      returnValue = 1;
    } else {
      returnValue = calcBezier(getTForX(aX), mY1, mY2);
    }
    return returnValue;
  };
  return resolver;
}
var easingImport = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  reversed,
  mirrored,
  createReversedEasing,
  createMirroredEasing,
  createExpoIn,
  createBackIn,
  createAnticipateEasing,
  linear,
  easeIn,
  easeOut,
  easeInOut,
  circIn,
  circOut,
  circInOut,
  backIn,
  backOut,
  backInOut,
  anticipate,
  bounceOut,
  bounceIn,
  bounceInOut,
  cubicBezier
});
const easing = easingImport;
class Transition {
  constructor(options) {
    __publicField(this, "target");
    __publicField(this, "duration");
    __publicField(this, "easing");
    __publicField(this, "blend");
    __publicField(this, "elapsed");
    options && Object.assign(this, options);
  }
}
class TransitionConfig {
  constructor(config2) {
    __publicField(this, "multiplier");
    __publicField(this, "duration");
    __publicField(this, "easing");
    __publicField(this, "threshold");
    __publicField(this, "delay");
    __publicField(this, "debounce");
    __publicField(this, "maxWait");
    __publicField(this, "blend");
    config2 && Object.assign(this, config2);
  }
}
const _scratchV2 = new Vector2();
const _scratchV3 = new Vector3();
const _scratchQ = new Quaternion();
const _scratchBox = new Box3();
const _scratchColor = new Color();
const _blackColor = new Color(0, 0, 0);
class Transitionable extends TransitionConfig {
  constructor(system, startValue, config2, parentConfig = system.transition) {
    super(config2);
    __publicField(this, "needsUpdate", false);
    __publicField(this, "_size", new Vector3());
    __publicField(this, "_start");
    __publicField(this, "_current");
    __publicField(this, "_reference");
    __publicField(this, "_target");
    __publicField(this, "queue", []);
    __publicField(this, "enabled", false);
    __publicField(this, "forceWait", false);
    __publicField(this, "_forceCommit", false);
    __publicField(this, "_resolvedConfig", new TransitionConfig());
    __publicField(this, "delayTime", 0);
    __publicField(this, "debounceTime", 0);
    __publicField(this, "_previousStatus", "unchanged");
    __publicField(this, "_status", "unchanged");
    __publicField(this, "_previousTarget");
    __publicField(this, "_syncGroup");
    this.system = system;
    this.parentConfig = parentConfig;
    this.reset(startValue);
    this._previousTarget = this._copy(this._previousTarget, this.target);
  }
  _copy(to, from) {
    if (typeof from === "undefined")
      return void 0;
    if (typeof from === "number")
      return from;
    const result = to ? to.copy(from) : from.clone();
    if (result && "isBox3" in result) {
      const resultBox = result;
      const resultSize = resultBox.getSize(this._size);
      if (resultBox.isEmpty() || !isFinite(resultSize.x) || !isFinite(resultSize.y) || !isFinite(resultSize.z)) {
        resultBox.setFromCenterAndSize(V_000, V_000);
      }
    }
    return result;
  }
  _isEqual(a2, b2) {
    if (a2 === void 0 || b2 === void 0)
      return false;
    if (a2 === b2)
      return true;
    if (typeof a2 === "number")
      return a2 === b2;
    return (a2 == null ? void 0 : a2.equals(b2)) || false;
  }
  reset(v) {
    this._start = this._copy(this._start, v);
    this._current = this._copy(this._current, v);
    this._target = this._copy(this._target, v);
    this.queue.length = 0;
  }
  set start(value) {
    this._start = this._copy(this._start, value);
  }
  get start() {
    return this._start;
  }
  set current(value) {
    this._current = this._copy(this._current, value);
  }
  get current() {
    return this._current;
  }
  set reference(value) {
    this._reference = this._copy(this._reference, value);
  }
  get reference() {
    return this._reference;
  }
  set target(value) {
    this.enabled = true;
    this._target = this._copy(this._target, value);
  }
  get target() {
    return this._target;
  }
  get progress() {
    if (!this.enabled)
      return 1;
    if (this.queue.length > 0) {
      const t = this.queue[this.queue.length - 1];
      if (t.duration === 0)
        return 0;
      return t.elapsed / t.duration;
    }
    return 1;
  }
  get forceCommit() {
    return this._forceCommit;
  }
  set forceCommit(val) {
    if (this._forceCommit === val)
      return;
    this._forceCommit = val;
  }
  get relativeDifference() {
    var _a2, _b2;
    const lastTarget = (_b2 = (_a2 = this.queue[this.queue.length - 1]) == null ? void 0 : _a2.target) != null ? _b2 : this.start;
    return typeof this.target !== "undefined" ? computeRelativeDifference(lastTarget, this.target) : 0;
  }
  get referenceRelativeDifference() {
    return typeof this.reference !== "undefined" && typeof this.target !== "undefined" ? computeRelativeDifference(this.reference, this.target) : Infinity;
  }
  get resolvedConfig() {
    var _a2, _b2, _c2, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n, _o, _p;
    const r = this._resolvedConfig;
    const adapterConfig = this.parentConfig;
    const systemConfig = this.system.transition;
    r.multiplier = (_b2 = (_a2 = this.multiplier) != null ? _a2 : adapterConfig == null ? void 0 : adapterConfig.multiplier) != null ? _b2 : systemConfig.multiplier;
    r.duration = (_d = (_c2 = this.duration) != null ? _c2 : adapterConfig == null ? void 0 : adapterConfig.duration) != null ? _d : systemConfig.duration;
    r.easing = (_f = (_e = this.easing) != null ? _e : adapterConfig == null ? void 0 : adapterConfig.easing) != null ? _f : systemConfig.easing;
    r.threshold = (_h = (_g = this.threshold) != null ? _g : adapterConfig == null ? void 0 : adapterConfig.threshold) != null ? _h : systemConfig.threshold;
    r.delay = (_j = (_i = this.delay) != null ? _i : adapterConfig == null ? void 0 : adapterConfig.delay) != null ? _j : systemConfig.delay;
    r.debounce = (_l = (_k = this.debounce) != null ? _k : adapterConfig == null ? void 0 : adapterConfig.debounce) != null ? _l : systemConfig.debounce;
    r.maxWait = (_n = (_m = this.maxWait) != null ? _m : adapterConfig == null ? void 0 : adapterConfig.maxWait) != null ? _n : systemConfig.maxWait;
    r.blend = (_p = (_o = this.blend) != null ? _o : adapterConfig == null ? void 0 : adapterConfig.blend) != null ? _p : systemConfig.blend;
    return r;
  }
  get previousStatus() {
    return this._previousStatus;
  }
  get status() {
    if (this.needsUpdate) {
      this._previousStatus = this._status;
      this._status = this._computeStatus();
    }
    return this._status;
  }
  _computeStatus() {
    if (this.forceCommit)
      return "committing";
    const config2 = this.resolvedConfig;
    const threshold = config2.threshold;
    const delta = this.system.deltaTime * config2.multiplier;
    const delay = this.delayTime + delta;
    const debounce = this.debounceTime + delta;
    const relDiff = this.relativeDifference;
    const changed = relDiff > threshold;
    if (!changed)
      return "unchanged";
    if (!this.forceWait && (delay >= config2.delay && debounce >= config2.debounce || delay >= config2.maxWait)) {
      return "committing";
    }
    const refRelDiff = this.referenceRelativeDifference;
    const stable = refRelDiff < threshold;
    if (!stable) {
      return "changed";
    }
    return "settling";
  }
  _updateTransitionable() {
    var _a2, _b2, _c2, _d, _e;
    const deltaTime = this.system.deltaTime;
    const config2 = this.resolvedConfig;
    const queue = this.queue;
    const status = this.status;
    const delta = deltaTime * config2.multiplier;
    while (queue.length && queue[0].elapsed >= queue[0].duration) {
      this.start = queue.shift().target;
    }
    this.current = this.start;
    let previousTarget = this.start;
    for (let i = 0; i < queue.length; i++) {
      const transition = queue[i];
      this._addTransitionToCurrent(previousTarget, transition, delta);
      previousTarget = transition.target;
      if (!transition.blend)
        break;
    }
    this.debounceTime += delta;
    switch (status) {
      case "settling":
        break;
      case "changed":
        this.delayTime += delta;
        this.reference = this.target;
        break;
      case "unchanged":
        this.reference = void 0;
        this.delayTime = 0;
        break;
      case "committing":
        this.delayTime = 0;
        this.debounceTime = 0;
        const transition = typeof this.forceCommit === "object" ? this.forceCommit : new Transition();
        transition.target = (_a2 = transition.target) != null ? _a2 : this._copy(void 0, this.target);
        transition.duration = (_b2 = transition.duration) != null ? _b2 : config2.duration;
        transition.easing = (_c2 = transition.easing) != null ? _c2 : config2.easing;
        transition.blend = (_d = transition.blend) != null ? _d : config2.blend;
        transition.elapsed = (_e = transition.elapsed) != null ? _e : 0;
        queue.push(transition);
        this.forceCommit = false;
        break;
    }
    this.forceWait = false;
  }
  _addTransitionToCurrent(prev, transition, delta) {
    const current = this._current;
    const alpha = transition.duration > 0 ? transition.easing(Math.min(transition.elapsed / transition.duration, 1)) : 1;
    const target = transition.target;
    transition.elapsed += delta;
    if (typeof target === "number") {
      this._current = current + lerp(target - prev, 0, 1 - alpha);
      return;
    }
    if ("isVector3" in target) {
      const c2 = current;
      const s = prev;
      const e = target;
      const amount = _scratchV3.copy(e).sub(s).lerp(V_000, 1 - alpha);
      this._current = c2.add(amount);
      return;
    }
    if ("isVector2" in target) {
      const c2 = current;
      const s = prev;
      const e = target;
      const amount = _scratchV2.copy(e).sub(s).lerp(V_00, 1 - alpha);
      this._current = c2.add(amount);
      return;
    }
    if ("isQuaternion" in target) {
      const c2 = current;
      const s = prev;
      const e = target;
      const amount = _scratchQ.copy(s).invert().multiply(e).slerp(Q_IDENTITY, 1 - alpha);
      this._current = c2.multiply(amount).normalize();
      return;
    }
    if ("isColor" in target) {
      const c2 = current;
      const s = prev;
      const e = target;
      const amount = _scratchColor.copy(e).sub(s).lerp(_blackColor, 1 - alpha);
      this._current = c2.add(amount);
      return;
    }
    if ("isBox3" in target) {
      const c2 = current;
      const s = prev;
      const e = target;
      const minAmount = _scratchBox.min.copy(e.min).sub(s.min).lerp(V_000, 1 - alpha);
      const maxAmount = _scratchBox.max.copy(e.max).sub(s.max).lerp(V_000, 1 - alpha);
      c2.min.add(minAmount);
      c2.max.add(maxAmount);
      this._current = c2;
      return;
    }
  }
  _swap(a2, b2, key) {
    const aValue = a2[key];
    const bValue = b2[key];
    a2[key] = bValue;
    b2[key] = aValue;
  }
  update(force = false) {
    if (!this.needsUpdate && !force)
      return;
    if (!this._isEqual(this._previousTarget, this.target)) {
      this._target = this._target;
      this.enabled = true;
    }
    this._previousTarget = this._copy(this._previousTarget, this.target);
    if (!this.enabled)
      return;
    const syncGroup = this.syncGroup;
    if (!this.forceCommit && syncGroup) {
      for (const t of syncGroup) {
        if (t.enabled && t.status === "committing") {
          for (const to of syncGroup) {
            if (to.needsUpdate && to.forceCommit === false && to.relativeDifference > to.resolvedConfig.threshold)
              to.forceCommit = true;
          }
          break;
        }
      }
    }
    this._updateTransitionable();
    this.needsUpdate = false;
  }
  set syncGroup(group) {
    if (this._syncGroup)
      this._syncGroup.delete(this);
    this._syncGroup = group;
    group == null ? void 0 : group.add(this);
  }
  get syncGroup() {
    return this._syncGroup;
  }
}
class SpatialAdapter {
  constructor(system, node) {
    __publicField(this, "measureBoundsCache", /* @__PURE__ */ new Map());
    __publicField(this, "metrics");
    __publicField(this, "transition", new TransitionConfig());
    __publicField(this, "referenceNode");
    __publicField(this, "_outerOrigin");
    __publicField(this, "_outerOrientation");
    __publicField(this, "_outerBounds");
    __publicField(this, "_outerVisualBounds");
    __publicField(this, "_parentAdapter", null);
    __publicField(this, "_orientation");
    __publicField(this, "_bounds");
    __publicField(this, "_opacity");
    __publicField(this, "layouts", new Array());
    __publicField(this, "layoutFeasibleTime", 0);
    __publicField(this, "layoutInfeasibleTime", 0);
    __publicField(this, "_prevLayout", null);
    __publicField(this, "_activeLayout", null);
    __publicField(this, "_progress", 1);
    __publicField(this, "_hasValidContext", false);
    __publicField(this, "onUpdate");
    __publicField(this, "onPostUpdate");
    __publicField(this, "_prevNodeOrientation", new Quaternion());
    __publicField(this, "_prevNodeBounds", new Box3());
    this.system = system;
    this.node = node;
    this.metrics = this.system.getMetrics(this.node);
    const target = this.metrics.target;
    this._orientation = new Transitionable(this.system, target.relativeOrientation, void 0, this.transition);
    this._bounds = new Transitionable(this.system, target.spatialBounds, void 0, this.transition);
    this._opacity = new Transitionable(this.system, target.opacity, void 0, this.transition);
    this._outerOrigin = new Transitionable(this.system, target.outerCenter, void 0, this.transition);
    this._outerOrientation = new Transitionable(this.system, target.outerOrientation, void 0, this.transition);
    this._outerBounds = new Transitionable(this.system, target.outerBounds, void 0, this.transition);
    this._outerVisualBounds = new Transitionable(this.system, target.outerVisualBounds, void 0, this.transition);
    this._outerOrigin.debounce = 0;
    this._outerOrigin.delay = 0;
    this._outerOrientation.debounce = 0;
    this._outerOrientation.delay = 0;
    this._outerBounds.debounce = 0;
    this._outerBounds.delay = 0;
    this._outerVisualBounds.debounce = 0;
    this._outerVisualBounds.delay = 0;
    this._orientation.syncGroup = this._bounds.syncGroup = this._opacity.syncGroup = /* @__PURE__ */ new Set();
  }
  measureBounds(measure, type, subType) {
    var _a2, _b2, _c2;
    const system = this.system;
    const scope = system.mathScope;
    const math = system.math;
    const unit = type === "spatial" || subType === "front" || subType === "back" || subType === "centerz" || subType === "sizez" ? scope.meter : scope.pixel;
    const unitString = unit === scope.meter ? "m" : "px";
    if (typeof measure === "number")
      measure = "" + measure + unitString;
    const cacheKey = type + "-" + subType + " = " + measure;
    if ((_a2 = this.measureBoundsCache) == null ? void 0 : _a2.has(cacheKey))
      return this.measureBoundsCache.get(cacheKey);
    if (!system.mathCompiledExpressions.has(measure)) {
      const node = math.parse(measure.replace("%", "percent"));
      const code2 = node.compile();
      system.mathCompiledExpressions.set(measure, code2);
    }
    const code = system.mathCompiledExpressions.get(measure);
    const viewState = system.viewMetrics.target;
    const state = this.metrics.target;
    let referenceBounds;
    let referenceCenter;
    switch (type) {
      case "spatial":
        referenceBounds = state.outerBounds;
        referenceCenter = state.outerCenter;
        break;
      case "visual":
        referenceBounds = state.outerVisualBounds;
        referenceCenter = state.outerVisualCenter;
        break;
      case "view":
        referenceBounds = viewState.visualBounds;
        referenceCenter = viewState.visualCenter;
        break;
      default:
        throw new Error(`Unknown measure type "${type}.${subType}"`);
    }
    if (measure.includes("%")) {
      const outerSize = type === "spatial" ? state.outerSize : (_b2 = state.outerVisualSize) != null ? _b2 : viewState.visualSize;
      let percent = 0;
      switch (subType) {
        case "left":
        case "centerx":
        case "right":
        case "sizex":
          percent = math.unit(outerSize.x / 100, unitString);
          break;
        case "bottom":
        case "centery":
        case "top":
        case "sizey":
          percent = math.unit(outerSize.y / 100, unitString);
          break;
        case "back":
        case "centerz":
        case "front":
        case "sizez":
          percent = math.unit(outerSize.z / 100, "m");
          break;
        case "sizediagonal":
          percent = type === "spatial" ? math.unit(outerSize.length() / 100, "m") : math.unit(Math.sqrt(outerSize.x ** 2 + outerSize.y ** 2) / 100, "px");
          break;
        default:
          throw new Error(`Invalid measure subtype "${type}.${subType}" for percentage units`);
      }
      scope.percent = percent;
    }
    let value;
    switch (subType) {
      case "left":
        value = referenceBounds.min.x;
        break;
      case "centerx":
        value = referenceCenter.x;
        break;
      case "right":
        value = referenceBounds.max.x;
        break;
      case "bottom":
        value = referenceBounds.min.y;
        break;
      case "centery":
        value = referenceCenter.y;
        break;
      case "top":
        value = referenceBounds.max.y;
        break;
      case "front":
        value = referenceBounds.max.z;
        break;
      case "centerz":
        value = referenceCenter.z;
        break;
      case "back":
        value = referenceBounds.min.z;
        break;
      case "centerdistance":
      default:
        value = 0;
    }
    let result = code.evaluate(scope);
    if (typeof result === "object")
      result = math.number(result, unit);
    value += result;
    scope.percent = void 0;
    (_c2 = this.measureBoundsCache) == null ? void 0 : _c2.set(cacheKey, value);
    return value;
  }
  get outerOrigin() {
    return this._outerOrigin;
  }
  get outerOrientation() {
    return this._outerOrientation;
  }
  get outerBounds() {
    return this._outerBounds;
  }
  get outerVisualBounds() {
    return this._outerVisualBounds;
  }
  get parentAdapter() {
    return this._parentAdapter;
  }
  _computeParentAdapter() {
    let nodeMetrics = this.metrics;
    while (nodeMetrics = nodeMetrics.parentMetrics) {
      const adapter = this.system.nodeAdapters.get(nodeMetrics.node);
      if (adapter)
        return adapter;
    }
    return null;
  }
  get orientation() {
    return this._orientation;
  }
  get bounds() {
    return this._bounds;
  }
  get opacity() {
    return this._opacity;
  }
  get previousLayout() {
    return this._prevLayout;
  }
  set activeLayout(val) {
    this._prevLayout = this._activeLayout;
    this._activeLayout = val;
  }
  get activeLayout() {
    return this._activeLayout;
  }
  get progress() {
    return this._progress;
  }
  _computeProgress() {
    return Math.min(this.orientation.progress, this.bounds.progress, this.opacity.progress);
  }
  createLayout() {
    const layout = new SpatialLayout(this);
    this.layouts.push(layout);
    return layout;
  }
  get hasValidContext() {
    return this._hasValidContext;
  }
  _computeHasValidContext() {
    var _a2;
    const pAdapter = this.parentAdapter;
    if (!pAdapter)
      return true;
    if (!pAdapter.hasValidContext)
      return false;
    if (pAdapter.layouts.length === 0)
      return true;
    if ((_a2 = pAdapter.activeLayout) == null ? void 0 : _a2.hasValidSolution)
      return true;
    return false;
  }
  _update() {
    var _a2;
    this._parentAdapter = this._computeParentAdapter();
    this._hasValidContext = this._computeHasValidContext();
    const metrics = this.metrics;
    if (metrics.referenceMetrics) {
      this.outerOrigin.target = metrics.referenceMetrics.target.worldCenter;
      this.outerOrientation.target = metrics.referenceMetrics.target.worldOrientation;
      this.outerBounds.target = metrics.referenceMetrics.innerBounds;
      this.outerBounds.target.applyMatrix4(metrics.target.spatialFromReference);
      this.outerVisualBounds.target = metrics.referenceMetrics.target.visualBounds;
    }
    this.outerOrigin.update();
    this.outerOrientation.update();
    this.outerBounds.update();
    this.outerVisualBounds.update();
    if (this.onUpdate) {
      this.onUpdate();
      metrics.invalidateIntrinsicBounds();
      metrics.invalidateInnerBounds();
      metrics.invalidateStates();
      metrics.updateRawState();
      const rawState = metrics.raw;
      if (!this.system.optimizer.update(this)) {
        const currentOrientation = this.orientation.current;
        const targetOrientation = this.orientation.target;
        const orientation = rawState.relativeOrientation;
        if (targetOrientation.angleTo(orientation) > this.system.epsillonRadians && currentOrientation.angleTo(orientation) > this.system.epsillonRadians) {
          this.orientation.target = orientation;
        }
        const currentBounds = this.bounds.current;
        const targetBounds = this.bounds.target;
        const bounds = rawState.spatialBounds;
        if ((targetBounds.min.distanceTo(bounds.min) > this.system.epsillonMeters || targetBounds.max.distanceTo(bounds.max) > this.system.epsillonMeters) && (currentBounds.min.distanceTo(bounds.min) > this.system.epsillonMeters || currentBounds.max.distanceTo(bounds.max) > this.system.epsillonMeters)) {
          this.bounds.target = bounds;
        }
      }
    } else {
      metrics.invalidateIntrinsicBounds();
      metrics.invalidateInnerBounds();
      metrics.invalidateStates();
      this.system.optimizer.update(this);
    }
    this.opacity.update();
    this.orientation.update();
    this.bounds.update();
    this._progress = this._computeProgress();
    metrics.invalidateStates();
    this.system.bindings.apply(metrics, metrics.current);
    metrics.invalidateStates();
    (_a2 = this.onPostUpdate) == null ? void 0 : _a2.call(this);
  }
}
class LayoutFrustum {
  constructor() {
    __publicField(this, "_cache", new MemoizationCache());
    __publicField(this, "isLayoutFrustum", true);
    __publicField(this, "_leftDegrees", -20);
    __publicField(this, "_rightDegrees", 20);
    __publicField(this, "_bottomDegrees", -20);
    __publicField(this, "_topDegrees", 20);
    __publicField(this, "_nearMeters", 0.5);
    __publicField(this, "_farMeters", 1e3);
    __publicField(this, "_size", new Vector2());
    __publicField(this, "_center", new Vector2());
    __publicField(this, "_v1", new Vector3());
    __publicField(this, "_inverseProjection", new Matrix4());
    __publicField(this, "_forwardDirection", new Vector3(0, 0, -1));
    __publicField(this, "_fullNDC", new Box3(new Vector3(-1, -1, -1), new Vector3(1, 1, 1)));
    __publicField(this, "_cachedPerspectiveProjectionMatrix", this._cache.memoize(() => {
      const near = this.nearMeters;
      const far = this.farMeters;
      const left = near * Math.tan(this.leftDegrees * DEG2RAD);
      const right = near * Math.tan(this.rightDegrees * DEG2RAD);
      const top = near * Math.tan(this.topDegrees * DEG2RAD);
      const bottom = near * Math.tan(this.bottomDegrees * DEG2RAD);
      return this._perspective.makePerspective(left, right, top, bottom, near, far);
    }));
    __publicField(this, "_perspective", new Matrix4());
    __publicField(this, "_boxA", new Box2());
    __publicField(this, "_boxB", new Box2());
    __publicField(this, "_overlapSize", new Vector2());
  }
  get leftDegrees() {
    return this._leftDegrees;
  }
  set leftDegrees(val) {
    if (val !== this._leftDegrees) {
      this._leftDegrees = val;
      this._cache.invalidateAll();
    }
  }
  get rightDegrees() {
    return this._rightDegrees;
  }
  set rightDegrees(val) {
    if (val !== this._rightDegrees) {
      this._rightDegrees = val;
      this._cache.invalidateAll();
    }
  }
  get bottomDegrees() {
    return this._bottomDegrees;
  }
  set bottomDegrees(val) {
    if (val !== this._bottomDegrees) {
      this._bottomDegrees = val;
      this._cache.invalidateAll();
    }
  }
  get topDegrees() {
    return this._topDegrees;
  }
  set topDegrees(val) {
    if (val !== this._topDegrees) {
      this._topDegrees = val;
      this._cache.invalidateAll();
    }
  }
  get nearMeters() {
    return this._nearMeters;
  }
  set nearMeters(val) {
    if (val !== this._nearMeters) {
      this._nearMeters = val;
      this._cache.invalidateAll();
    }
  }
  get farMeters() {
    return this._farMeters;
  }
  set farMeters(val) {
    if (val !== this._farMeters) {
      this._farMeters = val;
      this._cache.invalidateAll();
    }
  }
  get sizeDegrees() {
    this._size.set(this.rightDegrees - this.leftDegrees, this.topDegrees - this.bottomDegrees);
    return this._size;
  }
  get diagonalDegrees() {
    const size = this.sizeDegrees;
    return Math.acos(Math.cos(size.x * DEG2RAD) * Math.cos(size.y * DEG2RAD)) * RAD2DEG;
  }
  get centerDegrees() {
    const size = this.sizeDegrees;
    return this._center.set(this.leftDegrees + size.x / 2, this.bottomDegrees + size.y / 2);
  }
  get angleToCenter() {
    const position = this.centerDegrees;
    return Math.acos(Math.cos(position.x * DEG2RAD) * Math.cos(position.y * DEG2RAD)) * RAD2DEG;
  }
  get angleToTopLeft() {
    return Math.acos(Math.cos(this.leftDegrees * DEG2RAD) * Math.cos(this.topDegrees * DEG2RAD)) * RAD2DEG;
  }
  get angleToTopRight() {
    return Math.acos(Math.cos(this.rightDegrees * DEG2RAD) * Math.cos(this.topDegrees * DEG2RAD)) * RAD2DEG;
  }
  get angleToBottomLeft() {
    return Math.acos(Math.cos(this.leftDegrees * DEG2RAD) * Math.cos(this.bottomDegrees * DEG2RAD)) * RAD2DEG;
  }
  get angleToBottomRight() {
    return Math.acos(Math.cos(this.rightDegrees * DEG2RAD) * Math.cos(this.bottomDegrees * DEG2RAD)) * RAD2DEG;
  }
  get angleToClosestPoint() {
    const clampedX = Math.min(Math.max(0, this.leftDegrees), this.rightDegrees);
    const clampedY = Math.min(Math.max(0, this.bottomDegrees), this.topDegrees);
    return Math.acos(Math.cos(clampedX * DEG2RAD) * Math.cos(clampedY * DEG2RAD)) * RAD2DEG;
  }
  get angleToFarthestPoint() {
    return Math.max(this.angleToTopLeft, this.angleToTopRight, this.angleToBottomLeft, this.angleToBottomRight);
  }
  get depth() {
    return this.farMeters - this.nearMeters;
  }
  get distance() {
    return this.nearMeters + this.depth / 2;
  }
  get aspectRatio() {
    const near = this.nearMeters;
    const left = near * Math.tan(this.leftDegrees * DEG2RAD);
    const right = near * Math.tan(this.rightDegrees * DEG2RAD);
    const top = near * Math.tan(this.topDegrees * DEG2RAD);
    const bottom = near * Math.tan(this.bottomDegrees * DEG2RAD);
    return (top - bottom) / (right - left);
  }
  setFromPerspectiveProjectionMatrix(projectionMatrix, ndcBounds = this._fullNDC) {
    const inverseProjection = this._inverseProjection.copy(projectionMatrix).invert();
    const v = this._v1;
    const forward = this._forwardDirection;
    const leftDegrees = Math.sign(ndcBounds.min.x) * v.set(ndcBounds.min.x, 0, -1).applyMatrix4(inverseProjection).angleTo(forward) * RAD2DEG;
    const rightDegrees = Math.sign(ndcBounds.max.x) * v.set(ndcBounds.max.x, 0, -1).applyMatrix4(inverseProjection).angleTo(forward) * RAD2DEG;
    const topDegrees = Math.sign(ndcBounds.max.y) * v.set(0, ndcBounds.max.y, -1).applyMatrix4(inverseProjection).angleTo(forward) * RAD2DEG;
    const bottomDegrees = Math.sign(ndcBounds.min.y) * v.set(0, ndcBounds.min.y, -1).applyMatrix4(inverseProjection).angleTo(forward) * RAD2DEG;
    const nearMeters = -v.set(0, 0, ndcBounds.min.z).applyMatrix4(inverseProjection).z;
    const farMeters = -v.set(0, 0, ndcBounds.max.z).applyMatrix4(inverseProjection).z;
    this.leftDegrees = leftDegrees;
    this.rightDegrees = rightDegrees;
    this.topDegrees = topDegrees;
    this.bottomDegrees = bottomDegrees;
    this.nearMeters = nearMeters;
    this.farMeters = farMeters;
    return this;
  }
  get perspectiveProjectionMatrix() {
    return this._cachedPerspectiveProjectionMatrix();
  }
  overlapPercent(f) {
    this._boxA.min.x = this.leftDegrees;
    this._boxA.max.x = this.rightDegrees;
    this._boxA.min.y = this.bottomDegrees;
    this._boxA.max.y = this.topDegrees;
    this._boxB.min.x = f.leftDegrees;
    this._boxB.max.x = f.rightDegrees;
    this._boxB.min.y = f.bottomDegrees;
    this._boxB.max.y = f.topDegrees;
    const size = this._boxA.intersect(this._boxB).getSize(this._overlapSize);
    return size.length() / this.sizeDegrees.length();
  }
}
var DEFAULT_CONFIG = {
  epsilon: 1e-12,
  matrix: "Matrix",
  number: "number",
  precision: 64,
  predictable: false,
  randomSeed: null
};
function isNumber(x) {
  return typeof x === "number";
}
function isBigNumber(x) {
  return x && x.constructor.prototype.isBigNumber === true || false;
}
function isComplex(x) {
  return x && typeof x === "object" && Object.getPrototypeOf(x).isComplex === true || false;
}
function isFraction(x) {
  return x && typeof x === "object" && Object.getPrototypeOf(x).isFraction === true || false;
}
function isUnit(x) {
  return x && x.constructor.prototype.isUnit === true || false;
}
function isString(x) {
  return typeof x === "string";
}
var isArray = Array.isArray;
function isMatrix(x) {
  return x && x.constructor.prototype.isMatrix === true || false;
}
function isCollection(x) {
  return Array.isArray(x) || isMatrix(x);
}
function isDenseMatrix(x) {
  return x && x.isDenseMatrix && x.constructor.prototype.isMatrix === true || false;
}
function isSparseMatrix(x) {
  return x && x.isSparseMatrix && x.constructor.prototype.isMatrix === true || false;
}
function isRange(x) {
  return x && x.constructor.prototype.isRange === true || false;
}
function isIndex(x) {
  return x && x.constructor.prototype.isIndex === true || false;
}
function isBoolean(x) {
  return typeof x === "boolean";
}
function isResultSet(x) {
  return x && x.constructor.prototype.isResultSet === true || false;
}
function isHelp(x) {
  return x && x.constructor.prototype.isHelp === true || false;
}
function isFunction(x) {
  return typeof x === "function";
}
function isDate(x) {
  return x instanceof Date;
}
function isRegExp(x) {
  return x instanceof RegExp;
}
function isObject(x) {
  return !!(x && typeof x === "object" && x.constructor === Object && !isComplex(x) && !isFraction(x));
}
function isNull(x) {
  return x === null;
}
function isUndefined(x) {
  return x === void 0;
}
function isAccessorNode(x) {
  return x && x.isAccessorNode === true && x.constructor.prototype.isNode === true || false;
}
function isArrayNode(x) {
  return x && x.isArrayNode === true && x.constructor.prototype.isNode === true || false;
}
function isAssignmentNode(x) {
  return x && x.isAssignmentNode === true && x.constructor.prototype.isNode === true || false;
}
function isBlockNode(x) {
  return x && x.isBlockNode === true && x.constructor.prototype.isNode === true || false;
}
function isConditionalNode(x) {
  return x && x.isConditionalNode === true && x.constructor.prototype.isNode === true || false;
}
function isConstantNode(x) {
  return x && x.isConstantNode === true && x.constructor.prototype.isNode === true || false;
}
function isFunctionAssignmentNode(x) {
  return x && x.isFunctionAssignmentNode === true && x.constructor.prototype.isNode === true || false;
}
function isFunctionNode(x) {
  return x && x.isFunctionNode === true && x.constructor.prototype.isNode === true || false;
}
function isIndexNode(x) {
  return x && x.isIndexNode === true && x.constructor.prototype.isNode === true || false;
}
function isNode(x) {
  return x && x.isNode === true && x.constructor.prototype.isNode === true || false;
}
function isObjectNode(x) {
  return x && x.isObjectNode === true && x.constructor.prototype.isNode === true || false;
}
function isOperatorNode(x) {
  return x && x.isOperatorNode === true && x.constructor.prototype.isNode === true || false;
}
function isParenthesisNode(x) {
  return x && x.isParenthesisNode === true && x.constructor.prototype.isNode === true || false;
}
function isRangeNode(x) {
  return x && x.isRangeNode === true && x.constructor.prototype.isNode === true || false;
}
function isSymbolNode(x) {
  return x && x.isSymbolNode === true && x.constructor.prototype.isNode === true || false;
}
function isChain(x) {
  return x && x.constructor.prototype.isChain === true || false;
}
function typeOf(x) {
  var t = typeof x;
  if (t === "object") {
    if (x === null)
      return "null";
    if (Array.isArray(x))
      return "Array";
    if (x instanceof Date)
      return "Date";
    if (x instanceof RegExp)
      return "RegExp";
    if (isBigNumber(x))
      return "BigNumber";
    if (isComplex(x))
      return "Complex";
    if (isFraction(x))
      return "Fraction";
    if (isMatrix(x))
      return "Matrix";
    if (isUnit(x))
      return "Unit";
    if (isIndex(x))
      return "Index";
    if (isRange(x))
      return "Range";
    if (isResultSet(x))
      return "ResultSet";
    if (isNode(x))
      return x.type;
    if (isChain(x))
      return "Chain";
    if (isHelp(x))
      return "Help";
    return "Object";
  }
  if (t === "function")
    return "Function";
  return t;
}
function clone$1(x) {
  var type = typeof x;
  if (type === "number" || type === "string" || type === "boolean" || x === null || x === void 0) {
    return x;
  }
  if (typeof x.clone === "function") {
    return x.clone();
  }
  if (Array.isArray(x)) {
    return x.map(function(value) {
      return clone$1(value);
    });
  }
  if (x instanceof Date)
    return new Date(x.valueOf());
  if (isBigNumber(x))
    return x;
  if (x instanceof RegExp)
    throw new TypeError("Cannot clone " + x);
  return mapObject(x, clone$1);
}
function mapObject(object, callback) {
  var clone2 = {};
  for (var key in object) {
    if (hasOwnProperty$1(object, key)) {
      clone2[key] = callback(object[key]);
    }
  }
  return clone2;
}
function extend(a2, b2) {
  for (var prop in b2) {
    if (hasOwnProperty$1(b2, prop)) {
      a2[prop] = b2[prop];
    }
  }
  return a2;
}
function deepExtend(a2, b2) {
  if (Array.isArray(b2)) {
    throw new TypeError("Arrays are not supported by deepExtend");
  }
  for (var prop in b2) {
    if (hasOwnProperty$1(b2, prop) && !(prop in Object.prototype) && !(prop in Function.prototype)) {
      if (b2[prop] && b2[prop].constructor === Object) {
        if (a2[prop] === void 0) {
          a2[prop] = {};
        }
        if (a2[prop] && a2[prop].constructor === Object) {
          deepExtend(a2[prop], b2[prop]);
        } else {
          a2[prop] = b2[prop];
        }
      } else if (Array.isArray(b2[prop])) {
        throw new TypeError("Arrays are not supported by deepExtend");
      } else {
        a2[prop] = b2[prop];
      }
    }
  }
  return a2;
}
function deepStrictEqual(a2, b2) {
  var prop, i, len;
  if (Array.isArray(a2)) {
    if (!Array.isArray(b2)) {
      return false;
    }
    if (a2.length !== b2.length) {
      return false;
    }
    for (i = 0, len = a2.length; i < len; i++) {
      if (!deepStrictEqual(a2[i], b2[i])) {
        return false;
      }
    }
    return true;
  } else if (typeof a2 === "function") {
    return a2 === b2;
  } else if (a2 instanceof Object) {
    if (Array.isArray(b2) || !(b2 instanceof Object)) {
      return false;
    }
    for (prop in a2) {
      if (!(prop in b2) || !deepStrictEqual(a2[prop], b2[prop])) {
        return false;
      }
    }
    for (prop in b2) {
      if (!(prop in a2) || !deepStrictEqual(a2[prop], b2[prop])) {
        return false;
      }
    }
    return true;
  } else {
    return a2 === b2;
  }
}
function deepFlatten(nestedObject) {
  var flattenedObject = {};
  _deepFlatten(nestedObject, flattenedObject);
  return flattenedObject;
}
function _deepFlatten(nestedObject, flattenedObject) {
  for (var prop in nestedObject) {
    if (hasOwnProperty$1(nestedObject, prop)) {
      var value = nestedObject[prop];
      if (typeof value === "object" && value !== null) {
        _deepFlatten(value, flattenedObject);
      } else {
        flattenedObject[prop] = value;
      }
    }
  }
}
function lazy(object, prop, valueResolver) {
  var _uninitialized = true;
  var _value;
  Object.defineProperty(object, prop, {
    get: function get() {
      if (_uninitialized) {
        _value = valueResolver();
        _uninitialized = false;
      }
      return _value;
    },
    set: function set(value) {
      _value = value;
      _uninitialized = false;
    },
    configurable: true,
    enumerable: true
  });
}
function hasOwnProperty$1(object, property) {
  return object && Object.hasOwnProperty.call(object, property);
}
function isLegacyFactory(object) {
  return object && typeof object.factory === "function";
}
function pickShallow(object, properties2) {
  var copy = {};
  for (var i = 0; i < properties2.length; i++) {
    var key = properties2[i];
    var value = object[key];
    if (value !== void 0) {
      copy[key] = value;
    }
  }
  return copy;
}
function values(object) {
  return Object.keys(object).map((key) => object[key]);
}
var MATRIX_OPTIONS = ["Matrix", "Array"];
var NUMBER_OPTIONS = ["number", "BigNumber", "Fraction"];
function configFactory(config2, emit) {
  function _config(options) {
    if (options) {
      var prev = mapObject(config2, clone$1);
      validateOption(options, "matrix", MATRIX_OPTIONS);
      validateOption(options, "number", NUMBER_OPTIONS);
      deepExtend(config2, options);
      var curr = mapObject(config2, clone$1);
      var changes = mapObject(options, clone$1);
      emit("config", curr, prev, changes);
      return curr;
    } else {
      return mapObject(config2, clone$1);
    }
  }
  _config.MATRIX_OPTIONS = MATRIX_OPTIONS;
  _config.NUMBER_OPTIONS = NUMBER_OPTIONS;
  Object.keys(DEFAULT_CONFIG).forEach((key) => {
    Object.defineProperty(_config, key, {
      get: () => config2[key],
      enumerable: true,
      configurable: true
    });
  });
  return _config;
}
function contains$1(array, item) {
  return array.indexOf(item) !== -1;
}
function validateOption(options, name2, values2) {
  if (options[name2] !== void 0 && !contains$1(values2, options[name2])) {
    console.warn('Warning: Unknown value "' + options[name2] + '" for configuration option "' + name2 + '". Available options: ' + values2.map((value) => JSON.stringify(value)).join(", ") + ".");
  }
}
var commonjsGlobal = typeof globalThis !== "undefined" ? globalThis : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : {};
function getDefaultExportFromCjs(x) {
  return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, "default") ? x["default"] : x;
}
var typedFunction$1 = { exports: {} };
(function(module, exports) {
  (function(root, factory2) {
    {
      module.exports = factory2();
    }
  })(commonjsGlobal, function() {
    function ok() {
      return true;
    }
    function notOk() {
      return false;
    }
    function undef() {
      return void 0;
    }
    function create2() {
      var _types = [
        { name: "number", test: function(x) {
          return typeof x === "number";
        } },
        { name: "string", test: function(x) {
          return typeof x === "string";
        } },
        { name: "boolean", test: function(x) {
          return typeof x === "boolean";
        } },
        { name: "Function", test: function(x) {
          return typeof x === "function";
        } },
        { name: "Array", test: Array.isArray },
        { name: "Date", test: function(x) {
          return x instanceof Date;
        } },
        { name: "RegExp", test: function(x) {
          return x instanceof RegExp;
        } },
        { name: "Object", test: function(x) {
          return typeof x === "object" && x !== null && x.constructor === Object;
        } },
        { name: "null", test: function(x) {
          return x === null;
        } },
        { name: "undefined", test: function(x) {
          return x === void 0;
        } }
      ];
      var anyType = {
        name: "any",
        test: ok
      };
      var _ignore = [];
      var _conversions = [];
      var typed = {
        types: _types,
        conversions: _conversions,
        ignore: _ignore
      };
      function findTypeByName(typeName) {
        var entry = findInArray(typed.types, function(entry2) {
          return entry2.name === typeName;
        });
        if (entry) {
          return entry;
        }
        if (typeName === "any") {
          return anyType;
        }
        var hint = findInArray(typed.types, function(entry2) {
          return entry2.name.toLowerCase() === typeName.toLowerCase();
        });
        throw new TypeError('Unknown type "' + typeName + '"' + (hint ? '. Did you mean "' + hint.name + '"?' : ""));
      }
      function findTypeIndex(type) {
        if (type === anyType) {
          return 999;
        }
        return typed.types.indexOf(type);
      }
      function findTypeName(value) {
        var entry = findInArray(typed.types, function(entry2) {
          return entry2.test(value);
        });
        if (entry) {
          return entry.name;
        }
        throw new TypeError("Value has unknown type. Value: " + value);
      }
      function find(fn, signature) {
        if (!fn.signatures) {
          throw new TypeError("Function is no typed-function");
        }
        var arr;
        if (typeof signature === "string") {
          arr = signature.split(",");
          for (var i = 0; i < arr.length; i++) {
            arr[i] = arr[i].trim();
          }
        } else if (Array.isArray(signature)) {
          arr = signature;
        } else {
          throw new TypeError("String array or a comma separated string expected");
        }
        var str = arr.join(",");
        var match = fn.signatures[str];
        if (match) {
          return match;
        }
        throw new TypeError("Signature not found (signature: " + (fn.name || "unnamed") + "(" + arr.join(", ") + "))");
      }
      function convert(value, type) {
        var from = findTypeName(value);
        if (type === from) {
          return value;
        }
        for (var i = 0; i < typed.conversions.length; i++) {
          var conversion = typed.conversions[i];
          if (conversion.from === from && conversion.to === type) {
            return conversion.convert(value);
          }
        }
        throw new Error("Cannot convert from " + from + " to " + type);
      }
      function stringifyParams(params) {
        return params.map(function(param) {
          var typeNames = param.types.map(getTypeName);
          return (param.restParam ? "..." : "") + typeNames.join("|");
        }).join(",");
      }
      function parseParam(param, conversions) {
        var restParam = param.indexOf("...") === 0;
        var types = !restParam ? param : param.length > 3 ? param.slice(3) : "any";
        var typeNames = types.split("|").map(trim).filter(notEmpty).filter(notIgnore);
        var matchingConversions = filterConversions(conversions, typeNames);
        var exactTypes = typeNames.map(function(typeName) {
          var type = findTypeByName(typeName);
          return {
            name: typeName,
            typeIndex: findTypeIndex(type),
            test: type.test,
            conversion: null,
            conversionIndex: -1
          };
        });
        var convertibleTypes = matchingConversions.map(function(conversion) {
          var type = findTypeByName(conversion.from);
          return {
            name: conversion.from,
            typeIndex: findTypeIndex(type),
            test: type.test,
            conversion,
            conversionIndex: conversions.indexOf(conversion)
          };
        });
        return {
          types: exactTypes.concat(convertibleTypes),
          restParam
        };
      }
      function parseSignature(signature, fn, conversions) {
        var params = [];
        if (signature.trim() !== "") {
          params = signature.split(",").map(trim).map(function(param, index, array) {
            var parsedParam = parseParam(param, conversions);
            if (parsedParam.restParam && index !== array.length - 1) {
              throw new SyntaxError('Unexpected rest parameter "' + param + '": only allowed for the last parameter');
            }
            return parsedParam;
          });
        }
        if (params.some(isInvalidParam)) {
          return null;
        }
        return {
          params,
          fn
        };
      }
      function hasRestParam(params) {
        var param = last(params);
        return param ? param.restParam : false;
      }
      function hasConversions(param) {
        return param.types.some(function(type) {
          return type.conversion != null;
        });
      }
      function compileTest(param) {
        if (!param || param.types.length === 0) {
          return ok;
        } else if (param.types.length === 1) {
          return findTypeByName(param.types[0].name).test;
        } else if (param.types.length === 2) {
          var test0 = findTypeByName(param.types[0].name).test;
          var test1 = findTypeByName(param.types[1].name).test;
          return function or(x) {
            return test0(x) || test1(x);
          };
        } else {
          var tests = param.types.map(function(type) {
            return findTypeByName(type.name).test;
          });
          return function or(x) {
            for (var i = 0; i < tests.length; i++) {
              if (tests[i](x)) {
                return true;
              }
            }
            return false;
          };
        }
      }
      function compileTests(params) {
        var tests, test0, test1;
        if (hasRestParam(params)) {
          tests = initial(params).map(compileTest);
          var varIndex = tests.length;
          var lastTest = compileTest(last(params));
          var testRestParam = function(args) {
            for (var i = varIndex; i < args.length; i++) {
              if (!lastTest(args[i])) {
                return false;
              }
            }
            return true;
          };
          return function testArgs(args) {
            for (var i = 0; i < tests.length; i++) {
              if (!tests[i](args[i])) {
                return false;
              }
            }
            return testRestParam(args) && args.length >= varIndex + 1;
          };
        } else {
          if (params.length === 0) {
            return function testArgs(args) {
              return args.length === 0;
            };
          } else if (params.length === 1) {
            test0 = compileTest(params[0]);
            return function testArgs(args) {
              return test0(args[0]) && args.length === 1;
            };
          } else if (params.length === 2) {
            test0 = compileTest(params[0]);
            test1 = compileTest(params[1]);
            return function testArgs(args) {
              return test0(args[0]) && test1(args[1]) && args.length === 2;
            };
          } else {
            tests = params.map(compileTest);
            return function testArgs(args) {
              for (var i = 0; i < tests.length; i++) {
                if (!tests[i](args[i])) {
                  return false;
                }
              }
              return args.length === tests.length;
            };
          }
        }
      }
      function getParamAtIndex(signature, index) {
        return index < signature.params.length ? signature.params[index] : hasRestParam(signature.params) ? last(signature.params) : null;
      }
      function getExpectedTypeNames(signature, index, excludeConversions) {
        var param = getParamAtIndex(signature, index);
        var types = param ? excludeConversions ? param.types.filter(isExactType) : param.types : [];
        return types.map(getTypeName);
      }
      function getTypeName(type) {
        return type.name;
      }
      function isExactType(type) {
        return type.conversion === null || type.conversion === void 0;
      }
      function mergeExpectedParams(signatures, index) {
        var typeNames = uniq(flatMap(signatures, function(signature) {
          return getExpectedTypeNames(signature, index, false);
        }));
        return typeNames.indexOf("any") !== -1 ? ["any"] : typeNames;
      }
      function createError(name2, args, signatures) {
        var err, expected;
        var _name = name2 || "unnamed";
        var matchingSignatures = signatures;
        var index;
        for (index = 0; index < args.length; index++) {
          var nextMatchingDefs = matchingSignatures.filter(function(signature) {
            var test = compileTest(getParamAtIndex(signature, index));
            return (index < signature.params.length || hasRestParam(signature.params)) && test(args[index]);
          });
          if (nextMatchingDefs.length === 0) {
            expected = mergeExpectedParams(matchingSignatures, index);
            if (expected.length > 0) {
              var actualType = findTypeName(args[index]);
              err = new TypeError("Unexpected type of argument in function " + _name + " (expected: " + expected.join(" or ") + ", actual: " + actualType + ", index: " + index + ")");
              err.data = {
                category: "wrongType",
                fn: _name,
                index,
                actual: actualType,
                expected
              };
              return err;
            }
          } else {
            matchingSignatures = nextMatchingDefs;
          }
        }
        var lengths = matchingSignatures.map(function(signature) {
          return hasRestParam(signature.params) ? Infinity : signature.params.length;
        });
        if (args.length < Math.min.apply(null, lengths)) {
          expected = mergeExpectedParams(matchingSignatures, index);
          err = new TypeError("Too few arguments in function " + _name + " (expected: " + expected.join(" or ") + ", index: " + args.length + ")");
          err.data = {
            category: "tooFewArgs",
            fn: _name,
            index: args.length,
            expected
          };
          return err;
        }
        var maxLength = Math.max.apply(null, lengths);
        if (args.length > maxLength) {
          err = new TypeError("Too many arguments in function " + _name + " (expected: " + maxLength + ", actual: " + args.length + ")");
          err.data = {
            category: "tooManyArgs",
            fn: _name,
            index: args.length,
            expectedLength: maxLength
          };
          return err;
        }
        err = new TypeError('Arguments of type "' + args.join(", ") + '" do not match any of the defined signatures of function ' + _name + ".");
        err.data = {
          category: "mismatch",
          actual: args.map(findTypeName)
        };
        return err;
      }
      function getLowestTypeIndex(param) {
        var min2 = 999;
        for (var i = 0; i < param.types.length; i++) {
          if (isExactType(param.types[i])) {
            min2 = Math.min(min2, param.types[i].typeIndex);
          }
        }
        return min2;
      }
      function getLowestConversionIndex(param) {
        var min2 = 999;
        for (var i = 0; i < param.types.length; i++) {
          if (!isExactType(param.types[i])) {
            min2 = Math.min(min2, param.types[i].conversionIndex);
          }
        }
        return min2;
      }
      function compareParams(param1, param2) {
        var c2;
        c2 = param1.restParam - param2.restParam;
        if (c2 !== 0) {
          return c2;
        }
        c2 = hasConversions(param1) - hasConversions(param2);
        if (c2 !== 0) {
          return c2;
        }
        c2 = getLowestTypeIndex(param1) - getLowestTypeIndex(param2);
        if (c2 !== 0) {
          return c2;
        }
        return getLowestConversionIndex(param1) - getLowestConversionIndex(param2);
      }
      function compareSignatures(signature1, signature2) {
        var len = Math.min(signature1.params.length, signature2.params.length);
        var i;
        var c2;
        c2 = signature1.params.some(hasConversions) - signature2.params.some(hasConversions);
        if (c2 !== 0) {
          return c2;
        }
        for (i = 0; i < len; i++) {
          c2 = hasConversions(signature1.params[i]) - hasConversions(signature2.params[i]);
          if (c2 !== 0) {
            return c2;
          }
        }
        for (i = 0; i < len; i++) {
          c2 = compareParams(signature1.params[i], signature2.params[i]);
          if (c2 !== 0) {
            return c2;
          }
        }
        return signature1.params.length - signature2.params.length;
      }
      function filterConversions(conversions, typeNames) {
        var matches = {};
        conversions.forEach(function(conversion) {
          if (typeNames.indexOf(conversion.from) === -1 && typeNames.indexOf(conversion.to) !== -1 && !matches[conversion.from]) {
            matches[conversion.from] = conversion;
          }
        });
        return Object.keys(matches).map(function(from) {
          return matches[from];
        });
      }
      function compileArgsPreprocessing(params, fn) {
        var fnConvert = fn;
        if (params.some(hasConversions)) {
          var restParam = hasRestParam(params);
          var compiledConversions = params.map(compileArgConversion);
          fnConvert = function convertArgs() {
            var args = [];
            var last2 = restParam ? arguments.length - 1 : arguments.length;
            for (var i = 0; i < last2; i++) {
              args[i] = compiledConversions[i](arguments[i]);
            }
            if (restParam) {
              args[last2] = arguments[last2].map(compiledConversions[last2]);
            }
            return fn.apply(this, args);
          };
        }
        var fnPreprocess = fnConvert;
        if (hasRestParam(params)) {
          var offset = params.length - 1;
          fnPreprocess = function preprocessRestParams() {
            return fnConvert.apply(this, slice(arguments, 0, offset).concat([slice(arguments, offset)]));
          };
        }
        return fnPreprocess;
      }
      function compileArgConversion(param) {
        var test0, test1, conversion0, conversion1;
        var tests = [];
        var conversions = [];
        param.types.forEach(function(type) {
          if (type.conversion) {
            tests.push(findTypeByName(type.conversion.from).test);
            conversions.push(type.conversion.convert);
          }
        });
        switch (conversions.length) {
          case 0:
            return function convertArg(arg) {
              return arg;
            };
          case 1:
            test0 = tests[0];
            conversion0 = conversions[0];
            return function convertArg(arg) {
              if (test0(arg)) {
                return conversion0(arg);
              }
              return arg;
            };
          case 2:
            test0 = tests[0];
            test1 = tests[1];
            conversion0 = conversions[0];
            conversion1 = conversions[1];
            return function convertArg(arg) {
              if (test0(arg)) {
                return conversion0(arg);
              }
              if (test1(arg)) {
                return conversion1(arg);
              }
              return arg;
            };
          default:
            return function convertArg(arg) {
              for (var i = 0; i < conversions.length; i++) {
                if (tests[i](arg)) {
                  return conversions[i](arg);
                }
              }
              return arg;
            };
        }
      }
      function createSignaturesMap(signatures) {
        var signaturesMap = {};
        signatures.forEach(function(signature) {
          if (!signature.params.some(hasConversions)) {
            splitParams(signature.params, true).forEach(function(params) {
              signaturesMap[stringifyParams(params)] = signature.fn;
            });
          }
        });
        return signaturesMap;
      }
      function splitParams(params, ignoreConversionTypes) {
        function _splitParams(params2, index, types) {
          if (index < params2.length) {
            var param = params2[index];
            var filteredTypes = ignoreConversionTypes ? param.types.filter(isExactType) : param.types;
            var typeGroups;
            if (param.restParam) {
              var exactTypes = filteredTypes.filter(isExactType);
              typeGroups = exactTypes.length < filteredTypes.length ? [exactTypes, filteredTypes] : [filteredTypes];
            } else {
              typeGroups = filteredTypes.map(function(type) {
                return [type];
              });
            }
            return flatMap(typeGroups, function(typeGroup) {
              return _splitParams(params2, index + 1, types.concat([typeGroup]));
            });
          } else {
            var splittedParams = types.map(function(type, typeIndex) {
              return {
                types: type,
                restParam: typeIndex === params2.length - 1 && hasRestParam(params2)
              };
            });
            return [splittedParams];
          }
        }
        return _splitParams(params, 0, []);
      }
      function hasConflictingParams(signature1, signature2) {
        var ii = Math.max(signature1.params.length, signature2.params.length);
        for (var i = 0; i < ii; i++) {
          var typesNames1 = getExpectedTypeNames(signature1, i, true);
          var typesNames2 = getExpectedTypeNames(signature2, i, true);
          if (!hasOverlap(typesNames1, typesNames2)) {
            return false;
          }
        }
        var len1 = signature1.params.length;
        var len2 = signature2.params.length;
        var restParam1 = hasRestParam(signature1.params);
        var restParam2 = hasRestParam(signature2.params);
        return restParam1 ? restParam2 ? len1 === len2 : len2 >= len1 : restParam2 ? len1 >= len2 : len1 === len2;
      }
      function createTypedFunction(name2, signaturesMap) {
        if (Object.keys(signaturesMap).length === 0) {
          throw new SyntaxError("No signatures provided");
        }
        var parsedSignatures = [];
        Object.keys(signaturesMap).map(function(signature) {
          return parseSignature(signature, signaturesMap[signature], typed.conversions);
        }).filter(notNull).forEach(function(parsedSignature) {
          var conflictingSignature = findInArray(parsedSignatures, function(s) {
            return hasConflictingParams(s, parsedSignature);
          });
          if (conflictingSignature) {
            throw new TypeError('Conflicting signatures "' + stringifyParams(conflictingSignature.params) + '" and "' + stringifyParams(parsedSignature.params) + '".');
          }
          parsedSignatures.push(parsedSignature);
        });
        var signatures = flatMap(parsedSignatures, function(parsedSignature) {
          var params = parsedSignature ? splitParams(parsedSignature.params, false) : [];
          return params.map(function(params2) {
            return {
              params: params2,
              fn: parsedSignature.fn
            };
          });
        }).filter(notNull);
        signatures.sort(compareSignatures);
        var ok0 = signatures[0] && signatures[0].params.length <= 2 && !hasRestParam(signatures[0].params);
        var ok1 = signatures[1] && signatures[1].params.length <= 2 && !hasRestParam(signatures[1].params);
        var ok2 = signatures[2] && signatures[2].params.length <= 2 && !hasRestParam(signatures[2].params);
        var ok3 = signatures[3] && signatures[3].params.length <= 2 && !hasRestParam(signatures[3].params);
        var ok4 = signatures[4] && signatures[4].params.length <= 2 && !hasRestParam(signatures[4].params);
        var ok5 = signatures[5] && signatures[5].params.length <= 2 && !hasRestParam(signatures[5].params);
        var allOk = ok0 && ok1 && ok2 && ok3 && ok4 && ok5;
        var tests = signatures.map(function(signature) {
          return compileTests(signature.params);
        });
        var test00 = ok0 ? compileTest(signatures[0].params[0]) : notOk;
        var test10 = ok1 ? compileTest(signatures[1].params[0]) : notOk;
        var test20 = ok2 ? compileTest(signatures[2].params[0]) : notOk;
        var test30 = ok3 ? compileTest(signatures[3].params[0]) : notOk;
        var test40 = ok4 ? compileTest(signatures[4].params[0]) : notOk;
        var test50 = ok5 ? compileTest(signatures[5].params[0]) : notOk;
        var test01 = ok0 ? compileTest(signatures[0].params[1]) : notOk;
        var test11 = ok1 ? compileTest(signatures[1].params[1]) : notOk;
        var test21 = ok2 ? compileTest(signatures[2].params[1]) : notOk;
        var test31 = ok3 ? compileTest(signatures[3].params[1]) : notOk;
        var test41 = ok4 ? compileTest(signatures[4].params[1]) : notOk;
        var test51 = ok5 ? compileTest(signatures[5].params[1]) : notOk;
        var fns = signatures.map(function(signature) {
          return compileArgsPreprocessing(signature.params, signature.fn);
        });
        var fn0 = ok0 ? fns[0] : undef;
        var fn1 = ok1 ? fns[1] : undef;
        var fn2 = ok2 ? fns[2] : undef;
        var fn3 = ok3 ? fns[3] : undef;
        var fn4 = ok4 ? fns[4] : undef;
        var fn5 = ok5 ? fns[5] : undef;
        var len0 = ok0 ? signatures[0].params.length : -1;
        var len1 = ok1 ? signatures[1].params.length : -1;
        var len2 = ok2 ? signatures[2].params.length : -1;
        var len3 = ok3 ? signatures[3].params.length : -1;
        var len4 = ok4 ? signatures[4].params.length : -1;
        var len5 = ok5 ? signatures[5].params.length : -1;
        var iStart = allOk ? 6 : 0;
        var iEnd = signatures.length;
        var generic = function generic2() {
          for (var i = iStart; i < iEnd; i++) {
            if (tests[i](arguments)) {
              return fns[i].apply(this, arguments);
            }
          }
          throw createError(name2, arguments, signatures);
        };
        var fn = function fn6(arg0, arg1) {
          if (arguments.length === len0 && test00(arg0) && test01(arg1)) {
            return fn0.apply(fn6, arguments);
          }
          if (arguments.length === len1 && test10(arg0) && test11(arg1)) {
            return fn1.apply(fn6, arguments);
          }
          if (arguments.length === len2 && test20(arg0) && test21(arg1)) {
            return fn2.apply(fn6, arguments);
          }
          if (arguments.length === len3 && test30(arg0) && test31(arg1)) {
            return fn3.apply(fn6, arguments);
          }
          if (arguments.length === len4 && test40(arg0) && test41(arg1)) {
            return fn4.apply(fn6, arguments);
          }
          if (arguments.length === len5 && test50(arg0) && test51(arg1)) {
            return fn5.apply(fn6, arguments);
          }
          return generic.apply(fn6, arguments);
        };
        try {
          Object.defineProperty(fn, "name", { value: name2 });
        } catch (err) {
        }
        fn.signatures = createSignaturesMap(signatures);
        return fn;
      }
      function notIgnore(typeName) {
        return typed.ignore.indexOf(typeName) === -1;
      }
      function trim(str) {
        return str.trim();
      }
      function notEmpty(str) {
        return !!str;
      }
      function notNull(value) {
        return value !== null;
      }
      function isInvalidParam(param) {
        return param.types.length === 0;
      }
      function initial(arr) {
        return arr.slice(0, arr.length - 1);
      }
      function last(arr) {
        return arr[arr.length - 1];
      }
      function slice(arr, start, end) {
        return Array.prototype.slice.call(arr, start, end);
      }
      function contains2(array, item) {
        return array.indexOf(item) !== -1;
      }
      function hasOverlap(array1, array2) {
        for (var i = 0; i < array1.length; i++) {
          if (contains2(array2, array1[i])) {
            return true;
          }
        }
        return false;
      }
      function findInArray(arr, test) {
        for (var i = 0; i < arr.length; i++) {
          if (test(arr[i])) {
            return arr[i];
          }
        }
        return void 0;
      }
      function uniq(arr) {
        var entries = {};
        for (var i = 0; i < arr.length; i++) {
          entries[arr[i]] = true;
        }
        return Object.keys(entries);
      }
      function flatMap(arr, callback) {
        return Array.prototype.concat.apply([], arr.map(callback));
      }
      function getName(fns) {
        var name2 = "";
        for (var i = 0; i < fns.length; i++) {
          var fn = fns[i];
          if ((typeof fn.signatures === "object" || typeof fn.signature === "string") && fn.name !== "") {
            if (name2 === "") {
              name2 = fn.name;
            } else if (name2 !== fn.name) {
              var err = new Error("Function names do not match (expected: " + name2 + ", actual: " + fn.name + ")");
              err.data = {
                actual: fn.name,
                expected: name2
              };
              throw err;
            }
          }
        }
        return name2;
      }
      function extractSignatures(fns) {
        var err;
        var signaturesMap = {};
        function validateUnique(_signature, _fn) {
          if (signaturesMap.hasOwnProperty(_signature) && _fn !== signaturesMap[_signature]) {
            err = new Error('Signature "' + _signature + '" is defined twice');
            err.data = { signature: _signature };
            throw err;
          }
        }
        for (var i = 0; i < fns.length; i++) {
          var fn = fns[i];
          if (typeof fn.signatures === "object") {
            for (var signature in fn.signatures) {
              if (fn.signatures.hasOwnProperty(signature)) {
                validateUnique(signature, fn.signatures[signature]);
                signaturesMap[signature] = fn.signatures[signature];
              }
            }
          } else if (typeof fn.signature === "string") {
            validateUnique(fn.signature, fn);
            signaturesMap[fn.signature] = fn;
          } else {
            err = new TypeError("Function is no typed-function (index: " + i + ")");
            err.data = { index: i };
            throw err;
          }
        }
        return signaturesMap;
      }
      typed = createTypedFunction("typed", {
        "string, Object": createTypedFunction,
        "Object": function(signaturesMap) {
          var fns = [];
          for (var signature in signaturesMap) {
            if (signaturesMap.hasOwnProperty(signature)) {
              fns.push(signaturesMap[signature]);
            }
          }
          var name2 = getName(fns);
          return createTypedFunction(name2, signaturesMap);
        },
        "...Function": function(fns) {
          return createTypedFunction(getName(fns), extractSignatures(fns));
        },
        "string, ...Function": function(name2, fns) {
          return createTypedFunction(name2, extractSignatures(fns));
        }
      });
      typed.create = create2;
      typed.types = _types;
      typed.conversions = _conversions;
      typed.ignore = _ignore;
      typed.convert = convert;
      typed.find = find;
      typed.addType = function(type, beforeObjectTest) {
        if (!type || typeof type.name !== "string" || typeof type.test !== "function") {
          throw new TypeError("Object with properties {name: string, test: function} expected");
        }
        if (beforeObjectTest !== false) {
          for (var i = 0; i < typed.types.length; i++) {
            if (typed.types[i].name === "Object") {
              typed.types.splice(i, 0, type);
              return;
            }
          }
        }
        typed.types.push(type);
      };
      typed.addConversion = function(conversion) {
        if (!conversion || typeof conversion.from !== "string" || typeof conversion.to !== "string" || typeof conversion.convert !== "function") {
          throw new TypeError("Object with properties {from: string, to: string, convert: function} expected");
        }
        typed.conversions.push(conversion);
      };
      return typed;
    }
    return create2();
  });
})(typedFunction$1);
var typedFunction = typedFunction$1.exports;
function isInteger(value) {
  if (typeof value === "boolean") {
    return true;
  }
  return isFinite(value) ? value === Math.round(value) : false;
}
var sign$1 = Math.sign || function(x) {
  if (x > 0) {
    return 1;
  } else if (x < 0) {
    return -1;
  } else {
    return 0;
  }
};
function format$2(value, options) {
  if (typeof options === "function") {
    return options(value);
  }
  if (value === Infinity) {
    return "Infinity";
  } else if (value === -Infinity) {
    return "-Infinity";
  } else if (isNaN(value)) {
    return "NaN";
  }
  var notation = "auto";
  var precision;
  if (options) {
    if (options.notation) {
      notation = options.notation;
    }
    if (isNumber(options)) {
      precision = options;
    } else if (isNumber(options.precision)) {
      precision = options.precision;
    }
  }
  switch (notation) {
    case "fixed":
      return toFixed$1(value, precision);
    case "exponential":
      return toExponential$1(value, precision);
    case "engineering":
      return toEngineering$1(value, precision);
    case "auto":
      return toPrecision(value, precision, options && options).replace(/((\.\d*?)(0+))($|e)/, function() {
        var digits2 = arguments[2];
        var e = arguments[4];
        return digits2 !== "." ? digits2 + e : e;
      });
    default:
      throw new Error('Unknown notation "' + notation + '". Choose "auto", "exponential", or "fixed".');
  }
}
function splitNumber(value) {
  var match = String(value).toLowerCase().match(/^0*?(-?)(\d+\.?\d*)(e([+-]?\d+))?$/);
  if (!match) {
    throw new SyntaxError("Invalid number " + value);
  }
  var sign2 = match[1];
  var digits2 = match[2];
  var exponent = parseFloat(match[4] || "0");
  var dot = digits2.indexOf(".");
  exponent += dot !== -1 ? dot - 1 : digits2.length - 1;
  var coefficients = digits2.replace(".", "").replace(/^0*/, function(zeros2) {
    exponent -= zeros2.length;
    return "";
  }).replace(/0*$/, "").split("").map(function(d) {
    return parseInt(d);
  });
  if (coefficients.length === 0) {
    coefficients.push(0);
    exponent++;
  }
  return {
    sign: sign2,
    coefficients,
    exponent
  };
}
function toEngineering$1(value, precision) {
  if (isNaN(value) || !isFinite(value)) {
    return String(value);
  }
  var split = splitNumber(value);
  var rounded = roundDigits(split, precision);
  var e = rounded.exponent;
  var c2 = rounded.coefficients;
  var newExp = e % 3 === 0 ? e : e < 0 ? e - 3 - e % 3 : e - e % 3;
  if (isNumber(precision)) {
    while (precision > c2.length || e - newExp + 1 > c2.length) {
      c2.push(0);
    }
  } else {
    var missingZeros = Math.abs(e - newExp) - (c2.length - 1);
    for (var i = 0; i < missingZeros; i++) {
      c2.push(0);
    }
  }
  var expDiff = Math.abs(e - newExp);
  var decimalIdx = 1;
  while (expDiff > 0) {
    decimalIdx++;
    expDiff--;
  }
  var decimals = c2.slice(decimalIdx).join("");
  var decimalVal = isNumber(precision) && decimals.length || decimals.match(/[1-9]/) ? "." + decimals : "";
  var str = c2.slice(0, decimalIdx).join("") + decimalVal + "e" + (e >= 0 ? "+" : "") + newExp.toString();
  return rounded.sign + str;
}
function toFixed$1(value, precision) {
  if (isNaN(value) || !isFinite(value)) {
    return String(value);
  }
  var splitValue = splitNumber(value);
  var rounded = typeof precision === "number" ? roundDigits(splitValue, splitValue.exponent + 1 + precision) : splitValue;
  var c2 = rounded.coefficients;
  var p = rounded.exponent + 1;
  var pp = p + (precision || 0);
  if (c2.length < pp) {
    c2 = c2.concat(zeros(pp - c2.length));
  }
  if (p < 0) {
    c2 = zeros(-p + 1).concat(c2);
    p = 1;
  }
  if (p < c2.length) {
    c2.splice(p, 0, p === 0 ? "0." : ".");
  }
  return rounded.sign + c2.join("");
}
function toExponential$1(value, precision) {
  if (isNaN(value) || !isFinite(value)) {
    return String(value);
  }
  var split = splitNumber(value);
  var rounded = precision ? roundDigits(split, precision) : split;
  var c2 = rounded.coefficients;
  var e = rounded.exponent;
  if (c2.length < precision) {
    c2 = c2.concat(zeros(precision - c2.length));
  }
  var first = c2.shift();
  return rounded.sign + first + (c2.length > 0 ? "." + c2.join("") : "") + "e" + (e >= 0 ? "+" : "") + e;
}
function toPrecision(value, precision, options) {
  if (isNaN(value) || !isFinite(value)) {
    return String(value);
  }
  var lowerExp = options && options.lowerExp !== void 0 ? options.lowerExp : -3;
  var upperExp = options && options.upperExp !== void 0 ? options.upperExp : 5;
  var split = splitNumber(value);
  var rounded = precision ? roundDigits(split, precision) : split;
  if (rounded.exponent < lowerExp || rounded.exponent >= upperExp) {
    return toExponential$1(value, precision);
  } else {
    var c2 = rounded.coefficients;
    var e = rounded.exponent;
    if (c2.length < precision) {
      c2 = c2.concat(zeros(precision - c2.length));
    }
    c2 = c2.concat(zeros(e - c2.length + 1 + (c2.length < precision ? precision - c2.length : 0)));
    c2 = zeros(-e).concat(c2);
    var dot = e > 0 ? e : 0;
    if (dot < c2.length - 1) {
      c2.splice(dot + 1, 0, ".");
    }
    return rounded.sign + c2.join("");
  }
}
function roundDigits(split, precision) {
  var rounded = {
    sign: split.sign,
    coefficients: split.coefficients,
    exponent: split.exponent
  };
  var c2 = rounded.coefficients;
  while (precision <= 0) {
    c2.unshift(0);
    rounded.exponent++;
    precision++;
  }
  if (c2.length > precision) {
    var removed = c2.splice(precision, c2.length - precision);
    if (removed[0] >= 5) {
      var i = precision - 1;
      c2[i]++;
      while (c2[i] === 10) {
        c2.pop();
        if (i === 0) {
          c2.unshift(0);
          rounded.exponent++;
          i++;
        }
        i--;
        c2[i]++;
      }
    }
  }
  return rounded;
}
function zeros(length) {
  var arr = [];
  for (var i = 0; i < length; i++) {
    arr.push(0);
  }
  return arr;
}
function digits(value) {
  return value.toExponential().replace(/e.*$/, "").replace(/^0\.?0*|\./, "").length;
}
var DBL_EPSILON = Number.EPSILON || 2220446049250313e-31;
function nearlyEqual$1(x, y, epsilon) {
  if (epsilon === null || epsilon === void 0) {
    return x === y;
  }
  if (x === y) {
    return true;
  }
  if (isNaN(x) || isNaN(y)) {
    return false;
  }
  if (isFinite(x) && isFinite(y)) {
    var diff = Math.abs(x - y);
    if (diff < DBL_EPSILON) {
      return true;
    } else {
      return diff <= Math.max(Math.abs(x), Math.abs(y)) * epsilon;
    }
  }
  return false;
}
function format$1(value, options) {
  if (typeof options === "function") {
    return options(value);
  }
  if (!value.isFinite()) {
    return value.isNaN() ? "NaN" : value.gt(0) ? "Infinity" : "-Infinity";
  }
  var notation = "auto";
  var precision;
  if (options !== void 0) {
    if (options.notation) {
      notation = options.notation;
    }
    if (typeof options === "number") {
      precision = options;
    } else if (options.precision) {
      precision = options.precision;
    }
  }
  switch (notation) {
    case "fixed":
      return toFixed(value, precision);
    case "exponential":
      return toExponential(value, precision);
    case "engineering":
      return toEngineering(value, precision);
    case "auto": {
      var lowerExp = options && options.lowerExp !== void 0 ? options.lowerExp : -3;
      var upperExp = options && options.upperExp !== void 0 ? options.upperExp : 5;
      if (value.isZero())
        return "0";
      var str;
      var rounded = value.toSignificantDigits(precision);
      var exp2 = rounded.e;
      if (exp2 >= lowerExp && exp2 < upperExp) {
        str = rounded.toFixed();
      } else {
        str = toExponential(value, precision);
      }
      return str.replace(/((\.\d*?)(0+))($|e)/, function() {
        var digits2 = arguments[2];
        var e = arguments[4];
        return digits2 !== "." ? digits2 + e : e;
      });
    }
    default:
      throw new Error('Unknown notation "' + notation + '". Choose "auto", "exponential", or "fixed".');
  }
}
function toEngineering(value, precision) {
  var e = value.e;
  var newExp = e % 3 === 0 ? e : e < 0 ? e - 3 - e % 3 : e - e % 3;
  var valueWithoutExp = value.mul(Math.pow(10, -newExp));
  var valueStr = valueWithoutExp.toPrecision(precision);
  if (valueStr.indexOf("e") !== -1) {
    valueStr = valueWithoutExp.toString();
  }
  return valueStr + "e" + (e >= 0 ? "+" : "") + newExp.toString();
}
function toExponential(value, precision) {
  if (precision !== void 0) {
    return value.toExponential(precision - 1);
  } else {
    return value.toExponential();
  }
}
function toFixed(value, precision) {
  return value.toFixed(precision);
}
function endsWith(text, search) {
  var start = text.length - search.length;
  var end = text.length;
  return text.substring(start, end) === search;
}
function format(value, options) {
  if (typeof value === "number") {
    return format$2(value, options);
  }
  if (isBigNumber(value)) {
    return format$1(value, options);
  }
  if (looksLikeFraction(value)) {
    if (!options || options.fraction !== "decimal") {
      return value.s * value.n + "/" + value.d;
    } else {
      return value.toString();
    }
  }
  if (Array.isArray(value)) {
    return formatArray(value, options);
  }
  if (isString(value)) {
    return '"' + value + '"';
  }
  if (typeof value === "function") {
    return value.syntax ? String(value.syntax) : "function";
  }
  if (value && typeof value === "object") {
    if (typeof value.format === "function") {
      return value.format(options);
    } else if (value && value.toString(options) !== {}.toString()) {
      return value.toString(options);
    } else {
      var entries = Object.keys(value).map((key) => {
        return '"' + key + '": ' + format(value[key], options);
      });
      return "{" + entries.join(", ") + "}";
    }
  }
  return String(value);
}
function stringify(value) {
  var text = String(value);
  var escaped = "";
  var i = 0;
  while (i < text.length) {
    var c2 = text.charAt(i);
    if (c2 === "\\") {
      escaped += c2;
      i++;
      c2 = text.charAt(i);
      if (c2 === "" || '"\\/bfnrtu'.indexOf(c2) === -1) {
        escaped += "\\";
      }
      escaped += c2;
    } else if (c2 === '"') {
      escaped += '\\"';
    } else {
      escaped += c2;
    }
    i++;
  }
  return '"' + escaped + '"';
}
function escape(value) {
  var text = String(value);
  text = text.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/'/g, "&#39;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  return text;
}
function formatArray(array, options) {
  if (Array.isArray(array)) {
    var str = "[";
    var len = array.length;
    for (var i = 0; i < len; i++) {
      if (i !== 0) {
        str += ", ";
      }
      str += formatArray(array[i], options);
    }
    str += "]";
    return str;
  } else {
    return format(array, options);
  }
}
function looksLikeFraction(value) {
  return value && typeof value === "object" && typeof value.s === "number" && typeof value.n === "number" && typeof value.d === "number" || false;
}
function DimensionError(actual, expected, relation) {
  if (!(this instanceof DimensionError)) {
    throw new SyntaxError("Constructor must be called with the new operator");
  }
  this.actual = actual;
  this.expected = expected;
  this.relation = relation;
  this.message = "Dimension mismatch (" + (Array.isArray(actual) ? "[" + actual.join(", ") + "]" : actual) + " " + (this.relation || "!=") + " " + (Array.isArray(expected) ? "[" + expected.join(", ") + "]" : expected) + ")";
  this.stack = new Error().stack;
}
DimensionError.prototype = new RangeError();
DimensionError.prototype.constructor = RangeError;
DimensionError.prototype.name = "DimensionError";
DimensionError.prototype.isDimensionError = true;
function IndexError(index, min2, max2) {
  if (!(this instanceof IndexError)) {
    throw new SyntaxError("Constructor must be called with the new operator");
  }
  this.index = index;
  if (arguments.length < 3) {
    this.min = 0;
    this.max = min2;
  } else {
    this.min = min2;
    this.max = max2;
  }
  if (this.min !== void 0 && this.index < this.min) {
    this.message = "Index out of range (" + this.index + " < " + this.min + ")";
  } else if (this.max !== void 0 && this.index >= this.max) {
    this.message = "Index out of range (" + this.index + " > " + (this.max - 1) + ")";
  } else {
    this.message = "Index out of range (" + this.index + ")";
  }
  this.stack = new Error().stack;
}
IndexError.prototype = new RangeError();
IndexError.prototype.constructor = RangeError;
IndexError.prototype.name = "IndexError";
IndexError.prototype.isIndexError = true;
function arraySize(x) {
  var s = [];
  while (Array.isArray(x)) {
    s.push(x.length);
    x = x[0];
  }
  return s;
}
function _validate(array, size, dim) {
  var i;
  var len = array.length;
  if (len !== size[dim]) {
    throw new DimensionError(len, size[dim]);
  }
  if (dim < size.length - 1) {
    var dimNext = dim + 1;
    for (i = 0; i < len; i++) {
      var child = array[i];
      if (!Array.isArray(child)) {
        throw new DimensionError(size.length - 1, size.length, "<");
      }
      _validate(array[i], size, dimNext);
    }
  } else {
    for (i = 0; i < len; i++) {
      if (Array.isArray(array[i])) {
        throw new DimensionError(size.length + 1, size.length, ">");
      }
    }
  }
}
function validate(array, size) {
  var isScalar = size.length === 0;
  if (isScalar) {
    if (Array.isArray(array)) {
      throw new DimensionError(array.length, 0);
    }
  } else {
    _validate(array, size, 0);
  }
}
function validateIndex(index, length) {
  if (!isNumber(index) || !isInteger(index)) {
    throw new TypeError("Index must be an integer (value: " + index + ")");
  }
  if (index < 0 || typeof length === "number" && index >= length) {
    throw new IndexError(index, length);
  }
}
function resize(array, size, defaultValue) {
  if (!Array.isArray(array) || !Array.isArray(size)) {
    throw new TypeError("Array expected");
  }
  if (size.length === 0) {
    throw new Error("Resizing to scalar is not supported");
  }
  size.forEach(function(value) {
    if (!isNumber(value) || !isInteger(value) || value < 0) {
      throw new TypeError("Invalid size, must contain positive integers (size: " + format(size) + ")");
    }
  });
  var _defaultValue = defaultValue !== void 0 ? defaultValue : 0;
  _resize(array, size, 0, _defaultValue);
  return array;
}
function _resize(array, size, dim, defaultValue) {
  var i;
  var elem;
  var oldLen = array.length;
  var newLen = size[dim];
  var minLen = Math.min(oldLen, newLen);
  array.length = newLen;
  if (dim < size.length - 1) {
    var dimNext = dim + 1;
    for (i = 0; i < minLen; i++) {
      elem = array[i];
      if (!Array.isArray(elem)) {
        elem = [elem];
        array[i] = elem;
      }
      _resize(elem, size, dimNext, defaultValue);
    }
    for (i = minLen; i < newLen; i++) {
      elem = [];
      array[i] = elem;
      _resize(elem, size, dimNext, defaultValue);
    }
  } else {
    for (i = 0; i < minLen; i++) {
      while (Array.isArray(array[i])) {
        array[i] = array[i][0];
      }
    }
    for (i = minLen; i < newLen; i++) {
      array[i] = defaultValue;
    }
  }
}
function reshape(array, sizes) {
  var flatArray = flatten(array);
  var newArray;
  function product(arr) {
    return arr.reduce((prev, curr) => prev * curr);
  }
  if (!Array.isArray(array) || !Array.isArray(sizes)) {
    throw new TypeError("Array expected");
  }
  if (sizes.length === 0) {
    throw new DimensionError(0, product(arraySize(array)), "!=");
  }
  var totalSize = 1;
  for (var sizeIndex = 0; sizeIndex < sizes.length; sizeIndex++) {
    totalSize *= sizes[sizeIndex];
  }
  if (flatArray.length !== totalSize) {
    throw new DimensionError(product(sizes), product(arraySize(array)), "!=");
  }
  try {
    newArray = _reshape(flatArray, sizes);
  } catch (e) {
    if (e instanceof DimensionError) {
      throw new DimensionError(product(sizes), product(arraySize(array)), "!=");
    }
    throw e;
  }
  return newArray;
}
function _reshape(array, sizes) {
  var tmpArray = array;
  var tmpArray2;
  for (var sizeIndex = sizes.length - 1; sizeIndex > 0; sizeIndex--) {
    var size = sizes[sizeIndex];
    tmpArray2 = [];
    var length = tmpArray.length / size;
    for (var i = 0; i < length; i++) {
      tmpArray2.push(tmpArray.slice(i * size, (i + 1) * size));
    }
    tmpArray = tmpArray2;
  }
  return tmpArray;
}
function unsqueeze(array, dims, outer, size) {
  var s = size || arraySize(array);
  if (outer) {
    for (var i = 0; i < outer; i++) {
      array = [array];
      s.unshift(1);
    }
  }
  array = _unsqueeze(array, dims, 0);
  while (s.length < dims) {
    s.push(1);
  }
  return array;
}
function _unsqueeze(array, dims, dim) {
  var i, ii;
  if (Array.isArray(array)) {
    var next = dim + 1;
    for (i = 0, ii = array.length; i < ii; i++) {
      array[i] = _unsqueeze(array[i], dims, next);
    }
  } else {
    for (var d = dim; d < dims; d++) {
      array = [array];
    }
  }
  return array;
}
function flatten(array) {
  if (!Array.isArray(array)) {
    return array;
  }
  var flat = [];
  array.forEach(function callback(value) {
    if (Array.isArray(value)) {
      value.forEach(callback);
    } else {
      flat.push(value);
    }
  });
  return flat;
}
function map(array, callback) {
  return Array.prototype.map.call(array, callback);
}
function forEach(array, callback) {
  Array.prototype.forEach.call(array, callback);
}
function join(array, separator) {
  return Array.prototype.join.call(array, separator);
}
function getArrayDataType(array, typeOf2) {
  var type;
  var length = 0;
  for (var i = 0; i < array.length; i++) {
    var item = array[i];
    var isArray2 = Array.isArray(item);
    if (i === 0 && isArray2) {
      length = item.length;
    }
    if (isArray2 && item.length !== length) {
      return void 0;
    }
    var itemType = isArray2 ? getArrayDataType(item, typeOf2) : typeOf2(item);
    if (type === void 0) {
      type = itemType;
    } else if (type !== itemType) {
      return "mixed";
    } else
      ;
  }
  return type;
}
function contains(array, item) {
  return array.indexOf(item) !== -1;
}
function factory(name2, dependencies2, create2, meta) {
  function assertAndCreate(scope) {
    var deps = pickShallow(scope, dependencies2.map(stripOptionalNotation));
    assertDependencies(name2, dependencies2, scope);
    return create2(deps);
  }
  assertAndCreate.isFactory = true;
  assertAndCreate.fn = name2;
  assertAndCreate.dependencies = dependencies2.slice().sort();
  if (meta) {
    assertAndCreate.meta = meta;
  }
  return assertAndCreate;
}
function isFactory(obj) {
  return typeof obj === "function" && typeof obj.fn === "string" && Array.isArray(obj.dependencies);
}
function assertDependencies(name2, dependencies2, scope) {
  var allDefined = dependencies2.filter((dependency) => !isOptionalDependency(dependency)).every((dependency) => scope[dependency] !== void 0);
  if (!allDefined) {
    var missingDependencies = dependencies2.filter((dependency) => scope[dependency] === void 0);
    throw new Error('Cannot create function "'.concat(name2, '", ') + "some dependencies are missing: ".concat(missingDependencies.map((d) => '"'.concat(d, '"')).join(", "), "."));
  }
}
function isOptionalDependency(dependency) {
  return dependency && dependency[0] === "?";
}
function stripOptionalNotation(dependency) {
  return dependency && dependency[0] === "?" ? dependency.slice(1) : dependency;
}
var _createTyped2 = function _createTyped() {
  _createTyped2 = typedFunction.create;
  return typedFunction;
};
var dependencies$1d = ["?BigNumber", "?Complex", "?DenseMatrix", "?Fraction"];
var createTyped = /* @__PURE__ */ factory("typed", dependencies$1d, function createTyped2(_ref) {
  var {
    BigNumber,
    Complex: Complex2,
    DenseMatrix,
    Fraction: Fraction2
  } = _ref;
  var typed = _createTyped2();
  typed.types = [
    {
      name: "number",
      test: isNumber
    },
    {
      name: "Complex",
      test: isComplex
    },
    {
      name: "BigNumber",
      test: isBigNumber
    },
    {
      name: "Fraction",
      test: isFraction
    },
    {
      name: "Unit",
      test: isUnit
    },
    {
      name: "string",
      test: isString
    },
    {
      name: "Chain",
      test: isChain
    },
    {
      name: "Array",
      test: isArray
    },
    {
      name: "Matrix",
      test: isMatrix
    },
    {
      name: "DenseMatrix",
      test: isDenseMatrix
    },
    {
      name: "SparseMatrix",
      test: isSparseMatrix
    },
    {
      name: "Range",
      test: isRange
    },
    {
      name: "Index",
      test: isIndex
    },
    {
      name: "boolean",
      test: isBoolean
    },
    {
      name: "ResultSet",
      test: isResultSet
    },
    {
      name: "Help",
      test: isHelp
    },
    {
      name: "function",
      test: isFunction
    },
    {
      name: "Date",
      test: isDate
    },
    {
      name: "RegExp",
      test: isRegExp
    },
    {
      name: "null",
      test: isNull
    },
    {
      name: "undefined",
      test: isUndefined
    },
    {
      name: "AccessorNode",
      test: isAccessorNode
    },
    {
      name: "ArrayNode",
      test: isArrayNode
    },
    {
      name: "AssignmentNode",
      test: isAssignmentNode
    },
    {
      name: "BlockNode",
      test: isBlockNode
    },
    {
      name: "ConditionalNode",
      test: isConditionalNode
    },
    {
      name: "ConstantNode",
      test: isConstantNode
    },
    {
      name: "FunctionNode",
      test: isFunctionNode
    },
    {
      name: "FunctionAssignmentNode",
      test: isFunctionAssignmentNode
    },
    {
      name: "IndexNode",
      test: isIndexNode
    },
    {
      name: "Node",
      test: isNode
    },
    {
      name: "ObjectNode",
      test: isObjectNode
    },
    {
      name: "OperatorNode",
      test: isOperatorNode
    },
    {
      name: "ParenthesisNode",
      test: isParenthesisNode
    },
    {
      name: "RangeNode",
      test: isRangeNode
    },
    {
      name: "SymbolNode",
      test: isSymbolNode
    },
    {
      name: "Object",
      test: isObject
    }
  ];
  typed.conversions = [{
    from: "number",
    to: "BigNumber",
    convert: function convert(x) {
      if (!BigNumber) {
        throwNoBignumber(x);
      }
      if (digits(x) > 15) {
        throw new TypeError("Cannot implicitly convert a number with >15 significant digits to BigNumber (value: " + x + "). Use function bignumber(x) to convert to BigNumber.");
      }
      return new BigNumber(x);
    }
  }, {
    from: "number",
    to: "Complex",
    convert: function convert(x) {
      if (!Complex2) {
        throwNoComplex(x);
      }
      return new Complex2(x, 0);
    }
  }, {
    from: "number",
    to: "string",
    convert: function convert(x) {
      return x + "";
    }
  }, {
    from: "BigNumber",
    to: "Complex",
    convert: function convert(x) {
      if (!Complex2) {
        throwNoComplex(x);
      }
      return new Complex2(x.toNumber(), 0);
    }
  }, {
    from: "Fraction",
    to: "BigNumber",
    convert: function convert(x) {
      throw new TypeError("Cannot implicitly convert a Fraction to BigNumber or vice versa. Use function bignumber(x) to convert to BigNumber or fraction(x) to convert to Fraction.");
    }
  }, {
    from: "Fraction",
    to: "Complex",
    convert: function convert(x) {
      if (!Complex2) {
        throwNoComplex(x);
      }
      return new Complex2(x.valueOf(), 0);
    }
  }, {
    from: "number",
    to: "Fraction",
    convert: function convert(x) {
      if (!Fraction2) {
        throwNoFraction(x);
      }
      var f = new Fraction2(x);
      if (f.valueOf() !== x) {
        throw new TypeError("Cannot implicitly convert a number to a Fraction when there will be a loss of precision (value: " + x + "). Use function fraction(x) to convert to Fraction.");
      }
      return f;
    }
  }, {
    from: "string",
    to: "number",
    convert: function convert(x) {
      var n = Number(x);
      if (isNaN(n)) {
        throw new Error('Cannot convert "' + x + '" to a number');
      }
      return n;
    }
  }, {
    from: "string",
    to: "BigNumber",
    convert: function convert(x) {
      if (!BigNumber) {
        throwNoBignumber(x);
      }
      try {
        return new BigNumber(x);
      } catch (err) {
        throw new Error('Cannot convert "' + x + '" to BigNumber');
      }
    }
  }, {
    from: "string",
    to: "Fraction",
    convert: function convert(x) {
      if (!Fraction2) {
        throwNoFraction(x);
      }
      try {
        return new Fraction2(x);
      } catch (err) {
        throw new Error('Cannot convert "' + x + '" to Fraction');
      }
    }
  }, {
    from: "string",
    to: "Complex",
    convert: function convert(x) {
      if (!Complex2) {
        throwNoComplex(x);
      }
      try {
        return new Complex2(x);
      } catch (err) {
        throw new Error('Cannot convert "' + x + '" to Complex');
      }
    }
  }, {
    from: "boolean",
    to: "number",
    convert: function convert(x) {
      return +x;
    }
  }, {
    from: "boolean",
    to: "BigNumber",
    convert: function convert(x) {
      if (!BigNumber) {
        throwNoBignumber(x);
      }
      return new BigNumber(+x);
    }
  }, {
    from: "boolean",
    to: "Fraction",
    convert: function convert(x) {
      if (!Fraction2) {
        throwNoFraction(x);
      }
      return new Fraction2(+x);
    }
  }, {
    from: "boolean",
    to: "string",
    convert: function convert(x) {
      return String(x);
    }
  }, {
    from: "Array",
    to: "Matrix",
    convert: function convert(array) {
      if (!DenseMatrix) {
        throwNoMatrix();
      }
      return new DenseMatrix(array);
    }
  }, {
    from: "Matrix",
    to: "Array",
    convert: function convert(matrix) {
      return matrix.valueOf();
    }
  }];
  return typed;
});
function throwNoBignumber(x) {
  throw new Error("Cannot convert value ".concat(x, " into a BigNumber: no class 'BigNumber' provided"));
}
function throwNoComplex(x) {
  throw new Error("Cannot convert value ".concat(x, " into a Complex number: no class 'Complex' provided"));
}
function throwNoMatrix() {
  throw new Error("Cannot convert array into a Matrix: no class 'DenseMatrix' provided");
}
function throwNoFraction(x) {
  throw new Error("Cannot convert value ".concat(x, " into a Fraction, no class 'Fraction' provided."));
}
var name$1c = "ResultSet";
var dependencies$1c = [];
var createResultSet = /* @__PURE__ */ factory(name$1c, dependencies$1c, () => {
  function ResultSet(entries) {
    if (!(this instanceof ResultSet)) {
      throw new SyntaxError("Constructor must be called with the new operator");
    }
    this.entries = entries || [];
  }
  ResultSet.prototype.type = "ResultSet";
  ResultSet.prototype.isResultSet = true;
  ResultSet.prototype.valueOf = function() {
    return this.entries;
  };
  ResultSet.prototype.toString = function() {
    return "[" + this.entries.join(", ") + "]";
  };
  ResultSet.prototype.toJSON = function() {
    return {
      mathjs: "ResultSet",
      entries: this.entries
    };
  };
  ResultSet.fromJSON = function(json) {
    return new ResultSet(json.entries);
  };
  return ResultSet;
}, {
  isClass: true
});
var EXP_LIMIT = 9e15, MAX_DIGITS = 1e9, NUMERALS = "0123456789abcdef", LN10 = "2.3025850929940456840179914546843642076011014886287729760333279009675726096773524802359972050895982983419677840422862486334095254650828067566662873690987816894829072083255546808437998948262331985283935053089653777326288461633662222876982198867465436674744042432743651550489343149393914796194044002221051017141748003688084012647080685567743216228355220114804663715659121373450747856947683463616792101806445070648000277502684916746550586856935673420670581136429224554405758925724208241314695689016758940256776311356919292033376587141660230105703089634572075440370847469940168269282808481184289314848524948644871927809676271275775397027668605952496716674183485704422507197965004714951050492214776567636938662976979522110718264549734772662425709429322582798502585509785265383207606726317164309505995087807523710333101197857547331541421808427543863591778117054309827482385045648019095610299291824318237525357709750539565187697510374970888692180205189339507238539205144634197265287286965110862571492198849978748873771345686209167058", PI = "3.1415926535897932384626433832795028841971693993751058209749445923078164062862089986280348253421170679821480865132823066470938446095505822317253594081284811174502841027019385211055596446229489549303819644288109756659334461284756482337867831652712019091456485669234603486104543266482133936072602491412737245870066063155881748815209209628292540917153643678925903600113305305488204665213841469519415116094330572703657595919530921861173819326117931051185480744623799627495673518857527248912279381830119491298336733624406566430860213949463952247371907021798609437027705392171762931767523846748184676694051320005681271452635608277857713427577896091736371787214684409012249534301465495853710507922796892589235420199561121290219608640344181598136297747713099605187072113499999983729780499510597317328160963185950244594553469083026425223082533446850352619311881710100031378387528865875332083814206171776691473035982534904287554687311595628638823537875937519577818577805321712268066130019278766111959092164201989380952572010654858632789", DEFAULTS = {
  precision: 20,
  rounding: 4,
  modulo: 1,
  toExpNeg: -7,
  toExpPos: 21,
  minE: -EXP_LIMIT,
  maxE: EXP_LIMIT,
  crypto: false
}, inexact, quadrant, external = true, decimalError = "[DecimalError] ", invalidArgument = decimalError + "Invalid argument: ", precisionLimitExceeded = decimalError + "Precision limit exceeded", cryptoUnavailable = decimalError + "crypto unavailable", mathfloor = Math.floor, mathpow = Math.pow, isBinary = /^0b([01]+(\.[01]*)?|\.[01]+)(p[+-]?\d+)?$/i, isHex = /^0x([0-9a-f]+(\.[0-9a-f]*)?|\.[0-9a-f]+)(p[+-]?\d+)?$/i, isOctal = /^0o([0-7]+(\.[0-7]*)?|\.[0-7]+)(p[+-]?\d+)?$/i, isDecimal = /^(\d+(\.\d*)?|\.\d+)(e[+-]?\d+)?$/i, BASE = 1e7, LOG_BASE = 7, MAX_SAFE_INTEGER = 9007199254740991, LN10_PRECISION = LN10.length - 1, PI_PRECISION = PI.length - 1, P = { name: "[object Decimal]" };
P.absoluteValue = P.abs = function() {
  var x = new this.constructor(this);
  if (x.s < 0)
    x.s = 1;
  return finalise(x);
};
P.ceil = function() {
  return finalise(new this.constructor(this), this.e + 1, 2);
};
P.comparedTo = P.cmp = function(y) {
  var i, j, xdL, ydL, x = this, xd = x.d, yd = (y = new x.constructor(y)).d, xs = x.s, ys = y.s;
  if (!xd || !yd) {
    return !xs || !ys ? NaN : xs !== ys ? xs : xd === yd ? 0 : !xd ^ xs < 0 ? 1 : -1;
  }
  if (!xd[0] || !yd[0])
    return xd[0] ? xs : yd[0] ? -ys : 0;
  if (xs !== ys)
    return xs;
  if (x.e !== y.e)
    return x.e > y.e ^ xs < 0 ? 1 : -1;
  xdL = xd.length;
  ydL = yd.length;
  for (i = 0, j = xdL < ydL ? xdL : ydL; i < j; ++i) {
    if (xd[i] !== yd[i])
      return xd[i] > yd[i] ^ xs < 0 ? 1 : -1;
  }
  return xdL === ydL ? 0 : xdL > ydL ^ xs < 0 ? 1 : -1;
};
P.cosine = P.cos = function() {
  var pr, rm, x = this, Ctor = x.constructor;
  if (!x.d)
    return new Ctor(NaN);
  if (!x.d[0])
    return new Ctor(1);
  pr = Ctor.precision;
  rm = Ctor.rounding;
  Ctor.precision = pr + Math.max(x.e, x.sd()) + LOG_BASE;
  Ctor.rounding = 1;
  x = cosine(Ctor, toLessThanHalfPi(Ctor, x));
  Ctor.precision = pr;
  Ctor.rounding = rm;
  return finalise(quadrant == 2 || quadrant == 3 ? x.neg() : x, pr, rm, true);
};
P.cubeRoot = P.cbrt = function() {
  var e, m, n, r, rep, s, sd, t, t3, t3plusx, x = this, Ctor = x.constructor;
  if (!x.isFinite() || x.isZero())
    return new Ctor(x);
  external = false;
  s = x.s * mathpow(x.s * x, 1 / 3);
  if (!s || Math.abs(s) == 1 / 0) {
    n = digitsToString(x.d);
    e = x.e;
    if (s = (e - n.length + 1) % 3)
      n += s == 1 || s == -2 ? "0" : "00";
    s = mathpow(n, 1 / 3);
    e = mathfloor((e + 1) / 3) - (e % 3 == (e < 0 ? -1 : 2));
    if (s == 1 / 0) {
      n = "5e" + e;
    } else {
      n = s.toExponential();
      n = n.slice(0, n.indexOf("e") + 1) + e;
    }
    r = new Ctor(n);
    r.s = x.s;
  } else {
    r = new Ctor(s.toString());
  }
  sd = (e = Ctor.precision) + 3;
  for (; ; ) {
    t = r;
    t3 = t.times(t).times(t);
    t3plusx = t3.plus(x);
    r = divide(t3plusx.plus(x).times(t), t3plusx.plus(t3), sd + 2, 1);
    if (digitsToString(t.d).slice(0, sd) === (n = digitsToString(r.d)).slice(0, sd)) {
      n = n.slice(sd - 3, sd + 1);
      if (n == "9999" || !rep && n == "4999") {
        if (!rep) {
          finalise(t, e + 1, 0);
          if (t.times(t).times(t).eq(x)) {
            r = t;
            break;
          }
        }
        sd += 4;
        rep = 1;
      } else {
        if (!+n || !+n.slice(1) && n.charAt(0) == "5") {
          finalise(r, e + 1, 1);
          m = !r.times(r).times(r).eq(x);
        }
        break;
      }
    }
  }
  external = true;
  return finalise(r, e, Ctor.rounding, m);
};
P.decimalPlaces = P.dp = function() {
  var w, d = this.d, n = NaN;
  if (d) {
    w = d.length - 1;
    n = (w - mathfloor(this.e / LOG_BASE)) * LOG_BASE;
    w = d[w];
    if (w)
      for (; w % 10 == 0; w /= 10)
        n--;
    if (n < 0)
      n = 0;
  }
  return n;
};
P.dividedBy = P.div = function(y) {
  return divide(this, new this.constructor(y));
};
P.dividedToIntegerBy = P.divToInt = function(y) {
  var x = this, Ctor = x.constructor;
  return finalise(divide(x, new Ctor(y), 0, 1, 1), Ctor.precision, Ctor.rounding);
};
P.equals = P.eq = function(y) {
  return this.cmp(y) === 0;
};
P.floor = function() {
  return finalise(new this.constructor(this), this.e + 1, 3);
};
P.greaterThan = P.gt = function(y) {
  return this.cmp(y) > 0;
};
P.greaterThanOrEqualTo = P.gte = function(y) {
  var k = this.cmp(y);
  return k == 1 || k === 0;
};
P.hyperbolicCosine = P.cosh = function() {
  var k, n, pr, rm, len, x = this, Ctor = x.constructor, one = new Ctor(1);
  if (!x.isFinite())
    return new Ctor(x.s ? 1 / 0 : NaN);
  if (x.isZero())
    return one;
  pr = Ctor.precision;
  rm = Ctor.rounding;
  Ctor.precision = pr + Math.max(x.e, x.sd()) + 4;
  Ctor.rounding = 1;
  len = x.d.length;
  if (len < 32) {
    k = Math.ceil(len / 3);
    n = (1 / tinyPow(4, k)).toString();
  } else {
    k = 16;
    n = "2.3283064365386962890625e-10";
  }
  x = taylorSeries(Ctor, 1, x.times(n), new Ctor(1), true);
  var cosh2_x, i = k, d8 = new Ctor(8);
  for (; i--; ) {
    cosh2_x = x.times(x);
    x = one.minus(cosh2_x.times(d8.minus(cosh2_x.times(d8))));
  }
  return finalise(x, Ctor.precision = pr, Ctor.rounding = rm, true);
};
P.hyperbolicSine = P.sinh = function() {
  var k, pr, rm, len, x = this, Ctor = x.constructor;
  if (!x.isFinite() || x.isZero())
    return new Ctor(x);
  pr = Ctor.precision;
  rm = Ctor.rounding;
  Ctor.precision = pr + Math.max(x.e, x.sd()) + 4;
  Ctor.rounding = 1;
  len = x.d.length;
  if (len < 3) {
    x = taylorSeries(Ctor, 2, x, x, true);
  } else {
    k = 1.4 * Math.sqrt(len);
    k = k > 16 ? 16 : k | 0;
    x = x.times(1 / tinyPow(5, k));
    x = taylorSeries(Ctor, 2, x, x, true);
    var sinh2_x, d5 = new Ctor(5), d16 = new Ctor(16), d20 = new Ctor(20);
    for (; k--; ) {
      sinh2_x = x.times(x);
      x = x.times(d5.plus(sinh2_x.times(d16.times(sinh2_x).plus(d20))));
    }
  }
  Ctor.precision = pr;
  Ctor.rounding = rm;
  return finalise(x, pr, rm, true);
};
P.hyperbolicTangent = P.tanh = function() {
  var pr, rm, x = this, Ctor = x.constructor;
  if (!x.isFinite())
    return new Ctor(x.s);
  if (x.isZero())
    return new Ctor(x);
  pr = Ctor.precision;
  rm = Ctor.rounding;
  Ctor.precision = pr + 7;
  Ctor.rounding = 1;
  return divide(x.sinh(), x.cosh(), Ctor.precision = pr, Ctor.rounding = rm);
};
P.inverseCosine = P.acos = function() {
  var halfPi, x = this, Ctor = x.constructor, k = x.abs().cmp(1), pr = Ctor.precision, rm = Ctor.rounding;
  if (k !== -1) {
    return k === 0 ? x.isNeg() ? getPi(Ctor, pr, rm) : new Ctor(0) : new Ctor(NaN);
  }
  if (x.isZero())
    return getPi(Ctor, pr + 4, rm).times(0.5);
  Ctor.precision = pr + 6;
  Ctor.rounding = 1;
  x = x.asin();
  halfPi = getPi(Ctor, pr + 4, rm).times(0.5);
  Ctor.precision = pr;
  Ctor.rounding = rm;
  return halfPi.minus(x);
};
P.inverseHyperbolicCosine = P.acosh = function() {
  var pr, rm, x = this, Ctor = x.constructor;
  if (x.lte(1))
    return new Ctor(x.eq(1) ? 0 : NaN);
  if (!x.isFinite())
    return new Ctor(x);
  pr = Ctor.precision;
  rm = Ctor.rounding;
  Ctor.precision = pr + Math.max(Math.abs(x.e), x.sd()) + 4;
  Ctor.rounding = 1;
  external = false;
  x = x.times(x).minus(1).sqrt().plus(x);
  external = true;
  Ctor.precision = pr;
  Ctor.rounding = rm;
  return x.ln();
};
P.inverseHyperbolicSine = P.asinh = function() {
  var pr, rm, x = this, Ctor = x.constructor;
  if (!x.isFinite() || x.isZero())
    return new Ctor(x);
  pr = Ctor.precision;
  rm = Ctor.rounding;
  Ctor.precision = pr + 2 * Math.max(Math.abs(x.e), x.sd()) + 6;
  Ctor.rounding = 1;
  external = false;
  x = x.times(x).plus(1).sqrt().plus(x);
  external = true;
  Ctor.precision = pr;
  Ctor.rounding = rm;
  return x.ln();
};
P.inverseHyperbolicTangent = P.atanh = function() {
  var pr, rm, wpr, xsd, x = this, Ctor = x.constructor;
  if (!x.isFinite())
    return new Ctor(NaN);
  if (x.e >= 0)
    return new Ctor(x.abs().eq(1) ? x.s / 0 : x.isZero() ? x : NaN);
  pr = Ctor.precision;
  rm = Ctor.rounding;
  xsd = x.sd();
  if (Math.max(xsd, pr) < 2 * -x.e - 1)
    return finalise(new Ctor(x), pr, rm, true);
  Ctor.precision = wpr = xsd - x.e;
  x = divide(x.plus(1), new Ctor(1).minus(x), wpr + pr, 1);
  Ctor.precision = pr + 4;
  Ctor.rounding = 1;
  x = x.ln();
  Ctor.precision = pr;
  Ctor.rounding = rm;
  return x.times(0.5);
};
P.inverseSine = P.asin = function() {
  var halfPi, k, pr, rm, x = this, Ctor = x.constructor;
  if (x.isZero())
    return new Ctor(x);
  k = x.abs().cmp(1);
  pr = Ctor.precision;
  rm = Ctor.rounding;
  if (k !== -1) {
    if (k === 0) {
      halfPi = getPi(Ctor, pr + 4, rm).times(0.5);
      halfPi.s = x.s;
      return halfPi;
    }
    return new Ctor(NaN);
  }
  Ctor.precision = pr + 6;
  Ctor.rounding = 1;
  x = x.div(new Ctor(1).minus(x.times(x)).sqrt().plus(1)).atan();
  Ctor.precision = pr;
  Ctor.rounding = rm;
  return x.times(2);
};
P.inverseTangent = P.atan = function() {
  var i, j, k, n, px, t, r, wpr, x2, x = this, Ctor = x.constructor, pr = Ctor.precision, rm = Ctor.rounding;
  if (!x.isFinite()) {
    if (!x.s)
      return new Ctor(NaN);
    if (pr + 4 <= PI_PRECISION) {
      r = getPi(Ctor, pr + 4, rm).times(0.5);
      r.s = x.s;
      return r;
    }
  } else if (x.isZero()) {
    return new Ctor(x);
  } else if (x.abs().eq(1) && pr + 4 <= PI_PRECISION) {
    r = getPi(Ctor, pr + 4, rm).times(0.25);
    r.s = x.s;
    return r;
  }
  Ctor.precision = wpr = pr + 10;
  Ctor.rounding = 1;
  k = Math.min(28, wpr / LOG_BASE + 2 | 0);
  for (i = k; i; --i)
    x = x.div(x.times(x).plus(1).sqrt().plus(1));
  external = false;
  j = Math.ceil(wpr / LOG_BASE);
  n = 1;
  x2 = x.times(x);
  r = new Ctor(x);
  px = x;
  for (; i !== -1; ) {
    px = px.times(x2);
    t = r.minus(px.div(n += 2));
    px = px.times(x2);
    r = t.plus(px.div(n += 2));
    if (r.d[j] !== void 0)
      for (i = j; r.d[i] === t.d[i] && i--; )
        ;
  }
  if (k)
    r = r.times(2 << k - 1);
  external = true;
  return finalise(r, Ctor.precision = pr, Ctor.rounding = rm, true);
};
P.isFinite = function() {
  return !!this.d;
};
P.isInteger = P.isInt = function() {
  return !!this.d && mathfloor(this.e / LOG_BASE) > this.d.length - 2;
};
P.isNaN = function() {
  return !this.s;
};
P.isNegative = P.isNeg = function() {
  return this.s < 0;
};
P.isPositive = P.isPos = function() {
  return this.s > 0;
};
P.isZero = function() {
  return !!this.d && this.d[0] === 0;
};
P.lessThan = P.lt = function(y) {
  return this.cmp(y) < 0;
};
P.lessThanOrEqualTo = P.lte = function(y) {
  return this.cmp(y) < 1;
};
P.logarithm = P.log = function(base) {
  var isBase10, d, denominator, k, inf, num, sd, r, arg = this, Ctor = arg.constructor, pr = Ctor.precision, rm = Ctor.rounding, guard = 5;
  if (base == null) {
    base = new Ctor(10);
    isBase10 = true;
  } else {
    base = new Ctor(base);
    d = base.d;
    if (base.s < 0 || !d || !d[0] || base.eq(1))
      return new Ctor(NaN);
    isBase10 = base.eq(10);
  }
  d = arg.d;
  if (arg.s < 0 || !d || !d[0] || arg.eq(1)) {
    return new Ctor(d && !d[0] ? -1 / 0 : arg.s != 1 ? NaN : d ? 0 : 1 / 0);
  }
  if (isBase10) {
    if (d.length > 1) {
      inf = true;
    } else {
      for (k = d[0]; k % 10 === 0; )
        k /= 10;
      inf = k !== 1;
    }
  }
  external = false;
  sd = pr + guard;
  num = naturalLogarithm(arg, sd);
  denominator = isBase10 ? getLn10(Ctor, sd + 10) : naturalLogarithm(base, sd);
  r = divide(num, denominator, sd, 1);
  if (checkRoundingDigits(r.d, k = pr, rm)) {
    do {
      sd += 10;
      num = naturalLogarithm(arg, sd);
      denominator = isBase10 ? getLn10(Ctor, sd + 10) : naturalLogarithm(base, sd);
      r = divide(num, denominator, sd, 1);
      if (!inf) {
        if (+digitsToString(r.d).slice(k + 1, k + 15) + 1 == 1e14) {
          r = finalise(r, pr + 1, 0);
        }
        break;
      }
    } while (checkRoundingDigits(r.d, k += 10, rm));
  }
  external = true;
  return finalise(r, pr, rm);
};
P.minus = P.sub = function(y) {
  var d, e, i, j, k, len, pr, rm, xd, xe, xLTy, yd, x = this, Ctor = x.constructor;
  y = new Ctor(y);
  if (!x.d || !y.d) {
    if (!x.s || !y.s)
      y = new Ctor(NaN);
    else if (x.d)
      y.s = -y.s;
    else
      y = new Ctor(y.d || x.s !== y.s ? x : NaN);
    return y;
  }
  if (x.s != y.s) {
    y.s = -y.s;
    return x.plus(y);
  }
  xd = x.d;
  yd = y.d;
  pr = Ctor.precision;
  rm = Ctor.rounding;
  if (!xd[0] || !yd[0]) {
    if (yd[0])
      y.s = -y.s;
    else if (xd[0])
      y = new Ctor(x);
    else
      return new Ctor(rm === 3 ? -0 : 0);
    return external ? finalise(y, pr, rm) : y;
  }
  e = mathfloor(y.e / LOG_BASE);
  xe = mathfloor(x.e / LOG_BASE);
  xd = xd.slice();
  k = xe - e;
  if (k) {
    xLTy = k < 0;
    if (xLTy) {
      d = xd;
      k = -k;
      len = yd.length;
    } else {
      d = yd;
      e = xe;
      len = xd.length;
    }
    i = Math.max(Math.ceil(pr / LOG_BASE), len) + 2;
    if (k > i) {
      k = i;
      d.length = 1;
    }
    d.reverse();
    for (i = k; i--; )
      d.push(0);
    d.reverse();
  } else {
    i = xd.length;
    len = yd.length;
    xLTy = i < len;
    if (xLTy)
      len = i;
    for (i = 0; i < len; i++) {
      if (xd[i] != yd[i]) {
        xLTy = xd[i] < yd[i];
        break;
      }
    }
    k = 0;
  }
  if (xLTy) {
    d = xd;
    xd = yd;
    yd = d;
    y.s = -y.s;
  }
  len = xd.length;
  for (i = yd.length - len; i > 0; --i)
    xd[len++] = 0;
  for (i = yd.length; i > k; ) {
    if (xd[--i] < yd[i]) {
      for (j = i; j && xd[--j] === 0; )
        xd[j] = BASE - 1;
      --xd[j];
      xd[i] += BASE;
    }
    xd[i] -= yd[i];
  }
  for (; xd[--len] === 0; )
    xd.pop();
  for (; xd[0] === 0; xd.shift())
    --e;
  if (!xd[0])
    return new Ctor(rm === 3 ? -0 : 0);
  y.d = xd;
  y.e = getBase10Exponent(xd, e);
  return external ? finalise(y, pr, rm) : y;
};
P.modulo = P.mod = function(y) {
  var q, x = this, Ctor = x.constructor;
  y = new Ctor(y);
  if (!x.d || !y.s || y.d && !y.d[0])
    return new Ctor(NaN);
  if (!y.d || x.d && !x.d[0]) {
    return finalise(new Ctor(x), Ctor.precision, Ctor.rounding);
  }
  external = false;
  if (Ctor.modulo == 9) {
    q = divide(x, y.abs(), 0, 3, 1);
    q.s *= y.s;
  } else {
    q = divide(x, y, 0, Ctor.modulo, 1);
  }
  q = q.times(y);
  external = true;
  return x.minus(q);
};
P.naturalExponential = P.exp = function() {
  return naturalExponential(this);
};
P.naturalLogarithm = P.ln = function() {
  return naturalLogarithm(this);
};
P.negated = P.neg = function() {
  var x = new this.constructor(this);
  x.s = -x.s;
  return finalise(x);
};
P.plus = P.add = function(y) {
  var carry, d, e, i, k, len, pr, rm, xd, yd, x = this, Ctor = x.constructor;
  y = new Ctor(y);
  if (!x.d || !y.d) {
    if (!x.s || !y.s)
      y = new Ctor(NaN);
    else if (!x.d)
      y = new Ctor(y.d || x.s === y.s ? x : NaN);
    return y;
  }
  if (x.s != y.s) {
    y.s = -y.s;
    return x.minus(y);
  }
  xd = x.d;
  yd = y.d;
  pr = Ctor.precision;
  rm = Ctor.rounding;
  if (!xd[0] || !yd[0]) {
    if (!yd[0])
      y = new Ctor(x);
    return external ? finalise(y, pr, rm) : y;
  }
  k = mathfloor(x.e / LOG_BASE);
  e = mathfloor(y.e / LOG_BASE);
  xd = xd.slice();
  i = k - e;
  if (i) {
    if (i < 0) {
      d = xd;
      i = -i;
      len = yd.length;
    } else {
      d = yd;
      e = k;
      len = xd.length;
    }
    k = Math.ceil(pr / LOG_BASE);
    len = k > len ? k + 1 : len + 1;
    if (i > len) {
      i = len;
      d.length = 1;
    }
    d.reverse();
    for (; i--; )
      d.push(0);
    d.reverse();
  }
  len = xd.length;
  i = yd.length;
  if (len - i < 0) {
    i = len;
    d = yd;
    yd = xd;
    xd = d;
  }
  for (carry = 0; i; ) {
    carry = (xd[--i] = xd[i] + yd[i] + carry) / BASE | 0;
    xd[i] %= BASE;
  }
  if (carry) {
    xd.unshift(carry);
    ++e;
  }
  for (len = xd.length; xd[--len] == 0; )
    xd.pop();
  y.d = xd;
  y.e = getBase10Exponent(xd, e);
  return external ? finalise(y, pr, rm) : y;
};
P.precision = P.sd = function(z) {
  var k, x = this;
  if (z !== void 0 && z !== !!z && z !== 1 && z !== 0)
    throw Error(invalidArgument + z);
  if (x.d) {
    k = getPrecision(x.d);
    if (z && x.e + 1 > k)
      k = x.e + 1;
  } else {
    k = NaN;
  }
  return k;
};
P.round = function() {
  var x = this, Ctor = x.constructor;
  return finalise(new Ctor(x), x.e + 1, Ctor.rounding);
};
P.sine = P.sin = function() {
  var pr, rm, x = this, Ctor = x.constructor;
  if (!x.isFinite())
    return new Ctor(NaN);
  if (x.isZero())
    return new Ctor(x);
  pr = Ctor.precision;
  rm = Ctor.rounding;
  Ctor.precision = pr + Math.max(x.e, x.sd()) + LOG_BASE;
  Ctor.rounding = 1;
  x = sine(Ctor, toLessThanHalfPi(Ctor, x));
  Ctor.precision = pr;
  Ctor.rounding = rm;
  return finalise(quadrant > 2 ? x.neg() : x, pr, rm, true);
};
P.squareRoot = P.sqrt = function() {
  var m, n, sd, r, rep, t, x = this, d = x.d, e = x.e, s = x.s, Ctor = x.constructor;
  if (s !== 1 || !d || !d[0]) {
    return new Ctor(!s || s < 0 && (!d || d[0]) ? NaN : d ? x : 1 / 0);
  }
  external = false;
  s = Math.sqrt(+x);
  if (s == 0 || s == 1 / 0) {
    n = digitsToString(d);
    if ((n.length + e) % 2 == 0)
      n += "0";
    s = Math.sqrt(n);
    e = mathfloor((e + 1) / 2) - (e < 0 || e % 2);
    if (s == 1 / 0) {
      n = "5e" + e;
    } else {
      n = s.toExponential();
      n = n.slice(0, n.indexOf("e") + 1) + e;
    }
    r = new Ctor(n);
  } else {
    r = new Ctor(s.toString());
  }
  sd = (e = Ctor.precision) + 3;
  for (; ; ) {
    t = r;
    r = t.plus(divide(x, t, sd + 2, 1)).times(0.5);
    if (digitsToString(t.d).slice(0, sd) === (n = digitsToString(r.d)).slice(0, sd)) {
      n = n.slice(sd - 3, sd + 1);
      if (n == "9999" || !rep && n == "4999") {
        if (!rep) {
          finalise(t, e + 1, 0);
          if (t.times(t).eq(x)) {
            r = t;
            break;
          }
        }
        sd += 4;
        rep = 1;
      } else {
        if (!+n || !+n.slice(1) && n.charAt(0) == "5") {
          finalise(r, e + 1, 1);
          m = !r.times(r).eq(x);
        }
        break;
      }
    }
  }
  external = true;
  return finalise(r, e, Ctor.rounding, m);
};
P.tangent = P.tan = function() {
  var pr, rm, x = this, Ctor = x.constructor;
  if (!x.isFinite())
    return new Ctor(NaN);
  if (x.isZero())
    return new Ctor(x);
  pr = Ctor.precision;
  rm = Ctor.rounding;
  Ctor.precision = pr + 10;
  Ctor.rounding = 1;
  x = x.sin();
  x.s = 1;
  x = divide(x, new Ctor(1).minus(x.times(x)).sqrt(), pr + 10, 0);
  Ctor.precision = pr;
  Ctor.rounding = rm;
  return finalise(quadrant == 2 || quadrant == 4 ? x.neg() : x, pr, rm, true);
};
P.times = P.mul = function(y) {
  var carry, e, i, k, r, rL, t, xdL, ydL, x = this, Ctor = x.constructor, xd = x.d, yd = (y = new Ctor(y)).d;
  y.s *= x.s;
  if (!xd || !xd[0] || !yd || !yd[0]) {
    return new Ctor(!y.s || xd && !xd[0] && !yd || yd && !yd[0] && !xd ? NaN : !xd || !yd ? y.s / 0 : y.s * 0);
  }
  e = mathfloor(x.e / LOG_BASE) + mathfloor(y.e / LOG_BASE);
  xdL = xd.length;
  ydL = yd.length;
  if (xdL < ydL) {
    r = xd;
    xd = yd;
    yd = r;
    rL = xdL;
    xdL = ydL;
    ydL = rL;
  }
  r = [];
  rL = xdL + ydL;
  for (i = rL; i--; )
    r.push(0);
  for (i = ydL; --i >= 0; ) {
    carry = 0;
    for (k = xdL + i; k > i; ) {
      t = r[k] + yd[i] * xd[k - i - 1] + carry;
      r[k--] = t % BASE | 0;
      carry = t / BASE | 0;
    }
    r[k] = (r[k] + carry) % BASE | 0;
  }
  for (; !r[--rL]; )
    r.pop();
  if (carry)
    ++e;
  else
    r.shift();
  y.d = r;
  y.e = getBase10Exponent(r, e);
  return external ? finalise(y, Ctor.precision, Ctor.rounding) : y;
};
P.toBinary = function(sd, rm) {
  return toStringBinary(this, 2, sd, rm);
};
P.toDecimalPlaces = P.toDP = function(dp, rm) {
  var x = this, Ctor = x.constructor;
  x = new Ctor(x);
  if (dp === void 0)
    return x;
  checkInt32(dp, 0, MAX_DIGITS);
  if (rm === void 0)
    rm = Ctor.rounding;
  else
    checkInt32(rm, 0, 8);
  return finalise(x, dp + x.e + 1, rm);
};
P.toExponential = function(dp, rm) {
  var str, x = this, Ctor = x.constructor;
  if (dp === void 0) {
    str = finiteToString(x, true);
  } else {
    checkInt32(dp, 0, MAX_DIGITS);
    if (rm === void 0)
      rm = Ctor.rounding;
    else
      checkInt32(rm, 0, 8);
    x = finalise(new Ctor(x), dp + 1, rm);
    str = finiteToString(x, true, dp + 1);
  }
  return x.isNeg() && !x.isZero() ? "-" + str : str;
};
P.toFixed = function(dp, rm) {
  var str, y, x = this, Ctor = x.constructor;
  if (dp === void 0) {
    str = finiteToString(x);
  } else {
    checkInt32(dp, 0, MAX_DIGITS);
    if (rm === void 0)
      rm = Ctor.rounding;
    else
      checkInt32(rm, 0, 8);
    y = finalise(new Ctor(x), dp + x.e + 1, rm);
    str = finiteToString(y, false, dp + y.e + 1);
  }
  return x.isNeg() && !x.isZero() ? "-" + str : str;
};
P.toFraction = function(maxD) {
  var d, d0, d1, d2, e, k, n, n0, n12, pr, q, r, x = this, xd = x.d, Ctor = x.constructor;
  if (!xd)
    return new Ctor(x);
  n12 = d0 = new Ctor(1);
  d1 = n0 = new Ctor(0);
  d = new Ctor(d1);
  e = d.e = getPrecision(xd) - x.e - 1;
  k = e % LOG_BASE;
  d.d[0] = mathpow(10, k < 0 ? LOG_BASE + k : k);
  if (maxD == null) {
    maxD = e > 0 ? d : n12;
  } else {
    n = new Ctor(maxD);
    if (!n.isInt() || n.lt(n12))
      throw Error(invalidArgument + n);
    maxD = n.gt(d) ? e > 0 ? d : n12 : n;
  }
  external = false;
  n = new Ctor(digitsToString(xd));
  pr = Ctor.precision;
  Ctor.precision = e = xd.length * LOG_BASE * 2;
  for (; ; ) {
    q = divide(n, d, 0, 1, 1);
    d2 = d0.plus(q.times(d1));
    if (d2.cmp(maxD) == 1)
      break;
    d0 = d1;
    d1 = d2;
    d2 = n12;
    n12 = n0.plus(q.times(d2));
    n0 = d2;
    d2 = d;
    d = n.minus(q.times(d2));
    n = d2;
  }
  d2 = divide(maxD.minus(d0), d1, 0, 1, 1);
  n0 = n0.plus(d2.times(n12));
  d0 = d0.plus(d2.times(d1));
  n0.s = n12.s = x.s;
  r = divide(n12, d1, e, 1).minus(x).abs().cmp(divide(n0, d0, e, 1).minus(x).abs()) < 1 ? [n12, d1] : [n0, d0];
  Ctor.precision = pr;
  external = true;
  return r;
};
P.toHexadecimal = P.toHex = function(sd, rm) {
  return toStringBinary(this, 16, sd, rm);
};
P.toNearest = function(y, rm) {
  var x = this, Ctor = x.constructor;
  x = new Ctor(x);
  if (y == null) {
    if (!x.d)
      return x;
    y = new Ctor(1);
    rm = Ctor.rounding;
  } else {
    y = new Ctor(y);
    if (rm === void 0) {
      rm = Ctor.rounding;
    } else {
      checkInt32(rm, 0, 8);
    }
    if (!x.d)
      return y.s ? x : y;
    if (!y.d) {
      if (y.s)
        y.s = x.s;
      return y;
    }
  }
  if (y.d[0]) {
    external = false;
    x = divide(x, y, 0, rm, 1).times(y);
    external = true;
    finalise(x);
  } else {
    y.s = x.s;
    x = y;
  }
  return x;
};
P.toNumber = function() {
  return +this;
};
P.toOctal = function(sd, rm) {
  return toStringBinary(this, 8, sd, rm);
};
P.toPower = P.pow = function(y) {
  var e, k, pr, r, rm, s, x = this, Ctor = x.constructor, yn = +(y = new Ctor(y));
  if (!x.d || !y.d || !x.d[0] || !y.d[0])
    return new Ctor(mathpow(+x, yn));
  x = new Ctor(x);
  if (x.eq(1))
    return x;
  pr = Ctor.precision;
  rm = Ctor.rounding;
  if (y.eq(1))
    return finalise(x, pr, rm);
  e = mathfloor(y.e / LOG_BASE);
  if (e >= y.d.length - 1 && (k = yn < 0 ? -yn : yn) <= MAX_SAFE_INTEGER) {
    r = intPow(Ctor, x, k, pr);
    return y.s < 0 ? new Ctor(1).div(r) : finalise(r, pr, rm);
  }
  s = x.s;
  if (s < 0) {
    if (e < y.d.length - 1)
      return new Ctor(NaN);
    if ((y.d[e] & 1) == 0)
      s = 1;
    if (x.e == 0 && x.d[0] == 1 && x.d.length == 1) {
      x.s = s;
      return x;
    }
  }
  k = mathpow(+x, yn);
  e = k == 0 || !isFinite(k) ? mathfloor(yn * (Math.log("0." + digitsToString(x.d)) / Math.LN10 + x.e + 1)) : new Ctor(k + "").e;
  if (e > Ctor.maxE + 1 || e < Ctor.minE - 1)
    return new Ctor(e > 0 ? s / 0 : 0);
  external = false;
  Ctor.rounding = x.s = 1;
  k = Math.min(12, (e + "").length);
  r = naturalExponential(y.times(naturalLogarithm(x, pr + k)), pr);
  if (r.d) {
    r = finalise(r, pr + 5, 1);
    if (checkRoundingDigits(r.d, pr, rm)) {
      e = pr + 10;
      r = finalise(naturalExponential(y.times(naturalLogarithm(x, e + k)), e), e + 5, 1);
      if (+digitsToString(r.d).slice(pr + 1, pr + 15) + 1 == 1e14) {
        r = finalise(r, pr + 1, 0);
      }
    }
  }
  r.s = s;
  external = true;
  Ctor.rounding = rm;
  return finalise(r, pr, rm);
};
P.toPrecision = function(sd, rm) {
  var str, x = this, Ctor = x.constructor;
  if (sd === void 0) {
    str = finiteToString(x, x.e <= Ctor.toExpNeg || x.e >= Ctor.toExpPos);
  } else {
    checkInt32(sd, 1, MAX_DIGITS);
    if (rm === void 0)
      rm = Ctor.rounding;
    else
      checkInt32(rm, 0, 8);
    x = finalise(new Ctor(x), sd, rm);
    str = finiteToString(x, sd <= x.e || x.e <= Ctor.toExpNeg, sd);
  }
  return x.isNeg() && !x.isZero() ? "-" + str : str;
};
P.toSignificantDigits = P.toSD = function(sd, rm) {
  var x = this, Ctor = x.constructor;
  if (sd === void 0) {
    sd = Ctor.precision;
    rm = Ctor.rounding;
  } else {
    checkInt32(sd, 1, MAX_DIGITS);
    if (rm === void 0)
      rm = Ctor.rounding;
    else
      checkInt32(rm, 0, 8);
  }
  return finalise(new Ctor(x), sd, rm);
};
P.toString = function() {
  var x = this, Ctor = x.constructor, str = finiteToString(x, x.e <= Ctor.toExpNeg || x.e >= Ctor.toExpPos);
  return x.isNeg() && !x.isZero() ? "-" + str : str;
};
P.truncated = P.trunc = function() {
  return finalise(new this.constructor(this), this.e + 1, 1);
};
P.valueOf = P.toJSON = function() {
  var x = this, Ctor = x.constructor, str = finiteToString(x, x.e <= Ctor.toExpNeg || x.e >= Ctor.toExpPos);
  return x.isNeg() ? "-" + str : str;
};
function digitsToString(d) {
  var i, k, ws, indexOfLastWord = d.length - 1, str = "", w = d[0];
  if (indexOfLastWord > 0) {
    str += w;
    for (i = 1; i < indexOfLastWord; i++) {
      ws = d[i] + "";
      k = LOG_BASE - ws.length;
      if (k)
        str += getZeroString(k);
      str += ws;
    }
    w = d[i];
    ws = w + "";
    k = LOG_BASE - ws.length;
    if (k)
      str += getZeroString(k);
  } else if (w === 0) {
    return "0";
  }
  for (; w % 10 === 0; )
    w /= 10;
  return str + w;
}
function checkInt32(i, min2, max2) {
  if (i !== ~~i || i < min2 || i > max2) {
    throw Error(invalidArgument + i);
  }
}
function checkRoundingDigits(d, i, rm, repeating) {
  var di, k, r, rd;
  for (k = d[0]; k >= 10; k /= 10)
    --i;
  if (--i < 0) {
    i += LOG_BASE;
    di = 0;
  } else {
    di = Math.ceil((i + 1) / LOG_BASE);
    i %= LOG_BASE;
  }
  k = mathpow(10, LOG_BASE - i);
  rd = d[di] % k | 0;
  if (repeating == null) {
    if (i < 3) {
      if (i == 0)
        rd = rd / 100 | 0;
      else if (i == 1)
        rd = rd / 10 | 0;
      r = rm < 4 && rd == 99999 || rm > 3 && rd == 49999 || rd == 5e4 || rd == 0;
    } else {
      r = (rm < 4 && rd + 1 == k || rm > 3 && rd + 1 == k / 2) && (d[di + 1] / k / 100 | 0) == mathpow(10, i - 2) - 1 || (rd == k / 2 || rd == 0) && (d[di + 1] / k / 100 | 0) == 0;
    }
  } else {
    if (i < 4) {
      if (i == 0)
        rd = rd / 1e3 | 0;
      else if (i == 1)
        rd = rd / 100 | 0;
      else if (i == 2)
        rd = rd / 10 | 0;
      r = (repeating || rm < 4) && rd == 9999 || !repeating && rm > 3 && rd == 4999;
    } else {
      r = ((repeating || rm < 4) && rd + 1 == k || !repeating && rm > 3 && rd + 1 == k / 2) && (d[di + 1] / k / 1e3 | 0) == mathpow(10, i - 3) - 1;
    }
  }
  return r;
}
function convertBase(str, baseIn, baseOut) {
  var j, arr = [0], arrL, i = 0, strL = str.length;
  for (; i < strL; ) {
    for (arrL = arr.length; arrL--; )
      arr[arrL] *= baseIn;
    arr[0] += NUMERALS.indexOf(str.charAt(i++));
    for (j = 0; j < arr.length; j++) {
      if (arr[j] > baseOut - 1) {
        if (arr[j + 1] === void 0)
          arr[j + 1] = 0;
        arr[j + 1] += arr[j] / baseOut | 0;
        arr[j] %= baseOut;
      }
    }
  }
  return arr.reverse();
}
function cosine(Ctor, x) {
  var k, y, len = x.d.length;
  if (len < 32) {
    k = Math.ceil(len / 3);
    y = (1 / tinyPow(4, k)).toString();
  } else {
    k = 16;
    y = "2.3283064365386962890625e-10";
  }
  Ctor.precision += k;
  x = taylorSeries(Ctor, 1, x.times(y), new Ctor(1));
  for (var i = k; i--; ) {
    var cos2x = x.times(x);
    x = cos2x.times(cos2x).minus(cos2x).times(8).plus(1);
  }
  Ctor.precision -= k;
  return x;
}
var divide = function() {
  function multiplyInteger(x, k, base) {
    var temp, carry = 0, i = x.length;
    for (x = x.slice(); i--; ) {
      temp = x[i] * k + carry;
      x[i] = temp % base | 0;
      carry = temp / base | 0;
    }
    if (carry)
      x.unshift(carry);
    return x;
  }
  function compare(a2, b2, aL, bL) {
    var i, r;
    if (aL != bL) {
      r = aL > bL ? 1 : -1;
    } else {
      for (i = r = 0; i < aL; i++) {
        if (a2[i] != b2[i]) {
          r = a2[i] > b2[i] ? 1 : -1;
          break;
        }
      }
    }
    return r;
  }
  function subtract(a2, b2, aL, base) {
    var i = 0;
    for (; aL--; ) {
      a2[aL] -= i;
      i = a2[aL] < b2[aL] ? 1 : 0;
      a2[aL] = i * base + a2[aL] - b2[aL];
    }
    for (; !a2[0] && a2.length > 1; )
      a2.shift();
  }
  return function(x, y, pr, rm, dp, base) {
    var cmp, e, i, k, logBase, more, prod, prodL, q, qd, rem, remL, rem0, sd, t, xi, xL, yd0, yL, yz, Ctor = x.constructor, sign2 = x.s == y.s ? 1 : -1, xd = x.d, yd = y.d;
    if (!xd || !xd[0] || !yd || !yd[0]) {
      return new Ctor(!x.s || !y.s || (xd ? yd && xd[0] == yd[0] : !yd) ? NaN : xd && xd[0] == 0 || !yd ? sign2 * 0 : sign2 / 0);
    }
    if (base) {
      logBase = 1;
      e = x.e - y.e;
    } else {
      base = BASE;
      logBase = LOG_BASE;
      e = mathfloor(x.e / logBase) - mathfloor(y.e / logBase);
    }
    yL = yd.length;
    xL = xd.length;
    q = new Ctor(sign2);
    qd = q.d = [];
    for (i = 0; yd[i] == (xd[i] || 0); i++)
      ;
    if (yd[i] > (xd[i] || 0))
      e--;
    if (pr == null) {
      sd = pr = Ctor.precision;
      rm = Ctor.rounding;
    } else if (dp) {
      sd = pr + (x.e - y.e) + 1;
    } else {
      sd = pr;
    }
    if (sd < 0) {
      qd.push(1);
      more = true;
    } else {
      sd = sd / logBase + 2 | 0;
      i = 0;
      if (yL == 1) {
        k = 0;
        yd = yd[0];
        sd++;
        for (; (i < xL || k) && sd--; i++) {
          t = k * base + (xd[i] || 0);
          qd[i] = t / yd | 0;
          k = t % yd | 0;
        }
        more = k || i < xL;
      } else {
        k = base / (yd[0] + 1) | 0;
        if (k > 1) {
          yd = multiplyInteger(yd, k, base);
          xd = multiplyInteger(xd, k, base);
          yL = yd.length;
          xL = xd.length;
        }
        xi = yL;
        rem = xd.slice(0, yL);
        remL = rem.length;
        for (; remL < yL; )
          rem[remL++] = 0;
        yz = yd.slice();
        yz.unshift(0);
        yd0 = yd[0];
        if (yd[1] >= base / 2)
          ++yd0;
        do {
          k = 0;
          cmp = compare(yd, rem, yL, remL);
          if (cmp < 0) {
            rem0 = rem[0];
            if (yL != remL)
              rem0 = rem0 * base + (rem[1] || 0);
            k = rem0 / yd0 | 0;
            if (k > 1) {
              if (k >= base)
                k = base - 1;
              prod = multiplyInteger(yd, k, base);
              prodL = prod.length;
              remL = rem.length;
              cmp = compare(prod, rem, prodL, remL);
              if (cmp == 1) {
                k--;
                subtract(prod, yL < prodL ? yz : yd, prodL, base);
              }
            } else {
              if (k == 0)
                cmp = k = 1;
              prod = yd.slice();
            }
            prodL = prod.length;
            if (prodL < remL)
              prod.unshift(0);
            subtract(rem, prod, remL, base);
            if (cmp == -1) {
              remL = rem.length;
              cmp = compare(yd, rem, yL, remL);
              if (cmp < 1) {
                k++;
                subtract(rem, yL < remL ? yz : yd, remL, base);
              }
            }
            remL = rem.length;
          } else if (cmp === 0) {
            k++;
            rem = [0];
          }
          qd[i++] = k;
          if (cmp && rem[0]) {
            rem[remL++] = xd[xi] || 0;
          } else {
            rem = [xd[xi]];
            remL = 1;
          }
        } while ((xi++ < xL || rem[0] !== void 0) && sd--);
        more = rem[0] !== void 0;
      }
      if (!qd[0])
        qd.shift();
    }
    if (logBase == 1) {
      q.e = e;
      inexact = more;
    } else {
      for (i = 1, k = qd[0]; k >= 10; k /= 10)
        i++;
      q.e = i + e * logBase - 1;
      finalise(q, dp ? pr + q.e + 1 : pr, rm, more);
    }
    return q;
  };
}();
function finalise(x, sd, rm, isTruncated) {
  var digits2, i, j, k, rd, roundUp, w, xd, xdi, Ctor = x.constructor;
  out:
    if (sd != null) {
      xd = x.d;
      if (!xd)
        return x;
      for (digits2 = 1, k = xd[0]; k >= 10; k /= 10)
        digits2++;
      i = sd - digits2;
      if (i < 0) {
        i += LOG_BASE;
        j = sd;
        w = xd[xdi = 0];
        rd = w / mathpow(10, digits2 - j - 1) % 10 | 0;
      } else {
        xdi = Math.ceil((i + 1) / LOG_BASE);
        k = xd.length;
        if (xdi >= k) {
          if (isTruncated) {
            for (; k++ <= xdi; )
              xd.push(0);
            w = rd = 0;
            digits2 = 1;
            i %= LOG_BASE;
            j = i - LOG_BASE + 1;
          } else {
            break out;
          }
        } else {
          w = k = xd[xdi];
          for (digits2 = 1; k >= 10; k /= 10)
            digits2++;
          i %= LOG_BASE;
          j = i - LOG_BASE + digits2;
          rd = j < 0 ? 0 : w / mathpow(10, digits2 - j - 1) % 10 | 0;
        }
      }
      isTruncated = isTruncated || sd < 0 || xd[xdi + 1] !== void 0 || (j < 0 ? w : w % mathpow(10, digits2 - j - 1));
      roundUp = rm < 4 ? (rd || isTruncated) && (rm == 0 || rm == (x.s < 0 ? 3 : 2)) : rd > 5 || rd == 5 && (rm == 4 || isTruncated || rm == 6 && (i > 0 ? j > 0 ? w / mathpow(10, digits2 - j) : 0 : xd[xdi - 1]) % 10 & 1 || rm == (x.s < 0 ? 8 : 7));
      if (sd < 1 || !xd[0]) {
        xd.length = 0;
        if (roundUp) {
          sd -= x.e + 1;
          xd[0] = mathpow(10, (LOG_BASE - sd % LOG_BASE) % LOG_BASE);
          x.e = -sd || 0;
        } else {
          xd[0] = x.e = 0;
        }
        return x;
      }
      if (i == 0) {
        xd.length = xdi;
        k = 1;
        xdi--;
      } else {
        xd.length = xdi + 1;
        k = mathpow(10, LOG_BASE - i);
        xd[xdi] = j > 0 ? (w / mathpow(10, digits2 - j) % mathpow(10, j) | 0) * k : 0;
      }
      if (roundUp) {
        for (; ; ) {
          if (xdi == 0) {
            for (i = 1, j = xd[0]; j >= 10; j /= 10)
              i++;
            j = xd[0] += k;
            for (k = 1; j >= 10; j /= 10)
              k++;
            if (i != k) {
              x.e++;
              if (xd[0] == BASE)
                xd[0] = 1;
            }
            break;
          } else {
            xd[xdi] += k;
            if (xd[xdi] != BASE)
              break;
            xd[xdi--] = 0;
            k = 1;
          }
        }
      }
      for (i = xd.length; xd[--i] === 0; )
        xd.pop();
    }
  if (external) {
    if (x.e > Ctor.maxE) {
      x.d = null;
      x.e = NaN;
    } else if (x.e < Ctor.minE) {
      x.e = 0;
      x.d = [0];
    }
  }
  return x;
}
function finiteToString(x, isExp, sd) {
  if (!x.isFinite())
    return nonFiniteToString(x);
  var k, e = x.e, str = digitsToString(x.d), len = str.length;
  if (isExp) {
    if (sd && (k = sd - len) > 0) {
      str = str.charAt(0) + "." + str.slice(1) + getZeroString(k);
    } else if (len > 1) {
      str = str.charAt(0) + "." + str.slice(1);
    }
    str = str + (x.e < 0 ? "e" : "e+") + x.e;
  } else if (e < 0) {
    str = "0." + getZeroString(-e - 1) + str;
    if (sd && (k = sd - len) > 0)
      str += getZeroString(k);
  } else if (e >= len) {
    str += getZeroString(e + 1 - len);
    if (sd && (k = sd - e - 1) > 0)
      str = str + "." + getZeroString(k);
  } else {
    if ((k = e + 1) < len)
      str = str.slice(0, k) + "." + str.slice(k);
    if (sd && (k = sd - len) > 0) {
      if (e + 1 === len)
        str += ".";
      str += getZeroString(k);
    }
  }
  return str;
}
function getBase10Exponent(digits2, e) {
  var w = digits2[0];
  for (e *= LOG_BASE; w >= 10; w /= 10)
    e++;
  return e;
}
function getLn10(Ctor, sd, pr) {
  if (sd > LN10_PRECISION) {
    external = true;
    if (pr)
      Ctor.precision = pr;
    throw Error(precisionLimitExceeded);
  }
  return finalise(new Ctor(LN10), sd, 1, true);
}
function getPi(Ctor, sd, rm) {
  if (sd > PI_PRECISION)
    throw Error(precisionLimitExceeded);
  return finalise(new Ctor(PI), sd, rm, true);
}
function getPrecision(digits2) {
  var w = digits2.length - 1, len = w * LOG_BASE + 1;
  w = digits2[w];
  if (w) {
    for (; w % 10 == 0; w /= 10)
      len--;
    for (w = digits2[0]; w >= 10; w /= 10)
      len++;
  }
  return len;
}
function getZeroString(k) {
  var zs = "";
  for (; k--; )
    zs += "0";
  return zs;
}
function intPow(Ctor, x, n, pr) {
  var isTruncated, r = new Ctor(1), k = Math.ceil(pr / LOG_BASE + 4);
  external = false;
  for (; ; ) {
    if (n % 2) {
      r = r.times(x);
      if (truncate(r.d, k))
        isTruncated = true;
    }
    n = mathfloor(n / 2);
    if (n === 0) {
      n = r.d.length - 1;
      if (isTruncated && r.d[n] === 0)
        ++r.d[n];
      break;
    }
    x = x.times(x);
    truncate(x.d, k);
  }
  external = true;
  return r;
}
function isOdd(n) {
  return n.d[n.d.length - 1] & 1;
}
function maxOrMin(Ctor, args, ltgt) {
  var y, x = new Ctor(args[0]), i = 0;
  for (; ++i < args.length; ) {
    y = new Ctor(args[i]);
    if (!y.s) {
      x = y;
      break;
    } else if (x[ltgt](y)) {
      x = y;
    }
  }
  return x;
}
function naturalExponential(x, sd) {
  var denominator, guard, j, pow2, sum, t, wpr, rep = 0, i = 0, k = 0, Ctor = x.constructor, rm = Ctor.rounding, pr = Ctor.precision;
  if (!x.d || !x.d[0] || x.e > 17) {
    return new Ctor(x.d ? !x.d[0] ? 1 : x.s < 0 ? 0 : 1 / 0 : x.s ? x.s < 0 ? 0 : x : 0 / 0);
  }
  if (sd == null) {
    external = false;
    wpr = pr;
  } else {
    wpr = sd;
  }
  t = new Ctor(0.03125);
  while (x.e > -2) {
    x = x.times(t);
    k += 5;
  }
  guard = Math.log(mathpow(2, k)) / Math.LN10 * 2 + 5 | 0;
  wpr += guard;
  denominator = pow2 = sum = new Ctor(1);
  Ctor.precision = wpr;
  for (; ; ) {
    pow2 = finalise(pow2.times(x), wpr, 1);
    denominator = denominator.times(++i);
    t = sum.plus(divide(pow2, denominator, wpr, 1));
    if (digitsToString(t.d).slice(0, wpr) === digitsToString(sum.d).slice(0, wpr)) {
      j = k;
      while (j--)
        sum = finalise(sum.times(sum), wpr, 1);
      if (sd == null) {
        if (rep < 3 && checkRoundingDigits(sum.d, wpr - guard, rm, rep)) {
          Ctor.precision = wpr += 10;
          denominator = pow2 = t = new Ctor(1);
          i = 0;
          rep++;
        } else {
          return finalise(sum, Ctor.precision = pr, rm, external = true);
        }
      } else {
        Ctor.precision = pr;
        return sum;
      }
    }
    sum = t;
  }
}
function naturalLogarithm(y, sd) {
  var c2, c0, denominator, e, numerator, rep, sum, t, wpr, x1, x2, n = 1, guard = 10, x = y, xd = x.d, Ctor = x.constructor, rm = Ctor.rounding, pr = Ctor.precision;
  if (x.s < 0 || !xd || !xd[0] || !x.e && xd[0] == 1 && xd.length == 1) {
    return new Ctor(xd && !xd[0] ? -1 / 0 : x.s != 1 ? NaN : xd ? 0 : x);
  }
  if (sd == null) {
    external = false;
    wpr = pr;
  } else {
    wpr = sd;
  }
  Ctor.precision = wpr += guard;
  c2 = digitsToString(xd);
  c0 = c2.charAt(0);
  if (Math.abs(e = x.e) < 15e14) {
    while (c0 < 7 && c0 != 1 || c0 == 1 && c2.charAt(1) > 3) {
      x = x.times(y);
      c2 = digitsToString(x.d);
      c0 = c2.charAt(0);
      n++;
    }
    e = x.e;
    if (c0 > 1) {
      x = new Ctor("0." + c2);
      e++;
    } else {
      x = new Ctor(c0 + "." + c2.slice(1));
    }
  } else {
    t = getLn10(Ctor, wpr + 2, pr).times(e + "");
    x = naturalLogarithm(new Ctor(c0 + "." + c2.slice(1)), wpr - guard).plus(t);
    Ctor.precision = pr;
    return sd == null ? finalise(x, pr, rm, external = true) : x;
  }
  x1 = x;
  sum = numerator = x = divide(x.minus(1), x.plus(1), wpr, 1);
  x2 = finalise(x.times(x), wpr, 1);
  denominator = 3;
  for (; ; ) {
    numerator = finalise(numerator.times(x2), wpr, 1);
    t = sum.plus(divide(numerator, new Ctor(denominator), wpr, 1));
    if (digitsToString(t.d).slice(0, wpr) === digitsToString(sum.d).slice(0, wpr)) {
      sum = sum.times(2);
      if (e !== 0)
        sum = sum.plus(getLn10(Ctor, wpr + 2, pr).times(e + ""));
      sum = divide(sum, new Ctor(n), wpr, 1);
      if (sd == null) {
        if (checkRoundingDigits(sum.d, wpr - guard, rm, rep)) {
          Ctor.precision = wpr += guard;
          t = numerator = x = divide(x1.minus(1), x1.plus(1), wpr, 1);
          x2 = finalise(x.times(x), wpr, 1);
          denominator = rep = 1;
        } else {
          return finalise(sum, Ctor.precision = pr, rm, external = true);
        }
      } else {
        Ctor.precision = pr;
        return sum;
      }
    }
    sum = t;
    denominator += 2;
  }
}
function nonFiniteToString(x) {
  return String(x.s * x.s / 0);
}
function parseDecimal(x, str) {
  var e, i, len;
  if ((e = str.indexOf(".")) > -1)
    str = str.replace(".", "");
  if ((i = str.search(/e/i)) > 0) {
    if (e < 0)
      e = i;
    e += +str.slice(i + 1);
    str = str.substring(0, i);
  } else if (e < 0) {
    e = str.length;
  }
  for (i = 0; str.charCodeAt(i) === 48; i++)
    ;
  for (len = str.length; str.charCodeAt(len - 1) === 48; --len)
    ;
  str = str.slice(i, len);
  if (str) {
    len -= i;
    x.e = e = e - i - 1;
    x.d = [];
    i = (e + 1) % LOG_BASE;
    if (e < 0)
      i += LOG_BASE;
    if (i < len) {
      if (i)
        x.d.push(+str.slice(0, i));
      for (len -= LOG_BASE; i < len; )
        x.d.push(+str.slice(i, i += LOG_BASE));
      str = str.slice(i);
      i = LOG_BASE - str.length;
    } else {
      i -= len;
    }
    for (; i--; )
      str += "0";
    x.d.push(+str);
    if (external) {
      if (x.e > x.constructor.maxE) {
        x.d = null;
        x.e = NaN;
      } else if (x.e < x.constructor.minE) {
        x.e = 0;
        x.d = [0];
      }
    }
  } else {
    x.e = 0;
    x.d = [0];
  }
  return x;
}
function parseOther(x, str) {
  var base, Ctor, divisor, i, isFloat, len, p, xd, xe;
  if (str === "Infinity" || str === "NaN") {
    if (!+str)
      x.s = NaN;
    x.e = NaN;
    x.d = null;
    return x;
  }
  if (isHex.test(str)) {
    base = 16;
    str = str.toLowerCase();
  } else if (isBinary.test(str)) {
    base = 2;
  } else if (isOctal.test(str)) {
    base = 8;
  } else {
    throw Error(invalidArgument + str);
  }
  i = str.search(/p/i);
  if (i > 0) {
    p = +str.slice(i + 1);
    str = str.substring(2, i);
  } else {
    str = str.slice(2);
  }
  i = str.indexOf(".");
  isFloat = i >= 0;
  Ctor = x.constructor;
  if (isFloat) {
    str = str.replace(".", "");
    len = str.length;
    i = len - i;
    divisor = intPow(Ctor, new Ctor(base), i, i * 2);
  }
  xd = convertBase(str, base, BASE);
  xe = xd.length - 1;
  for (i = xe; xd[i] === 0; --i)
    xd.pop();
  if (i < 0)
    return new Ctor(x.s * 0);
  x.e = getBase10Exponent(xd, xe);
  x.d = xd;
  external = false;
  if (isFloat)
    x = divide(x, divisor, len * 4);
  if (p)
    x = x.times(Math.abs(p) < 54 ? mathpow(2, p) : Decimal.pow(2, p));
  external = true;
  return x;
}
function sine(Ctor, x) {
  var k, len = x.d.length;
  if (len < 3)
    return taylorSeries(Ctor, 2, x, x);
  k = 1.4 * Math.sqrt(len);
  k = k > 16 ? 16 : k | 0;
  x = x.times(1 / tinyPow(5, k));
  x = taylorSeries(Ctor, 2, x, x);
  var sin2_x, d5 = new Ctor(5), d16 = new Ctor(16), d20 = new Ctor(20);
  for (; k--; ) {
    sin2_x = x.times(x);
    x = x.times(d5.plus(sin2_x.times(d16.times(sin2_x).minus(d20))));
  }
  return x;
}
function taylorSeries(Ctor, n, x, y, isHyperbolic) {
  var j, t, u, x2, pr = Ctor.precision, k = Math.ceil(pr / LOG_BASE);
  external = false;
  x2 = x.times(x);
  u = new Ctor(y);
  for (; ; ) {
    t = divide(u.times(x2), new Ctor(n++ * n++), pr, 1);
    u = isHyperbolic ? y.plus(t) : y.minus(t);
    y = divide(t.times(x2), new Ctor(n++ * n++), pr, 1);
    t = u.plus(y);
    if (t.d[k] !== void 0) {
      for (j = k; t.d[j] === u.d[j] && j--; )
        ;
      if (j == -1)
        break;
    }
    j = u;
    u = y;
    y = t;
    t = j;
  }
  external = true;
  t.d.length = k + 1;
  return t;
}
function tinyPow(b2, e) {
  var n = b2;
  while (--e)
    n *= b2;
  return n;
}
function toLessThanHalfPi(Ctor, x) {
  var t, isNeg = x.s < 0, pi = getPi(Ctor, Ctor.precision, 1), halfPi = pi.times(0.5);
  x = x.abs();
  if (x.lte(halfPi)) {
    quadrant = isNeg ? 4 : 1;
    return x;
  }
  t = x.divToInt(pi);
  if (t.isZero()) {
    quadrant = isNeg ? 3 : 2;
  } else {
    x = x.minus(t.times(pi));
    if (x.lte(halfPi)) {
      quadrant = isOdd(t) ? isNeg ? 2 : 3 : isNeg ? 4 : 1;
      return x;
    }
    quadrant = isOdd(t) ? isNeg ? 1 : 4 : isNeg ? 3 : 2;
  }
  return x.minus(pi).abs();
}
function toStringBinary(x, baseOut, sd, rm) {
  var base, e, i, k, len, roundUp, str, xd, y, Ctor = x.constructor, isExp = sd !== void 0;
  if (isExp) {
    checkInt32(sd, 1, MAX_DIGITS);
    if (rm === void 0)
      rm = Ctor.rounding;
    else
      checkInt32(rm, 0, 8);
  } else {
    sd = Ctor.precision;
    rm = Ctor.rounding;
  }
  if (!x.isFinite()) {
    str = nonFiniteToString(x);
  } else {
    str = finiteToString(x);
    i = str.indexOf(".");
    if (isExp) {
      base = 2;
      if (baseOut == 16) {
        sd = sd * 4 - 3;
      } else if (baseOut == 8) {
        sd = sd * 3 - 2;
      }
    } else {
      base = baseOut;
    }
    if (i >= 0) {
      str = str.replace(".", "");
      y = new Ctor(1);
      y.e = str.length - i;
      y.d = convertBase(finiteToString(y), 10, base);
      y.e = y.d.length;
    }
    xd = convertBase(str, 10, base);
    e = len = xd.length;
    for (; xd[--len] == 0; )
      xd.pop();
    if (!xd[0]) {
      str = isExp ? "0p+0" : "0";
    } else {
      if (i < 0) {
        e--;
      } else {
        x = new Ctor(x);
        x.d = xd;
        x.e = e;
        x = divide(x, y, sd, rm, 0, base);
        xd = x.d;
        e = x.e;
        roundUp = inexact;
      }
      i = xd[sd];
      k = base / 2;
      roundUp = roundUp || xd[sd + 1] !== void 0;
      roundUp = rm < 4 ? (i !== void 0 || roundUp) && (rm === 0 || rm === (x.s < 0 ? 3 : 2)) : i > k || i === k && (rm === 4 || roundUp || rm === 6 && xd[sd - 1] & 1 || rm === (x.s < 0 ? 8 : 7));
      xd.length = sd;
      if (roundUp) {
        for (; ++xd[--sd] > base - 1; ) {
          xd[sd] = 0;
          if (!sd) {
            ++e;
            xd.unshift(1);
          }
        }
      }
      for (len = xd.length; !xd[len - 1]; --len)
        ;
      for (i = 0, str = ""; i < len; i++)
        str += NUMERALS.charAt(xd[i]);
      if (isExp) {
        if (len > 1) {
          if (baseOut == 16 || baseOut == 8) {
            i = baseOut == 16 ? 4 : 3;
            for (--len; len % i; len++)
              str += "0";
            xd = convertBase(str, base, baseOut);
            for (len = xd.length; !xd[len - 1]; --len)
              ;
            for (i = 1, str = "1."; i < len; i++)
              str += NUMERALS.charAt(xd[i]);
          } else {
            str = str.charAt(0) + "." + str.slice(1);
          }
        }
        str = str + (e < 0 ? "p" : "p+") + e;
      } else if (e < 0) {
        for (; ++e; )
          str = "0" + str;
        str = "0." + str;
      } else {
        if (++e > len)
          for (e -= len; e--; )
            str += "0";
        else if (e < len)
          str = str.slice(0, e) + "." + str.slice(e);
      }
    }
    str = (baseOut == 16 ? "0x" : baseOut == 2 ? "0b" : baseOut == 8 ? "0o" : "") + str;
  }
  return x.s < 0 ? "-" + str : str;
}
function truncate(arr, len) {
  if (arr.length > len) {
    arr.length = len;
    return true;
  }
}
function abs(x) {
  return new this(x).abs();
}
function acos(x) {
  return new this(x).acos();
}
function acosh(x) {
  return new this(x).acosh();
}
function add(x, y) {
  return new this(x).plus(y);
}
function asin(x) {
  return new this(x).asin();
}
function asinh(x) {
  return new this(x).asinh();
}
function atan(x) {
  return new this(x).atan();
}
function atanh(x) {
  return new this(x).atanh();
}
function atan2(y, x) {
  y = new this(y);
  x = new this(x);
  var r, pr = this.precision, rm = this.rounding, wpr = pr + 4;
  if (!y.s || !x.s) {
    r = new this(NaN);
  } else if (!y.d && !x.d) {
    r = getPi(this, wpr, 1).times(x.s > 0 ? 0.25 : 0.75);
    r.s = y.s;
  } else if (!x.d || y.isZero()) {
    r = x.s < 0 ? getPi(this, pr, rm) : new this(0);
    r.s = y.s;
  } else if (!y.d || x.isZero()) {
    r = getPi(this, wpr, 1).times(0.5);
    r.s = y.s;
  } else if (x.s < 0) {
    this.precision = wpr;
    this.rounding = 1;
    r = this.atan(divide(y, x, wpr, 1));
    x = getPi(this, wpr, 1);
    this.precision = pr;
    this.rounding = rm;
    r = y.s < 0 ? r.minus(x) : r.plus(x);
  } else {
    r = this.atan(divide(y, x, wpr, 1));
  }
  return r;
}
function cbrt(x) {
  return new this(x).cbrt();
}
function ceil(x) {
  return finalise(x = new this(x), x.e + 1, 2);
}
function config(obj) {
  if (!obj || typeof obj !== "object")
    throw Error(decimalError + "Object expected");
  var i, p, v, useDefaults = obj.defaults === true, ps = [
    "precision",
    1,
    MAX_DIGITS,
    "rounding",
    0,
    8,
    "toExpNeg",
    -EXP_LIMIT,
    0,
    "toExpPos",
    0,
    EXP_LIMIT,
    "maxE",
    0,
    EXP_LIMIT,
    "minE",
    -EXP_LIMIT,
    0,
    "modulo",
    0,
    9
  ];
  for (i = 0; i < ps.length; i += 3) {
    if (p = ps[i], useDefaults)
      this[p] = DEFAULTS[p];
    if ((v = obj[p]) !== void 0) {
      if (mathfloor(v) === v && v >= ps[i + 1] && v <= ps[i + 2])
        this[p] = v;
      else
        throw Error(invalidArgument + p + ": " + v);
    }
  }
  if (p = "crypto", useDefaults)
    this[p] = DEFAULTS[p];
  if ((v = obj[p]) !== void 0) {
    if (v === true || v === false || v === 0 || v === 1) {
      if (v) {
        if (typeof crypto != "undefined" && crypto && (crypto.getRandomValues || crypto.randomBytes)) {
          this[p] = true;
        } else {
          throw Error(cryptoUnavailable);
        }
      } else {
        this[p] = false;
      }
    } else {
      throw Error(invalidArgument + p + ": " + v);
    }
  }
  return this;
}
function cos(x) {
  return new this(x).cos();
}
function cosh(x) {
  return new this(x).cosh();
}
function clone(obj) {
  var i, p, ps;
  function Decimal2(v) {
    var e, i2, t, x = this;
    if (!(x instanceof Decimal2))
      return new Decimal2(v);
    x.constructor = Decimal2;
    if (v instanceof Decimal2) {
      x.s = v.s;
      if (external) {
        if (!v.d || v.e > Decimal2.maxE) {
          x.e = NaN;
          x.d = null;
        } else if (v.e < Decimal2.minE) {
          x.e = 0;
          x.d = [0];
        } else {
          x.e = v.e;
          x.d = v.d.slice();
        }
      } else {
        x.e = v.e;
        x.d = v.d ? v.d.slice() : v.d;
      }
      return;
    }
    t = typeof v;
    if (t === "number") {
      if (v === 0) {
        x.s = 1 / v < 0 ? -1 : 1;
        x.e = 0;
        x.d = [0];
        return;
      }
      if (v < 0) {
        v = -v;
        x.s = -1;
      } else {
        x.s = 1;
      }
      if (v === ~~v && v < 1e7) {
        for (e = 0, i2 = v; i2 >= 10; i2 /= 10)
          e++;
        if (external) {
          if (e > Decimal2.maxE) {
            x.e = NaN;
            x.d = null;
          } else if (e < Decimal2.minE) {
            x.e = 0;
            x.d = [0];
          } else {
            x.e = e;
            x.d = [v];
          }
        } else {
          x.e = e;
          x.d = [v];
        }
        return;
      } else if (v * 0 !== 0) {
        if (!v)
          x.s = NaN;
        x.e = NaN;
        x.d = null;
        return;
      }
      return parseDecimal(x, v.toString());
    } else if (t !== "string") {
      throw Error(invalidArgument + v);
    }
    if ((i2 = v.charCodeAt(0)) === 45) {
      v = v.slice(1);
      x.s = -1;
    } else {
      if (i2 === 43)
        v = v.slice(1);
      x.s = 1;
    }
    return isDecimal.test(v) ? parseDecimal(x, v) : parseOther(x, v);
  }
  Decimal2.prototype = P;
  Decimal2.ROUND_UP = 0;
  Decimal2.ROUND_DOWN = 1;
  Decimal2.ROUND_CEIL = 2;
  Decimal2.ROUND_FLOOR = 3;
  Decimal2.ROUND_HALF_UP = 4;
  Decimal2.ROUND_HALF_DOWN = 5;
  Decimal2.ROUND_HALF_EVEN = 6;
  Decimal2.ROUND_HALF_CEIL = 7;
  Decimal2.ROUND_HALF_FLOOR = 8;
  Decimal2.EUCLID = 9;
  Decimal2.config = Decimal2.set = config;
  Decimal2.clone = clone;
  Decimal2.isDecimal = isDecimalInstance;
  Decimal2.abs = abs;
  Decimal2.acos = acos;
  Decimal2.acosh = acosh;
  Decimal2.add = add;
  Decimal2.asin = asin;
  Decimal2.asinh = asinh;
  Decimal2.atan = atan;
  Decimal2.atanh = atanh;
  Decimal2.atan2 = atan2;
  Decimal2.cbrt = cbrt;
  Decimal2.ceil = ceil;
  Decimal2.cos = cos;
  Decimal2.cosh = cosh;
  Decimal2.div = div;
  Decimal2.exp = exp;
  Decimal2.floor = floor;
  Decimal2.hypot = hypot;
  Decimal2.ln = ln;
  Decimal2.log = log;
  Decimal2.log10 = log10;
  Decimal2.log2 = log2;
  Decimal2.max = max;
  Decimal2.min = min;
  Decimal2.mod = mod;
  Decimal2.mul = mul;
  Decimal2.pow = pow;
  Decimal2.random = random;
  Decimal2.round = round;
  Decimal2.sign = sign;
  Decimal2.sin = sin;
  Decimal2.sinh = sinh;
  Decimal2.sqrt = sqrt;
  Decimal2.sub = sub;
  Decimal2.tan = tan;
  Decimal2.tanh = tanh;
  Decimal2.trunc = trunc;
  if (obj === void 0)
    obj = {};
  if (obj) {
    if (obj.defaults !== true) {
      ps = ["precision", "rounding", "toExpNeg", "toExpPos", "maxE", "minE", "modulo", "crypto"];
      for (i = 0; i < ps.length; )
        if (!obj.hasOwnProperty(p = ps[i++]))
          obj[p] = this[p];
    }
  }
  Decimal2.config(obj);
  return Decimal2;
}
function div(x, y) {
  return new this(x).div(y);
}
function exp(x) {
  return new this(x).exp();
}
function floor(x) {
  return finalise(x = new this(x), x.e + 1, 3);
}
function hypot() {
  var i, n, t = new this(0);
  external = false;
  for (i = 0; i < arguments.length; ) {
    n = new this(arguments[i++]);
    if (!n.d) {
      if (n.s) {
        external = true;
        return new this(1 / 0);
      }
      t = n;
    } else if (t.d) {
      t = t.plus(n.times(n));
    }
  }
  external = true;
  return t.sqrt();
}
function isDecimalInstance(obj) {
  return obj instanceof Decimal || obj && obj.name === "[object Decimal]" || false;
}
function ln(x) {
  return new this(x).ln();
}
function log(x, y) {
  return new this(x).log(y);
}
function log2(x) {
  return new this(x).log(2);
}
function log10(x) {
  return new this(x).log(10);
}
function max() {
  return maxOrMin(this, arguments, "lt");
}
function min() {
  return maxOrMin(this, arguments, "gt");
}
function mod(x, y) {
  return new this(x).mod(y);
}
function mul(x, y) {
  return new this(x).mul(y);
}
function pow(x, y) {
  return new this(x).pow(y);
}
function random(sd) {
  var d, e, k, n, i = 0, r = new this(1), rd = [];
  if (sd === void 0)
    sd = this.precision;
  else
    checkInt32(sd, 1, MAX_DIGITS);
  k = Math.ceil(sd / LOG_BASE);
  if (!this.crypto) {
    for (; i < k; )
      rd[i++] = Math.random() * 1e7 | 0;
  } else if (crypto.getRandomValues) {
    d = crypto.getRandomValues(new Uint32Array(k));
    for (; i < k; ) {
      n = d[i];
      if (n >= 429e7) {
        d[i] = crypto.getRandomValues(new Uint32Array(1))[0];
      } else {
        rd[i++] = n % 1e7;
      }
    }
  } else if (crypto.randomBytes) {
    d = crypto.randomBytes(k *= 4);
    for (; i < k; ) {
      n = d[i] + (d[i + 1] << 8) + (d[i + 2] << 16) + ((d[i + 3] & 127) << 24);
      if (n >= 214e7) {
        crypto.randomBytes(4).copy(d, i);
      } else {
        rd.push(n % 1e7);
        i += 4;
      }
    }
    i = k / 4;
  } else {
    throw Error(cryptoUnavailable);
  }
  k = rd[--i];
  sd %= LOG_BASE;
  if (k && sd) {
    n = mathpow(10, LOG_BASE - sd);
    rd[i] = (k / n | 0) * n;
  }
  for (; rd[i] === 0; i--)
    rd.pop();
  if (i < 0) {
    e = 0;
    rd = [0];
  } else {
    e = -1;
    for (; rd[0] === 0; e -= LOG_BASE)
      rd.shift();
    for (k = 1, n = rd[0]; n >= 10; n /= 10)
      k++;
    if (k < LOG_BASE)
      e -= LOG_BASE - k;
  }
  r.e = e;
  r.d = rd;
  return r;
}
function round(x) {
  return finalise(x = new this(x), x.e + 1, this.rounding);
}
function sign(x) {
  x = new this(x);
  return x.d ? x.d[0] ? x.s : 0 * x.s : x.s || NaN;
}
function sin(x) {
  return new this(x).sin();
}
function sinh(x) {
  return new this(x).sinh();
}
function sqrt(x) {
  return new this(x).sqrt();
}
function sub(x, y) {
  return new this(x).sub(y);
}
function tan(x) {
  return new this(x).tan();
}
function tanh(x) {
  return new this(x).tanh();
}
function trunc(x) {
  return finalise(x = new this(x), x.e + 1, 1);
}
P[Symbol.for("nodejs.util.inspect.custom")] = P.toString;
P[Symbol.toStringTag] = "Decimal";
var Decimal = clone(DEFAULTS);
LN10 = new Decimal(LN10);
PI = new Decimal(PI);
var name$1b = "BigNumber";
var dependencies$1b = ["?on", "config"];
var createBigNumberClass = /* @__PURE__ */ factory(name$1b, dependencies$1b, (_ref) => {
  var {
    on,
    config: config2
  } = _ref;
  var EUCLID = 9;
  var BigNumber = Decimal.clone({
    precision: config2.precision,
    modulo: EUCLID
  });
  BigNumber.prototype.type = "BigNumber";
  BigNumber.prototype.isBigNumber = true;
  BigNumber.prototype.toJSON = function() {
    return {
      mathjs: "BigNumber",
      value: this.toString()
    };
  };
  BigNumber.fromJSON = function(json) {
    return new BigNumber(json.value);
  };
  if (on) {
    on("config", function(curr, prev) {
      if (curr.precision !== prev.precision) {
        BigNumber.config({
          precision: curr.precision
        });
      }
    });
  }
  return BigNumber;
}, {
  isClass: true
});
var complex = { exports: {} };
/**
 * @license Complex.js v2.0.13 12/05/2020
 *
 * Copyright (c) 2020, Robert Eisele (robert@xarg.org)
 * Dual licensed under the MIT or GPL Version 2 licenses.
 **/
(function(module, exports) {
  (function(root) {
    var cosh2 = function(x) {
      return (Math.exp(x) + Math.exp(-x)) * 0.5;
    };
    var sinh2 = function(x) {
      return (Math.exp(x) - Math.exp(-x)) * 0.5;
    };
    var cosm1 = function(x) {
      var limit = Math.PI / 4;
      if (x < -limit || x > limit) {
        return Math.cos(x) - 1;
      }
      var xx = x * x;
      return xx * (-0.5 + xx * (1 / 24 + xx * (-1 / 720 + xx * (1 / 40320 + xx * (-1 / 3628800 + xx * (1 / 4790014600 + xx * (-1 / 87178291200 + xx * (1 / 20922789888e3))))))));
    };
    var hypot2 = function(x, y) {
      var a2 = Math.abs(x);
      var b2 = Math.abs(y);
      if (a2 < 3e3 && b2 < 3e3) {
        return Math.sqrt(a2 * a2 + b2 * b2);
      }
      if (a2 < b2) {
        a2 = b2;
        b2 = x / y;
      } else {
        b2 = y / x;
      }
      return a2 * Math.sqrt(1 + b2 * b2);
    };
    var parser_exit = function() {
      throw SyntaxError("Invalid Param");
    };
    function logHypot(a2, b2) {
      var _a2 = Math.abs(a2);
      var _b2 = Math.abs(b2);
      if (a2 === 0) {
        return Math.log(_b2);
      }
      if (b2 === 0) {
        return Math.log(_a2);
      }
      if (_a2 < 3e3 && _b2 < 3e3) {
        return Math.log(a2 * a2 + b2 * b2) * 0.5;
      }
      return Math.log(a2 / Math.cos(Math.atan2(b2, a2)));
    }
    var parse = function(a2, b2) {
      var z = { "re": 0, "im": 0 };
      if (a2 === void 0 || a2 === null) {
        z["re"] = z["im"] = 0;
      } else if (b2 !== void 0) {
        z["re"] = a2;
        z["im"] = b2;
      } else
        switch (typeof a2) {
          case "object":
            if ("im" in a2 && "re" in a2) {
              z["re"] = a2["re"];
              z["im"] = a2["im"];
            } else if ("abs" in a2 && "arg" in a2) {
              if (!Number.isFinite(a2["abs"]) && Number.isFinite(a2["arg"])) {
                return Complex2["INFINITY"];
              }
              z["re"] = a2["abs"] * Math.cos(a2["arg"]);
              z["im"] = a2["abs"] * Math.sin(a2["arg"]);
            } else if ("r" in a2 && "phi" in a2) {
              if (!Number.isFinite(a2["r"]) && Number.isFinite(a2["phi"])) {
                return Complex2["INFINITY"];
              }
              z["re"] = a2["r"] * Math.cos(a2["phi"]);
              z["im"] = a2["r"] * Math.sin(a2["phi"]);
            } else if (a2.length === 2) {
              z["re"] = a2[0];
              z["im"] = a2[1];
            } else {
              parser_exit();
            }
            break;
          case "string":
            z["im"] = z["re"] = 0;
            var tokens = a2.match(/\d+\.?\d*e[+-]?\d+|\d+\.?\d*|\.\d+|./g);
            var plus = 1;
            var minus = 0;
            if (tokens === null) {
              parser_exit();
            }
            for (var i = 0; i < tokens.length; i++) {
              var c2 = tokens[i];
              if (c2 === " " || c2 === "	" || c2 === "\n")
                ;
              else if (c2 === "+") {
                plus++;
              } else if (c2 === "-") {
                minus++;
              } else if (c2 === "i" || c2 === "I") {
                if (plus + minus === 0) {
                  parser_exit();
                }
                if (tokens[i + 1] !== " " && !isNaN(tokens[i + 1])) {
                  z["im"] += parseFloat((minus % 2 ? "-" : "") + tokens[i + 1]);
                  i++;
                } else {
                  z["im"] += parseFloat((minus % 2 ? "-" : "") + "1");
                }
                plus = minus = 0;
              } else {
                if (plus + minus === 0 || isNaN(c2)) {
                  parser_exit();
                }
                if (tokens[i + 1] === "i" || tokens[i + 1] === "I") {
                  z["im"] += parseFloat((minus % 2 ? "-" : "") + c2);
                  i++;
                } else {
                  z["re"] += parseFloat((minus % 2 ? "-" : "") + c2);
                }
                plus = minus = 0;
              }
            }
            if (plus + minus > 0) {
              parser_exit();
            }
            break;
          case "number":
            z["im"] = 0;
            z["re"] = a2;
            break;
          default:
            parser_exit();
        }
      if (isNaN(z["re"]) || isNaN(z["im"]))
        ;
      return z;
    };
    function Complex2(a2, b2) {
      if (!(this instanceof Complex2)) {
        return new Complex2(a2, b2);
      }
      var z = parse(a2, b2);
      this["re"] = z["re"];
      this["im"] = z["im"];
    }
    Complex2.prototype = {
      "re": 0,
      "im": 0,
      "sign": function() {
        var abs2 = this["abs"]();
        return new Complex2(this["re"] / abs2, this["im"] / abs2);
      },
      "add": function(a2, b2) {
        var z = new Complex2(a2, b2);
        if (this["isInfinite"]() && z["isInfinite"]()) {
          return Complex2["NAN"];
        }
        if (this["isInfinite"]() || z["isInfinite"]()) {
          return Complex2["INFINITY"];
        }
        return new Complex2(this["re"] + z["re"], this["im"] + z["im"]);
      },
      "sub": function(a2, b2) {
        var z = new Complex2(a2, b2);
        if (this["isInfinite"]() && z["isInfinite"]()) {
          return Complex2["NAN"];
        }
        if (this["isInfinite"]() || z["isInfinite"]()) {
          return Complex2["INFINITY"];
        }
        return new Complex2(this["re"] - z["re"], this["im"] - z["im"]);
      },
      "mul": function(a2, b2) {
        var z = new Complex2(a2, b2);
        if (this["isInfinite"]() && z["isZero"]() || this["isZero"]() && z["isInfinite"]()) {
          return Complex2["NAN"];
        }
        if (this["isInfinite"]() || z["isInfinite"]()) {
          return Complex2["INFINITY"];
        }
        if (z["im"] === 0 && this["im"] === 0) {
          return new Complex2(this["re"] * z["re"], 0);
        }
        return new Complex2(this["re"] * z["re"] - this["im"] * z["im"], this["re"] * z["im"] + this["im"] * z["re"]);
      },
      "div": function(a2, b2) {
        var z = new Complex2(a2, b2);
        if (this["isZero"]() && z["isZero"]() || this["isInfinite"]() && z["isInfinite"]()) {
          return Complex2["NAN"];
        }
        if (this["isInfinite"]() || z["isZero"]()) {
          return Complex2["INFINITY"];
        }
        if (this["isZero"]() || z["isInfinite"]()) {
          return Complex2["ZERO"];
        }
        a2 = this["re"];
        b2 = this["im"];
        var c2 = z["re"];
        var d = z["im"];
        var t, x;
        if (d === 0) {
          return new Complex2(a2 / c2, b2 / c2);
        }
        if (Math.abs(c2) < Math.abs(d)) {
          x = c2 / d;
          t = c2 * x + d;
          return new Complex2((a2 * x + b2) / t, (b2 * x - a2) / t);
        } else {
          x = d / c2;
          t = d * x + c2;
          return new Complex2((a2 + b2 * x) / t, (b2 - a2 * x) / t);
        }
      },
      "pow": function(a2, b2) {
        var z = new Complex2(a2, b2);
        a2 = this["re"];
        b2 = this["im"];
        if (z["isZero"]()) {
          return Complex2["ONE"];
        }
        if (z["im"] === 0) {
          if (b2 === 0 && a2 > 0) {
            return new Complex2(Math.pow(a2, z["re"]), 0);
          } else if (a2 === 0) {
            switch ((z["re"] % 4 + 4) % 4) {
              case 0:
                return new Complex2(Math.pow(b2, z["re"]), 0);
              case 1:
                return new Complex2(0, Math.pow(b2, z["re"]));
              case 2:
                return new Complex2(-Math.pow(b2, z["re"]), 0);
              case 3:
                return new Complex2(0, -Math.pow(b2, z["re"]));
            }
          }
        }
        if (a2 === 0 && b2 === 0 && z["re"] > 0 && z["im"] >= 0) {
          return Complex2["ZERO"];
        }
        var arg = Math.atan2(b2, a2);
        var loh = logHypot(a2, b2);
        a2 = Math.exp(z["re"] * loh - z["im"] * arg);
        b2 = z["im"] * loh + z["re"] * arg;
        return new Complex2(a2 * Math.cos(b2), a2 * Math.sin(b2));
      },
      "sqrt": function() {
        var a2 = this["re"];
        var b2 = this["im"];
        var r = this["abs"]();
        var re, im;
        if (a2 >= 0) {
          if (b2 === 0) {
            return new Complex2(Math.sqrt(a2), 0);
          }
          re = 0.5 * Math.sqrt(2 * (r + a2));
        } else {
          re = Math.abs(b2) / Math.sqrt(2 * (r - a2));
        }
        if (a2 <= 0) {
          im = 0.5 * Math.sqrt(2 * (r - a2));
        } else {
          im = Math.abs(b2) / Math.sqrt(2 * (r + a2));
        }
        return new Complex2(re, b2 < 0 ? -im : im);
      },
      "exp": function() {
        var tmp = Math.exp(this["re"]);
        if (this["im"] === 0)
          ;
        return new Complex2(tmp * Math.cos(this["im"]), tmp * Math.sin(this["im"]));
      },
      "expm1": function() {
        var a2 = this["re"];
        var b2 = this["im"];
        return new Complex2(Math.expm1(a2) * Math.cos(b2) + cosm1(b2), Math.exp(a2) * Math.sin(b2));
      },
      "log": function() {
        var a2 = this["re"];
        var b2 = this["im"];
        return new Complex2(logHypot(a2, b2), Math.atan2(b2, a2));
      },
      "abs": function() {
        return hypot2(this["re"], this["im"]);
      },
      "arg": function() {
        return Math.atan2(this["im"], this["re"]);
      },
      "sin": function() {
        var a2 = this["re"];
        var b2 = this["im"];
        return new Complex2(Math.sin(a2) * cosh2(b2), Math.cos(a2) * sinh2(b2));
      },
      "cos": function() {
        var a2 = this["re"];
        var b2 = this["im"];
        return new Complex2(Math.cos(a2) * cosh2(b2), -Math.sin(a2) * sinh2(b2));
      },
      "tan": function() {
        var a2 = 2 * this["re"];
        var b2 = 2 * this["im"];
        var d = Math.cos(a2) + cosh2(b2);
        return new Complex2(Math.sin(a2) / d, sinh2(b2) / d);
      },
      "cot": function() {
        var a2 = 2 * this["re"];
        var b2 = 2 * this["im"];
        var d = Math.cos(a2) - cosh2(b2);
        return new Complex2(-Math.sin(a2) / d, sinh2(b2) / d);
      },
      "sec": function() {
        var a2 = this["re"];
        var b2 = this["im"];
        var d = 0.5 * cosh2(2 * b2) + 0.5 * Math.cos(2 * a2);
        return new Complex2(Math.cos(a2) * cosh2(b2) / d, Math.sin(a2) * sinh2(b2) / d);
      },
      "csc": function() {
        var a2 = this["re"];
        var b2 = this["im"];
        var d = 0.5 * cosh2(2 * b2) - 0.5 * Math.cos(2 * a2);
        return new Complex2(Math.sin(a2) * cosh2(b2) / d, -Math.cos(a2) * sinh2(b2) / d);
      },
      "asin": function() {
        var a2 = this["re"];
        var b2 = this["im"];
        var t1 = new Complex2(b2 * b2 - a2 * a2 + 1, -2 * a2 * b2)["sqrt"]();
        var t2 = new Complex2(t1["re"] - b2, t1["im"] + a2)["log"]();
        return new Complex2(t2["im"], -t2["re"]);
      },
      "acos": function() {
        var a2 = this["re"];
        var b2 = this["im"];
        var t1 = new Complex2(b2 * b2 - a2 * a2 + 1, -2 * a2 * b2)["sqrt"]();
        var t2 = new Complex2(t1["re"] - b2, t1["im"] + a2)["log"]();
        return new Complex2(Math.PI / 2 - t2["im"], t2["re"]);
      },
      "atan": function() {
        var a2 = this["re"];
        var b2 = this["im"];
        if (a2 === 0) {
          if (b2 === 1) {
            return new Complex2(0, Infinity);
          }
          if (b2 === -1) {
            return new Complex2(0, -Infinity);
          }
        }
        var d = a2 * a2 + (1 - b2) * (1 - b2);
        var t1 = new Complex2((1 - b2 * b2 - a2 * a2) / d, -2 * a2 / d).log();
        return new Complex2(-0.5 * t1["im"], 0.5 * t1["re"]);
      },
      "acot": function() {
        var a2 = this["re"];
        var b2 = this["im"];
        if (b2 === 0) {
          return new Complex2(Math.atan2(1, a2), 0);
        }
        var d = a2 * a2 + b2 * b2;
        return d !== 0 ? new Complex2(a2 / d, -b2 / d).atan() : new Complex2(a2 !== 0 ? a2 / 0 : 0, b2 !== 0 ? -b2 / 0 : 0).atan();
      },
      "asec": function() {
        var a2 = this["re"];
        var b2 = this["im"];
        if (a2 === 0 && b2 === 0) {
          return new Complex2(0, Infinity);
        }
        var d = a2 * a2 + b2 * b2;
        return d !== 0 ? new Complex2(a2 / d, -b2 / d).acos() : new Complex2(a2 !== 0 ? a2 / 0 : 0, b2 !== 0 ? -b2 / 0 : 0).acos();
      },
      "acsc": function() {
        var a2 = this["re"];
        var b2 = this["im"];
        if (a2 === 0 && b2 === 0) {
          return new Complex2(Math.PI / 2, Infinity);
        }
        var d = a2 * a2 + b2 * b2;
        return d !== 0 ? new Complex2(a2 / d, -b2 / d).asin() : new Complex2(a2 !== 0 ? a2 / 0 : 0, b2 !== 0 ? -b2 / 0 : 0).asin();
      },
      "sinh": function() {
        var a2 = this["re"];
        var b2 = this["im"];
        return new Complex2(sinh2(a2) * Math.cos(b2), cosh2(a2) * Math.sin(b2));
      },
      "cosh": function() {
        var a2 = this["re"];
        var b2 = this["im"];
        return new Complex2(cosh2(a2) * Math.cos(b2), sinh2(a2) * Math.sin(b2));
      },
      "tanh": function() {
        var a2 = 2 * this["re"];
        var b2 = 2 * this["im"];
        var d = cosh2(a2) + Math.cos(b2);
        return new Complex2(sinh2(a2) / d, Math.sin(b2) / d);
      },
      "coth": function() {
        var a2 = 2 * this["re"];
        var b2 = 2 * this["im"];
        var d = cosh2(a2) - Math.cos(b2);
        return new Complex2(sinh2(a2) / d, -Math.sin(b2) / d);
      },
      "csch": function() {
        var a2 = this["re"];
        var b2 = this["im"];
        var d = Math.cos(2 * b2) - cosh2(2 * a2);
        return new Complex2(-2 * sinh2(a2) * Math.cos(b2) / d, 2 * cosh2(a2) * Math.sin(b2) / d);
      },
      "sech": function() {
        var a2 = this["re"];
        var b2 = this["im"];
        var d = Math.cos(2 * b2) + cosh2(2 * a2);
        return new Complex2(2 * cosh2(a2) * Math.cos(b2) / d, -2 * sinh2(a2) * Math.sin(b2) / d);
      },
      "asinh": function() {
        var tmp = this["im"];
        this["im"] = -this["re"];
        this["re"] = tmp;
        var res = this["asin"]();
        this["re"] = -this["im"];
        this["im"] = tmp;
        tmp = res["re"];
        res["re"] = -res["im"];
        res["im"] = tmp;
        return res;
      },
      "acosh": function() {
        var res = this["acos"]();
        if (res["im"] <= 0) {
          var tmp = res["re"];
          res["re"] = -res["im"];
          res["im"] = tmp;
        } else {
          var tmp = res["im"];
          res["im"] = -res["re"];
          res["re"] = tmp;
        }
        return res;
      },
      "atanh": function() {
        var a2 = this["re"];
        var b2 = this["im"];
        var noIM = a2 > 1 && b2 === 0;
        var oneMinus = 1 - a2;
        var onePlus = 1 + a2;
        var d = oneMinus * oneMinus + b2 * b2;
        var x = d !== 0 ? new Complex2((onePlus * oneMinus - b2 * b2) / d, (b2 * oneMinus + onePlus * b2) / d) : new Complex2(a2 !== -1 ? a2 / 0 : 0, b2 !== 0 ? b2 / 0 : 0);
        var temp = x["re"];
        x["re"] = logHypot(x["re"], x["im"]) / 2;
        x["im"] = Math.atan2(x["im"], temp) / 2;
        if (noIM) {
          x["im"] = -x["im"];
        }
        return x;
      },
      "acoth": function() {
        var a2 = this["re"];
        var b2 = this["im"];
        if (a2 === 0 && b2 === 0) {
          return new Complex2(0, Math.PI / 2);
        }
        var d = a2 * a2 + b2 * b2;
        return d !== 0 ? new Complex2(a2 / d, -b2 / d).atanh() : new Complex2(a2 !== 0 ? a2 / 0 : 0, b2 !== 0 ? -b2 / 0 : 0).atanh();
      },
      "acsch": function() {
        var a2 = this["re"];
        var b2 = this["im"];
        if (b2 === 0) {
          return new Complex2(a2 !== 0 ? Math.log(a2 + Math.sqrt(a2 * a2 + 1)) : Infinity, 0);
        }
        var d = a2 * a2 + b2 * b2;
        return d !== 0 ? new Complex2(a2 / d, -b2 / d).asinh() : new Complex2(a2 !== 0 ? a2 / 0 : 0, b2 !== 0 ? -b2 / 0 : 0).asinh();
      },
      "asech": function() {
        var a2 = this["re"];
        var b2 = this["im"];
        if (this["isZero"]()) {
          return Complex2["INFINITY"];
        }
        var d = a2 * a2 + b2 * b2;
        return d !== 0 ? new Complex2(a2 / d, -b2 / d).acosh() : new Complex2(a2 !== 0 ? a2 / 0 : 0, b2 !== 0 ? -b2 / 0 : 0).acosh();
      },
      "inverse": function() {
        if (this["isZero"]()) {
          return Complex2["INFINITY"];
        }
        if (this["isInfinite"]()) {
          return Complex2["ZERO"];
        }
        var a2 = this["re"];
        var b2 = this["im"];
        var d = a2 * a2 + b2 * b2;
        return new Complex2(a2 / d, -b2 / d);
      },
      "conjugate": function() {
        return new Complex2(this["re"], -this["im"]);
      },
      "neg": function() {
        return new Complex2(-this["re"], -this["im"]);
      },
      "ceil": function(places) {
        places = Math.pow(10, places || 0);
        return new Complex2(Math.ceil(this["re"] * places) / places, Math.ceil(this["im"] * places) / places);
      },
      "floor": function(places) {
        places = Math.pow(10, places || 0);
        return new Complex2(Math.floor(this["re"] * places) / places, Math.floor(this["im"] * places) / places);
      },
      "round": function(places) {
        places = Math.pow(10, places || 0);
        return new Complex2(Math.round(this["re"] * places) / places, Math.round(this["im"] * places) / places);
      },
      "equals": function(a2, b2) {
        var z = new Complex2(a2, b2);
        return Math.abs(z["re"] - this["re"]) <= Complex2["EPSILON"] && Math.abs(z["im"] - this["im"]) <= Complex2["EPSILON"];
      },
      "clone": function() {
        return new Complex2(this["re"], this["im"]);
      },
      "toString": function() {
        var a2 = this["re"];
        var b2 = this["im"];
        var ret = "";
        if (this["isNaN"]()) {
          return "NaN";
        }
        if (this["isInfinite"]()) {
          return "Infinity";
        }
        if (Math.abs(a2) < Complex2["EPSILON"]) {
          a2 = 0;
        }
        if (Math.abs(b2) < Complex2["EPSILON"]) {
          b2 = 0;
        }
        if (b2 === 0) {
          return ret + a2;
        }
        if (a2 !== 0) {
          ret += a2;
          ret += " ";
          if (b2 < 0) {
            b2 = -b2;
            ret += "-";
          } else {
            ret += "+";
          }
          ret += " ";
        } else if (b2 < 0) {
          b2 = -b2;
          ret += "-";
        }
        if (b2 !== 1) {
          ret += b2;
        }
        return ret + "i";
      },
      "toVector": function() {
        return [this["re"], this["im"]];
      },
      "valueOf": function() {
        if (this["im"] === 0) {
          return this["re"];
        }
        return null;
      },
      "isNaN": function() {
        return isNaN(this["re"]) || isNaN(this["im"]);
      },
      "isZero": function() {
        return this["im"] === 0 && this["re"] === 0;
      },
      "isFinite": function() {
        return isFinite(this["re"]) && isFinite(this["im"]);
      },
      "isInfinite": function() {
        return !(this["isNaN"]() || this["isFinite"]());
      }
    };
    Complex2["ZERO"] = new Complex2(0, 0);
    Complex2["ONE"] = new Complex2(1, 0);
    Complex2["I"] = new Complex2(0, 1);
    Complex2["PI"] = new Complex2(Math.PI, 0);
    Complex2["E"] = new Complex2(Math.E, 0);
    Complex2["INFINITY"] = new Complex2(Infinity, Infinity);
    Complex2["NAN"] = new Complex2(NaN, NaN);
    Complex2["EPSILON"] = 1e-15;
    {
      Object.defineProperty(Complex2, "__esModule", { "value": true });
      Complex2["default"] = Complex2;
      Complex2["Complex"] = Complex2;
      module["exports"] = Complex2;
    }
  })();
})(complex);
var Complex = /* @__PURE__ */ getDefaultExportFromCjs(complex.exports);
var name$1a = "Complex";
var dependencies$1a = [];
var createComplexClass = /* @__PURE__ */ factory(name$1a, dependencies$1a, () => {
  Complex.prototype.type = "Complex";
  Complex.prototype.isComplex = true;
  Complex.prototype.toJSON = function() {
    return {
      mathjs: "Complex",
      re: this.re,
      im: this.im
    };
  };
  Complex.prototype.toPolar = function() {
    return {
      r: this.abs(),
      phi: this.arg()
    };
  };
  Complex.prototype.format = function(options) {
    var str = "";
    var im = this.im;
    var re = this.re;
    var strRe = format$2(this.re, options);
    var strIm = format$2(this.im, options);
    var precision = isNumber(options) ? options : options ? options.precision : null;
    if (precision !== null) {
      var epsilon = Math.pow(10, -precision);
      if (Math.abs(re / im) < epsilon) {
        re = 0;
      }
      if (Math.abs(im / re) < epsilon) {
        im = 0;
      }
    }
    if (im === 0) {
      str = strRe;
    } else if (re === 0) {
      if (im === 1) {
        str = "i";
      } else if (im === -1) {
        str = "-i";
      } else {
        str = strIm + "i";
      }
    } else {
      if (im < 0) {
        if (im === -1) {
          str = strRe + " - i";
        } else {
          str = strRe + " - " + strIm.substring(1) + "i";
        }
      } else {
        if (im === 1) {
          str = strRe + " + i";
        } else {
          str = strRe + " + " + strIm + "i";
        }
      }
    }
    return str;
  };
  Complex.fromPolar = function(args) {
    switch (arguments.length) {
      case 1: {
        var arg = arguments[0];
        if (typeof arg === "object") {
          return Complex(arg);
        } else {
          throw new TypeError("Input has to be an object with r and phi keys.");
        }
      }
      case 2: {
        var r = arguments[0];
        var phi = arguments[1];
        if (isNumber(r)) {
          if (isUnit(phi) && phi.hasBase("ANGLE")) {
            phi = phi.toNumber("rad");
          }
          if (isNumber(phi)) {
            return new Complex({
              r,
              phi
            });
          }
          throw new TypeError("Phi is not a number nor an angle unit.");
        } else {
          throw new TypeError("Radius r is not a number.");
        }
      }
      default:
        throw new SyntaxError("Wrong number of arguments in function fromPolar");
    }
  };
  Complex.prototype.valueOf = Complex.prototype.toString;
  Complex.fromJSON = function(json) {
    return new Complex(json);
  };
  Complex.compare = function(a2, b2) {
    if (a2.re > b2.re) {
      return 1;
    }
    if (a2.re < b2.re) {
      return -1;
    }
    if (a2.im > b2.im) {
      return 1;
    }
    if (a2.im < b2.im) {
      return -1;
    }
    return 0;
  };
  return Complex;
}, {
  isClass: true
});
var fraction = { exports: {} };
/**
 * @license Fraction.js v4.1.1 23/05/2021
 * https://www.xarg.org/2014/03/rational-numbers-in-javascript/
 *
 * Copyright (c) 2021, Robert Eisele (robert@xarg.org)
 * Dual licensed under the MIT or GPL Version 2 licenses.
 **/
(function(module, exports) {
  (function(root) {
    var MAX_CYCLE_LEN = 2e3;
    var P2 = {
      "s": 1,
      "n": 0,
      "d": 1
    };
    function createError(name2) {
      function errorConstructor() {
        var temp = Error.apply(this, arguments);
        temp["name"] = this["name"] = name2;
        this["stack"] = temp["stack"];
        this["message"] = temp["message"];
      }
      function IntermediateInheritor() {
      }
      IntermediateInheritor.prototype = Error.prototype;
      errorConstructor.prototype = new IntermediateInheritor();
      return errorConstructor;
    }
    var DivisionByZero = Fraction2["DivisionByZero"] = createError("DivisionByZero");
    var InvalidParameter = Fraction2["InvalidParameter"] = createError("InvalidParameter");
    function assign(n, s) {
      if (isNaN(n = parseInt(n, 10))) {
        throwInvalidParam();
      }
      return n * s;
    }
    function throwInvalidParam() {
      throw new InvalidParameter();
    }
    function factorize(num) {
      var factors = {};
      var n = num;
      var i = 2;
      var s = 4;
      while (s <= n) {
        while (n % i === 0) {
          n /= i;
          factors[i] = (factors[i] || 0) + 1;
        }
        s += 1 + 2 * i++;
      }
      if (n !== num) {
        if (n > 1)
          factors[n] = (factors[n] || 0) + 1;
      } else {
        factors[num] = (factors[num] || 0) + 1;
      }
      return factors;
    }
    var parse = function(p1, p2) {
      var n = 0, d = 1, s = 1;
      var v = 0, w = 0, x = 0, y = 1, z = 1;
      var A = 0, B = 1;
      var C = 1, D = 1;
      var N = 1e7;
      var M;
      if (p1 === void 0 || p1 === null)
        ;
      else if (p2 !== void 0) {
        n = p1;
        d = p2;
        s = n * d;
      } else
        switch (typeof p1) {
          case "object": {
            if ("d" in p1 && "n" in p1) {
              n = p1["n"];
              d = p1["d"];
              if ("s" in p1)
                n *= p1["s"];
            } else if (0 in p1) {
              n = p1[0];
              if (1 in p1)
                d = p1[1];
            } else {
              throwInvalidParam();
            }
            s = n * d;
            break;
          }
          case "number": {
            if (p1 < 0) {
              s = p1;
              p1 = -p1;
            }
            if (p1 % 1 === 0) {
              n = p1;
            } else if (p1 > 0) {
              if (p1 >= 1) {
                z = Math.pow(10, Math.floor(1 + Math.log(p1) / Math.LN10));
                p1 /= z;
              }
              while (B <= N && D <= N) {
                M = (A + C) / (B + D);
                if (p1 === M) {
                  if (B + D <= N) {
                    n = A + C;
                    d = B + D;
                  } else if (D > B) {
                    n = C;
                    d = D;
                  } else {
                    n = A;
                    d = B;
                  }
                  break;
                } else {
                  if (p1 > M) {
                    A += C;
                    B += D;
                  } else {
                    C += A;
                    D += B;
                  }
                  if (B > N) {
                    n = C;
                    d = D;
                  } else {
                    n = A;
                    d = B;
                  }
                }
              }
              n *= z;
            } else if (isNaN(p1) || isNaN(p2)) {
              d = n = NaN;
            }
            break;
          }
          case "string": {
            B = p1.match(/\d+|./g);
            if (B === null)
              throwInvalidParam();
            if (B[A] === "-") {
              s = -1;
              A++;
            } else if (B[A] === "+") {
              A++;
            }
            if (B.length === A + 1) {
              w = assign(B[A++], s);
            } else if (B[A + 1] === "." || B[A] === ".") {
              if (B[A] !== ".") {
                v = assign(B[A++], s);
              }
              A++;
              if (A + 1 === B.length || B[A + 1] === "(" && B[A + 3] === ")" || B[A + 1] === "'" && B[A + 3] === "'") {
                w = assign(B[A], s);
                y = Math.pow(10, B[A].length);
                A++;
              }
              if (B[A] === "(" && B[A + 2] === ")" || B[A] === "'" && B[A + 2] === "'") {
                x = assign(B[A + 1], s);
                z = Math.pow(10, B[A + 1].length) - 1;
                A += 3;
              }
            } else if (B[A + 1] === "/" || B[A + 1] === ":") {
              w = assign(B[A], s);
              y = assign(B[A + 2], 1);
              A += 3;
            } else if (B[A + 3] === "/" && B[A + 1] === " ") {
              v = assign(B[A], s);
              w = assign(B[A + 2], s);
              y = assign(B[A + 4], 1);
              A += 5;
            }
            if (B.length <= A) {
              d = y * z;
              s = n = x + d * v + z * w;
              break;
            }
          }
          default:
            throwInvalidParam();
        }
      if (d === 0) {
        throw new DivisionByZero();
      }
      P2["s"] = s < 0 ? -1 : 1;
      P2["n"] = Math.abs(n);
      P2["d"] = Math.abs(d);
    };
    function modpow(b2, e, m) {
      var r = 1;
      for (; e > 0; b2 = b2 * b2 % m, e >>= 1) {
        if (e & 1) {
          r = r * b2 % m;
        }
      }
      return r;
    }
    function cycleLen(n, d) {
      for (; d % 2 === 0; d /= 2) {
      }
      for (; d % 5 === 0; d /= 5) {
      }
      if (d === 1)
        return 0;
      var rem = 10 % d;
      var t = 1;
      for (; rem !== 1; t++) {
        rem = rem * 10 % d;
        if (t > MAX_CYCLE_LEN)
          return 0;
      }
      return t;
    }
    function cycleStart(n, d, len) {
      var rem1 = 1;
      var rem2 = modpow(10, len, d);
      for (var t = 0; t < 300; t++) {
        if (rem1 === rem2)
          return t;
        rem1 = rem1 * 10 % d;
        rem2 = rem2 * 10 % d;
      }
      return 0;
    }
    function gcd(a2, b2) {
      if (!a2)
        return b2;
      if (!b2)
        return a2;
      while (1) {
        a2 %= b2;
        if (!a2)
          return b2;
        b2 %= a2;
        if (!b2)
          return a2;
      }
    }
    function Fraction2(a2, b2) {
      if (!(this instanceof Fraction2)) {
        return new Fraction2(a2, b2);
      }
      parse(a2, b2);
      if (Fraction2["REDUCE"]) {
        a2 = gcd(P2["d"], P2["n"]);
      } else {
        a2 = 1;
      }
      this["s"] = P2["s"];
      this["n"] = P2["n"] / a2;
      this["d"] = P2["d"] / a2;
    }
    Fraction2["REDUCE"] = 1;
    Fraction2.prototype = {
      "s": 1,
      "n": 0,
      "d": 1,
      "abs": function() {
        return new Fraction2(this["n"], this["d"]);
      },
      "neg": function() {
        return new Fraction2(-this["s"] * this["n"], this["d"]);
      },
      "add": function(a2, b2) {
        parse(a2, b2);
        return new Fraction2(this["s"] * this["n"] * P2["d"] + P2["s"] * this["d"] * P2["n"], this["d"] * P2["d"]);
      },
      "sub": function(a2, b2) {
        parse(a2, b2);
        return new Fraction2(this["s"] * this["n"] * P2["d"] - P2["s"] * this["d"] * P2["n"], this["d"] * P2["d"]);
      },
      "mul": function(a2, b2) {
        parse(a2, b2);
        return new Fraction2(this["s"] * P2["s"] * this["n"] * P2["n"], this["d"] * P2["d"]);
      },
      "div": function(a2, b2) {
        parse(a2, b2);
        return new Fraction2(this["s"] * P2["s"] * this["n"] * P2["d"], this["d"] * P2["n"]);
      },
      "clone": function() {
        return new Fraction2(this);
      },
      "mod": function(a2, b2) {
        if (isNaN(this["n"]) || isNaN(this["d"])) {
          return new Fraction2(NaN);
        }
        if (a2 === void 0) {
          return new Fraction2(this["s"] * this["n"] % this["d"], 1);
        }
        parse(a2, b2);
        if (P2["n"] === 0 && this["d"] === 0) {
          Fraction2(0, 0);
        }
        return new Fraction2(this["s"] * (P2["d"] * this["n"]) % (P2["n"] * this["d"]), P2["d"] * this["d"]);
      },
      "gcd": function(a2, b2) {
        parse(a2, b2);
        return new Fraction2(gcd(P2["n"], this["n"]) * gcd(P2["d"], this["d"]), P2["d"] * this["d"]);
      },
      "lcm": function(a2, b2) {
        parse(a2, b2);
        if (P2["n"] === 0 && this["n"] === 0) {
          return new Fraction2();
        }
        return new Fraction2(P2["n"] * this["n"], gcd(P2["n"], this["n"]) * gcd(P2["d"], this["d"]));
      },
      "ceil": function(places) {
        places = Math.pow(10, places || 0);
        if (isNaN(this["n"]) || isNaN(this["d"])) {
          return new Fraction2(NaN);
        }
        return new Fraction2(Math.ceil(places * this["s"] * this["n"] / this["d"]), places);
      },
      "floor": function(places) {
        places = Math.pow(10, places || 0);
        if (isNaN(this["n"]) || isNaN(this["d"])) {
          return new Fraction2(NaN);
        }
        return new Fraction2(Math.floor(places * this["s"] * this["n"] / this["d"]), places);
      },
      "round": function(places) {
        places = Math.pow(10, places || 0);
        if (isNaN(this["n"]) || isNaN(this["d"])) {
          return new Fraction2(NaN);
        }
        return new Fraction2(Math.round(places * this["s"] * this["n"] / this["d"]), places);
      },
      "inverse": function() {
        return new Fraction2(this["s"] * this["d"], this["n"]);
      },
      "pow": function(a2, b2) {
        parse(a2, b2);
        if (P2["d"] === 1) {
          if (P2["s"] < 0) {
            return new Fraction2(Math.pow(this["s"] * this["d"], P2["n"]), Math.pow(this["n"], P2["n"]));
          } else {
            return new Fraction2(Math.pow(this["s"] * this["n"], P2["n"]), Math.pow(this["d"], P2["n"]));
          }
        }
        if (this["s"] < 0)
          return null;
        var N = factorize(this["n"]);
        var D = factorize(this["d"]);
        var n = 1;
        var d = 1;
        for (var k in N) {
          if (k === "1")
            continue;
          if (k === "0") {
            n = 0;
            break;
          }
          N[k] *= P2["n"];
          if (N[k] % P2["d"] === 0) {
            N[k] /= P2["d"];
          } else
            return null;
          n *= Math.pow(k, N[k]);
        }
        for (var k in D) {
          if (k === "1")
            continue;
          D[k] *= P2["n"];
          if (D[k] % P2["d"] === 0) {
            D[k] /= P2["d"];
          } else
            return null;
          d *= Math.pow(k, D[k]);
        }
        if (P2["s"] < 0) {
          return new Fraction2(d, n);
        }
        return new Fraction2(n, d);
      },
      "equals": function(a2, b2) {
        parse(a2, b2);
        return this["s"] * this["n"] * P2["d"] === P2["s"] * P2["n"] * this["d"];
      },
      "compare": function(a2, b2) {
        parse(a2, b2);
        var t = this["s"] * this["n"] * P2["d"] - P2["s"] * P2["n"] * this["d"];
        return (0 < t) - (t < 0);
      },
      "simplify": function(eps) {
        if (isNaN(this["n"]) || isNaN(this["d"])) {
          return this;
        }
        var cont = this["abs"]()["toContinued"]();
        eps = eps || 1e-3;
        function rec(a2) {
          if (a2.length === 1)
            return new Fraction2(a2[0]);
          return rec(a2.slice(1))["inverse"]()["add"](a2[0]);
        }
        for (var i = 0; i < cont.length; i++) {
          var tmp = rec(cont.slice(0, i + 1));
          if (tmp["sub"](this["abs"]())["abs"]().valueOf() < eps) {
            return tmp["mul"](this["s"]);
          }
        }
        return this;
      },
      "divisible": function(a2, b2) {
        parse(a2, b2);
        return !(!(P2["n"] * this["d"]) || this["n"] * P2["d"] % (P2["n"] * this["d"]));
      },
      "valueOf": function() {
        return this["s"] * this["n"] / this["d"];
      },
      "toFraction": function(excludeWhole) {
        var whole, str = "";
        var n = this["n"];
        var d = this["d"];
        if (this["s"] < 0) {
          str += "-";
        }
        if (d === 1) {
          str += n;
        } else {
          if (excludeWhole && (whole = Math.floor(n / d)) > 0) {
            str += whole;
            str += " ";
            n %= d;
          }
          str += n;
          str += "/";
          str += d;
        }
        return str;
      },
      "toLatex": function(excludeWhole) {
        var whole, str = "";
        var n = this["n"];
        var d = this["d"];
        if (this["s"] < 0) {
          str += "-";
        }
        if (d === 1) {
          str += n;
        } else {
          if (excludeWhole && (whole = Math.floor(n / d)) > 0) {
            str += whole;
            n %= d;
          }
          str += "\\frac{";
          str += n;
          str += "}{";
          str += d;
          str += "}";
        }
        return str;
      },
      "toContinued": function() {
        var t;
        var a2 = this["n"];
        var b2 = this["d"];
        var res = [];
        if (isNaN(a2) || isNaN(b2)) {
          return res;
        }
        do {
          res.push(Math.floor(a2 / b2));
          t = a2 % b2;
          a2 = b2;
          b2 = t;
        } while (a2 !== 1);
        return res;
      },
      "toString": function(dec) {
        var g;
        var N = this["n"];
        var D = this["d"];
        if (isNaN(N) || isNaN(D)) {
          return "NaN";
        }
        if (!Fraction2["REDUCE"]) {
          g = gcd(N, D);
          N /= g;
          D /= g;
        }
        dec = dec || 15;
        var cycLen = cycleLen(N, D);
        var cycOff = cycleStart(N, D, cycLen);
        var str = this["s"] === -1 ? "-" : "";
        str += N / D | 0;
        N %= D;
        N *= 10;
        if (N)
          str += ".";
        if (cycLen) {
          for (var i = cycOff; i--; ) {
            str += N / D | 0;
            N %= D;
            N *= 10;
          }
          str += "(";
          for (var i = cycLen; i--; ) {
            str += N / D | 0;
            N %= D;
            N *= 10;
          }
          str += ")";
        } else {
          for (var i = dec; N && i--; ) {
            str += N / D | 0;
            N %= D;
            N *= 10;
          }
        }
        return str;
      }
    };
    {
      Object.defineProperty(Fraction2, "__esModule", { "value": true });
      Fraction2["default"] = Fraction2;
      Fraction2["Fraction"] = Fraction2;
      module["exports"] = Fraction2;
    }
  })();
})(fraction);
var Fraction = /* @__PURE__ */ getDefaultExportFromCjs(fraction.exports);
var name$19 = "Fraction";
var dependencies$19 = [];
var createFractionClass = /* @__PURE__ */ factory(name$19, dependencies$19, () => {
  Fraction.prototype.type = "Fraction";
  Fraction.prototype.isFraction = true;
  Fraction.prototype.toJSON = function() {
    return {
      mathjs: "Fraction",
      n: this.s * this.n,
      d: this.d
    };
  };
  Fraction.fromJSON = function(json) {
    return new Fraction(json);
  };
  return Fraction;
}, {
  isClass: true
});
var name$18 = "Range";
var dependencies$18 = [];
var createRangeClass = /* @__PURE__ */ factory(name$18, dependencies$18, () => {
  function Range(start, end, step) {
    if (!(this instanceof Range)) {
      throw new SyntaxError("Constructor must be called with the new operator");
    }
    var hasStart = start !== null && start !== void 0;
    var hasEnd = end !== null && end !== void 0;
    var hasStep = step !== null && step !== void 0;
    if (hasStart) {
      if (isBigNumber(start)) {
        start = start.toNumber();
      } else if (typeof start !== "number") {
        throw new TypeError("Parameter start must be a number");
      }
    }
    if (hasEnd) {
      if (isBigNumber(end)) {
        end = end.toNumber();
      } else if (typeof end !== "number") {
        throw new TypeError("Parameter end must be a number");
      }
    }
    if (hasStep) {
      if (isBigNumber(step)) {
        step = step.toNumber();
      } else if (typeof step !== "number") {
        throw new TypeError("Parameter step must be a number");
      }
    }
    this.start = hasStart ? parseFloat(start) : 0;
    this.end = hasEnd ? parseFloat(end) : 0;
    this.step = hasStep ? parseFloat(step) : 1;
  }
  Range.prototype.type = "Range";
  Range.prototype.isRange = true;
  Range.parse = function(str) {
    if (typeof str !== "string") {
      return null;
    }
    var args = str.split(":");
    var nums = args.map(function(arg) {
      return parseFloat(arg);
    });
    var invalid = nums.some(function(num) {
      return isNaN(num);
    });
    if (invalid) {
      return null;
    }
    switch (nums.length) {
      case 2:
        return new Range(nums[0], nums[1]);
      case 3:
        return new Range(nums[0], nums[2], nums[1]);
      default:
        return null;
    }
  };
  Range.prototype.clone = function() {
    return new Range(this.start, this.end, this.step);
  };
  Range.prototype.size = function() {
    var len = 0;
    var start = this.start;
    var step = this.step;
    var end = this.end;
    var diff = end - start;
    if (sign$1(step) === sign$1(diff)) {
      len = Math.ceil(diff / step);
    } else if (diff === 0) {
      len = 0;
    }
    if (isNaN(len)) {
      len = 0;
    }
    return [len];
  };
  Range.prototype.min = function() {
    var size = this.size()[0];
    if (size > 0) {
      if (this.step > 0) {
        return this.start;
      } else {
        return this.start + (size - 1) * this.step;
      }
    } else {
      return void 0;
    }
  };
  Range.prototype.max = function() {
    var size = this.size()[0];
    if (size > 0) {
      if (this.step > 0) {
        return this.start + (size - 1) * this.step;
      } else {
        return this.start;
      }
    } else {
      return void 0;
    }
  };
  Range.prototype.forEach = function(callback) {
    var x = this.start;
    var step = this.step;
    var end = this.end;
    var i = 0;
    if (step > 0) {
      while (x < end) {
        callback(x, [i], this);
        x += step;
        i++;
      }
    } else if (step < 0) {
      while (x > end) {
        callback(x, [i], this);
        x += step;
        i++;
      }
    }
  };
  Range.prototype.map = function(callback) {
    var array = [];
    this.forEach(function(value, index, obj) {
      array[index[0]] = callback(value, index, obj);
    });
    return array;
  };
  Range.prototype.toArray = function() {
    var array = [];
    this.forEach(function(value, index) {
      array[index[0]] = value;
    });
    return array;
  };
  Range.prototype.valueOf = function() {
    return this.toArray();
  };
  Range.prototype.format = function(options) {
    var str = format$2(this.start, options);
    if (this.step !== 1) {
      str += ":" + format$2(this.step, options);
    }
    str += ":" + format$2(this.end, options);
    return str;
  };
  Range.prototype.toString = function() {
    return this.format();
  };
  Range.prototype.toJSON = function() {
    return {
      mathjs: "Range",
      start: this.start,
      end: this.end,
      step: this.step
    };
  };
  Range.fromJSON = function(json) {
    return new Range(json.start, json.end, json.step);
  };
  return Range;
}, {
  isClass: true
});
var name$17 = "Matrix";
var dependencies$17 = [];
var createMatrixClass = /* @__PURE__ */ factory(name$17, dependencies$17, () => {
  function Matrix() {
    if (!(this instanceof Matrix)) {
      throw new SyntaxError("Constructor must be called with the new operator");
    }
  }
  Matrix.prototype.type = "Matrix";
  Matrix.prototype.isMatrix = true;
  Matrix.prototype.storage = function() {
    throw new Error("Cannot invoke storage on a Matrix interface");
  };
  Matrix.prototype.datatype = function() {
    throw new Error("Cannot invoke datatype on a Matrix interface");
  };
  Matrix.prototype.create = function(data, datatype) {
    throw new Error("Cannot invoke create on a Matrix interface");
  };
  Matrix.prototype.subset = function(index, replacement, defaultValue) {
    throw new Error("Cannot invoke subset on a Matrix interface");
  };
  Matrix.prototype.get = function(index) {
    throw new Error("Cannot invoke get on a Matrix interface");
  };
  Matrix.prototype.set = function(index, value, defaultValue) {
    throw new Error("Cannot invoke set on a Matrix interface");
  };
  Matrix.prototype.resize = function(size, defaultValue) {
    throw new Error("Cannot invoke resize on a Matrix interface");
  };
  Matrix.prototype.reshape = function(size, defaultValue) {
    throw new Error("Cannot invoke reshape on a Matrix interface");
  };
  Matrix.prototype.clone = function() {
    throw new Error("Cannot invoke clone on a Matrix interface");
  };
  Matrix.prototype.size = function() {
    throw new Error("Cannot invoke size on a Matrix interface");
  };
  Matrix.prototype.map = function(callback, skipZeros) {
    throw new Error("Cannot invoke map on a Matrix interface");
  };
  Matrix.prototype.forEach = function(callback) {
    throw new Error("Cannot invoke forEach on a Matrix interface");
  };
  Matrix.prototype.toArray = function() {
    throw new Error("Cannot invoke toArray on a Matrix interface");
  };
  Matrix.prototype.valueOf = function() {
    throw new Error("Cannot invoke valueOf on a Matrix interface");
  };
  Matrix.prototype.format = function(options) {
    throw new Error("Cannot invoke format on a Matrix interface");
  };
  Matrix.prototype.toString = function() {
    throw new Error("Cannot invoke toString on a Matrix interface");
  };
  return Matrix;
}, {
  isClass: true
});
var name$16 = "DenseMatrix";
var dependencies$16 = ["Matrix"];
var createDenseMatrixClass = /* @__PURE__ */ factory(name$16, dependencies$16, (_ref) => {
  var {
    Matrix
  } = _ref;
  function DenseMatrix(data, datatype) {
    if (!(this instanceof DenseMatrix)) {
      throw new SyntaxError("Constructor must be called with the new operator");
    }
    if (datatype && !isString(datatype)) {
      throw new Error("Invalid datatype: " + datatype);
    }
    if (isMatrix(data)) {
      if (data.type === "DenseMatrix") {
        this._data = clone$1(data._data);
        this._size = clone$1(data._size);
        this._datatype = datatype || data._datatype;
      } else {
        this._data = data.toArray();
        this._size = data.size();
        this._datatype = datatype || data._datatype;
      }
    } else if (data && isArray(data.data) && isArray(data.size)) {
      this._data = data.data;
      this._size = data.size;
      validate(this._data, this._size);
      this._datatype = datatype || data.datatype;
    } else if (isArray(data)) {
      this._data = preprocess(data);
      this._size = arraySize(this._data);
      validate(this._data, this._size);
      this._datatype = datatype;
    } else if (data) {
      throw new TypeError("Unsupported type of data (" + typeOf(data) + ")");
    } else {
      this._data = [];
      this._size = [0];
      this._datatype = datatype;
    }
  }
  DenseMatrix.prototype = new Matrix();
  DenseMatrix.prototype.createDenseMatrix = function(data, datatype) {
    return new DenseMatrix(data, datatype);
  };
  DenseMatrix.prototype.type = "DenseMatrix";
  DenseMatrix.prototype.isDenseMatrix = true;
  DenseMatrix.prototype.getDataType = function() {
    return getArrayDataType(this._data, typeOf);
  };
  DenseMatrix.prototype.storage = function() {
    return "dense";
  };
  DenseMatrix.prototype.datatype = function() {
    return this._datatype;
  };
  DenseMatrix.prototype.create = function(data, datatype) {
    return new DenseMatrix(data, datatype);
  };
  DenseMatrix.prototype.subset = function(index, replacement, defaultValue) {
    switch (arguments.length) {
      case 1:
        return _get(this, index);
      case 2:
      case 3:
        return _set(this, index, replacement, defaultValue);
      default:
        throw new SyntaxError("Wrong number of arguments");
    }
  };
  DenseMatrix.prototype.get = function(index) {
    if (!isArray(index)) {
      throw new TypeError("Array expected");
    }
    if (index.length !== this._size.length) {
      throw new DimensionError(index.length, this._size.length);
    }
    for (var x = 0; x < index.length; x++) {
      validateIndex(index[x], this._size[x]);
    }
    var data = this._data;
    for (var i = 0, ii = index.length; i < ii; i++) {
      var indexI = index[i];
      validateIndex(indexI, data.length);
      data = data[indexI];
    }
    return data;
  };
  DenseMatrix.prototype.set = function(index, value, defaultValue) {
    if (!isArray(index)) {
      throw new TypeError("Array expected");
    }
    if (index.length < this._size.length) {
      throw new DimensionError(index.length, this._size.length, "<");
    }
    var i, ii, indexI;
    var size = index.map(function(i2) {
      return i2 + 1;
    });
    _fit(this, size, defaultValue);
    var data = this._data;
    for (i = 0, ii = index.length - 1; i < ii; i++) {
      indexI = index[i];
      validateIndex(indexI, data.length);
      data = data[indexI];
    }
    indexI = index[index.length - 1];
    validateIndex(indexI, data.length);
    data[indexI] = value;
    return this;
  };
  function _get(matrix, index) {
    if (!isIndex(index)) {
      throw new TypeError("Invalid index");
    }
    var isScalar = index.isScalar();
    if (isScalar) {
      return matrix.get(index.min());
    } else {
      var size = index.size();
      if (size.length !== matrix._size.length) {
        throw new DimensionError(size.length, matrix._size.length);
      }
      var min2 = index.min();
      var max2 = index.max();
      for (var i = 0, ii = matrix._size.length; i < ii; i++) {
        validateIndex(min2[i], matrix._size[i]);
        validateIndex(max2[i], matrix._size[i]);
      }
      return new DenseMatrix(_getSubmatrix(matrix._data, index, size.length, 0), matrix._datatype);
    }
  }
  function _getSubmatrix(data, index, dims, dim) {
    var last = dim === dims - 1;
    var range = index.dimension(dim);
    if (last) {
      return range.map(function(i) {
        validateIndex(i, data.length);
        return data[i];
      }).valueOf();
    } else {
      return range.map(function(i) {
        validateIndex(i, data.length);
        var child = data[i];
        return _getSubmatrix(child, index, dims, dim + 1);
      }).valueOf();
    }
  }
  function _set(matrix, index, submatrix, defaultValue) {
    if (!index || index.isIndex !== true) {
      throw new TypeError("Invalid index");
    }
    var iSize = index.size();
    var isScalar = index.isScalar();
    var sSize;
    if (isMatrix(submatrix)) {
      sSize = submatrix.size();
      submatrix = submatrix.valueOf();
    } else {
      sSize = arraySize(submatrix);
    }
    if (isScalar) {
      if (sSize.length !== 0) {
        throw new TypeError("Scalar expected");
      }
      matrix.set(index.min(), submatrix, defaultValue);
    } else {
      if (iSize.length < matrix._size.length) {
        throw new DimensionError(iSize.length, matrix._size.length, "<");
      }
      if (sSize.length < iSize.length) {
        var i = 0;
        var outer = 0;
        while (iSize[i] === 1 && sSize[i] === 1) {
          i++;
        }
        while (iSize[i] === 1) {
          outer++;
          i++;
        }
        submatrix = unsqueeze(submatrix, iSize.length, outer, sSize);
      }
      if (!deepStrictEqual(iSize, sSize)) {
        throw new DimensionError(iSize, sSize, ">");
      }
      var size = index.max().map(function(i2) {
        return i2 + 1;
      });
      _fit(matrix, size, defaultValue);
      var dims = iSize.length;
      var dim = 0;
      _setSubmatrix(matrix._data, index, submatrix, dims, dim);
    }
    return matrix;
  }
  function _setSubmatrix(data, index, submatrix, dims, dim) {
    var last = dim === dims - 1;
    var range = index.dimension(dim);
    if (last) {
      range.forEach(function(dataIndex, subIndex) {
        validateIndex(dataIndex);
        data[dataIndex] = submatrix[subIndex[0]];
      });
    } else {
      range.forEach(function(dataIndex, subIndex) {
        validateIndex(dataIndex);
        _setSubmatrix(data[dataIndex], index, submatrix[subIndex[0]], dims, dim + 1);
      });
    }
  }
  DenseMatrix.prototype.resize = function(size, defaultValue, copy) {
    if (!isCollection(size)) {
      throw new TypeError("Array or Matrix expected");
    }
    var sizeArray = size.valueOf().map((value) => {
      return Array.isArray(value) && value.length === 1 ? value[0] : value;
    });
    var m = copy ? this.clone() : this;
    return _resize2(m, sizeArray, defaultValue);
  };
  function _resize2(matrix, size, defaultValue) {
    if (size.length === 0) {
      var v = matrix._data;
      while (isArray(v)) {
        v = v[0];
      }
      return v;
    }
    matrix._size = size.slice(0);
    matrix._data = resize(matrix._data, matrix._size, defaultValue);
    return matrix;
  }
  DenseMatrix.prototype.reshape = function(size, copy) {
    var m = copy ? this.clone() : this;
    m._data = reshape(m._data, size);
    m._size = size.slice(0);
    return m;
  };
  function _fit(matrix, size, defaultValue) {
    var newSize = matrix._size.slice(0);
    var changed = false;
    while (newSize.length < size.length) {
      newSize.push(0);
      changed = true;
    }
    for (var i = 0, ii = size.length; i < ii; i++) {
      if (size[i] > newSize[i]) {
        newSize[i] = size[i];
        changed = true;
      }
    }
    if (changed) {
      _resize2(matrix, newSize, defaultValue);
    }
  }
  DenseMatrix.prototype.clone = function() {
    var m = new DenseMatrix({
      data: clone$1(this._data),
      size: clone$1(this._size),
      datatype: this._datatype
    });
    return m;
  };
  DenseMatrix.prototype.size = function() {
    return this._size.slice(0);
  };
  DenseMatrix.prototype.map = function(callback) {
    var me = this;
    var recurse = function recurse2(value, index) {
      if (isArray(value)) {
        return value.map(function(child, i) {
          return recurse2(child, index.concat(i));
        });
      } else {
        return callback(value, index, me);
      }
    };
    var data = recurse(this._data, []);
    var datatype = this._datatype !== void 0 ? getArrayDataType(data, typeOf) : void 0;
    return new DenseMatrix(data, datatype);
  };
  DenseMatrix.prototype.forEach = function(callback) {
    var me = this;
    var recurse = function recurse2(value, index) {
      if (isArray(value)) {
        value.forEach(function(child, i) {
          recurse2(child, index.concat(i));
        });
      } else {
        callback(value, index, me);
      }
    };
    recurse(this._data, []);
  };
  DenseMatrix.prototype.toArray = function() {
    return clone$1(this._data);
  };
  DenseMatrix.prototype.valueOf = function() {
    return this._data;
  };
  DenseMatrix.prototype.format = function(options) {
    return format(this._data, options);
  };
  DenseMatrix.prototype.toString = function() {
    return format(this._data);
  };
  DenseMatrix.prototype.toJSON = function() {
    return {
      mathjs: "DenseMatrix",
      data: this._data,
      size: this._size,
      datatype: this._datatype
    };
  };
  DenseMatrix.prototype.diagonal = function(k) {
    if (k) {
      if (isBigNumber(k)) {
        k = k.toNumber();
      }
      if (!isNumber(k) || !isInteger(k)) {
        throw new TypeError("The parameter k must be an integer number");
      }
    } else {
      k = 0;
    }
    var kSuper = k > 0 ? k : 0;
    var kSub = k < 0 ? -k : 0;
    var rows = this._size[0];
    var columns = this._size[1];
    var n = Math.min(rows - kSub, columns - kSuper);
    var data = [];
    for (var i = 0; i < n; i++) {
      data[i] = this._data[i + kSub][i + kSuper];
    }
    return new DenseMatrix({
      data,
      size: [n],
      datatype: this._datatype
    });
  };
  DenseMatrix.diagonal = function(size, value, k, defaultValue) {
    if (!isArray(size)) {
      throw new TypeError("Array expected, size parameter");
    }
    if (size.length !== 2) {
      throw new Error("Only two dimensions matrix are supported");
    }
    size = size.map(function(s) {
      if (isBigNumber(s)) {
        s = s.toNumber();
      }
      if (!isNumber(s) || !isInteger(s) || s < 1) {
        throw new Error("Size values must be positive integers");
      }
      return s;
    });
    if (k) {
      if (isBigNumber(k)) {
        k = k.toNumber();
      }
      if (!isNumber(k) || !isInteger(k)) {
        throw new TypeError("The parameter k must be an integer number");
      }
    } else {
      k = 0;
    }
    var kSuper = k > 0 ? k : 0;
    var kSub = k < 0 ? -k : 0;
    var rows = size[0];
    var columns = size[1];
    var n = Math.min(rows - kSub, columns - kSuper);
    var _value;
    if (isArray(value)) {
      if (value.length !== n) {
        throw new Error("Invalid value array length");
      }
      _value = function _value2(i) {
        return value[i];
      };
    } else if (isMatrix(value)) {
      var ms = value.size();
      if (ms.length !== 1 || ms[0] !== n) {
        throw new Error("Invalid matrix length");
      }
      _value = function _value2(i) {
        return value.get([i]);
      };
    } else {
      _value = function _value2() {
        return value;
      };
    }
    if (!defaultValue) {
      defaultValue = isBigNumber(_value(0)) ? _value(0).mul(0) : 0;
    }
    var data = [];
    if (size.length > 0) {
      data = resize(data, size, defaultValue);
      for (var d = 0; d < n; d++) {
        data[d + kSub][d + kSuper] = _value(d);
      }
    }
    return new DenseMatrix({
      data,
      size: [rows, columns]
    });
  };
  DenseMatrix.fromJSON = function(json) {
    return new DenseMatrix(json);
  };
  DenseMatrix.prototype.swapRows = function(i, j) {
    if (!isNumber(i) || !isInteger(i) || !isNumber(j) || !isInteger(j)) {
      throw new Error("Row index must be positive integers");
    }
    if (this._size.length !== 2) {
      throw new Error("Only two dimensional matrix is supported");
    }
    validateIndex(i, this._size[0]);
    validateIndex(j, this._size[0]);
    DenseMatrix._swapRows(i, j, this._data);
    return this;
  };
  DenseMatrix._swapRows = function(i, j, data) {
    var vi = data[i];
    data[i] = data[j];
    data[j] = vi;
  };
  function preprocess(data) {
    for (var i = 0, ii = data.length; i < ii; i++) {
      var elem = data[i];
      if (isArray(elem)) {
        data[i] = preprocess(elem);
      } else if (elem && elem.isMatrix === true) {
        data[i] = preprocess(elem.valueOf());
      }
    }
    return data;
  }
  return DenseMatrix;
}, {
  isClass: true
});
function deepMap(array, callback, skipZeros) {
  if (array && typeof array.map === "function") {
    return array.map(function(x) {
      return deepMap(x, callback);
    });
  } else {
    return callback(array);
  }
}
var n1 = "number";
var n2 = "number, number";
function absNumber(a2) {
  return Math.abs(a2);
}
absNumber.signature = n1;
function addNumber(a2, b2) {
  return a2 + b2;
}
addNumber.signature = n2;
function multiplyNumber(a2, b2) {
  return a2 * b2;
}
multiplyNumber.signature = n2;
function unaryMinusNumber(x) {
  return -x;
}
unaryMinusNumber.signature = n1;
function ceilNumber(x) {
  return Math.ceil(x);
}
ceilNumber.signature = n1;
function modNumber(x, y) {
  if (y > 0) {
    return x - y * Math.floor(x / y);
  } else if (y === 0) {
    return x;
  } else {
    throw new Error("Cannot calculate mod for a negative divisor");
  }
}
modNumber.signature = n2;
function powNumber(x, y) {
  if (x * x < 1 && y === Infinity || x * x > 1 && y === -Infinity) {
    return 0;
  }
  return Math.pow(x, y);
}
powNumber.signature = n2;
function roundNumber(value) {
  var decimals = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 0;
  return parseFloat(toFixed$1(value, decimals));
}
roundNumber.signature = n2;
var name$15 = "isNumeric";
var dependencies$15 = ["typed"];
var createIsNumeric = /* @__PURE__ */ factory(name$15, dependencies$15, (_ref) => {
  var {
    typed
  } = _ref;
  return typed(name$15, {
    "number | BigNumber | Fraction | boolean": function numberBigNumberFractionBoolean() {
      return true;
    },
    "Complex | Unit | string | null | undefined | Node": function ComplexUnitStringNullUndefinedNode() {
      return false;
    },
    "Array | Matrix": function ArrayMatrix(x) {
      return deepMap(x, this);
    }
  });
});
function nearlyEqual(x, y, epsilon) {
  if (epsilon === null || epsilon === void 0) {
    return x.eq(y);
  }
  if (x.eq(y)) {
    return true;
  }
  if (x.isNaN() || y.isNaN()) {
    return false;
  }
  if (x.isFinite() && y.isFinite()) {
    var diff = x.minus(y).abs();
    if (diff.isZero()) {
      return true;
    } else {
      var max2 = x.constructor.max(x.abs(), y.abs());
      return diff.lte(max2.times(epsilon));
    }
  }
  return false;
}
function complexEquals(x, y, epsilon) {
  return nearlyEqual$1(x.re, y.re, epsilon) && nearlyEqual$1(x.im, y.im, epsilon);
}
var name$14 = "equalScalar";
var dependencies$14 = ["typed", "config"];
var createEqualScalar = /* @__PURE__ */ factory(name$14, dependencies$14, (_ref) => {
  var {
    typed,
    config: config2
  } = _ref;
  return typed(name$14, {
    "boolean, boolean": function booleanBoolean(x, y) {
      return x === y;
    },
    "number, number": function numberNumber2(x, y) {
      return nearlyEqual$1(x, y, config2.epsilon);
    },
    "BigNumber, BigNumber": function BigNumberBigNumber(x, y) {
      return x.eq(y) || nearlyEqual(x, y, config2.epsilon);
    },
    "Fraction, Fraction": function FractionFraction(x, y) {
      return x.equals(y);
    },
    "Complex, Complex": function ComplexComplex(x, y) {
      return complexEquals(x, y, config2.epsilon);
    },
    "Unit, Unit": function UnitUnit(x, y) {
      if (!x.equalBase(y)) {
        throw new Error("Cannot compare units with different base");
      }
      return this(x.value, y.value);
    }
  });
});
factory(name$14, ["typed", "config"], (_ref2) => {
  var {
    typed,
    config: config2
  } = _ref2;
  return typed(name$14, {
    "number, number": function numberNumber2(x, y) {
      return nearlyEqual$1(x, y, config2.epsilon);
    }
  });
});
var name$13 = "SparseMatrix";
var dependencies$13 = ["typed", "equalScalar", "Matrix"];
var createSparseMatrixClass = /* @__PURE__ */ factory(name$13, dependencies$13, (_ref) => {
  var {
    typed,
    equalScalar,
    Matrix
  } = _ref;
  function SparseMatrix(data, datatype) {
    if (!(this instanceof SparseMatrix)) {
      throw new SyntaxError("Constructor must be called with the new operator");
    }
    if (datatype && !isString(datatype)) {
      throw new Error("Invalid datatype: " + datatype);
    }
    if (isMatrix(data)) {
      _createFromMatrix(this, data, datatype);
    } else if (data && isArray(data.index) && isArray(data.ptr) && isArray(data.size)) {
      this._values = data.values;
      this._index = data.index;
      this._ptr = data.ptr;
      this._size = data.size;
      this._datatype = datatype || data.datatype;
    } else if (isArray(data)) {
      _createFromArray(this, data, datatype);
    } else if (data) {
      throw new TypeError("Unsupported type of data (" + typeOf(data) + ")");
    } else {
      this._values = [];
      this._index = [];
      this._ptr = [0];
      this._size = [0, 0];
      this._datatype = datatype;
    }
  }
  function _createFromMatrix(matrix, source, datatype) {
    if (source.type === "SparseMatrix") {
      matrix._values = source._values ? clone$1(source._values) : void 0;
      matrix._index = clone$1(source._index);
      matrix._ptr = clone$1(source._ptr);
      matrix._size = clone$1(source._size);
      matrix._datatype = datatype || source._datatype;
    } else {
      _createFromArray(matrix, source.valueOf(), datatype || source._datatype);
    }
  }
  function _createFromArray(matrix, data, datatype) {
    matrix._values = [];
    matrix._index = [];
    matrix._ptr = [];
    matrix._datatype = datatype;
    var rows = data.length;
    var columns = 0;
    var eq = equalScalar;
    var zero = 0;
    if (isString(datatype)) {
      eq = typed.find(equalScalar, [datatype, datatype]) || equalScalar;
      zero = typed.convert(0, datatype);
    }
    if (rows > 0) {
      var j = 0;
      do {
        matrix._ptr.push(matrix._index.length);
        for (var i = 0; i < rows; i++) {
          var row = data[i];
          if (isArray(row)) {
            if (j === 0 && columns < row.length) {
              columns = row.length;
            }
            if (j < row.length) {
              var v = row[j];
              if (!eq(v, zero)) {
                matrix._values.push(v);
                matrix._index.push(i);
              }
            }
          } else {
            if (j === 0 && columns < 1) {
              columns = 1;
            }
            if (!eq(row, zero)) {
              matrix._values.push(row);
              matrix._index.push(i);
            }
          }
        }
        j++;
      } while (j < columns);
    }
    matrix._ptr.push(matrix._index.length);
    matrix._size = [rows, columns];
  }
  SparseMatrix.prototype = new Matrix();
  SparseMatrix.prototype.createSparseMatrix = function(data, datatype) {
    return new SparseMatrix(data, datatype);
  };
  SparseMatrix.prototype.type = "SparseMatrix";
  SparseMatrix.prototype.isSparseMatrix = true;
  SparseMatrix.prototype.getDataType = function() {
    return getArrayDataType(this._values, typeOf);
  };
  SparseMatrix.prototype.storage = function() {
    return "sparse";
  };
  SparseMatrix.prototype.datatype = function() {
    return this._datatype;
  };
  SparseMatrix.prototype.create = function(data, datatype) {
    return new SparseMatrix(data, datatype);
  };
  SparseMatrix.prototype.density = function() {
    var rows = this._size[0];
    var columns = this._size[1];
    return rows !== 0 && columns !== 0 ? this._index.length / (rows * columns) : 0;
  };
  SparseMatrix.prototype.subset = function(index, replacement, defaultValue) {
    if (!this._values) {
      throw new Error("Cannot invoke subset on a Pattern only matrix");
    }
    switch (arguments.length) {
      case 1:
        return _getsubset(this, index);
      case 2:
      case 3:
        return _setsubset(this, index, replacement, defaultValue);
      default:
        throw new SyntaxError("Wrong number of arguments");
    }
  };
  function _getsubset(matrix, idx) {
    if (!isIndex(idx)) {
      throw new TypeError("Invalid index");
    }
    var isScalar = idx.isScalar();
    if (isScalar) {
      return matrix.get(idx.min());
    }
    var size = idx.size();
    if (size.length !== matrix._size.length) {
      throw new DimensionError(size.length, matrix._size.length);
    }
    var i, ii, k, kk;
    var min2 = idx.min();
    var max2 = idx.max();
    for (i = 0, ii = matrix._size.length; i < ii; i++) {
      validateIndex(min2[i], matrix._size[i]);
      validateIndex(max2[i], matrix._size[i]);
    }
    var mvalues = matrix._values;
    var mindex = matrix._index;
    var mptr = matrix._ptr;
    var rows = idx.dimension(0);
    var columns = idx.dimension(1);
    var w = [];
    var pv = [];
    rows.forEach(function(i2, r) {
      pv[i2] = r[0];
      w[i2] = true;
    });
    var values2 = mvalues ? [] : void 0;
    var index = [];
    var ptr = [];
    columns.forEach(function(j) {
      ptr.push(index.length);
      for (k = mptr[j], kk = mptr[j + 1]; k < kk; k++) {
        i = mindex[k];
        if (w[i] === true) {
          index.push(pv[i]);
          if (values2) {
            values2.push(mvalues[k]);
          }
        }
      }
    });
    ptr.push(index.length);
    return new SparseMatrix({
      values: values2,
      index,
      ptr,
      size,
      datatype: matrix._datatype
    });
  }
  function _setsubset(matrix, index, submatrix, defaultValue) {
    if (!index || index.isIndex !== true) {
      throw new TypeError("Invalid index");
    }
    var iSize = index.size();
    var isScalar = index.isScalar();
    var sSize;
    if (isMatrix(submatrix)) {
      sSize = submatrix.size();
      submatrix = submatrix.toArray();
    } else {
      sSize = arraySize(submatrix);
    }
    if (isScalar) {
      if (sSize.length !== 0) {
        throw new TypeError("Scalar expected");
      }
      matrix.set(index.min(), submatrix, defaultValue);
    } else {
      if (iSize.length !== 1 && iSize.length !== 2) {
        throw new DimensionError(iSize.length, matrix._size.length, "<");
      }
      if (sSize.length < iSize.length) {
        var i = 0;
        var outer = 0;
        while (iSize[i] === 1 && sSize[i] === 1) {
          i++;
        }
        while (iSize[i] === 1) {
          outer++;
          i++;
        }
        submatrix = unsqueeze(submatrix, iSize.length, outer, sSize);
      }
      if (!deepStrictEqual(iSize, sSize)) {
        throw new DimensionError(iSize, sSize, ">");
      }
      var x0 = index.min()[0];
      var y0 = index.min()[1];
      var m = sSize[0];
      var n = sSize[1];
      for (var x = 0; x < m; x++) {
        for (var y = 0; y < n; y++) {
          var v = submatrix[x][y];
          matrix.set([x + x0, y + y0], v, defaultValue);
        }
      }
    }
    return matrix;
  }
  SparseMatrix.prototype.get = function(index) {
    if (!isArray(index)) {
      throw new TypeError("Array expected");
    }
    if (index.length !== this._size.length) {
      throw new DimensionError(index.length, this._size.length);
    }
    if (!this._values) {
      throw new Error("Cannot invoke get on a Pattern only matrix");
    }
    var i = index[0];
    var j = index[1];
    validateIndex(i, this._size[0]);
    validateIndex(j, this._size[1]);
    var k = _getValueIndex(i, this._ptr[j], this._ptr[j + 1], this._index);
    if (k < this._ptr[j + 1] && this._index[k] === i) {
      return this._values[k];
    }
    return 0;
  };
  SparseMatrix.prototype.set = function(index, v, defaultValue) {
    if (!isArray(index)) {
      throw new TypeError("Array expected");
    }
    if (index.length !== this._size.length) {
      throw new DimensionError(index.length, this._size.length);
    }
    if (!this._values) {
      throw new Error("Cannot invoke set on a Pattern only matrix");
    }
    var i = index[0];
    var j = index[1];
    var rows = this._size[0];
    var columns = this._size[1];
    var eq = equalScalar;
    var zero = 0;
    if (isString(this._datatype)) {
      eq = typed.find(equalScalar, [this._datatype, this._datatype]) || equalScalar;
      zero = typed.convert(0, this._datatype);
    }
    if (i > rows - 1 || j > columns - 1) {
      _resize2(this, Math.max(i + 1, rows), Math.max(j + 1, columns), defaultValue);
      rows = this._size[0];
      columns = this._size[1];
    }
    validateIndex(i, rows);
    validateIndex(j, columns);
    var k = _getValueIndex(i, this._ptr[j], this._ptr[j + 1], this._index);
    if (k < this._ptr[j + 1] && this._index[k] === i) {
      if (!eq(v, zero)) {
        this._values[k] = v;
      } else {
        _remove(k, j, this._values, this._index, this._ptr);
      }
    } else {
      _insert(k, i, j, v, this._values, this._index, this._ptr);
    }
    return this;
  };
  function _getValueIndex(i, top, bottom, index) {
    if (bottom - top === 0) {
      return bottom;
    }
    for (var r = top; r < bottom; r++) {
      if (index[r] === i) {
        return r;
      }
    }
    return top;
  }
  function _remove(k, j, values2, index, ptr) {
    values2.splice(k, 1);
    index.splice(k, 1);
    for (var x = j + 1; x < ptr.length; x++) {
      ptr[x]--;
    }
  }
  function _insert(k, i, j, v, values2, index, ptr) {
    values2.splice(k, 0, v);
    index.splice(k, 0, i);
    for (var x = j + 1; x < ptr.length; x++) {
      ptr[x]++;
    }
  }
  SparseMatrix.prototype.resize = function(size, defaultValue, copy) {
    if (!isCollection(size)) {
      throw new TypeError("Array or Matrix expected");
    }
    var sizeArray = size.valueOf().map((value) => {
      return Array.isArray(value) && value.length === 1 ? value[0] : value;
    });
    if (sizeArray.length !== 2) {
      throw new Error("Only two dimensions matrix are supported");
    }
    sizeArray.forEach(function(value) {
      if (!isNumber(value) || !isInteger(value) || value < 0) {
        throw new TypeError("Invalid size, must contain positive integers (size: " + format(sizeArray) + ")");
      }
    });
    var m = copy ? this.clone() : this;
    return _resize2(m, sizeArray[0], sizeArray[1], defaultValue);
  };
  function _resize2(matrix, rows, columns, defaultValue) {
    var value = defaultValue || 0;
    var eq = equalScalar;
    var zero = 0;
    if (isString(matrix._datatype)) {
      eq = typed.find(equalScalar, [matrix._datatype, matrix._datatype]) || equalScalar;
      zero = typed.convert(0, matrix._datatype);
      value = typed.convert(value, matrix._datatype);
    }
    var ins = !eq(value, zero);
    var r = matrix._size[0];
    var c2 = matrix._size[1];
    var i, j, k;
    if (columns > c2) {
      for (j = c2; j < columns; j++) {
        matrix._ptr[j] = matrix._values.length;
        if (ins) {
          for (i = 0; i < r; i++) {
            matrix._values.push(value);
            matrix._index.push(i);
          }
        }
      }
      matrix._ptr[columns] = matrix._values.length;
    } else if (columns < c2) {
      matrix._ptr.splice(columns + 1, c2 - columns);
      matrix._values.splice(matrix._ptr[columns], matrix._values.length);
      matrix._index.splice(matrix._ptr[columns], matrix._index.length);
    }
    c2 = columns;
    if (rows > r) {
      if (ins) {
        var n = 0;
        for (j = 0; j < c2; j++) {
          matrix._ptr[j] = matrix._ptr[j] + n;
          k = matrix._ptr[j + 1] + n;
          var p = 0;
          for (i = r; i < rows; i++, p++) {
            matrix._values.splice(k + p, 0, value);
            matrix._index.splice(k + p, 0, i);
            n++;
          }
        }
        matrix._ptr[c2] = matrix._values.length;
      }
    } else if (rows < r) {
      var d = 0;
      for (j = 0; j < c2; j++) {
        matrix._ptr[j] = matrix._ptr[j] - d;
        var k0 = matrix._ptr[j];
        var k1 = matrix._ptr[j + 1] - d;
        for (k = k0; k < k1; k++) {
          i = matrix._index[k];
          if (i > rows - 1) {
            matrix._values.splice(k, 1);
            matrix._index.splice(k, 1);
            d++;
          }
        }
      }
      matrix._ptr[j] = matrix._values.length;
    }
    matrix._size[0] = rows;
    matrix._size[1] = columns;
    return matrix;
  }
  SparseMatrix.prototype.reshape = function(size, copy) {
    if (!isArray(size)) {
      throw new TypeError("Array expected");
    }
    if (size.length !== 2) {
      throw new Error("Sparse matrices can only be reshaped in two dimensions");
    }
    size.forEach(function(value) {
      if (!isNumber(value) || !isInteger(value) || value < 0) {
        throw new TypeError("Invalid size, must contain positive integers (size: " + format(size) + ")");
      }
    });
    if (this._size[0] * this._size[1] !== size[0] * size[1]) {
      throw new Error("Reshaping sparse matrix will result in the wrong number of elements");
    }
    var m = copy ? this.clone() : this;
    if (this._size[0] === size[0] && this._size[1] === size[1]) {
      return m;
    }
    var colIndex = [];
    for (var i = 0; i < m._ptr.length; i++) {
      for (var j = 0; j < m._ptr[i + 1] - m._ptr[i]; j++) {
        colIndex.push(i);
      }
    }
    var values2 = m._values.slice();
    var rowIndex = m._index.slice();
    for (var _i = 0; _i < m._index.length; _i++) {
      var r1 = rowIndex[_i];
      var c1 = colIndex[_i];
      var flat = r1 * m._size[1] + c1;
      colIndex[_i] = flat % size[1];
      rowIndex[_i] = Math.floor(flat / size[1]);
    }
    m._values.length = 0;
    m._index.length = 0;
    m._ptr.length = size[1] + 1;
    m._size = size.slice();
    for (var _i2 = 0; _i2 < m._ptr.length; _i2++) {
      m._ptr[_i2] = 0;
    }
    for (var h = 0; h < values2.length; h++) {
      var _i3 = rowIndex[h];
      var _j = colIndex[h];
      var v = values2[h];
      var k = _getValueIndex(_i3, m._ptr[_j], m._ptr[_j + 1], m._index);
      _insert(k, _i3, _j, v, m._values, m._index, m._ptr);
    }
    return m;
  };
  SparseMatrix.prototype.clone = function() {
    var m = new SparseMatrix({
      values: this._values ? clone$1(this._values) : void 0,
      index: clone$1(this._index),
      ptr: clone$1(this._ptr),
      size: clone$1(this._size),
      datatype: this._datatype
    });
    return m;
  };
  SparseMatrix.prototype.size = function() {
    return this._size.slice(0);
  };
  SparseMatrix.prototype.map = function(callback, skipZeros) {
    if (!this._values) {
      throw new Error("Cannot invoke map on a Pattern only matrix");
    }
    var me = this;
    var rows = this._size[0];
    var columns = this._size[1];
    var invoke = function invoke2(v, i, j) {
      return callback(v, [i, j], me);
    };
    return _map(this, 0, rows - 1, 0, columns - 1, invoke, skipZeros);
  };
  function _map(matrix, minRow, maxRow, minColumn, maxColumn, callback, skipZeros) {
    var values2 = [];
    var index = [];
    var ptr = [];
    var eq = equalScalar;
    var zero = 0;
    if (isString(matrix._datatype)) {
      eq = typed.find(equalScalar, [matrix._datatype, matrix._datatype]) || equalScalar;
      zero = typed.convert(0, matrix._datatype);
    }
    var invoke = function invoke2(v, x, y) {
      v = callback(v, x, y);
      if (!eq(v, zero)) {
        values2.push(v);
        index.push(x);
      }
    };
    for (var j = minColumn; j <= maxColumn; j++) {
      ptr.push(values2.length);
      var k0 = matrix._ptr[j];
      var k1 = matrix._ptr[j + 1];
      if (skipZeros) {
        for (var k = k0; k < k1; k++) {
          var i = matrix._index[k];
          if (i >= minRow && i <= maxRow) {
            invoke(matrix._values[k], i - minRow, j - minColumn);
          }
        }
      } else {
        var _values = {};
        for (var _k = k0; _k < k1; _k++) {
          var _i4 = matrix._index[_k];
          _values[_i4] = matrix._values[_k];
        }
        for (var _i5 = minRow; _i5 <= maxRow; _i5++) {
          var value = _i5 in _values ? _values[_i5] : 0;
          invoke(value, _i5 - minRow, j - minColumn);
        }
      }
    }
    ptr.push(values2.length);
    return new SparseMatrix({
      values: values2,
      index,
      ptr,
      size: [maxRow - minRow + 1, maxColumn - minColumn + 1]
    });
  }
  SparseMatrix.prototype.forEach = function(callback, skipZeros) {
    if (!this._values) {
      throw new Error("Cannot invoke forEach on a Pattern only matrix");
    }
    var me = this;
    var rows = this._size[0];
    var columns = this._size[1];
    for (var j = 0; j < columns; j++) {
      var k0 = this._ptr[j];
      var k1 = this._ptr[j + 1];
      if (skipZeros) {
        for (var k = k0; k < k1; k++) {
          var i = this._index[k];
          callback(this._values[k], [i, j], me);
        }
      } else {
        var values2 = {};
        for (var _k2 = k0; _k2 < k1; _k2++) {
          var _i6 = this._index[_k2];
          values2[_i6] = this._values[_k2];
        }
        for (var _i7 = 0; _i7 < rows; _i7++) {
          var value = _i7 in values2 ? values2[_i7] : 0;
          callback(value, [_i7, j], me);
        }
      }
    }
  };
  SparseMatrix.prototype.toArray = function() {
    return _toArray(this._values, this._index, this._ptr, this._size, true);
  };
  SparseMatrix.prototype.valueOf = function() {
    return _toArray(this._values, this._index, this._ptr, this._size, false);
  };
  function _toArray(values2, index, ptr, size, copy) {
    var rows = size[0];
    var columns = size[1];
    var a2 = [];
    var i, j;
    for (i = 0; i < rows; i++) {
      a2[i] = [];
      for (j = 0; j < columns; j++) {
        a2[i][j] = 0;
      }
    }
    for (j = 0; j < columns; j++) {
      var k0 = ptr[j];
      var k1 = ptr[j + 1];
      for (var k = k0; k < k1; k++) {
        i = index[k];
        a2[i][j] = values2 ? copy ? clone$1(values2[k]) : values2[k] : 1;
      }
    }
    return a2;
  }
  SparseMatrix.prototype.format = function(options) {
    var rows = this._size[0];
    var columns = this._size[1];
    var density = this.density();
    var str = "Sparse Matrix [" + format(rows, options) + " x " + format(columns, options) + "] density: " + format(density, options) + "\n";
    for (var j = 0; j < columns; j++) {
      var k0 = this._ptr[j];
      var k1 = this._ptr[j + 1];
      for (var k = k0; k < k1; k++) {
        var i = this._index[k];
        str += "\n    (" + format(i, options) + ", " + format(j, options) + ") ==> " + (this._values ? format(this._values[k], options) : "X");
      }
    }
    return str;
  };
  SparseMatrix.prototype.toString = function() {
    return format(this.toArray());
  };
  SparseMatrix.prototype.toJSON = function() {
    return {
      mathjs: "SparseMatrix",
      values: this._values,
      index: this._index,
      ptr: this._ptr,
      size: this._size,
      datatype: this._datatype
    };
  };
  SparseMatrix.prototype.diagonal = function(k) {
    if (k) {
      if (isBigNumber(k)) {
        k = k.toNumber();
      }
      if (!isNumber(k) || !isInteger(k)) {
        throw new TypeError("The parameter k must be an integer number");
      }
    } else {
      k = 0;
    }
    var kSuper = k > 0 ? k : 0;
    var kSub = k < 0 ? -k : 0;
    var rows = this._size[0];
    var columns = this._size[1];
    var n = Math.min(rows - kSub, columns - kSuper);
    var values2 = [];
    var index = [];
    var ptr = [];
    ptr[0] = 0;
    for (var j = kSuper; j < columns && values2.length < n; j++) {
      var k0 = this._ptr[j];
      var k1 = this._ptr[j + 1];
      for (var x = k0; x < k1; x++) {
        var i = this._index[x];
        if (i === j - kSuper + kSub) {
          values2.push(this._values[x]);
          index[values2.length - 1] = i - kSub;
          break;
        }
      }
    }
    ptr.push(values2.length);
    return new SparseMatrix({
      values: values2,
      index,
      ptr,
      size: [n, 1]
    });
  };
  SparseMatrix.fromJSON = function(json) {
    return new SparseMatrix(json);
  };
  SparseMatrix.diagonal = function(size, value, k, defaultValue, datatype) {
    if (!isArray(size)) {
      throw new TypeError("Array expected, size parameter");
    }
    if (size.length !== 2) {
      throw new Error("Only two dimensions matrix are supported");
    }
    size = size.map(function(s) {
      if (isBigNumber(s)) {
        s = s.toNumber();
      }
      if (!isNumber(s) || !isInteger(s) || s < 1) {
        throw new Error("Size values must be positive integers");
      }
      return s;
    });
    if (k) {
      if (isBigNumber(k)) {
        k = k.toNumber();
      }
      if (!isNumber(k) || !isInteger(k)) {
        throw new TypeError("The parameter k must be an integer number");
      }
    } else {
      k = 0;
    }
    var eq = equalScalar;
    var zero = 0;
    if (isString(datatype)) {
      eq = typed.find(equalScalar, [datatype, datatype]) || equalScalar;
      zero = typed.convert(0, datatype);
    }
    var kSuper = k > 0 ? k : 0;
    var kSub = k < 0 ? -k : 0;
    var rows = size[0];
    var columns = size[1];
    var n = Math.min(rows - kSub, columns - kSuper);
    var _value;
    if (isArray(value)) {
      if (value.length !== n) {
        throw new Error("Invalid value array length");
      }
      _value = function _value2(i2) {
        return value[i2];
      };
    } else if (isMatrix(value)) {
      var ms = value.size();
      if (ms.length !== 1 || ms[0] !== n) {
        throw new Error("Invalid matrix length");
      }
      _value = function _value2(i2) {
        return value.get([i2]);
      };
    } else {
      _value = function _value2() {
        return value;
      };
    }
    var values2 = [];
    var index = [];
    var ptr = [];
    for (var j = 0; j < columns; j++) {
      ptr.push(values2.length);
      var i = j - kSuper;
      if (i >= 0 && i < n) {
        var v = _value(i);
        if (!eq(v, zero)) {
          index.push(i + kSub);
          values2.push(v);
        }
      }
    }
    ptr.push(values2.length);
    return new SparseMatrix({
      values: values2,
      index,
      ptr,
      size: [rows, columns]
    });
  };
  SparseMatrix.prototype.swapRows = function(i, j) {
    if (!isNumber(i) || !isInteger(i) || !isNumber(j) || !isInteger(j)) {
      throw new Error("Row index must be positive integers");
    }
    if (this._size.length !== 2) {
      throw new Error("Only two dimensional matrix is supported");
    }
    validateIndex(i, this._size[0]);
    validateIndex(j, this._size[0]);
    SparseMatrix._swapRows(i, j, this._size[1], this._values, this._index, this._ptr);
    return this;
  };
  SparseMatrix._forEachRow = function(j, values2, index, ptr, callback) {
    var k0 = ptr[j];
    var k1 = ptr[j + 1];
    for (var k = k0; k < k1; k++) {
      callback(index[k], values2[k]);
    }
  };
  SparseMatrix._swapRows = function(x, y, columns, values2, index, ptr) {
    for (var j = 0; j < columns; j++) {
      var k0 = ptr[j];
      var k1 = ptr[j + 1];
      var kx = _getValueIndex(x, k0, k1, index);
      var ky = _getValueIndex(y, k0, k1, index);
      if (kx < k1 && ky < k1 && index[kx] === x && index[ky] === y) {
        if (values2) {
          var v = values2[kx];
          values2[kx] = values2[ky];
          values2[ky] = v;
        }
        continue;
      }
      if (kx < k1 && index[kx] === x && (ky >= k1 || index[ky] !== y)) {
        var vx = values2 ? values2[kx] : void 0;
        index.splice(ky, 0, y);
        if (values2) {
          values2.splice(ky, 0, vx);
        }
        index.splice(ky <= kx ? kx + 1 : kx, 1);
        if (values2) {
          values2.splice(ky <= kx ? kx + 1 : kx, 1);
        }
        continue;
      }
      if (ky < k1 && index[ky] === y && (kx >= k1 || index[kx] !== x)) {
        var vy = values2 ? values2[ky] : void 0;
        index.splice(kx, 0, x);
        if (values2) {
          values2.splice(kx, 0, vy);
        }
        index.splice(kx <= ky ? ky + 1 : ky, 1);
        if (values2) {
          values2.splice(kx <= ky ? ky + 1 : ky, 1);
        }
      }
    }
  };
  return SparseMatrix;
}, {
  isClass: true
});
var name$12 = "number";
var dependencies$12 = ["typed"];
var createNumber = /* @__PURE__ */ factory(name$12, dependencies$12, (_ref) => {
  var {
    typed
  } = _ref;
  var number = typed("number", {
    "": function _() {
      return 0;
    },
    number: function number2(x) {
      return x;
    },
    string: function string(x) {
      if (x === "NaN")
        return NaN;
      var num = Number(x);
      if (isNaN(num)) {
        throw new SyntaxError('String "' + x + '" is no valid number');
      }
      if (["0b", "0o", "0x"].includes(x.substring(0, 2))) {
        if (num > 2 ** 32 - 1) {
          throw new SyntaxError('String "'.concat(x, '" is out of range'));
        }
        if (num & 2147483648) {
          num = -1 * ~(num - 1);
        }
      }
      return num;
    },
    BigNumber: function BigNumber(x) {
      return x.toNumber();
    },
    Fraction: function Fraction2(x) {
      return x.valueOf();
    },
    Unit: function Unit(x) {
      throw new Error("Second argument with valueless unit expected");
    },
    null: function _null(x) {
      return 0;
    },
    "Unit, string | Unit": function UnitStringUnit(unit, valuelessUnit) {
      return unit.toNumber(valuelessUnit);
    },
    "Array | Matrix": function ArrayMatrix(x) {
      return deepMap(x, this);
    }
  });
  number.fromJSON = function(json) {
    return parseFloat(json.value);
  };
  return number;
});
var name$11 = "bignumber";
var dependencies$11 = ["typed", "BigNumber"];
var createBignumber = /* @__PURE__ */ factory(name$11, dependencies$11, (_ref) => {
  var {
    typed,
    BigNumber
  } = _ref;
  return typed("bignumber", {
    "": function _() {
      return new BigNumber(0);
    },
    number: function number(x) {
      return new BigNumber(x + "");
    },
    string: function string(x) {
      return new BigNumber(x);
    },
    BigNumber: function BigNumber2(x) {
      return x;
    },
    Fraction: function Fraction2(x) {
      return new BigNumber(x.n).div(x.d).times(x.s);
    },
    null: function _null(x) {
      return new BigNumber(0);
    },
    "Array | Matrix": function ArrayMatrix(x) {
      return deepMap(x, this);
    }
  });
});
var name$10 = "fraction";
var dependencies$10 = ["typed", "Fraction"];
var createFraction = /* @__PURE__ */ factory(name$10, dependencies$10, (_ref) => {
  var {
    typed,
    Fraction: Fraction2
  } = _ref;
  return typed("fraction", {
    number: function number(x) {
      if (!isFinite(x) || isNaN(x)) {
        throw new Error(x + " cannot be represented as a fraction");
      }
      return new Fraction2(x);
    },
    string: function string(x) {
      return new Fraction2(x);
    },
    "number, number": function numberNumber2(numerator, denominator) {
      return new Fraction2(numerator, denominator);
    },
    null: function _null(x) {
      return new Fraction2(0);
    },
    BigNumber: function BigNumber(x) {
      return new Fraction2(x.toString());
    },
    Fraction: function Fraction3(x) {
      return x;
    },
    Object: function Object2(x) {
      return new Fraction2(x);
    },
    "Array | Matrix": function ArrayMatrix(x) {
      return deepMap(x, this);
    }
  });
});
var name$$ = "matrix";
var dependencies$$ = ["typed", "Matrix", "DenseMatrix", "SparseMatrix"];
var createMatrix = /* @__PURE__ */ factory(name$$, dependencies$$, (_ref) => {
  var {
    typed,
    Matrix,
    DenseMatrix,
    SparseMatrix
  } = _ref;
  return typed(name$$, {
    "": function _() {
      return _create([]);
    },
    string: function string(format2) {
      return _create([], format2);
    },
    "string, string": function stringString(format2, datatype) {
      return _create([], format2, datatype);
    },
    Array: function Array2(data) {
      return _create(data);
    },
    Matrix: function Matrix2(data) {
      return _create(data, data.storage());
    },
    "Array | Matrix, string": _create,
    "Array | Matrix, string, string": _create
  });
  function _create(data, format2, datatype) {
    if (format2 === "dense" || format2 === "default" || format2 === void 0) {
      return new DenseMatrix(data, datatype);
    }
    if (format2 === "sparse") {
      return new SparseMatrix(data, datatype);
    }
    throw new TypeError("Unknown matrix type " + JSON.stringify(format2) + ".");
  }
});
var name$_ = "unaryMinus";
var dependencies$_ = ["typed"];
var createUnaryMinus = /* @__PURE__ */ factory(name$_, dependencies$_, (_ref) => {
  var {
    typed
  } = _ref;
  return typed(name$_, {
    number: unaryMinusNumber,
    Complex: function Complex2(x) {
      return x.neg();
    },
    BigNumber: function BigNumber(x) {
      return x.neg();
    },
    Fraction: function Fraction2(x) {
      return x.neg();
    },
    Unit: function Unit(x) {
      var res = x.clone();
      res.value = this(x.value);
      return res;
    },
    "Array | Matrix": function ArrayMatrix(x) {
      return deepMap(x, this);
    }
  });
});
var name$Z = "abs";
var dependencies$Z = ["typed"];
var createAbs = /* @__PURE__ */ factory(name$Z, dependencies$Z, (_ref) => {
  var {
    typed
  } = _ref;
  return typed(name$Z, {
    number: absNumber,
    Complex: function Complex2(x) {
      return x.abs();
    },
    BigNumber: function BigNumber(x) {
      return x.abs();
    },
    Fraction: function Fraction2(x) {
      return x.abs();
    },
    "Array | Matrix": function ArrayMatrix(x) {
      return deepMap(x, this);
    },
    Unit: function Unit(x) {
      return x.abs();
    }
  });
});
var name$Y = "addScalar";
var dependencies$Y = ["typed"];
var createAddScalar = /* @__PURE__ */ factory(name$Y, dependencies$Y, (_ref) => {
  var {
    typed
  } = _ref;
  return typed(name$Y, {
    "number, number": addNumber,
    "Complex, Complex": function ComplexComplex(x, y) {
      return x.add(y);
    },
    "BigNumber, BigNumber": function BigNumberBigNumber(x, y) {
      return x.plus(y);
    },
    "Fraction, Fraction": function FractionFraction(x, y) {
      return x.add(y);
    },
    "Unit, Unit": function UnitUnit(x, y) {
      if (x.value === null || x.value === void 0)
        throw new Error("Parameter x contains a unit with undefined value");
      if (y.value === null || y.value === void 0)
        throw new Error("Parameter y contains a unit with undefined value");
      if (!x.equalBase(y))
        throw new Error("Units do not match");
      var res = x.clone();
      res.value = this(res.value, y.value);
      res.fixPrefix = false;
      return res;
    }
  });
});
var name$X = "algorithm11";
var dependencies$X = ["typed", "equalScalar"];
var createAlgorithm11 = /* @__PURE__ */ factory(name$X, dependencies$X, (_ref) => {
  var {
    typed,
    equalScalar
  } = _ref;
  return function algorithm11(s, b2, callback, inverse) {
    var avalues = s._values;
    var aindex = s._index;
    var aptr = s._ptr;
    var asize = s._size;
    var adt = s._datatype;
    if (!avalues) {
      throw new Error("Cannot perform operation on Pattern Sparse Matrix and Scalar value");
    }
    var rows = asize[0];
    var columns = asize[1];
    var dt;
    var eq = equalScalar;
    var zero = 0;
    var cf = callback;
    if (typeof adt === "string") {
      dt = adt;
      eq = typed.find(equalScalar, [dt, dt]);
      zero = typed.convert(0, dt);
      b2 = typed.convert(b2, dt);
      cf = typed.find(callback, [dt, dt]);
    }
    var cvalues = [];
    var cindex = [];
    var cptr = [];
    for (var j = 0; j < columns; j++) {
      cptr[j] = cindex.length;
      for (var k0 = aptr[j], k1 = aptr[j + 1], k = k0; k < k1; k++) {
        var i = aindex[k];
        var v = inverse ? cf(b2, avalues[k]) : cf(avalues[k], b2);
        if (!eq(v, zero)) {
          cindex.push(i);
          cvalues.push(v);
        }
      }
    }
    cptr[columns] = cindex.length;
    return s.createSparseMatrix({
      values: cvalues,
      index: cindex,
      ptr: cptr,
      size: [rows, columns],
      datatype: dt
    });
  };
});
var name$W = "algorithm14";
var dependencies$W = ["typed"];
var createAlgorithm14 = /* @__PURE__ */ factory(name$W, dependencies$W, (_ref) => {
  var {
    typed
  } = _ref;
  return function algorithm14(a2, b2, callback, inverse) {
    var adata = a2._data;
    var asize = a2._size;
    var adt = a2._datatype;
    var dt;
    var cf = callback;
    if (typeof adt === "string") {
      dt = adt;
      b2 = typed.convert(b2, dt);
      cf = typed.find(callback, [dt, dt]);
    }
    var cdata = asize.length > 0 ? _iterate(cf, 0, asize, asize[0], adata, b2, inverse) : [];
    return a2.createDenseMatrix({
      data: cdata,
      size: clone$1(asize),
      datatype: dt
    });
  };
  function _iterate(f, level, s, n, av, bv, inverse) {
    var cv = [];
    if (level === s.length - 1) {
      for (var i = 0; i < n; i++) {
        cv[i] = inverse ? f(bv, av[i]) : f(av[i], bv);
      }
    } else {
      for (var j = 0; j < n; j++) {
        cv[j] = _iterate(f, level + 1, s, s[level + 1], av[j], bv, inverse);
      }
    }
    return cv;
  }
});
var name$V = "ceil";
var dependencies$V = ["typed", "config", "round", "matrix", "equalScalar"];
var createCeil = /* @__PURE__ */ factory(name$V, dependencies$V, (_ref) => {
  var {
    typed,
    config: config2,
    round: round2,
    matrix,
    equalScalar
  } = _ref;
  var algorithm11 = createAlgorithm11({
    typed,
    equalScalar
  });
  var algorithm14 = createAlgorithm14({
    typed
  });
  return typed("ceil", {
    number: function number(x) {
      if (nearlyEqual$1(x, round2(x), config2.epsilon)) {
        return round2(x);
      } else {
        return ceilNumber(x);
      }
    },
    "number, number": function numberNumber2(x, n) {
      if (nearlyEqual$1(x, round2(x, n), config2.epsilon)) {
        return round2(x, n);
      } else {
        var [number, exponent] = "".concat(x, "e").split("e");
        var result = Math.ceil(Number("".concat(number, "e").concat(Number(exponent) + n)));
        [number, exponent] = "".concat(result, "e").split("e");
        return Number("".concat(number, "e").concat(Number(exponent) - n));
      }
    },
    Complex: function Complex2(x) {
      return x.ceil();
    },
    "Complex, number": function ComplexNumber(x, n) {
      return x.ceil(n);
    },
    BigNumber: function BigNumber(x) {
      if (nearlyEqual(x, round2(x), config2.epsilon)) {
        return round2(x);
      } else {
        return x.ceil();
      }
    },
    "BigNumber, BigNumber": function BigNumberBigNumber(x, n) {
      if (nearlyEqual(x, round2(x, n), config2.epsilon)) {
        return round2(x, n);
      } else {
        return x.toDecimalPlaces(n.toNumber(), Decimal.ROUND_CEIL);
      }
    },
    Fraction: function Fraction2(x) {
      return x.ceil();
    },
    "Fraction, number": function FractionNumber(x, n) {
      return x.ceil(n);
    },
    "Array | Matrix": function ArrayMatrix(x) {
      return deepMap(x, this);
    },
    "Array | Matrix, number": function ArrayMatrixNumber(x, n) {
      return deepMap(x, (i) => this(i, n));
    },
    "SparseMatrix, number | BigNumber": function SparseMatrixNumberBigNumber(x, y) {
      return algorithm11(x, y, this, false);
    },
    "DenseMatrix, number | BigNumber": function DenseMatrixNumberBigNumber(x, y) {
      return algorithm14(x, y, this, false);
    },
    "number | Complex | BigNumber, Array": function numberComplexBigNumberArray(x, y) {
      return algorithm14(matrix(y), x, this, true).valueOf();
    }
  });
});
var name$U = "fix";
var dependencies$U = ["typed", "Complex", "matrix", "ceil", "floor"];
var createFix = /* @__PURE__ */ factory(name$U, dependencies$U, (_ref) => {
  var {
    typed,
    Complex: _Complex,
    matrix,
    ceil: ceil2,
    floor: floor2
  } = _ref;
  var algorithm14 = createAlgorithm14({
    typed
  });
  return typed("fix", {
    number: function number(x) {
      return x > 0 ? floor2(x) : ceil2(x);
    },
    "number, number | BigNumber": function numberNumberBigNumber(x, n) {
      return x > 0 ? floor2(x, n) : ceil2(x, n);
    },
    Complex: function Complex2(x) {
      return new _Complex(x.re > 0 ? Math.floor(x.re) : Math.ceil(x.re), x.im > 0 ? Math.floor(x.im) : Math.ceil(x.im));
    },
    "Complex, number | BigNumber": function ComplexNumberBigNumber(x, n) {
      return new _Complex(x.re > 0 ? floor2(x.re, n) : ceil2(x.re, n), x.im > 0 ? floor2(x.im, n) : ceil2(x.im, n));
    },
    BigNumber: function BigNumber(x) {
      return x.isNegative() ? ceil2(x) : floor2(x);
    },
    "BigNumber, number | BigNumber": function BigNumberNumberBigNumber(x, n) {
      return x.isNegative() ? ceil2(x, n) : floor2(x, n);
    },
    Fraction: function Fraction2(x) {
      return x.s < 0 ? x.ceil() : x.floor();
    },
    "Fraction, number | BigNumber": function FractionNumberBigNumber(x, n) {
      return x.s < 0 ? x.ceil(n) : x.floor(n);
    },
    "Array | Matrix": function ArrayMatrix(x) {
      return deepMap(x, this);
    },
    "Array | Matrix, number | BigNumber": function ArrayMatrixNumberBigNumber(x, n) {
      return deepMap(x, (i) => this(i, n));
    },
    "number | Complex | BigNumber, Array": function numberComplexBigNumberArray(x, y) {
      return algorithm14(matrix(y), x, this, true).valueOf();
    }
  });
});
var name$T = "floor";
var dependencies$T = ["typed", "config", "round", "matrix", "equalScalar"];
var createFloor = /* @__PURE__ */ factory(name$T, dependencies$T, (_ref) => {
  var {
    typed,
    config: config2,
    round: round2,
    matrix,
    equalScalar
  } = _ref;
  var algorithm11 = createAlgorithm11({
    typed,
    equalScalar
  });
  var algorithm14 = createAlgorithm14({
    typed
  });
  return typed("floor", {
    number: function number(x) {
      if (nearlyEqual$1(x, round2(x), config2.epsilon)) {
        return round2(x);
      } else {
        return Math.floor(x);
      }
    },
    "number, number": function numberNumber2(x, n) {
      if (nearlyEqual$1(x, round2(x, n), config2.epsilon)) {
        return round2(x, n);
      } else {
        var [number, exponent] = "".concat(x, "e").split("e");
        var result = Math.floor(Number("".concat(number, "e").concat(Number(exponent) + n)));
        [number, exponent] = "".concat(result, "e").split("e");
        return Number("".concat(number, "e").concat(Number(exponent) - n));
      }
    },
    Complex: function Complex2(x) {
      return x.floor();
    },
    "Complex, number": function ComplexNumber(x, n) {
      return x.floor(n);
    },
    BigNumber: function BigNumber(x) {
      if (nearlyEqual(x, round2(x), config2.epsilon)) {
        return round2(x);
      } else {
        return x.floor();
      }
    },
    "BigNumber, BigNumber": function BigNumberBigNumber(x, n) {
      if (nearlyEqual(x, round2(x, n), config2.epsilon)) {
        return round2(x, n);
      } else {
        return x.toDecimalPlaces(n.toNumber(), Decimal.ROUND_FLOOR);
      }
    },
    Fraction: function Fraction2(x) {
      return x.floor();
    },
    "Fraction, number": function FractionNumber(x, n) {
      return x.floor(n);
    },
    "Array | Matrix": function ArrayMatrix(x) {
      return deepMap(x, this);
    },
    "Array | Matrix, number": function ArrayMatrixNumber(x, n) {
      return deepMap(x, (i) => this(i, n));
    },
    "SparseMatrix, number | BigNumber": function SparseMatrixNumberBigNumber(x, y) {
      return algorithm11(x, y, this, false);
    },
    "DenseMatrix, number | BigNumber": function DenseMatrixNumberBigNumber(x, y) {
      return algorithm14(x, y, this, false);
    },
    "number | Complex | BigNumber, Array": function numberComplexBigNumberArray(x, y) {
      return algorithm14(matrix(y), x, this, true).valueOf();
    }
  });
});
var name$S = "algorithm01";
var dependencies$S = ["typed"];
var createAlgorithm01 = /* @__PURE__ */ factory(name$S, dependencies$S, (_ref) => {
  var {
    typed
  } = _ref;
  return function algorithm1(denseMatrix, sparseMatrix, callback, inverse) {
    var adata = denseMatrix._data;
    var asize = denseMatrix._size;
    var adt = denseMatrix._datatype;
    var bvalues = sparseMatrix._values;
    var bindex = sparseMatrix._index;
    var bptr = sparseMatrix._ptr;
    var bsize = sparseMatrix._size;
    var bdt = sparseMatrix._datatype;
    if (asize.length !== bsize.length) {
      throw new DimensionError(asize.length, bsize.length);
    }
    if (asize[0] !== bsize[0] || asize[1] !== bsize[1]) {
      throw new RangeError("Dimension mismatch. Matrix A (" + asize + ") must match Matrix B (" + bsize + ")");
    }
    if (!bvalues) {
      throw new Error("Cannot perform operation on Dense Matrix and Pattern Sparse Matrix");
    }
    var rows = asize[0];
    var columns = asize[1];
    var dt = typeof adt === "string" && adt === bdt ? adt : void 0;
    var cf = dt ? typed.find(callback, [dt, dt]) : callback;
    var i, j;
    var cdata = [];
    for (i = 0; i < rows; i++) {
      cdata[i] = [];
    }
    var x = [];
    var w = [];
    for (j = 0; j < columns; j++) {
      var mark = j + 1;
      for (var k0 = bptr[j], k1 = bptr[j + 1], k = k0; k < k1; k++) {
        i = bindex[k];
        x[i] = inverse ? cf(bvalues[k], adata[i][j]) : cf(adata[i][j], bvalues[k]);
        w[i] = mark;
      }
      for (i = 0; i < rows; i++) {
        if (w[i] === mark) {
          cdata[i][j] = x[i];
        } else {
          cdata[i][j] = adata[i][j];
        }
      }
    }
    return denseMatrix.createDenseMatrix({
      data: cdata,
      size: [rows, columns],
      datatype: dt
    });
  };
});
var name$R = "algorithm04";
var dependencies$R = ["typed", "equalScalar"];
var createAlgorithm04 = /* @__PURE__ */ factory(name$R, dependencies$R, (_ref) => {
  var {
    typed,
    equalScalar
  } = _ref;
  return function algorithm04(a2, b2, callback) {
    var avalues = a2._values;
    var aindex = a2._index;
    var aptr = a2._ptr;
    var asize = a2._size;
    var adt = a2._datatype;
    var bvalues = b2._values;
    var bindex = b2._index;
    var bptr = b2._ptr;
    var bsize = b2._size;
    var bdt = b2._datatype;
    if (asize.length !== bsize.length) {
      throw new DimensionError(asize.length, bsize.length);
    }
    if (asize[0] !== bsize[0] || asize[1] !== bsize[1]) {
      throw new RangeError("Dimension mismatch. Matrix A (" + asize + ") must match Matrix B (" + bsize + ")");
    }
    var rows = asize[0];
    var columns = asize[1];
    var dt;
    var eq = equalScalar;
    var zero = 0;
    var cf = callback;
    if (typeof adt === "string" && adt === bdt) {
      dt = adt;
      eq = typed.find(equalScalar, [dt, dt]);
      zero = typed.convert(0, dt);
      cf = typed.find(callback, [dt, dt]);
    }
    var cvalues = avalues && bvalues ? [] : void 0;
    var cindex = [];
    var cptr = [];
    var xa = avalues && bvalues ? [] : void 0;
    var xb = avalues && bvalues ? [] : void 0;
    var wa = [];
    var wb = [];
    var i, j, k, k0, k1;
    for (j = 0; j < columns; j++) {
      cptr[j] = cindex.length;
      var mark = j + 1;
      for (k0 = aptr[j], k1 = aptr[j + 1], k = k0; k < k1; k++) {
        i = aindex[k];
        cindex.push(i);
        wa[i] = mark;
        if (xa) {
          xa[i] = avalues[k];
        }
      }
      for (k0 = bptr[j], k1 = bptr[j + 1], k = k0; k < k1; k++) {
        i = bindex[k];
        if (wa[i] === mark) {
          if (xa) {
            var v = cf(xa[i], bvalues[k]);
            if (!eq(v, zero)) {
              xa[i] = v;
            } else {
              wa[i] = null;
            }
          }
        } else {
          cindex.push(i);
          wb[i] = mark;
          if (xb) {
            xb[i] = bvalues[k];
          }
        }
      }
      if (xa && xb) {
        k = cptr[j];
        while (k < cindex.length) {
          i = cindex[k];
          if (wa[i] === mark) {
            cvalues[k] = xa[i];
            k++;
          } else if (wb[i] === mark) {
            cvalues[k] = xb[i];
            k++;
          } else {
            cindex.splice(k, 1);
          }
        }
      }
    }
    cptr[columns] = cindex.length;
    return a2.createSparseMatrix({
      values: cvalues,
      index: cindex,
      ptr: cptr,
      size: [rows, columns],
      datatype: dt
    });
  };
});
var name$Q = "algorithm10";
var dependencies$Q = ["typed", "DenseMatrix"];
var createAlgorithm10 = /* @__PURE__ */ factory(name$Q, dependencies$Q, (_ref) => {
  var {
    typed,
    DenseMatrix
  } = _ref;
  return function algorithm10(s, b2, callback, inverse) {
    var avalues = s._values;
    var aindex = s._index;
    var aptr = s._ptr;
    var asize = s._size;
    var adt = s._datatype;
    if (!avalues) {
      throw new Error("Cannot perform operation on Pattern Sparse Matrix and Scalar value");
    }
    var rows = asize[0];
    var columns = asize[1];
    var dt;
    var cf = callback;
    if (typeof adt === "string") {
      dt = adt;
      b2 = typed.convert(b2, dt);
      cf = typed.find(callback, [dt, dt]);
    }
    var cdata = [];
    var x = [];
    var w = [];
    for (var j = 0; j < columns; j++) {
      var mark = j + 1;
      for (var k0 = aptr[j], k1 = aptr[j + 1], k = k0; k < k1; k++) {
        var r = aindex[k];
        x[r] = avalues[k];
        w[r] = mark;
      }
      for (var i = 0; i < rows; i++) {
        if (j === 0) {
          cdata[i] = [];
        }
        if (w[i] === mark) {
          cdata[i][j] = inverse ? cf(b2, x[i]) : cf(x[i], b2);
        } else {
          cdata[i][j] = b2;
        }
      }
    }
    return new DenseMatrix({
      data: cdata,
      size: [rows, columns],
      datatype: dt
    });
  };
});
var name$P = "algorithm13";
var dependencies$P = ["typed"];
var createAlgorithm13 = /* @__PURE__ */ factory(name$P, dependencies$P, (_ref) => {
  var {
    typed
  } = _ref;
  return function algorithm13(a2, b2, callback) {
    var adata = a2._data;
    var asize = a2._size;
    var adt = a2._datatype;
    var bdata = b2._data;
    var bsize = b2._size;
    var bdt = b2._datatype;
    var csize = [];
    if (asize.length !== bsize.length) {
      throw new DimensionError(asize.length, bsize.length);
    }
    for (var s = 0; s < asize.length; s++) {
      if (asize[s] !== bsize[s]) {
        throw new RangeError("Dimension mismatch. Matrix A (" + asize + ") must match Matrix B (" + bsize + ")");
      }
      csize[s] = asize[s];
    }
    var dt;
    var cf = callback;
    if (typeof adt === "string" && adt === bdt) {
      dt = adt;
      cf = typed.find(callback, [dt, dt]);
    }
    var cdata = csize.length > 0 ? _iterate(cf, 0, csize, csize[0], adata, bdata) : [];
    return a2.createDenseMatrix({
      data: cdata,
      size: csize,
      datatype: dt
    });
  };
  function _iterate(f, level, s, n, av, bv) {
    var cv = [];
    if (level === s.length - 1) {
      for (var i = 0; i < n; i++) {
        cv[i] = f(av[i], bv[i]);
      }
    } else {
      for (var j = 0; j < n; j++) {
        cv[j] = _iterate(f, level + 1, s, s[level + 1], av[j], bv[j]);
      }
    }
    return cv;
  }
});
var name$O = "algorithm02";
var dependencies$O = ["typed", "equalScalar"];
var createAlgorithm02 = /* @__PURE__ */ factory(name$O, dependencies$O, (_ref) => {
  var {
    typed,
    equalScalar
  } = _ref;
  return function algorithm02(denseMatrix, sparseMatrix, callback, inverse) {
    var adata = denseMatrix._data;
    var asize = denseMatrix._size;
    var adt = denseMatrix._datatype;
    var bvalues = sparseMatrix._values;
    var bindex = sparseMatrix._index;
    var bptr = sparseMatrix._ptr;
    var bsize = sparseMatrix._size;
    var bdt = sparseMatrix._datatype;
    if (asize.length !== bsize.length) {
      throw new DimensionError(asize.length, bsize.length);
    }
    if (asize[0] !== bsize[0] || asize[1] !== bsize[1]) {
      throw new RangeError("Dimension mismatch. Matrix A (" + asize + ") must match Matrix B (" + bsize + ")");
    }
    if (!bvalues) {
      throw new Error("Cannot perform operation on Dense Matrix and Pattern Sparse Matrix");
    }
    var rows = asize[0];
    var columns = asize[1];
    var dt;
    var eq = equalScalar;
    var zero = 0;
    var cf = callback;
    if (typeof adt === "string" && adt === bdt) {
      dt = adt;
      eq = typed.find(equalScalar, [dt, dt]);
      zero = typed.convert(0, dt);
      cf = typed.find(callback, [dt, dt]);
    }
    var cvalues = [];
    var cindex = [];
    var cptr = [];
    for (var j = 0; j < columns; j++) {
      cptr[j] = cindex.length;
      for (var k0 = bptr[j], k1 = bptr[j + 1], k = k0; k < k1; k++) {
        var i = bindex[k];
        var cij = inverse ? cf(bvalues[k], adata[i][j]) : cf(adata[i][j], bvalues[k]);
        if (!eq(cij, zero)) {
          cindex.push(i);
          cvalues.push(cij);
        }
      }
    }
    cptr[columns] = cindex.length;
    return sparseMatrix.createSparseMatrix({
      values: cvalues,
      index: cindex,
      ptr: cptr,
      size: [rows, columns],
      datatype: dt
    });
  };
});
var name$N = "algorithm03";
var dependencies$N = ["typed"];
var createAlgorithm03 = /* @__PURE__ */ factory(name$N, dependencies$N, (_ref) => {
  var {
    typed
  } = _ref;
  return function algorithm03(denseMatrix, sparseMatrix, callback, inverse) {
    var adata = denseMatrix._data;
    var asize = denseMatrix._size;
    var adt = denseMatrix._datatype;
    var bvalues = sparseMatrix._values;
    var bindex = sparseMatrix._index;
    var bptr = sparseMatrix._ptr;
    var bsize = sparseMatrix._size;
    var bdt = sparseMatrix._datatype;
    if (asize.length !== bsize.length) {
      throw new DimensionError(asize.length, bsize.length);
    }
    if (asize[0] !== bsize[0] || asize[1] !== bsize[1]) {
      throw new RangeError("Dimension mismatch. Matrix A (" + asize + ") must match Matrix B (" + bsize + ")");
    }
    if (!bvalues) {
      throw new Error("Cannot perform operation on Dense Matrix and Pattern Sparse Matrix");
    }
    var rows = asize[0];
    var columns = asize[1];
    var dt;
    var zero = 0;
    var cf = callback;
    if (typeof adt === "string" && adt === bdt) {
      dt = adt;
      zero = typed.convert(0, dt);
      cf = typed.find(callback, [dt, dt]);
    }
    var cdata = [];
    for (var z = 0; z < rows; z++) {
      cdata[z] = [];
    }
    var x = [];
    var w = [];
    for (var j = 0; j < columns; j++) {
      var mark = j + 1;
      for (var k0 = bptr[j], k1 = bptr[j + 1], k = k0; k < k1; k++) {
        var i = bindex[k];
        x[i] = inverse ? cf(bvalues[k], adata[i][j]) : cf(adata[i][j], bvalues[k]);
        w[i] = mark;
      }
      for (var y = 0; y < rows; y++) {
        if (w[y] === mark) {
          cdata[y][j] = x[y];
        } else {
          cdata[y][j] = inverse ? cf(zero, adata[y][j]) : cf(adata[y][j], zero);
        }
      }
    }
    return denseMatrix.createDenseMatrix({
      data: cdata,
      size: [rows, columns],
      datatype: dt
    });
  };
});
var name$M = "algorithm05";
var dependencies$M = ["typed", "equalScalar"];
var createAlgorithm05 = /* @__PURE__ */ factory(name$M, dependencies$M, (_ref) => {
  var {
    typed,
    equalScalar
  } = _ref;
  return function algorithm05(a2, b2, callback) {
    var avalues = a2._values;
    var aindex = a2._index;
    var aptr = a2._ptr;
    var asize = a2._size;
    var adt = a2._datatype;
    var bvalues = b2._values;
    var bindex = b2._index;
    var bptr = b2._ptr;
    var bsize = b2._size;
    var bdt = b2._datatype;
    if (asize.length !== bsize.length) {
      throw new DimensionError(asize.length, bsize.length);
    }
    if (asize[0] !== bsize[0] || asize[1] !== bsize[1]) {
      throw new RangeError("Dimension mismatch. Matrix A (" + asize + ") must match Matrix B (" + bsize + ")");
    }
    var rows = asize[0];
    var columns = asize[1];
    var dt;
    var eq = equalScalar;
    var zero = 0;
    var cf = callback;
    if (typeof adt === "string" && adt === bdt) {
      dt = adt;
      eq = typed.find(equalScalar, [dt, dt]);
      zero = typed.convert(0, dt);
      cf = typed.find(callback, [dt, dt]);
    }
    var cvalues = avalues && bvalues ? [] : void 0;
    var cindex = [];
    var cptr = [];
    var xa = cvalues ? [] : void 0;
    var xb = cvalues ? [] : void 0;
    var wa = [];
    var wb = [];
    var i, j, k, k1;
    for (j = 0; j < columns; j++) {
      cptr[j] = cindex.length;
      var mark = j + 1;
      for (k = aptr[j], k1 = aptr[j + 1]; k < k1; k++) {
        i = aindex[k];
        cindex.push(i);
        wa[i] = mark;
        if (xa) {
          xa[i] = avalues[k];
        }
      }
      for (k = bptr[j], k1 = bptr[j + 1]; k < k1; k++) {
        i = bindex[k];
        if (wa[i] !== mark) {
          cindex.push(i);
        }
        wb[i] = mark;
        if (xb) {
          xb[i] = bvalues[k];
        }
      }
      if (cvalues) {
        k = cptr[j];
        while (k < cindex.length) {
          i = cindex[k];
          var wai = wa[i];
          var wbi = wb[i];
          if (wai === mark || wbi === mark) {
            var va = wai === mark ? xa[i] : zero;
            var vb = wbi === mark ? xb[i] : zero;
            var vc = cf(va, vb);
            if (!eq(vc, zero)) {
              cvalues.push(vc);
              k++;
            } else {
              cindex.splice(k, 1);
            }
          }
        }
      }
    }
    cptr[columns] = cindex.length;
    return a2.createSparseMatrix({
      values: cvalues,
      index: cindex,
      ptr: cptr,
      size: [rows, columns],
      datatype: dt
    });
  };
});
var name$L = "algorithm12";
var dependencies$L = ["typed", "DenseMatrix"];
var createAlgorithm12 = /* @__PURE__ */ factory(name$L, dependencies$L, (_ref) => {
  var {
    typed,
    DenseMatrix
  } = _ref;
  return function algorithm12(s, b2, callback, inverse) {
    var avalues = s._values;
    var aindex = s._index;
    var aptr = s._ptr;
    var asize = s._size;
    var adt = s._datatype;
    if (!avalues) {
      throw new Error("Cannot perform operation on Pattern Sparse Matrix and Scalar value");
    }
    var rows = asize[0];
    var columns = asize[1];
    var dt;
    var cf = callback;
    if (typeof adt === "string") {
      dt = adt;
      b2 = typed.convert(b2, dt);
      cf = typed.find(callback, [dt, dt]);
    }
    var cdata = [];
    var x = [];
    var w = [];
    for (var j = 0; j < columns; j++) {
      var mark = j + 1;
      for (var k0 = aptr[j], k1 = aptr[j + 1], k = k0; k < k1; k++) {
        var r = aindex[k];
        x[r] = avalues[k];
        w[r] = mark;
      }
      for (var i = 0; i < rows; i++) {
        if (j === 0) {
          cdata[i] = [];
        }
        if (w[i] === mark) {
          cdata[i][j] = inverse ? cf(b2, x[i]) : cf(x[i], b2);
        } else {
          cdata[i][j] = inverse ? cf(b2, 0) : cf(0, b2);
        }
      }
    }
    return new DenseMatrix({
      data: cdata,
      size: [rows, columns],
      datatype: dt
    });
  };
});
var name$K = "mod";
var dependencies$K = ["typed", "matrix", "equalScalar", "DenseMatrix"];
var createMod = /* @__PURE__ */ factory(name$K, dependencies$K, (_ref) => {
  var {
    typed,
    matrix,
    equalScalar,
    DenseMatrix
  } = _ref;
  var algorithm02 = createAlgorithm02({
    typed,
    equalScalar
  });
  var algorithm03 = createAlgorithm03({
    typed
  });
  var algorithm05 = createAlgorithm05({
    typed,
    equalScalar
  });
  var algorithm11 = createAlgorithm11({
    typed,
    equalScalar
  });
  var algorithm12 = createAlgorithm12({
    typed,
    DenseMatrix
  });
  var algorithm13 = createAlgorithm13({
    typed
  });
  var algorithm14 = createAlgorithm14({
    typed
  });
  return typed(name$K, {
    "number, number": modNumber,
    "BigNumber, BigNumber": function BigNumberBigNumber(x, y) {
      if (y.isNeg()) {
        throw new Error("Cannot calculate mod for a negative divisor");
      }
      return y.isZero() ? x : x.mod(y);
    },
    "Fraction, Fraction": function FractionFraction(x, y) {
      if (y.compare(0) < 0) {
        throw new Error("Cannot calculate mod for a negative divisor");
      }
      return x.compare(0) >= 0 ? x.mod(y) : x.mod(y).add(y).mod(y);
    },
    "SparseMatrix, SparseMatrix": function SparseMatrixSparseMatrix(x, y) {
      return algorithm05(x, y, this, false);
    },
    "SparseMatrix, DenseMatrix": function SparseMatrixDenseMatrix(x, y) {
      return algorithm02(y, x, this, true);
    },
    "DenseMatrix, SparseMatrix": function DenseMatrixSparseMatrix(x, y) {
      return algorithm03(x, y, this, false);
    },
    "DenseMatrix, DenseMatrix": function DenseMatrixDenseMatrix(x, y) {
      return algorithm13(x, y, this);
    },
    "Array, Array": function ArrayArray(x, y) {
      return this(matrix(x), matrix(y)).valueOf();
    },
    "Array, Matrix": function ArrayMatrix(x, y) {
      return this(matrix(x), y);
    },
    "Matrix, Array": function MatrixArray(x, y) {
      return this(x, matrix(y));
    },
    "SparseMatrix, any": function SparseMatrixAny(x, y) {
      return algorithm11(x, y, this, false);
    },
    "DenseMatrix, any": function DenseMatrixAny(x, y) {
      return algorithm14(x, y, this, false);
    },
    "any, SparseMatrix": function anySparseMatrix(x, y) {
      return algorithm12(y, x, this, true);
    },
    "any, DenseMatrix": function anyDenseMatrix(x, y) {
      return algorithm14(y, x, this, true);
    },
    "Array, any": function ArrayAny(x, y) {
      return algorithm14(matrix(x), y, this, false).valueOf();
    },
    "any, Array": function anyArray(x, y) {
      return algorithm14(matrix(y), x, this, true).valueOf();
    }
  });
});
var name$J = "multiplyScalar";
var dependencies$J = ["typed"];
var createMultiplyScalar = /* @__PURE__ */ factory(name$J, dependencies$J, (_ref) => {
  var {
    typed
  } = _ref;
  return typed("multiplyScalar", {
    "number, number": multiplyNumber,
    "Complex, Complex": function ComplexComplex(x, y) {
      return x.mul(y);
    },
    "BigNumber, BigNumber": function BigNumberBigNumber(x, y) {
      return x.times(y);
    },
    "Fraction, Fraction": function FractionFraction(x, y) {
      return x.mul(y);
    },
    "number | Fraction | BigNumber | Complex, Unit": function numberFractionBigNumberComplexUnit(x, y) {
      var res = y.clone();
      res.value = res.value === null ? res._normalize(x) : this(res.value, x);
      return res;
    },
    "Unit, number | Fraction | BigNumber | Complex": function UnitNumberFractionBigNumberComplex(x, y) {
      var res = x.clone();
      res.value = res.value === null ? res._normalize(y) : this(res.value, y);
      return res;
    },
    "Unit, Unit": function UnitUnit(x, y) {
      return x.multiply(y);
    }
  });
});
var name$I = "multiply";
var dependencies$I = ["typed", "matrix", "addScalar", "multiplyScalar", "equalScalar", "dot"];
var createMultiply = /* @__PURE__ */ factory(name$I, dependencies$I, (_ref) => {
  var {
    typed,
    matrix,
    addScalar,
    multiplyScalar,
    equalScalar,
    dot
  } = _ref;
  var algorithm11 = createAlgorithm11({
    typed,
    equalScalar
  });
  var algorithm14 = createAlgorithm14({
    typed
  });
  function _validateMatrixDimensions(size1, size2) {
    switch (size1.length) {
      case 1:
        switch (size2.length) {
          case 1:
            if (size1[0] !== size2[0]) {
              throw new RangeError("Dimension mismatch in multiplication. Vectors must have the same length");
            }
            break;
          case 2:
            if (size1[0] !== size2[0]) {
              throw new RangeError("Dimension mismatch in multiplication. Vector length (" + size1[0] + ") must match Matrix rows (" + size2[0] + ")");
            }
            break;
          default:
            throw new Error("Can only multiply a 1 or 2 dimensional matrix (Matrix B has " + size2.length + " dimensions)");
        }
        break;
      case 2:
        switch (size2.length) {
          case 1:
            if (size1[1] !== size2[0]) {
              throw new RangeError("Dimension mismatch in multiplication. Matrix columns (" + size1[1] + ") must match Vector length (" + size2[0] + ")");
            }
            break;
          case 2:
            if (size1[1] !== size2[0]) {
              throw new RangeError("Dimension mismatch in multiplication. Matrix A columns (" + size1[1] + ") must match Matrix B rows (" + size2[0] + ")");
            }
            break;
          default:
            throw new Error("Can only multiply a 1 or 2 dimensional matrix (Matrix B has " + size2.length + " dimensions)");
        }
        break;
      default:
        throw new Error("Can only multiply a 1 or 2 dimensional matrix (Matrix A has " + size1.length + " dimensions)");
    }
  }
  function _multiplyVectorVector(a2, b2, n) {
    if (n === 0) {
      throw new Error("Cannot multiply two empty vectors");
    }
    return dot(a2, b2);
  }
  function _multiplyVectorMatrix(a2, b2) {
    if (b2.storage() !== "dense") {
      throw new Error("Support for SparseMatrix not implemented");
    }
    return _multiplyVectorDenseMatrix(a2, b2);
  }
  function _multiplyVectorDenseMatrix(a2, b2) {
    var adata = a2._data;
    var asize = a2._size;
    var adt = a2._datatype;
    var bdata = b2._data;
    var bsize = b2._size;
    var bdt = b2._datatype;
    var alength = asize[0];
    var bcolumns = bsize[1];
    var dt;
    var af = addScalar;
    var mf = multiplyScalar;
    if (adt && bdt && adt === bdt && typeof adt === "string") {
      dt = adt;
      af = typed.find(addScalar, [dt, dt]);
      mf = typed.find(multiplyScalar, [dt, dt]);
    }
    var c2 = [];
    for (var j = 0; j < bcolumns; j++) {
      var sum = mf(adata[0], bdata[0][j]);
      for (var i = 1; i < alength; i++) {
        sum = af(sum, mf(adata[i], bdata[i][j]));
      }
      c2[j] = sum;
    }
    return a2.createDenseMatrix({
      data: c2,
      size: [bcolumns],
      datatype: dt
    });
  }
  var _multiplyMatrixVector = typed("_multiplyMatrixVector", {
    "DenseMatrix, any": _multiplyDenseMatrixVector,
    "SparseMatrix, any": _multiplySparseMatrixVector
  });
  var _multiplyMatrixMatrix = typed("_multiplyMatrixMatrix", {
    "DenseMatrix, DenseMatrix": _multiplyDenseMatrixDenseMatrix,
    "DenseMatrix, SparseMatrix": _multiplyDenseMatrixSparseMatrix,
    "SparseMatrix, DenseMatrix": _multiplySparseMatrixDenseMatrix,
    "SparseMatrix, SparseMatrix": _multiplySparseMatrixSparseMatrix
  });
  function _multiplyDenseMatrixVector(a2, b2) {
    var adata = a2._data;
    var asize = a2._size;
    var adt = a2._datatype;
    var bdata = b2._data;
    var bdt = b2._datatype;
    var arows = asize[0];
    var acolumns = asize[1];
    var dt;
    var af = addScalar;
    var mf = multiplyScalar;
    if (adt && bdt && adt === bdt && typeof adt === "string") {
      dt = adt;
      af = typed.find(addScalar, [dt, dt]);
      mf = typed.find(multiplyScalar, [dt, dt]);
    }
    var c2 = [];
    for (var i = 0; i < arows; i++) {
      var row = adata[i];
      var sum = mf(row[0], bdata[0]);
      for (var j = 1; j < acolumns; j++) {
        sum = af(sum, mf(row[j], bdata[j]));
      }
      c2[i] = sum;
    }
    return a2.createDenseMatrix({
      data: c2,
      size: [arows],
      datatype: dt
    });
  }
  function _multiplyDenseMatrixDenseMatrix(a2, b2) {
    var adata = a2._data;
    var asize = a2._size;
    var adt = a2._datatype;
    var bdata = b2._data;
    var bsize = b2._size;
    var bdt = b2._datatype;
    var arows = asize[0];
    var acolumns = asize[1];
    var bcolumns = bsize[1];
    var dt;
    var af = addScalar;
    var mf = multiplyScalar;
    if (adt && bdt && adt === bdt && typeof adt === "string") {
      dt = adt;
      af = typed.find(addScalar, [dt, dt]);
      mf = typed.find(multiplyScalar, [dt, dt]);
    }
    var c2 = [];
    for (var i = 0; i < arows; i++) {
      var row = adata[i];
      c2[i] = [];
      for (var j = 0; j < bcolumns; j++) {
        var sum = mf(row[0], bdata[0][j]);
        for (var x = 1; x < acolumns; x++) {
          sum = af(sum, mf(row[x], bdata[x][j]));
        }
        c2[i][j] = sum;
      }
    }
    return a2.createDenseMatrix({
      data: c2,
      size: [arows, bcolumns],
      datatype: dt
    });
  }
  function _multiplyDenseMatrixSparseMatrix(a2, b2) {
    var adata = a2._data;
    var asize = a2._size;
    var adt = a2._datatype;
    var bvalues = b2._values;
    var bindex = b2._index;
    var bptr = b2._ptr;
    var bsize = b2._size;
    var bdt = b2._datatype;
    if (!bvalues) {
      throw new Error("Cannot multiply Dense Matrix times Pattern only Matrix");
    }
    var arows = asize[0];
    var bcolumns = bsize[1];
    var dt;
    var af = addScalar;
    var mf = multiplyScalar;
    var eq = equalScalar;
    var zero = 0;
    if (adt && bdt && adt === bdt && typeof adt === "string") {
      dt = adt;
      af = typed.find(addScalar, [dt, dt]);
      mf = typed.find(multiplyScalar, [dt, dt]);
      eq = typed.find(equalScalar, [dt, dt]);
      zero = typed.convert(0, dt);
    }
    var cvalues = [];
    var cindex = [];
    var cptr = [];
    var c2 = b2.createSparseMatrix({
      values: cvalues,
      index: cindex,
      ptr: cptr,
      size: [arows, bcolumns],
      datatype: dt
    });
    for (var jb = 0; jb < bcolumns; jb++) {
      cptr[jb] = cindex.length;
      var kb0 = bptr[jb];
      var kb1 = bptr[jb + 1];
      if (kb1 > kb0) {
        var last = 0;
        for (var i = 0; i < arows; i++) {
          var mark = i + 1;
          var cij = void 0;
          for (var kb = kb0; kb < kb1; kb++) {
            var ib = bindex[kb];
            if (last !== mark) {
              cij = mf(adata[i][ib], bvalues[kb]);
              last = mark;
            } else {
              cij = af(cij, mf(adata[i][ib], bvalues[kb]));
            }
          }
          if (last === mark && !eq(cij, zero)) {
            cindex.push(i);
            cvalues.push(cij);
          }
        }
      }
    }
    cptr[bcolumns] = cindex.length;
    return c2;
  }
  function _multiplySparseMatrixVector(a2, b2) {
    var avalues = a2._values;
    var aindex = a2._index;
    var aptr = a2._ptr;
    var adt = a2._datatype;
    if (!avalues) {
      throw new Error("Cannot multiply Pattern only Matrix times Dense Matrix");
    }
    var bdata = b2._data;
    var bdt = b2._datatype;
    var arows = a2._size[0];
    var brows = b2._size[0];
    var cvalues = [];
    var cindex = [];
    var cptr = [];
    var dt;
    var af = addScalar;
    var mf = multiplyScalar;
    var eq = equalScalar;
    var zero = 0;
    if (adt && bdt && adt === bdt && typeof adt === "string") {
      dt = adt;
      af = typed.find(addScalar, [dt, dt]);
      mf = typed.find(multiplyScalar, [dt, dt]);
      eq = typed.find(equalScalar, [dt, dt]);
      zero = typed.convert(0, dt);
    }
    var x = [];
    var w = [];
    cptr[0] = 0;
    for (var ib = 0; ib < brows; ib++) {
      var vbi = bdata[ib];
      if (!eq(vbi, zero)) {
        for (var ka0 = aptr[ib], ka1 = aptr[ib + 1], ka = ka0; ka < ka1; ka++) {
          var ia = aindex[ka];
          if (!w[ia]) {
            w[ia] = true;
            cindex.push(ia);
            x[ia] = mf(vbi, avalues[ka]);
          } else {
            x[ia] = af(x[ia], mf(vbi, avalues[ka]));
          }
        }
      }
    }
    for (var p1 = cindex.length, p = 0; p < p1; p++) {
      var ic = cindex[p];
      cvalues[p] = x[ic];
    }
    cptr[1] = cindex.length;
    return a2.createSparseMatrix({
      values: cvalues,
      index: cindex,
      ptr: cptr,
      size: [arows, 1],
      datatype: dt
    });
  }
  function _multiplySparseMatrixDenseMatrix(a2, b2) {
    var avalues = a2._values;
    var aindex = a2._index;
    var aptr = a2._ptr;
    var adt = a2._datatype;
    if (!avalues) {
      throw new Error("Cannot multiply Pattern only Matrix times Dense Matrix");
    }
    var bdata = b2._data;
    var bdt = b2._datatype;
    var arows = a2._size[0];
    var brows = b2._size[0];
    var bcolumns = b2._size[1];
    var dt;
    var af = addScalar;
    var mf = multiplyScalar;
    var eq = equalScalar;
    var zero = 0;
    if (adt && bdt && adt === bdt && typeof adt === "string") {
      dt = adt;
      af = typed.find(addScalar, [dt, dt]);
      mf = typed.find(multiplyScalar, [dt, dt]);
      eq = typed.find(equalScalar, [dt, dt]);
      zero = typed.convert(0, dt);
    }
    var cvalues = [];
    var cindex = [];
    var cptr = [];
    var c2 = a2.createSparseMatrix({
      values: cvalues,
      index: cindex,
      ptr: cptr,
      size: [arows, bcolumns],
      datatype: dt
    });
    var x = [];
    var w = [];
    for (var jb = 0; jb < bcolumns; jb++) {
      cptr[jb] = cindex.length;
      var mark = jb + 1;
      for (var ib = 0; ib < brows; ib++) {
        var vbij = bdata[ib][jb];
        if (!eq(vbij, zero)) {
          for (var ka0 = aptr[ib], ka1 = aptr[ib + 1], ka = ka0; ka < ka1; ka++) {
            var ia = aindex[ka];
            if (w[ia] !== mark) {
              w[ia] = mark;
              cindex.push(ia);
              x[ia] = mf(vbij, avalues[ka]);
            } else {
              x[ia] = af(x[ia], mf(vbij, avalues[ka]));
            }
          }
        }
      }
      for (var p0 = cptr[jb], p1 = cindex.length, p = p0; p < p1; p++) {
        var ic = cindex[p];
        cvalues[p] = x[ic];
      }
    }
    cptr[bcolumns] = cindex.length;
    return c2;
  }
  function _multiplySparseMatrixSparseMatrix(a2, b2) {
    var avalues = a2._values;
    var aindex = a2._index;
    var aptr = a2._ptr;
    var adt = a2._datatype;
    var bvalues = b2._values;
    var bindex = b2._index;
    var bptr = b2._ptr;
    var bdt = b2._datatype;
    var arows = a2._size[0];
    var bcolumns = b2._size[1];
    var values2 = avalues && bvalues;
    var dt;
    var af = addScalar;
    var mf = multiplyScalar;
    if (adt && bdt && adt === bdt && typeof adt === "string") {
      dt = adt;
      af = typed.find(addScalar, [dt, dt]);
      mf = typed.find(multiplyScalar, [dt, dt]);
    }
    var cvalues = values2 ? [] : void 0;
    var cindex = [];
    var cptr = [];
    var c2 = a2.createSparseMatrix({
      values: cvalues,
      index: cindex,
      ptr: cptr,
      size: [arows, bcolumns],
      datatype: dt
    });
    var x = values2 ? [] : void 0;
    var w = [];
    var ka, ka0, ka1, kb, kb0, kb1, ia, ib;
    for (var jb = 0; jb < bcolumns; jb++) {
      cptr[jb] = cindex.length;
      var mark = jb + 1;
      for (kb0 = bptr[jb], kb1 = bptr[jb + 1], kb = kb0; kb < kb1; kb++) {
        ib = bindex[kb];
        if (values2) {
          for (ka0 = aptr[ib], ka1 = aptr[ib + 1], ka = ka0; ka < ka1; ka++) {
            ia = aindex[ka];
            if (w[ia] !== mark) {
              w[ia] = mark;
              cindex.push(ia);
              x[ia] = mf(bvalues[kb], avalues[ka]);
            } else {
              x[ia] = af(x[ia], mf(bvalues[kb], avalues[ka]));
            }
          }
        } else {
          for (ka0 = aptr[ib], ka1 = aptr[ib + 1], ka = ka0; ka < ka1; ka++) {
            ia = aindex[ka];
            if (w[ia] !== mark) {
              w[ia] = mark;
              cindex.push(ia);
            }
          }
        }
      }
      if (values2) {
        for (var p0 = cptr[jb], p1 = cindex.length, p = p0; p < p1; p++) {
          var ic = cindex[p];
          cvalues[p] = x[ic];
        }
      }
    }
    cptr[bcolumns] = cindex.length;
    return c2;
  }
  return typed(name$I, extend({
    "Array, Array": function ArrayArray(x, y) {
      _validateMatrixDimensions(arraySize(x), arraySize(y));
      var m = this(matrix(x), matrix(y));
      return isMatrix(m) ? m.valueOf() : m;
    },
    "Matrix, Matrix": function MatrixMatrix(x, y) {
      var xsize = x.size();
      var ysize = y.size();
      _validateMatrixDimensions(xsize, ysize);
      if (xsize.length === 1) {
        if (ysize.length === 1) {
          return _multiplyVectorVector(x, y, xsize[0]);
        }
        return _multiplyVectorMatrix(x, y);
      }
      if (ysize.length === 1) {
        return _multiplyMatrixVector(x, y);
      }
      return _multiplyMatrixMatrix(x, y);
    },
    "Matrix, Array": function MatrixArray(x, y) {
      return this(x, matrix(y));
    },
    "Array, Matrix": function ArrayMatrix(x, y) {
      return this(matrix(x, y.storage()), y);
    },
    "SparseMatrix, any": function SparseMatrixAny(x, y) {
      return algorithm11(x, y, multiplyScalar, false);
    },
    "DenseMatrix, any": function DenseMatrixAny(x, y) {
      return algorithm14(x, y, multiplyScalar, false);
    },
    "any, SparseMatrix": function anySparseMatrix(x, y) {
      return algorithm11(y, x, multiplyScalar, true);
    },
    "any, DenseMatrix": function anyDenseMatrix(x, y) {
      return algorithm14(y, x, multiplyScalar, true);
    },
    "Array, any": function ArrayAny(x, y) {
      return algorithm14(matrix(x), y, multiplyScalar, false).valueOf();
    },
    "any, Array": function anyArray(x, y) {
      return algorithm14(matrix(y), x, multiplyScalar, true).valueOf();
    },
    "any, any": multiplyScalar,
    "any, any, ...any": function anyAnyAny(x, y, rest) {
      var result = this(x, y);
      for (var i = 0; i < rest.length; i++) {
        result = this(result, rest[i]);
      }
      return result;
    }
  }, multiplyScalar.signatures));
});
var name$H = "subtract";
var dependencies$H = ["typed", "matrix", "equalScalar", "addScalar", "unaryMinus", "DenseMatrix"];
var createSubtract = /* @__PURE__ */ factory(name$H, dependencies$H, (_ref) => {
  var {
    typed,
    matrix,
    equalScalar,
    addScalar,
    unaryMinus,
    DenseMatrix
  } = _ref;
  var algorithm01 = createAlgorithm01({
    typed
  });
  var algorithm03 = createAlgorithm03({
    typed
  });
  var algorithm05 = createAlgorithm05({
    typed,
    equalScalar
  });
  var algorithm10 = createAlgorithm10({
    typed,
    DenseMatrix
  });
  var algorithm13 = createAlgorithm13({
    typed
  });
  var algorithm14 = createAlgorithm14({
    typed
  });
  return typed(name$H, {
    "number, number": function numberNumber2(x, y) {
      return x - y;
    },
    "Complex, Complex": function ComplexComplex(x, y) {
      return x.sub(y);
    },
    "BigNumber, BigNumber": function BigNumberBigNumber(x, y) {
      return x.minus(y);
    },
    "Fraction, Fraction": function FractionFraction(x, y) {
      return x.sub(y);
    },
    "Unit, Unit": function UnitUnit(x, y) {
      if (x.value === null) {
        throw new Error("Parameter x contains a unit with undefined value");
      }
      if (y.value === null) {
        throw new Error("Parameter y contains a unit with undefined value");
      }
      if (!x.equalBase(y)) {
        throw new Error("Units do not match");
      }
      var res = x.clone();
      res.value = this(res.value, y.value);
      res.fixPrefix = false;
      return res;
    },
    "SparseMatrix, SparseMatrix": function SparseMatrixSparseMatrix(x, y) {
      checkEqualDimensions(x, y);
      return algorithm05(x, y, this);
    },
    "SparseMatrix, DenseMatrix": function SparseMatrixDenseMatrix(x, y) {
      checkEqualDimensions(x, y);
      return algorithm03(y, x, this, true);
    },
    "DenseMatrix, SparseMatrix": function DenseMatrixSparseMatrix(x, y) {
      checkEqualDimensions(x, y);
      return algorithm01(x, y, this, false);
    },
    "DenseMatrix, DenseMatrix": function DenseMatrixDenseMatrix(x, y) {
      checkEqualDimensions(x, y);
      return algorithm13(x, y, this);
    },
    "Array, Array": function ArrayArray(x, y) {
      return this(matrix(x), matrix(y)).valueOf();
    },
    "Array, Matrix": function ArrayMatrix(x, y) {
      return this(matrix(x), y);
    },
    "Matrix, Array": function MatrixArray(x, y) {
      return this(x, matrix(y));
    },
    "SparseMatrix, any": function SparseMatrixAny(x, y) {
      return algorithm10(x, unaryMinus(y), addScalar);
    },
    "DenseMatrix, any": function DenseMatrixAny(x, y) {
      return algorithm14(x, y, this);
    },
    "any, SparseMatrix": function anySparseMatrix(x, y) {
      return algorithm10(y, x, this, true);
    },
    "any, DenseMatrix": function anyDenseMatrix(x, y) {
      return algorithm14(y, x, this, true);
    },
    "Array, any": function ArrayAny(x, y) {
      return algorithm14(matrix(x), y, this, false).valueOf();
    },
    "any, Array": function anyArray(x, y) {
      return algorithm14(matrix(y), x, this, true).valueOf();
    }
  });
});
function checkEqualDimensions(x, y) {
  var xsize = x.size();
  var ysize = y.size();
  if (xsize.length !== ysize.length) {
    throw new DimensionError(xsize.length, ysize.length);
  }
}
var name$G = "algorithm07";
var dependencies$G = ["typed", "DenseMatrix"];
var createAlgorithm07 = /* @__PURE__ */ factory(name$G, dependencies$G, (_ref) => {
  var {
    typed,
    DenseMatrix
  } = _ref;
  return function algorithm07(a2, b2, callback) {
    var asize = a2._size;
    var adt = a2._datatype;
    var bsize = b2._size;
    var bdt = b2._datatype;
    if (asize.length !== bsize.length) {
      throw new DimensionError(asize.length, bsize.length);
    }
    if (asize[0] !== bsize[0] || asize[1] !== bsize[1]) {
      throw new RangeError("Dimension mismatch. Matrix A (" + asize + ") must match Matrix B (" + bsize + ")");
    }
    var rows = asize[0];
    var columns = asize[1];
    var dt;
    var zero = 0;
    var cf = callback;
    if (typeof adt === "string" && adt === bdt) {
      dt = adt;
      zero = typed.convert(0, dt);
      cf = typed.find(callback, [dt, dt]);
    }
    var i, j;
    var cdata = [];
    for (i = 0; i < rows; i++) {
      cdata[i] = [];
    }
    var xa = [];
    var xb = [];
    var wa = [];
    var wb = [];
    for (j = 0; j < columns; j++) {
      var mark = j + 1;
      _scatter(a2, j, wa, xa, mark);
      _scatter(b2, j, wb, xb, mark);
      for (i = 0; i < rows; i++) {
        var va = wa[i] === mark ? xa[i] : zero;
        var vb = wb[i] === mark ? xb[i] : zero;
        cdata[i][j] = cf(va, vb);
      }
    }
    return new DenseMatrix({
      data: cdata,
      size: [rows, columns],
      datatype: dt
    });
  };
  function _scatter(m, j, w, x, mark) {
    var values2 = m._values;
    var index = m._index;
    var ptr = m._ptr;
    for (var k = ptr[j], k1 = ptr[j + 1]; k < k1; k++) {
      var i = index[k];
      w[i] = mark;
      x[i] = values2[k];
    }
  }
});
var name$F = "conj";
var dependencies$F = ["typed"];
var createConj = /* @__PURE__ */ factory(name$F, dependencies$F, (_ref) => {
  var {
    typed
  } = _ref;
  return typed(name$F, {
    number: function number(x) {
      return x;
    },
    BigNumber: function BigNumber(x) {
      return x;
    },
    Complex: function Complex2(x) {
      return x.conjugate();
    },
    "Array | Matrix": function ArrayMatrix(x) {
      return deepMap(x, this);
    }
  });
});
function lruQueue(limit) {
  var size = 0;
  var base = 1;
  var queue = /* @__PURE__ */ Object.create(null);
  var map2 = /* @__PURE__ */ Object.create(null);
  var index = 0;
  var del = function del2(id) {
    var oldIndex = map2[id];
    if (!oldIndex)
      return;
    delete queue[oldIndex];
    delete map2[id];
    --size;
    if (base !== oldIndex)
      return;
    if (!size) {
      index = 0;
      base = 1;
      return;
    }
    while (!hasOwnProperty.call(queue, ++base)) {
      continue;
    }
  };
  limit = Math.abs(limit);
  return {
    hit: function hit(id) {
      var oldIndex = map2[id];
      var nuIndex = ++index;
      queue[nuIndex] = id;
      map2[id] = nuIndex;
      if (!oldIndex) {
        ++size;
        if (size <= limit)
          return void 0;
        id = queue[base];
        del(id);
        return id;
      }
      delete queue[oldIndex];
      if (base !== oldIndex)
        return void 0;
      while (!hasOwnProperty.call(queue, ++base)) {
        continue;
      }
      return void 0;
    },
    delete: del,
    clear: function clear() {
      size = index = 0;
      base = 1;
      queue = /* @__PURE__ */ Object.create(null);
      map2 = /* @__PURE__ */ Object.create(null);
    }
  };
}
function memoize(fn) {
  var {
    hasher: hasher2,
    limit
  } = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
  limit = limit == null ? Number.POSITIVE_INFINITY : limit;
  hasher2 = hasher2 == null ? JSON.stringify : hasher2;
  return function memoize2() {
    if (typeof memoize2.cache !== "object") {
      memoize2.cache = {
        values: /* @__PURE__ */ new Map(),
        lru: lruQueue(limit || Number.POSITIVE_INFINITY)
      };
    }
    var args = [];
    for (var i = 0; i < arguments.length; i++) {
      args[i] = arguments[i];
    }
    var hash = hasher2(args);
    if (memoize2.cache.values.has(hash)) {
      memoize2.cache.lru.hit(hash);
      return memoize2.cache.values.get(hash);
    }
    var newVal = fn.apply(fn, args);
    memoize2.cache.values.set(hash, newVal);
    memoize2.cache.values.delete(memoize2.cache.lru.hit(hash));
    return newVal;
  };
}
var name$E = "identity";
var dependencies$E = ["typed", "config", "matrix", "BigNumber", "DenseMatrix", "SparseMatrix"];
var createIdentity = /* @__PURE__ */ factory(name$E, dependencies$E, (_ref) => {
  var {
    typed,
    config: config2,
    matrix,
    BigNumber,
    DenseMatrix,
    SparseMatrix
  } = _ref;
  return typed(name$E, {
    "": function _() {
      return config2.matrix === "Matrix" ? matrix([]) : [];
    },
    string: function string(format2) {
      return matrix(format2);
    },
    "number | BigNumber": function numberBigNumber(rows) {
      return _identity(rows, rows, config2.matrix === "Matrix" ? "dense" : void 0);
    },
    "number | BigNumber, string": function numberBigNumberString(rows, format2) {
      return _identity(rows, rows, format2);
    },
    "number | BigNumber, number | BigNumber": function numberBigNumberNumberBigNumber(rows, cols) {
      return _identity(rows, cols, config2.matrix === "Matrix" ? "dense" : void 0);
    },
    "number | BigNumber, number | BigNumber, string": function numberBigNumberNumberBigNumberString(rows, cols, format2) {
      return _identity(rows, cols, format2);
    },
    Array: function Array2(size) {
      return _identityVector(size);
    },
    "Array, string": function ArrayString(size, format2) {
      return _identityVector(size, format2);
    },
    Matrix: function Matrix(size) {
      return _identityVector(size.valueOf(), size.storage());
    },
    "Matrix, string": function MatrixString(size, format2) {
      return _identityVector(size.valueOf(), format2);
    }
  });
  function _identityVector(size, format2) {
    switch (size.length) {
      case 0:
        return format2 ? matrix(format2) : [];
      case 1:
        return _identity(size[0], size[0], format2);
      case 2:
        return _identity(size[0], size[1], format2);
      default:
        throw new Error("Vector containing two values expected");
    }
  }
  function _identity(rows, cols, format2) {
    var Big = isBigNumber(rows) || isBigNumber(cols) ? BigNumber : null;
    if (isBigNumber(rows))
      rows = rows.toNumber();
    if (isBigNumber(cols))
      cols = cols.toNumber();
    if (!isInteger(rows) || rows < 1) {
      throw new Error("Parameters in function identity must be positive integers");
    }
    if (!isInteger(cols) || cols < 1) {
      throw new Error("Parameters in function identity must be positive integers");
    }
    var one = Big ? new BigNumber(1) : 1;
    var defaultValue = Big ? new Big(0) : 0;
    var size = [rows, cols];
    if (format2) {
      if (format2 === "sparse") {
        return SparseMatrix.diagonal(size, one, 0, defaultValue);
      }
      if (format2 === "dense") {
        return DenseMatrix.diagonal(size, one, 0, defaultValue);
      }
      throw new TypeError('Unknown matrix type "'.concat(format2, '"'));
    }
    var res = resize([], size, defaultValue);
    var minimum = rows < cols ? rows : cols;
    for (var d = 0; d < minimum; d++) {
      res[d][d] = one;
    }
    return res;
  }
});
function noBignumber() {
  throw new Error('No "bignumber" implementation available');
}
function noFraction() {
  throw new Error('No "fraction" implementation available');
}
function noMatrix() {
  throw new Error('No "matrix" implementation available');
}
function ArgumentsError(fn, count, min2, max2) {
  if (!(this instanceof ArgumentsError)) {
    throw new SyntaxError("Constructor must be called with the new operator");
  }
  this.fn = fn;
  this.count = count;
  this.min = min2;
  this.max = max2;
  this.message = "Wrong number of arguments in function " + fn + " (" + count + " provided, " + min2 + (max2 !== void 0 && max2 !== null ? "-" + max2 : "") + " expected)";
  this.stack = new Error().stack;
}
ArgumentsError.prototype = new Error();
ArgumentsError.prototype.constructor = Error;
ArgumentsError.prototype.name = "ArgumentsError";
ArgumentsError.prototype.isArgumentsError = true;
var name$D = "size";
var dependencies$D = ["typed", "config", "?matrix"];
var createSize = /* @__PURE__ */ factory(name$D, dependencies$D, (_ref) => {
  var {
    typed,
    config: config2,
    matrix
  } = _ref;
  return typed(name$D, {
    Matrix: function Matrix(x) {
      return x.create(x.size());
    },
    Array: arraySize,
    string: function string(x) {
      return config2.matrix === "Array" ? [x.length] : matrix([x.length]);
    },
    "number | Complex | BigNumber | Unit | boolean | null": function numberComplexBigNumberUnitBooleanNull(x) {
      return config2.matrix === "Array" ? [] : matrix ? matrix([]) : noMatrix();
    }
  });
});
function getSafeProperty(object, prop) {
  if (isPlainObject(object) && isSafeProperty(object, prop)) {
    return object[prop];
  }
  if (typeof object[prop] === "function" && isSafeMethod(object, prop)) {
    throw new Error('Cannot access method "' + prop + '" as a property');
  }
  throw new Error('No access to property "' + prop + '"');
}
function setSafeProperty(object, prop, value) {
  if (isPlainObject(object) && isSafeProperty(object, prop)) {
    object[prop] = value;
    return value;
  }
  throw new Error('No access to property "' + prop + '"');
}
function isSafeProperty(object, prop) {
  if (!object || typeof object !== "object") {
    return false;
  }
  if (hasOwnProperty$1(safeNativeProperties, prop)) {
    return true;
  }
  if (prop in Object.prototype) {
    return false;
  }
  if (prop in Function.prototype) {
    return false;
  }
  return true;
}
function validateSafeMethod(object, method) {
  if (!isSafeMethod(object, method)) {
    throw new Error('No access to method "' + method + '"');
  }
}
function isSafeMethod(object, method) {
  if (object === null || object === void 0 || typeof object[method] !== "function") {
    return false;
  }
  if (hasOwnProperty$1(object, method) && Object.getPrototypeOf && method in Object.getPrototypeOf(object)) {
    return false;
  }
  if (hasOwnProperty$1(safeNativeMethods, method)) {
    return true;
  }
  if (method in Object.prototype) {
    return false;
  }
  if (method in Function.prototype) {
    return false;
  }
  return true;
}
function isPlainObject(object) {
  return typeof object === "object" && object && object.constructor === Object;
}
var safeNativeProperties = {
  length: true,
  name: true
};
var safeNativeMethods = {
  toString: true,
  valueOf: true,
  toLocaleString: true
};
var name$C = "subset";
var dependencies$C = ["typed", "matrix"];
var createSubset = /* @__PURE__ */ factory(name$C, dependencies$C, (_ref) => {
  var {
    typed,
    matrix
  } = _ref;
  return typed(name$C, {
    "Array, Index": function ArrayIndex(value, index) {
      var m = matrix(value);
      var subset = m.subset(index);
      return index.isScalar() ? subset : subset.valueOf();
    },
    "Matrix, Index": function MatrixIndex(value, index) {
      return value.subset(index);
    },
    "Object, Index": _getObjectProperty,
    "string, Index": _getSubstring,
    "Array, Index, any": function ArrayIndexAny(value, index, replacement) {
      return matrix(clone$1(value)).subset(index, replacement, void 0).valueOf();
    },
    "Array, Index, any, any": function ArrayIndexAnyAny(value, index, replacement, defaultValue) {
      return matrix(clone$1(value)).subset(index, replacement, defaultValue).valueOf();
    },
    "Matrix, Index, any": function MatrixIndexAny(value, index, replacement) {
      return value.clone().subset(index, replacement);
    },
    "Matrix, Index, any, any": function MatrixIndexAnyAny(value, index, replacement, defaultValue) {
      return value.clone().subset(index, replacement, defaultValue);
    },
    "string, Index, string": _setSubstring,
    "string, Index, string, string": _setSubstring,
    "Object, Index, any": _setObjectProperty
  });
});
function _getSubstring(str, index) {
  if (!isIndex(index)) {
    throw new TypeError("Index expected");
  }
  if (index.size().length !== 1) {
    throw new DimensionError(index.size().length, 1);
  }
  var strLen = str.length;
  validateIndex(index.min()[0], strLen);
  validateIndex(index.max()[0], strLen);
  var range = index.dimension(0);
  var substr = "";
  range.forEach(function(v) {
    substr += str.charAt(v);
  });
  return substr;
}
function _setSubstring(str, index, replacement, defaultValue) {
  if (!index || index.isIndex !== true) {
    throw new TypeError("Index expected");
  }
  if (index.size().length !== 1) {
    throw new DimensionError(index.size().length, 1);
  }
  if (defaultValue !== void 0) {
    if (typeof defaultValue !== "string" || defaultValue.length !== 1) {
      throw new TypeError("Single character expected as defaultValue");
    }
  } else {
    defaultValue = " ";
  }
  var range = index.dimension(0);
  var len = range.size()[0];
  if (len !== replacement.length) {
    throw new DimensionError(range.size()[0], replacement.length);
  }
  var strLen = str.length;
  validateIndex(index.min()[0]);
  validateIndex(index.max()[0]);
  var chars = [];
  for (var i = 0; i < strLen; i++) {
    chars[i] = str.charAt(i);
  }
  range.forEach(function(v, i2) {
    chars[v] = replacement.charAt(i2[0]);
  });
  if (chars.length > strLen) {
    for (var _i = strLen - 1, _len = chars.length; _i < _len; _i++) {
      if (!chars[_i]) {
        chars[_i] = defaultValue;
      }
    }
  }
  return chars.join("");
}
function _getObjectProperty(object, index) {
  if (index.size().length !== 1) {
    throw new DimensionError(index.size(), 1);
  }
  var key = index.dimension(0);
  if (typeof key !== "string") {
    throw new TypeError("String expected as index to retrieve an object property");
  }
  return getSafeProperty(object, key);
}
function _setObjectProperty(object, index, replacement) {
  if (index.size().length !== 1) {
    throw new DimensionError(index.size(), 1);
  }
  var key = index.dimension(0);
  if (typeof key !== "string") {
    throw new TypeError("String expected as index to retrieve an object property");
  }
  var updated = clone$1(object);
  setSafeProperty(updated, key, replacement);
  return updated;
}
var name$B = "zeros";
var dependencies$B = ["typed", "config", "matrix", "BigNumber"];
var createZeros = /* @__PURE__ */ factory(name$B, dependencies$B, (_ref) => {
  var {
    typed,
    config: config2,
    matrix,
    BigNumber
  } = _ref;
  return typed(name$B, {
    "": function _() {
      return config2.matrix === "Array" ? _zeros([]) : _zeros([], "default");
    },
    "...number | BigNumber | string": function numberBigNumberString(size) {
      var last = size[size.length - 1];
      if (typeof last === "string") {
        var format2 = size.pop();
        return _zeros(size, format2);
      } else if (config2.matrix === "Array") {
        return _zeros(size);
      } else {
        return _zeros(size, "default");
      }
    },
    Array: _zeros,
    Matrix: function Matrix(size) {
      var format2 = size.storage();
      return _zeros(size.valueOf(), format2);
    },
    "Array | Matrix, string": function ArrayMatrixString(size, format2) {
      return _zeros(size.valueOf(), format2);
    }
  });
  function _zeros(size, format2) {
    var hasBigNumbers = _normalize(size);
    var defaultValue = hasBigNumbers ? new BigNumber(0) : 0;
    _validate2(size);
    if (format2) {
      var m = matrix(format2);
      if (size.length > 0) {
        return m.resize(size, defaultValue);
      }
      return m;
    } else {
      var arr = [];
      if (size.length > 0) {
        return resize(arr, size, defaultValue);
      }
      return arr;
    }
  }
  function _normalize(size) {
    var hasBigNumbers = false;
    size.forEach(function(value, index, arr) {
      if (isBigNumber(value)) {
        hasBigNumbers = true;
        arr[index] = value.toNumber();
      }
    });
    return hasBigNumbers;
  }
  function _validate2(size) {
    size.forEach(function(value) {
      if (typeof value !== "number" || !isInteger(value) || value < 0) {
        throw new Error("Parameters in function zeros must be positive integers");
      }
    });
  }
});
var name$A = "format";
var dependencies$A = ["typed"];
var createFormat = /* @__PURE__ */ factory(name$A, dependencies$A, (_ref) => {
  var {
    typed
  } = _ref;
  return typed(name$A, {
    any: format,
    "any, Object | function | number": format
  });
});
var name$z = "numeric";
var dependencies$z = ["number", "?bignumber", "?fraction"];
var createNumeric = /* @__PURE__ */ factory(name$z, dependencies$z, (_ref) => {
  var {
    number: _number,
    bignumber,
    fraction: fraction2
  } = _ref;
  var validInputTypes = {
    string: true,
    number: true,
    BigNumber: true,
    Fraction: true
  };
  var validOutputTypes = {
    number: (x) => _number(x),
    BigNumber: bignumber ? (x) => bignumber(x) : noBignumber,
    Fraction: fraction2 ? (x) => fraction2(x) : noFraction
  };
  return function numeric2(value, outputType) {
    var inputType = typeOf(value);
    if (!(inputType in validInputTypes)) {
      throw new TypeError("Cannot convert " + value + ' of type "' + inputType + '"; valid input types are ' + Object.keys(validInputTypes).join(", "));
    }
    if (!(outputType in validOutputTypes)) {
      throw new TypeError("Cannot convert " + value + ' to type "' + outputType + '"; valid output types are ' + Object.keys(validOutputTypes).join(", "));
    }
    if (outputType === inputType) {
      return value;
    } else {
      return validOutputTypes[outputType](value);
    }
  };
});
var name$y = "divideScalar";
var dependencies$y = ["typed", "numeric"];
var createDivideScalar = /* @__PURE__ */ factory(name$y, dependencies$y, (_ref) => {
  var {
    typed,
    numeric: numeric2
  } = _ref;
  return typed(name$y, {
    "number, number": function numberNumber2(x, y) {
      return x / y;
    },
    "Complex, Complex": function ComplexComplex(x, y) {
      return x.div(y);
    },
    "BigNumber, BigNumber": function BigNumberBigNumber(x, y) {
      return x.div(y);
    },
    "Fraction, Fraction": function FractionFraction(x, y) {
      return x.div(y);
    },
    "Unit, number | Fraction | BigNumber": function UnitNumberFractionBigNumber(x, y) {
      var res = x.clone();
      var one = numeric2(1, typeOf(y));
      res.value = this(res.value === null ? res._normalize(one) : res.value, y);
      return res;
    },
    "number | Fraction | BigNumber, Unit": function numberFractionBigNumberUnit(x, y) {
      var res = y.clone();
      res = res.pow(-1);
      var one = numeric2(1, typeOf(x));
      res.value = this(x, y.value === null ? y._normalize(one) : y.value);
      return res;
    },
    "Unit, Unit": function UnitUnit(x, y) {
      return x.divide(y);
    }
  });
});
var name$x = "pow";
var dependencies$x = ["typed", "config", "identity", "multiply", "matrix", "fraction", "number", "Complex"];
var createPow = /* @__PURE__ */ factory(name$x, dependencies$x, (_ref) => {
  var {
    typed,
    config: config2,
    identity,
    multiply,
    matrix,
    number,
    fraction: fraction2,
    Complex: Complex2
  } = _ref;
  return typed(name$x, {
    "number, number": _pow,
    "Complex, Complex": function ComplexComplex(x, y) {
      return x.pow(y);
    },
    "BigNumber, BigNumber": function BigNumberBigNumber(x, y) {
      if (y.isInteger() || x >= 0 || config2.predictable) {
        return x.pow(y);
      } else {
        return new Complex2(x.toNumber(), 0).pow(y.toNumber(), 0);
      }
    },
    "Fraction, Fraction": function FractionFraction(x, y) {
      if (y.d !== 1) {
        if (config2.predictable) {
          throw new Error("Function pow does not support non-integer exponents for fractions.");
        } else {
          return _pow(x.valueOf(), y.valueOf());
        }
      } else {
        return x.pow(y);
      }
    },
    "Array, number": _powArray,
    "Array, BigNumber": function ArrayBigNumber(x, y) {
      return _powArray(x, y.toNumber());
    },
    "Matrix, number": _powMatrix,
    "Matrix, BigNumber": function MatrixBigNumber(x, y) {
      return _powMatrix(x, y.toNumber());
    },
    "Unit, number | BigNumber": function UnitNumberBigNumber(x, y) {
      return x.pow(y);
    }
  });
  function _pow(x, y) {
    if (config2.predictable && !isInteger(y) && x < 0) {
      try {
        var yFrac = fraction2(y);
        var yNum = number(yFrac);
        if (y === yNum || Math.abs((y - yNum) / y) < 1e-14) {
          if (yFrac.d % 2 === 1) {
            return (yFrac.n % 2 === 0 ? 1 : -1) * Math.pow(-x, y);
          }
        }
      } catch (ex) {
      }
    }
    if (config2.predictable && (x < -1 && y === Infinity || x > -1 && x < 0 && y === -Infinity)) {
      return NaN;
    }
    if (isInteger(y) || x >= 0 || config2.predictable) {
      return powNumber(x, y);
    } else {
      if (x * x < 1 && y === Infinity || x * x > 1 && y === -Infinity) {
        return 0;
      }
      return new Complex2(x, 0).pow(y, 0);
    }
  }
  function _powArray(x, y) {
    if (!isInteger(y) || y < 0) {
      throw new TypeError("For A^b, b must be a positive integer (value is " + y + ")");
    }
    var s = arraySize(x);
    if (s.length !== 2) {
      throw new Error("For A^b, A must be 2 dimensional (A has " + s.length + " dimensions)");
    }
    if (s[0] !== s[1]) {
      throw new Error("For A^b, A must be square (size is " + s[0] + "x" + s[1] + ")");
    }
    var res = identity(s[0]).valueOf();
    var px = x;
    while (y >= 1) {
      if ((y & 1) === 1) {
        res = multiply(px, res);
      }
      y >>= 1;
      px = multiply(px, px);
    }
    return res;
  }
  function _powMatrix(x, y) {
    return matrix(_powArray(x.valueOf(), y));
  }
});
function ownKeys$1(object, enumerableOnly) {
  var keys = Object.keys(object);
  if (Object.getOwnPropertySymbols) {
    var symbols = Object.getOwnPropertySymbols(object);
    if (enumerableOnly)
      symbols = symbols.filter(function(sym) {
        return Object.getOwnPropertyDescriptor(object, sym).enumerable;
      });
    keys.push.apply(keys, symbols);
  }
  return keys;
}
function _objectSpread$1(target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i] != null ? arguments[i] : {};
    if (i % 2) {
      ownKeys$1(Object(source), true).forEach(function(key) {
        _defineProperty$1(target, key, source[key]);
      });
    } else if (Object.getOwnPropertyDescriptors) {
      Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
    } else {
      ownKeys$1(Object(source)).forEach(function(key) {
        Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
      });
    }
  }
  return target;
}
function _defineProperty$1(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, { value, enumerable: true, configurable: true, writable: true });
  } else {
    obj[key] = value;
  }
  return obj;
}
var NO_INT = "Number of decimals in function round must be an integer";
var name$w = "round";
var dependencies$w = ["typed", "matrix", "equalScalar", "zeros", "BigNumber", "DenseMatrix"];
var createRound = /* @__PURE__ */ factory(name$w, dependencies$w, (_ref) => {
  var {
    typed,
    matrix,
    equalScalar,
    zeros: zeros2,
    BigNumber,
    DenseMatrix
  } = _ref;
  var algorithm11 = createAlgorithm11({
    typed,
    equalScalar
  });
  var algorithm12 = createAlgorithm12({
    typed,
    DenseMatrix
  });
  var algorithm14 = createAlgorithm14({
    typed
  });
  return typed(name$w, _objectSpread$1(_objectSpread$1({}, roundNumberSignatures), {}, {
    Complex: function Complex2(x) {
      return x.round();
    },
    "Complex, number": function ComplexNumber(x, n) {
      if (n % 1) {
        throw new TypeError(NO_INT);
      }
      return x.round(n);
    },
    "Complex, BigNumber": function ComplexBigNumber(x, n) {
      if (!n.isInteger()) {
        throw new TypeError(NO_INT);
      }
      var _n = n.toNumber();
      return x.round(_n);
    },
    "number, BigNumber": function numberBigNumber(x, n) {
      if (!n.isInteger()) {
        throw new TypeError(NO_INT);
      }
      return new BigNumber(x).toDecimalPlaces(n.toNumber());
    },
    BigNumber: function BigNumber2(x) {
      return x.toDecimalPlaces(0);
    },
    "BigNumber, BigNumber": function BigNumberBigNumber(x, n) {
      if (!n.isInteger()) {
        throw new TypeError(NO_INT);
      }
      return x.toDecimalPlaces(n.toNumber());
    },
    Fraction: function Fraction2(x) {
      return x.round();
    },
    "Fraction, number": function FractionNumber(x, n) {
      if (n % 1) {
        throw new TypeError(NO_INT);
      }
      return x.round(n);
    },
    "Array | Matrix": function ArrayMatrix(x) {
      return deepMap(x, this);
    },
    "SparseMatrix, number | BigNumber": function SparseMatrixNumberBigNumber(x, y) {
      return algorithm11(x, y, this, false);
    },
    "DenseMatrix, number | BigNumber": function DenseMatrixNumberBigNumber(x, y) {
      return algorithm14(x, y, this, false);
    },
    "number | Complex | BigNumber, SparseMatrix": function numberComplexBigNumberSparseMatrix(x, y) {
      if (equalScalar(x, 0)) {
        return zeros2(y.size(), y.storage());
      }
      return algorithm12(y, x, this, true);
    },
    "number | Complex | BigNumber, DenseMatrix": function numberComplexBigNumberDenseMatrix(x, y) {
      if (equalScalar(x, 0)) {
        return zeros2(y.size(), y.storage());
      }
      return algorithm14(y, x, this, true);
    },
    "Array, number | BigNumber": function ArrayNumberBigNumber(x, y) {
      return algorithm14(matrix(x), y, this, false).valueOf();
    },
    "number | Complex | BigNumber, Array": function numberComplexBigNumberArray(x, y) {
      return algorithm14(matrix(y), x, this, true).valueOf();
    }
  }));
});
var roundNumberSignatures = {
  number: roundNumber,
  "number, number": function numberNumber(x, n) {
    if (!isInteger(n)) {
      throw new TypeError(NO_INT);
    }
    if (n < 0 || n > 15) {
      throw new Error("Number of decimals in function round must be in te range of 0-15");
    }
    return roundNumber(x, n);
  }
};
var name$v = "equal";
var dependencies$v = ["typed", "matrix", "equalScalar", "DenseMatrix"];
var createEqual = /* @__PURE__ */ factory(name$v, dependencies$v, (_ref) => {
  var {
    typed,
    matrix,
    equalScalar,
    DenseMatrix
  } = _ref;
  var algorithm03 = createAlgorithm03({
    typed
  });
  var algorithm07 = createAlgorithm07({
    typed,
    DenseMatrix
  });
  var algorithm12 = createAlgorithm12({
    typed,
    DenseMatrix
  });
  var algorithm13 = createAlgorithm13({
    typed
  });
  var algorithm14 = createAlgorithm14({
    typed
  });
  return typed(name$v, {
    "any, any": function anyAny(x, y) {
      if (x === null) {
        return y === null;
      }
      if (y === null) {
        return x === null;
      }
      if (x === void 0) {
        return y === void 0;
      }
      if (y === void 0) {
        return x === void 0;
      }
      return equalScalar(x, y);
    },
    "SparseMatrix, SparseMatrix": function SparseMatrixSparseMatrix(x, y) {
      return algorithm07(x, y, equalScalar);
    },
    "SparseMatrix, DenseMatrix": function SparseMatrixDenseMatrix(x, y) {
      return algorithm03(y, x, equalScalar, true);
    },
    "DenseMatrix, SparseMatrix": function DenseMatrixSparseMatrix(x, y) {
      return algorithm03(x, y, equalScalar, false);
    },
    "DenseMatrix, DenseMatrix": function DenseMatrixDenseMatrix(x, y) {
      return algorithm13(x, y, equalScalar);
    },
    "Array, Array": function ArrayArray(x, y) {
      return this(matrix(x), matrix(y)).valueOf();
    },
    "Array, Matrix": function ArrayMatrix(x, y) {
      return this(matrix(x), y);
    },
    "Matrix, Array": function MatrixArray(x, y) {
      return this(x, matrix(y));
    },
    "SparseMatrix, any": function SparseMatrixAny(x, y) {
      return algorithm12(x, y, equalScalar, false);
    },
    "DenseMatrix, any": function DenseMatrixAny(x, y) {
      return algorithm14(x, y, equalScalar, false);
    },
    "any, SparseMatrix": function anySparseMatrix(x, y) {
      return algorithm12(y, x, equalScalar, true);
    },
    "any, DenseMatrix": function anyDenseMatrix(x, y) {
      return algorithm14(y, x, equalScalar, true);
    },
    "Array, any": function ArrayAny(x, y) {
      return algorithm14(matrix(x), y, equalScalar, false).valueOf();
    },
    "any, Array": function anyArray(x, y) {
      return algorithm14(matrix(y), x, equalScalar, true).valueOf();
    }
  });
});
factory(name$v, ["typed", "equalScalar"], (_ref2) => {
  var {
    typed,
    equalScalar
  } = _ref2;
  return typed(name$v, {
    "any, any": function anyAny(x, y) {
      if (x === null) {
        return y === null;
      }
      if (y === null) {
        return x === null;
      }
      if (x === void 0) {
        return y === void 0;
      }
      if (y === void 0) {
        return x === void 0;
      }
      return equalScalar(x, y);
    }
  });
});
var name$u = "smaller";
var dependencies$u = ["typed", "config", "matrix", "DenseMatrix"];
var createSmaller = /* @__PURE__ */ factory(name$u, dependencies$u, (_ref) => {
  var {
    typed,
    config: config2,
    matrix,
    DenseMatrix
  } = _ref;
  var algorithm03 = createAlgorithm03({
    typed
  });
  var algorithm07 = createAlgorithm07({
    typed,
    DenseMatrix
  });
  var algorithm12 = createAlgorithm12({
    typed,
    DenseMatrix
  });
  var algorithm13 = createAlgorithm13({
    typed
  });
  var algorithm14 = createAlgorithm14({
    typed
  });
  return typed(name$u, {
    "boolean, boolean": function booleanBoolean(x, y) {
      return x < y;
    },
    "number, number": function numberNumber2(x, y) {
      return x < y && !nearlyEqual$1(x, y, config2.epsilon);
    },
    "BigNumber, BigNumber": function BigNumberBigNumber(x, y) {
      return x.lt(y) && !nearlyEqual(x, y, config2.epsilon);
    },
    "Fraction, Fraction": function FractionFraction(x, y) {
      return x.compare(y) === -1;
    },
    "Complex, Complex": function ComplexComplex(x, y) {
      throw new TypeError("No ordering relation is defined for complex numbers");
    },
    "Unit, Unit": function UnitUnit(x, y) {
      if (!x.equalBase(y)) {
        throw new Error("Cannot compare units with different base");
      }
      return this(x.value, y.value);
    },
    "SparseMatrix, SparseMatrix": function SparseMatrixSparseMatrix(x, y) {
      return algorithm07(x, y, this);
    },
    "SparseMatrix, DenseMatrix": function SparseMatrixDenseMatrix(x, y) {
      return algorithm03(y, x, this, true);
    },
    "DenseMatrix, SparseMatrix": function DenseMatrixSparseMatrix(x, y) {
      return algorithm03(x, y, this, false);
    },
    "DenseMatrix, DenseMatrix": function DenseMatrixDenseMatrix(x, y) {
      return algorithm13(x, y, this);
    },
    "Array, Array": function ArrayArray(x, y) {
      return this(matrix(x), matrix(y)).valueOf();
    },
    "Array, Matrix": function ArrayMatrix(x, y) {
      return this(matrix(x), y);
    },
    "Matrix, Array": function MatrixArray(x, y) {
      return this(x, matrix(y));
    },
    "SparseMatrix, any": function SparseMatrixAny(x, y) {
      return algorithm12(x, y, this, false);
    },
    "DenseMatrix, any": function DenseMatrixAny(x, y) {
      return algorithm14(x, y, this, false);
    },
    "any, SparseMatrix": function anySparseMatrix(x, y) {
      return algorithm12(y, x, this, true);
    },
    "any, DenseMatrix": function anyDenseMatrix(x, y) {
      return algorithm14(y, x, this, true);
    },
    "Array, any": function ArrayAny(x, y) {
      return algorithm14(matrix(x), y, this, false).valueOf();
    },
    "any, Array": function anyArray(x, y) {
      return algorithm14(matrix(y), x, this, true).valueOf();
    }
  });
});
var name$t = "larger";
var dependencies$t = ["typed", "config", "matrix", "DenseMatrix"];
var createLarger = /* @__PURE__ */ factory(name$t, dependencies$t, (_ref) => {
  var {
    typed,
    config: config2,
    matrix,
    DenseMatrix
  } = _ref;
  var algorithm03 = createAlgorithm03({
    typed
  });
  var algorithm07 = createAlgorithm07({
    typed,
    DenseMatrix
  });
  var algorithm12 = createAlgorithm12({
    typed,
    DenseMatrix
  });
  var algorithm13 = createAlgorithm13({
    typed
  });
  var algorithm14 = createAlgorithm14({
    typed
  });
  return typed(name$t, {
    "boolean, boolean": function booleanBoolean(x, y) {
      return x > y;
    },
    "number, number": function numberNumber2(x, y) {
      return x > y && !nearlyEqual$1(x, y, config2.epsilon);
    },
    "BigNumber, BigNumber": function BigNumberBigNumber(x, y) {
      return x.gt(y) && !nearlyEqual(x, y, config2.epsilon);
    },
    "Fraction, Fraction": function FractionFraction(x, y) {
      return x.compare(y) === 1;
    },
    "Complex, Complex": function ComplexComplex() {
      throw new TypeError("No ordering relation is defined for complex numbers");
    },
    "Unit, Unit": function UnitUnit(x, y) {
      if (!x.equalBase(y)) {
        throw new Error("Cannot compare units with different base");
      }
      return this(x.value, y.value);
    },
    "SparseMatrix, SparseMatrix": function SparseMatrixSparseMatrix(x, y) {
      return algorithm07(x, y, this);
    },
    "SparseMatrix, DenseMatrix": function SparseMatrixDenseMatrix(x, y) {
      return algorithm03(y, x, this, true);
    },
    "DenseMatrix, SparseMatrix": function DenseMatrixSparseMatrix(x, y) {
      return algorithm03(x, y, this, false);
    },
    "DenseMatrix, DenseMatrix": function DenseMatrixDenseMatrix(x, y) {
      return algorithm13(x, y, this);
    },
    "Array, Array": function ArrayArray(x, y) {
      return this(matrix(x), matrix(y)).valueOf();
    },
    "Array, Matrix": function ArrayMatrix(x, y) {
      return this(matrix(x), y);
    },
    "Matrix, Array": function MatrixArray(x, y) {
      return this(x, matrix(y));
    },
    "SparseMatrix, any": function SparseMatrixAny(x, y) {
      return algorithm12(x, y, this, false);
    },
    "DenseMatrix, any": function DenseMatrixAny(x, y) {
      return algorithm14(x, y, this, false);
    },
    "any, SparseMatrix": function anySparseMatrix(x, y) {
      return algorithm12(y, x, this, true);
    },
    "any, DenseMatrix": function anyDenseMatrix(x, y) {
      return algorithm14(y, x, this, true);
    },
    "Array, any": function ArrayAny(x, y) {
      return algorithm14(matrix(x), y, this, false).valueOf();
    },
    "any, Array": function anyArray(x, y) {
      return algorithm14(matrix(y), x, this, true).valueOf();
    }
  });
});
var name$s = "FibonacciHeap";
var dependencies$s = ["smaller", "larger"];
var createFibonacciHeapClass = /* @__PURE__ */ factory(name$s, dependencies$s, (_ref) => {
  var {
    smaller,
    larger
  } = _ref;
  var oneOverLogPhi = 1 / Math.log((1 + Math.sqrt(5)) / 2);
  function FibonacciHeap() {
    if (!(this instanceof FibonacciHeap)) {
      throw new SyntaxError("Constructor must be called with the new operator");
    }
    this._minimum = null;
    this._size = 0;
  }
  FibonacciHeap.prototype.type = "FibonacciHeap";
  FibonacciHeap.prototype.isFibonacciHeap = true;
  FibonacciHeap.prototype.insert = function(key, value) {
    var node = {
      key,
      value,
      degree: 0
    };
    if (this._minimum) {
      var minimum = this._minimum;
      node.left = minimum;
      node.right = minimum.right;
      minimum.right = node;
      node.right.left = node;
      if (smaller(key, minimum.key)) {
        this._minimum = node;
      }
    } else {
      node.left = node;
      node.right = node;
      this._minimum = node;
    }
    this._size++;
    return node;
  };
  FibonacciHeap.prototype.size = function() {
    return this._size;
  };
  FibonacciHeap.prototype.clear = function() {
    this._minimum = null;
    this._size = 0;
  };
  FibonacciHeap.prototype.isEmpty = function() {
    return this._size === 0;
  };
  FibonacciHeap.prototype.extractMinimum = function() {
    var node = this._minimum;
    if (node === null) {
      return node;
    }
    var minimum = this._minimum;
    var numberOfChildren = node.degree;
    var x = node.child;
    while (numberOfChildren > 0) {
      var tempRight = x.right;
      x.left.right = x.right;
      x.right.left = x.left;
      x.left = minimum;
      x.right = minimum.right;
      minimum.right = x;
      x.right.left = x;
      x.parent = null;
      x = tempRight;
      numberOfChildren--;
    }
    node.left.right = node.right;
    node.right.left = node.left;
    if (node === node.right) {
      minimum = null;
    } else {
      minimum = node.right;
      minimum = _findMinimumNode(minimum, this._size);
    }
    this._size--;
    this._minimum = minimum;
    return node;
  };
  FibonacciHeap.prototype.remove = function(node) {
    this._minimum = _decreaseKey(this._minimum, node, -1);
    this.extractMinimum();
  };
  function _decreaseKey(minimum, node, key) {
    node.key = key;
    var parent = node.parent;
    if (parent && smaller(node.key, parent.key)) {
      _cut(minimum, node, parent);
      _cascadingCut(minimum, parent);
    }
    if (smaller(node.key, minimum.key)) {
      minimum = node;
    }
    return minimum;
  }
  function _cut(minimum, node, parent) {
    node.left.right = node.right;
    node.right.left = node.left;
    parent.degree--;
    if (parent.child === node) {
      parent.child = node.right;
    }
    if (parent.degree === 0) {
      parent.child = null;
    }
    node.left = minimum;
    node.right = minimum.right;
    minimum.right = node;
    node.right.left = node;
    node.parent = null;
    node.mark = false;
  }
  function _cascadingCut(minimum, node) {
    var parent = node.parent;
    if (!parent) {
      return;
    }
    if (!node.mark) {
      node.mark = true;
    } else {
      _cut(minimum, node, parent);
      _cascadingCut(parent);
    }
  }
  var _linkNodes = function _linkNodes2(node, parent) {
    node.left.right = node.right;
    node.right.left = node.left;
    node.parent = parent;
    if (!parent.child) {
      parent.child = node;
      node.right = node;
      node.left = node;
    } else {
      node.left = parent.child;
      node.right = parent.child.right;
      parent.child.right = node;
      node.right.left = node;
    }
    parent.degree++;
    node.mark = false;
  };
  function _findMinimumNode(minimum, size) {
    var arraySize2 = Math.floor(Math.log(size) * oneOverLogPhi) + 1;
    var array = new Array(arraySize2);
    var numRoots = 0;
    var x = minimum;
    if (x) {
      numRoots++;
      x = x.right;
      while (x !== minimum) {
        numRoots++;
        x = x.right;
      }
    }
    var y;
    while (numRoots > 0) {
      var d = x.degree;
      var next = x.right;
      while (true) {
        y = array[d];
        if (!y) {
          break;
        }
        if (larger(x.key, y.key)) {
          var temp = y;
          y = x;
          x = temp;
        }
        _linkNodes(y, x);
        array[d] = null;
        d++;
      }
      array[d] = x;
      x = next;
      numRoots--;
    }
    minimum = null;
    for (var i = 0; i < arraySize2; i++) {
      y = array[i];
      if (!y) {
        continue;
      }
      if (minimum) {
        y.left.right = y.right;
        y.right.left = y.left;
        y.left = minimum;
        y.right = minimum.right;
        minimum.right = y;
        y.right.left = y;
        if (smaller(y.key, minimum.key)) {
          minimum = y;
        }
      } else {
        minimum = y;
      }
    }
    return minimum;
  }
  return FibonacciHeap;
}, {
  isClass: true
});
var name$r = "Spa";
var dependencies$r = ["addScalar", "equalScalar", "FibonacciHeap"];
var createSpaClass = /* @__PURE__ */ factory(name$r, dependencies$r, (_ref) => {
  var {
    addScalar,
    equalScalar,
    FibonacciHeap
  } = _ref;
  function Spa() {
    if (!(this instanceof Spa)) {
      throw new SyntaxError("Constructor must be called with the new operator");
    }
    this._values = [];
    this._heap = new FibonacciHeap();
  }
  Spa.prototype.type = "Spa";
  Spa.prototype.isSpa = true;
  Spa.prototype.set = function(i, v) {
    if (!this._values[i]) {
      var node = this._heap.insert(i, v);
      this._values[i] = node;
    } else {
      this._values[i].value = v;
    }
  };
  Spa.prototype.get = function(i) {
    var node = this._values[i];
    if (node) {
      return node.value;
    }
    return 0;
  };
  Spa.prototype.accumulate = function(i, v) {
    var node = this._values[i];
    if (!node) {
      node = this._heap.insert(i, v);
      this._values[i] = node;
    } else {
      node.value = addScalar(node.value, v);
    }
  };
  Spa.prototype.forEach = function(from, to, callback) {
    var heap = this._heap;
    var values2 = this._values;
    var nodes = [];
    var node = heap.extractMinimum();
    if (node) {
      nodes.push(node);
    }
    while (node && node.key <= to) {
      if (node.key >= from) {
        if (!equalScalar(node.value, 0)) {
          callback(node.key, node.value, this);
        }
      }
      node = heap.extractMinimum();
      if (node) {
        nodes.push(node);
      }
    }
    for (var i = 0; i < nodes.length; i++) {
      var n = nodes[i];
      node = heap.insert(n.key, n.value);
      values2[node.key] = node;
    }
  };
  Spa.prototype.swap = function(i, j) {
    var nodei = this._values[i];
    var nodej = this._values[j];
    if (!nodei && nodej) {
      nodei = this._heap.insert(i, nodej.value);
      this._heap.remove(nodej);
      this._values[i] = nodei;
      this._values[j] = void 0;
    } else if (nodei && !nodej) {
      nodej = this._heap.insert(j, nodei.value);
      this._heap.remove(nodei);
      this._values[j] = nodej;
      this._values[i] = void 0;
    } else if (nodei && nodej) {
      var v = nodei.value;
      nodei.value = nodej.value;
      nodej.value = v;
    }
  };
  return Spa;
}, {
  isClass: true
});
memoize(function(BigNumber) {
  return new BigNumber(1).exp();
}, {
  hasher
});
memoize(function(BigNumber) {
  return new BigNumber(1).plus(new BigNumber(5).sqrt()).div(2);
}, {
  hasher
});
var createBigNumberPi = memoize(function(BigNumber) {
  return BigNumber.acos(-1);
}, {
  hasher
});
memoize(function(BigNumber) {
  return createBigNumberPi(BigNumber).times(2);
}, {
  hasher
});
function hasher(args) {
  return args[0].precision;
}
function _extends$4() {
  _extends$4 = Object.assign || function(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];
      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }
    return target;
  };
  return _extends$4.apply(this, arguments);
}
function ownKeys(object, enumerableOnly) {
  var keys = Object.keys(object);
  if (Object.getOwnPropertySymbols) {
    var symbols = Object.getOwnPropertySymbols(object);
    if (enumerableOnly)
      symbols = symbols.filter(function(sym) {
        return Object.getOwnPropertyDescriptor(object, sym).enumerable;
      });
    keys.push.apply(keys, symbols);
  }
  return keys;
}
function _objectSpread(target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i] != null ? arguments[i] : {};
    if (i % 2) {
      ownKeys(Object(source), true).forEach(function(key) {
        _defineProperty(target, key, source[key]);
      });
    } else if (Object.getOwnPropertyDescriptors) {
      Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
    } else {
      ownKeys(Object(source)).forEach(function(key) {
        Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
      });
    }
  }
  return target;
}
function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, { value, enumerable: true, configurable: true, writable: true });
  } else {
    obj[key] = value;
  }
  return obj;
}
var name$q = "Unit";
var dependencies$q = ["?on", "config", "addScalar", "subtract", "multiplyScalar", "divideScalar", "pow", "abs", "fix", "round", "equal", "isNumeric", "format", "number", "Complex", "BigNumber", "Fraction"];
var createUnitClass = /* @__PURE__ */ factory(name$q, dependencies$q, (_ref) => {
  var {
    on,
    config: config2,
    addScalar,
    subtract,
    multiplyScalar,
    divideScalar,
    pow: pow2,
    abs: abs2,
    fix,
    round: round2,
    equal,
    isNumeric,
    format: format2,
    number,
    Complex: Complex2,
    BigNumber: _BigNumber,
    Fraction: _Fraction
  } = _ref;
  var toNumber = number;
  function Unit(value, name2) {
    if (!(this instanceof Unit)) {
      throw new Error("Constructor must be called with the new operator");
    }
    if (!(value === null || value === void 0 || isNumeric(value) || isComplex(value))) {
      throw new TypeError("First parameter in Unit constructor must be number, BigNumber, Fraction, Complex, or undefined");
    }
    if (name2 !== void 0 && (typeof name2 !== "string" || name2 === "")) {
      throw new TypeError("Second parameter in Unit constructor must be a string");
    }
    if (name2 !== void 0) {
      var u = Unit.parse(name2);
      this.units = u.units;
      this.dimensions = u.dimensions;
    } else {
      this.units = [{
        unit: UNIT_NONE,
        prefix: PREFIXES.NONE,
        power: 0
      }];
      this.dimensions = [];
      for (var i = 0; i < BASE_DIMENSIONS.length; i++) {
        this.dimensions[i] = 0;
      }
    }
    this.value = value !== void 0 && value !== null ? this._normalize(value) : null;
    this.fixPrefix = false;
    this.skipAutomaticSimplification = true;
  }
  Unit.prototype.type = "Unit";
  Unit.prototype.isUnit = true;
  var text, index, c2;
  function skipWhitespace() {
    while (c2 === " " || c2 === "	") {
      next();
    }
  }
  function isDigitDot(c3) {
    return c3 >= "0" && c3 <= "9" || c3 === ".";
  }
  function isDigit(c3) {
    return c3 >= "0" && c3 <= "9";
  }
  function next() {
    index++;
    c2 = text.charAt(index);
  }
  function revert(oldIndex) {
    index = oldIndex;
    c2 = text.charAt(index);
  }
  function parseNumber() {
    var number2 = "";
    var oldIndex = index;
    if (c2 === "+") {
      next();
    } else if (c2 === "-") {
      number2 += c2;
      next();
    }
    if (!isDigitDot(c2)) {
      revert(oldIndex);
      return null;
    }
    if (c2 === ".") {
      number2 += c2;
      next();
      if (!isDigit(c2)) {
        revert(oldIndex);
        return null;
      }
    } else {
      while (isDigit(c2)) {
        number2 += c2;
        next();
      }
      if (c2 === ".") {
        number2 += c2;
        next();
      }
    }
    while (isDigit(c2)) {
      number2 += c2;
      next();
    }
    if (c2 === "E" || c2 === "e") {
      var tentativeNumber = "";
      var tentativeIndex = index;
      tentativeNumber += c2;
      next();
      if (c2 === "+" || c2 === "-") {
        tentativeNumber += c2;
        next();
      }
      if (!isDigit(c2)) {
        revert(tentativeIndex);
        return number2;
      }
      number2 = number2 + tentativeNumber;
      while (isDigit(c2)) {
        number2 += c2;
        next();
      }
    }
    return number2;
  }
  function parseUnit() {
    var unitName = "";
    while (isDigit(c2) || Unit.isValidAlpha(c2)) {
      unitName += c2;
      next();
    }
    var firstC = unitName.charAt(0);
    if (Unit.isValidAlpha(firstC)) {
      return unitName;
    } else {
      return null;
    }
  }
  function parseCharacter(toFind) {
    if (c2 === toFind) {
      next();
      return toFind;
    } else {
      return null;
    }
  }
  Unit.parse = function(str, options) {
    options = options || {};
    text = str;
    index = -1;
    c2 = "";
    if (typeof text !== "string") {
      throw new TypeError("Invalid argument in Unit.parse, string expected");
    }
    var unit2 = new Unit();
    unit2.units = [];
    var powerMultiplierCurrent = 1;
    var expectingUnit = false;
    next();
    skipWhitespace();
    var valueStr = parseNumber();
    var value = null;
    if (valueStr) {
      if (config2.number === "BigNumber") {
        value = new _BigNumber(valueStr);
      } else if (config2.number === "Fraction") {
        try {
          value = new _Fraction(valueStr);
        } catch (err) {
          value = parseFloat(valueStr);
        }
      } else {
        value = parseFloat(valueStr);
      }
      skipWhitespace();
      if (parseCharacter("*")) {
        powerMultiplierCurrent = 1;
        expectingUnit = true;
      } else if (parseCharacter("/")) {
        powerMultiplierCurrent = -1;
        expectingUnit = true;
      }
    }
    var powerMultiplierStack = [];
    var powerMultiplierStackProduct = 1;
    while (true) {
      skipWhitespace();
      while (c2 === "(") {
        powerMultiplierStack.push(powerMultiplierCurrent);
        powerMultiplierStackProduct *= powerMultiplierCurrent;
        powerMultiplierCurrent = 1;
        next();
        skipWhitespace();
      }
      var uStr = void 0;
      if (c2) {
        var oldC = c2;
        uStr = parseUnit();
        if (uStr === null) {
          throw new SyntaxError('Unexpected "' + oldC + '" in "' + text + '" at index ' + index.toString());
        }
      } else {
        break;
      }
      var res = _findUnit(uStr);
      if (res === null) {
        throw new SyntaxError('Unit "' + uStr + '" not found.');
      }
      var power = powerMultiplierCurrent * powerMultiplierStackProduct;
      skipWhitespace();
      if (parseCharacter("^")) {
        skipWhitespace();
        var p = parseNumber();
        if (p === null) {
          throw new SyntaxError('In "' + str + '", "^" must be followed by a floating-point number');
        }
        power *= p;
      }
      unit2.units.push({
        unit: res.unit,
        prefix: res.prefix,
        power
      });
      for (var i = 0; i < BASE_DIMENSIONS.length; i++) {
        unit2.dimensions[i] += (res.unit.dimensions[i] || 0) * power;
      }
      skipWhitespace();
      while (c2 === ")") {
        if (powerMultiplierStack.length === 0) {
          throw new SyntaxError('Unmatched ")" in "' + text + '" at index ' + index.toString());
        }
        powerMultiplierStackProduct /= powerMultiplierStack.pop();
        next();
        skipWhitespace();
      }
      expectingUnit = false;
      if (parseCharacter("*")) {
        powerMultiplierCurrent = 1;
        expectingUnit = true;
      } else if (parseCharacter("/")) {
        powerMultiplierCurrent = -1;
        expectingUnit = true;
      } else {
        powerMultiplierCurrent = 1;
      }
      if (res.unit.base) {
        var baseDim = res.unit.base.key;
        UNIT_SYSTEMS.auto[baseDim] = {
          unit: res.unit,
          prefix: res.prefix
        };
      }
    }
    skipWhitespace();
    if (c2) {
      throw new SyntaxError('Could not parse: "' + str + '"');
    }
    if (expectingUnit) {
      throw new SyntaxError('Trailing characters: "' + str + '"');
    }
    if (powerMultiplierStack.length !== 0) {
      throw new SyntaxError('Unmatched "(" in "' + text + '"');
    }
    if (unit2.units.length === 0 && !options.allowNoUnits) {
      throw new SyntaxError('"' + str + '" contains no units');
    }
    unit2.value = value !== void 0 ? unit2._normalize(value) : null;
    return unit2;
  };
  Unit.prototype.clone = function() {
    var unit2 = new Unit();
    unit2.fixPrefix = this.fixPrefix;
    unit2.skipAutomaticSimplification = this.skipAutomaticSimplification;
    unit2.value = clone$1(this.value);
    unit2.dimensions = this.dimensions.slice(0);
    unit2.units = [];
    for (var i = 0; i < this.units.length; i++) {
      unit2.units[i] = {};
      for (var p in this.units[i]) {
        if (hasOwnProperty$1(this.units[i], p)) {
          unit2.units[i][p] = this.units[i][p];
        }
      }
    }
    return unit2;
  };
  Unit.prototype._isDerived = function() {
    if (this.units.length === 0) {
      return false;
    }
    return this.units.length > 1 || Math.abs(this.units[0].power - 1) > 1e-15;
  };
  Unit.prototype._normalize = function(value) {
    var unitValue, unitOffset, unitPower, unitPrefixValue;
    var convert;
    if (value === null || value === void 0 || this.units.length === 0) {
      return value;
    } else if (this._isDerived()) {
      var res = value;
      convert = Unit._getNumberConverter(typeOf(value));
      for (var i = 0; i < this.units.length; i++) {
        unitValue = convert(this.units[i].unit.value);
        unitPrefixValue = convert(this.units[i].prefix.value);
        unitPower = convert(this.units[i].power);
        res = multiplyScalar(res, pow2(multiplyScalar(unitValue, unitPrefixValue), unitPower));
      }
      return res;
    } else {
      convert = Unit._getNumberConverter(typeOf(value));
      unitValue = convert(this.units[0].unit.value);
      unitOffset = convert(this.units[0].unit.offset);
      unitPrefixValue = convert(this.units[0].prefix.value);
      return multiplyScalar(addScalar(value, unitOffset), multiplyScalar(unitValue, unitPrefixValue));
    }
  };
  Unit.prototype._denormalize = function(value, prefixValue) {
    var unitValue, unitOffset, unitPower, unitPrefixValue;
    var convert;
    if (value === null || value === void 0 || this.units.length === 0) {
      return value;
    } else if (this._isDerived()) {
      var res = value;
      convert = Unit._getNumberConverter(typeOf(value));
      for (var i = 0; i < this.units.length; i++) {
        unitValue = convert(this.units[i].unit.value);
        unitPrefixValue = convert(this.units[i].prefix.value);
        unitPower = convert(this.units[i].power);
        res = divideScalar(res, pow2(multiplyScalar(unitValue, unitPrefixValue), unitPower));
      }
      return res;
    } else {
      convert = Unit._getNumberConverter(typeOf(value));
      unitValue = convert(this.units[0].unit.value);
      unitPrefixValue = convert(this.units[0].prefix.value);
      unitOffset = convert(this.units[0].unit.offset);
      if (prefixValue === void 0 || prefixValue === null) {
        return subtract(divideScalar(divideScalar(value, unitValue), unitPrefixValue), unitOffset);
      } else {
        return subtract(divideScalar(divideScalar(value, unitValue), prefixValue), unitOffset);
      }
    }
  };
  var _findUnit = memoize((str) => {
    if (hasOwnProperty$1(UNITS, str)) {
      var unit2 = UNITS[str];
      var prefix = unit2.prefixes[""];
      return {
        unit: unit2,
        prefix
      };
    }
    for (var _name in UNITS) {
      if (hasOwnProperty$1(UNITS, _name)) {
        if (endsWith(str, _name)) {
          var _unit = UNITS[_name];
          var prefixLen = str.length - _name.length;
          var prefixName = str.substring(0, prefixLen);
          var _prefix = hasOwnProperty$1(_unit.prefixes, prefixName) ? _unit.prefixes[prefixName] : void 0;
          if (_prefix !== void 0) {
            return {
              unit: _unit,
              prefix: _prefix
            };
          }
        }
      }
    }
    return null;
  }, {
    hasher: (args) => args[0],
    limit: 100
  });
  Unit.isValuelessUnit = function(name2) {
    return _findUnit(name2) !== null;
  };
  Unit.prototype.hasBase = function(base) {
    if (typeof base === "string") {
      base = BASE_UNITS[base];
    }
    if (!base) {
      return false;
    }
    for (var i = 0; i < BASE_DIMENSIONS.length; i++) {
      if (Math.abs((this.dimensions[i] || 0) - (base.dimensions[i] || 0)) > 1e-12) {
        return false;
      }
    }
    return true;
  };
  Unit.prototype.equalBase = function(other) {
    for (var i = 0; i < BASE_DIMENSIONS.length; i++) {
      if (Math.abs((this.dimensions[i] || 0) - (other.dimensions[i] || 0)) > 1e-12) {
        return false;
      }
    }
    return true;
  };
  Unit.prototype.equals = function(other) {
    return this.equalBase(other) && equal(this.value, other.value);
  };
  Unit.prototype.multiply = function(other) {
    var res = this.clone();
    for (var i = 0; i < BASE_DIMENSIONS.length; i++) {
      res.dimensions[i] = (this.dimensions[i] || 0) + (other.dimensions[i] || 0);
    }
    for (var _i = 0; _i < other.units.length; _i++) {
      var inverted = _objectSpread({}, other.units[_i]);
      res.units.push(inverted);
    }
    if (this.value !== null || other.value !== null) {
      var valThis = this.value === null ? this._normalize(1) : this.value;
      var valOther = other.value === null ? other._normalize(1) : other.value;
      res.value = multiplyScalar(valThis, valOther);
    } else {
      res.value = null;
    }
    res.skipAutomaticSimplification = false;
    return getNumericIfUnitless(res);
  };
  Unit.prototype.divide = function(other) {
    var res = this.clone();
    for (var i = 0; i < BASE_DIMENSIONS.length; i++) {
      res.dimensions[i] = (this.dimensions[i] || 0) - (other.dimensions[i] || 0);
    }
    for (var _i2 = 0; _i2 < other.units.length; _i2++) {
      var inverted = _objectSpread(_objectSpread({}, other.units[_i2]), {}, {
        power: -other.units[_i2].power
      });
      res.units.push(inverted);
    }
    if (this.value !== null || other.value !== null) {
      var valThis = this.value === null ? this._normalize(1) : this.value;
      var valOther = other.value === null ? other._normalize(1) : other.value;
      res.value = divideScalar(valThis, valOther);
    } else {
      res.value = null;
    }
    res.skipAutomaticSimplification = false;
    return getNumericIfUnitless(res);
  };
  Unit.prototype.pow = function(p) {
    var res = this.clone();
    for (var i = 0; i < BASE_DIMENSIONS.length; i++) {
      res.dimensions[i] = (this.dimensions[i] || 0) * p;
    }
    for (var _i3 = 0; _i3 < res.units.length; _i3++) {
      res.units[_i3].power *= p;
    }
    if (res.value !== null) {
      res.value = pow2(res.value, p);
    } else {
      res.value = null;
    }
    res.skipAutomaticSimplification = false;
    return getNumericIfUnitless(res);
  };
  function getNumericIfUnitless(unit2) {
    if (unit2.equalBase(BASE_UNITS.NONE) && unit2.value !== null && !config2.predictable) {
      return unit2.value;
    } else {
      return unit2;
    }
  }
  Unit.prototype.abs = function() {
    var ret = this.clone();
    ret.value = ret.value !== null ? abs2(ret.value) : null;
    for (var i in ret.units) {
      if (ret.units[i].unit.name === "VA" || ret.units[i].unit.name === "VAR") {
        ret.units[i].unit = UNITS.W;
      }
    }
    return ret;
  };
  Unit.prototype.to = function(valuelessUnit) {
    var other;
    var value = this.value === null ? this._normalize(1) : this.value;
    if (typeof valuelessUnit === "string") {
      other = Unit.parse(valuelessUnit);
      if (!this.equalBase(other)) {
        throw new Error("Units do not match ('".concat(other.toString(), "' != '").concat(this.toString(), "')"));
      }
      if (other.value !== null) {
        throw new Error("Cannot convert to a unit with a value");
      }
      other.value = clone$1(value);
      other.fixPrefix = true;
      other.skipAutomaticSimplification = true;
      return other;
    } else if (isUnit(valuelessUnit)) {
      if (!this.equalBase(valuelessUnit)) {
        throw new Error("Units do not match ('".concat(valuelessUnit.toString(), "' != '").concat(this.toString(), "')"));
      }
      if (valuelessUnit.value !== null) {
        throw new Error("Cannot convert to a unit with a value");
      }
      other = valuelessUnit.clone();
      other.value = clone$1(value);
      other.fixPrefix = true;
      other.skipAutomaticSimplification = true;
      return other;
    } else {
      throw new Error("String or Unit expected as parameter");
    }
  };
  Unit.prototype.toNumber = function(valuelessUnit) {
    return toNumber(this.toNumeric(valuelessUnit));
  };
  Unit.prototype.toNumeric = function(valuelessUnit) {
    var other;
    if (valuelessUnit) {
      other = this.to(valuelessUnit);
    } else {
      other = this.clone();
    }
    if (other._isDerived() || other.units.length === 0) {
      return other._denormalize(other.value);
    } else {
      return other._denormalize(other.value, other.units[0].prefix.value);
    }
  };
  Unit.prototype.toString = function() {
    return this.format();
  };
  Unit.prototype.toJSON = function() {
    return {
      mathjs: "Unit",
      value: this._denormalize(this.value),
      unit: this.formatUnits(),
      fixPrefix: this.fixPrefix
    };
  };
  Unit.fromJSON = function(json) {
    var unit2 = new Unit(json.value, json.unit);
    unit2.fixPrefix = json.fixPrefix || false;
    return unit2;
  };
  Unit.prototype.valueOf = Unit.prototype.toString;
  Unit.prototype.simplify = function() {
    var ret = this.clone();
    var proposedUnitList = [];
    var matchingBase;
    for (var key2 in currentUnitSystem) {
      if (hasOwnProperty$1(currentUnitSystem, key2)) {
        if (ret.hasBase(BASE_UNITS[key2])) {
          matchingBase = key2;
          break;
        }
      }
    }
    if (matchingBase === "NONE") {
      ret.units = [];
    } else {
      var matchingUnit;
      if (matchingBase) {
        if (hasOwnProperty$1(currentUnitSystem, matchingBase)) {
          matchingUnit = currentUnitSystem[matchingBase];
        }
      }
      if (matchingUnit) {
        ret.units = [{
          unit: matchingUnit.unit,
          prefix: matchingUnit.prefix,
          power: 1
        }];
      } else {
        var missingBaseDim = false;
        for (var i = 0; i < BASE_DIMENSIONS.length; i++) {
          var baseDim = BASE_DIMENSIONS[i];
          if (Math.abs(ret.dimensions[i] || 0) > 1e-12) {
            if (hasOwnProperty$1(currentUnitSystem, baseDim)) {
              proposedUnitList.push({
                unit: currentUnitSystem[baseDim].unit,
                prefix: currentUnitSystem[baseDim].prefix,
                power: ret.dimensions[i] || 0
              });
            } else {
              missingBaseDim = true;
            }
          }
        }
        if (proposedUnitList.length < ret.units.length && !missingBaseDim) {
          ret.units = proposedUnitList;
        }
      }
    }
    return ret;
  };
  Unit.prototype.toSI = function() {
    var ret = this.clone();
    var proposedUnitList = [];
    for (var i = 0; i < BASE_DIMENSIONS.length; i++) {
      var baseDim = BASE_DIMENSIONS[i];
      if (Math.abs(ret.dimensions[i] || 0) > 1e-12) {
        if (hasOwnProperty$1(UNIT_SYSTEMS.si, baseDim)) {
          proposedUnitList.push({
            unit: UNIT_SYSTEMS.si[baseDim].unit,
            prefix: UNIT_SYSTEMS.si[baseDim].prefix,
            power: ret.dimensions[i] || 0
          });
        } else {
          throw new Error("Cannot express custom unit " + baseDim + " in SI units");
        }
      }
    }
    ret.units = proposedUnitList;
    ret.fixPrefix = true;
    ret.skipAutomaticSimplification = true;
    return ret;
  };
  Unit.prototype.formatUnits = function() {
    var strNum = "";
    var strDen = "";
    var nNum = 0;
    var nDen = 0;
    for (var i = 0; i < this.units.length; i++) {
      if (this.units[i].power > 0) {
        nNum++;
        strNum += " " + this.units[i].prefix.name + this.units[i].unit.name;
        if (Math.abs(this.units[i].power - 1) > 1e-15) {
          strNum += "^" + this.units[i].power;
        }
      } else if (this.units[i].power < 0) {
        nDen++;
      }
    }
    if (nDen > 0) {
      for (var _i4 = 0; _i4 < this.units.length; _i4++) {
        if (this.units[_i4].power < 0) {
          if (nNum > 0) {
            strDen += " " + this.units[_i4].prefix.name + this.units[_i4].unit.name;
            if (Math.abs(this.units[_i4].power + 1) > 1e-15) {
              strDen += "^" + -this.units[_i4].power;
            }
          } else {
            strDen += " " + this.units[_i4].prefix.name + this.units[_i4].unit.name;
            strDen += "^" + this.units[_i4].power;
          }
        }
      }
    }
    strNum = strNum.substr(1);
    strDen = strDen.substr(1);
    if (nNum > 1 && nDen > 0) {
      strNum = "(" + strNum + ")";
    }
    if (nDen > 1 && nNum > 0) {
      strDen = "(" + strDen + ")";
    }
    var str = strNum;
    if (nNum > 0 && nDen > 0) {
      str += " / ";
    }
    str += strDen;
    return str;
  };
  Unit.prototype.format = function(options) {
    var simp = this.skipAutomaticSimplification || this.value === null ? this.clone() : this.simplify();
    var isImaginary = false;
    if (typeof simp.value !== "undefined" && simp.value !== null && isComplex(simp.value)) {
      isImaginary = Math.abs(simp.value.re) < 1e-14;
    }
    for (var i in simp.units) {
      if (hasOwnProperty$1(simp.units, i)) {
        if (simp.units[i].unit) {
          if (simp.units[i].unit.name === "VA" && isImaginary) {
            simp.units[i].unit = UNITS.VAR;
          } else if (simp.units[i].unit.name === "VAR" && !isImaginary) {
            simp.units[i].unit = UNITS.VA;
          }
        }
      }
    }
    if (simp.units.length === 1 && !simp.fixPrefix) {
      if (Math.abs(simp.units[0].power - Math.round(simp.units[0].power)) < 1e-14) {
        simp.units[0].prefix = simp._bestPrefix();
      }
    }
    var value = simp._denormalize(simp.value);
    var str = simp.value !== null ? format2(value, options || {}) : "";
    var unitStr = simp.formatUnits();
    if (simp.value && isComplex(simp.value)) {
      str = "(" + str + ")";
    }
    if (unitStr.length > 0 && str.length > 0) {
      str += " ";
    }
    str += unitStr;
    return str;
  };
  Unit.prototype._bestPrefix = function() {
    if (this.units.length !== 1) {
      throw new Error("Can only compute the best prefix for single units with integer powers, like kg, s^2, N^-1, and so forth!");
    }
    if (Math.abs(this.units[0].power - Math.round(this.units[0].power)) >= 1e-14) {
      throw new Error("Can only compute the best prefix for single units with integer powers, like kg, s^2, N^-1, and so forth!");
    }
    var absValue = this.value !== null ? abs2(this.value) : 0;
    var absUnitValue = abs2(this.units[0].unit.value);
    var bestPrefix = this.units[0].prefix;
    if (absValue === 0) {
      return bestPrefix;
    }
    var power = this.units[0].power;
    var bestDiff = Math.log(absValue / Math.pow(bestPrefix.value * absUnitValue, power)) / Math.LN10 - 1.2;
    if (bestDiff > -2.200001 && bestDiff < 1.800001)
      return bestPrefix;
    bestDiff = Math.abs(bestDiff);
    var prefixes = this.units[0].unit.prefixes;
    for (var p in prefixes) {
      if (hasOwnProperty$1(prefixes, p)) {
        var prefix = prefixes[p];
        if (prefix.scientific) {
          var diff = Math.abs(Math.log(absValue / Math.pow(prefix.value * absUnitValue, power)) / Math.LN10 - 1.2);
          if (diff < bestDiff || diff === bestDiff && prefix.name.length < bestPrefix.name.length) {
            bestPrefix = prefix;
            bestDiff = diff;
          }
        }
      }
    }
    return bestPrefix;
  };
  Unit.prototype.splitUnit = function(parts) {
    var x = this.clone();
    var ret = [];
    for (var i = 0; i < parts.length; i++) {
      x = x.to(parts[i]);
      if (i === parts.length - 1)
        break;
      var xNumeric = x.toNumeric();
      var xRounded = round2(xNumeric);
      var xFixed = void 0;
      var isNearlyEqual = equal(xRounded, xNumeric);
      if (isNearlyEqual) {
        xFixed = xRounded;
      } else {
        xFixed = fix(x.toNumeric());
      }
      var y = new Unit(xFixed, parts[i].toString());
      ret.push(y);
      x = subtract(x, y);
    }
    var testSum = 0;
    for (var _i5 = 0; _i5 < ret.length; _i5++) {
      testSum = addScalar(testSum, ret[_i5].value);
    }
    if (equal(testSum, this.value)) {
      x.value = 0;
    }
    ret.push(x);
    return ret;
  };
  var PREFIXES = {
    NONE: {
      "": {
        name: "",
        value: 1,
        scientific: true
      }
    },
    SHORT: {
      "": {
        name: "",
        value: 1,
        scientific: true
      },
      da: {
        name: "da",
        value: 10,
        scientific: false
      },
      h: {
        name: "h",
        value: 100,
        scientific: false
      },
      k: {
        name: "k",
        value: 1e3,
        scientific: true
      },
      M: {
        name: "M",
        value: 1e6,
        scientific: true
      },
      G: {
        name: "G",
        value: 1e9,
        scientific: true
      },
      T: {
        name: "T",
        value: 1e12,
        scientific: true
      },
      P: {
        name: "P",
        value: 1e15,
        scientific: true
      },
      E: {
        name: "E",
        value: 1e18,
        scientific: true
      },
      Z: {
        name: "Z",
        value: 1e21,
        scientific: true
      },
      Y: {
        name: "Y",
        value: 1e24,
        scientific: true
      },
      d: {
        name: "d",
        value: 0.1,
        scientific: false
      },
      c: {
        name: "c",
        value: 0.01,
        scientific: false
      },
      m: {
        name: "m",
        value: 1e-3,
        scientific: true
      },
      u: {
        name: "u",
        value: 1e-6,
        scientific: true
      },
      n: {
        name: "n",
        value: 1e-9,
        scientific: true
      },
      p: {
        name: "p",
        value: 1e-12,
        scientific: true
      },
      f: {
        name: "f",
        value: 1e-15,
        scientific: true
      },
      a: {
        name: "a",
        value: 1e-18,
        scientific: true
      },
      z: {
        name: "z",
        value: 1e-21,
        scientific: true
      },
      y: {
        name: "y",
        value: 1e-24,
        scientific: true
      }
    },
    LONG: {
      "": {
        name: "",
        value: 1,
        scientific: true
      },
      deca: {
        name: "deca",
        value: 10,
        scientific: false
      },
      hecto: {
        name: "hecto",
        value: 100,
        scientific: false
      },
      kilo: {
        name: "kilo",
        value: 1e3,
        scientific: true
      },
      mega: {
        name: "mega",
        value: 1e6,
        scientific: true
      },
      giga: {
        name: "giga",
        value: 1e9,
        scientific: true
      },
      tera: {
        name: "tera",
        value: 1e12,
        scientific: true
      },
      peta: {
        name: "peta",
        value: 1e15,
        scientific: true
      },
      exa: {
        name: "exa",
        value: 1e18,
        scientific: true
      },
      zetta: {
        name: "zetta",
        value: 1e21,
        scientific: true
      },
      yotta: {
        name: "yotta",
        value: 1e24,
        scientific: true
      },
      deci: {
        name: "deci",
        value: 0.1,
        scientific: false
      },
      centi: {
        name: "centi",
        value: 0.01,
        scientific: false
      },
      milli: {
        name: "milli",
        value: 1e-3,
        scientific: true
      },
      micro: {
        name: "micro",
        value: 1e-6,
        scientific: true
      },
      nano: {
        name: "nano",
        value: 1e-9,
        scientific: true
      },
      pico: {
        name: "pico",
        value: 1e-12,
        scientific: true
      },
      femto: {
        name: "femto",
        value: 1e-15,
        scientific: true
      },
      atto: {
        name: "atto",
        value: 1e-18,
        scientific: true
      },
      zepto: {
        name: "zepto",
        value: 1e-21,
        scientific: true
      },
      yocto: {
        name: "yocto",
        value: 1e-24,
        scientific: true
      }
    },
    SQUARED: {
      "": {
        name: "",
        value: 1,
        scientific: true
      },
      da: {
        name: "da",
        value: 100,
        scientific: false
      },
      h: {
        name: "h",
        value: 1e4,
        scientific: false
      },
      k: {
        name: "k",
        value: 1e6,
        scientific: true
      },
      M: {
        name: "M",
        value: 1e12,
        scientific: true
      },
      G: {
        name: "G",
        value: 1e18,
        scientific: true
      },
      T: {
        name: "T",
        value: 1e24,
        scientific: true
      },
      P: {
        name: "P",
        value: 1e30,
        scientific: true
      },
      E: {
        name: "E",
        value: 1e36,
        scientific: true
      },
      Z: {
        name: "Z",
        value: 1e42,
        scientific: true
      },
      Y: {
        name: "Y",
        value: 1e48,
        scientific: true
      },
      d: {
        name: "d",
        value: 0.01,
        scientific: false
      },
      c: {
        name: "c",
        value: 1e-4,
        scientific: false
      },
      m: {
        name: "m",
        value: 1e-6,
        scientific: true
      },
      u: {
        name: "u",
        value: 1e-12,
        scientific: true
      },
      n: {
        name: "n",
        value: 1e-18,
        scientific: true
      },
      p: {
        name: "p",
        value: 1e-24,
        scientific: true
      },
      f: {
        name: "f",
        value: 1e-30,
        scientific: true
      },
      a: {
        name: "a",
        value: 1e-36,
        scientific: true
      },
      z: {
        name: "z",
        value: 1e-42,
        scientific: true
      },
      y: {
        name: "y",
        value: 1e-48,
        scientific: true
      }
    },
    CUBIC: {
      "": {
        name: "",
        value: 1,
        scientific: true
      },
      da: {
        name: "da",
        value: 1e3,
        scientific: false
      },
      h: {
        name: "h",
        value: 1e6,
        scientific: false
      },
      k: {
        name: "k",
        value: 1e9,
        scientific: true
      },
      M: {
        name: "M",
        value: 1e18,
        scientific: true
      },
      G: {
        name: "G",
        value: 1e27,
        scientific: true
      },
      T: {
        name: "T",
        value: 1e36,
        scientific: true
      },
      P: {
        name: "P",
        value: 1e45,
        scientific: true
      },
      E: {
        name: "E",
        value: 1e54,
        scientific: true
      },
      Z: {
        name: "Z",
        value: 1e63,
        scientific: true
      },
      Y: {
        name: "Y",
        value: 1e72,
        scientific: true
      },
      d: {
        name: "d",
        value: 1e-3,
        scientific: false
      },
      c: {
        name: "c",
        value: 1e-6,
        scientific: false
      },
      m: {
        name: "m",
        value: 1e-9,
        scientific: true
      },
      u: {
        name: "u",
        value: 1e-18,
        scientific: true
      },
      n: {
        name: "n",
        value: 1e-27,
        scientific: true
      },
      p: {
        name: "p",
        value: 1e-36,
        scientific: true
      },
      f: {
        name: "f",
        value: 1e-45,
        scientific: true
      },
      a: {
        name: "a",
        value: 1e-54,
        scientific: true
      },
      z: {
        name: "z",
        value: 1e-63,
        scientific: true
      },
      y: {
        name: "y",
        value: 1e-72,
        scientific: true
      }
    },
    BINARY_SHORT_SI: {
      "": {
        name: "",
        value: 1,
        scientific: true
      },
      k: {
        name: "k",
        value: 1e3,
        scientific: true
      },
      M: {
        name: "M",
        value: 1e6,
        scientific: true
      },
      G: {
        name: "G",
        value: 1e9,
        scientific: true
      },
      T: {
        name: "T",
        value: 1e12,
        scientific: true
      },
      P: {
        name: "P",
        value: 1e15,
        scientific: true
      },
      E: {
        name: "E",
        value: 1e18,
        scientific: true
      },
      Z: {
        name: "Z",
        value: 1e21,
        scientific: true
      },
      Y: {
        name: "Y",
        value: 1e24,
        scientific: true
      }
    },
    BINARY_SHORT_IEC: {
      "": {
        name: "",
        value: 1,
        scientific: true
      },
      Ki: {
        name: "Ki",
        value: 1024,
        scientific: true
      },
      Mi: {
        name: "Mi",
        value: Math.pow(1024, 2),
        scientific: true
      },
      Gi: {
        name: "Gi",
        value: Math.pow(1024, 3),
        scientific: true
      },
      Ti: {
        name: "Ti",
        value: Math.pow(1024, 4),
        scientific: true
      },
      Pi: {
        name: "Pi",
        value: Math.pow(1024, 5),
        scientific: true
      },
      Ei: {
        name: "Ei",
        value: Math.pow(1024, 6),
        scientific: true
      },
      Zi: {
        name: "Zi",
        value: Math.pow(1024, 7),
        scientific: true
      },
      Yi: {
        name: "Yi",
        value: Math.pow(1024, 8),
        scientific: true
      }
    },
    BINARY_LONG_SI: {
      "": {
        name: "",
        value: 1,
        scientific: true
      },
      kilo: {
        name: "kilo",
        value: 1e3,
        scientific: true
      },
      mega: {
        name: "mega",
        value: 1e6,
        scientific: true
      },
      giga: {
        name: "giga",
        value: 1e9,
        scientific: true
      },
      tera: {
        name: "tera",
        value: 1e12,
        scientific: true
      },
      peta: {
        name: "peta",
        value: 1e15,
        scientific: true
      },
      exa: {
        name: "exa",
        value: 1e18,
        scientific: true
      },
      zetta: {
        name: "zetta",
        value: 1e21,
        scientific: true
      },
      yotta: {
        name: "yotta",
        value: 1e24,
        scientific: true
      }
    },
    BINARY_LONG_IEC: {
      "": {
        name: "",
        value: 1,
        scientific: true
      },
      kibi: {
        name: "kibi",
        value: 1024,
        scientific: true
      },
      mebi: {
        name: "mebi",
        value: Math.pow(1024, 2),
        scientific: true
      },
      gibi: {
        name: "gibi",
        value: Math.pow(1024, 3),
        scientific: true
      },
      tebi: {
        name: "tebi",
        value: Math.pow(1024, 4),
        scientific: true
      },
      pebi: {
        name: "pebi",
        value: Math.pow(1024, 5),
        scientific: true
      },
      exi: {
        name: "exi",
        value: Math.pow(1024, 6),
        scientific: true
      },
      zebi: {
        name: "zebi",
        value: Math.pow(1024, 7),
        scientific: true
      },
      yobi: {
        name: "yobi",
        value: Math.pow(1024, 8),
        scientific: true
      }
    },
    BTU: {
      "": {
        name: "",
        value: 1,
        scientific: true
      },
      MM: {
        name: "MM",
        value: 1e6,
        scientific: true
      }
    }
  };
  PREFIXES.SHORTLONG = _extends$4({}, PREFIXES.SHORT, PREFIXES.LONG);
  PREFIXES.BINARY_SHORT = _extends$4({}, PREFIXES.BINARY_SHORT_SI, PREFIXES.BINARY_SHORT_IEC);
  PREFIXES.BINARY_LONG = _extends$4({}, PREFIXES.BINARY_LONG_SI, PREFIXES.BINARY_LONG_IEC);
  var BASE_DIMENSIONS = ["MASS", "LENGTH", "TIME", "CURRENT", "TEMPERATURE", "LUMINOUS_INTENSITY", "AMOUNT_OF_SUBSTANCE", "ANGLE", "BIT"];
  var BASE_UNITS = {
    NONE: {
      dimensions: [0, 0, 0, 0, 0, 0, 0, 0, 0]
    },
    MASS: {
      dimensions: [1, 0, 0, 0, 0, 0, 0, 0, 0]
    },
    LENGTH: {
      dimensions: [0, 1, 0, 0, 0, 0, 0, 0, 0]
    },
    TIME: {
      dimensions: [0, 0, 1, 0, 0, 0, 0, 0, 0]
    },
    CURRENT: {
      dimensions: [0, 0, 0, 1, 0, 0, 0, 0, 0]
    },
    TEMPERATURE: {
      dimensions: [0, 0, 0, 0, 1, 0, 0, 0, 0]
    },
    LUMINOUS_INTENSITY: {
      dimensions: [0, 0, 0, 0, 0, 1, 0, 0, 0]
    },
    AMOUNT_OF_SUBSTANCE: {
      dimensions: [0, 0, 0, 0, 0, 0, 1, 0, 0]
    },
    FORCE: {
      dimensions: [1, 1, -2, 0, 0, 0, 0, 0, 0]
    },
    SURFACE: {
      dimensions: [0, 2, 0, 0, 0, 0, 0, 0, 0]
    },
    VOLUME: {
      dimensions: [0, 3, 0, 0, 0, 0, 0, 0, 0]
    },
    ENERGY: {
      dimensions: [1, 2, -2, 0, 0, 0, 0, 0, 0]
    },
    POWER: {
      dimensions: [1, 2, -3, 0, 0, 0, 0, 0, 0]
    },
    PRESSURE: {
      dimensions: [1, -1, -2, 0, 0, 0, 0, 0, 0]
    },
    ELECTRIC_CHARGE: {
      dimensions: [0, 0, 1, 1, 0, 0, 0, 0, 0]
    },
    ELECTRIC_CAPACITANCE: {
      dimensions: [-1, -2, 4, 2, 0, 0, 0, 0, 0]
    },
    ELECTRIC_POTENTIAL: {
      dimensions: [1, 2, -3, -1, 0, 0, 0, 0, 0]
    },
    ELECTRIC_RESISTANCE: {
      dimensions: [1, 2, -3, -2, 0, 0, 0, 0, 0]
    },
    ELECTRIC_INDUCTANCE: {
      dimensions: [1, 2, -2, -2, 0, 0, 0, 0, 0]
    },
    ELECTRIC_CONDUCTANCE: {
      dimensions: [-1, -2, 3, 2, 0, 0, 0, 0, 0]
    },
    MAGNETIC_FLUX: {
      dimensions: [1, 2, -2, -1, 0, 0, 0, 0, 0]
    },
    MAGNETIC_FLUX_DENSITY: {
      dimensions: [1, 0, -2, -1, 0, 0, 0, 0, 0]
    },
    FREQUENCY: {
      dimensions: [0, 0, -1, 0, 0, 0, 0, 0, 0]
    },
    ANGLE: {
      dimensions: [0, 0, 0, 0, 0, 0, 0, 1, 0]
    },
    BIT: {
      dimensions: [0, 0, 0, 0, 0, 0, 0, 0, 1]
    }
  };
  for (var key in BASE_UNITS) {
    if (hasOwnProperty$1(BASE_UNITS, key)) {
      BASE_UNITS[key].key = key;
    }
  }
  var BASE_UNIT_NONE = {};
  var UNIT_NONE = {
    name: "",
    base: BASE_UNIT_NONE,
    value: 1,
    offset: 0,
    dimensions: BASE_DIMENSIONS.map((x) => 0)
  };
  var UNITS = {
    meter: {
      name: "meter",
      base: BASE_UNITS.LENGTH,
      prefixes: PREFIXES.LONG,
      value: 1,
      offset: 0
    },
    inch: {
      name: "inch",
      base: BASE_UNITS.LENGTH,
      prefixes: PREFIXES.NONE,
      value: 0.0254,
      offset: 0
    },
    foot: {
      name: "foot",
      base: BASE_UNITS.LENGTH,
      prefixes: PREFIXES.NONE,
      value: 0.3048,
      offset: 0
    },
    yard: {
      name: "yard",
      base: BASE_UNITS.LENGTH,
      prefixes: PREFIXES.NONE,
      value: 0.9144,
      offset: 0
    },
    mile: {
      name: "mile",
      base: BASE_UNITS.LENGTH,
      prefixes: PREFIXES.NONE,
      value: 1609.344,
      offset: 0
    },
    link: {
      name: "link",
      base: BASE_UNITS.LENGTH,
      prefixes: PREFIXES.NONE,
      value: 0.201168,
      offset: 0
    },
    rod: {
      name: "rod",
      base: BASE_UNITS.LENGTH,
      prefixes: PREFIXES.NONE,
      value: 5.0292,
      offset: 0
    },
    chain: {
      name: "chain",
      base: BASE_UNITS.LENGTH,
      prefixes: PREFIXES.NONE,
      value: 20.1168,
      offset: 0
    },
    angstrom: {
      name: "angstrom",
      base: BASE_UNITS.LENGTH,
      prefixes: PREFIXES.NONE,
      value: 1e-10,
      offset: 0
    },
    m: {
      name: "m",
      base: BASE_UNITS.LENGTH,
      prefixes: PREFIXES.SHORT,
      value: 1,
      offset: 0
    },
    in: {
      name: "in",
      base: BASE_UNITS.LENGTH,
      prefixes: PREFIXES.NONE,
      value: 0.0254,
      offset: 0
    },
    ft: {
      name: "ft",
      base: BASE_UNITS.LENGTH,
      prefixes: PREFIXES.NONE,
      value: 0.3048,
      offset: 0
    },
    yd: {
      name: "yd",
      base: BASE_UNITS.LENGTH,
      prefixes: PREFIXES.NONE,
      value: 0.9144,
      offset: 0
    },
    mi: {
      name: "mi",
      base: BASE_UNITS.LENGTH,
      prefixes: PREFIXES.NONE,
      value: 1609.344,
      offset: 0
    },
    li: {
      name: "li",
      base: BASE_UNITS.LENGTH,
      prefixes: PREFIXES.NONE,
      value: 0.201168,
      offset: 0
    },
    rd: {
      name: "rd",
      base: BASE_UNITS.LENGTH,
      prefixes: PREFIXES.NONE,
      value: 5.02921,
      offset: 0
    },
    ch: {
      name: "ch",
      base: BASE_UNITS.LENGTH,
      prefixes: PREFIXES.NONE,
      value: 20.1168,
      offset: 0
    },
    mil: {
      name: "mil",
      base: BASE_UNITS.LENGTH,
      prefixes: PREFIXES.NONE,
      value: 254e-7,
      offset: 0
    },
    m2: {
      name: "m2",
      base: BASE_UNITS.SURFACE,
      prefixes: PREFIXES.SQUARED,
      value: 1,
      offset: 0
    },
    sqin: {
      name: "sqin",
      base: BASE_UNITS.SURFACE,
      prefixes: PREFIXES.NONE,
      value: 64516e-8,
      offset: 0
    },
    sqft: {
      name: "sqft",
      base: BASE_UNITS.SURFACE,
      prefixes: PREFIXES.NONE,
      value: 0.09290304,
      offset: 0
    },
    sqyd: {
      name: "sqyd",
      base: BASE_UNITS.SURFACE,
      prefixes: PREFIXES.NONE,
      value: 0.83612736,
      offset: 0
    },
    sqmi: {
      name: "sqmi",
      base: BASE_UNITS.SURFACE,
      prefixes: PREFIXES.NONE,
      value: 2589988110336e-6,
      offset: 0
    },
    sqrd: {
      name: "sqrd",
      base: BASE_UNITS.SURFACE,
      prefixes: PREFIXES.NONE,
      value: 25.29295,
      offset: 0
    },
    sqch: {
      name: "sqch",
      base: BASE_UNITS.SURFACE,
      prefixes: PREFIXES.NONE,
      value: 404.6873,
      offset: 0
    },
    sqmil: {
      name: "sqmil",
      base: BASE_UNITS.SURFACE,
      prefixes: PREFIXES.NONE,
      value: 64516e-14,
      offset: 0
    },
    acre: {
      name: "acre",
      base: BASE_UNITS.SURFACE,
      prefixes: PREFIXES.NONE,
      value: 4046.86,
      offset: 0
    },
    hectare: {
      name: "hectare",
      base: BASE_UNITS.SURFACE,
      prefixes: PREFIXES.NONE,
      value: 1e4,
      offset: 0
    },
    m3: {
      name: "m3",
      base: BASE_UNITS.VOLUME,
      prefixes: PREFIXES.CUBIC,
      value: 1,
      offset: 0
    },
    L: {
      name: "L",
      base: BASE_UNITS.VOLUME,
      prefixes: PREFIXES.SHORT,
      value: 1e-3,
      offset: 0
    },
    l: {
      name: "l",
      base: BASE_UNITS.VOLUME,
      prefixes: PREFIXES.SHORT,
      value: 1e-3,
      offset: 0
    },
    litre: {
      name: "litre",
      base: BASE_UNITS.VOLUME,
      prefixes: PREFIXES.LONG,
      value: 1e-3,
      offset: 0
    },
    cuin: {
      name: "cuin",
      base: BASE_UNITS.VOLUME,
      prefixes: PREFIXES.NONE,
      value: 16387064e-12,
      offset: 0
    },
    cuft: {
      name: "cuft",
      base: BASE_UNITS.VOLUME,
      prefixes: PREFIXES.NONE,
      value: 0.028316846592,
      offset: 0
    },
    cuyd: {
      name: "cuyd",
      base: BASE_UNITS.VOLUME,
      prefixes: PREFIXES.NONE,
      value: 0.764554857984,
      offset: 0
    },
    teaspoon: {
      name: "teaspoon",
      base: BASE_UNITS.VOLUME,
      prefixes: PREFIXES.NONE,
      value: 5e-6,
      offset: 0
    },
    tablespoon: {
      name: "tablespoon",
      base: BASE_UNITS.VOLUME,
      prefixes: PREFIXES.NONE,
      value: 15e-6,
      offset: 0
    },
    drop: {
      name: "drop",
      base: BASE_UNITS.VOLUME,
      prefixes: PREFIXES.NONE,
      value: 5e-8,
      offset: 0
    },
    gtt: {
      name: "gtt",
      base: BASE_UNITS.VOLUME,
      prefixes: PREFIXES.NONE,
      value: 5e-8,
      offset: 0
    },
    minim: {
      name: "minim",
      base: BASE_UNITS.VOLUME,
      prefixes: PREFIXES.NONE,
      value: 6161152e-14,
      offset: 0
    },
    fluiddram: {
      name: "fluiddram",
      base: BASE_UNITS.VOLUME,
      prefixes: PREFIXES.NONE,
      value: 36966911e-13,
      offset: 0
    },
    fluidounce: {
      name: "fluidounce",
      base: BASE_UNITS.VOLUME,
      prefixes: PREFIXES.NONE,
      value: 2957353e-11,
      offset: 0
    },
    gill: {
      name: "gill",
      base: BASE_UNITS.VOLUME,
      prefixes: PREFIXES.NONE,
      value: 1182941e-10,
      offset: 0
    },
    cc: {
      name: "cc",
      base: BASE_UNITS.VOLUME,
      prefixes: PREFIXES.NONE,
      value: 1e-6,
      offset: 0
    },
    cup: {
      name: "cup",
      base: BASE_UNITS.VOLUME,
      prefixes: PREFIXES.NONE,
      value: 2365882e-10,
      offset: 0
    },
    pint: {
      name: "pint",
      base: BASE_UNITS.VOLUME,
      prefixes: PREFIXES.NONE,
      value: 4731765e-10,
      offset: 0
    },
    quart: {
      name: "quart",
      base: BASE_UNITS.VOLUME,
      prefixes: PREFIXES.NONE,
      value: 9463529e-10,
      offset: 0
    },
    gallon: {
      name: "gallon",
      base: BASE_UNITS.VOLUME,
      prefixes: PREFIXES.NONE,
      value: 3785412e-9,
      offset: 0
    },
    beerbarrel: {
      name: "beerbarrel",
      base: BASE_UNITS.VOLUME,
      prefixes: PREFIXES.NONE,
      value: 0.1173478,
      offset: 0
    },
    oilbarrel: {
      name: "oilbarrel",
      base: BASE_UNITS.VOLUME,
      prefixes: PREFIXES.NONE,
      value: 0.1589873,
      offset: 0
    },
    hogshead: {
      name: "hogshead",
      base: BASE_UNITS.VOLUME,
      prefixes: PREFIXES.NONE,
      value: 0.238481,
      offset: 0
    },
    fldr: {
      name: "fldr",
      base: BASE_UNITS.VOLUME,
      prefixes: PREFIXES.NONE,
      value: 36966911e-13,
      offset: 0
    },
    floz: {
      name: "floz",
      base: BASE_UNITS.VOLUME,
      prefixes: PREFIXES.NONE,
      value: 2957353e-11,
      offset: 0
    },
    gi: {
      name: "gi",
      base: BASE_UNITS.VOLUME,
      prefixes: PREFIXES.NONE,
      value: 1182941e-10,
      offset: 0
    },
    cp: {
      name: "cp",
      base: BASE_UNITS.VOLUME,
      prefixes: PREFIXES.NONE,
      value: 2365882e-10,
      offset: 0
    },
    pt: {
      name: "pt",
      base: BASE_UNITS.VOLUME,
      prefixes: PREFIXES.NONE,
      value: 4731765e-10,
      offset: 0
    },
    qt: {
      name: "qt",
      base: BASE_UNITS.VOLUME,
      prefixes: PREFIXES.NONE,
      value: 9463529e-10,
      offset: 0
    },
    gal: {
      name: "gal",
      base: BASE_UNITS.VOLUME,
      prefixes: PREFIXES.NONE,
      value: 3785412e-9,
      offset: 0
    },
    bbl: {
      name: "bbl",
      base: BASE_UNITS.VOLUME,
      prefixes: PREFIXES.NONE,
      value: 0.1173478,
      offset: 0
    },
    obl: {
      name: "obl",
      base: BASE_UNITS.VOLUME,
      prefixes: PREFIXES.NONE,
      value: 0.1589873,
      offset: 0
    },
    g: {
      name: "g",
      base: BASE_UNITS.MASS,
      prefixes: PREFIXES.SHORT,
      value: 1e-3,
      offset: 0
    },
    gram: {
      name: "gram",
      base: BASE_UNITS.MASS,
      prefixes: PREFIXES.LONG,
      value: 1e-3,
      offset: 0
    },
    ton: {
      name: "ton",
      base: BASE_UNITS.MASS,
      prefixes: PREFIXES.SHORT,
      value: 907.18474,
      offset: 0
    },
    t: {
      name: "t",
      base: BASE_UNITS.MASS,
      prefixes: PREFIXES.SHORT,
      value: 1e3,
      offset: 0
    },
    tonne: {
      name: "tonne",
      base: BASE_UNITS.MASS,
      prefixes: PREFIXES.LONG,
      value: 1e3,
      offset: 0
    },
    grain: {
      name: "grain",
      base: BASE_UNITS.MASS,
      prefixes: PREFIXES.NONE,
      value: 6479891e-11,
      offset: 0
    },
    dram: {
      name: "dram",
      base: BASE_UNITS.MASS,
      prefixes: PREFIXES.NONE,
      value: 0.0017718451953125,
      offset: 0
    },
    ounce: {
      name: "ounce",
      base: BASE_UNITS.MASS,
      prefixes: PREFIXES.NONE,
      value: 0.028349523125,
      offset: 0
    },
    poundmass: {
      name: "poundmass",
      base: BASE_UNITS.MASS,
      prefixes: PREFIXES.NONE,
      value: 0.45359237,
      offset: 0
    },
    hundredweight: {
      name: "hundredweight",
      base: BASE_UNITS.MASS,
      prefixes: PREFIXES.NONE,
      value: 45.359237,
      offset: 0
    },
    stick: {
      name: "stick",
      base: BASE_UNITS.MASS,
      prefixes: PREFIXES.NONE,
      value: 0.115,
      offset: 0
    },
    stone: {
      name: "stone",
      base: BASE_UNITS.MASS,
      prefixes: PREFIXES.NONE,
      value: 6.35029318,
      offset: 0
    },
    gr: {
      name: "gr",
      base: BASE_UNITS.MASS,
      prefixes: PREFIXES.NONE,
      value: 6479891e-11,
      offset: 0
    },
    dr: {
      name: "dr",
      base: BASE_UNITS.MASS,
      prefixes: PREFIXES.NONE,
      value: 0.0017718451953125,
      offset: 0
    },
    oz: {
      name: "oz",
      base: BASE_UNITS.MASS,
      prefixes: PREFIXES.NONE,
      value: 0.028349523125,
      offset: 0
    },
    lbm: {
      name: "lbm",
      base: BASE_UNITS.MASS,
      prefixes: PREFIXES.NONE,
      value: 0.45359237,
      offset: 0
    },
    cwt: {
      name: "cwt",
      base: BASE_UNITS.MASS,
      prefixes: PREFIXES.NONE,
      value: 45.359237,
      offset: 0
    },
    s: {
      name: "s",
      base: BASE_UNITS.TIME,
      prefixes: PREFIXES.SHORT,
      value: 1,
      offset: 0
    },
    min: {
      name: "min",
      base: BASE_UNITS.TIME,
      prefixes: PREFIXES.NONE,
      value: 60,
      offset: 0
    },
    h: {
      name: "h",
      base: BASE_UNITS.TIME,
      prefixes: PREFIXES.NONE,
      value: 3600,
      offset: 0
    },
    second: {
      name: "second",
      base: BASE_UNITS.TIME,
      prefixes: PREFIXES.LONG,
      value: 1,
      offset: 0
    },
    sec: {
      name: "sec",
      base: BASE_UNITS.TIME,
      prefixes: PREFIXES.LONG,
      value: 1,
      offset: 0
    },
    minute: {
      name: "minute",
      base: BASE_UNITS.TIME,
      prefixes: PREFIXES.NONE,
      value: 60,
      offset: 0
    },
    hour: {
      name: "hour",
      base: BASE_UNITS.TIME,
      prefixes: PREFIXES.NONE,
      value: 3600,
      offset: 0
    },
    day: {
      name: "day",
      base: BASE_UNITS.TIME,
      prefixes: PREFIXES.NONE,
      value: 86400,
      offset: 0
    },
    week: {
      name: "week",
      base: BASE_UNITS.TIME,
      prefixes: PREFIXES.NONE,
      value: 7 * 86400,
      offset: 0
    },
    month: {
      name: "month",
      base: BASE_UNITS.TIME,
      prefixes: PREFIXES.NONE,
      value: 2629800,
      offset: 0
    },
    year: {
      name: "year",
      base: BASE_UNITS.TIME,
      prefixes: PREFIXES.NONE,
      value: 31557600,
      offset: 0
    },
    decade: {
      name: "decade",
      base: BASE_UNITS.TIME,
      prefixes: PREFIXES.NONE,
      value: 315576e3,
      offset: 0
    },
    century: {
      name: "century",
      base: BASE_UNITS.TIME,
      prefixes: PREFIXES.NONE,
      value: 315576e4,
      offset: 0
    },
    millennium: {
      name: "millennium",
      base: BASE_UNITS.TIME,
      prefixes: PREFIXES.NONE,
      value: 315576e5,
      offset: 0
    },
    hertz: {
      name: "Hertz",
      base: BASE_UNITS.FREQUENCY,
      prefixes: PREFIXES.LONG,
      value: 1,
      offset: 0,
      reciprocal: true
    },
    Hz: {
      name: "Hz",
      base: BASE_UNITS.FREQUENCY,
      prefixes: PREFIXES.SHORT,
      value: 1,
      offset: 0,
      reciprocal: true
    },
    rad: {
      name: "rad",
      base: BASE_UNITS.ANGLE,
      prefixes: PREFIXES.SHORT,
      value: 1,
      offset: 0
    },
    radian: {
      name: "radian",
      base: BASE_UNITS.ANGLE,
      prefixes: PREFIXES.LONG,
      value: 1,
      offset: 0
    },
    deg: {
      name: "deg",
      base: BASE_UNITS.ANGLE,
      prefixes: PREFIXES.SHORT,
      value: null,
      offset: 0
    },
    degree: {
      name: "degree",
      base: BASE_UNITS.ANGLE,
      prefixes: PREFIXES.LONG,
      value: null,
      offset: 0
    },
    grad: {
      name: "grad",
      base: BASE_UNITS.ANGLE,
      prefixes: PREFIXES.SHORT,
      value: null,
      offset: 0
    },
    gradian: {
      name: "gradian",
      base: BASE_UNITS.ANGLE,
      prefixes: PREFIXES.LONG,
      value: null,
      offset: 0
    },
    cycle: {
      name: "cycle",
      base: BASE_UNITS.ANGLE,
      prefixes: PREFIXES.NONE,
      value: null,
      offset: 0
    },
    arcsec: {
      name: "arcsec",
      base: BASE_UNITS.ANGLE,
      prefixes: PREFIXES.NONE,
      value: null,
      offset: 0
    },
    arcmin: {
      name: "arcmin",
      base: BASE_UNITS.ANGLE,
      prefixes: PREFIXES.NONE,
      value: null,
      offset: 0
    },
    A: {
      name: "A",
      base: BASE_UNITS.CURRENT,
      prefixes: PREFIXES.SHORT,
      value: 1,
      offset: 0
    },
    ampere: {
      name: "ampere",
      base: BASE_UNITS.CURRENT,
      prefixes: PREFIXES.LONG,
      value: 1,
      offset: 0
    },
    K: {
      name: "K",
      base: BASE_UNITS.TEMPERATURE,
      prefixes: PREFIXES.NONE,
      value: 1,
      offset: 0
    },
    degC: {
      name: "degC",
      base: BASE_UNITS.TEMPERATURE,
      prefixes: PREFIXES.NONE,
      value: 1,
      offset: 273.15
    },
    degF: {
      name: "degF",
      base: BASE_UNITS.TEMPERATURE,
      prefixes: PREFIXES.NONE,
      value: 1 / 1.8,
      offset: 459.67
    },
    degR: {
      name: "degR",
      base: BASE_UNITS.TEMPERATURE,
      prefixes: PREFIXES.NONE,
      value: 1 / 1.8,
      offset: 0
    },
    kelvin: {
      name: "kelvin",
      base: BASE_UNITS.TEMPERATURE,
      prefixes: PREFIXES.NONE,
      value: 1,
      offset: 0
    },
    celsius: {
      name: "celsius",
      base: BASE_UNITS.TEMPERATURE,
      prefixes: PREFIXES.NONE,
      value: 1,
      offset: 273.15
    },
    fahrenheit: {
      name: "fahrenheit",
      base: BASE_UNITS.TEMPERATURE,
      prefixes: PREFIXES.NONE,
      value: 1 / 1.8,
      offset: 459.67
    },
    rankine: {
      name: "rankine",
      base: BASE_UNITS.TEMPERATURE,
      prefixes: PREFIXES.NONE,
      value: 1 / 1.8,
      offset: 0
    },
    mol: {
      name: "mol",
      base: BASE_UNITS.AMOUNT_OF_SUBSTANCE,
      prefixes: PREFIXES.SHORT,
      value: 1,
      offset: 0
    },
    mole: {
      name: "mole",
      base: BASE_UNITS.AMOUNT_OF_SUBSTANCE,
      prefixes: PREFIXES.LONG,
      value: 1,
      offset: 0
    },
    cd: {
      name: "cd",
      base: BASE_UNITS.LUMINOUS_INTENSITY,
      prefixes: PREFIXES.SHORT,
      value: 1,
      offset: 0
    },
    candela: {
      name: "candela",
      base: BASE_UNITS.LUMINOUS_INTENSITY,
      prefixes: PREFIXES.LONG,
      value: 1,
      offset: 0
    },
    N: {
      name: "N",
      base: BASE_UNITS.FORCE,
      prefixes: PREFIXES.SHORT,
      value: 1,
      offset: 0
    },
    newton: {
      name: "newton",
      base: BASE_UNITS.FORCE,
      prefixes: PREFIXES.LONG,
      value: 1,
      offset: 0
    },
    dyn: {
      name: "dyn",
      base: BASE_UNITS.FORCE,
      prefixes: PREFIXES.SHORT,
      value: 1e-5,
      offset: 0
    },
    dyne: {
      name: "dyne",
      base: BASE_UNITS.FORCE,
      prefixes: PREFIXES.LONG,
      value: 1e-5,
      offset: 0
    },
    lbf: {
      name: "lbf",
      base: BASE_UNITS.FORCE,
      prefixes: PREFIXES.NONE,
      value: 4.4482216152605,
      offset: 0
    },
    poundforce: {
      name: "poundforce",
      base: BASE_UNITS.FORCE,
      prefixes: PREFIXES.NONE,
      value: 4.4482216152605,
      offset: 0
    },
    kip: {
      name: "kip",
      base: BASE_UNITS.FORCE,
      prefixes: PREFIXES.LONG,
      value: 4448.2216,
      offset: 0
    },
    kilogramforce: {
      name: "kilogramforce",
      base: BASE_UNITS.FORCE,
      prefixes: PREFIXES.NONE,
      value: 9.80665,
      offset: 0
    },
    J: {
      name: "J",
      base: BASE_UNITS.ENERGY,
      prefixes: PREFIXES.SHORT,
      value: 1,
      offset: 0
    },
    joule: {
      name: "joule",
      base: BASE_UNITS.ENERGY,
      prefixes: PREFIXES.SHORT,
      value: 1,
      offset: 0
    },
    erg: {
      name: "erg",
      base: BASE_UNITS.ENERGY,
      prefixes: PREFIXES.NONE,
      value: 1e-7,
      offset: 0
    },
    Wh: {
      name: "Wh",
      base: BASE_UNITS.ENERGY,
      prefixes: PREFIXES.SHORT,
      value: 3600,
      offset: 0
    },
    BTU: {
      name: "BTU",
      base: BASE_UNITS.ENERGY,
      prefixes: PREFIXES.BTU,
      value: 1055.05585262,
      offset: 0
    },
    eV: {
      name: "eV",
      base: BASE_UNITS.ENERGY,
      prefixes: PREFIXES.SHORT,
      value: 1602176565e-28,
      offset: 0
    },
    electronvolt: {
      name: "electronvolt",
      base: BASE_UNITS.ENERGY,
      prefixes: PREFIXES.LONG,
      value: 1602176565e-28,
      offset: 0
    },
    W: {
      name: "W",
      base: BASE_UNITS.POWER,
      prefixes: PREFIXES.SHORT,
      value: 1,
      offset: 0
    },
    watt: {
      name: "watt",
      base: BASE_UNITS.POWER,
      prefixes: PREFIXES.LONG,
      value: 1,
      offset: 0
    },
    hp: {
      name: "hp",
      base: BASE_UNITS.POWER,
      prefixes: PREFIXES.NONE,
      value: 745.6998715386,
      offset: 0
    },
    VAR: {
      name: "VAR",
      base: BASE_UNITS.POWER,
      prefixes: PREFIXES.SHORT,
      value: Complex2.I,
      offset: 0
    },
    VA: {
      name: "VA",
      base: BASE_UNITS.POWER,
      prefixes: PREFIXES.SHORT,
      value: 1,
      offset: 0
    },
    Pa: {
      name: "Pa",
      base: BASE_UNITS.PRESSURE,
      prefixes: PREFIXES.SHORT,
      value: 1,
      offset: 0
    },
    psi: {
      name: "psi",
      base: BASE_UNITS.PRESSURE,
      prefixes: PREFIXES.NONE,
      value: 6894.75729276459,
      offset: 0
    },
    atm: {
      name: "atm",
      base: BASE_UNITS.PRESSURE,
      prefixes: PREFIXES.NONE,
      value: 101325,
      offset: 0
    },
    bar: {
      name: "bar",
      base: BASE_UNITS.PRESSURE,
      prefixes: PREFIXES.SHORTLONG,
      value: 1e5,
      offset: 0
    },
    torr: {
      name: "torr",
      base: BASE_UNITS.PRESSURE,
      prefixes: PREFIXES.NONE,
      value: 133.322,
      offset: 0
    },
    mmHg: {
      name: "mmHg",
      base: BASE_UNITS.PRESSURE,
      prefixes: PREFIXES.NONE,
      value: 133.322,
      offset: 0
    },
    mmH2O: {
      name: "mmH2O",
      base: BASE_UNITS.PRESSURE,
      prefixes: PREFIXES.NONE,
      value: 9.80665,
      offset: 0
    },
    cmH2O: {
      name: "cmH2O",
      base: BASE_UNITS.PRESSURE,
      prefixes: PREFIXES.NONE,
      value: 98.0665,
      offset: 0
    },
    coulomb: {
      name: "coulomb",
      base: BASE_UNITS.ELECTRIC_CHARGE,
      prefixes: PREFIXES.LONG,
      value: 1,
      offset: 0
    },
    C: {
      name: "C",
      base: BASE_UNITS.ELECTRIC_CHARGE,
      prefixes: PREFIXES.SHORT,
      value: 1,
      offset: 0
    },
    farad: {
      name: "farad",
      base: BASE_UNITS.ELECTRIC_CAPACITANCE,
      prefixes: PREFIXES.LONG,
      value: 1,
      offset: 0
    },
    F: {
      name: "F",
      base: BASE_UNITS.ELECTRIC_CAPACITANCE,
      prefixes: PREFIXES.SHORT,
      value: 1,
      offset: 0
    },
    volt: {
      name: "volt",
      base: BASE_UNITS.ELECTRIC_POTENTIAL,
      prefixes: PREFIXES.LONG,
      value: 1,
      offset: 0
    },
    V: {
      name: "V",
      base: BASE_UNITS.ELECTRIC_POTENTIAL,
      prefixes: PREFIXES.SHORT,
      value: 1,
      offset: 0
    },
    ohm: {
      name: "ohm",
      base: BASE_UNITS.ELECTRIC_RESISTANCE,
      prefixes: PREFIXES.SHORTLONG,
      value: 1,
      offset: 0
    },
    henry: {
      name: "henry",
      base: BASE_UNITS.ELECTRIC_INDUCTANCE,
      prefixes: PREFIXES.LONG,
      value: 1,
      offset: 0
    },
    H: {
      name: "H",
      base: BASE_UNITS.ELECTRIC_INDUCTANCE,
      prefixes: PREFIXES.SHORT,
      value: 1,
      offset: 0
    },
    siemens: {
      name: "siemens",
      base: BASE_UNITS.ELECTRIC_CONDUCTANCE,
      prefixes: PREFIXES.LONG,
      value: 1,
      offset: 0
    },
    S: {
      name: "S",
      base: BASE_UNITS.ELECTRIC_CONDUCTANCE,
      prefixes: PREFIXES.SHORT,
      value: 1,
      offset: 0
    },
    weber: {
      name: "weber",
      base: BASE_UNITS.MAGNETIC_FLUX,
      prefixes: PREFIXES.LONG,
      value: 1,
      offset: 0
    },
    Wb: {
      name: "Wb",
      base: BASE_UNITS.MAGNETIC_FLUX,
      prefixes: PREFIXES.SHORT,
      value: 1,
      offset: 0
    },
    tesla: {
      name: "tesla",
      base: BASE_UNITS.MAGNETIC_FLUX_DENSITY,
      prefixes: PREFIXES.LONG,
      value: 1,
      offset: 0
    },
    T: {
      name: "T",
      base: BASE_UNITS.MAGNETIC_FLUX_DENSITY,
      prefixes: PREFIXES.SHORT,
      value: 1,
      offset: 0
    },
    b: {
      name: "b",
      base: BASE_UNITS.BIT,
      prefixes: PREFIXES.BINARY_SHORT,
      value: 1,
      offset: 0
    },
    bits: {
      name: "bits",
      base: BASE_UNITS.BIT,
      prefixes: PREFIXES.BINARY_LONG,
      value: 1,
      offset: 0
    },
    B: {
      name: "B",
      base: BASE_UNITS.BIT,
      prefixes: PREFIXES.BINARY_SHORT,
      value: 8,
      offset: 0
    },
    bytes: {
      name: "bytes",
      base: BASE_UNITS.BIT,
      prefixes: PREFIXES.BINARY_LONG,
      value: 8,
      offset: 0
    }
  };
  var ALIASES = {
    meters: "meter",
    inches: "inch",
    feet: "foot",
    yards: "yard",
    miles: "mile",
    links: "link",
    rods: "rod",
    chains: "chain",
    angstroms: "angstrom",
    lt: "l",
    litres: "litre",
    liter: "litre",
    liters: "litre",
    teaspoons: "teaspoon",
    tablespoons: "tablespoon",
    minims: "minim",
    fluiddrams: "fluiddram",
    fluidounces: "fluidounce",
    gills: "gill",
    cups: "cup",
    pints: "pint",
    quarts: "quart",
    gallons: "gallon",
    beerbarrels: "beerbarrel",
    oilbarrels: "oilbarrel",
    hogsheads: "hogshead",
    gtts: "gtt",
    grams: "gram",
    tons: "ton",
    tonnes: "tonne",
    grains: "grain",
    drams: "dram",
    ounces: "ounce",
    poundmasses: "poundmass",
    hundredweights: "hundredweight",
    sticks: "stick",
    lb: "lbm",
    lbs: "lbm",
    kips: "kip",
    kgf: "kilogramforce",
    acres: "acre",
    hectares: "hectare",
    sqfeet: "sqft",
    sqyard: "sqyd",
    sqmile: "sqmi",
    sqmiles: "sqmi",
    mmhg: "mmHg",
    mmh2o: "mmH2O",
    cmh2o: "cmH2O",
    seconds: "second",
    secs: "second",
    minutes: "minute",
    mins: "minute",
    hours: "hour",
    hr: "hour",
    hrs: "hour",
    days: "day",
    weeks: "week",
    months: "month",
    years: "year",
    decades: "decade",
    centuries: "century",
    millennia: "millennium",
    hertz: "hertz",
    radians: "radian",
    degrees: "degree",
    gradians: "gradian",
    cycles: "cycle",
    arcsecond: "arcsec",
    arcseconds: "arcsec",
    arcminute: "arcmin",
    arcminutes: "arcmin",
    BTUs: "BTU",
    watts: "watt",
    joules: "joule",
    amperes: "ampere",
    coulombs: "coulomb",
    volts: "volt",
    ohms: "ohm",
    farads: "farad",
    webers: "weber",
    teslas: "tesla",
    electronvolts: "electronvolt",
    moles: "mole",
    bit: "bits",
    byte: "bytes"
  };
  function calculateAngleValues(config3) {
    if (config3.number === "BigNumber") {
      var pi = createBigNumberPi(_BigNumber);
      UNITS.rad.value = new _BigNumber(1);
      UNITS.deg.value = pi.div(180);
      UNITS.grad.value = pi.div(200);
      UNITS.cycle.value = pi.times(2);
      UNITS.arcsec.value = pi.div(648e3);
      UNITS.arcmin.value = pi.div(10800);
    } else {
      UNITS.rad.value = 1;
      UNITS.deg.value = Math.PI / 180;
      UNITS.grad.value = Math.PI / 200;
      UNITS.cycle.value = Math.PI * 2;
      UNITS.arcsec.value = Math.PI / 648e3;
      UNITS.arcmin.value = Math.PI / 10800;
    }
    UNITS.radian.value = UNITS.rad.value;
    UNITS.degree.value = UNITS.deg.value;
    UNITS.gradian.value = UNITS.grad.value;
  }
  calculateAngleValues(config2);
  if (on) {
    on("config", function(curr, prev) {
      if (curr.number !== prev.number) {
        calculateAngleValues(curr);
      }
    });
  }
  var UNIT_SYSTEMS = {
    si: {
      NONE: {
        unit: UNIT_NONE,
        prefix: PREFIXES.NONE[""]
      },
      LENGTH: {
        unit: UNITS.m,
        prefix: PREFIXES.SHORT[""]
      },
      MASS: {
        unit: UNITS.g,
        prefix: PREFIXES.SHORT.k
      },
      TIME: {
        unit: UNITS.s,
        prefix: PREFIXES.SHORT[""]
      },
      CURRENT: {
        unit: UNITS.A,
        prefix: PREFIXES.SHORT[""]
      },
      TEMPERATURE: {
        unit: UNITS.K,
        prefix: PREFIXES.SHORT[""]
      },
      LUMINOUS_INTENSITY: {
        unit: UNITS.cd,
        prefix: PREFIXES.SHORT[""]
      },
      AMOUNT_OF_SUBSTANCE: {
        unit: UNITS.mol,
        prefix: PREFIXES.SHORT[""]
      },
      ANGLE: {
        unit: UNITS.rad,
        prefix: PREFIXES.SHORT[""]
      },
      BIT: {
        unit: UNITS.bits,
        prefix: PREFIXES.SHORT[""]
      },
      FORCE: {
        unit: UNITS.N,
        prefix: PREFIXES.SHORT[""]
      },
      ENERGY: {
        unit: UNITS.J,
        prefix: PREFIXES.SHORT[""]
      },
      POWER: {
        unit: UNITS.W,
        prefix: PREFIXES.SHORT[""]
      },
      PRESSURE: {
        unit: UNITS.Pa,
        prefix: PREFIXES.SHORT[""]
      },
      ELECTRIC_CHARGE: {
        unit: UNITS.C,
        prefix: PREFIXES.SHORT[""]
      },
      ELECTRIC_CAPACITANCE: {
        unit: UNITS.F,
        prefix: PREFIXES.SHORT[""]
      },
      ELECTRIC_POTENTIAL: {
        unit: UNITS.V,
        prefix: PREFIXES.SHORT[""]
      },
      ELECTRIC_RESISTANCE: {
        unit: UNITS.ohm,
        prefix: PREFIXES.SHORT[""]
      },
      ELECTRIC_INDUCTANCE: {
        unit: UNITS.H,
        prefix: PREFIXES.SHORT[""]
      },
      ELECTRIC_CONDUCTANCE: {
        unit: UNITS.S,
        prefix: PREFIXES.SHORT[""]
      },
      MAGNETIC_FLUX: {
        unit: UNITS.Wb,
        prefix: PREFIXES.SHORT[""]
      },
      MAGNETIC_FLUX_DENSITY: {
        unit: UNITS.T,
        prefix: PREFIXES.SHORT[""]
      },
      FREQUENCY: {
        unit: UNITS.Hz,
        prefix: PREFIXES.SHORT[""]
      }
    }
  };
  UNIT_SYSTEMS.cgs = JSON.parse(JSON.stringify(UNIT_SYSTEMS.si));
  UNIT_SYSTEMS.cgs.LENGTH = {
    unit: UNITS.m,
    prefix: PREFIXES.SHORT.c
  };
  UNIT_SYSTEMS.cgs.MASS = {
    unit: UNITS.g,
    prefix: PREFIXES.SHORT[""]
  };
  UNIT_SYSTEMS.cgs.FORCE = {
    unit: UNITS.dyn,
    prefix: PREFIXES.SHORT[""]
  };
  UNIT_SYSTEMS.cgs.ENERGY = {
    unit: UNITS.erg,
    prefix: PREFIXES.NONE[""]
  };
  UNIT_SYSTEMS.us = JSON.parse(JSON.stringify(UNIT_SYSTEMS.si));
  UNIT_SYSTEMS.us.LENGTH = {
    unit: UNITS.ft,
    prefix: PREFIXES.NONE[""]
  };
  UNIT_SYSTEMS.us.MASS = {
    unit: UNITS.lbm,
    prefix: PREFIXES.NONE[""]
  };
  UNIT_SYSTEMS.us.TEMPERATURE = {
    unit: UNITS.degF,
    prefix: PREFIXES.NONE[""]
  };
  UNIT_SYSTEMS.us.FORCE = {
    unit: UNITS.lbf,
    prefix: PREFIXES.NONE[""]
  };
  UNIT_SYSTEMS.us.ENERGY = {
    unit: UNITS.BTU,
    prefix: PREFIXES.BTU[""]
  };
  UNIT_SYSTEMS.us.POWER = {
    unit: UNITS.hp,
    prefix: PREFIXES.NONE[""]
  };
  UNIT_SYSTEMS.us.PRESSURE = {
    unit: UNITS.psi,
    prefix: PREFIXES.NONE[""]
  };
  UNIT_SYSTEMS.auto = JSON.parse(JSON.stringify(UNIT_SYSTEMS.si));
  var currentUnitSystem = UNIT_SYSTEMS.auto;
  Unit.setUnitSystem = function(name2) {
    if (hasOwnProperty$1(UNIT_SYSTEMS, name2)) {
      currentUnitSystem = UNIT_SYSTEMS[name2];
    } else {
      throw new Error("Unit system " + name2 + " does not exist. Choices are: " + Object.keys(UNIT_SYSTEMS).join(", "));
    }
  };
  Unit.getUnitSystem = function() {
    for (var _key in UNIT_SYSTEMS) {
      if (hasOwnProperty$1(UNIT_SYSTEMS, _key)) {
        if (UNIT_SYSTEMS[_key] === currentUnitSystem) {
          return _key;
        }
      }
    }
  };
  Unit.typeConverters = {
    BigNumber: function BigNumber(x) {
      return new _BigNumber(x + "");
    },
    Fraction: function Fraction2(x) {
      return new _Fraction(x);
    },
    Complex: function Complex3(x) {
      return x;
    },
    number: function number2(x) {
      return x;
    }
  };
  Unit._getNumberConverter = function(type) {
    if (!Unit.typeConverters[type]) {
      throw new TypeError('Unsupported type "' + type + '"');
    }
    return Unit.typeConverters[type];
  };
  for (var _key2 in UNITS) {
    if (hasOwnProperty$1(UNITS, _key2)) {
      var unit = UNITS[_key2];
      unit.dimensions = unit.base.dimensions;
    }
  }
  for (var _name2 in ALIASES) {
    if (hasOwnProperty$1(ALIASES, _name2)) {
      var _unit2 = UNITS[ALIASES[_name2]];
      var alias = {};
      for (var _key3 in _unit2) {
        if (hasOwnProperty$1(_unit2, _key3)) {
          alias[_key3] = _unit2[_key3];
        }
      }
      alias.name = _name2;
      UNITS[_name2] = alias;
    }
  }
  Unit.isValidAlpha = function isValidAlpha(c3) {
    return /^[a-zA-Z]$/.test(c3);
  };
  function assertUnitNameIsValid(name2) {
    for (var i = 0; i < name2.length; i++) {
      c2 = name2.charAt(i);
      if (i === 0 && !Unit.isValidAlpha(c2)) {
        throw new Error('Invalid unit name (must begin with alpha character): "' + name2 + '"');
      }
      if (i > 0 && !(Unit.isValidAlpha(c2) || isDigit(c2))) {
        throw new Error('Invalid unit name (only alphanumeric characters are allowed): "' + name2 + '"');
      }
    }
  }
  Unit.createUnit = function(obj, options) {
    if (typeof obj !== "object") {
      throw new TypeError("createUnit expects first parameter to be of type 'Object'");
    }
    if (options && options.override) {
      for (var _key4 in obj) {
        if (hasOwnProperty$1(obj, _key4)) {
          Unit.deleteUnit(_key4);
        }
        if (obj[_key4].aliases) {
          for (var i = 0; i < obj[_key4].aliases.length; i++) {
            Unit.deleteUnit(obj[_key4].aliases[i]);
          }
        }
      }
    }
    var lastUnit;
    for (var _key5 in obj) {
      if (hasOwnProperty$1(obj, _key5)) {
        lastUnit = Unit.createUnitSingle(_key5, obj[_key5]);
      }
    }
    return lastUnit;
  };
  Unit.createUnitSingle = function(name2, obj, options) {
    if (typeof obj === "undefined" || obj === null) {
      obj = {};
    }
    if (typeof name2 !== "string") {
      throw new TypeError("createUnitSingle expects first parameter to be of type 'string'");
    }
    if (hasOwnProperty$1(UNITS, name2)) {
      throw new Error('Cannot create unit "' + name2 + '": a unit with that name already exists');
    }
    assertUnitNameIsValid(name2);
    var defUnit = null;
    var aliases = [];
    var offset = 0;
    var definition;
    var prefixes;
    var baseName;
    if (obj && obj.type === "Unit") {
      defUnit = obj.clone();
    } else if (typeof obj === "string") {
      if (obj !== "") {
        definition = obj;
      }
    } else if (typeof obj === "object") {
      definition = obj.definition;
      prefixes = obj.prefixes;
      offset = obj.offset;
      baseName = obj.baseName;
      if (obj.aliases) {
        aliases = obj.aliases.valueOf();
      }
    } else {
      throw new TypeError('Cannot create unit "' + name2 + '" from "' + obj.toString() + '": expecting "string" or "Unit" or "Object"');
    }
    if (aliases) {
      for (var i = 0; i < aliases.length; i++) {
        if (hasOwnProperty$1(UNITS, aliases[i])) {
          throw new Error('Cannot create alias "' + aliases[i] + '": a unit with that name already exists');
        }
      }
    }
    if (definition && typeof definition === "string" && !defUnit) {
      try {
        defUnit = Unit.parse(definition, {
          allowNoUnits: true
        });
      } catch (ex) {
        ex.message = 'Could not create unit "' + name2 + '" from "' + definition + '": ' + ex.message;
        throw ex;
      }
    } else if (definition && definition.type === "Unit") {
      defUnit = definition.clone();
    }
    aliases = aliases || [];
    offset = offset || 0;
    if (prefixes && prefixes.toUpperCase) {
      prefixes = PREFIXES[prefixes.toUpperCase()] || PREFIXES.NONE;
    } else {
      prefixes = PREFIXES.NONE;
    }
    var newUnit = {};
    if (!defUnit) {
      baseName = baseName || name2 + "_STUFF";
      if (BASE_DIMENSIONS.indexOf(baseName) >= 0) {
        throw new Error('Cannot create new base unit "' + name2 + '": a base unit with that name already exists (and cannot be overridden)');
      }
      BASE_DIMENSIONS.push(baseName);
      for (var b2 in BASE_UNITS) {
        if (hasOwnProperty$1(BASE_UNITS, b2)) {
          BASE_UNITS[b2].dimensions[BASE_DIMENSIONS.length - 1] = 0;
        }
      }
      var newBaseUnit = {
        dimensions: []
      };
      for (var _i6 = 0; _i6 < BASE_DIMENSIONS.length; _i6++) {
        newBaseUnit.dimensions[_i6] = 0;
      }
      newBaseUnit.dimensions[BASE_DIMENSIONS.length - 1] = 1;
      newBaseUnit.key = baseName;
      BASE_UNITS[baseName] = newBaseUnit;
      newUnit = {
        name: name2,
        value: 1,
        dimensions: BASE_UNITS[baseName].dimensions.slice(0),
        prefixes,
        offset,
        base: BASE_UNITS[baseName]
      };
      currentUnitSystem[baseName] = {
        unit: newUnit,
        prefix: PREFIXES.NONE[""]
      };
    } else {
      newUnit = {
        name: name2,
        value: defUnit.value,
        dimensions: defUnit.dimensions.slice(0),
        prefixes,
        offset
      };
      var anyMatch = false;
      for (var _i7 in BASE_UNITS) {
        if (hasOwnProperty$1(BASE_UNITS, _i7)) {
          var match = true;
          for (var j = 0; j < BASE_DIMENSIONS.length; j++) {
            if (Math.abs((newUnit.dimensions[j] || 0) - (BASE_UNITS[_i7].dimensions[j] || 0)) > 1e-12) {
              match = false;
              break;
            }
          }
          if (match) {
            anyMatch = true;
            newUnit.base = BASE_UNITS[_i7];
            break;
          }
        }
      }
      if (!anyMatch) {
        baseName = baseName || name2 + "_STUFF";
        var _newBaseUnit = {
          dimensions: defUnit.dimensions.slice(0)
        };
        _newBaseUnit.key = baseName;
        BASE_UNITS[baseName] = _newBaseUnit;
        currentUnitSystem[baseName] = {
          unit: newUnit,
          prefix: PREFIXES.NONE[""]
        };
        newUnit.base = BASE_UNITS[baseName];
      }
    }
    Unit.UNITS[name2] = newUnit;
    for (var _i8 = 0; _i8 < aliases.length; _i8++) {
      var aliasName = aliases[_i8];
      var _alias = {};
      for (var _key6 in newUnit) {
        if (hasOwnProperty$1(newUnit, _key6)) {
          _alias[_key6] = newUnit[_key6];
        }
      }
      _alias.name = aliasName;
      Unit.UNITS[aliasName] = _alias;
    }
    delete _findUnit.cache;
    return new Unit(null, name2);
  };
  Unit.deleteUnit = function(name2) {
    delete Unit.UNITS[name2];
  };
  Unit.PREFIXES = PREFIXES;
  Unit.BASE_DIMENSIONS = BASE_DIMENSIONS;
  Unit.BASE_UNITS = BASE_UNITS;
  Unit.UNIT_SYSTEMS = UNIT_SYSTEMS;
  Unit.UNITS = UNITS;
  return Unit;
}, {
  isClass: true
});
var name$p = "unit";
var dependencies$p = ["typed", "Unit"];
var createUnitFunction = /* @__PURE__ */ factory(name$p, dependencies$p, (_ref) => {
  var {
    typed,
    Unit
  } = _ref;
  return typed(name$p, {
    Unit: function Unit2(x) {
      return x.clone();
    },
    string: function string(x) {
      if (Unit.isValuelessUnit(x)) {
        return new Unit(null, x);
      }
      return Unit.parse(x, {
        allowNoUnits: true
      });
    },
    "number | BigNumber | Fraction | Complex, string": function numberBigNumberFractionComplexString(value, unit) {
      return new Unit(value, unit);
    },
    "Array | Matrix": function ArrayMatrix(x) {
      return deepMap(x, this);
    }
  });
});
var name$o = "createUnit";
var dependencies$o = ["typed", "Unit"];
var createCreateUnit = /* @__PURE__ */ factory(name$o, dependencies$o, (_ref) => {
  var {
    typed,
    Unit
  } = _ref;
  return typed(name$o, {
    "Object, Object": function ObjectObject(obj, options) {
      return Unit.createUnit(obj, options);
    },
    Object: function Object2(obj) {
      return Unit.createUnit(obj, {});
    },
    "string, Unit | string | Object, Object": function stringUnitStringObjectObject(name2, def, options) {
      var obj = {};
      obj[name2] = def;
      return Unit.createUnit(obj, options);
    },
    "string, Unit | string | Object": function stringUnitStringObject(name2, def) {
      var obj = {};
      obj[name2] = def;
      return Unit.createUnit(obj, {});
    },
    string: function string(name2) {
      var obj = {};
      obj[name2] = {};
      return Unit.createUnit(obj, {});
    }
  });
});
var name$n = "add";
var dependencies$n = ["typed", "matrix", "addScalar", "equalScalar", "DenseMatrix", "SparseMatrix"];
var createAdd = /* @__PURE__ */ factory(name$n, dependencies$n, (_ref) => {
  var {
    typed,
    matrix,
    addScalar,
    equalScalar,
    DenseMatrix,
    SparseMatrix
  } = _ref;
  var algorithm01 = createAlgorithm01({
    typed
  });
  var algorithm04 = createAlgorithm04({
    typed,
    equalScalar
  });
  var algorithm10 = createAlgorithm10({
    typed,
    DenseMatrix
  });
  var algorithm13 = createAlgorithm13({
    typed
  });
  var algorithm14 = createAlgorithm14({
    typed
  });
  return typed(name$n, extend({
    "DenseMatrix, DenseMatrix": function DenseMatrixDenseMatrix(x, y) {
      return algorithm13(x, y, addScalar);
    },
    "DenseMatrix, SparseMatrix": function DenseMatrixSparseMatrix(x, y) {
      return algorithm01(x, y, addScalar, false);
    },
    "SparseMatrix, DenseMatrix": function SparseMatrixDenseMatrix(x, y) {
      return algorithm01(y, x, addScalar, true);
    },
    "SparseMatrix, SparseMatrix": function SparseMatrixSparseMatrix(x, y) {
      return algorithm04(x, y, addScalar);
    },
    "Array, Array": function ArrayArray(x, y) {
      return this(matrix(x), matrix(y)).valueOf();
    },
    "Array, Matrix": function ArrayMatrix(x, y) {
      return this(matrix(x), y);
    },
    "Matrix, Array": function MatrixArray(x, y) {
      return this(x, matrix(y));
    },
    "DenseMatrix, any": function DenseMatrixAny(x, y) {
      return algorithm14(x, y, addScalar, false);
    },
    "SparseMatrix, any": function SparseMatrixAny(x, y) {
      return algorithm10(x, y, addScalar, false);
    },
    "any, DenseMatrix": function anyDenseMatrix(x, y) {
      return algorithm14(y, x, addScalar, true);
    },
    "any, SparseMatrix": function anySparseMatrix(x, y) {
      return algorithm10(y, x, addScalar, true);
    },
    "Array, any": function ArrayAny(x, y) {
      return algorithm14(matrix(x), y, addScalar, false).valueOf();
    },
    "any, Array": function anyArray(x, y) {
      return algorithm14(matrix(y), x, addScalar, true).valueOf();
    },
    "any, any": addScalar,
    "any, any, ...any": function anyAnyAny(x, y, rest) {
      var result = this(x, y);
      for (var i = 0; i < rest.length; i++) {
        result = this(result, rest[i]);
      }
      return result;
    }
  }, addScalar.signatures));
});
var name$m = "dot";
var dependencies$m = ["typed", "addScalar", "multiplyScalar", "conj", "size"];
var createDot = /* @__PURE__ */ factory(name$m, dependencies$m, (_ref) => {
  var {
    typed,
    addScalar,
    multiplyScalar,
    conj,
    size
  } = _ref;
  return typed(name$m, {
    "Array | DenseMatrix, Array | DenseMatrix": _denseDot,
    "SparseMatrix, SparseMatrix": _sparseDot
  });
  function _validateDim(x, y) {
    var xSize = _size(x);
    var ySize = _size(y);
    var xLen, yLen;
    if (xSize.length === 1) {
      xLen = xSize[0];
    } else if (xSize.length === 2 && xSize[1] === 1) {
      xLen = xSize[0];
    } else {
      throw new RangeError("Expected a column vector, instead got a matrix of size (" + xSize.join(", ") + ")");
    }
    if (ySize.length === 1) {
      yLen = ySize[0];
    } else if (ySize.length === 2 && ySize[1] === 1) {
      yLen = ySize[0];
    } else {
      throw new RangeError("Expected a column vector, instead got a matrix of size (" + ySize.join(", ") + ")");
    }
    if (xLen !== yLen)
      throw new RangeError("Vectors must have equal length (" + xLen + " != " + yLen + ")");
    if (xLen === 0)
      throw new RangeError("Cannot calculate the dot product of empty vectors");
    return xLen;
  }
  function _denseDot(a2, b2) {
    var N = _validateDim(a2, b2);
    var adata = isMatrix(a2) ? a2._data : a2;
    var adt = isMatrix(a2) ? a2._datatype : void 0;
    var bdata = isMatrix(b2) ? b2._data : b2;
    var bdt = isMatrix(b2) ? b2._datatype : void 0;
    var aIsColumn = _size(a2).length === 2;
    var bIsColumn = _size(b2).length === 2;
    var add2 = addScalar;
    var mul2 = multiplyScalar;
    if (adt && bdt && adt === bdt && typeof adt === "string") {
      var dt = adt;
      add2 = typed.find(addScalar, [dt, dt]);
      mul2 = typed.find(multiplyScalar, [dt, dt]);
    }
    if (!aIsColumn && !bIsColumn) {
      var c2 = mul2(conj(adata[0]), bdata[0]);
      for (var i = 1; i < N; i++) {
        c2 = add2(c2, mul2(conj(adata[i]), bdata[i]));
      }
      return c2;
    }
    if (!aIsColumn && bIsColumn) {
      var _c2 = mul2(conj(adata[0]), bdata[0][0]);
      for (var _i = 1; _i < N; _i++) {
        _c2 = add2(_c2, mul2(conj(adata[_i]), bdata[_i][0]));
      }
      return _c2;
    }
    if (aIsColumn && !bIsColumn) {
      var _c22 = mul2(conj(adata[0][0]), bdata[0]);
      for (var _i2 = 1; _i2 < N; _i2++) {
        _c22 = add2(_c22, mul2(conj(adata[_i2][0]), bdata[_i2]));
      }
      return _c22;
    }
    if (aIsColumn && bIsColumn) {
      var _c3 = mul2(conj(adata[0][0]), bdata[0][0]);
      for (var _i3 = 1; _i3 < N; _i3++) {
        _c3 = add2(_c3, mul2(conj(adata[_i3][0]), bdata[_i3][0]));
      }
      return _c3;
    }
  }
  function _sparseDot(x, y) {
    _validateDim(x, y);
    var xindex = x._index;
    var xvalues = x._values;
    var yindex = y._index;
    var yvalues = y._values;
    var c2 = 0;
    var add2 = addScalar;
    var mul2 = multiplyScalar;
    var i = 0;
    var j = 0;
    while (i < xindex.length && j < yindex.length) {
      var I = xindex[i];
      var J = yindex[j];
      if (I < J) {
        i++;
        continue;
      }
      if (I > J) {
        j++;
        continue;
      }
      if (I === J) {
        c2 = add2(c2, mul2(xvalues[i], yvalues[j]));
        i++;
        j++;
      }
    }
    return c2;
  }
  function _size(x) {
    return isMatrix(x) ? x.size() : size(x);
  }
});
var keywords = {
  end: true
};
var name$l = "Node";
var dependencies$l = ["mathWithTransform"];
var createNode = /* @__PURE__ */ factory(name$l, dependencies$l, (_ref) => {
  var {
    mathWithTransform
  } = _ref;
  function Node() {
    if (!(this instanceof Node)) {
      throw new SyntaxError("Constructor must be called with the new operator");
    }
  }
  Node.prototype.evaluate = function(scope) {
    return this.compile().evaluate(scope);
  };
  Node.prototype.type = "Node";
  Node.prototype.isNode = true;
  Node.prototype.comment = "";
  Node.prototype.compile = function() {
    var expr = this._compile(mathWithTransform, {});
    var args = {};
    var context = null;
    function evaluate(scope) {
      var s = scope || {};
      _validateScope(s);
      return expr(s, args, context);
    }
    return {
      evaluate
    };
  };
  Node.prototype._compile = function(math, argNames) {
    throw new Error("Method _compile should be implemented by type " + this.type);
  };
  Node.prototype.forEach = function(callback) {
    throw new Error("Cannot run forEach on a Node interface");
  };
  Node.prototype.map = function(callback) {
    throw new Error("Cannot run map on a Node interface");
  };
  Node.prototype._ifNode = function(node) {
    if (!isNode(node)) {
      throw new TypeError("Callback function must return a Node");
    }
    return node;
  };
  Node.prototype.traverse = function(callback) {
    callback(this, null, null);
    function _traverse(node, callback2) {
      node.forEach(function(child, path, parent) {
        callback2(child, path, parent);
        _traverse(child, callback2);
      });
    }
    _traverse(this, callback);
  };
  Node.prototype.transform = function(callback) {
    function _transform(child, path, parent) {
      var replacement = callback(child, path, parent);
      if (replacement !== child) {
        return replacement;
      }
      return child.map(_transform);
    }
    return _transform(this, null, null);
  };
  Node.prototype.filter = function(callback) {
    var nodes = [];
    this.traverse(function(node, path, parent) {
      if (callback(node, path, parent)) {
        nodes.push(node);
      }
    });
    return nodes;
  };
  Node.prototype.clone = function() {
    throw new Error("Cannot clone a Node interface");
  };
  Node.prototype.cloneDeep = function() {
    return this.map(function(node) {
      return node.cloneDeep();
    });
  };
  Node.prototype.equals = function(other) {
    return other ? deepStrictEqual(this, other) : false;
  };
  Node.prototype.toString = function(options) {
    var customString;
    if (options && typeof options === "object") {
      switch (typeof options.handler) {
        case "object":
        case "undefined":
          break;
        case "function":
          customString = options.handler(this, options);
          break;
        default:
          throw new TypeError("Object or function expected as callback");
      }
    }
    if (typeof customString !== "undefined") {
      return customString;
    }
    return this._toString(options);
  };
  Node.prototype.toJSON = function() {
    throw new Error("Cannot serialize object: toJSON not implemented by " + this.type);
  };
  Node.prototype.toHTML = function(options) {
    var customString;
    if (options && typeof options === "object") {
      switch (typeof options.handler) {
        case "object":
        case "undefined":
          break;
        case "function":
          customString = options.handler(this, options);
          break;
        default:
          throw new TypeError("Object or function expected as callback");
      }
    }
    if (typeof customString !== "undefined") {
      return customString;
    }
    return this.toHTML(options);
  };
  Node.prototype._toString = function() {
    throw new Error("_toString not implemented for " + this.type);
  };
  Node.prototype.toTex = function(options) {
    var customTex;
    if (options && typeof options === "object") {
      switch (typeof options.handler) {
        case "object":
        case "undefined":
          break;
        case "function":
          customTex = options.handler(this, options);
          break;
        default:
          throw new TypeError("Object or function expected as callback");
      }
    }
    if (typeof customTex !== "undefined") {
      return customTex;
    }
    return this._toTex(options);
  };
  Node.prototype._toTex = function(options) {
    throw new Error("_toTex not implemented for " + this.type);
  };
  Node.prototype.getIdentifier = function() {
    return this.type;
  };
  Node.prototype.getContent = function() {
    return this;
  };
  function _validateScope(scope) {
    for (var symbol in scope) {
      if (hasOwnProperty$1(scope, symbol)) {
        if (symbol in keywords) {
          throw new Error('Scope contains an illegal symbol, "' + symbol + '" is a reserved keyword');
        }
      }
    }
  }
  return Node;
}, {
  isClass: true,
  isNode: true
});
function errorTransform(err) {
  if (err && err.isIndexError) {
    return new IndexError(err.index + 1, err.min + 1, err.max !== void 0 ? err.max + 1 : void 0);
  }
  return err;
}
function accessFactory(_ref) {
  var {
    subset
  } = _ref;
  return function access(object, index) {
    try {
      if (Array.isArray(object)) {
        return subset(object, index);
      } else if (object && typeof object.subset === "function") {
        return object.subset(index);
      } else if (typeof object === "string") {
        return subset(object, index);
      } else if (typeof object === "object") {
        if (!index.isObjectProperty()) {
          throw new TypeError("Cannot apply a numeric index as object property");
        }
        return getSafeProperty(object, index.getObjectProperty());
      } else {
        throw new TypeError("Cannot apply index: unsupported type of object");
      }
    } catch (err) {
      throw errorTransform(err);
    }
  };
}
var name$k = "AccessorNode";
var dependencies$k = ["subset", "Node"];
var createAccessorNode = /* @__PURE__ */ factory(name$k, dependencies$k, (_ref) => {
  var {
    subset,
    Node
  } = _ref;
  var access = accessFactory({
    subset
  });
  function AccessorNode(object, index) {
    if (!(this instanceof AccessorNode)) {
      throw new SyntaxError("Constructor must be called with the new operator");
    }
    if (!isNode(object)) {
      throw new TypeError('Node expected for parameter "object"');
    }
    if (!isIndexNode(index)) {
      throw new TypeError('IndexNode expected for parameter "index"');
    }
    this.object = object || null;
    this.index = index;
    Object.defineProperty(this, "name", {
      get: function() {
        if (this.index) {
          return this.index.isObjectProperty() ? this.index.getObjectProperty() : "";
        } else {
          return this.object.name || "";
        }
      }.bind(this),
      set: function set() {
        throw new Error("Cannot assign a new name, name is read-only");
      }
    });
  }
  AccessorNode.prototype = new Node();
  AccessorNode.prototype.type = "AccessorNode";
  AccessorNode.prototype.isAccessorNode = true;
  AccessorNode.prototype._compile = function(math, argNames) {
    var evalObject = this.object._compile(math, argNames);
    var evalIndex = this.index._compile(math, argNames);
    if (this.index.isObjectProperty()) {
      var prop = this.index.getObjectProperty();
      return function evalAccessorNode(scope, args, context) {
        return getSafeProperty(evalObject(scope, args, context), prop);
      };
    } else {
      return function evalAccessorNode(scope, args, context) {
        var object = evalObject(scope, args, context);
        var index = evalIndex(scope, args, object);
        return access(object, index);
      };
    }
  };
  AccessorNode.prototype.forEach = function(callback) {
    callback(this.object, "object", this);
    callback(this.index, "index", this);
  };
  AccessorNode.prototype.map = function(callback) {
    return new AccessorNode(this._ifNode(callback(this.object, "object", this)), this._ifNode(callback(this.index, "index", this)));
  };
  AccessorNode.prototype.clone = function() {
    return new AccessorNode(this.object, this.index);
  };
  AccessorNode.prototype._toString = function(options) {
    var object = this.object.toString(options);
    if (needParenthesis(this.object)) {
      object = "(" + object + ")";
    }
    return object + this.index.toString(options);
  };
  AccessorNode.prototype.toHTML = function(options) {
    var object = this.object.toHTML(options);
    if (needParenthesis(this.object)) {
      object = '<span class="math-parenthesis math-round-parenthesis">(</span>' + object + '<span class="math-parenthesis math-round-parenthesis">)</span>';
    }
    return object + this.index.toHTML(options);
  };
  AccessorNode.prototype._toTex = function(options) {
    var object = this.object.toTex(options);
    if (needParenthesis(this.object)) {
      object = "\\left(' + object + '\\right)";
    }
    return object + this.index.toTex(options);
  };
  AccessorNode.prototype.toJSON = function() {
    return {
      mathjs: "AccessorNode",
      object: this.object,
      index: this.index
    };
  };
  AccessorNode.fromJSON = function(json) {
    return new AccessorNode(json.object, json.index);
  };
  function needParenthesis(node) {
    return !(isAccessorNode(node) || isArrayNode(node) || isConstantNode(node) || isFunctionNode(node) || isObjectNode(node) || isParenthesisNode(node) || isSymbolNode(node));
  }
  return AccessorNode;
}, {
  isClass: true,
  isNode: true
});
var name$j = "ArrayNode";
var dependencies$j = ["Node"];
var createArrayNode = /* @__PURE__ */ factory(name$j, dependencies$j, (_ref) => {
  var {
    Node
  } = _ref;
  function ArrayNode(items) {
    if (!(this instanceof ArrayNode)) {
      throw new SyntaxError("Constructor must be called with the new operator");
    }
    this.items = items || [];
    if (!Array.isArray(this.items) || !this.items.every(isNode)) {
      throw new TypeError("Array containing Nodes expected");
    }
  }
  ArrayNode.prototype = new Node();
  ArrayNode.prototype.type = "ArrayNode";
  ArrayNode.prototype.isArrayNode = true;
  ArrayNode.prototype._compile = function(math, argNames) {
    var evalItems = map(this.items, function(item) {
      return item._compile(math, argNames);
    });
    var asMatrix = math.config.matrix !== "Array";
    if (asMatrix) {
      var matrix = math.matrix;
      return function evalArrayNode(scope, args, context) {
        return matrix(map(evalItems, function(evalItem) {
          return evalItem(scope, args, context);
        }));
      };
    } else {
      return function evalArrayNode(scope, args, context) {
        return map(evalItems, function(evalItem) {
          return evalItem(scope, args, context);
        });
      };
    }
  };
  ArrayNode.prototype.forEach = function(callback) {
    for (var i = 0; i < this.items.length; i++) {
      var node = this.items[i];
      callback(node, "items[" + i + "]", this);
    }
  };
  ArrayNode.prototype.map = function(callback) {
    var items = [];
    for (var i = 0; i < this.items.length; i++) {
      items[i] = this._ifNode(callback(this.items[i], "items[" + i + "]", this));
    }
    return new ArrayNode(items);
  };
  ArrayNode.prototype.clone = function() {
    return new ArrayNode(this.items.slice(0));
  };
  ArrayNode.prototype._toString = function(options) {
    var items = this.items.map(function(node) {
      return node.toString(options);
    });
    return "[" + items.join(", ") + "]";
  };
  ArrayNode.prototype.toJSON = function() {
    return {
      mathjs: "ArrayNode",
      items: this.items
    };
  };
  ArrayNode.fromJSON = function(json) {
    return new ArrayNode(json.items);
  };
  ArrayNode.prototype.toHTML = function(options) {
    var items = this.items.map(function(node) {
      return node.toHTML(options);
    });
    return '<span class="math-parenthesis math-square-parenthesis">[</span>' + items.join('<span class="math-separator">,</span>') + '<span class="math-parenthesis math-square-parenthesis">]</span>';
  };
  ArrayNode.prototype._toTex = function(options) {
    var s = "\\begin{bmatrix}";
    this.items.forEach(function(node) {
      if (node.items) {
        s += node.items.map(function(childNode) {
          return childNode.toTex(options);
        }).join("&");
      } else {
        s += node.toTex(options);
      }
      s += "\\\\";
    });
    s += "\\end{bmatrix}";
    return s;
  };
  return ArrayNode;
}, {
  isClass: true,
  isNode: true
});
function assignFactory(_ref) {
  var {
    subset,
    matrix
  } = _ref;
  return function assign(object, index, value) {
    try {
      if (Array.isArray(object)) {
        return matrix(object).subset(index, value).valueOf();
      } else if (object && typeof object.subset === "function") {
        return object.subset(index, value);
      } else if (typeof object === "string") {
        return subset(object, index, value);
      } else if (typeof object === "object") {
        if (!index.isObjectProperty()) {
          throw TypeError("Cannot apply a numeric index as object property");
        }
        setSafeProperty(object, index.getObjectProperty(), value);
        return object;
      } else {
        throw new TypeError("Cannot apply index: unsupported type of object");
      }
    } catch (err) {
      throw errorTransform(err);
    }
  };
}
var properties = [{
  AssignmentNode: {},
  FunctionAssignmentNode: {}
}, {
  ConditionalNode: {
    latexLeftParens: false,
    latexRightParens: false,
    latexParens: false
  }
}, {
  "OperatorNode:or": {
    associativity: "left",
    associativeWith: []
  }
}, {
  "OperatorNode:xor": {
    associativity: "left",
    associativeWith: []
  }
}, {
  "OperatorNode:and": {
    associativity: "left",
    associativeWith: []
  }
}, {
  "OperatorNode:bitOr": {
    associativity: "left",
    associativeWith: []
  }
}, {
  "OperatorNode:bitXor": {
    associativity: "left",
    associativeWith: []
  }
}, {
  "OperatorNode:bitAnd": {
    associativity: "left",
    associativeWith: []
  }
}, {
  "OperatorNode:equal": {
    associativity: "left",
    associativeWith: []
  },
  "OperatorNode:unequal": {
    associativity: "left",
    associativeWith: []
  },
  "OperatorNode:smaller": {
    associativity: "left",
    associativeWith: []
  },
  "OperatorNode:larger": {
    associativity: "left",
    associativeWith: []
  },
  "OperatorNode:smallerEq": {
    associativity: "left",
    associativeWith: []
  },
  "OperatorNode:largerEq": {
    associativity: "left",
    associativeWith: []
  },
  RelationalNode: {
    associativity: "left",
    associativeWith: []
  }
}, {
  "OperatorNode:leftShift": {
    associativity: "left",
    associativeWith: []
  },
  "OperatorNode:rightArithShift": {
    associativity: "left",
    associativeWith: []
  },
  "OperatorNode:rightLogShift": {
    associativity: "left",
    associativeWith: []
  }
}, {
  "OperatorNode:to": {
    associativity: "left",
    associativeWith: []
  }
}, {
  RangeNode: {}
}, {
  "OperatorNode:add": {
    associativity: "left",
    associativeWith: ["OperatorNode:add", "OperatorNode:subtract"]
  },
  "OperatorNode:subtract": {
    associativity: "left",
    associativeWith: []
  }
}, {
  "OperatorNode:multiply": {
    associativity: "left",
    associativeWith: ["OperatorNode:multiply", "OperatorNode:divide", "Operator:dotMultiply", "Operator:dotDivide"]
  },
  "OperatorNode:divide": {
    associativity: "left",
    associativeWith: [],
    latexLeftParens: false,
    latexRightParens: false,
    latexParens: false
  },
  "OperatorNode:dotMultiply": {
    associativity: "left",
    associativeWith: ["OperatorNode:multiply", "OperatorNode:divide", "OperatorNode:dotMultiply", "OperatorNode:doDivide"]
  },
  "OperatorNode:dotDivide": {
    associativity: "left",
    associativeWith: []
  },
  "OperatorNode:mod": {
    associativity: "left",
    associativeWith: []
  }
}, {
  "OperatorNode:unaryPlus": {
    associativity: "right"
  },
  "OperatorNode:unaryMinus": {
    associativity: "right"
  },
  "OperatorNode:bitNot": {
    associativity: "right"
  },
  "OperatorNode:not": {
    associativity: "right"
  }
}, {
  "OperatorNode:pow": {
    associativity: "right",
    associativeWith: [],
    latexRightParens: false
  },
  "OperatorNode:dotPow": {
    associativity: "right",
    associativeWith: []
  }
}, {
  "OperatorNode:factorial": {
    associativity: "left"
  }
}, {
  "OperatorNode:transpose": {
    associativity: "left"
  }
}];
function getPrecedence(_node, parenthesis) {
  var node = _node;
  if (parenthesis !== "keep") {
    node = _node.getContent();
  }
  var identifier = node.getIdentifier();
  for (var i = 0; i < properties.length; i++) {
    if (identifier in properties[i]) {
      return i;
    }
  }
  return null;
}
function getAssociativity(_node, parenthesis) {
  var node = _node;
  if (parenthesis !== "keep") {
    node = _node.getContent();
  }
  var identifier = node.getIdentifier();
  var index = getPrecedence(node, parenthesis);
  if (index === null) {
    return null;
  }
  var property = properties[index][identifier];
  if (hasOwnProperty$1(property, "associativity")) {
    if (property.associativity === "left") {
      return "left";
    }
    if (property.associativity === "right") {
      return "right";
    }
    throw Error("'" + identifier + "' has the invalid associativity '" + property.associativity + "'.");
  }
  return null;
}
function isAssociativeWith(nodeA, nodeB, parenthesis) {
  var a2 = parenthesis !== "keep" ? nodeA.getContent() : nodeA;
  var b2 = parenthesis !== "keep" ? nodeA.getContent() : nodeB;
  var identifierA = a2.getIdentifier();
  var identifierB = b2.getIdentifier();
  var index = getPrecedence(a2, parenthesis);
  if (index === null) {
    return null;
  }
  var property = properties[index][identifierA];
  if (hasOwnProperty$1(property, "associativeWith") && property.associativeWith instanceof Array) {
    for (var i = 0; i < property.associativeWith.length; i++) {
      if (property.associativeWith[i] === identifierB) {
        return true;
      }
    }
    return false;
  }
  return null;
}
var name$i = "AssignmentNode";
var dependencies$i = [
  "subset",
  "?matrix",
  "Node"
];
var createAssignmentNode = /* @__PURE__ */ factory(name$i, dependencies$i, (_ref) => {
  var {
    subset,
    matrix,
    Node
  } = _ref;
  var access = accessFactory({
    subset
  });
  var assign = assignFactory({
    subset,
    matrix
  });
  function AssignmentNode(object, index, value) {
    if (!(this instanceof AssignmentNode)) {
      throw new SyntaxError("Constructor must be called with the new operator");
    }
    this.object = object;
    this.index = value ? index : null;
    this.value = value || index;
    if (!isSymbolNode(object) && !isAccessorNode(object)) {
      throw new TypeError('SymbolNode or AccessorNode expected as "object"');
    }
    if (isSymbolNode(object) && object.name === "end") {
      throw new Error('Cannot assign to symbol "end"');
    }
    if (this.index && !isIndexNode(this.index)) {
      throw new TypeError('IndexNode expected as "index"');
    }
    if (!isNode(this.value)) {
      throw new TypeError('Node expected as "value"');
    }
    Object.defineProperty(this, "name", {
      get: function() {
        if (this.index) {
          return this.index.isObjectProperty() ? this.index.getObjectProperty() : "";
        } else {
          return this.object.name || "";
        }
      }.bind(this),
      set: function set() {
        throw new Error("Cannot assign a new name, name is read-only");
      }
    });
  }
  AssignmentNode.prototype = new Node();
  AssignmentNode.prototype.type = "AssignmentNode";
  AssignmentNode.prototype.isAssignmentNode = true;
  AssignmentNode.prototype._compile = function(math, argNames) {
    var evalObject = this.object._compile(math, argNames);
    var evalIndex = this.index ? this.index._compile(math, argNames) : null;
    var evalValue = this.value._compile(math, argNames);
    var name2 = this.object.name;
    if (!this.index) {
      if (!isSymbolNode(this.object)) {
        throw new TypeError("SymbolNode expected as object");
      }
      return function evalAssignmentNode(scope, args, context) {
        return setSafeProperty(scope, name2, evalValue(scope, args, context));
      };
    } else if (this.index.isObjectProperty()) {
      var prop = this.index.getObjectProperty();
      return function evalAssignmentNode(scope, args, context) {
        var object = evalObject(scope, args, context);
        var value = evalValue(scope, args, context);
        return setSafeProperty(object, prop, value);
      };
    } else if (isSymbolNode(this.object)) {
      return function evalAssignmentNode(scope, args, context) {
        var childObject = evalObject(scope, args, context);
        var value = evalValue(scope, args, context);
        var index = evalIndex(scope, args, childObject);
        setSafeProperty(scope, name2, assign(childObject, index, value));
        return value;
      };
    } else {
      var evalParentObject = this.object.object._compile(math, argNames);
      if (this.object.index.isObjectProperty()) {
        var parentProp = this.object.index.getObjectProperty();
        return function evalAssignmentNode(scope, args, context) {
          var parent = evalParentObject(scope, args, context);
          var childObject = getSafeProperty(parent, parentProp);
          var index = evalIndex(scope, args, childObject);
          var value = evalValue(scope, args, context);
          setSafeProperty(parent, parentProp, assign(childObject, index, value));
          return value;
        };
      } else {
        var evalParentIndex = this.object.index._compile(math, argNames);
        return function evalAssignmentNode(scope, args, context) {
          var parent = evalParentObject(scope, args, context);
          var parentIndex = evalParentIndex(scope, args, parent);
          var childObject = access(parent, parentIndex);
          var index = evalIndex(scope, args, childObject);
          var value = evalValue(scope, args, context);
          assign(parent, parentIndex, assign(childObject, index, value));
          return value;
        };
      }
    }
  };
  AssignmentNode.prototype.forEach = function(callback) {
    callback(this.object, "object", this);
    if (this.index) {
      callback(this.index, "index", this);
    }
    callback(this.value, "value", this);
  };
  AssignmentNode.prototype.map = function(callback) {
    var object = this._ifNode(callback(this.object, "object", this));
    var index = this.index ? this._ifNode(callback(this.index, "index", this)) : null;
    var value = this._ifNode(callback(this.value, "value", this));
    return new AssignmentNode(object, index, value);
  };
  AssignmentNode.prototype.clone = function() {
    return new AssignmentNode(this.object, this.index, this.value);
  };
  function needParenthesis(node, parenthesis) {
    if (!parenthesis) {
      parenthesis = "keep";
    }
    var precedence = getPrecedence(node, parenthesis);
    var exprPrecedence = getPrecedence(node.value, parenthesis);
    return parenthesis === "all" || exprPrecedence !== null && exprPrecedence <= precedence;
  }
  AssignmentNode.prototype._toString = function(options) {
    var object = this.object.toString(options);
    var index = this.index ? this.index.toString(options) : "";
    var value = this.value.toString(options);
    if (needParenthesis(this, options && options.parenthesis)) {
      value = "(" + value + ")";
    }
    return object + index + " = " + value;
  };
  AssignmentNode.prototype.toJSON = function() {
    return {
      mathjs: "AssignmentNode",
      object: this.object,
      index: this.index,
      value: this.value
    };
  };
  AssignmentNode.fromJSON = function(json) {
    return new AssignmentNode(json.object, json.index, json.value);
  };
  AssignmentNode.prototype.toHTML = function(options) {
    var object = this.object.toHTML(options);
    var index = this.index ? this.index.toHTML(options) : "";
    var value = this.value.toHTML(options);
    if (needParenthesis(this, options && options.parenthesis)) {
      value = '<span class="math-paranthesis math-round-parenthesis">(</span>' + value + '<span class="math-paranthesis math-round-parenthesis">)</span>';
    }
    return object + index + '<span class="math-operator math-assignment-operator math-variable-assignment-operator math-binary-operator">=</span>' + value;
  };
  AssignmentNode.prototype._toTex = function(options) {
    var object = this.object.toTex(options);
    var index = this.index ? this.index.toTex(options) : "";
    var value = this.value.toTex(options);
    if (needParenthesis(this, options && options.parenthesis)) {
      value = "\\left(".concat(value, "\\right)");
    }
    return object + index + ":=" + value;
  };
  return AssignmentNode;
}, {
  isClass: true,
  isNode: true
});
var name$h = "BlockNode";
var dependencies$h = ["ResultSet", "Node"];
var createBlockNode = /* @__PURE__ */ factory(name$h, dependencies$h, (_ref) => {
  var {
    ResultSet,
    Node
  } = _ref;
  function BlockNode(blocks) {
    if (!(this instanceof BlockNode)) {
      throw new SyntaxError("Constructor must be called with the new operator");
    }
    if (!Array.isArray(blocks))
      throw new Error("Array expected");
    this.blocks = blocks.map(function(block) {
      var node = block && block.node;
      var visible = block && block.visible !== void 0 ? block.visible : true;
      if (!isNode(node))
        throw new TypeError('Property "node" must be a Node');
      if (typeof visible !== "boolean")
        throw new TypeError('Property "visible" must be a boolean');
      return {
        node,
        visible
      };
    });
  }
  BlockNode.prototype = new Node();
  BlockNode.prototype.type = "BlockNode";
  BlockNode.prototype.isBlockNode = true;
  BlockNode.prototype._compile = function(math, argNames) {
    var evalBlocks = map(this.blocks, function(block) {
      return {
        evaluate: block.node._compile(math, argNames),
        visible: block.visible
      };
    });
    return function evalBlockNodes(scope, args, context) {
      var results = [];
      forEach(evalBlocks, function evalBlockNode(block) {
        var result = block.evaluate(scope, args, context);
        if (block.visible) {
          results.push(result);
        }
      });
      return new ResultSet(results);
    };
  };
  BlockNode.prototype.forEach = function(callback) {
    for (var i = 0; i < this.blocks.length; i++) {
      callback(this.blocks[i].node, "blocks[" + i + "].node", this);
    }
  };
  BlockNode.prototype.map = function(callback) {
    var blocks = [];
    for (var i = 0; i < this.blocks.length; i++) {
      var block = this.blocks[i];
      var node = this._ifNode(callback(block.node, "blocks[" + i + "].node", this));
      blocks[i] = {
        node,
        visible: block.visible
      };
    }
    return new BlockNode(blocks);
  };
  BlockNode.prototype.clone = function() {
    var blocks = this.blocks.map(function(block) {
      return {
        node: block.node,
        visible: block.visible
      };
    });
    return new BlockNode(blocks);
  };
  BlockNode.prototype._toString = function(options) {
    return this.blocks.map(function(param) {
      return param.node.toString(options) + (param.visible ? "" : ";");
    }).join("\n");
  };
  BlockNode.prototype.toJSON = function() {
    return {
      mathjs: "BlockNode",
      blocks: this.blocks
    };
  };
  BlockNode.fromJSON = function(json) {
    return new BlockNode(json.blocks);
  };
  BlockNode.prototype.toHTML = function(options) {
    return this.blocks.map(function(param) {
      return param.node.toHTML(options) + (param.visible ? "" : '<span class="math-separator">;</span>');
    }).join('<span class="math-separator"><br /></span>');
  };
  BlockNode.prototype._toTex = function(options) {
    return this.blocks.map(function(param) {
      return param.node.toTex(options) + (param.visible ? "" : ";");
    }).join("\\;\\;\n");
  };
  return BlockNode;
}, {
  isClass: true,
  isNode: true
});
var name$g = "ConditionalNode";
var dependencies$g = ["Node"];
var createConditionalNode = /* @__PURE__ */ factory(name$g, dependencies$g, (_ref) => {
  var {
    Node
  } = _ref;
  function ConditionalNode(condition, trueExpr, falseExpr) {
    if (!(this instanceof ConditionalNode)) {
      throw new SyntaxError("Constructor must be called with the new operator");
    }
    if (!isNode(condition))
      throw new TypeError("Parameter condition must be a Node");
    if (!isNode(trueExpr))
      throw new TypeError("Parameter trueExpr must be a Node");
    if (!isNode(falseExpr))
      throw new TypeError("Parameter falseExpr must be a Node");
    this.condition = condition;
    this.trueExpr = trueExpr;
    this.falseExpr = falseExpr;
  }
  ConditionalNode.prototype = new Node();
  ConditionalNode.prototype.type = "ConditionalNode";
  ConditionalNode.prototype.isConditionalNode = true;
  ConditionalNode.prototype._compile = function(math, argNames) {
    var evalCondition = this.condition._compile(math, argNames);
    var evalTrueExpr = this.trueExpr._compile(math, argNames);
    var evalFalseExpr = this.falseExpr._compile(math, argNames);
    return function evalConditionalNode(scope, args, context) {
      return testCondition(evalCondition(scope, args, context)) ? evalTrueExpr(scope, args, context) : evalFalseExpr(scope, args, context);
    };
  };
  ConditionalNode.prototype.forEach = function(callback) {
    callback(this.condition, "condition", this);
    callback(this.trueExpr, "trueExpr", this);
    callback(this.falseExpr, "falseExpr", this);
  };
  ConditionalNode.prototype.map = function(callback) {
    return new ConditionalNode(this._ifNode(callback(this.condition, "condition", this)), this._ifNode(callback(this.trueExpr, "trueExpr", this)), this._ifNode(callback(this.falseExpr, "falseExpr", this)));
  };
  ConditionalNode.prototype.clone = function() {
    return new ConditionalNode(this.condition, this.trueExpr, this.falseExpr);
  };
  ConditionalNode.prototype._toString = function(options) {
    var parenthesis = options && options.parenthesis ? options.parenthesis : "keep";
    var precedence = getPrecedence(this, parenthesis);
    var condition = this.condition.toString(options);
    var conditionPrecedence = getPrecedence(this.condition, parenthesis);
    if (parenthesis === "all" || this.condition.type === "OperatorNode" || conditionPrecedence !== null && conditionPrecedence <= precedence) {
      condition = "(" + condition + ")";
    }
    var trueExpr = this.trueExpr.toString(options);
    var truePrecedence = getPrecedence(this.trueExpr, parenthesis);
    if (parenthesis === "all" || this.trueExpr.type === "OperatorNode" || truePrecedence !== null && truePrecedence <= precedence) {
      trueExpr = "(" + trueExpr + ")";
    }
    var falseExpr = this.falseExpr.toString(options);
    var falsePrecedence = getPrecedence(this.falseExpr, parenthesis);
    if (parenthesis === "all" || this.falseExpr.type === "OperatorNode" || falsePrecedence !== null && falsePrecedence <= precedence) {
      falseExpr = "(" + falseExpr + ")";
    }
    return condition + " ? " + trueExpr + " : " + falseExpr;
  };
  ConditionalNode.prototype.toJSON = function() {
    return {
      mathjs: "ConditionalNode",
      condition: this.condition,
      trueExpr: this.trueExpr,
      falseExpr: this.falseExpr
    };
  };
  ConditionalNode.fromJSON = function(json) {
    return new ConditionalNode(json.condition, json.trueExpr, json.falseExpr);
  };
  ConditionalNode.prototype.toHTML = function(options) {
    var parenthesis = options && options.parenthesis ? options.parenthesis : "keep";
    var precedence = getPrecedence(this, parenthesis);
    var condition = this.condition.toHTML(options);
    var conditionPrecedence = getPrecedence(this.condition, parenthesis);
    if (parenthesis === "all" || this.condition.type === "OperatorNode" || conditionPrecedence !== null && conditionPrecedence <= precedence) {
      condition = '<span class="math-parenthesis math-round-parenthesis">(</span>' + condition + '<span class="math-parenthesis math-round-parenthesis">)</span>';
    }
    var trueExpr = this.trueExpr.toHTML(options);
    var truePrecedence = getPrecedence(this.trueExpr, parenthesis);
    if (parenthesis === "all" || this.trueExpr.type === "OperatorNode" || truePrecedence !== null && truePrecedence <= precedence) {
      trueExpr = '<span class="math-parenthesis math-round-parenthesis">(</span>' + trueExpr + '<span class="math-parenthesis math-round-parenthesis">)</span>';
    }
    var falseExpr = this.falseExpr.toHTML(options);
    var falsePrecedence = getPrecedence(this.falseExpr, parenthesis);
    if (parenthesis === "all" || this.falseExpr.type === "OperatorNode" || falsePrecedence !== null && falsePrecedence <= precedence) {
      falseExpr = '<span class="math-parenthesis math-round-parenthesis">(</span>' + falseExpr + '<span class="math-parenthesis math-round-parenthesis">)</span>';
    }
    return condition + '<span class="math-operator math-conditional-operator">?</span>' + trueExpr + '<span class="math-operator math-conditional-operator">:</span>' + falseExpr;
  };
  ConditionalNode.prototype._toTex = function(options) {
    return "\\begin{cases} {" + this.trueExpr.toTex(options) + "}, &\\quad{\\text{if }\\;" + this.condition.toTex(options) + "}\\\\{" + this.falseExpr.toTex(options) + "}, &\\quad{\\text{otherwise}}\\end{cases}";
  };
  function testCondition(condition) {
    if (typeof condition === "number" || typeof condition === "boolean" || typeof condition === "string") {
      return !!condition;
    }
    if (condition) {
      if (isBigNumber(condition)) {
        return !condition.isZero();
      }
      if (isComplex(condition)) {
        return !!(condition.re || condition.im);
      }
      if (isUnit(condition)) {
        return !!condition.value;
      }
    }
    if (condition === null || condition === void 0) {
      return false;
    }
    throw new TypeError('Unsupported type of condition "' + typeOf(condition) + '"');
  }
  return ConditionalNode;
}, {
  isClass: true,
  isNode: true
});
var _extends$3 = Object.assign || function(target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i];
    for (var key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        target[key] = source[key];
      }
    }
  }
  return target;
};
var defaultEscapes = {
  "{": "\\{",
  "}": "\\}",
  "\\": "\\textbackslash{}",
  "#": "\\#",
  $: "\\$",
  "%": "\\%",
  "&": "\\&",
  "^": "\\textasciicircum{}",
  _: "\\_",
  "~": "\\textasciitilde{}"
};
var formatEscapes = {
  "\u2013": "\\--",
  "\u2014": "\\---",
  " ": "~",
  "	": "\\qquad{}",
  "\r\n": "\\newline{}",
  "\n": "\\newline{}"
};
var defaultEscapeMapFn = function defaultEscapeMapFn2(defaultEscapes2, formatEscapes2) {
  return _extends$3({}, defaultEscapes2, formatEscapes2);
};
var dist = function(str) {
  var _ref = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, _ref$preserveFormatti = _ref.preserveFormatting, preserveFormatting = _ref$preserveFormatti === void 0 ? false : _ref$preserveFormatti, _ref$escapeMapFn = _ref.escapeMapFn, escapeMapFn = _ref$escapeMapFn === void 0 ? defaultEscapeMapFn : _ref$escapeMapFn;
  var runningStr = String(str);
  var result = "";
  var escapes = escapeMapFn(_extends$3({}, defaultEscapes), preserveFormatting ? _extends$3({}, formatEscapes) : {});
  var escapeKeys = Object.keys(escapes);
  var _loop = function _loop2() {
    var specialCharFound = false;
    escapeKeys.forEach(function(key, index) {
      if (specialCharFound) {
        return;
      }
      if (runningStr.length >= key.length && runningStr.slice(0, key.length) === key) {
        result += escapes[escapeKeys[index]];
        runningStr = runningStr.slice(key.length, runningStr.length);
        specialCharFound = true;
      }
    });
    if (!specialCharFound) {
      result += runningStr.slice(0, 1);
      runningStr = runningStr.slice(1, runningStr.length);
    }
  };
  while (runningStr) {
    _loop();
  }
  return result;
};
var escapeLatexLib = dist;
var latexSymbols = {
  Alpha: "A",
  alpha: "\\alpha",
  Beta: "B",
  beta: "\\beta",
  Gamma: "\\Gamma",
  gamma: "\\gamma",
  Delta: "\\Delta",
  delta: "\\delta",
  Epsilon: "E",
  epsilon: "\\epsilon",
  varepsilon: "\\varepsilon",
  Zeta: "Z",
  zeta: "\\zeta",
  Eta: "H",
  eta: "\\eta",
  Theta: "\\Theta",
  theta: "\\theta",
  vartheta: "\\vartheta",
  Iota: "I",
  iota: "\\iota",
  Kappa: "K",
  kappa: "\\kappa",
  varkappa: "\\varkappa",
  Lambda: "\\Lambda",
  lambda: "\\lambda",
  Mu: "M",
  mu: "\\mu",
  Nu: "N",
  nu: "\\nu",
  Xi: "\\Xi",
  xi: "\\xi",
  Omicron: "O",
  omicron: "o",
  Pi: "\\Pi",
  pi: "\\pi",
  varpi: "\\varpi",
  Rho: "P",
  rho: "\\rho",
  varrho: "\\varrho",
  Sigma: "\\Sigma",
  sigma: "\\sigma",
  varsigma: "\\varsigma",
  Tau: "T",
  tau: "\\tau",
  Upsilon: "\\Upsilon",
  upsilon: "\\upsilon",
  Phi: "\\Phi",
  phi: "\\phi",
  varphi: "\\varphi",
  Chi: "X",
  chi: "\\chi",
  Psi: "\\Psi",
  psi: "\\psi",
  Omega: "\\Omega",
  omega: "\\omega",
  true: "\\mathrm{True}",
  false: "\\mathrm{False}",
  i: "i",
  inf: "\\infty",
  Inf: "\\infty",
  infinity: "\\infty",
  Infinity: "\\infty",
  oo: "\\infty",
  lim: "\\lim",
  undefined: "\\mathbf{?}"
};
var latexOperators = {
  transpose: "^\\top",
  ctranspose: "^H",
  factorial: "!",
  pow: "^",
  dotPow: ".^\\wedge",
  unaryPlus: "+",
  unaryMinus: "-",
  bitNot: "\\~",
  not: "\\neg",
  multiply: "\\cdot",
  divide: "\\frac",
  dotMultiply: ".\\cdot",
  dotDivide: ".:",
  mod: "\\mod",
  add: "+",
  subtract: "-",
  to: "\\rightarrow",
  leftShift: "<<",
  rightArithShift: ">>",
  rightLogShift: ">>>",
  equal: "=",
  unequal: "\\neq",
  smaller: "<",
  larger: ">",
  smallerEq: "\\leq",
  largerEq: "\\geq",
  bitAnd: "\\&",
  bitXor: "\\underline{|}",
  bitOr: "|",
  and: "\\wedge",
  xor: "\\veebar",
  or: "\\vee"
};
var latexFunctions = {
  abs: {
    1: "\\left|${args[0]}\\right|"
  },
  add: {
    2: "\\left(${args[0]}".concat(latexOperators.add, "${args[1]}\\right)")
  },
  cbrt: {
    1: "\\sqrt[3]{${args[0]}}"
  },
  ceil: {
    1: "\\left\\lceil${args[0]}\\right\\rceil"
  },
  cube: {
    1: "\\left(${args[0]}\\right)^3"
  },
  divide: {
    2: "\\frac{${args[0]}}{${args[1]}}"
  },
  dotDivide: {
    2: "\\left(${args[0]}".concat(latexOperators.dotDivide, "${args[1]}\\right)")
  },
  dotMultiply: {
    2: "\\left(${args[0]}".concat(latexOperators.dotMultiply, "${args[1]}\\right)")
  },
  dotPow: {
    2: "\\left(${args[0]}".concat(latexOperators.dotPow, "${args[1]}\\right)")
  },
  exp: {
    1: "\\exp\\left(${args[0]}\\right)"
  },
  expm1: "\\left(e".concat(latexOperators.pow, "{${args[0]}}-1\\right)"),
  fix: {
    1: "\\mathrm{${name}}\\left(${args[0]}\\right)"
  },
  floor: {
    1: "\\left\\lfloor${args[0]}\\right\\rfloor"
  },
  gcd: "\\gcd\\left(${args}\\right)",
  hypot: "\\hypot\\left(${args}\\right)",
  log: {
    1: "\\ln\\left(${args[0]}\\right)",
    2: "\\log_{${args[1]}}\\left(${args[0]}\\right)"
  },
  log10: {
    1: "\\log_{10}\\left(${args[0]}\\right)"
  },
  log1p: {
    1: "\\ln\\left(${args[0]}+1\\right)",
    2: "\\log_{${args[1]}}\\left(${args[0]}+1\\right)"
  },
  log2: "\\log_{2}\\left(${args[0]}\\right)",
  mod: {
    2: "\\left(${args[0]}".concat(latexOperators.mod, "${args[1]}\\right)")
  },
  multiply: {
    2: "\\left(${args[0]}".concat(latexOperators.multiply, "${args[1]}\\right)")
  },
  norm: {
    1: "\\left\\|${args[0]}\\right\\|",
    2: void 0
  },
  nthRoot: {
    2: "\\sqrt[${args[1]}]{${args[0]}}"
  },
  nthRoots: {
    2: "\\{y : $y^{args[1]} = {${args[0]}}\\}"
  },
  pow: {
    2: "\\left(${args[0]}\\right)".concat(latexOperators.pow, "{${args[1]}}")
  },
  round: {
    1: "\\left\\lfloor${args[0]}\\right\\rceil",
    2: void 0
  },
  sign: {
    1: "\\mathrm{${name}}\\left(${args[0]}\\right)"
  },
  sqrt: {
    1: "\\sqrt{${args[0]}}"
  },
  square: {
    1: "\\left(${args[0]}\\right)^2"
  },
  subtract: {
    2: "\\left(${args[0]}".concat(latexOperators.subtract, "${args[1]}\\right)")
  },
  unaryMinus: {
    1: "".concat(latexOperators.unaryMinus, "\\left(${args[0]}\\right)")
  },
  unaryPlus: {
    1: "".concat(latexOperators.unaryPlus, "\\left(${args[0]}\\right)")
  },
  bitAnd: {
    2: "\\left(${args[0]}".concat(latexOperators.bitAnd, "${args[1]}\\right)")
  },
  bitNot: {
    1: latexOperators.bitNot + "\\left(${args[0]}\\right)"
  },
  bitOr: {
    2: "\\left(${args[0]}".concat(latexOperators.bitOr, "${args[1]}\\right)")
  },
  bitXor: {
    2: "\\left(${args[0]}".concat(latexOperators.bitXor, "${args[1]}\\right)")
  },
  leftShift: {
    2: "\\left(${args[0]}".concat(latexOperators.leftShift, "${args[1]}\\right)")
  },
  rightArithShift: {
    2: "\\left(${args[0]}".concat(latexOperators.rightArithShift, "${args[1]}\\right)")
  },
  rightLogShift: {
    2: "\\left(${args[0]}".concat(latexOperators.rightLogShift, "${args[1]}\\right)")
  },
  bellNumbers: {
    1: "\\mathrm{B}_{${args[0]}}"
  },
  catalan: {
    1: "\\mathrm{C}_{${args[0]}}"
  },
  stirlingS2: {
    2: "\\mathrm{S}\\left(${args}\\right)"
  },
  arg: {
    1: "\\arg\\left(${args[0]}\\right)"
  },
  conj: {
    1: "\\left(${args[0]}\\right)^*"
  },
  im: {
    1: "\\Im\\left\\lbrace${args[0]}\\right\\rbrace"
  },
  re: {
    1: "\\Re\\left\\lbrace${args[0]}\\right\\rbrace"
  },
  and: {
    2: "\\left(${args[0]}".concat(latexOperators.and, "${args[1]}\\right)")
  },
  not: {
    1: latexOperators.not + "\\left(${args[0]}\\right)"
  },
  or: {
    2: "\\left(${args[0]}".concat(latexOperators.or, "${args[1]}\\right)")
  },
  xor: {
    2: "\\left(${args[0]}".concat(latexOperators.xor, "${args[1]}\\right)")
  },
  cross: {
    2: "\\left(${args[0]}\\right)\\times\\left(${args[1]}\\right)"
  },
  ctranspose: {
    1: "\\left(${args[0]}\\right)".concat(latexOperators.ctranspose)
  },
  det: {
    1: "\\det\\left(${args[0]}\\right)"
  },
  dot: {
    2: "\\left(${args[0]}\\cdot${args[1]}\\right)"
  },
  expm: {
    1: "\\exp\\left(${args[0]}\\right)"
  },
  inv: {
    1: "\\left(${args[0]}\\right)^{-1}"
  },
  sqrtm: {
    1: "{${args[0]}}".concat(latexOperators.pow, "{\\frac{1}{2}}")
  },
  trace: {
    1: "\\mathrm{tr}\\left(${args[0]}\\right)"
  },
  transpose: {
    1: "\\left(${args[0]}\\right)".concat(latexOperators.transpose)
  },
  combinations: {
    2: "\\binom{${args[0]}}{${args[1]}}"
  },
  combinationsWithRep: {
    2: "\\left(\\!\\!{\\binom{${args[0]}}{${args[1]}}}\\!\\!\\right)"
  },
  factorial: {
    1: "\\left(${args[0]}\\right)".concat(latexOperators.factorial)
  },
  gamma: {
    1: "\\Gamma\\left(${args[0]}\\right)"
  },
  equal: {
    2: "\\left(${args[0]}".concat(latexOperators.equal, "${args[1]}\\right)")
  },
  larger: {
    2: "\\left(${args[0]}".concat(latexOperators.larger, "${args[1]}\\right)")
  },
  largerEq: {
    2: "\\left(${args[0]}".concat(latexOperators.largerEq, "${args[1]}\\right)")
  },
  smaller: {
    2: "\\left(${args[0]}".concat(latexOperators.smaller, "${args[1]}\\right)")
  },
  smallerEq: {
    2: "\\left(${args[0]}".concat(latexOperators.smallerEq, "${args[1]}\\right)")
  },
  unequal: {
    2: "\\left(${args[0]}".concat(latexOperators.unequal, "${args[1]}\\right)")
  },
  erf: {
    1: "erf\\left(${args[0]}\\right)"
  },
  max: "\\max\\left(${args}\\right)",
  min: "\\min\\left(${args}\\right)",
  variance: "\\mathrm{Var}\\left(${args}\\right)",
  acos: {
    1: "\\cos^{-1}\\left(${args[0]}\\right)"
  },
  acosh: {
    1: "\\cosh^{-1}\\left(${args[0]}\\right)"
  },
  acot: {
    1: "\\cot^{-1}\\left(${args[0]}\\right)"
  },
  acoth: {
    1: "\\coth^{-1}\\left(${args[0]}\\right)"
  },
  acsc: {
    1: "\\csc^{-1}\\left(${args[0]}\\right)"
  },
  acsch: {
    1: "\\mathrm{csch}^{-1}\\left(${args[0]}\\right)"
  },
  asec: {
    1: "\\sec^{-1}\\left(${args[0]}\\right)"
  },
  asech: {
    1: "\\mathrm{sech}^{-1}\\left(${args[0]}\\right)"
  },
  asin: {
    1: "\\sin^{-1}\\left(${args[0]}\\right)"
  },
  asinh: {
    1: "\\sinh^{-1}\\left(${args[0]}\\right)"
  },
  atan: {
    1: "\\tan^{-1}\\left(${args[0]}\\right)"
  },
  atan2: {
    2: "\\mathrm{atan2}\\left(${args}\\right)"
  },
  atanh: {
    1: "\\tanh^{-1}\\left(${args[0]}\\right)"
  },
  cos: {
    1: "\\cos\\left(${args[0]}\\right)"
  },
  cosh: {
    1: "\\cosh\\left(${args[0]}\\right)"
  },
  cot: {
    1: "\\cot\\left(${args[0]}\\right)"
  },
  coth: {
    1: "\\coth\\left(${args[0]}\\right)"
  },
  csc: {
    1: "\\csc\\left(${args[0]}\\right)"
  },
  csch: {
    1: "\\mathrm{csch}\\left(${args[0]}\\right)"
  },
  sec: {
    1: "\\sec\\left(${args[0]}\\right)"
  },
  sech: {
    1: "\\mathrm{sech}\\left(${args[0]}\\right)"
  },
  sin: {
    1: "\\sin\\left(${args[0]}\\right)"
  },
  sinh: {
    1: "\\sinh\\left(${args[0]}\\right)"
  },
  tan: {
    1: "\\tan\\left(${args[0]}\\right)"
  },
  tanh: {
    1: "\\tanh\\left(${args[0]}\\right)"
  },
  to: {
    2: "\\left(${args[0]}".concat(latexOperators.to, "${args[1]}\\right)")
  },
  numeric: function numeric(node, options) {
    return node.args[0].toTex();
  },
  number: {
    0: "0",
    1: "\\left(${args[0]}\\right)",
    2: "\\left(\\left(${args[0]}\\right)${args[1]}\\right)"
  },
  string: {
    0: '\\mathtt{""}',
    1: "\\mathrm{string}\\left(${args[0]}\\right)"
  },
  bignumber: {
    0: "0",
    1: "\\left(${args[0]}\\right)"
  },
  complex: {
    0: "0",
    1: "\\left(${args[0]}\\right)",
    2: "\\left(\\left(${args[0]}\\right)+".concat(latexSymbols.i, "\\cdot\\left(${args[1]}\\right)\\right)")
  },
  matrix: {
    0: "\\begin{bmatrix}\\end{bmatrix}",
    1: "\\left(${args[0]}\\right)",
    2: "\\left(${args[0]}\\right)"
  },
  sparse: {
    0: "\\begin{bsparse}\\end{bsparse}",
    1: "\\left(${args[0]}\\right)"
  },
  unit: {
    1: "\\left(${args[0]}\\right)",
    2: "\\left(\\left(${args[0]}\\right)${args[1]}\\right)"
  }
};
var defaultTemplate = "\\mathrm{${name}}\\left(${args}\\right)";
var latexUnits = {
  deg: "^\\circ"
};
function escapeLatex(string) {
  return escapeLatexLib(string, {
    preserveFormatting: true
  });
}
function toSymbol(name2, isUnit2) {
  isUnit2 = typeof isUnit2 === "undefined" ? false : isUnit2;
  if (isUnit2) {
    if (hasOwnProperty$1(latexUnits, name2)) {
      return latexUnits[name2];
    }
    return "\\mathrm{" + escapeLatex(name2) + "}";
  }
  if (hasOwnProperty$1(latexSymbols, name2)) {
    return latexSymbols[name2];
  }
  return escapeLatex(name2);
}
var name$f = "ConstantNode";
var dependencies$f = ["Node"];
var createConstantNode = /* @__PURE__ */ factory(name$f, dependencies$f, (_ref) => {
  var {
    Node
  } = _ref;
  function ConstantNode(value) {
    if (!(this instanceof ConstantNode)) {
      throw new SyntaxError("Constructor must be called with the new operator");
    }
    this.value = value;
  }
  ConstantNode.prototype = new Node();
  ConstantNode.prototype.type = "ConstantNode";
  ConstantNode.prototype.isConstantNode = true;
  ConstantNode.prototype._compile = function(math, argNames) {
    var value = this.value;
    return function evalConstantNode() {
      return value;
    };
  };
  ConstantNode.prototype.forEach = function(callback) {
  };
  ConstantNode.prototype.map = function(callback) {
    return this.clone();
  };
  ConstantNode.prototype.clone = function() {
    return new ConstantNode(this.value);
  };
  ConstantNode.prototype._toString = function(options) {
    return format(this.value, options);
  };
  ConstantNode.prototype.toHTML = function(options) {
    var value = this._toString(options);
    switch (typeOf(this.value)) {
      case "number":
      case "BigNumber":
      case "Fraction":
        return '<span class="math-number">' + value + "</span>";
      case "string":
        return '<span class="math-string">' + value + "</span>";
      case "boolean":
        return '<span class="math-boolean">' + value + "</span>";
      case "null":
        return '<span class="math-null-symbol">' + value + "</span>";
      case "undefined":
        return '<span class="math-undefined">' + value + "</span>";
      default:
        return '<span class="math-symbol">' + value + "</span>";
    }
  };
  ConstantNode.prototype.toJSON = function() {
    return {
      mathjs: "ConstantNode",
      value: this.value
    };
  };
  ConstantNode.fromJSON = function(json) {
    return new ConstantNode(json.value);
  };
  ConstantNode.prototype._toTex = function(options) {
    var value = this._toString(options);
    switch (typeOf(this.value)) {
      case "string":
        return "\\mathtt{" + escapeLatex(value) + "}";
      case "number":
      case "BigNumber":
        {
          if (!isFinite(this.value)) {
            return this.value.valueOf() < 0 ? "-\\infty" : "\\infty";
          }
          var index = value.toLowerCase().indexOf("e");
          if (index !== -1) {
            return value.substring(0, index) + "\\cdot10^{" + value.substring(index + 1) + "}";
          }
        }
        return value;
      case "Fraction":
        return this.value.toLatex();
      default:
        return value;
    }
  };
  return ConstantNode;
}, {
  isClass: true,
  isNode: true
});
var name$e = "FunctionAssignmentNode";
var dependencies$e = ["typed", "Node"];
var createFunctionAssignmentNode = /* @__PURE__ */ factory(name$e, dependencies$e, (_ref) => {
  var {
    typed,
    Node
  } = _ref;
  function FunctionAssignmentNode(name2, params, expr) {
    if (!(this instanceof FunctionAssignmentNode)) {
      throw new SyntaxError("Constructor must be called with the new operator");
    }
    if (typeof name2 !== "string")
      throw new TypeError('String expected for parameter "name"');
    if (!Array.isArray(params))
      throw new TypeError('Array containing strings or objects expected for parameter "params"');
    if (!isNode(expr))
      throw new TypeError('Node expected for parameter "expr"');
    if (name2 in keywords)
      throw new Error('Illegal function name, "' + name2 + '" is a reserved keyword');
    this.name = name2;
    this.params = params.map(function(param) {
      return param && param.name || param;
    });
    this.types = params.map(function(param) {
      return param && param.type || "any";
    });
    this.expr = expr;
  }
  FunctionAssignmentNode.prototype = new Node();
  FunctionAssignmentNode.prototype.type = "FunctionAssignmentNode";
  FunctionAssignmentNode.prototype.isFunctionAssignmentNode = true;
  FunctionAssignmentNode.prototype._compile = function(math, argNames) {
    var childArgNames = Object.create(argNames);
    forEach(this.params, function(param) {
      childArgNames[param] = true;
    });
    var evalExpr = this.expr._compile(math, childArgNames);
    var name2 = this.name;
    var params = this.params;
    var signature = join(this.types, ",");
    var syntax = name2 + "(" + join(this.params, ", ") + ")";
    return function evalFunctionAssignmentNode(scope, args, context) {
      var signatures = {};
      signatures[signature] = function() {
        var childArgs = Object.create(args);
        for (var i = 0; i < params.length; i++) {
          childArgs[params[i]] = arguments[i];
        }
        return evalExpr(scope, childArgs, context);
      };
      var fn = typed(name2, signatures);
      fn.syntax = syntax;
      setSafeProperty(scope, name2, fn);
      return fn;
    };
  };
  FunctionAssignmentNode.prototype.forEach = function(callback) {
    callback(this.expr, "expr", this);
  };
  FunctionAssignmentNode.prototype.map = function(callback) {
    var expr = this._ifNode(callback(this.expr, "expr", this));
    return new FunctionAssignmentNode(this.name, this.params.slice(0), expr);
  };
  FunctionAssignmentNode.prototype.clone = function() {
    return new FunctionAssignmentNode(this.name, this.params.slice(0), this.expr);
  };
  function needParenthesis(node, parenthesis) {
    var precedence = getPrecedence(node, parenthesis);
    var exprPrecedence = getPrecedence(node.expr, parenthesis);
    return parenthesis === "all" || exprPrecedence !== null && exprPrecedence <= precedence;
  }
  FunctionAssignmentNode.prototype._toString = function(options) {
    var parenthesis = options && options.parenthesis ? options.parenthesis : "keep";
    var expr = this.expr.toString(options);
    if (needParenthesis(this, parenthesis)) {
      expr = "(" + expr + ")";
    }
    return this.name + "(" + this.params.join(", ") + ") = " + expr;
  };
  FunctionAssignmentNode.prototype.toJSON = function() {
    var types = this.types;
    return {
      mathjs: "FunctionAssignmentNode",
      name: this.name,
      params: this.params.map(function(param, index) {
        return {
          name: param,
          type: types[index]
        };
      }),
      expr: this.expr
    };
  };
  FunctionAssignmentNode.fromJSON = function(json) {
    return new FunctionAssignmentNode(json.name, json.params, json.expr);
  };
  FunctionAssignmentNode.prototype.toHTML = function(options) {
    var parenthesis = options && options.parenthesis ? options.parenthesis : "keep";
    var params = [];
    for (var i = 0; i < this.params.length; i++) {
      params.push('<span class="math-symbol math-parameter">' + escape(this.params[i]) + "</span>");
    }
    var expr = this.expr.toHTML(options);
    if (needParenthesis(this, parenthesis)) {
      expr = '<span class="math-parenthesis math-round-parenthesis">(</span>' + expr + '<span class="math-parenthesis math-round-parenthesis">)</span>';
    }
    return '<span class="math-function">' + escape(this.name) + '</span><span class="math-parenthesis math-round-parenthesis">(</span>' + params.join('<span class="math-separator">,</span>') + '<span class="math-parenthesis math-round-parenthesis">)</span><span class="math-operator math-assignment-operator math-variable-assignment-operator math-binary-operator">=</span>' + expr;
  };
  FunctionAssignmentNode.prototype._toTex = function(options) {
    var parenthesis = options && options.parenthesis ? options.parenthesis : "keep";
    var expr = this.expr.toTex(options);
    if (needParenthesis(this, parenthesis)) {
      expr = "\\left(".concat(expr, "\\right)");
    }
    return "\\mathrm{" + this.name + "}\\left(" + this.params.map(toSymbol).join(",") + "\\right):=" + expr;
  };
  return FunctionAssignmentNode;
}, {
  isClass: true,
  isNode: true
});
var name$d = "IndexNode";
var dependencies$d = ["Range", "Node", "size"];
var createIndexNode = /* @__PURE__ */ factory(name$d, dependencies$d, (_ref) => {
  var {
    Range,
    Node,
    size
  } = _ref;
  function IndexNode(dimensions, dotNotation) {
    if (!(this instanceof IndexNode)) {
      throw new SyntaxError("Constructor must be called with the new operator");
    }
    this.dimensions = dimensions;
    this.dotNotation = dotNotation || false;
    if (!Array.isArray(dimensions) || !dimensions.every(isNode)) {
      throw new TypeError('Array containing Nodes expected for parameter "dimensions"');
    }
    if (this.dotNotation && !this.isObjectProperty()) {
      throw new Error("dotNotation only applicable for object properties");
    }
  }
  IndexNode.prototype = new Node();
  IndexNode.prototype.type = "IndexNode";
  IndexNode.prototype.isIndexNode = true;
  IndexNode.prototype._compile = function(math, argNames) {
    var evalDimensions = map(this.dimensions, function(range, i) {
      if (isRangeNode(range)) {
        if (range.needsEnd()) {
          var childArgNames = Object.create(argNames);
          childArgNames.end = true;
          var evalStart = range.start._compile(math, childArgNames);
          var evalEnd = range.end._compile(math, childArgNames);
          var evalStep = range.step ? range.step._compile(math, childArgNames) : function() {
            return 1;
          };
          return function evalDimension(scope, args, context) {
            var s = size(context).valueOf();
            var childArgs = Object.create(args);
            childArgs.end = s[i];
            return createRange(evalStart(scope, childArgs, context), evalEnd(scope, childArgs, context), evalStep(scope, childArgs, context));
          };
        } else {
          var _evalStart = range.start._compile(math, argNames);
          var _evalEnd = range.end._compile(math, argNames);
          var _evalStep = range.step ? range.step._compile(math, argNames) : function() {
            return 1;
          };
          return function evalDimension(scope, args, context) {
            return createRange(_evalStart(scope, args, context), _evalEnd(scope, args, context), _evalStep(scope, args, context));
          };
        }
      } else if (isSymbolNode(range) && range.name === "end") {
        var _childArgNames = Object.create(argNames);
        _childArgNames.end = true;
        var evalRange = range._compile(math, _childArgNames);
        return function evalDimension(scope, args, context) {
          var s = size(context).valueOf();
          var childArgs = Object.create(args);
          childArgs.end = s[i];
          return evalRange(scope, childArgs, context);
        };
      } else {
        var _evalRange = range._compile(math, argNames);
        return function evalDimension(scope, args, context) {
          return _evalRange(scope, args, context);
        };
      }
    });
    var index = getSafeProperty(math, "index");
    return function evalIndexNode(scope, args, context) {
      var dimensions = map(evalDimensions, function(evalDimension) {
        return evalDimension(scope, args, context);
      });
      return index(...dimensions);
    };
  };
  IndexNode.prototype.forEach = function(callback) {
    for (var i = 0; i < this.dimensions.length; i++) {
      callback(this.dimensions[i], "dimensions[" + i + "]", this);
    }
  };
  IndexNode.prototype.map = function(callback) {
    var dimensions = [];
    for (var i = 0; i < this.dimensions.length; i++) {
      dimensions[i] = this._ifNode(callback(this.dimensions[i], "dimensions[" + i + "]", this));
    }
    return new IndexNode(dimensions, this.dotNotation);
  };
  IndexNode.prototype.clone = function() {
    return new IndexNode(this.dimensions.slice(0), this.dotNotation);
  };
  IndexNode.prototype.isObjectProperty = function() {
    return this.dimensions.length === 1 && isConstantNode(this.dimensions[0]) && typeof this.dimensions[0].value === "string";
  };
  IndexNode.prototype.getObjectProperty = function() {
    return this.isObjectProperty() ? this.dimensions[0].value : null;
  };
  IndexNode.prototype._toString = function(options) {
    return this.dotNotation ? "." + this.getObjectProperty() : "[" + this.dimensions.join(", ") + "]";
  };
  IndexNode.prototype.toJSON = function() {
    return {
      mathjs: "IndexNode",
      dimensions: this.dimensions,
      dotNotation: this.dotNotation
    };
  };
  IndexNode.fromJSON = function(json) {
    return new IndexNode(json.dimensions, json.dotNotation);
  };
  IndexNode.prototype.toHTML = function(options) {
    var dimensions = [];
    for (var i = 0; i < this.dimensions.length; i++) {
      dimensions[i] = this.dimensions[i].toHTML();
    }
    if (this.dotNotation) {
      return '<span class="math-operator math-accessor-operator">.</span><span class="math-symbol math-property">' + escape(this.getObjectProperty()) + "</span>";
    } else {
      return '<span class="math-parenthesis math-square-parenthesis">[</span>' + dimensions.join('<span class="math-separator">,</span>') + '<span class="math-parenthesis math-square-parenthesis">]</span>';
    }
  };
  IndexNode.prototype._toTex = function(options) {
    var dimensions = this.dimensions.map(function(range) {
      return range.toTex(options);
    });
    return this.dotNotation ? "." + this.getObjectProperty() : "_{" + dimensions.join(",") + "}";
  };
  function createRange(start, end, step) {
    return new Range(isBigNumber(start) ? start.toNumber() : start, isBigNumber(end) ? end.toNumber() : end, isBigNumber(step) ? step.toNumber() : step);
  }
  return IndexNode;
}, {
  isClass: true,
  isNode: true
});
var name$c = "ObjectNode";
var dependencies$c = ["Node"];
var createObjectNode = /* @__PURE__ */ factory(name$c, dependencies$c, (_ref) => {
  var {
    Node
  } = _ref;
  function ObjectNode(properties2) {
    if (!(this instanceof ObjectNode)) {
      throw new SyntaxError("Constructor must be called with the new operator");
    }
    this.properties = properties2 || {};
    if (properties2) {
      if (!(typeof properties2 === "object") || !Object.keys(properties2).every(function(key) {
        return isNode(properties2[key]);
      })) {
        throw new TypeError("Object containing Nodes expected");
      }
    }
  }
  ObjectNode.prototype = new Node();
  ObjectNode.prototype.type = "ObjectNode";
  ObjectNode.prototype.isObjectNode = true;
  ObjectNode.prototype._compile = function(math, argNames) {
    var evalEntries = {};
    for (var key in this.properties) {
      if (hasOwnProperty$1(this.properties, key)) {
        var stringifiedKey = stringify(key);
        var parsedKey = JSON.parse(stringifiedKey);
        if (!isSafeProperty(this.properties, parsedKey)) {
          throw new Error('No access to property "' + parsedKey + '"');
        }
        evalEntries[parsedKey] = this.properties[key]._compile(math, argNames);
      }
    }
    return function evalObjectNode(scope, args, context) {
      var obj = {};
      for (var _key in evalEntries) {
        if (hasOwnProperty$1(evalEntries, _key)) {
          obj[_key] = evalEntries[_key](scope, args, context);
        }
      }
      return obj;
    };
  };
  ObjectNode.prototype.forEach = function(callback) {
    for (var key in this.properties) {
      if (hasOwnProperty$1(this.properties, key)) {
        callback(this.properties[key], "properties[" + stringify(key) + "]", this);
      }
    }
  };
  ObjectNode.prototype.map = function(callback) {
    var properties2 = {};
    for (var key in this.properties) {
      if (hasOwnProperty$1(this.properties, key)) {
        properties2[key] = this._ifNode(callback(this.properties[key], "properties[" + stringify(key) + "]", this));
      }
    }
    return new ObjectNode(properties2);
  };
  ObjectNode.prototype.clone = function() {
    var properties2 = {};
    for (var key in this.properties) {
      if (hasOwnProperty$1(this.properties, key)) {
        properties2[key] = this.properties[key];
      }
    }
    return new ObjectNode(properties2);
  };
  ObjectNode.prototype._toString = function(options) {
    var entries = [];
    for (var key in this.properties) {
      if (hasOwnProperty$1(this.properties, key)) {
        entries.push(stringify(key) + ": " + this.properties[key].toString(options));
      }
    }
    return "{" + entries.join(", ") + "}";
  };
  ObjectNode.prototype.toJSON = function() {
    return {
      mathjs: "ObjectNode",
      properties: this.properties
    };
  };
  ObjectNode.fromJSON = function(json) {
    return new ObjectNode(json.properties);
  };
  ObjectNode.prototype.toHTML = function(options) {
    var entries = [];
    for (var key in this.properties) {
      if (hasOwnProperty$1(this.properties, key)) {
        entries.push('<span class="math-symbol math-property">' + escape(key) + '</span><span class="math-operator math-assignment-operator math-property-assignment-operator math-binary-operator">:</span>' + this.properties[key].toHTML(options));
      }
    }
    return '<span class="math-parenthesis math-curly-parenthesis">{</span>' + entries.join('<span class="math-separator">,</span>') + '<span class="math-parenthesis math-curly-parenthesis">}</span>';
  };
  ObjectNode.prototype._toTex = function(options) {
    var entries = [];
    for (var key in this.properties) {
      if (hasOwnProperty$1(this.properties, key)) {
        entries.push("\\mathbf{" + key + ":} & " + this.properties[key].toTex(options) + "\\\\");
      }
    }
    return "\\left\\{\\begin{array}{ll}".concat(entries.join("\n"), "\\end{array}\\right\\}");
  };
  return ObjectNode;
}, {
  isClass: true,
  isNode: true
});
var name$b = "OperatorNode";
var dependencies$b = ["Node"];
var createOperatorNode = /* @__PURE__ */ factory(name$b, dependencies$b, (_ref) => {
  var {
    Node
  } = _ref;
  function OperatorNode(op, fn, args, implicit) {
    if (!(this instanceof OperatorNode)) {
      throw new SyntaxError("Constructor must be called with the new operator");
    }
    if (typeof op !== "string") {
      throw new TypeError('string expected for parameter "op"');
    }
    if (typeof fn !== "string") {
      throw new TypeError('string expected for parameter "fn"');
    }
    if (!Array.isArray(args) || !args.every(isNode)) {
      throw new TypeError('Array containing Nodes expected for parameter "args"');
    }
    this.implicit = implicit === true;
    this.op = op;
    this.fn = fn;
    this.args = args || [];
  }
  OperatorNode.prototype = new Node();
  OperatorNode.prototype.type = "OperatorNode";
  OperatorNode.prototype.isOperatorNode = true;
  OperatorNode.prototype._compile = function(math, argNames) {
    if (typeof this.fn !== "string" || !isSafeMethod(math, this.fn)) {
      if (!math[this.fn]) {
        throw new Error("Function " + this.fn + ' missing in provided namespace "math"');
      } else {
        throw new Error('No access to function "' + this.fn + '"');
      }
    }
    var fn = getSafeProperty(math, this.fn);
    var evalArgs = map(this.args, function(arg) {
      return arg._compile(math, argNames);
    });
    if (evalArgs.length === 1) {
      var evalArg0 = evalArgs[0];
      return function evalOperatorNode(scope, args, context) {
        return fn(evalArg0(scope, args, context));
      };
    } else if (evalArgs.length === 2) {
      var _evalArg = evalArgs[0];
      var evalArg1 = evalArgs[1];
      return function evalOperatorNode(scope, args, context) {
        return fn(_evalArg(scope, args, context), evalArg1(scope, args, context));
      };
    } else {
      return function evalOperatorNode(scope, args, context) {
        return fn.apply(null, map(evalArgs, function(evalArg) {
          return evalArg(scope, args, context);
        }));
      };
    }
  };
  OperatorNode.prototype.forEach = function(callback) {
    for (var i = 0; i < this.args.length; i++) {
      callback(this.args[i], "args[" + i + "]", this);
    }
  };
  OperatorNode.prototype.map = function(callback) {
    var args = [];
    for (var i = 0; i < this.args.length; i++) {
      args[i] = this._ifNode(callback(this.args[i], "args[" + i + "]", this));
    }
    return new OperatorNode(this.op, this.fn, args, this.implicit);
  };
  OperatorNode.prototype.clone = function() {
    return new OperatorNode(this.op, this.fn, this.args.slice(0), this.implicit);
  };
  OperatorNode.prototype.isUnary = function() {
    return this.args.length === 1;
  };
  OperatorNode.prototype.isBinary = function() {
    return this.args.length === 2;
  };
  function calculateNecessaryParentheses(root, parenthesis, implicit, args, latex) {
    var precedence = getPrecedence(root, parenthesis);
    var associativity = getAssociativity(root, parenthesis);
    if (parenthesis === "all" || args.length > 2 && root.getIdentifier() !== "OperatorNode:add" && root.getIdentifier() !== "OperatorNode:multiply") {
      return args.map(function(arg) {
        switch (arg.getContent().type) {
          case "ArrayNode":
          case "ConstantNode":
          case "SymbolNode":
          case "ParenthesisNode":
            return false;
          default:
            return true;
        }
      });
    }
    var result;
    switch (args.length) {
      case 0:
        result = [];
        break;
      case 1:
        {
          var operandPrecedence = getPrecedence(args[0], parenthesis);
          if (latex && operandPrecedence !== null) {
            var operandIdentifier;
            var rootIdentifier;
            if (parenthesis === "keep") {
              operandIdentifier = args[0].getIdentifier();
              rootIdentifier = root.getIdentifier();
            } else {
              operandIdentifier = args[0].getContent().getIdentifier();
              rootIdentifier = root.getContent().getIdentifier();
            }
            if (properties[precedence][rootIdentifier].latexLeftParens === false) {
              result = [false];
              break;
            }
            if (properties[operandPrecedence][operandIdentifier].latexParens === false) {
              result = [false];
              break;
            }
          }
          if (operandPrecedence === null) {
            result = [false];
            break;
          }
          if (operandPrecedence <= precedence) {
            result = [true];
            break;
          }
          result = [false];
        }
        break;
      case 2:
        {
          var lhsParens;
          var lhsPrecedence = getPrecedence(args[0], parenthesis);
          var assocWithLhs = isAssociativeWith(root, args[0], parenthesis);
          if (lhsPrecedence === null) {
            lhsParens = false;
          } else if (lhsPrecedence === precedence && associativity === "right" && !assocWithLhs) {
            lhsParens = true;
          } else if (lhsPrecedence < precedence) {
            lhsParens = true;
          } else {
            lhsParens = false;
          }
          var rhsParens;
          var rhsPrecedence = getPrecedence(args[1], parenthesis);
          var assocWithRhs = isAssociativeWith(root, args[1], parenthesis);
          if (rhsPrecedence === null) {
            rhsParens = false;
          } else if (rhsPrecedence === precedence && associativity === "left" && !assocWithRhs) {
            rhsParens = true;
          } else if (rhsPrecedence < precedence) {
            rhsParens = true;
          } else {
            rhsParens = false;
          }
          if (latex) {
            var _rootIdentifier;
            var lhsIdentifier;
            var rhsIdentifier;
            if (parenthesis === "keep") {
              _rootIdentifier = root.getIdentifier();
              lhsIdentifier = root.args[0].getIdentifier();
              rhsIdentifier = root.args[1].getIdentifier();
            } else {
              _rootIdentifier = root.getContent().getIdentifier();
              lhsIdentifier = root.args[0].getContent().getIdentifier();
              rhsIdentifier = root.args[1].getContent().getIdentifier();
            }
            if (lhsPrecedence !== null) {
              if (properties[precedence][_rootIdentifier].latexLeftParens === false) {
                lhsParens = false;
              }
              if (properties[lhsPrecedence][lhsIdentifier].latexParens === false) {
                lhsParens = false;
              }
            }
            if (rhsPrecedence !== null) {
              if (properties[precedence][_rootIdentifier].latexRightParens === false) {
                rhsParens = false;
              }
              if (properties[rhsPrecedence][rhsIdentifier].latexParens === false) {
                rhsParens = false;
              }
            }
          }
          result = [lhsParens, rhsParens];
        }
        break;
      default:
        if (root.getIdentifier() === "OperatorNode:add" || root.getIdentifier() === "OperatorNode:multiply") {
          result = args.map(function(arg) {
            var argPrecedence = getPrecedence(arg, parenthesis);
            var assocWithArg = isAssociativeWith(root, arg, parenthesis);
            var argAssociativity = getAssociativity(arg, parenthesis);
            if (argPrecedence === null) {
              return false;
            } else if (precedence === argPrecedence && associativity === argAssociativity && !assocWithArg) {
              return true;
            } else if (argPrecedence < precedence) {
              return true;
            }
            return false;
          });
        }
        break;
    }
    if (args.length >= 2 && root.getIdentifier() === "OperatorNode:multiply" && root.implicit && parenthesis === "auto" && implicit === "hide") {
      result = args.map(function(arg, index) {
        var isParenthesisNode2 = arg.getIdentifier() === "ParenthesisNode";
        if (result[index] || isParenthesisNode2) {
          return true;
        }
        return false;
      });
    }
    return result;
  }
  OperatorNode.prototype._toString = function(options) {
    var parenthesis = options && options.parenthesis ? options.parenthesis : "keep";
    var implicit = options && options.implicit ? options.implicit : "hide";
    var args = this.args;
    var parens = calculateNecessaryParentheses(this, parenthesis, implicit, args, false);
    if (args.length === 1) {
      var assoc = getAssociativity(this, parenthesis);
      var operand = args[0].toString(options);
      if (parens[0]) {
        operand = "(" + operand + ")";
      }
      var opIsNamed = /[a-zA-Z]+/.test(this.op);
      if (assoc === "right") {
        return this.op + (opIsNamed ? " " : "") + operand;
      } else if (assoc === "left") {
        return operand + (opIsNamed ? " " : "") + this.op;
      }
      return operand + this.op;
    } else if (args.length === 2) {
      var lhs = args[0].toString(options);
      var rhs = args[1].toString(options);
      if (parens[0]) {
        lhs = "(" + lhs + ")";
      }
      if (parens[1]) {
        rhs = "(" + rhs + ")";
      }
      if (this.implicit && this.getIdentifier() === "OperatorNode:multiply" && implicit === "hide") {
        return lhs + " " + rhs;
      }
      return lhs + " " + this.op + " " + rhs;
    } else if (args.length > 2 && (this.getIdentifier() === "OperatorNode:add" || this.getIdentifier() === "OperatorNode:multiply")) {
      var stringifiedArgs = args.map(function(arg, index) {
        arg = arg.toString(options);
        if (parens[index]) {
          arg = "(" + arg + ")";
        }
        return arg;
      });
      if (this.implicit && this.getIdentifier() === "OperatorNode:multiply" && implicit === "hide") {
        return stringifiedArgs.join(" ");
      }
      return stringifiedArgs.join(" " + this.op + " ");
    } else {
      return this.fn + "(" + this.args.join(", ") + ")";
    }
  };
  OperatorNode.prototype.toJSON = function() {
    return {
      mathjs: "OperatorNode",
      op: this.op,
      fn: this.fn,
      args: this.args,
      implicit: this.implicit
    };
  };
  OperatorNode.fromJSON = function(json) {
    return new OperatorNode(json.op, json.fn, json.args, json.implicit);
  };
  OperatorNode.prototype.toHTML = function(options) {
    var parenthesis = options && options.parenthesis ? options.parenthesis : "keep";
    var implicit = options && options.implicit ? options.implicit : "hide";
    var args = this.args;
    var parens = calculateNecessaryParentheses(this, parenthesis, implicit, args, false);
    if (args.length === 1) {
      var assoc = getAssociativity(this, parenthesis);
      var operand = args[0].toHTML(options);
      if (parens[0]) {
        operand = '<span class="math-parenthesis math-round-parenthesis">(</span>' + operand + '<span class="math-parenthesis math-round-parenthesis">)</span>';
      }
      if (assoc === "right") {
        return '<span class="math-operator math-unary-operator math-lefthand-unary-operator">' + escape(this.op) + "</span>" + operand;
      } else {
        return operand + '<span class="math-operator math-unary-operator math-righthand-unary-operator">' + escape(this.op) + "</span>";
      }
    } else if (args.length === 2) {
      var lhs = args[0].toHTML(options);
      var rhs = args[1].toHTML(options);
      if (parens[0]) {
        lhs = '<span class="math-parenthesis math-round-parenthesis">(</span>' + lhs + '<span class="math-parenthesis math-round-parenthesis">)</span>';
      }
      if (parens[1]) {
        rhs = '<span class="math-parenthesis math-round-parenthesis">(</span>' + rhs + '<span class="math-parenthesis math-round-parenthesis">)</span>';
      }
      if (this.implicit && this.getIdentifier() === "OperatorNode:multiply" && implicit === "hide") {
        return lhs + '<span class="math-operator math-binary-operator math-implicit-binary-operator"></span>' + rhs;
      }
      return lhs + '<span class="math-operator math-binary-operator math-explicit-binary-operator">' + escape(this.op) + "</span>" + rhs;
    } else {
      var stringifiedArgs = args.map(function(arg, index) {
        arg = arg.toHTML(options);
        if (parens[index]) {
          arg = '<span class="math-parenthesis math-round-parenthesis">(</span>' + arg + '<span class="math-parenthesis math-round-parenthesis">)</span>';
        }
        return arg;
      });
      if (args.length > 2 && (this.getIdentifier() === "OperatorNode:add" || this.getIdentifier() === "OperatorNode:multiply")) {
        if (this.implicit && this.getIdentifier() === "OperatorNode:multiply" && implicit === "hide") {
          return stringifiedArgs.join('<span class="math-operator math-binary-operator math-implicit-binary-operator"></span>');
        }
        return stringifiedArgs.join('<span class="math-operator math-binary-operator math-explicit-binary-operator">' + escape(this.op) + "</span>");
      } else {
        return '<span class="math-function">' + escape(this.fn) + '</span><span class="math-paranthesis math-round-parenthesis">(</span>' + stringifiedArgs.join('<span class="math-separator">,</span>') + '<span class="math-paranthesis math-round-parenthesis">)</span>';
      }
    }
  };
  OperatorNode.prototype._toTex = function(options) {
    var parenthesis = options && options.parenthesis ? options.parenthesis : "keep";
    var implicit = options && options.implicit ? options.implicit : "hide";
    var args = this.args;
    var parens = calculateNecessaryParentheses(this, parenthesis, implicit, args, true);
    var op = latexOperators[this.fn];
    op = typeof op === "undefined" ? this.op : op;
    if (args.length === 1) {
      var assoc = getAssociativity(this, parenthesis);
      var operand = args[0].toTex(options);
      if (parens[0]) {
        operand = "\\left(".concat(operand, "\\right)");
      }
      if (assoc === "right") {
        return op + operand;
      } else if (assoc === "left") {
        return operand + op;
      }
      return operand + op;
    } else if (args.length === 2) {
      var lhs = args[0];
      var lhsTex = lhs.toTex(options);
      if (parens[0]) {
        lhsTex = "\\left(".concat(lhsTex, "\\right)");
      }
      var rhs = args[1];
      var rhsTex = rhs.toTex(options);
      if (parens[1]) {
        rhsTex = "\\left(".concat(rhsTex, "\\right)");
      }
      var lhsIdentifier;
      if (parenthesis === "keep") {
        lhsIdentifier = lhs.getIdentifier();
      } else {
        lhsIdentifier = lhs.getContent().getIdentifier();
      }
      switch (this.getIdentifier()) {
        case "OperatorNode:divide":
          return op + "{" + lhsTex + "}{" + rhsTex + "}";
        case "OperatorNode:pow":
          lhsTex = "{" + lhsTex + "}";
          rhsTex = "{" + rhsTex + "}";
          switch (lhsIdentifier) {
            case "ConditionalNode":
            case "OperatorNode:divide":
              lhsTex = "\\left(".concat(lhsTex, "\\right)");
          }
          break;
        case "OperatorNode:multiply":
          if (this.implicit && implicit === "hide") {
            return lhsTex + "~" + rhsTex;
          }
      }
      return lhsTex + op + rhsTex;
    } else if (args.length > 2 && (this.getIdentifier() === "OperatorNode:add" || this.getIdentifier() === "OperatorNode:multiply")) {
      var texifiedArgs = args.map(function(arg, index) {
        arg = arg.toTex(options);
        if (parens[index]) {
          arg = "\\left(".concat(arg, "\\right)");
        }
        return arg;
      });
      if (this.getIdentifier() === "OperatorNode:multiply" && this.implicit) {
        return texifiedArgs.join("~");
      }
      return texifiedArgs.join(op);
    } else {
      return "\\mathrm{" + this.fn + "}\\left(" + args.map(function(arg) {
        return arg.toTex(options);
      }).join(",") + "\\right)";
    }
  };
  OperatorNode.prototype.getIdentifier = function() {
    return this.type + ":" + this.fn;
  };
  return OperatorNode;
}, {
  isClass: true,
  isNode: true
});
var name$a = "ParenthesisNode";
var dependencies$a = ["Node"];
var createParenthesisNode = /* @__PURE__ */ factory(name$a, dependencies$a, (_ref) => {
  var {
    Node
  } = _ref;
  function ParenthesisNode(content) {
    if (!(this instanceof ParenthesisNode)) {
      throw new SyntaxError("Constructor must be called with the new operator");
    }
    if (!isNode(content)) {
      throw new TypeError('Node expected for parameter "content"');
    }
    this.content = content;
  }
  ParenthesisNode.prototype = new Node();
  ParenthesisNode.prototype.type = "ParenthesisNode";
  ParenthesisNode.prototype.isParenthesisNode = true;
  ParenthesisNode.prototype._compile = function(math, argNames) {
    return this.content._compile(math, argNames);
  };
  ParenthesisNode.prototype.getContent = function() {
    return this.content.getContent();
  };
  ParenthesisNode.prototype.forEach = function(callback) {
    callback(this.content, "content", this);
  };
  ParenthesisNode.prototype.map = function(callback) {
    var content = callback(this.content, "content", this);
    return new ParenthesisNode(content);
  };
  ParenthesisNode.prototype.clone = function() {
    return new ParenthesisNode(this.content);
  };
  ParenthesisNode.prototype._toString = function(options) {
    if (!options || options && !options.parenthesis || options && options.parenthesis === "keep") {
      return "(" + this.content.toString(options) + ")";
    }
    return this.content.toString(options);
  };
  ParenthesisNode.prototype.toJSON = function() {
    return {
      mathjs: "ParenthesisNode",
      content: this.content
    };
  };
  ParenthesisNode.fromJSON = function(json) {
    return new ParenthesisNode(json.content);
  };
  ParenthesisNode.prototype.toHTML = function(options) {
    if (!options || options && !options.parenthesis || options && options.parenthesis === "keep") {
      return '<span class="math-parenthesis math-round-parenthesis">(</span>' + this.content.toHTML(options) + '<span class="math-parenthesis math-round-parenthesis">)</span>';
    }
    return this.content.toHTML(options);
  };
  ParenthesisNode.prototype._toTex = function(options) {
    if (!options || options && !options.parenthesis || options && options.parenthesis === "keep") {
      return "\\left(".concat(this.content.toTex(options), "\\right)");
    }
    return this.content.toTex(options);
  };
  return ParenthesisNode;
}, {
  isClass: true,
  isNode: true
});
var name$9 = "RangeNode";
var dependencies$9 = ["Node"];
var createRangeNode = /* @__PURE__ */ factory(name$9, dependencies$9, (_ref) => {
  var {
    Node
  } = _ref;
  function RangeNode(start, end, step) {
    if (!(this instanceof RangeNode)) {
      throw new SyntaxError("Constructor must be called with the new operator");
    }
    if (!isNode(start))
      throw new TypeError("Node expected");
    if (!isNode(end))
      throw new TypeError("Node expected");
    if (step && !isNode(step))
      throw new TypeError("Node expected");
    if (arguments.length > 3)
      throw new Error("Too many arguments");
    this.start = start;
    this.end = end;
    this.step = step || null;
  }
  RangeNode.prototype = new Node();
  RangeNode.prototype.type = "RangeNode";
  RangeNode.prototype.isRangeNode = true;
  RangeNode.prototype.needsEnd = function() {
    var endSymbols = this.filter(function(node) {
      return isSymbolNode(node) && node.name === "end";
    });
    return endSymbols.length > 0;
  };
  RangeNode.prototype._compile = function(math, argNames) {
    var range = math.range;
    var evalStart = this.start._compile(math, argNames);
    var evalEnd = this.end._compile(math, argNames);
    if (this.step) {
      var evalStep = this.step._compile(math, argNames);
      return function evalRangeNode(scope, args, context) {
        return range(evalStart(scope, args, context), evalEnd(scope, args, context), evalStep(scope, args, context));
      };
    } else {
      return function evalRangeNode(scope, args, context) {
        return range(evalStart(scope, args, context), evalEnd(scope, args, context));
      };
    }
  };
  RangeNode.prototype.forEach = function(callback) {
    callback(this.start, "start", this);
    callback(this.end, "end", this);
    if (this.step) {
      callback(this.step, "step", this);
    }
  };
  RangeNode.prototype.map = function(callback) {
    return new RangeNode(this._ifNode(callback(this.start, "start", this)), this._ifNode(callback(this.end, "end", this)), this.step && this._ifNode(callback(this.step, "step", this)));
  };
  RangeNode.prototype.clone = function() {
    return new RangeNode(this.start, this.end, this.step && this.step);
  };
  function calculateNecessaryParentheses(node, parenthesis) {
    var precedence = getPrecedence(node, parenthesis);
    var parens = {};
    var startPrecedence = getPrecedence(node.start, parenthesis);
    parens.start = startPrecedence !== null && startPrecedence <= precedence || parenthesis === "all";
    if (node.step) {
      var stepPrecedence = getPrecedence(node.step, parenthesis);
      parens.step = stepPrecedence !== null && stepPrecedence <= precedence || parenthesis === "all";
    }
    var endPrecedence = getPrecedence(node.end, parenthesis);
    parens.end = endPrecedence !== null && endPrecedence <= precedence || parenthesis === "all";
    return parens;
  }
  RangeNode.prototype._toString = function(options) {
    var parenthesis = options && options.parenthesis ? options.parenthesis : "keep";
    var parens = calculateNecessaryParentheses(this, parenthesis);
    var str;
    var start = this.start.toString(options);
    if (parens.start) {
      start = "(" + start + ")";
    }
    str = start;
    if (this.step) {
      var step = this.step.toString(options);
      if (parens.step) {
        step = "(" + step + ")";
      }
      str += ":" + step;
    }
    var end = this.end.toString(options);
    if (parens.end) {
      end = "(" + end + ")";
    }
    str += ":" + end;
    return str;
  };
  RangeNode.prototype.toJSON = function() {
    return {
      mathjs: "RangeNode",
      start: this.start,
      end: this.end,
      step: this.step
    };
  };
  RangeNode.fromJSON = function(json) {
    return new RangeNode(json.start, json.end, json.step);
  };
  RangeNode.prototype.toHTML = function(options) {
    var parenthesis = options && options.parenthesis ? options.parenthesis : "keep";
    var parens = calculateNecessaryParentheses(this, parenthesis);
    var str;
    var start = this.start.toHTML(options);
    if (parens.start) {
      start = '<span class="math-parenthesis math-round-parenthesis">(</span>' + start + '<span class="math-parenthesis math-round-parenthesis">)</span>';
    }
    str = start;
    if (this.step) {
      var step = this.step.toHTML(options);
      if (parens.step) {
        step = '<span class="math-parenthesis math-round-parenthesis">(</span>' + step + '<span class="math-parenthesis math-round-parenthesis">)</span>';
      }
      str += '<span class="math-operator math-range-operator">:</span>' + step;
    }
    var end = this.end.toHTML(options);
    if (parens.end) {
      end = '<span class="math-parenthesis math-round-parenthesis">(</span>' + end + '<span class="math-parenthesis math-round-parenthesis">)</span>';
    }
    str += '<span class="math-operator math-range-operator">:</span>' + end;
    return str;
  };
  RangeNode.prototype._toTex = function(options) {
    var parenthesis = options && options.parenthesis ? options.parenthesis : "keep";
    var parens = calculateNecessaryParentheses(this, parenthesis);
    var str = this.start.toTex(options);
    if (parens.start) {
      str = "\\left(".concat(str, "\\right)");
    }
    if (this.step) {
      var step = this.step.toTex(options);
      if (parens.step) {
        step = "\\left(".concat(step, "\\right)");
      }
      str += ":" + step;
    }
    var end = this.end.toTex(options);
    if (parens.end) {
      end = "\\left(".concat(end, "\\right)");
    }
    str += ":" + end;
    return str;
  };
  return RangeNode;
}, {
  isClass: true,
  isNode: true
});
var name$8 = "RelationalNode";
var dependencies$8 = ["Node"];
var createRelationalNode = /* @__PURE__ */ factory(name$8, dependencies$8, (_ref) => {
  var {
    Node
  } = _ref;
  function RelationalNode(conditionals, params) {
    if (!(this instanceof RelationalNode)) {
      throw new SyntaxError("Constructor must be called with the new operator");
    }
    if (!Array.isArray(conditionals))
      throw new TypeError("Parameter conditionals must be an array");
    if (!Array.isArray(params))
      throw new TypeError("Parameter params must be an array");
    if (conditionals.length !== params.length - 1)
      throw new TypeError("Parameter params must contain exactly one more element than parameter conditionals");
    this.conditionals = conditionals;
    this.params = params;
  }
  RelationalNode.prototype = new Node();
  RelationalNode.prototype.type = "RelationalNode";
  RelationalNode.prototype.isRelationalNode = true;
  RelationalNode.prototype._compile = function(math, argNames) {
    var self2 = this;
    var compiled = this.params.map((p) => p._compile(math, argNames));
    return function evalRelationalNode(scope, args, context) {
      var evalLhs;
      var evalRhs = compiled[0](scope, args, context);
      for (var i = 0; i < self2.conditionals.length; i++) {
        evalLhs = evalRhs;
        evalRhs = compiled[i + 1](scope, args, context);
        var condFn = getSafeProperty(math, self2.conditionals[i]);
        if (!condFn(evalLhs, evalRhs)) {
          return false;
        }
      }
      return true;
    };
  };
  RelationalNode.prototype.forEach = function(callback) {
    this.params.forEach((n, i) => callback(n, "params[" + i + "]", this), this);
  };
  RelationalNode.prototype.map = function(callback) {
    return new RelationalNode(this.conditionals.slice(), this.params.map((n, i) => this._ifNode(callback(n, "params[" + i + "]", this)), this));
  };
  RelationalNode.prototype.clone = function() {
    return new RelationalNode(this.conditionals, this.params);
  };
  RelationalNode.prototype._toString = function(options) {
    var parenthesis = options && options.parenthesis ? options.parenthesis : "keep";
    var precedence = getPrecedence(this, parenthesis);
    var paramStrings = this.params.map(function(p, index) {
      var paramPrecedence = getPrecedence(p, parenthesis);
      return parenthesis === "all" || paramPrecedence !== null && paramPrecedence <= precedence ? "(" + p.toString(options) + ")" : p.toString(options);
    });
    var operatorMap = {
      equal: "==",
      unequal: "!=",
      smaller: "<",
      larger: ">",
      smallerEq: "<=",
      largerEq: ">="
    };
    var ret = paramStrings[0];
    for (var i = 0; i < this.conditionals.length; i++) {
      ret += " " + operatorMap[this.conditionals[i]] + " " + paramStrings[i + 1];
    }
    return ret;
  };
  RelationalNode.prototype.toJSON = function() {
    return {
      mathjs: "RelationalNode",
      conditionals: this.conditionals,
      params: this.params
    };
  };
  RelationalNode.fromJSON = function(json) {
    return new RelationalNode(json.conditionals, json.params);
  };
  RelationalNode.prototype.toHTML = function(options) {
    var parenthesis = options && options.parenthesis ? options.parenthesis : "keep";
    var precedence = getPrecedence(this, parenthesis);
    var paramStrings = this.params.map(function(p, index) {
      var paramPrecedence = getPrecedence(p, parenthesis);
      return parenthesis === "all" || paramPrecedence !== null && paramPrecedence <= precedence ? '<span class="math-parenthesis math-round-parenthesis">(</span>' + p.toHTML(options) + '<span class="math-parenthesis math-round-parenthesis">)</span>' : p.toHTML(options);
    });
    var operatorMap = {
      equal: "==",
      unequal: "!=",
      smaller: "<",
      larger: ">",
      smallerEq: "<=",
      largerEq: ">="
    };
    var ret = paramStrings[0];
    for (var i = 0; i < this.conditionals.length; i++) {
      ret += '<span class="math-operator math-binary-operator math-explicit-binary-operator">' + escape(operatorMap[this.conditionals[i]]) + "</span>" + paramStrings[i + 1];
    }
    return ret;
  };
  RelationalNode.prototype._toTex = function(options) {
    var parenthesis = options && options.parenthesis ? options.parenthesis : "keep";
    var precedence = getPrecedence(this, parenthesis);
    var paramStrings = this.params.map(function(p, index) {
      var paramPrecedence = getPrecedence(p, parenthesis);
      return parenthesis === "all" || paramPrecedence !== null && paramPrecedence <= precedence ? "\\left(" + p.toTex(options) + "\right)" : p.toTex(options);
    });
    var ret = paramStrings[0];
    for (var i = 0; i < this.conditionals.length; i++) {
      ret += latexOperators[this.conditionals[i]] + paramStrings[i + 1];
    }
    return ret;
  };
  return RelationalNode;
}, {
  isClass: true,
  isNode: true
});
var name$7 = "SymbolNode";
var dependencies$7 = ["math", "?Unit", "Node"];
var createSymbolNode = /* @__PURE__ */ factory(name$7, dependencies$7, (_ref) => {
  var {
    math,
    Unit,
    Node
  } = _ref;
  function isValuelessUnit(name2) {
    return Unit ? Unit.isValuelessUnit(name2) : false;
  }
  function SymbolNode(name2) {
    if (!(this instanceof SymbolNode)) {
      throw new SyntaxError("Constructor must be called with the new operator");
    }
    if (typeof name2 !== "string")
      throw new TypeError('String expected for parameter "name"');
    this.name = name2;
  }
  SymbolNode.prototype = new Node();
  SymbolNode.prototype.type = "SymbolNode";
  SymbolNode.prototype.isSymbolNode = true;
  SymbolNode.prototype._compile = function(math2, argNames) {
    var name2 = this.name;
    if (argNames[name2] === true) {
      return function(scope, args, context) {
        return args[name2];
      };
    } else if (name2 in math2) {
      return function(scope, args, context) {
        return name2 in scope ? getSafeProperty(scope, name2) : getSafeProperty(math2, name2);
      };
    } else {
      var isUnit2 = isValuelessUnit(name2);
      return function(scope, args, context) {
        return name2 in scope ? getSafeProperty(scope, name2) : isUnit2 ? new Unit(null, name2) : undef(name2);
      };
    }
  };
  SymbolNode.prototype.forEach = function(callback) {
  };
  SymbolNode.prototype.map = function(callback) {
    return this.clone();
  };
  function undef(name2) {
    throw new Error("Undefined symbol " + name2);
  }
  SymbolNode.prototype.clone = function() {
    return new SymbolNode(this.name);
  };
  SymbolNode.prototype._toString = function(options) {
    return this.name;
  };
  SymbolNode.prototype.toHTML = function(options) {
    var name2 = escape(this.name);
    if (name2 === "true" || name2 === "false") {
      return '<span class="math-symbol math-boolean">' + name2 + "</span>";
    } else if (name2 === "i") {
      return '<span class="math-symbol math-imaginary-symbol">' + name2 + "</span>";
    } else if (name2 === "Infinity") {
      return '<span class="math-symbol math-infinity-symbol">' + name2 + "</span>";
    } else if (name2 === "NaN") {
      return '<span class="math-symbol math-nan-symbol">' + name2 + "</span>";
    } else if (name2 === "null") {
      return '<span class="math-symbol math-null-symbol">' + name2 + "</span>";
    } else if (name2 === "undefined") {
      return '<span class="math-symbol math-undefined-symbol">' + name2 + "</span>";
    }
    return '<span class="math-symbol">' + name2 + "</span>";
  };
  SymbolNode.prototype.toJSON = function() {
    return {
      mathjs: "SymbolNode",
      name: this.name
    };
  };
  SymbolNode.fromJSON = function(json) {
    return new SymbolNode(json.name);
  };
  SymbolNode.prototype._toTex = function(options) {
    var isUnit2 = false;
    if (typeof math[this.name] === "undefined" && isValuelessUnit(this.name)) {
      isUnit2 = true;
    }
    var symbol = toSymbol(this.name, isUnit2);
    if (symbol[0] === "\\") {
      return symbol;
    }
    return " " + symbol;
  };
  return SymbolNode;
}, {
  isClass: true,
  isNode: true
});
function _extends$2() {
  _extends$2 = Object.assign || function(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];
      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }
    return target;
  };
  return _extends$2.apply(this, arguments);
}
var name$6 = "FunctionNode";
var dependencies$6 = ["math", "Node", "SymbolNode"];
var createFunctionNode = /* @__PURE__ */ factory(name$6, dependencies$6, (_ref) => {
  var {
    math,
    Node,
    SymbolNode
  } = _ref;
  function FunctionNode(fn, args) {
    if (!(this instanceof FunctionNode)) {
      throw new SyntaxError("Constructor must be called with the new operator");
    }
    if (typeof fn === "string") {
      fn = new SymbolNode(fn);
    }
    if (!isNode(fn))
      throw new TypeError('Node expected as parameter "fn"');
    if (!Array.isArray(args) || !args.every(isNode)) {
      throw new TypeError('Array containing Nodes expected for parameter "args"');
    }
    this.fn = fn;
    this.args = args || [];
    Object.defineProperty(this, "name", {
      get: function() {
        return this.fn.name || "";
      }.bind(this),
      set: function set() {
        throw new Error("Cannot assign a new name, name is read-only");
      }
    });
  }
  FunctionNode.prototype = new Node();
  FunctionNode.prototype.type = "FunctionNode";
  FunctionNode.prototype.isFunctionNode = true;
  FunctionNode.prototype._compile = function(math2, argNames) {
    if (!(this instanceof FunctionNode)) {
      throw new TypeError("No valid FunctionNode");
    }
    var evalArgs = map(this.args, function(arg) {
      return arg._compile(math2, argNames);
    });
    if (isSymbolNode(this.fn)) {
      var _name = this.fn.name;
      var fn = _name in math2 ? getSafeProperty(math2, _name) : void 0;
      var isRaw = typeof fn === "function" && fn.rawArgs === true;
      if (isRaw) {
        var rawArgs = this.args;
        return function evalFunctionNode(scope, args, context) {
          return (_name in scope ? getSafeProperty(scope, _name) : fn)(rawArgs, math2, _extends$2({}, scope, args));
        };
      } else {
        if (evalArgs.length === 1) {
          var evalArg0 = evalArgs[0];
          return function evalFunctionNode(scope, args, context) {
            return (_name in scope ? getSafeProperty(scope, _name) : fn)(evalArg0(scope, args, context));
          };
        } else if (evalArgs.length === 2) {
          var _evalArg = evalArgs[0];
          var evalArg1 = evalArgs[1];
          return function evalFunctionNode(scope, args, context) {
            return (_name in scope ? getSafeProperty(scope, _name) : fn)(_evalArg(scope, args, context), evalArg1(scope, args, context));
          };
        } else {
          return function evalFunctionNode(scope, args, context) {
            return (_name in scope ? getSafeProperty(scope, _name) : fn).apply(null, map(evalArgs, function(evalArg) {
              return evalArg(scope, args, context);
            }));
          };
        }
      }
    } else if (isAccessorNode(this.fn) && isIndexNode(this.fn.index) && this.fn.index.isObjectProperty()) {
      var evalObject = this.fn.object._compile(math2, argNames);
      var prop = this.fn.index.getObjectProperty();
      var _rawArgs = this.args;
      return function evalFunctionNode(scope, args, context) {
        var object = evalObject(scope, args, context);
        validateSafeMethod(object, prop);
        var isRaw2 = object[prop] && object[prop].rawArgs;
        return isRaw2 ? object[prop](_rawArgs, math2, _extends$2({}, scope, args)) : object[prop].apply(object, map(evalArgs, function(evalArg) {
          return evalArg(scope, args, context);
        }));
      };
    } else {
      var evalFn = this.fn._compile(math2, argNames);
      var _rawArgs2 = this.args;
      return function evalFunctionNode(scope, args, context) {
        var fn2 = evalFn(scope, args, context);
        var isRaw2 = fn2 && fn2.rawArgs;
        return isRaw2 ? fn2(_rawArgs2, math2, _extends$2({}, scope, args)) : fn2.apply(fn2, map(evalArgs, function(evalArg) {
          return evalArg(scope, args, context);
        }));
      };
    }
  };
  FunctionNode.prototype.forEach = function(callback) {
    callback(this.fn, "fn", this);
    for (var i = 0; i < this.args.length; i++) {
      callback(this.args[i], "args[" + i + "]", this);
    }
  };
  FunctionNode.prototype.map = function(callback) {
    var fn = this._ifNode(callback(this.fn, "fn", this));
    var args = [];
    for (var i = 0; i < this.args.length; i++) {
      args[i] = this._ifNode(callback(this.args[i], "args[" + i + "]", this));
    }
    return new FunctionNode(fn, args);
  };
  FunctionNode.prototype.clone = function() {
    return new FunctionNode(this.fn, this.args.slice(0));
  };
  var nodeToString = FunctionNode.prototype.toString;
  FunctionNode.prototype.toString = function(options) {
    var customString;
    var name2 = this.fn.toString(options);
    if (options && typeof options.handler === "object" && hasOwnProperty$1(options.handler, name2)) {
      customString = options.handler[name2](this, options);
    }
    if (typeof customString !== "undefined") {
      return customString;
    }
    return nodeToString.call(this, options);
  };
  FunctionNode.prototype._toString = function(options) {
    var args = this.args.map(function(arg) {
      return arg.toString(options);
    });
    var fn = isFunctionAssignmentNode(this.fn) ? "(" + this.fn.toString(options) + ")" : this.fn.toString(options);
    return fn + "(" + args.join(", ") + ")";
  };
  FunctionNode.prototype.toJSON = function() {
    return {
      mathjs: "FunctionNode",
      fn: this.fn,
      args: this.args
    };
  };
  FunctionNode.fromJSON = function(json) {
    return new FunctionNode(json.fn, json.args);
  };
  FunctionNode.prototype.toHTML = function(options) {
    var args = this.args.map(function(arg) {
      return arg.toHTML(options);
    });
    return '<span class="math-function">' + escape(this.fn) + '</span><span class="math-paranthesis math-round-parenthesis">(</span>' + args.join('<span class="math-separator">,</span>') + '<span class="math-paranthesis math-round-parenthesis">)</span>';
  };
  function expandTemplate(template, node, options) {
    var latex = "";
    var regex = /\$(?:\{([a-z_][a-z_0-9]*)(?:\[([0-9]+)\])?\}|\$)/gi;
    var inputPos = 0;
    var match;
    while ((match = regex.exec(template)) !== null) {
      latex += template.substring(inputPos, match.index);
      inputPos = match.index;
      if (match[0] === "$$") {
        latex += "$";
        inputPos++;
      } else {
        inputPos += match[0].length;
        var property = node[match[1]];
        if (!property) {
          throw new ReferenceError("Template: Property " + match[1] + " does not exist.");
        }
        if (match[2] === void 0) {
          switch (typeof property) {
            case "string":
              latex += property;
              break;
            case "object":
              if (isNode(property)) {
                latex += property.toTex(options);
              } else if (Array.isArray(property)) {
                latex += property.map(function(arg, index) {
                  if (isNode(arg)) {
                    return arg.toTex(options);
                  }
                  throw new TypeError("Template: " + match[1] + "[" + index + "] is not a Node.");
                }).join(",");
              } else {
                throw new TypeError("Template: " + match[1] + " has to be a Node, String or array of Nodes");
              }
              break;
            default:
              throw new TypeError("Template: " + match[1] + " has to be a Node, String or array of Nodes");
          }
        } else {
          if (isNode(property[match[2]] && property[match[2]])) {
            latex += property[match[2]].toTex(options);
          } else {
            throw new TypeError("Template: " + match[1] + "[" + match[2] + "] is not a Node.");
          }
        }
      }
    }
    latex += template.slice(inputPos);
    return latex;
  }
  var nodeToTex = FunctionNode.prototype.toTex;
  FunctionNode.prototype.toTex = function(options) {
    var customTex;
    if (options && typeof options.handler === "object" && hasOwnProperty$1(options.handler, this.name)) {
      customTex = options.handler[this.name](this, options);
    }
    if (typeof customTex !== "undefined") {
      return customTex;
    }
    return nodeToTex.call(this, options);
  };
  FunctionNode.prototype._toTex = function(options) {
    var args = this.args.map(function(arg) {
      return arg.toTex(options);
    });
    var latexConverter;
    if (latexFunctions[this.name]) {
      latexConverter = latexFunctions[this.name];
    }
    if (math[this.name] && (typeof math[this.name].toTex === "function" || typeof math[this.name].toTex === "object" || typeof math[this.name].toTex === "string")) {
      latexConverter = math[this.name].toTex;
    }
    var customToTex;
    switch (typeof latexConverter) {
      case "function":
        customToTex = latexConverter(this, options);
        break;
      case "string":
        customToTex = expandTemplate(latexConverter, this, options);
        break;
      case "object":
        switch (typeof latexConverter[args.length]) {
          case "function":
            customToTex = latexConverter[args.length](this, options);
            break;
          case "string":
            customToTex = expandTemplate(latexConverter[args.length], this, options);
            break;
        }
    }
    if (typeof customToTex !== "undefined") {
      return customToTex;
    }
    return expandTemplate(defaultTemplate, this, options);
  };
  FunctionNode.prototype.getIdentifier = function() {
    return this.type + ":" + this.name;
  };
  return FunctionNode;
}, {
  isClass: true,
  isNode: true
});
function _extends$1() {
  _extends$1 = Object.assign || function(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];
      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }
    return target;
  };
  return _extends$1.apply(this, arguments);
}
var name$5 = "parse";
var dependencies$5 = ["typed", "numeric", "config", "AccessorNode", "ArrayNode", "AssignmentNode", "BlockNode", "ConditionalNode", "ConstantNode", "FunctionAssignmentNode", "FunctionNode", "IndexNode", "ObjectNode", "OperatorNode", "ParenthesisNode", "RangeNode", "RelationalNode", "SymbolNode"];
var createParse = /* @__PURE__ */ factory(name$5, dependencies$5, (_ref) => {
  var {
    typed,
    numeric: numeric2,
    config: config2,
    AccessorNode,
    ArrayNode,
    AssignmentNode,
    BlockNode,
    ConditionalNode,
    ConstantNode,
    FunctionAssignmentNode,
    FunctionNode,
    IndexNode,
    ObjectNode,
    OperatorNode,
    ParenthesisNode,
    RangeNode,
    RelationalNode,
    SymbolNode
  } = _ref;
  var parse = typed(name$5, {
    string: function string(expression) {
      return parseStart(expression, {});
    },
    "Array | Matrix": function ArrayMatrix(expressions) {
      return parseMultiple(expressions, {});
    },
    "string, Object": function stringObject(expression, options) {
      var extraNodes = options.nodes !== void 0 ? options.nodes : {};
      return parseStart(expression, extraNodes);
    },
    "Array | Matrix, Object": parseMultiple
  });
  function parseMultiple(expressions) {
    var options = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    var extraNodes = options.nodes !== void 0 ? options.nodes : {};
    return deepMap(expressions, function(elem) {
      if (typeof elem !== "string")
        throw new TypeError("String expected");
      return parseStart(elem, extraNodes);
    });
  }
  var TOKENTYPE = {
    NULL: 0,
    DELIMITER: 1,
    NUMBER: 2,
    SYMBOL: 3,
    UNKNOWN: 4
  };
  var DELIMITERS = {
    ",": true,
    "(": true,
    ")": true,
    "[": true,
    "]": true,
    "{": true,
    "}": true,
    '"': true,
    "'": true,
    ";": true,
    "+": true,
    "-": true,
    "*": true,
    ".*": true,
    "/": true,
    "./": true,
    "%": true,
    "^": true,
    ".^": true,
    "~": true,
    "!": true,
    "&": true,
    "|": true,
    "^|": true,
    "=": true,
    ":": true,
    "?": true,
    "==": true,
    "!=": true,
    "<": true,
    ">": true,
    "<=": true,
    ">=": true,
    "<<": true,
    ">>": true,
    ">>>": true
  };
  var NAMED_DELIMITERS = {
    mod: true,
    to: true,
    in: true,
    and: true,
    xor: true,
    or: true,
    not: true
  };
  var CONSTANTS = {
    true: true,
    false: false,
    null: null,
    undefined: void 0
  };
  var NUMERIC_CONSTANTS = ["NaN", "Infinity"];
  function initialState() {
    return {
      extraNodes: {},
      expression: "",
      comment: "",
      index: 0,
      token: "",
      tokenType: TOKENTYPE.NULL,
      nestingLevel: 0,
      conditionalLevel: null
    };
  }
  function currentString(state, length) {
    return state.expression.substr(state.index, length);
  }
  function currentCharacter(state) {
    return currentString(state, 1);
  }
  function next(state) {
    state.index++;
  }
  function prevCharacter(state) {
    return state.expression.charAt(state.index - 1);
  }
  function nextCharacter(state) {
    return state.expression.charAt(state.index + 1);
  }
  function getToken(state) {
    state.tokenType = TOKENTYPE.NULL;
    state.token = "";
    state.comment = "";
    while (parse.isWhitespace(currentCharacter(state), state.nestingLevel)) {
      next(state);
    }
    if (currentCharacter(state) === "#") {
      while (currentCharacter(state) !== "\n" && currentCharacter(state) !== "") {
        state.comment += currentCharacter(state);
        next(state);
      }
    }
    if (currentCharacter(state) === "") {
      state.tokenType = TOKENTYPE.DELIMITER;
      return;
    }
    if (currentCharacter(state) === "\n" && !state.nestingLevel) {
      state.tokenType = TOKENTYPE.DELIMITER;
      state.token = currentCharacter(state);
      next(state);
      return;
    }
    var c1 = currentCharacter(state);
    var c2 = currentString(state, 2);
    var c3 = currentString(state, 3);
    if (c3.length === 3 && DELIMITERS[c3]) {
      state.tokenType = TOKENTYPE.DELIMITER;
      state.token = c3;
      next(state);
      next(state);
      next(state);
      return;
    }
    if (c2.length === 2 && DELIMITERS[c2]) {
      state.tokenType = TOKENTYPE.DELIMITER;
      state.token = c2;
      next(state);
      next(state);
      return;
    }
    if (DELIMITERS[c1]) {
      state.tokenType = TOKENTYPE.DELIMITER;
      state.token = c1;
      next(state);
      return;
    }
    if (parse.isDigitDot(c1)) {
      state.tokenType = TOKENTYPE.NUMBER;
      var _c2 = currentString(state, 2);
      if (_c2 === "0b" || _c2 === "0o" || _c2 === "0x") {
        state.token += currentCharacter(state);
        next(state);
        state.token += currentCharacter(state);
        next(state);
        while (parse.isHexDigit(currentCharacter(state))) {
          state.token += currentCharacter(state);
          next(state);
        }
        return;
      }
      if (currentCharacter(state) === ".") {
        state.token += currentCharacter(state);
        next(state);
        if (!parse.isDigit(currentCharacter(state))) {
          state.tokenType = TOKENTYPE.DELIMITER;
        }
      } else {
        while (parse.isDigit(currentCharacter(state))) {
          state.token += currentCharacter(state);
          next(state);
        }
        if (parse.isDecimalMark(currentCharacter(state), nextCharacter(state))) {
          state.token += currentCharacter(state);
          next(state);
        }
      }
      while (parse.isDigit(currentCharacter(state))) {
        state.token += currentCharacter(state);
        next(state);
      }
      if (currentCharacter(state) === "E" || currentCharacter(state) === "e") {
        if (parse.isDigit(nextCharacter(state)) || nextCharacter(state) === "-" || nextCharacter(state) === "+") {
          state.token += currentCharacter(state);
          next(state);
          if (currentCharacter(state) === "+" || currentCharacter(state) === "-") {
            state.token += currentCharacter(state);
            next(state);
          }
          if (!parse.isDigit(currentCharacter(state))) {
            throw createSyntaxError(state, 'Digit expected, got "' + currentCharacter(state) + '"');
          }
          while (parse.isDigit(currentCharacter(state))) {
            state.token += currentCharacter(state);
            next(state);
          }
          if (parse.isDecimalMark(currentCharacter(state), nextCharacter(state))) {
            throw createSyntaxError(state, 'Digit expected, got "' + currentCharacter(state) + '"');
          }
        } else if (nextCharacter(state) === ".") {
          next(state);
          throw createSyntaxError(state, 'Digit expected, got "' + currentCharacter(state) + '"');
        }
      }
      return;
    }
    if (parse.isAlpha(currentCharacter(state), prevCharacter(state), nextCharacter(state))) {
      while (parse.isAlpha(currentCharacter(state), prevCharacter(state), nextCharacter(state)) || parse.isDigit(currentCharacter(state))) {
        state.token += currentCharacter(state);
        next(state);
      }
      if (hasOwnProperty$1(NAMED_DELIMITERS, state.token)) {
        state.tokenType = TOKENTYPE.DELIMITER;
      } else {
        state.tokenType = TOKENTYPE.SYMBOL;
      }
      return;
    }
    state.tokenType = TOKENTYPE.UNKNOWN;
    while (currentCharacter(state) !== "") {
      state.token += currentCharacter(state);
      next(state);
    }
    throw createSyntaxError(state, 'Syntax error in part "' + state.token + '"');
  }
  function getTokenSkipNewline(state) {
    do {
      getToken(state);
    } while (state.token === "\n");
  }
  function openParams(state) {
    state.nestingLevel++;
  }
  function closeParams(state) {
    state.nestingLevel--;
  }
  parse.isAlpha = function isAlpha(c2, cPrev, cNext) {
    return parse.isValidLatinOrGreek(c2) || parse.isValidMathSymbol(c2, cNext) || parse.isValidMathSymbol(cPrev, c2);
  };
  parse.isValidLatinOrGreek = function isValidLatinOrGreek(c2) {
    return /^[a-zA-Z_$\u00C0-\u02AF\u0370-\u03FF\u2100-\u214F]$/.test(c2);
  };
  parse.isValidMathSymbol = function isValidMathSymbol(high, low) {
    return /^[\uD835]$/.test(high) && /^[\uDC00-\uDFFF]$/.test(low) && /^[^\uDC55\uDC9D\uDCA0\uDCA1\uDCA3\uDCA4\uDCA7\uDCA8\uDCAD\uDCBA\uDCBC\uDCC4\uDD06\uDD0B\uDD0C\uDD15\uDD1D\uDD3A\uDD3F\uDD45\uDD47-\uDD49\uDD51\uDEA6\uDEA7\uDFCC\uDFCD]$/.test(low);
  };
  parse.isWhitespace = function isWhitespace(c2, nestingLevel) {
    return c2 === " " || c2 === "	" || c2 === "\n" && nestingLevel > 0;
  };
  parse.isDecimalMark = function isDecimalMark(c2, cNext) {
    return c2 === "." && cNext !== "/" && cNext !== "*" && cNext !== "^";
  };
  parse.isDigitDot = function isDigitDot(c2) {
    return c2 >= "0" && c2 <= "9" || c2 === ".";
  };
  parse.isDigit = function isDigit(c2) {
    return c2 >= "0" && c2 <= "9";
  };
  parse.isHexDigit = function isHexDigit(c2) {
    return c2 >= "0" && c2 <= "9" || c2 >= "a" && c2 <= "f" || c2 >= "A" && c2 <= "F";
  };
  function parseStart(expression, extraNodes) {
    var state = initialState();
    _extends$1(state, {
      expression,
      extraNodes
    });
    getToken(state);
    var node = parseBlock(state);
    if (state.token !== "") {
      if (state.tokenType === TOKENTYPE.DELIMITER) {
        throw createError(state, "Unexpected operator " + state.token);
      } else {
        throw createSyntaxError(state, 'Unexpected part "' + state.token + '"');
      }
    }
    return node;
  }
  function parseBlock(state) {
    var node;
    var blocks = [];
    var visible;
    if (state.token !== "" && state.token !== "\n" && state.token !== ";") {
      node = parseAssignment(state);
      node.comment = state.comment;
    }
    while (state.token === "\n" || state.token === ";") {
      if (blocks.length === 0 && node) {
        visible = state.token !== ";";
        blocks.push({
          node,
          visible
        });
      }
      getToken(state);
      if (state.token !== "\n" && state.token !== ";" && state.token !== "") {
        node = parseAssignment(state);
        node.comment = state.comment;
        visible = state.token !== ";";
        blocks.push({
          node,
          visible
        });
      }
    }
    if (blocks.length > 0) {
      return new BlockNode(blocks);
    } else {
      if (!node) {
        node = new ConstantNode(void 0);
        node.comment = state.comment;
      }
      return node;
    }
  }
  function parseAssignment(state) {
    var name2, args, value, valid;
    var node = parseConditional(state);
    if (state.token === "=") {
      if (isSymbolNode(node)) {
        name2 = node.name;
        getTokenSkipNewline(state);
        value = parseAssignment(state);
        return new AssignmentNode(new SymbolNode(name2), value);
      } else if (isAccessorNode(node)) {
        getTokenSkipNewline(state);
        value = parseAssignment(state);
        return new AssignmentNode(node.object, node.index, value);
      } else if (isFunctionNode(node) && isSymbolNode(node.fn)) {
        valid = true;
        args = [];
        name2 = node.name;
        node.args.forEach(function(arg, index) {
          if (isSymbolNode(arg)) {
            args[index] = arg.name;
          } else {
            valid = false;
          }
        });
        if (valid) {
          getTokenSkipNewline(state);
          value = parseAssignment(state);
          return new FunctionAssignmentNode(name2, args, value);
        }
      }
      throw createSyntaxError(state, "Invalid left hand side of assignment operator =");
    }
    return node;
  }
  function parseConditional(state) {
    var node = parseLogicalOr(state);
    while (state.token === "?") {
      var prev = state.conditionalLevel;
      state.conditionalLevel = state.nestingLevel;
      getTokenSkipNewline(state);
      var condition = node;
      var trueExpr = parseAssignment(state);
      if (state.token !== ":")
        throw createSyntaxError(state, "False part of conditional expression expected");
      state.conditionalLevel = null;
      getTokenSkipNewline(state);
      var falseExpr = parseAssignment(state);
      node = new ConditionalNode(condition, trueExpr, falseExpr);
      state.conditionalLevel = prev;
    }
    return node;
  }
  function parseLogicalOr(state) {
    var node = parseLogicalXor(state);
    while (state.token === "or") {
      getTokenSkipNewline(state);
      node = new OperatorNode("or", "or", [node, parseLogicalXor(state)]);
    }
    return node;
  }
  function parseLogicalXor(state) {
    var node = parseLogicalAnd(state);
    while (state.token === "xor") {
      getTokenSkipNewline(state);
      node = new OperatorNode("xor", "xor", [node, parseLogicalAnd(state)]);
    }
    return node;
  }
  function parseLogicalAnd(state) {
    var node = parseBitwiseOr(state);
    while (state.token === "and") {
      getTokenSkipNewline(state);
      node = new OperatorNode("and", "and", [node, parseBitwiseOr(state)]);
    }
    return node;
  }
  function parseBitwiseOr(state) {
    var node = parseBitwiseXor(state);
    while (state.token === "|") {
      getTokenSkipNewline(state);
      node = new OperatorNode("|", "bitOr", [node, parseBitwiseXor(state)]);
    }
    return node;
  }
  function parseBitwiseXor(state) {
    var node = parseBitwiseAnd(state);
    while (state.token === "^|") {
      getTokenSkipNewline(state);
      node = new OperatorNode("^|", "bitXor", [node, parseBitwiseAnd(state)]);
    }
    return node;
  }
  function parseBitwiseAnd(state) {
    var node = parseRelational(state);
    while (state.token === "&") {
      getTokenSkipNewline(state);
      node = new OperatorNode("&", "bitAnd", [node, parseRelational(state)]);
    }
    return node;
  }
  function parseRelational(state) {
    var params = [parseShift(state)];
    var conditionals = [];
    var operators = {
      "==": "equal",
      "!=": "unequal",
      "<": "smaller",
      ">": "larger",
      "<=": "smallerEq",
      ">=": "largerEq"
    };
    while (hasOwnProperty$1(operators, state.token)) {
      var cond = {
        name: state.token,
        fn: operators[state.token]
      };
      conditionals.push(cond);
      getTokenSkipNewline(state);
      params.push(parseShift(state));
    }
    if (params.length === 1) {
      return params[0];
    } else if (params.length === 2) {
      return new OperatorNode(conditionals[0].name, conditionals[0].fn, params);
    } else {
      return new RelationalNode(conditionals.map((c2) => c2.fn), params);
    }
  }
  function parseShift(state) {
    var node, name2, fn, params;
    node = parseConversion(state);
    var operators = {
      "<<": "leftShift",
      ">>": "rightArithShift",
      ">>>": "rightLogShift"
    };
    while (hasOwnProperty$1(operators, state.token)) {
      name2 = state.token;
      fn = operators[name2];
      getTokenSkipNewline(state);
      params = [node, parseConversion(state)];
      node = new OperatorNode(name2, fn, params);
    }
    return node;
  }
  function parseConversion(state) {
    var node, name2, fn, params;
    node = parseRange(state);
    var operators = {
      to: "to",
      in: "to"
    };
    while (hasOwnProperty$1(operators, state.token)) {
      name2 = state.token;
      fn = operators[name2];
      getTokenSkipNewline(state);
      if (name2 === "in" && state.token === "") {
        node = new OperatorNode("*", "multiply", [node, new SymbolNode("in")], true);
      } else {
        params = [node, parseRange(state)];
        node = new OperatorNode(name2, fn, params);
      }
    }
    return node;
  }
  function parseRange(state) {
    var node;
    var params = [];
    if (state.token === ":") {
      node = new ConstantNode(1);
    } else {
      node = parseAddSubtract(state);
    }
    if (state.token === ":" && state.conditionalLevel !== state.nestingLevel) {
      params.push(node);
      while (state.token === ":" && params.length < 3) {
        getTokenSkipNewline(state);
        if (state.token === ")" || state.token === "]" || state.token === "," || state.token === "") {
          params.push(new SymbolNode("end"));
        } else {
          params.push(parseAddSubtract(state));
        }
      }
      if (params.length === 3) {
        node = new RangeNode(params[0], params[2], params[1]);
      } else {
        node = new RangeNode(params[0], params[1]);
      }
    }
    return node;
  }
  function parseAddSubtract(state) {
    var node, name2, fn, params;
    node = parseMultiplyDivide(state);
    var operators = {
      "+": "add",
      "-": "subtract"
    };
    while (hasOwnProperty$1(operators, state.token)) {
      name2 = state.token;
      fn = operators[name2];
      getTokenSkipNewline(state);
      params = [node, parseMultiplyDivide(state)];
      node = new OperatorNode(name2, fn, params);
    }
    return node;
  }
  function parseMultiplyDivide(state) {
    var node, last, name2, fn;
    node = parseImplicitMultiplication(state);
    last = node;
    var operators = {
      "*": "multiply",
      ".*": "dotMultiply",
      "/": "divide",
      "./": "dotDivide",
      "%": "mod",
      mod: "mod"
    };
    while (true) {
      if (hasOwnProperty$1(operators, state.token)) {
        name2 = state.token;
        fn = operators[name2];
        getTokenSkipNewline(state);
        last = parseImplicitMultiplication(state);
        node = new OperatorNode(name2, fn, [node, last]);
      } else {
        break;
      }
    }
    return node;
  }
  function parseImplicitMultiplication(state) {
    var node, last;
    node = parseRule2(state);
    last = node;
    while (true) {
      if (state.tokenType === TOKENTYPE.SYMBOL || state.token === "in" && isConstantNode(node) || state.tokenType === TOKENTYPE.NUMBER && !isConstantNode(last) && (!isOperatorNode(last) || last.op === "!") || state.token === "(") {
        last = parseRule2(state);
        node = new OperatorNode("*", "multiply", [node, last], true);
      } else {
        break;
      }
    }
    return node;
  }
  function parseRule2(state) {
    var node = parseUnary(state);
    var last = node;
    var tokenStates = [];
    while (true) {
      if (state.token === "/" && isConstantNode(last)) {
        tokenStates.push(_extends$1({}, state));
        getTokenSkipNewline(state);
        if (state.tokenType === TOKENTYPE.NUMBER) {
          tokenStates.push(_extends$1({}, state));
          getTokenSkipNewline(state);
          if (state.tokenType === TOKENTYPE.SYMBOL || state.token === "(") {
            _extends$1(state, tokenStates.pop());
            tokenStates.pop();
            last = parseUnary(state);
            node = new OperatorNode("/", "divide", [node, last]);
          } else {
            tokenStates.pop();
            _extends$1(state, tokenStates.pop());
            break;
          }
        } else {
          _extends$1(state, tokenStates.pop());
          break;
        }
      } else {
        break;
      }
    }
    return node;
  }
  function parseUnary(state) {
    var name2, params, fn;
    var operators = {
      "-": "unaryMinus",
      "+": "unaryPlus",
      "~": "bitNot",
      not: "not"
    };
    if (hasOwnProperty$1(operators, state.token)) {
      fn = operators[state.token];
      name2 = state.token;
      getTokenSkipNewline(state);
      params = [parseUnary(state)];
      return new OperatorNode(name2, fn, params);
    }
    return parsePow(state);
  }
  function parsePow(state) {
    var node, name2, fn, params;
    node = parseLeftHandOperators(state);
    if (state.token === "^" || state.token === ".^") {
      name2 = state.token;
      fn = name2 === "^" ? "pow" : "dotPow";
      getTokenSkipNewline(state);
      params = [node, parseUnary(state)];
      node = new OperatorNode(name2, fn, params);
    }
    return node;
  }
  function parseLeftHandOperators(state) {
    var node, name2, fn, params;
    node = parseCustomNodes(state);
    var operators = {
      "!": "factorial",
      "'": "ctranspose"
    };
    while (hasOwnProperty$1(operators, state.token)) {
      name2 = state.token;
      fn = operators[name2];
      getToken(state);
      params = [node];
      node = new OperatorNode(name2, fn, params);
      node = parseAccessors(state, node);
    }
    return node;
  }
  function parseCustomNodes(state) {
    var params = [];
    if (state.tokenType === TOKENTYPE.SYMBOL && hasOwnProperty$1(state.extraNodes, state.token)) {
      var CustomNode = state.extraNodes[state.token];
      getToken(state);
      if (state.token === "(") {
        params = [];
        openParams(state);
        getToken(state);
        if (state.token !== ")") {
          params.push(parseAssignment(state));
          while (state.token === ",") {
            getToken(state);
            params.push(parseAssignment(state));
          }
        }
        if (state.token !== ")") {
          throw createSyntaxError(state, "Parenthesis ) expected");
        }
        closeParams(state);
        getToken(state);
      }
      return new CustomNode(params);
    }
    return parseSymbol(state);
  }
  function parseSymbol(state) {
    var node, name2;
    if (state.tokenType === TOKENTYPE.SYMBOL || state.tokenType === TOKENTYPE.DELIMITER && state.token in NAMED_DELIMITERS) {
      name2 = state.token;
      getToken(state);
      if (hasOwnProperty$1(CONSTANTS, name2)) {
        node = new ConstantNode(CONSTANTS[name2]);
      } else if (NUMERIC_CONSTANTS.indexOf(name2) !== -1) {
        node = new ConstantNode(numeric2(name2, "number"));
      } else {
        node = new SymbolNode(name2);
      }
      node = parseAccessors(state, node);
      return node;
    }
    return parseDoubleQuotesString(state);
  }
  function parseAccessors(state, node, types) {
    var params;
    while ((state.token === "(" || state.token === "[" || state.token === ".") && (!types || types.indexOf(state.token) !== -1)) {
      params = [];
      if (state.token === "(") {
        if (isSymbolNode(node) || isAccessorNode(node)) {
          openParams(state);
          getToken(state);
          if (state.token !== ")") {
            params.push(parseAssignment(state));
            while (state.token === ",") {
              getToken(state);
              params.push(parseAssignment(state));
            }
          }
          if (state.token !== ")") {
            throw createSyntaxError(state, "Parenthesis ) expected");
          }
          closeParams(state);
          getToken(state);
          node = new FunctionNode(node, params);
        } else {
          return node;
        }
      } else if (state.token === "[") {
        openParams(state);
        getToken(state);
        if (state.token !== "]") {
          params.push(parseAssignment(state));
          while (state.token === ",") {
            getToken(state);
            params.push(parseAssignment(state));
          }
        }
        if (state.token !== "]") {
          throw createSyntaxError(state, "Parenthesis ] expected");
        }
        closeParams(state);
        getToken(state);
        node = new AccessorNode(node, new IndexNode(params));
      } else {
        getToken(state);
        if (state.tokenType !== TOKENTYPE.SYMBOL) {
          throw createSyntaxError(state, "Property name expected after dot");
        }
        params.push(new ConstantNode(state.token));
        getToken(state);
        var dotNotation = true;
        node = new AccessorNode(node, new IndexNode(params, dotNotation));
      }
    }
    return node;
  }
  function parseDoubleQuotesString(state) {
    var node, str;
    if (state.token === '"') {
      str = parseDoubleQuotesStringToken(state);
      node = new ConstantNode(str);
      node = parseAccessors(state, node);
      return node;
    }
    return parseSingleQuotesString(state);
  }
  function parseDoubleQuotesStringToken(state) {
    var str = "";
    while (currentCharacter(state) !== "" && currentCharacter(state) !== '"') {
      if (currentCharacter(state) === "\\") {
        str += currentCharacter(state);
        next(state);
      }
      str += currentCharacter(state);
      next(state);
    }
    getToken(state);
    if (state.token !== '"') {
      throw createSyntaxError(state, 'End of string " expected');
    }
    getToken(state);
    return JSON.parse('"' + str + '"');
  }
  function parseSingleQuotesString(state) {
    var node, str;
    if (state.token === "'") {
      str = parseSingleQuotesStringToken(state);
      node = new ConstantNode(str);
      node = parseAccessors(state, node);
      return node;
    }
    return parseMatrix(state);
  }
  function parseSingleQuotesStringToken(state) {
    var str = "";
    while (currentCharacter(state) !== "" && currentCharacter(state) !== "'") {
      if (currentCharacter(state) === "\\") {
        str += currentCharacter(state);
        next(state);
      }
      str += currentCharacter(state);
      next(state);
    }
    getToken(state);
    if (state.token !== "'") {
      throw createSyntaxError(state, "End of string ' expected");
    }
    getToken(state);
    return JSON.parse('"' + str + '"');
  }
  function parseMatrix(state) {
    var array, params, rows, cols;
    if (state.token === "[") {
      openParams(state);
      getToken(state);
      if (state.token !== "]") {
        var row = parseRow(state);
        if (state.token === ";") {
          rows = 1;
          params = [row];
          while (state.token === ";") {
            getToken(state);
            params[rows] = parseRow(state);
            rows++;
          }
          if (state.token !== "]") {
            throw createSyntaxError(state, "End of matrix ] expected");
          }
          closeParams(state);
          getToken(state);
          cols = params[0].items.length;
          for (var r = 1; r < rows; r++) {
            if (params[r].items.length !== cols) {
              throw createError(state, "Column dimensions mismatch (" + params[r].items.length + " !== " + cols + ")");
            }
          }
          array = new ArrayNode(params);
        } else {
          if (state.token !== "]") {
            throw createSyntaxError(state, "End of matrix ] expected");
          }
          closeParams(state);
          getToken(state);
          array = row;
        }
      } else {
        closeParams(state);
        getToken(state);
        array = new ArrayNode([]);
      }
      return parseAccessors(state, array);
    }
    return parseObject(state);
  }
  function parseRow(state) {
    var params = [parseAssignment(state)];
    var len = 1;
    while (state.token === ",") {
      getToken(state);
      params[len] = parseAssignment(state);
      len++;
    }
    return new ArrayNode(params);
  }
  function parseObject(state) {
    if (state.token === "{") {
      openParams(state);
      var key;
      var properties2 = {};
      do {
        getToken(state);
        if (state.token !== "}") {
          if (state.token === '"') {
            key = parseDoubleQuotesStringToken(state);
          } else if (state.token === "'") {
            key = parseSingleQuotesStringToken(state);
          } else if (state.tokenType === TOKENTYPE.SYMBOL || state.tokenType === TOKENTYPE.DELIMITER && state.token in NAMED_DELIMITERS) {
            key = state.token;
            getToken(state);
          } else {
            throw createSyntaxError(state, "Symbol or string expected as object key");
          }
          if (state.token !== ":") {
            throw createSyntaxError(state, "Colon : expected after object key");
          }
          getToken(state);
          properties2[key] = parseAssignment(state);
        }
      } while (state.token === ",");
      if (state.token !== "}") {
        throw createSyntaxError(state, "Comma , or bracket } expected after object value");
      }
      closeParams(state);
      getToken(state);
      var node = new ObjectNode(properties2);
      node = parseAccessors(state, node);
      return node;
    }
    return parseNumber(state);
  }
  function parseNumber(state) {
    var numberStr;
    if (state.tokenType === TOKENTYPE.NUMBER) {
      numberStr = state.token;
      getToken(state);
      return new ConstantNode(numeric2(numberStr, config2.number));
    }
    return parseParentheses(state);
  }
  function parseParentheses(state) {
    var node;
    if (state.token === "(") {
      openParams(state);
      getToken(state);
      node = parseAssignment(state);
      if (state.token !== ")") {
        throw createSyntaxError(state, "Parenthesis ) expected");
      }
      closeParams(state);
      getToken(state);
      node = new ParenthesisNode(node);
      node = parseAccessors(state, node);
      return node;
    }
    return parseEnd(state);
  }
  function parseEnd(state) {
    if (state.token === "") {
      throw createSyntaxError(state, "Unexpected end of expression");
    } else {
      throw createSyntaxError(state, "Value expected");
    }
  }
  function col(state) {
    return state.index - state.token.length + 1;
  }
  function createSyntaxError(state, message) {
    var c2 = col(state);
    var error = new SyntaxError(message + " (char " + c2 + ")");
    error.char = c2;
    return error;
  }
  function createError(state, message) {
    var c2 = col(state);
    var error = new SyntaxError(message + " (char " + c2 + ")");
    error.char = c2;
    return error;
  }
  return parse;
});
var name$4 = "evaluate";
var dependencies$4 = ["typed", "parse"];
var createEvaluate = /* @__PURE__ */ factory(name$4, dependencies$4, (_ref) => {
  var {
    typed,
    parse
  } = _ref;
  return typed(name$4, {
    string: function string(expr) {
      var scope = {};
      return parse(expr).compile().evaluate(scope);
    },
    "string, Object": function stringObject(expr, scope) {
      return parse(expr).compile().evaluate(scope);
    },
    "Array | Matrix": function ArrayMatrix(expr) {
      var scope = {};
      return deepMap(expr, function(entry) {
        return parse(entry).compile().evaluate(scope);
      });
    },
    "Array | Matrix, Object": function ArrayMatrixObject(expr, scope) {
      return deepMap(expr, function(entry) {
        return parse(entry).compile().evaluate(scope);
      });
    }
  });
});
var name$3 = "lup";
var dependencies$3 = ["typed", "matrix", "abs", "addScalar", "divideScalar", "multiplyScalar", "subtract", "larger", "equalScalar", "unaryMinus", "DenseMatrix", "SparseMatrix", "Spa"];
var createLup = /* @__PURE__ */ factory(name$3, dependencies$3, (_ref) => {
  var {
    typed,
    matrix,
    abs: abs2,
    addScalar,
    divideScalar,
    multiplyScalar,
    subtract,
    larger,
    equalScalar,
    unaryMinus,
    DenseMatrix,
    SparseMatrix,
    Spa
  } = _ref;
  return typed(name$3, {
    DenseMatrix: function DenseMatrix2(m) {
      return _denseLUP(m);
    },
    SparseMatrix: function SparseMatrix2(m) {
      return _sparseLUP(m);
    },
    Array: function Array2(a2) {
      var m = matrix(a2);
      var r = _denseLUP(m);
      return {
        L: r.L.valueOf(),
        U: r.U.valueOf(),
        p: r.p
      };
    }
  });
  function _denseLUP(m) {
    var rows = m._size[0];
    var columns = m._size[1];
    var n = Math.min(rows, columns);
    var data = clone$1(m._data);
    var ldata = [];
    var lsize = [rows, n];
    var udata = [];
    var usize = [n, columns];
    var i, j, k;
    var p = [];
    for (i = 0; i < rows; i++) {
      p[i] = i;
    }
    for (j = 0; j < columns; j++) {
      if (j > 0) {
        for (i = 0; i < rows; i++) {
          var min2 = Math.min(i, j);
          var s = 0;
          for (k = 0; k < min2; k++) {
            s = addScalar(s, multiplyScalar(data[i][k], data[k][j]));
          }
          data[i][j] = subtract(data[i][j], s);
        }
      }
      var pi = j;
      var pabsv = 0;
      var vjj = 0;
      for (i = j; i < rows; i++) {
        var v = data[i][j];
        var absv = abs2(v);
        if (larger(absv, pabsv)) {
          pi = i;
          pabsv = absv;
          vjj = v;
        }
      }
      if (j !== pi) {
        p[j] = [p[pi], p[pi] = p[j]][0];
        DenseMatrix._swapRows(j, pi, data);
      }
      if (j < rows) {
        for (i = j + 1; i < rows; i++) {
          var vij = data[i][j];
          if (!equalScalar(vij, 0)) {
            data[i][j] = divideScalar(data[i][j], vjj);
          }
        }
      }
    }
    for (j = 0; j < columns; j++) {
      for (i = 0; i < rows; i++) {
        if (j === 0) {
          if (i < columns) {
            udata[i] = [];
          }
          ldata[i] = [];
        }
        if (i < j) {
          if (i < columns) {
            udata[i][j] = data[i][j];
          }
          if (j < rows) {
            ldata[i][j] = 0;
          }
          continue;
        }
        if (i === j) {
          if (i < columns) {
            udata[i][j] = data[i][j];
          }
          if (j < rows) {
            ldata[i][j] = 1;
          }
          continue;
        }
        if (i < columns) {
          udata[i][j] = 0;
        }
        if (j < rows) {
          ldata[i][j] = data[i][j];
        }
      }
    }
    var l = new DenseMatrix({
      data: ldata,
      size: lsize
    });
    var u = new DenseMatrix({
      data: udata,
      size: usize
    });
    var pv = [];
    for (i = 0, n = p.length; i < n; i++) {
      pv[p[i]] = i;
    }
    return {
      L: l,
      U: u,
      p: pv,
      toString: function toString() {
        return "L: " + this.L.toString() + "\nU: " + this.U.toString() + "\nP: " + this.p;
      }
    };
  }
  function _sparseLUP(m) {
    var rows = m._size[0];
    var columns = m._size[1];
    var n = Math.min(rows, columns);
    var values2 = m._values;
    var index = m._index;
    var ptr = m._ptr;
    var lvalues = [];
    var lindex = [];
    var lptr = [];
    var lsize = [rows, n];
    var uvalues = [];
    var uindex = [];
    var uptr = [];
    var usize = [n, columns];
    var i, j, k;
    var pvCo = [];
    var pvOc = [];
    for (i = 0; i < rows; i++) {
      pvCo[i] = i;
      pvOc[i] = i;
    }
    var swapIndeces = function swapIndeces2(x, y) {
      var kx = pvOc[x];
      var ky = pvOc[y];
      pvCo[kx] = y;
      pvCo[ky] = x;
      pvOc[x] = ky;
      pvOc[y] = kx;
    };
    var _loop = function _loop2() {
      var spa = new Spa();
      if (j < rows) {
        lptr.push(lvalues.length);
        lvalues.push(1);
        lindex.push(j);
      }
      uptr.push(uvalues.length);
      var k0 = ptr[j];
      var k1 = ptr[j + 1];
      for (k = k0; k < k1; k++) {
        i = index[k];
        spa.set(pvCo[i], values2[k]);
      }
      if (j > 0) {
        spa.forEach(0, j - 1, function(k2, vkj) {
          SparseMatrix._forEachRow(k2, lvalues, lindex, lptr, function(i2, vik) {
            if (i2 > k2) {
              spa.accumulate(i2, unaryMinus(multiplyScalar(vik, vkj)));
            }
          });
        });
      }
      var pi = j;
      var vjj = spa.get(j);
      var pabsv = abs2(vjj);
      spa.forEach(j + 1, rows - 1, function(x, v) {
        var absv = abs2(v);
        if (larger(absv, pabsv)) {
          pi = x;
          pabsv = absv;
          vjj = v;
        }
      });
      if (j !== pi) {
        SparseMatrix._swapRows(j, pi, lsize[1], lvalues, lindex, lptr);
        SparseMatrix._swapRows(j, pi, usize[1], uvalues, uindex, uptr);
        spa.swap(j, pi);
        swapIndeces(j, pi);
      }
      spa.forEach(0, rows - 1, function(x, v) {
        if (x <= j) {
          uvalues.push(v);
          uindex.push(x);
        } else {
          v = divideScalar(v, vjj);
          if (!equalScalar(v, 0)) {
            lvalues.push(v);
            lindex.push(x);
          }
        }
      });
    };
    for (j = 0; j < columns; j++) {
      _loop();
    }
    uptr.push(uvalues.length);
    lptr.push(lvalues.length);
    return {
      L: new SparseMatrix({
        values: lvalues,
        index: lindex,
        ptr: lptr,
        size: lsize
      }),
      U: new SparseMatrix({
        values: uvalues,
        index: uindex,
        ptr: uptr,
        size: usize
      }),
      p: pvCo,
      toString: function toString() {
        return "L: " + this.L.toString() + "\nU: " + this.U.toString() + "\nP: " + this.p;
      }
    };
  }
});
var name$2 = "det";
var dependencies$2 = ["typed", "matrix", "subtract", "multiply", "unaryMinus", "lup"];
var createDet = /* @__PURE__ */ factory(name$2, dependencies$2, (_ref) => {
  var {
    typed,
    matrix,
    subtract,
    multiply,
    unaryMinus,
    lup
  } = _ref;
  return typed(name$2, {
    any: function any(x) {
      return clone$1(x);
    },
    "Array | Matrix": function det(x) {
      var size;
      if (isMatrix(x)) {
        size = x.size();
      } else if (Array.isArray(x)) {
        x = matrix(x);
        size = x.size();
      } else {
        size = [];
      }
      switch (size.length) {
        case 0:
          return clone$1(x);
        case 1:
          if (size[0] === 1) {
            return clone$1(x.valueOf()[0]);
          } else {
            throw new RangeError("Matrix must be square (size: " + format(size) + ")");
          }
        case 2: {
          var rows = size[0];
          var cols = size[1];
          if (rows === cols) {
            return _det(x.clone().valueOf(), rows);
          } else {
            throw new RangeError("Matrix must be square (size: " + format(size) + ")");
          }
        }
        default:
          throw new RangeError("Matrix must be two dimensional (size: " + format(size) + ")");
      }
    }
  });
  function _det(matrix2, rows, cols) {
    if (rows === 1) {
      return clone$1(matrix2[0][0]);
    } else if (rows === 2) {
      return subtract(multiply(matrix2[0][0], matrix2[1][1]), multiply(matrix2[1][0], matrix2[0][1]));
    } else {
      var decomp = lup(matrix2);
      var det = decomp.U[0][0];
      for (var _i = 1; _i < rows; _i++) {
        det = multiply(det, decomp.U[_i][_i]);
      }
      var evenCycles = 0;
      var i = 0;
      var visited = [];
      while (true) {
        while (visited[i]) {
          i++;
        }
        if (i >= rows)
          break;
        var j = i;
        var cycleLen = 0;
        while (!visited[decomp.p[j]]) {
          visited[decomp.p[j]] = true;
          j = decomp.p[j];
          cycleLen++;
        }
        if (cycleLen % 2 === 0) {
          evenCycles++;
        }
      }
      return evenCycles % 2 === 0 ? det : unaryMinus(det);
    }
  }
});
var name$1 = "inv";
var dependencies$1 = ["typed", "matrix", "divideScalar", "addScalar", "multiply", "unaryMinus", "det", "identity", "abs"];
var createInv = /* @__PURE__ */ factory(name$1, dependencies$1, (_ref) => {
  var {
    typed,
    matrix,
    divideScalar,
    addScalar,
    multiply,
    unaryMinus,
    det,
    identity,
    abs: abs2
  } = _ref;
  return typed(name$1, {
    "Array | Matrix": function ArrayMatrix(x) {
      var size = isMatrix(x) ? x.size() : arraySize(x);
      switch (size.length) {
        case 1:
          if (size[0] === 1) {
            if (isMatrix(x)) {
              return matrix([divideScalar(1, x.valueOf()[0])]);
            } else {
              return [divideScalar(1, x[0])];
            }
          } else {
            throw new RangeError("Matrix must be square (size: " + format(size) + ")");
          }
        case 2: {
          var rows = size[0];
          var cols = size[1];
          if (rows === cols) {
            if (isMatrix(x)) {
              return matrix(_inv(x.valueOf(), rows, cols), x.storage());
            } else {
              return _inv(x, rows, cols);
            }
          } else {
            throw new RangeError("Matrix must be square (size: " + format(size) + ")");
          }
        }
        default:
          throw new RangeError("Matrix must be two dimensional (size: " + format(size) + ")");
      }
    },
    any: function any(x) {
      return divideScalar(1, x);
    }
  });
  function _inv(mat, rows, cols) {
    var r, s, f, value, temp;
    if (rows === 1) {
      value = mat[0][0];
      if (value === 0) {
        throw Error("Cannot calculate inverse, determinant is zero");
      }
      return [[divideScalar(1, value)]];
    } else if (rows === 2) {
      var d = det(mat);
      if (d === 0) {
        throw Error("Cannot calculate inverse, determinant is zero");
      }
      return [[divideScalar(mat[1][1], d), divideScalar(unaryMinus(mat[0][1]), d)], [divideScalar(unaryMinus(mat[1][0]), d), divideScalar(mat[0][0], d)]];
    } else {
      var A = mat.concat();
      for (r = 0; r < rows; r++) {
        A[r] = A[r].concat();
      }
      var B = identity(rows).valueOf();
      for (var c2 = 0; c2 < cols; c2++) {
        var ABig = abs2(A[c2][c2]);
        var rBig = c2;
        r = c2 + 1;
        while (r < rows) {
          if (abs2(A[r][c2]) > ABig) {
            ABig = abs2(A[r][c2]);
            rBig = r;
          }
          r++;
        }
        if (ABig === 0) {
          throw Error("Cannot calculate inverse, determinant is zero");
        }
        r = rBig;
        if (r !== c2) {
          temp = A[c2];
          A[c2] = A[r];
          A[r] = temp;
          temp = B[c2];
          B[c2] = B[r];
          B[r] = temp;
        }
        var Ac = A[c2];
        var Bc = B[c2];
        for (r = 0; r < rows; r++) {
          var Ar = A[r];
          var Br = B[r];
          if (r !== c2) {
            if (Ar[c2] !== 0) {
              f = divideScalar(unaryMinus(Ar[c2]), Ac[c2]);
              for (s = c2; s < cols; s++) {
                Ar[s] = addScalar(Ar[s], multiply(f, Ac[s]));
              }
              for (s = 0; s < cols; s++) {
                Br[s] = addScalar(Br[s], multiply(f, Bc[s]));
              }
            }
          } else {
            f = Ac[c2];
            for (s = c2; s < cols; s++) {
              Ar[s] = divideScalar(Ar[s], f);
            }
            for (s = 0; s < cols; s++) {
              Br[s] = divideScalar(Br[s], f);
            }
          }
        }
      }
      return B;
    }
  }
});
var name = "divide";
var dependencies = ["typed", "matrix", "multiply", "equalScalar", "divideScalar", "inv"];
var createDivide = /* @__PURE__ */ factory(name, dependencies, (_ref) => {
  var {
    typed,
    matrix,
    multiply,
    equalScalar,
    divideScalar,
    inv
  } = _ref;
  var algorithm11 = createAlgorithm11({
    typed,
    equalScalar
  });
  var algorithm14 = createAlgorithm14({
    typed
  });
  return typed("divide", extend({
    "Array | Matrix, Array | Matrix": function ArrayMatrixArrayMatrix(x, y) {
      return multiply(x, inv(y));
    },
    "DenseMatrix, any": function DenseMatrixAny(x, y) {
      return algorithm14(x, y, divideScalar, false);
    },
    "SparseMatrix, any": function SparseMatrixAny(x, y) {
      return algorithm11(x, y, divideScalar, false);
    },
    "Array, any": function ArrayAny(x, y) {
      return algorithm14(matrix(x), y, divideScalar, false).valueOf();
    },
    "any, Array | Matrix": function anyArrayMatrix(x, y) {
      return multiply(x, inv(y));
    }
  }, divideScalar.signatures));
});
var BigNumberDependencies = {
  createBigNumberClass
};
var ComplexDependencies = {
  createComplexClass
};
var MatrixDependencies = {
  createMatrixClass
};
var DenseMatrixDependencies = {
  MatrixDependencies,
  createDenseMatrixClass
};
var FractionDependencies = {
  createFractionClass
};
var typedDependencies = {
  BigNumberDependencies,
  ComplexDependencies,
  DenseMatrixDependencies,
  FractionDependencies,
  createTyped
};
var ResultSetDependencies = {
  createResultSet
};
var RangeDependencies = {
  createRangeClass
};
var isNumericDependencies = {
  typedDependencies,
  createIsNumeric
};
var equalScalarDependencies = {
  typedDependencies,
  createEqualScalar
};
var SparseMatrixDependencies = {
  MatrixDependencies,
  equalScalarDependencies,
  typedDependencies,
  createSparseMatrixClass
};
var numberDependencies = {
  typedDependencies,
  createNumber
};
var bignumberDependencies = {
  BigNumberDependencies,
  typedDependencies,
  createBignumber
};
var fractionDependencies = {
  FractionDependencies,
  typedDependencies,
  createFraction
};
var matrixDependencies = {
  DenseMatrixDependencies,
  MatrixDependencies,
  SparseMatrixDependencies,
  typedDependencies,
  createMatrix
};
var unaryMinusDependencies = {
  typedDependencies,
  createUnaryMinus
};
var absDependencies = {
  typedDependencies,
  createAbs
};
var addScalarDependencies = {
  typedDependencies,
  createAddScalar
};
var zerosDependencies = {
  BigNumberDependencies,
  matrixDependencies,
  typedDependencies,
  createZeros
};
var roundDependencies = {
  BigNumberDependencies,
  DenseMatrixDependencies,
  equalScalarDependencies,
  matrixDependencies,
  typedDependencies,
  zerosDependencies,
  createRound
};
var ceilDependencies = {
  equalScalarDependencies,
  matrixDependencies,
  roundDependencies,
  typedDependencies,
  createCeil
};
var floorDependencies = {
  equalScalarDependencies,
  matrixDependencies,
  roundDependencies,
  typedDependencies,
  createFloor
};
var fixDependencies = {
  ComplexDependencies,
  ceilDependencies,
  floorDependencies,
  matrixDependencies,
  typedDependencies,
  createFix
};
var modDependencies = {
  DenseMatrixDependencies,
  equalScalarDependencies,
  matrixDependencies,
  typedDependencies,
  createMod
};
var multiplyScalarDependencies = {
  typedDependencies,
  createMultiplyScalar
};
var conjDependencies = {
  typedDependencies,
  createConj
};
var sizeDependencies = {
  matrixDependencies,
  typedDependencies,
  createSize
};
var dotDependencies = {
  addScalarDependencies,
  conjDependencies,
  multiplyScalarDependencies,
  sizeDependencies,
  typedDependencies,
  createDot
};
var multiplyDependencies = {
  addScalarDependencies,
  dotDependencies,
  equalScalarDependencies,
  matrixDependencies,
  multiplyScalarDependencies,
  typedDependencies,
  createMultiply
};
var subtractDependencies = {
  DenseMatrixDependencies,
  addScalarDependencies,
  equalScalarDependencies,
  matrixDependencies,
  typedDependencies,
  unaryMinusDependencies,
  createSubtract
};
var smallerDependencies = {
  DenseMatrixDependencies,
  matrixDependencies,
  typedDependencies,
  createSmaller
};
var largerDependencies = {
  DenseMatrixDependencies,
  matrixDependencies,
  typedDependencies,
  createLarger
};
var identityDependencies = {
  BigNumberDependencies,
  DenseMatrixDependencies,
  SparseMatrixDependencies,
  matrixDependencies,
  typedDependencies,
  createIdentity
};
var addDependencies = {
  DenseMatrixDependencies,
  SparseMatrixDependencies,
  addScalarDependencies,
  equalScalarDependencies,
  matrixDependencies,
  typedDependencies,
  createAdd
};
var equalDependencies = {
  DenseMatrixDependencies,
  equalScalarDependencies,
  matrixDependencies,
  typedDependencies,
  createEqual
};
var FibonacciHeapDependencies = {
  largerDependencies,
  smallerDependencies,
  createFibonacciHeapClass
};
var SpaDependencies = {
  FibonacciHeapDependencies,
  addScalarDependencies,
  equalScalarDependencies,
  createSpaClass
};
var numericDependencies = {
  bignumberDependencies,
  fractionDependencies,
  numberDependencies,
  createNumeric
};
var divideScalarDependencies = {
  numericDependencies,
  typedDependencies,
  createDivideScalar
};
var lupDependencies = {
  DenseMatrixDependencies,
  SpaDependencies,
  SparseMatrixDependencies,
  absDependencies,
  addScalarDependencies,
  divideScalarDependencies,
  equalScalarDependencies,
  largerDependencies,
  matrixDependencies,
  multiplyScalarDependencies,
  subtractDependencies,
  typedDependencies,
  unaryMinusDependencies,
  createLup
};
var detDependencies = {
  lupDependencies,
  matrixDependencies,
  multiplyDependencies,
  subtractDependencies,
  typedDependencies,
  unaryMinusDependencies,
  createDet
};
var invDependencies = {
  absDependencies,
  addScalarDependencies,
  detDependencies,
  divideScalarDependencies,
  identityDependencies,
  matrixDependencies,
  multiplyDependencies,
  typedDependencies,
  unaryMinusDependencies,
  createInv
};
var powDependencies = {
  ComplexDependencies,
  fractionDependencies,
  identityDependencies,
  matrixDependencies,
  multiplyDependencies,
  numberDependencies,
  typedDependencies,
  createPow
};
var subsetDependencies = {
  matrixDependencies,
  typedDependencies,
  createSubset
};
var formatDependencies = {
  typedDependencies,
  createFormat
};
var UnitDependencies = {
  BigNumberDependencies,
  ComplexDependencies,
  FractionDependencies,
  absDependencies,
  addScalarDependencies,
  divideScalarDependencies,
  equalDependencies,
  fixDependencies,
  formatDependencies,
  isNumericDependencies,
  multiplyScalarDependencies,
  numberDependencies,
  powDependencies,
  roundDependencies,
  subtractDependencies,
  createUnitClass
};
var unitDependencies = {
  UnitDependencies,
  typedDependencies,
  createUnitFunction
};
var createUnitDependencies = {
  UnitDependencies,
  typedDependencies,
  createCreateUnit
};
var NodeDependencies = {
  createNode
};
var AccessorNodeDependencies = {
  NodeDependencies,
  subsetDependencies,
  createAccessorNode
};
var ArrayNodeDependencies = {
  NodeDependencies,
  createArrayNode
};
var AssignmentNodeDependencies = {
  matrixDependencies,
  NodeDependencies,
  subsetDependencies,
  createAssignmentNode
};
var BlockNodeDependencies = {
  NodeDependencies,
  ResultSetDependencies,
  createBlockNode
};
var ConditionalNodeDependencies = {
  NodeDependencies,
  createConditionalNode
};
var ConstantNodeDependencies = {
  NodeDependencies,
  createConstantNode
};
var FunctionAssignmentNodeDependencies = {
  NodeDependencies,
  typedDependencies,
  createFunctionAssignmentNode
};
var IndexNodeDependencies = {
  NodeDependencies,
  RangeDependencies,
  sizeDependencies,
  createIndexNode
};
var ObjectNodeDependencies = {
  NodeDependencies,
  createObjectNode
};
var OperatorNodeDependencies = {
  NodeDependencies,
  createOperatorNode
};
var ParenthesisNodeDependencies = {
  NodeDependencies,
  createParenthesisNode
};
var RangeNodeDependencies = {
  NodeDependencies,
  createRangeNode
};
var RelationalNodeDependencies = {
  NodeDependencies,
  createRelationalNode
};
var SymbolNodeDependencies = {
  UnitDependencies,
  NodeDependencies,
  createSymbolNode
};
var FunctionNodeDependencies = {
  NodeDependencies,
  SymbolNodeDependencies,
  createFunctionNode
};
var parseDependencies = {
  AccessorNodeDependencies,
  ArrayNodeDependencies,
  AssignmentNodeDependencies,
  BlockNodeDependencies,
  ConditionalNodeDependencies,
  ConstantNodeDependencies,
  FunctionAssignmentNodeDependencies,
  FunctionNodeDependencies,
  IndexNodeDependencies,
  ObjectNodeDependencies,
  OperatorNodeDependencies,
  ParenthesisNodeDependencies,
  RangeNodeDependencies,
  RelationalNodeDependencies,
  SymbolNodeDependencies,
  numericDependencies,
  typedDependencies,
  createParse
};
var evaluateDependencies = {
  parseDependencies,
  typedDependencies,
  createEvaluate
};
var divideDependencies = {
  divideScalarDependencies,
  equalScalarDependencies,
  invDependencies,
  matrixDependencies,
  multiplyDependencies,
  typedDependencies,
  createDivide
};
var tinyEmitter = { exports: {} };
function E() {
}
E.prototype = {
  on: function(name2, callback, ctx) {
    var e = this.e || (this.e = {});
    (e[name2] || (e[name2] = [])).push({
      fn: callback,
      ctx
    });
    return this;
  },
  once: function(name2, callback, ctx) {
    var self2 = this;
    function listener() {
      self2.off(name2, listener);
      callback.apply(ctx, arguments);
    }
    listener._ = callback;
    return this.on(name2, listener, ctx);
  },
  emit: function(name2) {
    var data = [].slice.call(arguments, 1);
    var evtArr = ((this.e || (this.e = {}))[name2] || []).slice();
    var i = 0;
    var len = evtArr.length;
    for (i; i < len; i++) {
      evtArr[i].fn.apply(evtArr[i].ctx, data);
    }
    return this;
  },
  off: function(name2, callback) {
    var e = this.e || (this.e = {});
    var evts = e[name2];
    var liveEvents = [];
    if (evts && callback) {
      for (var i = 0, len = evts.length; i < len; i++) {
        if (evts[i].fn !== callback && evts[i].fn._ !== callback)
          liveEvents.push(evts[i]);
      }
    }
    liveEvents.length ? e[name2] = liveEvents : delete e[name2];
    return this;
  }
};
tinyEmitter.exports = E;
tinyEmitter.exports.TinyEmitter = E;
var Emitter = tinyEmitter.exports;
function mixin(obj) {
  var emitter = new Emitter();
  obj.on = emitter.on.bind(emitter);
  obj.off = emitter.off.bind(emitter);
  obj.once = emitter.once.bind(emitter);
  obj.emit = emitter.emit.bind(emitter);
  return obj;
}
function importFactory(typed, load, math, importedFactories) {
  function mathImport(functions, options) {
    var num = arguments.length;
    if (num !== 1 && num !== 2) {
      throw new ArgumentsError("import", num, 1, 2);
    }
    if (!options) {
      options = {};
    }
    function flattenImports(flatValues2, value2, name3) {
      if (Array.isArray(value2)) {
        value2.forEach((item) => flattenImports(flatValues2, item));
      } else if (typeof value2 === "object") {
        for (var _name in value2) {
          if (hasOwnProperty$1(value2, _name)) {
            flattenImports(flatValues2, value2[_name], _name);
          }
        }
      } else if (isFactory(value2) || name3 !== void 0) {
        var flatName = isFactory(value2) ? isTransformFunctionFactory(value2) ? value2.fn + ".transform" : value2.fn : name3;
        if (hasOwnProperty$1(flatValues2, flatName) && flatValues2[flatName] !== value2 && !options.silent) {
          throw new Error('Cannot import "' + flatName + '" twice');
        }
        flatValues2[flatName] = value2;
      } else {
        if (!options.silent) {
          throw new TypeError("Factory, Object, or Array expected");
        }
      }
    }
    var flatValues = {};
    flattenImports(flatValues, functions);
    for (var name2 in flatValues) {
      if (hasOwnProperty$1(flatValues, name2)) {
        var value = flatValues[name2];
        if (isFactory(value)) {
          _importFactory(value, options);
        } else if (isSupportedType(value)) {
          _import(name2, value, options);
        } else {
          if (!options.silent) {
            throw new TypeError("Factory, Object, or Array expected");
          }
        }
      }
    }
  }
  function _import(name2, value, options) {
    if (options.wrap && typeof value === "function") {
      value = _wrap(value);
    }
    if (hasTypedFunctionSignature(value)) {
      value = typed(name2, {
        [value.signature]: value
      });
    }
    if (isTypedFunction(math[name2]) && isTypedFunction(value)) {
      if (options.override) {
        value = typed(name2, value.signatures);
      } else {
        value = typed(math[name2], value);
      }
      math[name2] = value;
      delete importedFactories[name2];
      _importTransform(name2, value);
      math.emit("import", name2, function resolver() {
        return value;
      });
      return;
    }
    if (math[name2] === void 0 || options.override) {
      math[name2] = value;
      delete importedFactories[name2];
      _importTransform(name2, value);
      math.emit("import", name2, function resolver() {
        return value;
      });
      return;
    }
    if (!options.silent) {
      throw new Error('Cannot import "' + name2 + '": already exists');
    }
  }
  function _importTransform(name2, value) {
    if (value && typeof value.transform === "function") {
      math.expression.transform[name2] = value.transform;
      if (allowedInExpressions(name2)) {
        math.expression.mathWithTransform[name2] = value.transform;
      }
    } else {
      delete math.expression.transform[name2];
      if (allowedInExpressions(name2)) {
        math.expression.mathWithTransform[name2] = value;
      }
    }
  }
  function _deleteTransform(name2) {
    delete math.expression.transform[name2];
    if (allowedInExpressions(name2)) {
      math.expression.mathWithTransform[name2] = math[name2];
    } else {
      delete math.expression.mathWithTransform[name2];
    }
  }
  function _wrap(fn) {
    var wrapper = function wrapper2() {
      var args = [];
      for (var i = 0, len = arguments.length; i < len; i++) {
        var arg = arguments[i];
        args[i] = arg && arg.valueOf();
      }
      return fn.apply(math, args);
    };
    if (fn.transform) {
      wrapper.transform = fn.transform;
    }
    return wrapper;
  }
  function _importFactory(factory2, options) {
    var name2 = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : factory2.fn;
    if (contains(name2, ".")) {
      throw new Error("Factory name should not contain a nested path. Name: " + JSON.stringify(name2));
    }
    var namespace = isTransformFunctionFactory(factory2) ? math.expression.transform : math;
    var existingTransform = name2 in math.expression.transform;
    var existing = hasOwnProperty$1(namespace, name2) ? namespace[name2] : void 0;
    var resolver = function resolver2() {
      var dependencies2 = {};
      factory2.dependencies.map(stripOptionalNotation).forEach((dependency) => {
        if (contains(dependency, ".")) {
          throw new Error("Factory dependency should not contain a nested path. Name: " + JSON.stringify(dependency));
        }
        if (dependency === "math") {
          dependencies2.math = math;
        } else if (dependency === "mathWithTransform") {
          dependencies2.mathWithTransform = math.expression.mathWithTransform;
        } else if (dependency === "classes") {
          dependencies2.classes = math;
        } else {
          dependencies2[dependency] = math[dependency];
        }
      });
      var instance = /* @__PURE__ */ factory2(dependencies2);
      if (instance && typeof instance.transform === "function") {
        throw new Error('Transforms cannot be attached to factory functions. Please create a separate function for it with exports.path="expression.transform"');
      }
      if (existing === void 0 || options.override) {
        return instance;
      }
      if (isTypedFunction(existing) && isTypedFunction(instance)) {
        return typed(existing, instance);
      }
      if (options.silent) {
        return existing;
      } else {
        throw new Error('Cannot import "' + name2 + '": already exists');
      }
    };
    if (!factory2.meta || factory2.meta.lazy !== false) {
      lazy(namespace, name2, resolver);
      if (existing && existingTransform) {
        _deleteTransform(name2);
      } else {
        if (isTransformFunctionFactory(factory2) || factoryAllowedInExpressions(factory2)) {
          lazy(math.expression.mathWithTransform, name2, () => namespace[name2]);
        }
      }
    } else {
      namespace[name2] = resolver();
      if (existing && existingTransform) {
        _deleteTransform(name2);
      } else {
        if (isTransformFunctionFactory(factory2) || factoryAllowedInExpressions(factory2)) {
          lazy(math.expression.mathWithTransform, name2, () => namespace[name2]);
        }
      }
    }
    importedFactories[name2] = factory2;
    math.emit("import", name2, resolver);
  }
  function isSupportedType(object) {
    return typeof object === "function" || typeof object === "number" || typeof object === "string" || typeof object === "boolean" || object === null || isUnit(object) || isComplex(object) || isBigNumber(object) || isFraction(object) || isMatrix(object) || Array.isArray(object);
  }
  function isTypedFunction(fn) {
    return typeof fn === "function" && typeof fn.signatures === "object";
  }
  function hasTypedFunctionSignature(fn) {
    return typeof fn === "function" && typeof fn.signature === "string";
  }
  function allowedInExpressions(name2) {
    return !hasOwnProperty$1(unsafe, name2);
  }
  function factoryAllowedInExpressions(factory2) {
    return factory2.fn.indexOf(".") === -1 && !hasOwnProperty$1(unsafe, factory2.fn) && (!factory2.meta || !factory2.meta.isClass);
  }
  function isTransformFunctionFactory(factory2) {
    return factory2 !== void 0 && factory2.meta !== void 0 && factory2.meta.isTransformFunction === true || false;
  }
  var unsafe = {
    expression: true,
    type: true,
    docs: true,
    error: true,
    json: true,
    chain: true
  };
  return mathImport;
}
function _extends() {
  _extends = Object.assign || function(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];
      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }
    return target;
  };
  return _extends.apply(this, arguments);
}
function create(factories, config2) {
  var configInternal = _extends({}, DEFAULT_CONFIG, config2);
  if (typeof Object.create !== "function") {
    throw new Error("ES5 not supported by this JavaScript engine. Please load the es5-shim and es5-sham library for compatibility.");
  }
  var math = mixin({
    isNumber,
    isComplex,
    isBigNumber,
    isFraction,
    isUnit,
    isString,
    isArray,
    isMatrix,
    isCollection,
    isDenseMatrix,
    isSparseMatrix,
    isRange,
    isIndex,
    isBoolean,
    isResultSet,
    isHelp,
    isFunction,
    isDate,
    isRegExp,
    isObject,
    isNull,
    isUndefined,
    isAccessorNode,
    isArrayNode,
    isAssignmentNode,
    isBlockNode,
    isConditionalNode,
    isConstantNode,
    isFunctionAssignmentNode,
    isFunctionNode,
    isIndexNode,
    isNode,
    isObjectNode,
    isOperatorNode,
    isParenthesisNode,
    isRangeNode,
    isSymbolNode,
    isChain
  });
  math.config = configFactory(configInternal, math.emit);
  math.expression = {
    transform: {},
    mathWithTransform: {
      config: math.config
    }
  };
  var legacyFactories = [];
  var legacyInstances = [];
  function load(factory2) {
    if (isFactory(factory2)) {
      return factory2(math);
    }
    var firstProperty = factory2[Object.keys(factory2)[0]];
    if (isFactory(firstProperty)) {
      return firstProperty(math);
    }
    if (!isLegacyFactory(factory2)) {
      console.warn("Factory object with properties `type`, `name`, and `factory` expected", factory2);
      throw new Error("Factory object with properties `type`, `name`, and `factory` expected");
    }
    var index = legacyFactories.indexOf(factory2);
    var instance;
    if (index === -1) {
      if (factory2.math === true) {
        instance = factory2.factory(math.type, configInternal, load, math.typed, math);
      } else {
        instance = factory2.factory(math.type, configInternal, load, math.typed);
      }
      legacyFactories.push(factory2);
      legacyInstances.push(instance);
    } else {
      instance = legacyInstances[index];
    }
    return instance;
  }
  var importedFactories = {};
  function lazyTyped() {
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    return math.typed.apply(math.typed, args);
  }
  var internalImport = importFactory(lazyTyped, load, math, importedFactories);
  math.import = internalImport;
  math.on("config", () => {
    values(importedFactories).forEach((factory2) => {
      if (factory2 && factory2.meta && factory2.meta.recreateOnConfigChange) {
        internalImport(factory2, {
          override: true
        });
      }
    });
  });
  math.create = create.bind(null, factories);
  math.factory = factory;
  math.import(values(deepFlatten(factories)));
  math.ArgumentsError = ArgumentsError;
  math.DimensionError = DimensionError;
  math.IndexError = IndexError;
  return math;
}
class EtherealLayoutSystem {
  constructor(viewNode, bindings) {
    __publicField(this, "math", create({
      evaluateDependencies,
      addDependencies,
      subtractDependencies,
      multiplyDependencies,
      divideDependencies,
      modDependencies,
      numberDependencies,
      createUnitDependencies,
      unitDependencies
    }, {
      predictable: true
    }));
    __publicField(this, "mathCompiledExpressions", /* @__PURE__ */ new Map());
    __publicField(this, "mathScope", {
      ratio: void 0,
      degree: this.math.unit("degree"),
      meter: this.math.unit("meter"),
      pixel: this.math.createUnit("pixel", { aliases: ["pixels", "px"] }),
      percent: void 0,
      vdeg: void 0,
      vw: void 0,
      vh: void 0
    });
    __publicField(this, "epsillonMeters", 1e-10);
    __publicField(this, "epsillonRadians", 1e-10);
    __publicField(this, "epsillonRatio", 1e-10);
    __publicField(this, "transition", new TransitionConfig({
      multiplier: 1,
      duration: 0,
      easing: easing.easeInOut,
      threshold: 0,
      delay: 0,
      debounce: 0,
      maxWait: 10,
      blend: true
    }));
    __publicField(this, "optimize", new OptimizerConfig({
      minFeasibleTime: 0.02,
      maxInfeasibleTime: 5,
      relativeTolerance: 1e-3,
      maxIterationsPerFrame: 10,
      swarmSize: 10,
      pulseFrequencyMin: 0,
      pulseFrequencyMax: 1,
      pulseRate: 0.4,
      stepSizeMin: 1e-4,
      stepSizeMax: 4,
      stepSizeStart: 1.5
    }));
    __publicField(this, "optimizer", new SpatialOptimizer(this));
    __publicField(this, "viewFrustum", new LayoutFrustum());
    __publicField(this, "viewResolution", new Vector2(1e3, 1e3));
    __publicField(this, "deltaTime", 1 / 60);
    __publicField(this, "time", 0);
    __publicField(this, "maxDeltaTime", 1 / 60);
    __publicField(this, "nodeMetrics", /* @__PURE__ */ new Map());
    __publicField(this, "nodeAdapters", /* @__PURE__ */ new Map());
    __publicField(this, "transitionables", []);
    __publicField(this, "getMetrics", (node) => {
      if (!node)
        throw new Error("node must be defined");
      let metrics = this.nodeMetrics.get(node);
      if (!metrics) {
        metrics = new SpatialMetrics(this, node);
        this.nodeMetrics.set(node, metrics);
      }
      return metrics;
    });
    __publicField(this, "getState", (node) => {
      if (!node)
        throw new Error("node must be defined");
      return this.getMetrics(node).target;
    });
    __publicField(this, "getAdapter", (node) => {
      let adapter = this.nodeAdapters.get(node);
      if (!adapter) {
        adapter = new SpatialAdapter(this, node);
        this.nodeAdapters.set(node, adapter);
      }
      return adapter;
    });
    __publicField(this, "createTransitionable", (value, config2) => {
      const t = new Transitionable(this, value, config2, this.transition);
      this.transitionables.push(t);
      return t;
    });
    __publicField(this, "_prevResolution", new Vector2());
    __publicField(this, "_prevSize", new Vector2());
    __publicField(this, "measureNumberCache", {});
    this.viewNode = viewNode;
    this.bindings = bindings;
  }
  get viewMetrics() {
    if (!this.viewNode)
      throw new Error("EtherealSystem.viewNode must be defined");
    return this.getMetrics(this.viewNode);
  }
  update(deltaTime, time) {
    this.deltaTime = Math.max(deltaTime, this.maxDeltaTime);
    this.time = time;
    if (!this._prevResolution.equals(this.viewResolution) || !this._prevSize.equals(this.viewFrustum.sizeDegrees)) {
      this.mathScope.vdeg = this.math.unit(this.viewResolution.y / this.viewFrustum.sizeDegrees.y, "px");
      this.mathScope.vw = this.math.unit(this.viewResolution.x / 100, "px");
      this.mathScope.vh = this.math.unit(this.viewResolution.y / 100, "px");
      this.measureNumberCache = {};
    }
    this._prevResolution.copy(this.viewResolution);
    this._prevSize.copy(this.viewFrustum.sizeDegrees);
    for (const metrics of this.nodeMetrics.values()) {
      metrics.needsUpdate = true;
      const adapter = this.nodeAdapters.get(metrics.node);
      if (adapter) {
        adapter.opacity.needsUpdate = true;
        adapter.orientation.needsUpdate = true;
        adapter.bounds.needsUpdate = true;
        adapter.outerOrigin.needsUpdate = true;
        adapter.outerOrientation.needsUpdate = true;
        adapter.outerBounds.needsUpdate = true;
        adapter.outerVisualBounds.needsUpdate = true;
      }
    }
    for (const transitionable of this.transitionables) {
      transitionable.needsUpdate = true;
    }
    for (const transitionable of this.transitionables) {
      transitionable.update();
    }
    this.viewMetrics.update();
    for (const adapter of this.nodeAdapters.values()) {
      adapter.metrics.update();
    }
  }
  measureNumber(measure, unit) {
    if (typeof measure === "number")
      return measure;
    if (measure in this.measureNumberCache)
      return this.measureNumberCache[measure];
    if (!this.mathCompiledExpressions.has(measure)) {
      const node = this.math.parse(measure);
      const code2 = node.compile();
      this.mathCompiledExpressions.set(measure, code2);
    }
    const code = this.mathCompiledExpressions.get(measure);
    const result = code.evaluate(this.mathScope);
    const value = typeof result === "number" ? result : this.math.number(code.evaluate(this.mathScope), unit);
    this.measureNumberCache[measure] = value;
    return value;
  }
}
const scratchVector3 = new Vector3();
class SphericalCoordinate {
  constructor(horizontalRadians = 0, verticalRadians = 0, distance = 0) {
    this.horizontalRadians = horizontalRadians;
    this.verticalRadians = verticalRadians;
    this.distance = distance;
  }
  get horizontalDegrees() {
    return this.horizontalRadians * RAD2DEG;
  }
  set horizontalDegrees(h) {
    this.horizontalRadians = h * DEG2RAD;
  }
  get verticalDegrees() {
    return this.verticalRadians * RAD2DEG;
  }
  set verticalDegrees(h) {
    this.verticalRadians = h * DEG2RAD;
  }
  setWithRadians(horizontal, vertical, distance) {
    this.horizontalRadians = horizontal;
    this.verticalRadians = vertical;
    this.distance = distance;
    return this;
  }
  setWithDegrees(horizontal, vertical, distance) {
    this.horizontalDegrees = horizontal;
    this.verticalDegrees = vertical;
    this.distance = distance;
    return this;
  }
  fromCartesianDirection(cartesian) {
    const direction = scratchVector3.copy(cartesian).normalize();
    this.verticalRadians = Math.asin(direction.y) * RAD2DEG;
    this.horizontalRadians = Math.atan2(direction.x, -direction.z) * RAD2DEG;
    this.distance = 0;
    return this;
  }
  fromCartesianPosition(cartesian) {
    this.fromCartesianDirection(cartesian);
    this.distance = cartesian.length();
    return this;
  }
  toCartesianDirection(out) {
    const visualElevationRadians = this.verticalRadians;
    const visualAzimuthRadians = -Math.PI - this.horizontalRadians;
    const y = Math.sin(visualElevationRadians);
    const x = Math.cos(visualElevationRadians) * Math.sin(visualAzimuthRadians);
    const z = -Math.cos(visualElevationRadians) * Math.cos(visualAzimuthRadians);
    return out.set(x, y, z).normalize();
  }
  toCartesianPosition(out) {
    return this.toCartesianDirection(out).multiplyScalar(this.distance);
  }
}
const scratchMatrix = new Matrix4();
const scratchMatrix2 = new Matrix4();
const ThreeBindings = {
  getChildren(metrics, children) {
    const nodeObj = metrics.node;
    if (!nodeObj.isObject3D)
      return;
    children.length = 0;
    for (let i = 0; i < nodeObj.children.length; i++) {
      children[i] = nodeObj.children[i];
    }
  },
  getState(metrics) {
    var _a2;
    if (metrics.system.viewNode === metrics.node) {
      const cameraNode = metrics.node;
      cameraNode.updateMatrixWorld();
      metrics.system.viewFrustum.setFromPerspectiveProjectionMatrix(cameraNode.projectionMatrix);
    }
    const node = metrics.node;
    if (!node.isObject3D)
      return;
    let worldMatrix;
    let relativeMatrix;
    if (metrics.isAdaptive) {
      const refWorldMatrix = (_a2 = metrics.referenceMetrics) == null ? void 0 : _a2.target.worldMatrix;
      relativeMatrix = scratchMatrix.compose(node.position, node.quaternion, node.scale);
      worldMatrix = refWorldMatrix ? scratchMatrix2.multiplyMatrices(refWorldMatrix, relativeMatrix) : relativeMatrix;
    } else {
      worldMatrix = node.matrixWorld;
      relativeMatrix = node.matrix;
    }
    metrics.raw.parent = node.parent;
    metrics.raw.worldMatrix.copy(worldMatrix);
    metrics.raw.relativeMatrix.copy(relativeMatrix);
    metrics.raw.opacity = getThreeOpacity(metrics) || 1;
  },
  getIntrinsicBounds(metrics, bounds) {
    const node = metrics.node;
    if (!node.isObject3D)
      return;
    if (node.geometry) {
      if (!node.geometry.boundingBox)
        node.geometry.computeBoundingBox();
      return bounds.copy(node.geometry.boundingBox);
    }
    return bounds;
  },
  apply(metrics, currentState) {
    const node = metrics.node;
    if (!node.isObject3D)
      return;
    if (currentState.parent !== node.parent) {
      const newParent = currentState.parent;
      if (newParent)
        newParent.add(node);
    }
    let val = currentState.localMatrix;
    if (isNaN(val.elements[0]) || isNaN(val.elements[13]) || isNaN(val.elements[14]) || isNaN(val.elements[15]) || val.elements[0] === 0)
      throw new Error();
    val = currentState.worldMatrix;
    if (isNaN(val.elements[0]) || isNaN(val.elements[13]) || isNaN(val.elements[14]) || isNaN(val.elements[15]) || val.elements[0] === 0)
      throw new Error();
    node.matrixAutoUpdate = false;
    node.matrix.copy(currentState.localMatrix);
    node.matrixWorld.copy(currentState.worldMatrix);
    applyThreeOpacity(metrics, currentState.opacity);
  }
};
function getThreeOpacity(metrics) {
  const node = metrics.node;
  if (node.material) {
    const materialList = node.material;
    if (materialList.length) {
      for (const m of materialList) {
        if (m.opacity !== void 0)
          return m.opacity;
      }
    } else {
      if ("opacity" in node.material)
        return node.material.opacity;
    }
  }
  for (const child of metrics.boundingChildMetrics) {
    const opacity = getThreeOpacity(child);
    if (opacity !== void 0)
      return opacity;
  }
  return void 0;
}
function applyThreeOpacity(metrics, opacity) {
  const node = metrics.node;
  if (node.material) {
    const materialList = node.material;
    if (materialList.length) {
      for (const m of materialList) {
        if ("opacity" in m)
          m.opacity = opacity;
      }
    } else
      node.material.opacity = opacity;
  }
  for (const child of metrics.boundingChildMetrics) {
    applyThreeOpacity(child, opacity);
  }
}
const DefaultBindings = {
  getChildren(metrics, children) {
    if (metrics.node.isObject3D) {
      ThreeBindings.getChildren(metrics, children);
    }
  },
  getState(metrics) {
    if (metrics.node.isObject3D) {
      ThreeBindings.getState(metrics);
    }
  },
  getIntrinsicBounds(metrics, bounds) {
    if (metrics.node.isObject3D) {
      ThreeBindings.getIntrinsicBounds(metrics, bounds);
    }
    return bounds;
  },
  apply(metrics, state) {
    if (metrics.node.isObject3D) {
      ThreeBindings.apply(metrics, state);
    }
  }
};
function createLayoutSystem(viewNode, bindings = DefaultBindings) {
  return new EtherealLayoutSystem(viewNode, bindings);
}
export { Box2, Box3, Color, DIRECTION, DefaultBindings, EtherealLayoutSystem, Euler, LayoutFrustum, LayoutSolution, Line3, MathUtils, Matrix3, Matrix4, MemoizationCache, NodeState, NodeStateBase, OptimizerConfig, Plane, Q_IDENTITY, Quaternion, Ray, SpatialAdapter, SpatialLayout, SpatialMetrics, SpatialOptimizer, SphericalCoordinate, ThreeBindings, Transition, TransitionConfig, Transitionable, V_00, V_000, V_001, V_010, V_100, V_11, V_111, Vector2, Vector3, Vector4, computeRelativeDifference, createLayoutSystem, easing, extractRotationAboutAxis, gaussian, levy, randomQuaternion, randomSelect };
//# sourceMappingURL=ethereal.es.js.map
