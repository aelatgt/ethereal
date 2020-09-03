import test from 'ava'

import {SpatialLayout, LayoutSolution} from './SpatialLayout'
import {SpatialOptimizer} from './SpatialOptimizer'
import { EtherealSystemMock } from './testing-utils'


test('ranking solutions', (t) => {
    const optimizer = new SpatialOptimizer(new EtherealSystemMock)
    const layout = new SpatialLayout
    layout.objectives = [
        {
            score: () => 0 // ignored
        },
        {
            score: () => 0, // ignored
            relativeTolerance: 0 // default
        },
        {
            score: () => 0, // ignored
            relativeTolerance: 0 // default
        }
    ]
    const solutionA = new LayoutSolution()
    const solutionB = new LayoutSolution()
    solutionA.layout = layout
    solutionB.layout = layout
    solutionA.objectiveScores = [100,2,60]
    solutionB.objectiveScores = [101,5,60]
    t.assert(optimizer.compareSolutions(solutionA, solutionB) > 0)
    solutionA.objectiveScores = [100,2,60]
    solutionB.objectiveScores = [100,5,60]
    t.assert(optimizer.compareSolutions(solutionA, solutionB) > 0)
    solutionA.objectiveScores = [100,5,61]
    solutionB.objectiveScores = [100,5,60]
    t.assert(optimizer.compareSolutions(solutionA, solutionB) < 0)
    solutionA.objectiveScores = [100,5,60]
    solutionB.objectiveScores = [100,5,60]
    t.assert(optimizer.compareSolutions(solutionA, solutionB) === 0)
    layout.objectives[0].relativeTolerance = 0.1
    solutionA.objectiveScores = [101,5,60]
    solutionB.objectiveScores = [100,10,60]
    t.assert(optimizer.compareSolutions(solutionA, solutionB) > 0)
    layout.objectives[0].relativeTolerance = 0.1
    solutionA.objectiveScores = [120,5,60]
    solutionB.objectiveScores = [100,10,60]
    t.assert(optimizer.compareSolutions(solutionA, solutionB) < 0)
    layout.objectives[0].relativeTolerance = 0.1
    layout.objectives[1].relativeTolerance = 0.1
    solutionA.objectiveScores = [101,5.1,50]
    solutionB.objectiveScores = [100,5,60]
    t.assert(optimizer.compareSolutions(solutionA, solutionB) > 0)
    layout.objectives[0].relativeTolerance = 0.1
    layout.objectives[1].relativeTolerance = 0.1
    solutionA.objectiveScores = [101,5,60]
    solutionB.objectiveScores = [100,5.1,50]
    t.assert(optimizer.compareSolutions(solutionA, solutionB) < 0)
    layout.objectives[0].relativeTolerance = 0.1
    layout.objectives[1].relativeTolerance = 0.1
    solutionA.objectiveScores = [101,5,60.1]
    solutionB.objectiveScores = [100,5.1,60]
    t.assert(optimizer.compareSolutions(solutionA, solutionB) < 0)
    layout.objectives[2].relativeTolerance = 0.1
    t.assert(optimizer.compareSolutions(solutionA, solutionB) < 0)
})