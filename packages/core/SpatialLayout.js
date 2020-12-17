import { Vector3, Quaternion, Box3, MathUtils, V_111, Ray, randomSelect, randomQuaternion, gaussian, levy, computeRelativeDifference } from './math';
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
export class SpatialLayout {
    constructor(adapter) {
        this.adapter = adapter;
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
        this.aspectConstraint = this.addConstraint('aspect', (state) => {
            const aspect = this.aspect;
            if (!aspect || aspect === 'any')
                return 0;
            const worldScale = state.worldScale;
            const s = this._aspect.copy(worldScale);
            const largest = aspect === 'preserve-3d' ?
                Math.max(Math.abs(s.x), Math.abs(s.y), Math.abs(s.z)) :
                Math.max(Math.abs(s.x), Math.abs(s.y));
            const aspectFill = s.divideScalar(largest);
            return aspect === 'preserve-3d' ?
                SpatialLayout.getVector3Penalty(aspectFill, V_111) * 100 :
                (SpatialLayout.getNumberPenalty(aspectFill.x, 1) * 100
                    + SpatialLayout.getNumberPenalty(aspectFill.y, 1) * 100)
                    + (aspectFill.z > 1 ? aspectFill.z * 100 : 1);
            // return SpatialLayout.getVector3Penalty(aspectFill, V_111)
        });
        this._aspect = new Vector3;
        this.orientationConstraint = this.addConstraint('orientation', (m) => {
            if (!this.orientation)
                return 0;
            return SpatialLayout.getQuaternionPenalty(m.localOrientation, this.orientation, m.metrics.system.config.epsillonRadians);
        });
        this.positionConstraint = this.addConstraint('position', (m) => {
            if (!this.position)
                return 0;
            return SpatialLayout.getVector3Penalty(m.localPosition, this.position);
        });
        /**
         * The local scale constraint spec
         */
        this.scale = {
            x: { gt: 1e-1, lt: 1e6 },
            y: { gt: 1e-1, lt: 1e6 },
            z: { gt: 1e-1, lt: 1e6 }
        };
        this.scaleConstraint = this.addConstraint('scale', (m) => {
            if (!this.scale)
                return 0;
            return 10 * SpatialLayout.getVector3Penalty(m.localScale, this.scale);
        });
        // /**
        //  * The local bounds spec
        //  */
        this.local = new BoundsSpec;
        this.localConstraint = this.addConstraint('local', (m) => {
            if (!this.local)
                return 0;
            return SpatialLayout.getBoundsPenalty(m, this.local);
        });
        /** The visual bounds spec */
        this.visual = new FrustumSpec;
        this.visualConstraint = this.addConstraint('visual', (m) => {
            if (!this.visual)
                return 0;
            return SpatialLayout.getVisualBoundsPenalty(m, this.visual);
        });
        this._pullCenter = new Vector3;
        this._pullRay = new Ray;
        /** */
        this.pullLocalObjective = this.addObjective('pull-local', (s) => {
            const ray = this._pullRay;
            const center = s.layoutCenter;
            const pullPosition = this.local.pull?.position;
            const pullDirection = this.local.pull?.direction;
            let centerDist = 0;
            let directionDist = 0;
            if (pullPosition) {
                const xDiff = typeof pullPosition.x === 'number' ? pullPosition.x - center.x : 0;
                const yDiff = typeof pullPosition.y === 'number' ? pullPosition.y - center.y : 0;
                const zDiff = typeof pullPosition.z === 'number' ? pullPosition.z - center.z : 0;
                centerDist = Math.sqrt(xDiff ** 2 + yDiff ** 2 + zDiff ** 2);
            }
            if (pullDirection) {
                ray.origin.set(0, 0, 0);
                ray.direction.set(pullDirection.x || 0, pullDirection.y || 0, pullDirection.z || 0).normalize();
                directionDist = ray.closestPointToPoint(center, center).length();
            }
            return -centerDist + directionDist;
        });
        this.pullVisualObjective = this.addObjective('pull-visual', (s) => {
            const ray = this._pullRay;
            const centerDegrees = s.visualFrustum.centerDegrees;
            const center = this._pullCenter.set(centerDegrees.x, centerDegrees.y, s.visualFrustum.distance);
            const pullPosition = this.visual.pull?.position;
            const pullDirection = this.visual.pull?.direction;
            let centerDist = 0;
            let directionDist = 0;
            if (pullPosition) {
                const xDiff = typeof pullPosition.x === 'number' ? pullPosition.x - center.x : 0;
                const yDiff = typeof pullPosition.y === 'number' ? pullPosition.y - center.y : 0;
                const zDiff = typeof pullPosition.z === 'number' ? pullPosition.z - center.z : 0;
                centerDist = Math.sqrt(xDiff ** 2 + yDiff ** 2 + zDiff ** 2);
            }
            if (pullDirection) {
                ray.origin.set(0, 0, 0);
                ray.direction.set(pullDirection.x || 0, pullDirection.y || 0, pullDirection.z || 0).normalize();
                directionDist = ray.closestPointToPoint(center, center).length();
            }
            return -centerDist + directionDist;
        });
        /** */
        this.maximizeVisual = true;
        this.maximizeVisualObjective = this.addObjective('maximize-visual', (state) => {
            if (!this.maximizeVisual)
                return 0;
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
        /**
         * Each objective function should return a scalar value
         * that increases in correlation with improved fitness.
         * The fitness value does not need to be normalized, as objectives
         * are not weighted directly aginst one another. Rather,
         * solutions are ranked by preferring the solution that
         * has the highest score within the `relativeTolerance`
         * of each objective, in order of objective priority.
         * If at any point the relative difference between
         * scores is larger than the relative tolerance for
         * a given objective, the two solutions will be ranked
         * by that objective.
         *
         * If any two solutions are within relative tolerance
         * of one another for all objectives, those two will be
         * compared to ane another by the lowest priority objective
         *
         * If either solution breaks constraints, then
         * the one with the lowest penalty is ranked higher
         */
        this.compareSolutions = (a, b) => {
            const aMin = a.bounds.min;
            const aMax = a.bounds.max;
            if (isNaN(aMin.x) || isNaN(aMin.y) || isNaN(aMin.z) || isNaN(aMax.x) || isNaN(aMax.y) || isNaN(aMax.z))
                return 1;
            const systemConfig = this.adapter.system.config.optimize;
            const cThreshold = this.adapter.optimize.constraintThreshold ?? systemConfig.constraintThreshold;
            const relTol = this.adapter.optimize.relativeTolerance ?? systemConfig.relativeTolerance;
            const absTol = this.adapter.optimize.absoluteTolerance ?? systemConfig.absoluteTolerance;
            for (let i = 0; i < this.constraints.length; i++) {
                const scoreA = a.constraintScores[i];
                const scoreB = b.constraintScores[i];
                // if (scoreA > cThreshold && scoreB > cThreshold) {
                //     const relativeDiff = computeRelativeDifference(scoreA, scoreB)
                //     const relativeTolerance = constraint.relativeTolerance || cRelativeTolerance
                //     if (relativeDiff > relativeTolerance) {
                //         return scoreA - scoreB // rank by lowest penalty
                //     }
                // } else if (scoreA > cThreshold || scoreB > cThreshold) {
                //     return scoreA - scoreB
                // }
                if (Math.abs(scoreA - scoreB) < 1e-4 || computeRelativeDifference(scoreA, scoreB) < 1e-4)
                    continue; // consider equal
                if (scoreA > cThreshold || scoreB > cThreshold) {
                    return scoreA - scoreB; // rank by lowest penalty
                }
                const cRelTol = this.constraints[i].relativeTolerance ?? relTol;
                const cAbsTol = this.constraints[i].absoluteTolerance ?? absTol;
                // const bestScore = Math.min(scoreA, scoreB)
                const bestScore = this.constraints[i].bestScore || 0; //  //this.constraints[i].bestScore || 0 // bestSolution.constraintScores[i]//constraint.bestScore ?? Math.min(scoreA, scoreB)
                const tolerance = Math.max(bestScore / (1 - cRelTol), bestScore + cAbsTol);
                if (scoreA > tolerance || scoreB > tolerance) {
                    return scoreA - scoreB;
                }
            }
            for (let i = 0; i < this.objectives.length; i++) {
                const scoreA = a.objectiveScores[i];
                const scoreB = b.objectiveScores[i];
                // const relativeDiff = computeRelativeDifference(scoreA, scoreB)
                // const relativeTolerance = objective.relativeTolerance || oRelativeTolerance
                // if (relativeDiff > relativeTolerance) {
                //     return scoreB - scoreA // rank by highest score
                // }
                if (Math.abs(scoreA - scoreB) < 1e-4 || computeRelativeDifference(scoreA, scoreB) < 1e-4)
                    continue; // consider equal
                const oRelTol = this.objectives[i].relativeTolerance ?? relTol;
                const oAbsTol = this.objectives[i].absoluteTolerance ?? absTol;
                // const bestScore = Math.min(scoreA, scoreB)  
                const bestScore = this.objectives[i].bestScore || 0; // Math.min(scoreA, scoreB)  //this.objectives[i].bestScore || 0 //objective.bestScore ?? Math.max(scoreA, scoreB)
                const tolerance = Math.min(bestScore * (1 - oRelTol), bestScore - oAbsTol);
                if (scoreA < tolerance || scoreB < tolerance) {
                    return scoreB - scoreA; // rank by highest score
                }
            }
            // If all scores are within relative tolerance of one another, consider them equal
            return 0;
        };
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
        const diagonalLengthPenalty = this.getLinearMeasurePenalty(size.length(), spec.diagonal, outerSize.length());
        // const combinedSizePenalty = Math.sqrt(widthPenalty**2 + heightPenalty**2 + depthPenalty**2)
        // return Math.max(combinedEdgePenalty, combinedSizePenalty)
        return (leftPenalty +
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
            diagonalLengthPenalty);
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
        if (visualFrustum.depth < 0)
            return -visualFrustum.depth * 100000 + 1000; // inverted penalty
        const leftPenalty = this.getVisualMeasurePenalty(visualFrustum.leftDegrees, spec.left, viewSizeDegrees.x, viewNearMeters) ** 2;
        const rightPenalty = this.getVisualMeasurePenalty(visualFrustum.rightDegrees, spec.right, viewSizeDegrees.x, viewNearMeters) ** 2;
        const bottomPenalty = this.getVisualMeasurePenalty(visualFrustum.bottomDegrees, spec.bottom, viewSizeDegrees.y, viewNearMeters) ** 2;
        const topPenalty = this.getVisualMeasurePenalty(visualFrustum.topDegrees, spec.top, viewSizeDegrees.y, viewNearMeters) ** 2;
        const nearPenalty = 10 * this.getLinearMeasurePenalty(visualFrustum.nearMeters, spec.near, viewDepthMeters);
        const farPenalty = 10 * this.getLinearMeasurePenalty(visualFrustum.farMeters, spec.far, viewDepthMeters);
        const visualSize = visualFrustum.sizeDegrees;
        const widthPenalty = 2 * this.getVisualMeasurePenalty(visualSize.x, spec.width, viewSizeDegrees.x, viewNearMeters);
        const heightPenalty = 2 * this.getVisualMeasurePenalty(visualSize.y, spec.height, viewSizeDegrees.y, viewNearMeters);
        const depthPenalty = this.getLinearMeasurePenalty(visualFrustum.depth, spec.depth, viewDepthMeters);
        const diagonalPenalty = this.getVisualMeasurePenalty(visualFrustum.diagonalDegrees, spec.diagonal, system.viewFrustum.diagonalDegrees, viewNearMeters);
        const centerXPenalty = 4 * this.getVisualMeasurePenalty(visualFrustum.centerDegrees.x, spec.centerX, viewSizeDegrees.x, viewNearMeters);
        const centerYPenalty = 4 * this.getVisualMeasurePenalty(visualFrustum.centerDegrees.y, spec.centerY, viewSizeDegrees.y, viewNearMeters);
        const centerZPenalty = this.getLinearMeasurePenalty(visualFrustum.distance, spec.centerZ, viewDepthMeters);
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
            diagonalPenalty +
            centerXPenalty +
            centerYPenalty +
            centerZPenalty) * 100;
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
    addConstraint(name, evaluate, opts) {
        const { relativeTolerance, absoluteTolerance, threshold } = opts || {};
        const c = { name, evaluate, relativeTolerance, absoluteTolerance, threshold, bestScore: 0 };
        this.constraints.push(c);
        return c;
    }
    /**
     * Add a new layout objective
     */
    addObjective(name, evaluate, opts) {
        const { relativeTolerance, absoluteTolerance } = opts || {};
        const o = { name, evaluate, relativeTolerance, absoluteTolerance, bestScore: 0 };
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
    /**
     * Update best scores and sort solutions
     */
    sortSolutions() {
        for (let c = 0; c < this.constraints.length; c++) {
            let best = Infinity;
            for (let s = 0; s < this.solutions.length; s++) {
                const score = this.solutions[s].constraintScores[c];
                if (score < best)
                    best = score;
            }
            this.constraints[c].bestScore = best;
        }
        for (let o = 0; o < this.objectives.length; o++) {
            let best = -Infinity;
            for (let s = 0; s < this.solutions.length; s++) {
                const score = this.solutions[s].objectiveScores[o];
                if (score > best)
                    best = score;
            }
            this.objectives[o].bestScore = best;
        }
        this.solutions.sort(this.compareSolutions);
        this.bestSolution = this.solutions[0];
    }
}
SpatialLayout._boundsCenter = new Vector3;
SpatialLayout._boundsSize = new Vector3;
SpatialLayout._outerSize = new Vector3;
export class LayoutSolution {
    constructor(layout) {
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
            // {type:'minX', stepSize: 0.1, successRate:0.2},
            // {type:'minY', stepSize: 0.1, successRate:0.2},
            // {type:'minZ', stepSize: 0.1, successRate:0.2},
            // {type:'maxX', stepSize: 0.1, successRate:0.2},
            // {type:'maxY', stepSize: 0.1, successRate:0.2},
            // {type:'maxZ', stepSize: 0.1, successRate:0.2},
            { type: 'minXAspect', stepSize: 0.1, successRate: 0.2 },
            { type: 'minYAspect', stepSize: 0.1, successRate: 0.2 },
            { type: 'minZAspect', stepSize: 0.1, successRate: 0.2 },
            { type: 'maxXAspect', stepSize: 0.1, successRate: 0.2 },
            { type: 'maxYAspect', stepSize: 0.1, successRate: 0.2 },
            { type: 'maxZAspect', stepSize: 0.1, successRate: 0.2 },
        ];
        this._mutationWeights = [];
        if (layout)
            this.layout = layout;
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
        const defaultThreshold = this.layout.adapter.system.config.optimize.constraintThreshold;
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
        this.layout = solution.layout;
        this.orientation.copy(solution.orientation);
        this.bounds.copy(solution.bounds);
        this.constraintScores.length = 0;
        for (let i = 0; i < solution.constraintScores.length; i++) {
            this.constraintScores[i] = solution.constraintScores[i];
        }
        this.objectiveScores.length = 0;
        for (let i = 0; i < solution.objectiveScores.length; i++) {
            this.objectiveScores[i] = solution.objectiveScores[i];
        }
        return this;
    }
    randomize(sizeHint) {
        // this.orientation.copy(randomQuaternion())
        const far = levy(sizeHint);
        // const center = LayoutSolution._scratchV1.set(
        //     ((Math.random() - 0.5) * gaussian(sizeHint * 0.1)) * far,
        //     ((Math.random() - 0.5) * gaussian(sizeHint * 0.1)) * far,
        //     - far
        // )
        const center = LayoutSolution._scratchV1.set(0, 0, -far);
        const viewState = this.layout.adapter.system.viewMetrics.targetState;
        center.applyMatrix4(viewState.worldMatrix);
        const parentState = this.layout.adapter.metrics.targetState.parentState;
        parentState && center.applyMatrix4(parentState.worldMatrixInverse);
        this.orientation.copy(viewState.worldOrientation);
        parentState && this.orientation.multiply(parentState.worldOrientationInverse);
        // const halfSize = LayoutSolution._scratchV2.set(
        //     Math.random() * sizeHint * 2 + sizeHint * 0.1,
        //     Math.random() * sizeHint * 2 + sizeHint * 0.1,
        //     Math.random() * sizeHint * 2 + sizeHint * 0.1
        // )
        const inner = this.layout.adapter.metrics.innerBounds;
        const size = inner.isEmpty() ?
            LayoutSolution._scratchV2.set(1, 1, 1) :
            inner.getSize(LayoutSolution._scratchV2);
        size.normalize();
        size.multiplyScalar(far * 2 * Math.tan(5 * MathUtils.DEG2RAD));
        // size.multiplyScalar(Math.random() * sizeHint * 2)
        this.bounds.setFromCenterAndSize(center, size);
        // this.bounds.min.copy(center).sub(halfSize)
        // this.bounds.max.copy(center).add(halfSize)
        // this.bounds = this.bounds
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
            const scale = Math.min(levy(stepSize * 0.0001), 1);
            this.orientation.multiply(randomQuaternion(scale, scale)).normalize();
            return strategy;
        }
        const bounds = this.bounds;
        const center = bounds.getCenter(LayoutSolution._center);
        const size = bounds.getSize(LayoutSolution._size);
        // center mutation strategies
        if (strategyType === 'centerX') {
            const outerSize = this.layout.adapter.metrics.targetState.outerSize;
            center.x += this._perturbFromLinearMeasureSpec(center.x, outerSize.x, stepSize, this.layout.local.centerX);
        }
        else if (strategyType === 'centerY') {
            const outerSize = this.layout.adapter.metrics.targetState.outerSize;
            center.y += this._perturbFromLinearMeasureSpec(center.y, outerSize.y, stepSize, this.layout.local.centerY);
        }
        else if (strategyType === 'centerZ') {
            const outerSize = this.layout.adapter.metrics.targetState.outerSize;
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
            const outerSize = this.layout.adapter.metrics.targetState.outerSize;
            size.x += this._perturbFromLinearMeasureSpec(size.x, outerSize.x, stepSize, this.layout.local.width);
        }
        else if (strategyType === 'sizeY') {
            const outerSize = this.layout.adapter.metrics.targetState.outerSize;
            size.y += this._perturbFromLinearMeasureSpec(size.y, outerSize.y, stepSize, this.layout.local.height);
        }
        else if (strategyType === 'sizeZ') {
            const outerSize = this.layout.adapter.metrics.targetState.outerSize;
            size.z += this._perturbFromLinearMeasureSpec(size.z, outerSize.z, stepSize, this.layout.local.depth);
        }
        size.x = Math.abs(size.x);
        size.y = Math.abs(size.y);
        size.z = Math.abs(size.z);
        size.clampScalar(this.layout.adapter.system.config.epsillonMeters / 10, 1e20);
        bounds.setFromCenterAndSize(center, size);
        if (strategyType === 'minX') {
            const outerSize = this.layout.adapter.metrics.targetState.outerSize;
            bounds.min.x = this._perturbFromLinearMeasureSpec(bounds.min.x, outerSize.x, stepSize, this.layout.local.left);
        }
        else if (strategyType === 'minY') {
            const outerSize = this.layout.adapter.metrics.targetState.outerSize;
            bounds.min.y = this._perturbFromLinearMeasureSpec(bounds.min.y, outerSize.y, stepSize, this.layout.local.bottom);
        }
        else if (strategyType === 'minZ') {
            const outerSize = this.layout.adapter.metrics.targetState.outerSize;
            bounds.min.z = this._perturbFromLinearMeasureSpec(bounds.min.z, outerSize.z, stepSize, this.layout.local.back);
        }
        else if (strategyType === 'maxX') {
            const outerSize = this.layout.adapter.metrics.targetState.outerSize;
            bounds.max.x = this._perturbFromLinearMeasureSpec(bounds.max.x, outerSize.x, stepSize, this.layout.local.right);
        }
        else if (strategyType === 'maxY') {
            const outerSize = this.layout.adapter.metrics.targetState.outerSize;
            bounds.max.y = this._perturbFromLinearMeasureSpec(bounds.max.y, outerSize.y, stepSize, this.layout.local.top);
        }
        else if (strategyType === 'maxZ') {
            const outerSize = this.layout.adapter.metrics.targetState.outerSize;
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
                return -value + min + levy(stepSize);
            }
            else if (max !== undefined) {
                return -value + max - levy(stepSize);
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
