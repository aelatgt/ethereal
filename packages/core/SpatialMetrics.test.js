import test from 'ava';
import { EtherealSystemMock } from './testing-utils';
import { Vector3, V_000, V_010, V_111 } from './math';
import { Object3D, Mesh, BoxGeometry, Quaternion, Box3 } from 'three';
test('adapter w/ target bounds, no parent, default orientation, w/ empty inner size', t => {
    const system = new EtherealSystemMock;
    const adapter = system.getAdapter(new Object3D);
    adapter.bounds.target = new Box3().setFromCenterAndSize(new Vector3(1, 2, 0), new Vector3(4, 5, 6));
    const metrics = system.getMetrics(adapter.node);
    const state = metrics.targetState;
    t.deepEqual(metrics.innerCenter, V_000);
    t.deepEqual(metrics.innerSize, V_000);
    t.deepEqual(state.localPosition, new Vector3(1, 2, 0));
    t.deepEqual(state.localScale, new Vector3(4, 5, 6));
    t.deepEqual(state.spatialBounds, adapter.bounds.target);
});
test('adapter w/ target bounds, parent w/ geometry, orientation, and custom inner size', t => {
    const system = new EtherealSystemMock;
    const parentBox = new Mesh(new BoxGeometry(2, 3, 4));
    parentBox.position.set(10, 0, 0);
    parentBox.scale.set(1, 2, 2);
    const parentMetrics = system.getMetrics(parentBox);
    const parentState = parentMetrics.targetState;
    t.deepEqual(parentMetrics.intrinsicSize, new Vector3(2, 3, 4));
    t.deepEqual(parentMetrics.innerCenter, new Vector3(0, 0, 0));
    t.deepEqual(parentMetrics.innerSize, new Vector3(2, 3, 4));
    t.deepEqual(parentState.localPosition, parentBox.position);
    t.deepEqual(parentState.localScale, new Vector3(1, 2, 2));
    t.deepEqual(parentState.worldScale, new Vector3(1, 2, 2));
    t.deepEqual(parentState.spatialBounds.getSize(new Vector3), new Vector3(2, 6, 8));
    t.deepEqual(parentState.worldCenter, new Vector3(10, 0, 0));
    t.is(parentState.outerBounds.isEmpty(), true);
    t.deepEqual(parentState.outerBounds.getSize(new Vector3), V_000);
    const content = new Mesh(new BoxGeometry(2, 2, 2)); // make inner size 2,2,2
    parentBox.add(content);
    function setupContent() {
        const adapter = system.getAdapter(content);
        adapter.orientation.target = new Quaternion().setFromAxisAngle(V_010, Math.PI / 2);
        adapter.bounds.target = new Box3().setFromCenterAndSize(V_000, V_111);
        const metrics = system.getMetrics(content);
        const state = metrics.targetState;
        t.deepEqual(metrics.innerSize, new Vector3(2, 2, 2));
        t.deepEqual(metrics.innerCenter, new Vector3(0, 0, 0));
        t.deepEqual(state.localPosition, new Vector3(0, 0, 0));
        t.deepEqual(state.localOrientation, adapter.orientation.target);
        t.deepEqual(state.localScale, new Vector3(0.25, 0.25, 0.5));
        t.deepEqual(state.worldCenter, new Vector3(10, 0, 0));
        t.deepEqual(state.worldPosition, new Vector3(10, 0, 0));
        t.deepEqual(state.worldOrientation, adapter.orientation.target);
        t.deepEqual(state.worldScale, new Vector3(0.5, 0.5, 0.5));
        t.assert(state.outerBounds.getSize(new Vector3).distanceToSquared(new Vector3(8, 6, 2)) < 1e-10);
        t.assert(state.spatialBounds.max.distanceTo(adapter.bounds.target.max) < 1e-10);
        t.assert(state.spatialBounds.min.distanceTo(adapter.bounds.target.min) < 1e-10);
        t.assert(state.spatialBounds.getSize(new Vector3).distanceTo(V_111) < 1e-10);
    }
    setupContent();
});
