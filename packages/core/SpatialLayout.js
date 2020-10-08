import { Vector3, Quaternion, Box3, MathUtils, V_111, randomSelect, randomQuaternion, gaussian, levy } from './math';
import { TransitionConfig } from './Transitionable';
export class BoundsSpec {
}
export class FrustumSpec {
}
// type K = UnionToIntersection<Exclude<LinearMeasureSpec, Array<any>|Exclude<LinearMeasureSpec,Partial<{gt:any,lt:any}>>>>
// type X = Exclude<keyof UnionToIntersection<LinearMeasureSpec>,'gt'|'lt'>
/**
 * Defines spatial layout constraints/goals
 */
let SpatialLayout = /** @class */ (() => {
    class SpatialLayout {
        constructor() {
            /**
             * The constraints applied to this layout
             */
            this.constraints = new Array();
            /**
             * The objectives applied to this layout
             */
            this.objectives = new Array();
            /**
             *
             */
            // setFromNodeState(node:Node3D) {
            //     const metrics = this.system.getMetrics(node)
            //     metrics.invalidateNodeState()
            //     const s = metrics.nodeState
            //     this.position = { x: s.localPosition.x, y: s.localPosition.y, z: s.localPosition.z }
            //     this.orientation = { x: s.localOrientation.x, y: s.localOrientation.y, z: s.localOrientation.z, w: s.localOrientation.w }
            //     this.scale = { x: s.localScale.x, y: s.localScale.y, z: s.localScale.z }
            // }
            /**
             *
             */
            // origin = new Vector3(0.5,0.5,0.5)
            /**
             * The content aspect constraint
             */
            this.aspect = 'preserve-3d';
            this.aspectConstraint = this._addConstraint((state) => {
                const aspect = this.aspect;
                if (!aspect || aspect === 'any')
                    return 0;
                const worldScale = state.worldScale;
                const s = this._aspect.copy(worldScale);
                const largest = aspect === 'preserve-3d' ?
                    Math.max(Math.abs(s.x), Math.abs(s.y), Math.abs(s.y)) :
                    Math.max(Math.abs(s.x), Math.abs(s.y));
                const aspectFill = s.divideScalar(largest);
                return aspect === 'preserve-3d' ?
                    SpatialLayout.getVector3Penalty(aspectFill, V_111) * 10 :
                    SpatialLayout.getNumberPenalty(aspectFill.x, 1) * 10 + SpatialLayout.getNumberPenalty(aspectFill.y, 1) * 10;
                // return SpatialLayout.getVector3Penalty(aspectFill, V_111)
            });
            this._aspect = new Vector3;
            this.orientationConstraint = this._addConstraint((m) => {
                if (!this.orientation)
                    return 0;
                return SpatialLayout.getQuaternionPenalty(m.localOrientation, this.orientation, m.metrics.system.config.epsillonRadians);
            });
            // /**
            //  * The layout bounds spec
            //  */
            this.local = new BoundsSpec;
            this.localConstraint = this._addConstraint((m) => {
                if (!this.local)
                    return 0;
                return SpatialLayout.getBoundsPenalty(m, this.local);
            });
            /** The visual bounds spec */
            this.visual = new FrustumSpec;
            this.visualConstraint = this._addConstraint((m) => {
                if (!this.visual)
                    return 0;
                return SpatialLayout.getVisualBoundsPenalty(m, this.visual);
            });
            this.positionConstraint = this._addConstraint((m) => {
                if (!this.position)
                    return 0;
                return SpatialLayout.getVector3Penalty(m.localPosition, this.position);
            });
            /**
             * The local scale constraint spec
             */
            this.scale = {
                x: { gt: 1e-6, lt: 1e6 },
                y: { gt: 1e-6, lt: 1e6 },
                z: { gt: 1e-6, lt: 1e6 }
            };
            this.scaleConstraint = this._addConstraint((m) => {
                if (!this.scale)
                    return 0;
                return 10 * SpatialLayout.getVector3Penalty(m.localScale, this.scale);
            });
            /** */
            this.visualMaximize = true;
            this.visualMaximizeObjective = this._addObjective((state) => {
                return state.visualFrustum.diagonalDegrees;
            });
            this.#solutions = new Array();
            /**
             * Transition overrides for this layout
             */
            this.transition = new TransitionConfig;
            /**
             * The current optimization iteration
             */
            this.iteration = 0;
            // Object.seal(this) // seal to preserve call-site monomorphism
        }
        static isDiscreteSpec(s) {
            return s !== undefined && s instanceof Array === false && ('gt' in s || 'lt' in s) === false;
        }
        static isContinuousSpec(s) {
            return s !== undefined && s instanceof Array === false && ('gt' in s || 'lt' in s) === true;
        }
        static getNumberPenalty(value, spec, epsillon = 0) {
            if (spec === undefined)
                return 0;
            // penalty for compound spec is smallest penalty in the list
            if (spec instanceof Array && spec.length) {
                let penalty = Infinity;
                for (const s of spec) {
                    penalty = Math.min(this._getNumberPenaltySingle(value, s), penalty);
                    if (penalty <= epsillon) {
                        return 0;
                    }
                }
                return penalty;
            }
            const penalty = this._getNumberPenaltySingle(value, spec);
            if (penalty < epsillon)
                return 0;
            return penalty;
        }
        static _getNumberPenaltySingle(value, spec) {
            if (spec === undefined)
                return 0;
            // penalty for single spec is distance from any valid value
            if (typeof spec === 'number')
                return Math.abs(value - spec);
            if ('gt' in spec && typeof spec.gt === 'number' && value < spec.gt)
                return spec.gt - value;
            if ('lt' in spec && typeof spec.lt === 'number' && value > spec.lt)
                return value - spec.lt;
            return 0;
        }
        static getVector3Penalty(value, spec, epsillon = 0) {
            if (spec === undefined)
                return 0;
            // penalty for compound spec is smallest penalty in the list
            if (spec instanceof Array && spec.length) {
                let penalty = Infinity;
                for (const s of spec) {
                    penalty = Math.min(this._getVector3PenaltySingle(value, s, epsillon), penalty);
                    if (penalty <= epsillon) {
                        return 0;
                    }
                }
                return penalty;
            }
            const penalty = this._getVector3PenaltySingle(value, spec, epsillon);
            if (penalty <= epsillon) {
                return 0;
            }
            return penalty;
        }
        static _getVector3PenaltySingle(value, spec, epsillon) {
            // penalty for discrete spec is distance from the valid value
            const xPenalty = ('x' in spec && typeof spec.x !== 'undefined') ? this.getNumberPenalty(value.x, spec.x, epsillon) : 0;
            const yPenalty = ('y' in spec && typeof spec.y !== 'undefined') ? this.getNumberPenalty(value.y, spec.y, epsillon) : 0;
            const zPenalty = ('z' in spec && typeof spec.z !== 'undefined') ? this.getNumberPenalty(value.z, spec.z, epsillon) : 0;
            const magnitudePenalty = ('magnitude' in spec && typeof spec.magnitude !== 'undefined') ? this.getNumberPenalty(value.length(), spec.magnitude, epsillon) : 0;
            const xyzPenalty = Math.sqrt(xPenalty ** 2 + yPenalty ** 2 + zPenalty ** 2);
            return Math.max(xyzPenalty, magnitudePenalty);
        }
        static getQuaternionPenalty(value, spec, epsillon = 0) {
            if (spec === undefined)
                return 0;
            // penalty for compound spec is smallest penalty in the list
            if (spec instanceof Array && spec.length) {
                let penalty = Infinity;
                for (const s of spec) {
                    penalty = Math.min(this._getQuaternionPenaltySingle(value, s), penalty);
                    if (penalty <= epsillon) {
                        return 0;
                    }
                }
                return penalty;
            }
            const penalty = this._getQuaternionPenaltySingle(value, spec);
            if (penalty <= epsillon) {
                return 0;
            }
            return penalty;
        }
        static _getQuaternionPenaltySingle(value, spec) {
            if (spec === undefined)
                return 0;
            // penalty for discrete spec is distance from the valid value
            if (spec instanceof Quaternion)
                return spec.angleTo(value) * MathUtils.RAD2DEG / 0.0360;
            // penalty for continous spec is distance from the valid range
            // const axis = 'axis' in spec && spec.axis
            // const xPenalty = ('x' in axis && typeof axis.x !== 'undefined') ? this._getNumberPenalty(value.x, axis.x) : 0
            // const yPenalty = ('y' in axis && typeof axis.y !== 'undefined') ? this._getNumberPenalty(value.y, axis.y) : 0
            // const zPenalty = ('z' in axis && typeof axis.z !== 'undefined') ? this._getNumberPenalty(value.z, axis.z) : 0
            // const magnitudePenalty = ('magnitude' in spec && typeof spec.magnitude !== 'undefined') ? this._getNumberPenalty(value.length(), spec.magnitude) : 0
            // const xyzPenalty = Math.sqrt(xPenalty**2 + yPenalty**2 + zPenalty**2)
            // return Math.max(xyzPenalty, magnitudePenalty)
            return 0;
        }
        static getBoundsPenalty(state, spec) {
            if (spec === undefined)
                return 0;
            let hasSpec = false;
            for (const key in spec) {
                if (typeof spec[key] !== 'undefined')
                    hasSpec = true;
            }
            if (!hasSpec)
                return 0;
            const bounds = state.layoutBounds;
            const center = state.layoutCenter;
            const size = state.layoutSize;
            const outerSize = state.outerSize;
            const leftPenalty = this.getLinearMeasurePenalty(bounds.min.x, spec.left, outerSize.x);
            const rightPenalty = this.getLinearMeasurePenalty(bounds.max.x, spec.right, outerSize.x);
            const bottomPenalty = this.getLinearMeasurePenalty(bounds.min.y, spec.bottom, outerSize.y);
            const topPenalty = this.getLinearMeasurePenalty(bounds.max.y, spec.top, outerSize.y);
            const frontPenalty = this.getLinearMeasurePenalty(bounds.max.z, spec.front, outerSize.z);
            const backPenalty = this.getLinearMeasurePenalty(bounds.min.z, spec.back, outerSize.z);
            // const combinedEdgePenalty = //Math.sqrt((rightPenalty + leftPenalty)**2 + (topPenalty + bottomPenalty)**2 + (frontPenalty + backPenalty)**2)
            const xPenalty = this.getLinearMeasurePenalty(center.x, spec.centerX, outerSize.x);
            const yPenalty = this.getLinearMeasurePenalty(center.y, spec.centerY, outerSize.y);
            const zPenalty = this.getLinearMeasurePenalty(center.z, spec.centerZ, outerSize.z);
            const widthPenalty = this.getLinearMeasurePenalty(size.x, spec.width, outerSize.x);
            const heightPenalty = this.getLinearMeasurePenalty(size.y, spec.height, outerSize.y);
            const depthPenalty = this.getLinearMeasurePenalty(size.z, spec.depth, outerSize.z);
            const diagonalLengthPenalty = this.getLinearMeasurePenalty(size.length(), spec.diagonalLength, outerSize.length());
            // const combinedSizePenalty = Math.sqrt(widthPenalty**2 + heightPenalty**2 + depthPenalty**2)
            // return Math.max(combinedEdgePenalty, combinedSizePenalty)
            return leftPenalty +
                rightPenalty +
                bottomPenalty +
                topPenalty +
                frontPenalty +
                backPenalty +
                xPenalty +
                yPenalty +
                zPenalty +
                widthPenalty +
                heightPenalty +
                depthPenalty +
                diagonalLengthPenalty;
        }
        static getLinearMeasurePenalty(valueMeters, spec, range) {
            if (spec === undefined)
                return 0;
            // penalty for compound spec is smallest penalty in the list
            if (spec instanceof Array && spec.length) {
                let penalty = Infinity;
                for (const s of spec) {
                    penalty = Math.min(this._getLinearMeasurePenaltySingle(valueMeters, s, range), penalty);
                }
                return penalty;
            }
            return this._getLinearMeasurePenaltySingle(valueMeters, spec, range);
        }
        static _getLinearMeasurePenaltySingle(valueMeters, spec, range) {
            if (spec === undefined)
                return 0;
            // if (typeof spec === 'number') return Math.abs(valueMeters - spec)
            // penalty for single spec is distance from any valid value
            if ('gt' in spec || 'lt' in spec) {
                if (typeof spec.gt !== 'undefined') {
                    const minMeters = this.getMetersFromLinearMeasure(spec.gt, range);
                    if (valueMeters < minMeters)
                        return (minMeters - valueMeters);
                }
                if (typeof spec.lt !== 'undefined') {
                    const maxMeters = this.getMetersFromLinearMeasure(spec.lt, range);
                    if (valueMeters > maxMeters)
                        return (valueMeters - maxMeters);
                }
                return 0;
            }
            return Math.abs(valueMeters - this.getMetersFromLinearMeasure(spec, range));
        }
        static getVisualBoundsPenalty(state, spec) {
            if (spec === undefined)
                return 0;
            let hasSpec = false;
            for (const key in spec) {
                if (typeof spec[key] !== 'undefined')
                    hasSpec = true;
            }
            if (!hasSpec)
                return 0;
            const system = state.metrics.system;
            const viewSizeDegrees = system.viewFrustum.sizeDegrees;
            const viewDepthMeters = system.viewFrustum.depth;
            const viewNearMeters = system.viewFrustum.nearMeters;
            const visualFrustum = state.visualFrustum;
            const visualDepth = visualFrustum.depth;
            if (visualDepth < 0)
                return -visualDepth * 100000 + 1000; // inverted penalty
            const leftPenalty = 2 * this.getVisualMeasurePenalty(visualFrustum.leftDegrees, spec.left, viewSizeDegrees.x, viewNearMeters);
            const rightPenalty = 2 * this.getVisualMeasurePenalty(visualFrustum.rightDegrees, spec.right, viewSizeDegrees.x, viewNearMeters);
            const bottomPenalty = 2 * this.getVisualMeasurePenalty(visualFrustum.bottomDegrees, spec.bottom, viewSizeDegrees.y, viewNearMeters);
            const topPenalty = 2 * this.getVisualMeasurePenalty(visualFrustum.topDegrees, spec.top, viewSizeDegrees.y, viewNearMeters);
            const nearPenalty = 10 * this.getLinearMeasurePenalty(visualFrustum.nearMeters, spec.near, viewDepthMeters);
            const farPenalty = 10 * this.getLinearMeasurePenalty(visualFrustum.farMeters, spec.far, viewDepthMeters);
            const visualSize = visualFrustum.sizeDegrees;
            const widthPenalty = 2 * this.getVisualMeasurePenalty(visualSize.x, spec.width, viewSizeDegrees.x, viewNearMeters);
            const heightPenalty = 2 * this.getVisualMeasurePenalty(visualSize.y, spec.height, viewSizeDegrees.y, viewNearMeters);
            const depthPenalty = this.getLinearMeasurePenalty(visualFrustum.depth, spec.depth, viewDepthMeters);
            const diagonalLengthPenalty = this.getVisualMeasurePenalty(visualFrustum.diagonalDegrees, spec.diagonalLength, viewSizeDegrees.y, viewNearMeters);
            const centerXPenalty = 4 * this.getVisualMeasurePenalty(visualFrustum.centerDegrees.x, spec.centerX, viewSizeDegrees.x, viewNearMeters);
            const centerYPenalty = 4 * this.getVisualMeasurePenalty(visualFrustum.centerDegrees.y, spec.centerY, viewSizeDegrees.y, viewNearMeters);
            const centerZPenalty = this.getLinearMeasurePenalty(visualFrustum.distance, spec.centerZ, viewDepthMeters);
            const angleToCenterPenalty = this.getVisualMeasurePenalty(visualFrustum.angleToCenter, spec.angleToCenter, viewSizeDegrees.y, viewNearMeters);
            // const combinedSizePenalty = Math.sqrt(widthPenalty**2 + heightPenalty**2 + depthPenalty**2)
            // return Math.max(combinedEdgePenalty, combinedSizePenalty)
            return (leftPenalty +
                rightPenalty +
                bottomPenalty +
                topPenalty +
                nearPenalty +
                farPenalty +
                widthPenalty +
                heightPenalty +
                depthPenalty +
                diagonalLengthPenalty +
                centerXPenalty +
                centerYPenalty +
                centerZPenalty +
                angleToCenterPenalty) * 100;
        }
        static getVisualMeasurePenalty(valueDegrees, spec, rangeDegrees, nearMeters) {
            if (spec === undefined)
                return 0;
            // penalty for compound spec is smallest penalty in the list
            if (spec instanceof Array && spec.length) {
                let penalty = Infinity;
                for (const s of spec) {
                    penalty = Math.min(this._getVisualMeasurePenaltySingle(valueDegrees, s, rangeDegrees, nearMeters), penalty);
                }
                return penalty;
            }
            const penalty = this._getVisualMeasurePenaltySingle(valueDegrees, spec, rangeDegrees, nearMeters);
            return penalty / rangeDegrees;
        }
        static _getVisualMeasurePenaltySingle(valueDegrees, spec, rangeDegrees, nearMeters) {
            if (spec === undefined)
                return 0;
            // penalty for single spec is distance from any valid value
            if ('gt' in spec || 'lt' in spec) {
                if (typeof spec.gt !== 'undefined') {
                    const minDegrees = this.getDegreesFromVisualMeasure(spec.gt, rangeDegrees, nearMeters);
                    if (valueDegrees < minDegrees)
                        return (minDegrees - valueDegrees);
                }
                if (typeof spec.lt !== 'undefined') {
                    const maxDegrees = this.getDegreesFromVisualMeasure(spec.lt, rangeDegrees, nearMeters);
                    if (valueDegrees > maxDegrees)
                        return (valueDegrees - maxDegrees);
                }
                return 0;
            }
            return Math.abs(valueDegrees - this.getDegreesFromVisualMeasure(spec, rangeDegrees, nearMeters));
        }
        static getMetersFromLinearMeasure(measure, rangeMeters) {
            if (typeof measure === 'number')
                return measure;
            return (measure.meters || 0) + 0.01 * (measure.centimeters || 0) + rangeMeters * (measure.percent || 0) / 100;
        }
        static getDegreesFromVisualMeasure(measure, rangeDegrees, nearMeters) {
            if (typeof measure === 'number')
                return measure;
            return (measure.degrees || 0) +
                MathUtils.RAD2DEG * (measure.radians || 0) +
                2 * MathUtils.RAD2DEG * Math.atan2(nearMeters * Math.tan(0.5 * MathUtils.DEG2RAD * rangeDegrees) * (measure.percent || 0) / 100, nearMeters);
        }
        /**
         * Add a new layout constraint
         */
        _addConstraint(score, relativeTolerance, threshold) {
            const c = { score, relativeTolerance, threshold };
            this.constraints.push(c);
            return c;
        }
        /**
         * Add a new layout objective
         */
        _addObjective(score, relativeTolerance) {
            const o = { score, relativeTolerance };
            this.objectives.push(o);
            return o;
        }
        /**
         * The solutions being explored for this layout
         */
        get solutions() {
            return this.#solutions;
        }
        #solutions;
    }
    SpatialLayout._boundsCenter = new Vector3;
    SpatialLayout._boundsSize = new Vector3;
    SpatialLayout._outerSize = new Vector3;
    return SpatialLayout;
})();
export { SpatialLayout };
let LayoutSolution = /** @class */ (() => {
    class LayoutSolution {
        constructor() {
            /**
             * The adapter associated with this solution
             */
            this.adapter = undefined;
            /**
             * The layout associated with this solution
             */
            this.layout = undefined;
            /**
             * The layout orientation (relative to parent orientation)
             */
            this.orientation = new Quaternion;
            /**
             * The layout bounds (world units)
             */
            this.bounds = new Box3;
            /**
             * The constraint violation penalties for this solution
             * (one for each constraint, lower is better)
             */
            this.constraintScores = [];
            /**
             * The objectives fitness scores for this solution
             * (one for each objective, higher is better)
             */
            this.objectiveScores = [];
            this.mutationStrategies = [
                { type: 'rotate', stepSize: 0.1, successRate: 0.2 },
                { type: 'centerX', stepSize: 0.1, successRate: 0.2 },
                { type: 'centerY', stepSize: 0.1, successRate: 0.2 },
                { type: 'centerZ', stepSize: 0.1, successRate: 0.2 },
                { type: 'sizeXYZ', stepSize: 0.1, successRate: 0.2 },
                { type: 'sizeX', stepSize: 0.1, successRate: 0.2 },
                { type: 'sizeY', stepSize: 0.1, successRate: 0.2 },
                { type: 'sizeZ', stepSize: 0.1, successRate: 0.2 },
                { type: 'minX', stepSize: 0.1, successRate: 0.2 },
                { type: 'minY', stepSize: 0.1, successRate: 0.2 },
                { type: 'minZ', stepSize: 0.1, successRate: 0.2 },
                { type: 'maxX', stepSize: 0.1, successRate: 0.2 },
                { type: 'maxY', stepSize: 0.1, successRate: 0.2 },
                { type: 'maxZ', stepSize: 0.1, successRate: 0.2 },
                { type: 'minXAspect', stepSize: 0.1, successRate: 0.2 },
                { type: 'minYAspect', stepSize: 0.1, successRate: 0.2 },
                { type: 'minZAspect', stepSize: 0.1, successRate: 0.2 },
                { type: 'maxXAspect', stepSize: 0.1, successRate: 0.2 },
                { type: 'maxYAspect', stepSize: 0.1, successRate: 0.2 },
                { type: 'maxZAspect', stepSize: 0.1, successRate: 0.2 },
                { type: 'corner000', stepSize: 0.1, successRate: 0.2 },
                { type: 'corner001', stepSize: 0.1, successRate: 0.2 },
                { type: 'corner010', stepSize: 0.1, successRate: 0.2 },
                { type: 'corner011', stepSize: 0.1, successRate: 0.2 },
                { type: 'corner100', stepSize: 0.1, successRate: 0.2 },
                { type: 'corner101', stepSize: 0.1, successRate: 0.2 },
                { type: 'corner110', stepSize: 0.1, successRate: 0.2 },
                { type: 'corner111', stepSize: 0.1, successRate: 0.2 },
            ];
            this._mutationWeights = [];
        }
        get aspectPenalty() {
            return this.constraintScores[this.layout.constraints.indexOf(this.layout.aspectConstraint)] || 0;
        }
        get orientationPenalty() {
            return this.constraintScores[this.layout.constraints.indexOf(this.layout.orientationConstraint)] || 0;
        }
        get boundsPenalty() {
            return this.constraintScores[this.layout.constraints.indexOf(this.layout.localConstraint)] || 0;
        }
        _selectStrategy() {
            const strategies = this.mutationStrategies;
            const weights = this._mutationWeights;
            for (let i = 0; i < strategies.length; i++) {
                weights[i] = strategies[i].successRate;
            }
            const defaultThreshold = this.adapter.system.config.optimize.constraintThreshold;
            if (this.aspectPenalty > (this.layout.aspectConstraint.threshold || defaultThreshold)) {
                for (let i = 0; i < weights.length; i++) {
                    weights[i] *= strategies[i].type.includes('size') ? 100 : 1;
                }
            }
            if (this.orientationPenalty > (this.layout.orientationConstraint.threshold || defaultThreshold)) {
                weights[0] *= 1000;
            }
            return randomSelect(strategies, weights);
        }
        copy(solution) {
            this.adapter = solution.adapter;
            this.layout = solution.layout;
            this.orientation.copy(solution.orientation);
            this.bounds.copy(solution.bounds);
            this.constraintScores.length = 0;
            this.objectiveScores.length = 0;
            for (const s of solution.constraintScores)
                this.constraintScores.push(s);
            for (const s of solution.objectiveScores)
                this.objectiveScores.push(s);
            return this;
        }
        randomize(sizeHint) {
            this.orientation.copy(randomQuaternion());
            const center = LayoutSolution._scratchV1.set((Math.random() - 0.5) * sizeHint * 2 + gaussian(sizeHint), (Math.random() - 0.5) * sizeHint * 2 + gaussian(sizeHint), (Math.random() - 0.5) * sizeHint * 2 + gaussian(sizeHint));
            const halfSize = LayoutSolution._scratchV2.set(Math.random() * sizeHint * 2 + sizeHint * 0.1, Math.random() * sizeHint * 2 + sizeHint * 0.1, Math.random() * sizeHint * 2 + sizeHint * 0.1);
            this.bounds.min.copy(center).sub(halfSize);
            this.bounds.max.copy(center).add(halfSize);
            this.bounds = this.bounds;
            return this;
        }
        moveTowards(solution, minFreq, maxFreq) {
            const center = this.bounds.getCenter(LayoutSolution._center);
            const size = this.bounds.getSize(LayoutSolution._size);
            const otherBounds = solution.bounds;
            const otherCenter = otherBounds.getCenter(LayoutSolution._otherCenter);
            const otherSize = otherBounds.getSize(LayoutSolution._otherSize);
            this.orientation.slerp(solution.orientation, LayoutSolution.generatePulseFrequency(minFreq, maxFreq)).normalize();
            if (Math.random() < 0.5) {
                center.lerp(otherCenter, LayoutSolution.generatePulseFrequency(minFreq, maxFreq));
                size.lerp(otherSize, LayoutSolution.generatePulseFrequency(minFreq, maxFreq));
                this.bounds.setFromCenterAndSize(center, size);
            }
            else {
                this.bounds.min.lerp(otherBounds.min, LayoutSolution.generatePulseFrequency(minFreq, maxFreq));
                this.bounds.max.lerp(otherBounds.max, LayoutSolution.generatePulseFrequency(minFreq, maxFreq));
            }
        }
        /**
         *
         * @param stepSize
         *
         */
        perturb() {
            let strategy = this._selectStrategy();
            const strategyType = strategy.type;
            let stepSize = strategy.stepSize;
            // orientation mutation strategy
            if (strategyType === 'rotate') {
                if (this.layout.orientation && this.layout.orientation.isQuaternion) {
                    this.orientation.copy(this.layout.orientation);
                    return strategy;
                }
                stepSize = strategy.stepSize = Math.min(stepSize, 1);
                const scale = Math.min(levy(stepSize * 0.00001), 1);
                this.orientation.multiply(randomQuaternion(scale, scale)).normalize();
                return strategy;
            }
            const bounds = this.bounds;
            const center = bounds.getCenter(LayoutSolution._center);
            const size = bounds.getSize(LayoutSolution._size);
            size.clampScalar(1e-6, 1e10);
            // center mutation strategies
            if (strategyType === 'centerX') {
                const outerSize = this.adapter.metrics.targetState.outerSize;
                center.x += this._perturbFromLinearMeasureSpec(center.x, outerSize.x, stepSize, this.layout.local.centerX);
            }
            else if (strategyType === 'centerY') {
                const outerSize = this.adapter.metrics.targetState.outerSize;
                center.y += this._perturbFromLinearMeasureSpec(center.y, outerSize.y, stepSize, this.layout.local.centerY);
            }
            else if (strategyType === 'centerZ') {
                const outerSize = this.adapter.metrics.targetState.outerSize;
                center.z += this._perturbFromLinearMeasureSpec(center.z, outerSize.z, stepSize, this.layout.local.centerZ);
            }
            // size mutation strategies
            else if (strategyType === 'sizeXYZ') {
                const scale = 4 ** gaussian(stepSize);
                if (this.layout.aspect === 'preserve-2d') {
                    size.x *= scale;
                    size.y *= scale;
                }
                else {
                    size.multiplyScalar(scale);
                }
            }
            else if (strategyType === 'sizeX') {
                const outerSize = this.adapter.metrics.targetState.outerSize;
                size.x += this._perturbFromLinearMeasureSpec(size.x, outerSize.x, stepSize, this.layout.local.width);
            }
            else if (strategyType === 'sizeY') {
                const outerSize = this.adapter.metrics.targetState.outerSize;
                size.y += this._perturbFromLinearMeasureSpec(size.y, outerSize.y, stepSize, this.layout.local.height);
            }
            else if (strategyType === 'sizeZ') {
                const outerSize = this.adapter.metrics.targetState.outerSize;
                size.z += this._perturbFromLinearMeasureSpec(size.z, outerSize.z, stepSize, this.layout.local.depth);
            }
            size.x = Math.abs(size.x);
            size.y = Math.abs(size.y);
            size.z = Math.abs(size.z);
            size.clampScalar(1e-6, 1e10);
            bounds.setFromCenterAndSize(center, size);
            if (strategyType === 'minX') {
                const outerSize = this.adapter.metrics.targetState.outerSize;
                bounds.min.x = this._perturbFromLinearMeasureSpec(bounds.min.x, outerSize.x, stepSize, this.layout.local.left);
            }
            else if (strategyType === 'minY') {
                const outerSize = this.adapter.metrics.targetState.outerSize;
                bounds.min.y = this._perturbFromLinearMeasureSpec(bounds.min.y, outerSize.y, stepSize, this.layout.local.bottom);
            }
            else if (strategyType === 'minZ') {
                const outerSize = this.adapter.metrics.targetState.outerSize;
                bounds.min.z = this._perturbFromLinearMeasureSpec(bounds.min.z, outerSize.z, stepSize, this.layout.local.back);
            }
            else if (strategyType === 'maxX') {
                const outerSize = this.adapter.metrics.targetState.outerSize;
                bounds.max.x = this._perturbFromLinearMeasureSpec(bounds.max.x, outerSize.x, stepSize, this.layout.local.right);
            }
            else if (strategyType === 'maxY') {
                const outerSize = this.adapter.metrics.targetState.outerSize;
                bounds.max.y = this._perturbFromLinearMeasureSpec(bounds.max.y, outerSize.y, stepSize, this.layout.local.top);
            }
            else if (strategyType === 'maxZ') {
                const outerSize = this.adapter.metrics.targetState.outerSize;
                bounds.max.z = this._perturbFromLinearMeasureSpec(bounds.max.z, outerSize.z, stepSize, this.layout.local.front);
            }
            else if (strategyType === 'minXAspect') {
                const opposite = bounds.max.x;
                const scale = 4 ** gaussian(stepSize);
                size.multiplyScalar(scale);
                bounds.setFromCenterAndSize(center, size);
                bounds.max.x = opposite;
                bounds.min.x = opposite - size.x;
            }
            else if (strategyType === 'minYAspect') {
                const opposite = bounds.max.y;
                const scale = 4 ** gaussian(stepSize);
                size.multiplyScalar(scale);
                bounds.setFromCenterAndSize(center, size);
                bounds.max.y = opposite;
                bounds.min.y = opposite - size.y;
            }
            else if (strategyType === 'minZAspect') {
                const opposite = bounds.max.z;
                const scale = 4 ** gaussian(stepSize);
                size.multiplyScalar(scale);
                bounds.setFromCenterAndSize(center, size);
                bounds.max.z = opposite;
                bounds.min.z = opposite - size.z;
            }
            else if (strategyType === 'maxXAspect') {
                const opposite = bounds.min.x;
                const scale = 4 ** gaussian(stepSize);
                size.multiplyScalar(scale);
                bounds.setFromCenterAndSize(center, size);
                bounds.min.x = opposite;
                bounds.max.x = opposite + size.x;
            }
            else if (strategyType === 'maxYAspect') {
                const opposite = bounds.min.y;
                const scale = 4 ** gaussian(stepSize);
                size.multiplyScalar(scale);
                bounds.setFromCenterAndSize(center, size);
                bounds.min.y = opposite;
                bounds.max.y = opposite + size.y;
            }
            else if (strategyType === 'maxZAspect') {
                const opposite = bounds.min.z;
                const scale = 4 ** gaussian(stepSize);
                size.multiplyScalar(scale);
                bounds.setFromCenterAndSize(center, size);
                bounds.min.z = opposite;
                bounds.max.z = opposite + size.z;
            }
            else if (strategyType === 'corner000') {
                LayoutSolution._mutateCorner(bounds, 'min', 'min', 'min', stepSize);
            }
            else if (strategyType === 'corner001') {
                LayoutSolution._mutateCorner(bounds, 'min', 'min', 'max', stepSize);
            }
            else if (strategyType === 'corner010') {
                LayoutSolution._mutateCorner(bounds, 'min', 'max', 'min', stepSize);
            }
            else if (strategyType === 'corner011') {
                LayoutSolution._mutateCorner(bounds, 'min', 'max', 'max', stepSize);
            }
            else if (strategyType === 'corner100') {
                LayoutSolution._mutateCorner(bounds, 'max', 'min', 'min', stepSize);
            }
            else if (strategyType === 'corner101') {
                LayoutSolution._mutateCorner(bounds, 'max', 'min', 'max', stepSize);
            }
            else if (strategyType === 'corner110') {
                LayoutSolution._mutateCorner(bounds, 'max', 'max', 'min', stepSize);
            }
            else if (strategyType === 'corner111') {
                LayoutSolution._mutateCorner(bounds, 'max', 'max', 'max', stepSize);
            }
            return strategy;
        }
        _perturbFromLinearMeasureSpec(value, range, stepSize, spec) {
            if (spec === undefined)
                return gaussian(stepSize);
            if (spec instanceof Array)
                spec = randomSelect(spec);
            if (SpatialLayout.isDiscreteSpec(spec)) {
                return -value + SpatialLayout.getMetersFromLinearMeasure(spec, range);
            }
            const continuousSpec = spec;
            const min = continuousSpec.gt && SpatialLayout.getMetersFromLinearMeasure(continuousSpec.gt, range);
            const max = continuousSpec.lt && SpatialLayout.getMetersFromLinearMeasure(continuousSpec.lt, range);
            if (value < min || value > max) {
                if (min !== undefined && max !== undefined) {
                    return -value + min + Math.random() * (max - min);
                }
                else if (min !== undefined) {
                    return -value + min + levy(stepSize * 0.1);
                }
                else if (max !== undefined) {
                    return -value + max - levy(stepSize * 0.1);
                }
            }
            return gaussian(stepSize);
        }
        static generatePulseFrequency(min, max) {
            return min + Math.random() * (max - min);
        }
        static _mutateCorner(bounds, sideX, sideY, sideZ, stepSize) {
            const center = bounds.getCenter(this._center);
            const diff = LayoutSolution._scratchV1.set(bounds[sideX].x, bounds[sideY].y, bounds[sideZ].z).sub(center);
            const length = diff.length() * 4 ** gaussian(stepSize);
            diff.normalize().multiplyScalar(length);
            bounds[sideX].x = diff.x + center.x;
            bounds[sideY].y = diff.y + center.y;
            bounds[sideZ].z = diff.z + center.z;
        }
    }
    LayoutSolution._scratchV1 = new Vector3;
    LayoutSolution._scratchV2 = new Vector3;
    LayoutSolution._center = new Vector3;
    LayoutSolution._size = new Vector3;
    LayoutSolution._otherCenter = new Vector3;
    LayoutSolution._otherSize = new Vector3;
    return LayoutSolution;
})();
export { LayoutSolution };
