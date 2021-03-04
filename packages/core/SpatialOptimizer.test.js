import test from 'ava';
import { LayoutSolution } from './SpatialLayout';
import { EtherealSystemMock } from './testing-utils';
import { Object3D } from 'three';
test('ranking solutions', (t) => {
    const system = new EtherealSystemMock;
    const adapter = system.getAdapter(new Object3D);
    const layout = adapter.createLayout();
    // layout.objectives = [
    //     {
    //         evaluate: () => 0, // ignored
    //         bestScore: 0
    //     },
    //     {
    //         evaluate: () => 0, // ignored
    //         relativeTolerance: 0, // default
    //         bestScore: 0
    //     },
    //     {
    //         evaluate: () => 0, // ignored
    //         relativeTolerance: 0, // default
    //         bestScore: 0
    //     }
    // ]
    const solutionA = new LayoutSolution();
    const solutionB = new LayoutSolution();
    solutionA.layout = layout;
    solutionB.layout = layout;
    solutionA.scores = [100, 2, 60];
    solutionB.scores = [101, 5, 60];
    t.assert(layout.compareSolutions(solutionA, solutionB) > 0);
    solutionA.scores = [100, 2, 60];
    solutionB.scores = [100, 5, 60];
    t.assert(layout.compareSolutions(solutionA, solutionB) > 0);
    solutionA.scores = [100, 5, 61];
    solutionB.scores = [100, 5, 60];
    t.assert(layout.compareSolutions(solutionA, solutionB) < 0);
    solutionA.scores = [100, 5, 60];
    solutionB.scores = [100, 5, 60];
    t.assert(layout.compareSolutions(solutionA, solutionB) === 0);
    layout.objectives[0].relativeTolerance = 0.1;
    solutionA.scores = [101, 5, 60];
    solutionB.scores = [100, 10, 60];
    t.assert(layout.compareSolutions(solutionA, solutionB) > 0);
    layout.objectives[0].relativeTolerance = 0.1;
    solutionA.scores = [120, 5, 60];
    solutionB.scores = [100, 10, 60];
    t.assert(layout.compareSolutions(solutionA, solutionB) < 0);
    layout.objectives[0].relativeTolerance = 0.1;
    layout.objectives[1].relativeTolerance = 0.1;
    solutionA.scores = [101, 5.1, 50];
    solutionB.scores = [100, 5, 60];
    t.assert(layout.compareSolutions(solutionA, solutionB) > 0);
    layout.objectives[0].relativeTolerance = 0.1;
    layout.objectives[1].relativeTolerance = 0.1;
    solutionA.scores = [101, 5, 60];
    solutionB.scores = [100, 5.1, 50];
    t.assert(layout.compareSolutions(solutionA, solutionB) < 0);
    layout.objectives[0].relativeTolerance = 0.1;
    layout.objectives[1].relativeTolerance = 0.1;
    solutionA.scores = [101, 5, 60.1];
    solutionB.scores = [100, 5.1, 60];
    t.assert(layout.compareSolutions(solutionA, solutionB) < 0);
    layout.objectives[2].relativeTolerance = 0.1;
    t.assert(layout.compareSolutions(solutionA, solutionB) < 0);
});
