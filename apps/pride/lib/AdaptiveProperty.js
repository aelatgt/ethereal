// Scaffolding for controlling adaptive behavior with action-zones,
// dead-zones, and hysteresis
let AdaptiveProperty = /** @class */ (() => {
    class AdaptiveProperty {
        constructor(options) {
            this._metricValue = Number.NaN;
            this._pendingZoneChangeTime = Number.POSITIVE_INFINITY;
            this._metric = options.metric;
            this._zones = options.zones;
            this._threshold = options.threshold || 0;
            this._delay = options.delay || 0;
            if (typeof options.zones[0] === 'number' ||
                typeof options.zones[options.zones.length - 1] === 'number') {
                throw new Error('The supplied zone map must begin and end with a Zone object');
            }
        }
        get state() {
            this._verifyState();
            return this._currentZone && this._currentZone.state;
        }
        get metricValue() {
            this._verifyState();
            return this._metricValue;
        }
        /**
         *
         * @param deltaTime time in seconds since last update
         */
        update(deltaTime) {
            deltaTime = deltaTime * 1000; // convert to milliseconds
            const value = this._metricValue = this._metric();
            if (typeof value !== 'number') {
                throw new Error('The supplied metric function must return a number');
            }
            if (isNaN(value)) {
                throw new Error('The supplied metric function must not return NaN value');
            }
            const zones = this._zones;
            this._previousZone = this._currentZone;
            let possibleNextZone = this._currentZone;
            for (let i = 0; i < zones.length; i++) {
                const zone = zones[i];
                if (typeof zone === 'number') {
                    continue;
                }
                const lowerPivot = zones[i - 1];
                const upperPivot = zones[i + 1];
                const threshold = this._previousZone ?
                    typeof zone.threshold === 'number' ?
                        zone.threshold : this._threshold
                    : 0;
                const zoneStart = typeof lowerPivot === 'number' ?
                    lowerPivot + threshold : Number.NEGATIVE_INFINITY;
                const zoneEnd = typeof upperPivot === 'number' ?
                    upperPivot - threshold : Number.POSITIVE_INFINITY;
                if (value >= zoneStart && value <= zoneEnd) {
                    possibleNextZone = zone;
                    break;
                }
            }
            if (possibleNextZone !== this._previousZone) {
                this._pendingZoneChangeTime += deltaTime;
                const delay = typeof possibleNextZone.delay === 'number' ?
                    possibleNextZone.delay : 0;
                if (this._pendingZoneChangeTime > delay) {
                    this._currentZone = possibleNextZone;
                }
            }
            else {
                this._pendingZoneChangeTime = 0;
            }
            if (typeof this._currentZone === 'undefined') {
                throw new Error('The supplied zone map appears to be invalid');
            }
        }
        is(state) {
            this._verifyState();
            return this._currentZone && this._currentZone.state === state;
        }
        was(state) {
            this._verifyState();
            return this._previousZone && this._previousZone.state === state;
        }
        changedFrom(state) {
            this._verifyState();
            if (this._previousZone === this._currentZone) {
                return false;
            }
            return this._previousZone && this._previousZone.state === state;
        }
        changedTo(state) {
            this._verifyState();
            if (this._previousZone === this._currentZone) {
                return false;
            }
            return this._currentZone && this._currentZone.state === state;
        }
        changed() {
            this._verifyState();
            return this._currentZone !== this._previousZone;
        }
        _verifyState() {
            if (typeof this._currentZone === 'undefined') {
                throw new Error('AdaptiveProperty#update() must be called first.');
            }
        }
    }
    AdaptiveProperty.CompositeState = class CompositeState {
        constructor(object) {
            this.object = object;
        }
        update(deltaTime) {
            for (const key in this.object) {
                const prop = this.object[key];
                if (prop instanceof AdaptiveProperty) {
                    prop.update(deltaTime);
                }
            }
        }
        is(stateMap) {
            for (const key in stateMap) {
                const property = this.object[key];
                if (!property.is(stateMap[key])) {
                    return false;
                }
            }
            return true;
        }
        changingTo(stateMap) {
            let isNewState = false;
            for (const key in stateMap) {
                const property = this.object[key];
                const state = stateMap[key];
                if (!property.is(state)) {
                    return false;
                }
                if (property.changed()) {
                    isNewState = true;
                }
            }
            return isNewState;
        }
        changingFrom(stateMap) {
            let isNewState = false;
            for (const key in stateMap) {
                const property = this.object[key];
                const state = stateMap[key];
                if (!property.was(state)) {
                    return false;
                }
                if (property.changed()) {
                    isNewState = true;
                }
            }
            return isNewState;
        }
    };
    return AdaptiveProperty;
})();
export default AdaptiveProperty;
// export type AdaptiveProperties<T> = {
//     [K in keyof T]?: T[K] extends AdaptiveProperty<unknown> ? T[K] : any
// }
const test = {
    bla: new AdaptiveProperty({
        metric: () => 5,
        zones: [
            { state: 'hi' },
            234,
            { state: 'basdf' },
        ],
    }),
};
export const test2 = new AdaptiveProperty.CompositeState(test);
