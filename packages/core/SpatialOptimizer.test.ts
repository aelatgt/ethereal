import test from 'ava'

import {LayoutSolution} from './SpatialLayout'
import {SpatialOptimizer} from './SpatialOptimizer'


test('ranking solutions', (t) => {
    const solutionA = new LayoutSolution
    const solutionB = new LayoutSolution
    solutionA.objectives = [
        {
            fitness: () => 0 // ignored
        },
        {
            fitness: () => 0, // ignored
            relativeTolerance: 0 // default
        },
        {
            fitness: () => 0, // ignored
            relativeTolerance: 0 // default
        }
    ]
    solutionA.scores = [100,2,60]
    solutionB.scores = [101,5,60]
    t.assert(SpatialOptimizer.rankSolutions(solutionA, solutionB) > 0)
    solutionA.scores = [100,2,60]
    solutionB.scores = [100,5,60]
    t.assert(SpatialOptimizer.rankSolutions(solutionA, solutionB) > 0)
    solutionA.scores = [100,5,61]
    solutionB.scores = [100,5,60]
    t.assert(SpatialOptimizer.rankSolutions(solutionA, solutionB) < 0)
    solutionA.scores = [100,5,60]
    solutionB.scores = [100,5,60]
    t.assert(SpatialOptimizer.rankSolutions(solutionA, solutionB) === 0)
    solutionA.objectives[0].relativeTolerance = 0.1
    solutionA.scores = [101,5,60]
    solutionB.scores = [100,10,60]
    t.assert(SpatialOptimizer.rankSolutions(solutionA, solutionB) > 0)
    solutionA.scores = [120,5,60]
    solutionB.scores = [100,10,60]
    t.assert(SpatialOptimizer.rankSolutions(solutionA, solutionB) < 0)
    solutionA.objectives[1].relativeTolerance = 0.1
    solutionA.scores = [101,5.1,50]
    solutionB.scores = [100,5,60]
    t.assert(SpatialOptimizer.rankSolutions(solutionA, solutionB) > 0)
    solutionA.scores = [101,5,60]
    solutionB.scores = [100,5.1,50]
    t.assert(SpatialOptimizer.rankSolutions(solutionA, solutionB) < 0)
    solutionA.scores = [101,5,60.1]
    solutionB.scores = [100,5.1,60]
    t.assert(SpatialOptimizer.rankSolutions(solutionA, solutionB) < 0)
    solutionA.objectives[2].relativeTolerance = 0.1
    t.assert(SpatialOptimizer.rankSolutions(solutionA, solutionB) < 0)
})