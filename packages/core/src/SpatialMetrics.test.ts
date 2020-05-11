import test from 'ava'
import {EtherealSystemMock} from './testing-utils'
import {Vector3, V_000, V_010, V_111} from './math'
import {Object3D, Mesh, BoxGeometry} from 'three'


test('adapter w/ target bounds, no parent, default orientation, w/ default inner size', t => {
    const system = new EtherealSystemMock
    const adapter = system.adapter(new Object3D)
    adapter.bounds.target = adapter.bounds.target.setFromCenterAndSize(new Vector3(1,2,0), new Vector3(4,5,6))
    t.assert(adapter.metrics.layoutBounds.min.distanceTo(adapter.bounds.target.min) < 1e-10)
    t.assert(adapter.metrics.layoutBounds.max.distanceTo(adapter.bounds.target.max) < 1e-10)
    t.assert(adapter.metrics.layoutBounds.min.z + 3 < 1e-10)
    t.assert(adapter.metrics.layoutBounds.max.z - 3 < 1e-10)
    t.assert(adapter.metrics.innerCenter.distanceTo(V_000) < 1e-10)
    t.assert(adapter.metrics.innerSize.distanceTo(V_111) < 1e-10)
    t.deepEqual(adapter.metrics.localPosition, new Vector3(1,2,0))
    t.deepEqual(adapter.metrics.localScale, new Vector3(4,5,6))
})


test('adapter w/ target bounds, parent w/ geometry, orientation, and custom inner size', t => {
    const system = new EtherealSystemMock
    const parentBox = new Mesh(new BoxGeometry(2,3,4))
    parentBox.position.set(10,0,0)
    parentBox.scale.set(1,2,2)
    const parentMetrics = system.metrics(parentBox)
    t.deepEqual(parentMetrics.localPosition,parentBox.position)
    t.deepEqual(parentMetrics.localScale, new Vector3(1,2,2))
    t.deepEqual(parentMetrics.worldScale, new Vector3(1,2,2))
    t.deepEqual(parentMetrics.intrinsicBounds.getSize(new Vector3), new Vector3(2,3,4))
    t.deepEqual(parentMetrics.innerSize, new Vector3(2,3,4))
    t.deepEqual(parentMetrics.innerCenter, new Vector3(0,0,0))
    t.deepEqual(parentMetrics.layoutSize, new Vector3(2,6,8))
    t.deepEqual(parentMetrics.worldCenter, new Vector3(10,0,0))
    t.is(parentMetrics.outerBounds.isEmpty(), true)
    t.deepEqual(parentMetrics.outerSize, V_000)
    const content = new Mesh(new BoxGeometry(2,2,2)) // make inner size 2,2,2
    parentBox.add(content)
    const adapter = system.adapter(content)
    adapter.orientation.target = adapter.orientation.target.setFromAxisAngle(V_010, Math.PI/2)
    adapter.bounds.target = adapter.bounds.target.setFromCenterAndSize(V_000, V_111)
    t.deepEqual(adapter.metrics.innerSize, new Vector3(2,2,2))
    t.deepEqual(adapter.metrics.innerCenter, new Vector3(0,0,0))
    t.deepEqual(adapter.metrics.localPosition, new Vector3(0,0,0))
    t.deepEqual(adapter.metrics.localOrientation, adapter.orientation.target)
    t.deepEqual(adapter.metrics.localScale, new Vector3(0.25,0.25,0.5))
    t.deepEqual(adapter.metrics.worldCenter, new Vector3(10,0,0))
    t.deepEqual(adapter.metrics.worldPosition, new Vector3(10,0,0))
    t.deepEqual(adapter.metrics.worldOrientation, adapter.orientation.target)
    t.deepEqual(adapter.metrics.worldScale, new Vector3(0.5,0.5,0.5))
    t.assert(adapter.metrics.outerSize.distanceToSquared(new Vector3(8,6,2)) < 1e-10)
    t.assert(adapter.metrics.layoutBounds.max.distanceTo(adapter.bounds.target.max) < 1e-10)
    t.assert(adapter.metrics.layoutBounds.min.distanceTo(adapter.bounds.target.min) < 1e-10)
    t.assert(adapter.metrics.layoutSize.distanceTo(V_111) < 1e-10)
})