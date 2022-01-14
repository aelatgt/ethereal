/**
 * @author Mugen87 / https://github.com/Mugen87
 * 
 * adapted for Typescript by Gheric Speiginer
 */

import * as THREE from 'three'
import {mergeVertices} from 'three/examples/jsm/utils/BufferGeometryUtils';
//@ts-ignore
import {QuickHull} from './QuickHull.js'

export class ConvexGeometry extends THREE.BufferGeometry { 

    constructor(public points:THREE.Vector3[]) {
        super()

        // buffers

        var vertices = [];
        var normals = [];

        // execute QuickHull

        if ( QuickHull === undefined ) {

            console.error( 'THREE.ConvexBufferGeometry: ConvexBufferGeometry relies on THREE.QuickHull' );

        }

        var quickHull = new (QuickHull as any)().setFromPoints( points );

        // generate vertices and normals

        var faces = quickHull.faces;

        for ( var i = 0; i < faces.length; i ++ ) {

            var face = faces[ i ];
            var edge = face.edge;

            // we move along a doubly-connected edge list to access all face points (see HalfEdge docs)

            do {

                var point = edge.head().point;

                vertices.push( point.x, point.y, point.z );
                normals.push( face.normal.x, face.normal.y, face.normal.z );

                edge = edge.next;

            } while ( edge !== face.edge );

        }

        // build geometry

        this.setAttribute( 'position', new THREE.Float32BufferAttribute( vertices, 3 ) );
        this.setAttribute( 'normal', new THREE.Float32BufferAttribute( normals, 3 ) );

        mergeVertices(this)
    }
}