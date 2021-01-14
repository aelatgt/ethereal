// import { cached, tracked, TrackedArray } from './tracking'
import { Vector2, Vector3, Quaternion, Box3, Color, MathUtils, V_00, V_000, Q_IDENTITY, computeRelativeDifference } from './math-utils';
import * as easingImport from '@popmotion/easing';
export const easing = easingImport;
export class Transition {
    constructor(options) {
        options && Object.assign(this, options);
    }
}
export class TransitionConfig {
    constructor(config) {
        config && Object.assign(this, config);
    }
}
export class Transitionable extends TransitionConfig {
    constructor(system, startValue, config, parentConfig = system.config.transition) {
        super(config);
        this.system = system;
        this.parentConfig = parentConfig;
        /** */
        this.needsUpdate = false;
        /**
         * The queue of committed transitions that are still influencing the `current` value
         * (whose durations have not yet been exceeded)
         */
        this.queue = [];
        /**
         * If false, this transitionable is inert
         */
        this.enabled = false;
        /**
         * Force the next update to not commit the target value
         **/
        this.forceWait = false;
        this._forceCommit = false;
        this._resolvedConfig = new TransitionConfig;
        this.delayTime = 0;
        this.debounceTime = 0;
        this.waitTime = 0;
        this._previousStatus = 'unchanged';
        this._status = 'unchanged';
        this._scratchV2 = new Vector2;
        this._scratchV3 = new Vector3;
        this._scratchQ = new Quaternion;
        this._scratchBox = new Box3;
        this._scratchColor = new Color;
        this._blackColor = new Color(0, 0, 0);
        this._addTransitionToCurrent = (current, start, transition) => {
            if (transition.elapsed === 0)
                return;
            const alpha = transition.easing(Math.min(transition.elapsed / transition.duration, 1));
            const target = transition.target;
            if (typeof target === 'number') {
                this._current = current + MathUtils.lerp(target - start, 0, 1 - alpha);
                return;
            }
            if ('isVector3' in target) {
                const c = current;
                const s = start;
                const e = target;
                const amount = this._scratchV3.copy(e).sub(s).lerp(V_000, 1 - alpha);
                this._current = c.add(amount);
                return;
            }
            if ('isVector2' in target) {
                const c = current;
                const s = start;
                const e = target;
                const amount = this._scratchV2.copy(e).sub(s).lerp(V_00, 1 - alpha);
                this._current = c.add(amount);
                return;
            }
            if ('isQuaternion' in target) {
                const c = current;
                const s = start;
                const e = target;
                const amount = this._scratchQ.copy(s).inverse().multiply(e).slerp(Q_IDENTITY, 1 - alpha);
                this._current = c.multiply(amount).normalize();
                return;
            }
            if ('isColor' in target) {
                const c = current;
                const s = start;
                const e = target;
                const amount = this._scratchColor.copy(e).sub(s).lerp(this._blackColor, 1 - alpha);
                this._current = c.add(amount);
                return;
            }
            if ('isBox3' in target) {
                const c = current;
                const s = start;
                const e = target;
                const minAmount = this._scratchBox.min.copy(e.min).sub(s.min).lerp(V_000, 1 - alpha);
                const maxAmount = this._scratchBox.max.copy(e.max).sub(s.max).lerp(V_000, 1 - alpha);
                c.min.add(minAmount);
                c.max.add(maxAmount);
                this._current = c;
                return;
            }
        };
        this.reset(startValue);
        this._previousTarget = this._copy(this._previousTarget, this.target);
    }
    _copy(to, from) {
        if (typeof from === 'undefined')
            return undefined;
        if (typeof from === 'number')
            return from;
        return to ? to.copy(from) : from.clone();
    }
    _isEqual(a, b) {
        if (a === undefined || b === undefined)
            return false;
        if (a === b)
            return true;
        if (typeof a === 'number')
            return a === b;
        return a?.equals(b) || false;
    }
    /**
     * Reset all states to the specified value,
     * and remove all ongoing transitions
     */
    reset(v) {
        this._start = this._copy(this._start, v);
        this._current = this._copy(this._current, v);
        this._target = this._copy(this._target, v);
        this.queue.length = 0;
    }
    /**
     * The starting value for currently ongoing transitions
     */
    set start(value) {
        this._start = this._copy(this._start, value);
    }
    get start() {
        return this._start;
    }
    /**
     * The current value.
     */
    set current(value) {
        this._current = this._copy(this._current, value);
    }
    get current() {
        return this._current;
    }
    /**
     * The "changed" reference value
     */
    set reference(value) {
        this._reference = this._copy(this._reference, value);
    }
    get reference() {
        return this._reference;
    }
    /**
     * The target value.
     */
    set target(value) {
        this.enabled = true;
        this._target = this._copy(this._target, value);
    }
    get target() {
        return this._target;
    }
    /**
     * At 0, a new transition has started
     * Between 0 and 1 represents the transition progress
     * At 1, no transitions are active
     */
    get progress() {
        if (!this.enabled)
            return 1;
        if (this.queue.length > 0) {
            const t = this.queue[this.queue.length - 1];
            return t.elapsed / t.duration;
        }
        return 1;
    }
    /**
     * Force the next update to commit the target value,
     * or the specified transition.
     * If forceCommit is set while forceWait is also set,
     * forceWait takes precedence.
     */
    get forceCommit() {
        return this._forceCommit;
    }
    set forceCommit(val) {
        if (this._forceCommit === val)
            return;
        this._forceCommit = val;
    }
    /**
     * The relative difference between the target and last committed value.
     */
    get relativeDifference() {
        const lastTarget = this.queue[this.queue.length - 1]?.target || this.start;
        return typeof this.target !== 'undefined' ? computeRelativeDifference(lastTarget, this.target) : 0;
    }
    /**
     * The relative difference between the target and reference value
     */
    get referenceRelativeDifference() {
        return typeof this.reference !== 'undefined' && typeof this.target !== 'undefined' ?
            computeRelativeDifference(this.reference, this.target) : Infinity;
    }
    /**
     * The transition config after accounting for adapter and system defaults
     */
    get resolvedConfig() {
        const r = this._resolvedConfig;
        const adapterConfig = this.parentConfig;
        const systemConfig = this.system.config.transition;
        r.multiplier = this.multiplier ?? adapterConfig?.multiplier ?? systemConfig.multiplier;
        r.duration = this.duration ?? adapterConfig?.duration ?? systemConfig.duration;
        r.easing = this.easing ?? adapterConfig?.easing ?? systemConfig.easing;
        r.threshold = this.threshold ?? adapterConfig?.threshold ?? systemConfig.threshold;
        r.delay = this.delay ?? adapterConfig?.delay ?? systemConfig.delay;
        r.debounce = this.debounce ?? adapterConfig?.debounce ?? systemConfig.debounce;
        r.maxWait = this.maxWait ?? adapterConfig?.maxWait ?? systemConfig.maxWait;
        r.blend = this.blend ?? adapterConfig?.blend ?? systemConfig.blend;
        return r;
    }
    get previousStatus() {
        return this._previousStatus;
    }
    /**
     * Describes the status of the target value
     *
     * "unchanged" - the target value is unchanged relative to the last committed value
     * "changed" - the target value has changed relative to the `reference` value or last committed value
     * "settling" - the target value has changed, pending stabalization/timeout, or reversion to "unchanged" state
     * "committing" - the target value will be accepted as a new transition targets
     */
    get status() {
        if (this.needsUpdate) {
            this._previousStatus = this._status;
            this._status = this._computeStatus();
        }
        return this._status;
    }
    _computeStatus() {
        if (this.forceCommit)
            return 'committing';
        const config = this.resolvedConfig;
        const threshold = config.threshold;
        const delta = this.system.deltaTime * config.multiplier;
        const delay = this.delayTime + delta;
        const debounce = this.debounceTime + delta;
        const wait = this.waitTime + delta;
        const relDiff = this.relativeDifference;
        const changed = relDiff > threshold;
        if (!changed)
            return 'unchanged';
        if (!this.forceWait && ((delay >= config.delay && debounce >= config.debounce) || wait >= config.maxWait)) {
            return 'committing';
        }
        const refRelDiff = this.referenceRelativeDifference;
        const stable = refRelDiff < threshold;
        if (!stable && delay >= config.delay) {
            return 'changed';
        }
        return 'settling';
    }
    /**
     *
     */
    _updateTransitionable() {
        const deltaTime = this.system.deltaTime;
        const config = this.resolvedConfig;
        const queue = this.queue;
        const status = this.status;
        const delta = deltaTime * config.multiplier;
        // Finite Impulse Response Interruptable Transitions
        while (queue.length && queue[0].elapsed >= queue[0].duration) {
            this.start = queue.shift().target;
        }
        this.current = this.start;
        const current = this._current;
        let previousTarget = this.start;
        for (const transition of queue) {
            this._addTransitionToCurrent(current, previousTarget, transition);
            transition.elapsed += delta;
            previousTarget = transition.target;
            if (!transition.blend)
                break;
        }
        // Hysteresis-Aware Target Change Trigger
        switch (status) {
            case 'changed':
                this.reference = this.target;
                this.debounceTime = 0;
            // continue
            case 'settling':
                if (!this.reference) {
                    this.delayTime += delta;
                }
                else {
                    this.debounceTime += delta;
                    this.waitTime += delta;
                }
                break;
            case 'unchanged':
                this.reference = undefined;
                this.delayTime = 0;
                this.debounceTime = 0;
                this.waitTime = 0;
                // if relative difference is greater than 0
                // (and less then the change threshold),
                // instantly update the last committed value to the 
                // current target
                if (this.relativeDifference > 0) {
                    if (this.queue.length > 0) {
                        const t = this.queue[this.queue.length - 1];
                        t.target = this._copy(t.target, this.target);
                    }
                    else {
                        this.start = this._copy(this.start, this.target);
                    }
                }
                break;
            case 'committing':
                const transition = typeof this.forceCommit === 'object' ?
                    this.forceCommit : new Transition();
                transition.target = transition.target ?? this._copy(undefined, this.target);
                transition.duration = transition.duration ?? config.duration;
                transition.easing = transition.easing ?? config.easing;
                transition.blend = transition.blend ?? config.blend;
                transition.elapsed = transition.elapsed ?? 0;
                queue.push(transition);
                this.forceCommit = false;
                break;
        }
        this.forceWait = false;
    }
    /**
     *
     */
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
                if (t.enabled && t.status === 'committing') {
                    for (const to of syncGroup) {
                        if (to.needsUpdate && to.forceCommit === false)
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
        group?.add(this);
    }
    get syncGroup() {
        return this._syncGroup;
    }
}
