import { Box3Helper, Box3, Vector3, Matrix4, Sphere, Line3, Triangle, Vector2, Plane, DoubleSide, BackSide, Face3, BufferGeometry, Mesh, Object3D, Geometry, Quaternion, Math as Math$1, Color, Frustum, Vector4, Matrix3, Ray, Float32BufferAttribute, BufferAttribute, LineBasicMaterial } from 'three';

var V_00 = Object.freeze(new Vector2());
var V_11 = Object.freeze(new Vector2());
var V_000 = Object.freeze(new Vector3());
var V_100 = Object.freeze(new Vector3(1, 0, 0));
var V_010 = Object.freeze(new Vector3(0, 1, 0));
var V_001 = Object.freeze(new Vector3(0, 0, 1));
var V_111 = Object.freeze(new Vector3(1, 1, 1));
var Q_IDENTITY = Object.freeze(new Quaternion());
var next = Promise.resolve();
var Pool = function Pool(_factory, _reset) {
  var this$1 = this;

  this._factory = _factory;
  this._reset = _reset;
  this._pool = [];
  this._unpooled = new Set();

  this._autoPool = function () {
    this$1._nextAutoPool = undefined;

    this$1._poolAll();
  };
};

Pool.prototype.get = function get () {
  var object = this._pool.pop() || this._reset(this._factory());

  this._unpooled.add(object);

  if (!this._nextAutoPool) { this._nextAutoPool = next.then(this._autoPool); }
  return object;
};

Pool.prototype.pool = function pool (o) {
  this._pool.push(o);

  this._unpooled.delete(o);

  this._reset(o);
};

Pool.prototype._poolAll = function _poolAll () {
  if (this._unpooled.size === 0) { return; }

  for (var i = 0, list = this._unpooled; i < list.length; i += 1) {
      var o = list[i];

      this.pool(o);
    }
};
var vectors2 = new Pool(function () { return new Vector2(); }, function (vec) { return vec.set(0, 0); });
var vectors = new Pool(function () { return new Vector3(); }, function (vec) { return vec.set(0, 0, 0); });
var vectors4 = new Pool(function () { return new Vector4(); }, function (vec) { return vec.set(0, 0, 0, 1); });
var quaternions = new Pool(function () { return new Quaternion(); }, function (quat) { return quat.set(0, 0, 0, 1); });
var matrices3 = new Pool(function () { return new Matrix3(); }, function (mat) { return mat.identity(); });
var matrices = new Pool(function () { return new Matrix4(); }, function (mat) { return mat.identity(); });
function traverse(object, each, bind) {
  if (!each.call(bind, object)) { return; }

  for (var i = 0, list = object.children; i < list.length; i += 1) {
    var child = list[i];

    traverse(child, each, bind);
  }
}

/**
 * @author Mugen87 / https://github.com/Mugen87
 *
 * Ported from: https://github.com/maurizzzio/quickhull3d/ by Mauricio Poppe (https://github.com/maurizzzio)
 *
 */

var Visible = 0;
var Deleted = 1;
var v1 = new Vector3();
function QuickHull() {
  this.tolerance = -1;
  this.faces = []; // the generated faces of the convex hull

  this.newFaces = []; // this array holds the faces that are generated within a single iteration
  // the vertex lists work as follows:
  //
  // let 'a' and 'b' be 'Face' instances
  // let 'v' be points wrapped as instance of 'Vertex'
  //
  //     [v, v, ..., v, v, v, ...]
  //      ^             ^
  //      |             |
  //  a.outside     b.outside
  //

  this.assigned = new VertexList();
  this.unassigned = new VertexList();
  this.vertices = []; // vertices of the hull (internal representation of given geometry data)
}
Object.assign(QuickHull.prototype, {
  setFromPoints: function (points) {
    if (Array.isArray(points) !== true) {
      console.error('THREE.QuickHull: Points parameter is not an array.');
    }

    if (points.length < 4) {
      console.error('THREE.QuickHull: The algorithm needs at least four points.');
    }

    this.makeEmpty();

    for (var i = 0, l = points.length; i < l; i++) {
      this.vertices.push(new VertexNode(points[i]));
    }

    this.compute();
    return this;
  },
  setFromObject: function (object) {
    var points = [];
    object.updateMatrixWorld(true);
    object.traverse(function (node) {
      var i, l, point;
      var geometry = node.geometry;

      if (geometry !== undefined) {
        if (geometry.isGeometry) {
          var vertices = geometry.vertices;

          for (i = 0, l = vertices.length; i < l; i++) {
            point = vertices[i].clone();
            point.applyMatrix4(node.matrixWorld);
            points.push(point);
          }
        } else if (geometry.isBufferGeometry) {
          var attribute = geometry.attributes.position;

          if (attribute !== undefined) {
            for (i = 0, l = attribute.count; i < l; i++) {
              point = new Vector3();
              point.fromBufferAttribute(attribute, i).applyMatrix4(node.matrixWorld);
              points.push(point);
            }
          }
        }
      }
    });
    return this.setFromPoints(points);
  },
  containsPoint: function (point) {
    var faces = this.faces;

    for (var i = 0, l = faces.length; i < l; i++) {
      var face = faces[i]; // compute signed distance and check on what half space the point lies

      if (face.distanceToPoint(point) > this.tolerance) { return false; }
    }

    return true;
  },
  intersectRay: function (ray, target) {
    // based on "Fast Ray-Convex Polyhedron Intersection"  by Eric Haines, GRAPHICS GEMS II
    var faces = this.faces;
    var tNear = -Infinity;
    var tFar = Infinity;

    for (var i = 0, l = faces.length; i < l; i++) {
      var face = faces[i]; // interpret faces as planes for the further computation

      var vN = face.distanceToPoint(ray.origin);
      var vD = face.normal.dot(ray.direction); // if the origin is on the positive side of a plane (so the plane can "see" the origin) and
      // the ray is turned away or parallel to the plane, there is no intersection

      if (vN > 0 && vD >= 0) { return null; } // compute the distance from the ray’s origin to the intersection with the plane

      var t = vD !== 0 ? -vN / vD : 0; // only proceed if the distance is positive. a negative distance means the intersection point
      // lies "behind" the origin

      if (t <= 0) { continue; } // now categorized plane as front-facing or back-facing

      if (vD > 0) {
        //  plane faces away from the ray, so this plane is a back-face
        tFar = Math.min(t, tFar);
      } else {
        // front-face
        tNear = Math.max(t, tNear);
      }

      if (tNear > tFar) {
        // if tNear ever is greater than tFar, the ray must miss the convex hull
        return null;
      }
    } // evaluate intersection point
    // always try tNear first since its the closer intersection point


    if (tNear !== -Infinity) {
      ray.at(tNear, target);
    } else {
      ray.at(tFar, target);
    }

    return target;
  },
  intersectsRay: function (ray) {
    return this.intersectRay(ray, v1) !== null;
  },
  makeEmpty: function () {
    this.faces = [];
    this.vertices = [];
    return this;
  },
  // Adds a vertex to the 'assigned' list of vertices and assigns it to the given face
  addVertexToFace: function (vertex, face) {
    vertex.face = face;

    if (face.outside === null) {
      this.assigned.append(vertex);
    } else {
      this.assigned.insertBefore(face.outside, vertex);
    }

    face.outside = vertex;
    return this;
  },
  // Removes a vertex from the 'assigned' list of vertices and from the given face
  removeVertexFromFace: function (vertex, face) {
    if (vertex === face.outside) {
      // fix face.outside link
      if (vertex.next !== null && vertex.next.face === face) {
        // face has at least 2 outside vertices, move the 'outside' reference
        face.outside = vertex.next;
      } else {
        // vertex was the only outside vertex that face had
        face.outside = null;
      }
    }

    this.assigned.remove(vertex);
    return this;
  },
  // Removes all the visible vertices that a given face is able to see which are stored in the 'assigned' vertext list
  removeAllVerticesFromFace: function (face) {
    if (face.outside !== null) {
      // reference to the first and last vertex of this face
      var start = face.outside;
      var end = face.outside;

      while (end.next !== null && end.next.face === face) {
        end = end.next;
      }

      this.assigned.removeSubList(start, end); // fix references

      start.prev = end.next = null;
      face.outside = null;
      return start;
    }
  },
  // Removes all the visible vertices that 'face' is able to see
  deleteFaceVertices: function (face, absorbingFace) {
    var faceVertices = this.removeAllVerticesFromFace(face);

    if (faceVertices !== undefined) {
      if (absorbingFace === undefined) {
        // mark the vertices to be reassigned to some other face
        this.unassigned.appendChain(faceVertices);
      } else {
        // if there's an absorbing face try to assign as many vertices as possible to it
        var vertex = faceVertices;

        do {
          // we need to buffer the subsequent vertex at this point because the 'vertex.next' reference
          // will be changed by upcoming method calls
          var nextVertex = vertex.next;
          var distance = absorbingFace.distanceToPoint(vertex.point); // check if 'vertex' is able to see 'absorbingFace'

          if (distance > this.tolerance) {
            this.addVertexToFace(vertex, absorbingFace);
          } else {
            this.unassigned.append(vertex);
          } // now assign next vertex


          vertex = nextVertex;
        } while (vertex !== null);
      }
    }

    return this;
  },
  // Reassigns as many vertices as possible from the unassigned list to the new faces
  resolveUnassignedPoints: function (newFaces) {
    if (this.unassigned.isEmpty() === false) {
      var vertex = this.unassigned.first();

      do {
        // buffer 'next' reference, see .deleteFaceVertices()
        var nextVertex = vertex.next;
        var maxDistance = this.tolerance;
        var maxFace = null;

        for (var i = 0; i < newFaces.length; i++) {
          var face = newFaces[i];

          if (face.mark === Visible) {
            var distance = face.distanceToPoint(vertex.point);

            if (distance > maxDistance) {
              maxDistance = distance;
              maxFace = face;
            }

            if (maxDistance > 1000 * this.tolerance) { break; }
          }
        } // 'maxFace' can be null e.g. if there are identical vertices


        if (maxFace !== null) {
          this.addVertexToFace(vertex, maxFace);
        }

        vertex = nextVertex;
      } while (vertex !== null);
    }

    return this;
  },
  // Computes the extremes of a simplex which will be the initial hull
  computeExtremes: function () {
    var min = new Vector3();
    var max = new Vector3();
    var minVertices = [];
    var maxVertices = [];
    var i, l, j; // initially assume that the first vertex is the min/max

    for (i = 0; i < 3; i++) {
      minVertices[i] = maxVertices[i] = this.vertices[0];
    }

    min.copy(this.vertices[0].point);
    max.copy(this.vertices[0].point); // compute the min/max vertex on all six directions

    for (i = 0, l = this.vertices.length; i < l; i++) {
      var vertex = this.vertices[i];
      var point = vertex.point; // update the min coordinates

      for (j = 0; j < 3; j++) {
        if (point.getComponent(j) < min.getComponent(j)) {
          min.setComponent(j, point.getComponent(j));
          minVertices[j] = vertex;
        }
      } // update the max coordinates


      for (j = 0; j < 3; j++) {
        if (point.getComponent(j) > max.getComponent(j)) {
          max.setComponent(j, point.getComponent(j));
          maxVertices[j] = vertex;
        }
      }
    } // use min/max vectors to compute an optimal epsilon


    this.tolerance = 3 * Number.EPSILON * (Math.max(Math.abs(min.x), Math.abs(max.x)) + Math.max(Math.abs(min.y), Math.abs(max.y)) + Math.max(Math.abs(min.z), Math.abs(max.z)));
    return {
      min: minVertices,
      max: maxVertices
    };
  },
  // Computes the initial simplex assigning to its faces all the points
  // that are candidates to form part of the hull
  computeInitialHull: function () {
    var line3, plane, closestPoint;
    return function computeInitialHull() {
      if (line3 === undefined) {
        line3 = new Line3();
        plane = new Plane();
        closestPoint = new Vector3();
      }

      var vertex,
          vertices = this.vertices;
      var extremes = this.computeExtremes();
      var min = extremes.min;
      var max = extremes.max;
      var v0, v1, v2, v3;
      var i, l, j; // 1. Find the two vertices 'v0' and 'v1' with the greatest 1d separation
      // (max.x - min.x)
      // (max.y - min.y)
      // (max.z - min.z)

      var distance,
          maxDistance = 0;
      var index = 0;

      for (i = 0; i < 3; i++) {
        distance = max[i].point.getComponent(i) - min[i].point.getComponent(i);

        if (distance > maxDistance) {
          maxDistance = distance;
          index = i;
        }
      }

      v0 = min[index];
      v1 = max[index]; // 2. The next vertex 'v2' is the one farthest to the line formed by 'v0' and 'v1'

      maxDistance = 0;
      line3.set(v0.point, v1.point);

      for (i = 0, l = this.vertices.length; i < l; i++) {
        vertex = vertices[i];

        if (vertex !== v0 && vertex !== v1) {
          line3.closestPointToPoint(vertex.point, true, closestPoint);
          distance = closestPoint.distanceToSquared(vertex.point);

          if (distance > maxDistance) {
            maxDistance = distance;
            v2 = vertex;
          }
        }
      } // 3. The next vertex 'v3' is the one farthest to the plane 'v0', 'v1', 'v2'


      maxDistance = -1;
      plane.setFromCoplanarPoints(v0.point, v1.point, v2.point);

      for (i = 0, l = this.vertices.length; i < l; i++) {
        vertex = vertices[i];

        if (vertex !== v0 && vertex !== v1 && vertex !== v2) {
          distance = Math.abs(plane.distanceToPoint(vertex.point));

          if (distance > maxDistance) {
            maxDistance = distance;
            v3 = vertex;
          }
        }
      }

      var faces = [];

      if (plane.distanceToPoint(v3.point) < 0) {
        // the face is not able to see the point so 'plane.normal' is pointing outside the tetrahedron
        faces.push(Face.create(v0, v1, v2), Face.create(v3, v1, v0), Face.create(v3, v2, v1), Face.create(v3, v0, v2)); // set the twin edge

        for (i = 0; i < 3; i++) {
          j = (i + 1) % 3; // join face[ i ] i > 0, with the first face

          faces[i + 1].getEdge(2).setTwin(faces[0].getEdge(j)); // join face[ i ] with face[ i + 1 ], 1 <= i <= 3

          faces[i + 1].getEdge(1).setTwin(faces[j + 1].getEdge(0));
        }
      } else {
        // the face is able to see the point so 'plane.normal' is pointing inside the tetrahedron
        faces.push(Face.create(v0, v2, v1), Face.create(v3, v0, v1), Face.create(v3, v1, v2), Face.create(v3, v2, v0)); // set the twin edge

        for (i = 0; i < 3; i++) {
          j = (i + 1) % 3; // join face[ i ] i > 0, with the first face

          faces[i + 1].getEdge(2).setTwin(faces[0].getEdge((3 - i) % 3)); // join face[ i ] with face[ i + 1 ]

          faces[i + 1].getEdge(0).setTwin(faces[j + 1].getEdge(1));
        }
      } // the initial hull is the tetrahedron


      for (i = 0; i < 4; i++) {
        this.faces.push(faces[i]);
      } // initial assignment of vertices to the faces of the tetrahedron


      for (i = 0, l = vertices.length; i < l; i++) {
        vertex = vertices[i];

        if (vertex !== v0 && vertex !== v1 && vertex !== v2 && vertex !== v3) {
          maxDistance = this.tolerance;
          var maxFace = null;

          for (j = 0; j < 4; j++) {
            distance = this.faces[j].distanceToPoint(vertex.point);

            if (distance > maxDistance) {
              maxDistance = distance;
              maxFace = this.faces[j];
            }
          }

          if (maxFace !== null) {
            this.addVertexToFace(vertex, maxFace);
          }
        }
      }

      return this;
    };
  }(),
  // Removes inactive faces
  reindexFaces: function () {
    var activeFaces = [];

    for (var i = 0; i < this.faces.length; i++) {
      var face = this.faces[i];

      if (face.mark === Visible) {
        activeFaces.push(face);
      }
    }

    this.faces = activeFaces;
    return this;
  },
  // Finds the next vertex to create faces with the current hull
  nextVertexToAdd: function () {
    // if the 'assigned' list of vertices is empty, no vertices are left. return with 'undefined'
    if (this.assigned.isEmpty() === false) {
      var eyeVertex,
          maxDistance = 0; // grap the first available face and start with the first visible vertex of that face

      var eyeFace = this.assigned.first().face;
      var vertex = eyeFace.outside; // now calculate the farthest vertex that face can see

      do {
        var distance = eyeFace.distanceToPoint(vertex.point);

        if (distance > maxDistance) {
          maxDistance = distance;
          eyeVertex = vertex;
        }

        vertex = vertex.next;
      } while (vertex !== null && vertex.face === eyeFace);

      return eyeVertex;
    }
  },
  // Computes a chain of half edges in CCW order called the 'horizon'.
  // For an edge to be part of the horizon it must join a face that can see
  // 'eyePoint' and a face that cannot see 'eyePoint'.
  computeHorizon: function (eyePoint, crossEdge, face, horizon) {
    // moves face's vertices to the 'unassigned' vertex list
    this.deleteFaceVertices(face);
    face.mark = Deleted;
    var edge;

    if (crossEdge === null) {
      edge = crossEdge = face.getEdge(0);
    } else {
      // start from the next edge since 'crossEdge' was already analyzed
      // (actually 'crossEdge.twin' was the edge who called this method recursively)
      edge = crossEdge.next;
    }

    do {
      var twinEdge = edge.twin;
      var oppositeFace = twinEdge.face;

      if (oppositeFace.mark === Visible) {
        if (oppositeFace.distanceToPoint(eyePoint) > this.tolerance) {
          // the opposite face can see the vertex, so proceed with next edge
          this.computeHorizon(eyePoint, twinEdge, oppositeFace, horizon);
        } else {
          // the opposite face can't see the vertex, so this edge is part of the horizon
          horizon.push(edge);
        }
      }

      edge = edge.next;
    } while (edge !== crossEdge);

    return this;
  },
  // Creates a face with the vertices 'eyeVertex.point', 'horizonEdge.tail' and 'horizonEdge.head' in CCW order
  addAdjoiningFace: function (eyeVertex, horizonEdge) {
    // all the half edges are created in ccw order thus the face is always pointing outside the hull
    var face = Face.create(eyeVertex, horizonEdge.tail(), horizonEdge.head());
    this.faces.push(face); // join face.getEdge( - 1 ) with the horizon's opposite edge face.getEdge( - 1 ) = face.getEdge( 2 )

    face.getEdge(-1).setTwin(horizonEdge.twin);
    return face.getEdge(0); // the half edge whose vertex is the eyeVertex
  },
  //  Adds 'horizon.length' faces to the hull, each face will be linked with the
  //  horizon opposite face and the face on the left/right
  addNewFaces: function (eyeVertex, horizon) {
    this.newFaces = [];
    var firstSideEdge = null;
    var previousSideEdge = null;

    for (var i = 0; i < horizon.length; i++) {
      var horizonEdge = horizon[i]; // returns the right side edge

      var sideEdge = this.addAdjoiningFace(eyeVertex, horizonEdge);

      if (firstSideEdge === null) {
        firstSideEdge = sideEdge;
      } else {
        // joins face.getEdge( 1 ) with previousFace.getEdge( 0 )
        sideEdge.next.setTwin(previousSideEdge);
      }

      this.newFaces.push(sideEdge.face);
      previousSideEdge = sideEdge;
    } // perform final join of new faces


    firstSideEdge.next.setTwin(previousSideEdge);
    return this;
  },
  // Adds a vertex to the hull
  addVertexToHull: function (eyeVertex) {
    var horizon = [];
    this.unassigned.clear(); // remove 'eyeVertex' from 'eyeVertex.face' so that it can't be added to the 'unassigned' vertex list

    this.removeVertexFromFace(eyeVertex, eyeVertex.face);
    this.computeHorizon(eyeVertex.point, null, eyeVertex.face, horizon);
    this.addNewFaces(eyeVertex, horizon); // reassign 'unassigned' vertices to the new faces

    this.resolveUnassignedPoints(this.newFaces);
    return this;
  },
  cleanup: function () {
    this.assigned.clear();
    this.unassigned.clear();
    this.newFaces = [];
    return this;
  },
  compute: function () {
    var vertex;
    this.computeInitialHull(); // add all available vertices gradually to the hull

    while ((vertex = this.nextVertexToAdd()) !== undefined) {
      this.addVertexToHull(vertex);
    }

    this.reindexFaces();
    this.cleanup();
    return this;
  }
}); //

function Face() {
  this.normal = new Vector3();
  this.midpoint = new Vector3();
  this.area = 0;
  this.constant = 0; // signed distance from face to the origin

  this.outside = null; // reference to a vertex in a vertex list this face can see

  this.mark = Visible;
  this.edge = null;
}

Object.assign(Face, {
  create: function (a, b, c) {
    var face = new Face();
    var e0 = new HalfEdge(a, face);
    var e1 = new HalfEdge(b, face);
    var e2 = new HalfEdge(c, face); // join edges

    e0.next = e2.prev = e1;
    e1.next = e0.prev = e2;
    e2.next = e1.prev = e0; // main half edge reference

    face.edge = e0;
    return face.compute();
  }
});
Object.assign(Face.prototype, {
  getEdge: function (i) {
    var edge = this.edge;

    while (i > 0) {
      edge = edge.next;
      i--;
    }

    while (i < 0) {
      edge = edge.prev;
      i++;
    }

    return edge;
  },
  compute: function () {
    var triangle;
    return function compute() {
      if (triangle === undefined) { triangle = new Triangle(); }
      var a = this.edge.tail();
      var b = this.edge.head();
      var c = this.edge.next.head();
      triangle.set(a.point, b.point, c.point);
      triangle.getNormal(this.normal);
      triangle.getMidpoint(this.midpoint);
      this.area = triangle.getArea();
      this.constant = this.normal.dot(this.midpoint);
      return this;
    };
  }(),
  distanceToPoint: function (point) {
    return this.normal.dot(point) - this.constant;
  }
}); // Entity for a Doubly-Connected Edge List (DCEL).

function HalfEdge(vertex, face) {
  this.vertex = vertex;
  this.prev = null;
  this.next = null;
  this.twin = null;
  this.face = face;
}

Object.assign(HalfEdge.prototype, {
  head: function () {
    return this.vertex;
  },
  tail: function () {
    return this.prev ? this.prev.vertex : null;
  },
  length: function () {
    var head = this.head();
    var tail = this.tail();

    if (tail !== null) {
      return tail.point.distanceTo(head.point);
    }

    return -1;
  },
  lengthSquared: function () {
    var head = this.head();
    var tail = this.tail();

    if (tail !== null) {
      return tail.point.distanceToSquared(head.point);
    }

    return -1;
  },
  setTwin: function (edge) {
    this.twin = edge;
    edge.twin = this;
    return this;
  }
}); // A vertex as a double linked list node.

function VertexNode(point) {
  this.point = point;
  this.prev = null;
  this.next = null;
  this.face = null; // the face that is able to see this vertex
} // A double linked list that contains vertex nodes.


function VertexList() {
  this.head = null;
  this.tail = null;
}

Object.assign(VertexList.prototype, {
  first: function () {
    return this.head;
  },
  last: function () {
    return this.tail;
  },
  clear: function () {
    this.head = this.tail = null;
    return this;
  },
  // Inserts a vertex before the target vertex
  insertBefore: function (target, vertex) {
    vertex.prev = target.prev;
    vertex.next = target;

    if (vertex.prev === null) {
      this.head = vertex;
    } else {
      vertex.prev.next = vertex;
    }

    target.prev = vertex;
    return this;
  },
  // Inserts a vertex after the target vertex
  insertAfter: function (target, vertex) {
    vertex.prev = target;
    vertex.next = target.next;

    if (vertex.next === null) {
      this.tail = vertex;
    } else {
      vertex.next.prev = vertex;
    }

    target.next = vertex;
    return this;
  },
  // Appends a vertex to the end of the linked list
  append: function (vertex) {
    if (this.head === null) {
      this.head = vertex;
    } else {
      this.tail.next = vertex;
    }

    vertex.prev = this.tail;
    vertex.next = null; // the tail has no subsequent vertex

    this.tail = vertex;
    return this;
  },
  // Appends a chain of vertices where 'vertex' is the head.
  appendChain: function (vertex) {
    if (this.head === null) {
      this.head = vertex;
    } else {
      this.tail.next = vertex;
    }

    vertex.prev = this.tail; // ensure that the 'tail' reference points to the last vertex of the chain

    while (vertex.next !== null) {
      vertex = vertex.next;
    }

    this.tail = vertex;
    return this;
  },
  // Removes a vertex from the linked list
  remove: function (vertex) {
    if (vertex.prev === null) {
      this.head = vertex.next;
    } else {
      vertex.prev.next = vertex.next;
    }

    if (vertex.next === null) {
      this.tail = vertex.prev;
    } else {
      vertex.next.prev = vertex.prev;
    }

    return this;
  },
  // Removes a list of vertices whose 'head' is 'a' and whose 'tail' is b
  removeSubList: function (a, b) {
    if (a.prev === null) {
      this.head = b.next;
    } else {
      a.prev.next = b.next;
    }

    if (b.next === null) {
      this.tail = a.prev;
    } else {
      b.next.prev = a.prev;
    }

    return this;
  },
  isEmpty: function () {
    return this.head === null;
  }
});

/**
 * @author Mugen87 / https://github.com/Mugen87
 *
 * adapted for Typescript by Gheric Speiginer
 */

var ConvexGeometry = /*@__PURE__*/(function (superclass) {
  function ConvexGeometry(points) {
    superclass.call(this);
    this.points = points;
    this.fromBufferGeometry(new ConvexBufferGeometry(points));
    this.mergeVertices();
  }

  if ( superclass ) ConvexGeometry.__proto__ = superclass;
  ConvexGeometry.prototype = Object.create( superclass && superclass.prototype );
  ConvexGeometry.prototype.constructor = ConvexGeometry;

  return ConvexGeometry;
}(Geometry)); // ConvexBufferGeometry

var ConvexBufferGeometry = /*@__PURE__*/(function (superclass) {
  function ConvexBufferGeometry(points) {
    superclass.call(this);
    this.points = points; // buffers

    var vertices = [];
    var normals = []; // execute QuickHull

    if (QuickHull === undefined) {
      console.error('THREE.ConvexBufferGeometry: ConvexBufferGeometry relies on THREE.QuickHull');
    }

    var quickHull = new QuickHull().setFromPoints(points); // generate vertices and normals

    var faces = quickHull.faces;

    for (var i = 0; i < faces.length; i++) {
      var face = faces[i];
      var edge = face.edge; // we move along a doubly-connected edge list to access all face points (see HalfEdge docs)

      do {
        var point = edge.head().point;
        vertices.push(point.x, point.y, point.z);
        normals.push(face.normal.x, face.normal.y, face.normal.z);
        edge = edge.next;
      } while (edge !== face.edge);
    } // build geometry


    this.addAttribute('position', new Float32BufferAttribute(vertices, 3));
    this.addAttribute('normal', new Float32BufferAttribute(normals, 3));
  }

  if ( superclass ) ConvexBufferGeometry.__proto__ = superclass;
  ConvexBufferGeometry.prototype = Object.create( superclass && superclass.prototype );
  ConvexBufferGeometry.prototype.constructor = ConvexBufferGeometry;

  return ConvexBufferGeometry;
}(BufferGeometry));

/*
 *	@author zz85 / http://twitter.com/blurspline / http://www.lab4games.net/zz85/blog
 *
 *	Simplification Geometry Modifier
 *    - based on code and technique
 *	  - by Stan Melax in 1998
 *	  - Progressive Mesh type Polygon Reduction Algorithm
 *    - http://www.melax.com/polychop/
 */
var SimplifyModifier = function () {};

(function () {
  var cb = new Vector3(),
      ab = new Vector3();

  function pushIfUnique(array, object) {
    if (array.indexOf(object) === -1) { array.push(object); }
  }

  function removeFromArray(array, object) {
    var k = array.indexOf(object);
    if (k > -1) { array.splice(k, 1); }
  }

  function computeEdgeCollapseCost(u, v) {
    // if we collapse edge uv by moving u to v then how
    // much different will the model change, i.e. the "error".
    var edgelength = v.position.distanceTo(u.position);
    var curvature = 0;
    var sideFaces = [];
    var i,
        il = u.faces.length,
        face,
        sideFace; // find the "sides" triangles that are on the edge uv

    for (i = 0; i < il; i++) {
      face = u.faces[i];

      if (face.hasVertex(v)) {
        sideFaces.push(face);
      }
    } // use the triangle facing most away from the sides
    // to determine our curvature term


    for (i = 0; i < il; i++) {
      var minCurvature = 1;
      face = u.faces[i];

      for (var j = 0; j < sideFaces.length; j++) {
        sideFace = sideFaces[j]; // use dot product of face normals.

        var dotProd = face.normal.dot(sideFace.normal);
        minCurvature = Math.min(minCurvature, (1.001 - dotProd) / 2);
      }

      curvature = Math.max(curvature, minCurvature);
    } // crude approach in attempt to preserve borders
    // though it seems not to be totally correct


    var borders = 0;

    if (sideFaces.length < 2) {
      // we add some arbitrary cost for borders,
      // borders += 10;
      curvature = 1;
    }

    var amt = edgelength * curvature + borders;
    return amt;
  }

  function computeEdgeCostAtVertex(v) {
    // compute the edge collapse cost for all edges that start
    // from vertex v.  Since we are only interested in reducing
    // the object by selecting the min cost edge at each step, we
    // only cache the cost of the least cost edge at this vertex
    // (in member variable collapse) as well as the value of the
    // cost (in member variable collapseCost).
    if (v.neighbors.length === 0) {
      // collapse if no neighbors.
      v.collapseNeighbor = null;
      v.collapseCost = -0.01;
      return;
    }

    v.collapseCost = 100000;
    v.collapseNeighbor = null; // search all neighboring edges for "least cost" edge

    for (var i = 0; i < v.neighbors.length; i++) {
      var collapseCost = computeEdgeCollapseCost(v, v.neighbors[i]);

      if (!v.collapseNeighbor) {
        v.collapseNeighbor = v.neighbors[i];
        v.collapseCost = collapseCost;
        v.minCost = collapseCost;
        v.totalCost = 0;
        v.costCount = 0;
      }

      v.costCount++;
      v.totalCost += collapseCost;

      if (collapseCost < v.minCost) {
        v.collapseNeighbor = v.neighbors[i];
        v.minCost = collapseCost;
      }
    } // we average the cost of collapsing at this vertex


    v.collapseCost = v.totalCost / v.costCount; // v.collapseCost = v.minCost;
  }

  function removeVertex(v, vertices) {
    console.assert(v.faces.length === 0);

    while (v.neighbors.length) {
      var n = v.neighbors.pop();
      removeFromArray(n.neighbors, v);
    }

    removeFromArray(vertices, v);
  }

  function removeFace(f, faces) {
    removeFromArray(faces, f);
    if (f.v1) { removeFromArray(f.v1.faces, f); }
    if (f.v2) { removeFromArray(f.v2.faces, f); }
    if (f.v3) { removeFromArray(f.v3.faces, f); } // TODO optimize this!

    var vs = [f.v1, f.v2, f.v3];
    var v1, v2;

    for (var i = 0; i < 3; i++) {
      v1 = vs[i];
      v2 = vs[(i + 1) % 3];
      if (!v1 || !v2) { continue; }
      v1.removeIfNonNeighbor(v2);
      v2.removeIfNonNeighbor(v1);
    }
  }

  function collapse(vertices, faces, u, v) {
    // u and v are pointers to vertices of an edge
    // Collapse the edge uv by moving vertex u onto v
    if (!v) {
      // u is a vertex all by itself so just delete it..
      removeVertex(u, vertices);
      return;
    }

    var i;
    var tmpVertices = [];

    for (i = 0; i < u.neighbors.length; i++) {
      tmpVertices.push(u.neighbors[i]);
    } // delete triangles on edge uv:


    for (i = u.faces.length - 1; i >= 0; i--) {
      if (u.faces[i].hasVertex(v)) {
        removeFace(u.faces[i], faces);
      }
    } // update remaining triangles to have v instead of u


    for (i = u.faces.length - 1; i >= 0; i--) {
      u.faces[i].replaceVertex(u, v);
    }

    removeVertex(u, vertices); // recompute the edge collapse costs in neighborhood

    for (i = 0; i < tmpVertices.length; i++) {
      computeEdgeCostAtVertex(tmpVertices[i]);
    }
  }

  function minimumCostEdge(vertices) {
    // O(n * n) approach. TODO optimize this
    var least = vertices[0];

    for (var i = 0; i < vertices.length; i++) {
      if (vertices[i].collapseCost < least.collapseCost) {
        least = vertices[i];
      }
    }

    return least;
  } // we use a triangle class to represent structure of face slightly differently


  function Triangle$$1(v1, v2, v3, a, b, c) {
    this.a = a;
    this.b = b;
    this.c = c;
    this.v1 = v1;
    this.v2 = v2;
    this.v3 = v3;
    this.normal = new Vector3();
    this.computeNormal();
    v1.faces.push(this);
    v1.addUniqueNeighbor(v2);
    v1.addUniqueNeighbor(v3);
    v2.faces.push(this);
    v2.addUniqueNeighbor(v1);
    v2.addUniqueNeighbor(v3);
    v3.faces.push(this);
    v3.addUniqueNeighbor(v1);
    v3.addUniqueNeighbor(v2);
  }

  Triangle$$1.prototype.computeNormal = function () {
    var vA = this.v1.position;
    var vB = this.v2.position;
    var vC = this.v3.position;
    cb.subVectors(vC, vB);
    ab.subVectors(vA, vB);
    cb.cross(ab).normalize();
    this.normal.copy(cb);
  };

  Triangle$$1.prototype.hasVertex = function (v) {
    return v === this.v1 || v === this.v2 || v === this.v3;
  };

  Triangle$$1.prototype.replaceVertex = function (oldv, newv) {
    if (oldv === this.v1) { this.v1 = newv; }else if (oldv === this.v2) { this.v2 = newv; }else if (oldv === this.v3) { this.v3 = newv; }
    removeFromArray(oldv.faces, this);
    newv.faces.push(this);
    oldv.removeIfNonNeighbor(this.v1);
    this.v1.removeIfNonNeighbor(oldv);
    oldv.removeIfNonNeighbor(this.v2);
    this.v2.removeIfNonNeighbor(oldv);
    oldv.removeIfNonNeighbor(this.v3);
    this.v3.removeIfNonNeighbor(oldv);
    this.v1.addUniqueNeighbor(this.v2);
    this.v1.addUniqueNeighbor(this.v3);
    this.v2.addUniqueNeighbor(this.v1);
    this.v2.addUniqueNeighbor(this.v3);
    this.v3.addUniqueNeighbor(this.v1);
    this.v3.addUniqueNeighbor(this.v2);
    this.computeNormal();
  };

  function Vertex(v, id) {
    this.position = v;
    this.id = id; // old index id

    this.faces = []; // faces vertex is connected

    this.neighbors = []; // neighbouring vertices aka "adjacentVertices"
    // these will be computed in computeEdgeCostAtVertex()

    this.collapseCost = 0; // cost of collapsing this vertex, the less the better. aka objdist

    this.collapseNeighbor = null; // best candinate for collapsing
  }

  Vertex.prototype.addUniqueNeighbor = function (vertex) {
    pushIfUnique(this.neighbors, vertex);
  };

  Vertex.prototype.removeIfNonNeighbor = function (n) {
    var neighbors = this.neighbors;
    var faces = this.faces;
    var offset = neighbors.indexOf(n);
    if (offset === -1) { return; }

    for (var i = 0; i < faces.length; i++) {
      if (faces[i].hasVertex(n)) { return; }
    }

    neighbors.splice(offset, 1);
  };

  SimplifyModifier.prototype.modify = function (geometry, count) {
    if (geometry.isBufferGeometry) {
      geometry = new Geometry().fromBufferGeometry(geometry);
    }

    geometry.mergeVertices();
    var oldVertices = geometry.vertices; // Three Position

    var oldFaces = geometry.faces; // Three Face
    // conversion

    var vertices = [];
    var faces = [];
    var i, il; //
    // put data of original geometry in different data structures
    //
    // add vertices

    for (i = 0, il = oldVertices.length; i < il; i++) {
      var vertex = new Vertex(oldVertices[i], i);
      vertices.push(vertex);
    } // add faces


    for (i = 0, il = oldFaces.length; i < il; i++) {
      var face = oldFaces[i];
      var a = face.a;
      var b = face.b;
      var c = face.c;
      var triangle = new Triangle$$1(vertices[a], vertices[b], vertices[c], a, b, c);
      faces.push(triangle);
    } // compute all edge collapse costs


    for (i = 0, il = vertices.length; i < il; i++) {
      computeEdgeCostAtVertex(vertices[i]);
    }

    var nextVertex;
    var z = count;

    while (z--) {
      nextVertex = minimumCostEdge(vertices);

      if (!nextVertex) {
        console.log('THREE.SimplifyModifier: No next vertex');
        break;
      }

      collapse(vertices, faces, nextVertex, nextVertex.collapseNeighbor);
    } //


    var simplifiedGeometry = new BufferGeometry();
    var position = [];
    var index = []; //

    for (i = 0; i < vertices.length; i++) {
      var vertex = vertices[i].position;
      position.push(vertex.x, vertex.y, vertex.z);
    } //


    for (i = 0; i < faces.length; i++) {
      var face = faces[i];
      var a = vertices.indexOf(face.v1);
      var b = vertices.indexOf(face.v2);
      var c = vertices.indexOf(face.v3);
      index.push(a, b, c);
    } //


    simplifiedGeometry.addAttribute('position', new Float32BufferAttribute(position, 3));
    simplifiedGeometry.setIndex(index);
    return simplifiedGeometry;
  };
})();

var SimplifiedHull = function SimplifiedHull () {};

SimplifiedHull.compute = function compute (geometry, maxPoints) {
    if ( maxPoints === void 0 ) maxPoints = 30;

  var bufferGeometry = geometry.type === 'BufferGeometry' ? geometry : null;
  var normalGeometry = bufferGeometry ? new Geometry().fromBufferGeometry(bufferGeometry) : geometry;

  if (normalGeometry.vertices.length < maxPoints) {
    this.hulls.set(geometry, normalGeometry);
    return normalGeometry;
  }

  var modifier = new SimplifyModifier();
  var hull = new ConvexGeometry(normalGeometry.vertices);
  var count = hull.vertices.length;

  if (count > maxPoints) {
    var simplified = modifier.modify(hull, hull.vertices.length - maxPoints);
    hull = new Geometry().fromBufferGeometry(simplified);
  }

  this.hulls.set(geometry, hull);
  return hull;
};

SimplifiedHull.get = function get (geometry) {
  return this.hulls.get(geometry) || geometry;
};
SimplifiedHull.hulls = new WeakMap();
var Box3$1 = /*@__PURE__*/(function (superclass) {
  function Box3$$1() {
    superclass.apply(this, arguments);
    this.objectFilter = SpatialMetrics.objectFilter;
    this.objectExpansion = 'box';
    this.coordinateSystem = undefined;
    this._vector = new Vector3();
    this._mat4 = new Matrix4();
    this._box = new Box3();
    this._center = new Vector3();
    this._size = new Vector3();
  }

  if ( superclass ) Box3$$1.__proto__ = superclass;
  Box3$$1.prototype = Object.create( superclass && superclass.prototype );
  Box3$$1.prototype.constructor = Box3$$1;

  Box3$$1.prototype._onObjectTraverse = function _onObjectTraverse (node) {
    if (this.objectFilter && !this.objectFilter(node)) { return false; }

    this._objectExpandFunction.call(this, node);

    return true;
  };

  Box3$$1.prototype.setFromObject = function setFromObject (object) {
    this.makeEmpty();

    switch (this.objectExpansion) {
      case 'geometry':
        this._objectExpandFunction = this.expandByObjectGeometry;
        break;

      case 'hull':
        this._objectExpandFunction = this.expandByObjectHull;
        break;

      case 'box':
      default:
        this._objectExpandFunction = this.expandByObjectBox;
        break;
    }

    this._objectExpandFunction.call(this, object);

    for (var i = 0, list = object.children; i < list.length; i += 1) {
      var c = list[i];

      traverse(c, this._onObjectTraverse, this);
    }

    return this;
  };

  Box3$$1.prototype.expandByObjectGeometry = function expandByObjectGeometry (node) {
    var i, l;
    var vector = this._vector;
    var mesh = node;
    node.updateWorldMatrix(false, false);
    var geometry = mesh.geometry;

    if (geometry !== undefined) {
      var mat = this._getCoordinateSystemTransform(node);

      if (geometry.isGeometry) {
        var vertices = geometry.vertices;

        for (i = 0, l = vertices.length; i < l; i++) {
          vector.copy(vertices[i]);
          vector.applyMatrix4(mat);
          this.expandByPoint(vector);
        }
      } else if (geometry.isBufferGeometry) {
        var attribute = geometry.attributes.position;

        if (attribute !== undefined) {
          for (i = 0, l = attribute.count; i < l; i++) {
            vector.fromBufferAttribute(attribute, i).applyMatrix4(mat);
            this.expandByPoint(vector);
          }
        }
      }
    }

    return this;
  };

  Box3$$1.prototype.expandByObjectHull = function expandByObjectHull (node) {
    var mesh = node;
    var vector = this._vector;
    var geometry = mesh.geometry;
    if (!geometry) { return this; }

    var mat = this._getCoordinateSystemTransform(node);

    geometry = SimplifiedHull.get(geometry);

    if (geometry && 'vertices' in geometry) {
      var vertices = geometry.vertices;

      for (var i = 0; i < vertices.length; ++i) {
        var v = vertices[i];
        vector.copy(v).applyMatrix4(mat);
        this.expandByPoint(vector);
      }
    } else {
      var vertices$1 = geometry.getAttribute('position');

      for (var i$1 = 0; i$1 < vertices$1.count; i$1 += vertices$1.itemSize) {
        vector.set(vertices$1.getX(i$1), vertices$1.getY(i$1), vertices$1.getZ(i$1)).applyMatrix4(mat);
        this.expandByPoint(vector);
      }
    }

    return this;
  };

  Box3$$1.prototype.expandByObjectBox = function expandByObjectBox (node) {
    var box = this._box;
    var mesh = node;
    var geometry = mesh.geometry;
    if (!geometry) { return this; }

    if (geometry.boundingBox === null) {
      geometry.computeBoundingBox();
    }

    box.copy(geometry.boundingBox);
    box.applyMatrix4(this._getCoordinateSystemTransform(node));
    this.union(box);
    return this;
  };

  Box3$$1.prototype._getCoordinateSystemTransform = function _getCoordinateSystemTransform (node) {
    var mat4 = this._mat4;

    if (this.coordinateSystem) {
      mat4.getInverse(this.coordinateSystem.transitioner.matrixWorldTarget).multiply(node.transitioner.matrixWorldTarget);
    } else {
      mat4.copy(node.transitioner.matrixWorldTarget);
    }

    return mat4;
  };

  Box3$$1.prototype.relativeToAbsolute = function relativeToAbsolute (relativePosition, out) {
    if ( out === void 0 ) out = relativePosition;

    if (!this.isEmpty()) {
      var center = this._center;
      var size = this._size;
      this.getCenter(center);
      this.getSize(size);
      out.copy(relativePosition).multiply(size).add(center);
    } else {
      out.copy(relativePosition).multiplyScalar(0);
    } // if (!isFinite(out.x)) out.x = 0
    // if (!isFinite(out.y)) out.y = 0
    // if (!isFinite(out.z)) out.z = 0


    return out;
  };

  Box3$$1.prototype.absoluteToRelative = function absoluteToRelative (absolutePosition, out) {
    if ( out === void 0 ) out = absolutePosition;

    if (!this.isEmpty()) {
      var center = this._center;
      var size = this._size;
      this.getCenter(center);
      this.getSize(size);
      out.copy(absolutePosition).sub(center).divide(size);
    } else {
      out.copy(absolutePosition).multiplyScalar(0);
    } // if (!isFinite(out.x)) out.x = 0
    // if (!isFinite(out.y)) out.y = 0
    // if (!isFinite(out.z)) out.z = 0


    return out;
  };

  Box3$$1.prototype.isEmpty = function isEmpty () {
    return !isFinite(this.min.x) && !isFinite(this.min.y) && !isFinite(this.min.z) && !isFinite(this.max.x) && !isFinite(this.max.y) && !isFinite(this.max.z);
  };

  return Box3$$1;
}(Box3));
var rotateY180 = new Quaternion().setFromAxisAngle(V_010, Math.PI);
/**
 * A visual viewing frustum, with angles specified in DEGREES
 */

var VisualFrustum = function VisualFrustum(coordinateSystem) {
  this.coordinateSystem = coordinateSystem;
  this.objectFilter = SpatialMetrics.objectFilter;
  this.objectExpansion = 'box';
  this.min = new Vector3(Infinity, Infinity, Infinity);
  this.max = new Vector3(-Infinity, -Infinity, -Infinity);
  this.minClamped = new Vector3();
  this.maxClamped = new Vector3();
  this._vec3 = new Vector3();
  this._mat4 = new Matrix4();
  this._boxPoints = [new Vector3(), new Vector3(), new Vector3(), new Vector3(), new Vector3(), new Vector3(), new Vector3(), new Vector3()];
};

var prototypeAccessors = { left: { configurable: true },leftClamped: { configurable: true },top: { configurable: true },topClamped: { configurable: true },right: { configurable: true },rightClamped: { configurable: true },bottom: { configurable: true },bottomClamped: { configurable: true },near: { configurable: true },nearClamped: { configurable: true },far: { configurable: true },farClamped: { configurable: true },horizontal: { configurable: true },horizontalClamped: { configurable: true },vertical: { configurable: true },verticalClamped: { configurable: true },depth: { configurable: true },depthClamped: { configurable: true },diagonal: { configurable: true },diagonalClamped: { configurable: true } };

prototypeAccessors.left.get = function () {
  if (this.isEmpty()) { return 0; }
  return this.min.x;
};

prototypeAccessors.leftClamped.get = function () {
  if (this.isEmpty()) { return 0; }
  return this.minClamped.x;
};

prototypeAccessors.top.get = function () {
  if (this.isEmpty()) { return 0; }
  return this.max.y;
};

prototypeAccessors.topClamped.get = function () {
  if (this.isEmpty()) { return 0; }
  return this.maxClamped.y;
};

prototypeAccessors.right.get = function () {
  if (this.isEmpty()) { return 0; }
  return this.max.x;
};

prototypeAccessors.rightClamped.get = function () {
  if (this.isEmpty()) { return 0; }
  return this.maxClamped.x;
};

prototypeAccessors.bottom.get = function () {
  if (this.isEmpty()) { return 0; }
  return this.min.y;
};

prototypeAccessors.bottomClamped.get = function () {
  if (this.isEmpty()) { return 0; }
  return this.minClamped.y;
};

prototypeAccessors.near.get = function () {
  if (this.isEmpty()) { return 0; }
  return this.min.z;
};

prototypeAccessors.nearClamped.get = function () {
  if (this.isEmpty()) { return 0; }
  return this.minClamped.z;
};

prototypeAccessors.far.get = function () {
  if (this.isEmpty()) { return 0; }
  return this.max.z;
};

prototypeAccessors.farClamped.get = function () {
  if (this.isEmpty()) { return 0; }
  return this.maxClamped.z;
};

prototypeAccessors.horizontal.get = function () {
  if (this.isEmpty()) { return 0; }
  return this.right - this.left;
};

prototypeAccessors.horizontalClamped.get = function () {
  if (this.isEmpty()) { return 0; }
  return this.rightClamped - this.leftClamped;
};

prototypeAccessors.vertical.get = function () {
  if (this.isEmpty()) { return 0; }
  return this.top - this.bottom;
};

prototypeAccessors.verticalClamped.get = function () {
  if (this.isEmpty()) { return 0; }
  return this.topClamped - this.bottomClamped;
};

prototypeAccessors.depth.get = function () {
  if (this.isEmpty()) { return 0; }
  return this.far - this.near;
};

prototypeAccessors.depthClamped.get = function () {
  if (this.isEmpty()) { return 0; }
  return this.farClamped - this.nearClamped;
};

prototypeAccessors.diagonal.get = function () {
  if (this.isEmpty()) { return 0; }
  var minDirection = SpatialMetrics.getCartesianForSphericalDirection(this.min, vectors.get());
  var maxDirection = SpatialMetrics.getCartesianForSphericalDirection(this.max, vectors.get());
  var diagonal = minDirection.angleTo(maxDirection);
  vectors.pool(minDirection);
  vectors.pool(maxDirection);
  return diagonal * Math$1.RAD2DEG;
};

prototypeAccessors.diagonalClamped.get = function () {
  if (this.isEmpty()) { return 0; }
  var minDirection = SpatialMetrics.getCartesianForSphericalDirection(this.minClamped, vectors.get());
  var maxDirection = SpatialMetrics.getCartesianForSphericalDirection(this.maxClamped, vectors.get());
  var diagonal = minDirection.angleTo(maxDirection);
  vectors.pool(minDirection);
  vectors.pool(maxDirection);
  return diagonal * Math$1.RAD2DEG;
};

VisualFrustum.prototype.isEmpty = function isEmpty () {
  return this.max.x < this.min.x || this.max.y < this.min.y || this.max.z < this.min.z;
};

VisualFrustum.prototype.getCenter = function getCenter (out) {
  return out.set(this.right - this.horizontal / 2, this.top - this.vertical / 2, this.far - this.depth / 2);
};

VisualFrustum.prototype.getClampedCenter = function getClampedCenter (out) {
  return out.set(this.rightClamped - this.horizontalClamped / 2, this.topClamped - this.verticalClamped / 2, this.farClamped - this.depthClamped / 2);
};

VisualFrustum.prototype.getSize = function getSize (out) {
  return out.set(this.horizontal, this.vertical, this.depth);
};

VisualFrustum.prototype.getClampedSize = function getClampedSize (out) {
  return out.set(this.horizontalClamped, this.verticalClamped, this.depthClamped);
};

VisualFrustum.prototype.getPositionForOffset = function getPositionForOffset (offset, out) {
  var center = this.getCenter(vectors.get());
  var size = this.getSize(vectors.get());
  out.copy(offset).multiplyScalar(0.5).multiply(size).add(center);
  vectors.pool(center);
  vectors.pool(size);
  return out;
};

VisualFrustum.prototype.getClampedPositionForOffset = function getClampedPositionForOffset (offset, out) {
  var center = this.getClampedCenter(vectors.get());
  var size = this.getClampedSize(vectors.get());
  out.copy(offset).multiplyScalar(0.5).multiply(size).add(center);
  vectors.pool(center);
  vectors.pool(size);
  return out;
};

VisualFrustum.prototype.setFromPerspectiveProjectionMatrix = function setFromPerspectiveProjectionMatrix (projectionMatrix) {
  var inverseProjection = matrices.get().getInverse(projectionMatrix);
  var vec = vectors.get();
  this.min.x = -vec.set(-1, 0, -1).applyMatrix4(inverseProjection).angleTo(V_001) * Math$1.RAD2DEG;
  this.max.x = vec.set(1, 0, -1).applyMatrix4(inverseProjection).angleTo(V_001) * Math$1.RAD2DEG;
  this.min.y = -vec.set(0, -1, -1).applyMatrix4(inverseProjection).angleTo(V_001) * Math$1.RAD2DEG;
  this.max.y = vec.set(0, 1, -1).applyMatrix4(inverseProjection).angleTo(V_001) * Math$1.RAD2DEG;
  this.min.z = -vec.set(0, 0, -1).applyMatrix4(inverseProjection).z;
  this.max.z = -vec.set(0, 0, 1).applyMatrix4(inverseProjection).z;
  matrices.pool(inverseProjection);
  vectors.pool(vec);

  this._applyClamping();
};

VisualFrustum.prototype.makeEmpty = function makeEmpty () {
  this.min.set(Infinity, Infinity, Infinity);
  this.max.set(-Infinity, -Infinity, -Infinity);
};

VisualFrustum.prototype.setFromObject = function setFromObject (object) {
  this.makeEmpty();

  switch (this.objectExpansion) {
    case 'geometry': //this._objectExpandFunction = this.expandByObjectGeometry; break;

    case 'hull':
      this._objectExpandFunction = this.expandByObjectHull;
      break;

    case 'box':
    default:
      this._objectExpandFunction = this.expandByObjectBox;
      break;
  }

  this._objectExpandFunction.call(this, object);

  for (var i = 0, list = object.children; i < list.length; i += 1) {
    var c = list[i];

      traverse(c, this._onObjectTraverse, this);
  }

  return this;
};

VisualFrustum.prototype._onObjectTraverse = function _onObjectTraverse (node) {
  if (this.objectFilter && !this.objectFilter(node)) { return false; }

  this._objectExpandFunction.call(this, node);

  return true;
};

VisualFrustum.prototype.expandByObjectHull = function expandByObjectHull (object) {
  var m = object;
  if (!m.isMesh) { return; }
  var coordinateSystem = this.coordinateSystem;
  var vertexPosition = this._vec3;

  var localToReferenceFrame = this._mat4.getInverse(coordinateSystem.matrixWorld).multiply(m.matrixWorld);

  var hull = SimplifiedHull.get(m.geometry);
  var metrics = SpatialMetrics.get(coordinateSystem);

  if ('vertices' in hull) {
    for (var i$1 = 0, list = hull.vertices; i$1 < list.length; i$1 += 1) {
      var vertex = list[i$1];

        vertexPosition.copy(vertex).applyMatrix4(localToReferenceFrame);
      var vertexVisualPosition = metrics.getVisualPositionForCartesianPosition(vertexPosition, vertexPosition);
      this.min.min(vertexVisualPosition);
      this.max.max(vertexVisualPosition);
    }
  } else {
    var vertices = hull.getAttribute('position');

    for (var i = 0; i < vertices.count; i += vertices.itemSize) {
      vertexPosition.set(vertices.getX(i), vertices.getY(i), vertices.getZ(i)).applyMatrix4(localToReferenceFrame);
      var vertexVisualPosition$1 = metrics.getVisualPositionForCartesianPosition(vertexPosition, vertexPosition);
      this.min.min(vertexVisualPosition$1);
      this.max.max(vertexVisualPosition$1);
    }
  }

  this._applyClamping();
};

VisualFrustum.prototype.expandByObjectBox = function expandByObjectBox (node) {
  var mat4 = this._mat4;
  var mesh = node;
  var geometry = mesh.geometry;
  if (!geometry) { return this; }

  if (geometry.boundingBox === null) {
    geometry.computeBoundingBox();
  }

  var box = geometry.boundingBox;
  var points = this._boxPoints;
  points[0].set(box.min.x, box.min.y, box.min.z); // 000

  points[1].set(box.min.x, box.min.y, box.max.z); // 001

  points[2].set(box.min.x, box.max.y, box.min.z); // 010

  points[3].set(box.min.x, box.max.y, box.max.z); // 011

  points[4].set(box.max.x, box.min.y, box.min.z); // 100

  points[5].set(box.max.x, box.min.y, box.max.z); // 101

  points[6].set(box.max.x, box.max.y, box.min.z); // 110

  points[7].set(box.max.x, box.max.y, box.max.z); // 111

  var coordinateSystem = this.coordinateSystem;
  var metrics = SpatialMetrics.get(coordinateSystem);
  var localToReferenceFrame = mat4.getInverse(coordinateSystem.matrixWorld).multiply(mesh.matrixWorld);

  for (var i = 0, list = points; i < list.length; i += 1) {
    var p = list[i];

      p.applyMatrix4(localToReferenceFrame);
    var vertexVisualPosition = metrics.getVisualPositionForCartesianPosition(p, p);
    this.min.min(vertexVisualPosition);
    this.max.max(vertexVisualPosition);
  }

  this._applyClamping();
};

VisualFrustum.prototype._applyClamping = function _applyClamping () {
  this.minClamped.copy(this.min);
  this.maxClamped.copy(this.max);
  if (this.minClamp) { this.minClamped.min(this.minClamp); }
  if (this.maxClamp) { this.maxClamped.max(this.maxClamp); }
};

Object.defineProperties( VisualFrustum.prototype, prototypeAccessors );
/**
 * Calculate spatial metrics between a primary object and a target object.
 *
 * The results are always in one of two *local* coordinate systems:
 * `object-space` -
 *      Local *cartesian* coordinate system [X,Y,Z]. By convention, this local coordinate system is
 *      interpreted in two different ways, depending on whether or not the object is a camera:
 *          Typical objects: [+X = left, +Y = up, +Z = forward]
 *          Camera objects: [+X = right, +Y = up, -Z = forward]
 * `visual-space` -
 *      Local *spherical* coordinate system [azimuth, elevation, distance], where:
 *          `azimuth` (-180 to 180 DEGREES) an angle around the horizontal plane
 *              (increasing from left to right, with 0deg being aligned with this object's natural `forward` vector)
 *          `elevation` (-90 to 90 DEGREES ) an angle above or below the horizontal plane
 *              (increases from below to above, with 0deg at the horizon)
 *          `distance` is distance along the direction defined by the azimuth and elevation
 *      Unlike object-space, visual-space is consistent for camera and non-camera objects.
 */

var SpatialMetrics = function SpatialMetrics(object) {
  this.object = object;
  this.matrixWorldGetter = 'target';
  this._box = new Box3$1();
  this._visualFrustum = new VisualFrustum(this.object);
};

SpatialMetrics.get = function get (o) {
  if (this._metrics.has(o)) { return this._metrics.get(o); }

  this._metrics.set(o, new SpatialMetrics(o));

  return this._metrics.get(o);
};

SpatialMetrics.getCartesianForSphericalDirection = function getCartesianForSphericalDirection (sphericalDirection, out) {
  var visualElevationRadians = Math$1.DEG2RAD * sphericalDirection.y;
  var visualAzimuthRadians = Math$1.DEG2RAD * sphericalDirection.x;
  var y = Math.sin(visualElevationRadians);
  var x = Math.cos(visualElevationRadians) * Math.sin(visualAzimuthRadians);
  var z = -Math.cos(visualElevationRadians) * Math.cos(visualAzimuthRadians);
  out.set(x, y, z).normalize();
  return out;
};

SpatialMetrics.getSphericalDirectionForCartesian = function getSphericalDirectionForCartesian (cartesian, out) {
  var direction = vectors.get().copy(cartesian).normalize();
  out.y = Math.asin(direction.y) * Math$1.RAD2DEG;
  out.x = Math.atan2(direction.x, -direction.z) * Math$1.RAD2DEG;
  vectors.pool(direction);
  return out;
};

SpatialMetrics.getSphericalPositionForCartesian = function getSphericalPositionForCartesian (cartesian, out) {
  var distance = cartesian.length();
  var direction = out.copy(cartesian).normalize();
  out.y = Math.asin(direction.y) * Math$1.RAD2DEG;
  out.x = Math.atan2(direction.x, -direction.z) * Math$1.RAD2DEG;
  out.z = distance;
  return out;
};

SpatialMetrics.getCartesianForSphericalPosition = function getCartesianForSphericalPosition (sphericalPosition, out) {
  var distance = sphericalPosition.z;
  var visualDirection = vectors2.get().set(sphericalPosition.x, sphericalPosition.y);
  SpatialMetrics.getCartesianForSphericalDirection(visualDirection, out).multiplyScalar(distance);
  vectors2.pool(visualDirection);
  return out;
};

SpatialMetrics.prototype.getMatrixWorld = function getMatrixWorld (o) {
  return this.matrixWorldGetter === 'current' ? o.matrixWorld : o.transitioner.matrixWorldTarget;
};

SpatialMetrics.prototype.getCartesianForVisualDirection = function getCartesianForVisualDirection (visualDirection, out) {
  SpatialMetrics.getCartesianForSphericalDirection(visualDirection, out);

  if (!this.object.isCamera) {
    out.applyQuaternion(rotateY180);
  }

  return out;
};

SpatialMetrics.prototype.getVisualDirectionForCartesian = function getVisualDirectionForCartesian (cartesian, out) {
  var cartesianPosition = vectors.get().copy(cartesian);

  if (!this.object.isCamera) {
    cartesianPosition.applyQuaternion(rotateY180);
  }

  SpatialMetrics.getSphericalDirectionForCartesian(cartesianPosition, out);
  vectors.pool(cartesianPosition);
  return out;
};

SpatialMetrics.prototype.getVisualPositionForCartesianPosition = function getVisualPositionForCartesianPosition (cartesianPosition, out) {
  var position = out.copy(cartesianPosition);

  if (!this.object.isCamera) {
    position.applyQuaternion(rotateY180);
  }

  SpatialMetrics.getSphericalPositionForCartesian(position, out);
  return out;
};

SpatialMetrics.prototype.getCartesianForVisualPosition = function getCartesianForVisualPosition (visualPosition, out) {
  var distance = visualPosition.z;
  var visualDirection = vectors2.get().set(visualPosition.x, visualPosition.y);
  this.getCartesianForVisualDirection(visualDirection, out).multiplyScalar(distance);
  vectors2.pool(visualDirection);
  return out;
};
/**
 * Calculate the local position of target in `object space`
 */


SpatialMetrics.prototype.getPositionOf = function getPositionOf (target, out) {
  out.setFromMatrixPosition(this.getMatrixWorld(target));
  var invMatrixWorld = matrices.get().getInverse(this.getMatrixWorld(this.object));
  out.applyMatrix4(invMatrixWorld);
  matrices.pool(invMatrixWorld);
  return out;
};
/**
 * Calculate the local distance of the target object
 * (Note: this is the same for both `object-space` and `visual-space`)
 */


SpatialMetrics.prototype.getDistanceOf = function getDistanceOf (target) {
  var vec = vectors.get();
  var result = this.getPositionOf(target, vec).length();
  vectors.pool(vec);
  return result;
};
/**
 * Calculate the local direction of the target object in `object-space`
 *
 * Remember, by convention:
 *   Normal objects: [+X = left, +Y = up, +Z = forward]
 *   Camera objects: [+X = right, +Y = up, -Z = forward]
 * Special Case: if both objects are at the same *exact* position,
 *    the result is a `forward` vector ([0,0,-1] for cameras, [0,0,1] for other objects)
 */


SpatialMetrics.prototype.getDirectionOf = function getDirectionOf (target, out) {
  var position = this.getPositionOf(target, out);
  var distance = position.lengthSq();

  if (distance === 0 || !isFinite(distance)) {
    // if distance is 0
    if (this.object.isCamera) {
      return out.set(0, 0, -1);
    }

    return out.set(0, 0, 1);
  }

  return position.normalize();
};
/**
 * Get the world direction of the target object.
 *
 * Special Case: if both objects are at the same *exact* position,
 *    the result is a `forward` vector ([0,0,-1] for cameras, [0,0,1] for other objects),
 *    transformed into world coordinates
 */


SpatialMetrics.prototype.getWorldDirectionOf = function getWorldDirectionOf (target, out) {
  return this.getDirectionOf(target, out).transformDirection(this.getMatrixWorld(this.object));
};

SpatialMetrics.prototype.getClosestOrthogonalOrientationOf = function getClosestOrthogonalOrientationOf (target, out) {
  var o = this.object;
  var viewToObjectMat = (o ? matrices.get().getInverse(this.getMatrixWorld(o)) : matrices.get()).multiply(this.getMatrixWorld(target));
  var mat = viewToObjectMat.extractRotation(viewToObjectMat);
  var orientation = out.setFromRotationMatrix(mat);
  var forwardDirection = vectors.get().set(0, 0, 1).applyQuaternion(orientation);
  var upDirection = vectors.get().set(0, 1, 0).applyQuaternion(orientation);
  var distForward = Infinity;
  var distUp = Infinity;
  var closestForwardDirection;
  var closestUpDirection;

  for (var i = 0, list = directions; i < list.length; i += 1) {
    var dir = list[i];

      var dist = upDirection.distanceToSquared(dir);

    if (dist < distUp) {
      distUp = dist;
      closestUpDirection = dir;
    }
  }

  for (var i$1 = 0, list$1 = directions; i$1 < list$1.length; i$1 += 1) {
    // avoid having forward & up defined on the same axis
    var dir$1 = list$1[i$1];

      if (dir$1.x && closestUpDirection.x) { continue; }
    if (dir$1.y && closestUpDirection.y) { continue; }
    if (dir$1.z && closestUpDirection.z) { continue; }
    var dist$1 = forwardDirection.distanceToSquared(dir$1);

    if (dist$1 < distForward) {
      distForward = dist$1;
      closestForwardDirection = dir$1;
    }
  }

  mat.identity();
  mat.lookAt(closestForwardDirection, V_000, closestUpDirection);
  orientation.setFromRotationMatrix(mat);
  matrices.pool(mat);
  o.updateMatrixWorld();
};
/**
 * Set a position for the *target object*,
 * based on the visual-space of *this object*.
 *
 * If the object has no bounding sphere, or if a visualSize is not specified,
 * then the current distance will be assumed.
 *
 * @param target
 * @param visualDirection the desired visual direction to the target
 * @param visualSize the desired visual size of the target (in DEGREES)
 * @param alpha a linear interpolation value (default is 1)
 */
// setPositionFor( target: THREE.Object3D,
//               visualDirection: THREE.Vector2,
//               visualSize?: number,
//               alpha = 1) {
//   let distance: number
//   if (typeof visualSize === 'number' && visualSize > 0) {
//       distance = this.computeDistanceFor(target, visualSize)
//   } else {
//       distance = this.getDistanceOf(target)
//   }
//   const start = vectors.get().copy(target.position)
//   const end = target.position
//   this.getCartesianForVisualDirection(visualDirection, end)
//   end.transformDirection(this.object.matrixWorld).multiplyScalar(distance)
//   target.parent && target.parent.worldToLocal(end)
//   target.position.copy(start.lerp(end, alpha))
//   vectors.pool(start)
// }

/**
 * Set a new scale for the target that
 * would make it have the desired visual size
 * in this object's `visual-space`.
 *
 * @param target
 * @param visualSize the desired visual size of the target (in DEGREES)
 * @param alpha a linear interpolation value (default is 1)
 */
// setScaleFor(target: THREE.Object3D, visualSize: number, alpha = 1) {
//   const idealDistance = this.computeDistanceFor(target, visualSize)
//   const currentDistance = this.getDistanceOf(target)
//   const distanceScale = idealDistance / currentDistance
//   const start = vectors.get().copy(target.scale)
//   const end = target.scale
//   if (isFinite(distanceScale)) { end.multiplyScalar(distanceScale) }
//   target.scale.copy(start.lerp(end, alpha))
//   vectors.pool(start)
// }
// /**
//* Perform a look-at operation on the target object, based
//* on this object's local up direction.
//* @param target
//*/
// setOrientationFor(target: THREE.Object3D, alpha = 1) {
//   const localObjectUp = vectors.get().set(0, 1, 0)
//   const savedTargetUp = vectors.get().copy(target.up)
//   const globalObjectUp = localObjectUp.transformDirection(this.object.matrixWorld)
//   target.up.copy(globalObjectUp)
//   const start = quaternions.get().copy(target.quaternion)
//   const lookAtVector = vectors.get().setFromMatrixPosition(this.object.matrixWorld)
//   target.lookAt(lookAtVector)
//   target.up.copy(savedTargetUp)
//   const end = target.quaternion
//   target.quaternion.copy(start.slerp(end, alpha))
//   vectors.pool(localObjectUp, savedTargetUp, lookAtVector)
//   quaternions.pool(start)
// }
// computeDistanceFor(target: THREE.Object3D, visualSize: number): number {
//   if (visualSize < 0 || visualSize > 360) { throw new Error('Invalid visualSize, must be between [0-360]') }
//   const targetMatrixWorldInverse = matrices.get().getInverse(this.getMatrixWorld(target))
//   const frustum = this.getVisualFrustumOf(target)
//   return 0
//   // if (sphereRadius === 0) { return this.getDistanceOf(target) }
//   // if (visualSize > 180) {
//   //   // special case: linearly decrease distance with increasing visual size within the bounding sphere.
//   //   return (360 - visualSize / 180) * sphereRadius
//   // }
//   // // see https://stackoverflow.com/questions/21648630/radius-of-projected-sphere-in-screen-space
//   // return sphereRadius / Math.sin( THREE.Math.DEG2RAD * visualSize / 2 )
// }


SpatialMetrics.prototype.getOrientationOf = function getOrientationOf (target, out) {
  var rotMat = matrices.get();
  var targetWorldOrientation = quaternions.get().setFromRotationMatrix(rotMat.extractRotation(this.getMatrixWorld(target)));
  var inverseThisWorldOrientation = quaternions.get().setFromRotationMatrix(rotMat.extractRotation(this.getMatrixWorld(this.object))).inverse();
  out.multiplyQuaternions(inverseThisWorldOrientation, targetWorldOrientation);
  quaternions.pool(targetWorldOrientation);
  quaternions.pool(inverseThisWorldOrientation);
  matrices.pool(rotMat);
  return out;
};
/**
 * Calculate the visual direction towards the target object.
 * Assumes that a normal object faces +Z, and a camera faces -Z.
 *
 * If pointing directly towards the target object, the direction is [0,0] (forward)
 * If pointing directly opposite of the target object, the direction is [0,-180] (backwards)
 * Special Case: if both are at the same exact position, the direction is [0,0] (forward)
 */


SpatialMetrics.prototype.getVisualDirectionOf = function getVisualDirectionOf (target, out) {
  var direction = this.getDirectionOf(target, vectors.get());
  var visualDirection = this.getVisualDirectionForCartesian(direction, out);
  vectors.pool(direction);
  return visualDirection;
};
/**
 * Calculate the visual angle towards the target object.
 * Assumes that a normal object faces +Z, and a camera faces -Z.
 *
 * If the target object is to the right of the forward vector, the angle is 0
 * If the target object is above the forward vector, the angle is 90
 * If the target object is to the left of the forward vector, then angle is 180
 * If the target object is below the forward vector, the angle is 270
 * If pointing directly towards the target object, the angle is 90 (up)
 * If pointing directly opposite of the target object, the direction is [0,-180] (backwards)
 * Special Case: if both are at the same exact position, the direction is [0,0] (forward)
 */


SpatialMetrics.prototype.getVisualAngleOf = function getVisualAngleOf (target, out) {
  var direction = this.getDirectionOf(target, vectors.get());
  var visualDirection = this.getVisualDirectionForCartesian(direction, out);
  vectors.pool(direction);
  return visualDirection;
};
/**
 * Calculate the bounds of the target object, in the local `object-space` coordinate system.
 * @param target
 * @param out
 */


SpatialMetrics.prototype.getBoundsOf = function getBoundsOf (target, out) {
    if ( out === void 0 ) out = this._box;

  if (out === this._box) {
    out.objectFilter = SpatialMetrics.objectFilter;
    out.objectExpansion = 'box';
  }

  out.coordinateSystem = this.object;
  return out.setFromObject(target);
};

SpatialMetrics.prototype.getVisualFrustumOf = function getVisualFrustumOf (target, out) {
    if ( target === void 0 ) target = this.object;
    if ( out === void 0 ) out = this._visualFrustum;

  if (out === this._visualFrustum) { out.objectFilter = SpatialMetrics.objectFilter; }
  var camera = target;
  if (camera.isCamera) { out.setFromPerspectiveProjectionMatrix(camera.projectionMatrix); }else { out.setFromObject(target); }
  return out;
}; // /**
//* Calculate the visual bounds of the target object, in the local `visual-space` coordinate system
//* @param target 
//* @param out 
//*/
// getVisualBoundsOf(target: THREE.Object3D, out: VisualBounds) {
//   const direction = this.getDirectionOf(target, vectors.get())
//   const visualDirection = this.getVisualDirectionOf(target, vectors2.get())
//   const rotation = matrices.get().lookAt(V_000, direction, V_010)
//   const rotatedMatrixWorld = matrices.get().multiplyMatrices(rotation, this.object.matrixWorld)
//   const rotatedMatrixWorldInverse = rotatedMatrixWorld.getInverse(rotatedMatrixWorld)
//   _box.setFromObjectBoxes(target, rotatedMatrixWorldInverse)
//   this.getVisualPointFromCartesianPoint(_box.min, out.leftBottomNear)
//   this.getVisualPointFromCartesianPoint(_box.max, out.rightTopFar)
//   matrices.pool(objectMatrixWorldInverse)
// }

/**
 * Calculate the angular offset (in DEGREES) between this object's forward vector,
 * and the direction towards the target object (as calculated by getDirectionOf).
 * Assumes that a normal object faces +Z, and a camera faces -Z.
 *
 * If pointing directly towards the target object, the visual offset is 0
 * If pointing directly opposite of the target object, the visual offset is 180
 * Special Case: if both are at the same position, the visual offset is 180
 */


SpatialMetrics.prototype.getVisualOffsetOf = function getVisualOffsetOf (target) {
  var direction = this.getDirectionOf(target, vectors.get());

  if (!this.object.isCamera) {
    direction.applyQuaternion(rotateY180);
  }

  var result = V_001.angleTo(direction) * Math$1.RAD2DEG;
  vectors.pool(direction);
  return result;
};
SpatialMetrics._metrics = new WeakMap();

SpatialMetrics.objectFilter = function (o) { return !o.layout.isBoundingContext(); };

var directions = [new Vector3(1, 0, 0), new Vector3(0, 1, 0), new Vector3(0, 0, 1), new Vector3(-1, 0, 0), new Vector3(0, -1, 0), new Vector3(0, 0, -1)]; // export function getMetrics(obj: THREE.Object3D) : SpatialMetrics {
//     if (_metricsMap.has(obj)) return _metricsMap.get(obj)!
//     const metrics = new SpatialMetrics(obj)
//     _metricsMap.set(obj, metrics)
//     return metrics
// }

var LayoutFit = {
  contain: 'contain',
  contain3d: 'contain3d',
  cover: 'cover',
  cover3d: 'cover3d',
  fill: 'fill',
  fill3d: 'fill3d'
};
/**
 * Extend THREE.Object3D functionality with 3D layout functionality.
 *
 * Features include:
 *  - automatic bounds computation
 *  - modify alignment, origin, and size with respect to bounds and parent bounds
 *  - pose & layout transitions
 */

var Layout = function Layout(object) {
  this.object = object;
  /**
   * Force local layout bounds to be excluded from the parent bounding context
   * (effectively, forces a new bounding context)
   */

  this.forceBoundsExclusion = false;
  /**
   * Specifies the degree to which the layout properties (`absolute`, and `relative`) influence
   * the final transform. At 0, the layout properties have no effect. At 1, they have
   * their full intended effect.
   */

  this.weight = 1;
  /**
   * Specify absolute layout bounds. A mininum or maximum boundary
   * can be set to `NaN` in any dimension to remain unspecified.
   *
   * Note: any specified `relative` and `absolute` bounds
   * are combined to determine `computedBounds`
   */

  this.absolute = new Box3$1();
  /**
   * Specify relative layout bounds, with -0.5 to 0.5 spanning the
   * range of `computedOuterBounds` for each dimension. A mininum or
   * maximum boundary can be set to `NaN` in any dimension to remain
   * unspecified.
   *
   * Note: any specified `relative` and `absolute` bounds
   * are combined to determine `computedBounds`
   */

  this.relative = new Box3$1();
  /**
   * Specify the orientation of the layout. Default is identity.
   */

  this.orientation = new Quaternion();
  /**
   *
   */

  this.minRelativeSize = new Vector3();
  /**
   *
   */

  this.minAbsoluteSize = new Vector3();
  this._fit = 'contain';
  /** Used internally. */

  this.fitTargets = {
    contain: 1,
    contain3d: 0,
    cover: 0,
    cover3d: 0,
    fill: 0,
    fill3d: 0
  };
  /**
   *
   */

  this.fitAlign = new Vector3();
  this.clip = new Box3$1();
  this.inner = new Box3$1();
  this.innerAutoUpdate = true;
  this.computedBounds = new Box3$1();
  this.computedInnerBounds = new Box3$1();
  this.computedOuterBounds = new Box3$1();
  this.computedClipBounds = new Box3$1();
  this.matrix = new Matrix4();
  this._boundsValid = false;
  this.computedInnerBounds.objectFilter = SpatialMetrics.objectFilter;
  this.computedInnerBounds.objectExpansion = 'box';
  this.computedInnerBounds.coordinateSystem = object;
};

var prototypeAccessors$1 = { fit: { configurable: true } };
/**
 * Specifies how the object should fit within `absolute` and `relative` bounds,
 * which determines the `computedBounds`
*/


prototypeAccessors$1.fit.set = function (fit) {
  this._fit = fit;

  for (var id in this.fitTargets) { this.fitTargets[id] = 0; }

  this.fitTargets[fit] = 1;
};

prototypeAccessors$1.fit.get = function () {
  return this._fit;
};

Layout.prototype.invalidateBounds = function invalidateBounds () {
  this._boundsValid = false;
};

Layout.prototype.resetLayout = function resetLayout () {
  this.fit = 'contain';
  this.absolute.makeEmpty();
  this.relative.makeEmpty();
};

Layout.prototype.resetPose = function resetPose () {
  this.object.position.setScalar(0);
  this.object.quaternion.set(0, 0, 0, 1);
  this.object.scale.setScalar(1);
};

Layout.prototype.reset = function reset () {
  this.resetLayout();
  this.resetPose();
};
/**
 * If true, the layout properties are effectively noop
 */


Layout.prototype.isPassive = function isPassive () {
  return this.absolute.isEmpty() && this.relative.isEmpty();
};
/**
 * If true, the `object` should not be included in the bounding calculation
 * for any parent layouts.
 */


Layout.prototype.isBoundingContext = function isBoundingContext () {
  if (this.forceBoundsExclusion) { return true; }

  if (!this.isPassive()) {
    this.forceBoundsExclusion = true;
    return true;
  }

  return false;
};

Layout.prototype.updateMatrix = function updateMatrix () {
  var bounds = this.computedBounds;

  if (this.isPassive()) {
    this.matrix.identity();
    return;
  }

  if (!this._boundsValid) {
    Layout.updateInnerBounds(this.object);
    Layout.updateOuterBounds(this.object);

    if (this.computedInnerBounds.isEmpty()) {
      this.computedInnerBounds.copy(this.computedOuterBounds);
    }

    this._boundsValid = true;
  }

  var ref = this;
    var absolute = ref.absolute;
    var relative = ref.relative;
    var fitTargets = ref.fitTargets;
    var orientation = ref.orientation;
    var computedInnerBounds = ref.computedInnerBounds;
    var computedOuterBounds = ref.computedOuterBounds;
    var clip = ref.clip; // combine relative and absolute bounds

  bounds.makeEmpty();
  computedOuterBounds.relativeToAbsolute(relative.min, bounds.min);
  computedOuterBounds.relativeToAbsolute(relative.max, bounds.max);
  if (isFinite(absolute.min.x)) { bounds.min.x = (isFinite(bounds.min.x) ? bounds.min.x : 0) + absolute.min.x; }
  if (isFinite(absolute.min.y)) { bounds.min.y = (isFinite(bounds.min.y) ? bounds.min.y : 0) + absolute.min.y; }
  if (isFinite(absolute.min.z)) { bounds.min.z = (isFinite(bounds.min.z) ? bounds.min.z : 0) + absolute.min.z; }
  if (isFinite(absolute.max.x)) { bounds.max.x = (isFinite(bounds.max.x) ? bounds.max.x : 0) + absolute.max.x; }
  if (isFinite(absolute.max.y)) { bounds.max.y = (isFinite(bounds.max.y) ? bounds.max.y : 0) + absolute.max.y; }
  if (isFinite(absolute.max.z)) { bounds.max.z = (isFinite(bounds.max.z) ? bounds.max.z : 0) + absolute.max.z; } // apply clip

  if (!clip.isEmpty()) {
    // const clipMax = vectors.get().copy(clip.max)//.subVectors(clip.max, bounds.max).min(V_000)
    // const clipMin = vectors.get().copy(clip.min)//.subVectors(clip.min, bounds.min).max(V_000)
    var clipMax = computedInnerBounds.absoluteToRelative(clip.max, vectors.get()); //.subVectors(clip.max, bounds.max).min(V_000)

    var clipMin = computedInnerBounds.absoluteToRelative(clip.min, vectors.get()); //.subVectors(clip.min, bounds.min).max(V_000)

    bounds.relativeToAbsolute(clipMax, clipMax); //.subVectors(clip.max, bounds.max).min(V_000)

    bounds.relativeToAbsolute(clipMin, clipMin); //.subVectors(clip.min, bounds.min).max(V_000)

    if (!isFinite(clipMax.x)) { clipMax.x = Infinity; }
    if (!isFinite(clipMax.y)) { clipMax.y = Infinity; }
    if (!isFinite(clipMax.z)) { clipMax.z = Infinity; }
    if (!isFinite(clipMin.x)) { clipMin.x = -Infinity; }
    if (!isFinite(clipMin.y)) { clipMin.y = -Infinity; }
    if (!isFinite(clipMin.z)) { clipMin.z = -Infinity; }
    bounds.max.min(clipMax);
    bounds.min.max(clipMin);
    vectors.pool(clipMax);
    vectors.pool(clipMin);
  } // compute min size


  var minSize = computedOuterBounds.getSize(vectors.get()).multiply(this.minRelativeSize).max(this.minAbsoluteSize); // compute final size

  var innerSize = computedInnerBounds.getSize(vectors.get());
  var layoutScale = bounds.getSize(vectors.get()).max(minSize).divide(innerSize);
  Layout.adjustScaleForFit(fitTargets, layoutScale);
  var finalSize = vectors.get().multiplyVectors(innerSize, layoutScale);
  finalSize.x = Math.abs(finalSize.x);
  finalSize.y = Math.abs(finalSize.y);
  finalSize.z = Math.abs(finalSize.z);

  if (!isFinite(bounds.min.x) && !isFinite(bounds.max.x)) {
    bounds.max.x = finalSize.x / 2;
    bounds.min.x = -bounds.max.x;
  }

  if (!isFinite(bounds.min.y) && !isFinite(bounds.max.y)) {
    bounds.max.y = finalSize.y / 2;
    bounds.min.y = -bounds.max.y;
  }

  if (!isFinite(bounds.min.z) && !isFinite(bounds.max.z)) {
    bounds.max.z = finalSize.z / 2;
    bounds.min.z = -bounds.max.z;
  }

  if (!isFinite(bounds.max.x)) { bounds.max.x = bounds.min.x + finalSize.x; }
  if (!isFinite(bounds.max.y)) { bounds.max.y = bounds.min.y + finalSize.y; }
  if (!isFinite(bounds.max.z)) { bounds.max.z = bounds.min.z + finalSize.z; }
  if (!isFinite(bounds.min.x)) { bounds.min.x = bounds.max.x - finalSize.x; }
  if (!isFinite(bounds.min.y)) { bounds.min.y = bounds.max.y - finalSize.y; }
  if (!isFinite(bounds.min.z)) { bounds.min.z = bounds.max.z - finalSize.z; }
  var orient = matrices.get().makeRotationFromQuaternion(orientation);
  var halfFinalSize = finalSize.divideScalar(2);
  var layoutAlignOffset = bounds.relativeToAbsolute(this.fitAlign, vectors.get());
  bounds.min.copy(layoutAlignOffset).sub(halfFinalSize);
  bounds.max.copy(layoutAlignOffset).add(halfFinalSize);
  bounds.applyMatrix4(orient);
  var innerAlignOffset = computedInnerBounds.relativeToAbsolute(this.fitAlign, vectors.get());
  innerAlignOffset.multiply(layoutScale).applyMatrix4(orient);
  bounds.min.sub(innerAlignOffset);
  bounds.max.sub(innerAlignOffset); // compose layout matrix

  var layoutPosition = bounds.getCenter(vectors.get());
  this.matrix.compose(layoutPosition, orientation, layoutScale); // cleanup

  vectors.pool(innerSize);
  vectors.pool(minSize);
  vectors.pool(finalSize);
  vectors.pool(layoutPosition);
  vectors.pool(layoutScale);
  vectors.pool(layoutAlignOffset); // vectors.pool(innerAlignOffset)
};

Layout.updateInnerBounds = function updateInnerBounds (o) {
  var layout = o.layout;
  var bounds = layout.computedInnerBounds;
  if (layout._boundsValid) { return bounds; }
  bounds.coordinateSystem = o;
  bounds.setFromObject(o).union(layout.inner);
  if (bounds.min.x === bounds.max.x) { bounds.max.x += 1e-10; }
  if (bounds.min.y === bounds.max.y) { bounds.max.y += 1e-10; }
  if (bounds.min.z === bounds.max.z) { bounds.max.z += 1e-10; }
  return bounds;
};

Layout.updateOuterBounds = function updateOuterBounds (o) {
  var layout = o.layout;
  var parentBounds = layout.computedOuterBounds;
  if (layout._boundsValid) { return parentBounds; }
  var parent = o.parent;
  var cameraParent = parent;

  if (cameraParent && cameraParent.isCamera) {
    var position = vectors.get().setFromMatrixPosition(o.matrix);
    var projectionMatrixInverse = matrices.get().getInverse(cameraParent.projectionMatrix);
    var near = parentBounds.min.set(0, 0, -1).applyMatrix4(projectionMatrixInverse).z;
    var projectionZ = parentBounds.min.set(0, 0, position.z).applyMatrix4(cameraParent.projectionMatrix).z;
    parentBounds.min.set(-1, -1, projectionZ);
    parentBounds.max.set(1, 1, projectionZ);
    parentBounds.min.applyMatrix4(projectionMatrixInverse);
    parentBounds.max.applyMatrix4(projectionMatrixInverse);
    parentBounds.min.z = 0;
    parentBounds.max.z = near - position.z;
    vectors.pool(position);
    matrices.pool(projectionMatrixInverse);
  } else if (parent) {
    parentBounds.copy(parent.layout.computedInnerBounds);
  } else {
    parentBounds.makeEmpty();
  }

  var orient = matrices.get().makeRotationFromQuaternion(layout.orientation);
  parentBounds.applyMatrix4(orient.getInverse(orient));
  matrices.pool(orient);
  return parentBounds;
};

Layout.adjustScaleForFit = function adjustScaleForFit (fitTargets, sizeScale) {
  var fitScale = this._fitScale;
  var out = sizeScale;
  var min = 1e-10;
  var max = 1e10;

  if (!isFinite(out.x) && !isFinite(out.y) && !isFinite(out.z)) {
    out.setScalar(1);
    return out;
  }

  if (!isFinite(out.x)) { out.x = max; }
  if (!isFinite(out.y)) { out.y = max; }
  if (!isFinite(out.z)) { out.z = max; }
  out.x = out.x < 0 ? Math$1.clamp(out.x, -max, -min) : Math$1.clamp(out.x, min, max);
  out.y = out.y < 0 ? Math$1.clamp(out.y, -max, -min) : Math$1.clamp(out.y, min, max);
  out.z = out.z < 0 ? Math$1.clamp(out.z, -max, -min) : Math$1.clamp(out.z, min, max);
  var x = out.x;
    var y = out.y;
    var z = out.z;
  var ax = Math.abs(x);
  var ay = Math.abs(y);
  var az = Math.abs(z); // fill3d: allow all dimensions to fill layout size
  // fill (2D): set z to average of x and y


  if (fitTargets.fill) {
    fitScale.set(x, y, x + y / 2);
    out.lerp(fitScale, fitTargets.fill);
  } // contain (2D): set all dimensions to smallest of x or y


  if (fitTargets.contain) {
    if (ax < ay) {
      fitScale.set(x, x, x);
    } else {
      fitScale.set(y, y, y);
    }

    out.lerp(fitScale, fitTargets.contain);
  } // contain3d: set all dimensions to smallest of x or y or z


  if (fitTargets.contain3d) {
    if (ax < ay && ax < az) {
      fitScale.set(x, x, x);
    } else if (ay < ax && ay < az) {
      fitScale.set(y, y, y);
    } else {
      fitScale.set(z, z, z);
    }

    out.lerp(fitScale, fitTargets.contain3d);
  } // cover (2D): set all dimensions to largest of x or y


  if (fitTargets.cover) {
    if (ax > ay) {
      fitScale.set(x, x, x);
    } else {
      fitScale.set(y, y, y);
    }

    out.lerp(fitScale, fitTargets.cover);
  } // cover (3D): set all dimensions to largest of x or y or z


  if (fitTargets.cover3d) {
    if (ax > ay && ax > az) {
      fitScale.set(x, x, x);
    } else if (ay > ax && ay > az) {
      fitScale.set(y, y, y);
    } else {
      fitScale.set(z, z, z);
    }

    out.lerp(fitScale, fitTargets.cover3d);
  } // clamp between 1e-10 and 1e10


  if (!isFinite(out.x)) { out.x = min; }
  if (!isFinite(out.y)) { out.y = min; }
  if (!isFinite(out.z)) { out.z = min; }
  out.x = out.x < 0 ? Math$1.clamp(out.x, -max, -min) : Math$1.clamp(out.x, min, max);
  out.y = out.y < 0 ? Math$1.clamp(out.y, -max, -min) : Math$1.clamp(out.y, min, max);
  out.z = out.z < 0 ? Math$1.clamp(out.z, -max, -min) : Math$1.clamp(out.z, min, max);
  return out;
};

Object.defineProperties( Layout.prototype, prototypeAccessors$1 );
Layout._fitScale = new Vector3(); // function isNaN(a:number) {
//     return a !== a
// }

var DEFAULT_OVERSHOOT_STRENGTH = 1.525;
var reversed = function (easing) {
    return function (p) {
        return 1 - easing(1 - p);
    };
};
var mirrored = function (easing) {
    return function (p) {
        return p <= 0.5 ? easing(2 * p) / 2 : (2 - easing(2 * (1 - p))) / 2;
    };
};
var createReversedEasing = reversed;
var createMirroredEasing = mirrored;
var createExpoIn = function (power) {
    return function (p) {
        return Math.pow(p, power);
    };
};
var createBackIn = function (power) {
    return function (p) {
        return p * p * ((power + 1) * p - power);
    };
};
var createAnticipateEasing = function (power) {
    var backEasing = createBackIn(power);
    return function (p) {
        return (p *= 2) < 1 ? 0.5 * backEasing(p) : 0.5 * (2 - Math.pow(2, -10 * (p - 1)));
    };
};
var linear = function (p) {
    return p;
};
var easeIn = /*#__PURE__*/createExpoIn(2);
var easeOut = /*#__PURE__*/reversed(easeIn);
var easeInOut = /*#__PURE__*/mirrored(easeIn);
var circIn = function (p) {
    return 1 - Math.sin(Math.acos(p));
};
var circOut = /*#__PURE__*/reversed(circIn);
var circInOut = /*#__PURE__*/mirrored(circOut);
var backIn = /*#__PURE__*/createBackIn(DEFAULT_OVERSHOOT_STRENGTH);
var backOut = /*#__PURE__*/reversed(backIn);
var backInOut = /*#__PURE__*/mirrored(backIn);
var anticipate = /*#__PURE__*/createAnticipateEasing(DEFAULT_OVERSHOOT_STRENGTH);
var BOUNCE_FIRST_THRESHOLD = 4.0 / 11.0;
var BOUNCE_SECOND_THRESHOLD = 8.0 / 11.0;
var BOUNCE_THIRD_THRESHOLD = 9.0 / 10.0;
var ca = 4356.0 / 361.0;
var cb = 35442.0 / 1805.0;
var cc = 16061.0 / 1805.0;
var bounceOut = function (p) {
    var p2 = p * p;
    return p < BOUNCE_FIRST_THRESHOLD ? 7.5625 * p2 : p < BOUNCE_SECOND_THRESHOLD ? 9.075 * p2 - 9.9 * p + 3.4 : p < BOUNCE_THIRD_THRESHOLD ? ca * p2 - cb * p + cc : 10.8 * p * p - 20.52 * p + 10.72;
};
var bounceIn = function (p) {
    return 1.0 - bounceOut(1.0 - p);
};
var bounceInOut = function (p) {
    return p < 0.5 ? 0.5 * (1.0 - bounceOut(1.0 - p * 2.0)) : 0.5 * bounceOut(p * 2.0 - 1.0) + 0.5;
};
var NEWTON_ITERATIONS = 8;
var NEWTON_MIN_SLOPE = 0.001;
var SUBDIVISION_PRECISION = 0.0000001;
var SUBDIVISION_MAX_ITERATIONS = 10;
var K_SPLINE_TABLE_SIZE = 11;
var K_SAMPLE_STEP_SIZE = 1.0 / (K_SPLINE_TABLE_SIZE - 1.0);
var FLOAT_32_SUPPORTED = typeof Float32Array !== 'undefined';
var a = function (a1, a2) {
    return 1.0 - 3.0 * a2 + 3.0 * a1;
};
var b = function (a1, a2) {
    return 3.0 * a2 - 6.0 * a1;
};
var c = function (a1) {
    return 3.0 * a1;
};
var getSlope = function (t, a1, a2) {
    return 3.0 * a(a1, a2) * t * t + 2.0 * b(a1, a2) * t + c(a1);
};
var calcBezier = function (t, a1, a2) {
    return ((a(a1, a2) * t + b(a1, a2)) * t + c(a1)) * t;
};
function cubicBezier(mX1, mY1, mX2, mY2) {
    var sampleValues = FLOAT_32_SUPPORTED ? new Float32Array(K_SPLINE_TABLE_SIZE) : new Array(K_SPLINE_TABLE_SIZE);
    var binarySubdivide = function (aX, aA, aB) {
        var i = 0;
        var currentX;
        var currentT;
        do {
            currentT = aA + (aB - aA) / 2.0;
            currentX = calcBezier(currentT, mX1, mX2) - aX;
            if (currentX > 0.0) {
                aB = currentT;
            } else {
                aA = currentT;
            }
        } while (Math.abs(currentX) > SUBDIVISION_PRECISION && ++i < SUBDIVISION_MAX_ITERATIONS);
        return currentT;
    };
    var newtonRaphsonIterate = function (aX, aGuessT) {
        var i = 0;
        var currentSlope = 0;
        var currentX;
        for (; i < NEWTON_ITERATIONS; ++i) {
            currentSlope = getSlope(aGuessT, mX1, mX2);
            if (currentSlope === 0.0) {
                return aGuessT;
            }
            currentX = calcBezier(aGuessT, mX1, mX2) - aX;
            aGuessT -= currentX / currentSlope;
        }
        return aGuessT;
    };
    var calcSampleValues = function () {
        for (var i = 0; i < K_SPLINE_TABLE_SIZE; ++i) {
            sampleValues[i] = calcBezier(i * K_SAMPLE_STEP_SIZE, mX1, mX2);
        }
    };
    var getTForX = function (aX) {
        var intervalStart = 0.0;
        var currentSample = 1;
        var lastSample = K_SPLINE_TABLE_SIZE - 1;
        var dist = 0.0;
        var guessForT = 0.0;
        var initialSlope = 0.0;
        for (; currentSample !== lastSample && sampleValues[currentSample] <= aX; ++currentSample) {
            intervalStart += K_SAMPLE_STEP_SIZE;
        }
        --currentSample;
        dist = (aX - sampleValues[currentSample]) / (sampleValues[currentSample + 1] - sampleValues[currentSample]);
        guessForT = intervalStart + dist * K_SAMPLE_STEP_SIZE;
        initialSlope = getSlope(guessForT, mX1, mX2);
        if (initialSlope >= NEWTON_MIN_SLOPE) {
            return newtonRaphsonIterate(aX, guessForT);
        } else if (initialSlope === 0.0) {
            return guessForT;
        } else {
            return binarySubdivide(aX, intervalStart, intervalStart + K_SAMPLE_STEP_SIZE);
        }
    };
    calcSampleValues();
    var resolver = function (aX) {
        var returnValue;
        if (mX1 === mY1 && mX2 === mY2) {
            returnValue = aX;
        } else if (aX === 0) {
            returnValue = 0;
        } else if (aX === 1) {
            returnValue = 1;
        } else {
            returnValue = calcBezier(getTForX(aX), mY1, mY2);
        }
        return returnValue;
    };
    return resolver;
}

var e = ({
  reversed: reversed,
  mirrored: mirrored,
  createReversedEasing: createReversedEasing,
  createMirroredEasing: createMirroredEasing,
  createExpoIn: createExpoIn,
  createBackIn: createBackIn,
  createAnticipateEasing: createAnticipateEasing,
  linear: linear,
  easeIn: easeIn,
  easeOut: easeOut,
  easeInOut: easeInOut,
  circIn: circIn,
  circOut: circOut,
  circInOut: circInOut,
  backIn: backIn,
  backOut: backOut,
  backInOut: backInOut,
  anticipate: anticipate,
  bounceOut: bounceOut,
  bounceIn: bounceIn,
  bounceInOut: bounceInOut,
  cubicBezier: cubicBezier
});

var easing = e;

function defined() {
  var obj = [], len = arguments.length;
  while ( len-- ) obj[ len ] = arguments[ len ];

  for (var i = 0, list = obj; i < list.length; i += 1) {
    var o = list[i];

    if (typeof o !== 'undefined') { return o; }
  }
}

var TransitionTarget = function TransitionTarget(value, duration, easing) {
  this.value = value;
  this.duration = duration;
  this.easing = easing;
};
var Transitionable = function Transitionable(config) {
  /**
   * A multiplier to influence the speed of the transition
   */
  this.multiplier = undefined;
  /**
   * The duration of the easing function
   */

  this.duration = undefined;
  /**
   * The easing function
   */

  this.easing = undefined;
  /**
   * The percentage that the `target` must differ from the `committedTarget`,
   * the last target added to the `targetQueue`, or the `current` value(inthat order)
   * before it is considered "changed". Depends on `range` being defined.
   */

  this.threshold = undefined;
  /**
   * The number of seconds in which the `target` value must remain "changed" before it
   * becomes the `committedTarget`
   */

  this.delay = undefined;
  /**
   * The number of seconds in which the `committedTarget` must
   * remain stable before it is pushed to the `targetQueue`
   */

  this.debounce = undefined;
  /**
   * The maximum number of seconds to wait before the `committedTarget`
   * is pushed to the `targetQueue`
   */

  this.maxWait = undefined;
  /**
   * The queue of committed target values that are still influencing the current value
   * (whose durations have not yet been exceeded)
   */

  this.targetQueue = [];
  this._delayTime = 0;
  this._debounceTime = 0;
  this._waitTime = 0;
  this._changePercent = 0;
  this._config = {};
  Object.assign(this, config);
  var t = this.target;
  if (typeof this.current === 'undefined') { this.current = typeof t === 'number' ? t : t.clone(); }
  if (typeof this.start === 'undefined') { this.start = typeof t === 'number' ? t : t.clone(); }
};
/**
 *
 */


Transitionable.prototype.update = function update (deltaTime, c, changePercent) {
  var config = this._updateConfig(c);

  var queue = this.targetQueue;
  var target = this.target;
  this._changePercent = changePercent = typeof changePercent === 'number' ? changePercent : this._computePercentChange();
  deltaTime *= config.multiplier;

  if (changePercent >= config.threshold) {
    if (this._delayTime > config.delay) {
      if (typeof target === 'number') { this.committedTarget = target; }else {
        if (this.committedTarget) { this.committedTarget.copy(target); }else { this.committedTarget = target.clone(); }
      }
      this._delayTime = 0;
      this._debounceTime = 0;
    }

    this._delayTime += deltaTime;
  } else {
    if (typeof this.committedTarget !== 'undefined') { this._delayTime = 0; }
    this._debounceTime += deltaTime;
  }

  if (typeof this.committedTarget !== 'undefined') {
    this._waitTime += deltaTime;

    if (this._debounceTime >= config.debounce || this._waitTime >= config.maxWait) {
      queue.push({
        value: this.committedTarget,
        easing: config.easing,
        duration: config.duration,
        elapsed: 0
      });
      this.committedTarget = undefined;
      this._waitTime = 0;
    }
  }

  while (queue.length && queue[0].elapsed >= queue[0].duration) {
    this.start = queue.shift().value;
  }

  this._setCurrent(this.start);

  var previousTarget = this.start;

  for (var i = 0, list = queue; i < list.length; i += 1) {
    var t = list[i];

      t.elapsed += deltaTime;

    this._addTargetInfluence(previousTarget, t);

    previousTarget = t.value;
  }
};

Transitionable.prototype._addTargetInfluence = function _addTargetInfluence (start, target) {
  var alpha = target.duration > 0 ? target.easing(Math.min(target.elapsed, target.duration) / target.duration) : 1;

  if (typeof target.value !== 'number' && 'isMatrix4' in target.value) {
    var c = this.current;
    var s = start;
    var e = target.value;
    var pos = vectors.get();
    var quat = quaternions.get();
    var scale = vectors.get();
    c.decompose(pos, quat, scale);
    var sPos = vectors.get();
    var sQuat = quaternions.get();
    var sScale = vectors.get();
    s.decompose(sPos, sQuat, sScale);
    var tPos = vectors.get();
    var tQuat = quaternions.get();
    var tScale = vectors.get();
    e.decompose(tPos, tQuat, tScale);
    pos.add(tPos.sub(sPos).lerp(V_000, 1 - alpha));
    quat.multiply(sQuat.inverse().multiply(tQuat).slerp(Q_IDENTITY, 1 - alpha)).normalize();
    scale.add(tScale.sub(sScale).lerp(V_000, 1 - alpha));
    vectors.pool(pos);
    quaternions.pool(quat);
    vectors.pool(scale);
    vectors.pool(sPos);
    quaternions.pool(sQuat);
    vectors.pool(sScale);
    vectors.pool(tPos);
    quaternions.pool(tQuat);
    vectors.pool(tScale);
    return;
  }

  if (typeof target.value === 'number') {
    this.current += Math$1.lerp(0, target.value - start, alpha);
    return;
  }

  if ('isVector3' in target.value) {
    var c$1 = this.current;
    var s$1 = start;
    var e$1 = target.value;
    var amount = vectors.get().copy(e$1).sub(s$1).lerp(V_000, 1 - alpha);
    c$1.add(amount);
    vectors.pool(amount);
    return;
  }

  if ('isVector2' in target.value) {
    var c$2 = this.current;
    var s$2 = start;
    var e$2 = target.value;
    var amount$1 = vectors2.get().copy(e$2).sub(s$2).lerp(V_00, 1 - alpha);
    c$2.add(amount$1);
    vectors2.pool(amount$1);
    return;
  }

  if ('isQuaternion' in target.value) {
    var c$3 = this.current;
    var s$3 = start;
    var e$3 = target.value;
    var amount$2 = quaternions.get().copy(s$3).inverse().multiply(e$3).slerp(Q_IDENTITY, 1 - alpha);
    c$3.multiply(amount$2).normalize();
    quaternions.pool(amount$2);
    return;
  }

  if ('isColor' in target.value) {
    var c$4 = this.current;
    var s$4 = start;
    var e$4 = target.value;

    var amount$3 = Transitionable._c.copy(e$4).sub(s$4).lerp(Transitionable._cBlack, 1 - alpha);

    c$4.add(amount$3);
    return;
  }

  if ('isBox3' in target.value) {
    var c$5 = this.current;
    var s$5 = start;
    var e$5 = target.value;
    var minAmount = vectors.get().copy(e$5.min).sub(s$5.min).lerp(V_000, 1 - alpha);
    var maxAmount = vectors.get().copy(e$5.max).sub(s$5.max).lerp(V_000, 1 - alpha);
    if (isFinite(c$5.min.x)) { c$5.min.x = 0; }
    if (isFinite(c$5.min.y)) { c$5.min.y = 0; }
    if (isFinite(c$5.min.z)) { c$5.min.z = 0; }
    if (isFinite(c$5.max.x)) { c$5.max.x = 0; }
    if (isFinite(c$5.max.y)) { c$5.max.y = 0; }
    if (isFinite(c$5.max.z)) { c$5.max.z = 0; }
    c$5.min.add(minAmount);
    c$5.max.add(maxAmount);
    return;
  }
};

Transitionable.prototype._setCurrent = function _setCurrent (value) {
  if (typeof value === 'number') {
    this.current = value;
  } else {
    this.current.copy(value);
  }
};

Transitionable.prototype._computePercentChange = function _computePercentChange () {
  var end = this.target;
  var start = this.committedTarget || this.targetQueue[0] && this.targetQueue[0].value || this.current;

  if (typeof start === 'number') {
    var s = start;
    var e = end;
    return Math.abs(e - s / (this.range || 1));
  }

  if ('isMatrix4' in start) {
    var s$1 = start;
    var e$1 = end;
    var sPos = vectors.get();
    var sQuat = quaternions.get();
    var sScale = vectors.get();
    s$1.decompose(sPos, sQuat, sScale);
    var ePos = vectors.get();
    var eQuat = quaternions.get();
    var eScale = vectors.get();
    e$1.decompose(ePos, eQuat, eScale);
    var posPercent = sPos.equals(ePos) ? 0 : Infinity;
    var quatPercent = Math.abs(sQuat.angleTo(eQuat) / Math.PI);
    var scalePercent = sScale.equals(eScale) ? 0 : Infinity;
    vectors.pool(sPos);
    quaternions.pool(sQuat);
    vectors.pool(sScale);
    vectors.pool(ePos);
    quaternions.pool(eQuat);
    vectors.pool(eScale);
    return Math.max(posPercent, quatPercent, scalePercent);
  }

  if ('isVector3' in start) {
    var s$2 = start;
    var e$2 = end;
    if (!this.range) { return e$2.equals(s$2) ? 0 : Infinity; }
    var percent = vectors.get().subVectors(e$2, s$2).divide(this.range);
    var x = percent.x;
      var y = percent.y;
      var z = percent.z;
    vectors.pool(percent);
    return Math.max(Math.abs(x || 0), Math.abs(y || 0), Math.abs(z || 0));
  }

  if ('isVector2' in start) {
    var s$3 = start;
    var e$3 = end;
    if (!this.range) { return e$3.equals(s$3) ? 0 : Infinity; }
    var percent$1 = vectors2.get().subVectors(e$3, s$3).divide(this.range);
    var ref = percent$1;
      var x$1 = ref.x;
      var y$1 = ref.y;
    vectors2.pool(percent$1);
    return Math.max(Math.abs(x$1 || 0), Math.abs(y$1 || 0));
  }

  if ('isQuaternion' in start) {
    var s$4 = start;
    var e$4 = end;
    return Math.abs(s$4.angleTo(e$4) / Math.PI);
  }

  if ('isColor' in start) {
    var s$5 = start;
    var e$5 = end;
    return Math.max(Math.abs(e$5.r - s$5.r), Math.abs(e$5.g - s$5.r), Math.abs(e$5.b - s$5.r));
  }

  if ('isBox3' in start) {
    var s$6 = start;
    var e$6 = end;
    if (!this.range) { return e$6.equals(s$6) ? 0 : Infinity; }
    var size = this.range;
    var minPercent = vectors.get().subVectors(e$6.min, s$6.min).divide(size);
    var maxPercent = vectors.get().subVectors(e$6.max, s$6.max).divide(size);
    var min = Math.max(Math.abs(minPercent.x || 0), Math.abs(minPercent.y || 0), Math.abs(minPercent.z || 0));
    var max = Math.max(Math.abs(maxPercent.x || 0), Math.abs(maxPercent.y || 0), Math.abs(maxPercent.z || 0));
    vectors.pool(minPercent);
    vectors.pool(maxPercent);
    return Math.max(min, max);
  }

  return Infinity;
};

Transitionable.prototype._updateConfig = function _updateConfig (c) {
  this._config.multiplier = defined(this.multiplier, c && c.multiplier, Transitioner.DEFAULT_CONFIG.multiplier);
  this._config.duration = defined(this.duration, c && c.duration, Transitioner.DEFAULT_CONFIG.duration);
  this._config.easing = defined(this.easing, c && c.easing, Transitioner.DEFAULT_CONFIG.easing);
  this._config.threshold = defined(this.threshold, c && c.threshold, Transitioner.DEFAULT_CONFIG.threshold);
  this._config.delay = defined(this.delay, c && c.delay, Transitioner.DEFAULT_CONFIG.delay);
  this._config.debounce = defined(this.debounce, c && c.debounce, Transitioner.DEFAULT_CONFIG.debounce);
  this._config.maxWait = defined(this.maxWait, c && c.maxWait, Transitioner.DEFAULT_CONFIG.maxWait);
  return this._config;
};
Transitionable._c = new Color();
Transitionable._cBlack = new Color(0, 0, 0);
var LocalMatrixTransitionable = /*@__PURE__*/(function (Transitionable) {
  function LocalMatrixTransitionable(object) {
    Transitionable.call(this, {
      target: new Matrix4()
    });
    this.object = object;
    this.position = new Transitionable({
      target: new Vector3()
    });
    this.quaternion = new Transitionable({
      target: new Quaternion()
    });
    this.scale = new Transitionable({
      target: new Vector3(1, 1, 1)
    });
    this.autoRange = true;
    this.synchronizeComponents = true;
  }

  if ( Transitionable ) LocalMatrixTransitionable.__proto__ = Transitionable;
  LocalMatrixTransitionable.prototype = Object.create( Transitionable && Transitionable.prototype );
  LocalMatrixTransitionable.prototype.constructor = LocalMatrixTransitionable;

  LocalMatrixTransitionable.prototype.update = function update (deltaTime, c) {
    this._updateConfig(c);

    var ref = this;
    var position = ref.position;
    var quaternion = ref.quaternion;
    var scale = ref.scale;
    var _config = ref._config;

    if (this.autoRange) {
      if (!position.range) { position.range = new Vector3(); }
      if (!scale.range) { scale.range = new Vector3(); }
      this.object.layout.computedOuterBounds.getSize(position.range);
      this.object.layout.computedOuterBounds.getSize(scale.range).divide(position.range);
      if (!isFinite(scale.range.x) || scale.range.x === 0) { scale.range.x = 1; }
      if (!isFinite(scale.range.y) || scale.range.y === 0) { scale.range.y = 1; }
      if (!isFinite(scale.range.z) || scale.range.z === 0) { scale.range.z = 1; }
    }

    this.target.decompose(position.target, quaternion.target, scale.target);
    this.current.decompose(position.current, quaternion.current, scale.current);
    var changePercent = undefined;

    if (this.synchronizeComponents) {
      changePercent = Math.max(position._computePercentChange(), quaternion._computePercentChange(), scale._computePercentChange());
    }

    position.update(deltaTime, _config, changePercent);
    quaternion.update(deltaTime, _config, changePercent);
    scale.update(deltaTime, _config, changePercent);
    this.current.compose(position.current, quaternion.current, scale.current);
  };

  return LocalMatrixTransitionable;
}(Transitionable));
/**
 * Enables smooth interpolation of various kinds of values, with hysteresis
 */

var Transitioner = function Transitioner(object) {
  this.object = object;
  this._active = false;
  /**
   * Specifies the desired parent coordinate system.
   */

  this.parentTarget = null;
  /**
   * The target world matrix, automatically computed from pose/layout properties
   */

  this.matrixWorldTarget = new Matrix4();
  /**
   * A multiplier to influence the speed of the transition
   */

  this.multiplier = undefined;
  /**
   * The duration of the easing function
   */

  this.duration = undefined;
  /**
   * The easing function
   */

  this.easing = undefined;
  /**
   * The percentage that the `target` must differ from the `committedTarget`,
   * the last target added to the `targetQueue`, or the `current` value(inthat order)
   * before it is considered "changed"
   */

  this.threshold = undefined;
  /**
   * The number of seconds in which the `target` value must remain "changed" before it
   * becomes the `committedTarget`
   */

  this.delay = undefined;
  /**
   * The number of seconds in which the `committedTarget` must
   * remain stable before it is pushed to the `targetQueue`
   */

  this.debounce = undefined;
  /**
   * The maximum number of seconds to wait before the `committedTarget`
   * is pushed to the `targetQueue`
   */

  this.maxWait = undefined;
  /**
   *
   */

  this.customTransitionables = [];
  this.matrixLocal = new LocalMatrixTransitionable(this.object);
};

var prototypeAccessors$2 = { active: { configurable: true } };
/**
 *
 */


prototypeAccessors$2.active.set = function (active) {
  this._active = active;
};

prototypeAccessors$2.active.get = function () {
  return this._active && !Transitioner.disableAllTransitions;
};
/**
 * Add a transitionable
 * @param transitionable
 */


Transitioner.prototype.add = function add (transitionable) {
  var t = transitionable instanceof Transitionable ? transitionable : new Transitionable(transitionable);
  this.customTransitionables.push(t);
  return t;
};
/**
 * Transitions pose, layout, and/or custom properties associated with an Object3D instance.
 *
 * When the transitioner is active, the object's pose (`position`, `quaternion`, and `scale`)
 * and layout (`layout.absolute`, `layout.relative`, etc.) properties are treated as
 * target values, and their corresponding target matrices are maintained in the transitioner
 * instance (e.g., `transitioner.matrix`, `transitioner.layoutMatrix`). Meanwhile, the object's
 * pose/layout matrices (`matrix` and `layout.matrix`) will only be updated when this `update`
 * method is called).
 *
 * If `targetParent` is set and differs from the current `object.parent`,
 * this method will smoothly switch to the new coordinate system.
 */


Transitioner.prototype.update = function update (deltaTime, autoActive) {
    if ( autoActive === void 0 ) autoActive = true;

  if (!this.active && autoActive) { this.active = true; }

  if (!this.active) {
    this.matrixLocal.current.copy(this.matrixLocal.target);

    for (var i = 0, list = this.customTransitionables; i < list.length; i += 1) {
      var t = list[i];

        t._setCurrent(t.target);

      this._setPropertyAtPath(t);
    }

    return;
  } // refresh matrix targets if necessary


  if (autoActive) { this.object.updateWorldMatrix(true, true); }

  this._setParent(); // update transitionables


  deltaTime = Math.max(deltaTime, 1e-10); // in case multiplier is Infinity

  this.matrixLocal.update(deltaTime, this);

  for (var i$1 = 0, list$1 = this.customTransitionables; i$1 < list$1.length; i$1 += 1) {
    var t$1 = list$1[i$1];

      t$1.update(deltaTime, this);

    this._setPropertyAtPath(t$1);
  }

  this.object.updateWorldMatrix(false, true);
};

Transitioner.prototype._setPropertyAtPath = function _setPropertyAtPath (t) {
  if (t.path) {
    if (typeof t.current === 'number') {
      set(t.path, this.object, t.current);
    } else {
      resolve(t.path, this.object).copy(t.current);
    }
  }
};
/**
 * Ensure that this `object` is attached to the `targetParent` Object3D instance.
 * When the `transitioner` is active, this method ensures a smooth transition
 * to another coordinate system. If the `object` is already attached to the
 * `targetParent`, this method is effectively noop.
 */


Transitioner.prototype._setParent = function _setParent () {
  var parent = this.parentTarget;
  var o = this.object;
  if (!parent) { return; }

  if (o.parent !== parent) {
    o.updateWorldMatrix(true, true);
    var originalMatrixWorld = matrices.get().copy(o.matrixWorld);
    o.parent && o.parent.remove(o);
    parent && parent.add(o);
    parent.updateWorldMatrix(true, true);
    var inverseParentMatrixWorld = parent ? matrices.get().getInverse(parent.matrixWorld) : matrices.get().identity();
    o.matrix.copy(inverseParentMatrixWorld.multiply(originalMatrixWorld)); // const transitioner = o.layout.transitioner
    // if (transitioner.active) {
    //   transitioner.layout.weight = 0
    //   o.matrix.decompose(transitioner.position, transitioner.quaternion, transitioner.scale)
    // } else {
    // }

    o.matrix.decompose(o.position, o.quaternion, o.scale);
    matrices.pool(originalMatrixWorld);
    matrices.pool(inverseParentMatrixWorld);
  }
};

Object.defineProperties( Transitioner.prototype, prototypeAccessors$2 );
Transitioner.disableAllTransitions = false;
Transitioner.DEFAULT_CONFIG = {
  multiplier: 1,
  duration: 1.5,
  easing: easing.easeInOut,
  threshold: 1e-2,
  delay: 0,
  debounce: 0,
  maxWait: 4
};
/**
 * The amount of time (in milliseconds) it takes to smoothly
 * damp towards the target.
 *
 * By defualt, based on a progress threshold of 0.96
 *
 * progress = 1 - Math.exp(-time)
 * time = - Math.log(1-progress)
 */

Transitioner.NATURAL_DURATION = -Math.log(1 - 0.95);

var next$1 = function (prev, curr) { return prev && prev[curr]; };

function resolve(path, obj, separator) {
  if ( obj === void 0 ) obj = self;
  if ( separator === void 0 ) separator = '.';

  var properties = Array.isArray(path) ? path : path.split(separator);
  return properties.reduce(next$1, obj);
}

function set(path, obj, value, separator) {
  if ( obj === void 0 ) obj = self;
  if ( separator === void 0 ) separator = '.';

  var properties = Array.isArray(path) ? path : path.split(separator);
  var lastPropertKey = properties.pop();
  var property = properties.reduce(next$1, obj);
  property[lastPropertKey] = value;
}

// Ripped and modified From THREE.js Mesh raycast
// https://github.com/mrdoob/three.js/blob/0aa87c999fe61e216c1133fba7a95772b503eddf/src/objects/Mesh.js#L115
var vA = new Vector3();
var vB = new Vector3();
var vC = new Vector3();

var uvA = new Vector2();
var uvB = new Vector2();
var uvC = new Vector2();

var intersectionPoint = new Vector3();
var intersectionPointWorld = new Vector3();

function checkIntersection( object, material, raycaster, ray, pA, pB, pC, point ) {

	var intersect;
	if ( material.side === BackSide ) {

		intersect = ray.intersectTriangle( pC, pB, pA, true, point );

	} else {

		intersect = ray.intersectTriangle( pA, pB, pC, material.side !== DoubleSide, point );

	}

	if ( intersect === null ) return null;

	intersectionPointWorld.copy( point );
	intersectionPointWorld.applyMatrix4( object.matrixWorld );

	var distance = raycaster.ray.origin.distanceTo( intersectionPointWorld );

	if ( distance < raycaster.near || distance > raycaster.far ) return null;

	return {
		distance: distance,
		point: intersectionPointWorld.clone(),
		object: object
	};

}

function checkBufferGeometryIntersection( object, raycaster, ray, position, uv, a, b, c ) {

	vA.fromBufferAttribute( position, a );
	vB.fromBufferAttribute( position, b );
	vC.fromBufferAttribute( position, c );

	var intersection = checkIntersection( object, object.material, raycaster, ray, vA, vB, vC, intersectionPoint );

	if ( intersection ) {

		if ( uv ) {

			uvA.fromBufferAttribute( uv, a );
			uvB.fromBufferAttribute( uv, b );
			uvC.fromBufferAttribute( uv, c );

			intersection.uv = Triangle.getUV( intersectionPoint, vA, vB, vC, uvA, uvB, uvC, new Vector2( ) );

		}

		var normal = new Vector3();
		intersection.face = new Face3( a, b, c, Triangle.getNormal( vA, vB, vC, normal ) );
		intersection.faceIndex = a;

	}

	return intersection;

}


// https://github.com/mrdoob/three.js/blob/0aa87c999fe61e216c1133fba7a95772b503eddf/src/objects/Mesh.js#L258
function intersectTri( mesh, geo, raycaster, ray, tri, intersections ) {

	const triOffset = tri * 3;
	const a = geo.index.getX( triOffset );
	const b = geo.index.getX( triOffset + 1 );
	const c = geo.index.getX( triOffset + 2 );

	const intersection = checkBufferGeometryIntersection( mesh, raycaster, ray, geo.attributes.position, geo.attributes.uv, a, b, c );

	if ( intersection ) {

		intersection.faceIndex = tri;
		if ( intersections ) intersections.push( intersection );
		return intersection;

	}

	return null;

}

function intersectTris( mesh, geo, raycaster, ray, offset, count, intersections ) {

	for ( let i = offset, end = offset + count; i < end; i ++ ) {

		intersectTri( mesh, geo, raycaster, ray, i, intersections );

	}

}
function intersectClosestTri( mesh, geo, raycaster, ray, offset, count ) {

	let dist = Infinity;
	let res = null;
	for ( let i = offset, end = offset + count; i < end; i ++ ) {

		const intersection = intersectTri( mesh, geo, raycaster, ray, i );
		if ( intersection && intersection.distance < dist ) {

			res = intersection;
			dist = intersection.distance;

		}

	}

	return res;

}

// Returns a Float32Array representing the bounds data for box.
function boxToArray( bx ) {

	const arr = new Float32Array( 6 );

	arr[ 0 ] = bx.min.x;
	arr[ 1 ] = bx.min.y;
	arr[ 2 ] = bx.min.z;

	arr[ 3 ] = bx.max.x;
	arr[ 4 ] = bx.max.y;
	arr[ 5 ] = bx.max.z;

	return arr;

}

function arrayToBox( arr, target ) {

	target.min.x = arr[ 0 ];
	target.min.y = arr[ 1 ];
	target.min.z = arr[ 2 ];

	target.max.x = arr[ 3 ];
	target.max.y = arr[ 4 ];
	target.max.z = arr[ 5 ];

	return target;

}

function getLongestEdgeIndex( bounds ) {

	let splitDimIdx = - 1;
	let splitDist = - Infinity;

	for ( let i = 0; i < 3; i ++ ) {

		const dist = bounds[ i + 3 ] - bounds[ i ];
		if ( dist > splitDist ) {

			splitDist = dist;
			splitDimIdx = i;

		}

	}

	return splitDimIdx;

}

class SeparatingAxisBounds {

	constructor() {

		this.min = Infinity;
		this.max = - Infinity;

	}

	setFromPointsField( points, field ) {

		let min = Infinity;
		let max = - Infinity;
		for ( let i = 0, l = points.length; i < l; i ++ ) {

			const p = points[ i ];
			const val = p[ field ];
			min = Math.min( val, min );
			max = Math.max( val, max );

		}

		this.min = min;
		this.max = max;


	}

	setFromPoints( axis, points ) {

		let min = Infinity;
		let max = - Infinity;
		for ( let i = 0, l = points.length; i < l; i ++ ) {

			const p = points[ i ];
			const val = axis.dot( p );
			min = Math.min( val, min );
			max = Math.max( val, max );

		}

		this.min = min;
		this.max = max;

	}

	isSeparated( other ) {

		return this.min > other.max || other.min > this.max;

	}

}

SeparatingAxisBounds.prototype.setFromBox = ( function () {

	const p = new Vector3();
	return function setFromBox( axis, box ) {

		const boxMin = box.min;
		const boxMax = box.max;
		let min = Infinity;
		let max = - Infinity;
		for ( let x = 0; x <= 1; x ++ ) {

			for ( let y = 0; y <= 1; y ++ ) {

				for ( let z = 0; z <= 1; z ++ ) {

					p.x = boxMin.x * x + boxMax.x * ( 1 - x );
					p.y = boxMin.y * y + boxMax.y * ( 1 - y );
					p.z = boxMin.z * z + boxMax.z * ( 1 - z );

					const val = axis.dot( p );
					min = Math.min( val, min );
					max = Math.max( val, max );

				}

			}

		}

		this.min = min;
		this.max = max;

	};

} )();

const closestPointLineToLine = ( function () {

	// https://github.com/juj/MathGeoLib/blob/master/src/Geometry/Line.cpp#L56
	const dir1 = new Vector3();
	const dir2 = new Vector3();
	const v02 = new Vector3();
	return function closestPointLineToLine( l1, l2, result ) {

		const v0 = l1.start;
		const v10 = dir1;
		const v2 = l2.start;
		const v32 = dir2;

		v02.subVectors( v0, v2 );
		dir1.subVectors( l1.end, l2.start );
		dir2.subVectors( l2.end, l2.start );

		// float d0232 = v02.Dot(v32);
		const d0232 = v02.dot( v32 );

		// float d3210 = v32.Dot(v10);
		const d3210 = v32.dot( v10 );

		// float d3232 = v32.Dot(v32);
		const d3232 = v32.dot( v32 );

		// float d0210 = v02.Dot(v10);
		const d0210 = v02.dot( v10 );

		// float d1010 = v10.Dot(v10);
		const d1010 = v10.dot( v10 );

		// float denom = d1010*d3232 - d3210*d3210;
		const denom = d1010 * d3232 - d3210 * d3210;

		let d, d2;
		if ( denom !== 0 ) {

			d = ( d0232 * d3210 - d0210 * d3232 ) / denom;

		} else {

			d = 0;

		}

		d2 = ( d0232 + d * d3210 ) / d3232;

		result.x = d;
		result.y = d2;

	};

} )();

const closestPointsSegmentToSegment = ( function () {

	// https://github.com/juj/MathGeoLib/blob/master/src/Geometry/LineSegment.cpp#L187
	const paramResult = new Vector2();
	const temp1 = new Vector3();
	const temp2 = new Vector3();
	return function closestPointsSegmentToSegment( l1, l2, target1, target2 ) {

		closestPointLineToLine( l1, l2, paramResult );

		let d = paramResult.x;
		let d2 = paramResult.y;
		if ( d >= 0 && d <= 1 && d2 >= 0 && d2 <= 1 ) {

			l1.at( d, target1 );
			l2.at( d2, target2 );

			return;

		} else if ( d >= 0 && d <= 1 ) {

			// Only d2 is out of bounds.
			if ( d2 < 0 ) {

				l2.at( 0, target2 );

			} else {

				l2.at( 1, target2 );

			}

			l1.closestPointToPoint( target2, true, target1 );
			return;

		} else if ( d2 >= 0 && d2 <= 1 ) {

			// Only d is out of bounds.
			if ( d < 0 ) {

				l1.at( 0, target1 );

			} else {

				l1.at( 1, target1 );

			}

			l2.closestPointToPoint( target1, true, target2 );
			return;

		} else {

			// Both u and u2 are out of bounds.
			let p;
			if ( d < 0 ) {

				p = l1.start;

			} else {

				p = l1.end;

			}

			let p2;
			if ( d2 < 0 ) {

				p2 = l2.start;

			} else {

				p2 = l2.end;

			}

			const closestPoint = temp1;
			const closestPoint2 = temp2;
			l1.closestPointToPoint( p2, true, temp1 );
			l2.closestPointToPoint( p, true, temp2 );

			if ( closestPoint.distanceToSquared( p2 ) <= closestPoint2.distanceToSquared( p ) ) {

				target1.copy( closestPoint );
				target2.copy( p2 );
				return;

			} else {

				target1.copy( p );
				target2.copy( closestPoint2 );
				return;

			}

		}

	};

} )();


const sphereIntersectTriangle = ( function () {

	// https://stackoverflow.com/questions/34043955/detect-collision-between-sphere-and-triangle-in-three-js
	const closestPointTemp = new Vector3();
	const projectedPointTemp = new Vector3();
	const planeTemp = new Plane();
	const lineTemp = new Line3();
	return function sphereIntersectTriangle( sphere, triangle ) {

		const { radius, center } = sphere;
		const { a, b, c } = triangle;

		// phase 1
		lineTemp.start = a;
		lineTemp.end = b;
		const closestPoint1 = lineTemp.closestPointToPoint( center, true, closestPointTemp );
		if ( closestPoint1.distanceTo( center ) <= radius ) return true;

		lineTemp.start = a;
		lineTemp.end = c;
		const closestPoint2 = lineTemp.closestPointToPoint( center, true, closestPointTemp );
		if ( closestPoint2.distanceTo( center ) <= radius ) return true;

		lineTemp.start = b;
		lineTemp.end = c;
		const closestPoint3 = lineTemp.closestPointToPoint( center, true, closestPointTemp );
		if ( closestPoint3.distanceTo( center ) <= radius ) return true;

		// phase 2
		const plane = triangle.getPlane( planeTemp );
		const dp = Math.abs( plane.distanceToPoint( center ) );
		if ( dp <= radius ) {

			const pp = plane.projectPoint( center, projectedPointTemp );
			const cp = triangle.containsPoint( pp );
			if ( cp ) return true;

		}

		return false;

	};

} )();

class SeparatingAxisTriangle extends Triangle {

	constructor( ...args ) {

		super( ...args );

		this.isSeparatingAxisTriangle = true;
		this.satAxes = new Array( 4 ).fill().map( () => new Vector3() );
		this.satBounds = new Array( 4 ).fill().map( () => new SeparatingAxisBounds() );
		this.points = [ this.a, this.b, this.c ];
		this.sphere = new Sphere();

	}

}

SeparatingAxisTriangle.prototype.update = ( function () {

	const arr = new Array( 3 );
	return function update( ) {

		const a = this.a;
		const b = this.b;
		const c = this.c;

		arr[ 0 ] = this.a;
		arr[ 1 ] = this.b;
		arr[ 2 ] = this.c;

		const satAxes = this.satAxes;
		const satBounds = this.satBounds;

		const axis0 = satAxes[ 0 ];
		const sab0 = satBounds[ 0 ];
		this.getNormal( axis0 );
		sab0.setFromPoints( axis0, arr );

		const axis1 = satAxes[ 1 ];
		const sab1 = satBounds[ 1 ];
		axis1.subVectors( a, b );
		sab1.setFromPoints( axis1, arr );

		const axis2 = satAxes[ 2 ];
		const sab2 = satBounds[ 2 ];
		axis2.subVectors( b, c );
		sab2.setFromPoints( axis2, arr );

		const axis3 = satAxes[ 3 ];
		const sab3 = satBounds[ 3 ];
		axis3.subVectors( c, a );
		sab3.setFromPoints( axis3, arr );

		this.sphere.setFromPoints( this.points );

	};

} )();

SeparatingAxisTriangle.prototype.intersectsTriangle = ( function () {

	const saTri2 = new SeparatingAxisTriangle();
	const arr1 = new Array( 3 );
	const arr2 = new Array( 3 );
	const cachedSatBounds = new SeparatingAxisBounds();
	const cachedSatBounds2 = new SeparatingAxisBounds();
	const cachedAxis = new Vector3();
	return function intersectsTriangle( other ) {

		if ( ! other.isSeparatingAxisTriangle ) {

			saTri2.copy( other );
			saTri2.update();
			other = saTri2;

		}

		const satBounds1 = this.satBounds;
		const satAxes1 = this.satAxes;
		arr2[ 0 ] = other.a;
		arr2[ 1 ] = other.b;
		arr2[ 2 ] = other.c;
		for ( let i = 0; i < 4; i ++ ) {

			const sb = satBounds1[ i ];
			const sa = satAxes1[ i ];
			cachedSatBounds.setFromPoints( sa, arr2 );
			if ( sb.isSeparated( cachedSatBounds ) ) return false;

		}

		const satBounds2 = other.satBounds;
		const satAxes2 = other.satAxes;
		arr1[ 0 ] = this.a;
		arr1[ 1 ] = this.b;
		arr1[ 2 ] = this.c;
		for ( let i = 0; i < 4; i ++ ) {

			const sb = satBounds2[ i ];
			const sa = satAxes2[ i ];
			cachedSatBounds.setFromPoints( sa, arr1 );
			if ( sb.isSeparated( cachedSatBounds ) ) return false;

		}

		// check crossed axes
		for ( let i = 0; i < 4; i ++ ) {

			const sa1 = satAxes1[ i ];
			for ( let i2 = 0; i2 < 4; i2 ++ ) {

				const sa2 = satAxes2[ i2 ];
				cachedAxis.crossVectors( sa1, sa2 );
				cachedSatBounds.setFromPoints( cachedAxis, arr1 );
				cachedSatBounds2.setFromPoints( cachedAxis, arr2 );
				if ( cachedSatBounds.isSeparated( cachedSatBounds2 ) ) return false;

			}

		}

		return true;

	};

} )();


SeparatingAxisTriangle.prototype.distanceToPoint = ( function () {

	const target = new Vector3();
	return function distanceToPoint( point ) {

		this.closestPointToPoint( point, target );
		return point.distanceTo( target );

	};

} )();


SeparatingAxisTriangle.prototype.distanceToTriangle = ( function () {

	const point = new Vector3();
	const point2 = new Vector3();
	const cornerFields = [ 'a', 'b', 'c' ];
	const line1 = new Line3();
	const line2 = new Line3();

	return function distanceToTriangle( other, target1 = null, target2 = null ) {

		if ( this.intersectsTriangle( other ) ) {

			// TODO: This will not result in a point that lies on
			// the intersection line of the triangles
			if ( target1 || target2 ) {

				this.getMidpoint( point );
				other.closestPointToPoint( point, point2 );
				this.closestPointToPoint( point2, point );

				if ( target1 ) target1.copy( point );
				if ( target2 ) target2.copy( point2 );

			}

			return 0;

		}

		let closestDistanceSq = Infinity;

		// check all point distances
		for ( let i = 0; i < 3; i ++ ) {

			let dist;
			const field = cornerFields[ i ];
			const otherVec = other[ field ];
			this.closestPointToPoint( otherVec, point );

			dist = otherVec.distanceToSquared( point );

			if ( dist < closestDistanceSq ) {

				closestDistanceSq = dist;
				if ( target1 ) target1.copy( point );
				if ( target2 ) target2.copy( otherVec );

			}


			const thisVec = this[ field ];
			other.closestPointToPoint( thisVec, point );

			dist = thisVec.distanceToSquared( point );

			if ( dist < closestDistanceSq ) {

				closestDistanceSq = dist;
				if ( target1 ) target1.copy( thisVec );
				if ( target2 ) target2.copy( point );

			}

		}

		for ( let i = 0; i < 3; i ++ ) {

			const f11 = cornerFields[ i ];
			const f12 = cornerFields[ ( i + 1 ) % 3 ];
			line1.set( this[ f11 ], this[ f12 ] );
			for ( let i2 = 0; i2 < 3; i2 ++ ) {

				const f21 = cornerFields[ i2 ];
				const f22 = cornerFields[ ( i2 + 1 ) % 3 ];
				line2.set( other[ f21 ], other[ f22 ] );

				closestPointsSegmentToSegment( line1, line2, point, point2 );

				const dist = point.distanceToSquared( point2 );
				if ( dist < closestDistanceSq ) {

					closestDistanceSq = dist;
					if ( target1 ) target1.copy( point );
					if ( target2 ) target2.copy( point2 );

				}

			}

		}

		return Math.sqrt( closestDistanceSq );

	};

} )();

class OrientedBox extends Box3 {

	constructor( ...args ) {

		super( ...args );

		this.isOrientedBox = true;
		this.matrix = new Matrix4();
		this.invMatrix = new Matrix4();
		this.points = new Array( 8 ).fill().map( () => new Vector3() );
		this.satAxes = new Array( 3 ).fill().map( () => new Vector3() );
		this.satBounds = new Array( 3 ).fill().map( () => new SeparatingAxisBounds() );
		this.alignedSatBounds = new Array( 3 ).fill().map( () => new SeparatingAxisBounds() );
		this.sphere = new Sphere();

	}

	set( min, max, matrix ) {

		super.set( min, max );
		this.matrix = matrix;

	}

	copy( other ) {

		super.copy( other );
		this.matrix.copy( other.matrix );

	}

}

OrientedBox.prototype.update = ( function () {

	return function update() {

		const matrix = this.matrix;
		const min = this.min;
		const max = this.max;

		const points = this.points;
		for ( let x = 0; x <= 1; x ++ ) {

			for ( let y = 0; y <= 1; y ++ ) {

				for ( let z = 0; z <= 1; z ++ ) {

					const i = ( ( 1 << 0 ) * x ) | ( ( 1 << 1 ) * y ) | ( ( 1 << 2 ) * z );
					const v = points[ i ];
					v.x = x ? max.x : min.x;
					v.y = y ? max.y : min.y;
					v.z = z ? max.z : min.z;

					v.applyMatrix4( matrix );

				}

			}

		}

		this.sphere.setFromPoints( this.points );

		const satBounds = this.satBounds;
		const satAxes = this.satAxes;
		const minVec = points[ 0 ];
		for ( let i = 0; i < 3; i ++ ) {

			const axis = satAxes[ i ];
			const sb = satBounds[ i ];
			const index = 1 << i;
			const pi = points[ index ];

			axis.subVectors( minVec, pi );
			sb.setFromPoints( axis, points );

		}

		const alignedSatBounds = this.alignedSatBounds;
		alignedSatBounds[ 0 ].setFromPointsField( points, 'x' );
		alignedSatBounds[ 1 ].setFromPointsField( points, 'y' );
		alignedSatBounds[ 2 ].setFromPointsField( points, 'z' );

		this.invMatrix.getInverse( this.matrix );

	};

} )();

OrientedBox.prototype.intersectsBox = ( function () {

	const aabbBounds = new SeparatingAxisBounds();
	return function intersectsBox( box ) {

		if ( ! box.intersectsSphere( this.sphere ) ) return false;

		const min = box.min;
		const max = box.max;
		const satBounds = this.satBounds;
		const satAxes = this.satAxes;
		const alignedSatBounds = this.alignedSatBounds;

		aabbBounds.min = min.x;
		aabbBounds.max = max.x;
		if ( alignedSatBounds[ 0 ].isSeparated( aabbBounds ) ) return false;

		aabbBounds.min = min.y;
		aabbBounds.max = max.y;
		if ( alignedSatBounds[ 1 ].isSeparated( aabbBounds ) ) return false;

		aabbBounds.min = min.z;
		aabbBounds.max = max.z;
		if ( alignedSatBounds[ 2 ].isSeparated( aabbBounds ) ) return false;

		for ( let i = 0; i < 3; i ++ ) {

			const axis = satAxes[ i ];
			const sb = satBounds[ i ];
			aabbBounds.setFromBox( axis, box );
			if ( sb.isSeparated( aabbBounds ) ) return false;

		}

		return true;

	};

} )();

OrientedBox.prototype.intersectsTriangle = ( function () {

	const saTri = new SeparatingAxisTriangle();
	const pointsArr = new Array( 3 );
	const cachedSatBounds = new SeparatingAxisBounds();
	const cachedSatBounds2 = new SeparatingAxisBounds();
	const cachedAxis = new Vector3();
	return function intersectsTriangle( triangle ) {

		if ( ! triangle.isSeparatingAxisTriangle ) {

			saTri.copy( triangle );
			saTri.update();
			triangle = saTri;

		}

		const satBounds = this.satBounds;
		const satAxes = this.satAxes;

		pointsArr[ 0 ] = triangle.a;
		pointsArr[ 1 ] = triangle.b;
		pointsArr[ 2 ] = triangle.c;

		for ( let i = 0; i < 3; i ++ ) {

			const sb = satBounds[ i ];
			const sa = satAxes[ i ];
			cachedSatBounds.setFromPoints( sa, pointsArr );
			if ( sb.isSeparated( cachedSatBounds ) ) return false;

		}

		const triSatBounds = triangle.satBounds;
		const triSatAxes = triangle.satAxes;
		const points = this.points;
		for ( let i = 0; i < 3; i ++ ) {

			const sb = triSatBounds[ i ];
			const sa = triSatAxes[ i ];
			cachedSatBounds.setFromPoints( sa, points );
			if ( sb.isSeparated( cachedSatBounds ) ) return false;

		}

		// check crossed axes
		for ( let i = 0; i < 3; i ++ ) {

			const sa1 = satAxes[ i ];
			for ( let i2 = 0; i2 < 4; i2 ++ ) {

				const sa2 = triSatAxes[ i2 ];
				cachedAxis.crossVectors( sa1, sa2 );
				cachedSatBounds.setFromPoints( cachedAxis, pointsArr );
				cachedSatBounds2.setFromPoints( cachedAxis, points );
				if ( cachedSatBounds.isSeparated( cachedSatBounds2 ) ) return false;

			}

		}

		return true;

	};

} )();

OrientedBox.prototype.closestPointToPoint = ( function () {

	return function closestPointToPoint( point, target1 ) {

		target1
			.copy( point )
			.applyMatrix4( this.invMatrix )
			.clamp( this.min, this.max )
			.applyMatrix4( this.matrix );

		return target1;

	};

} )();

OrientedBox.prototype.distanceToPoint = ( function () {

	const target = new Vector3();
	return function distanceToPoint( point ) {

		this.closestPointToPoint( point, target );
		return point.distanceTo( target );

	};

} )();


OrientedBox.prototype.distanceToBox = ( function () {

	const xyzFields = [ 'x', 'y', 'z' ];
	const segments1 = new Array( 12 ).fill().map( () => new Line3() );
	const segments2 = new Array( 12 ).fill().map( () => new Line3() );

	const point1 = new Vector3();
	const point2 = new Vector3();

	return function distanceToBox( box, threshold = 0, target1 = null, target2 = null ) {

		if ( this.intersectsBox( box ) ) {

			if ( target1 || target2 ) {

				box.getCenter( point2 );
				this.closestPointToPoint( point2, point1 );
				box.closestPointToPoint( point1, point2 );

				if ( target1 ) target1.copy( point1 );
				if ( target2 ) target2.copy( point2 );

			}
			return 0;

		}

		const threshold2 = threshold * threshold;
		const min = box.min;
		const max = box.max;
		const points = this.points;


		// iterate over every edge and compare distances
		let closestDistanceSq = Infinity;

		// check over all these points
		for ( let i = 0; i < 8; i ++ ) {

			const p = points[ i ];
			point2.copy( p ).clamp( min, max );

			const dist = p.distanceToSquared( point2 );
			if ( dist < closestDistanceSq ) {

				closestDistanceSq = dist;
				if ( target1 ) target1.copy( p );
				if ( target2 ) target2.copy( point2 );

				if ( dist < threshold2 ) return Math.sqrt( dist );

			}

		}

		// generate and check all line segment distances
		let count = 0;
		for ( let i = 0; i < 3; i ++ ) {

			for ( let i1 = 0; i1 <= 1; i1 ++ ) {

				for ( let i2 = 0; i2 <= 1; i2 ++ ) {

					const nextIndex = ( i + 1 ) % 3;
					const nextIndex2 = ( i + 2 ) % 3;

					// get obb line segments
					const index = i1 << nextIndex | i2 << nextIndex2;
					const index2 = 1 << i | i1 << nextIndex | i2 << nextIndex2;
					const p1 = points[ index ];
					const p2 = points[ index2 ];
					const line1 = segments1[ count ];
					line1.set( p1, p2 );


					// get aabb line segments
					const f1 = xyzFields[ i ];
					const f2 = xyzFields[ nextIndex ];
					const f3 = xyzFields[ nextIndex2 ];
					const line2 = segments2[ count ];
					const start = line2.start;
					const end = line2.end;

					start[ f1 ] = min[ f1 ];
					start[ f2 ] = i1 ? min[ f2 ] : max[ f2 ];
					start[ f3 ] = i2 ? min[ f3 ] : max[ f2 ];

					end[ f1 ] = max[ f1 ];
					end[ f2 ] = i1 ? min[ f2 ] : max[ f2 ];
					end[ f3 ] = i2 ? min[ f3 ] : max[ f2 ];

					count ++;

				}

			}

		}

		// check all the other boxes point
		for ( let x = 0; x <= 1; x ++ ) {

			for ( let y = 0; y <= 1; y ++ ) {

				for ( let z = 0; z <= 1; z ++ ) {

					point2.x = x ? max.x : min.x;
					point2.y = y ? max.y : min.y;
					point2.z = z ? max.z : min.z;

					this.closestPointToPoint( point2, point1 );
					const dist = point2.distanceToSquared( point1 );
					if ( dist < closestDistanceSq ) {

						closestDistanceSq = dist;
						if ( target1 ) target1.copy( point1 );
						if ( target2 ) target2.copy( point2 );

						if ( dist < threshold2 ) return Math.sqrt( dist );

					}

				}

			}

		}

		for ( let i = 0; i < 12; i ++ ) {

			const l1 = segments1[ i ];
			for ( let i2 = 0; i2 < 12; i2 ++ ) {

				const l2 = segments2[ i2 ];
				closestPointsSegmentToSegment( l1, l2, point1, point2 );
				const dist = point1.distanceToSquared( point2 );
				if ( dist < closestDistanceSq ) {

					closestDistanceSq = dist;
					if ( target1 ) target1.copy( point1 );
					if ( target2 ) target2.copy( point2 );

					if ( dist < threshold2 ) return Math.sqrt( dist );

				}

			}

		}

		return Math.sqrt( closestDistanceSq );

	};

} )();

const boundingBox = new Box3();
const boxIntersection = new Vector3();
const xyzFields = [ 'x', 'y', 'z' ];

function setTriangle( tri, i, index, pos ) {

	const ta = tri.a;
	const tb = tri.b;
	const tc = tri.c;

	let i3 = index.getX( i );
	ta.x = pos.getX( i3 );
	ta.y = pos.getY( i3 );
	ta.z = pos.getZ( i3 );

	i3 = index.getX( i + 1 );
	tb.x = pos.getX( i3 );
	tb.y = pos.getY( i3 );
	tb.z = pos.getZ( i3 );

	i3 = index.getX( i + 2 );
	tc.x = pos.getX( i3 );
	tc.y = pos.getY( i3 );
	tc.z = pos.getZ( i3 );

}

class MeshBVHNode {

	constructor() {

		// internal nodes have boundingData, left, right, and splitAxis
		// leaf nodes have offset and count (referring to primitives in the mesh geometry)

	}

	intersectRay( ray, target ) {

		arrayToBox( this.boundingData, boundingBox );

		return ray.intersectBox( boundingBox, target );

	}

	raycast( mesh, raycaster, ray, intersects ) {

		if ( this.count ) intersectTris( mesh, mesh.geometry, raycaster, ray, this.offset, this.count, intersects );
		else {

			if ( this.left.intersectRay( ray, boxIntersection ) )
				this.left.raycast( mesh, raycaster, ray, intersects );
			if ( this.right.intersectRay( ray, boxIntersection ) )
				this.right.raycast( mesh, raycaster, ray, intersects );

		}

	}

	raycastFirst( mesh, raycaster, ray ) {

		if ( this.count ) {

			return intersectClosestTri( mesh, mesh.geometry, raycaster, ray, this.offset, this.count );

		} else {


			// consider the position of the split plane with respect to the oncoming ray; whichever direction
			// the ray is coming from, look for an intersection among that side of the tree first
			const splitAxis = this.splitAxis;
			const xyzAxis = xyzFields[ splitAxis ];
			const rayDir = ray.direction[ xyzAxis ];
			const leftToRight = rayDir >= 0;

			// c1 is the child to check first
			let c1, c2;
			if ( leftToRight ) {

				c1 = this.left;
				c2 = this.right;

			} else {

				c1 = this.right;
				c2 = this.left;

			}

			const c1Intersection = c1.intersectRay( ray, boxIntersection );
			const c1Result = c1Intersection ? c1.raycastFirst( mesh, raycaster, ray ) : null;

			// if we got an intersection in the first node and it's closer than the second node's bounding
			// box, we don't need to consider the second node because it couldn't possibly be a better result
			if ( c1Result ) {

				// check only along the split axis
				const rayOrig = ray.origin[ xyzAxis ];
				const toPoint = rayOrig - c1Result.point[ xyzAxis ];
				const toChild1 = rayOrig - c2.boundingData[ splitAxis ];
				const toChild2 = rayOrig - c2.boundingData[ splitAxis + 3 ];

				const toPointSq = toPoint * toPoint;
				if ( toPointSq <= toChild1 * toChild1 && toPointSq <= toChild2 * toChild2 ) {

					return c1Result;

				}

			}

			// either there was no intersection in the first node, or there could still be a closer
			// intersection in the second, so check the second node and then take the better of the two
			const c2Intersection = c2.intersectRay( ray, boxIntersection );
			const c2Result = c2Intersection ? c2.raycastFirst( mesh, raycaster, ray ) : null;

			if ( c1Result && c2Result ) {

				return c1Result.distance <= c2Result.distance ? c1Result : c2Result;

			} else {

				return c1Result || c2Result || null;

			}

		}

	}

}

MeshBVHNode.prototype.shapecast = ( function () {

	const triangle = new SeparatingAxisTriangle();
	const cachedBox1 = new Box3();
	const cachedBox2 = new Box3();
	return function shapecast( mesh, intersectsBoundsFunc, intersectsTriangleFunc = null, nodeScoreFunc = null ) {

		if ( this.count && intersectsTriangleFunc ) {

			const geometry = mesh.geometry;
			const index = geometry.index;
			const pos = geometry.attributes.position;
			const offset = this.offset;
			const count = this.count;

			for ( let i = offset * 3, l = ( count + offset ) * 3; i < l; i += 3 ) {

				setTriangle( triangle, i, index, pos );
				triangle.update();

				if ( intersectsTriangleFunc( triangle, i, i + 1, i + 2 ) ) {

					return true;

				}

			}

			return false;

		} else {

			const left = this.left;
			const right = this.right;
			let c1 = left;
			let c2 = right;

			let score1, score2;
			let box1, box2;
			if ( nodeScoreFunc ) {

				box1 = cachedBox1;
				box2 = cachedBox2;

				arrayToBox( c1.boundingData, box1 );
				arrayToBox( c2.boundingData, box2 );

				score1 = nodeScoreFunc( box1 );
				score2 = nodeScoreFunc( box2 );

				if ( score2 < score1 ) {

					c1 = right;
					c2 = left;

					const temp = score1;
					score1 = score2;
					score2 = temp;

					const tempBox = box1;
					box1 = box2;
					box2 = tempBox;

				}

			}

			if ( ! box1 ) {

				box1 = cachedBox1;
				arrayToBox( c1.boundingData, box1 );

			}

			const isC1Leaf = ! ! c1.count;
			const c1Intersection =
				intersectsBoundsFunc( box1, isC1Leaf, score1, c1 ) &&
				c1.shapecast( mesh, intersectsBoundsFunc, intersectsTriangleFunc, nodeScoreFunc );

			if ( c1Intersection ) return true;


			if ( ! box2 ) {

				box2 = cachedBox2;
				arrayToBox( c2.boundingData, box2 );

			}

			const isC2Leaf = ! ! c2.count;
			const c2Intersection =
				intersectsBoundsFunc( box2, isC2Leaf, score2, c2 ) &&
				c2.shapecast( mesh, intersectsBoundsFunc, intersectsTriangleFunc, nodeScoreFunc );

			if ( c2Intersection ) return true;

			return false;

		}

	};

} )();

MeshBVHNode.prototype.intersectsGeometry = ( function () {

	const triangle = new SeparatingAxisTriangle();
	const triangle2 = new SeparatingAxisTriangle();
	const cachedMesh = new Mesh();
	const invertedMat = new Matrix4();

	const obb = new OrientedBox();
	const obb2 = new OrientedBox();

	return function intersectsGeometry( mesh, geometry, geometryToBvh, cachedObb = null ) {

		if ( cachedObb === null ) {

			if ( ! geometry.boundingBox ) {

				geometry.computeBoundingBox();

			}

			obb.set( geometry.boundingBox.min, geometry.boundingBox.max, geometryToBvh );
			obb.update();
			cachedObb = obb;

		}

		if ( this.count ) {

			const thisGeometry = mesh.geometry;
			const thisIndex = thisGeometry.index;
			const thisPos = thisGeometry.attributes.position;

			const index = geometry.index;
			const pos = geometry.attributes.position;

			const offset = this.offset;
			const count = this.count;

			// get the inverse of the geometry matrix so we can transform our triangles into the
			// geometry space we're trying to test. We assume there are fewer triangles being checked
			// here.
			invertedMat.getInverse( geometryToBvh );

			if ( geometry.boundsTree ) {

				function triangleCallback( tri ) {

					tri.a.applyMatrix4( geometryToBvh );
					tri.b.applyMatrix4( geometryToBvh );
					tri.c.applyMatrix4( geometryToBvh );
					tri.update();

					for ( let i = offset * 3, l = ( count + offset ) * 3; i < l; i += 3 ) {

						// this triangle needs to be transformed into the current BVH coordinate frame
						setTriangle( triangle2, i, thisIndex, thisPos );
						triangle2.update();
						if ( tri.intersectsTriangle( triangle2 ) ) {

							return true;

						}

					}

					return false;

				}

				arrayToBox( this.boundingData, obb2 );
				obb2.matrix.copy( invertedMat );
				obb2.update();

				cachedMesh.geometry = geometry;
				const res = geometry.boundsTree.shapecast( cachedMesh, box => obb2.intersectsBox( box ), triangleCallback );
				cachedMesh.geometry = null;

				return res;

			} else {

				for ( let i = offset * 3, l = ( count + offset * 3 ); i < l; i += 3 ) {

					// this triangle needs to be transformed into the current BVH coordinate frame
					setTriangle( triangle, i, thisIndex, thisPos );
					triangle.a.applyMatrix4( invertedMat );
					triangle.b.applyMatrix4( invertedMat );
					triangle.c.applyMatrix4( invertedMat );
					triangle.update();

					for ( let i2 = 0, l2 = index.count; i2 < l2; i2 += 3 ) {

						setTriangle( triangle2, i2, index, pos );
						triangle2.update();

						if ( triangle.intersectsTriangle( triangle2 ) ) {

							return true;

						}

					}

				}

			}

		} else {

			const left = this.left;
			const right = this.right;

			arrayToBox( left.boundingData, boundingBox );
			const leftIntersection =
				cachedObb.intersectsBox( boundingBox ) &&
				left.intersectsGeometry( mesh, geometry, geometryToBvh, cachedObb );

			if ( leftIntersection ) return true;


			arrayToBox( right.boundingData, boundingBox );
			const rightIntersection =
				cachedObb.intersectsBox( boundingBox ) &&
				right.intersectsGeometry( mesh, geometry, geometryToBvh, cachedObb );

			if ( rightIntersection ) return true;

			return false;

		}

	};

} )();

MeshBVHNode.prototype.intersectsBox = ( function () {

	const obb = new OrientedBox();

	return function intersectsBox( mesh, box, boxToBvh ) {

		obb.set( box.min, box.max, boxToBvh );
		obb.update();

		return this.shapecast(
			mesh,
			box => obb.intersectsBox( box ),
			tri => obb.intersectsTriangle( tri )
		);

	};

} )();

MeshBVHNode.prototype.intersectsSphere = ( function () {

	return function intersectsSphere( mesh, sphere ) {

		return this.shapecast(
			mesh,
			box => sphere.intersectsBox( box ),
			tri => sphereIntersectTriangle( sphere, tri )
		);

	};

} )();

MeshBVHNode.prototype.closestPointToPoint = ( function () {

	// early out if under minThreshold
	// skip checking if over maxThreshold
	// set minThreshold = maxThreshold to quickly check if a point is within a threshold
	// returns Infinity if no value found

	const temp = new Vector3();
	return function closestPointToPoint( mesh, point, target = null, minThreshold = 0, maxThreshold = Infinity ) {

		let closestDistance = Infinity;
		this.shapecast(

			mesh,
			( box, isLeaf, score ) => score < closestDistance && score < maxThreshold,
			tri => {

				tri.closestPointToPoint( point, temp );
				const dist = point.distanceTo( temp );
				if ( dist < closestDistance ) {

					if ( target ) target.copy( temp );
					closestDistance = dist;

				}
				if ( dist < minThreshold ) return true;
				return false;

			},
			box => box.distanceToPoint( point )

		);

		return closestDistance;

	};

} )();

MeshBVHNode.prototype.closestPointToGeometry = ( function () {

	// early out if under minThreshold
	// skip checking if over maxThreshold
	// set minThreshold = maxThreshold to quickly check if a point is within a threshold
	// returns Infinity if no value found

	const tri2 = new SeparatingAxisTriangle();
	const obb = new OrientedBox();

	const temp1 = new Vector3();
	const temp2 = new Vector3();
	return function closestPointToGeometry( mesh, geometry, geometryToBvh, target1 = null, target2 = null, minThreshold = 0, maxThreshold = Infinity ) {

		if ( ! geometry.boundingBox ) geometry.computeBoundingBox();
		obb.set( geometry.boundingBox.min, geometry.boundingBox.max, geometryToBvh );
		obb.update();

		const pos = geometry.attributes.position;
		const index = geometry.index;

		let tempTarget1, tempTarget2;
		if ( target1 ) tempTarget1 = temp1;
		if ( target2 ) tempTarget2 = temp2;

		let closestDistance = Infinity;
		this.shapecast(
			mesh,
			( box, isLeaf, score ) => score < closestDistance && score < maxThreshold,
			tri => {

				const sphere1 = tri.sphere;
				for ( let i2 = 0, l2 = index.count; i2 < l2; i2 += 3 ) {

					setTriangle( tri2, i2, index, pos );
					tri2.a.applyMatrix4( geometryToBvh );
					tri2.b.applyMatrix4( geometryToBvh );
					tri2.c.applyMatrix4( geometryToBvh );
					tri2.sphere.setFromPoints( tri2.points );

					const sphere2 = tri2.sphere;
					const sphereDist = sphere2.center.distanceTo( sphere1.center ) - sphere2.radius - sphere1.radius;
					if ( sphereDist > closestDistance ) continue;

					tri2.update();

					const dist = tri.distanceToTriangle( tri2, tempTarget1, tempTarget2 );
					if ( dist < closestDistance ) {

						if ( target1 ) target1.copy( tempTarget1 );
						if ( target2 ) target2.copy( tempTarget2 );
						closestDistance = dist;

					}
					if ( dist < minThreshold ) return true;

				}

				return false;

			},
			box => obb.distanceToBox( box, Math.min( closestDistance, maxThreshold ) )

		);

		return closestDistance;

	};

} )();

// Split strategy constants
const CENTER = 0;
const AVERAGE = 1;
const SAH = 2;

const xyzFields$1 = [ 'x', 'y', 'z' ];

// precomputes the bounding box for each triangle; required for quickly calculating tree splits.
// result is an array of size tris.length * 6 where triangle i maps to a
// [x_center, x_delta, y_center, y_delta, z_center, z_delta] tuple starting at index i * 6,
// representing the center and half-extent in each dimension of triangle i
function computeBounds( geo ) {

	const verts = geo.attributes.position.array;
	const index = geo.index.array;
	const triCount = index.length / 3;
	const bounds = new Float32Array( triCount * 6 );

	for ( let tri = 0; tri < triCount; tri ++ ) {

		const ai = index[ 3 * tri + 0 ] * 3;
		const bi = index[ 3 * tri + 1 ] * 3;
		const ci = index[ 3 * tri + 2 ] * 3;

		for ( let el = 0; el < 3; el ++ ) {

			const a = verts[ ai + el ];
			const b = verts[ bi + el ];
			const c = verts[ ci + el ];
			const min = Math.min( a, b, c );
			const max = Math.max( a, b, c );
			const halfExtents = ( max - min ) / 2;
			bounds[ tri * 6 + el * 2 + 0 ] = min + halfExtents;
			bounds[ tri * 6 + el * 2 + 1 ] = halfExtents;

		}

	}

	return bounds;

}

const boxtemp = new Box3();

class BVHConstructionContext {

	constructor( geo, options ) {

		this.geo = geo;
		this.options = options;
		this.bounds = computeBounds( geo );

		// SAH Initialization
		this.sahplanes = null;
		if ( options.strategy === SAH ) {

			const triCount = geo.index.count / 3;
			this.sahplanes = [ new Array( triCount ), new Array( triCount ), new Array( triCount ) ];
			for ( let tri = 0; tri < triCount; tri ++ ) {

				for ( let el = 0; el < 3; el ++ ) {

					this.sahplanes[ el ][ tri ] = { p: this.bounds[ tri * 6 + el * 2 ], tri };

				}

			}

		}

	}

	// returns the average coordinate on the specified axis of the all the provided triangles
	getAverage( offset, count, axis ) {

		let avg = 0;
		const bounds = this.bounds;

		for ( let i = offset, end = offset + count; i < end; i ++ ) {

			avg += bounds[ i * 6 + axis * 2 ];

		}

		return avg / count;

	}

	// computes the union of the bounds of all of the given triangles and puts the resulting box in target
	getBounds( offset, count, target ) {

		let minx = Infinity;
		let miny = Infinity;
		let minz = Infinity;
		let maxx = - Infinity;
		let maxy = - Infinity;
		let maxz = - Infinity;
		const bounds = this.bounds;

		for ( let i = offset, end = offset + count; i < end; i ++ ) {

			const cx = bounds[ i * 6 + 0 ];
			const hx = bounds[ i * 6 + 1 ];
			minx = Math.min( minx, cx - hx );
			maxx = Math.max( maxx, cx + hx );
			const cy = bounds[ i * 6 + 2 ];
			const hy = bounds[ i * 6 + 3 ];
			miny = Math.min( miny, cy - hy );
			maxy = Math.max( maxy, cy + hy );
			const cz = bounds[ i * 6 + 4 ];
			const hz = bounds[ i * 6 + 5 ];
			minz = Math.min( minz, cz - hz );
			maxz = Math.max( maxz, cz + hz );

		}

		target[ 0 ] = minx;
		target[ 1 ] = miny;
		target[ 2 ] = minz;

		target[ 3 ] = maxx;
		target[ 4 ] = maxy;
		target[ 5 ] = maxz;

		return target;

	}

	// reorders `tris` such that for `count` elements after `offset`, elements on the left side of the split
	// will be on the left and elements on the right side of the split will be on the right. returns the index
	// of the first element on the right side, or offset + count if there are no elements on the right side.
	partition( offset, count, split ) {

		let left = offset;
		let right = offset + count - 1;
		const pos = split.pos;
		const axisOffset = split.axis * 2;
		const index = this.geo.index.array;
		const bounds = this.bounds;
		const sahplanes = this.sahplanes;

		// hoare partitioning, see e.g. https://en.wikipedia.org/wiki/Quicksort#Hoare_partition_scheme
		while ( true ) {

			while ( left <= right && bounds[ left * 6 + axisOffset ] < pos ) {

				left ++;

			}

			while ( left <= right && bounds[ right * 6 + axisOffset ] >= pos ) {

				right --;

			}

			if ( left < right ) {

				// we need to swap all of the information associated with the triangles at index
				// left and right; that's the verts in the geometry index, the bounds,
				// and perhaps the SAH planes

				for ( let i = 0; i < 3; i ++ ) {

					let t0 = index[ left * 3 + i ];
					index[ left * 3 + i ] = index[ right * 3 + i ];
					index[ right * 3 + i ] = t0;
					let t1 = bounds[ left * 6 + i * 2 + 0 ];
					bounds[ left * 6 + i * 2 + 0 ] = bounds[ right * 6 + i * 2 + 0 ];
					bounds[ right * 6 + i * 2 + 0 ] = t1;
					let t2 = bounds[ left * 6 + i * 2 + 1 ];
					bounds[ left * 6 + i * 2 + 1 ] = bounds[ right * 6 + i * 2 + 1 ];
					bounds[ right * 6 + i * 2 + 1 ] = t2;

				}

				if ( sahplanes ) {

					for ( let i = 0; i < 3; i ++ ) {

						let t = sahplanes[ i ][ left ];
						sahplanes[ i ][ left ] = sahplanes[ i ][ right ];
						sahplanes[ i ][ right ] = t;

					}

				}

				left ++;
				right --;

			} else {

				return left;

			}

		}

	}

	getOptimalSplit( bounds, offset, count, strategy ) {

		let axis = - 1;
		let pos = 0;

		// Center
		if ( strategy === CENTER ) {

			axis = getLongestEdgeIndex( bounds );
			if ( axis !== - 1 ) {

				pos = ( bounds[ axis + 3 ] + bounds[ axis ] ) / 2;

			}

		} else if ( strategy === AVERAGE ) {

			axis = getLongestEdgeIndex( bounds );
			if ( axis !== - 1 ) {

				pos = this.getAverage( offset, count, axis );

			}

		} else if ( strategy === SAH ) {

			// Surface Area Heuristic
			// In order to make this code more terse, the x, y, and z
			// variables of various structures have been stuffed into
			// 0, 1, and 2 array indices so they can be easily computed
			// and accessed within array iteration

			// Cost values defineed for operations. We're using bounds for traversal, so
			// the cost of traversing one more layer is more than intersecting a triangle.
			const TRAVERSAL_COST = 3;
			const INTERSECTION_COST = 1;
			const bb = arrayToBox( bounds, boxtemp );

			// Define the width, height, and depth of the bounds as a box
			const dim = [
				bb.max.x - bb.min.x,
				bb.max.y - bb.min.y,
				bb.max.z - bb.min.z
			];
			const sa = 2 * ( dim[ 0 ] * dim[ 1 ] + dim[ 0 ] * dim[ 2 ] + dim[ 1 ] * dim[ 2 ] );

			// Get the precalculated planes based for the triangles we're
			// testing here
			const filteredLists = [[], [], []];
			for ( let i = offset, end = offset + count; i < end; i ++ ) {

				for ( let v = 0; v < 3; v ++ ) {

					filteredLists[ v ].push( this.sahplanes[ v ][ i ] );

				}

			}
			filteredLists.forEach( planes => planes.sort( ( a, b ) => a.p - b.p ) );

			// this bounds surface area, left bound SA, left triangles, right bound SA, right triangles
			const getCost = ( sa, sal, nl, sar, nr ) =>
				  TRAVERSAL_COST + INTERSECTION_COST * ( ( sal / sa ) * nl + ( sar / sa ) * nr );

			// the cost of _not_ splitting into smaller bounds
			const noSplitCost = INTERSECTION_COST * count;

			axis = - 1;
			let bestCost = noSplitCost;
			for ( let i = 0; i < 3; i ++ ) {

				// o1 and o2 represent the _other_ two axes in the
				// the space. So if we're checking the x (0) dimension,
				// then o1 and o2 would be y and z (1 and 2)
				const o1 = ( i + 1 ) % 3;
				const o2 = ( i + 2 ) % 3;

				const bmin = bb.min[ xyzFields$1[ i ] ];
				const bmax = bb.max[ xyzFields$1[ i ] ];
				const planes = filteredLists[ i ];

				// The number of left and right triangles on either side
				// given the current split
				let nl = 0;
				let nr = count;
				for ( let p = 0; p < planes.length; p ++ ) {

					const pinfo = planes[ p ];

					// As the plane moves, we have to increment or decrement the
					// number of triangles on either side of the plane
					nl ++;
					nr --;

					// the distance from the plane to the edge of the broader bounds
					const ldim = pinfo.p - bmin;
					const rdim = bmax - pinfo.p;

					// same for the other two dimensions
					let ldimo1 = dim[ o1 ], rdimo1 = dim[ o1 ];
					let ldimo2 = dim[ o2 ], rdimo2 = dim[ o2 ];

					/*
					// compute the other bounding planes for the box
					// if only the current triangles are considered to
					// be in the box
					// This is really slow and probably not really worth it
					const o1planes = this.sahplanes[o1];
					const o2planes = this.sahplanes[o2];
					let lmin = Infinity, lmax = -Infinity;
					let rmin = Infinity, rmax = -Infinity;
					planes.forEach((p, i) => {
					const tri2 = p.tri * 2;
					const inf1 = o1planes[tri2 + 0];
					const inf2 = o1planes[tri2 + 1];
					if (i <= nl) {
					lmin = Math.min(inf1.p, inf2.p, lmin);
					lmax = Math.max(inf1.p, inf2.p, lmax);
					}
					if (i >= nr) {
					rmin = Math.min(inf1.p, inf2.p, rmin);
					rmax = Math.max(inf1.p, inf2.p, rmax);
					}
					})
					ldimo1 = Math.min(lmax - lmin, ldimo1);
					rdimo1 = Math.min(rmax - rmin, rdimo1);

					planes.forEach((p, i) => {
					const tri2 = p.tri * 2;
					const inf1 = o2planes[tri2 + 0];
					const inf2 = o2planes[tri2 + 1];
					if (i <= nl) {
					lmin = Math.min(inf1.p, inf2.p, lmin);
					lmax = Math.max(inf1.p, inf2.p, lmax);
					}
					if (i >= nr) {
					rmin = Math.min(inf1.p, inf2.p, rmin);
					rmax = Math.max(inf1.p, inf2.p, rmax);
					}
					})
					ldimo2 = Math.min(lmax - lmin, ldimo2);
					rdimo2 = Math.min(rmax - rmin, rdimo2);
					*/

					// surface areas and cost
					const sal = 2 * ( ldimo1 * ldimo2 + ldimo1 * ldim + ldimo2 * ldim );
					const sar = 2 * ( rdimo1 * rdimo2 + rdimo1 * rdim + rdimo2 * rdim );
					const cost = getCost( sa, sal, nl, sar, nr );

					if ( cost < bestCost ) {

						axis = i;
						pos = pinfo.p;
						bestCost = cost;

					}

				}

			}

		}

		return { axis, pos };

	}

}

class MeshBVH {

	constructor( geo, options = {} ) {

		if ( ! geo.isBufferGeometry ) {

			throw new Error( 'MeshBVH: Only BufferGeometries are supported.' );

		} else if ( geo.attributes.position.isInterleavedBufferAttribute ) {

			throw new Error( 'MeshBVH: InterleavedBufferAttribute is not supported for the position attribute.' );

		} else if ( geo.index && geo.index.isInterleavedBufferAttribute ) {

			throw new Error( 'MeshBVH: InterleavedBufferAttribute is not supported for the index attribute.' );

		}

		// default options
		options = Object.assign( {

			strategy: CENTER,
			maxDepth: 40,
			maxLeafTris: 10,
			verbose: true

		}, options );
		options.strategy = Math.max( 0, Math.min( 2, options.strategy ) );

		this._roots = this._buildTree( geo, options );


	}

	/* Private Functions */

	_ensureIndex( geo ) {

		if ( ! geo.index ) {

			const vertexCount = geo.attributes.position.count;
			const index = new ( vertexCount > 65535 ? Uint32Array : Uint16Array )( vertexCount );
			geo.setIndex( new BufferAttribute( index, 1 ) );

			for ( let i = 0; i < vertexCount; i ++ ) {

				index[ i ] = i;

			}

		}

	}

	// Computes the set of { offset, count } ranges which need independent BVH roots. Each
	// region in the geometry index that belongs to a different set of material groups requires
	// a separate BVH root, so that triangles indices belonging to one group never get swapped
	// with triangle indices belongs to another group. For example, if the groups were like this:
	//
	// [-------------------------------------------------------------]
	// |__________________|
	//   g0 = [0, 20]  |______________________||_____________________|
	//                      g1 = [16, 40]           g2 = [41, 60]
	//
	// we would need four BVH roots: [0, 15], [16, 20], [21, 40], [41, 60].
	//
	_getRootIndexRanges( geo ) {

		if ( ! geo.groups || ! geo.groups.length ) {

			return [ { offset: 0, count: geo.index.count / 3 } ];

		}

		const ranges = [];
		const rangeBoundaries = new Set();
		for ( const group of geo.groups ) {

			rangeBoundaries.add( group.start );
			rangeBoundaries.add( group.start + group.count );

		}

		// note that if you don't pass in a comparator, it sorts them lexicographically as strings :-(
		const sortedBoundaries = Array.from( rangeBoundaries.values() ).sort( ( a, b ) => a - b );
		for ( let i = 0; i < sortedBoundaries.length - 1; i ++ ) {

			const start = sortedBoundaries[ i ], end = sortedBoundaries[ i + 1 ];
			ranges.push( { offset: ( start / 3 ), count: ( end - start ) / 3 } );

		}
		return ranges;

	}

	_buildTree( geo, options ) {

		this._ensureIndex( geo );

		const ctx = new BVHConstructionContext( geo, options );
		let reachedMaxDepth = false;

		// either recursively splits the given node, creating left and right subtrees for it, or makes it a leaf node,
		// recording the offset and count of its triangles and writing them into the reordered geometry index.
		const splitNode = ( node, offset, count, depth = 0 ) => {

			if ( depth >= options.maxDepth ) {

				reachedMaxDepth = true;

			}

			// early out if we've met our capacity
			if ( count <= options.maxLeafTris || depth >= options.maxDepth ) {

				node.offset = offset;
				node.count = count;
				return node;

			}

			// Find where to split the volume
			const split = ctx.getOptimalSplit( node.boundingData, offset, count, options.strategy );
			if ( split.axis === - 1 ) {

				node.offset = offset;
				node.count = count;
				return node;

			}

			const splitOffset = ctx.partition( offset, count, split );

			// create the two new child nodes
			if ( splitOffset === offset || splitOffset === offset + count ) {

				node.offset = offset;
				node.count = count;

			} else {

				node.splitAxis = split.axis;

				// create the left child and compute its bounding box
				const left = node.left = new MeshBVHNode();
				const lstart = offset, lcount = splitOffset - offset;
				left.boundingData = ctx.getBounds( lstart, lcount, new Float32Array( 6 ) );
				splitNode( left, lstart, lcount, depth + 1 );

				// repeat for right
				const right = node.right = new MeshBVHNode();
				const rstart = splitOffset, rcount = count - lcount;
				right.boundingData = ctx.getBounds( rstart, rcount, new Float32Array( 6 ) );
				splitNode( right, rstart, rcount, depth + 1 );

			}

			return node;

		};

		const roots = [];
		const ranges = this._getRootIndexRanges( geo );

		if ( ranges.length === 1 ) {

			const root = new MeshBVHNode();
			const range = ranges[ 0 ];

			if ( geo.boundingBox != null ) {

				root.boundingData = boxToArray( geo.boundingBox );

			} else {

				root.boundingData = ctx.getBounds( range.offset, range.count, new Float32Array( 6 ) );

			}

			splitNode( root, range.offset, range.count );
			roots.push( root );

		} else {

			for ( let range of ranges ) {

				const root = new MeshBVHNode();
				root.boundingData = ctx.getBounds( range.offset, range.count, new Float32Array( 6 ) );
				splitNode( root, range.offset, range.count );
				roots.push( root );

			}

		}

		if ( reachedMaxDepth && options.verbose ) {

			console.warn( `MeshBVH: Max depth of ${ options.maxDepth } reached when generating BVH. Consider increasing maxDepth.` );
			console.warn( this, geo );

		}

		// if the geometry doesn't have a bounding box, then let's politely populate it using
		// the work we did to determine the BVH root bounds

		if ( geo.boundingBox == null ) {

			const rootBox = new Box3();
			geo.boundingBox = new Box3();

			for ( let root of roots ) {

				geo.boundingBox.union( arrayToBox( root.boundingData, rootBox ) );

			}

		}

		return roots;

	}

	raycast( mesh, raycaster, ray, intersects ) {

		for ( const root of this._roots ) {

			root.raycast( mesh, raycaster, ray, intersects );

		}

	}

	raycastFirst( mesh, raycaster, ray ) {

		let closestResult = null;

		for ( const root of this._roots ) {

			const result = root.raycastFirst( mesh, raycaster, ray );
			if ( result != null && ( closestResult == null || result.distance < closestResult.distance ) ) {

				closestResult = result;

			}

		}

		return closestResult;

	}

	intersectsGeometry( mesh, geometry, geomToMesh ) {

		for ( const root of this._roots ) {

			if ( root.intersectsGeometry( mesh, geometry, geomToMesh ) ) return true;

		}

		return false;

	}

	shapecast( mesh, intersectsBoundsFunc, intersectsTriangleFunc = null, orderNodesFunc = null ) {

		for ( const root of this._roots ) {

			if ( root.shapecast( mesh, intersectsBoundsFunc, intersectsTriangleFunc, orderNodesFunc ) ) return true;

		}

		return false;

	}

	intersectsBox( mesh, box, boxToMesh ) {

		for ( const root of this._roots ) {

			if ( root.intersectsBox( mesh, box, boxToMesh ) ) return true;

		}

		return false;

	}

	intersectsSphere( mesh, sphere ) {

		for ( const root of this._roots ) {

			if ( root.intersectsSphere( mesh, sphere ) ) return true;

		}

		return false;

	}

	closestPointToGeometry( mesh, geom, matrix, target1, target2, minThreshold, maxThreshold ) {

		let closestDistance = Infinity;
		for ( const root of this._roots ) {

			const dist = root.closestPointToGeometry( mesh, geom, matrix, target1, target2, minThreshold, maxThreshold );
			if ( dist < closestDistance ) closestDistance = dist;
			if ( dist < minThreshold ) return dist;

		}

		return closestDistance;

	}

	distanceToGeometry( mesh, geom, matrix, minThreshold, maxThreshold ) {

		return this.closestPointToGeometry( mesh, geom, matrix, null, null, minThreshold, maxThreshold );

	}

	closestPointToPoint( mesh, point, target, minThreshold, maxThreshold ) {

		let closestDistance = Infinity;
		for ( const root of this._roots ) {

			const dist = root.closestPointToPoint( mesh, point, target, minThreshold, maxThreshold );
			if ( dist < closestDistance ) closestDistance = dist;
			if ( dist < minThreshold ) return dist;

		}

		return closestDistance;

	}

	distanceToPoint( mesh, point, minThreshold, maxThreshold ) {

		return this.closestPointToPoint( mesh, point, null, minThreshold, maxThreshold );

	}

}

const wiremat = new LineBasicMaterial( { color: 0x00FF88, transparent: true, opacity: 0.3 } );
const boxGeom = new Box3Helper().geometry;
let boundingBox$1 = new Box3();

const ray = new Ray();
const tmpInverseMatrix = new Matrix4();
const origMeshRaycastFunc = Mesh.prototype.raycast;

function acceleratedRaycast( raycaster, intersects ) {

	if ( this.geometry.boundsTree ) {

		if ( this.material === undefined ) return;

		tmpInverseMatrix.getInverse( this.matrixWorld );
		ray.copy( raycaster.ray ).applyMatrix4( tmpInverseMatrix );

		if ( raycaster.firstHitOnly === true ) {

			const res = this.geometry.boundsTree.raycastFirst( this, raycaster, ray );
			if ( res ) intersects.push( res );

		} else {

			this.geometry.boundsTree.raycast( this, raycaster, ray, intersects );

		}

	} else {

		origMeshRaycastFunc.call( this, raycaster, intersects );

	}

}

function computeBoundsTree( options ) {

	this.boundsTree = new MeshBVH( this, options );
	return this.boundsTree;

}

function disposeBoundsTree() {

	this.boundsTree = null;

}

BufferGeometry.prototype.computeBoundsTree = computeBoundsTree;
BufferGeometry.prototype.disposeBoundsTree = disposeBoundsTree;
Mesh.prototype.raycast = acceleratedRaycast;

var _s = new Vector3();

Object3D.prototype.updateMatrix = function () {
  var ref = this;
  var position = ref.position;
  var quaternion = ref.quaternion;
  var scale = ref.scale;

  _s.copy(scale); // allow scale of 0 by making it very small


  if (_s.x === 0) { _s.x = 1e-10; }
  if (_s.y === 0) { _s.y = 1e-10; }
  if (_s.z === 0) { _s.z = 1e-10; }
  this.matrix.compose(position, quaternion, scale);
}; // modify updateMatrixWorld to rely on updateWorldMatrix method


Object3D.prototype.updateMatrixWorld = function (force) {
  if (this._inUpdateWorldMatrix) { return; }
  this.updateWorldMatrix(false, true, true);
}; // modify Object3D.updateWorldMatrix to apply layout


Object3D.prototype.updateWorldMatrix = function (updateParents, updateChildren, updateLayout) {
  if ( updateLayout === void 0 ) updateLayout = true;

  var parent = this.parent; // update parents

  if (updateParents === true && parent !== null) {
    parent.updateWorldMatrix(true, false, true);
  } // update without layout


  if (this.matrixAutoUpdate) { this.updateMatrix(); }

  if (this.parent === null) {
    this.matrixWorld.copy(this.matrix);
  } else {
    this.matrixWorld.multiplyMatrices(this.parent.matrixWorld, this.matrix);
  } // update children without layout


  var children = this.children;

  if (updateChildren === true) {
    for (var i = 0, l = children.length; i < l; i++) {
      children[i].updateWorldMatrix(false, true, false);
    }
  } // update and apply layout


  if (updateLayout === true) {
    updateChildren && this.layout.invalidateBounds(); // only invalidate when traversing down

    this.layout.updateMatrix();
    var transitioner = this.transitioner;
    transitioner.matrixLocal.target.multiplyMatrices(this.layout.matrix, this.matrix);
    var matrixLocal = transitioner.active ? transitioner.matrixLocal.current : transitioner.matrixLocal.target;

    if (parent === null) {
      transitioner.matrixWorldTarget.copy(transitioner.matrixLocal.target);
      this.matrixWorld.copy(matrixLocal);
    } else {
      transitioner.matrixWorldTarget.multiplyMatrices(parent.transitioner.matrixWorldTarget, transitioner.matrixLocal.target);
      this.matrixWorld.multiplyMatrices(parent.matrixWorld, matrixLocal);
    } // update children with layout


    if (updateChildren === true) {
      for (var i = 0, l = children.length; i < l; i++) {
        children[i].updateWorldMatrix(false, true, true);
      }
    }
  }

  this['_inUpdateWorldMatrix'] = true;
  this.updateMatrixWorld(); // some three.js Object3D subclasses have special behavior here

  this['_inUpdateWorldMatrix'] = false;
}; // create a SpatialLayout instance on first access of the `layout` property 


Object.defineProperty(Object3D.prototype, 'layout', {
  get: function getLayout() {
    if (this === Object3D.prototype) { return undefined; }
    Object.defineProperty(this, 'layout', {
      value: new Layout(this),
      writable: true,
      enumerable: true
    });
    return this.layout;
  }
}); // create a SpatialTransitioner instance on first access of the `transitioner` property 

Object.defineProperty(Object3D.prototype, 'transitioner', {
  get: function getTransitioner() {
    if (this === Object3D.prototype) { return undefined; }
    Object.defineProperty(this, 'transitioner', {
      value: new Transitioner(this),
      writable: true,
      enumerable: true
    });
    return this.transitioner;
  }
});

var LayoutHelper = /*@__PURE__*/(function (superclass) {
  function LayoutHelper() {
    superclass.call(this);
    this._transitional = new Object3D();
    this._transitionalBoxHelper = new Box3Helper(this._transitional.layout.inner);
    this._target = new Object3D();
    this._targetBoxHelper = new Box3Helper(this._target.layout.inner);
    this.add(this._transitional);
    this._transitional.layout.innerAutoUpdate = false;
    this._transitional.layout.forceBoundsExclusion = true;

    this._transitional.add(this._transitionalBoxHelper);

    this._transitionalBoxHelper.layout.forceBoundsExclusion = true;
    this.add(this._target);
    this._target.layout.innerAutoUpdate = false;
    this._target.layout.forceBoundsExclusion = true;

    this._target.add(this._targetBoxHelper);

    this._targetBoxHelper.layout.forceBoundsExclusion = true;

    this._targetBoxHelper.material.color.setStyle('magenta');
  }

  if ( superclass ) LayoutHelper.__proto__ = superclass;
  LayoutHelper.prototype = Object.create( superclass && superclass.prototype );
  LayoutHelper.prototype.constructor = LayoutHelper;

  LayoutHelper.prototype.updateWorldMatrix = function updateWorldMatrix (parents, children, layout) {
    superclass.prototype.updateWorldMatrix.call(this, parents, children, layout);

    if (this.parent) {
      this._target.layout.inner.copy(this.parent.layout.computedInnerBounds);

      this._target.matrixWorld.copy(this.parent.transitioner.matrixWorldTarget);

      this._targetBoxHelper.updateMatrixWorld();

      this._transitional.layout.inner.copy(this.parent.layout.computedInnerBounds);

      this._transitional.updateMatrixWorld();
    }
  };

  return LayoutHelper;
}(Object3D));

var Behavior = function Behavior () {};

/**
 * When many objects in a scene-graph have behaviors that adapt to the
 * behavior of other objects, it is crucial that these chains of adaptive
 * behavior update in a way that minimizes unecessary scene-graph calculations
 * while also not adapting in the wrong order (which would cause some behaviors
 * to be permanently lagging behind one or more frames as they adapt to stale state).
 *
 * This class supports efficient execution of adaptive behaviors
 * in an optimal order such that all behaviors are adapting to fresh state
 * with minimal traversal of the scene-graph.
 */

var AdaptivityManager = function AdaptivityManager () {};

AdaptivityManager.addBehavior = function addBehavior (object, behavior) {
  var behaviors = object[AdaptivityManager._getBehaviors] = object[AdaptivityManager._getBehaviors] || [];
  var b;
  if (typeof behavior === 'function') { b = {
    object: object,
    update: behavior
  }; }else { b = behavior; }
  b.object = object;
  b.init && b.init();
  behaviors.push(b);
};

AdaptivityManager.getBehaviors = function getBehaviors (object) {
  return object[AdaptivityManager._getBehaviors];
};

AdaptivityManager.update = function update (scene, camera, deltaTime) {
  AdaptivityManager.currentScene = scene;
  AdaptivityManager.currentCamera = camera;
  AdaptivityManager.currentDeltaTime = deltaTime;
  scene.updateWorldMatrix(true, true);
  AdaptivityManager.ensureUpdate(camera);
  scene.traverse(AdaptivityManager.ensureUpdate);
  AdaptivityManager.currentScene = undefined;
  AdaptivityManager.currentCamera = undefined;
  AdaptivityManager.currentDeltaTime = undefined;
  Promise.resolve(scene).then(AdaptivityManager.clearUpdateFlag);
};

AdaptivityManager.clearUpdateFlag = function clearUpdateFlag (scene) {
  scene.traverse(function (obj) { return obj[AdaptivityManager._didUpdate] = false; });
};

AdaptivityManager.ensureUpdate = function ensureUpdate (obj) {
  if (!AdaptivityManager.currentScene) { throw new Error('AdaptivityManager.ensureUpdate: must be called inside a Behavior callback'); }
  if (obj[AdaptivityManager._didUpdate]) { return; }
  obj[AdaptivityManager._didUpdate] = true;
  obj.parent && AdaptivityManager.ensureUpdate(obj.parent);
  var behaviors = AdaptivityManager.getBehaviors(obj);
  Transitioner.disableAllTransitions = true;
  if (behaviors) { for (var i = 0, list = behaviors; i < list.length; i += 1) {
    var b = list[i];

        if (b.update) {
      b.update(AdaptivityManager.currentDeltaTime);
      obj.updateWorldMatrix(false, true);
    }
  } }
  Transitioner.disableAllTransitions = false;
  obj.transitioner.update(AdaptivityManager.currentDeltaTime, false);
  if (behaviors) { for (var i$1 = 0, list$1 = behaviors; i$1 < list$1.length; i$1 += 1) {
    var b$1 = list$1[i$1];

        if (b$1.postUpdate) {
      b$1.postUpdate(AdaptivityManager.currentDeltaTime);
      obj.updateWorldMatrix(false, true);
    }
  } }
};
AdaptivityManager._getBehaviors = Symbol('getBehaviors');
AdaptivityManager._didUpdate = Symbol('didUpdate');

// TODO: clip change threshold to minimize small corrections

var AdaptiveClippingBehavior = /*@__PURE__*/(function (Behavior$$1) {
  function AdaptiveClippingBehavior() {
    Behavior$$1.apply(this, arguments);
    this._boxA = new Box3$1();
    this._boxB = new Box3$1();
    this._visualFrustum = new VisualFrustum(this.object);
    this._frustum = new Frustum();
    this._line = new Line3();
    this._corners = [new Vector3(), new Vector3(), new Vector3(), new Vector3(), new Vector3(), new Vector3(), new Vector3(), new Vector3()];
    this._newCorners = [new Vector3(), new Vector3(), new Vector3(), new Vector3(), new Vector3(), new Vector3(), new Vector3(), new Vector3()];
    this._intersectionCornerMap = new WeakMap();
    this.occluders = [];
    this.occluderInfluenceDelay = 0.5;
    this.occlusionTime = new WeakMap();
  }

  if ( Behavior$$1 ) AdaptiveClippingBehavior.__proto__ = Behavior$$1;
  AdaptiveClippingBehavior.prototype = Object.create( Behavior$$1 && Behavior$$1.prototype );
  AdaptiveClippingBehavior.prototype.constructor = AdaptiveClippingBehavior;

  AdaptiveClippingBehavior.prototype.update = function update (deltaTime) {
    var object = this.object;
    var clip = object.layout.clip.makeEmpty();
    var camera = AdaptivityManager.currentCamera;
    var cameraMetrics = SpatialMetrics.get(camera);
    object.updateWorldMatrix(true, true);
    var objectMetrics = SpatialMetrics.get(object);
    var objectDistance = cameraMetrics.getDistanceOf(object);

    var objectBounds = this._boxA.copy(object.layout.computedInnerBounds);

    var cameraToObjectMatrix = matrices.get().getInverse(object.matrixWorld).multiply(camera.matrixWorld);
    /***
     *
     *  First: clip based on viewing frustum
     *
     */

    var corners = this._corners;
    corners[0].set(objectBounds.min.x, objectBounds.min.y, objectBounds.min.z);
    corners[1].set(objectBounds.min.x, objectBounds.min.y, objectBounds.max.z);
    corners[2].set(objectBounds.min.x, objectBounds.max.y, objectBounds.min.z);
    corners[3].set(objectBounds.min.x, objectBounds.max.y, objectBounds.max.z);
    corners[4].set(objectBounds.max.x, objectBounds.min.y, objectBounds.min.z);
    corners[5].set(objectBounds.max.x, objectBounds.min.y, objectBounds.max.z);
    corners[6].set(objectBounds.max.x, objectBounds.max.y, objectBounds.min.z);
    corners[7].set(objectBounds.max.x, objectBounds.max.y, objectBounds.max.z);
    var newCorners = this._newCorners;

    for (var i$4 = 0, list = newCorners.entries(); i$4 < list.length; i$4 += 1) {
      var ref = list[i$4];
      var i = ref[0];
      var corner = ref[1];

      corner.copy(corners[i]);

      this._intersectionCornerMap.set(corner, i);
    } // 0:right, 1:left, 2:bottom, 3:top, 4:far, 5:near


    var frustum = this._frustum.setFromMatrix(camera.projectionMatrix);

    for (var i$5 = 0, list$1 = frustum.planes; i$5 < list$1.length; i$5 += 1) {
      var p = list$1[i$5];

      p.applyMatrix4(cameraToObjectMatrix);
    }

    var line = this._line;
    var intersectionScratch1 = vectors.get();

    for (var i$7 = 0, list$3 = frustum.planes; i$7 < list$3.length; i$7 += 1) {
      var p$1 = list$3[i$7];

      for (var i$6 = 0, list$2 = corners.entries(); i$6 < list$2.length; i$6 += 1) {
        var ref$1 = list$2[i$6];
        var i = ref$1[0];
        var corner = ref$1[1];

        if (!frustum.containsPoint(corner$1)) {
          line.end.copy(corner$1);
          line.start.copy(corners[7 - i$1]);
          var intersection = p$1.intersectLine(line, intersectionScratch1);
          if (intersection) { newCorners[i$1].copy(intersection); }
        }
      }
    } // const alignPosition = objectBounds.relativeToAbsolute(object.layout.fitAlign, vectors.get())
    // newCorners.sort((a,b) => {
    //     // const cornerA = this._intersectionCornerMap.get(a)!
    //     // const cornerB = this._intersectionCornerMap.get(b)!
    //     // return corners[cornerB].distanceToSquared(b) - corners[cornerA].distanceToSquared(a)
    //     return alignPosition.distanceToSquared(b) - alignPosition.distanceToSquared(a)
    // })


    clip.min.copy(corners[0]);
    clip.max.copy(corners[7]);
    var finalIntersections = [];

    for (var i$8 = 0, list$4 = newCorners; i$8 < list$4.length; i$8 += 1) {
      var i$2 = list$4[i$8];

      var corner$2 = this._intersectionCornerMap.get(i$2); // make sure intersection is not adjacent to any others


      if (finalIntersections.indexOf(corner$2) > -1) { continue; }
      if (i$2.equals(corners[corner$2])) { continue; }

      switch (corner$2) {
        case 0:
          clip.min.x = Math.max(i$2.x, clip.min.x);
          clip.min.y = Math.max(i$2.y, clip.min.y);
          clip.min.z = Math.max(i$2.z, clip.min.z);
          break;

        case 1:
          clip.min.x = Math.max(i$2.x, clip.min.x);
          clip.min.y = Math.max(i$2.y, clip.min.y);
          clip.max.z = Math.min(i$2.z, clip.max.z);
          break;

        case 2:
          clip.min.x = Math.max(i$2.x, clip.min.x);
          clip.max.y = Math.min(i$2.y, clip.max.y);
          clip.min.z = Math.max(i$2.z, clip.min.z);
          break;

        case 3:
          clip.min.x = Math.max(i$2.x, clip.min.x);
          clip.max.y = Math.min(i$2.y, clip.max.y);
          clip.max.z = Math.min(i$2.z, clip.max.z);
          break;

        case 4:
          clip.max.x = Math.min(i$2.x, clip.max.x);
          clip.min.y = Math.max(i$2.y, clip.min.y);
          clip.min.z = Math.max(i$2.z, clip.min.z);
          break;

        case 5:
          clip.max.x = Math.min(i$2.x, clip.max.x);
          clip.min.y = Math.max(i$2.y, clip.min.y);
          clip.max.z = Math.min(i$2.z, clip.max.z);
          break;

        case 6:
          clip.max.x = Math.min(i$2.x, clip.max.x);
          clip.max.y = Math.min(i$2.y, clip.max.y);
          clip.min.z = Math.max(i$2.z, clip.min.z);
          break;

        case 7:
          clip.max.x = Math.min(i$2.x, clip.max.x);
          clip.max.y = Math.min(i$2.y, clip.max.y);
          clip.max.z = Math.min(i$2.z, clip.max.z);
          break;
      }

      finalIntersections.push(corner$2);
    }

    var newClipSize = objectBounds.getSize(vectors.get());
    var clipCenter = clip.getCenter(vectors.get());
    var clipSize = clip.getSize(vectors.get());
    var epsilon = 1e-6;
    newClipSize.x = clipSize.x <= epsilon && clipSize.y >= epsilon ? newClipSize.x : clipSize.x;
    newClipSize.y = clipSize.y <= epsilon && clipSize.x >= epsilon ? newClipSize.y : clipSize.y;
    newClipSize.z = clipSize.z <= epsilon ? newClipSize.z : clipSize.z;

    if (clipSize.x <= epsilon && clipSize.y <= epsilon && clipSize.z <= epsilon) {
      objectBounds.getCenter(clipCenter);
      objectBounds.getSize(newClipSize);
    }

    clip.setFromCenterAndSize(clipCenter, newClipSize);
    /***
     *
     *  Second: clip based on occluders
     *
     */

    objectBounds.min.z = -Infinity;
    objectBounds.max.z = Infinity;
    var objectBoundsSize = objectBounds.getSize(vectors.get()); // for each occluder, need to crop the layout by at most 
    // a single cut that minimizes the lost space 

    for (var i$3 = 0; i$3 < this.occluders.length; i$3++) {
      var occluder = this.occluders[i$3]; // todo: add priority rule to allow adaptation to background (rather than foreground) objects

      var occluderDistance = cameraMetrics.getDistanceOf(occluder);

      if (occluderDistance > objectDistance) {
        this.occlusionTime.set(occluder, 0);
        continue;
      } // make sure potential occluder behaviors have already executed


      AdaptivityManager.ensureUpdate(occluder);
      var occluderBounds = objectMetrics.getBoundsOf(occluder, this._boxB);
      occluderBounds.min.z = -Infinity;
      occluderBounds.max.z = Infinity;

      if (!objectBounds.intersectsBox(occluderBounds)) {
        this.occlusionTime.set(occluder, 0);
        continue;
      }

      var occlusionTime = (this.occlusionTime.get(occluder) || 0) + deltaTime;
      this.occlusionTime.set(occluder, occlusionTime);

      if (occlusionTime < this.occluderInfluenceDelay) {
        continue;
      }

      var leftClipSpan = occluderBounds.max.x - objectBounds.min.x;
      var rightClipSpan = objectBounds.max.x - occluderBounds.min.x;
      var bottomClipSpan = occluderBounds.max.y - objectBounds.min.y;
      var topClipSpan = objectBounds.max.y - occluderBounds.min.y;
      var leftArea = leftClipSpan * objectBoundsSize.y;
      var rightArea = rightClipSpan * objectBoundsSize.y;
      var bottomArea = bottomClipSpan * objectBoundsSize.x;
      var topArea = topClipSpan * objectBoundsSize.x;

      if (leftArea < rightArea && leftArea < bottomArea && leftArea < topArea) {
        clip.min.x = isFinite(clip.min.x) ? Math.max(occluderBounds.max.x, clip.min.x) : occluderBounds.max.x;
      } else if (rightArea < leftArea && rightArea < bottomArea && rightArea < topArea) {
        clip.max.x = isFinite(clip.max.x) ? Math.min(occluderBounds.min.x, clip.max.x) : occluderBounds.min.x;
      } else if (topArea < rightArea && topArea < bottomArea && topArea < leftArea) {
        clip.max.y = isFinite(clip.max.y) ? Math.min(occluderBounds.min.y, clip.max.y) : occluderBounds.min.y;
      } else {
        clip.min.y = isFinite(clip.min.y) ? Math.max(occluderBounds.max.y, clip.min.y) : occluderBounds.max.y;
      }
    }
  };

  AdaptiveClippingBehavior.prototype.postUpdate = function postUpdate () {// this.object.layout.clip.copy(this.clipTarget.current)
    // this.object.updateWorldMatrix(true, true)
  };

  return AdaptiveClippingBehavior;
}(Behavior));

export { SimplifiedHull, Box3$1 as Box3, VisualFrustum, SpatialMetrics, LayoutFit, Layout, easing, TransitionTarget, Transitionable, LocalMatrixTransitionable, Transitioner, LayoutHelper, Behavior, AdaptivityManager, AdaptiveClippingBehavior, V_00, V_11, V_000, V_100, V_010, V_001, V_111, Q_IDENTITY, Pool, vectors2, vectors, vectors4, quaternions, matrices3, matrices, traverse };
//# sourceMappingURL=ethereal.mjs.map
