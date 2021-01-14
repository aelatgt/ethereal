export interface Zone<T> {
    /**
     * The the state name for this zone
     */
    state: keyof T
    /**
     * The threshold value for transitioning to this zone
     */
    threshold?: number
    /**
     * The time in milliseconds until transitioning to this zones
     */
    delay?: number
}

export interface AdaptivePropertyOptions<T> {
    metric: () => number
    zones: Array<Zone<T>|number>
    /**
     * The default threshold for transitioning between zones
     */
    threshold?: number
    /**
     * The default time in milliseconds until transitioning between zones
     */
    delay?: number
}

// Scaffolding for controlling adaptive behavior with action-zones,
// dead-zones, and hysteresis
export default class AdaptiveProperty<T> {

    static CompositeState = class CompositeState <U> {
        constructor(public object: U) {}

        update(deltaTime: number) {
            for (const key in this.object) {
                const prop = this.object[key]
                if (prop instanceof AdaptiveProperty) {
                    prop.update(deltaTime)
                }
            }
        }

        is(stateMap: AdaptivePropertyStateMap<U>) { 
            for (const key in stateMap) {
                const property: AdaptiveProperty<U> = (this.object as any)[key]
                if (!property.is((stateMap as any)[key])) { return false }
            }
            return true
        }

        changingTo(stateMap: AdaptivePropertyStateMap<U>) {
            let isNewState = false
            for (const key in stateMap) {
                const property: AdaptiveProperty<U> = (this.object as any)[key]
                const state = (stateMap as any)[key]
                if (!property.is(state)) { return false }
                if (property.changed()) { isNewState = true }
            }
            return isNewState
        }

        changingFrom(stateMap: AdaptivePropertyStateMap<U>) {
            let isNewState = false
            for (const key in stateMap) {
                const property: AdaptiveProperty<U> = (this.object as any)[key]
                const state = (stateMap as any)[key]
                if (!property.was(state)) { return false }
                if (property.changed()) { isNewState = true }
            }
            return isNewState
        }
    }

    private _metricValue: number = Number.NaN
    private _metric: () => number
    private _zones: Array<Zone<T>|number>
    private _threshold: number
    private _delay: number

    private _pendingZoneChangeTime = Number.POSITIVE_INFINITY
    private _previousZone!: Zone<T>
    private _currentZone!: Zone<T>

    constructor(options: AdaptivePropertyOptions<T>) {
        this._metric = options.metric
        this._zones = options.zones
        this._threshold = options.threshold || 0
        this._delay = options.delay || 0

        if (typeof options.zones[0] === 'number' ||
            typeof options.zones[options.zones.length - 1] === 'number') {
            throw new Error('The supplied zone map must begin and end with a Zone object')
        }
    }

    get state() {
        this._verifyState()
        return this._currentZone && this._currentZone.state
    }

    get metricValue() {
        this._verifyState()
        return this._metricValue
    }

    /**
     *
     * @param deltaTime time in seconds since last update
     */
    update(deltaTime: number) {
        deltaTime = deltaTime * 1000 // convert to milliseconds
        const value = this._metricValue = this._metric()
        if ( typeof value !== 'number') { throw new Error('The supplied metric function must return a number') }
        if ( isNaN(value) ) { throw new Error('The supplied metric function must not return NaN value') }

        const zones = this._zones
        this._previousZone = this._currentZone
        let possibleNextZone = this._currentZone

        for (let i = 0; i < zones.length; i++) {
            const zone = zones[i]
            if (typeof zone === 'number') { continue }
            const lowerPivot = zones[i - 1]
            const upperPivot = zones[i + 1]
            const threshold = this._previousZone ?
                typeof zone.threshold === 'number' ?
                    zone.threshold : this._threshold
                : 0
            const zoneStart = typeof lowerPivot === 'number' ?
                lowerPivot + threshold : Number.NEGATIVE_INFINITY
            const zoneEnd = typeof upperPivot === 'number' ?
                upperPivot - threshold : Number.POSITIVE_INFINITY
            if (value >= zoneStart && value <= zoneEnd) {
                possibleNextZone = zone
                break
            }
        }

        if (possibleNextZone !== this._previousZone) {
            this._pendingZoneChangeTime += deltaTime
            const delay = typeof possibleNextZone.delay === 'number' ?
                possibleNextZone.delay : 0
            if (this._pendingZoneChangeTime > delay) {
                this._currentZone = possibleNextZone
            }
        } else {
            this._pendingZoneChangeTime = 0
        }

        if (typeof this._currentZone === 'undefined') {
            throw new Error('The supplied zone map appears to be invalid')
        }
    }

    is(state: keyof T) {
        this._verifyState()
        return this._currentZone && this._currentZone.state === state
    }

    was(state: keyof T) {
        this._verifyState()
        return this._previousZone && this._previousZone.state === state
    }

    changedFrom(state: keyof T) {
        this._verifyState()
        if (this._previousZone === this._currentZone) { return false }
        return this._previousZone && this._previousZone.state === state
    }

    changedTo(state: keyof T) {
        this._verifyState()
        if (this._previousZone === this._currentZone) { return false }
        return this._currentZone && this._currentZone.state === state
    }

    changed() {
        this._verifyState()
        return this._currentZone !== this._previousZone
    }

    private _verifyState() {
        if (typeof this._currentZone === 'undefined') {
            throw new Error('AdaptiveProperty#update() must be called first.')
        }
    }
}

export type Constructor<T> = new (...args: any[]) => T

export type AdaptivePropertyStateMap<T> = {
    [K in keyof T]?: T[K] extends AdaptiveProperty<infer Z> ? keyof Z : any
} & {constructor: any}

// export type AdaptiveProperties<T> = {
//     [K in keyof T]?: T[K] extends AdaptiveProperty<unknown> ? T[K] : any
// }


const test = {
    bla: new AdaptiveProperty({
        metric: () => 5,
        zones: [
            {state: 'hi'},
            234,
            {state: 'basdf'},
        ],
    }),
}

export const test2 = new AdaptiveProperty.CompositeState(test)
