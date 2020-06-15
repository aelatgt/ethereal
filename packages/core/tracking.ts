import { memo as memoizeFn, DirtyableTag, tagFor, trackedData } from '@glimmer/validator'
export { isConst, isConstMemo, isTracking, tagFor, trackedData } from '@glimmer/validator'

export const tracked: PropertyDecorator = (...args: any[]) => {
  const [target, key, descriptor] = args
  if (descriptor) {
    return descriptorForField(target, key, descriptor)
  }
  Object.defineProperty(target, key, descriptorForField(target, key))
}

type DecoratorPropertyDescriptor = (PropertyDescriptor & { initializer?: any }) | undefined;

function descriptorForField<T extends object, K extends keyof T>(
  _target: T,
  key: K,
  desc?: DecoratorPropertyDescriptor
): PropertyDescriptor {
  if (desc && (desc.value || desc.get || desc.set)) {
    throw new Error(
      `You attempted to use @tracked on ${key}, but that element is not a class field. @tracked is only usable on class fields. Native getters and setters will autotrack add any tracked fields they encounter, so there is no need mark getters and setters with @tracked.`
    );
  }
  const { getter, setter } = trackedData<T, K>(key, desc && desc.initializer)
  return {
    enumerable: true,
    configurable: true,
    get(this: T): any {
      return getter(this)
    },
    set(this: T, newValue: any): void {
      setter(this, newValue)
    },
  }
}

export function memo<F extends Function>(callback:F, debugContext?:any) : F {
  let _this:any
  let _args:any
  const memoized = memoizeFn( () => callback.apply(_this, _args), debugContext )
  const wrapped = function (this:any,...args:any) {
    _this = this
    _args = args
    return memoized()
  } as any
  return wrapped
}

export function cached(target:any, key:string|symbol, desc:PropertyDescriptor): PropertyDescriptor {
  const memoMap = new WeakMap()
  const fn = desc.get || desc.value
  const isGetter = !!desc.get 
  return {
    get() {
      let memoizedFn = memoMap.get(this)
      if (memoizedFn === undefined) {
        memoizedFn = memo(fn.bind(this), key)
        memoMap.set(this, memoizedFn)
      }
      if (isGetter) return memoizedFn()
      return memoizedFn
    }
  }
}

import {createTag, consumeTag, dirtyTag, Tag} from '@glimmer/validator'

const ARRAY_GETTER_METHODS = new Set<string | symbol | number>([
  Symbol.iterator,
  'concat',
  'entries',
  'every',
  'fill',
  'filter',
  'find',
  'findIndex',
  'flat',
  'flatMap',
  'forEach',
  'includes',
  'indexOf',
  'join',
  'keys',
  'lastIndexOf',
  'map',
  'reduce',
  'reduceRight',
  'slice',
  'some',
  'values',
]);

function convertToInt(prop: number | string | symbol): number | null {
  if (typeof prop === 'symbol') return null;

  const num = Number(prop);

  if (isNaN(num)) return null;

  return num % 1 === 0 ? num : null;
}

function createArrayProxy<T>(arr: T[]) {
  const collectionTag = createTag();
  let indexTags: any[] = [];

  let boundFns = new Map();

  let prevProp = '' as string|number|Symbol

  return new Proxy(arr, {
    get(target, prop, receiver) {
      let index = convertToInt(prop);

      if (index !== null) {
        let tag = indexTags[index];

        if (tag === undefined) {
          tag = indexTags[index] = createTag();
        }

        consumeTag(tag);
        consumeTag(collectionTag);
        prevProp = prop

        return target[index];
      } else if (prop === 'length' && prevProp !== 'push') {
        consumeTag(collectionTag);
        prevProp = prop
      } else if (ARRAY_GETTER_METHODS.has(prop)) {
        let fn = boundFns.get(prop);

        if (fn === undefined) {
          fn = (...args: unknown[]) => {
            consumeTag(collectionTag);
            return (target as any)[prop](...args);
          };

          boundFns.set(prop, fn);
        }

        prevProp = prop
        return fn;
      }

      prevProp = prop
      return (target as any)[prop];
    },

    set(target, prop, value, receiver) {
      (target as any)[prop] = value;

      let index = convertToInt(prop);

      if (index !== null) {
        let tag = indexTags[index];

        if (tag !== undefined) {
          dirtyTag(tag);
        }

        dirtyTag(collectionTag);
      } else if (prop === 'length') {
        dirtyTag(collectionTag);
      }

      return true;
    },

    getPrototypeOf() {
      return TrackedArray.prototype;
    },
  });
}

export interface TrackedArray<T = unknown> extends Array<T> {}

export class TrackedArray<T = unknown> {
  static from<T>(it: Iterable<T>) {
    return createArrayProxy(Array.from(it));
  }

  static of<T>(...arr: T[]) {
    return createArrayProxy(arr);
  }

  constructor(arr: T[] = []) {
    return createArrayProxy(arr.slice());
  }
}

// Ensure instanceof works correctly
Object.setPrototypeOf(TrackedArray.prototype, Array.prototype);

const OBJECT_TAGS = new WeakMap<object, Map<unknown, DirtyableTag>>();

function getOrCreateTag(obj: object, key: unknown) {
  let tags = OBJECT_TAGS.get(obj);

  if (tags === undefined) {
    tags = new Map();
    OBJECT_TAGS.set(obj, tags);
  }

  let tag = tags.get(key);

  if (tag === undefined) {
    tag = createTag()
    tags.set(key, tag);
  }

  return tag;
}

export function consumeKey(obj: object, key: unknown) {
  consumeTag(getOrCreateTag(obj, key));
}

export function dirtyKey(obj: object, key: unknown) {
  dirtyTag(getOrCreateTag(obj, key));
}

export class TrackedMap<K = unknown, V = unknown> extends Map<K, V> {

  private _collectionTag = createTag()

  // **** KEY GETTERS ****
  get(key: K) {
    consumeKey(this, key);

    return super.get(key);
  }

  has(key: K) {
    consumeKey(this, key);

    return super.has(key);
  }

  // **** ALL GETTERS ****
  entries() {
    consumeTag(this._collectionTag)

    return super.entries();
  }

  keys() {
    consumeTag(this._collectionTag)

    return super.keys();
  }

  values() {
    consumeTag(this._collectionTag)

    return super.values();
  }

  forEach(fn: (value: V, key: K, map: Map<K,V>) => void) {
    consumeTag(this._collectionTag)

    super.forEach(fn);
  }

  get size() {
    consumeTag(this._collectionTag)

    return super.size;
  }

  // **** KEY SETTERS ****
  set(key: K, value: V) {
    dirtyKey(this, key);
    dirtyTag(this._collectionTag)

    return super.set(key, value);
  }

  delete(key: K) {
    dirtyKey(this, key);
    dirtyTag(this._collectionTag)

    return super.delete(key);
  }

  // **** ALL SETTERS ****
  clear() {
    super.forEach((_v, k) => dirtyKey(this, k));
    dirtyTag(this._collectionTag)

    return super.clear();
  }
}

if (typeof Symbol !== undefined) {
  let originalIterator = TrackedMap.prototype[Symbol.iterator];

  Object.defineProperty(TrackedMap.prototype, Symbol.iterator, {
    get() {
      consumeTag(this._collectionTag)
      return originalIterator;
    }
  });
}

export class TrackedWeakMap<K extends object = object, V = unknown> extends WeakMap<K,V> {
  get(key: K) {
    consumeKey(this, key);

    return super.get(key);
  }

  has(key: K) {
    consumeKey(this, key);

    return super.has(key);
  }

  set(key: K, value: V) {
    dirtyKey(this, key);

    return super.set(key, value);
  }

  delete(key: K) {
    dirtyKey(this, key);

    return super.delete(key);
  }
}