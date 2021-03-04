import { MathUtils, Vector3, Quaternion, Euler } from './math-utils';
export class SpatialObjective {
    constructor(layout) {
        this.layout = layout;
        this.relativeTolerance = undefined;
        this.absoluteTolerance = undefined;
        this.bestScore = -Infinity;
        this.sortBlame = 0;
        this.reduceFromOneOrManySpec = (value, spec, mode, accuracy, applyFn) => {
            if (spec === undefined)
                return 0;
            // score for compound spec is best score in the list
            if (spec instanceof Array) {
                let score = -Infinity;
                for (const s of spec) {
                    score = Math.max(applyFn(value, s, mode, accuracy), score);
                }
                return score;
            }
            return applyFn(value, spec, mode, accuracy);
        };
        this._getNumberScoreSingle = (value, spec, mode, accuracy) => {
            // absolute score = - distance from target + accuracy 
            // relative score = (- distance from target / max magnitude) + accuracy
            const isRelative = mode === 'relative';
            let diff = 0;
            let magnitude = 1;
            if (typeof spec !== 'object') {
                const target = this.layout.adapter.measureNumber(spec);
                diff = Math.abs(value - target);
                if (isRelative)
                    magnitude = Math.max(Math.abs(target), Math.abs(value));
            }
            else {
                const min = 'gt' in spec ? this.layout.adapter.measureNumber(spec.gt) : undefined;
                const max = 'lt' in spec ? this.layout.adapter.measureNumber(spec.lt) : undefined;
                if (min !== undefined && value < min) {
                    diff = value - min;
                    if (isRelative)
                        magnitude = Math.max(Math.abs(min), Math.abs(value));
                }
                else if (max !== undefined && value > max) {
                    diff = max - value;
                    if (isRelative)
                        magnitude = Math.max(Math.abs(max), Math.abs(value));
                }
            }
            if (isRelative) {
                if (magnitude === 0)
                    return accuracy;
                return -(diff / magnitude) + accuracy;
            }
            return -diff + accuracy;
        };
        this._getVector3ScoreSingle = (value, spec, mode, accuracy) => {
            // penalty for discrete spec is distance from the valid value
            const xScore = ('x' in spec && typeof spec.x !== 'undefined') ? this.getNumberScore(value.x, spec.x, mode, accuracy) : 0;
            const yScore = ('y' in spec && typeof spec.y !== 'undefined') ? this.getNumberScore(value.y, spec.y, mode, accuracy) : 0;
            const zScore = ('z' in spec && typeof spec.z !== 'undefined') ? this.getNumberScore(value.z, spec.z, mode, accuracy) : 0;
            const magnitudeScore = ('magnitude' in spec && typeof spec.magnitude !== 'undefined') ? this.getNumberScore(value.length(), spec.magnitude, mode, accuracy) : 0;
            return xScore + yScore + zScore + magnitudeScore;
        };
        this._quat = new Quaternion;
        this._euler = new Euler;
        this._getQuaternionScoreSingle = (value, spec, mode, accuracy) => {
            if (spec === undefined)
                return 0;
            // absolute score = - angle from target + accuracy 
            // relative score = (- angle from target / max magnitude) + accuracy
            if ('x' in spec) {
                const s = this._quat.copy(spec);
                return -s.angleTo(value) * MathUtils.RAD2DEG + accuracy;
            }
            else if ('swingRange' in spec) {
                const euler = this._euler.setFromQuaternion(value);
                const swingX = euler.x * MathUtils.RAD2DEG;
                const swingY = euler.y * MathUtils.RAD2DEG;
                const twistZ = euler.z * MathUtils.RAD2DEG;
                const deg = this.layout.adapter.system.mathScope.degree;
                const swingRangeX = spec.swingRange?.x ? this.layout.adapter.measureNumber(spec.swingRange.x, deg) : 0;
                const swingRangeY = spec.swingRange?.y ? this.layout.adapter.measureNumber(spec.swingRange.y, deg) : 0;
                const twistRange = spec.twistRange ? this.layout.adapter.measureNumber(spec.twistRange, deg) : 0;
                const swingRange = Math.acos(Math.cos(swingRangeX * MathUtils.DEG2RAD) *
                    Math.cos(swingRangeY * MathUtils.DEG2RAD)) * MathUtils.RAD2DEG;
                const swingScore = (1 - (swingX / swingRangeX) ** 2 - (swingY / swingRangeY) ** 2) * swingRange;
                const twistScore = twistRange - Math.abs(twistZ);
                return swingScore + twistScore + accuracy;
            }
            return 0;
        };
        this._getMeasurePenaltySingle = (value, spec, type, subType, accuracy) => {
            if (spec === undefined)
                return 0;
            // penalty for single spec is distance from any valid value
            if (typeof spec === 'object') {
                if ('gt' in spec) {
                    const min = this.layout.adapter.measureBounds(spec.gt, type, subType);
                    if (value < min)
                        return value - min + accuracy;
                }
                if ('lt' in spec) {
                    const max = this.layout.adapter.measureBounds(spec.lt, type, subType);
                    if (value > max)
                        return max - value + accuracy;
                }
                return accuracy;
            }
            return -Math.abs(value - this.layout.adapter.measureBounds(spec, type, subType)) + accuracy;
        };
    }
    static isDiscreteSpec(s) {
        const type = typeof s;
        return type === 'string' || type === 'number';
    }
    static isContinuousSpec(s) {
        return s !== undefined && s instanceof Array === false && typeof s === 'object' && ('gt' in s || 'lt' in s) === true;
    }
    getNumberScore(value, spec, mode, accuracy) {
        return this.reduceFromOneOrManySpec(value, spec, mode, accuracy, this._getNumberScoreSingle);
    }
    getVector3Score(value, spec, mode, accuracy) {
        return this.reduceFromOneOrManySpec(value, spec, mode, accuracy, this._getVector3ScoreSingle);
    }
    getQuaternionScore(value, spec, accuracy) {
        return this.reduceFromOneOrManySpec(value, spec, 'absolute', accuracy, this._getQuaternionScoreSingle);
    }
    getBoundsScore(spec, type) {
        if (spec === undefined)
            return 0;
        let score = Infinity;
        for (const key in spec) {
            let k = key;
            if (k === 'size' || k === 'center') {
                const subSpec = spec[k];
                for (const subKey in subSpec) {
                    let sk = subKey;
                    score = Math.min(this.getBoundsMeasureScore(subSpec?.[sk], type, k + sk), score);
                }
            }
            else {
                score = Math.min(this.getBoundsMeasureScore(spec[k], type, k), score);
            }
        }
        return score;
    }
    getBoundsMeasureScore(spec, type, subType) {
        if (spec === undefined)
            return 0;
        const state = this.layout.adapter.metrics.targetState;
        const system = this.layout.adapter.system;
        let bounds;
        let center;
        let size;
        switch (type) {
            case 'spatial':
                bounds = state.spatialBounds;
                center = state.spatialCenter;
                size = state.spatialSize;
                break;
            case 'visual':
                bounds = state.visualBounds;
                center = state.visualCenter;
                size = state.visualSize;
                break;
            case 'view':
                const viewState = system.viewMetrics.targetState;
                bounds = viewState.visualBounds;
                center = viewState.visualCenter;
                size = viewState.visualSize;
                break;
            default:
                throw new Error(`Unknown measure type "${type}.${subType}" in spec:\n "${spec}"`);
        }
        let value = 0;
        switch (subType) {
            case 'left':
                value = bounds.min.x;
                break;
            case 'right':
                value = bounds.max.x;
                break;
            case 'bottom':
                value = bounds.min.y;
                break;
            case 'top':
                value = bounds.max.y;
                break;
            case 'back':
                value = bounds.min.z;
                break;
            case 'front':
                value = bounds.max.z;
                break;
            case 'centerx':
                value = center.x;
                break;
            case 'centery':
                value = center.y;
                break;
            case 'centerz':
                value = center.z;
                break;
            case 'sizex':
                value = size.x;
                break;
            case 'sizey':
                value = size.y;
                break;
            case 'sizez':
                value = size.z;
                break;
            case 'sizediagonal':
                value = type === 'spatial' ?
                    size.length() : Math.sqrt(size.x ** 2 + size.y ** 2);
                break;
            default:
                throw new Error(`Unknown measure subtype ${type}.${subType} in spec "${spec}"`);
        }
        const unit = (type === 'spatial' ||
            subType === 'front' ||
            subType === 'back' ||
            subType === 'centerz' ||
            subType === 'sizez') ? system.mathScope.meter : system.mathScope.pixel;
        const accuracyMeasure = unit === system.mathScope.meter ?
            this.layout.spatialAccuracy : this.layout.visualAccuracy;
        const accuracy = this.layout.adapter.measureNumber(accuracyMeasure, unit);
        // score for compound spec is best score in the list
        if (spec instanceof Array) {
            let score = -Infinity;
            for (const s of spec) {
                score = Math.max(this._getMeasurePenaltySingle(value, s, type, subType, accuracy), score);
            }
            return score;
        }
        return this._getMeasurePenaltySingle(value, spec, type, subType, accuracy);
    }
    /**  Attenuate visual score when out of view */
    attenuateVisualScore(score) {
        let penalty = 0;
        const acc = this.layout.adapter.measureNumber(this.layout.visualAccuracy, this.layout.adapter.system.mathScope.pixel);
        const adapter = this.layout.adapter;
        const viewResolution = adapter.system.viewResolution;
        const viewFrustum = adapter.system.viewFrustum;
        const vw = viewResolution.x;
        const vh = viewResolution.y;
        const visualBounds = adapter.metrics.targetState.visualBounds;
        const leftOffset = visualBounds.min.x - -vw / 2 + acc;
        const rightOffset = visualBounds.max.x - vw / 2 - acc;
        const bottomOffset = visualBounds.min.y - -vh / 2 + acc;
        const topOffset = visualBounds.max.y - vh / 2 - acc;
        const nearOffset = visualBounds.max.z + viewFrustum.nearMeters;
        if (leftOffset < 0)
            penalty += Math.abs(leftOffset / vw) * 10;
        if (rightOffset > 0)
            penalty += Math.abs(rightOffset / vw) * 10;
        if (bottomOffset < 0)
            penalty += Math.abs(bottomOffset / vh) * 10;
        if (topOffset > 0)
            penalty += Math.abs(topOffset / vh) * 10;
        if (nearOffset > 0)
            penalty += nearOffset;
        return score - Math.abs(score) * (penalty ** 2);
    }
}
export class LocalPositionConstraint extends SpatialObjective {
    evaluate() {
        const mathScope = this.layout.adapter.system.mathScope;
        const state = this.layout.adapter.metrics.targetState;
        const accuracy = this.layout.adapter.measureNumber(this.layout.relativeAccuracy, mathScope.meter);
        return this.getVector3Score(state.localPosition, this.spec, 'relative', accuracy);
    }
}
export class LocalOrientationConstraint extends SpatialObjective {
    evaluate() {
        const mathScope = this.layout.adapter.system.mathScope;
        const state = this.layout.adapter.metrics.targetState;
        const accuracy = this.layout.adapter.measureNumber(this.layout.angularAccuracy, mathScope.degree);
        return this.getQuaternionScore(state.localOrientation, this.spec, accuracy);
    }
}
export class LocalScaleConstraint extends SpatialObjective {
    evaluate() {
        const state = this.layout.adapter.metrics.targetState;
        const accuracy = this.layout.adapter.measureNumber(this.layout.relativeAccuracy);
        return this.getVector3Score(state.localScale, this.spec, 'absolute', accuracy);
    }
}
export class AspectConstraint extends SpatialObjective {
    constructor() {
        super(...arguments);
        this.mode = 'spatial';
        this._scale = new Vector3;
    }
    evaluate() {
        const state = this.layout.adapter.metrics.targetState;
        const accuracy = this.layout.adapter.measureNumber(this.layout.relativeAccuracy);
        const mode = this.mode;
        if (!mode)
            return 0;
        // const worldScale = state.worldScale
        const s = this._scale.copy(state.worldScale);
        const largest = mode === 'spatial' ?
            Math.max(Math.abs(s.x), Math.abs(s.y), Math.abs(s.z)) :
            Math.max(Math.abs(s.x), Math.abs(s.y));
        const aspectFill = s.divideScalar(largest);
        return this.getNumberScore(aspectFill.x, 1, 'absolute', accuracy) +
            this.getNumberScore(aspectFill.y, 1, 'absolute', accuracy) +
            (mode === 'spatial' ?
                this.getNumberScore(aspectFill.z, 1, 'absolute', accuracy) :
                // prevent z from being scaled largest when doing preserved 2D aspect
                aspectFill.z > 1 ? 1 - aspectFill.z : 0);
    }
}
export class SpatialBoundsConstraint extends SpatialObjective {
    evaluate() {
        return this.getBoundsScore(this.spec, 'spatial');
    }
}
export class VisualBoundsConstraint extends SpatialObjective {
    evaluate() {
        return this.attenuateVisualScore(this.getBoundsScore(this.spec, 'visual') +
            this.getBoundsScore(this.spec?.absolute, 'view'));
    }
}
export class VisualMaximizeObjective extends SpatialObjective {
    evaluate() {
        const visualSize = this.layout.adapter.metrics.targetState.visualSize;
        const viewSize = this.layout.adapter.system.viewResolution;
        let visualArea = Math.min(visualSize.x * visualSize.y, viewSize.x * viewSize.y);
        return this.attenuateVisualScore(visualArea);
    }
}
export class VisualForceObjective extends SpatialObjective {
    evaluate() {
        const visualSize = this.layout.adapter.metrics.targetState.visualSize;
        let visualArea = Math.min(visualSize.x * visualSize.y, visualSize.x * visualSize.y) ** 20;
        return this.attenuateVisualScore(visualArea);
    }
}
